# Student 11 Reservation Details Accepted

## Reference

- HTML: `docs/frontend/html-reference/Student - 11 - Reservation Details (ACCEPTED).html`
- Desktop screenshot: `docs/frontend/screenshots/student-11-reservation-details-accepted-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-11-reservation-details-accepted-mobile.png`
- Reference label: `Student - 11 - Reservation Details (ACCEPTED)`

## Route Contract

- Proposed route: `/student/reservations/:reservationId`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: `Ajukan Pembatalan` opens cancellation request flow; document links download private files.

## Purpose

- User job: inspect an approved reservation, reopen documents/receipts, and request cancellation if allowed.
- Entry points: reservation list, accepted page.
- Exit points: cancellation request, file downloads, list.

## Design Contract

- Layout: facility heading, metadata, gallery/detail cards, document section, action area.
- Desktop behavior: asymmetric gallery and information cards.
- Mobile behavior: stacked gallery, wrapped document rows, full-width actions.
- Required copy/status labels: preserve `Ajukan Pembatalan`, `Dokumen Reservasi`, `Terverifikasi`.
- Source-of-truth notes: document rows must not overflow on mobile.

## UX Behavior

- Primary actions: request cancellation.
- Secondary actions: download/view documents and receipt.
- Loading state: detail skeleton with stable gallery/card dimensions.
- Empty state: missing optional files are omitted rather than faked.
- Error state: not-found/ownership failure.
- Disabled state: cancellation action hidden or disabled when not eligible.

## Accessibility

- Document download links must name the file/action.
- Gallery images need alt text.
- Status badges need text.
- Cancellation action must not rely on color alone to communicate risk.

## Data And Fixture Contract

- Deterministic fixture requirements: approved reservation with generated letter, signed letter, optional payment receipt.
- Real entities: StudentReservation detail and private file downloads.
- Fixture media: facility gallery.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`, private file download endpoints, cancellation request endpoint.
- Page-needed fields: detail fields, document/payment metadata, cancellation fields, review presence.
- Auth/session assumptions: student-owned reservation/files only.
- Source files: `app/api/routes/reservation_routes.py`, `app/api/routes/approval_letter_routes.py`, `app/api/routes/payment_routes.py`.

### BG-STUDENT-11-ACCEPTED-01: Approved Detail And Private File Actions

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: approved detail documents and cancellation action.
- Contract needed: detail projection plus student-owned download endpoints for generated/signed letter and receipt.
- Evidence: detail route and student-owned private file download routes exist in route files; metadata exists in `StudentReservationResponse`.
- Source issue/PRD: `docs/issues/ISSUE-0028-student-owned-private-file-downloads.md`, `docs/issues/ISSUE-0013-cancellation-workflow.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-student-shell.md`
- `docs/frontend/per-component-brief/document-status-panel.md`
- `docs/frontend/per-component-brief/facility-gallery.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: missing metadata hides download action; owner checks are handled as not found.

## Open Questions

- Cancellation confirmation design is tracked in `missing-design.md`.

