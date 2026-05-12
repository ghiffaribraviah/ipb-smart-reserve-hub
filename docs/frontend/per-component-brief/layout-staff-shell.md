# Staff Shell

## Component Type

- Type: layout shell

## Used By

- `staff-00-home.md`
- `staff-01-facility-list.md`
- `staff-02-facility-schedule.md`
- `staff-03-edit-facility-details.md`
- `staff-10-reservation-lists.md`
- `staff-11-reservation-details.md`

## Reference Evidence

- HTML references: `Admin - ...` files.
- Screenshots: admin desktop/mobile screenshots.

## Purpose

Provide the staff operational shell while preserving Admin visual copy from references.

## Anatomy

- Fixed header with brand, search, `Reservasi` and `Fasilitas` nav, notification, profile.
- Main operational container.

## Variants

- Active reservation nav.
- Active facility nav.

## Behavior

- Internal route/code language uses `staff`; visible copy follows references.

## Accessibility

- Header/nav/main landmarks.
- Search has label.
- Icon actions have accessible names.

## Data Contract

- Props/data fields: active nav key, current staff profile, children.
- Events: nav/search/notification/profile.

## Design Rules

- Desktop: `80px` fixed header, dense operational content.
- Mobile: `64px` header, hidden desktop nav/search, cards instead of horizontal tables.
- Color: green operational accent.
- Overflow: mobile tables must convert to cards.

## Implementation Notes

- Do not rename user-facing `Admin` copy unless the reference changes.

## Acceptance Checks

- Staff pages match corresponding Admin references.

## Open Questions

- Mobile menu expansion is not referenced.

