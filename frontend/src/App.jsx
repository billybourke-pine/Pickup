import { useState, useEffect } from 'react';
import { useGames }  from './hooks/useGames';
import { useAuth }   from './hooks/useAuth';
import { useAdmin }  from './hooks/useAdmin';
import { useTheme }  from './hooks/useTheme';
import { useSiteConfig } from './hooks/useSiteConfig';
import SwipeView   from './views/SwipeView';
import PrefsView   from './views/PrefsView';
import HallView    from './views/HallView';
import SavedView   from './views/SavedView';
import ProfileView from './views/ProfileView';
import AdminView   from './views/AdminView';
import s from './App.module.css';

const ICON = {
  prefs:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 5V3"/><path d="M20 21v-5"/><path d="M20 9V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 12h6"/></svg>,
  hall:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M5 4H3v3a3 3 0 0 0 3 3M19 4h2v3a3 3 0 0 1-3 3"/></svg>,
  swipe:   <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14c1.4-3.4 4.3-5 8-5s6.6 1.6 8 5"/><path d="M7 8.5C7 6.6 8.6 5 10.5 5S14 6.6 14 8.5 12.4 12 10.5 12 7 10.4 7 8.5Z"/><path d="M16.5 8.2h4"/><path d="M18.5 6.2v4"/></svg>,
  saved:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  profile: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
};

const NAV = [
  { id:'prefs',   label:'Prefs'   },
  { id:'hall',    label:'Hall'    },
  { id:'swipe',   label:'Swipe', center:true },
  { id:'saved',   label:'Games'   },
  { id:'profile', label:'Profile' },
];

export default function App() {
  const [view,    setView]    = useState('swipe');
  const [filters, setFilters] = useState({ sport:'All', level:'All', maxDistance:20, minPlayersIn:1 });
  const [interested,  setInterested]  = useState([]);
  const [confirmed,   setConfirmed]   = useState([]);
  const [passed,      setPassed]      = useState([]);
  const [postedGames, setPostedGames] = useState([]);
  const [toast,       setToast]       = useState('');

  const { games, loading, postGame, confirmSpot, pinGame, deleteGame } = useGames();
  const authApi = useAuth();
  const { user } = authApi;
  const admin = useAdmin(user?.uid);
  const { toggle: toggleTheme, theme }  = useTheme();
  const { config: siteConfig, saveConfig } = useSiteConfig();

  const addUnique = (set, game) => set(p => p.some(g=>g.id===game.id) ? p : [...p, game]);
  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''), 2200); };

  const handlePass       = g => { addUnique(setPassed,      g); showToast(`Passed · ${g.sport}`); };
  const handleInterested = g => { addUnique(setInterested,  g); showToast(`Interested · ${g.sport}`); };
  const handleConfirm    = async g => {
    await confirmSpot(g.id, g.playersIn);
    addUnique(setConfirmed, g);
    showToast(`Confirmed · ${g.sport}`);
  };
  const handlePostGame = async data => {
    await postGame(data);
    setPostedGames(p => [...p, { ...data, id: Date.now().toString() }]);
    showToast('Game posted');
    setTimeout(()=>setView('swipe'), 1200);
  };
  const handlePin = async g => {
    try { await pinGame(g.id, !g.pinned); showToast(g.pinned?'Unpinned':'Pinned to top'); }
    catch { showToast('Pin failed — check admin rules'); }
  };
  const handleDelete = async g => {
    try { await deleteGame(g.id, g.imagePath); showToast('Game deleted'); }
    catch { showToast('Delete failed — check admin rules'); }
  };

  const filteredCount = games.filter(g => {
    const isMine = user?.uid && g.hostUid === user.uid;
    if(isMine) return true;
    return (filters.sport==='All'||g.sport===filters.sport)
      &&(filters.level==='All'||g.level===filters.level)
      &&(typeof g.distance!=='number'||g.distance<=filters.maxDistance)
      &&(g.playersIn||0)>=filters.minPlayersIn;
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
      <div className={s.topActions}>
        {admin.isAdmin && (
          <button className={`${s.iconBtn} ${s.adminBadge}`} onClick={()=>setView('admin')} aria-label="Admin panel" data-testid="admin-open-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z"/></svg>
          </button>
        )}
        <button className={s.iconBtn} onClick={toggleTheme} aria-label="Toggle theme" data-testid="theme-toggle-btn">
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </div>

      {loading ? (
        <div className={s.loading}><div className={s.spinner}/><p>Loading games…</p></div>
      ) : (
        <>
          {view==='swipe'   && <SwipeView   games={games} filters={filters} onPass={handlePass} onInterested={handleInterested} onConfirm={handleConfirm} stats={{interested:interested.length,confirmed:confirmed.length,passed:passed.length}} isAdmin={admin.isAdmin} onPin={handlePin} onDelete={handleDelete} siteConfig={siteConfig} currentUid={user?.uid}/>}
          {view==='prefs'   && <PrefsView   filters={filters} onChange={setFilters} siteConfig={siteConfig}/>}
          {view==='hall'    && <HallView    games={games} stats={{passed:passed.length,interested:interested.length,confirmed:confirmed.length}} gamesCount={filteredCount} siteConfig={siteConfig}/>}
          {view==='saved'   && <SavedView   interested={interested} confirmed={confirmed} gamesCount={filteredCount}/>}
          {view==='profile' && <ProfileView auth={authApi} admin={admin} onPostGame={handlePostGame} postedGames={postedGames} confirmed={confirmed} siteConfig={siteConfig}/>}
          {view==='admin'   && admin.isAdmin && <AdminView games={games} siteConfig={siteConfig} saveConfig={saveConfig} onPin={handlePin} onDelete={handleDelete} onClose={()=>setView('swipe')}/>}
        </>
      )}

      <nav className={s.nav} data-testid="bottom-nav">
        {NAV.map(n=>(
          <button
            key={n.id}
            className={`${s.navBtn}${n.center?' '+s.navBtnCenter:''}${view===n.id?' '+s.active:''}`}
            onClick={()=>setView(n.id)}
            aria-label={n.label}
            data-testid={`nav-${n.id}-btn`}
          >
            {ICON[n.id]}<span>{n.label}</span>
          </button>
        ))}
      </nav>

      <div className={`${s.toast}${toast?' '+s.toastShow:''}`} data-testid="toast-message">{toast}</div>
    </div>
  );
}
