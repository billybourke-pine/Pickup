import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

// Sorts pinned games first, then by createdAt desc. Pinned games appear at the top of the deck.
function sortDeck(list) {
  return [...list].sort((a, b) => {
    const pa = a.pinned ? 1 : 0, pb = b.pinned ? 1 : 0;
    if (pa !== pb) return pb - pa;
    const ta = a.createdAt?.toMillis?.() || 0;
    const tb = b.createdAt?.toMillis?.() || 0;
    return tb - ta;
  });
}

export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db,'games'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap => {
      setGames(sortDeck(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const postGame    = (data) => addDoc(collection(db,'games'), { ...data, pinned: false, createdAt: serverTimestamp() });
  const confirmSpot = (id, cur) => updateDoc(doc(db,'games',id), { playersIn: cur + 1 });
  const updateGame  = (id, patch) => updateDoc(doc(db,'games',id), patch);
  const pinGame     = (id, pinned) => updateDoc(doc(db,'games',id), { pinned: !!pinned });
  const deleteGame  = async (id, imagePath) => {
    await deleteDoc(doc(db,'games',id));
    if (imagePath) {
      try { await deleteObject(ref(storage, imagePath)); } catch { /* image already gone — ignore */ }
    }
  };

  return { games, loading, postGame, confirmSpot, updateGame, pinGame, deleteGame };
}
