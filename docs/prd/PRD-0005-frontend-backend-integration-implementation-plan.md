---
id: PRD-0005
type: prd
title: Frontend Backend Integration Implementation Plan
status: active
created: 2026-05-13
updated: 2026-05-13
issues:
  - ISSUE-0061
  - ISSUE-0062
  - ISSUE-0063
  - ISSUE-0064
  - ISSUE-0065
  - ISSUE-0066
  - ISSUE-0067
  - ISSUE-0068
  - ISSUE-0069
  - ISSUE-0070
  - ISSUE-0071
  - ISSUE-0072
  - ISSUE-0073
  - ISSUE-0074
  - ISSUE-0075
  - ISSUE-0076
  - ISSUE-0077
  - ISSUE-0078
  - ISSUE-0079
  - ISSUE-0080
  - ISSUE-0081
  - ISSUE-0082
  - ISSUE-0083
  - ISSUE-0084
---

# PRD: Frontend Backend Integration Implementation Plan

## Problem Statement

The React frontend now has a complete design-first implementation with role pages, workflow pages, deterministic fixtures, page briefs, component briefs, and screenshot coverage. The backend has the main MVP API contracts and workflow behavior implemented. The remaining product gap is integration: the frontend still renders fixture data and does not yet have a shared API/session layer, route guards, live query behavior, file upload/download behavior, or role-aware workflow routing from backend projections.

The integration work also revealed several contract and fixture mismatches that must be corrected before page wiring. Public Facility Calendar data currently exposes other users' event titles and Organization Units, even though student-facing calendars should only communicate that a time range is unavailable. Some fixture labels and UI assumptions also drift from backend contracts, including catalog filter naming, reservation duration copy, payment receipt file types, Staff Facility fields, and Super Admin dashboard fields. If these are not normalized first, integration slices will either preserve misleading fixture behavior or create inconsistent page-specific mappers.

The plan needs to break frontend integration into independently implementable vertical slices. Each slice should preserve the approved design while replacing fixtures through TDD, and prerequisite backend contract fixes should be handled as backend-owned TDD slices inside the same plan because they directly block safe frontend integration.

## Solution

Build a thin shared frontend API/domain foundation, then progressively replace fixtures page by page using integration TDD. Keep existing visual structure intact unless a backend contract requires a visible state or copy correction. Add shared domain mappers only when multiple pages need the same behavior, especially for auth session state, role guards, reservation workflow projections, notifications, file metadata, money formatting, date formatting, and upload/download operations.

Before page integration begins, run a contract audit and fixture normalization slice. This slice updates documentation and any misleading fixture/page copy that contradicts backend or domain contracts, without wiring APIs. It should also record real backend gaps explicitly when the desired UI requires fields or actions that do not exist.

Include backend contract correction slices in this PRD where frontend integration exposed unsafe or inconsistent API behavior. The key required correction is Public Facility Calendar privacy: student-facing calendar entries must expose blocked time ranges without private Reservation details. A later notification correction may also be needed if notification targets point to routes that do not exist in the integrated frontend.

Use mocked API responses for default frontend integration tests. Keep backend contract behavior covered in backend tests. Preserve Playwright screenshot coverage after integration and use a final hardening slice to run the full verification set and manual seed-backed smoke.

## User Stories

