---
id: ISSUE-0038
type: issue
title: Add Super Admin report aggregate read model
status: done
category: enhancement
agent_mode: AFK
area:
  - backend
  - super-admin
prd: PRD-0003
blocked_by: []
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0038: Add Super Admin report aggregate read model

## Parent

PRD-0003

## What to build

Add Super Admin report aggregate data for the reports page, including KPI and trend values for Reservations and revenue-style reporting. Audit logs and review moderation already exist and should remain dependencies rather than rebuilt behavior.

## Acceptance criteria

- [x] Super Admin can fetch report aggregate data for the reports page.
- [x] Report aggregate includes Reservation counts and status-oriented KPI values needed by the page.
- [x] Report aggregate includes trend data suitable for the reports chart.
- [x] Report aggregate includes revenue or paid-Facility totals where supported by existing Reservation/payment facts.
- [x] Report aggregate supports date-range filtering where useful for the returned metrics.
- [x] Student and staff users cannot access Super Admin report aggregate endpoints.
- [x] Existing audit log and review moderation endpoints continue to provide audit/moderation rows.
- [x] Report export is not added unless separately scoped later.
- [x] Frontend backend gap documentation updates `BG-SUPER-03-01` when implemented.

## Blocked By

None - can start immediately.

## Implementation Notes

- Keep this focused on aggregates and trends, not export generation.
- Reuse existing audit and review moderation contracts rather than folding their full row data into this issue.

## Triage Notes

2026-05-13: Triaged as an unblocked Super Admin backend enhancement. Existing audit log and review moderation endpoints are resolved; this issue should add only aggregate Reservation/report metrics and not export generation.

## Agent Brief

Implement through vertical TDD against the public Super Admin API.

Scope:

- Add a Super Admin report aggregate endpoint with date-range filtering.
- Include Reservation count KPIs, status-oriented counts, trend data for charting, and paid/revenue totals from Reservation payment facts.
- Preserve existing audit log and review moderation endpoints as separate dependencies.
- Do not add report export behavior.
- Enforce Super Admin-only access.
- Update `BG-SUPER-03-01` when implemented.

Suggested first behavior test:

- Super Admin can fetch `GET /admin/reports/aggregate` for a date range and receives KPI, status count, trend, and revenue totals.

Evidence to record when closing:

- Targeted API tests for aggregate values, date filtering, non-admin denial, existing audit/review route preservation, and no export route.
- Documentation update in `super-03-laporan.md` and backend gap ledger.

## Update Log

2026-05-13: Implemented and verified Super Admin report aggregate read model.

- Code evidence: `app/api/routes/super_admin_report_routes.py` adds `GET /admin/reports/aggregate`; `app/services/super_admin_reports.py` computes date-filtered Reservation KPIs, status counts, trend points, and paid Reservation totals.
- API behavior evidence: `tests/test_super_admin_reports.py` verifies date-range filtering, status-oriented KPI values, trend data, paid totals, and student/staff denial.
- Scope evidence: `tests/test_http_application.py` verifies existing audit/review routes remain registered and no `/admin/reports/export` route exists.
- Documentation evidence: `docs/frontend/per-page-brief/super-03-laporan.md`, `docs/frontend/backend-gaps.md`, and `README.md` document the implemented report aggregate contract.
- Test command: `uv run pytest tests/test_super_admin_reports.py tests/test_http_application.py` passed with 7 tests.
