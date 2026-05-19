---
id: ISSUE-0093
type: issue
title: Super Admin reservations governance page
status: needs-info
category: enhancement
agent_mode: HITL
area:
  - backend
  - frontend
  - docs
blocked_by:
  - ISSUE-0092
created: 2026-05-19
updated: 2026-05-19
---

# ISSUE-0093: Super Admin reservations governance page

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Add a Super Admin reservations governance area for cross-facility visibility, detail review, and exceptional administrative cancellation without giving Super Admin staff document/payment verification actions.

## Acceptance criteria

- [ ] Super Admin nav includes `Reservasi` and routes to `/super-admin/reservations`.
- [ ] Backend exposes a Super Admin reservation list across facilities with filters for status, facility, date range, and search where practical.
- [ ] Backend exposes a Super Admin reservation detail read model without staff assignment restrictions.
- [ ] Super Admin can cancel a reservation for exceptional administrative cases with required reason and audit log entry.
- [ ] Super Admin reservation UI visually matches the users/facilities governance table style.
- [ ] Reservation detail shows student, facility, organization unit, time, lifecycle status, document/payment metadata, and cancellation/audit context.
- [ ] UI does not expose staff-owned document/payment verification approval or rejection actions.
- [ ] Backend tests cover access policy, list/detail visibility, cancellation lifecycle constraints, and audit logging.
- [ ] Frontend integration tests cover list loading, detail navigation, and cancellation success/error states.
- [ ] Page brief, component brief if needed, backend gaps, route/schema docs, and snapshots are added.

## Blocked By

- ISSUE-0092

## Implementation Notes

- Current code has student and staff reservation routes; no Super Admin reservation governance route was found during planning.
- Keep staff verification ownership intact.
- Follow backend TDD for new contracts.

## Triage Notes

- 2026-05-19: ISSUE-0092 is done, so the blocker is technically clear. Kept this issue out of AFK implementation because it is a new product surface and backend authority boundary, not only a reviewed UI cleanup. The source review phrases the Super Admin reservation area as optional (`perlu halaman untuk reservasi (?)`) and does not define cancellation policy, eligible statuses, detail design, filters, or audit-copy requirements. Needs human/product confirmation before backend TDD and frontend design work.

## Agent Brief

**Category:** enhancement
**Summary:** Add a Super Admin reservation governance area only after product confirms scope, cancellation authority, and page design.

**Known desired direction from review:**
Super Admin may need a reservations page for cross-facility visibility, reservation details, and exceptional cancellation. It should resemble the users/facilities governance table pattern and should not expose staff-owned document/payment verification actions.

**Decisions needed before implementation:**
- Should Super Admin reservation governance be built now, or deferred as a future product area?
- Which statuses can Super Admin cancel directly: pending document, pending payment, approved, completed, rejected, cancelled, or only pre-completion states?
- Does Super Admin cancellation bypass student/staff cancellation review, and what resulting reservation status should it use?
- What audit log action type and visible cancellation reason copy should be used?
- Should cancellation notify the student and assigned staff immediately?
- Which filters are required for v1: status, facility, date range, search, organization unit, payment/document state?
- What is the intended detail page layout and first-screen content for desktop/mobile?

**Implementation direction if approved:**
- Backend: add Super Admin list/detail/cancel routes, schemas, service/repository methods, audit logging, access-policy enforcement, and TDD coverage through public API routes.
- Frontend: add Super Admin nav item `Reservasi`, route `/super-admin/reservations`, governance table/cards, detail view, cancellation dialog, API integration tests, and Playwright screenshots.
- Docs: add page brief(s), backend gap entries, route/schema docs, and any component brief needed for reservation governance table/detail surfaces.

**Out of scope until approved:**
- Giving Super Admin staff document/payment approval or rejection actions.
- Permanent deletion of reservations.
- Replacing existing staff verification ownership.

## Update Log

No updates yet.
