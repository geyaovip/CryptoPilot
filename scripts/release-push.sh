#!/usr/bin/env bash
set -euo pipefail

REMOTE="${1:-origin}"
BRANCH="${2:-main}"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes before release push." >&2
  git status --short
  exit 1
fi

echo "==> Pushing code to ${REMOTE}/${BRANCH}"
git push "${REMOTE}" "${BRANCH}"

echo "==> Code push succeeded; syncing local database to server"
"$(dirname "$0")/sync-local-db-to-server.sh"
