# Student 08 Reservation Accepted

## Reference

- HTML: `docs/frontend/html-reference/Student - 08 - Reservation Accepted.html`
- Desktop screenshot: `docs/frontend/screenshots/student-08-reservation-accepted-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-08-reservation-accepted-mobile.png`
- Reference label: `Student - 08 - Reservation Accepted`

## Route Contract

- Proposed route: `/student/reservations/:reservationId/accepted`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: CTA opens `/student/reservations/:reservationId`.

## Purpose

- User job: confirm final approval and know the reservation is active.
- Entry points: document approval for free reservation, payment approval for paid reservation.
- Exit points: reservation detail, reservation list.

## Design Contract

- Layout: centered success status card and reservation summary.
- Desktop behavior: compact success panel.
- Mobile behavior: full-width CTA and wrapped summary rows.
- Required copy/status labels: preserve `Disetujui`/accepted copy.
- Source-of-truth notes: green success state continues reservation workflow visual rhythm.

## UX Behavior

- Primary actions: view reservation detail.
- Secondary actions: return to reservation list.
- Loading state: status skeleton.
- Empty state: not applicable.
- Error state: reservation not found/unauthorized.
- Disabled state: none.

## Accessibility

- Success state must be communicated through text.
- CTA must be keyboard reachable.
- Summary labels and values must wrap.

## Data And Fixture Contract

- Deterministic fixture requirements: approved reservation summary.
- Real entities: StudentReservation approved projection.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`.
- Page-needed fields: `status=approved`, facility, organization unit, starts/ends, price, document/payment approved projections.
- Auth/session assumptions: student-owned reservation only.
- Source files: `app/api/routes/reservation_routes.py`, `app/schemas/reservation_schemas.py`.

### BG-STUDENT-08-01: Accepted Reservation Projection

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: accepted success page.
- Contract needed: approved reservation response with document/payment projection sufficient to route to active state.
- Evidence: `GET /student/reservations/{reservation_id}` returns `StudentReservationResponse` with status and workflow projections.
- Source issue/PRD: `docs/issues/ISSUE-0027-student-reservation-workflow-projections.md`.

## Shared Components

- `docs/frontend/per-component-brief/reservation-status-panel.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: approved status routes here after final workflow approval.

## Open Questions

- None.

