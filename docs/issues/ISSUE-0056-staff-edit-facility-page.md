---
id: ISSUE-0056
type: issue
title: Staff edit Facility page
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by:
  - ISSUE-0041
  - ISSUE-0042
  - ISSUE-0043
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0056: Staff edit Facility page

## Parent

PRD-0004

## What to build

Implement the staff edit Facility details page with deterministic Facility profile, image, open-hour, blackout, and save-state fixtures.

## Acceptance criteria

- [x] Page matches `Admin - 03 - Edit Facility Details` at desktop and mobile sizes.
- [x] Facility profile form, media rows, open-hours controls, blackout controls, save action, and success/error fixture states match the reference.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify the page at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Form sections, media controls, time rows, blackout rows, and action buttons do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0042
- ISSUE-0043

## Implementation Notes

- Use Facility Management vocabulary from `CONTEXT.md`.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0041`, `ISSUE-0042`, and `ISSUE-0043` are done, the staff edit Facility page brief exists, the staff shell/form controls/file upload briefs exist, and no `.out-of-scope` entry conflicts with this Facility Management slice. Proceed with deterministic fixture-backed visual implementation only; backend API wiring is out of scope for this issue.

## Agent Brief

**Category:** enhancement
**Summary:** Build the staff edit Facility details page from the Admin 03 reference.

**Current behavior:**
The frontend now has staff Facility list and schedule pages, but staff users do not yet have the `/staff/facilities/:facilityId/edit` page for editing assigned Facility profile details, media, open hours, and blackout periods.

**Desired behavior:**
Staff users should have a deterministic fixture-backed edit page for an assigned Facility. The page should preserve the `Admin - 03 - Edit Facility Details` visual structure, including the staff shell, media column, profile form sections, uploaded image rows, open-hours controls, blackout controls, and fixture-only save success/error states. Mobile should stack the media and form panels with full-width controls and no horizontal scrolling.

**Key interfaces:**
- Staff shell route/content composition — the edit page mounts inside the staff shell with active `Fasilitas` navigation.
- Facility Management fixture read model — includes Facility profile fields, price/payment/contact/open-hours summaries, media rows, open hours, blackout periods, and save-state variants.
- Form controls and file upload presentation — labels, helper/error text, media filenames, time rows, and action buttons must wrap cleanly on mobile.

**Acceptance criteria:**
- [x] `/staff/facilities/:facilityId/edit` matches `Admin - 03 - Edit Facility Details` at desktop and mobile viewports.
- [x] Facility profile form, media rows, open-hours controls, blackout controls, save action, and success/error fixture states match the reference.
- [x] No backend API calls are introduced; deterministic fixtures drive the page.
- [x] Playwright screenshots cover the page at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Form sections, media controls, time rows, blackout rows, and action buttons do not overlap incoherently.

**Out of scope:**
- Backend API integration for Facility profile, images, open hours, or blackouts.
- Real file upload behavior; add/remove/save actions remain fixture-only.
- Staff Facility list, schedule, reservation detail, or review decision implementation beyond existing navigation links.

## Update Log

- 2026-05-13: Implemented deterministic fixture-backed staff Facility edit page at `/staff/facilities/:facilityId/edit`, including Facility profile fields, amenity checkboxes, status/save/error fixture states, media rows, upload affordance, open-hours summary, blackout summary, and mobile-safe action layout. Added Playwright screenshot/overflow coverage in `frontend/tests/e2e/staff-edit-facility.spec.ts`. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` (72 passed).
