# Student 13 Cancellation Request

## Reference

- HTML: `docs/frontend/html-reference/Student - 13 - Cancellation Request.html`
- Desktop screenshot: `docs/frontend/screenshots/student-13-cancellation-request-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-13-cancellation-request-mobile.png`
- Reference label: `Student - 13 - Cancellation Request`

## Route Contract

- Proposed route: `/student/reservations/:reservationId/cancellation`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: successful submit returns to reservation detail with cancelled state and visible cancellation reason.

## Purpose

- User job: cancel an already approved reservation and understand fines, sanctions, and refund limitations.
- Entry points: `Ajukan Pembatalan` from accepted reservation detail.
- Exit points: submit request, cancel/back to accepted detail.

## Design Contract

- Layout: two-column desktop form and reservation summary; mobile stacks form, summary, then state variants.
- Desktop behavior: form card leads, summary card anchors context, post-submit state references sit below.
- Mobile behavior: full-width controls/actions with readable refund warning and stacked summary rows.
- Required copy/status labels: preserve `Ajukan Pembatalan`, `Kirim Pengajuan`, and use immediate cancelled-state copy instead of pending/rejected staff-review language.
- Source-of-truth notes: cancellation action uses quiet amber styling and must clearly warn that submission immediately cancels the reservation and may involve fines, sanctions, or no refund.

## UX Behavior

- Primary actions: submit cancellation.
- Secondary actions: cancel/back to reservation detail.
- Loading state: submit action retains layout while pending.
- Empty state: missing optional summary values are omitted or shown as quiet missing values.
- Error state: validation and API errors use form error styling.
- Disabled state: submit disabled until reason requirements are met.

## Accessibility

- Reason select and textarea need explicit labels.
- Refund warning is text-visible.
- Submit/cancel actions are keyboard reachable.
- Consequence and final-state cards communicate status with text, not color alone.

## Data And Fixture Contract

- Deterministic fixture requirements: approved reservation summary with facility cover image, cancellation reason options, immediate cancelled-state example.
- Real entities: StudentReservation detail and cancellation request.
- Facility media: render `facility.cover_image_url` from the reservation detail projection when present; use deterministic fixture media only as a no-image fallback.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`, `POST /student/reservations/:reservationId/cancellation-request`.
- Page-needed fields: reservation summary including `facility.cover_image_url`, cancellation eligibility, cancellation status/reason when present.
- Auth/session assumptions: student-owned reservation only.
- Validation notes: cancellation reason still returns `400` for blank/whitespace payloads; frontend must require a real reason group selection before submit.
- Source files: `backend/app/api/routes/reservation_routes.py`, `backend/app/schemas/reservation_schemas.py`.

### BG-STUDENT-13-01: Student Cancellation Request

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: cancellation request form and post-submit cancelled detail state.
- Contract needed: owned reservation detail with facility cover image plus cancellation request endpoint that immediately returns `cancelled` with cancellation projection fields.
- Evidence: `StudentReservationResponse.facility.cover_image_url` is available for the summary media; `POST /student/reservations/{reservation_id}/cancellation-request` exists; `backend/tests/test_cancellation_workflow.py` verifies approved cancellation immediately transitions to `cancelled`, preserves required reason handling, records audit, and exposes cancellation reason fields used by list/detail projections.
- Source issue/PRD: `docs/issues/ISSUE-0013-cancellation-workflow.md`, `docs/issues/ISSUE-0089-automatic-student-cancellation-lifecycle.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-student-shell.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`
- `docs/frontend/per-component-brief/ui-form-controls.md`
- `docs/frontend/per-component-brief/ui-button.md`
- `docs/frontend/per-component-brief/ui-status-badge.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: unavailable cancellation hides route/action; submit failures stay on form with visible error.

## Open Questions

- None.
