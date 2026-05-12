# Super Governance Table

## Component Type

- Type: data display

## Used By

- `super-00-dashboard.md`

## Reference Evidence

- HTML reference: Super 00.
- Screenshots: super dashboard desktop/mobile.

## Purpose

Show administrator governance rows for Super Admin oversight.

## Anatomy

- Admin identity.
- Scope/department.
- Status.
- Last activity/time.
- Actions if referenced.

## Variants

- Desktop table.
- Mobile governance cards.

## Behavior

- Read-only until management pages are designed.

## Accessibility

- Table headers/card labels are explicit.
- Status text is visible.

## Data Contract

- Props/data fields: admin rows with name/email/status/scope/timestamp.

## Design Rules

- Desktop: dense table.
- Mobile: cards with wrapped email/name text.
- Color: Super Admin accent for links/actions.

## Implementation Notes

- User/admin list backend endpoint is open in page brief.

## Acceptance Checks

- Long emails do not overflow mobile cards.

## Open Questions

- Future user-management page references are missing.

