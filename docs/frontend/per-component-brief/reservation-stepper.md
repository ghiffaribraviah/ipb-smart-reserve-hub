# Reservation Stepper

## Component Type

- Type: domain workflow component

## Used By

- `student-03-reservation-time-form.md`
- `student-04-reservation-detail-form.md`
- `student-05-reservation-letter.md`
- `student-06-reservation-verification-waiting.md`
- `student-06-reservation-verification-declined.md`
- `student-07-payment.md`
- `student-07-payment-waiting.md`
- `student-07-payment-declined.md`
- `student-08-reservation-accepted.md`

## Reference Evidence

- HTML references: Student 03 through Student 08 workflow/status pages, `Shared - 07 - Reservation Workflow Components.html`.
- Screenshots: matching desktop/mobile screenshots, `shared-07-reservation-workflow-components-*`.

## Purpose

Communicate current step and progress through reservation setup.

## Anatomy

- Step circles.
- Step labels.
- Connectors using shared pseudo-line/progress treatment.

## Variants

- Active.
- Completed.
- Inactive.

## Behavior

- Informational unless the reference shows clickable steps.

## Accessibility

- Expose ordered step list and current step.
- Do not rely on connector color alone.

## Data Contract

- Props/data fields: steps, current step index.

## Design Rules

- Desktop: centered three-step grid with gray connector and green progress line.
- Mobile: compact labels under circles, no label collision at 390px.

## Implementation Notes

- Use the shared `step`, `circle`, `step-title`, and `step-state` anatomy; avoid legacy `step-item`/separate line markup.

## Acceptance Checks

- Mobile labels do not overlap.

## Open Questions

- None.
