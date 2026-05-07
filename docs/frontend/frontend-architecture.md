# Frontend Architecture

This document records the frontend engineering decisions for the first IPB Smart Reserve Hub frontend milestone. Visual design direction remains in `docs/frontend/DESIGN.md`, `docs/frontend/emerald_reserve_design_system_specification.md`, and the screenshots under `docs/frontend/IPB RSH Design/`.

## Scope

The frontend will be created inside this repository under `frontend/`.

The first milestone is a real API-integrated student vertical slice:

1. Student can register or log in.
2. Student can view the facility catalog.
3. Student can open a facility detail page.
4. Student can select a reservation date and start/end time.
5. Student can validate the selected reservation time through the backend.
6. Student can enter reservation details.
7. Student can review a lightweight confirmation step.
8. Student can submit the reservation.
9. Student lands on the created reservation detail page.

Approval-letter download, signed-letter upload, payment upload, staff workflows, and admin workflows are outside the first frontend milestone.

## Stack

- Vite React with TypeScript.
- Tailwind CSS for styling.
- React Router for route guards and page navigation.
- TanStack Query for server state, caching, and mutations.
- `date-fns` and `date-fns-tz` for date/time formatting and Asia/Jakarta timezone handling.
- Vitest, React Testing Library, and MSW for frontend TDD.

The frontend will be deployable from the `frontend/` subdirectory, including Vercel deployment.

## Routing

Use role-level route shells from the start:

- `/student/*`
- `/staff/*`
- `/admin/*`

Only the student shell is implemented in the first milestone. Staff and admin shells may exist as protected placeholders so auth and access boundaries are explicit early.

The reservation flow uses separate routes per step:

- `/student/facilities/:facilityId/reserve/time`
- `/student/facilities/:facilityId/reserve/details`
- `/student/facilities/:facilityId/reserve/confirm`

Selected reservation time is passed between steps with URL search params:

- `startsAt`
- `endsAt`

The details and confirmation steps must reject missing or invalid time params and direct the student back to time selection.

## API Integration

Start with a minimal hand-written typed API client for the first slice. OpenAPI type generation is deferred until the frontend surface grows enough to justify the maintenance cost.

The API client owns:

- Base URL configuration.
- JSON request/response handling.
- Auth header attachment.
- Form-data upload support when later slices add file workflows.
- Conversion of backend errors into UI-consumable error objects.

Backend validation remains the source of truth for reservation rules, including booking window, open hours, blackouts, overlap checks, 5-minute increments, same-day restriction, minimum duration, and final availability.

## Auth

The access token is stored in `localStorage` behind an `AuthSession` abstraction.

UI code should not read or write token storage directly. This keeps token persistence replaceable if the app later moves to httpOnly cookies or a different refresh-token flow.

The first milestone includes student registration and login. Registration is part of the vertical slice because it verifies institutional email validation and required student profile fields against the real backend.

## UI System

Build a small internal component set directly with Tailwind CSS. Initial primitives should include:

- `Button`
- `Input`
- `Select`
- `Textarea`
- `Badge`
- `Card`
- `Field`
- `PageHeader`
- route shell components

The design screenshots are visual direction, not a pixel-perfect source of truth. Some screens do not have screenshots yet, so missing pages should be designed from the documented Emerald Reserve design system and the workflow requirements.

For reservation time selection, use a calendar for date selection and a form panel for start/end time inputs. The backend time-selection endpoint validates the selected window before the user advances to reservation details.

## Tests

Frontend implementation follows the repository TDD rule:

1. Write one failing behavior test.
2. Implement the smallest code to pass it.
3. Refactor while tests are green.

Use Vitest, React Testing Library, and MSW. Tests should exercise observable UI behavior through routed pages and HTTP-level API mocks rather than mocking component internals or private helper functions.

The first frontend behavior tests should focus on the public vertical slice boundaries, such as auth-to-student-shell behavior, facility catalog loading, reservation time validation, and reservation submission navigation.
