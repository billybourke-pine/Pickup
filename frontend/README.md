# Pickup — with Image Uploads & Email Auth

## What's new in this drop
Added to your existing Firebase + React app, **without touching the base UX**:

1. **Cover image upload on posted games** — Firebase Storage, compressed client-side (~1200px / JPEG q0.78), progress bar, preview + remove.
2. **Email & password sign-in** — now supported alongside your existing Google sign-in.
3. **Auth gate on posting** — only signed-in users can post games. Clean sign-in panel on the Profile tab.
4. **SwipeCard renders cover images** — when a game has `imageUrl`, it shows as the banner with a dark gradient overlay for legibility. Falls back to the colour gradient when no image.

## Files changed / added (all inside `src/`)
```
lib/firebase.js        UPDATED — also exports `storage` (getStorage)
lib/uploadImage.js     NEW     — canvas-compress + upload to `games/{uid}/*.jpg`
hooks/useAuth.js       UPDATED — adds signInEmail, signUpEmail
views/ProfileView.jsx  UPDATED — image input, email auth panel, auth gate
components/SwipeCard.jsx  UPDATED — imageUrl banner with overlay
App.jsx                UPDATED — passes full `auth` to ProfileView
```
Nothing else changed. Copy these files into your Vercel project, commit, deploy.

## Two 1-minute Firebase Console steps (required)

### 1. Enable Email/Password sign-in method
Firebase Console → **Authentication** → **Sign-in method** → **Email/Password** → Enable → Save.

### 2. Set Firebase Storage security rules
Firebase Console → **Storage** → **Rules** tab. Paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /games/{uid}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.uid == uid
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

This locks writes to the signed-in user's own folder, keeps reads public (so the swipe deck can show them), and caps at 5 MB/image + images only.

## Your Firestore rules are already fine
Your existing rule already works with the new `imageUrl` field — posting is just another authed write to `/games/{gameId}`.

## Install
Only one new dep was added: `firebase` was already there — no new packages needed on your side beyond what's in `package.json`.

## Run locally
```bash
npm install
npm start
```

## Deploy
```bash
npm run build
vercel --prod
```

---

## Quick tour of the UI additions

**Profile tab (signed out)**
- "Continue with Google" pill
- Tabs: `Sign in` · `Create account`
- Friendly error messages for wrong-password, email-in-use, weak-password, invalid-email

**Profile tab (signed in) → Post a game**
- First field is now a sleek dropzone: *"Add a photo — JPG, PNG, or WebP · auto-compressed · optional"*
- Tap to pick → preview thumbnail + Remove button
- On submit: compresses → uploads to `games/{uid}/{timestamp}.jpg` → writes `imageUrl` to Firestore
- Submit button shows live `Uploading… 62%` progress

**Swipe deck**
- Cards with `imageUrl` show the photo in the banner (with subtle dark gradient for readable title)
- Cards without `imageUrl` keep your colourful gradient exactly as before

---

## Data model addition
Firestore `games/{id}` documents now include two optional fields:
```js
imageUrl:  string   // https download URL from Firebase Storage
imagePath: string   // "games/{uid}/{filename}.jpg" — kept for later cleanup/deletion
```
Old games without these fields keep working (SwipeCard falls back to the gradient).
