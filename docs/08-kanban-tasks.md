# GitHub Kanban task breakdown

Columns: Product Backlog → Sprint Backlog → In Progress → Review & Testing → Done.
No existing board is changed by this file. Suggested tasks below are not automatically Done.
The Scrum Master assigns actual owners with the team; retain the submitted member responsibilities.

| Parent    | Task ID    | Task                                         | Verification                             |
| --------- | ---------- | -------------------------------------------- | ---------------------------------------- |
| US01/US02 | SETUP-01   | React setup, environment, Supabase migration | Clean install and SQL applied            |
| US01      | US01-T1    | Registration fields and validation           | Valid/invalid details                    |
| US01      | US01-T2    | Supabase signup, confirmation, duplicates    | Live Auth and email                      |
| US01      | US01-T3    | Login, logout, protected account             | Real account and logout                  |
| US02      | US02-T1    | Admin provisioning and immutable roles       | Inject role metadata; denied escalation  |
| US02      | US02-T2    | Admin page guard and login redirect          | Admin allowed, customer/visitor denied   |
| US03      | US03-T1    | Collection create/edit/delete                | Persist after refresh                    |
| US03      | US03-T2    | Multi-photo upload and validation            | Valid batch, oversize and invalid types  |
| US03      | US03-T3    | Caption/visibility edit and photo deletion   | Public/hidden tests and failure retry    |
| US03      | US03-T4    | Storage and table policies                   | Real anonymous/customer/admin API checks |
| US04      | US04-T1    | Public listing/detail and style filter       | Anonymous browsing                       |
| US04      | US04-T2    | Empty states and hidden-item filtering       | Both visibility combinations             |
| US04      | US04-T3    | Responsive/accessibility checks              | Phone/desktop/keyboard                   |
| Shared    | PWA-01     | Manifest, icons, service worker, offline     | Production browser install checks        |
| Shared    | QA-01      | CI, acceptance evidence, regression          | Tests + report                           |
| Shared    | REVIEW-01  | Arrange 17 November owner trial              | Consent and actual feedback              |
| Shared    | RELEASE-01 | Staging + team review                        | HTTPS URL and PR review                  |

Keep points only on US01=3, US02=3, US03=5, US04=5. Tasks add no points.
Proposed WIP policy: each person starts at most one task; help review/test before taking another.
Blocked tasks stay visible with a blocker and next action. Move stories to Done only after the
original DoD is met (including agreed testing framework, staging, reviewed merge and PO acceptance).
