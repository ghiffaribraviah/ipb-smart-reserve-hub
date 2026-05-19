---
id: ISSUE-0091
type: issue
title: Staff Facility structured category and open-hours management
status: done
category: enhancement
agent_mode: AFK
area:
  - backend
  - frontend
  - docs
blocked_by:
  - ISSUE-0085
created: 2026-05-19
updated: 2026-05-19
---

# ISSUE-0091: Staff Facility structured category and open-hours management

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Replace staff Facility free-text open-hours editing with structured per-day rows and add category selection backed by API contracts, while keeping summary text as derived display data.

## Acceptance criteria

- [x] Staff Facility profile response exposes `category_id`, category label, and current `open_hours` rows with day, opens time, and closes time.
- [x] Staff Facility edit UI shows an editable category select populated from active Facility categories.
- [x] Staff Facility edit UI shows open-hour rows with day, opens at, closes at, add, and remove controls.
- [x] Backend update behavior safely changes category and replaces or patches open-hour rows through public service/API interfaces.
- [x] `open_hours_summary` remains available for catalog/detail/list display and is derived from structured rows where practical.
- [x] Open-hour validation rejects invalid day/time ranges and preserves assigned-facility access control.
- [x] Staff edit tests cover loading existing rows, adding/removing rows, category changes, validation errors, and save behavior.
- [x] `docs/frontend/per-page-brief/staff-03-edit-facility-details.md`, backend gap docs, and route/schema docs are updated.
- [x] Playwright snapshots for `staff-edit-facility.spec.ts` are updated for desktop and mobile.

## Blocked By

- ISSUE-0085

## Implementation Notes

- Current backend has `FacilityOpenHour` rows and a create endpoint, but profile/update still centers `open_hours_summary` and does not expose editable category IDs/options.
- Likely backend touchpoints: facility management schemas/routes/services/repositories and facility category read models.
- Follow backend TDD: one behavior test at a time through public routes/services.

## Triage Notes

- 2026-05-19: ISSUE-0085 is done, no ADR or out-of-scope entry blocks this work, and the backend/frontend acceptance criteria are concrete. Although initially marked HITL because it changes contracts, the planned behavior is fully specified: expose category/open-hour data, validate structured updates, keep derived summary display, and update staff edit UI/tests/docs. Ready for AFK implementation with backend TDD and frontend integration tests.

## Agent Brief

**Category:** enhancement
**Summary:** Add structured Facility category and open-hours editing to the staff Facility edit workflow.

**Current behavior:**
Staff Facility management exposes a profile response with category label and `open_hours_summary`, plus a separate create endpoint for a single open-hour row. The staff edit UI edits the summary as free text and does not expose current open-hour rows or category selection backed by active Facility categories.

**Desired behavior:**
Staff users editing an assigned Facility should see and save the Facility category and structured open-hour rows. Backend responses should expose category ID, category label, and current open-hour rows. Backend updates should validate category and open-hour changes through public service/API interfaces, preserve assigned-facility access control, and keep `open_hours_summary` available as display text derived from structured rows where practical.

**Key interfaces:**
- Staff Facility profile response — include category ID/label and `open_hours` rows.
- Staff Facility profile update request — accept category changes and structured open-hour replacement or patch data.
- Facility category listing/read contract — provide active category options usable by the staff edit UI.
- Staff Facility edit form — render category select and add/remove/editable open-hour rows.
- Facility open-hour validation — reject invalid day values and time ranges where `closes_at` is not after `opens_at`.

**Acceptance criteria:**
- [ ] Staff Facility profile response exposes `category_id`, category label, and current `open_hours` rows with day, opens time, and closes time.
- [ ] Staff Facility edit UI shows an editable category select populated from active Facility categories.
- [ ] Staff Facility edit UI shows open-hour rows with day, opens at, closes at, add, and remove controls.
- [ ] Backend update behavior safely changes category and replaces or patches open-hour rows through public service/API interfaces.
- [ ] `open_hours_summary` remains available for catalog/detail/list display and is derived from structured rows where practical.
- [ ] Open-hour validation rejects invalid day/time ranges and preserves assigned-facility access control.
- [ ] Staff edit tests cover loading existing rows, adding/removing rows, category changes, validation errors, and save behavior.
- [ ] Staff Facility page brief, backend gap docs, and route/schema docs are updated.
- [ ] Playwright snapshots for staff Facility edit are updated for desktop and mobile.

**Out of scope:**
- Facility creation/import flows.
- Production media upload/storage changes.
- Super Admin Facility governance redesign beyond consuming the existing category label.

## Update Log

- 2026-05-19: Implemented structured staff Facility category and open-hours management. Backend staff Facility profiles now expose `category_id` and `open_hours`, updates accept category changes and open-hour replacement, validation rejects invalid open-hour values, and summaries are derived from structured rows on replacement. Staff edit UI now loads active Facility categories, renders category selection plus add/remove/editable open-hour rows, removes the old free-text summary edit path from the page, and keeps summary as display text. Updated page/backend docs and refreshed desktop/mobile Playwright snapshots.
- 2026-05-19: Verification run: `python3 -m compileall app tests` passed; `npm run typecheck` passed from `frontend/`; `npm test -- StaffFacilityPages` passed; `npx playwright test staff-edit-facility.spec.ts --update-snapshots` passed; `npx playwright test staff-edit-facility.spec.ts` passed on rerun after one nondeterministic mobile screenshot diff just above threshold. `python3 -m pytest tests/test_staff_facility_management.py -q` could not run because this environment lacks the `pytest` module.
