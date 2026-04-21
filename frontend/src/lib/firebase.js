// ─── FIREBASE CLIENT CONFIG ──────────────────────────────────────────────────
// Replace with your own config from Firebase Console > Project Settings > Web app.
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            "AIzaSyD2hmPkRLiAJe8NOQYSTEtgpvs7BR_8S2U",
  authDomain:        "pickup-web-pine.firebaseapp.com",
  projectId:         "pickup-web-pine",
  storageBucket:     "pickup-web-pine.firebasestorage.app",
  messagingSenderId: "124270198184",
  appId:             "1:124270198184:web:d4984dab6c5dcaafebf19d"
};

const app = initializeApp(firebaseConfig);
export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
