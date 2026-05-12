# Public Calendar

## Component Type

- Type: domain workflow/data display

## Used By

- `student-02-facility-details.md`
- `student-03-reservation-time-form.md`
- `staff-02-facility-schedule.md`

## Reference Evidence

- HTML references: Student 02, Student 03, Admin 02.
- Screenshots: matching desktop/mobile screenshots.

## Purpose

Show blocked/reserved time and support time selection where the page requires it.

## Anatomy

- Period header.
- Previous/next controls.
- Day/time grid or schedule list.
- Event/blocked slot items.

## Variants

- Read-only public calendar.
- Selectable reservation time calendar.
- Staff schedule calendar.

## Behavior

- Navigation between periods.
- Selection for reservation time form.
- Staff schedule may need richer data than public calendar.

## Accessibility

- Calendar controls are named.
- Selected/unavailable states have text/aria state.
- Event time ranges are readable.

## Data Contract

- Props/data fields: entries with `activity_title`, `organization_unit`, `starts_at`, `ends_at`, optional status.
- Events: period change, slot selection.

## Design Rules

- Desktop grid/list follows reference spacing.
- Mobile uses compact list/card where needed.
- Color is not the only state signal.

## Implementation Notes

- Complex interaction states are tracked in `missing-design.md`.

## Acceptance Checks

- 390px mobile has no horizontal calendar overflow.

## Open Questions

- Staff private schedule data requirements need backend confirmation.

