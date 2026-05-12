# Student 07 Payment

## Reference

- HTML: `docs/frontend/html-reference/Student - 07 - Payment.html`
- Desktop screenshot: `docs/frontend/screenshots/student-07-payment-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-07-payment-mobile.png`
- Reference label: `Student - 07 - Payment`

## Route Contract

- Proposed route: `/student/reservations/:reservationId/payment`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: after receipt upload, route to payment waiting page.

## Purpose

- User job: view payment instructions and upload payment receipt.
- Entry points: approved document on paid reservation, reservation list/detail.
- Exit points: payment waiting page, reservation detail.

## Design Contract

- Layout: payment instruction card, upload panel, and reservation summary.
- Desktop behavior: two-column workflow rhythm.
- Mobile behavior: stack instructions, upload, summary; full-width submit action.
- Required copy/status labels: preserve `Menunggu Pembayaran` and upload labels.
- Source-of-truth notes: payment amount and instructions must be scannable.

## UX Behavior

- Primary actions: upload receipt.
- Secondary actions: view reservation detail/back.
- Loading state: upload pending keeps file visible.
- Empty state: not applicable for paid pending-payment route.
- Error state: file validation and upload failures.
- Disabled state: submit disabled until valid receipt file selected.

## Accessibility

- Payment instructions should be real text.
- File input has visible label and error association.
- Amount text must not rely on color or icon.

## Data And Fixture Contract

- Deterministic fixture requirements: paid reservation, payment instructions, receipt file states.
- Real entities: Student payment response and reservation payment projection.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId/payment`, `POST /student/reservations/:reservationId/payment-receipt`, `GET /student/reservations/:reservationId`.
- Page-needed fields: `amount_rupiah`, `payment_instructions`, `payment.required`, `payment.review_status`, `payment.receipt`.
- Auth/session assumptions: student-owned reservation only.
- Source files: `app/api/routes/payment_routes.py`, `app/schemas/reservation_schemas.py`.

### BG-STUDENT-07-01: Payment Instructions And Receipt Upload

- Status: `resolved`
- Domain area: Payment
- Affected UI: payment instruction card and receipt upload panel.
- Contract needed: retrieve payment instructions and upload receipt metadata.
- Evidence: payment instruction and receipt upload routes exist in `app/api/routes/payment_routes.py`; payment schemas exist in `app/schemas/reservation_schemas.py`.
- Source issue/PRD: `docs/issues/ISSUE-0010-paid-facility-receipt-upload-and-payment-review.md`.

## Shared Components

- `docs/frontend/per-component-brief/payment-upload-panel.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: successful upload routes to waiting state.

## Open Questions

- Upload progress visual state is tracked in `missing-design.md`.

