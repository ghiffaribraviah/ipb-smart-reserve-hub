# Backend README

This directory contains the FastAPI backend for IPB Smart Reserve Hub.

## Run Locally

From the repository root:

```sh
make dev
```

To run only the backend from the repository root:

```sh
uv sync --extra dev
uv run python -m app.dev.seed
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
IPB_DATABASE_URL=sqlite+pysqlite:///./my_local.db uv run uvicorn app.main:create_app --factory --reload
```

The app creates SQLAlchemy tables at startup for the current metadata. There is no migration runner in this repo right now, so an old local SQLite file may not match the current schema. If seed/startup fails with a missing-column error, use a fresh local database file.

## Development Seed

Seed demo data:

```sh
uv run python -m app.dev.seed
```

The seed is idempotent for current schema data and refuses to run when `IPB_ENVIRONMENT=production`.

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
  -> FastAPI route in app/api/routes
  -> AccessPolicyModule for role checks
  -> Service module in app/services
  -> Repository in app/repositories
  -> SQLAlchemy model in app/models
  -> Database
```

Main directories:

```text
api/routes/        FastAPI route registration by feature area.
core/              Settings, database setup, security, access policy, factories.
dev/               Local development seed command.
models/            SQLAlchemy ORM models and domain enums.
repositories/      Persistence/query boundaries.
schemas/           Pydantic request and response schemas.
services/          Business workflow logic.
storage/           Private file storage abstraction.
workers/           Background/deadline processing modules.
```

Keep business rules in services. ORM classes should stay focused on database mapping.

## Tests

Run all backend tests from the repository root:

```sh
uv run pytest
```

Run one test file:

```sh
uv run pytest tests/test_notifications.py
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

For more detail, inspect route files in `app/api/routes/` and schemas in `app/schemas/`.

## Deployment

See [Backend Deployment](../docs/backend-deployment.md).
