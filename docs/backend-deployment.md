# Railway backend deployment

This backend is deployed as a FastAPI service on Railway. Because this repository is an isolated monorepo, deploy the backend as its own Railway service.

## Runtime

- Root Directory: `/backend`
- Config file path: `/backend/railway.toml`
- Start command: `uvicorn app.main:create_app --factory --host 0.0.0.0 --port $PORT`
- Health check: `GET /health`
- Environment: `IPB_ENVIRONMENT=production`
- Approval-letter PDF generation attempts `tectonic` when it is already available on `PATH` with a writable TeX cache such as `/tmp/tectonic-cache`.
- Railway production should not rely on extra system-package installation for `tectonic`; if the engine is unavailable, the backend falls back to a built-in PDF generator.
- The built-in fallback PDF generator is the supported production path for now and is kept layout-complete so reservation submission still works with a readable official-looking letter.

## Required Variables

- `IPB_DATABASE_URL`: PostgreSQL connection URL.
- `IPB_SECRET_KEY`: token signing secret.

## Storage And Operations

- PostgreSQL is required for persistent runtime data.
- public facility images should use durable object storage or stable CDN URLs.
- private reservation files should use protected storage before production launch.
- A worker/scheduler process is needed for deadline and overdue reservation processing.
