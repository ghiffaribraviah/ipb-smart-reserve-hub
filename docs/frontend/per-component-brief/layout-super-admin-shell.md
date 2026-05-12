# Super Admin Shell

## Component Type

- Type: layout shell

## Used By

- `super-00-dashboard.md`

## Reference Evidence

- HTML reference: `Super - 00 - Dashboard.html`.
- Screenshots: super dashboard desktop/mobile.

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

- Future nav links should not be fully implemented without page references.

## Accessibility

- Nav exposes current page.
- Notification and profile affordances have labels.

## Data Contract

- Props/data fields: active nav key, notification state, children.
- Events: nav/profile/notification.

## Design Rules

- Desktop: `80px` fixed header, `1200px` content.
- Mobile: `64px` header with hamburger and `SA` profile.
- Color: indigo Super Admin accent for primary actions/profile affordance.
- Overflow: stacked mobile sections.

## Implementation Notes

- Do not force student green into Super Admin-only surfaces.

## Acceptance Checks

- Dashboard screenshots match reference.

## Open Questions

- Future Super Admin page references are missing.

