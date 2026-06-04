import json
import tomllib
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_ROOT.parent


def test_railway_backend_deployment_config_lives_with_backend_package():
    railway_config = tomllib.loads((BACKEND_ROOT / "railway.toml").read_text())

    assert not (REPO_ROOT / "railway.toml").exists()
    assert railway_config["build"]["builder"] == "RAILPACK"
    assert railway_config["deploy"]["startCommand"] == (
        "uvicorn app.main:create_app --factory --host 0.0.0.0 --port $PORT"
    )
    assert railway_config["deploy"]["healthcheckPath"] == "/health"


def test_backend_railpack_config_installs_tectonic_for_runtime_pdf_generation():
    railpack_config = json.loads((BACKEND_ROOT / "railpack.json").read_text())

    assert railpack_config["$schema"] == "https://schema.railpack.com"
    assert railpack_config["deploy"]["aptPackages"] == ["tectonic"]


def test_backend_deployment_guide_covers_demo_readiness_topics():
    guide = (REPO_ROOT / "docs" / "backend-deployment.md").read_text()

    for required_text in [
        "Railway backend deployment",
        "Root Directory: `/backend`",
        "Config file path: `/backend/railway.toml`",
        "railpack.json",
        "tectonic",
        "IPB_ENVIRONMENT=production",
        "IPB_DATABASE_URL",
        "IPB_SECRET_KEY",
        "PostgreSQL",
        "uvicorn app.main:create_app --factory",
        "GET /health",
        "public facility images",
        "private reservation files",
        "worker/scheduler",
    ]:
        assert required_text in guide


def test_backend_dependencies_include_postgresql_runtime_driver():
    pyproject = tomllib.loads((BACKEND_ROOT / "pyproject.toml").read_text())

    assert "psycopg[binary]>=3.2.0" in pyproject["project"]["dependencies"]


def test_vercel_frontend_config_supports_vite_spa_deep_links():
    vercel_config = json.loads((REPO_ROOT / "frontend" / "vercel.json").read_text())

    assert vercel_config["$schema"] == "https://openapi.vercel.sh/vercel.json"
    assert vercel_config["rewrites"] == [
        {
            "source": "/(.*)",
            "destination": "/index.html",
        }
    ]


def test_frontend_deployment_guide_covers_vercel_configuration():
    guide = (REPO_ROOT / "docs" / "frontend-deployment.md").read_text()

    for required_text in [
        "Vercel frontend deployment",
        "Root Directory: `frontend`",
        "Build Command: `npm run build`",
        "Output Directory: `dist`",
        "VITE_API_BASE_URL",
        "frontend/vercel.json",
    ]:
        assert required_text in guide
