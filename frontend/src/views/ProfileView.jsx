import { useState } from 'react';
import { DEFAULT_SITE_CONFIG } from '../hooks/useSiteConfig';
import s from './shared.module.css';

const GRADS=['linear-gradient(135deg,#0e7c66,#1d9f7d 68%,#6dcdb7)','linear-gradient(135deg,#7a4dd1,#a06cf0 60%,#d0b4ff)','linear-gradient(135deg,#cc6d11,#ef9333 65%,#f6c173)','linear-gradient(135deg,#1f6bde,#3f90ff 62%,#98c7ff)','linear-gradient(135deg,#8d2db6,#ba52d8 62%,#ebb2ff)','linear-gradient(135deg,#3d8b2d,#5aa540 60%,#a9de7d)'];

function AuthPanel({ auth }) {
  const { signIn, signInEmail, signUpEmail } = auth;
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [pw,    setPw]    = useState('');
  const [name,  setName]  = useState('');
  const [err,   setErr]   = useState('');
  const [busy,  setBusy]  = useState(false);

  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (mode === 'signup') await signUpEmail(email.trim(), pw, name.trim() || email.split('@')[0]);
      else                   await signInEmail(email.trim(), pw);
    } catch (e2) {
      const code = e2?.code || '';
      setErr(
        code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
          ? 'Wrong email or password.'
          : code === 'auth/email-already-in-use' ? 'That email is already in use. Try signing in.'
          : code === 'auth/weak-password'        ? 'Password must be at least 6 characters.'
          : code === 'auth/invalid-email'        ? 'That email looks off.'
          : (e2?.message || 'Something went wrong. Try again.')
      );
    } finally { setBusy(false); }
  };

  return (
    <div className={s.authPanel} data-testid="auth-panel">
      <div className={s.authHeader}>
        <strong>Sign in to post games</strong>
        <span>Games tie to your account. Takes 5 seconds.</span>
      </div>

      <button type="button" className={s.googleBtn} onClick={signIn} data-testid="google-signin-btn">
        <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.8 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.1C29.2 35.2 26.7 36 24 36c-5.2 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.5 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.7l6.2 5.1C41 34.3 44 29.6 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
        Continue with Google
      </button>

      <div className={s.authDivider}><span>or</span></div>

      <div className={s.authTabs}>
        <button type="button" className={`${s.authTab}${mode==='signin'?' '+s.authTabActive:''}`} onClick={()=>setMode('signin')} data-testid="auth-tab-signin">Sign in</button>
        <button type="button" className={`${s.authTab}${mode==='signup'?' '+s.authTabActive:''}`} onClick={()=>setMode('signup')} data-testid="auth-tab-signup">Create</button>
      </div>

      <form onSubmit={submit} className={s.formGrid}>
        {mode==='signup' && (
          <div className={s.formGroup}>
            <label className={s.formLabel}>Display name</label>
            <input className={s.formInput} value={name} onChange={e=>setName(e.target.value)} placeholder="How you'll appear to players" data-testid="auth-name-input"/>
          </div>
        )}
        <div className={s.formGroup}><label className={s.formLabel}>Email</label><input className={s.formInput} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" data-testid="auth-email-input"/></div>
        <div className={s.formGroup}><label className={s.formLabel}>Password</label><input className={s.formInput} type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="At least 6 characters" required autoComplete={mode==='signup'?'new-password':'current-password'} minLength={6} data-testid="auth-password-input"/></div>
        {err && <div className={s.authError} data-testid="auth-error">{err}</div>}
        <button type="submit" className={s.submitBtn} disabled={busy} data-testid="auth-submit-btn">
          {busy ? 'Please wait…' : (mode==='signup' ? 'Create account' : 'Sign in')}
        </button>
      </form>
    </div>
  );
}

