---
id: ISSUE-0061
type: issue
title: Frontend API/session foundation
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by: []
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0061: Frontend API/session foundation

## Parent

PRD-0005

## What to build

Create the thin frontend API/domain foundation needed for all later integration slices: request wrapper, auth/session state, Query provider setup, route guards, safe redirects, wrong-role redirects, upload/download helpers, and frontend test helpers.

## Acceptance criteria

- [x] App startup restores a bearer token from session storage and validates it with the current-user endpoint.
- [x] Invalid, inactive, or expired sessions clear local session state and redirect to login with the agreed reason.
- [x] Unauthenticated protected routes redirect to login with a safe internal redirect parameter.
- [x] Authenticated wrong-role access redirects to the user's own role landing page.
- [x] API request helpers attach bearer auth, normalize backend errors, and support JSON, multipart upload, and binary attachment download.
- [x] TanStack Query provider and test wrappers are available for later slices.
- [x] Vitest/RTL tests cover login/session restore, role guards, safe redirect behavior, 401 cleanup, and request helper error handling with mocked API responses.
- [x] Existing Playwright screenshots remain green unless a visible state intentionally changes.

## Blocked By

None - can start immediately.

## Implementation Notes

- Keep the API/domain layer thin and expand endpoint functions only as later slices need them.
- Use TypeScript response types by default and targeted runtime validation only where it materially reduces risk.
- Establish shared test helpers for providers, memory routing, QueryClient setup, fetch mocks, and session storage.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `POST /auth/login.access_token` | session token | Store in memory and mirror to session storage | Token expiry timers deferred |
| `GET /auth/me.role` | current role | Route guard uses `student`, `staff`, `super_admin` | Raw role comparisons outside guard helpers |
| API error `detail` | visible error message | Show Indonesian backend detail when available | Generic retry copy only as fallback |

## Agent Brief

Build the shared frontend integration foundation through TDD. Preserve existing design and keep the abstraction small.

## Update Log

### 2026-05-13

- Implemented the frontend API/session foundation in `frontend/src/api/http.ts`, `frontend/src/auth/session.tsx`, `frontend/src/AppProviders.tsx`, `frontend/src/App.tsx`, `frontend/src/main.tsx`, and `frontend/src/pages/auth/LoginPage.tsx`.
- Added reusable integration test helpers in `frontend/src/test/render.tsx`.
- Added behavior tests in `frontend/src/api/http.test.ts` and `frontend/src/auth/session.test.tsx` covering bearer auth, JSON/multipart/binary helpers, backend error normalization, 401 cleanup, session restore, invalid session redirect, unauthenticated guards, wrong-role redirects, login storage, and external redirect rejection.
- Added an explicit Playwright-only `VITE_E2E_AUTH_BYPASS=1` dev-server flag so existing visual reference routes remain directly capturable while normal app runs still enforce guards.
- Verification: `npm test -- --run src/api/http.test.ts src/auth/session.test.tsx` passed with 9 tests; `npm run typecheck` passed; `npm run test:e2e` passed with 86 Playwright tests.
