import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Live-subscribes to users/{uid}. Returns {isAdmin, banned, data, loading}.
export function useAdmin(uid) {
  const [state, setState] = useState({ isAdmin: false, banned: false, data: null, loading: !!uid });

  useEffect(() => {
    if (!uid) { setState({ isAdmin: false, banned: false, data: null, loading: false }); return; }
    const unsub = onSnapshot(doc(db, 'users', uid), snap => {
      const d = snap.exists() ? snap.data() : {};
      setState({
        isAdmin: d.isAdmin === true,
        banned:  d.banned  === true,
        data:    d,
        loading: false,
      });
    }, () => setState(s => ({ ...s, loading: false })));
    return unsub;
  }, [uid]);

  return state;
}
