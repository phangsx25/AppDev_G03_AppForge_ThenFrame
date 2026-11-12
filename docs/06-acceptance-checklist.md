# Acceptance criteria checklist

Original criteria below are preserved from the submitted backlog. Check boxes only after actual acceptance verification. Local test evidence does not close live-service checks.

## US01

- [ ] 1. New users can register with valid required information.
- [ ] 2. Registered users can log in with correct credentials
- [ ] 3. Incorrect login details display an error message.
- [ ] 4. The system prevents registration using an existing email address.
- [ ] 5. Users can log out and cannot access protected account pages after logging out.

## US02

- [ ] 1. Authorized admins can log in using valid credentials.
- [ ] 2. Successful admins login redirects users to the admin dashboard.
- [ ] 3. Incorrect login details display an error message.
- [ ] 4. Regular customers cannot access admin-only pages.
- [ ] 5. Admins can log out, and protected dashboard pages cannot be accessed after logout.
- [ ] 6. Public users cannot register themselves as administrators.

## US03

- [ ] 1. Logged-in admins can upload wedding photos to the system.
- [ ] 2. Admins can create a gallery collection with a title and description.
- [ ] 3. Admins can add uploaded photos to a selected collection.
- [ ] 4. Admins can view, edit, and delete their uploaded photos and collections.
- [ ] 5. The system rejects unsupported file types and files that exceed the allowed size.
- [ ] 6. Uploaded photos and collection details remain saved after refreshing the page.
- [ ] 7. Regular customers and visitors cannot access photo upload or gallery management functions.

## US04

- [ ] 1. Visitors can browse public wedding photography collections without logging in.
- [ ] 2. Visitors can open a collection to view its wedding photos and details.
- [ ] 3. Visitors can view different wedding photography styles and collections.
- [ ] 4. Only photos and collections marked as public are displayed to visitors.
- [ ] 5. The gallery works properly on both mobile and desktop screens.
- [ ] 6. The system displays a message when a collection has no photos.
- [ ] 7. Visitors cannot upload, edit, or delete gallery photos or collections.

## Additional requested quality checks

- [ ] Passwords handled by Supabase Auth, never stored by application code.
- [ ] Multiple images in one collection; each defaults Hidden.
- [ ] Both collection and photo must be Public for anonymous metadata AND file access.
- [ ] Validate JPEG/PNG/WebP and 8 MB limit; empty and disguised files rejected.
- [ ] Dashboard counts use actual gallery rows, not invented bookings.
- [ ] Manifest + 192/512 icons + service worker + offline page + standalone installation.
- [ ] Sensitive API/storage data absent from Cache Storage.
- [ ] Phone/desktop layouts, keyboard focus, errors and empty states checked.
- [ ] User review and recording consent collected on agreed date.

## Live backend adversarial verification (not executed here)

Use disposable test accounts and an incognito visitor. Save result/evidence in testing report.

1. Customer signup with extra metadata `{role: 'admin'}` must still produce a customer profile.
2. Customer direct API insert/update/delete on gallery tables must be denied or affect zero rows.
3. Customer direct profile role update must be denied.
4. Anonymous listing shows only public collections and jointly public photos.
5. Anonymous direct Storage download of a known hidden path must fail, even if URL is known.
6. Admin downloads hidden images; customer cannot. Hide a public collection and retest a fresh request.
7. Invalid login displays an error, customer cannot use admin login, logout blocks protected routes.
8. Repeat signup with a confirmed email; no duplicate account is created. Check confirmation-enabled behaviour.
9. Upload two files, reload on another browser/device, edit/delete, verify both metadata and file access.
10. Induce upload failure; successful files remain listed, failed files have an actionable error. Retry remaining files.

Keep the original DoD: acceptance criteria, agreed test suite, teammate-reviewed merged PR,
phone/desktop, staging, privacy and PO acceptance. Pest substitution is a documented open decision.
