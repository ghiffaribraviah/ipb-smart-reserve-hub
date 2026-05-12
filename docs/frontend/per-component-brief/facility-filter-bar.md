# Facility Filter Bar

## Component Type

- Type: form/data control

## Used By

- `student-01-facility-catalog.md`

## Reference Evidence

- HTML reference: Student 01.
- Screenshots: student catalog desktop/mobile.

## Purpose

Control catalog search, category, capacity, sorting, and pagination state.

## Anatomy

- Keyword search.
- Category select.
- Minimum capacity input/select.
- Sort select.
- Result count.

## Variants

- Desktop inline controls.
- Mobile stacked controls.

## Behavior

- Updates URL query params.
- Debounce text search if needed without hiding immediate input state.

## Accessibility

- Every control has a label.
- Result count is visible text.

## Data Contract

- Props/data fields: current filters, category options, result count.
- Events: filter change, reset.

## Design Rules

- Mobile controls are full width.
- Filter labels and values wrap if needed.

## Implementation Notes

- Keep backend sort enum values out of user-facing labels.

## Acceptance Checks

- No mobile overflow with long category names.

## Open Questions

- None.

