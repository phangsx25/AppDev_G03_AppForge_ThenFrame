# Sprint 1 scope and source decisions

Goal: customers can register/log in, administrators manage public photography collections,
and visitors browse published collections on desktop and mobile in a PWA.

| Story | Points | Scope                                |
| ----- | -----: | ------------------------------------ |
| US01  |      3 | Customer Registration & Login        |
| US02  |      3 | Admin Secure Login                   |
| US03  |      5 | Admin Gallery Management             |
| US04  |      5 | Public Portfolio Browsing            |
| Total |     16 | No additional story points for setup |

Calendar: 5–18 November 2026; refinement 11 November; testing/refinement 16 November;
user review/feedback 17 November (record only with consent); internal sprint review 18 November;
demo 19–20 November 8–10 AM MYT. Calendar says Sprint 2 begins 19 November. Do not silently
recalculate Sprints 2–4; confirm their dates separately. No partner meeting is claimed booked.

Sources inspected: attached `S04-Product Backlog and MVP Plan (3).pdf` (version 1.0,
4 November; equivalent named copy differs from prompt suffix), `02-Product Engineering(2).pdf`
(all 31 pages, OCR), lecturer calendar image, exported ThenFrame Core Flow Wireframes,
and `06-Sprint.pdf` (17 pages). Repository originally had one README and no app source.
The exported wireframes supply the cream/burgundy typography, arch motif, form and gallery
structure. Later-sprint navigation/actions shown in the wireframe are omitted from Sprint 1.
Live Figma layer inspection was not performed; the supplied export was the visual reference.

Conflicts / decisions requiring confirmation:

- Original plan contains several older Sprint 1 dates; the lecturer calendar overrides them.
- Original DoD says Pest feature tests. React uses Vitest + Playwright here. Confirm this
  framework substitution with the lecturer; do not report Pest tests as passed.
- Prompt reports a possible three-role rule. Supplied Product Engineering slides 2, 8, 24,
  31 state at least two. Keep Customer and Admin/Photographer; visitors remain unauthenticated.
  Confirm whether any newer three-role rule exists and whether visitors count.
- Original OBS01/partner-trial date was later. Prepare user review for 17 November, but
  partner availability and observation collection remain unconfirmed.

US05–US13 are not implemented. No booking stats, packages/prices, AI, private delivery,
testimonials, real partner feedback, or additional account role is fabricated.
