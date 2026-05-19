# Super 04 Sistem

## Reference

- HTML: `docs/frontend/html-reference/Super - 04 - Sistem.html`
- Desktop screenshot: `docs/frontend/screenshots/super-04-sistem-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/super-04-sistem-mobile.png`
- Reference label: `Super - 04 - Sistem`

## Route Contract

- Proposed route: `/super-admin/system`
- Auth/role: `super_admin`
- Unauthorized behavior: redirect to login; reject student/staff roles.
- Redirect behavior: settings save remains on system page.

## Purpose

- User job: monitor backend health and edit booking/system settings.
- Entry points: Super Admin shell `Sistem` nav.
- Exit points: save settings, view settings history.

## Design Contract

- Layout: system KPI cards, status service list, booking settings card.
- Desktop behavior: KPI row, status/settings split.
- Mobile behavior: stacked KPI cards, service cards, settings form.
- Required copy/status labels: preserve `Sistem`, `Simpan Pengaturan`, `Status Layanan`, `Aturan Booking`.
- Source-of-truth notes: use Super Admin logo-green primary actions and clear service status badges.

## UX Behavior

- Primary actions: save settings.
- Secondary actions: view history.
- Loading state: status/settings skeletons.
- Empty state: missing status details display quiet unavailable values.
- Error state: retry status or settings panel.
- Disabled state: save disabled when settings are unchanged or invalid.

## Accessibility

- Service health statuses are text-visible.
- Settings controls have explicit labels.
- Toggle has accessible checked state in implementation.

## Data And Fixture Contract

- Deterministic fixture requirements: API/database/storage/worker status labels and booking-setting values. Avoid unsupported percentage uptime claims unless backed by the system-status contract.
- Real entities: system status and booking settings.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed: `GET /admin/system-status`, `GET /admin/settings`, `PATCH /admin/settings`.
- Page-needed fields: status checks, storage/worker/database health, booking deadline/cutoff/email-domain settings.
- Auth/session assumptions: super-admin bearer token.
- Source files: `app/api/routes/system_status_routes.py`, `app/api/routes/booking_setting_routes.py`.

### BG-SUPER-04-01: Super Admin System Status And Settings

- Status: `resolved`
- Domain area: Super Admin
- Affected UI: service health list and booking settings form.
- Contract needed: system status read model and booking settings read/update endpoints.
- Evidence: `GET /admin/system-status`, `GET /admin/settings`, and `PATCH /admin/settings` exist.
- Source issue/PRD: `docs/issues/ISSUE-0005-booking-settings-management.md`, `docs/issues/ISSUE-0017-optional-system-status.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-super-admin-shell.md`
- `docs/frontend/per-component-brief/super-kpi-card.md`
- `docs/frontend/per-component-brief/ui-form-controls.md`
- `docs/frontend/per-component-brief/ui-button.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: invalid settings show visible errors and successful save preserves current values.

## Open Questions

- Settings history route is not currently defined.
