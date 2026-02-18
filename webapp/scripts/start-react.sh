#!/usr/bin/env bash
set -euo pipefail

cd /webapp/frontend-react

lock_file="yarn.lock"
hash_file="node_modules/.yarn.lock.sha256"
needs_install=0
current_hash=""

if [ ! -d node_modules ]; then
  needs_install=1
fi

if [ -f "$lock_file" ]; then
  current_hash="$(sha256sum "$lock_file" | awk '{print $1}')"
  saved_hash=""
  if [ -f "$hash_file" ]; then
    saved_hash="$(cat "$hash_file")"
  fi
  if [ "$current_hash" != "$saved_hash" ]; then
    needs_install=1
  fi
fi

if [ "$needs_install" -eq 1 ]; then
  echo "[react-service] install Node dependencies"
  install_ok=0
  for attempt in $(seq 1 5); do
    if yarn install --frozen-lockfile; then
      install_ok=1
      break
    fi

    echo "[react-service] yarn install failed (attempt ${attempt}/5). retry in 5s"
    sleep 5
  done

  if [ "$install_ok" -ne 1 ]; then
    echo "[react-service] failed to install Node dependencies after retries"
    echo "[react-service] check DNS/network from Docker engine (example: registry.yarnpkg.com resolution)"
    exit 1
  fi

  mkdir -p "$(dirname "$hash_file")"
  if [ -n "$current_hash" ]; then
    echo "$current_hash" > "$hash_file"
  fi
fi

exec yarn dev --host 0.0.0.0 --port 5173
