# Student 10 Reservation List

## Reference

- HTML: `docs/frontend/html-reference/Student - 10 - Reservation List.html`
- Desktop screenshot: `docs/frontend/screenshots/student-10-reservation-list-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-10-reservation-list-mobile.png`
- Reference label: `Student - 10 - Reservation List`

## Route Contract

- Proposed route: `/student/reservations`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: list card actions route to the correct workflow/detail page based on projections.

## Purpose

- User job: view current and historical reservations and continue the correct next action.
- Entry points: student shell nav, status pages, detail pages.
- Exit points: verification/payment/detail/review pages.

## Design Contract

- Layout: Student shell with reservation card list, status badges, image thumbnails, action area.
- Desktop behavior: horizontal image/content/action cards.
- Mobile behavior: stacked cards with readable status pills.
- Required copy/status labels: `Disetujui`, `Menunggu Pembayaran`, `Menunggu Verifikasi Dokumen`, `Selesai`, `Ditolak`, `Dibatalkan`.
- Source-of-truth notes: terminal cards do not show cancellation actions.

## UX Behavior

- Primary actions: continue workflow or use `Lihat Detail` for reservation detail/status navigation.
- Secondary actions: cancellation where eligible.
- Loading state: stable card skeleton.
- Empty state: empty reservation list prompt to browse facilities.
- Error state: retry reservation list.
- Disabled state: actions omitted when unavailable.

## Accessibility

- Each card needs a clear heading/link.
- Status badges include text and do not rely on color alone.
- Action buttons must remain reachable on mobile.
- Long status labels wrap inside constrained badges.

## Data And Fixture Contract

- Deterministic fixture requirements: mixed statuses and terminal/history examples.
- Real entities: StudentReservation list projections.
- Fixture media: facility thumbnails.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations`, cancellation endpoints when actions are implemented.
- Page-needed fields: reservation status, facility, date/time, price, document/payment/rejection projections, cancellation fields, review presence.
- Auth/session assumptions: student-owned list only.
- Source files: `app/api/routes/reservation_routes.py`, `app/schemas/reservation_schemas.py`.

### BG-STUDENT-10-01: Student Reservation List Projections

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: reservation card routing, status badges, card actions.
- Contract needed: list response includes document/payment/rejection/cancellation/review projections.
- Evidence: `GET /student/reservations` returns `list[StudentReservationResponse]`; schema includes workflow projections and cancellation/review fields.
- Source issue/PRD: `docs/issues/ISSUE-0027-student-reservation-workflow-projections.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-student-shell.md`
- `docs/frontend/per-component-brief/reservation-list-card.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: each projection maps to the intended route/action.

## Open Questions

- Cancellation pending/rejected states are referenced in `docs/frontend/html-reference/Student - 13 - Cancellation Request.html`; overdue/expired state references are in `docs/frontend/html-reference/Shared - 02 - Data And Auth States.html`.
