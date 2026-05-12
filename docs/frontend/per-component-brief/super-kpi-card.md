# Super KPI Card

## Component Type

- Type: data display

## Used By

- `super-00-dashboard.md`

## Reference Evidence

- HTML reference: Super 00.
- Screenshots: super dashboard desktop/mobile.

## Purpose

Display high-level operational metrics.

## Anatomy

- Icon/accent.
- Numeric value.
- Label.
- Optional trend/context.

## Variants

- Total users.
- Active facilities.
- Total reservations.
- System health.

## Behavior

- Read-only for MVP.

## Accessibility

- KPI value and label are text.
- Icon is decorative.

## Data Contract

- Props/data fields: label, value, tone, icon, context.

## Design Rules

- Desktop: four-card grid.
- Mobile: stacked cards.
- Color: Super Admin indigo accent where reference uses it.

## Implementation Notes

- Full KPI backend aggregate is currently open in page brief.

## Acceptance Checks

- Values remain readable when numbers grow.

## Open Questions

- None.

