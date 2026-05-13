---
id: ISSUE-0045
type: issue
title: Student home page
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

# ISSUE-0045: Student home page

## Parent

PRD-0004

## What to build

Implement the student home page with deterministic Facility Category and featured Facility fixtures.

## Acceptance criteria

- [x] Page matches `Student - 00 - Home` at desktop and mobile sizes.
- [x] Student shell, category shortcuts, Facility cards, search affordance, and footer match the reference.
- [x] Category and featured Facility navigation are represented with internal fixture routes.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify the page at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Category rows, Facility cards, images, ratings, and actions do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0043

## Implementation Notes

- Use Facility Category and Facility Catalog vocabulary from `CONTEXT.md`.

## Triage Notes

- 2026-05-13: Triaged as `ready-for-agent` / `AFK`. Blockers ISSUE-0041 and ISSUE-0043 are complete, the student home page brief and HTML/screenshot references exist, and the work is a deterministic frontend enhancement with no backend API dependency.

## Agent Brief

This is the first student product page and should prove the student shell with real page content.

## Update Log

- 2026-05-13: Implemented `/student` with deterministic Facility Category and featured Facility fixtures in `frontend/src/fixtures/studentHome.ts`, a student shell/home page in `frontend/src/pages/student/StudentHomePage.tsx`, and the route in `frontend/src/App.tsx`. Added Playwright coverage and screenshots in `frontend/tests/e2e/student-home.spec.ts` for desktop `1440 x 900` and mobile `390 x 844`, including internal fixture route assertions and mobile horizontal-overflow checks. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` (`24 passed`).
