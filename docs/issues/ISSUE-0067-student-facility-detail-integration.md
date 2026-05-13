---
id: ISSUE-0067
type: issue
title: Student Facility detail integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0065
  - ISSUE-0066
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0067: Student Facility detail integration

## Parent

PRD-0005

## What to build

Wire Student Facility detail to real Facility detail and privacy-safe calendar data.

## Acceptance criteria

- [x] Facility detail loads Facility identity, location, capacity, category, description, contact, images, price, open-hours summary, review summary, and public reviews from the backend.
- [x] Public calendar section renders only privacy-safe blocked ranges.
- [x] Missing images, reviews, or calendar blocks render stable empty states.
- [x] Not-found and unavailable Facility responses show a stable page-level error state.
- [x] Reserve CTA carries the backend Facility ID into the Reservation time route.
- [x] Vitest/RTL tests cover success, no images, no reviews, empty calendar, not found, and CTA route.
- [x] Facility detail screenshots remain green or are updated only for intentional privacy-safe copy changes.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0065
- ISSUE-0066

## Implementation Notes

- Do not display private Reservation details from public calendar data.
- Use deterministic fallback media if public images are absent.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /facilities/:id` | detail page model | Map public Facility detail fields directly | Fixture-only feature claims not backed by API |
| `price.summary` | price label | Display backend summary | Fixture `priceUnit` if unsupported |
| `GET /facilities/:id/calendar` | blocked calendar entries | Render generic unavailable ranges | Event title and Organization Unit |

## Agent Brief

**Category:** enhancement
**Summary:** Replace Student Facility detail fixtures with backend-backed Facility detail and privacy-safe calendar queries.

**Current behavior:**
The page renders deterministic fixture data for Grand Auditorium, including local review summaries, static calendar markers, and a fixture reserve route. It does not fetch `GET /facilities/:id` or the privacy-safe public calendar endpoint.

**Desired behavior:**
The page should fetch public Facility detail by backend Facility ID from the route, fetch `GET /facilities/:id/calendar`, map backend detail fields into the approved visual layout, render privacy-safe calendar blocked ranges only, and preserve deterministic fallback media where backend images are missing. Empty images/reviews/calendar should keep stable sections. 404 or unavailable API responses should render a page-level error shell. The reserve CTA should route to `/student/facilities/:id/reserve/time` using the backend ID from the current route/detail response.

**Key interfaces:**
- `GET /facilities/{facility_id}` returns `FacilityDetailResponse` with identity, location, capacity, category, description, contact, images, price, `open_hours_summary`, `review_summary`, and public reviews.
- `GET /facilities/{facility_id}/calendar?start=...&end=...` returns privacy-safe entries with only `starts_at`, `ends_at`, and generic `status: reserved`.
- Frontend route: `/student/facilities/:facilityId`.
- Follow `docs/frontend/per-page-brief/student-02-facility-details.md`; `BG-STUDENT-02-02` is resolved by `ISSUE-0066`.

**Acceptance criteria:**
- [ ] Facility detail loads Facility identity, location, capacity, category, description, contact, images, price, open-hours summary, review summary, and public reviews from the backend.
- [ ] Public calendar section renders only privacy-safe blocked ranges.
- [ ] Missing images, reviews, or calendar blocks render stable empty states.
- [ ] Not-found and unavailable Facility responses show a stable page-level error state.
- [ ] Reserve CTA carries the backend Facility ID into the Reservation time route.
- [ ] Vitest/RTL tests cover success, no images, no reviews, empty calendar, not found, and CTA route.
- [ ] Facility detail screenshots remain green or are updated only for intentional privacy-safe copy changes.

**Out of scope:**
- Reservation time page integration.
- Review pagination or review submission.
- Displaying private reservation/event details in public calendar blocks.

## Update Log

- 2026-05-13: Triaged to `ready-for-agent`. Dependencies are satisfied, including the privacy-safe public calendar response from `ISSUE-0066`.
- 2026-05-13: Implemented Student Facility detail API integration in `frontend/src/pages/student/StudentFacilityDetailPage.tsx`. The page now fetches `GET /facilities/:id` and privacy-safe `GET /facilities/:id/calendar`, maps backend Facility detail fields into the existing layout, renders empty states for missing images/reviews/calendar blocks, shows a page-level error for unavailable/not-found details, and builds the reserve CTA from the backend Facility ID.
- 2026-05-13: Added `frontend/src/pages/student/StudentFacilityDetailPage.test.tsx` covering success, no images, no reviews, empty calendar, not found, privacy-safe calendar rendering, and CTA route. Updated `frontend/tests/e2e/student-facility-detail.spec.ts` to mock backend detail/calendar endpoints and refreshed desktop/mobile screenshots for the intentional backend-backed rendering changes.
  Verification passed: `npm test -- --run src/pages/student/StudentFacilityDetailPage.test.tsx`, `npm run typecheck`, `npx playwright test tests/e2e/student-facility-detail.spec.ts --update-snapshots`, and `npx playwright test tests/e2e/student-facility-detail.spec.ts`.
