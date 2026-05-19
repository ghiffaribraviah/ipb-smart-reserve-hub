# Auth Layout

## Component Type

- Type: layout shell

## Used By

- `login.md`
- `register.md`

## Reference Evidence

- HTML references: `Login.html`, `Register.html`.
- Screenshots: login/register desktop and mobile.

## Purpose

Provide the shared authentication screen frame and institutional visual context.

## Anatomy

- Brand/visual panel.
- Form panel.
- Page title, helper copy, form, secondary link.

## Variants

- Login form.
- Registration form.
- Message/error states.

## Behavior

- Preserves safe redirect query messaging.
- Switches between login/register links.

## Accessibility

- One `main` landmark.
- Form title is the page heading.
- Visual media is decorative or has appropriate alt text.

## Data Contract

- Props/data fields: `title`, `description`, `children`, `secondaryAction`, `message`.
- Events: form submission owned by child form.

## Design Rules

- Desktop: split layout matching screenshots, with footer/link content participating in normal flow so long auth forms do not overlap lower content.
- Mobile: single-column, no horizontal overflow.
- Typography: Inter body, Playfair brand where shown.
- Color: green primary action.
- Overflow: form content scrolls if needed, not the viewport horizontally.

## Implementation Notes

- Use deterministic local media, not remote placeholders.

## Acceptance Checks

- Login/register screenshots match reference at both viewports.

## Open Questions

- None.
