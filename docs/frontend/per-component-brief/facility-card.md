# Facility Card

## Component Type

- Type: domain data display

## Used By

- `student-00-home.md`
- `student-01-facility-catalog.md`

## Reference Evidence

- HTML references: Student 00, Student 01, `Shared - 08 - Data Display Components.html`.
- Screenshots: student home/catalog desktop/mobile, `shared-08-data-display-components-*`.

## Purpose

Display a facility preview for comparison and navigation.

## Anatomy

- Cover image.
- Facility name.
- Location/category/capacity.
- Rating/review count.
- Price/open-hours summary.
- Primary navigation action.

## Variants

- Featured card.
- Catalog card.
- Missing image fallback.

## Behavior

- Entire card or primary action opens facility detail.

## Accessibility

- Image alt text uses facility name/context.
- Card action has clear link text.

## Data Contract

- Props/data fields: `id`, `name`, `location`, `capacity`, `category`, `cover_image_url`, `rating_average`, `review_count`, `price_summary`, `open_hours_summary`.

## Design Rules

- Desktop cards align in grids.
- Mobile cards stack and keep image aspect ratio stable.
- Long names/locations wrap.

## Implementation Notes

- Use deterministic local fallback images in screenshot tests.

## Acceptance Checks

- Cards do not shift when images load.

## Open Questions

- None.
