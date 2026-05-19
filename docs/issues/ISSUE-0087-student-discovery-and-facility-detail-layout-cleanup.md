---
id: ISSUE-0087
type: issue
title: Student discovery and Facility detail layout cleanup
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
  - docs
blocked_by:
  - ISSUE-0085
created: 2026-05-19
updated: 2026-05-19
---

# ISSUE-0087: Student discovery and Facility detail layout cleanup

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Align student discovery pages with the reviewed Facility catalog card pattern and move the Facility detail calendar into a more useful position near availability and price context.

## Acceptance criteria

- [ ] Student home featured Facility cards match the Facility catalog card format for hierarchy, metadata, action treatment, and responsive behavior.
- [ ] Student home uses deterministic local media treatment from ISSUE-0085.
- [ ] Facility detail places the public calendar above reviews and, on desktop where space permits, near the right-side price/reservation context.
- [ ] Facility detail keeps reviews readable below availability/booking information.
- [ ] No backend API contract changes are introduced.
- [ ] `docs/frontend/per-page-brief/student-00-home.md`, `student-02-facility-details.md`, and relevant component briefs are updated.
- [ ] Existing integration tests still cover facility fetch/calendar behavior.
- [ ] `student-home.spec.ts` and `student-facility-detail.spec.ts` screenshots are updated for desktop and mobile with no overlap or horizontal overflow.

## Blocked By

- ISSUE-0085

## Implementation Notes

- `frontend/src/pages/student/StudentHomePage.tsx` now maps featured facility price separately and renders home cards in the catalog hierarchy: media/category badge, name, rating/reviews, location/open-hours summary, capacity, and price.
- Featured facility media keeps the deterministic local placeholder treatment when no cover image is returned.
- `frontend/src/pages/student/StudentFacilityDetailPage.tsx` now renders `PublicCalendar` before `Reviews`, keeping availability above social proof and adjacent to the sticky reservation widget on desktop.
- No backend API contracts changed.
- Updated `student-00-home.md`, `student-02-facility-details.md`, and `facility-card.md`.
- Updated focused Vitest assertions and Playwright screenshot baselines for `student-home.spec.ts` and `student-facility-detail.spec.ts`.

## Triage Notes

- 2026-05-19: ISSUE-0085 is done, so the frontend polish dependency is cleared. Scope is a focused student UI cleanup with no backend API contract changes.

## Agent Brief

- Align `StudentHomePage` featured facility cards with the existing student catalog card hierarchy and metadata treatment.
- Keep deterministic local facility media placeholders for home screenshots when `cover_image_url` is absent.
- Move `StudentFacilityDetailPage` public calendar above reviews so availability appears before social proof and remains adjacent to the sticky reservation/price widget on desktop.
- Update focused page/component briefs and focused Vitest/Playwright coverage.

## Update Log

- 2026-05-19: Implemented and verified.

## Verification

- `npm test -- StudentHomePage StudentFacilityDetailPage`
- `npm run typecheck`
- `npx playwright test student-home.spec.ts student-facility-detail.spec.ts --update-snapshots`
- `npx playwright test student-home.spec.ts student-facility-detail.spec.ts`
- `npm run build`
