# Super 03 Laporan

## Reference

- HTML: `docs/frontend/html-reference/Super - 03 - Laporan.html`
- Desktop screenshot: `docs/frontend/screenshots/super-03-laporan-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/super-03-laporan-mobile.png`
- Reference label: `Super - 03 - Laporan`

## Route Contract

- Proposed route: `/super-admin/reports`
- Detail route: `/super-admin/reports/logs`
- Auth/role: `super_admin`
- Unauthorized behavior: redirect to login; reject student/staff roles.
- Redirect behavior: moderation actions remain under `/super-admin/reports`; full audit log review opens `/super-admin/reports/logs`.

## Purpose

- User job: review reservation/report metrics, audit activity, exports, and review moderation.
- Entry points: Super Admin shell `Laporan` nav, dashboard export/log links.
- Exit points: export, audit detail, review moderation actions.

## Design Contract

- Layout: KPI cards, reservation line/area trend chart, capped audit log preview panel, moderation table/cards.
- Desktop behavior: KPI row, chart/log split, moderation table.
- Mobile behavior: stacked KPI cards, chart, activity cards, moderation cards.
- Required copy/status labels: preserve `Laporan`, `Ekspor Laporan`, `Moderasi Ulasan`, `Perlu Tinjauan`.
- Source-of-truth notes: chart is visual summary; underlying values must remain text-accessible in implementation.

## UX Behavior

- Primary actions: moderate review. Export report remains deferred unless a backend export contract is added.
- Secondary actions: date range, trend granularity (`Mingguan`, `Bulanan`, `Tahunan`), full audit log link when more than 10 logs exist.
- Loading state: KPI/chart/log skeletons.
- Empty state: no audit rows or no moderation items.
- Error state: retry panel.
- Disabled state: export disabled while generating.

## Accessibility

- KPI/chart values need text labels.
- Audit log timestamps and action summaries are visible text.
- Review moderation statuses are text-visible.

## Data And Fixture Contract

- Deterministic fixture requirements: weekly/monthly/yearly reservation trend, audit events, moderation rows.
- Real entities: audit logs, admin review moderation, reservation/payment aggregates.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed: `GET /admin/reports/aggregate`, `GET /admin/audit-logs`, `GET /admin/reviews`, review delete/restore endpoints.
- Page-needed fields: reservation counts/trends, revenue totals, audit log rows, moderation rows.
- Trend behavior: backend daily trend points stay daily in `Mingguan`, group by week in `Bulanan`, and group by month in `Tahunan`; the line/area chart uses sparse axis labels plus hover/focus point detail.
- Audit behavior: `/super-admin/reports` filters audit preview by the selected report date range and renders a maximum of 10 rows. `/super-admin/reports/logs` consumes the same audit endpoint without the report date range to show the complete administrative log list.
- Auth/session assumptions: super-admin bearer token.
- Source files: `app/api/routes/audit_log_routes.py`, `app/api/routes/review_routes.py`.

### BG-SUPER-03-01: Super Admin Report Aggregates

- Status: `resolved`
- Domain area: Super Admin
- Affected UI: report KPI cards and reservation trend chart.
- Contract implemented: aggregate report metrics with date-range Reservation KPIs, status counts, trend data, and paid Reservation totals. Report export remains out of scope.
- Evidence: `app/api/routes/super_admin_report_routes.py` registers `GET /admin/reports/aggregate`; `tests/test_super_admin_reports.py` verifies date filtering, status counts, trend data, paid totals, and non-admin denial; `tests/test_http_application.py` verifies audit/review routes remain and no export route exists.
- Source issue/PRD: `docs/issues/ISSUE-0015-super-admin-review-moderation-and-audit-logs.md`.

### BG-SUPER-03-02: Super Admin Audit And Review Moderation

- Status: `resolved`
- Domain area: Super Admin
- Affected UI: audit log and moderation rows.
- Contract needed: audit log list and review moderation list/actions.
- Evidence: `GET /admin/audit-logs`, `GET /admin/reviews`, delete, and restore routes exist.
- Source issue/PRD: `docs/issues/ISSUE-0015-super-admin-review-moderation-and-audit-logs.md`.

### BG-SUPER-03-03: Report Export Action

- Status: `deferred`
- Domain area: Super Admin
- Affected UI: report page header export action.
- Contract needed: report export endpoint, file format, date-range input, authorization, and download/progress behavior.
- Evidence: aggregate report routes are implemented, but tests verify no export route exists. The frontend marks export as deferred.
- Source issue/PRD: `docs/issues/ISSUE-0063-contract-audit-and-fixture-normalization.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-super-admin-shell.md`
- `docs/frontend/per-component-brief/super-kpi-card.md`
- `docs/frontend/per-component-brief/activity-log-item.md`
- `docs/frontend/per-component-brief/mobile-card-list.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: moderation actions update row status, audit preview is capped at 10 rows, full audit log route renders the complete list, and trend line points expose dates/counts/revenue through labels and hover/focus text.

## Open Questions

- Report export remains out of scope until separately scoped.
