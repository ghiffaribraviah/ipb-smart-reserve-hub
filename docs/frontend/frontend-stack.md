# Frontend Stack

## Core Stack

- Framework: React.
- Build tool: Vite.
- Language: TypeScript.
- Styling: Tailwind CSS with project design tokens from `docs/frontend/DESIGN.md`.
- Icons: `lucide-react`.

## Routing

- Router: React Router.
- Route docs use `:paramName` syntax for dynamic segments, even if implementation syntax differs.
- Auth redirects preserve safe internal `redirect` query params.
- External redirects are not allowed.

## Styling & Design System

- HTML references in `docs/frontend/html-reference/` and target screenshots in `docs/frontend/screenshots/` are the mandatory visual source of truth for page layout, component composition, spacing, hierarchy, typography direction, and visual tone.
- `docs/frontend/DESIGN.md` documents the reference-derived design system. If it disagrees with the HTML references or target screenshots, update `DESIGN.md`; do not reinterpret the reference through the old generic design system.
- Page briefs in `docs/frontend/per-page-brief/` and component briefs in `docs/frontend/per-component-brief/` are required implementation inputs.
- Page briefs own page-specific backend integration details and backend gap entries. `docs/frontend/backend-gaps.md` only indexes those page-owned gaps.
- Preserve the Inter + Playfair Display direction from the references unless a later approved design decision changes it.
- Use deterministic local fixture images/assets for design screenshot tests. Do not depend on remote placeholder or Unsplash URLs in screenshot baselines.
- Generate canonical reference screenshots with `npm run capture:html-reference` from `frontend/`.
- Track missing page, state, and component references in `docs/frontend/missing-design.md`.

## Data Fetching

- Server state: TanStack Query.
- API base URL: `VITE_API_BASE_URL`, defaulting to `http://localhost:8000`.
- Design implementation uses deterministic fixtures/mocks.
- Integration implementation replaces fixtures with API calls through TDD.

## Forms & Validation

- Form library: React Hook Form.
- Validation: Zod.
- Frontend validation provides fast required/format feedback.
- Backend remains source of truth for domain rules, including NIM parsing, reservation availability, booking windows, lifecycle permissions, and review eligibility.

## Testing

- Design phase: Playwright screenshot tests for every page.
- Default screenshot viewports:
  - Desktop: `1440 x 900`.
  - Mobile: `390 x 844`.
- Integration phase: Vitest and React Testing Library for routing, API loading/submission, auth guards, validation, and backend error mapping.
- Preserve screenshot coverage after integration wiring.

## Auth Session

- Store the bearer token in memory and mirror it to `sessionStorage`.
- Do not use `localStorage` for MVP.
- On startup, restore token from `sessionStorage` and validate it with `GET /auth/me`.
- Clear the token on logout, `401`, or failed `GET /auth/me`.
- Use reactive session handling for MVP; do not implement proactive refresh timers.

## Open Decisions

- None.
