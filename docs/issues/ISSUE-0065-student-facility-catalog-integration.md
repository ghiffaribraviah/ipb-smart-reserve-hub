---
id: ISSUE-0065
type: issue
title: Student Facility catalog integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0064
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0065: Student Facility catalog integration

## Parent

PRD-0005

## What to build

Wire the Student Facility catalog to real category and paginated Facility catalog data, including query-parameter-driven search, filtering, sorting, and pagination.

## Acceptance criteria

- [x] Catalog reads and writes `q`, `category`, `min_capacity`, `sort`, and `page` query parameters.
- [x] Category filter options come from Facility Categories.
- [x] UI sort options map only to backend-supported sort values.
- [x] Catalog renders result count, paginated items, empty state, loading state, and recoverable error state.
- [x] Invalid or failed sort/query behavior shows recoverable feedback without breaking the shell.
- [x] Vitest/RTL tests cover query sync, API params, sort mapping, pagination, empty results, and error recovery.
- [x] Catalog screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0064

## Implementation Notes

- Preserve page layout and existing visual density.
- Use backend page envelope instead of local filtering.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /facilities` query `category` | category filter | Send backend category slug | Organization/Faculty filter |
| `sort` | sort select value | Map UI labels to `name_asc`, `capacity_desc`, `rating_desc`, `price_asc`, `price_desc` | Fixture values `name`, `capacity`, `rating` |
| `items/page/total_items` | result grid and pagination | Render from backend envelope | Local fixture filtering |

## Agent Brief

**Category:** enhancement
**Summary:** Replace the Student Facility catalog's local filtering fixture with backend-backed category and paginated Facility catalog queries.

**Current behavior:**
The catalog page reads query parameters but filters and sorts deterministic local fixture data. Category options and sort values are fixture-owned, pagination is static, and loading/empty/error API states are not covered by integration tests.

**Desired behavior:**
The catalog should fetch Facility Categories from the public category endpoint and fetch paginated Facilities from the public catalog endpoint using the route query parameters `q`, `category`, `min_capacity`, `sort`, and `page`. The form and pagination links should preserve/query-write the backend-owned parameter names. Sort values exposed by the UI should map only to backend-supported values. Loading, empty, invalid/failed query, and retry states should keep the approved catalog shell and visual density stable.

**Key interfaces:**
- Public category API response — supplies category filter options from backend `slug` and `name`.
- Public Facility catalog API response — standard paginated envelope with `items`, `page`, `page_size`, `total_items`, and `total_pages`.
- Catalog query parameters — `q`, `category`, `min_capacity`, `sort`, and `page` should be read from and written to the URL.
- Sort mapping — UI options should submit `name_asc`, `capacity_desc`, `rating_desc`, `price_asc`, and `price_desc`; unsupported sort values should show recoverable feedback rather than breaking the page.

**Acceptance criteria:**
- [ ] Catalog reads and writes `q`, `category`, `min_capacity`, `sort`, and `page` query parameters.
- [ ] Category filter options come from Facility Categories.
- [ ] UI sort options map only to backend-supported sort values.
- [ ] Catalog renders result count, paginated items, empty state, loading state, and recoverable error state.
- [ ] Invalid or failed sort/query behavior shows recoverable feedback without breaking the shell.
- [ ] Vitest/RTL tests cover query sync, API params, sort mapping, pagination, empty results, and error recovery.
- [ ] Catalog screenshots remain green or are updated only for intentional normalization.

**Out of scope:**
- Backend endpoint or schema changes.
- Redesigning the catalog page beyond necessary data-state rendering.
- API integration for Facility detail pages.

## Update Log

- 2026-05-13: Implemented backend-backed student facility catalog integration in `frontend/src/pages/student/StudentFacilityCatalogPage.tsx`.
  The page now fetches `GET /facility-categories` and paginated `GET /facilities`, maps backend sort values, writes category/sort/page changes into URL params, preserves filter params in pagination links, and renders loading, empty, invalid-sort, and retryable error states.
- 2026-05-13: Added focused RTL coverage in `frontend/src/pages/student/StudentFacilityCatalogPage.test.tsx` for query/API param sync, backend category options, supported sort values, pagination href preservation, empty results, invalid sort feedback, and retry recovery.
- 2026-05-13: Updated `frontend/tests/e2e/student-facility-catalog.spec.ts` to mock backend discovery endpoints and refreshed catalog desktop/mobile screenshots for the intentional category/sort normalization.
  Verification passed: `npm test -- --run src/pages/student/StudentFacilityCatalogPage.test.tsx`, `npm run typecheck`, `npx playwright test tests/e2e/student-facility-catalog.spec.ts --update-snapshots`, and `npx playwright test tests/e2e/student-facility-catalog.spec.ts`.
