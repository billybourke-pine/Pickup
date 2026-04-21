import { useState, useEffect } from 'react';
import SwipeCard from '../components/SwipeCard';
import s from './SwipeView.module.css';

export default function SwipeView({ games, filters, onPass, onInterested, onConfirm, stats }) {
  const [index, setIndex] = useState(0);
  useEffect(()=>{ setIndex(0); },[filters]);

  const filtered = games.filter(g => {
    if(g.isOwn) return true;
    return (filters.sport==='All'||g.sport===filters.sport)
      &&(filters.level==='All'||g.level===filters.level)
      &&g.distance<=filters.maxDistance
      &&g.playersIn>=filters.minPlayersIn;
  });
  const deck = filtered.slice(index, index+3);
  const next = () => setIndex(i=>i+1);
  const top  = deck[0];

  return (
    <section className={s.view}>
      <div className={s.topbar}>
        <div className={s.brand}>
          <div className={s.logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 14c1.4-3.4 4.3-5 8-5s6.6 1.6 8 5"/><path d="M7 8.5C7 6.6 8.6 5 10.5 5S14 6.6 14 8.5 12.4 12 10.5 12 7 10.4 7 8.5Z"/><path d="M16.5 8.2h4"/><path d="M18.5 6.2v4"/>
            </svg>
          </div>
          <div><strong>Pickup</strong><span>Swipe into your next game.</span></div>
        </div>
      </div>

      <div className={s.hero}>
        <span className={s.eyebrow}>Live near you</span>
        <h1>Find a game fast.</h1>
        <p>Left to pass · Right to save · Up to confirm a spot.</p>
        <div className={s.metrics}>
          <div className={s.metric}><strong>{filtered.length}</strong><span>In your area</span></div>
          <div className={s.metric}><strong>{stats.interested}</strong><span>Interested</span></div>
          <div className={s.metric}><strong>{stats.confirmed}</strong><span>Confirmed</span></div>
        </div>
      </div>

      <div className={s.deckHeader}>
        <div><strong>Game deck</strong><span>{Math.max(filtered.length-index,0)} games left.</span></div>
        <span className={s.pill}>{Math.max(filtered.length-index,0)} nearby</span>
      </div>

      <div className={s.deckStage}>
        {deck.length===0
          ? <div className={s.empty}>No games match your filters. Try widening the distance or lowering the roster threshold in Prefs.</div>
          : deck.map((g,i) => (
              <SwipeCard key={g.id} game={g} depth={i+1} isTop={i===0}
                onPass={()=>{onPass(g);next();}}
                onInterested={()=>{onInterested(g);next();}}
                onConfirm={()=>{onConfirm(g);next();}}
              />
            )).reverse()
        }
      </div>

      <div className={s.actionRow}>
        <button id="passBtn" className={`${s.btn} ${s.pass}`} onClick={()=>top&&(onPass(top),next())} aria-label="Pass">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <button id="confirmBtn" className={`${s.btn} ${s.confirm}`} onClick={()=>top&&(onConfirm(top),next())} aria-label="Confirm spot">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          <span>Confirm</span>
        </button>
        <button id="likeBtn" className={`${s.btn} ${s.like}`} onClick={()=>top&&(onInterested(top),next())} aria-label="Interested">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 12 2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"/></svg>
        </button>
      </div>
    </section>
  );
}
