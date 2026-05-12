# UI Button

## Component Type

- Type: UI primitive

## Used By

- All page briefs.

## Reference Evidence

- HTML references: auth pages, student workflow pages, staff pages, super dashboard.
- Screenshots: all desktop/mobile screenshots with actions.

## Purpose

Provide consistent primary, secondary, quiet, destructive, and role-accented actions.

## Anatomy

- Label text or icon plus label.
- Optional leading/trailing lucide icon.
- Loading/disabled state.

## Variants

- Green primary for student/staff flows.
- Indigo primary for Super Admin.
- Quiet/outline secondary.
- Red-tinted quiet session/destructive action.
- Amber quiet cancellation request action.

## Behavior

- Buttons submit forms only when explicitly `type="submit"`.
- Icon-only buttons require tooltips or accessible names.

## Accessibility

- Minimum touch target 44px.
- Loading state must keep accessible name.
- Disabled state must be programmatic and visual.

## Data Contract

- Props/data fields: `variant`, `size`, `icon`, `disabled`, `loading`, `type`, `aria-label`.
- Events: click/submit.

## Design Rules

- Desktop: compact but readable.
- Mobile: flow-advancing primary actions are full-width and about 52px high.
- Typography: normal Indonesian casing.
- Color: follow `DESIGN.md` role accents.
- Overflow: labels wrap or truncate only where the reference clearly allows it.

## Implementation Notes

- Use `lucide-react` icons when available.
- Keep dimensions stable during loading.

## Acceptance Checks

- Desktop and mobile rendering matches referenced pages.
- Interactive states are keyboard and pointer reachable.

## Open Questions

- None.

