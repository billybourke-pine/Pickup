import { useState, useEffect } from 'react';
import { useGames }  from './hooks/useGames';
import { useAuth }   from './hooks/useAuth';
import { useTheme }  from './hooks/useTheme';
import SwipeView   from './views/SwipeView';
import PrefsView   from './views/PrefsView';
import StatsView   from './views/StatsView';
import SavedView   from './views/SavedView';
import ProfileView from './views/ProfileView';
import s from './App.module.css';

const NAV = [
  { id:'swipe',   label:'Swipe',    svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 7 7 12l6 5"/><path d="M17 7l-6 5 6 5"/></svg> },
  { id:'prefs',   label:'Prefs',    svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 5V3"/><path d="M20 21v-5"/><path d="M20 9V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 12h6"/></svg> },
  { id:'stats',   label:'Stats',    svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> },
  { id:'saved',   label:'My games', svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
  { id:'profile', label:'Profile',  svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
];

export default function App() {
  const [view,    setView]    = useState('swipe');
  const [filters, setFilters] = useState({ sport:'All', level:'All', maxDistance:8, minPlayersIn:8 });
  const [interested,  setInterested]  = useState([]);
  const [confirmed,   setConfirmed]   = useState([]);
  const [passed,      setPassed]      = useState([]);
  const [postedGames, setPostedGames] = useState([]);
  const [toast,       setToast]       = useState('');

  const { games, loading, postGame, confirmSpot } = useGames();
  const auth = useAuth();
  const { user } = auth;
  const { toggle: toggleTheme }  = useTheme();

  const addUnique = (set, game) => set(p => p.some(g=>g.id===game.id) ? p : [...p, game]);
  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''), 2200); };

  const handlePass       = g => { addUnique(setPassed,      g); showToast(`Passed on ${g.sport} at ${g.where}`); };
  const handleInterested = g => { addUnique(setInterested,  g); showToast(`Interested in ${g.sport} at ${g.where}`); };
  const handleConfirm    = async g => {
    await confirmSpot(g.id, g.playersIn);
    addUnique(setConfirmed, g);
    showToast(`Spot confirmed for ${g.sport} at ${g.where}`);
  };
  const handlePostGame = async data => {
    await postGame(data);
    setPostedGames(p => [...p, { ...data, id: Date.now().toString() }]);
    showToast('Game posted! Live in the deck now.');
    setTimeout(()=>setView('swipe'), 1200);
  };

  const filteredCount = games.filter(g => {
    if(g.isOwn) return true;
    return (filters.sport==='All'||g.sport===filters.sport)
      &&(filters.level==='All'||g.level===filters.level)
      &&g.distance<=filters.maxDistance
      &&g.playersIn>=filters.minPlayersIn;
  }).length;

  useEffect(()=>{
    const h = e => {
      if(view!=='swipe') return;
      if(e.key==='ArrowLeft')  document.getElementById('passBtn')?.click();
      if(e.key==='ArrowRight') document.getElementById('likeBtn')?.click();
      if(e.key==='ArrowUp')    document.getElementById('confirmBtn')?.click();
    };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[view]);

  return (
    <div className={s.app}>
      <button className={s.themeBtn} onClick={toggleTheme} aria-label="Toggle theme" data-testid="theme-toggle-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>

      {loading ? (
        <div className={s.loading}><div className={s.spinner}/><p>Loading games…</p></div>
      ) : (
        <>
          {view==='swipe'   && <SwipeView   games={games} filters={filters} onPass={handlePass} onInterested={handleInterested} onConfirm={handleConfirm} stats={{interested:interested.length,confirmed:confirmed.length,passed:passed.length}}/>}
          {view==='prefs'   && <PrefsView   filters={filters} onChange={setFilters}/>}
          {view==='stats'   && <StatsView   stats={{passed:passed.length,interested:interested.length,confirmed:confirmed.length}} gamesCount={filteredCount}/>}
          {view==='saved'   && <SavedView   interested={interested} confirmed={confirmed} gamesCount={filteredCount}/>}
          {view==='profile' && <ProfileView auth={auth} onPostGame={handlePostGame} postedGames={postedGames} confirmed={confirmed}/>}
        </>
      )}

      <nav className={s.nav} data-testid="bottom-nav">
        {NAV.map(n=>(
          <button key={n.id} className={`${s.navBtn}${view===n.id?' '+s.active:''}`} onClick={()=>setView(n.id)} aria-label={n.label} data-testid={`nav-${n.id}-btn`}>
            {n.svg}<span>{n.label}</span>
          </button>
        ))}
      </nav>

      <div className={`${s.toast}${toast?' '+s.toastShow:''}`} data-testid="toast-message">{toast}</div>
    </div>
  );
}
