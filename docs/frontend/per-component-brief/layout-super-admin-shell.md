# Super Admin Shell

## Component Type

- Type: layout shell

## Used By

- `super-00-dashboard.md`
- `super-01-pengguna.md`
- `super-02-fasilitas.md`
- `super-03-laporan.md`
- `super-04-sistem.md`

## Reference Evidence

- HTML references: `Super - 00 - Dashboard.html`, Super 01-04 pages, `Shared - 05 - Layout Shells.html`, `Shared - 04 - Mobile Navigation Drawer.html`.
- Screenshots: super dashboard/page screenshots, `shared-05-layout-shells-*`, `shared-04-mobile-navigation-drawer-*`.

## Purpose

Provide Super Admin navigation and role-specific accenting.

## Anatomy

- Fixed header.
- Brand.
- Desktop nav: `Dashboard`, `Pengguna`, `Fasilitas`, `Laporan`, `Sistem`.
- Notification.
- `SA` profile circle.
- Footer.

## Variants

- Active nav item.
- Mobile compact header.

## Behavior

- Super Admin nav links use Super 01-04 page references when implemented.

## Accessibility

- Nav exposes current page.
- Notification and profile affordances have labels.

## Data Contract

- Props/data fields: active nav key, notification state, children.
- Events: nav/profile/notification.

## Design Rules

- Desktop: `72px` fixed shared shell header, `1200px` content.
- Mobile: `64px` header with hamburger, inline brand, notification, and `SA` profile.
- Color: indigo Super Admin accent for primary actions/profile affordance.
- Overflow: stacked mobile sections.

## Implementation Notes

- Do not force student green into Super Admin-only surfaces. Footer links mirror `Dashboard`, `Pengguna`, `Fasilitas`, `Laporan`, and `Sistem`.

## Acceptance Checks

- Super Admin page and shared shell screenshots match references.

## Open Questions

- None.
