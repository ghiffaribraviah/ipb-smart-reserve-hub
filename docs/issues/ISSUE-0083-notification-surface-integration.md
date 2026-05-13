---
id: ISSUE-0083
type: issue
title: Notification surface integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
  - backend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0070
  - ISSUE-0075
  - ISSUE-0078
  - ISSUE-0079
  - ISSUE-0080
  - ISSUE-0081
  - ISSUE-0082
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0083: Notification surface integration

## Parent

PRD-0005

## What to build

Wire the shared notification surface to backend notification list/read endpoints and role-aware target routing.

## Acceptance criteria

- [x] Notification trigger opens a popover/drawer that works across Student, Staff, and Super Admin shells.
- [x] Notifications load from the backend and show title, message, category, timestamp, and unread/read state.
- [x] Mark-read action submits to the backend and updates visible unread state.
- [x] Notification target routes are resolved safely for each role.
- [x] Unsupported or non-existent target routes fall back to a safe role landing or corrected backend/docs target.
- [x] Empty, loading, and error states fit mobile width without overflow.
- [x] Vitest/RTL tests cover list render, empty state, mark read, target routing by role, unsupported target fallback, and error recovery.
- [x] Notification surface screenshots or relevant shell screenshots remain green.

## Blocked By

- ISSUE-0061
- ISSUE-0070
- ISSUE-0075
- ISSUE-0078
- ISSUE-0079
- ISSUE-0080
- ISSUE-0081
- ISSUE-0082

## Implementation Notes

- If backend notification targets point to routes not implemented by this plan, correct the route contract with backend TDD or document a safe fallback.
- Do not parse route targets from message text.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /notifications[]` | notification item | Render title/message/category/created/read | Parsing title for route |
| `target.route/reservation_id/type` | navigation target | Resolve role-safe route | Non-existent Super Admin reservation detail route |
| `POST /notifications/:id/read` | read state | Update/refetch item | Mark all read unless scoped |

## Agent Brief

Implemented a shared notification surface in `frontend/src/components/NotificationSurface.tsx` and wired it into the Student, Staff, and Super Admin shell notification actions. Use `GET /notifications` for list state, `POST /notifications/:id/read` for read updates, role-scoped route resolution for backend targets, and role landing fallback for unsupported or cross-role routes.

## Update Log

- 2026-05-13: Added shared notification surface, backend list/read integration, read-state mutation/refetch, role-safe target resolution, mobile-safe loading/empty/error states, and shell wiring across Student, Staff, and Super Admin headers.
- 2026-05-13: Verification passed: `npm test -- --run src/components/NotificationSurface.test.tsx`, `npm run typecheck`, `npx playwright test tests/e2e/student-home.spec.ts`, `npx playwright test tests/e2e/staff-home-reservations.spec.ts`, and `npx playwright test tests/e2e/super-admin-dashboard-users.spec.ts`.
