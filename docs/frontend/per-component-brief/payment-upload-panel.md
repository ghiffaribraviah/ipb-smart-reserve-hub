# Payment Upload Panel

## Component Type

- Type: domain workflow/form component

## Used By

- `student-07-payment.md`
- `student-07-payment-waiting.md`
- `student-07-payment-declined.md`

## Reference Evidence

- HTML references: Student 07 payment variants.
- Screenshots: payment desktop/mobile variants.

## Purpose

Display payment instructions, receipt upload, and payment review state.

## Anatomy

- Amount/instructions.
- Receipt upload or metadata row.
- Status/reason area.
- Primary action.

## Variants

- Upload needed.
- Waiting review.
- Declined.
- Approved/read-only.

## Behavior

- Upload route is available only in pending-payment state.
- Waiting/declined variants are read-only.

## Accessibility

- Amount and instructions are text.
- Upload control labelled.
- Rejection reason text-visible.

## Data Contract

- Props/data fields: amount, instructions, required, receipt metadata, review status, rejection reason.
- Events: receipt selected/submitted.

## Design Rules

- Mobile panels stack and breathe.
- Receipt filenames wrap.
- Amber waiting and red declined surfaces follow references.

## Implementation Notes

- Use shared file upload panel for receipt input.

## Acceptance Checks

- Upload/waiting/declined variants match references.

## Open Questions

- None.

