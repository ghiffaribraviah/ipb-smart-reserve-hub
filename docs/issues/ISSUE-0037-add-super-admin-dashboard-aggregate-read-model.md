---
id: ISSUE-0037
type: issue
title: Add Super Admin dashboard aggregate read model
status: done
category: enhancement
agent_mode: AFK
area:
  - backend
  - super-admin
prd: PRD-0003
blocked_by:
  - ISSUE-0035
  - ISSUE-0036
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0037: Add Super Admin dashboard aggregate read model

## Parent

PRD-0003

## What to build

Add a Super Admin dashboard aggregate endpoint/read model that returns dashboard KPIs, administrator governance rows, and recent activity by composing existing system status, audit/activity, user, and Facility governance facts.

## Acceptance criteria

- [x] Super Admin can fetch dashboard aggregate data from one stable backend contract.
- [x] Dashboard aggregate includes total users, active Facilities, Reservation totals, and system health values needed by the dashboard.
- [x] Dashboard aggregate includes administrator governance rows derived from user management data.
- [x] Dashboard aggregate includes recent activity using existing audit/activity data where available.
- [x] Student and staff users cannot access the Super Admin dashboard aggregate.
- [x] The implementation does not rebuild system status, booking settings, audit logs, review moderation, user listing, or Facility governance behavior.
- [x] Frontend backend gap documentation updates `BG-SUPER-00-01` when implemented.

## Blocked By

- ISSUE-0035
- ISSUE-0036

## Implementation Notes

- Compose existing read models where possible instead of duplicating query logic.
- Keep dashboard response focused on the current frontend page needs.

## Triage Notes

2026-05-13: Triaged as a Super Admin backend enhancement now unblocked by ISSUE-0035 and ISSUE-0036. User listing, Facility governance, system status, and audit logs exist; dashboard should compose those facts into one stable read contract.

## Agent Brief

Implement through vertical TDD against the public Super Admin API.

Scope:

- Add one dashboard aggregate endpoint for Super Admin.
- Include KPI values for total users, active Facilities, total Reservations, and system health.
- Include administrator governance rows derived from Super Admin user accounts.
- Include recent activity derived from existing audit logs where available.
- Reuse existing user list, Facility governance, system status, and audit log boundaries where practical; do not rebuild their standalone endpoints.
- Enforce Super Admin-only access.
- Update `BG-SUPER-00-01` when implemented.

Suggested first behavior test:

- Super Admin can fetch `GET /admin/dashboard` and receives KPI, administrator, and recent activity sections.

Evidence to record when closing:

- Targeted API tests for aggregate shape/data and non-admin denial.
- Documentation update in `super-00-dashboard.md` and backend gap ledger.

## Update Log

2026-05-13: Implemented and verified Super Admin dashboard aggregate read model.

- Code evidence: `app/api/routes/super_admin_dashboard_routes.py` adds `GET /admin/dashboard`; `app/services/super_admin_dashboard.py` composes user listing, Facility governance, system status, audit logs, and Reservation count into a dashboard aggregate.
- API behavior evidence: `tests/test_super_admin_dashboard.py` verifies KPI values, system status, administrator governance rows, Facility governance composition, recent audit activity, and student/staff denial.
- Wiring evidence: `tests/test_http_application.py` verifies the dashboard route is registered through the runtime dependency registry and default app build.
- Documentation evidence: `docs/frontend/per-page-brief/super-00-dashboard.md`, `docs/frontend/backend-gaps.md`, and `README.md` document the implemented dashboard contract.
- Test command: `uv run pytest tests/test_super_admin_dashboard.py tests/test_http_application.py` passed with 7 tests.
