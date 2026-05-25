# Backend README

This directory contains the FastAPI backend for IPB Smart Reserve Hub.

## Run Locally

From the repository root:

```sh
make dev
```

To run only the backend from the repository root:

```sh
make backend-seed
make backend-reset-db
make backend-catalog-seed
make backend-bootstrap-seed
make backend-run
```

To work directly inside the backend project:

```sh
cd backend
uv sync --extra dev
uv run python -m app.dev.reset_db
uv run python -m app.dev.seed
uv run python -m app.dev.catalog_seed
uv run python -m app.dev.bootstrap_seed
uv run uvicorn app.main:create_app --factory --reload
```

Default backend URL:

```text
http://localhost:8000
```

Health check:

```sh
curl http://localhost:8000/health
```

## Database

By default, local development uses SQLite:

```text
sqlite+pysqlite:///./ipb_smart_reserve_hub.db
```

Override it with `IPB_DATABASE_URL`:

```sh
cd backend
IPB_DATABASE_URL=sqlite+pysqlite:///./my_local.db uv run uvicorn app.main:create_app --factory --reload
```

The app creates SQLAlchemy tables at startup for the current metadata. There is no migration runner in this repo right now, so an old local SQLite file may not match the current schema. If seed/startup fails with a missing-column error, use a fresh local database file.

If you want to wipe a dirty local database and load the canonical facility catalog from TLS/DUI, use `make backend-reset-db` first, then `make backend-catalog-seed`.

## Development Seed

Seed demo data:

```sh
cd backend
uv run python -m app.dev.seed
```

The seed is idempotent for current schema data and refuses to run when `IPB_ENVIRONMENT=production`.

Reset and load the canonical facility catalog:

```sh
cd backend
uv run python -m app.dev.reset_db
uv run python -m app.dev.catalog_seed
```

These commands are local-only and refuse to run when `IPB_ENVIRONMENT=production`.

## Akun Bootstrap

`bootstrap_seed.py` membuat 3 akun login canonical untuk smoke test setelah reset.

```sh
cd backend
uv run python -m app.dev.bootstrap_seed
```

Password bootstrap:

```text
bootstrap12345
```

| Role | Email |
| --- | --- |
| Super Admin | `bootstrap.admin@ipb.ac.id` |
| Staff | `bootstrap.staff@ipb.ac.id` |
| Student | `bootstrap.student@apps.ipb.ac.id` |

The bootstrap seed is local-only and refuses to run when `IPB_ENVIRONMENT=production`.

Demo credentials:

| Role | Email | Password |
| --- | --- | --- |
| Student | `demo.student@apps.ipb.ac.id` | `demo12345` |
| Student with seeded reservations | `demo.student.06@apps.ipb.ac.id` | `demo12345` |
| Staff operations | `demo.staff.operations@ipb.ac.id` | `demo12345` |
| Staff facilities | `demo.staff.facilities@ipb.ac.id` | `demo12345` |
| Staff finance | `demo.staff.finance@ipb.ac.id` | `demo12345` |
| Super Admin | `demo.admin@ipb.ac.id` | `demo12345` |

The seed creates 13 active facilities across 5 categories, 5 organization units, and 9 workflow reservations owned by `demo.student.06@apps.ipb.ac.id`.

## Environment Variables

| Variable | Default | Notes |
| --- | --- | --- |
| `IPB_ENVIRONMENT` | development behavior when unset | Set `production` in deployment. |
| `IPB_DATABASE_URL` | `sqlite+pysqlite:///./ipb_smart_reserve_hub.db` | Use PostgreSQL in production. |
| `IPB_SECRET_KEY` | `dev-secret-change-me` | Must be strong and private in production. |
| `IPB_ALLOWED_STUDENT_EMAIL_DOMAINS` | `apps.ipb.ac.id` | Comma-separated student email domains. |

Example production-style environment:

```env
IPB_ENVIRONMENT=production
IPB_DATABASE_URL=postgresql+psycopg://user:password@host:5432/ipb_smart_reserve_hub
IPB_SECRET_KEY=change-with-strong-random-secret
IPB_ALLOWED_STUDENT_EMAIL_DOMAINS=apps.ipb.ac.id
```

## Architecture

Request flow:

```text
Client
  -> FastAPI route in backend/app/api/routes
  -> AccessPolicyModule for role checks
  -> Service module in backend/app/services
  -> Repository in backend/app/repositories
  -> SQLAlchemy model in backend/app/models
  -> Database
```

