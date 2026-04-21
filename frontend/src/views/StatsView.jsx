import s from './shared.module.css';
export default function StatsView({ stats, gamesCount }) {
  const rows=[{l:'Games in your area',sub:'Based on current filters',v:gamesCount},{l:'Passed',sub:'Left swipes',v:stats.passed},{l:'Interested',sub:'Right swipes',v:stats.interested},{l:'Confirmed',sub:'Up swipes / confirm',v:stats.confirmed}];
  return (
    <section className={s.view}>
      <div className={s.topbar}><div className={s.brand}><div className={s.logo}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg></div><div><strong>Session stats</strong><span>Your activity so far.</span></div></div></div>
      <div className={s.card}>{rows.map(r=><div key={r.l} className={s.kpiRow}><div><span>{r.sub}</span><strong>{r.l}</strong></div><b>{r.v}</b></div>)}</div>
      <div className={s.card}><div className={s.cardHead}><strong>How to use it</strong></div><div className={s.stack}><div className={s.listItem}><strong>Swipe or tap.</strong><p>Use the action buttons under the card, or drag left, right, and up directly on the card.</p></div><div className={s.listItem}><strong>Arrow keys work too.</strong><p>Left to pass, right to save interest, up to confirm a spot.</p></div></div></div>
    </section>
  );
}
