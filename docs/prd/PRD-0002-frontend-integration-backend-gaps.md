---
id: PRD-0002
type: prd
title: "Frontend integration backend gaps"
status: active
created: 2026-05-10
updated: 2026-05-10
issues: 
  - ISSUE-0023
  - ISSUE-0024
  - ISSUE-0025
  - ISSUE-0026
  - ISSUE-0027
  - ISSUE-0028
  - ISSUE-0029
  - ISSUE-0030
github_number: 36
github_state: open
github_url: https://github.com/KOM60-ADSP2K1/ipb-smart-reserve-hub/issues/36
github_author: ghiffaribraviah
github_labels: 
  - enhancement
  - ready-for-human
---

# PRD: Frontend integration backend gaps

## GitHub Migration

- Original issue: #36 - https://github.com/KOM60-ADSP2K1/ipb-smart-reserve-hub/issues/36
- Original state: open
- Original author: ghiffaribraviah
- Original created: 2026-05-10T20:25:53Z
- Original updated: 2026-05-10T20:32:21Z
- Original labels: enhancement, ready-for-human

## Original PRD Body

## Problem Statement

The planned student frontend can be designed with fixtures, but real API integration cannot satisfy the MVP user flows yet. Students need to discover facilities through searchable, filterable, paginated catalog data; start from category shortcuts and featured facility cards; submit complete reservation details; understand document and payment workflow states; reopen submitted private files; and view profile information derived from their institutional identity.

The backend already has the core Facility Catalog, Reservation, Approval Letter, Payment, User Account, and HTTP Application workflows, but several public and student-facing contracts are too narrow for frontend integration. Current facility listing returns an unpaginated active facility array. Facility Categories do not expose stable public slugs. Student Reservation responses expose the main lifecycle status but not enough document, payment, file, and rejection context for status routing. Student profile identity omits NIM, phone, and academic profile fields already needed by the student profile page.

## Solution

Expand the backend contracts needed by the student frontend while preserving the existing domain model boundaries. The Facility Catalog should provide public category metadata, paginated and filterable facility collections, and featured facility ranking. Reservation submission should accept structured extra requirements. Student Reservation responses should include explicit document, payment, and rejection projections without adding lifecycle status sprawl. Student-owned download endpoints should let students reopen their uploaded signed approval letter and payment receipt. User Account identity should return student profile fields and best-effort academic profile derivation from NIM.

These changes intentionally update API contracts for the upcoming frontend integration. No legacy compatibility shim is required because the frontend has not shipped against the current backend contract. Implementation should follow the repository TDD workflow: one vertical behavior test, smallest implementation, then refactor while green.

## User Stories

