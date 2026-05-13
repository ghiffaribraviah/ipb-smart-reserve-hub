---
id: ISSUE-0068
type: issue
title: Student Reservation time selection integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0066
  - ISSUE-0067
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0068: Student Reservation time selection integration

## Parent

PRD-0005

## What to build

Wire Reservation time selection to backend validation and privacy-safe calendar data.

## Acceptance criteria

- [x] Time selection validates selected `starts_at` and `ends_at` with the backend time-selection endpoint.
- [x] Unavailable responses disable continue and show backend reason messages near the selection controls.
- [x] Available responses enable continue and preserve selected time for the detail form flow.
- [x] Calendar display uses privacy-safe blocked ranges only.
- [x] Visible helper copy reflects the one-hour minimum duration rule.
- [x] Vitest/RTL tests cover available selection, unavailable selection, backend errors, loading state, continue gating, and privacy-safe calendar rendering.
- [x] Reservation time screenshots remain green or are updated only for intentional copy/privacy changes.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0066
- ISSUE-0067

## Implementation Notes

- Preserve explicit route shape for the reservation workflow.
- Keep selected time state stable through loading and errors.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `POST /facilities/:id/reservation-time-selection.available` | continue enabled | `true` enables continue | Client-only availability guesses |
| `errors[].message` | validation message | Show backend Indonesian message | Private Reservation conflict details |
| Public calendar blocked ranges | calendar marks | Generic unavailable markers | Event title/org details |

## Agent Brief

**Category:** enhancement
**Summary:** Wire the Student Reservation time-selection page to backend time validation and privacy-safe calendar data.

**Current behavior:**
The time-selection page renders fixture-selected times, fixture agenda entries, and a static continue link. It does not call `POST /facilities/:id/reservation-time-selection`, does not load the public privacy-safe calendar, and cannot disable continue based on backend availability results.

**Desired behavior:**
The page should read `facilityId` from `/student/facilities/:facilityId/reserve/time`, keep selected start/end inputs stable, validate selected `starts_at` and `ends_at` through the backend endpoint, and enable the continue action only after an available response. Unavailable responses and backend errors should show clear feedback near the time controls without revealing private reservation details. The public calendar/agenda should use only privacy-safe blocked ranges from `GET /facilities/:id/calendar`.

**Key interfaces:**
- `POST /facilities/{facility_id}/reservation-time-selection` with selected `starts_at` and `ends_at`.
- Validation response with `available` plus backend reasons; `available: true` enables continue.
- `GET /facilities/{facility_id}/calendar?start=...&end=...` returning privacy-safe blocked ranges with `starts_at`, `ends_at`, and generic `status: reserved`.
- Route continuation: `/student/facilities/:facilityId/reserve/details` should carry selected time state through query params or another existing frontend flow convention.

**Acceptance criteria:**
- [ ] Time selection validates selected `starts_at` and `ends_at` with the backend time-selection endpoint.
- [ ] Unavailable responses disable continue and show backend reason messages near the selection controls.
- [ ] Available responses enable continue and preserve selected time for the detail form flow.
- [ ] Calendar display uses privacy-safe blocked ranges only.
- [ ] Visible helper copy reflects the one-hour minimum duration rule.
- [ ] Vitest/RTL tests cover available selection, unavailable selection, backend errors, loading state, continue gating, and privacy-safe calendar rendering.
- [ ] Reservation time screenshots remain green or are updated only for intentional copy/privacy changes.

**Out of scope:**
- Reservation detail submission integration.
- Backend validation rule changes.
- Displaying other users' activity, organization, requester, or reservation identifiers in the calendar.

## Update Log

- 2026-05-13: Triaged to `ready-for-agent`. Dependencies are satisfied, including the privacy-safe public calendar contract from `ISSUE-0066` and Facility detail integration from `ISSUE-0067`.
- 2026-05-13: Implemented reservation time-selection integration in `frontend/src/pages/student/StudentReservationCreatePages.tsx`. The time page now reads `facilityId` from the route, fetches privacy-safe public calendar blocks, validates selected `starts_at`/`ends_at` through `POST /facilities/:id/reservation-time-selection`, disables continue until an available response, renders backend unavailable/error messages, and preserves selected times into the detail route query string.
- 2026-05-13: Added `frontend/src/pages/student/StudentReservationTimePage.test.tsx` covering available validation, unavailable validation, backend errors, pending/loading state, continue gating, and privacy-safe calendar rendering. Updated `frontend/tests/e2e/student-reservation-create.spec.ts` with backend endpoint mocks and refreshed reservation time screenshots for the intentional validation/privacy changes.
  Verification passed: `npm test -- --run src/pages/student/StudentReservationTimePage.test.tsx`, `npm run typecheck`, `npx playwright test tests/e2e/student-reservation-create.spec.ts --update-snapshots`, and `npx playwright test tests/e2e/student-reservation-create.spec.ts`.
