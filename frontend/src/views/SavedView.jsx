import s from './shared.module.css';
const roster = g => `${g.playersIn}/${g.playersNeeded} · ${Math.max(g.playersNeeded-g.playersIn,0)} spots left`;
export default function SavedView({ interested, confirmed, gamesCount }) {
  return (
    <section className={s.view}>
      <div className={s.topbar}><div className={s.brand}><div className={s.logo}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></div><div><strong>My games</strong><span>Saved and locked spots.</span></div></div></div>
      <div className={s.card}><div className={s.cardHead}><strong>Interested</strong><span>{gamesCount} games in your area</span></div>{interested.length===0?<div className={s.empty}>No right swipes yet.</div>:[...interested].reverse().map(g=><div key={g.id} className={s.listItem}><strong>{g.sport} · {g.where}</strong><p>{g.when} · {roster(g)} · {g.level}</p></div>)}</div>
      <div className={s.card}><div className={s.cardHead}><strong>Confirmed spots</strong></div>{confirmed.length===0?<div className={s.empty}>No confirmed spots yet. Swipe up to lock one in.</div>:[...confirmed].reverse().map(g=><div key={g.id} className={s.listItem}><strong>{g.sport} · {g.where}</strong><p>{g.when} · {roster(g)} · Spot confirmed ✓</p></div>)}</div>
    </section>
  );
}
