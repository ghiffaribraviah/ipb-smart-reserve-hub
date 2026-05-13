---
id: ISSUE-0040
type: issue
title: UI primitives reference board
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by:
  - ISSUE-0039
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0040: UI primitives reference board

## Parent

PRD-0004

## What to build

Implement shared UI primitives from the UI primitives reference board: buttons, form controls, status badges, checkbox rows, and rating input.

## Acceptance criteria

- [x] Components match `Shared - 06 - UI Primitives` at desktop and mobile sizes.
- [x] Components follow the matching component briefs for button, form control, status badge, and rating behavior.
- [x] Deterministic fixtures are used; no backend API calls are introduced.
- [x] Playwright screenshots verify the board at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Labels, validation text, badges, stars, and button content do not overlap incoherently.

## Blocked By

- ISSUE-0039

## Implementation Notes

- Use `lucide-react` where icons appear in controls.
- Keep Indonesian copy and casing from the reference.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0039` is done, the reference and component briefs exist, and the scope is bounded to deterministic shared primitive board implementation with Playwright visual coverage.

## Agent Brief

Build the reusable primitive layer before shell and page work consumes it.

## Update Log

- 2026-05-13: Implemented the shared UI primitives board at `/__reference__/ui-primitives` with reusable button, form preview, status badge, checkbox row, and rating input primitives. Added deterministic fixture data in `frontend/src/fixtures/uiPrimitives.ts` and Playwright screenshot coverage in `frontend/tests/e2e/ui-primitives.spec.ts`. Verified against the shared reference screenshots with `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` (4 passed across harness and UI primitives specs).
