.PHONY: dev backend-test backend-reset-db backend-seed backend-catalog-seed backend-bootstrap-seed backend-run frontend-dev

dev:
	./scripts/dev.sh

backend-test:
	cd backend && uv run pytest

backend-reset-db:
	cd backend && uv run python -m app.dev.reset_db

backend-seed:
	cd backend && uv run python -m app.dev.seed

backend-catalog-seed:
	cd backend && uv run python -m app.dev.catalog_seed

backend-bootstrap-seed:
	cd backend && uv run python -m app.dev.bootstrap_seed

backend-run:
	cd backend && uv run uvicorn app.main:create_app --factory --reload

frontend-dev:
	cd frontend && npm run dev
