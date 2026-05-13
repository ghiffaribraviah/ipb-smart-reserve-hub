# Super 03 Laporan

## Reference

- HTML: `docs/frontend/html-reference/Super - 03 - Laporan.html`
- Desktop screenshot: `docs/frontend/screenshots/super-03-laporan-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/super-03-laporan-mobile.png`
- Reference label: `Super - 03 - Laporan`

## Route Contract

- Proposed route: `/super-admin/reports`
- Auth/role: `super_admin`
- Unauthorized behavior: redirect to login; reject student/staff roles.
- Redirect behavior: moderation/detail actions remain under `/super-admin/reports`.

## Purpose

- User job: review reservation/report metrics, audit activity, exports, and review moderation.
- Entry points: Super Admin shell `Laporan` nav, dashboard export/log links.
- Exit points: export, audit detail, review moderation actions.

## Design Contract

- Layout: KPI cards, reservation trend chart, audit log panel, moderation table/cards.
- Desktop behavior: KPI row, chart/log split, moderation table.
- Mobile behavior: stacked KPI cards, chart, activity cards, moderation cards.
- Required copy/status labels: preserve `Laporan`, `Ekspor Laporan`, `Moderasi Ulasan`, `Perlu Tinjauan`.
- Source-of-truth notes: chart is visual summary; underlying values must remain text-accessible in implementation.

## UX Behavior

- Primary actions: export report, moderate review.
- Secondary actions: date range, detail links.
- Loading state: KPI/chart/log skeletons.
- Empty state: no audit rows or no moderation items.
- Error state: retry panel.
- Disabled state: export disabled while generating.

## Accessibility

- KPI/chart values need text labels.
- Audit log timestamps and action summaries are visible text.
- Review moderation statuses are text-visible.

## Data And Fixture Contract

- Deterministic fixture requirements: weekly reservation trend, audit events, moderation rows.
- Real entities: audit logs, admin review moderation, reservation/payment aggregates.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed: `GET /admin/reports/aggregate`, `GET /admin/audit-logs`, `GET /admin/reviews`, review delete/restore endpoints.
- Page-needed fields: reservation counts/trends, revenue totals, audit log rows, moderation rows.
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

## Shared Components

- `docs/frontend/per-component-brief/layout-super-admin-shell.md`
- `docs/frontend/per-component-brief/super-kpi-card.md`
- `docs/frontend/per-component-brief/activity-log-item.md`
- `docs/frontend/per-component-brief/mobile-card-list.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: moderation actions update row status and audit rows preserve Indonesian time labels.

## Open Questions

- Report export remains out of scope until separately scoped.
