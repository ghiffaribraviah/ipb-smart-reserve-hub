# Reservation Status Panel

## Component Type

- Type: domain feedback component

## Used By

- Verification, payment waiting/declined, accepted pages.

## Reference Evidence

- HTML references: Student 06, Student 07 variants, Student 08.
- Screenshots: matching desktop/mobile screenshots.

## Purpose

Show the current workflow status and next navigation action.

## Anatomy

- Status icon/visual.
- Heading.
- Explanation text.
- Reservation summary.
- CTA row.

## Variants

- Waiting document.
- Document declined.
- Waiting payment.
- Payment declined.
- Accepted.

## Behavior

- Read-only; routes via CTA.

## Accessibility

- Heading communicates status.
- Icon is decorative unless it has text alternative.
- Reason text must be announced/readable.

## Data Contract

- Props/data fields: status kind, title, message, reason, summary, actions.

## Design Rules

- Desktop: compact centered panel.
- Mobile: full-width panel with full-width primary CTA.
- Color: green success, amber waiting, red declined.

## Implementation Notes

- Route selection belongs to page/container logic.

## Acceptance Checks

- Long reason messages wrap.

## Open Questions

- None.

