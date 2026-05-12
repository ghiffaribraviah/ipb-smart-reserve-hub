# Category Shortcut

## Component Type

- Type: domain navigation component

## Used By

- `student-00-home.md`
- `student-01-facility-catalog.md`

## Reference Evidence

- HTML references: Student 00, Student 01.
- Screenshots: student home/catalog desktop/mobile.

## Purpose

Let students start facility browsing by active facility category.

## Anatomy

- Icon or icon hint.
- Category name.
- Facility count.

## Variants

- Active category shortcut.
- Empty active category with zero count.

## Behavior

- Click navigates to catalog with `category=<slug>`.

## Accessibility

- Link text includes category name and count.
- Icon is decorative when text is present.

## Data Contract

- Props/data fields: `id`, `name`, `slug`, `icon_hint`, `facility_count`.
- Events: navigate to category.

## Design Rules

- Mobile shortcuts wrap in a grid/stack without overflow.
- Use green accent consistent with student references.

## Implementation Notes

- Unknown `icon_hint` falls back to a generic facility icon.

## Acceptance Checks

- Counts remain readable at 390px.

## Open Questions

- None.

