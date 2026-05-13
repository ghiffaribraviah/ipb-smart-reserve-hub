---
id: ISSUE-0064
type: issue
title: Student home discovery integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0064: Student home discovery integration

## Parent

PRD-0005

## What to build

Replace Student home discovery fixtures with real Facility Category and featured Facility queries while preserving the approved Student home design.

## Acceptance criteria

- [x] Student home loads categories from the public category endpoint.
- [x] Student home loads featured Facilities from the Facility catalog endpoint using featured query parameters.
- [x] Category shortcuts route to the catalog with the backend-owned category slug.
- [x] Featured Facility cards route to the Facility detail route with the backend Facility ID.
- [x] Loading, empty, and error states preserve stable section dimensions.
- [x] Vitest/RTL tests cover successful data rendering, empty categories, empty featured Facilities, query failure/retry, and navigation hrefs.
- [x] Student home screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063

## Implementation Notes

- Keep public discovery endpoints accessible through the protected Student shell.
- Map unknown `icon_hint` values to a safe fallback icon.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /facility-categories[].slug` | category href | `/student/facilities?category=<slug>` | Fixture-only category hrefs |
| `GET /facilities?featured=true&limit=...items[]` | featured card | Use ID, name, capacity, category, rating, review count, price summary | Fixture slug IDs |
| `cover_image_url` | card image | Use when present, deterministic fallback otherwise | Remote placeholder dependency |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate the Student home discovery sections with public facility category and featured facility API queries while preserving the approved Student home layout.

**Current behavior:**
The Student home page renders deterministic local discovery fixtures for category shortcuts and featured facility cards. Links are based on fixture slugs and no loading, empty, or error API states are exercised by integration tests.

**Desired behavior:**
The Student home page should fetch categories from the public facility category endpoint and featured Facilities from the facility catalog endpoint using the backend-supported featured query parameters. Category shortcuts should link to the catalog with the backend-owned category slug. Featured facility cards should link to the Facility detail route using the backend Facility ID. Loading, empty, and error states should preserve stable section dimensions and the existing visual rhythm.

**Key interfaces:**
- Public category API response — map `slug`, `name`, `facility_count`, and optional `icon_hint` into category shortcut view models, with a safe fallback icon for unknown hints.
- Facility catalog featured response — map the paginated `items` envelope into featured facility cards using Facility ID, name, category, capacity, rating/review count, price summary, and deterministic cover fallback when no cover image URL is present.
- Student home route — remains a protected student page, but the discovery endpoints themselves are public API calls through the shared frontend API client/session provider.
- Query state — should represent loading, empty categories, empty featured Facilities, and retryable failures without changing page layout dimensions dramatically.

**Acceptance criteria:**
- [ ] Student home loads categories from the public category endpoint.
- [ ] Student home loads featured Facilities from the Facility catalog endpoint using featured query parameters.
- [ ] Category shortcuts route to the catalog with the backend-owned category slug.
- [ ] Featured Facility cards route to the Facility detail route with the backend Facility ID.
- [ ] Loading, empty, and error states preserve stable section dimensions.
- [ ] Vitest/RTL tests cover successful data rendering, empty categories, empty featured Facilities, query failure/retry, and navigation hrefs.
- [ ] Student home screenshots remain green or are updated only for intentional normalization.

**Out of scope:**
- Adding or changing backend endpoints.
- Redesigning the Student home page.
- Wiring notification/profile/search behavior beyond the existing discovery links.

## Update Log

- 2026-05-13: Completed Student home discovery integration.
  - `StudentHomePage` now fetches `GET /facility-categories` and `GET /facilities?featured=true&limit=8` through `apiRequest` and TanStack Query.
  - Category shortcuts map backend `slug`, `name`, `facility_count`, and `icon_hint` into stable links and fallback icons. Featured Facility cards map backend Facility `id`, capacity, category, rating, review count, price/open-hour/location data, and optional cover image.
  - Added loading skeletons plus empty and retryable error states inside stable category/featured section containers.
  - Added RTL coverage for successful rendering and endpoint calls, empty categories, empty featured Facilities, retry after category query failure, and backend-owned hrefs.
  - Updated the Student home Playwright spec to mock the public discovery endpoints deterministically and refreshed the desktop/mobile screenshots.
  - Verification: `npm test -- --run src/pages/student/StudentHomePage.test.tsx`; `npm run typecheck`; `npx playwright test tests/e2e/student-home.spec.ts --update-snapshots`; `npx playwright test tests/e2e/student-home.spec.ts`.
