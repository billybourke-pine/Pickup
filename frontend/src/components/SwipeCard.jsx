import { useRef, useState } from 'react';
import s from './SwipeCard.module.css';

const spots  = g => Math.max(g.playersNeeded - g.playersIn, 0);
const roster = g => `${g.playersIn}/${g.playersNeeded} · ${spots(g)} ${spots(g)===1?'spot':'spots'} left`;

export default function SwipeCard({ game, depth, isTop, onPass, onInterested, onConfirm }) {
  const ref = useRef(null);
  const sx = useRef(0), sy = useRef(0);
  const [drag, setDrag] = useState(false);

  const begin = (x,y) => { sx.current=x; sy.current=y; setDrag(true); if(ref.current) ref.current.style.transition='none'; };
  const move  = (x,y) => {
    if(!drag||!ref.current) return;
    const dx=x-sx.current, dy=y-sy.current;
    ref.current.style.transform = dy<0&&Math.abs(dy)>Math.abs(dx)
      ? `translateY(${dy}px) scale(1.02)`
      : `translateX(${dx}px) rotate(${dx/18}deg)`;
  };
  const end = (x,y) => {
    if(!drag||!ref.current) return;
    setDrag(false);
    ref.current.style.transition='transform 260ms cubic-bezier(0.16,1,0.3,1),opacity 260ms ease';
    const dx=x-sx.current, dy=y-sy.current;
    if(dx>105)  return animate('interested');
    if(dx<-105) return animate('pass');
    if(dy<-105) return animate('confirm');
    ref.current.style.transform='';
  };
  const animate = action => {
    if(!ref.current) return;
    ref.current.style.transform = action==='pass'?'translateX(-145px) rotate(-14deg)':action==='interested'?'translateX(145px) rotate(14deg)':'translateY(-150px) scale(1.03)';
    ref.current.style.opacity='0';
    setTimeout(()=>{ action==='pass'?onPass():action==='interested'?onInterested():onConfirm(); },180);
  };

  const depthStyle = depth===2?{transform:'translateY(16px) scale(0.97)',opacity:0.86}:depth===3?{transform:'translateY(30px) scale(0.94)',opacity:0.7}:{};

  // Banner: image if provided, otherwise gradient fallback. Overlay ensures text legibility.
  const bannerStyle = game.imageUrl
    ? { backgroundImage:
        `linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.55) 100%), url("${game.imageUrl}")`,
        backgroundSize:'cover', backgroundPosition:'center' }
    : { background: game.gradient };

  return (
    <article ref={ref} className={s.card} style={depthStyle} data-testid={`swipe-card-${game.id}`}
      onPointerDown={e=>{ if(!isTop) return; const cb=ref.current?.querySelector('.'+s.body); if(cb?.contains(e.target)) return; ref.current?.setPointerCapture(e.pointerId); begin(e.clientX,e.clientY); }}
      onPointerMove={e=>{ if(isTop) move(e.clientX,e.clientY); }}
      onPointerUp={e=>{ if(isTop) end(e.clientX,e.clientY); }}
      onPointerCancel={e=>{ if(isTop) end(e.clientX,e.clientY); }}
    >
      <div className={s.banner} style={bannerStyle} data-testid="card-banner">
        <div className={s.bannerTop}>
          <span className={s.tag}>{game.sport} · {game.format}</span>
          <span className={s.tag}>{spots(game)} spots left</span>
        </div>
        <div><h2 className={s.title}>{game.where}</h2><p className={s.when}>{game.when}</p></div>
      </div>
      <div className={s.body}>
        <div className={s.statusRow}>
          <span className={s.statusChip}>{roster(game)}</span>
          <span className={s.levelChip}>{game.level}</span>
        </div>
        <div className={s.metaGrid}>
          <div className={s.metaBox}><label>Duration</label><strong>{game.duration}</strong></div>
          <div className={s.metaBox}><label>Distance</label><strong>{typeof game.distance==='number'?game.distance.toFixed(1):game.distance} km</strong></div>
          <div className={s.metaBox}><label>Bring</label><strong>{game.bring}</strong></div>
          <div className={s.metaBox}><label>Trust</label><strong>{game.trust}% show-up</strong></div>
        </div>
        <p className={s.note}>{game.note}</p>
        {game.organizerDescription && (
          <div className={s.orgNote}><label>Organizer note</label><p>{game.organizerDescription}</p></div>
        )}
        <div className={s.hostRow}>
          <div className={s.host}>
            <div className={s.avatar}>{game.initials}</div>
            <div><strong>{game.hostName||game.host}</strong><span>{game.hostMeta}</span></div>
          </div>
        </div>
      </div>
    </article>
  );
}
