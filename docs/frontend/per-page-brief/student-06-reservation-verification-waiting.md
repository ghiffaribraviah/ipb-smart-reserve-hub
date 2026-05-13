# Student 06 Reservation Verification Waiting

## Reference

- HTML: `docs/frontend/html-reference/Student - 06 - Reservation Verification (WAITING).html`
- Desktop screenshot: `docs/frontend/screenshots/student-06-reservation-verification-waiting-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-06-reservation-verification-waiting-mobile.png`
- Reference label: `Student - 06 - Reservation Verification (WAITING)`

## Route Contract

- Proposed route: `/student/reservations/:reservationId/verification/waiting`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: detail/list CTAs remain internal.

## Purpose

- User job: understand signed-letter review is pending.
- Entry points: signed letter upload success, reservation list card for waiting review.
- Exit points: reservation list, reservation detail.

## Design Contract

- Layout: reservation workflow stepper plus centered shared status card with reservation summary and waiting state.
- Desktop behavior: compact centered card with generous white space.
- Mobile behavior: stacked summary rows and full-width CTA.
- Required copy/status labels: preserve `Menunggu Verifikasi Dokumen` style copy.
- Source-of-truth notes: waiting state should be calm/neutral, not error-colored.

## UX Behavior

- Primary actions: view reservation detail or return to reservations.
- Secondary actions: none beyond navigation.
- Loading state: status card skeleton.
- Empty state: not applicable.
- Error state: missing reservation uses page-level error.
- Disabled state: no review action available to student.

## Accessibility

- Status must be text-visible and not color-only.
- Summary rows must use readable labels/values.
- CTA must be reachable after status content.

## Data And Fixture Contract

- Deterministic fixture requirements: reservation summary with `pending_document_review`.
- Real entities: StudentReservation document projection.
- Fixture media: none required.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`.
- Page-needed fields: `status`, `document.review_status`, `document.signed_approval_letter`, `document_verification_due_at`, reservation summary.
- Auth/session assumptions: student-owned reservation only.
- Source files: `app/api/routes/reservation_routes.py`, `app/schemas/reservation_schemas.py`.

### BG-STUDENT-06-WAITING-01: Document Waiting Projection

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: waiting verification status page.
- Contract needed: response distinguishes uploaded signed letter waiting review from upload-needed or approved states.
- Evidence: `StudentReservationDocumentProjectionResponse.review_status` and signed-letter metadata exist in `app/schemas/reservation_schemas.py`.
- Source issue/PRD: `docs/issues/ISSUE-0027-student-reservation-workflow-projections.md`.

## Shared Components

- `docs/frontend/per-component-brief/reservation-stepper.md`
- `docs/frontend/per-component-brief/reservation-status-panel.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: only waiting document projection routes here.

## Open Questions

- None.

