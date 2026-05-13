---
id: ISSUE-0059
type: issue
title: Super Admin facilities and reports pages
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

# ISSUE-0059: Super Admin facilities and reports pages

## Parent

PRD-0004

## What to build

Implement Super Admin fasilitas and laporan pages with deterministic Facility governance, assignment issue, report aggregate, audit log, review moderation, and export fixtures.

## Acceptance criteria

- [x] Fasilitas page matches `Super - 02 - Fasilitas`.
- [x] Laporan page matches `Super - 03 - Laporan`.
- [x] Governance tables/cards, report trends, audit events, moderation rows, filters, and actions match references.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify both pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Governance rows, trend sections, audit rows, review moderation controls, and export actions do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0043

## Implementation Notes

- Use Facility governance and audit/review moderation vocabulary from existing docs.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0041` and `ISSUE-0043` are done, the Super Admin fasilitas and laporan page briefs exist, required screenshots and HTML references are present, shared Super Admin shell/KPI/mobile-card/status component briefs exist, and no `.out-of-scope` entry conflicts with this Facility governance/reporting slice. Proceed with deterministic fixture-backed visual implementation only; backend API wiring and real export actions are out of scope for this issue.

## Agent Brief

**Category:** enhancement
**Summary:** Build the Super Admin fasilitas and laporan pages from the Super 02 and Super 03 references.

**Current behavior:**
The Super Admin dashboard and pengguna routes exist, but the Facility oversight and reporting destinations are not yet implemented as product pages.

**Desired behavior:**
Super Admin users should have deterministic fixture-backed pages for `/super-admin/facilities` and `/super-admin/reports`. The fasilitas page should show Facility governance KPIs, Facility rows/cards, staff assignment coverage, issue flags, and assignment actions. The laporan page should show report KPI cards, reservation trend data, audit activity, review moderation rows/cards, filters, and export actions. Both pages must preserve the Super Admin indigo accent and stack cleanly on mobile.

**Key interfaces:**
- Super Admin shell route/content composition — fasilitas and laporan pages mount inside the Super Admin shell with the correct active navigation item.
- Facility governance fixture read model — includes active/inactive Facilities, location/unit/capacity metadata, assigned staff count, assignment issue flags, and assignment actions.
- Report/audit/moderation fixture read model — includes KPI aggregates, text-accessible trend values, audit events, moderation rows, review statuses, and export/date-range controls.
- Governance, trend, audit, moderation, and mobile-card presentation — long facility names, units, audit text, reviewer names, statuses, and action rows must wrap cleanly on mobile.

**Acceptance criteria:**
- [x] `/super-admin/facilities` matches `Super - 02 - Fasilitas` at desktop and mobile viewports.
- [x] `/super-admin/reports` matches `Super - 03 - Laporan` at desktop and mobile viewports.
- [x] Governance tables/cards, report trends, audit events, moderation rows, filters, and actions match references.
- [x] No backend API calls are introduced; deterministic fixtures drive both pages.
- [x] Playwright screenshots cover both pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Governance rows, trend sections, audit rows, review moderation controls, and export actions do not overlap incoherently.

**Out of scope:**
- Backend API integration for Facility governance, report aggregates, audit logs, review moderation, or export generation.
- Facility creation/import, assignment mutation persistence, review delete/restore behavior, and audit detail flows.
- Super Admin system/settings page.

## Update Log

- 2026-05-13: Implemented deterministic fixture-backed Super Admin fasilitas and laporan routes at `/super-admin/facilities` and `/super-admin/reports`. Added Facility governance KPIs, Facility cards/rows, assignment coverage panel, report KPI cards, text-accessible trend chart, audit activity, and review moderation table/mobile cards with desktop/mobile Playwright screenshot coverage. Verified `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` with 84 passing tests.
