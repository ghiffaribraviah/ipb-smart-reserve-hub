# PRD: IPB Smart Reserve Hub MVP

## Problem Statement

IPB needs a transparent, centralized reservation system for campus facilities. Today, students need a predictable way to discover facilities, see availability, submit reservation details, handle approval letters, and complete payment proof where required. TU/staff need a controlled workflow for verifying signed letters, payment receipts, cancellations, facility availability, and operational statistics without exposing private student or financial data.

The MVP must support the full reservation lifecycle for free and paid facilities while keeping scope disciplined: desktop-first web, manual offline signatures, manual offline payment, in-app notifications, staff assignment by facility, and a clean OOP-oriented backend architecture that can be extended later.

## Solution

Build IPB Smart Reserve Hub as a desktop-first fullstack web application using React, Tailwind CSS, FastAPI, SQLAlchemy, Alembic, PostgreSQL, and object storage.

Students will browse facility catalog pages, inspect facility details and public reservation calendars, choose a reservation time, submit event details, download a generated approval letter, upload a signed letter, upload a payment receipt only after document approval for paid facilities, request cancellation when needed, and submit one non-editable review after a completed reservation.

Assigned TU/staff will manage their facilities, facility images, open hours, blackout periods, reservation verification queues, document approvals, payment approvals, cancellation requests, facility reviews, and facility statistics. Super Admin will manage users, facility assignments, categories, organization units, settings, audit logs, review moderation, and optional system status.

The system will enforce reservation rules centrally: 5-minute time increments, 1-hour minimum duration, 14-day minimum booking lead time, 60-day maximum advance booking, no cross-midnight reservations, Asia/Jakarta business timezone, conflict prevention, document/payment deadlines, and final approval cutoffs.

## User Stories

