# Mobile Navigation Drawer

## Component Type

- Type: layout shell/navigation component

## Used By

- Student shell pages.
- Staff shell pages.
- Super Admin shell pages.

## Reference Evidence

- HTML references: `Shared - 04 - Mobile Navigation Drawer.html`, `Shared - 05 - Layout Shells.html`.
- Screenshots: `shared-04-mobile-navigation-drawer-*`, `shared-05-layout-shells-*`, and all mobile role-page screenshots.

## Purpose

Provide the opened mobile navigation state for the hamburger action in each role shell.

## Anatomy

- Overlay/scrim where applicable.
- Drawer panel.
- Role-aware nav links.
- Notification/profile shortcuts.
- Active route indicator.

## Variants

- Student: `Beranda`, `Fasilitas`, `Reservasi`.
- Staff: `Beranda`, `Reservasi`, `Fasilitas`.
- Super Admin: `Dashboard`, `Pengguna`, `Fasilitas`, `Laporan`, `Sistem`.

## Behavior

- Opens from the mobile hamburger in the shared shell.
- Closes on explicit close, nav selection, or escape/backdrop where implemented.
- Active route matches the current page.

## Accessibility

- Hamburger and close actions have accessible names.
- Drawer is announced as navigation.
- Focus moves into the drawer on open and returns to the hamburger on close.

## Data Contract

- Props/data fields: role, active nav key, current user initials, notification count/state.
- Events: close, nav select, notification, profile.

## Design Rules

- Mobile-only component; desktop nav remains inline in the shell.
- Uses the same brand, spacing, link labels, and active accent as the role shell.
- No horizontal overflow at `390px`.

## Implementation Notes

- Keep route/code role names as `student`, `staff`, and `super_admin`; visible labels follow the references.

## Acceptance Checks

- Drawer links match the role-specific shared shell order.
- Focus and escape behavior work.

## Open Questions

- None.
