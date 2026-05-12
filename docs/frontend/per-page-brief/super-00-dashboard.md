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
- Exit points: user, facility, report, system pages when implemented.

## Design Contract

- Layout: Super Admin shell with fixed header, four KPI cards, governance table/cards, and activity log.
- Desktop behavior: KPI grid then two-column content.
- Mobile behavior: stacked KPI cards, governance table converted to cards, compact activity list.
- Required copy/status labels: preserve `Dashboard`, `Pengguna`, `Fasilitas`, `Laporan`, `Sistem`, `Ekspor Laporan`, `Tambah Admin`.
- Source-of-truth notes: use indigo Super Admin accent for primary actions/profile affordance.

## UX Behavior

- Primary actions: add admin, export report.
- Secondary actions: navigate dashboard sections.
- Loading state: KPI/table/activity skeletons.
- Empty state: no admins or no activity.
- Error state: retry individual panels.
- Disabled state: future nav destinations may be disabled until designed/implemented.

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

- Endpoints consumed: existing partial endpoints include `GET /admin/system-status`, `GET /admin/audit-logs`, `POST /admin/users`; proposed dashboard aggregate/admin list endpoints are not present.
- Page-needed fields: total users, active facilities, reservation total, system health, administrator list/status, activity log entries.
- Auth/session assumptions: super-admin bearer token.
- Source files: `app/api/routes/system_status_routes.py`, `app/api/routes/audit_log_routes.py`, `app/api/routes/account_routes.py`.

### BG-SUPER-00-01: Super Admin Dashboard Read Model

- Status: `open`
- Domain area: Super Admin
- Affected UI: KPI cards, administrator governance table, activity log.
- Contract needed: dashboard aggregate read model and administrator list; current backend only exposes partial system status/audit/create-user contracts.
- Evidence: `GET /admin/system-status` and `GET /admin/audit-logs` exist; no user list or dashboard KPI aggregate endpoint was found.
- Source issue/PRD: `docs/issues/ISSUE-0015-super-admin-review-moderation-and-audit-logs.md`, `docs/issues/ISSUE-0017-optional-system-status.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-super-admin-shell.md`
- `docs/frontend/per-component-brief/super-kpi-card.md`
- `docs/frontend/per-component-brief/super-governance-table.md`
- `docs/frontend/per-component-brief/activity-log-item.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: existing system status/audit calls can populate partial data; unresolved dashboard aggregate gaps are tracked before full integration.

## Open Questions

- Future Super Admin pages are tracked in `docs/frontend/missing-design.md`.
