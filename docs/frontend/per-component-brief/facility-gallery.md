# Facility Gallery

## Component Type

- Type: media/data display

## Used By

- `student-02-facility-details.md`
- student reservation detail pages.

## Reference Evidence

- HTML references: Student 02, Student 11 variants.
- Screenshots: matching desktop/mobile screenshots.

## Purpose

Show facility imagery with stable layout and accessible alternatives.

## Anatomy

- Primary image.
- Secondary thumbnails/images.
- Optional fallback.

## Variants

- Asymmetric desktop gallery.
- Stacked mobile gallery.
- Single-image fallback.

## Behavior

- Static for MVP unless a future reference adds carousel/lightbox behavior.

## Accessibility

- Every image has alt text.
- Decorative fallback is marked appropriately.

## Data Contract

- Props/data fields: images `url`, `alt_text`, `is_cover`.

## Design Rules

- Preserve reference aspect ratios.
- Avoid dark/blurred placeholders.
- Mobile images fit width without overflow.

## Implementation Notes

- Use local deterministic image fixtures for screenshot baselines.

## Acceptance Checks

- Gallery remains stable with one or many images.

## Open Questions

- Lightbox behavior is not referenced.