1. As a student, I want to see facility category shortcuts on the student home page, so that I can start browsing by facility type.
2. As a student, I want category shortcuts to use stable public slugs, so that catalog URLs remain shareable and predictable.
3. As a student, I want category shortcuts to show active configured categories, so that the home page reflects the campus browsing taxonomy.
4. As a student, I want category facility counts to reflect active browsable facilities, so that I understand how many results a shortcut can produce.
5. As a student, I want empty active categories to remain visible, so that configured facility types do not disappear unpredictably.
6. As a student, I want inactive categories hidden from public browsing, so that obsolete taxonomy does not appear in the student experience.
7. As a student, I want to see featured facilities on the home page, so that I can quickly explore useful campus spaces.
8. As a student, I want featured facilities to prefer facilities with cover images, reviews, and ratings, so that the home page highlights richer public records.
9. As a student, I want featured facility ordering to be deterministic, so that the page does not reshuffle unexpectedly.
10. As a student, I want to search facilities by keyword, so that I can find a facility by name or location.
11. As a student, I want to filter facilities by category slug, so that category shortcut URLs load matching catalog results.
12. As a student, I want to filter facilities by minimum capacity, so that I can find spaces large enough for my event.
13. As a student, I want paginated facility results, so that large catalogs remain fast and navigable.
14. As a student, I want facility result counts and page metadata, so that the catalog can show result totals and pagination controls.
15. As a student, I want explicit facility sort options, so that I can compare facilities by name, capacity, rating, or price.
16. As a student, I want invalid sort values to be rejected clearly, so that frontend bugs surface as contract errors instead of silent wrong ordering.
17. As a frontend integrator, I want facility collections to always use the same paginated response envelope, so that home and catalog code can share one response contract.
18. As a frontend integrator, I want a limit alias for featured facility queries, so that the home page can request a compact featured set.
19. As a public visitor or unauthenticated client, I want public facility discovery data to remain publicly readable, so that catalog browsing data is not unnecessarily hidden behind auth.
20. As a student, I want reservation submission to include extra requirements, so that AV support, logistics coordination, extra cleaning, and security personnel needs reach the backend.
21. As a staff user in future workflows, I want extra requirements stored as explicit reservation fields, so that operational queues and reports can later filter by those needs.
22. As a student, I want optional extra requirement notes, so that I can explain details not captured by checkboxes.
23. As a student, I want submitted extra requirements returned in reservation responses, so that confirmation and detail pages reflect what I requested.
24. As a student, I want the reservation list to distinguish document upload needed, document waiting review, document approved, and document rejected states, so that routing from reservation cards is accurate.
25. As a student, I want the reservation list to distinguish payment upload needed, payment waiting review, payment approved, and payment rejected states, so that routing to payment pages is accurate.
26. As a student, I want payment waiting state to be visible after I upload a receipt, so that I know staff verification is pending.
27. As a student, I want payment declined state to include the rejection reason, so that I understand why the reservation is terminal.
28. As a student, I want document declined state to include the rejection reason, so that I understand why the reservation is terminal.
29. As a student, I want rejected reservations to expose whether the rejection came from document review or payment review, so that the frontend can route to the correct declined page.
30. As a student, I want old rejected reservations without a known source to be represented safely, so that the UI can handle unknown historical data.
31. As a student, I want signed approval letter metadata in reservation details, so that the document hub can show the file I uploaded.
32. As a student, I want payment receipt metadata in reservation details for paid reservations, so that the document hub can show the receipt I uploaded.
33. As a student, I want generated approval letter metadata in reservation details when available, so that the document hub can show the official generated document.
34. As a student, I want document and payment metadata hidden when unavailable, so that the UI does not show fake filenames or dates.
35. As a student, I want to download my generated approval letter, so that I can reopen the official template.
36. As a student, I want to download my uploaded signed approval letter, so that I can verify what I submitted.
37. As a student, I want to download my uploaded payment receipt, so that I can verify what I submitted.
38. As a student, I want private reservation files protected by ownership checks, so that other students cannot access my documents or receipts.
39. As a staff user, I want existing staff download and review workflows to keep working, so that document and payment verification remains uninterrupted.
40. As a student, I want my profile page to show NIM and phone, so that my account identity matches registration data.
41. As a student, I want my profile page to show program study, faculty, entry year, and degree when they can be derived from NIM, so that my academic identity is visible without manual editing.
42. As a student, I want unknown NIM formats to show missing academic fields instead of blocking login, so that incomplete derivation does not prevent app access.
43. As a frontend integrator, I want User Account identity to be the source of truth for profile data, so that the frontend does not derive academic fields itself.
44. As a backend maintainer, I want NIM derivation isolated behind a small service interface, so that academic code mapping can evolve without changing HTTP routes.
45. As a backend maintainer, I want document, payment, and rejection projections isolated from lifecycle transitions, so that the ReservationStatus enum does not grow into UI substate names.
46. As a backend maintainer, I want category slug generation and lookup owned by the Facility Catalog boundary, so that public browsing does not depend on display names.
47. As a backend maintainer, I want schema additions and seed/backfill behavior explicit, so that existing development data remains usable.
48. As a backend maintainer, I want changed API contracts documented, so that future frontend sessions do not rediscover stale backend assumptions.
49. As a backend maintainer, I want behavior tests for each public and student-facing contract, so that integration regressions are caught through service/API behavior.
50. As a product owner, I want token expiry metadata deferred, so that MVP work focuses on blocking frontend integration gaps.
51. As a product owner, I want no new migration framework introduced in this scope, so that backend integration work does not expand into deployment architecture.

## Implementation Decisions

