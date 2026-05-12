# Profile Identity Card

## Component Type

- Type: domain data display

## Used By

- `student-20-profile-page.md`

## Reference Evidence

- HTML reference: Student 20.
- Screenshots: profile desktop/mobile.

## Purpose

Display read-only student identity and session action.

## Anatomy

- Avatar/initials.
- Name/email.
- Active badge.
- Logout action.
- Academic label/value rows.

## Variants

- Full academic profile.
- Partial/unknown academic profile.

## Behavior

- Logout clears session and navigates to login.

## Accessibility

- Label/value rows are readable.
- Logout button is clearly named.

## Data Contract

- Props/data fields: full name, email, NIM, phone, academic profile, active state.
- Events: logout.

## Design Rules

- Desktop: sidebar plus main info card.
- Mobile: stacked, single-column rows.
- Missing values remain readable.

## Implementation Notes

- Profile editing is out of scope.

## Acceptance Checks

- Unknown academic fields do not break layout.

## Open Questions

- None.
