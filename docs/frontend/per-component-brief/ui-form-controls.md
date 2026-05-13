# UI Form Controls

## Component Type

- Type: form/input primitive

## Used By

- `login.md`, `register.md`, reservation form, payment/upload pages, staff edit pages, review form.

## Reference Evidence

- HTML references: Login, Register, Student 04, Student 07, Student 12, Student 13, Admin 03, Super 04, `Shared - 06 - UI Primitives.html`.
- Screenshots: matching desktop/mobile screenshots, `shared-06-ui-primitives-*`.

## Purpose

Provide text inputs, selects, textareas, checkbox rows, and validation presentation consistent with references.

## Anatomy

- Label.
- Control.
- Optional helper/error text.
- Optional icon or suffix.

## Variants

- Text, email, password, number, select, textarea.
- Checkbox option row.
- Read-only label/value row.

## Behavior

- Forms use React Hook Form and Zod where validation is needed.
- Backend remains source of truth for domain rules.

## Accessibility

- Labels are explicit.
- Errors are associated with controls.
- Checkbox rows are keyboard reachable.

## Data Contract

- Props/data fields: `name`, `label`, `value`, `error`, `required`, `disabled`, options.
- Events: change, blur, submit.

## Design Rules

- Desktop: compact readable controls.
- Mobile: 50-52px control height; full-width controls.
- Typography: 14-16px body/control text.
- Color: neutral border, green focus unless Super Admin-specific.
- Overflow: long options and values wrap.

## Implementation Notes

- Do not use placeholder-only labels.
- Keep textarea heights stable.

## Acceptance Checks

- Long Indonesian labels fit on mobile.
- Required and API errors are visible and associated.

## Open Questions

- None.
