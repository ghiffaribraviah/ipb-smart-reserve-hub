# Review Decision Dialog

## Component Type

- Type: modal/dialog workflow component

## Used By

- `staff-11-reservation-details.md`
- `staff-12-review-decision-dialogs.md`
- Staff review queues when approving/rejecting documents or payments.

## Reference Evidence

- HTML references: `Admin - 12 - Review Decision Dialogs.html`, `Admin - 11 - Reservation Details.html`.
- Screenshots: admin review decision dialog desktop/mobile, admin reservation detail desktop/mobile.

## Purpose

Collect and confirm staff review decisions with the correct summary context, reason requirement, and action hierarchy.

## Anatomy

- Dialog title and supporting copy.
- Close action.
- Summary rows.
- Optional required reason textarea.
- Warning/danger note for rejection.
- Footer action buttons.

## Variants

- Approve document/payment.
- Reject document/payment with reason.
- Legacy cancellation decision states are not surfaced in the integrated staff UI after automatic student cancellation.

## Behavior

- Opens from a staff action.
- Reject variants require a non-empty reason.
- Submitting disables footer actions and preserves the entered reason on error.

## Accessibility

- Uses `role="dialog"` or native dialog semantics.
- `aria-labelledby` references the visible title.
- Focus is trapped while open and restored on close.
- Close button has an accessible name.

## Data Contract

- Props/data fields: reservation summary, document/payment review target, decision type, existing status, reason value, submitting/error state.
- Events: close, confirm approve, confirm reject.

## Design Rules

- Desktop: centered `620px` dialog over muted context.
- Mobile: full-width stacked dialog content; footer buttons stack.
- Rejection actions use red-tinted styling; neutral close/back actions remain quiet.
- Do not include `Setujui sebagai alternatif`.

## Implementation Notes

- Backend gap ownership lives in `staff-12-review-decision-dialogs.md`.

## Acceptance Checks

- Empty rejection reason cannot be submitted.
- Dialog footer does not overflow on mobile.

## Open Questions

- Exact backend route split for document and payment review decisions.