export default function ProfileView({ auth, admin, onPostGame, postedGames, confirmed, siteConfig }) {
  const { user, logOut } = auth;
  const SPORTS = (siteConfig?.sports || DEFAULT_SITE_CONFIG.sports);
  const [tab, setTab] = useState('post');
  const [ok,  setOk]  = useState(false);
  const [favs,setFavs] = useState(new Set(['Soccer','Basketball']));
  const [f,   setF]   = useState({sport:'',format:'',location:'',date:'',time:'',duration:'',maxPlayers:'12',level:'',bring:'',note:''});
  const [busy,      setBusy]      = useState(false);
  const [submitErr, setSubmitErr] = useState('');

  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const toggleFav = sp => setFavs(p=>{ const n=new Set(p); n.has(sp)?n.delete(sp):n.add(sp); return n; });
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const initials    = displayName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  const submit = async e => {
    e.preventDefault();
    if (!user) { setSubmitErr('Please sign in before posting.'); return; }
    if(!f.sport||!f.location||!f.date||!f.time||!f.level) return;
    setBusy(true); setSubmitErr('');
    try {
      const d=new Date(`${f.date}T${f.time}`);
      const max=parseInt(f.maxPlayers)||12;
      await onPostGame({
        sport:f.sport, format:f.format||f.sport, level:f.level,
        when:`${d.toLocaleDateString('en-CA',{weekday:'long'})} · ${d.toLocaleTimeString('en-CA',{hour:'numeric',minute:'2-digit'})}`,
        where:f.location, distance:parseFloat((Math.random()*6+.5).toFixed(1)),
        duration:`${f.duration||60} mins`, playersIn:1, playersNeeded:max, trust:100,
        hostName:displayName, hostMeta:`${postedGames.length+1} games hosted`, initials,
        note:f.note||'Come ready to play and have fun.',
        organizerDescription:f.note||'Come ready to play and have fun.',
        bring:f.bring||'Yourself', vibe:`${max-1} spots left`,
        gradient:GRADS[postedGames.length%GRADS.length], hostUid:user.uid,
        imageUrl:'', imagePath:'',
      });
      setOk(true);
      setF({sport:'',format:'',location:'',date:'',time:'',duration:'',maxPlayers:'12',level:'',bring:'',note:''});
      setTimeout(()=>setOk(false),3000);
    } catch (e2) {
      setSubmitErr(e2?.message || 'Could not post game. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={s.view}>
      <div className={s.topbar}>
        <div className={s.brand}>
          <div className={s.logo}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
          <div><strong>Profile</strong><span>Your games · prefs</span></div>
        </div>
        {user && <button className={s.ghostBtn} onClick={logOut} data-testid="signout-btn">Sign out</button>}
      </div>

      <div className={s.profileHeader}>
        <div className={s.profileAvatar}>{initials}</div>
        <div className={s.profileName}>{displayName}</div>
        <div className={s.profileSub}>{user?user.email:'Sign in to post games & sync across devices'}</div>
        {admin?.isAdmin && <div className={s.adminChip}>⬢ Admin</div>}
        <div className={s.profileStats}>
          <div className={s.profileStat}><strong>{confirmed.length}</strong><span>Joined</span></div>
          <div className={s.profileStat}><strong>{postedGames.length}</strong><span>Posted</span></div>
          <div className={s.profileStat}><strong>98%</strong><span>Show-up</span></div>
        </div>
      </div>

      {!user && <div className={s.card}><AuthPanel auth={auth}/></div>}

      {user && (
      <div className={s.card}>
        <div className={s.tabRow}>
          {[['post','Post'],['mypost','Mine'],['settings','Prefs']].map(([id,label])=>(
            <button key={id} className={`${s.tabBtn}${tab===id?' '+s.tabActive:''}`} onClick={()=>setTab(id)} data-testid={`tab-${id}`}>{label}</button>
          ))}
        </div>

        {tab==='post'&&(
          <form onSubmit={submit} className={s.formGrid} data-testid="post-game-form">
            {ok&&<div className={s.successToast} data-testid="post-success">Game posted · live in deck</div>}
            {submitErr && <div className={s.authError} data-testid="submit-error">{submitErr}</div>}

            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Sport *</label><select className={s.formInput} value={f.sport} onChange={e=>set('sport',e.target.value)} required data-testid="post-sport-select"><option value="">Select…</option>{SPORTS.map(x=><option key={x}>{x}</option>)}</select></div>
              <div className={s.formGroup}><label className={s.formLabel}>Format</label><input className={s.formInput} value={f.format} onChange={e=>set('format',e.target.value)} placeholder="e.g. 5v5" data-testid="post-format-input"/></div>
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Location / venue *</label><input className={s.formInput} value={f.location} onChange={e=>set('location',e.target.value)} placeholder="e.g. Gibbons Park" required data-testid="post-location-input"/></div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Date *</label><input className={s.formInput} type="date" value={f.date} onChange={e=>set('date',e.target.value)} required data-testid="post-date-input"/></div>
              <div className={s.formGroup}><label className={s.formLabel}>Time *</label><input className={s.formInput} type="time" value={f.time} onChange={e=>set('time',e.target.value)} required data-testid="post-time-input"/></div>
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Duration (mins)</label><input className={s.formInput} type="number" min="20" max="240" value={f.duration} onChange={e=>set('duration',e.target.value)} placeholder="60" data-testid="post-duration-input"/></div>
              <div className={s.formGroup}><label className={s.formLabel}>Max players</label><input className={s.formInput} type="number" min="2" max="30" value={f.maxPlayers} onChange={e=>set('maxPlayers',e.target.value)} data-testid="post-maxplayers-input"/></div>
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Competition level *</label><select className={s.formInput} value={f.level} onChange={e=>set('level',e.target.value)} required data-testid="post-level-select"><option value="">Select…</option>{['Casual','Beginner-Friendly','Intermediate','Casual-Competitive','Competitive'].map(x=><option key={x}>{x}</option>)}</select></div>
            <div className={s.formGroup}><label className={s.formLabel}>What to bring</label><input className={s.formInput} value={f.bring} onChange={e=>set('bring',e.target.value)} placeholder="e.g. water, cleats, dark shirt" data-testid="post-bring-input"/></div>
            <div className={s.formGroup}><label className={s.formLabel}>Organizer note</label><textarea className={s.formTextarea} value={f.note} onChange={e=>set('note',e.target.value)} placeholder="Tell players what to expect — vibe, logistics, skill level…" data-testid="post-note-input"/></div>
            <button type="submit" className={s.submitBtn} disabled={busy} data-testid="post-submit-btn">
              {busy ? 'Posting…' : 'Post game'}
            </button>
          </form>
        )}

        {tab==='mypost'&&(
          <div className={s.stack}>
            {postedGames.length===0?<div className={s.empty}>No posted games yet.</div>
              :[...postedGames].reverse().map(g=>(
                <div key={g.id} className={s.listItem}>
                  <strong>{g.sport} · {g.where}</strong>
                  <p>{g.when} · {g.playersNeeded} max · {g.level}</p>
                  <span className={s.liveTag}>Live in deck</span>
                </div>
              ))}
          </div>
        )}

        {tab==='settings'&&(
          <div className={s.stack}>
            <div className={s.formGroup}><label className={s.formLabel}>Favourite sports</label><div className={s.chipRow}>{SPORTS.slice(0,8).map(sp=><button type="button" key={sp} className={`${s.chip}${favs.has(sp)?' '+s.active:''}`} onClick={()=>toggleFav(sp)}>{sp}</button>)}</div></div>
            <div className={s.formGroup}><label className={s.formLabel}>Notifications</label><select className={s.formInput}><option>Notify me when a game is almost full</option><option>Notify me for all new games nearby</option><option>Only notify me for confirmed spots</option></select></div>
          </div>
        )}
      </div>
      )}
    </section>
  );
}
