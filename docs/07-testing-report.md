# Sprint 1 test report

Execution date: 13 November 2026 (MYT). Build: supplied source increment.
All results below describe automated or environment checks, not partner/user acceptance.

| Check                                                                         | Status             | Evidence / boundary                                                                                                           |
| ----------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Production Vite build and service-worker generation                           | Pass               | Vite 7.3.8; 96 modules; generated manifest and sw.js                                                                          |
| Valid/invalid registration input                                              | Pass               | 4 Vitest cases; local validation                                                                                              |
| Registration SDK call, duplicate errors and obfuscated response               | Pass               | Mocked Supabase SDK contract tests; no live account created                                                                   |
| Customer/admin login and invalid credentials                                  | Pass               | Mocked SDK; actual Auth not tested                                                                                            |
| Customer/unauthenticated route guards, admin redirect, logout                 | Pass               | 6 React/jsdom tests, simulated sessions                                                                                       |
| File type/header/size validation                                              | Pass               | 5 Vitest cases                                                                                                                |
| Collection creation, multiple upload, edit/delete, visibility and persistence | Pass               | 2 integration cases using actual adapter with fake-indexeddb; blob persistence and module reload                              |
| Joint public/hidden visibility combinations                                   | Pass               | 4 validation cases                                                                                                            |
| Migration application and RLS restrictions                                    | Pass               | 7 PGlite PostgreSQL cases with auth/storage schema stubs                                                                      |
| Production dependency audit                                                   | Pass               | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities reported at execution                                            |
| Chromium browser suite                                                        | Fail (environment) | 5 tests attempted; Chromium process could not launch (`socket() failed: Operation not permitted`); app assertions not reached |
| Cloud browser preview                                                         | Not Tested         | Separate browser could not reach local preview: connection refused                                                            |
| Actual responsive layout and visual rendering                                 | Not Tested         | CSS and browser tests included; no successful browser run                                                                     |
| Live Supabase registration/login/logout/confirmation/duplicates               | Not Tested         | Project URL/key and configured project unavailable                                                                            |
| Live Supabase Storage, cross-device persistence, HTTP policies                | Not Tested         | Requires migrated Supabase project                                                                                            |
| Real browser service-worker/offline/cache runtime                             | Not Tested         | Build configuration verified; browser execution blocked                                                                       |
| Desktop/mobile PWA installation                                               | Not Tested         | Needs supported browser on localhost/HTTPS; physical device checks pending                                                    |
| HTTPS deployment and live user flow                                           | Not Tested         | No deployment account configured                                                                                              |
| Studio owner review, feedback, approval                                       | Not Tested         | Planned for 17 November; no outcomes invented                                                                                 |

Local suite: **36 passed, 0 failed**, across 5 test files. JSON evidence is in
`docs/evidence/unit-tests.json`. Browser suite source is in `tests/e2e/rehearsal.spec.js`.
It builds a clearly labelled demo-mode app, never claiming real authentication.
The test code includes full gallery flow, mobile width, manifest/icon/service-worker/offline checks.

A test-ordering assumption (IndexedDB UUID order versus source-file order) was corrected during
verification. An initial preview host-bind error was also corrected by using loopback. Remaining
browser launch restrictions are environment blockers; they are not reported as successful UI checks.

## Repeat locally / CI

```sh
npm ci
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

CI workflow is supplied. Do not claim it passed until its actual run succeeds. On a system with a
preinstalled Chromium, `PLAYWRIGHT_CHROMIUM_EXECUTABLE` may specify its executable. This variable
is optional; normal local setup uses Playwright's browser. The build command after E2E restores your
chosen `.env` mode before deployment.

## Manual test record (blank)

| Test ID / story / criterion | Preconditions and steps | Expected | Actual | Pass / Fail / Not Tested | Evidence | Tester/date | Retest |
| --------------------------- | ----------------------- | -------- | ------ | ------------------------ | -------- | ----------- | ------ |
|                             |                         |          |        |                          |          |             |        |

Record device/browser, build commit, backend mode, exact steps, and any test data cleanup.
Do not enter passwords or tokens into this record. Use `06-acceptance-checklist.md` for live-service
and adversarial cases, and `10-user-review-feedback.md` for partner tasks.

## Remaining limitations

No story is declared Done. Live backend verification, visual/mobile review, install testing, staging,
student PR review/merge and Product Owner acceptance remain. Demo data is local to one browser.
Large-gallery pagination/thumbnails and transactional storage cleanup are not implemented. These
limits are documented in the architecture and Sprint 2 handover.
