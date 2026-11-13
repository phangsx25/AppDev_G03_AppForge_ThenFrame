# Sprint 2 handover

Priorities: US05 Customized Booking Enquiries (8), US06 Admin Booking Management (5),
US07 Consultation Scheduling (5). Preserve these IDs. No booking implementation is included here.

Before expanding: configure live Supabase; complete real Auth/Storage/visibility checks; complete the PWA browser
retest and physical-device checks; review and merge code; deploy staging; collect actual owner feedback and PO acceptance.
Confirm test-framework substitution and any newer role requirement. Confirm dates: lecturer calendar
starts Sprint 2 on 19 November, unlike older forecast. Do not invent a revised end date.

Reuse auth provider, route guards, profile roles, shared layouts and migration conventions. Add booking
modules separately from gallery so multiple developers do not all edit one file. Draft ownership RLS
before building booking forms; a customer must not read another customer's enquiry. Agree package
fields, scheduling rules and status transitions with the studio; do not invent prices or commitments.

Known engineering limits: gallery queries currently fetch all rows; photos are full-size with no thumbnail
pipeline; storage/metadata deletion is not transactional; demo is local-only; upload MIME validation
is not a malware scanner. Consider pagination, image optimisation and orphan cleanup based on actual
review volume. Record defects with reproduction steps, severity, owner and retest evidence.

Later forecast: Sprint 3 US08 AI Booking Enquiry Summarization, US09 Private Client Album Management,
US10 Photo Selection and Download begins. Sprint 4 completes US10, US11 AI FAQ Chatbot,
US12 Customer Feedback and US13 Traditional Malay Wedding Heritage. No AI photo categorisation
is added to this approved backlog. Private album policies must be designed separately from public gallery.
