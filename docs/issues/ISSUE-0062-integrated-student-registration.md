---
id: ISSUE-0062
type: issue
title: Integrated student registration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0062: Integrated student registration

## Parent

PRD-0005

## What to build

Wire the registration page to the student self-registration API while preserving the approved auth screen design and explicit no-auto-login behavior.

## Acceptance criteria

- [x] Registration form submits email, password, full name, NIM, and phone to the backend registration endpoint.
- [x] Successful registration redirects to login with the existing success state and does not create a frontend session.
- [x] Invalid email domain, duplicate email, password validation, and network errors map to visible form or page errors.
- [x] Frontend validation catches required fields and password confirmation before submit.
- [x] Vitest/RTL tests cover success, invalid domain, duplicate email, password mismatch, and loading/disabled states.
- [x] Auth page screenshots remain green after wiring.

## Blocked By

- ISSUE-0061

## Implementation Notes

- Keep registration separate from login/session creation.
- Preserve Indonesian user-facing labels and backend role language internally.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `POST /auth/register` request | registration form values | Submit exact backend field names | Auto-login deferred |
| `UserResponse.email/full_name/nim/phone` | success confirmation context | Do not expose unless needed for success state | Academic profile display belongs to profile slice |
| Error `400/409 detail` | form error | Show backend detail near form | Generic auth error only as fallback |

## Agent Brief

Integrate registration with mocked API tests and preserve the existing visual implementation.

## Update Log

### 2026-05-13

- Integrated `/register` in `frontend/src/pages/auth/RegisterPage.tsx` with `POST /auth/register`, submitting `email`, `password`, `full_name`, `nim`, and `phone` without creating a frontend session.
- Added frontend validation for required fields, `@apps.ipb.ac.id` email domain, password length, and password confirmation. Backend and network failures render visible form-level feedback.
- Added `frontend/src/pages/auth/RegisterPage.test.tsx` covering successful submit/redirect/no-session behavior, invalid email domain, duplicate email, password mismatch, and pending submit disabled state.
- Added the backend-required phone field to `docs/frontend/html-reference/Register.html`, regenerated canonical HTML reference screenshots, and updated the auth Playwright register snapshots for the intentional visual change.
- Verification: `npm test -- --run src/api/http.test.ts src/auth/session.test.tsx src/pages/auth/RegisterPage.test.tsx` passed with 14 tests; `npm run typecheck` passed; `npm run test:e2e -- auth-pages.spec.ts` passed with 6 Playwright tests; `npm run capture:html-reference` captured 80 screenshots from 40 HTML references.
