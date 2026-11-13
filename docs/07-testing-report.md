# Sprint 1 test report

Execution date: 13 November 2026 (MYT). Build: supplied source increment.
All results below describe automated or environment checks, not partner/user acceptance.

| Check                                                                        | Status             | Evidence / boundary                                                                                 |
| ---------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| Production Vite build, manifest, 192/512 icons and service-worker generation | Pass               | Build and file dimensions verified                                                                  |
| Registration validation                                                      | Pass               | 4 local cases                                                                                       |
| Signup, duplicate handling and customer/admin login                          | Pass               | 8 mocked SDK cases; not live Auth                                                                   |
| React route guards and logout                                                | Pass               | 6 jsdom cases                                                                                       |
| Image validation                                                             | Pass               | 5 type/header/size/empty cases                                                                      |
| Gallery create/upload/edit/delete and persistence                            | Pass               | 2 adapter integration cases using fake-indexeddb                                                    |
| Joint collection/photo visibility combinations                               | Pass               | 4 cases                                                                                             |
| Migration and PostgreSQL RLS                                                 | Pass               | 7 PGlite cases with Supabase schema stubs                                                           |
| Service-worker regression tests                                              | Pass               | 3 cases: duplicate asset removal, API exclusion, offline fallback                                   |
| Production dependency audit                                                  | Pass               | npm audit --omit=dev reported 0 vulnerabilities at execution                                        |
| Chromium connected gallery workflow                                          | Pass               | GitHub CI: create, multiple upload, edit, reload, publish, anonymous view, delete                   |
| Chromium role guards and logout                                              | Pass               | GitHub CI, simulated sessions                                                                       |
| Chromium invalid upload and empty collection                                 | Pass               | GitHub CI                                                                                           |
| Chromium mobile-width layout/navigation                                      | Pass               | GitHub CI at 390 × 844; no horizontal overflow                                                      |
| Initial Chromium PWA runtime test                                            | Fail               | CI timed out waiting for service-worker activation; duplicate precache URLs identified              |
| PWA fix browser retest | Pass | Fresh CI verified activation, offline fallback, icons and cache boundaries |
| Local Chromium suite                                                         | Fail (environment) | Retried: Chromium cannot create process socket; app assertions not reached                          |
| Desktop/mobile homepage screenshot review | Pass | Actual CI captures reviewed; readable layout and no visible clipping |
| Live Supabase Auth/email/Storage and cross-device persistence                | Not Tested         | No configured project URL/key supplied                                                              |
| Physical device installation and HTTPS deployment                            | Not Tested         | Configuration/instructions provided; no deployment claimed                                          |
| Studio owner feedback and acceptance                                         | Not Tested         | Planned for 17 November; no outcomes invented                                                       |

Local suite: **39 passed, 0 failed**, across 6 test files. JSON evidence is in
`docs/evidence/unit-tests.json`. Browser suite source is in `tests/e2e/rehearsal.spec.js`.
It builds a clearly labelled demo-mode app, never claiming real authentication.
The suite includes five functional checks plus a screenshot-capture test. All six browser tests passed in the final CI run (0 failed, 0 skipped, 0 flaky). Machine-readable evidence: `docs/evidence/browser-tests.json`.

Initial CI evidence: [GitHub Actions run 43260106768](https://github.com/phangsx25/AppDev_G03_AppForge_ThenFrame/actions/runs/43260106768), source commit c2f5e15d9f00d0a9f82ac0a777d7ed4721291e94. It passed 36 unit/integration tests and four of five browser tests. The PWA test failed waiting for activation. The plugin included icons twice, and Cache.addAll rejects duplicate requests. The fix deduplicates URLs before caching and is covered by new regression tests. Fixed source commit: 83deffc288574d59e3486acd41839eb196a69d90.

Final CI evidence: [GitHub Actions run 43356286022](https://github.com/phangsx25/AppDev_G03_AppForge_ThenFrame/actions/runs/43356286022), source commit `5186bc99a045221bfcc5d0c626a958e7b97d7286`: **39 unit/integration tests and 6 Chromium browser tests passed**, followed by a successful production build. This verifies the PWA fix in Chromium. Desktop and mobile homepage captures from that run were visually reviewed. Local browser launch remains blocked by this workspace's process-socket restrictions; CI provided actual browser execution. A test-only IndexedDB ordering assumption and preview host binding were corrected during earlier verification.

## Repeat locally / CI

```sh
npm ci
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

CI workflow is supplied; the run linked above succeeded. On a system with a
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

No story is declared Done. Live backend verification, physical-device review, install testing, staging,
student PR review/merge and Product Owner acceptance remain. Demo data is local to one browser.
Large-gallery pagination/thumbnails and transactional storage cleanup are not implemented. These
limits are documented in the architecture and Sprint 2 handover.
