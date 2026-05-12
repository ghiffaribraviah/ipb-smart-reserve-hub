# Staff 00 Home

## Reference

- HTML: `docs/frontend/html-reference/Admin - 00 - Home.html`
- Desktop screenshot: `docs/frontend/screenshots/admin-00-home-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/admin-00-home-mobile.png`
- Reference label: `Admin - 00 - Home`

## Route Contract

- Proposed route: `/staff`
- Auth/role: `staff`
- Unauthorized behavior: redirect to login; reject student/super-admin roles.
- Redirect behavior: queue/detail links stay under `/staff`.

## Purpose

- User job: review operational reservations needing document/payment/cancellation action.
- Entry points: staff login landing, staff shell nav.
- Exit points: staff reservation detail, facility list.

## Design Contract

- Layout: staff/admin shell with fixed header, queue-focused content, verification actions.
- Desktop behavior: dense operational list/table/card layout.
- Mobile behavior: table-like data converts to readable cards.
- Required copy/status labels: preserve reference use of `Reservasi`, `Fasilitas`, `Verifikasi`.
- Source-of-truth notes: reference says Admin visually, but internal docs/routes use staff.

## UX Behavior

- Primary actions: open reservation verification detail.
- Secondary actions: search/filter queue.
- Loading state: queue skeleton.
- Empty state: no pending verification state.
- Error state: retry queue load.
- Disabled state: action unavailable when reservation no longer reviewable.

## Accessibility

- Queue rows/cards need clear headings and action labels.
- Status labels must be text, not color-only.
- Mobile cards must keep action buttons reachable.

## Data And Fixture Contract

- Deterministic fixture requirements: mixed pending document/payment/cancellation queue items.
- Real entities: Staff reservation review queue/read model.
- Fixture media: facility thumbnails if present in reference.

## Backend Integration And Gaps

- Endpoints consumed: proposed staff queue endpoint; currently no direct staff reservation list/read-model endpoint was found.
- Page-needed fields: reservation ID/code, facility, student/organization, date/time, workflow type, status, due time, assigned facility scope.
- Auth/session assumptions: staff sees only assigned-facility reservations.
- Source files: `app/api/routes/approval_letter_routes.py`, `app/api/routes/payment_routes.py`, `app/api/routes/reservation_routes.py`.

### BG-STAFF-00-01: Staff Verification Queue

- Status: `open`
- Domain area: Staff Operations
- Affected UI: staff home verification queue.
- Contract needed: assigned-staff read model for pending document, payment, and cancellation reviews.
- Evidence: staff approve/reject/download endpoints exist, but no `GET /staff/reservations` or queue endpoint was found in current routes.
- Source issue/PRD: `docs/issues/ISSUE-0009-signed-letter-upload-and-staff-document-review.md`, `docs/issues/ISSUE-0010-paid-facility-receipt-upload-and-payment-review.md`, `docs/issues/ISSUE-0013-cancellation-workflow.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-staff-shell.md`
- `docs/frontend/per-component-brief/staff-reservation-review-table.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: queue only includes assigned facilities and actionable review states.

## Open Questions

- Backend queue endpoint shape must be designed before real integration.

