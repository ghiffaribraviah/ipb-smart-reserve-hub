---
id: ISSUE-0075
type: issue
title: Staff Reservation detail and decision integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0074
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0075: Staff Reservation detail and decision integration

## Parent

PRD-0005

## What to build

Wire Staff Reservation detail, file downloads, and document/payment/cancellation review decisions to backend actions.

## Acceptance criteria

- [x] Staff detail loads assigned Reservation detail, student, Organization Unit, Facility, event, extra requirements, document, payment, and cancellation projections.
- [x] Download actions use Staff private file download endpoints only when metadata/download URL is available.
- [x] Approve and reject actions submit to the correct backend endpoint for document, payment, or cancellation review.
- [x] Reject actions require a reason before submission.
- [x] Successful decisions refetch detail and update visible state.
- [x] Unassigned/not-found responses show a stable access error state.
- [x] Vitest/RTL tests cover detail rendering, missing files, downloads, approve, reject without reason, reject success, mutation errors, refetch, and access denial.
- [x] Staff detail/dialog screenshots remain green.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0074

## Implementation Notes

- Use review action URLs from the Staff detail response where available.
- Preserve distinct approve and reject decision paths.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `review_actions.document/payment/cancellation` | decision buttons | Use selected workflow action URL | Hardcoded action endpoints where avoidable |
| `document/payment/cancellation.review_status` | decision panel | Shared Staff mapper | Student workflow labels |
| File metadata/download URL | download row | Show only when available | Fake document rows |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate Staff Reservation detail, private file downloads, and document/payment/cancellation review decisions with assigned-staff backend contracts.

**Current behavior:**
Staff Reservation detail and review decision surfaces are implemented from deterministic frontend data. Detail content, document/payment/cancellation projections, file availability, and approve/reject actions are not yet loaded from the assigned-staff detail endpoint or submitted to the backend review action URLs.

**Desired behavior:**
The Staff detail route should load the assigned Reservation detail by backend Reservation ID and render student, Organization Unit, Facility, event, extra requirements, document, payment, and cancellation projections. Staff file download actions should appear only when backend metadata and matching Staff private download URLs are available. Document, payment, and cancellation approve/reject controls should use the `review_actions` URLs from the detail response where possible, require a rejection reason before reject submission, show mutation errors without losing context, and refetch detail after successful decisions. Unassigned, forbidden, or not-found responses should show a stable access error state instead of fixture detail.

**Key interfaces:**
- Staff Reservation detail endpoint response — should drive all visible reservation, student, organization, facility, document, payment, cancellation, extra-requirement, and review-action state on the detail page.
- `review_actions.{document,payment/cancellation}` action URLs — should determine approve, reject, and download endpoint targets for the selected review workflow rather than hardcoded page-local routes where the backend supplies URLs.
- Staff private file download helper — should download signed approval letters and payment receipts only from Staff private endpoints and only for non-null backend metadata/download URLs.
- Shared Staff operation mapper — should provide detail/panel status labels and tones using Staff workflow language, not Student workflow labels.
- Review decision dialog/form state — should preserve selected workflow target, distinguish approve and reject decisions, require a non-empty reason for rejection, disable while pending, and surface backend validation/mutation errors.

**Acceptance criteria:**
- [x] Staff detail loads assigned Reservation detail, student, Organization Unit, Facility, event, extra requirements, document, payment, and cancellation projections.
- [x] Download actions use Staff private file download endpoints only when metadata/download URL is available.
- [x] Approve and reject actions submit to the correct backend endpoint for document, payment, or cancellation review.
- [x] Reject actions require a reason before submission.
- [x] Successful decisions refetch detail and update visible state.
- [x] Unassigned/not-found responses show a stable access error state.
- [x] Vitest/RTL tests cover detail rendering, missing files, downloads, approve, reject without reason, reject success, mutation errors, refetch, and access denial.
- [x] Staff detail/dialog screenshots remain green.

**Out of scope:**
- Staff Reservation queue/list integration.
- Backend review lifecycle or schema changes unless a verified contract mismatch blocks this slice.
- Staff Facility list, schedule, or edit integration.
- Student or Super Admin Reservation surfaces.

## Update Log

### 2026-05-13

- Completed Staff Reservation detail and decision integration.
  - Wired `/staff/reservations/:reservationId` to `GET /staff/reservations/:reservationId` and render assigned Reservation detail, student, Organization Unit, Facility, event, extra requirements, document, payment, cancellation, and review-action state.
  - Added Staff private file download behavior for available signed approval letter/payment metadata using backend-provided Staff download URLs only.
  - Added active workflow decision handling for document/payment/cancellation actions using `review_actions` URLs, with approve mutation, reject reason validation, reject mutation, mutation error feedback, and detail refetch after successful decisions.
  - Added stable loading and unassigned/not-found access error states.
  - Added Vitest/RTL coverage in `frontend/src/pages/staff/StaffReservationDetailDecisionPages.test.tsx` for detail rendering, missing/unavailable file behavior, downloads, approve/refetch, reject without reason, reject success, mutation errors, and access denial.
  - Updated Staff detail/dialog Playwright mocks and regenerated desktop/mobile screenshots for intentional backend-data normalization.
- Verification: `npm test -- --run src/pages/staff/StaffReservationDetailDecisionPages.test.tsx`; `npm run typecheck`; `npx playwright test tests/e2e/staff-reservation-detail-decision.spec.ts`.
- Note: `npm run lint` still fails on pre-existing unrelated lint errors in `frontend/src/auth/session.tsx`, student workflow files, and student e2e specs; no new Staff detail/list files were reported in the lint output.
