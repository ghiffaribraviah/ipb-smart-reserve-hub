# IPB Smart Reserve Hub

IPB Smart Reserve Hub is a campus facility reservation app for three roles:

- `student`: browse facilities, reserve a time slot, upload required documents, pay when needed, receive notifications, and review completed reservations.
- `staff`: manage assigned facilities, review reservation documents/payments/cancellations, and monitor operational schedules.
- `super_admin`: manage users, facility governance, reports, booking settings, audit logs, review moderation, and system status.

## Quick Start

Run the backend and frontend in two separate terminals.

### 1. Backend

From the repository root:

```sh
uv sync --extra dev
uv run python -m app.dev.seed
uv run uvicorn app.main:create_app --factory --reload
```

The backend runs at:

```text
http://localhost:8000
```

Useful checks:

```sh
curl http://localhost:8000/health
uv run pytest
```

### 2. Frontend

From the repository root:

```sh
cd frontend
npm install
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

If that port is already in use, Vite prints the next available URL.

The frontend talks to `http://localhost:8000` by default. To point it somewhere else:

```sh
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

## Demo Login Accounts

The development seed creates these local accounts:

| Role | Email | Password |
| --- | --- | --- |
| Student | `demo.student@apps.ipb.ac.id` | `demo12345` |
| Staff | `demo.staff@ipb.ac.id` | `demo12345` |
| Super Admin | `demo.admin@ipb.ac.id` | `demo12345` |

The default local database is `ipb_smart_reserve_hub.db`. If your local database is old and the seed fails with a missing-column error, use a fresh database path:

```sh
IPB_DATABASE_URL=sqlite+pysqlite:///./ipb_smart_reserve_hub_fresh.db uv run python -m app.dev.seed
IPB_DATABASE_URL=sqlite+pysqlite:///./ipb_smart_reserve_hub_fresh.db uv run uvicorn app.main:create_app --factory --reload
```

## Repository Layout

```text
app/        FastAPI backend, domain services, repositories, schemas, seed data.
frontend/   Vite React frontend, tests, screenshots, and UI implementation.
docs/       Product, frontend, backend, issue, and deployment documentation.
tests/      Backend behavior/API tests.
```

More technical details live in:

- [Backend README](app/README.md)
- [Frontend README](frontend/README.md)
- [Backend deployment guide](docs/backend-deployment.md)

## Common Commands

Backend:

```sh
uv run pytest
uv run python -m app.dev.seed
uv run uvicorn app.main:create_app --factory --reload
```

Frontend:

```sh
cd frontend
npm run typecheck
npm test -- --run src
npx playwright test
npm run build
```