Main directories:

```text
api/routes/        FastAPI route registration by feature area.
core/              Settings, database setup, security, access policy, factories.
dev/               Local seed, reset, and catalog load commands.
models/            SQLAlchemy ORM models and domain enums.
repositories/      Persistence/query boundaries.
schemas/           Pydantic request and response schemas.
services/          Business workflow logic.
storage/           Private file storage abstraction.
workers/           Background/deadline processing modules.
```

Keep business rules in services. ORM classes should stay focused on database mapping.

## Folder Structure And Ownership

The backend is organised by responsibility: HTTP routes translate requests, services own business behaviour, repositories isolate persistence, schemas define API contracts, and models map database tables.

Keep new backend code on the layer that owns the decision:

- Routes should parse HTTP inputs, call access policy dependencies, and delegate to services.
- Services should hold domain rules, workflow decisions, status transitions, and orchestration.
- Repositories should hold SQLAlchemy queries and persistence details.
- Schemas should hold request/response shape only.
- Models should stay focused on ORM mapping and enums.

Top-level structure:

```text
backend/app/
  api/              FastAPI route registration and shared response helpers.
  core/             Configuration, database session setup, security, access policy, dependency factories.
  dev/              Local seed tooling for development/demo data and bootstrap accounts.
  models/           SQLAlchemy ORM models and domain enums.
  notifications/    Notification package namespace.
  pdf/              PDF generation package namespace.
  repositories/     Database readers/writers and query boundaries.
  schemas/          Pydantic API request and response contracts.
  services/         Business workflow modules and domain orchestration.
  storage/          File storage abstraction.
  workers/          Background/deadline worker namespace.
  main.py           FastAPI application factory entrypoint.
```

### `api/`

```text
api/
  http_application.py  Builds the FastAPI app and registers routes.
  responses.py         Shared response helpers.
  routes/              Feature route modules.
```

Route files are grouped by user-facing feature area:

```text
routes/
  account_routes.py                       Auth, session, and account profile endpoints.
  facility_routes.py                      Public facility discovery, details, calendar, and reservation creation.
  reservation_routes.py                   Student reservation list/detail/workflow endpoints.
  staff_reservation_operation_routes.py   Staff queues, reservation decisions, and assigned facility operations.
  facility_management_routes.py           Super Admin facility governance and staff assignment.
  super_admin_dashboard_routes.py         Super Admin dashboard aggregates.
  super_admin_report_routes.py            Super Admin report aggregates.
  audit_log_routes.py                     Super Admin audit log listing.
  review_routes.py                        Public reviews and Super Admin review moderation.
  notification_routes.py                  Notification listing and read state.
  booking_setting_routes.py               Super Admin booking/deadline settings.
  system_status_routes.py                 Super Admin system health.
  organization_unit_routes.py             Organization unit lookup.
  payment_routes.py                       Payment upload/review workflow.
  approval_letter_routes.py               Approval letter generation/download workflow.
```

### `core/`

```text
core/
  access_policy.py          Role and permission checks.
  database.py               Engine/session setup and metadata creation.
  module_factories.py       Dependency factory wiring for routes.
  security.py               Password hashing and token helpers.
  settings.py               Environment-backed settings.
  student_email_policy.py   Student email domain validation.
```

Use `module_factories.py` when a route needs a service/repository dependency. Avoid manually constructing service graphs inside route handlers.

### `models/`

```text
models/
  __init__.py  SQLAlchemy models and domain enums.
```

The current backend keeps ORM classes in a single model module. If this grows, split by aggregate only when it reduces real navigation or merge conflict pain.

### `repositories/`

Repositories are persistence boundaries. They should return domain data needed by services without leaking HTTP details.

```text
repositories/
  user_repository.py
  facility_catalog_reader.py
  facility_availability_reader.py
  facility_management_repository.py
  reservation_repository.py
  staff_reservation_operations_repository.py
  review_repository.py
  audit_log_repository.py
  notification_repository.py
  booking_settings_repository.py
  organization_unit_repository.py
```

Prefer adding query methods here instead of embedding SQLAlchemy queries in services or routes.

### `services/`

Services own observable backend behaviour and should be the main place for business rules.

