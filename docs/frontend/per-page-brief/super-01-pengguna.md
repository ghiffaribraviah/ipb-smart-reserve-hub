# Super 01 Pengguna

## Reference

- HTML: `docs/frontend/html-reference/Super - 01 - Pengguna.html`
- Desktop screenshot: `docs/frontend/screenshots/super-01-pengguna-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/super-01-pengguna-mobile.png`
- Reference label: `Super - 01 - Pengguna`

## Route Contract

- Proposed route: `/super-admin/users`
- Auth/role: `super_admin`
- Unauthorized behavior: redirect to login; reject student/staff roles.
- Redirect behavior: create/detail actions remain under `/super-admin/users`.

## Purpose

- User job: browse and manage student, staff, and Super Admin accounts.
- Entry points: Super Admin shell `Pengguna` nav, dashboard `Tambah Admin`.
- Exit points: create user, manage access, activate/deactivate user.

## Design Contract

- Layout: Super Admin shell, KPI cards, filter toolbar, dense user table/cards.
- Desktop behavior: KPI row, inline filters, table.
- Mobile behavior: stacked actions, KPI cards, filters, and user cards.
- Required copy/status labels: preserve `Pengguna`, `Tambah Pengguna`, `Aktif`, `Nonaktif`.
- Source-of-truth notes: use Super Admin indigo accent.

## UX Behavior

- Primary actions: add user.
- Secondary actions: export, filter, detail/manage access.
- Loading state: KPI/table skeletons.
- Empty state: no matching users.
- Error state: retry user list.
- Disabled state: unavailable role/status actions disabled with clear state.

## Accessibility

- Table headers/card labels identify user, role, unit, status, and action.
- Status badges are text-visible.
- Filters have labels in implementation.

## Data And Fixture Contract

- Deterministic fixture requirements: mixed role/status users and KPI counts.
- Real entities: user accounts and academic/staff profile metadata.
- Fixture media: initials/avatar only.

## Backend Integration And Gaps

- Endpoints consumed: `POST /admin/users`, `GET /admin/users`, `POST /admin/users/:userId/deactivate`, `POST /admin/users/:userId/activate`.
- Page-needed fields: user identity, role, unit/profile, active status. Last activity and profile-review flags are deferred unless a backend field is added.
- Auth/session assumptions: super-admin bearer token.
- Source files: `app/api/routes/account_routes.py`.

### BG-SUPER-01-01: Super Admin User Management Read Model

- Status: `resolved`
- Domain area: Super Admin
- Affected UI: user list, filters, KPI counts, activate/manage-access actions.
- Contract implemented: paginated/filterable user list plus activate/deactivate user status mutation endpoints. Role mutation remains out of scope.
- Evidence: `app/api/routes/account_routes.py` registers `GET /admin/users`, `POST /admin/users/{user_id}/deactivate`, and `POST /admin/users/{user_id}/activate`; `tests/test_super_admin_user_management.py` verifies filters, pagination, student profile fields, activation/deactivation, active-session enforcement, and non-admin denial.
- Source issue/PRD: `docs/issues/ISSUE-0001-project-foundation-auth-and-role-shell.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-super-admin-shell.md`
- `docs/frontend/per-component-brief/super-kpi-card.md`
- `docs/frontend/per-component-brief/mobile-card-list.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: filters and actions preserve user role language internally while visible copy stays Indonesian.

## Open Questions

- None.
