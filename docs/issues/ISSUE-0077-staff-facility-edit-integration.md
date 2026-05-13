---
id: ISSUE-0077
type: issue
title: Staff Facility edit integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0076
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0077: Staff Facility edit integration

## Parent

PRD-0005

## What to build

Wire Staff Facility edit to assigned Facility profile update, deactivate, image creation, open-hour creation, and blackout creation endpoints where represented in the page.

## Acceptance criteria

- [x] Edit page loads the assigned Facility profile from backend data.
- [x] Profile save submits supported fields through the patch endpoint.
- [x] Deactivate action submits to the backend and updates visible active state.
- [x] Image, open-hour, and blackout create controls submit only supported backend payloads when implemented.
- [x] Unsupported fixture-only fields are removed, disabled, or clearly deferred.
- [x] Field validation and API validation errors map to visible form feedback.
- [x] Vitest/RTL tests cover load, successful save, validation error, access denial, deactivate, and supported child record creation behavior.
- [x] Staff edit screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0076

## Implementation Notes

- Do not invent amenities or last-change metadata.
- Keep child record creation scoped to existing backend contracts.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `FacilityManagementProfileResponse` | edit form | Populate supported fields only | Amenities, last changed by |
| `PATCH /staff/facilities/:id` | save action | Submit changed supported fields | Unsupported profile fields |
| Image/open-hour/blackout create | child forms | Submit exact backend payloads | Bulk media management |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate Staff Facility edit with assigned-Facility backend profile and supported operational child-record endpoints.

**Current behavior:**
The Staff Facility edit page is fixture-backed. It shows editable-looking profile, media, schedule, and blackout controls, but does not load the assigned Facility profile from the Staff backend, does not submit profile changes or deactivate actions, and may still expose fixture-only fields that are not supported by the current Facility Management contract.

**Desired behavior:**
The edit page should load the current Staff-assigned Facility profile, populate only backend-supported fields, and keep unsupported fixture-only fields removed, disabled, or explicitly deferred in the UI. Saving should submit supported profile changes through the Staff Facility patch endpoint and show stable success or validation feedback without leaving stale values on screen. Deactivation should call the Staff Facility deactivate endpoint, update visible active/inactive state, and keep the page in a coherent disabled/success state while the mutation runs. Image, open-hour, and blackout create controls should only submit exact backend-supported payloads where the page implements those controls; any unsupported bulk/media management should remain out of scope or visibly deferred. Access denial for unassigned/not-found Facilities should render a stable forbidden/not-found state.

**Key interfaces:**
- `FacilityManagementProfileResponse` — source of truth for editable Staff Facility profile fields such as name, location, capacity, description, contact fields, price, payment instructions, open-hours summary, and active state.
- `FacilityProfileUpdateRequest` — only these nullable update fields should be submitted on profile save.
- `FacilityImageCreateRequest`, `FacilityOpenHourCreateRequest`, and `FacilityBlackoutCreateRequest` — child-record forms must match these request shapes exactly if implemented.
- Staff Facility mutation endpoints — profile patch, deactivate, image create, open-hour create, and blackout create should all preserve assigned-staff access scoping and map API validation errors to visible form feedback.

**Acceptance criteria:**
- [x] Edit page loads the assigned Facility profile from backend data and renders loading, empty/not-found, and forbidden/error states in the Staff layout.
- [x] Profile save submits only supported `FacilityProfileUpdateRequest` fields and updates visible values after success.
- [x] API validation errors and client-side field validation errors map to visible, field-level or form-level feedback.
- [x] Deactivate action submits to the backend, disables duplicate submits while pending, and updates visible active state after success.
- [x] Image, open-hour, and blackout create controls submit only supported backend payloads when implemented; unsupported fixture-only controls are removed, disabled, or clearly deferred.
- [x] Vitest/RTL coverage verifies load, successful save, validation error, access denial, deactivate, and supported child-record creation behavior.
- [x] Staff edit Playwright screenshots remain green or are updated only for intentional backend-contract normalization.

**Out of scope:**
- Backend schema or route changes unless a verified contract mismatch blocks the integration.
- Bulk image reordering/deletion, amenity management, last-change metadata, ratings, or maintenance fields not present in the Staff Facility Management contract.
- Public student Facility profile/calendar behavior.

## Update Log

- 2026-05-13: Implemented Staff Facility edit integration from `GET /staff/facilities`, scoped by backend Facility ID, with stable loading/error/access-denied states.
- 2026-05-13: Wired profile save to `PATCH /staff/facilities/:facilityId`, deactivate to `POST /staff/facilities/:facilityId/deactivate`, and supported image/open-hour/blackout create controls to their Staff endpoints.
- 2026-05-13: Removed fixture-only edit banners/media rows from the live edit surface and replaced them with backend-supported fields, validation feedback, and clearly scoped child-record forms.
- 2026-05-13: Added RTL coverage for load, save, client/API validation errors, access denial, deactivate, and child-record payloads. Updated Staff edit Playwright mocks and refreshed intentional screenshots.
- 2026-05-13: Verification: `npm test -- --run src/pages/staff/StaffFacilityPages.test.tsx`, `npm run typecheck`, and `npx playwright test tests/e2e/staff-edit-facility.spec.ts` pass. `npm run lint` still fails on pre-existing unrelated Student/auth lint errors; no Staff Facility files are reported.
