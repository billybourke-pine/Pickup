import { useMemo, useState } from 'react';
import s from './shared.module.css';

// Aggregates /games client-side into host leaderboards.
// No new Firestore reads — piggybacks on existing live subscription.
function buildRankings(games) {
  const hosts = {};
  for (const g of games) {
    const key = g.hostUid || g.hostName || 'anon';
    if (!hosts[key]) {
      hosts[key] = {
        key,
        name: g.hostName || 'Anon host',
        initials: g.initials || (g.hostName || 'A').slice(0, 2).toUpperCase(),
        hosted: 0,
        totalPlayers: 0,
        trustSum: 0,
        trustCount: 0,
        pinned: 0,
        sports: new Set(),
      };
    }
    const h = hosts[key];
    h.hosted += 1;
    h.totalPlayers += (g.playersIn || 0);
    if (typeof g.trust === 'number') { h.trustSum += g.trust; h.trustCount += 1; }
    if (g.pinned) h.pinned += 1;
    if (g.sport) h.sports.add(g.sport);
  }
  return Object.values(hosts).map(h => ({
    ...h,
    avgTrust: h.trustCount ? Math.round(h.trustSum / h.trustCount) : 0,
    sports: Array.from(h.sports),
  }));
}

const TABS = [
  { id: 'hosted',  label: 'Most hosted',  sort: (a, b) => b.hosted - a.hosted },
  { id: 'trust',   label: 'Most trusted', sort: (a, b) => b.avgTrust - a.avgTrust },
  { id: 'players', label: 'Most joined',  sort: (a, b) => b.totalPlayers - a.totalPlayers },
];

const MEDALS = ['🥇','🥈','🥉'];

export default function HallView({ games, stats, gamesCount, siteConfig }) {
  const [tab, setTab] = useState('hosted');
  const rankings = useMemo(() => buildRankings(games || []), [games]);
  const sorted   = useMemo(() => [...rankings].sort(TABS.find(t => t.id === tab).sort).slice(0, 10), [rankings, tab]);

  const title    = siteConfig?.hallTitle    || 'Hall of fame';
  const subtitle = siteConfig?.hallSubtitle || 'The most reliable hosts in the city.';

  return (
    <section className={s.view}>
      <div className={s.topbar}>
        <div className={s.brand}>
          <div className={s.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M5 4H3v3a3 3 0 0 0 3 3M19 4h2v3a3 3 0 0 1-3 3"/>
            </svg>
          </div>
          <div><strong>{title}</strong><span>{subtitle}</span></div>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.tabRow}>
          {TABS.map(t => (
            <button key={t.id} className={`${s.tabBtn}${tab===t.id?' '+s.tabActive:''}`} onClick={()=>setTab(t.id)} data-testid={`hall-tab-${t.id}`}>{t.label}</button>
          ))}
        </div>

        <div className={s.stack} data-testid="hall-leaderboard">
          {sorted.length === 0 ? (
            <div className={s.empty}>No data yet — post a game to enter the ranks.</div>
          ) : sorted.map((h, i) => (
            <div key={h.key} className={s.rankRow}>
              <div className={s.rankBadge}>
                <span className={s.rankNumber}>{i < 3 ? MEDALS[i] : `#${i+1}`}</span>
              </div>
              <div className={s.rankAvatar}>{h.initials}</div>
              <div className={s.rankBody}>
                <strong>{h.name}</strong>
                <p>
                  {tab==='hosted'  && `${h.hosted} ${h.hosted===1?'game':'games'} hosted · ${h.sports.slice(0,3).join(', ') || '—'}`}
                  {tab==='trust'   && `${h.avgTrust}% show-up · ${h.hosted} hosted`}
                  {tab==='players' && `${h.totalPlayers} players through the door · ${h.hosted} hosted`}
                </p>
              </div>
              <div className={s.rankScore}>
                {tab==='hosted'  && h.hosted}
                {tab==='trust'   && `${h.avgTrust}%`}
                {tab==='players' && h.totalPlayers}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
