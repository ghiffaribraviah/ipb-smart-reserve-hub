# Data And Auth States

## Component Type

- Type: shared state/feedback components

## Used By

- All data-driven student, staff, and Super Admin pages.
- Auth-guarded routes.

## Reference Evidence

- HTML references: `Shared - 02 - Data And Auth States.html`.
- Screenshots: `shared-02-data-and-auth-states-desktop.png`, `shared-02-data-and-auth-states-mobile.png`.

## Purpose

Provide consistent loading, empty, API error, unauthorized, expired-session, overdue, and expired-reservation states.

## Anatomy

- State icon or skeleton.
- Short title.
- Supporting copy.
- Optional retry/login/action button.
- Optional status badge for overdue/expired projections.

## Variants

- Loading skeleton.
- Empty list/result.
- API error with retry.
- Unauthorized role.
- Expired session.
- Overdue verification.
- Expired reservation.

## Behavior

- Loading states reserve layout space to avoid large shifts.
- Error states offer retry when the underlying action is recoverable.
- Auth states route to login or a safe role home.

## Accessibility

- Loading and error transitions are announced where appropriate.
- Retry/login actions have clear labels.
- Do not rely on icon color alone.

## Data Contract

- Props/data fields: state type, title, message, optional action label/href, optional retry handler.
- Events: retry, login, navigate.

## Design Rules

- Use quiet white/neutral cards, subtle borders, and simple one-color icons.
- Mobile state cards fit within `390px` without horizontal overflow.
- Status copy stays Indonesian.

## Implementation Notes

- Page briefs own backend gaps for the data that produces these states.

## Acceptance Checks

- Empty/error/auth states are visually consistent across roles.
- Retry and redirect paths are testable.

## Open Questions

- None.
