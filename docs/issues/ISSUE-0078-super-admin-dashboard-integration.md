---
id: ISSUE-0078
type: issue
title: Super Admin dashboard integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0078: Super Admin dashboard integration

## Parent

PRD-0005

## What to build

Wire the Super Admin dashboard to backend dashboard aggregate data while normalizing unsupported fixture-only metrics and actions.

## Acceptance criteria

- [x] Dashboard loads KPI values, system status, administrators, Facility governance rows, and recent activity from the dashboard endpoint.
- [x] Unsupported trends, percentages, export, or add-admin shortcuts are disabled, deferred, or routed only to implemented pages.
- [x] Loading, empty, and error states preserve dashboard layout.
- [x] Vitest/RTL tests cover dashboard render, missing sections, error recovery, and deferred action behavior.
- [x] Super Admin dashboard screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063

## Implementation Notes

- Use Super Admin indigo shell and preserve approved visual rhythm.
- Do not fabricate uptime percentages or trends from unavailable data.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /admin/dashboard.kpis` | KPI cards | Render backend counts/status | Fixture trend percentages |
| `administrators[]` | admin governance rows | Use backend identity/status fields | Last active if unsupported |
| `recent_activity[]` | activity log | Format audit actions/timestamps | Narrative fixture events |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate the Super Admin dashboard with the dashboard aggregate endpoint and normalize fixture-only metrics/actions.

**Current behavior:**
The Super Admin dashboard is still primarily fixture-backed. KPI cards, administrator governance rows, Facility governance rows, system status, and recent activity are not loaded from the verified dashboard aggregate. Some reference copy/actions imply trends, export behavior, add-admin shortcuts, or percentages that are not part of the current backend contract.

**Desired behavior:**
The dashboard should load from the Super Admin dashboard aggregate and render only backend-supported values. KPI cards should reflect aggregate counts/status without invented trend percentages. Administrator and Facility governance sections should use the aggregate rows and preserve active/inactive or coverage/status language. Recent activity should format audit activity from the aggregate rather than narrative fixture events. Export and add-admin actions should be disabled/deferred or route only to implemented pages, with visible disabled state where backend support is absent. Loading, empty, and error states should keep the Super Admin layout stable and provide retry behavior.

**Key interfaces:**
- `GET /admin/dashboard` — source of truth for dashboard KPIs, system status, administrator rows, Facility governance rows, and recent activity.
- Dashboard KPI aggregate — should drive user, Facility, reservation, and system-status cards without fabricating trends.
- Administrator aggregate rows — should drive governance table/card identity and active-state labels.
- Facility governance aggregate rows — should drive Facility governance display, assignment coverage, and issue/status badges.
- Recent activity aggregate rows — should map audit action/timestamp/actor/resource data into compact activity list items.

**Acceptance criteria:**
- [x] Dashboard loads KPI values, system status, administrators, Facility governance rows, and recent activity from `GET /admin/dashboard`.
- [x] Unsupported trends, uptime percentages, export action, and add-admin shortcuts are disabled/deferred or routed only to implemented pages.
- [x] Loading, missing-section/empty, and recoverable error states preserve the approved Super Admin layout.
- [x] Vitest/RTL tests cover dashboard render, missing sections, error recovery, and deferred action behavior.
- [x] Super Admin dashboard screenshots remain green or are updated only for intentional backend-contract normalization.

**Out of scope:**
- Backend route/schema changes unless a verified contract mismatch blocks the integration.
- Implementing report export, add-admin creation, or dashboard trend/percentage analytics.
- Integrating non-dashboard Super Admin pages beyond routes needed for existing navigation.

## Update Log

- 2026-05-13: Integrated the Super Admin dashboard with `GET /admin/dashboard` for KPI values, administrator rows, Facility governance rows, and recent audit activity.
- 2026-05-13: Normalized unsupported trend/export/add-admin behavior by removing fixture trends and marking export/add-admin actions as deferred.
- 2026-05-13: Added stable loading, empty, and recoverable error states; added RTL tests for aggregate rendering, missing sections, retry, and deferred actions.
- 2026-05-13: Updated Super Admin dashboard Playwright API mocks and refreshed intentional dashboard screenshots.
- 2026-05-13: Verification: `npm test -- --run src/pages/super-admin/SuperAdminDashboardUsersPages.test.tsx`, `npm run typecheck`, and `npx playwright test tests/e2e/super-admin-dashboard-users.spec.ts` pass. `npm run lint` still fails on pre-existing unrelated Student/auth lint errors; no Super Admin dashboard files are reported.
