#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DB_NAME="${DB_NAME:-blogdb}"
DB_USER="${DB_USER:-tenno}"
DB_PASSWORD="${DB_PASSWORD:-vor_speaks_truth}"
DB_CONTAINER="${DB_CONTAINER:-blog-postgres}"

ADMIN_USERNAME="${ADMIN_USERNAME:-ballas}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-orokins}"
ADMIN_EMAIL="${ADMIN_EMAIL:-ballas@admin.local}"

docker exec -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" \
  psql -U "$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${DB_NAME}' AND pid <> pg_backend_pid();"
docker exec -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" \
  psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker exec -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" \
  psql -U "$DB_USER" -d postgres -c "CREATE DATABASE ${DB_NAME};"

BACKEND_PID=""
cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
    wait "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if ! docker exec -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" \
  psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT to_regclass('public.users');" | grep -q users; then
  cd "$ROOT_DIR/backend"
  ./mvnw -q -DskipTests spring-boot:run >/tmp/01blog-backend-init.log 2>&1 &
  BACKEND_PID=$!
  cd "$ROOT_DIR"

  for _ in {1..60}; do
    if docker exec -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" \
      psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT to_regclass('public.users');" | grep -q users; then
      break
    fi
    sleep 1
  done
fi

docker exec -i -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" \
  psql -U "$DB_USER" -d "$DB_NAME" <<SQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, username, email, password, role, status, created_at, updated_at)
VALUES (gen_random_uuid(), '${ADMIN_USERNAME}', '${ADMIN_EMAIL}', crypt('${ADMIN_PASSWORD}', gen_salt('bf')), 'ADMIN', 'ACTIVE', now(), now());
SQL
