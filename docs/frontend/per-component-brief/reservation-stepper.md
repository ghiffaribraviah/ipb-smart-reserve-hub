# Reservation Stepper

## Component Type

- Type: domain workflow component

## Used By

- `student-03-reservation-time-form.md`
- `student-04-reservation-detail-form.md`
- `student-05-reservation-letter.md`

## Reference Evidence

- HTML references: Student 03, Student 04, Student 05.
- Screenshots: matching desktop/mobile screenshots.

## Purpose

Communicate current step and progress through reservation setup.

## Anatomy

- Step circles.
- Step labels.
- Connectors.

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

- Desktop: centered three-step layout.
- Mobile: compact labels under circles, no label collision at 390px.

## Implementation Notes

- Keep dimensions stable across label lengths.

## Acceptance Checks

- Mobile labels do not overlap.

## Open Questions

- None.

