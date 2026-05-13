# Staff 10 Reservation Lists

## Reference

- HTML: `docs/frontend/html-reference/Admin - 10 - Reservation Lists.html`
- Desktop screenshot: `docs/frontend/screenshots/admin-10-reservation-lists-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/admin-10-reservation-lists-mobile.png`
- Reference label: `Admin - 10 - Reservation Lists`

## Route Contract

- Proposed route: `/staff/reservations`
- Auth/role: `staff`
- Unauthorized behavior: redirect to login or role landing.
- Redirect behavior: row/card action opens `/staff/reservations/:reservationId`.

## Purpose

- User job: browse assigned-facility reservations and pick an item to review/inspect.
- Entry points: staff shell reservation nav.
- Exit points: staff reservation detail.

## Design Contract

- Layout: staff shell with reservation table/cards and status filters.
- Desktop behavior: dense table with action column.
- Mobile behavior: cards with status/action controls.
- Required copy/status labels: preserve Indonesian status and action labels.
- Source-of-truth notes: mobile card conversion must avoid table horizontal scroll.

## UX Behavior

- Primary actions: open reservation detail.
- Secondary actions: filter/search.
- Loading state: table skeleton.
- Empty state: no reservations for filter.
- Error state: retry list.
- Disabled state: action disabled when item becomes inaccessible.

## Accessibility

- Table headers/card labels are required.
- Status text must be visible.
- Filter controls must have labels.

## Data And Fixture Contract

- Deterministic fixture requirements: mixed staff-visible statuses and facilities.
- Real entities: Staff reservation list read model.
- Fixture media: optional facility thumbnails.

## Backend Integration And Gaps

- Endpoints consumed: `GET /staff/reservations`.
- Page-needed fields: reservation ID/code, student, organization, facility, date/time, lifecycle status, document/payment/cancellation review status, due dates.
- Auth/session assumptions: assigned facilities only.
- Source files: `app/api/routes/reservation_routes.py`, `app/api/routes/approval_letter_routes.py`, `app/api/routes/payment_routes.py`.

### BG-STAFF-10-01: Staff Reservation List Read Model

- Status: `resolved`
- Domain area: Staff Operations
- Affected UI: staff reservation list.
- Contract implemented: assigned-staff reservation list endpoint with filters for status, Facility, and date range.
- Evidence: `app/api/routes/staff_reservation_operation_routes.py` registers `GET /staff/reservations`; `tests/test_staff_reservation_operations.py` verifies assigned-facility scoping, status/facility/date filters, lifecycle status, and document/payment/cancellation projections.
- Source issue/PRD: `docs/issues/ISSUE-0009-signed-letter-upload-and-staff-document-review.md`, `docs/issues/ISSUE-0010-paid-facility-receipt-upload-and-payment-review.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-staff-shell.md`
- `docs/frontend/per-component-brief/staff-reservation-review-table.md`
- `docs/frontend/per-component-brief/mobile-card-list.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: list excludes unassigned facilities.

## Open Questions

- None.
