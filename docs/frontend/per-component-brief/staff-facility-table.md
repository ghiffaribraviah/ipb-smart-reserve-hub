# Staff Facility Table

## Component Type

- Type: data display

## Used By

- `staff-01-facility-list.md`

## Reference Evidence

- HTML reference: Admin 01.
- Screenshots: admin facility list desktop/mobile.

## Purpose

Display assigned staff facilities and operational actions.

## Anatomy

- Facility name/location.
- Category/capacity.
- Active status.
- Schedule/edit actions.

## Variants

- Desktop table/list.
- Mobile cards.
- Active/inactive.

## Behavior

- Row actions navigate to schedule/edit pages.

## Accessibility

- Table headers/card labels are explicit.
- Icon actions have accessible names.

## Data Contract

- Props/data fields: `FacilityManagementProfileResponse` subset.
- Events: open schedule, edit.

## Design Rules

- Desktop: dense operational rows.
- Mobile: card conversion, no horizontal scroll.

## Implementation Notes

- Use `mobile-card-list.md` behavior on mobile.

## Acceptance Checks

- Long facility names and locations wrap.

## Open Questions

- None.

