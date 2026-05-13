---
id: ISSUE-0046
type: issue
title: Student Facility Catalog page
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by:
  - ISSUE-0041
  - ISSUE-0043
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0046: Student Facility Catalog page

## Parent

PRD-0004

## What to build

Implement the student Facility Catalog page with deterministic search, filter, sort, pagination, and empty-filter fixtures.

## Acceptance criteria

- [x] Page matches `Student - 01 - Facility Catalog` at desktop and mobile sizes.
- [x] Filter bar, Facility cards, status/price/rating details, and pagination match the reference.
- [x] Query-like states for `q`, `category`, `min_capacity`, `sort`, and page are represented without API calls.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify the page at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Filters, cards, long Facility names, badges, and pagination controls do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0043

## Implementation Notes

- Use Facility Catalog Query vocabulary for fixture naming where practical.

## Triage Notes

- 2026-05-13: Triaged as `ready-for-agent` / `AFK`. Blockers ISSUE-0041 and ISSUE-0043 are complete, the catalog page brief and HTML/screenshot references exist, and the slice is deterministic frontend work with query-like fixture states and no backend API dependency.

## Agent Brief

Keep search/filter interactions deterministic and visual; live Facility fetching is out of scope.

## Update Log

- 2026-05-13: Implemented `/student/facilities` with deterministic Facility Catalog fixtures in `frontend/src/fixtures/studentFacilityCatalog.ts`, a fixture-driven catalog page in `frontend/src/pages/student/StudentFacilityCatalogPage.tsx`, and route wiring in `frontend/src/App.tsx`. Added Playwright coverage and screenshots in `frontend/tests/e2e/student-facility-catalog.spec.ts` for desktop `1440 x 900`, mobile `390 x 844`, query-like filter/sort/page state, internal detail links, and no mobile horizontal overflow. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` (`28 passed`).
