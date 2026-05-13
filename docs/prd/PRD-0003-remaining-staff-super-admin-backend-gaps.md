---
id: PRD-0003
type: prd
title: Remaining Staff And Super Admin Backend Gaps
status: active
created: 2026-05-13
updated: 2026-05-13
issues:
  - ISSUE-0031
  - ISSUE-0032
  - ISSUE-0033
  - ISSUE-0034
  - ISSUE-0035
  - ISSUE-0036
  - ISSUE-0037
  - ISSUE-0038
---

# PRD: Remaining Staff And Super Admin Backend Gaps

## Problem Statement

The student-facing frontend integration gaps have mostly been closed, but the remaining staff, shared shell, and Super Admin pages still depend on backend contracts that are missing or too narrow. Staff users need assigned-facility operational read models for queues, lists, detail pages, and schedule views. Shell notifications need enough backend-owned routing and category data to render the notification surface without brittle title parsing. Super Admin users need dashboard, user-management, facility-governance, and report aggregates that do not currently exist as stable API contracts.

The backend already has important workflow actions: staff document/payment/cancellation review endpoints, staff facility profile management, Super Admin audit logs, Super Admin review moderation, booking settings, system status, notifications with read tracking, and staff assignment mutations. The problem is not that the domain workflows are absent; the problem is that several frontend pages need coherent read models and a small number of management mutations to integrate with real data.

## Solution

Add focused backend contracts for the remaining frontend backend gaps while preserving the existing domain boundaries. Staff reservation operations should expose assigned-facility read models for the verification queue, reservation list, reservation detail, and private schedule. Notification responses should expose backend-owned fields that let role shells render category, unread/read state, and target navigation. Super Admin operations should expose aggregate and governance read models for dashboard, users, facilities, and reports, plus user activation/deactivation actions.

The implementation should avoid rebuilding existing workflows. Staff approve/reject decisions already exist and should be treated as dependencies. Super Admin facility assignment already exists and should be reused by the governance page. Super Admin system status, booking settings, audit logs, and review moderation are already resolved and should only be composed into richer read models where needed.

## User Stories

1. As a staff user, I want to see reservations that need document, payment, or cancellation review, so that I can act on the current verification queue.
2. As a staff user, I want the verification queue scoped to my assigned Facilities, so that I only see Reservations I am allowed to review.
3. As a staff user, I want each queue item to show the Facility, student, Organization Unit, activity time, workflow type, status, and due time, so that I can prioritize operational work.
4. As a staff user, I want stale or no-longer-reviewable queue items omitted or marked unavailable, so that I do not start invalid review actions.
5. As a staff user, I want to browse all Reservations for my assigned Facilities with filters, so that I can inspect operational history and current work beyond the immediate queue.
6. As a staff user, I want the reservation list to expose lifecycle status plus document, payment, and cancellation review states, so that the table and mobile cards can show accurate Indonesian status labels.
7. As a staff user, I want reservation list filters for operational status, Facility, and date range, so that I can narrow the list to the work I need.
8. As a staff user, I want a staff reservation detail endpoint, so that the detail page can load all information needed for inspection and review from one assigned-access contract.
9. As a staff user, I want the reservation detail to include student, Organization Unit, Facility, schedule, extra requirements, submitted documents, payment receipt, cancellation request, status, and reasons, so that I can make the correct operational decision.
10. As a staff user, I want missing document or receipt metadata represented as null rather than fake filenames, so that the UI can hide unavailable download actions.
11. As a staff user, I want the detail read model to pair with existing approve/reject endpoints, so that a successful decision can refresh the current Reservation state without a separate workflow contract.
12. As a staff user, I want an assigned Facility schedule with private operational reservation data, so that the staff schedule page can show more than public blocked slots.
13. As a staff user, I want private schedule entries to include activity title, Organization Unit, time range, reservation status, and review type when relevant, so that the agenda and reservation list can route to the right detail page.
14. As a staff user, I want unassigned Facility schedule access denied, so that private reservation and student data is not exposed through calendar views.
15. As a student, I want shell notifications to link to the relevant reservation workflow page, so that I can respond to document, payment, approval, rejection, completion, or expiry events.
16. As a staff user, I want shell notifications to link to the relevant review queue or reservation detail, so that operational alerts become actionable.
17. As a Super Admin, I want shell notifications to identify system or operational activity categories, so that notification rows are understandable without parsing free-form text.
18. As a frontend integrator, I want notification responses to expose category, unread/read state, and target navigation, so that the notification surface does not hard-code fragile message heuristics.
19. As a Super Admin, I want dashboard KPI aggregates for users, active Facilities, Reservations, and system health, so that the dashboard reflects real system state.
20. As a Super Admin, I want administrator governance rows on the dashboard, so that I can monitor admin-created accounts and their active state.
21. As a Super Admin, I want recent activity data composed into the dashboard, so that operational changes are visible from the landing page.
22. As a Super Admin, I want to browse all User accounts with pagination and filters, so that user management remains usable as data grows.
23. As a Super Admin, I want user list rows to include identity, role, active status, student or staff profile hints, and last activity or review flag when available, so that I can make account decisions.
24. As a Super Admin, I want to activate and deactivate User accounts, so that access can be suspended without deleting historical records.
25. As an inactive User account, I should be unable to log in or refresh a session, so that deactivation has observable security effect.
26. As a Super Admin, I want role changes excluded from this scope, so that account management does not accidentally broaden into higher-risk permission mutation.
27. As a Super Admin, I want a Facility governance list, so that I can monitor active, inactive, and unassigned Facilities.
28. As a Super Admin, I want Facility governance rows to show assignment coverage, assigned staff count, and issue flags such as needing staff, so that assignment gaps are visible.
29. As a Super Admin, I want Facility governance to reuse existing staff assignment mutations, so that assignment behavior stays in one backend workflow.
30. As a Super Admin, I want Facility creation and import deferred, so that this PRD stays focused on integration blockers rather than inventing a larger Facility administration workflow.
31. As a Super Admin, I want report aggregates for reservations, revenue, and trends, so that the reports page can replace fixture KPI and chart data.
32. As a Super Admin, I want report aggregates filterable by date range where useful, so that reports can reflect the selected reporting period.
33. As a Super Admin, I want audit logs and review moderation treated as existing dependencies, so that this PRD does not rebuild resolved Super Admin behavior.
34. As a backend maintainer, I want these read models to stay behind small service interfaces, so that HTTP routes remain thin and persistence query details stay out of API handlers.
35. As a backend maintainer, I want staff access checks to use assigned-facility policy modules, so that private staff data is consistently protected.
36. As a backend maintainer, I want Super Admin access checks to use named Access Policy actions, so that role rules remain local to the Access Policy Module.
37. As a backend maintainer, I want response contracts documented in the frontend backend gap ledger, so that future frontend agents do not rediscover stale assumptions.
38. As a backend maintainer, I want implementation sliced vertically by observable behavior, so that each issue can follow the repository TDD loop.

