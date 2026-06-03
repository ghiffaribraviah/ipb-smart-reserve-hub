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

- Layout: Student shell, facility gallery, metadata cards, description/contact/pricing/reservation widget/calendar/review sections.
- Desktop behavior: asymmetric gallery and side information rhythm from screenshot; public calendar appears as a compact embedded calendar inside the sticky price/reservation widget, above the reservation CTA.
- Mobile behavior: stacked gallery and cards with wrapped metadata; the compact public calendar stays above the reservation CTA in the stacked reservation widget.
- Required copy/status labels: preserve `Reservasi Sekarang` and Indonesian metadata labels.
- Source-of-truth notes: gallery image proportions and card spacing are important.

## UX Behavior

- Primary actions: reserve facility.
- Secondary actions: inspect calendar in the reservation widget before starting reservation.
- Loading state: stable gallery/card skeleton.
- Empty state: no reviews or no blocked slots should still keep section structure.
- Error state: not-found or unavailable facility maps to page-level state.
- Disabled state: reserve CTA disabled only when facility inactive/unavailable by integration rule.

## Accessibility

- Gallery images require alt text.
- Calendar entries must be text-readable, not color-only.
- Public calendar entries must not expose another user's activity title, organization, requester, or private reservation details.
- Reserve CTA must be keyboard reachable.
- Contact links should expose phone/email text.

## Data And Fixture Contract

- Deterministic fixture requirements: facility with multiple images, contact, open-hours, price, review summary, privacy-safe calendar blocks.
- Real entities: Facility detail, public reviews, calendar entries.
- Fixture media: backend image URLs when available, with local deterministic fallback imagery for facilities without active images.

## Backend Integration And Gaps

- Endpoints consumed: `GET /facilities/:facilityId`, `GET /facilities/:facilityId/calendar`, optionally `GET /facilities/:facilityId/availability`.
- Page-needed fields: `FacilityDetailResponse`, review summary/reviews, image list, contact, price, structured `open_hours` for today's hours and full schedule display, open-hours summary fallback, and privacy-safe calendar entries containing only `starts_at`, `ends_at`, and generic `status: reserved`.
- Auth/session assumptions: protected student route; public facility endpoints.
- Source files: `backend/app/api/routes/facility_routes.py`, `backend/app/schemas/facility_schemas.py`.

### BG-STUDENT-02-01: Public Facility Detail And Calendar

- Status: `resolved`
- Domain area: Facility Catalog
- Affected UI: detail header, gallery, contact/pricing cards, public calendar.
- Contract needed: active facility detail with public image URLs, structured operating hours, plus public blocked-slot calendar.
- Evidence: detail, calendar, and availability routes exist in `backend/app/api/routes/facility_routes.py`; schemas exist in `backend/app/schemas/facility_schemas.py`; `FacilityDetailResponse.images` supplies active facility media for the gallery and `FacilityDetailResponse.open_hours` supplies staff-managed operating hours.
- Source issue/PRD: `docs/issues/ISSUE-0002-facility-catalog-and-detail-browsing.md`, `docs/issues/ISSUE-0003-facility-availability-calendar.md`.

### BG-STUDENT-02-02: Privacy-Safe Public Calendar Blocks

- Status: `resolved`
- Domain area: Facility Catalog
- Affected UI: public facility calendar and reservation time calendar.
- Contract needed: public calendar responses return only blocked/reserved time ranges and generic availability status. They must not expose another user's activity title, organization, requester, reservation purpose, workflow state, document metadata, payment metadata, or reservation ID.
- Evidence: `FacilityCalendarEntryResponse` contains only `starts_at`, `ends_at`, and `status`; `backend/tests/test_facility_browsing.py` verifies pending, approved, and cancellation-requested reservations are privacy-safe public blocks; `backend/tests/test_staff_reservation_operations.py` verifies private staff schedule details remain separate.
- Source issue/PRD: `docs/issues/ISSUE-0063-contract-audit-and-fixture-normalization.md`, `docs/issues/ISSUE-0066-public-facility-calendar-privacy-contract-correction.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-student-shell.md`
- `docs/frontend/per-component-brief/facility-gallery.md`
- `docs/frontend/per-component-brief/public-calendar.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: not-found maps to stable page error; reserve CTA carries facility ID; compact public calendar appears above the reserve CTA while preserving privacy-safe calendar behavior.

## Open Questions

- Detailed calendar interaction states are referenced in `docs/frontend/html-reference/Shared - 03 - Upload And Calendar States.html`.
