import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

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
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('ensureUserDoc failed:', e?.message || e);
  }
}

// Detect if we're in a context where popups are blocked (e.g. some mobile browsers)
function isPopupBlocked() {
  const ua = navigator.userAgent || '';
  return /Instagram|FBAN|FBAV|Twitter|Line\//.test(ua);
}

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Handle redirect result on page load (for mobile redirect flow)
    getRedirectResult(auth)
      .then(result => { if (result?.user) ensureUserDoc(result.user); })
      .catch(e => console.warn('getRedirectResult:', e?.message));

    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      setLoading(false);
      if (u) ensureUserDoc(u);
    });
    return unsub;
  }, []);

  const signIn = async () => {
    setAuthError(null);
    try {
      // Use redirect on mobile/in-app browsers where popups are blocked
      if (isPopupBlocked()) {
        return await signInWithRedirect(auth, googleProvider);
      }
      return await signInWithPopup(auth, googleProvider);
    } catch (e) {
      // If popup was blocked by browser, fall back to redirect
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
        try { return await signInWithRedirect(auth, googleProvider); }
        catch (e2) { setAuthError(e2.message); throw e2; }
      }
      setAuthError(e.message);
      throw e;
    }
  };

  const signInEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)
      .catch(e => { setAuthError(e.message); throw e; });

  const signUpEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
      .catch(e => { setAuthError(e.message); throw e; });
    if (displayName) await updateProfile(cred.user, { displayName });
    return cred;
  };

  const logOut = () => signOut(auth);
  const clearError = () => setAuthError(null);

  return { user, loading, authError, clearError, signIn, signInEmail, signUpEmail, logOut };
}
