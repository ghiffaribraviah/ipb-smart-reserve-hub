---
id: ISSUE-0063
type: issue
title: Contract audit and fixture/page normalization
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
  - docs
prd: PRD-0005
blocked_by:
  - ISSUE-0061
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0063: Contract audit and fixture/page normalization

## Parent

PRD-0005

## What to build

Normalize documentation, fixtures, and visible copy that contradict backend/domain contracts before API wiring begins. Do not add live API calls in this slice.

## Acceptance criteria

- [x] Page briefs/backend-gap entries reflect public calendar privacy requirements.
- [x] Student catalog fixture/page labels use Facility Category language instead of Organization/Faculty filtering where backend catalog category filtering applies.
- [x] Reservation time copy reflects a one-hour minimum duration.
- [x] Payment receipt examples and validation notes use supported image file types, not PDF.
- [x] Staff Facility fixtures/pages stop implying unsupported managed fields such as maintenance status, amenities, or last-change metadata as backend truth.
- [x] Super Admin fixtures/pages distinguish supported backend fields from deferred actions or unsupported display fields.
- [x] Any real missing backend capability is captured as a page-owned backend gap and indexed in the backend gap ledger.
- [x] Visible fixture/copy changes update screenshot baselines only where intentionally changed.

## Blocked By

- ISSUE-0061

## Implementation Notes

- This is a normalization and documentation convergence slice, not an API integration slice.
- Prefer deferring unsupported fixture-only actions over inventing backend data.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| Facility catalog `category` | category filter | Use Facility Category slug/name | Organization/Faculty catalog filter |
| Reservation time rules | helper copy | Minimum duration is 1 hour | 30-minute fixture copy |
| Payment upload contract | accepted file copy | JPG/JPEG/PNG only | PDF payment receipt example |
| Staff Facility profile | list/edit fields | Use profile fields only | Amenities, last changed by, maintenance unless backed |

## Agent Brief

**Category:** enhancement
**Summary:** Normalize frontend fixtures, visible copy, and page-owned documentation so later API integration does not preserve assumptions that contradict backend contracts.

**Current behavior:**
Some frontend fixture data and copy implies backend support that is missing or intentionally private. Public student availability surfaces can expose event-specific calendar details; student catalog filtering still uses Organization/Faculty language where the backend catalog contract is category-based; reservation copy mentions a 30-minute minimum; payment receipt examples include PDF; staff facility views imply maintenance, amenities, and last-change metadata as managed backend fields; Super Admin views include actions or display fields that need to be explicitly deferred or separated from supported backend data.

**Desired behavior:**
Frontend pages and deterministic fixtures should use backend-aligned concepts before live API wiring begins. Public student calendars should communicate blocked/reserved time without leaking other users' event details. Catalog filtering should use Facility Category terminology. Reservation timing copy should state a one-hour minimum. Payment receipt examples and validation notes should use supported image types. Staff and Super Admin pages should distinguish supported backend fields from deferred actions or unsupported display-only concepts. Any real missing backend capability needed for the frontend should be captured in the owning page brief and indexed in the backend gap ledger.

**Key interfaces:**
- Student public calendar view model — should expose privacy-safe availability blocks instead of event title, organization, or requester details.
- Student facility catalog filtering model — should use Facility Category naming and values where category filtering applies.
- Reservation time helper copy — should state the backend-supported one-hour minimum duration.
- Payment receipt fixture and validation notes — should use JPG/JPEG/PNG examples, not PDF.
- Staff facility view model — should avoid presenting maintenance status, amenities, or last-change metadata as backend-managed truth unless documented as deferred or unsupported.
- Super Admin view models and actions — should clearly separate supported backend fields from deferred actions such as exports/imports or unsupported display fields.
- Page-owned backend gap entries — should be the detailed source for frontend/backend mismatches, with `docs/frontend/backend-gaps.md` acting only as the index.

**Acceptance criteria:**
- [ ] Page briefs/backend-gap entries reflect public calendar privacy requirements.
- [ ] Student catalog fixture/page labels use Facility Category language instead of Organization/Faculty filtering where backend catalog category filtering applies.
- [ ] Reservation time copy reflects a one-hour minimum duration.
- [ ] Payment receipt examples and validation notes use supported image file types, not PDF.
- [ ] Staff Facility fixtures/pages stop implying unsupported managed fields such as maintenance status, amenities, or last-change metadata as backend truth.
- [ ] Super Admin fixtures/pages distinguish supported backend fields from deferred actions or unsupported display fields.
- [ ] Any real missing backend capability is captured as a page-owned backend gap and indexed in the backend gap ledger.
- [ ] Visible fixture/copy changes update screenshot baselines only where intentionally changed.

**Out of scope:**
- Adding live backend API calls.
- Implementing backend endpoints or changing backend schemas.
- Redesigning the pages beyond the visible copy and fixture normalization required by the contract audit.

## Update Log

- 2026-05-13: Completed contract normalization slice.
  - Public student calendars now use generic reserved/blocked labels and tests assert that private event titles are not rendered.
  - Student catalog filter copy now uses Facility Category language; reservation time helper copy states a 1-hour minimum; payment receipt fixtures and upload copy use JPG/JPEG/PNG instead of PDF.
  - Staff Facility fixtures/pages no longer expose maintenance status, amenities, ratings, or last-change metadata as backend-managed truth.
  - Super Admin fixtures/pages mark unsupported export/import/create actions as deferred and replace unsupported last-activity/uptime-style fields with supported status/access notes.
  - Page briefs were updated for student catalog/detail/time/payment, staff facility list/edit, and Super Admin dashboard/users/facilities/reports/system. Added page-owned backend gaps `BG-STUDENT-02-02`, `BG-SUPER-00-02`, `BG-SUPER-02-02`, and `BG-SUPER-03-03`, and indexed them in `docs/frontend/backend-gaps.md`.
  - Updated affected Playwright tests and screenshot baselines for student facility catalog/detail, reservation time, payment upload, reservation detail, staff facility list/edit, and Super Admin dashboard/users/facilities/reports/system.
  - Verification: `npm run typecheck`; `npx playwright test tests/e2e/student-facility-catalog.spec.ts tests/e2e/student-facility-detail.spec.ts tests/e2e/student-reservation-create.spec.ts tests/e2e/student-payment-status.spec.ts tests/e2e/student-reservation-detail.spec.ts tests/e2e/staff-facilities-schedule.spec.ts tests/e2e/staff-edit-facility.spec.ts tests/e2e/super-admin-dashboard-users.spec.ts tests/e2e/super-admin-facilities-reports.spec.ts tests/e2e/super-admin-system.spec.ts`; `python .agents/scripts/local_tracker.py validate`.
