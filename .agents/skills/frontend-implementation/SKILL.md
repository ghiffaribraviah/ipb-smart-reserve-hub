---
name: frontend-implementation
description: Implements IPB Smart Reserve Hub frontend screens with React, Vite, Tailwind CSS, visual screenshot checks, and backend integration. Use when building or modifying frontend UI, translating design screenshots into components, wiring frontend flows to backend APIs, or preserving implemented design while adding behavior.
---

# Frontend Implementation

## Scope

Use this skill for frontend work in the IPB Smart Reserve Hub app. The target stack is React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Vitest, React Testing Library, and MSW, matching `docs/frontend/frontend-architecture.md`.

Frontend work has two modes:

- **Design implementation:** build screens/components from the design references and verify them visually.
- **Backend integration:** wire existing or newly built UI to backend APIs using the repo's `tdd` skill, while making minimal visual changes.

## Source Material

Before implementing UI, inspect:

- `docs/frontend/IPB RSH Design/` for screen references.
- `docs/frontend/DESIGN.md` for tokens and component guidance.
- `docs/frontend/emerald_reserve_design_system_specification.md` for design-system details.
- `docs/frontend/frontend-architecture.md` for frontend boundaries and API integration decisions.

Treat screenshots as visual direction, not mandatory pixel-perfect specs. Preserve recognizable layout, hierarchy, tone, and interaction patterns.

## Visual Language Summary

The app should feel institutional, clean, and operational. Use Satoshi-style sans typography, generous whitespace, off-white page backgrounds, white rounded panels, soft emerald-tinted shadows, and high-quality campus/facility photography where the screen calls for imagery.

Core patterns:

- Brand: large `IPB SRH` wordmark treatment in emerald/green tones.
- Navigation: white top bar, centered primary nav, left search field, right notification/profile actions.
- Color: deep emerald text/surfaces, bright emerald primary actions, soft mint success states, amber pending states, soft red rejected/error states, neutral grey borders.
- Layout: wide desktop compositions, constrained content, strong horizontal rhythm, large page padding, and 8px spacing grid.
- Cards and panels: white surfaces, 12-24px radius depending on scale, subtle borders/shadows, roomy internal padding.
- Forms: labeled fields with icons where helpful, rounded inputs, clear validation/status messaging.
- Reservation flow: visible stepper, calendar/time panels, right-side action panel on desktop, clear continue/back affordances.
- Admin screens: dense but readable tables, compact badges, icon actions, restrained dashboard cards.
- Footer: oversized `IPB SRH` brand mark with simple link column.

Avoid generic marketing layouts when implementing workflow screens. Prioritize usable reservation/admin workflows over decorative presentation.

## Design Implementation Workflow

1. Identify the closest screenshot(s) and docs for the requested screen.
2. Map repeated UI to reusable components only when it reduces duplication or matches existing project patterns.
3. Implement with Tailwind utility classes and existing component primitives when present.
4. Keep responsive behavior explicit: desktop should match the wide references; mobile should preserve hierarchy without text overlap.
5. Use lucide icons when available for search, calendar, clock, upload, filter, notification, check, reject, and navigation actions.
6. Run the app locally if needed and capture screenshots for relevant desktop and mobile viewports.
7. Compare screenshots against the reference direction and fix visible issues: spacing drift, broken alignment, overflow, unreadable contrast, missing imagery, or wrong status emphasis.

Screenshot checks should include at least one desktop viewport and one mobile viewport for user-facing screens. Use the repo's existing Playwright or screenshot tooling if present; otherwise use the available browser automation path for the current environment.

## Backend Integration Workflow

For API wiring, load and follow the `tdd` skill.

Use a vertical red-green-refactor loop:

1. Write one failing behavior test through routed UI and HTTP-level mocks.
2. Implement the smallest integration change to pass.
3. Refactor only while tests are green.

Integration rules:

- Preserve the already-implemented visual structure unless the backend behavior requires a visible state.
- Prefer adding loading, empty, error, success, and disabled states inside existing components rather than redesigning the screen.
- Keep backend concerns in typed API/client/query layers instead of scattering fetch logic through components.
- Use MSW for frontend behavior tests; avoid mocking component internals.
- Backend validation remains the source of truth for reservation rules and availability.

## Verification

Before finishing frontend work:

- Run the relevant test command from the actual frontend package scripts.
- Run lint/typecheck/build if those scripts exist.
- Start the dev server for app work and provide the local URL.
- Capture and inspect screenshots for changed pages.
- Confirm there is no text overlap, clipped controls, blank media, unreadable status badge, or accidental broad visual regression.

If the frontend project or required scripts do not exist yet, state that clearly and create the smallest stack-consistent foundation needed for the requested slice.
