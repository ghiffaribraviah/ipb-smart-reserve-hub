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
- Redirect behavior: `Lanjut ke Pembayaran` opens payment upload when a paid reservation still requires payment; `Ajukan Pembatalan` opens cancellation request flow; document links download private files.

## Purpose

- User job: inspect an approved reservation, reopen documents/receipts, and request cancellation if allowed.
- Entry points: reservation list, accepted page.
- Exit points: payment upload, cancellation request, file downloads, list.

## Design Contract

- Layout: facility heading, metadata, gallery/detail cards, document section, notice, and lower action area.
- Desktop behavior: asymmetric gallery and information cards.
- Mobile behavior: stacked gallery, wrapped document rows, full-width actions.
- Required copy/status labels: preserve `Ajukan Pembatalan`, `Dokumen Reservasi`, `Terverifikasi`.
- When the reservation is approved, hide the generated template approval letter row from the document list and emphasize the signed approval letter as the visible proof document with a clear stamped/verified treatment.
- Source-of-truth notes: document rows use shared `doc-row` anatomy and must not overflow on mobile.

## UX Behavior

- Primary actions: continue to payment when payment is still due; request cancellation from the lower content action area.
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

- Deterministic fixture requirements: approved reservation with generated letter, signed letter, optional payment receipt, and facility cover image.
- Real entities: StudentReservation detail and private file downloads.
- Facility media: render `facility.cover_image_url` from the reservation detail projection when present; use deterministic fixture media only as a no-image fallback.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`, private file download endpoints, cancellation request endpoint.
- Page-needed fields: detail fields, `facility.cover_image_url`, document/payment metadata, cancellation fields, review presence.
- Auth/session assumptions: student-owned reservation/files only.
- Source files: `backend/app/api/routes/reservation_routes.py`, `backend/app/api/routes/approval_letter_routes.py`, `backend/app/api/routes/payment_routes.py`.

### BG-STUDENT-11-ACCEPTED-01: Approved Detail And Private File Actions

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: approved detail documents and cancellation action.
- Contract needed: detail projection with facility cover image plus student-owned download endpoints for generated/signed letter and receipt.
- Evidence: detail route and student-owned private file download routes exist in route files; metadata and `facility.cover_image_url` exist in `StudentReservationResponse`.
- Source issue/PRD: `docs/issues/ISSUE-0028-student-owned-private-file-downloads.md`, `docs/issues/ISSUE-0013-cancellation-workflow.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-student-shell.md`
- `docs/frontend/per-component-brief/document-status-panel.md`
- `docs/frontend/per-component-brief/facility-gallery.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: missing metadata hides download action; owner checks are handled as not found.

## Open Questions

- Cancellation request visual reference is now `docs/frontend/html-reference/Student - 13 - Cancellation Request.html`.
