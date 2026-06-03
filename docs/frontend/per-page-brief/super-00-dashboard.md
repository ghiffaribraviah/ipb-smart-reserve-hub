# Super 00 Dashboard

## Reference

- HTML: `docs/frontend/html-reference/Super - 00 - Dashboard.html`
- Desktop screenshot: `docs/frontend/screenshots/super-00-dashboard-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/super-00-dashboard-mobile.png`
- Reference label: `Super - 00 - Dashboard`

## Route Contract

- Proposed route: `/super-admin`
- Auth/role: `super_admin`
- Unauthorized behavior: redirect to login; reject student/staff roles.
- Redirect behavior: nav links to future Super Admin pages stay under `/super-admin`.

## Purpose

- User job: monitor system-level KPIs, administrator governance, and recent activity.
- Entry points: super-admin login landing.
- Exit points: `Pengguna`, `Fasilitas`, `Laporan`, and `Sistem` Super Admin pages.

## Design Contract

- Layout: Super Admin shell with fixed header, four KPI cards, governance table/cards, and a visually distinct activity log.
- Desktop behavior: KPI grid, admin governance plus activity in two columns, then facility governance.
- Mobile behavior: stacked KPI cards, governance table converted to cards, compact activity list.
- Required copy/status labels: preserve `Dashboard`, `Pengguna`, `Fasilitas`, `Laporan`, `Sistem`, `Ekspor Laporan`, `Tambah Pengguna`.
- Source-of-truth notes: use logo green Super Admin accent for primary actions/profile affordance.

## UX Behavior

- Primary actions: export the loaded dashboard summary as CSV and route account creation to the unified Pengguna page.
- Secondary actions: navigate dashboard sections.
- Loading state: KPI/table/activity skeletons.
- Empty state: no admins or no activity.
- Error state: retry individual panels.
- Disabled state: unavailable backend-backed actions remain disabled with visible state.

## Accessibility

- KPI values need text labels.
- Governance table/card labels must remain semantic on mobile.
- Activity log timestamps must be text-visible.
- Icon buttons require names.

## Data And Fixture Contract

- Deterministic fixture requirements: KPI values, admin governance rows, activity events.
- Real entities: system status, users/admins, facilities/reservations counts, audit logs.
- Fixture media: initials-only profile affordances.

## Backend Integration And Gaps

- Endpoints consumed: `GET /admin/dashboard`; underlying standalone endpoints include `GET /admin/system-status`, `GET /admin/audit-logs`, `GET /admin/users`, and `GET /admin/facilities/governance`.
- Page-needed fields: total users, active facilities, reservation total, system status, administrator list/status, access-state note, activity log entries.
- Auth/session assumptions: super-admin bearer token.
- Source files: `backend/app/api/routes/system_status_routes.py`, `backend/app/api/routes/audit_log_routes.py`, `backend/app/api/routes/account_routes.py`.

### BG-SUPER-00-01: Super Admin Dashboard Read Model

- Status: `resolved`
- Domain area: Super Admin
- Affected UI: KPI cards, administrator governance table, activity log.
- Contract implemented: dashboard aggregate read model with KPI values, system status, administrator rows, Facility governance rows, and recent audit activity.
- Evidence: `backend/app/api/routes/super_admin_dashboard_routes.py` registers `GET /admin/dashboard`; `backend/tests/test_super_admin_dashboard.py` verifies KPI values, administrator governance rows, Facility governance composition, recent activity, and non-admin denial.
- Source issue/PRD: `docs/issues/ISSUE-0015-super-admin-review-moderation-and-audit-logs.md`, `docs/issues/ISSUE-0017-optional-system-status.md`.

### BG-SUPER-00-02: Dashboard Export Action

- Status: `resolved`
- Domain area: Super Admin
- Affected UI: dashboard header export action.
- Contract implemented: client-side CSV export from the loaded `GET /admin/dashboard` read model. Account creation uses the unified `/super-admin/users` create-user form instead of a redundant dashboard-only add-admin action.
- Evidence: `frontend/src/pages/super-admin/SuperAdminDashboardUsersPages.test.tsx` verifies dashboard CSV export and the `Tambah Pengguna` link to `/super-admin/users`.
- Source issue/PRD: `docs/issues/ISSUE-0063-contract-audit-and-fixture-normalization.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-super-admin-shell.md`
- `docs/frontend/per-component-brief/super-kpi-card.md`
- `docs/frontend/per-component-brief/super-governance-table.md`
- `docs/frontend/per-component-brief/activity-log-item.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: existing system status/audit calls can populate partial data; unresolved dashboard aggregate gaps are tracked before full integration.
- Admin governance rows and activity log entries are visually distinguishable so the page does not read as two competing tables.

## Open Questions

- None.
