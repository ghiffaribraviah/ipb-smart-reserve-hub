# Backend Deployment

This guide covers backend/API demo deployment readiness. Frontend/Vercel deployment is intentionally out of scope until the frontend exists.

## Railway backend deployment

Deploy the FastAPI backend as a Railway service from this repository. The committed `railway.toml` uses Nixpacks and starts the ASGI app with:

```sh
uvicorn app.main:create_app --factory --host 0.0.0.0 --port $PORT
```

Railway should run the service with `IPB_ENVIRONMENT=production` so the app refuses unsafe development defaults.

## Required environment variables

Set these variables on the Railway backend service:

| Variable | Purpose |
| --- | --- |
| `IPB_ENVIRONMENT=production` | Enables production settings validation. |
| `IPB_DATABASE_URL` | PostgreSQL SQLAlchemy database URL for the backend. |
| `IPB_SECRET_KEY` | Strong random token signing secret. Do not use `dev-secret-change-me`. |
| `IPB_ALLOWED_STUDENT_EMAIL_DOMAINS` | Comma-separated institutional student email domains. |

Future storage-backed deployments should also define object storage variables for the S3-compatible provider, bucket names, endpoint, region, access key, and secret key. Keep public facility images and private reservation files in separate buckets or prefixes with different access policies.

## PostgreSQL and schema setup

Provision PostgreSQL through Railway or another managed PostgreSQL provider and set `IPB_DATABASE_URL` to the provided connection string.

The current backend creates the SQLAlchemy schema at application startup through the HTTP runtime registry. Until Alembic migrations are introduced, the demo deployment schema setup is:

1. Attach an empty PostgreSQL database to the Railway backend service.
2. Set `IPB_DATABASE_URL`.
3. Start the backend once and let startup create the schema.
4. Check `GET /health` to confirm database connectivity.

When Alembic is added later, replace startup schema creation with a migration command in the deployment process.

## Object storage

The MVP needs S3-compatible storage with two access patterns:

- public facility images: readable by catalog/detail clients through public URLs or a CDN.
- private reservation files: generated approval letters, signed letters, and payment receipts must remain private and be served only after backend authorization, preferably with short-lived signed URLs.

For the current demo, the backend still uses in-memory private storage. Do not treat uploaded private files as durable until a production storage implementation is connected.

## worker/scheduler

The worker/scheduler is responsible for deadline expiration, overdue verification, final cutoff expiration, and persisted completion jobs.

For a demo backend, document the worker as not configured unless a dedicated Railway worker service is added. A production worker service should use the same environment variables as the API service and run the deadline processing command once a scheduler entrypoint exists.

## Demo smoke check

After deployment, verify the backend is accessible:

```sh
curl -fsS "$BACKEND_URL/health"
```

Expected response includes backend, database, and application status:

```json
{
  "backend": {"status": "ok"},
  "database": {"status": "ok"},
  "application": {"name": "ipb-smart-reserve-hub", "version": "0.1.0"}
}
```