1. As a student, I want to register with an allowed institutional email domain, so that I can access the reservation system.
2. As a student, I want to log in with email and password, so that I can manage my facility reservations.
3. As a student, I want to complete my profile with full name, NIM, and phone/WhatsApp, so that the system can generate accurate approval letters.
4. As a student, I want to see a catalog of active facilities, so that I can choose a suitable campus facility.
5. As a student, I want to see facility name, location, capacity, category, image, rating, review count, price status, and open-hours summary, so that I can compare options quickly.
6. As a student, I want to open a facility detail page, so that I can inspect more images, description, calendar, contact details, pricing, and availability.
7. As a student, I want to see one cover image in the catalog and multiple images on facility detail, so that I can better understand the facility before booking.
8. As a student, I want to see facility TU contact information, so that I know who to contact when verification is overdue or refund discussion is needed.
9. As a student, I want to see public calendar entries for reserved slots, so that I can understand why a time is unavailable.
10. As a student, I want public calendar entries to show only time range, facility name, activity title, and organization unit, so that reservation transparency does not expose private data.
11. As a student, I want pending held reservations and approved reservations to both block the calendar, so that I do not attempt to book unavailable time.
12. As a student, I want to choose reservation start and end times in 5-minute increments, so that the booking can match real event needs.
13. As a student, I want the system to reject reservations shorter than one hour, so that invalid facility usage requests are prevented.
14. As a student, I want the system to reject cross-midnight reservations, so that the reservation form stays simple and predictable.
15. As a student, I want the system to reject reservations less than 14 days before start time, so that staff have enough time to verify documents and payment.
16. As a student, I want the system to reject reservations more than 60 days in advance, so that facility slots are not held too far into the future.
17. As a student, I want to choose a time first and enter event details on a separate page, so that the reservation workflow is easier to follow.
18. As a student, I want to enter activity title, event description, participant count, organization unit, and contact phone, so that TU can evaluate the event.
19. As a student, I want to select organization unit from a managed list, so that my reservation uses consistent campus terminology.
20. As a student, I want to be warned that activity title and organization unit are visible on the public calendar, so that I understand what information becomes public.
21. As a student, I want the system to generate a reservation code, so that my reservation can be referenced in letters and staff workflows.
22. As a student, I want the system to generate a prefilled approval letter PDF, so that I do not need to manually create the document.
23. As a student, I want the approval letter to include reservation code, identity, facility, schedule, organization unit, activity title, event description, participant count, responsibility statement, signature areas, TU contact, and internal QR/link, so that the offline approval process has complete information.
24. As a student, I want to download the generated approval letter multiple times, so that I can recover it if needed.
25. As a student, I want to upload a signed approval letter only after the system has generated the letter, so that the uploaded document matches the reservation.
26. As a student, I want to upload signed approval letters as PDF, JPG, JPEG, or PNG up to 5 MB, so that scanned or photographed documents are supported.
27. As a student, I want to see my document upload deadline, so that I know when the reservation will expire if I do not act.
28. As a student, I want the reservation to be rejected with a reason if TU rejects my signed letter, so that I understand why I must create a new reservation.
29. As a student, I want payment instructions to stay hidden until my letter is approved, so that I do not pay too early.
30. As a student, I want paid facilities to show general price information before document approval, so that I know the cost before reserving.
31. As a student, I want to open a separate payment page after document approval, so that payment upload is clearly separated from letter upload.
32. As a student, I want to upload a payment receipt screenshot or photo as JPG, JPEG, or PNG up to 5 MB, so that TU can verify my offline payment.
33. As a student, I want the system to reject payment upload before payment is allowed, so that I cannot submit invalid workflow data.
34. As a student, I want free facility reservations to skip payment after document approval, so that unnecessary payment steps are avoided.
35. As a student, I want my reservation to become approved after all required verification is complete, so that I know the facility is formally allocated.
36. As a student, I want my approved reservation to become completed after the end time, so that I can submit a review.
37. As a student, I want to see all my reservations in a reservation history/list page, so that I can track pending, approved, completed, expired, cancelled, and rejected reservations.
38. As a student, I want a reservation detail page separate from the letter page, so that status/deadlines and document handling are not mixed.
39. As a student, I want to cancel immediately before approval, so that I can release the slot if I no longer need it.
40. As a student, I want to request cancellation after approval with a reason, so that TU can review the cancellation.
41. As a student with a paid approved reservation, I want to see a warning that refunds are handled outside the system, so that I know to contact TU directly.
42. As a student, I want the slot to remain reserved while cancellation is pending, so that the booking is not released until TU approves cancellation.
43. As a student, I want to be notified when document verification is overdue, so that I know to contact TU if needed.
44. As a student, I want TU contact information visible when verification is overdue, so that I can follow up outside the system.
45. As a student, I want in-app notifications for reservation events, so that I can track actions and decisions inside the app.
46. As a student, I want to submit one review after a completed reservation, so that I can share feedback on the facility.
47. As a student, I want to give a 1-5 rating and optional comment, so that my review is structured and useful.
48. As a student, I want to be warned that reviews cannot be edited after submission, so that I review carefully before submitting.
49. As a student, I want to delete my review later, so that I can remove feedback I no longer want public.
50. As a student, I want deleted reviews excluded from public lists and averages, so that facility ratings reflect visible reviews.
51. As a staff user, I want to log in to a staff account created by admin, so that facility management access is controlled.
52. As a staff user, I want access only to assigned facilities, so that student and payment data are scoped correctly.
53. As a staff user, I want to manage assigned facility profile, category, images, pricing, payment instructions, contact details, and active status, so that facility information stays current.
54. As a staff user, I want to configure open hours, so that reservation availability follows facility operations.
55. As a staff user, I want to add blackout periods, so that maintenance, holidays, or special closures block new reservations.
56. As a staff user, I want deactivating a facility to prevent new reservations without deleting history, so that historical data remains intact.
57. As a staff user, I want deactivating a facility not to auto-cancel existing reservations, so that operational changes are explicit.
58. As a staff user, I want a reservation queue filtered by status and facility, so that I can focus on pending verification work.
59. As a staff user, I want a staff reservation detail page, so that I can inspect full private reservation data.
60. As a staff user, I want a separate document review page, so that document decisions are focused and auditable.
61. As a staff user, I want to compare the signed letter manually against generated letter metadata, so that I can verify correctness.
62. As a staff user, I want to approve a signed letter for a free facility and move the reservation to approved, so that valid free reservations complete verification.
63. As a staff user, I want to approve a signed letter for a paid facility and open payment, so that students only pay after document approval.
64. As a staff user, I want to reject a signed letter with a required reason, so that students understand the rejection.
65. As a staff user, I want a separate payment review page, so that receipt verification is focused and auditable.
66. As a staff user, I want to approve a receipt and complete paid verification, so that paid reservations can become approved.
67. As a staff user, I want to reject a receipt with a required reason, so that students understand why a new reservation is needed.
68. As a staff user, I want overdue verification notifications, so that I can act immediately when deadlines are missed.
69. As a staff user, I want overdue staff-caused verification to preserve the slot until the applicable cutoff, so that students are not punished for staff delay.
70. As a staff user, I want to approve or reject post-approval cancellation requests, so that facility allocation changes stay controlled.
71. As a staff user, I want cancellation rejection reasons to be required, so that students understand the decision.
72. As a staff user, I want to see facility reviews, so that I understand user feedback.
73. As a staff user, I want facility statistics such as monthly reservations, status counts, utilization hours, paid revenue, average rating, and recent reviews, so that I can monitor facility operations.
74. As a staff user, I do not want to edit, delete, reply to, or moderate reviews, so that review governance remains clear.
75. As a Super Admin, I want to manage users and deactivate accounts, so that access can be controlled without deleting history.
76. As a Super Admin, I want inactive users blocked from login and refresh tokens, so that deactivated accounts cannot access the system.
77. As a Super Admin, I want to manage staff-facility assignments, so that staff access and notifications are facility-specific.
78. As a Super Admin, I want to manage facility categories, so that facility catalog filtering and organization remain consistent.
79. As a Super Admin, I want to manage organization units, so that student reservations use consistent organizer data.
80. As a Super Admin, I want to manage booking/deadline settings, so that operational timing rules can change without code changes.
81. As a Super Admin, I want to manage allowed student email domains, so that self-registration can be constrained for MVP.
82. As a Super Admin, I want to view and manage all reservations, so that I can resolve escalations across facilities.
83. As a Super Admin, I want to view all reviews, so that I can moderate inappropriate content.
84. As a Super Admin, I want to soft-delete reviews with a reason, so that moderation is transparent and reversible.
85. As a Super Admin, I want to restore deleted reviews, so that moderation mistakes can be corrected.
86. As a Super Admin, I want students to see when their review was removed by admin and why, so that moderation decisions are transparent.
87. As a Super Admin, I want to view audit logs with filters, so that important system actions are traceable.
88. As a Super Admin, I want an optional read-only system status page, so that I can check backend, database, storage, build, and worker health.
89. As the system, I want to enforce reservation conflicts in the backend and database, so that simultaneous overlapping submissions cannot double-book a facility.
90. As the system, I want to consider open hours, blackout periods, and active blocking reservations during availability checks, so that only valid slots can be reserved.
91. As the system, I want to store timestamps in UTC and evaluate business rules in Asia/Jakarta, so that scheduling is consistent.
92. As the system, I want to expire reservations when students miss upload deadlines, so that abandoned held slots are released.
93. As the system, I want to mark staff verification as overdue when staff miss verification deadlines, so that staff and students can react.
94. As the system, I want to allow a 4-day final approval cutoff only when staff caused overdue verification, so that student-caused delay does not bypass the normal 7-day cutoff.
95. As the system, I want to persist completed status after reservation end time while also treating approved past reservations as effectively completed, so that review eligibility does not depend on worker timing.
96. As the system, I want to create in-app notifications synchronously during important service transitions, so that users receive timely updates.
97. As the system, I want to protect private files with authorization and signed URLs, so that letters and receipts are not publicly exposed.
98. As the system, I want to keep facility images public, so that catalog and detail pages load efficiently.
99. As the system, I want to store random storage keys and metadata instead of trusting original filenames, so that file handling is safer.
100. As the development team, I want implementation to use TDD vertical slices, so that complex workflow behavior is verified through public interfaces as it is built.

