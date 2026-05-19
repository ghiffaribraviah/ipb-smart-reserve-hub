#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [[ -d "$HOME/.local/bin" ]]; then
  export PATH="$HOME/.local/bin:$PATH"
fi

BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
VITE_API_BASE_URL="${VITE_API_BASE_URL:-$BACKEND_URL}"
PYTHON_BIN="${PYTHON_BIN:-}"

backend_pid=""
frontend_pid=""

cleanup() {
  local exit_code=$?

  trap - INT TERM EXIT

  if [[ -n "$frontend_pid" ]] && kill -0 "$frontend_pid" 2>/dev/null; then
    kill "$frontend_pid" 2>/dev/null || true
  fi

  if [[ -n "$backend_pid" ]] && kill -0 "$backend_pid" 2>/dev/null; then
    kill "$backend_pid" 2>/dev/null || true
  fi

  wait "$frontend_pid" 2>/dev/null || true
  wait "$backend_pid" 2>/dev/null || true

  exit "$exit_code"
}

trap cleanup INT TERM EXIT

cd "$ROOT_DIR"

if [[ -z "$PYTHON_BIN" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
  else
    PYTHON_BIN="python"
  fi
fi

if ! command -v uv >/dev/null 2>&1 && ! "$PYTHON_BIN" -c "import uvicorn" >/dev/null 2>&1; then
  printf 'uv was not found and %s cannot import uvicorn.\n' "$PYTHON_BIN" >&2
  printf 'Install uv and rerun `make dev`, or install backend dependencies in the active Python environment.\n' >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  printf 'npm was not found. Install Node.js/npm and rerun `make dev`.\n' >&2
  exit 1
fi

if [[ "${SKIP_SYNC:-0}" != "1" ]] && command -v uv >/dev/null 2>&1; then
  uv sync --extra dev
elif [[ "${SKIP_SYNC:-0}" != "1" ]]; then
  printf 'uv was not found; skipping backend dependency sync and using %s.\n' "$PYTHON_BIN" >&2
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" && "${SKIP_NPM_INSTALL:-0}" != "1" ]]; then
  npm install --prefix "$FRONTEND_DIR"
fi

if [[ "${SKIP_SEED:-0}" != "1" ]]; then
  if command -v uv >/dev/null 2>&1; then
    uv run python -m app.dev.seed
  else
    "$PYTHON_BIN" -m app.dev.seed
  fi
fi

if command -v uv >/dev/null 2>&1; then
  uv run python -m uvicorn app.main:create_app --factory --reload &
else
  "$PYTHON_BIN" -m uvicorn app.main:create_app --factory --reload &
fi
backend_pid=$!

(
  cd "$FRONTEND_DIR"
  VITE_API_BASE_URL="$VITE_API_BASE_URL" npm run dev
) &
frontend_pid=$!

wait -n "$backend_pid" "$frontend_pid"
