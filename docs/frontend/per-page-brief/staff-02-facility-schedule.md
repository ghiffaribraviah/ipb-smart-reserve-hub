# Staff 02 Facility Schedule

## Reference

- HTML: `docs/frontend/html-reference/Admin - 02 - Facility Schedule.html`
- Desktop screenshot: `docs/frontend/screenshots/admin-02-facility-schedule-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/admin-02-facility-schedule-mobile.png`
- Reference label: `Admin - 02 - Facility Schedule`

## Route Contract

- Proposed route: `/staff/facilities/:facilityId/schedule`
- Auth/role: `staff`
- Unauthorized behavior: redirect to login; deny unassigned facility access.
- Redirect behavior: back to `/staff/facilities`.

## Purpose

- User job: inspect assigned facility booking schedule and blocked periods.
- Entry points: facility list action.
- Exit points: facility list, reservation detail where applicable.

## Design Contract

- Layout: staff shell with shared month calendar, agenda panel, and reservation list/cards.
- Desktop behavior: shared `month-day` calendar grid beside agenda, followed by dense reservation table.
- Mobile behavior: compact schedule cards/list; no horizontal scroll.
- Required copy/status labels: preserve schedule and verification copy.
- Source-of-truth notes: calendar uses the shared `day-head` / `month-day` / `day-dots` anatomy, not legacy `calendar-day` markup.

## UX Behavior

- Primary actions: navigate calendar period, open reservation.
- Secondary actions: back to facility list.
- Loading state: calendar skeleton.
- Empty state: no reservations for period.
- Error state: retry schedule.
- Disabled state: previous/next controls remain stable.

## Accessibility

- Calendar controls require names.
- Events include text labels and time ranges.
- Month/week navigation must be keyboard reachable.

## Data And Fixture Contract

- Deterministic fixture requirements: blocked reservations across a calendar period.
- Real entities: public facility calendar or staff schedule read model.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed: `GET /staff/facilities/:facilityId/schedule`; public `GET /facilities/:facilityId/calendar` remains available for non-private calendar data.
- Page-needed fields: activity title, organization, starts/ends, status/review type if reference needs operational detail.
- Auth/session assumptions: staff must be assigned to facility for operational details.
- Source files: `app/api/routes/facility_routes.py`, `app/schemas/facility_schemas.py`.

### BG-STAFF-02-01: Staff Facility Schedule

- Status: `resolved`
- Domain area: Staff Operations
- Affected UI: assigned facility schedule.
- Contract implemented: assigned-staff private schedule endpoint with Reservation identity, status, workflow/review state, Organization Unit, schedule times, and staff detail routing data.
- Evidence: `app/api/routes/staff_reservation_operation_routes.py` registers `GET /staff/facilities/{facility_id}/schedule`; `tests/test_staff_reservation_operations.py` verifies assigned schedule data, unassigned denial, and non-staff denial; `tests/test_facility_browsing.py::test_students_view_public_facility_calendar_without_private_reservation_data` verifies the public calendar shape remains private-data-free.
- Source issue/PRD: `docs/issues/ISSUE-0003-facility-availability-calendar.md`, `docs/issues/ISSUE-0016-staff-facility-management-and-assignment-scope.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-staff-shell.md`
- `docs/frontend/per-component-brief/public-calendar.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: verify whether public calendar is enough; otherwise create backend issue from this gap.

## Open Questions

- None.
