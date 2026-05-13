# Public Calendar

## Component Type

- Type: domain workflow/data display

## Used By

- `student-02-facility-details.md`
- `student-03-reservation-time-form.md`
- `staff-02-facility-schedule.md`

## Reference Evidence

- HTML references: Student 02, Student 03, Admin 02, `Shared - 03 - Upload And Calendar States.html`.
- Screenshots: matching desktop/mobile screenshots, `shared-03-upload-and-calendar-states-*`.

## Purpose

Show blocked/reserved time and support time selection where the page requires it.

## Anatomy

- Period header.
- Previous/next controls.
- Shared month grid using `day-head`, `month-day`, `day-dots`, and legend/agenda where applicable.
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

- Desktop grid/list follows the shared month-day reference spacing.
- Mobile keeps the month grid inside the card without horizontal overflow and stacks agenda/list content below.
- Color is not the only state signal.

## Implementation Notes

- Selected, unavailable, review, and conflict state references live in `Shared - 03 - Upload And Calendar States.html`; page calendars should not use divergent `calendar-day`/`day-number` markup.

## Acceptance Checks

- 390px mobile has no horizontal calendar overflow.

## Open Questions

- Staff private schedule data requirements need backend confirmation.
