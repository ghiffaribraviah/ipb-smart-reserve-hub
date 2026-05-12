---
name: frontend-implementation
description: Build or modify frontend screens from the repo's React/Vite/Tailwind plan, mandatory page/component briefs, HTML references, screenshots, and backend integration contracts.
---

# Frontend Implementation Skill

Use this skill when building or modifying frontend screens, translating design references into React/Vite/Tailwind UI, creating page/component briefs, or integrating frontend flows with backend APIs.

## Source Of Truth

1. `docs/frontend/html-reference/*.html` and `docs/frontend/screenshots/*.png` are the mandatory source of truth for design implementation.
2. `docs/frontend/DESIGN.md` is the global reference-derived design contract.
3. `docs/frontend/per-page-brief/*.md` owns page-level route, UX, design, fixture, integration, accessibility, and backend-gap details.
4. `docs/frontend/per-component-brief/*.md` owns reusable component contracts.
5. `docs/frontend/backend-gaps.md` is only an index/ledger that links to page-owned backend gap entries.
6. `docs/frontend/missing-design.md` tracks missing page, state, and component references by severity.

If these disagree, prefer HTML references and screenshots for visual design. Update `DESIGN.md`, page briefs, component briefs, `backend-gaps.md`, or `missing-design.md` so the docs converge.

## Required First Reads

Before implementation, read:

- `docs/frontend/frontend-stack.md`
- `docs/frontend/DESIGN.md`
- the relevant page brief(s)
- the relevant component brief(s)
- the relevant HTML reference(s)
- the relevant desktop and mobile screenshots
- `docs/frontend/backend-gaps.md`
- `docs/frontend/missing-design.md`

If a required page or component brief is missing, create it from the templates in this skill before writing frontend code.

## Workflow

### 1. Classify The Slice

- New page, new component, or meaningful visual/layout change: use design-first implementation.
- Existing page backend wiring or a small visible field/state addition: use integration TDD first, then preserve or update screenshot coverage if visible output changes.
- Backend/API contract changes: use the repo backend TDD workflow and update the affected page brief backend-gap entries plus `backend-gaps.md`.

### 2. Design-First Implementation

For new visual work:

1. Read or create the page/component briefs.
2. Confirm the HTML reference and canonical screenshots exist.
3. Implement against deterministic fixtures only.
4. Add Playwright screenshot coverage for desktop `1440 x 900` and mobile `390 x 844`.
5. Compare implemented React routes against the canonical screenshots.
6. Check for mobile horizontal overflow and incoherent text overlap.

Do not wire backend APIs during the design phase unless the slice is explicitly an integration slice.

### 3. Backend Integration

For API wiring:

1. Use TDD for integration behavior with Vitest/React Testing Library and the backend API client layer.
2. Preserve the implemented design unless backend behavior requires a missing visible state.
3. Update the page brief `Backend Integration And Gaps` section.
4. Update `docs/frontend/backend-gaps.md` links/statuses.
5. Keep screenshot coverage green after data wiring when the visible state changes.

### 4. Reference Maintenance

- If an HTML reference changes, regenerate canonical screenshots with the project capture command once a frontend workspace exists.
- If a needed page/state/component reference is missing, add it to `docs/frontend/missing-design.md`.
- Do not quietly invent major missing page designs. Use existing references only for non-blocking extrapolation and record the assumption.

## Naming Conventions

- Use `student-*`, `staff-*`, and `super-*` for internal brief filenames.
- Preserve reference ordering in brief filenames, for example `student-07-payment-waiting.md`.
- The `Admin - ...` HTML references map to internal `staff-*` docs and routes because backend roles use `staff`.
- Preserve Indonesian user-facing labels exactly where references define them.
- Use English for technical documentation.

## Backend Gap Statuses

Page briefs own backend gap entries. Allowed statuses:

- `open`: backend support is missing.
- `resolved`: verified in current routes/schemas/docs or code.
- `needs-verification`: likely implemented, but the exact behavior/shape was not verified.
- `deferred`: intentionally outside the current frontend scope.

Use stable IDs such as `BG-STUDENT-00-01` plus readable headings.

## Templates

Use the local templates:

- `page-brief-template.md`
- `component-brief-template.md`
- `backend-gap-entry-template.md`
- `missing-design-entry-template.md`
