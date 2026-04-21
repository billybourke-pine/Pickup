# Pickup — Firebase + React (with Admin, Image Uploads, Email Auth, Hall of Fame)

A Tinder-style pickup sports app. React 18 + Firebase (Auth + Firestore + Storage). Frontend-only — deploys to Vercel.

## What's in this build
- **Sleek dark UI** with a subtle brass accent (no flashing yellow). Swipe is the raised centre button in the bottom nav.
- **Image uploads** on each posted game — client-compressed + stored in Firebase Storage.
- **Email & password auth** alongside existing Google sign-in.
- **Hall of Fame** leaderboard (Most hosted · Most trusted · Most joined) aggregated live from Firestore.
- **Admin / owner mode** — tune the whole site (app name, tagline, hero copy, sports list, accent colour, Hall of Fame copy) and moderate (pin/delete any game, promote/demote admins, ban users).

## File map
```
src/
  App.jsx                    Root. Nav reorder: prefs · hall · swipe (centre) · games · profile.
  App.module.css
  index.js / index.css       Dark-first theme, brass accent, JetBrains Mono for meta.
  hooks/
    useAuth.js               Google + email/password + auto-creates users/{uid} doc.
    useGames.js              Real-time listener + postGame, confirmSpot, pinGame, deleteGame.
    useAdmin.js              Live subscription to users/{uid}: returns {isAdmin, banned}.
    useSiteConfig.js         Live subscription to config/site; edits applied site-wide.
    useTheme.js              Dark is default; persists in localStorage.
  lib/
    firebase.js              Exports db, auth, googleProvider, storage.
    uploadImage.js           Canvas compress → Firebase Storage (games/{uid}/*.jpg).
    seed.js                  Optional one-time sample seeder (not auto-run).
  views/
    SwipeView.jsx            Main deck. Admin sees pin/delete controls on the top card.
    PrefsView.jsx            Filter the deck.
    HallView.jsx             Leaderboard + your session stats.
    SavedView.jsx            Interested + confirmed games.
    ProfileView.jsx          Auth panel, post a game (with cover image), my posted, prefs.
    AdminView.jsx            Tune site settings, moderate games, manage users (admin only).
  components/
    SwipeCard.jsx            Cover-image banner + admin pin/delete row.
```

---

## Firebase Console — one-time setup (~3 minutes)

### 1) Enable Email/Password sign-in
Firebase Console → **Authentication** → **Sign-in method** → **Email/Password** → Enable → Save.
(Google sign-in should already be enabled.)

### 2) Paste Firestore security rules
Firebase Console → **Firestore Database** → **Rules** → paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function isAdmin() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }

    match /games/{gameId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update: if isSignedIn() && (
        request.auth.uid == resource.data.hostUid
        || isAdmin()
        // anyone signed-in can increment playersIn (confirmSpot) but not mutate other fields
        || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['playersIn']))
      );
      allow delete: if isAdmin() || (isSignedIn() && request.auth.uid == resource.data.hostUid);
    }

    match /users/{uid} {
      allow read: if isSignedIn();
      // self-create: own doc, and NOT allowed to set isAdmin / banned
      allow create: if isOwner(uid)
        && !('isAdmin' in request.resource.data)
        && !('banned'  in request.resource.data);
      // self-update: cannot change isAdmin / banned themselves
      allow update: if (
        (isOwner(uid)
          && request.resource.data.isAdmin == resource.data.isAdmin
          && request.resource.data.banned  == resource.data.banned)
        || isAdmin()
      );
      allow delete: if isAdmin();
    }

    match /config/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### 3) Paste Storage security rules
Firebase Console → **Storage** → **Rules** → paste this:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null
        && firestore.exists(/databases/(default)/documents/users/$(request.auth.uid))
        && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    match /games/{uid}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
                   && (request.auth.uid == uid || isAdmin())
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null && (request.auth.uid == uid || isAdmin());
    }
  }
}
```

### 4) Make yourself admin (bootstrap)
The app auto-creates a `users/{uid}` doc the first time you sign in. To give yourself admin rights:

1. Sign in to the app once (any method). This creates `users/{YOUR_UID}`.
2. Firebase Console → Firestore → `users` → open your doc.
3. Add field: **`isAdmin`** (boolean) = **`true`**. Save.
4. Reload the app. The shield icon appears in the top-right. Tap it to open the Admin panel.

After that, **you can promote/demote anyone else from the Admin → Users tab** — no more console trips.

---

## Admin panel powers (in-app)
Tap the shield icon (top-right) when signed in as admin.

- **Site tab** — edit app name, tagline, hero kicker/title/caption, Hall of Fame title/subtitle, the sport list, and the accent colour. Changes are live for every visitor within seconds.
- **Games tab** — pin any game to the top of the deck (shows a "★ Featured" badge on the card), or delete it (also removes the cover image from Storage).
- **Users tab** — promote/revoke admin, ban/unban.

Admins also see inline **Pin** / **Delete** buttons directly on each swipe card.

---

## Run locally
```bash
cd pickup-app       # or your repo root
npm install
npm start           # http://localhost:3000
```

## Deploy to Vercel — step by step

### Option A — fastest (Vercel dashboard, no CLI)
1. Push your repo to GitHub (private or public is fine).
2. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → pick your repo.
3. Framework preset: **Create React App** (Vercel auto-detects).
4. Build & output settings: leave defaults
   - Build command: `npm run build`
   - Output directory: `build`
5. **Environment variables**: none required. Your Firebase web config is public by design (security lives in Firestore/Storage rules which you pasted above).
6. Click **Deploy**. In ~1 minute you'll have `https://<your-app>.vercel.app`.

### Option B — CLI
```bash
npm install -g vercel
vercel login           # one-time
cd pickup-app
vercel                 # first run — answer the prompts (project name, etc.)
vercel --prod          # promote to production
```

### After deploying — connect the domain to Firebase auth
Firebase Console → **Authentication** → **Settings** → **Authorized domains** → **Add domain** → paste your Vercel URL (e.g. `pickup-app.vercel.app`). Without this, Google sign-in will fail on the live site.

If you later attach a custom domain in Vercel, add that too.

### Redeploying on every push
Vercel auto-deploys every push to the connected branch (defaults: `main` → production, other branches → preview URLs). No other setup.

---

## Data model
```
games/{id}                  sport, format, where, when, level, bring, note, organizerDescription,
                            playersIn, playersNeeded, trust, distance, duration,
                            hostName, hostMeta, initials, hostUid,
                            imageUrl, imagePath,       // new
                            pinned,                    // new — admin featured
                            createdAt (serverTimestamp)

users/{uid}                 uid, email, displayName, photoURL,
                            createdAt, lastSeenAt,
                            isAdmin (bool, admin-only write),
                            banned  (bool, admin-only write)

config/site                 appName, tagline, heroKicker, heroTitle, heroCaption,
                            hallTitle, hallSubtitle,
                            sports[], accent
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Permission denied" on admin actions | Check `users/{YOUR_UID}.isAdmin` is `true` in Firestore, and the Firestore + Storage rules above are published. |
| Google sign-in popup immediately closes or errors | Add the deployed domain to Firebase → Auth → Authorized domains. |
| Image upload spins forever | Paste the Storage rules above. Make sure `storageBucket` in `src/lib/firebase.js` matches your Firebase project. |
| Admin shield icon never appears | Sign out and back in once after setting `isAdmin:true` — the `users/{uid}` subscription needs a fresh auth token. |
| Pinned games not sorted to top | Client-side sort is based on `pinned` + `createdAt`. Make sure your games have `createdAt` set (new ones will automatically). |
