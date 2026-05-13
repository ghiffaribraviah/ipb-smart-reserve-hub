---
id: ISSUE-0081
type: issue
title: Super Admin reports integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0078
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0081: Super Admin reports integration

## Parent

PRD-0005

## What to build

Wire Super Admin reports to backend aggregate reports, audit logs, and review moderation endpoints.

## Acceptance criteria

- [x] Reports page loads aggregate KPI, status count, trend, and paid total data for a date range.
- [x] Audit log panel loads backend audit rows and formats timestamps visibly.
- [x] Review moderation rows load from backend review moderation endpoint.
- [x] Review delete/restore actions submit to backend and update/refetch rows.
- [x] Report export action is disabled or deferred unless separately scoped.
- [x] Vitest/RTL tests cover aggregate render, date range params, audit rows, moderation rows, delete/restore actions, deferred export, empty states, and error recovery.
- [x] Super Admin reports screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0078

## Implementation Notes

- Ensure chart values remain text-accessible.
- Keep review moderation actions scoped to supported delete/restore behavior.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /admin/reports/aggregate` | report KPI/chart | Render backend values | Export file generation |
| `GET /admin/audit-logs[]` | audit list | Format action type and timestamp | Human-written fixture sentences |
| `GET /admin/reviews[]` | moderation rows | Use review deletion state and reason | Appeal workflow |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate Super Admin reports with aggregate report, audit log, and review moderation backend contracts.

**Current behavior:**
The `/super-admin/reports` page is fixture-backed. KPI cards, chart bars, audit activity, and moderation rows are deterministic frontend data, while export is visually available but not backed by an export endpoint.

**Desired behavior:**
The page should load aggregate report data for a selected date range, pass that same date range to audit log queries, and load review moderation rows from backend review endpoints. Audit timestamps should be formatted visibly. Review delete/restore actions should call the supported backend endpoints and refresh visible moderation rows. Export must remain disabled/deferred because `/admin/reports/export` is not currently registered. Loading, empty, and error states should preserve the page layout and include retry for recoverable failures.

**Key interfaces:**
- `GET /admin/reports/aggregate?start=&end=` returns KPI totals, status counts, and trend points.
- `GET /admin/audit-logs?created_from=&created_to=` returns audit rows.
- `GET /admin/reviews` returns review moderation rows.
- `POST /admin/reviews/:reviewId/delete` with `{ reason }` deletes a review as admin.
- `POST /admin/reviews/:reviewId/restore` restores an admin-deleted review.

**Acceptance criteria:**
- [x] Reports page loads aggregate KPI, status count, trend, and paid total data for a date range.
- [x] Date range controls send supported aggregate and audit query params.
- [x] Audit log panel loads backend audit rows and formats timestamps visibly.
- [x] Review moderation rows load from backend review moderation endpoint.
- [x] Review delete/restore actions submit to backend and update/refetch rows.
- [x] Report export action is disabled or deferred unless separately scoped.
- [x] Vitest/RTL tests cover aggregate render, date range params, audit rows, moderation rows, delete/restore actions, deferred export, empty states, and error recovery.
- [x] Super Admin reports screenshots remain green or are updated only for intentional normalization.

**Out of scope:**
- Report file generation/export.
- Review appeal workflow or staff/student review editing.
- Backend route/schema changes unless a verified contract mismatch blocks the integration.

## Update Log

- 2026-05-13: Integrated `/super-admin/reports` with `GET /admin/reports/aggregate`, `GET /admin/audit-logs`, and `GET /admin/reviews`; added date range controls, accessible trend labels, status counts, formatted audit timestamps, and backend review moderation rows.
- 2026-05-13: Wired review delete/restore buttons to `POST /admin/reviews/:id/delete` and `/restore`, with success/error feedback and review refetch. Kept report export deferred.
- 2026-05-13: Verification: `npm test -- --run src/pages/super-admin/SuperAdminDashboardUsersPages.test.tsx`, `npm run typecheck`, and `npx playwright test tests/e2e/super-admin-facilities-reports.spec.ts` passed. `npm run lint` still fails only in pre-existing auth/student files, with no Super Admin files reported.
