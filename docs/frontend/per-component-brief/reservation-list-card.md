# Reservation List Card

## Component Type

- Type: domain data display

## Used By

- `student-10-reservation-list.md`

## Reference Evidence

- HTML reference: Student 10.
- Screenshots: student reservation list desktop/mobile.

## Purpose

Summarize a reservation and expose the correct next action.

## Anatomy

- Facility image/title.
- Schedule/organization metadata.
- Status badge.
- Action area.

## Variants

- Active approved.
- Waiting document/payment.
- Completed.
- Rejected/cancelled history.

## Behavior

- Maps workflow projections to route/action.
- Terminal history cards show only detail action.

## Accessibility

- Card heading is facility/activity.
- Status and action labels are explicit.

## Data Contract

- Props/data fields: `StudentReservationResponse` projection subset.
- Events: navigate, cancellation request.

## Design Rules

- Desktop: horizontal image/content/action.
- Mobile: stacked card.
- Long statuses wrap inside badge.

## Implementation Notes

- Keep projection-to-route mapping unit tested.

## Acceptance Checks

- Mixed statuses match reference and do not overflow.

## Open Questions

- Cancellation pending/rejected states need references.

