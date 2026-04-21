import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

// Ensures a users/{uid} doc exists on every sign-in. Uses merge so admin flags
// set by another admin stay intact. Never writes isAdmin or banned here.
async function ensureUserDoc(u) {
  if (!u) return;
  try {
    await setDoc(
      doc(db, 'users', u.uid),
      {
        uid: u.uid,
        email: u.email || null,
        displayName: u.displayName || (u.email ? u.email.split('@')[0] : 'Guest'),
        photoURL: u.photoURL || null,
        lastSeenAt: serverTimestamp(),
        // createdAt only set on first write; merge keeps existing
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    // If rules reject or network flaky, don't crash the app
    console.warn('ensureUserDoc failed:', e?.message || e);
  }
}

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      setLoading(false);
      if (u) ensureUserDoc(u);
    });
    return unsub;
  }, []);

  const signIn      = () => signInWithPopup(auth, googleProvider);
  const signInEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signUpEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    return cred;
  };
  const logOut = () => signOut(auth);

  return { user, loading, signIn, signInEmail, signUpEmail, logOut };
}