- Modify the Facility Catalog Module and Facility Catalog Reader to support public facility filtering, sorting, pagination, featured ranking, and category metadata.
- Add a public Facility Category contract that returns active categories with `id`, `name`, stored `slug`, optional `icon_hint`, and `facility_count` based only on active facilities.
- Store `slug` on Facility Category as a unique, non-null backend-owned public identifier. Existing seed/test categories must receive deterministic slugs.
- Store `icon_hint` on Facility Category as nullable or default-derived from slug. The frontend may map known hints to icons and fall back when unknown.
- Keep public discovery endpoints public: facility collection, facility detail, facility calendar, facility availability, reservation time selection, and facility categories.
- Change the facility collection response from a bare array to a paginated envelope containing `items`, `page`, `page_size`, `total_items`, and `total_pages`.
- Support facility query params: `q`, `category`, `min_capacity`, `sort`, `featured`, `page`, `page_size`, and `limit` as an alias for featured page size.
- `q` performs case-insensitive contains matching across facility name and location.
- `category` filters by Facility Category slug, not display name or database ID.
- `min_capacity` filters facilities with capacity greater than or equal to the requested value.
- `sort` supports only `name_asc`, `capacity_desc`, `rating_desc`, `price_asc`, and `price_desc`; unknown values should produce a validation error.
- `featured=true` ranks active facilities by cover image availability, review count, rating average, then name ascending. No manual curation field is added for MVP.
- Facility collection default page is 1, default page size is 12, and max page size is 50.
- Modify Reservation submission to accept an `extra_requirements` object with `av_support`, `logistics_coordination`, `extra_cleaning`, `security_personnel`, and optional `notes`.
- Persist extra requirements as explicit Reservation columns for the four booleans plus notes, while exposing them as a nested API object.
- Keep existing ReservationStatus values. Do not add statuses for payment waiting review, payment declined, document declined, or UI substates.
- Add nested Student Reservation projections for document state, payment state, and rejection context.
- Document projection should include generated approval letter metadata when present, signed approval letter metadata when present, review status, and document rejection reason when relevant.
- Payment projection should include whether payment is required, payment receipt metadata when present, review status, and payment rejection reason when relevant.
- Review status values should be explicit frontend-facing strings such as upload needed, waiting review, approved, rejected, and not applicable.
- Add a nullable Reservation rejection source enum with values `document` and `payment`. Existing or legacy rejected rows without a source should be exposed as `unknown`.
- Keep existing `rejection_reason` for terminal document/payment rejection reasons.
- Keep cancellation rejection separate as cancellation rejection reason because rejecting a cancellation request does not make the Reservation rejected.
- Add student-owned download endpoints for uploaded signed approval letters and payment receipts. They must use the same owner checks as student reservation endpoints.
- Existing staff-owned private file download endpoints remain in place.
- Modify User Account identity to carry student NIM and phone when the user is a student.
- Add a deep Academic Profile Deriver module that maps known NIM prefixes and year information into program study, faculty, entry year, and degree.
- Academic profile derivation is best-effort. Unknown or unparsable NIM values return null academic fields instead of rejecting registration, login, or current-user lookup.
- Keep registration validation light for NIM and phone in this scope. Do not make academic derivation a registration gate.
- Keep token responses unchanged for MVP. Do not add proactive expiry metadata in this PRD.
- Accept intentional API contract changes without a legacy compatibility layer.
- Include schema and backfill acceptance criteria in implementation issues, but do not introduce Alembic or a migration framework as part of this scope.
- Update project documentation alongside code changes, including API tables, backend gap status, and domain language for slugs, catalog pagination, extra requirements, workflow projections, rejection source, and academic profile derivation.

## Testing Decisions

- Follow the repository TDD workflow: write one failing behavior test for the next vertical slice, implement the smallest code to pass it, then refactor while tests remain green.
- Tests should verify observable behavior through public service and HTTP API interfaces, not private implementation details.
- Facility Catalog behavior should be tested through service tests and HTTP tests similar to existing facility browsing tests.
- Facility Category behavior should be tested through public HTTP response behavior, including active-only filtering, active facility counts, empty active category visibility, and slug stability.
- Facility collection tests should cover paginated envelope shape, default pagination, page size limits, search, category slug filtering, minimum capacity filtering, supported sorts, invalid sort validation, and featured ranking.
- Reservation submission tests should cover accepting structured extra requirements and returning them through student reservation responses.
- Student Reservation response tests should cover document projection states, payment projection states, rejection source and reason projection, uploaded file metadata, missing metadata, and legacy unknown rejection source behavior.
- Payment workflow tests should extend existing payment workflow coverage to assert payment receipt metadata and payment rejection projection after upload/reject flows.
- Approval Letter workflow tests should extend existing approval letter coverage to assert generated letter metadata, signed approval letter metadata, document review projection, and student-owned signed-letter download.
- Student-owned private file download tests should verify owner access, other-student denial, content type, content disposition, and stored content retrieval.
- User Account tests should extend existing auth/current-user coverage to assert NIM, phone, and academic profile fields on `/auth/me`.
- Academic Profile Deriver should have isolated service tests for known NIM mapping, year parsing, and unknown/null fallbacks.
- Documentation updates should be included in issue acceptance criteria, but do not require automated tests unless a docs linter is introduced separately.

