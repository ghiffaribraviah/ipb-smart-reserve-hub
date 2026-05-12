# Mobile Card List

## Component Type

- Type: data display

## Used By

- Staff and Super Admin pages that convert desktop tables to mobile cards.

## Reference Evidence

- HTML references: Admin 01/10, Super 00.
- Screenshots: matching mobile screenshots.

## Purpose

Represent tabular operational data on mobile without horizontal scrolling.

## Anatomy

- Card heading.
- Label/value rows.
- Status badge.
- Action row.

## Variants

- Facility card.
- Reservation card.
- Governance/admin card.

## Behavior

- Actions stack or wrap predictably.

## Accessibility

- Labels and values are programmatically readable.
- Card headings identify each item.

## Data Contract

- Props/data fields: item heading, metadata rows, status, actions.

## Design Rules

- Mobile: full-width cards with stable spacing.
- Overflow: long names, emails, and filenames wrap.

## Implementation Notes

- Use when desktop data is table-like but mobile screenshot shows cards.

## Acceptance Checks

- No table causes horizontal scroll at `390 x 844`.

## Open Questions

- None.
