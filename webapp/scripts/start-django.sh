#!/usr/bin/env bash
set -euo pipefail

cd /webapp

lock_file="Pipfile.lock"
hash_file=".venv/.pipfile.lock.sha256"
needs_sync=0
current_hash=""

if [ ! -d .venv ]; then
  needs_sync=1
fi

if [ -f "$lock_file" ]; then
  current_hash="$(sha256sum "$lock_file" | awk '{print $1}')"
  saved_hash=""
  if [ -f "$hash_file" ]; then
    saved_hash="$(cat "$hash_file")"
  fi
  if [ "$current_hash" != "$saved_hash" ]; then
    needs_sync=1
  fi
fi

if [ "$needs_sync" -eq 1 ]; then
  echo "[django-service] install Python dependencies"
  sync_ok=0
  for attempt in $(seq 1 5); do
    if pipenv sync --dev; then
      sync_ok=1
      break
    fi

    echo "[django-service] pipenv sync failed (attempt ${attempt}/5). retry in 5s"
    sleep 5
  done

  if [ "$sync_ok" -ne 1 ]; then
    echo "[django-service] failed to install Python dependencies after retries"
    echo "[django-service] check DNS/network from Docker engine (example: pypi.org resolution)"
    exit 1
  fi

  mkdir -p "$(dirname "$hash_file")"
  if [ -n "$current_hash" ]; then
    echo "$current_hash" > "$hash_file"
  fi
fi

migrated=0
for attempt in $(seq 1 10); do
  if pipenv run python manage.py migrate; then
    migrated=1
    break
  fi

  echo "[django-service] migrate failed (attempt ${attempt}/10). retry in 3s"
  sleep 3
done

if [ "$migrated" -ne 1 ]; then
  echo "[django-service] migrate failed after retries"
  exit 1
fi

exec pipenv run python manage.py runserver 0.0.0.0:8000
