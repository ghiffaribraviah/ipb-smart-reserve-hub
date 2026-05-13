# Review Decision Panel

## Component Type

- Type: domain workflow/form component

## Used By

- `staff-11-reservation-details.md`

## Reference Evidence

- HTML references: Admin 11, Admin 12 `Review Decision Dialogs`.
- Screenshots: admin reservation detail and review decision dialog desktop/mobile.

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

- Desktop: compact action cluster or modal dialog with summary, required reason textarea for rejection, and clear footer actions.
- Mobile: stacked full-width decision actions/dialog footer buttons.
- Destructive/reject action is visibly distinct but not oversized.

## Implementation Notes

- Reject/confirmation modal reference is `Admin - 12 - Review Decision Dialogs.html`.

## Acceptance Checks

- Disabled/loading states do not shift layout.

## Open Questions

- None.