## Out of Scope

- Frontend implementation and frontend integration code.
- Proactive token refresh timers or token expiry metadata in auth responses.
- Auto-login after registration.
- Manual featured facility curation, display priority fields, or admin UI for featured facilities.
- Facility category management UI.
- Revision or resubmission workflows for rejected documents or rejected payment receipts.
- New ReservationStatus enum values for UI substates.
- Student profile editing.
- Strict admissions-grade NIM validation or complete IPB academic code coverage.
- Introducing Alembic or a full database migration framework.
- Changing storage architecture for private files or adding signed object-storage URLs.
- Backwards-compatible legacy response shims for existing facility array responses.

## Further Notes

The major deep modules expected from this work are the Facility Catalog query/category projection boundary, Academic Profile Deriver, and Student Reservation workflow projection builder. These should keep HTTP routes thin and preserve the repository's existing OOP-oriented architecture.

This PRD was derived from the frontend-discovered backend gaps and the follow-up grilling decisions. It should be broken into independently grabbable vertical issues with the `to-issues` skill.

## GitHub Comments

### Comment 1 - ghiffaribraviah - 2026-05-10T20:32:21Z

Original URL: https://github.com/KOM60-ADSP2K1/ipb-smart-reserve-hub/issues/36#issuecomment-4416279442

> *This was generated by AI during triage.*

## Agent Brief

**Category:** enhancement
**Summary:** Decompose the frontend integration backend gaps PRD into independently grabbable vertical implementation issues.

**Current behavior:**
The issue is a PRD-sized specification for multiple backend contract expansions needed before the planned student frontend can integrate with real APIs. It covers public facility discovery, facility categories, pagination/filtering/sorting, featured facility ranking, reservation extra requirements, student reservation document/payment/rejection projections, student-owned private file downloads, and student profile academic identity. It is too broad for one AFK implementation issue.

**Desired behavior:**
A human maintainer should split this PRD into smaller vertical implementation issues using the repository issue workflow. Each child issue should be scoped so an AFK agent can implement it with the repository TDD workflow: one behavior test, smallest implementation, then refactor while green.

**Key interfaces:**
- Public Facility Catalog API contracts for categories, paginated facility collections, query filters, sorting, and featured ranking.
- Reservation submission contract for structured extra requirements.
- Student Reservation response contracts for document, payment, file metadata, and rejection projections without adding lifecycle status sprawl.
- Student-owned private file download contracts for uploaded signed approval letters and payment receipts.
- User Account identity/current-user contract for NIM, phone, and best-effort academic profile derivation.
- Project documentation for API tables, backend gap status, and domain language.

**Acceptance criteria:**
- [ ] The PRD is broken into independently grabbable GitHub issues, each small enough for one vertical backend TDD slice.
- [ ] Each child issue has concrete behavior-oriented acceptance criteria and explicit out-of-scope boundaries.
- [ ] Each child issue preserves the PRD decisions to avoid frontend fixtures driving incompatible API assumptions.
- [ ] Child issues include documentation updates where API contracts or domain language change.
- [ ] No child issue introduces frontend implementation, token expiry metadata, auto-login after registration, manual featured curation, a migration framework, private file storage architecture changes, or legacy compatibility shims unless explicitly re-scoped by a maintainer.

**Why ready-for-human:**
This PRD is well specified, but the next step is product/engineering decomposition rather than direct implementation. A human should decide the issue boundaries and ordering before marking individual child issues ready-for-agent.

**Out of scope:**
- Implementing the backend changes directly in this PRD issue.
- Running frontend integration work.
- Re-opening decisions already listed as out of scope in the PRD.
