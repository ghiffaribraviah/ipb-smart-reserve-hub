---
id: ISSUE-0031
type: issue
title: Complete notification surface routing contract
status: done
category: enhancement
agent_mode: AFK
area:
  - backend
  - frontend-contract
prd: PRD-0003
blocked_by: []
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0031: Complete notification surface routing contract

## Parent

PRD-0003

## What to build

Complete the in-app notification API contract so role shells can render notification categories and navigate to stable targets without parsing titles or free-form messages. Existing notification delivery and read tracking should remain intact.

## Acceptance criteria

- [x] Notification list responses expose backend-owned category data suitable for student, staff, and Super Admin notification rows.
- [x] Notification list responses expose target navigation data or an equivalent stable target descriptor for reservation/workflow/system notifications.
- [x] Notification responses preserve unread/read state through `read_at` and mark-read behavior.
- [x] Users can only list and mark their own notifications.
- [x] Existing workflow-triggered notifications continue to be created.
- [x] Backend gap documentation records the shared notification contract gap as resolved or implemented.

## Blocked By

None - can start immediately.

## Implementation Notes

- Keep notification creation synchronous and in-app only.
- Prefer backend-owned category/target fields over frontend title parsing.
- Do not introduce email, push, SMS, WhatsApp, or external delivery behavior.

## Triage Notes

2026-05-13: Triaged as an unblocked backend/frontend-contract enhancement. Existing notification inbox, mark-read ownership checks, and workflow-triggered notification creation are present; this issue should complete the API response contract with backend-owned category and stable target descriptors while preserving those behaviors.

## Agent Brief

Implement through vertical TDD against the public notification API.

Scope:

- Extend notification response data with backend-owned `category` and target navigation data suitable for student, staff, and Super Admin shells.
- Preserve existing `reservation_id`, `read_at`, mark-read, ownership, and workflow-triggered creation behavior.
- Keep delivery in-app and synchronous only.
- Update shared notification backend gap documentation when the contract is implemented.

Suggested first behavior test:

- A student reservation notification returned by `GET /notifications` includes `category` and a stable `target` descriptor while preserving unread/read fields.

Evidence to record when closing:

- Targeted notification tests covering category/target fields, read-state preservation, ownership, and existing workflow creation.
- Documentation update in the notification surface/backend gap docs.

## Update Log

2026-05-13: Implemented and verified notification category/target contract.

- Code evidence: `app/services/notifications.py` now projects `category` and role-aware `target` descriptors for notification responses; `app/schemas/notification_schemas.py` exposes the response contract.
- API behavior evidence: `tests/test_notifications.py` verifies student, staff, and Super Admin notification rows include category/target data, `read_at` survives mark-read, another user cannot mark someone else's notification, and workflow-triggered staff/Super Admin notifications still appear for assigned staff plus Super Admin.
- Documentation evidence: `docs/frontend/per-component-brief/notification-surface.md`, `docs/frontend/backend-gaps.md`, and `README.md` document the shared notification category/target contract.
- Test command: `uv run pytest tests/test_notifications.py` passed with 4 tests.
