import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_SITE_CONFIG } from '../hooks/useSiteConfig';
import s from './shared.module.css';

export default function AdminView({ games, siteConfig, saveConfig, onPin, onDelete, onClose }) {
  const [tab, setTab] = useState('settings');
  const [cfg, setCfg] = useState(siteConfig);
  const [savedMsg, setSavedMsg] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => { setCfg(siteConfig); }, [siteConfig]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setUsersLoading(false);
    }, () => setUsersLoading(false));
    return unsub;
  }, []);

  const saveSettings = async () => {
    await saveConfig({
      appName: cfg.appName,
      tagline: cfg.tagline,
      heroTitle: cfg.heroTitle,
      heroKicker: cfg.heroKicker,
      heroCaption: cfg.heroCaption,
      hallTitle: cfg.hallTitle,
      hallSubtitle: cfg.hallSubtitle,
      sports: typeof cfg.sports === 'string' ? cfg.sports.split(',').map(x=>x.trim()).filter(Boolean) : cfg.sports,
      accent: cfg.accent,
    });
    setSavedMsg('Saved.'); setTimeout(()=>setSavedMsg(''), 2000);
  };
  const resetDefaults = async () => {
    setCfg(DEFAULT_SITE_CONFIG);
    await saveConfig(DEFAULT_SITE_CONFIG);
    setSavedMsg('Reset to defaults.'); setTimeout(()=>setSavedMsg(''), 2000);
  };

  const toggleUserField = (uid, field, current) =>
    updateDoc(doc(db, 'users', uid), { [field]: !current });

  return (
    <section className={s.view}>
      <div className={s.topbar}>
        <div>
          <span className={s.adminKicker}>Admin</span>
          <div className={s.adminTitle}>Control room</div>
        </div>
        <button className={s.ghostBtn} onClick={onClose} data-testid="admin-close-btn">Close</button>
      </div>

      <div className={s.card}>
        <div className={s.tabRow}>
          {[['settings','Site'],['games','Games'],['users','Users']].map(([id,label])=>(
            <button key={id} className={`${s.tabBtn}${tab===id?' '+s.tabActive:''}`} onClick={()=>setTab(id)} data-testid={`admin-tab-${id}`}>{label}</button>
          ))}
        </div>

        {tab==='settings' && (
          <div className={s.formGrid} data-testid="admin-settings-panel">
            {savedMsg && <div className={s.successToast}>{savedMsg}</div>}
            <div className={s.formGroup}><label className={s.formLabel}>App name</label><input className={s.formInput} value={cfg.appName||''} onChange={e=>setCfg({...cfg,appName:e.target.value})} data-testid="cfg-appName-input"/></div>
            <div className={s.formGroup}><label className={s.formLabel}>Tagline</label><input className={s.formInput} value={cfg.tagline||''} onChange={e=>setCfg({...cfg,tagline:e.target.value})} data-testid="cfg-tagline-input"/></div>
            <div className={s.formGroup}><label className={s.formLabel}>Hero kicker</label><input className={s.formInput} value={cfg.heroKicker||''} onChange={e=>setCfg({...cfg,heroKicker:e.target.value})} data-testid="cfg-heroKicker-input"/></div>
            <div className={s.formGroup}><label className={s.formLabel}>Hero title</label><input className={s.formInput} value={cfg.heroTitle||''} onChange={e=>setCfg({...cfg,heroTitle:e.target.value})} data-testid="cfg-heroTitle-input"/></div>
            <div className={s.formGroup}><label className={s.formLabel}>Hero caption</label><input className={s.formInput} value={cfg.heroCaption||''} onChange={e=>setCfg({...cfg,heroCaption:e.target.value})} data-testid="cfg-heroCaption-input"/></div>
            <div className={s.formGroup}><label className={s.formLabel}>Sports list (comma-separated)</label><input className={s.formInput} value={Array.isArray(cfg.sports)?cfg.sports.join(', '):cfg.sports||''} onChange={e=>setCfg({...cfg,sports:e.target.value})} data-testid="cfg-sports-input"/></div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Hall title</label><input className={s.formInput} value={cfg.hallTitle||''} onChange={e=>setCfg({...cfg,hallTitle:e.target.value})} data-testid="cfg-hallTitle-input"/></div>
              <div className={s.formGroup}><label className={s.formLabel}>Hall subtitle</label><input className={s.formInput} value={cfg.hallSubtitle||''} onChange={e=>setCfg({...cfg,hallSubtitle:e.target.value})} data-testid="cfg-hallSubtitle-input"/></div>
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Accent colour</label>
              <div className={s.colorPicker}>
                <input type="color" className={s.colorSwatch} value={cfg.accent||'#d4ff00'} onChange={e=>setCfg({...cfg,accent:e.target.value})} data-testid="cfg-accent-input"/>
                <input className={s.formInput} value={cfg.accent||''} onChange={e=>setCfg({...cfg,accent:e.target.value})} placeholder="#d4ff00"/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.6rem'}}>
              <button type="button" className={s.ghostBtn} onClick={resetDefaults} data-testid="admin-reset-btn">Reset defaults</button>
              <button type="button" className={s.submitBtn} onClick={saveSettings} data-testid="admin-save-settings-btn">Save changes</button>
            </div>
          </div>
        )}

        {tab==='games' && (
          <div className={s.stack} data-testid="admin-games-panel">
            {games.length===0 ? <div className={s.empty}>No games yet.</div> : games.map(g=>(
              <div key={g.id} className={s.adminRowItem}>
                <div className={s.adminRowItemBody}>
                  <strong>{g.sport} · {g.where}</strong>
                  <p>{g.when} · {g.hostName||'—'}{g.pinned?' · ★ Pinned':''}</p>
                </div>
                <div className={s.adminRowItemActions}>
                  <button className={`${s.smallBtn}${g.pinned?' '+s.smallBtnActive:''}`} onClick={()=>onPin?.(g)} data-testid={`admin-pin-${g.id}`}>{g.pinned?'Unpin':'Pin'}</button>
                  <button className={`${s.smallBtn} ${s.smallBtnDanger}`} onClick={()=>{ if(window.confirm(`Delete "${g.sport} · ${g.where}"?`)) onDelete?.(g); }} data-testid={`admin-delete-${g.id}`}>Del</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='users' && (
          <div className={s.stack} data-testid="admin-users-panel">
            {usersLoading ? <div className={s.empty}>Loading users…</div>
              : users.length===0 ? <div className={s.empty}>No users yet.</div>
              : users.map(u=>(
                <div key={u.id} className={s.adminRowItem}>
                  <div className={s.adminRowItemBody}>
                    <strong>{u.displayName || u.email || u.id.slice(0,8)}</strong>
                    <p>{u.email || u.id}{u.isAdmin?' · ADMIN':''}{u.banned?' · BANNED':''}</p>
                  </div>
                  <div className={s.adminRowItemActions}>
                    <button className={`${s.smallBtn}${u.isAdmin?' '+s.smallBtnActive:''}`} onClick={()=>toggleUserField(u.id,'isAdmin',u.isAdmin===true)} data-testid={`admin-toggle-admin-${u.id}`}>{u.isAdmin?'Revoke':'Promote'}</button>
                    <button className={`${s.smallBtn} ${s.smallBtnDanger}`} onClick={()=>toggleUserField(u.id,'banned',u.banned===true)} data-testid={`admin-toggle-ban-${u.id}`}>{u.banned?'Unban':'Ban'}</button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
