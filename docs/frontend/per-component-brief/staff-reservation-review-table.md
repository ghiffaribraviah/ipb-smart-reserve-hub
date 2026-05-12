# Staff Reservation Review Table

## Component Type

- Type: domain workflow/data display

## Used By

- `staff-00-home.md`
- `staff-10-reservation-lists.md`

## Reference Evidence

- HTML references: Admin 00, Admin 10.
- Screenshots: matching admin desktop/mobile screenshots.

## Purpose

List staff-visible reservations and verification actions.

## Anatomy

- Reservation code/title.
- Facility/student/organization metadata.
- Date/time.
- Status/review type.
- Due time.
- Action.

## Variants

- Verification queue.
- Full reservation list.
- Mobile card list.

## Behavior

- Opens staff reservation detail.
- Filters/search should preserve query state.

## Accessibility

- Status and due times are text-visible.
- Action labels describe target reservation.

## Data Contract

- Props/data fields: staff reservation read model, filter state.
- Events: filter, open detail.

## Design Rules

- Desktop: dense table.
- Mobile: cards, no horizontal scroll.
- Long status labels wrap.

## Implementation Notes

- Backend read-model gaps are owned by staff page briefs.

## Acceptance Checks

- Queue/list variants match references once backend data exists.

## Open Questions

- Backend endpoint shape is open.

