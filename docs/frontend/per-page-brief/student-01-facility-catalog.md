# Student 01 Facility Catalog

## Reference

- HTML: `docs/frontend/html-reference/Student - 01 - Facility Catalog.html`
- Desktop screenshot: `docs/frontend/screenshots/student-01-facility-catalog-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-01-facility-catalog-mobile.png`
- Reference label: `Student - 01 - Facility Catalog`

## Route Contract

- Proposed route: `/student/facilities`
- Auth/role: `student`
- Unauthorized behavior: redirect to login with safe redirect.
- Redirect behavior: query params preserve `q`, `category`, `min_capacity`, `sort`, and pagination.

## Purpose

- User job: search, filter, sort, compare, and open facilities.
- Entry points: student home categories/featured links, header nav/search.
- Exit points: facility detail, reservation start.

## Design Contract

- Layout: Student shell, filter/search controls, catalog grid/list, pagination.
- Desktop behavior: filters and facility cards scan in a dense but readable layout.
- Mobile behavior: controls stack full-width and cards stack without horizontal scroll.
- Required copy/status labels: preserve Indonesian filter/action labels from reference.
- Source-of-truth notes: card styling must match screenshot hierarchy and spacing.

## UX Behavior

- Primary actions: open facility detail.
- Secondary actions: search, category filter, capacity filter, sort, paginate.
- Filter behavior: minimum capacity is clamped to `0` in the UI and before calling the catalog endpoint.
- Loading state: stable card grid skeleton.
- Empty state: no-results panel using shared state style.
- Error state: retry catalog query.
- Disabled state: pagination buttons disabled at boundaries.

## Accessibility

- Search/filter controls must have labels.
- Results count should be announced as text.
- Pagination must be keyboard reachable and named.
- Facility cards must have meaningful link text.

## Data And Fixture Contract

- Deterministic fixture requirements: mixed categories, ratings, free/paid prices, capacities, and empty-filter state.
- Real entities: Facility Catalog page and categories.
- Fixture media: backend `cover_image_url` when available, with local deterministic fallback imagery for facilities without active images.
- Contract normalization: filter labels and query parameters must use Facility Category language (`category`) instead of Organization/Faculty filtering.

## Backend Integration And Gaps

- Endpoints consumed: `GET /facility-categories`, `GET /facilities`.
- Page-needed fields: paginated envelope `items`, `page`, `page_size`, `total_items`, `total_pages`; item fields listed in `FacilityCatalogItemResponse`, including `cover_image_url`.
- Auth/session assumptions: protected UI shell; public discovery data.
- Source files: `backend/app/api/routes/facility_routes.py`, `backend/app/schemas/facility_schemas.py`.

### BG-STUDENT-01-01: Paginated Filterable Facility Catalog

- Status: `resolved`
- Domain area: Facility Catalog
- Affected UI: catalog filters, result count, pagination, sort controls.
- Contract needed: `q`, `category`, `min_capacity`, `sort`, `page`, `page_size` query params, stable paginated envelope, and active media cover projection.
- Evidence: route query params exist in `backend/app/api/routes/facility_routes.py`; `FacilityCatalogPageResponse` exists in `backend/app/schemas/facility_schemas.py`; `FacilityCatalogModule` returns the marked cover image or the first active image as `cover_image_url`.
- Source issue/PRD: `docs/issues/ISSUE-0024-paginated-facility-catalog-filters-and-sorts.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-student-shell.md`
- `docs/frontend/per-component-brief/facility-card.md`
- `docs/frontend/per-component-brief/facility-filter-bar.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: filters update query and results; invalid sort maps to recoverable error.

## Open Questions

- Loading/empty/error state visuals are non-blocking missing designs.