## Implementation Decisions

- Build a desktop-first React frontend with Tailwind CSS and a small internal component set for buttons, inputs, selects, dialogs, tables, tabs, badges, upload fields, calendars, and status timelines.
- Use proven date/calendar libraries during implementation when needed, such as a calendar component for facility calendars and a date-time utility for formatting and validation.
- Use Bahasa Indonesia for user-facing UI copy, notifications, validation messages, and generated approval letters.
- Keep backend code identifiers, enum values, database columns, and API contracts in English.
- Use FastAPI, SQLAlchemy, Alembic, PostgreSQL, and Pydantic for the backend.
- Use Alembic for all database schema migrations.
- Use UUID primary keys for externally referenced entities and a human-readable reservation code for operational use.
- Use email/password authentication for MVP.
- Allow student self-registration without email verification, constrained by allowed institutional email domains in settings.
- Keep staff and Super Admin accounts admin-created only.
- Use three roles for MVP: student, staff, and super_admin.
- Use facility-specific staff assignment through a many-to-many relationship between facilities and staff users.
- Scope staff permissions and notifications to assigned facilities; Super Admin can access all facilities.
- Use `is_active` instead of hard deletes for domain records.
- Do not automatically cancel existing reservations when a facility or student is deactivated.
- Model facility categories as managed records, with a single category per facility for MVP.
- Model organization units as managed records representing faculties, departments, student organizations, committees, or other campus units.
- Require students to choose organization units from the managed list; no student-created organization units in MVP.
- Store facility images in a separate image entity with exactly one active cover image per facility.
- Use public storage URLs/CDN for facility images.
- Use private object storage for generated letters, signed letters, and receipts.
- Use a storage service abstraction with local development and S3-compatible production implementations.
- Upload files through FastAPI for MVP.
- Return short-lived signed URLs for private downloads after backend authorization.
- Validate file MIME type, extension, size, random storage keys, and metadata for every upload purpose.
- Use a 5 MB default limit for signed letters and receipts.
- Generate one prefilled approval letter PDF per reservation and allow repeated downloads.
- Require signed letter upload to use the generated approval letter as the source.
- Use manual TU verification for signed letters and receipts.
- Keep approval document and payment as separate domain records because payment must be gated behind approval-letter acceptance.
- Show payment instructions only after document approval for paid facilities.
- Use flat facility price per reservation for MVP and snapshot total price onto the reservation.
- Store money as integer Rupiah and display as Indonesian Rupiah.
- Do not support add-ons in MVP.
- Enforce 5-minute time increments, 1-hour minimum duration, same-day reservations, no cross-midnight reservations, 14-day minimum lead time, and 60-day maximum advance booking.
- Use Asia/Jakarta as the business timezone and UTC for persisted timestamps.
- Enforce conflict prevention in backend/database, ideally with PostgreSQL exclusion constraints for active blocking reservations.
- Availability checks must consider open hours, blackout periods, and active blocking reservations.
- Use workflow-specific endpoints for reservation state changes rather than a generic update endpoint.
- Split reservation detail, approval-letter workflow, and payment workflow into separate frontend pages and backend APIs.
- Use in-app notifications only for MVP, with read/unread tracking.
- Send staff notifications to facility-assigned staff plus Super Admin.
- Use a background worker/scheduler for expiration, overdue verification, final cutoff expiration, and persisted completion.
- Treat approved reservations with past end time as effectively completed even if worker has not persisted completion.
- Allow immediate student cancellation before approval.
- Use cancellation request/review for approved reservations.
- Show paid-reservation refund warning during cancellation requests; refunds are handled outside the system by contacting TU.
- Allow reviews only for completed, non-cancelled reservations owned by the student.
- Use one review per completed reservation, 1-5 integer rating, optional comment, no edits, and soft delete.
- Give Super Admin limited review moderation via soft delete and restore, with required deletion reason and no content editing.
- Store lightweight audit logs for important workflow actions and expose them to Super Admin only.
- Use layered backend modules: models, schemas, repositories, services, API routes, core, storage, PDF generation, notifications, and workers.
- Keep route handlers thin; put workflow transitions, deadline checks, role checks, and business rules in services.
- Use repositories for persistence access and let services work with ORM models pragmatically.
- Introduce deep, testable modules for `ReservationStateMachine`, `BookingPolicy`, `DeadlinePolicy`, `StorageService`, `NotificationService`, and approval-letter generation.
- Store deadline and booking settings in `SystemSetting`, exposed through a typed settings service/object.
- Store duration settings internally as hours, even if the admin UI presents days.
- Deploy frontend on Vercel, backend/API on Railway, PostgreSQL on Railway or managed PostgreSQL, and files on S3-compatible object storage.

