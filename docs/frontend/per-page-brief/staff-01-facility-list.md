# Staff 01 Facility List

## Reference

- HTML: `docs/frontend/html-reference/Admin - 01 - Facility List.html`
- Desktop screenshot: `docs/frontend/screenshots/admin-01-facility-list-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/admin-01-facility-list-mobile.png`
- Reference label: `Admin - 01 - Facility List`

## Route Contract

- Proposed route: `/staff/facilities`
- Auth/role: `staff`
- Unauthorized behavior: redirect to login or role landing.
- Redirect behavior: facility row actions route to schedule/edit pages.

## Purpose

- User job: view facilities assigned to the staff account.
- Entry points: staff shell `Fasilitas` nav.
- Exit points: facility schedule, edit details.

## Design Contract

- Layout: staff shell with facility list table/cards and action buttons.
- Desktop behavior: dense table/list with compact actions.
- Mobile behavior: cards with actions stacked or icon-labelled.
- Required copy/status labels: preserve `Fasilitas`, active/inactive labels.
- Source-of-truth notes: staff pages use the green staff shell and Super Admin uses logo-derived green accents.

## UX Behavior

- Primary actions: open schedule or edit facility.
- Secondary actions: search/filter if present in reference.
- Loading state: table/card skeleton.
- Empty state: no assigned facilities.
- Error state: retry.
- Disabled state: inactive facility actions follow reference/permissions.

## Accessibility

- Table headers or card labels must remain programmatically meaningful.
- Icon actions require accessible names.
- Active/inactive status includes text.

## Data And Fixture Contract

- Deterministic fixture requirements: several assigned facilities with active/inactive states.
- Real entities: FacilityManagementProfile.
- Fixture media: backend facility cover images when available, with deterministic fallback treatment for facilities without active images.
- Contract normalization: do not present maintenance status, amenities, ratings, or last-change metadata as staff-managed backend fields on this page. Use active/inactive state, category, capacity, and schedule/edit actions.

## Backend Integration And Gaps

- Endpoints consumed: `GET /staff/facilities`.
- Page-needed fields: `id`, `name`, `location`, `capacity`, `category`, `price_summary`, `open_hours_summary`, active `images`, `is_active`.
- Auth/session assumptions: staff assigned facility access only.
- Source files: `backend/app/api/routes/facility_management_routes.py`, `backend/app/schemas/facility_management_schemas.py`.

### BG-STAFF-01-01: Staff Assigned Facility List

- Status: `resolved`
- Domain area: Staff Operations
- Affected UI: staff facility list.
- Contract needed: list assigned facilities for staff account, including active facility media for cover thumbnails.
- Evidence: `GET /staff/facilities` exists and returns `list[FacilityManagementProfileResponse]`; the response includes active `images`.
- Source issue/PRD: `docs/issues/ISSUE-0016-staff-facility-management-and-assignment-scope.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-staff-shell.md`
- `docs/frontend/per-component-brief/staff-facility-table.md`
- `docs/frontend/per-component-brief/mobile-card-list.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: only assigned facilities render.

## Open Questions

- None.
