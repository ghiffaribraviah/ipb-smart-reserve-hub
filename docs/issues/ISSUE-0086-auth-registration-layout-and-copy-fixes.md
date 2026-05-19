---
id: ISSUE-0086
type: issue
title: Auth registration layout and copy fixes
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
  - docs
blocked_by:
  - ISSUE-0085
created: 2026-05-19
updated: 2026-05-19
---

# ISSUE-0086: Auth registration layout and copy fixes

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Fix the reviewed auth-page issues by making registration easier to scan, preventing footer/link overlap, and correcting visible copy while preserving existing registration behavior.

## Acceptance criteria

- [ ] Register page is visually split into identity details and password creation sections.
- [ ] The `Sudah punya akun?` area no longer collides with lower content on desktop or mobile.
- [ ] The password confirmation label typo is corrected from `Surat Sandi` to the intended password-copy label.
- [ ] Auth pages use the current IPB SRH logo treatment and deterministic image/brand area from ISSUE-0085.
- [ ] Existing registration validation and API behavior remain intact.
- [ ] `docs/frontend/per-page-brief/register.md` and affected auth component briefs reflect the revised layout/copy.
- [ ] `RegisterPage` behavior tests cover the corrected labels and section structure.
- [ ] `auth-pages.spec.ts` screenshots are updated at desktop and mobile sizes with no horizontal overflow.

## Blocked By

- ISSUE-0085

## Implementation Notes

- Likely frontend touchpoints: `frontend/src/pages/auth/RegisterPage.tsx`, `frontend/src/components/auth/AuthLayout.tsx`, `frontend/tests/e2e/auth-pages.spec.ts`, and register page briefs.
- Keep backend registration contract unchanged.
- 2026-05-19: Implemented semantic register form sections (`Data Identitas`, `Buat Kata Sandi`), corrected the confirmation label to `Konfirmasi Kata Sandi`, moved the shared auth footer into normal layout flow to prevent long-form overlap, and updated register/auth docs plus HTML reference copy.

## Triage Notes

- 2026-05-19: Triaged after `ISSUE-0085` was completed. The issue is actionable as a scoped frontend enhancement: it names the register page, the typo, the layout problem, the relevant docs/tests, and explicitly keeps backend registration behavior unchanged.

## Agent Brief

**Category:** enhancement
**Summary:** Split the student registration form into clearer identity/password sections and fix reviewed auth copy/layout issues.

**Current behavior:**
The registration page presents all fields as one dense form. The secondary `Sudah punya akun?` area can collide visually with lower content in screenshots, and the password confirmation field uses the typo `Surat Sandi`.

**Desired behavior:**
The register page should remain the same public registration flow and backend contract, but the visual form should be easier to scan. Identity fields and password creation fields should be visibly grouped with Indonesian section headings. The secondary login link should sit below the form with enough spacing on desktop and mobile. The password confirmation label should use the intended password-copy wording.

**Key interfaces:**
- Public `/register` route and registration form behavior.
- Shared auth layout component and auth field controls.
- Register page/component brief and auth layout brief.
- Register page Vitest/React Testing Library behavior tests.
- Auth Playwright screenshot spec at desktop `1440 x 900` and mobile `390 x 844`.

**Acceptance criteria:**
- [ ] Register page visually separates identity details from password creation.
- [ ] The `Sudah punya akun?` login area does not collide with lower content on desktop or mobile.
- [ ] Password confirmation label no longer says `Surat Sandi`.
- [ ] Registration validation, request payload, API error display, loading state, and redirect behavior remain unchanged.
- [ ] Register page and auth component briefs document the revised layout/copy contract.
- [ ] Register behavior tests cover the corrected label and section structure.
- [ ] Auth page Playwright screenshots pass on desktop and mobile with no horizontal overflow.

**Out of scope:**
- Backend registration contract changes.
- Additional registration fields.
- New production media assets.

## Update Log

- 2026-05-19: Completed. Verification:
  - `npm test -- RegisterPage`
  - `npm run typecheck`
  - `npx playwright test auth-pages.spec.ts --update-snapshots`
  - `npx playwright test auth-pages.spec.ts`
  - `npm run build`
