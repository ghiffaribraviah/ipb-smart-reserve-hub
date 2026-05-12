# Student Shell

## Component Type

- Type: layout shell

## Used By

- Student page briefs `student-00` through `student-20`.

## Reference Evidence

- HTML references: all `Student - ...` files.
- Screenshots: all student desktop/mobile screenshots.

## Purpose

Provide consistent student header, navigation, content container, and footer.

## Anatomy

- Fixed header.
- Brand `IPB SRH`.
- Desktop search/nav/profile/notification.
- Mobile hamburger, inline brand, notification, profile.
- Main content container.
- Footer.

## Variants

- Active nav item.
- Workflow pages with reduced primary nav where reference uses it.

## Behavior

- Header links route internally.
- Mobile menu design is not fully specified; use reference hamburger affordance until a menu reference exists.

## Accessibility

- Header/nav/main/footer landmarks.
- Nav links expose current page.
- Icon buttons have accessible names.

## Data Contract

- Props/data fields: current user initials, active nav key, notification state, children.
- Events: nav, notification, profile, mobile menu.

## Design Rules

- Desktop: fixed white `80px` header and `1200px` content max width.
- Mobile: `64px` header, hidden desktop nav/search.
- Typography: Playfair brand, Inter UI.
- Color: green student accent.
- Overflow: no horizontal scroll at 390px.

## Implementation Notes

- Keep footer centered on mobile.

## Acceptance Checks

- Shell matches Student 00 header/footer pattern across pages.

## Open Questions

- Notification and mobile drawer references are missing.

