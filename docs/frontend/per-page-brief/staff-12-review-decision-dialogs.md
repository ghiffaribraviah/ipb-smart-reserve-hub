# Staff 12 Review Decision Dialogs

## Reference

- HTML: `docs/frontend/html-reference/Admin - 12 - Review Decision Dialogs.html`
- Desktop screenshot: `docs/frontend/screenshots/admin-12-review-decision-dialogs-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/admin-12-review-decision-dialogs-mobile.png`
- Reference label: `Admin - 12 - Review Decision Dialogs`

## Route Contract

- Proposed route: modal state on `/staff/reservations/:reservationId` or dedicated route `/staff/reservations/:reservationId/review-decision`.
- Auth/role: `staff`
- Unauthorized behavior: redirect to login; deny unassigned facility access.
- Redirect behavior: close dialog back to reservation detail after success or cancel.

## Purpose

- User job: approve or reject reservation documents/payment/cancellation decisions with the correct action hierarchy.
- Entry points: staff reservation detail action panel, staff review queues.
- Exit points: reservation detail, staff reservation list.

## Design Contract

- Layout: staff shell with blurred/disabled reservation-detail context and foreground decision dialog.
- Desktop behavior: centered `620px` dialog with summary, reason textarea when rejecting, warning note, and footer actions.
- Mobile behavior: dialog becomes full-width content below the header; footer actions stack full-width.
- Required copy/status labels: preserve `Tolak Dokumen Reservasi`, `Tolak Dokumen`, `Kembali`, and Indonesian rejection reason copy.
- Source-of-truth notes: there is no `Setujui sebagai alternatif`; approval and rejection stay as distinct decisions.

## UX Behavior

- Primary actions: approve selected review item, reject selected review item with reason.
- Secondary actions: close dialog or return to the previous detail page.
- Loading state: footer action becomes disabled while submitting.
- Empty state: not applicable; dialog is only opened with a selected item.
- Error state: show submission error inside the dialog without closing it.
- Disabled state: reject action disabled until required reason is present when the selected decision requires one.

## Accessibility

- Dialog uses `role="dialog"` and an accessible title.
- Close button has an accessible name.
- Rejection reason label is programmatically associated with textarea.
- Focus is trapped in modal implementation and restored to triggering action on close.

## Data And Fixture Contract

- Deterministic fixture requirements: selected reservation summary, selected file/stage, current review status, rejection reason example.
- Real entities: reservation review decision, uploaded document/payment evidence, cancellation request.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed: `GET /staff/reservations/:reservationId` for the detail/read model and its `review_actions`; `POST /staff/reservations/:reservationId/document-review/approve`; `POST /staff/reservations/:reservationId/document-review/reject`; `POST /staff/reservations/:reservationId/payment-review/approve`; `POST /staff/reservations/:reservationId/payment-review/reject`; `POST /staff/reservations/:reservationId/cancellation-review/approve`; `POST /staff/reservations/:reservationId/cancellation-review/reject`.
- Page-needed fields: reservation id, current workflow/review status, selected decision type, optional rejection reason, and `review_actions.{document,payment,cancellation}.{approve_url,reject_url,download_url}` from the staff detail response.
- Auth/session assumptions: staff must be assigned to the facility connected to the reservation.
- Source files: `app/api/routes/approval_letter_routes.py`, `app/api/routes/payment_routes.py`, `app/api/routes/reservation_routes.py`, `app/api/routes/staff_reservation_operation_routes.py`, `app/services/staff_reservation_operations.py`.

### BG-STAFF-12-01: Staff Review Decision Actions

- Status: `resolved`
- Domain area: Staff Operations
- Affected UI: review decision dialog approve/reject actions.
- Contract implemented: staff-scoped approve/reject endpoints for document, payment, and cancellation decisions, including required rejection reason validation and assigned-facility access checks. Frontend should refetch `GET /staff/reservations/:reservationId` after a successful decision to refresh the full detail projection.
- Evidence: route coverage exists in `app/api/routes/approval_letter_routes.py`, `app/api/routes/payment_routes.py`, and `app/api/routes/reservation_routes.py`; staff detail exposes action URLs in `app/services/staff_reservation_operations.py`; `tests/test_payment_workflow.py`, `tests/test_cancellation_workflow.py`, and `tests/test_staff_reservation_operations.py` verify payment/cancellation decisions, required rejection reasons, assigned staff scoping, and review action URL projection.
- Source issue/PRD: `docs/issues/ISSUE-0009-signed-letter-upload-and-staff-document-review.md`, `docs/issues/ISSUE-0010-paid-facility-receipt-upload-and-payment-review.md`, `docs/issues/ISSUE-0013-cancellation-workflow.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-staff-shell.md`
- `docs/frontend/per-component-brief/review-decision-dialog.md`
- `docs/frontend/per-component-brief/review-decision-panel.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`
- `docs/frontend/per-component-brief/ui-button.md`
- `docs/frontend/per-component-brief/ui-form-controls.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Dialog has no `Setujui sebagai alternatif` action.
- Rejection reason validation prevents empty reject submission.
- Mobile dialog and footer actions do not overflow horizontally.

## Open Questions

- None.
