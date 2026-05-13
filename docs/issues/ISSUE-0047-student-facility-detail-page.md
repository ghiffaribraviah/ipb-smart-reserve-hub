---
id: ISSUE-0047
type: issue
title: Student Facility detail page
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by:
  - ISSUE-0041
  - ISSUE-0042
  - ISSUE-0043
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0047: Student Facility detail page

## Parent

PRD-0004

## What to build

Implement the student Facility detail page with deterministic Facility image, contact, open-hours, price, public review, and public calendar fixtures.

## Acceptance criteria

- [x] Page matches `Student - 02 - Facility Details` at desktop and mobile sizes.
- [x] Gallery, Facility metadata, review summary, public calendar, and reserve CTA match the reference.
- [x] Reserve navigation points to the fixture Reservation time route.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify the page at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Gallery images, calendar blocks, metadata rows, reviews, and CTAs do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0042
- ISSUE-0043

## Implementation Notes

- Use Public Facility Reviews and Public Facility Calendar vocabulary from `CONTEXT.md`.

## Triage Notes

- 2026-05-13: Triaged as `ready-for-agent` / `AFK`. Blockers ISSUE-0041, ISSUE-0042, and ISSUE-0043 are complete, the facility detail brief and HTML/screenshot references exist, and the slice is deterministic frontend work with no backend API dependency.

## Agent Brief

This issue should make the Facility detail route visually ready for later Reservation workflow links.

## Update Log

- 2026-05-13: Implemented `/student/facilities/:facilityId` with deterministic Facility detail, image gallery, metadata, reserve CTA, public review, and public calendar fixtures in `frontend/src/fixtures/studentFacilityDetail.ts`, page implementation in `frontend/src/pages/student/StudentFacilityDetailPage.tsx`, and route wiring in `frontend/src/App.tsx`. Added Playwright coverage and screenshots in `frontend/tests/e2e/student-facility-detail.spec.ts` for desktop `1440 x 900`, mobile `390 x 844`, reserve navigation to `/student/facilities/grand-auditorium/reserve/time`, calendar content, and mobile horizontal-overflow checks. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` (`30 passed`).
