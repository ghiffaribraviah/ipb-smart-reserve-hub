# Rating Input

## Component Type

- Type: form/input component

## Used By

- `student-12-reservation-review-form.md`

## Reference Evidence

- HTML references: Student 12, `Shared - 06 - UI Primitives.html`.
- Screenshots: review form desktop/mobile, `shared-06-ui-primitives-*`.

## Purpose

Collect a required 1-5 star rating.

## Anatomy

- Label.
- Five star radio targets.
- Optional helper/error text.

## Variants

- Empty.
- Hover/focus.
- Selected.
- Error.

## Behavior

- Keyboard users can select rating with radio semantics.

## Accessibility

- Use radio group semantics.
- Each star has a programmatic label like `5 dari 5`.
- Error associated with group.

## Data Contract

- Props/data fields: value, error, disabled.
- Events: change.

## Design Rules

- Large touch targets.
- Selected/hovered stars use amber.

## Implementation Notes

- Do not use visual-only clickable spans.

## Acceptance Checks

- Rating works by keyboard and pointer.

## Open Questions

- None.
