# Railway backend deployment

This backend is deployed as a FastAPI service on Railway.

## Runtime

- Start command: `uvicorn app.main:create_app --factory --host 0.0.0.0 --port $PORT`
- Health check: `GET /health`
- Environment: `IPB_ENVIRONMENT=production`

## Required Variables

- `IPB_DATABASE_URL`: PostgreSQL connection URL.
- `IPB_SECRET_KEY`: token signing secret.

## Storage And Operations

- PostgreSQL is required for persistent runtime data.
- public facility images should use durable object storage or stable CDN URLs.
- private reservation files should use protected storage before production launch.
- A worker/scheduler process is needed for deadline and overdue reservation processing.
