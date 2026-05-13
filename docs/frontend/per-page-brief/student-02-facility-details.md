# Student 02 Facility Details

## Reference

- HTML: `docs/frontend/html-reference/Student - 02 - Facility Details.html`
- Desktop screenshot: `docs/frontend/screenshots/student-02-facility-details-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-02-facility-details-mobile.png`
- Reference label: `Student - 02 - Facility Details`

## Route Contract

- Proposed route: `/student/facilities/:facilityId`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: reservation CTA links to `/student/facilities/:facilityId/reserve/time`.

## Purpose

- User job: inspect facility details, reviews, availability, and decide whether to reserve.
- Entry points: catalog cards, home featured cards.
- Exit points: reservation time form, catalog back navigation.

## Design Contract

- Layout: Student shell, facility gallery, metadata cards, description/contact/pricing/review/calendar sections.
- Desktop behavior: asymmetric gallery and side information rhythm from screenshot.
- Mobile behavior: stacked gallery and cards with wrapped metadata.
- Required copy/status labels: preserve `Reservasi Sekarang` and Indonesian metadata labels.
- Source-of-truth notes: gallery image proportions and card spacing are important.

## UX Behavior

- Primary actions: reserve facility.
- Secondary actions: browse reviews, inspect calendar.
- Loading state: stable gallery/card skeleton.
- Empty state: no reviews or no blocked slots should still keep section structure.
- Error state: not-found or unavailable facility maps to page-level state.
- Disabled state: reserve CTA disabled only when facility inactive/unavailable by integration rule.

## Accessibility

- Gallery images require alt text.
- Calendar entries must be text-readable, not color-only.
- Reserve CTA must be keyboard reachable.
- Contact links should expose phone/email text.

## Data And Fixture Contract

- Deterministic fixture requirements: facility with multiple images, contact, open-hours, price, review summary, calendar blocks.
- Real entities: Facility detail, public reviews, calendar entries.
- Fixture media: local deterministic facility images.

## Backend Integration And Gaps

- Endpoints consumed: `GET /facilities/:facilityId`, `GET /facilities/:facilityId/calendar`, optionally `GET /facilities/:facilityId/availability`.
- Page-needed fields: `FacilityDetailResponse`, review summary/reviews, image list, contact, price, open-hours summary, calendar entry start/end/title.
- Auth/session assumptions: protected student route; public facility endpoints.
- Source files: `app/api/routes/facility_routes.py`, `app/schemas/facility_schemas.py`.

### BG-STUDENT-02-01: Public Facility Detail And Calendar

- Status: `resolved`
- Domain area: Facility Catalog
- Affected UI: detail header, gallery, contact/pricing cards, public calendar.
- Contract needed: active facility detail plus public blocked-slot calendar.
- Evidence: detail, calendar, and availability routes exist in `app/api/routes/facility_routes.py`; schemas exist in `app/schemas/facility_schemas.py`.
- Source issue/PRD: `docs/issues/ISSUE-0002-facility-catalog-and-detail-browsing.md`, `docs/issues/ISSUE-0003-facility-availability-calendar.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-student-shell.md`
- `docs/frontend/per-component-brief/facility-gallery.md`
- `docs/frontend/per-component-brief/public-calendar.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: not-found maps to stable page error; reserve CTA carries facility ID.

## Open Questions

- Detailed calendar interaction states are referenced in `docs/frontend/html-reference/Shared - 03 - Upload And Calendar States.html`.
