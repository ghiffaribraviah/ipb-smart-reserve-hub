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

- Layout: Super Admin shell, facility KPI cards, facility governance table/cards, pagination controls, and per-facility staff-assignment modal.
- Desktop behavior: KPI row, users-page-like governance table, then pagination; staff assignment opens as modal from each row.
- Mobile behavior: stacked actions, KPI cards, facility governance cards, pagination, and the same staff-assignment modal per card.
- Required copy/status labels: preserve `Fasilitas`, `Tambah Fasilitas`, `Butuh Staff`, `Aktif`, `Nonaktif`, `Kelola staff`, `Edit Detail`, and archive/deactivate wording.
- Source-of-truth notes: use deterministic facility thumbnails and Super Admin logo-green primary actions.

## UX Behavior

- Primary actions: view facility governance, add a single facility, and manage staff assignment per facility.
- Secondary actions: client-side CSV export, paginate, inspect assigned staff, and manage assignment. Bulk import remains out of scope until a file-format contract is defined.
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

- Endpoints consumed: `GET /admin/facilities/governance`, `POST /admin/facilities`, `GET /facility-categories`, plus existing assignment mutation endpoints.
- Page-needed fields: facility identity, location/unit, capacity, active state, assigned staff count, assignment issue flags.
- Auth/session assumptions: super-admin bearer token.
- Source files: `backend/app/api/routes/facility_management_routes.py`.

### BG-SUPER-02-01: Super Admin Facility Governance Read Model

- Status: `resolved`
- Domain area: Super Admin
- Affected UI: facility governance list, KPI cards, paginated table/card list, and assignment modal.
- Contract implemented: Super Admin Facility governance list with active/inactive Facilities, assignment coverage, active assigned staff counts, and issue flags.
- Evidence: `backend/app/api/routes/facility_management_routes.py` registers `GET /admin/facilities/governance`; `backend/tests/test_super_admin_facility_governance.py` verifies active/inactive governance rows, assignment counts, issue flags, and non-admin denial; `backend/tests/test_http_application.py` verifies assignment mutation routes remain.
- Source issue/PRD: `docs/issues/ISSUE-0016-staff-facility-management-and-assignment-scope.md`.

### BG-SUPER-02-02: Facility Create And Export Actions

- Status: `resolved`
- Domain area: Super Admin
- Affected UI: facility page header actions.
- Contract implemented: single-facility create request with category, identity, contact, capacity, pricing, open-hours summary, validation behavior, and governance refresh. Bulk import remains outside this resolved gap; the page provides client-side CSV export of the current governance list.
- Evidence: `backend/app/api/routes/facility_management_routes.py` registers `POST /admin/facilities`; `backend/tests/test_super_admin_facility_governance.py` verifies Super Admin create behavior and governance projection; `frontend/src/pages/super-admin/SuperAdminDashboardUsersPages.test.tsx` verifies create-facility submission and CSV export.
- Source issue/PRD: `docs/issues/ISSUE-0063-contract-audit-and-fixture-normalization.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-super-admin-shell.md`
- `docs/frontend/per-component-brief/super-kpi-card.md`
- `docs/frontend/per-component-brief/mobile-card-list.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: assignment actions respect Super Admin role and facility IDs.
- Facility governance rows align with the Super Admin users table/card pattern, paginate cleanly, and expose `Kelola staff` modal while edit/archive remain deferred until backend support exists.

## Open Questions

- None.
