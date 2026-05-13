# Student 06 Reservation Verification Declined

## Reference

- HTML: `docs/frontend/html-reference/Student - 06 - Reservation Verification (DECLINED).html`
- Desktop screenshot: `docs/frontend/screenshots/student-06-reservation-verification-declined-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-06-reservation-verification-declined-mobile.png`
- Reference label: `Student - 06 - Reservation Verification (DECLINED)`

## Route Contract

- Proposed route: `/student/reservations/:reservationId/verification/declined`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: CTA returns to reservations or detail depending reference action.

## Purpose

- User job: understand document rejection reason and terminal reservation state.
- Entry points: reservation list/detail when rejection source is document.
- Exit points: reservation list, facility catalog for a new reservation.

## Design Contract

- Layout: reservation workflow stepper plus centered declined status card with reason and summary.
- Desktop behavior: compact status panel.
- Mobile behavior: reason text wraps inside card; CTA full width.
- Required copy/status labels: preserve declined Indonesian copy and `Ditolak`.
- Source-of-truth notes: use red/declined surface from reference.

## UX Behavior

- Primary actions: return to reservation list or browse facilities.
- Secondary actions: view detail if available.
- Loading state: status skeleton.
- Empty state: missing reason falls back to generic text.
- Error state: missing reservation.
- Disabled state: no resubmission for MVP.

## Accessibility

- Rejection status and reason must be text, not color-only.
- Long rejection reasons must wrap.
- Action order should follow visual order.

## Data And Fixture Contract

- Deterministic fixture requirements: rejected reservation with `rejection.source=document` and reason.
- Real entities: StudentReservation rejection projection.
- Fixture media: none required.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`.
- Page-needed fields: `status=rejected`, `document.review_status`, `document.rejection_reason`, `rejection.source`, `rejection.reason`.
- Auth/session assumptions: student-owned reservation only.
- Source files: `app/api/routes/reservation_routes.py`, `app/schemas/reservation_schemas.py`.

### BG-STUDENT-06-DECLINED-01: Document Declined Projection

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: document declined state page and routing.
- Contract needed: response exposes document rejection source/reason without adding UI-only lifecycle statuses.
- Evidence: `StudentReservationRejectionProjectionResponse` and document projection rejection fields exist in `app/schemas/reservation_schemas.py`.
- Source issue/PRD: `docs/issues/ISSUE-0027-student-reservation-workflow-projections.md`.

## Shared Components

- `docs/frontend/per-component-brief/reservation-stepper.md`
- `docs/frontend/per-component-brief/reservation-status-panel.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: document rejection routes here; payment rejection does not.

## Open Questions

- Resubmission after rejection is out of scope.

