# Contributing

All five students should be able to explain the complete flow. The following module ownership
is a suggested coordination plan, not a claim of individual contributions or a replacement
for the submitted task assignments.

| Workstream                  | Main files                          | Suggested branch          |
| --------------------------- | ----------------------------------- | ------------------------- |
| Public portfolio            | src/public                          | feature/US04-portfolio    |
| Admin gallery               | src/gallery/Admin.jsx               | feature/US03-gallery      |
| Authentication              | src/auth                            | feature/US01-US02-auth    |
| Shared UI and accessibility | src/shared, src/styles.css          | feature/shared-ui         |
| Database, PWA, integration  | supabase, src/lib, src/sw.js, tests | feature/setup-integration |

Each developer: clone repository, run `npm ci`, copy `.env.example` to ignored `.env`, run
`npm test`, and start `npm run dev`. Each uses their own local demo database. For shared testing,
coordinate one staging Supabase project and separate test accounts; never exchange secret keys.

Branch from current main, make small story-labelled commits, push your branch and open a PR.
Describe user-visible behaviour, story/AC IDs, tests run, limitations and screenshots if useful.
Request a teammate review. Merge only after tests and manual acceptance checks; do not self-claim
partner approval. Keep lockfile changes with dependency changes. Coordinate edits to `src/main.jsx`
and migration ordering with the integration owner; feature modules should not all edit routing.

Use camelCase for JS variables/functions, PascalCase for components, snake_case for SQL fields,
and stable US01–US13 IDs. Never modify already-applied migrations in a shared environment: add
numbered migrations. All writes must retain RLS protection. New route guards do not replace RLS.

Before a PR: `npm test`, `npm run test:e2e`, `npm run build`, phone-width and keyboard checks.
Commit no `.env`, real client images, session tokens, videos, or node_modules. Add sanitized evidence
only. Record AI assistance honestly; this initial implementation was generated with ChatGPT/Codex
and requires student code review and ownership. No student contribution history is fabricated.
