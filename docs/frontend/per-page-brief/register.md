# Register

## Reference

- HTML: `docs/frontend/html-reference/Register.html`
- Desktop screenshot: `docs/frontend/screenshots/register-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/register-mobile.png`
- Reference label: `Register`

## Route Contract

- Proposed route: `/register`
- Auth/role: public
- Unauthorized behavior: not applicable.
- Redirect behavior: successful registration returns to `/login` with a success message; no auto-login for MVP.

## Purpose

- User job: create a student account with institutional identity.
- Entry points: login page secondary link, manual URL.
- Exit points: login page after successful registration.

## Design Contract

- Layout: same auth-layout family as login, with register-specific form density.
- Desktop behavior: preserve split auth layout, with registration fields grouped into `Data Identitas` and `Buat Kata Sandi` sections.
- Mobile behavior: single-column form with readable labels and no horizontal overflow.
- Required copy/status labels: preserve Indonesian form labels, validation copy, and primary action; password confirmation is `Konfirmasi Kata Sandi`.
- Source-of-truth notes: do not invent extra profile fields beyond reference/backend contract.

## UX Behavior

- Primary actions: submit registration.
- Secondary actions: return to login through a separated `Sudah punya akun?` area that must not collide with the footer or lower content.
- Loading state: disable submit while pending.
- Empty state: not applicable.
- Error state: field validation, duplicate account, invalid email domain.
- Disabled state: required invalid fields prevent submission.

## Accessibility

- Every input must have a visible or programmatic label.
- Validation messages must be associated with fields.
- Password requirements should not rely on placeholder-only text.
- Touch targets should be at least 44px high.

## Data And Fixture Contract

- Deterministic fixture requirements: success and validation-error examples.
- Real entities: student registration identity.
- Fixture media: same local auth visual as login.

## Backend Integration And Gaps

- Endpoints consumed: `POST /auth/register`.
- Page-needed fields: request `email`, `password`, `full_name`, `nim`, `phone`; response `id`, `email`, `full_name`, `role`, `is_active`, `nim`, `phone`, `academic_profile`.
- Auth/session assumptions: registration does not create a frontend session.
- Source files: `app/api/routes/account_routes.py`, `app/schemas/account_schemas.py`.

### BG-AUTH-REGISTER-01: Student Registration Contract

- Status: `resolved`
- Domain area: Auth and session
- Affected UI: register form.
- Contract needed: student self-registration accepts email/password/name/NIM/phone and returns public user identity.
- Evidence: `POST /auth/register` exists in `app/api/routes/account_routes.py`; `StudentRegistrationRequest` and `UserResponse` exist in `app/schemas/account_schemas.py`.
- Source issue/PRD: `docs/issues/ISSUE-0022-implement-student-self-registration-page.md`.

## Shared Components

- `docs/frontend/per-component-brief/auth-layout.md`
- `docs/frontend/per-component-brief/ui-form-controls.md`
- `docs/frontend/per-component-brief/ui-button.md`

## Acceptance Checks

- Behavior checks: corrected password confirmation label and section structure.
- Desktop screenshot at `1440 x 900`.
- Mobile screenshot at `390 x 844`.
- No mobile horizontal overflow.
- Integration checks: valid registration succeeds; invalid domain and duplicate email map to visible errors.

## Open Questions

- None.
