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
| PWA fix browser retest                                                       | Not Tested         | Fix committed; 3 regression tests pass, but no new GitHub run returned for fixed commit at delivery |
| Local Chromium suite                                                         | Fail (environment) | Retried: Chromium cannot create process socket; app assertions not reached                          |
| Desktop/mobile screenshot review                                             | Not Tested         | Capture test added; no successful capture run yet                                                   |
| Live Supabase Auth/email/Storage and cross-device persistence                | Not Tested         | No configured project URL/key supplied                                                              |
| Physical device installation and HTTPS deployment                            | Not Tested         | Configuration/instructions provided; no deployment claimed                                          |
| Studio owner feedback and acceptance                                         | Not Tested         | Planned for 17 November; no outcomes invented                                                       |

Local suite: **39 passed, 0 failed**, across 6 test files. JSON evidence is in
`docs/evidence/unit-tests.json`. Browser suite source is in `tests/e2e/rehearsal.spec.js`.
It builds a clearly labelled demo-mode app, never claiming real authentication.
The suite includes five functional checks plus a screenshot-capture test. Four functional browser checks passed on the initial CI run; the PWA runtime retest is outstanding.

Initial CI evidence: [GitHub Actions run 43260106768](https://github.com/phangsx25/AppDev_G03_AppForge_ThenFrame/actions/runs/43260106768), source commit c2f5e15d9f00d0a9f82ac0a777d7ed4721291e94. It passed 36 unit/integration tests and four of five browser tests. The PWA test failed waiting for activation. The plugin included icons twice, and Cache.addAll rejects duplicate requests. The fix deduplicates URLs before caching and is covered by new regression tests. Fixed source commit: 83deffc288574d59e3486acd41839eb196a69d90.

The fixed build and 39 local tests pass. A fresh CI browser result was not available at delivery; do not describe the fix as browser-verified. Local browser launch is still blocked by process-socket restrictions; the cloud browser also could not reach the local server. A test-only IndexedDB ordering assumption and the preview host binding were corrected during earlier verification.

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

No story is declared Done. Live backend verification, visual/physical-device review, PWA browser retest, install testing, staging,
student PR review/merge and Product Owner acceptance remain. Demo data is local to one browser.
Large-gallery pagination/thumbnails and transactional storage cleanup are not implemented. These
limits are documented in the architecture and Sprint 2 handover.
