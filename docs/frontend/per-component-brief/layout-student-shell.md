# Student Shell

## Component Type

- Type: layout shell

## Used By

- All student page briefs, including reservation workflow, cancellation, review, and profile pages.

## Reference Evidence

- HTML references: all `Student - ...` files, `Shared - 05 - Layout Shells.html`, `Shared - 04 - Mobile Navigation Drawer.html`.
- Screenshots: all student desktop/mobile screenshots, `shared-05-layout-shells-*`, `shared-04-mobile-navigation-drawer-*`.

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
- Active nav item for `Beranda`, `Fasilitas`, or `Reservasi`.

## Behavior

- Header links route internally.
- Mobile menu follows `Shared - 04 - Mobile Navigation Drawer.html`; page shells follow `Shared - 05 - Layout Shells.html`.

## Accessibility

- Header/nav/main/footer landmarks.
- Nav links expose current page.
- Icon buttons have accessible names.

## Data Contract

- Props/data fields: current user initials, active nav key, notification state, children.
- Events: nav, notification, profile, mobile menu.

## Design Rules

- Desktop: fixed white `72px` shared shell header and `1200px` content max width.
- Mobile: `64px` header, inline `IPB SRH` mark, hamburger, hidden desktop nav/search.
- Typography: Playfair brand, Inter UI.
- Color: green student accent.
- Overflow: no horizontal scroll at 390px.

## Implementation Notes

- Footer uses compact shared shell rhythm: brand/copyright grouped with horizontal links on desktop, centered stack on mobile.

## Acceptance Checks

- Shell matches Student 00 header/footer pattern across pages.

## Open Questions

- None.