## Implementation Decisions

- Build a Staff Reservation Operations read-model boundary for assigned-facility reservation queue, list, detail, and schedule data.
- Staff queue data should include only actionable document, payment, and cancellation review work for the current staff user's assigned Facilities.
- Staff reservation list data should support operational filters without exposing unassigned Facility Reservations.
- Staff reservation detail data should include all document, payment, cancellation, status, reason, student, Organization Unit, Facility, schedule, and extra requirement facts needed by the staff detail page.
- Staff private schedule data should be treated as an open backend gap, not satisfied by the public Facility calendar.
- Existing staff document, payment, and cancellation approve/reject endpoints are resolved dependencies and should not be rebuilt.
- Extend the notification API contract with backend-owned category and target navigation data, or an equivalent stable response shape that lets role shells navigate without parsing notification titles.
- Keep notification delivery and read tracking as existing behavior; do not rebuild notification creation in this PRD.
- Build Super Admin dashboard aggregates for the current dashboard KPIs and administrator governance needs, composing existing system status and activity data where possible.
- Build Super Admin user management with paginated/filterable user listing and activate/deactivate mutations.
- Do not add user role mutation in this PRD.
- Build Super Admin Facility governance as a read model for Facility identity, active state, assignment coverage, assigned staff count, and assignment issue flags.
- Reuse existing Super Admin staff assignment mutations for assignment changes.
- Do not add Facility create or import behavior in this PRD.
- Build Super Admin report aggregate read models for report KPIs and trend data.
- Defer report export unless a later issue explicitly scopes a minimal export contract.
- Keep Super Admin system status, booking settings, audit logs, review moderation, and settings history outside implementation except where existing data is composed into a new aggregate.
- Update backend gap documentation when a gap is implemented or reclassified.

## Testing Decisions

- Follow the repository TDD workflow: write one failing behavior test for the next vertical slice, implement the smallest code to pass it, then refactor while tests remain green.
- Tests verify observable behavior through public service and HTTP API interfaces, not private implementation details.
- Staff queue tests should verify actionable review items, due-time/status projection, and assigned-facility filtering.
- Staff reservation list tests should verify filtering, response shape, mixed workflow states, and denial of unassigned Facility data.
- Staff reservation detail tests should verify document, payment, cancellation, extra requirement, reason, and file metadata projections through an assigned staff account.
- Staff schedule tests should verify private operational fields and assigned-facility access enforcement.
- Notification contract tests should verify category, unread/read state, target navigation data, ownership, and mark-read behavior.
- Super Admin dashboard tests should verify aggregate values from domain fixtures and reject non-Super Admin access.
- User management tests should verify paginated/filterable listing, activate/deactivate behavior, inactive login denial, inactive token refresh denial, and current-user failure after deactivation.
- Facility governance tests should verify active/inactive Facility visibility, assignment coverage fields, unassigned issue flags, and use of existing assignment mutations.
- Report aggregate tests should verify KPI and trend calculations through public service/API behavior and date-range filtering where implemented.
- Documentation updates should be included in acceptance criteria for issues that resolve or reclassify frontend backend gaps.

## Out of Scope

- Frontend implementation.
- Rebuilding staff document, payment, or cancellation approve/reject endpoints.
- Facility create/import behavior.
- User role mutation.
- Settings history.
- External notification delivery such as email, WhatsApp, SMS, or push notifications.
- Rebuilding existing notification delivery or read tracking.
- Rebuilding Super Admin system status, booking settings, audit logs, or review moderation.
- Already resolved student, auth, public Facility Catalog, reservation submission, payment, approval-letter, review, and student profile backend gaps.
- Adding a new migration framework.

## Further Notes

This PRD is the follow-up to the frontend backend gap review focused on the remaining staff, shared shell, and Super Admin contracts. It intentionally narrows broad page needs into backend-owned read models and small management mutations. It also records the grilling decisions: notification routing is a contract-completeness gap, staff schedule is open, staff review decision actions are resolved, Super Admin user management includes activation/deactivation but not role mutation, and Super Admin Facility create/import remains deferred.

The PRD is ready to break down with `to-issues`.
