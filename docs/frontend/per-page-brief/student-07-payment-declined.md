# Student 07 Payment Declined

## Reference

- HTML: `docs/frontend/html-reference/Student - 07 - Payment Declined.html`
- Desktop screenshot: `docs/frontend/screenshots/student-07-payment-declined-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-07-payment-declined-mobile.png`
- Reference label: `Student - 07 - Payment Declined`

## Route Contract

- Proposed route: `/student/reservations/:reservationId/payment/declined`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: CTA returns to reservations or facility browsing.

## Purpose

- User job: understand payment rejection reason and terminal reservation state.
- Entry points: reservation list/detail when rejection source is payment.
- Exit points: reservation list, facility catalog.

## Design Contract

- Layout: reservation workflow stepper plus declined status panel with reason and payment/reservation summary.
- Desktop behavior: compact centered status card.
- Mobile behavior: long reason wraps; CTA full width.
- Required copy/status labels: preserve payment declined Indonesian copy.
- Source-of-truth notes: use declined/red surface, not warning/amber.

## UX Behavior

- Primary actions: return to reservation list or browse facilities.
- Secondary actions: view detail if available.
- Loading state: card skeleton.
- Empty state: missing reason falls back to generic declined copy.
- Error state: missing reservation.
- Disabled state: no receipt resubmission for MVP.

## Accessibility

- Rejection reason must be text and not color-only.
- Long filenames/reasons wrap.
- CTA order follows visual reading order.

## Data And Fixture Contract

- Deterministic fixture requirements: rejected paid reservation with `rejection.source=payment`.
- Real entities: StudentReservation payment/rejection projections.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`.
- Page-needed fields: `status=rejected`, `payment.review_status`, `payment.rejection_reason`, `rejection.source`, `rejection.reason`.
- Auth/session assumptions: student-owned reservation only.
- Source files: `app/api/routes/reservation_routes.py`, `app/schemas/reservation_schemas.py`.

### BG-STUDENT-07-DECLINED-01: Payment Declined Projection

- Status: `resolved`
- Domain area: Payment
- Affected UI: payment declined state page and routing.
- Contract needed: response exposes payment rejection source/reason.
- Evidence: payment projection and rejection projection schemas exist in `app/schemas/reservation_schemas.py`.
- Source issue/PRD: `docs/issues/ISSUE-0027-student-reservation-workflow-projections.md`.

## Shared Components

- `docs/frontend/per-component-brief/reservation-stepper.md`
- `docs/frontend/per-component-brief/reservation-status-panel.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: payment rejection routes here; document rejection does not.

## Open Questions

- Resubmission after payment rejection is out of scope.
