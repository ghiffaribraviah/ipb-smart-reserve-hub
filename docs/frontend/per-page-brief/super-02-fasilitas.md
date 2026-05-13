# Super 02 Fasilitas

## Reference

- HTML: `docs/frontend/html-reference/Super - 02 - Fasilitas.html`
- Desktop screenshot: `docs/frontend/screenshots/super-02-fasilitas-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/super-02-fasilitas-mobile.png`
- Reference label: `Super - 02 - Fasilitas`

## Route Contract

- Proposed route: `/super-admin/facilities`
- Auth/role: `super_admin`
- Unauthorized behavior: redirect to login; reject student/staff roles.
- Redirect behavior: facility and assignment actions stay under `/super-admin/facilities`.

## Purpose

- User job: oversee facility inventory and staff assignment coverage across units.
- Entry points: Super Admin shell `Fasilitas` nav.
- Exit points: add facility, assign staff, open facility governance details.

## Design Contract

- Layout: Super Admin shell, facility KPI cards, facility list/cards, assignment sidebar.
- Desktop behavior: KPI row then list/sidebar.
- Mobile behavior: stacked actions, KPI cards, facility cards, assignment cards.
- Required copy/status labels: preserve `Fasilitas`, `Tambah Fasilitas`, `Butuh Staff`, `Aktif`, `Nonaktif`.
- Source-of-truth notes: use deterministic facility thumbnails and Super Admin indigo primary actions.

## UX Behavior

- Primary actions: add facility.
- Secondary actions: import, view all, manage assignment.
- Loading state: KPI/list/assignment skeletons.
- Empty state: no facilities or no assignment issues.
- Error state: retry panels.
- Disabled state: assignment actions disabled when backend capability is unavailable.

## Accessibility

- Facility cards have text facility names and status labels.
- Assignment statuses are text-visible.
- Action buttons identify target facility.

## Data And Fixture Contract

- Deterministic fixture requirements: active, inactive, and unassigned facilities.
- Real entities: facilities, staff assignments, organization units.
- Fixture media: deterministic facility thumbnails.

## Backend Integration And Gaps

- Endpoints consumed: `GET /admin/facilities/governance` plus existing assignment mutation endpoints.
- Page-needed fields: facility identity, location/unit, capacity, active state, assigned staff count, assignment issue flags.
- Auth/session assumptions: super-admin bearer token.
- Source files: `app/api/routes/facility_management_routes.py`.

### BG-SUPER-02-01: Super Admin Facility Governance Read Model

- Status: `resolved`
- Domain area: Super Admin
- Affected UI: facility governance list, KPI cards, assignment coverage sidebar.
- Contract implemented: Super Admin Facility governance list with active/inactive Facilities, assignment coverage, active assigned staff counts, and issue flags. Facility create/import remains out of scope.
- Evidence: `app/api/routes/facility_management_routes.py` registers `GET /admin/facilities/governance`; `tests/test_super_admin_facility_governance.py` verifies active/inactive governance rows, assignment counts, issue flags, and non-admin denial; `tests/test_http_application.py` verifies assignment mutation routes remain and no import route exists.
- Source issue/PRD: `docs/issues/ISSUE-0016-staff-facility-management-and-assignment-scope.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-super-admin-shell.md`
- `docs/frontend/per-component-brief/super-kpi-card.md`
- `docs/frontend/per-component-brief/mobile-card-list.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: assignment actions respect Super Admin role and facility IDs.

## Open Questions

- None.
