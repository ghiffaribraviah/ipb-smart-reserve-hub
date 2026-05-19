# Frontend README

This directory contains the Vite React frontend for IPB Smart Reserve Hub.

## Run Locally

Start the backend and frontend together from the repository root:

```sh
make dev
```

To run the frontend separately, start the backend first from the repository root:

```sh
uv run python -m app.dev.seed
uv run uvicorn app.main:create_app --factory --reload
```

Then start the frontend:

```sh
cd frontend
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

If port `5173` is busy, Vite prints another local URL.

## Backend API URL

The frontend API base URL defaults to:

```text
http://localhost:8000
```

Override it with `VITE_API_BASE_URL`:

```sh
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

## Demo Login Accounts

Use these after running the backend seed:

| Role | Email | Password |
| --- | --- | --- |
| Student | `demo.student@apps.ipb.ac.id` | `demo12345` |
| Staff | `demo.staff@ipb.ac.id` | `demo12345` |
| Super Admin | `demo.admin@ipb.ac.id` | `demo12345` |

## Scripts

```sh
npm run dev          # Start Vite dev server.
npm run build        # Typecheck and build production assets.
npm run typecheck    # Run TypeScript project checks.
npm test             # Run Vitest. Use scoped commands for unit/RTL only.
npm run test:watch   # Run Vitest in watch mode.
npm run test:e2e     # Run Playwright with the repo config.
npm run lint         # Run ESLint.
```

Recommended integration test command:

```sh
npm test -- --run src
```

The unscoped `npm test -- --run` can collect Playwright files under `tests/e2e`, which are meant to run through Playwright, not Vitest.

## Playwright Screenshots

Run the full screenshot/e2e suite:

```sh
npx playwright test
```

Run one spec:

```sh
npx playwright test tests/e2e/student-home.spec.ts
```

Default screenshot viewports:

- Desktop: `1440 x 900`
- Mobile: `390 x 844`

## Project Structure

```text
src/api/             Shared HTTP client and API error handling.
src/auth/            Session provider, role guards, login redirects.
src/components/      Shared UI and shell components.
src/fixtures/        Deterministic data used by visual references/tests.
src/pages/           Route-level React pages.
src/reservations/    Reservation workflow mappers and shared domain helpers.
src/test/            Test helpers.
tests/e2e/           Playwright visual and route tests.
```

## Auth And Session Behavior

- Bearer tokens are held in memory and mirrored to `sessionStorage`.
- `GET /auth/me` validates restored sessions.
- `401` responses clear the active session.
- Protected routes redirect unauthenticated users to `/login?redirect=<path>`.
- Role mismatches redirect to the authenticated user's role landing page.

## Design And Implementation Docs

Frontend source-of-truth docs live under:

```text
docs/frontend/
  DESIGN.md
  frontend-stack.md
  per-page-brief/
  per-component-brief/
  backend-gaps.md
  html-reference/
  screenshots/
```

When modifying visual pages, keep screenshots and page/component briefs aligned with the implementation.
