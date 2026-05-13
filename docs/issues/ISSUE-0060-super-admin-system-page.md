---
id: ISSUE-0060
type: issue
title: Super Admin system page
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

# ISSUE-0060: Super Admin system page

## Parent

PRD-0004

## What to build

Implement the Super Admin sistem page with deterministic system status and Booking Settings fixtures.

## Acceptance criteria

- [x] Page matches `Super - 04 - Sistem` at desktop and mobile sizes.
- [x] API/database/storage/worker status cards, Booking Settings controls, save action, and settings history match the reference.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify the page at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Status cards, settings fields, history rows, and action buttons do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0042
- ISSUE-0043

## Implementation Notes

- Use Booking Settings vocabulary from `CONTEXT.md`.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0041`, `ISSUE-0042`, and `ISSUE-0043` are done, the Super Admin sistem page brief exists, the Super 04 HTML/screenshot references are present, relevant shell/KPI/form/button/status component briefs exist, and no `.out-of-scope` entry conflicts with this system settings slice. Proceed with deterministic fixture-backed visual implementation only; backend API wiring and real save persistence are out of scope for this issue.

## Agent Brief

**Category:** enhancement
**Summary:** Build the Super Admin sistem page from the Super 04 reference.

**Current behavior:**
Super Admin operational pages exist for dashboard, users, facilities, and reports, but the system health/settings destination is not yet implemented as a product page.

**Desired behavior:**
Super Admin users should have a deterministic fixture-backed `/super-admin/system` page. The page should show API, database, storage, and worker health; Booking Settings controls; a save-settings action; and settings history rows. Mobile layout must stack the status cards, settings controls, and history without horizontal scrolling.

**Key interfaces:**
- Super Admin shell route/content composition — the system page mounts inside the Super Admin shell with the `Sistem` navigation item active.
- System status fixture read model — includes service names, health statuses, latency/last-check metadata, and summary KPI values.
- Booking Settings fixture read model — includes booking deadline/cutoff/email-domain settings, toggles, save state, and recent settings history.
- Form/status presentation — labels, numeric fields, toggles, status badges, history rows, and action buttons must remain readable and non-overlapping on mobile.

**Acceptance criteria:**
- [x] `/super-admin/system` matches `Super - 04 - Sistem` at desktop and mobile viewports.
- [x] API/database/storage/worker status cards, Booking Settings controls, save action, and settings history match the reference.
- [x] No backend API calls are introduced; deterministic fixtures drive the page.
- [x] Playwright screenshots cover the page at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Status cards, settings fields, history rows, and action buttons do not overlap incoherently.

**Out of scope:**
- Backend API integration for system status, settings reads, or settings updates.
- Real save persistence, validation beyond deterministic visible state, and settings history drill-down routes.

## Update Log

- 2026-05-13: Implemented deterministic fixture-backed Super Admin sistem route at `/super-admin/system`. Added system health KPI cards, service status list, Booking Settings controls, notification switch, history/save actions, and desktop/mobile Playwright screenshot coverage. Verified `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` with 86 passing tests.
