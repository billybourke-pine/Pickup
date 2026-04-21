import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const DEFAULT_SITE_CONFIG = {
  appName: 'Pickup',
  tagline: 'Swipe into your next game.',
  heroTitle: 'Find a game fast.',
  heroKicker: 'Live near you',
  heroCaption: 'Left to pass · Right to save · Up to confirm a spot.',
  sports: ['Soccer','Basketball','Volleyball','Tennis','Hockey','Pickleball','Ultimate','Badminton','Baseball','Rugby','Other'],
  accent: '#c8a566',
  hallTitle: 'Hall of fame',
  hallSubtitle: 'The most reliable hosts in the city.',
};

export function useSiteConfig() {
  const [config, setConfig] = useState(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'site'), snap => {
      if (snap.exists()) setConfig({ ...DEFAULT_SITE_CONFIG, ...snap.data() });
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  // Apply accent to CSS variables whenever it changes.
  useEffect(() => {
    if (config.accent) {
      document.documentElement.style.setProperty('--color-accent', config.accent);
    }
  }, [config.accent]);

  const saveConfig = patch => setDoc(doc(db, 'config', 'site'), patch, { merge: true });

  return { config, loading, saveConfig };
}
