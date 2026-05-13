---
id: ISSUE-0066
type: issue
title: Public Facility Calendar privacy contract correction
status: done
category: bug
agent_mode: AFK
area:
  - backend
  - docs
prd: PRD-0005
blocked_by:
  - ISSUE-0063
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0066: Public Facility Calendar privacy contract correction

## Parent

PRD-0005

## What to build

Correct the student-facing Public Facility Calendar contract so it exposes blocked time ranges without revealing other users' Reservation details.

## Acceptance criteria

- [x] Public calendar responses do not expose activity titles, Organization Units, student data, Reservation IDs, workflow state, document state, payment state, or private details.
- [x] Public calendar responses still expose enough blocked time-range data for student Facility detail and Reservation time selection pages.
- [x] Backend behavior tests verify privacy for pending blocking Reservations, approved Reservations, and cancellation-requested Reservations.
- [x] Backend docs and frontend page briefs describe the privacy-safe contract.
- [x] Backend gap ledger points to the corrected page-owned gap status.
- [x] Existing Staff private schedule behavior remains unchanged and can still expose operational details to assigned Staff users.

## Blocked By

- ISSUE-0063

## Implementation Notes

- Use backend TDD through public API or service behavior.
- Keep private Staff schedule separate from Public Facility Calendar.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /facilities/:id/calendar.starts_at/ends_at` | blocked range | Show unavailable/reserved block | `activity_title`, `organization_unit` |
| Public calendar status/category if retained | generic label | Only generic availability label | Workflow/document/payment status |
| Staff schedule endpoint | staff schedule row | Unchanged private operational data | Not used by students |

## Agent Brief

**Category:** bug
**Summary:** Correct the public Facility calendar API so student-facing calendar consumers receive only privacy-safe blocked time ranges, while assigned Staff schedule APIs keep operational Reservation details.

**Current behavior:**
`GET /facilities/{facility_id}/calendar` is public and currently projects `facility_name`, `activity_title`, and `organization_unit` from blocking reservations. Existing docs and frontend briefs already identify this as a privacy gap, and frontend fixtures were normalized in `ISSUE-0063`, but backend response shape still exposes another user's event title and organization.

**Desired behavior:**
The public calendar endpoint should return only the blocked time range and a generic public availability status/label such as `reserved`, without Reservation IDs, workflow/document/payment state, activity title, organization unit, requester/student data, cancellation details, or other private reservation metadata. Pending blocking reservations, approved reservations, and cancellation-requested reservations should all appear as blocked ranges. Staff schedule endpoints must remain separate and continue exposing assigned-staff operational details.

**Key interfaces:**
- Public API: `GET /facilities/{facility_id}/calendar?start=...&end=...`.
- Public schema: `FacilityCalendarEntryResponse` in `app/schemas/facility_schemas.py`.
- Public projection: `FacilityCatalogModule.list_public_calendar_entries` in `app/services/facilities.py`.
- Private staff schedule: `GET /staff/facilities/{facility_id}/schedule` via staff reservation operations, unchanged.
- Docs: `README.md`, `docs/frontend/per-page-brief/student-02-facility-details.md`, `docs/frontend/per-page-brief/student-03-reservation-time-form.md`, and `docs/frontend/backend-gaps.md`.

**Acceptance criteria:**
- [ ] Public calendar responses do not expose activity titles, Organization Units, student data, Reservation IDs, workflow state, document state, payment state, or private details.
- [ ] Public calendar responses still expose enough blocked time-range data for student Facility detail and Reservation time selection pages.
- [ ] Backend behavior tests verify privacy for pending blocking Reservations, approved Reservations, and cancellation-requested Reservations.
- [ ] Backend docs and frontend page briefs describe the privacy-safe contract.
- [ ] Backend gap ledger points to the corrected page-owned gap status.
- [ ] Existing Staff private schedule behavior remains unchanged and can still expose operational details to assigned Staff users.

**Out of scope:**
- Wiring frontend Facility detail or Reservation time pages to the calendar endpoint.
- Changing Staff private schedule response shape or authorization.
- Changing reservation lifecycle blocking status rules beyond the public projection privacy boundary.

## Update Log

- 2026-05-13: Triaged to `ready-for-agent`. Evidence: public calendar service/schema currently include `activity_title` and `organization_unit`; staff schedule uses a separate private projection, so the fix should be scoped to the public calendar projection/schema and docs.
- 2026-05-13: Implemented the privacy-safe public calendar contract. `FacilityCalendarEntryResponse` and `FacilityCatalogModule.list_public_calendar_entries` now expose only `starts_at`, `ends_at`, and generic `status: reserved`.
- 2026-05-13: Updated backend behavior tests so `GET /facilities/{facility_id}/calendar` verifies pending document upload, approved, and cancellation-requested reservations are public blocked ranges without activity title, organization unit, reservation ID, workflow, document, or payment details. Updated staff schedule coverage to verify assigned Staff still receive private operational schedule details while the public calendar remains sanitized.
- 2026-05-13: Updated `README.md`, `docs/frontend/per-page-brief/student-02-facility-details.md`, `docs/frontend/per-page-brief/student-03-reservation-time-form.md`, and `docs/frontend/backend-gaps.md`; `BG-STUDENT-02-02` is now `resolved`.
  Verification passed: `uv run pytest tests/test_public_facility_calendar.py tests/test_facility_browsing.py tests/test_staff_reservation_operations.py`.
