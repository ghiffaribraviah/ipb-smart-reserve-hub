---
id: ISSUE-0069
type: issue
title: Student Reservation detail submission integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0068
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0069: Student Reservation detail submission integration

## Parent

PRD-0005

## What to build

Wire the Reservation detail form to active Organization Units and backend Reservation submission, including Reservation Extra Requirements and conflict recovery.

## Acceptance criteria

- [x] Form loads active Organization Units for selection.
- [x] Submit sends activity title, event description, participant count, organization unit ID, contact phone, selected time range, and Reservation Extra Requirements.
- [x] Successful creation routes to the created Reservation approval-letter page.
- [x] Conflict responses return to actionable time feedback or show clear form-level conflict messaging.
- [x] Frontend validation covers required fields, participant count, contact phone, and extra requirement notes.
- [x] Vitest/RTL tests cover successful submit, missing Organization Units, validation failures, conflict response, and loading/disabled state.
- [x] Reservation detail form screenshots remain green.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0068

## Implementation Notes

- Preserve the current form layout and checkbox row behavior.
- Use the selected time state from the prior workflow step.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /organization-units[].id/name` | organization select | Active units only | Free-text organization creation |
| `extra_requirements` | checkbox group and notes | Map four booleans plus notes | Fixture-only requirement labels not in contract |
| `StudentReservationResponse.id` | next route | `/student/reservations/:id/letter` | Reservation code as route ID |

## Agent Brief

**Category:** enhancement
**Summary:** Wire the Student Reservation detail form to active Organization Units and authenticated Reservation submission.

**Current behavior:**
The detail form is fixture-driven. Organization is a free-text input, submit is a static link to a fixture approval-letter route, selected time comes from fixtures, extra requirement checkbox values are not submitted, and backend conflict/validation states are not represented.

**Desired behavior:**
The page should read `facilityId`, `starts_at`, and `ends_at` from the reservation workflow route/query, fetch active Organization Units for a select control, validate required form inputs on the frontend, submit a `ReservationSubmissionRequest` to `POST /facilities/:facilityId/reservations`, and route to `/student/reservations/:id/letter` from the created Reservation response. Conflict responses should produce actionable form-level feedback and keep the entered values. Submit should be disabled while loading, and missing Organization Units should render a stable inline empty/error state.

**Key interfaces:**
- `GET /organization-units` returns active organization unit options with `id` and `name`.
- `POST /facilities/{facility_id}/reservations` requires `activity_title`, `event_description`, `participant_count`, `organization_unit_id`, `contact_phone`, `starts_at`, `ends_at`, and `extra_requirements`.
- `extra_requirements` maps to `av_support`, `logistics_coordination`, `extra_cleaning`, `security_personnel`, and optional `notes`.
- Success response `StudentReservationResponse.id` drives `/student/reservations/:id/letter`.
- Conflict response `409` detail is `Waktu reservasi tidak tersedia.`

**Acceptance criteria:**
- [ ] Form loads active Organization Units for selection.
- [ ] Submit sends activity title, event description, participant count, organization unit ID, contact phone, selected time range, and Reservation Extra Requirements.
- [ ] Successful creation routes to the created Reservation approval-letter page.
- [ ] Conflict responses return to actionable time feedback or show clear form-level conflict messaging.
- [ ] Frontend validation covers required fields, participant count, contact phone, and extra requirement notes.
- [ ] Vitest/RTL tests cover successful submit, missing Organization Units, validation failures, conflict response, and loading/disabled state.
- [ ] Reservation detail form screenshots remain green.

**Out of scope:**
- Backend reservation rule changes.
- Organization Unit creation.
- Approval letter upload/generation integration beyond routing to the created reservation page.

## Update Log

- 2026-05-13: Triaged to `ready-for-agent`. Backend contracts verified in `ReservationSubmissionRequest`, `POST /facilities/{facility_id}/reservations`, and `GET /organization-units`; selected time should come from the query params produced by `ISSUE-0068`.
- 2026-05-13: Implemented and closed. `frontend/src/pages/student/StudentReservationCreatePages.tsx` now fetches active Organization Units, validates the detail form, submits `ReservationSubmissionRequest` including selected time and extra requirements, handles conflict/form errors, and routes to the created approval-letter page. Added `frontend/src/pages/student/StudentReservationDetailPage.test.tsx` and updated `frontend/tests/e2e/student-reservation-create.spec.ts` plus reservation detail screenshots. Verified with `npm test -- --run src/pages/student/StudentReservationDetailPage.test.tsx`, `npm run typecheck`, `npx playwright test tests/e2e/student-reservation-create.spec.ts --update-snapshots`, and `npx playwright test tests/e2e/student-reservation-create.spec.ts`.
