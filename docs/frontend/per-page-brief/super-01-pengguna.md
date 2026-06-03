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
- Entry points: Super Admin shell `Pengguna` nav, dashboard `Tambah Pengguna`.
- Exit points: create user, edit data user, reset password, activate/deactivate user, delete user.

## Design Contract

- Layout: Super Admin shell, KPI cards, inline create-user controls, filter toolbar, dense user table/cards.
- Desktop behavior: KPI row, create-user controls before filters, then table.
- Mobile behavior: stacked actions, KPI cards, create-user controls, filters, and user cards.
- Required copy/status labels: preserve `Pengguna`, `Buat Pengguna`, `Kelola akun`, `Aktif`, `Nonaktif`.
- Source-of-truth notes: use Super Admin logo green accent.

## UX Behavior

- Primary actions: add student, staff, or Super Admin users through the inline create-user form and open `Kelola akun` modal per row/card.
- Secondary actions: client-side CSV export, filter, update status, reset password, and delete eligible accounts.
- Loading state: KPI/table skeletons.
- Empty state: no matching users.
- Error state: retry user list.
- Disabled state: save/delete/reset actions disabled while mutation is pending or confirmation is incomplete.

## Accessibility

- Table headers/card labels identify user, role, unit, status, and action.
- Status badges are text-visible.
- Filters have labels in implementation.

## Data And Fixture Contract

- Deterministic fixture requirements: mixed role/status users and KPI counts.
- Real entities: user accounts and academic/staff profile metadata.
- Fixture media: initials/avatar only.

## Backend Integration And Gaps

- Endpoints consumed: `POST /admin/users`, `GET /admin/users`, `PATCH /admin/users/:userId`, `POST /admin/users/:userId/reset-password`, `DELETE /admin/users/:userId`, `POST /admin/users/:userId/deactivate`, `POST /admin/users/:userId/activate`.
- Page-needed fields: user identity, role, unit/profile, active status. Last activity and profile-review flags are deferred unless a backend field is added.
- Auth/session assumptions: super-admin bearer token.
- Source files: `backend/app/api/routes/account_routes.py`.

### BG-SUPER-01-01: Super Admin User Management Read Model

- Status: `resolved`
- Domain area: Super Admin
- Affected UI: user list, filters, KPI counts, `Kelola akun` modal, create/edit/reset/delete actions.
- Contract implemented: paginated/filterable user list plus create for student, staff, and Super Admin accounts, update basic profile, reset password, delete eligible accounts, and activate/deactivate user status mutation endpoints. Role mutation remains out of scope.
- Evidence: `backend/app/api/routes/account_routes.py` registers `GET /admin/users`, `POST /admin/users`, `PATCH /admin/users/{user_id}`, `POST /admin/users/{user_id}/reset-password`, `DELETE /admin/users/{user_id}`, `POST /admin/users/{user_id}/deactivate`, and `POST /admin/users/{user_id}/activate`; `backend/tests/test_super_admin_user_management.py` verifies filters, pagination, profile fields, Super Admin student creation with NIM/phone, activation/deactivation, profile update, password reset, delete guards for referenced users, active-session enforcement, and non-admin denial. `frontend/src/pages/super-admin/SuperAdminDashboardUsersPages.test.tsx` verifies create-user payloads for student identity fields and CSV export.
- Source issue/PRD: `docs/issues/ISSUE-0001-project-foundation-auth-and-role-shell.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-super-admin-shell.md`
- `docs/frontend/per-component-brief/super-kpi-card.md`
- `docs/frontend/per-component-brief/mobile-card-list.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: filters and actions preserve user role language internally while visible copy stays Indonesian.
- Inline creation appears above search/filter controls; no redundant top-right `Tambah Pengguna` action is shown.
- Row/card actions open `Kelola akun` modal with edit, status, password, and delete controls while preserving activate/deactivate backend calls.

## Open Questions

- None.
