# UI Status Badge

## Component Type

- Type: status/feedback primitive

## Used By

- Reservation lists/details, staff tables, profile, Super Admin governance table.

## Reference Evidence

- HTML references: Student 10/11/13/20, Admin 10/11, Super 00-04, `Shared - 06 - UI Primitives.html`, `Shared - 02 - Data And Auth States.html`.
- Screenshots: matching desktop/mobile screenshots, `shared-06-ui-primitives-*`, `shared-02-data-and-auth-states-*`.

## Purpose

Display explicit lifecycle and account statuses without relying on color alone.

## Anatomy

- Text label.
- Optional icon/dot.

## Variants

- Green success/approved/completed/active.
- Amber waiting/payment/cancellation.
- Red rejected/declined/inactive.
- Gray neutral/waiting review.

## Behavior

- Long labels may wrap within a constrained pill.

## Accessibility

- Status text is visible.
- Icons are decorative unless they add meaning.

## Data Contract

- Props/data fields: `status`, `label`, `tone`.

## Design Rules

- Mobile: pills wrap; no horizontal overflow.
- Typography: readable 12-14px depending density.
- Color: follow `DESIGN.md` status surfaces.

## Implementation Notes

- Map backend lifecycle plus page projections to Indonesian labels at the presentation boundary.

## Acceptance Checks

- `Menunggu Verifikasi Dokumen` fits on 390px screens.

## Open Questions

- None.
