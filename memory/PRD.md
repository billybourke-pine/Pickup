# PRD — Pickup (Image Upload + Email Auth Addition)

## Original problem statement
> "can i upload files from a vercel semi kinda website, it just has a front end, And i really want to keep the base just add all the functionality"
>
> Follow-up: "uploading images will be done from the backend, not by users. we need people a sleek way to make game profiles like... keep storage with firebase. I want both types of auth method."

User shipped a zip of their existing React + Firebase Vercel app ("Pickup", a Tinder-style pickup sports app). They wanted:
- Image uploads attached to each posted game (authenticated users act as hosts/"backend")
- Storage = Firebase Storage (already in their stack)
- Both Google sign-in and Email/Password sign-in
- Base UX preserved; additive changes only

## Tech stack (preserved)
- React 18 + Firebase JS SDK v10/12
- Firestore for games collection (real-time `onSnapshot`)
- Firebase Auth for users
- Firebase Storage (NEW — added for image uploads)
- Vercel for hosting (frontend-only)

## What's been implemented (2026-01)
1. **Firebase Storage wiring** — `src/lib/firebase.js` now exports `storage`
2. **Image upload utility** — `src/lib/uploadImage.js`: canvas resize to 1200px + JPEG q0.78 + upload to `games/{uid}/{ts}.jpg` with progress callback
3. **Email/password auth** — `useAuth` exposes `signInEmail`, `signUpEmail` (with `updateProfile` for displayName) alongside existing `signIn` (Google)
4. **ProfileView overhaul** — sleek dropzone + preview, auth gate (email/password + Google), friendly error mapping for common Firebase auth codes
5. **SwipeCard image banner** — renders `imageUrl` with gradient overlay for legibility; gradient fallback preserved
6. **Handoff docs** — README includes Firebase Storage rules snippet + Console steps

## Security boundary
- Firestore `games` rule unchanged (write requires auth)
- NEW Firebase Storage rule (user must paste in Console): public read, authed write, owner-uid only, image/* only, <5MB

## Core requirements (static)
- Keep existing base intact — NO rewrites or refactors
- Only Firebase stack — no backend added
- Deploy target: Vercel (static build)

## Verified
- Frontend compiles cleanly (lint: no issues)
- App loads, Firestore connects, auth panel renders, dropzone renders
- Sign-in tabs + Google button + email/password forms work as designed

## Prioritized backlog
- P1: Delete previously uploaded image when host deletes/replaces a game (currently `imagePath` stored but no cleanup UI yet)
- P2: Multiple images per game (carousel in SwipeCard)
- P2: Crop/aspect-ratio editor before upload (force 16:9 for nicer banners)
- P2: Password reset flow (Firebase `sendPasswordResetEmail`)
- P3: Email verification gate before posting

## Next action items (for user)
1. In Firebase Console → Authentication → Sign-in method → enable **Email/Password**
2. In Firebase Console → Storage → Rules → paste the rules from README
3. Copy the changed files from `/app/frontend/src/` into their Vercel repo, commit, `vercel --prod`
