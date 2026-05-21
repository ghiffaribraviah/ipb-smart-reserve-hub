# IPB Smart Reserve Hub

IPB Smart Reserve Hub is a campus facility reservation app for three roles:

- `student`: browse facilities, reserve a time slot, upload required documents, pay when needed, receive notifications, and review completed reservations.
- `staff`: manage assigned facilities, review reservation documents/payments/cancellations, and monitor operational schedules.
- `super_admin`: manage users, facility governance, reports, booking settings, audit logs, review moderation, and system status.

## Quick Start

Run the backend and frontend together from the repository root:

```sh
make dev
```

This installs/syncs missing local dependencies, seeds development data, starts the backend at `http://localhost:8000`, and starts the frontend at Vite's local URL, usually `http://localhost:5173`.

Use these environment variables when needed:

```sh
SKIP_SYNC=1 SKIP_SEED=1 make dev
VITE_API_BASE_URL=http://localhost:8000 make dev
```

To run each side manually, use separate terminals.

### 1. Backend

From the repository root:

```sh
cd backend
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
cd backend && uv run pytest
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
| Student with seeded reservations | `demo.student.06@apps.ipb.ac.id` | `demo12345` |
| Staff operations | `demo.staff.operations@ipb.ac.id` | `demo12345` |
| Staff facilities | `demo.staff.facilities@ipb.ac.id` | `demo12345` |
| Staff finance | `demo.staff.finance@ipb.ac.id` | `demo12345` |
| Super Admin | `demo.admin@ipb.ac.id` | `demo12345` |

The seed includes 35 demo reservations across pending, review, approved, cancelled, rejected, expired, and completed states, plus 10 visible facility reviews and one hidden review for moderation demos.

The default local database is `ipb_smart_reserve_hub.db`. If your local database is old and the seed fails with a missing-column error, use a fresh database path:

```sh
cd backend
IPB_DATABASE_URL=sqlite+pysqlite:///./ipb_smart_reserve_hub_fresh.db uv run python -m app.dev.seed
IPB_DATABASE_URL=sqlite+pysqlite:///./ipb_smart_reserve_hub_fresh.db uv run uvicorn app.main:create_app --factory --reload
```

## Reservation File Metadata

Student reservation responses expose generated approval letters, signed approval letters, and payment receipts with a stable metadata shape. The fields are `filename`, `content_type`, `size_bytes`, `generated_at`, and `uploaded_at`.

```json
{
  "filename": "DEV-SEED-DOCUMENT-REVIEW-signed.pdf",
  "content_type": "application/pdf",
  "size_bytes": 37,
  "generated_at": null,
  "uploaded_at": "2026-05-20T02:00:00Z"
}
```

Generated approval letters use `generated_at`; uploaded signed letters and payment receipts use `uploaded_at`.

## Repository Layout

```text
backend/    Python backend project: app package, tests, and pyproject config.
frontend/   Vite React frontend, tests, screenshots, and UI implementation.
docs/       Product, frontend, backend, issue, and deployment documentation.
scripts/    Repo-level developer entrypoints such as make/dev helpers.
```

More technical details live in:

- [Backend README](backend/README.md)
- [Backend package README](backend/app/README.md)
- [Frontend README](frontend/README.md)
- [Backend deployment guide](docs/backend-deployment.md)

## Common Commands

Full stack:

```sh
make dev
```

Backend:

```sh
make backend-test
make backend-seed
make backend-run
```

Frontend:

```sh
cd frontend
npm run typecheck
npm test -- --run src
npx playwright test
npm run build
```
