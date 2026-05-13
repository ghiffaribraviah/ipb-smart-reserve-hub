# Student 13 Cancellation Request

## Reference

- HTML: `docs/frontend/html-reference/Student - 13 - Cancellation Request.html`
- Desktop screenshot: `docs/frontend/screenshots/student-13-cancellation-request-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-13-cancellation-request-mobile.png`
- Reference label: `Student - 13 - Cancellation Request`

## Route Contract

- Proposed route: `/student/reservations/:reservationId/cancellation-request`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: successful submit returns to reservation detail/list with cancellation-requested state.

## Purpose

- User job: request cancellation for an already approved reservation and understand refund limitations.
- Entry points: `Ajukan Pembatalan` from accepted reservation detail.
- Exit points: submit request, cancel/back to accepted detail.

## Design Contract

- Layout: two-column desktop form and reservation summary; mobile stacks form, summary, then state variants.
- Desktop behavior: form card leads, summary card anchors context, post-submit state references sit below.
- Mobile behavior: full-width controls/actions with readable refund warning and stacked summary rows.
- Required copy/status labels: preserve `Ajukan Pembatalan`, `Kirim Pengajuan`, `Pembatalan Menunggu Review`, `Pembatalan Ditolak`.
- Source-of-truth notes: pending/rejected examples are state references, not part of the active form state; cancellation action uses quiet amber styling, not destructive red.

## UX Behavior

- Primary actions: submit cancellation request.
- Secondary actions: cancel/back to reservation detail.
- Loading state: submit action retains layout while pending.
- Empty state: missing optional summary values are omitted or shown as quiet missing values.
- Error state: validation and API errors use form error styling.
- Disabled state: submit disabled until reason requirements are met.

## Accessibility

- Reason select and textarea need explicit labels.
- Refund warning is text-visible.
- Submit/cancel actions are keyboard reachable.
- State variant cards communicate status with text, not color alone.

## Data And Fixture Contract

- Deterministic fixture requirements: approved reservation summary, cancellation reason options, pending/rejected state examples.
- Real entities: StudentReservation detail and cancellation request.
- Fixture media: deterministic facility thumbnail.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`, `POST /student/reservations/:reservationId/cancellation-request`.
- Page-needed fields: reservation summary, cancellation eligibility, cancellation status/reason when present.
- Auth/session assumptions: student-owned reservation only.
- Source files: `app/api/routes/reservation_routes.py`, `app/schemas/reservation_schemas.py`.

### BG-STUDENT-13-01: Student Cancellation Request

- Status: `resolved`
- Domain area: Reservation Workflow
- Affected UI: cancellation request form and post-submit pending/rejected states.
- Contract needed: owned reservation detail plus cancellation request endpoint and cancellation projection fields.
- Evidence: `POST /student/reservations/{reservation_id}/cancellation-request` exists; `StudentReservationResponse` exposes cancellation fields used by list/detail projections.
- Source issue/PRD: `docs/issues/ISSUE-0013-cancellation-workflow.md`.

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
