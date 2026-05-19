---
id: ISSUE-0089
type: issue
title: Automatic student cancellation lifecycle
status: done
category: enhancement
agent_mode: HITL
area:
  - backend
  - frontend
  - docs
blocked_by: []
created: 2026-05-19
updated: 2026-05-19
---

# ISSUE-0089: Automatic student cancellation lifecycle

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Change student cancellation from a staff-reviewed request into an immediate cancellation flow with policy-warning copy about possible fines, sanctions, or no refund.

## Acceptance criteria

- [ ] Student cancellation submission for eligible approved reservations immediately transitions the reservation to `cancelled`.
- [ ] Cancellation page warning copy explains fines, sanctions, and no-refund consequences instead of warning that staff may approve/reject the request.
- [ ] Backend behavior tests cover automatic cancellation, required reason handling if retained, audit log recording, and invalid lifecycle states.
- [ ] Staff queues/details no longer expose cancellation approval/rejection as an actionable workflow after automatic cancellation is enabled.
- [ ] Staff cancellation approve/reject endpoints are either deprecated with tests documenting legacy behavior or made unreachable from the integrated UI.
- [ ] Student reservation projections reflect cancelled state and cancellation reason clearly.
- [ ] Frontend integration tests cover the cancellation submit success path and cancelled detail state.
- [ ] Affected route/schema/service docs, frontend page briefs, and backend gap entries are updated if contracts change.

## Blocked By

- ISSUE-0088

## Implementation Notes

- Current backend has `cancellation_requested` plus staff approve/reject endpoints. This issue intentionally changes that domain behavior.
- Likely backend touchpoints: `app/services/reservations.py`, `reservation_lifecycle.py`, reservation schemas/routes, staff reservation operation projections, and tests.
- Likely frontend touchpoints: cancellation page, student detail/list workflow mapper, staff reservation queue/detail pages.

## Triage Notes

- 2026-05-19: ISSUE-0088 is done, so this issue is unblocked. Acceptance criteria are concrete enough for agent implementation despite the original HITL mode: preserve the existing approved-reservation cancellation route shape, change the outcome to immediate `cancelled`, update staff projections so cancellation review is not actionable, and update affected frontend copy/tests/docs.

## Agent Brief

- Implement automatic approved-reservation cancellation through the student cancellation request endpoint.
- Keep required cancellation reason validation unless a code path proves it must change.
- Record a student cancellation audit entry, make the resulting reservation state `cancelled`, and expose the cancellation reason in student projections/detail.
- Stop integrated staff queues/details from surfacing cancellation approval/rejection as actionable work after the automatic cancellation path.
- Update cancellation page copy and tests so students see policy consequences instead of staff approval/rejection review language.

## Update Log

- 2026-05-19: Implemented automatic cancellation for approved student reservations. The student cancellation request endpoint now immediately returns `cancelled`, stores the reason, records `reservation.cancelled` audit logs, and releases facility availability/calendar blocks because cancelled reservations remain terminal. Staff verification queues no longer include cancellation review work, and staff detail UI only exposes review actions for pending document/payment workflows.
- 2026-05-19: Updated student cancellation copy to warn about fines, sanctions, and no-refund consequences; cancelled reservation detail now shows the cancellation reason. Updated frontend/backend tests, page/component briefs, dev seed copy, and affected screenshots.
- 2026-05-19: Verification: `npm test -- StudentReviewCancellationProfilePages StudentReservationDetailReadOnlyPage studentReservationWorkflow`; `npm test -- StaffReservationDetailDecisionPages StaffReservationOperationsPages`; `npm run typecheck`; `npx playwright test student-review-cancellation-profile.spec.ts student-reservation-detail.spec.ts --update-snapshots`; `npx playwright test student-review-cancellation-profile.spec.ts student-reservation-detail.spec.ts`; `npx playwright test staff-reservation-detail-decision.spec.ts --update-snapshots`; `npx playwright test staff-reservation-detail-decision.spec.ts`; `npm run build`; `python3 -m compileall app tests`; `git diff --check`. Backend pytest was not executable in this container because `pytest` and `uv` are not installed and the project requires Python >=3.12 while only `/usr/bin/python3` is available.
