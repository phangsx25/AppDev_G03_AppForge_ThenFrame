# Technical setup

Use README as the executable setup guide. Node 22.12+, npm, Git and a modern browser are required.
Run `npm ci`, configure ignored `.env`, run `npm run dev`. For real backend run migration 001,
configure Supabase email Auth and redirects, register users and explicitly provision one admin
using SQL Editor. No service-role key is needed by the application.

Developer rehearsal runs without external credentials. Live verification requires:

- Supabase project URL and browser-safe publishable/anon key.
- Migration applied by the project owner and storage policies checked.
- Customer and admin test accounts; email confirmation/SMTP configured appropriately.
- HTTPS hosting account or deployment connection for install testing on a phone.

Environment changes require a Vite restart or deployment rebuild. Check for typoed URL/key,
missing migration, unconfirmed email, role provisioning, and Auth redirect allow-list when debugging.
Never paste secrets into issue descriptions or commit them. Project limits/quotas depend on the
provider account; inspect them before uploading large collections. Current code uses no paid
service requirement, but it does not guarantee provider pricing or unlimited free storage.

For a clean backend, apply migration once; existing migrations must be preserved and followed by
new numbered files. For local demo reset only, DevTools → Application → IndexedDB → delete
thenframe-rehearsal-v1 (deletes local rehearsal data). Do not clear real studio storage casually.
