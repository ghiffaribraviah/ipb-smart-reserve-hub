# Student 00 Home

## Reference

- HTML: `docs/frontend/html-reference/Student - 00 - Home.html`
- Desktop screenshot: `docs/frontend/screenshots/student-00-home-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-00-home-mobile.png`
- Reference label: `Student - 00 - Home`

## Route Contract

- Proposed route: `/student`
- Auth/role: `student`
- Unauthorized behavior: redirect unauthenticated users to `/login?redirect=/student`; reject non-student roles.
- Redirect behavior: profile/search/nav links stay internal.

## Purpose

- User job: start facility discovery and reservation work from categories and featured facilities.
- Entry points: post-login student landing, header brand/nav.
- Exit points: facility catalog, facility detail, reservations, profile.

## Design Contract

- Layout: Student shell with fixed white header, hero/intro content, category shortcuts, featured facility cards, and footer.
- Desktop behavior: `1200px` centered content, search in header, horizontal nav.
- Mobile behavior: compact `64px` header, hamburger, hidden desktop nav/search, stacked sections.
- Required copy/status labels: preserve `Beranda`, `Fasilitas`, `Reservasi`, and `IPB SRH`; profile access is the avatar, not a fourth nav item.
- Source-of-truth notes: match green-led student visual tone and deterministic facility image treatment.

## UX Behavior

- Primary actions: browse facilities, open featured facility, start category browsing.
- Secondary actions: header search, notifications, profile.
- Loading state: category and facility sections keep stable skeleton/card dimensions.
- Empty state: show a quiet empty section if no categories or featured facilities exist.
- Error state: retry panel inside the affected section.
- Disabled state: unavailable shortcuts are not shown.

## Accessibility

- Use `header`, `main`, and `footer` landmarks.
- Category shortcuts and facility cards must be keyboard-focusable links/buttons.
- Facility images need meaningful alt text.
- Status/count text must not rely on icon-only communication.

## Data And Fixture Contract

- Deterministic fixture requirements: active categories with counts and featured facilities with cover images, rating, capacity, price, and location.
- Real entities: Facility Category, Facility Catalog item.
- Fixture media: local deterministic facility placeholders.

## Backend Integration And Gaps

- Endpoints consumed: `GET /facility-categories`, `GET /facilities?featured=true&limit=...`.
- Page-needed fields: category `id`, `name`, `slug`, `icon_hint`, `facility_count`; facility item `id`, `name`, `location`, `capacity`, `category`, `cover_image_url`, `rating_average`, `review_count`, `price_summary`, `open_hours_summary`.
- Auth/session assumptions: page is protected by student session, but discovery endpoints are public.
- Source files: `app/api/routes/facility_routes.py`, `app/schemas/facility_schemas.py`.

### BG-STUDENT-00-01: Home Categories And Featured Facilities

- Status: `resolved`
- Domain area: Facility Catalog
- Affected UI: category shortcuts and featured facility cards.
- Contract needed: public category list and featured facility page/envelope.
- Evidence: `GET /facility-categories` and `GET /facilities` with `featured`/`limit` query support exist in `app/api/routes/facility_routes.py`; response schemas exist in `app/schemas/facility_schemas.py`.
- Source issue/PRD: `docs/issues/ISSUE-0023-public-facility-categories-with-stable-slugs.md`, `docs/issues/ISSUE-0025-featured-facility-catalog-query.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-student-shell.md`
- `docs/frontend/per-component-brief/category-shortcut.md`
- `docs/frontend/per-component-brief/facility-card.md`

## Acceptance Checks

- Desktop screenshot at `1440 x 900`.
- Mobile screenshot at `390 x 844`.
- No mobile horizontal overflow.
- Integration checks: category click opens catalog with category slug; featured card opens facility detail.

## Open Questions

- Notification popover/inbox reference is `docs/frontend/html-reference/Shared - 01 - Notifications.html`.
