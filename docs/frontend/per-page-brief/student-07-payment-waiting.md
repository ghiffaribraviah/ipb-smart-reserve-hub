# Student 07 Payment Waiting

## Reference

- HTML: `docs/frontend/html-reference/Student - 07 - Payment Waiting.html`
- Desktop screenshot: `docs/frontend/screenshots/student-07-payment-waiting-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-07-payment-waiting-mobile.png`
- Reference label: `Student - 07 - Payment Waiting`

## Route Contract

- Proposed route: `/student/reservations/:reservationId/payment/waiting`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: CTAs return to reservation list/detail.

## Purpose

- User job: understand receipt review is pending.
- Entry points: receipt upload success, reservation list card.
- Exit points: reservation detail/list.

## Design Contract

- Layout: centered waiting status card with payment summary.
- Desktop behavior: compact centered card.
- Mobile behavior: stacked summary rows, full-width CTA.
- Required copy/status labels: preserve `Menunggu Verifikasi Pembayaran`.
- Source-of-truth notes: waiting tone is neutral/amber, not success.

## UX Behavior

- Primary actions: view reservation detail/list.
- Secondary actions: download uploaded receipt if exposed from detail.
- Loading state: status card skeleton.
- Empty state: not applicable.
- Error state: missing reservation.
- Disabled state: no student review action.

## Accessibility

- Waiting status must be text-visible.
- Receipt metadata must wrap.
- CTA is keyboard reachable.

## Data And Fixture Contract

- Deterministic fixture requirements: paid reservation with receipt metadata and waiting review.
- Real entities: StudentReservation payment projection.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`.
- Page-needed fields: `payment.required`, `payment.receipt`, `payment.review_status`, deadlines, reservation summary.
- Auth/session assumptions: student-owned reservation only.
- Source files: `app/api/routes/reservation_routes.py`, `app/schemas/reservation_schemas.py`.

### BG-STUDENT-07-WAITING-01: Payment Waiting Projection

- Status: `resolved`
- Domain area: Payment
- Affected UI: payment waiting page and route logic.
- Contract needed: response distinguishes uploaded receipt waiting review from upload-needed or approved states.
- Evidence: `StudentReservationPaymentProjectionResponse.review_status` and `receipt` metadata exist in `app/schemas/reservation_schemas.py`.
- Source issue/PRD: `docs/issues/ISSUE-0027-student-reservation-workflow-projections.md`.

## Shared Components

- `docs/frontend/per-component-brief/reservation-status-panel.md`
- `docs/frontend/per-component-brief/payment-upload-panel.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: only payment waiting projection routes here.

## Open Questions

- None.

