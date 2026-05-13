---
id: ISSUE-0058
type: issue
title: Super Admin dashboard and users pages
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by:
  - ISSUE-0041
  - ISSUE-0043
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0058: Super Admin dashboard and users pages

## Parent

PRD-0004

## What to build

Implement Super Admin dashboard and pengguna pages with deterministic KPI, administrator governance, activity, user list, role, and activation fixtures.

## Acceptance criteria

- [x] Dashboard matches `Super - 00 - Dashboard`.
- [x] Pengguna page matches `Super - 01 - Pengguna`.
- [x] Super Admin shell, KPI cards, governance rows/cards, activity log, user filters, and activation actions match references.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify both pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] KPI grids, tables/cards, activity items, user metadata, and actions do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0043

## Implementation Notes

- Preserve the Super Admin indigo accent.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0041` and `ISSUE-0043` are done, the Super Admin dashboard and pengguna page briefs exist, the Super Admin shell/KPI/governance component briefs exist, screenshots and HTML references are present, and no `.out-of-scope` entry conflicts with this governance slice. Proceed with deterministic fixture-backed visual implementation only; backend API wiring is out of scope for this issue.

## Agent Brief

**Category:** enhancement
**Summary:** Build the Super Admin dashboard and pengguna pages from the Super 00 and Super 01 references.

**Current behavior:**
The shared Super Admin shell and data-display reference components exist, but the product routes do not yet provide deterministic Super Admin dashboard or user governance pages.

**Desired behavior:**
Super Admin users should have fixture-backed operational pages for `/super-admin` and `/super-admin/users`. The dashboard should show system KPIs, administrator governance rows/cards, recent activity, and primary actions. The pengguna page should show user KPIs, filter controls, dense desktop user rows, mobile user cards, role/status metadata, and activation/management actions. Mobile layouts must stack content cleanly and preserve the indigo Super Admin accent.

**Key interfaces:**
- Super Admin shell route/content composition — dashboard and pengguna pages mount inside the Super Admin shell with the correct active navigation item.
- Super Admin dashboard fixture read model — includes KPI values, administrator governance rows, and recent activity items.
- Super Admin user fixture read model — includes mixed roles, units/profile metadata, active/inactive/data-needed statuses, filters, and activation/manage-access actions.
- KPI, governance, activity, filter, and mobile-card presentation — long names, emails, role labels, status badges, and action rows must wrap cleanly on mobile.

**Acceptance criteria:**
- [x] `/super-admin` matches `Super - 00 - Dashboard` at desktop and mobile viewports.
- [x] `/super-admin/users` matches `Super - 01 - Pengguna` at desktop and mobile viewports.
- [x] Super Admin shell, KPI cards, governance rows/cards, activity log, user filters, and activation actions match references.
- [x] No backend API calls are introduced; deterministic fixtures drive both pages.
- [x] Playwright screenshots cover both pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] KPI grids, tables/cards, activity items, user metadata, and actions do not overlap incoherently.

**Out of scope:**
- Backend API integration for dashboard aggregates, user search, user creation, or activation mutations.
- Real role mutation, invitation, or account creation workflows.
- Super Admin facilities, laporan, and system pages.

## Update Log

- 2026-05-13: Implemented deterministic fixture-backed Super Admin dashboard and pengguna routes at `/super-admin` and `/super-admin/users`. Added Super Admin shell composition, KPI cards, administrator governance table/mobile cards, activity log, user filters, user table/mobile cards, and activation/manage-access actions with desktop/mobile Playwright screenshot coverage. Verified `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` with 80 passing tests.
