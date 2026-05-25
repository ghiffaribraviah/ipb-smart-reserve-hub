# Backend

This directory contains the backend seam for IPB Smart Reserve Hub:

- `backend/app/` FastAPI application package
- `backend/tests/` backend behavior and API tests
- `backend/pyproject.toml` backend Python project configuration

Run backend commands from the repo root through the helper targets:

```sh
make backend-test
make backend-reset-db
make backend-seed
make backend-catalog-seed
make backend-bootstrap-seed
make backend-run
```

Or work directly inside `backend/`:

```sh
cd backend
uv sync --extra dev
uv run pytest
uv run python -m app.dev.reset_db
uv run python -m app.dev.seed
uv run python -m app.dev.catalog_seed
uv run python -m app.dev.bootstrap_seed
uv run uvicorn app.main:create_app --factory --reload
```
