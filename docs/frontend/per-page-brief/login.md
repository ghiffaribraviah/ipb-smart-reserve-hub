# Login

## Reference

- HTML: `docs/frontend/html-reference/Login.html`
- Desktop screenshot: `docs/frontend/screenshots/login-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/login-mobile.png`
- Reference label: `Login`

## Route Contract

- Proposed route: `/login`
- Auth/role: public
- Unauthorized behavior: not applicable.
- Redirect behavior: preserve safe internal `redirect` query params after successful login; reject external redirects.

## Purpose

- User job: authenticate and enter the role-appropriate shell.
- Entry points: unauthenticated protected route redirect, register success, manual URL.
- Exit points: student shell, staff shell, super-admin shell, register page.

## Design Contract

- Layout: split auth surface matching the reference, with the brand and institutional visual treatment from the screenshots.
- Desktop behavior: two-column auth layout, form panel aligned with visual panel.
- Mobile behavior: stacked compact form without horizontal overflow.
- Required copy/status labels: preserve Indonesian labels and error copy from the reference.
- Source-of-truth notes: match form spacing, input height, green primary action, and responsive rhythm in the screenshots.

## UX Behavior

- Primary actions: submit login form.
- Secondary actions: navigate to registration and recover from redirect messages if shown.
- Loading state: disable submit and keep form dimensions stable.
- Empty state: not applicable.
- Error state: invalid credentials, expired session, and network failure use the reference form-error style.
- Disabled state: submit disabled while pending or when required fields are invalid.

## Accessibility

- Use a `main` landmark and labelled email/password fields.
- Password visibility controls must be keyboard reachable and named.
- Error text must be associated with the relevant field or form.
- Touch targets should be at least 44px high.

## Data And Fixture Contract

- Deterministic fixture requirements: demo login messages and role destination examples.
- Real entities: `User`, bearer token.
- Fixture media: local deterministic auth visual; no remote image dependencies.

## Backend Integration And Gaps

- Endpoints consumed: `POST /auth/login`, `GET /auth/me` after token restore or login.
- Page-needed fields: token `access_token`; user `id`, `email`, `full_name`, `role`, `is_active`.
- Auth/session assumptions: token stored in memory and mirrored to `sessionStorage`.
- Source files: `app/api/routes/account_routes.py`, `app/schemas/account_schemas.py`.

### BG-AUTH-LOGIN-01: Login And Session Contract

- Status: `resolved`
- Domain area: Auth and session
- Affected UI: login form, redirect handling, role landing.
- Contract needed: login returns bearer token and current-user lookup returns role identity.
- Evidence: `POST /auth/login` and `GET /auth/me` exist in `app/api/routes/account_routes.py`; `TokenResponse` and `UserResponse` exist in `app/schemas/account_schemas.py`.
- Source issue/PRD: `docs/issues/ISSUE-0001-project-foundation-auth-and-role-shell.md`, `docs/issues/ISSUE-0019-add-current-user-auth-endpoint.md`.

## Shared Components

- `docs/frontend/per-component-brief/auth-layout.md`
- `docs/frontend/per-component-brief/ui-form-controls.md`
- `docs/frontend/per-component-brief/ui-button.md`

## Acceptance Checks

- Desktop screenshot at `1440 x 900`.
- Mobile screenshot at `390 x 844`.
- No mobile horizontal overflow.
- Text does not overlap or overflow controls.
- Integration checks: valid login stores session; invalid login shows error; safe redirect is honored; external redirect is ignored.

## Open Questions

- None.

