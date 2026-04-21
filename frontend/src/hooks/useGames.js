import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db,'games'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap => {
      setGames(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const postGame    = (data) => addDoc(collection(db,'games'), { ...data, createdAt: serverTimestamp() });
  const confirmSpot = (id, cur) => updateDoc(doc(db,'games',id), { playersIn: cur + 1 });

  return { games, loading, postGame, confirmSpot };
}
