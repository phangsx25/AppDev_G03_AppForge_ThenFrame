# ThenFrame — Sprint 1 PWA

G3-AppForge · Section 02 · UTM SECV3104

A React + Vite + Tailwind wedding portfolio and studio gallery, with Supabase Auth,
PostgreSQL RLS and a private Storage bucket. US01 (3), US02 (3), US03 (5), US04 (5):
**16 story points**. Sprint 5–18 November 2026; user review 17 November;
demo 19–20 November, 8–10 AM MYT.

## Start in Cursor (Windows, macOS or Linux)

Install Node.js 22.12+ (Node 24 also supported), open this folder in Cursor's terminal:

```sh
npm ci
```

Copy `.env.example` to `.env` using your editor (PowerShell: `Copy-Item .env.example .env`).
The example explicitly selects `VITE_BACKEND=demo`.

```sh
npm run dev
```

Open the localhost URL printed by Vite (normally http://127.0.0.1:5173).

**Local rehearsal is not secure authentication or a shared backend.** It offers clearly
labelled role simulation; there are no mock passwords or fake customer registrations.
Collections and photo blobs persist in this browser's IndexedDB. Clearing site data deletes
them; other browsers/devices cannot see them. Session role lasts in the current tab.
Do not enter real customer information. The real account forms are available in Supabase mode.
Without a mode or Supabase credentials the app shows a setup notice; it does not silently
pretend to connect.

## Rehearse the connected flow

1. Footer → Admin login → Continue as demo admin.
2. Create collection; enter a title, description and wedding style. It starts Hidden.
3. Select both PNGs from `demo-assets/`; click Upload photos.
4. Set a photo to Public and Save photo. Leave the other hidden to show access filtering.
5. Set Collection visibility to Public and Save collection.
6. Open the public portfolio, then the collection. Only the public photo appears.
7. Refresh, edit captions, hide items, and test deletion. Log out; gallery editing redirects to login.
8. Customer login → Continue as demo customer → `/admin` shows Access denied.

The bundled files are original **sample illustrations**, not wedding photographs or
ThenFrame client work. They are not pre-seeded as actual portfolio collections. Upload
owner-approved wedding images only when permission is recorded.

## Configure the real Supabase backend

1. Create a Supabase project in your own account.
2. Run `supabase/migrations/001_sprint1.sql` **once on a fresh project** in SQL Editor.
   It creates profiles, collections, photos, the private `gallery` bucket and RLS policies.
   Alternatively link the Supabase CLI and run `supabase db push` against that project.
3. Under Authentication, enable email/password signup, set minimum password length to at
   least 8, set Site URL and allowed redirect URLs (`http://127.0.0.1:5173/account`, your
   HTTPS site's `/account`). Keep email confirmation enabled for normal use. Configure
   SMTP before a real review if the project's default email limits prevent confirmation.
4. Set `.env`:
   ```dotenv
   VITE_BACKEND=supabase
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
   ```
   The anon/publishable key is intended for browsers; security comes from RLS. **Never use
   a service-role or secret key here.** Vite exposes `VITE_*` in the browser bundle.
5. Restart Vite. Register a customer, confirm their email, sign in, and sign out.
6. Create the admin through normal signup or Auth's user management. As project owner,
   run the commented SQL pattern in `supabase/promote-admin.sql` with its exact Auth UUID.
   Sign out and back in. Signup metadata cannot assign a role; API role updates are denied.
7. Test with a second regular customer and an incognito visitor. Follow
   `docs/06-acceptance-checklist.md`, including direct API/RLS checks.

No Supabase project was supplied during implementation. Live Auth, email delivery,
Storage HTTP behaviour, cross-device persistence and production deployment are **not
verified**. The policies have separate PostgreSQL tests with emulated Supabase schemas;
these are not a substitute for tests in the real project.

Duplicate email signup never creates a second Auth account. Supabase may deliberately
obfuscate an existing confirmed account; the app handles an empty identities response
with a sign-in suggestion. Duplicate unconfirmed registration behaviour depends on Auth
settings. Do not weaken this privacy protection by exposing a public email lookup table.

## Build, test and preview

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

The E2E command builds **local rehearsal mode** independently of your `.env`. Rebuild with
`npm run build` using your intended `.env` before deploying. Use `npm ci` for lockfile versions.
Tests are described in `docs/07-testing-report.md`. PWA testing requires a production build
and preview, not just the development server.

## HTTPS deployment (Cloudflare Pages or equivalent)

Connect your GitHub repository to Cloudflare Pages. Build command: `npm ci && npm run build`;
output folder: `dist`; Node version: 22.12+ (or 24). Configure the three `VITE_*` values as
build variables; use `supabase` for a connected deployment. No custom REST server is needed.
`public/_redirects` supplies SPA routes; `_headers` supplies basic response headers.
For another static host configure fallback routing to `index.html` and HTTPS.

Then configure Supabase redirect URLs for the exact deployed origin, rebuild, and verify
register → confirm → customer login/logout; admin login → create → upload → publish →
incognito visitor; direct hidden-image access; refresh on nested routes; PWA installation.
A successful build alone does not prove deployment. No live deployment URL is claimed.

## Install / offline test

On Chrome desktop open the production preview or HTTPS deployment → DevTools → Application.
Check Manifest (standalone, name, icons), Service Workers (activated), and Cache Storage.
Only build assets should be cached; never Supabase API/auth/storage responses. Visit online
once, then set Network Offline and navigate to `/portfolio`: the dedicated offline page
should appear. Reconnect and use Try again. Installation may be offered by Chrome's address
bar/menu or the in-app Install button when `beforeinstallprompt` is available.
On supported Android Chrome, visit the HTTPS URL, use Install app/Add to Home screen, launch
and check standalone layout. On iOS Safari use Share → Add to Home Screen. These physical
mobile installation checks are still manual/not tested. Test service-worker updates after
saving edits; the update prompt reloads only when selected.

## Project structure

- `src/auth`: Auth provider, route guard, registration/login forms and SDK adapter.
- `src/gallery`: shared gallery service and admin screens.
- `src/public`: public home, collection listing/detail.
- `src/shared`: reusable UI and blob image rendering.
- `src/lib`: backend selection, local rehearsal adapter, validation.
- `src/sw.js`: static-only service worker; no sensitive runtime cache.
- `supabase`: schema, policies and admin provisioning notes.
- `tests`: unit/auth-contract/PostgreSQL policy tests and browser workflow tests.
- `docs`: editable setup, QA, sprint and review evidence templates.

See `CONTRIBUTING.md` for five-person collaboration. Do not mark stories Done merely because
code is supplied: live checks, PR review/merge, staging and Product Owner acceptance remain.
