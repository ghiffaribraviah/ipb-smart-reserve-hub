# Review Decision Panel

## Component Type

- Type: domain workflow/form component

## Used By

- `staff-11-reservation-details.md`

## Reference Evidence

- HTML reference: Admin 11.
- Screenshots: admin reservation detail desktop/mobile.

## Purpose

Let assigned staff approve or reject document, payment, or cancellation reviews.

## Anatomy

- Current review status.
- File/document metadata.
- Approve action.
- Reject action and reason input.

## Variants

- Document review.
- Payment review.
- Cancellation review.
- Read-only completed review.

## Behavior

- Approve/reject submits to workflow-specific endpoint.
- Reject requires reason.

## Accessibility

- Reason input has label/error.
- Approve/reject buttons have clear names.
- Status is text-visible.

## Data Contract

- Props/data fields: review type, status, reservation ID, file metadata, reason.
- Events: approve, reject.

## Design Rules

- Desktop: compact action cluster.
- Mobile: stacked full-width decision actions.
- Destructive/reject action is visibly distinct but not oversized.

## Implementation Notes

- Confirmation dialog design is missing/non-blocking.

## Acceptance Checks

- Disabled/loading states do not shift layout.

## Open Questions

- Whether reject uses inline expansion or modal needs design confirmation.

