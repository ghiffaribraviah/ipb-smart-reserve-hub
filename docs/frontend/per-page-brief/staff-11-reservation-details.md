# Staff 11 Reservation Details

## Reference

- HTML: `docs/frontend/html-reference/Admin - 11 - Reservation Details.html`
- Desktop screenshot: `docs/frontend/screenshots/admin-11-reservation-details-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/admin-11-reservation-details-mobile.png`
- Reference label: `Admin - 11 - Reservation Details`

## Route Contract

- Proposed route: `/staff/reservations/:reservationId`
- Auth/role: `staff`
- Unauthorized behavior: deny unassigned reservation access.
- Redirect behavior: review actions stay on detail or return to list after success.

## Purpose

- User job: inspect reservation details/documents/receipts and approve or reject document/payment workflow steps.
- Entry points: staff home/list/schedule.
- Exit points: staff list and document/payment review actions.

## Design Contract

- Layout: staff shell detail page with reservation info, shared document rows, summary sidebar, and decision panel.
- Desktop behavior: dense operational sections with clear action hierarchy.
- Mobile behavior: stacked cards; shared document rows move status/actions below metadata.
- Required copy/status labels: preserve verification action labels and rejection reason patterns.
- Status semantics: `Status Saat Ini` shows the whole reservation's staff-facing status using the same mapper as staff home/list/schedule. Stage-level `pending_review` values must keep their context (`Menunggu Verifikasi Dokumen` or `Menunggu Verifikasi Pembayaran`) instead of the generic `Menunggu Peninjauan`.
- Source-of-truth notes: document rows use shared `doc-row` anatomy; decision actions must be visually distinct without heavy destructive styling except true rejection.

## UX Behavior

- Primary actions: approve or reject current review item.
- Secondary actions: download signed letter/receipt, back to list.
- Loading state: detail skeleton.
- Empty state: missing document/receipt hides unavailable action.
- Error state: access denied/not found.
- Disabled state: review actions disabled while submitting or when state no longer reviewable.

## Accessibility

- Download links require explicit file/action labels.
- Approve/reject controls must be keyboard reachable.
- Rejection reason field must be labelled and error-associated.
- Status is text-readable.

## Data And Fixture Contract

- Deterministic fixture requirements: document review, payment review, and read-only cancelled detail variants.
- Real entities: Staff reservation detail read model and document/payment review mutation responses.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed: `GET /staff/reservations/:reservationId`; existing approve/reject/download endpoints for document/payment. Cancellation review endpoints are legacy and not surfaced as integrated UI actions.
- Page-needed fields: reservation detail, student/org/facility including `facility.cover_image_url`, submitted files, signed document history via `document.signed_approval_letters[]` with per-file `download_url`, latest signed document via `document.signed_approval_letter`, payment receipt, cancellation reason when present, workflow status and reasons.
- Auth/session assumptions: staff assigned facility access only.
- Source files: `backend/app/api/routes/approval_letter_routes.py`, `backend/app/api/routes/payment_routes.py`, `backend/app/api/routes/reservation_routes.py`.

### BG-STAFF-11-01: Staff Reservation Detail Read Model

- Status: `resolved`
- Domain area: Staff Operations
- Affected UI: staff reservation detail and decision panel.
- Contract implemented: assigned-staff reservation detail endpoint that pairs with existing review mutation endpoints, exposes the assigned facility cover image for the detail sidebar, and returns all student-uploaded signed approval letter versions for staff review/download.
- Evidence: `backend/app/api/routes/staff_reservation_operation_routes.py` registers `GET /staff/reservations/{reservation_id}`; `backend/app/api/routes/approval_letter_routes.py` registers per-version staff signed-letter downloads; `backend/tests/test_staff_reservation_operations.py` verifies assigned detail access, facility `cover_image_url`, null missing file metadata, payment receipt metadata, unassigned denial, and non-staff denial; `backend/tests/test_approval_letter_workflow.py` verifies staff detail exposes and downloads older signed approval letter uploads after student re-upload.
- Source issue/PRD: `docs/issues/ISSUE-0009-signed-letter-upload-and-staff-document-review.md`, `docs/issues/ISSUE-0010-paid-facility-receipt-upload-and-payment-review.md`, `docs/issues/ISSUE-0013-cancellation-workflow.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-staff-shell.md`
- `docs/frontend/per-component-brief/document-status-panel.md`
- `docs/frontend/per-component-brief/review-decision-panel.md`
- `docs/frontend/per-component-brief/review-decision-dialog.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: approve/reject actions update state and preserve ownership/access behavior.

## Open Questions

- None.
