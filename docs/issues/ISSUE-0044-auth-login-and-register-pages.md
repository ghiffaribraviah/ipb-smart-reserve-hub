---
id: ISSUE-0044
type: issue
title: Auth login and register pages
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by:
  - ISSUE-0039
  - ISSUE-0040
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0044: Auth login and register pages

## Parent

PRD-0004

## What to build

Implement the login and student registration pages from their briefs and references with deterministic form, success, and error states.

## Acceptance criteria

- [x] Login page matches the `Login` reference on desktop and mobile.
- [x] Register page matches the `Register` reference on desktop and mobile.
- [x] Form controls, primary actions, secondary links, success/error surfaces, and auth layout use shared primitives where appropriate.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify both pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Labels, field errors, buttons, and auth layout content do not overlap incoherently.

## Blocked By

- ISSUE-0039
- ISSUE-0040

## Implementation Notes

- Registration success should return visually to login as fixture behavior only.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0039` and `ISSUE-0040` are done, login/register page briefs and HTML/screenshot references exist, and this slice is explicitly design-only with deterministic fixture success/error states and no backend API calls.

## Agent Brief

Keep this design-only; auth API wiring belongs to a later integration track.

## Update Log

- 2026-05-13: Implemented design-only `/login` and `/register` pages with the shared auth layout, deterministic media treatment, form fields, secondary links, and query-driven fixture success/error surfaces. Added Playwright coverage in `frontend/tests/e2e/auth-pages.spec.ts` for desktop/mobile screenshots plus deterministic auth message/error states. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` (22 passed across all current frontend specs).
