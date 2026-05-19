# Super Governance Table

## Component Type

- Type: data display

## Used By

- `super-00-dashboard.md`
- `super-01-pengguna.md`
- `super-02-fasilitas.md`

## Reference Evidence

- HTML references: Super 00, Super 01, `Shared - 08 - Data Display Components.html`.
- Screenshots: super dashboard/user desktop/mobile, `shared-08-data-display-components-*`.

## Purpose

Show administrator, user, and facility governance rows for Super Admin oversight.

## Anatomy

- Entity identity.
- Scope, unit, or facility metadata.
- Status and coverage badges.
- Last activity/time when available.
- Actions when referenced.

## Variants

- Desktop table.
- Mobile governance cards.

## Behavior

- Read-only on dashboard; user and facility management pages define expanded rows/actions.
- Permanent deletion is not a table action in the current UI-fix track; use status, deactivate, or archive wording when a backend contract is not destructive.

## Accessibility

- Table headers/card labels are explicit.
- Status text is visible.

## Data Contract

- Props/data fields: admin/user/facility rows with identity, metadata, status, optional assignment coverage, and optional actions.

## Design Rules

- Desktop: dense table with stable action column.
- Mobile: cards with wrapped email/name text.
- Color: Super Admin accent for links/actions.

## Implementation Notes

- User/admin list backend endpoint is open in page brief.

## Acceptance Checks

- Long emails do not overflow mobile cards.

## Open Questions

- None.
