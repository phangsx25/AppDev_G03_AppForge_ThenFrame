# Story-to-feature traceability

| Story | Source criteria                                                                                                      | Implementation                                                         | Verification                                                                        |
| ----- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| US01  | Register, correct/incorrect login, duplicate email, logout/protected account                                         | auth/Auth.jsx, auth/service.js, profiles trigger                       | Validation + mocked SDK tests; live Supabase checks pending                         |
| US02  | Admin login/redirect, invalid rejection, customer exclusion, logout, no public admin signup                          | AuthPage, Protected, is_admin(), immutable public roles                | Mocked SDK + browser role simulation + PostgreSQL policy tests; live checks pending |
| US03  | Upload, create title/description, add multiple photos, view/edit/delete, validation, refresh persistence, admin only | gallery/api.js, gallery/Admin.jsx, collections/photos/storage policies | Local IndexedDB browser flow + PostgreSQL policy tests; live Storage pending        |
| US04  | Anonymous listing/detail/styles, joint public visibility, responsive, empty state, no editing                        | public/Portfolio.jsx, shared/UI.jsx, read policies                     | Browser flow and PostgreSQL policy tests; real mobile and deployed checks pending   |

The first visible photo supplies a collection cover. No separate cover reference can leak a hidden photo.
The public view filters public data even for signed-in administrators; RLS independently enforces access.
Implementation does not imply story acceptance. All four stories remain awaiting live verification and review.
