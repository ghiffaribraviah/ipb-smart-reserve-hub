# Railway backend deployment

This backend is deployed as a FastAPI service on Railway. Because this repository is an isolated monorepo, deploy the backend as its own Railway service.

## Runtime

- Root Directory: `/backend`
- Config file path: `/backend/railway.toml`
- Railpack config path: `/backend/railpack.json`
- Start command: `uvicorn app.main:create_app --factory --host 0.0.0.0 --port $PORT`
- Health check: `GET /health`
- Environment: `IPB_ENVIRONMENT=production`
- Approval-letter PDF generation uses `tectonic` when available on `PATH` with a writable TeX cache such as `/tmp/tectonic-cache`. The committed `backend/railpack.json` installs `tectonic` into the runtime image so Railway can render the official LaTeX template in production.
- If `tectonic` is still unavailable at runtime, the backend falls back to a built-in PDF generator so reservation submission still works, but TeX rendering remains the preferred deployment path.

## Required Variables

- `IPB_DATABASE_URL`: PostgreSQL connection URL.
- `IPB_SECRET_KEY`: token signing secret.

## Storage And Operations

- PostgreSQL is required for persistent runtime data.
- public facility images should use durable object storage or stable CDN URLs.
- private reservation files should use protected storage before production launch.
- A worker/scheduler process is needed for deadline and overdue reservation processing.