1. As a student, I want to log in and have my session restored safely, so that I can continue using the Student shell without re-entering credentials unnecessarily.
2. As a student, I want invalid or expired sessions to be cleared and redirected to login, so that I do not see broken protected pages.
3. As a staff user, I want wrong-role routes to send me to the Staff landing page, so that I do not hit dead-end unauthorized screens.
4. As a Super Admin, I want wrong-role routes to send me to the Super Admin landing page, so that I remain inside the correct operational context.
5. As a student, I want to self-register with my campus email, NIM, phone, name, and password, so that I can create an account without staff intervention.
6. As a frontend maintainer, I want fixture and page copy normalized before API wiring, so that integration work does not preserve misleading design-only assumptions.
7. As a student, I want the home page to load real Facility Categories and featured Facilities, so that the landing page reflects current campus data.
8. As a student, I want category shortcuts to route to catalog filters using backend-owned slugs, so that browsing URLs are stable.
9. As a student, I want catalog search, category filtering, capacity filtering, sorting, and pagination to use real backend data, so that I can find suitable Facilities accurately.
10. As a student, I want catalog sort controls to map to supported backend sort options, so that invalid query values do not silently produce wrong results.
11. As a student, I want Facility detail pages to load real Facility information, images, contact data, price data, reviews, and public blocked time ranges, so that I can inspect a Facility before reserving it.
12. As a student, I want public calendars to show that times are reserved without revealing other users' event titles or Organization Units, so that Reservation privacy is preserved.
13. As a student, I want the Reservation time form to validate selected time ranges against backend rules, so that I know whether my chosen slot can proceed before filling details.
14. As a student, I want the Reservation time form to reflect the one-hour minimum duration rule, so that frontend copy matches backend validation.
15. As a student, I want to submit Reservation details with an Organization Unit, participant count, contact phone, event description, and Reservation Extra Requirements, so that my operational needs reach staff.
16. As a student, I want Reservation conflict errors to return me to actionable time-selection feedback, so that I can recover from a taken slot.
17. As a student, I want my Reservation list to route each card to the correct next workflow page, so that I can continue document, payment, cancellation, review, or detail work without guessing.
18. As a frontend maintainer, I want one shared Student Reservation Workflow Projection mapper, so that status labels, actions, badges, and canonical routes are consistent across student pages.
19. As a student, I want to generate and download my approval letter, so that I can complete the offline signature process.
20. As a student, I want to upload a signed approval letter with clear file validation, so that staff can review my Reservation document.
21. As a student, I want document waiting and declined states to load from real Reservation projections, so that I understand the current document outcome.
22. As a student, I want payment instructions to appear only for paid Reservations that are ready for payment, so that payment details are not shown prematurely.
23. As a student, I want payment receipt upload to accept only the supported image file types, so that frontend validation matches backend validation.
24. As a student, I want payment waiting and declined states to load from real Reservation projections, so that I understand payment review progress and rejection reasons.
25. As a student, I want accepted and completed Reservation detail pages to show real metadata and private file download actions only when files exist, so that the UI does not show fake filenames or broken downloads.
26. As a student, I want to request cancellation for eligible approved Reservations, so that staff can review cancellation before the event.
27. As a student, I want to submit one review for an eligible completed Reservation, so that my Facility feedback is recorded after use.
28. As a student, I want my profile page to load current identity and Student Academic Profile data from the backend, so that the frontend does not parse NIM itself.
29. As a staff user, I want my verification queue to show real assigned-facility document, payment, and cancellation review items, so that I can focus on actionable work.
30. As a staff user, I want the Staff Reservation list to show only Reservations for Facilities assigned to me, so that I do not see unrelated operational data.
31. As a staff user, I want Reservation details to show submitted documents, payment evidence, cancellation requests, student contact, event details, and Reservation Extra Requirements, so that I can make informed review decisions.
32. As a staff user, I want document, payment, and cancellation approve/reject actions to submit to backend review endpoints and refresh the detail state, so that decisions are reflected immediately.
33. As a staff user, I want private Staff schedule pages to show event and Organization Unit details for assigned Facilities, so that operational planning has enough context.
34. As a staff user, I want assigned Facility list and edit pages to use actual Facility Management fields, so that unsupported fixture-only fields do not appear as editable truth.
35. As a Super Admin, I want the dashboard to load backend aggregate data, system status, administrator rows, Facility governance, and recent activity, so that I can monitor platform health from real data.
36. As a Super Admin, I want the users page to list, filter, create, activate, and deactivate User accounts through backend contracts, so that account management is operational.
37. As a Super Admin, I want user rows to show only supported identity and academic profile facts, so that unsupported last-activity or review flags are not invented.
38. As a Super Admin, I want Facility governance to show assignment coverage, issue flags, active state, and staff counts, so that governance risks are visible.
39. As a Super Admin, I want report aggregates, audit logs, and review moderation rows to load from backend data, so that reporting and moderation are grounded in current state.
40. As a Super Admin, I want system status and Booking Settings to load and save through backend contracts, so that operational settings are manageable from the UI.
41. As any authenticated user, I want notifications to show unread/read state and route to relevant role pages, so that workflow updates are actionable.
42. As a frontend maintainer, I want integration issues to include contract mapping tables, so that future implementation agents know which backend fields map to which UI fields and which fixture fields are omitted.
43. As a frontend maintainer, I want mocked API integration tests, so that frontend slices are fast and deterministic.
44. As a backend maintainer, I want contract fixes tested through public API or service behavior, so that privacy and route target regressions are caught.
45. As a reviewer, I want final integration hardening, so that type checks, behavior tests, screenshots, backend contract tests, and seed-backed smoke are complete before the integration track is considered done.

## Implementation Decisions

