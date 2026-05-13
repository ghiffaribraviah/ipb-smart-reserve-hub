# Student 11 Reservation Details Completed

## Reference

- HTML: `docs/frontend/html-reference/Student - 11 - Reservation Details (COMPLETED).html`
- Desktop screenshot: `docs/frontend/screenshots/student-11-reservation-details-completed-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-11-reservation-details-completed-mobile.png`
- Reference label: `Student - 11 - Reservation Details (COMPLETED)`

## Route Contract

- Proposed route: `/student/reservations/:reservationId`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: `Tulis Ulasan` opens `/student/reservations/:reservationId/review`.

## Purpose

- User job: inspect completed reservation history and submit a review when eligible.
- Entry points: reservation list completed card.
- Exit points: review form, file downloads, list.

## Design Contract

- Layout: completed variant of reservation detail with review CTA.
- Desktop behavior: same detail structure as accepted variant.
- Mobile behavior: stacked detail/cards and full-width review action.
- Required copy/status labels: preserve `Selesai` and `Tulis Ulasan`.
- Source-of-truth notes: completed state should not show cancellation action; document rows use shared `doc-row` anatomy.

## UX Behavior

- Primary actions: write review if no active review exists.
- Secondary actions: document downloads.
- Loading state: detail skeleton.
- Empty state: missing optional files omitted.
- Error state: not-found/ownership failure.
- Disabled state: review action hidden/disabled if review already exists.

## Accessibility

- Review CTA must be reachable and named.
- Document rows must wrap and expose text links.
- Completed status uses text and color.

## Data And Fixture Contract

- Deterministic fixture requirements: completed reservation with no review and completed reservation with existing review for integration tests.
- Real entities: StudentReservation detail and Review.
- Fixture media: facility gallery.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`, private file downloads, review route if CTA follows.
- Page-needed fields: `status=completed`, `review`, document/payment metadata.
- Auth/session assumptions: student-owned reservation only.
- Source files: `app/api/routes/reservation_routes.py`, `app/api/routes/review_routes.py`, `app/schemas/reservation_schemas.py`.

### BG-STUDENT-11-COMPLETED-01: Completed Detail And Review Eligibility

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: completed detail and review CTA.
- Contract needed: completed status and review projection enough to show/hide `Tulis Ulasan`.
- Evidence: `StudentReservationResponse` includes `status` and `review`; `POST /student/reservations/{reservation_id}/review` exists.
- Source issue/PRD: `docs/issues/ISSUE-0014-reviews-and-ratings.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-student-shell.md`
- `docs/frontend/per-component-brief/document-status-panel.md`
- `docs/frontend/per-component-brief/facility-gallery.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: completed without review shows CTA; reviewed state does not invite duplicate review.

## Open Questions

- None.

