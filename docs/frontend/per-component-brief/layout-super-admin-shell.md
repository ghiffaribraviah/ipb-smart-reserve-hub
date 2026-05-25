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

- Fixed header with brand, notification, and `SA` profile circle.
- Desktop hover-expand sidebar nav: `Dashboard`, `Pengguna`, `Fasilitas`, `Laporan`, `Sistem`.
- Mobile off-canvas drawer with the same nav items.
- Main content shifted right on desktop to avoid the collapsed sidebar.

## Variants

- Active nav item.
- Mobile compact header with drawer trigger.

## Behavior

- Super Admin nav links use Super 01-04 page references when implemented.

## Accessibility

- Nav exposes current page.
- Notification and profile affordances have labels.

## Data Contract

- Props/data fields: active nav key, notification state, children.
- Events: nav/profile/notification.

## Design Rules

- Desktop: `72px` fixed shared shell header, `78px` collapsed sidebar that expands on hover, `1200px` content.
- Mobile: `64px` header with hamburger, inline brand, notification, and `SA` profile.
- Color: logo green Super Admin accent for primary actions/profile affordance.
- Overflow: stacked mobile sections, no footer.

## Implementation Notes

- Do not force student green into Super Admin-only surfaces. Use the same sidebar pattern as staff for desktop navigation, but keep Super Admin labels and profile affordance.

## Acceptance Checks

- Super Admin page and shared shell screenshots match references or the updated sidebar shell implementation.

## Open Questions

- None.
