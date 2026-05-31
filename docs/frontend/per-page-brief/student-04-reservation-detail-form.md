# Student 04 Reservation Detail Form

## Reference

- HTML: `docs/frontend/html-reference/Student - 04 - Reservation Detail Form.html`
- Desktop screenshot: `docs/frontend/screenshots/student-04-reservation-detail-form-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-04-reservation-detail-form-mobile.png`
- Reference label: `Student - 04 - Reservation Detail Form`

## Route Contract

- Proposed route: `/student/facilities/:facilityId/reserve/details`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: successful submission continues to approval letter page for the created reservation.

## Purpose

- User job: submit event details, organization unit, contact, participant count, and operational needs.
- Entry points: reservation time form.
- Exit points: approval letter page, previous time step.

## Design Contract

- Layout: reservation workflow shell with form card and right summary/policy/action column.
- Desktop behavior: main form plus right summary/sidebar; `Lanjutkan` lives in the right policy/summary area.
- Mobile behavior: form first, summary and policy second, full-width submit action in the summary/action column.
- Required copy/status labels: preserve Indonesian field labels and checkbox option copy.
- Source-of-truth notes: checkbox rows and policy box spacing must match reference.

## UX Behavior

- Primary actions: submit reservation from the right summary/policy area.
- Secondary actions: back to time selection.
- Loading state: submit button disabled while creating hold.
- Empty state: organization unit list unavailable uses inline error.
- Error state: validation and conflict errors map to form-level feedback.
- Disabled state: submit disabled until required fields pass frontend validation.

## Accessibility

- All fields need labels and associated errors.
- Checkbox rows must be keyboard reachable.
- Summary must be reachable after form on mobile.
- Validation must not rely on placeholder-only text.

## Data And Fixture Contract

- Deterministic fixture requirements: organization units, selected facility/time summary with cover image, optional extra requirements.
- Real entities: Organization Unit, Reservation Submission.
- Facility media: use the selected facility cover image from `GET /facilities/:facilityId` when present; use deterministic fixture media only as a no-image fallback.

## Backend Integration And Gaps

- Endpoints consumed: `GET /facilities/:facilityId`, `GET /organization-units`, `POST /facilities/:facilityId/reservations`.
- Page-needed fields: facility `id`, `name`, `capacity`, `price`, `images.url`, `images.alt_text`, `images.is_cover`; organization unit `id`, `name`; request fields from `ReservationSubmissionRequest`; response `StudentReservationResponse.id`, `status`, `document`, `payment`, `extra_requirements`.
- Auth/session assumptions: reservation submission requires student bearer token.
- Validation notes: backend trims and rejects whitespace-only `activity_title`, `event_description`, and `contact_phone`; backend also enforces `activity_title <= 255`, `contact_phone <= 32`, and `participant_count > 0`.
- Source files: `backend/app/api/routes/organization_unit_routes.py`, `backend/app/api/routes/reservation_routes.py`, `backend/app/schemas/reservation_schemas.py`.

### BG-STUDENT-04-01: Reservation Submission Extra Requirements

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: detail form, extra requirement checkboxes, confirmation routing.
- Contract needed: create reservation with structured `extra_requirements` and return saved projection.
- Evidence: `ReservationSubmissionRequest` includes `extra_requirements` plus trimmed required-text validation and model-aligned title/contact length guards; `POST /facilities/{facility_id}/reservations` exists and returns `StudentReservationResponse`.
- Source issue/PRD: `docs/issues/ISSUE-0007-reservation-details-submission-and-conflict-protected-hold.md`, `docs/issues/ISSUE-0026-reservation-extra-requirements.md`.

## Shared Components

- `docs/frontend/per-component-brief/reservation-stepper.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`
- `docs/frontend/per-component-brief/ui-form-controls.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: conflict response returns to time error; successful create routes by reservation ID.

## Open Questions

- None.
