# Student 05 Reservation Letter

## Reference

- HTML: `docs/frontend/html-reference/Student - 05 - Reservation Letter.html`
- Desktop screenshot: `docs/frontend/screenshots/student-05-reservation-letter-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-05-reservation-letter-mobile.png`
- Reference label: `Student - 05 - Reservation Letter`

## Route Contract

- Proposed route: `/student/reservations/:reservationId/letter`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: after upload, route to verification waiting page.

## Purpose

- User job: download/generated approval letter, upload signed letter, and continue document verification.
- Entry points: reservation creation success, reservation list/detail when document upload is needed.
- Exit points: verification waiting state, reservation detail.

## Design Contract

- Layout: reservation workflow card rhythm with document instructions, generated-letter action, upload panel, and summary.
- Desktop behavior: main document panel plus side summary.
- Mobile behavior: stacked panels and full-width upload/continue action.
- Required copy/status labels: preserve Indonesian document and upload labels.
- Source-of-truth notes: file rows must wrap long filenames.

## UX Behavior

- Primary actions: upload signed approval letter.
- Secondary actions: download generated letter, replace selected file, go back.
- Loading state: keep selected file visible during upload.
- Empty state: generated letter unavailable shows retry/generate action.
- Error state: file type/size/upload errors near upload control.
- Disabled state: submit disabled until valid file selected.

## Accessibility

- File input must have a visible label.
- Download/upload actions must be keyboard reachable.
- File validation errors must be announced.
- Document metadata must be text-readable.

## Data And Fixture Contract

- Deterministic fixture requirements: reservation summary, generated letter metadata, valid/invalid file examples.
- Real entities: StudentReservation document projection, approval letter metadata, signed letter upload.
- Fixture media: no remote assets.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`, `GET /student/reservations/:reservationId/approval-letter`, `GET /student/reservations/:reservationId/approval-letter/download`, `POST /student/reservations/:reservationId/signed-approval-letter`.
- Page-needed fields: reservation `document.approval_letter`, `document.signed_approval_letter`, `document.review_status`, deadlines, summary fields.
- Auth/session assumptions: student can access only owned reservations/files.
- Source files: `app/api/routes/approval_letter_routes.py`, `app/api/routes/reservation_routes.py`, `app/schemas/reservation_schemas.py`.

### BG-STUDENT-05-01: Approval Letter Generation And Upload

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: generated approval letter row and signed-letter upload panel.
- Contract needed: generate/download approval letter and upload signed approval letter with metadata.
- Evidence: approval letter routes exist in `app/api/routes/approval_letter_routes.py`; metadata schemas exist in `app/schemas/reservation_schemas.py`.
- Source issue/PRD: `docs/issues/ISSUE-0008-generated-approval-letter-download.md`, `docs/issues/ISSUE-0009-signed-letter-upload-and-staff-document-review.md`.

## Shared Components

- `docs/frontend/per-component-brief/file-upload-panel.md`
- `docs/frontend/per-component-brief/document-status-panel.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: successful upload routes to waiting; invalid file shows error without clearing context.

## Open Questions

- Upload progress state is tracked in `missing-design.md`.

