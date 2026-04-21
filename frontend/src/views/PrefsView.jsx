import s from './shared.module.css';
const SPORTS = ['All','Soccer','Basketball','Volleyball','Tennis','Hockey','Pickleball','Ultimate','Badminton'];
const LEVELS = ['All','Casual','Beginner-Friendly','Intermediate','Casual-Competitive','Competitive'];
export default function PrefsView({ filters, onChange }) {
  const set = k => v => onChange({...filters,[k]:v});
  return (
    <section className={s.view}>
      <div className={s.topbar}><div className={s.brand}><div className={s.logo}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 5V3"/><path d="M20 21v-5"/><path d="M20 9V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 12h6"/></svg></div><div><strong>Preferences</strong><span>Tune your swipe deck.</span></div></div></div>
      <div className={s.card}><div className={s.cardHead}><strong>Sport</strong><span>Tap to filter</span></div><div className={s.chipRow}>{SPORTS.map(x=><button key={x} className={`${s.chip}${filters.sport===x?' '+s.active:''}`} onClick={()=>set('sport')(x)}>{x}</button>)}</div></div>
      <div className={s.card}><div className={s.cardHead}><strong>Competition</strong><span>Match your vibe</span></div><div className={s.chipRow}>{LEVELS.map(x=><button key={x} className={`${s.chip}${filters.level===x?' '+s.active:''}`} onClick={()=>set('level')(x)}>{x}</button>)}</div></div>
      <div className={s.card}><div className={s.rangeTop}><span>Maximum distance</span><strong>{filters.maxDistance} km</strong></div><input type="range" min="2" max="20" step="1" value={filters.maxDistance} onChange={e=>set('maxDistance')(+e.target.value)} style={{width:'100%',accentColor:'var(--color-primary)'}}/></div>
      <div className={s.card}><div className={s.rangeTop}><span>Minimum players already in</span><strong>{filters.minPlayersIn} players</strong></div><input type="range" min="1" max="12" step="1" value={filters.minPlayersIn} onChange={e=>set('minPlayersIn')(+e.target.value)} style={{width:'100%',accentColor:'var(--color-primary)'}}/><p style={{fontSize:'var(--text-xs)',color:'var(--color-text-faint)',marginTop:'.5rem'}}>Useful for finding games that already feel real.</p></div>
    </section>
  );
}
