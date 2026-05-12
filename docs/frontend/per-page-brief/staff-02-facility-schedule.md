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

- Layout: staff shell with calendar header/navigation and schedule grid/list.
- Desktop behavior: calendar grid plus dense event chips.
- Mobile behavior: compact schedule cards/list; no horizontal scroll.
- Required copy/status labels: preserve schedule and verification copy.
- Source-of-truth notes: use reference calendar spacing and action icon treatment.

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

- Endpoints consumed: likely `GET /facilities/:facilityId/calendar`; staff-scoped richer schedule endpoint may be needed.
- Page-needed fields: activity title, organization, starts/ends, status/review type if reference needs operational detail.
- Auth/session assumptions: staff must be assigned to facility for operational details.
- Source files: `app/api/routes/facility_routes.py`, `app/schemas/facility_schemas.py`.

### BG-STAFF-02-01: Staff Facility Schedule

- Status: `needs-verification`
- Domain area: Staff Operations
- Affected UI: assigned facility schedule.
- Contract needed: schedule data sufficient for staff view. Public calendar exists but may omit private workflow/status fields needed by staff.
- Evidence: `GET /facilities/{facility_id}/calendar` exists, but it is public and intentionally hides private data.
- Source issue/PRD: `docs/issues/ISSUE-0003-facility-availability-calendar.md`, `docs/issues/ISSUE-0016-staff-facility-management-and-assignment-scope.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-staff-shell.md`
- `docs/frontend/per-component-brief/public-calendar.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: verify whether public calendar is enough; otherwise create backend issue from this gap.

## Open Questions

- Does staff schedule need private reservation status/student details, or only public blocked slots?

