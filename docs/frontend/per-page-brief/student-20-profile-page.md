# Student 20 Profile Page

## Reference

- HTML: `docs/frontend/html-reference/Student - 20 - Profile Page.html`
- Desktop screenshot: `docs/frontend/screenshots/student-20-profile-page-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/student-20-profile-page-mobile.png`
- Reference label: `Student - 20 - Profile Page`

## Route Contract

- Proposed route: `/student/profile`
- Auth/role: `student`
- Unauthorized behavior: redirect to login.
- Redirect behavior: logout clears token and returns to `/login`.

## Purpose

- User job: view read-only account and academic identity.
- Entry points: student shell profile nav/avatar.
- Exit points: logout, reservations/facilities nav.

## Design Contract

- Layout: Student shell with identity sidebar/card and academic information card.
- Desktop behavior: sidebar plus main card.
- Mobile behavior: stacked cards, single-column label/value rows.
- Required copy/status labels: preserve `Profil`, `Keluar`, `Aktif`, NIM/phone/program/faculty labels.
- Source-of-truth notes: profile is read-only for MVP.

## UX Behavior

- Primary actions: logout.
- Secondary actions: navigate via shell.
- Loading state: profile skeleton with stable card sizes.
- Empty state: unknown academic profile fields display quiet missing values, not errors.
- Error state: failed `/auth/me` clears session.
- Disabled state: no edit controls.

## Accessibility

- Logout button must be clearly named and not styled as primary success.
- Label/value groups must be readable by screen readers.
- Missing academic values should be represented as text.

## Data And Fixture Contract

- Deterministic fixture requirements: student identity with full and partial academic profile.
- Real entities: Current user response.
- Fixture media: initials/avatar only.

## Backend Integration And Gaps

- Endpoints consumed: `GET /auth/me`.
- Page-needed fields: `full_name`, `email`, `nim`, `phone`, `academic_profile.program_studi`, `faculty`, `entry_year`, `degree`, `is_active`.
- Auth/session assumptions: clear token on `401` or failed `/auth/me`.
- Source files: `app/api/routes/account_routes.py`, `app/schemas/account_schemas.py`.

### BG-STUDENT-20-01: Current User Profile Identity

- Status: `resolved`
- Domain area: Auth and session
- Affected UI: student profile identity and academic info.
- Contract needed: `/auth/me` includes NIM, phone, and best-effort academic profile for students.
- Evidence: `UserResponse` includes `nim`, `phone`, and `academic_profile`; `/auth/me` exists in `app/api/routes/account_routes.py`.
- Source issue/PRD: `docs/issues/ISSUE-0029-student-academic-profile-identity.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-student-shell.md`
- `docs/frontend/per-component-brief/profile-identity-card.md`
- `docs/frontend/per-component-brief/ui-button.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: failed session redirects to login; partial academic profile does not break layout.

## Open Questions

- None.
