# Super KPI Card

## Component Type

- Type: data display

## Used By

- `super-00-dashboard.md`
- `super-01-pengguna.md`
- `super-02-fasilitas.md`
- `super-03-laporan.md`
- `super-04-sistem.md`

## Reference Evidence

- HTML references: Super 00-04, `Shared - 08 - Data Display Components.html`.
- Screenshots: super page desktop/mobile screenshots, `shared-08-data-display-components-*`.

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
- Color: Super Admin logo green accent where reference uses it.

## Implementation Notes

- Full KPI backend aggregate is currently open in page brief.

## Acceptance Checks

- Values remain readable when numbers grow.

## Open Questions

- None.
