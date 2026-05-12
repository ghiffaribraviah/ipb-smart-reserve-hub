# Student 12 Reservation Review Form

## Reference

- HTML: `docs/frontend/html-reference/Student - 12 - Reservation Review Form.html`
- Desktop screenshot: `docs/frontend/screenshots/student-12-reservation-review-form-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-12-reservation-review-form-mobile.png`
- Reference label: `Student - 12 - Reservation Review Form`

## Route Contract

- Proposed route: `/student/reservations/:reservationId/review`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: successful submit returns to completed reservation detail.

## Purpose

- User job: rate a completed reservation/facility and optionally leave a comment.
- Entry points: completed reservation detail.
- Exit points: completed reservation detail.

## Design Contract

- Layout: two-column form plus reservation summary on desktop.
- Desktop behavior: form card first, summary card beside it.
- Mobile behavior: form first, summary second, stacked full-width actions.
- Required copy/status labels: preserve `Tulis Ulasan`, `Kirim Ulasan`, `Komentar`.
- Source-of-truth notes: no separate review-title field unless backend changes.

## UX Behavior

- Primary actions: submit review.
- Secondary actions: cancel/back.
- Loading state: disable submit while pending.
- Empty state: not applicable.
- Error state: validation and eligibility errors.
- Disabled state: submit disabled until rating selected.

## Accessibility

- Rating must use accessible radio semantics with large targets.
- Textarea has label and optional status.
- Errors are associated with fields.
- Keyboard users can choose rating and submit.

## Data And Fixture Contract

- Deterministic fixture requirements: completed reservation summary and rating/comment examples.
- Real entities: Review submission.
- Fixture media: facility thumbnail/summary.

## Backend Integration And Gaps

- Endpoints consumed: `GET /student/reservations/:reservationId`, `POST /student/reservations/:reservationId/review`.
- Page-needed fields: request `rating`, `comment`; response review `id`, `reservation_id`, `facility_id`, `rating`, `comment`, `author_name`, `is_deleted`, `edit_warning`.
- Auth/session assumptions: student-owned completed reservation only.
- Source files: `app/api/routes/review_routes.py`, `app/schemas/review_schemas.py`.

### BG-STUDENT-12-01: Student Review Submission

- Status: `resolved`
- Domain area: Reviews
- Affected UI: review form and post-submit state.
- Contract needed: submit rating and optional comment for completed reservation.
- Evidence: `POST /student/reservations/{reservation_id}/review` exists; `ReviewSubmissionRequest` accepts `rating` and optional `comment`.
- Source issue/PRD: `docs/issues/ISSUE-0014-reviews-and-ratings.md`.

## Shared Components

- `docs/frontend/per-component-brief/rating-input.md`
- `docs/frontend/per-component-brief/reservation-summary-card.md`
- `docs/frontend/per-component-brief/ui-form-controls.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: duplicate/ineligible review maps to visible error.

## Open Questions

- None.

