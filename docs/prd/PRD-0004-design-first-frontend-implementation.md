---
id: PRD-0004
type: prd
title: Design-First Frontend Implementation
status: active
created: 2026-05-13
updated: 2026-05-13
issues:
  - ISSUE-0039
  - ISSUE-0040
  - ISSUE-0041
  - ISSUE-0042
  - ISSUE-0043
  - ISSUE-0044
  - ISSUE-0045
  - ISSUE-0046
  - ISSUE-0047
  - ISSUE-0048
  - ISSUE-0049
  - ISSUE-0050
  - ISSUE-0051
  - ISSUE-0052
  - ISSUE-0053
  - ISSUE-0054
  - ISSUE-0055
  - ISSUE-0056
  - ISSUE-0057
  - ISSUE-0058
  - ISSUE-0059
  - ISSUE-0060
---

# PRD: Design-First Frontend Implementation

## Problem Statement

The frontend has complete design documentation, HTML references, screenshots, page briefs, component briefs, and resolved backend contracts, but the React application itself is still effectively blank. Implementing backend wiring first would force visual decisions into integration work and make it harder to verify that the product matches the approved reference system.

The immediate need is a design-first frontend implementation track that turns the existing `docs/frontend` source of truth into working React routes and reusable components. Every implementation slice must verify that the implemented design matches the mandatory references before the slice is considered complete.

## Solution

Build the frontend in design-first tracer-bullet slices. Each issue should be small enough for one agent to implement a coherent page, shell, board, or tightly coupled pair from the existing page and component briefs using deterministic fixtures. Backend API wiring is intentionally deferred from visual slices unless a later integration slice explicitly calls for it.

The first slices establish the shared design foundation in smaller parts: verification harness, UI primitives, role shells/drawer, and shared workflow/display boards. Later slices implement product pages by dependency: auth entry, student discovery, student Reservation workflow, student self-service, staff Facility operations, staff Reservation review, and Super Admin operations.

Every slice must include reference-faithful desktop and mobile verification at `1440 x 900` and `390 x 844`, plus checks for mobile horizontal overflow and incoherent text overlap.

## User Stories

1. As a student, I want the frontend screens to match the approved facility browsing references, so that I can search, compare, and inspect reservable campus Facilities with a consistent interface.
2. As a student, I want the reservation workflow screens to follow the approved stepper, forms, upload panels, status panels, and payment states, so that each task in the reservation process is visually clear.
3. As a student, I want reservation list, detail, cancellation, review, and profile pages to share the same visual language, so that I can manage my Reservation history without learning a new interface per state.
4. As a staff user, I want Facility and Reservation operations pages to match the dense operational references, so that review queues, schedules, and Facility management screens are easy to scan.
5. As a staff user, I want review decision dialogs and panels to match the approved references, so that approve/reject actions are visually clear and consistent.
6. As a Super Admin, I want dashboard, user, Facility, report, and system pages to use the approved indigo-accent operational system, so that governance tasks feel distinct but still part of IPB SRH.
7. As an unauthenticated user, I want login and registration screens to match the approved auth references, so that entry into the product is consistent with the rest of the application.
8. As a future integration agent, I want visual slices to use deterministic fixture contracts aligned with page briefs, so that backend wiring can replace fixtures without redesigning screens.
9. As a reviewer, I want each frontend slice to include screenshot and overflow verification, so that visual regressions are caught at the slice boundary.

## Implementation Decisions

- Use the `frontend-implementation` workflow as the implementation standard.
- Treat `docs/frontend/html-reference/` and `docs/frontend/screenshots/` as mandatory visual source of truth.
- Treat `docs/frontend/DESIGN.md`, page briefs, component briefs, `backend-gaps.md`, and `missing-design.md` as required implementation inputs.
- Build visual slices with deterministic fixtures only.
- Do not wire backend APIs during visual implementation slices.
- Preserve backend role language in internal route/code/docs: `student`, `staff`, and `super_admin`.
- Preserve Indonesian user-facing copy from the design references.
- Implement shared verification, primitives, shells, and board components before product pages.
- Keep issue slices narrow enough to finish and verify independently, usually one page, one reference board, or one tightly coupled pair.
- Keep backend integration as a later track that replaces fixtures through TDD while preserving screenshot coverage.

## Testing Decisions

- Every meaningful visual slice must include Playwright screenshot coverage for desktop `1440 x 900` and mobile `390 x 844`.
- Every implemented page must be checked for mobile horizontal overflow at `390 x 844`.
- Every implemented slice must verify that visible text, controls, badges, tables, cards, dialogs, and action rows do not overlap incoherently.
- Component-board implementation slices should compare against the shared HTML reference boards.
- Product-page implementation slices should compare against the matching page screenshots.
- Fixture-only visual slices do not require backend API tests.
- Later integration slices should use Vitest and React Testing Library for observable routing, loading, submission, auth guard, validation, and backend error behavior while keeping screenshot tests green.

## Out of Scope

- Backend API changes.
- Backend gap reclassification unless implementation reveals a documented contract mismatch.
- Production API wiring during visual slices.
- Pixel-perfect typography approval while local Inter and Playfair Display font files remain unbundled.
- Inventing new major page designs outside the existing references.

## Further Notes

- Current `docs/frontend/missing-design.md` has no open missing references.
- Current `docs/frontend/backend-gaps.md` marks the relevant frontend contracts as resolved.
- The frontend app currently has minimal scaffold only, so the first issue should establish the reusable structure that later slices consume.