```text
services/
  accounts.py
  academic_profiles.py
  facilities.py
  facility_availability.py
  facility_management.py
  reservations.py
  reservation_lifecycle.py
  reservation_time_selection.py
  reservation_private_files.py
  student_reservation_workflow_projections.py
  staff_reservation_operations.py
  staff_reservation_review_access.py
  assigned_facility_access.py
  reviews.py
  public_facility_reviews.py
  public_facility_calendar.py
  payments.py
  approval_letters.py
  notifications.py
  audit_logs.py
  booking_settings.py
  super_admin_dashboard.py
  super_admin_reports.py
  system_status.py
  organization_units.py
  deadline_worker.py
```

When adding a feature, start with the smallest service method that exposes the behaviour through an existing public route or a new route contract.

### `schemas/`

Schemas define stable API contracts for the frontend and tests.

```text
schemas/
  account_schemas.py
  facility_schemas.py
  facility_management_schemas.py
  reservation_schemas.py
  reservation_time_selection_schemas.py
  review_schemas.py
  audit_log_schemas.py
  notification_schemas.py
  booking_setting_schemas.py
  organization_unit_schemas.py
  super_admin_dashboard_schemas.py
  super_admin_report_schemas.py
  system_status_schemas.py
```

Use schemas for request/response shape. Keep database models and internal service objects out of frontend-facing contracts.

## Adding A Backend Feature

1. Add or update a behavior test through the public HTTP/service interface.
2. Add or update the response/request schema in `schemas/`.
3. Add repository query/write methods if persistence is needed.
4. Add service logic for the domain behaviour.
5. Register or update the route in `api/routes/`.
6. Wire dependencies in `core/module_factories.py` when a new service graph is needed.
7. Update frontend backend-gap/page brief docs if the frontend-facing contract changed.

## Tests

Run all backend tests from the repository root:

```sh
cd backend && uv run pytest
```

Run one test file:

```sh
cd backend && uv run pytest tests/test_notifications.py
```

Tests are behavior/API oriented. Prefer testing through public service or HTTP interfaces rather than private implementation details.

## Auth

Authenticated endpoints use:

```http
Authorization: Bearer <access_token>
```

Roles:

- `student`
- `staff`
- `super_admin`

## API Overview

Common endpoints:

| Method | Endpoint | Role |
| --- | --- | --- |
| `GET` | `/health` | Public |
| `POST` | `/auth/register` | Public |
| `POST` | `/auth/login` | Public |
| `POST` | `/auth/refresh` | Authenticated |
| `GET` | `/auth/me` | Authenticated |
| `GET` | `/facility-categories` | Public |
| `GET` | `/facilities` | Public |
| `GET` | `/facilities/{facility_id}` | Public |
| `GET` | `/facilities/{facility_id}/calendar` | Public |
| `POST` | `/facilities/{facility_id}/reservation-time-selection` | Public |
| `POST` | `/facilities/{facility_id}/reservations` | Student |
| `GET` | `/student/reservations` | Student |
| `GET` | `/student/reservations/{reservation_id}` | Student |
| `GET` | `/notifications` | Student/Staff/Super Admin |
| `POST` | `/notifications/{notification_id}/read` | Student/Staff/Super Admin |
| `GET` | `/staff/reservations/verification-queue` | Staff |
| `GET` | `/staff/reservations` | Staff |
| `GET` | `/staff/reservations/{reservation_id}` | Staff |
| `GET` | `/staff/facilities` | Staff |
| `PATCH` | `/staff/facilities/{facility_id}` | Staff assigned |
| `GET` | `/admin/dashboard` | Super Admin |
| `GET` | `/admin/users` | Super Admin |
| `POST` | `/admin/users` | Super Admin |
| `GET` | `/admin/facilities/governance` | Super Admin |
| `GET` | `/admin/reports/aggregate` | Super Admin |
| `GET` | `/admin/settings` | Super Admin |
| `PATCH` | `/admin/settings` | Super Admin |
| `GET` | `/admin/system-status` | Super Admin |

Staff facility profiles include the assigned facility category ID/label, `open_hours_summary`, and structured `open_hours` rows. Staff facility updates can change editable profile fields, category, active state, payment instructions, and replace structured open-hour rows; invalid open-hour ranges and inactive/missing categories are rejected while assigned-facility access control is preserved.

For more detail, inspect route files in `backend/app/api/routes/` and schemas in `backend/app/schemas/`.

## Deployment

See [Backend Deployment](../../docs/backend-deployment.md).
