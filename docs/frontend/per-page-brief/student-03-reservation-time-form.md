# Student 03 Reservation Time Form

## Reference

- HTML: `docs/frontend/html-reference/Student - 03 - Reservation Time Form.html`
- Desktop screenshot: `docs/frontend/screenshots/student-03-reservation-time-form-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-03-reservation-time-form-mobile.png`
- Reference label: `Student - 03 - Reservation Time Form`

## Route Contract

- Proposed route: `/student/facilities/:facilityId/reserve/time`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: successful validation continues to `/student/facilities/:facilityId/reserve/details`.

## Purpose

- User job: choose a valid date/time before entering reservation details.
- Entry points: facility detail reserve CTA.
- Exit points: reservation detail form, facility detail.

## Design Contract

- Layout: reservation workflow shell with three-step stepper, calendar/time selection card, right summary.
- Desktop behavior: two-column layout.
- Mobile behavior: stack stepper, selection, summary, and full-width primary action.
- Required copy/status labels: preserve step labels and `Lanjutkan`.
- Source-of-truth notes: mobile stepper labels must not collide at 390px.

## UX Behavior

- Primary actions: continue after valid time selection.
- Secondary actions: back to facility details.
- Loading state: availability check pending keeps selected slot visible.
- Empty state: no available slots uses non-blocking extrapolated state.
- Error state: invalid range/reason shown near selection controls.
- Disabled state: continue disabled until valid start/end are selected.

## Accessibility

- Calendar and time controls must be keyboard usable.
- Selected/unavailable states need text or aria state, not color alone.
- Validation errors must be announced.
- Mobile action target should be about 52px high.

## Data And Fixture Contract

- Deterministic fixture requirements: facility summary, open slots, blocked slots, invalid time case.
- Real entities: Facility detail, reservation time selection result.
- Fixture media: facility cover image from deterministic fixture.

## Backend Integration And Gaps

- Endpoints consumed: `POST /facilities/:facilityId/reservation-time-selection`, optionally `GET /facilities/:facilityId/calendar`.
- Page-needed fields: selected `starts_at`, `ends_at`, availability result `available`, `reasons`.
- Auth/session assumptions: protected route; endpoint is public but submission flow requires student session.
- Source files: `app/api/routes/facility_routes.py`, `app/schemas/reservation_time_selection_schemas.py`.

### BG-STUDENT-03-01: Reservation Time Validation

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: calendar/time validation and continue gating.
- Contract needed: pre-submit validation for booking window, open hours, blackout, and conflicts.
- Evidence: `POST /facilities/{facility_id}/reservation-time-selection` exists in `app/api/routes/facility_routes.py`.
- Source issue/PRD: `docs/issues/ISSUE-0006-reservation-time-selection-rules.md`.

## Shared Components

- `docs/frontend/per-component-brief/reservation-stepper.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`
- `docs/frontend/per-component-brief/public-calendar.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: unavailable time disables continue and displays reason.

## Open Questions

- Rich calendar interaction states are tracked in `missing-design.md`.