- Use the existing frontend implementation workflow for all frontend slices.
- Implement a thin shared API/domain layer first and expand it incrementally as slices require new endpoints.
- Store bearer tokens in memory and mirror them to session storage for MVP session restore.
- Validate restored sessions with the current-user endpoint on startup.
- Clear session on invalid token, inactive account, failed current-user lookup, or unauthorized API responses that invalidate the active session.
- Redirect unauthenticated users to login with a safe internal redirect parameter.
- Redirect authenticated wrong-role users to their own role landing page.
- Keep broad unauthorized visual states available for in-page access-denied API errors.
- Integrate student registration as a separate public flow that does not auto-login after success.
- Add a contract audit and fixture normalization slice before page API wiring.
- Normalize fixture/page assumptions that contradict backend or domain contracts before replacing fixtures with live data.
- Add backend gap entries only for real missing backend capabilities, not for fixture-only decorative fields.
- Keep prerequisite backend contract fixes in this PRD as backend-owned TDD slices.
- Correct the Public Facility Calendar contract so student-facing calendars reveal blocked time ranges but not other users' event titles, Organization Units, student data, Reservation IDs, workflow state, document state, payment state, or private details.
- Use a privacy-safe Public Facility Calendar for student Facility detail and Reservation time selection pages.
- Use private Staff schedule endpoints for Staff operational calendars, where event and Organization Unit details are appropriate for assigned Facilities.
- Preserve current page layouts and visual hierarchy while progressively replacing fixtures.
- Avoid broad component rewrites before integration.
- Extract shared frontend modules only when multiple integrated pages need the same behavior.
- Require each integration issue to include a contract mapping table listing backend fields, frontend view model fields, mapping rules, and omitted or deferred fixture fields.
- Use TypeScript response types for straightforward endpoints.
- Use targeted Zod only where runtime validation materially reduces risk, especially forms, auth/session restore if needed, Reservation workflow projection inputs, and notification targets.
- Add a small shared upload/download helper for multipart uploads and binary attachment downloads.
- Keep page-specific file validation rules near the page or workflow that owns them.
- Use explicit workflow routes for student document, payment, accepted, declined, waiting, review, cancellation, and detail states.
- Centralize canonical Student Reservation route selection in a shared projection mapper.
- When a state-specific page loads a Reservation that no longer matches that state, redirect to the canonical route from the shared mapper.
- Keep backend role language in internal route/code concepts and preserve Indonesian labels in user-facing copy.
- Defer or disable visible actions whose backend capability is intentionally out of scope, such as unsupported imports, exports, Facility creation, or unsupported detail routes.
- Treat notifications as a late shared-shell integration after role pages exist.
- Correct notification target routes if backend targets point to non-existent frontend routes.
- Add a final integration hardening and contract smoke slice.

## Testing Decisions

- Follow TDD for frontend integration behavior with Vitest and React Testing Library.
- Mock API responses at the frontend API boundary by default.
- Do not require a live backend or seeded database for default frontend tests.
- Establish shared frontend test helpers for providers, routing, query client setup, fetch mocks, session storage, and route guard assertions.
- Test observable UI behavior: loading states, error states, successful data rendering, form submission, redirects, disabled actions, file validation, canonical Reservation routing, role guards, and session cleanup.
- Keep Playwright screenshot coverage green for desktop and mobile viewports after each meaningful visible change.
- Update screenshots only when a slice intentionally normalizes visible copy or state from a corrected contract.
- Backend contract fixes must use backend TDD through public service or API behavior, not private implementation details.
- Public Facility Calendar privacy tests must prove that student-facing responses do not expose private Reservation details.
- Reservation workflow mapper tests must cover document upload needed, document waiting, document declined, payment upload needed, payment waiting, payment declined, approved, completed without review, completed with review, cancelled, expired, rejected unknown source, and cancellation requested states.
- Upload tests must cover accepted file types, unsupported file types, oversize files, pending state, success routing, and backend error mapping.
- Staff operation tests must cover assigned-facility scoping, unassigned denial, approve/reject mutation behavior, and detail refetch behavior through mocked frontend responses and backend contract tests where routes change.
- Super Admin tests must cover supported filters, actions, disabled/deferred actions, settings validation, review moderation actions, and error recovery.
- Notification tests must cover unread/read state, mark-read mutation, empty state, role-aware target routing, and unsupported target fallback.
- Final hardening must run frontend typecheck, frontend behavior tests, Playwright screenshots, relevant backend tests for contract-fix slices, and manual seed-backed smoke for student, staff, and Super Admin login flows.

## Out of Scope

- Rebuilding the frontend design system or rewriting all page components before integration.
- Generating a full API client from backend schemas.
- Runtime-validating every API response with Zod.
- Making default frontend tests depend on a live backend server.
- Adding a migration framework.
- Adding frontend support for backend capabilities that remain intentionally out of scope.
- Adding Facility creation or import flows unless separately scoped.
- Adding report export unless separately scoped.
- Adding Super Admin Reservation detail pages unless separately scoped.
- Adding last-active user tracking unless separately scoped.
- Adding Staff Facility amenities as managed backend fields unless separately scoped.
- Changing MVP role names or frontend route language away from `student`, `staff`, and `super_admin` internally.
- Reopening the approved visual direction except where integration requires contract-correct visible states.

## Further Notes

Recommended implementation slices:

1. API/session foundation.
2. Student registration.
3. Contract audit and fixture/page normalization.
4. Student home discovery.
5. Student catalog.
6. Public Facility Calendar privacy backend contract correction.
7. Facility detail integration.
8. Reservation time selection.
9. Reservation detail submission.
10. Student Reservation projection router and list.
11. Approval letter and document verification states.
12. Payment states.
13. Reservation detail, cancellation, review, and profile.
14. Staff Reservation queue and list.
15. Staff Reservation detail and decisions.
16. Staff Facility list and schedule.
17. Staff Facility edit.
18. Super Admin dashboard.
19. Super Admin users.
20. Super Admin Facility governance.
21. Super Admin reports.
22. Super Admin system and Booking Settings.
23. Notification surface integration.
24. Integration hardening and contract smoke.

The numbering above should be converted into independently grabbable issues. Some slice numbers differ from the grilling shorthand because prerequisite and split slices are expanded here for issue decomposition clarity.

The PRD is ready to break down with `to-issues`.