## Testing Decisions

- Implementation must always use TDD, following a vertical red-green-refactor loop.
- Do not create a broad test plan before implementation; define the next behavior test at the start of each implementation slice.
- Good tests should verify external behavior through public service/API interfaces rather than private implementation details.
- Tests should read like behavioral specifications and survive internal refactors.
- Avoid horizontal test writing where all tests are written before any implementation.
- Prioritize behavior tests around deep modules and critical workflow boundaries when implementation begins.
- Modules expected to receive focused tests during implementation include reservation creation, availability/conflict prevention, reservation state transitions, booking/deadline policy, approval-letter workflow, payment workflow, cancellation workflow, review eligibility, staff scoping, notifications, storage authorization, and background deadline processing.
- There is no existing application test suite in the repository yet; prior art is limited to the repo-level TDD instruction.

## Out of Scope

- SSO.
- Email verification.
- Payment gateway integration.
- Refund handling inside the system.
- Add-ons.
- Mobile-first optimization.
- Email, WhatsApp, push, or SMS notifications.
- OCR or automatic receipt validation.
- Automated signed-letter comparison.
- Staff replies to reviews.
- User impersonation.
- Hard deletes for domain records.
- Public QR verification links.
- Advanced observability dashboards.
- Duration-based pricing.
- Revision flow for rejected documents or payments.
- Student-created organization units.
- Multi-role users.
- Complex recurring availability exceptions.
- Antivirus scanning for uploads.
- Full cached analytics/aggregates unless performance requires them later.

## Further Notes

- The current repository is documentation-only. The refined plan exists as the source of truth for MVP behavior and architecture.
- `AGENTS.md` defines the standing implementation rule that all future coding work must use TDD.
- The PRD is intended to enter triage as a product-level MVP issue before being split into independently implementable issues.
- UI should be desktop-first, with enough baseline responsiveness to avoid broken layouts on smaller screens.
- User-facing Indonesian copy should be written formally enough for campus administration, especially in approval letters and official workflow messages.
