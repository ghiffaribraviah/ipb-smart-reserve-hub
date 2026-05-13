---
id: ISSUE-0072
type: issue
title: Student payment workflow integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0070
  - ISSUE-0071
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0072: Student payment workflow integration

## Parent

PRD-0005

## What to build

Wire payment instructions, receipt upload, payment waiting, payment declined, and accepted-state routing to backend payment and Reservation projections.

## Acceptance criteria

- [x] Payment page loads payment instructions only for eligible paid Reservations.
- [x] Receipt upload accepts only supported image file types and max size.
- [x] Successful receipt upload routes to payment waiting.
- [x] Payment waiting and declined pages validate loaded Reservation state and redirect to canonical route when stale.
- [x] Declined state displays payment rejection reason from the backend projection.
- [x] Accepted state routes from the shared Reservation projection mapper after final approval.
- [x] Vitest/RTL tests cover instruction loading, unsupported free/unavailable payment state, upload validation, successful upload, waiting state, declined state, accepted routing, and backend error mapping.
- [x] Payment workflow screenshots remain green or are updated only for intentional file-type normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0070
- ISSUE-0071

## Implementation Notes

- Use the shared upload/download helpers.
- Keep payment receipt validation aligned with backend image-only contract.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET payment.amount_rupiah` | payment amount label | Format Rupiah in frontend | Fixture `Rp...` string |
| `payment.receipt` | receipt row | Show only when non-null | Fake receipt metadata |
| Upload contract | accepted files | JPG/JPEG/PNG only | PDF receipt upload |
| `payment.rejection_reason` | declined reason | Display for payment rejection | Document rejection on payment page |

## Agent Brief

**Category:** enhancement
**Summary:** Wire student payment instructions, receipt upload, payment waiting/declined states, and accepted routing to backend APIs and Reservation projections.

**Current behavior:**
Payment upload, payment waiting, payment declined, and accepted pages in `frontend/src/pages/student/StudentDocumentWorkflowPages.tsx` are fixture-driven. The payment page does not load payment instructions, receipt upload buttons do not send multipart data, image-only receipt validation is not enforced, waiting/declined pages do not verify the loaded Reservation projection, and declined copy uses fixture text.

**Desired behavior:**
Use `reservationId` from the route, load payment instructions from `GET /student/reservations/:reservationId/payment`, upload receipt images with `POST /student/reservations/:reservationId/payment-receipt`, and route successful uploads to `/student/reservations/:reservationId/payment/waiting`. Payment waiting, payment declined, and accepted pages should load `GET /student/reservations/:reservationId`, use the shared Student Reservation Workflow mapper to verify the canonical route, and redirect stale projections to the correct page.

**Key interfaces:**
- `GET /student/reservations/{reservation_id}/payment` returns `reservation_id`, `reservation_code`, `amount_rupiah`, and `payment_instructions`.
- `POST /student/reservations/{reservation_id}/payment-receipt` accepts multipart `file` and returns uploaded receipt metadata.
- Backend accepts payment receipts with JPG, JPEG, or PNG content type and rejects files above 5 MB.
- `GET /student/reservations/{reservation_id}` returns payment projection fields for waiting, declined, and approved/accepted state routing.
- Backend 409 for unsupported/free/unavailable payment states returns `Pembayaran hanya tersedia untuk reservasi berbayar yang menunggu pembayaran.`

**Acceptance criteria:**
- [ ] Payment page loads payment instructions only for eligible paid Reservations.
- [ ] Receipt upload accepts only supported image file types and max size.
- [ ] Successful receipt upload routes to payment waiting.
- [ ] Payment waiting and declined pages validate loaded Reservation state and redirect to canonical route when stale.
- [ ] Declined state displays payment rejection reason from the backend projection.
- [ ] Accepted state routes from the shared Reservation projection mapper after final approval.
- [ ] Vitest/RTL tests cover instruction loading, unsupported free/unavailable payment state, upload validation, successful upload, waiting state, declined state, accepted routing, and backend error mapping.
- [ ] Payment workflow screenshots remain green or are updated only for intentional file-type normalization.

**Out of scope:**
- Staff payment review actions.
- Receipt download UI beyond metadata display.
- Resubmission after terminal payment rejection.

## Update Log

- 2026-05-13: Triaged to `ready-for-agent`. Verified payment contracts in `app/api/routes/payment_routes.py` and projection fields in `app/schemas/reservation_schemas.py`; current payment workflow remains fixture-only.
- 2026-05-13: Implemented and closed. `frontend/src/pages/student/StudentDocumentWorkflowPages.tsx` now loads payment instructions, validates image-only receipts, uploads multipart payment receipts, routes successful uploads to waiting review, displays backend payment errors/rejection reasons, and enforces canonical payment/accepted routes through the shared mapper. Extended `frontend/src/pages/student/StudentDocumentWorkflowPages.test.tsx` and updated `frontend/tests/e2e/student-payment-status.spec.ts` plus intentional payment screenshots. Verified with `npm test -- --run src/pages/student/StudentDocumentWorkflowPages.test.tsx src/pages/student/StudentReservationListPage.test.tsx src/reservations/studentReservationWorkflow.test.ts`, `npm run typecheck`, `npx playwright test tests/e2e/student-payment-status.spec.ts --update-snapshots`, and `npx playwright test tests/e2e/student-payment-status.spec.ts`.
