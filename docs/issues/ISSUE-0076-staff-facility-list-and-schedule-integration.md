---
id: ISSUE-0076
type: issue
title: Staff Facility list and schedule integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0075
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0076: Staff Facility list and schedule integration

## Parent

PRD-0005

## What to build

Wire Staff assigned Facility list and private Facility schedule to backend Staff endpoints.

## Acceptance criteria

- [x] Staff Facility list loads only assigned Facilities.
- [x] List rows/cards use backend Facility Management profile fields.
- [x] Schedule page loads assigned Facility schedule with private operational event and Organization Unit details.
- [x] Unassigned schedule access shows a stable not-found/forbidden state.
- [x] Loading, empty, and error states preserve the existing Staff layout.
- [x] Vitest/RTL tests cover assigned list, inactive status mapping, schedule rendering, empty schedule, access denial, and error recovery.
- [x] Staff Facility list/schedule screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0075

## Implementation Notes

- Use private Staff schedule data, not the privacy-safe public calendar, for operational Staff schedule pages.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /staff/facilities[]` | assigned Facility card/row | Use name, location, capacity, category, price, open hours, active state | Department/rating/maintenance fixture fields |
| `GET /staff/facilities/:id/schedule[]` | schedule entry | Show activity title and Organization Unit for Staff | Student public privacy rules |
| `is_active` | status label | `true -> Aktif`, `false -> Nonaktif` | Maintenance unless backed by API |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate Staff assigned Facility list and private Facility schedule pages with Staff backend endpoints.

**Current behavior:**
Staff Facility list and schedule pages are implemented from deterministic frontend fixtures. The list does not yet load assigned Facility Management profiles from the backend, and the schedule page does not yet use the private Staff schedule endpoint with operational Reservation, Organization Unit, status, workflow, and detail routing data.

**Desired behavior:**
The Staff Facility list should load only Facilities assigned to the signed-in Staff account and render backend-supported Facility Management profile fields: name, location, capacity, category, price summary, open-hours summary, and active/inactive state. Row/card actions should route to schedule and edit pages using backend Facility IDs. The Staff Facility schedule page should load private schedule entries for an assigned Facility over the displayed date range, show operational activity and Organization Unit details, preserve reservation detail links where the backend supplies them, and show a stable access error for unassigned/not-found schedules. Loading, empty, and error states should preserve the existing Staff operational layout.

**Key interfaces:**
- Staff assigned Facility list response — should provide Facility IDs and management profile fields used by the list/cards without reintroducing unsupported maintenance, rating, amenities, or last-change fixture fields.
- Staff Facility schedule endpoint response — should provide Reservation identity, activity title, Organization Unit, starts/ends, status, workflow/review state, and detail URL for private operational schedule display.
- Facility active-state mapper — should map `is_active=true` to `Aktif` and `is_active=false` to `Nonaktif` with stable badge tones.
- Staff schedule status mapper — should reuse Staff operation status/tone language where workflow/review state appears.

**Acceptance criteria:**
- [x] Staff Facility list loads only assigned Facilities.
- [x] List rows/cards use backend Facility Management profile fields.
- [x] Schedule page loads assigned Facility schedule with private operational event and Organization Unit details.
- [x] Unassigned schedule access shows a stable not-found/forbidden state.
- [x] Loading, empty, and error states preserve the existing Staff layout.
- [x] Vitest/RTL tests cover assigned list, inactive status mapping, schedule rendering, empty schedule, access denial, and error recovery.
- [x] Staff Facility list/schedule screenshots remain green or are updated only for intentional normalization.

**Out of scope:**
- Staff Facility editing or child record mutation.
- Public student Facility calendar behavior.
- Backend schema changes unless a verified contract mismatch blocks this slice.
- Reservation review decisions.

## Update Log

- 2026-05-13: Implemented Staff Facility list API integration against `GET /staff/facilities`, mapped Facility Management profile fields into cards, and added stable loading/empty/error states with retry.
- 2026-05-13: Implemented Staff Facility schedule API integration against `GET /staff/facilities/:facilityId/schedule`, including month-range query parameters, private Organization Unit/event details, workflow status labels, detail links, empty state, and forbidden/not-found state.
- 2026-05-13: Added RTL coverage in `frontend/src/pages/staff/StaffFacilityPages.test.tsx`; updated Staff facility/schedule Playwright API mocks and refreshed intentional screenshots.
- 2026-05-13: Verification: `npm test -- --run src/pages/staff/StaffFacilityPages.test.tsx`, `npm run typecheck`, and `npx playwright test tests/e2e/staff-facilities-schedule.spec.ts` pass. `npm run lint` still fails on pre-existing unrelated Student/auth lint errors; no Staff Facility files are reported.
