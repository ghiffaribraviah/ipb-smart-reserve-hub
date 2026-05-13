---
id: ISSUE-0039
type: issue
title: Frontend visual verification harness
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by: []
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0039: Frontend visual verification harness

## Parent

PRD-0004

## What to build

Build the frontend visual verification harness that all later design-first slices use. This slice should establish app routing structure, deterministic fixture conventions, Playwright screenshot utilities, viewport coverage, and an initial placeholder route strategy for reference-board and product-page checks.

Do not implement full product pages or shared component boards in this slice.

## Acceptance criteria

- [x] Frontend app has a route/test structure suitable for page and reference-board screenshot tests.
- [x] Deterministic fixture conventions are documented or discoverable in the frontend source.
- [x] Playwright screenshot helpers cover `1440 x 900` and `390 x 844`.
- [x] Mobile horizontal overflow checking is available to later tests.
- [x] A minimal non-product smoke route proves the app renders under the test harness.
- [x] Deterministic fixture data is used; no backend API calls are introduced.
- [x] Playwright screenshot coverage verifies the harness route at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Visible text and controls on the harness route do not overlap incoherently.

## Blocked By

None - can start immediately.

## Implementation Notes

- Keep this slice intentionally thin; later issues own visual components and pages.
- The goal is to make every following issue verify reference matching the same way.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. The issue has clear acceptance criteria, no blockers, and a bounded implementation scope focused on the visual verification harness rather than product page work.

## Agent Brief

Start with the verification path before component or page implementation. This issue is complete when later agents can add screenshot tests without inventing their own harness.

## Update Log

- 2026-05-13: Implemented the visual verification harness with `frontend/src/App.tsx`, `frontend/src/pages/__harness__/SmokePage.tsx`, deterministic fixture data in `frontend/src/fixtures/visualHarness.ts`, Playwright screenshot utilities in `frontend/tests/e2e/utils/visual.ts`, and desktop/mobile screenshot coverage in `frontend/tests/e2e/harness.spec.ts`. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` (2 passed).
