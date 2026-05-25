#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${CRYPTOPILOT_REMOTE_HOST:-ubuntu@165.154.203.52}"
REMOTE_APP_DIR="${CRYPTOPILOT_REMOTE_APP_DIR:-/home/ubuntu/apps/CryptoPilot-release}"
LOCAL_DB_CONTAINER="${CRYPTOPILOT_LOCAL_DB_CONTAINER:-cryptopilot-postgres}"
REMOTE_DB_CONTAINER="${CRYPTOPILOT_REMOTE_DB_CONTAINER:-cryptopilot-postgres}"
DB_NAME="${CRYPTOPILOT_DB_NAME:-cryptopilot}"
DB_USER="${CRYPTOPILOT_DB_USER:-cryptopilot}"

STAMP="$(date +%Y%m%d%H%M%S)"
DUMP_FILE="/tmp/cryptopilot-local-${STAMP}.dump"
REMOTE_DUMP="/tmp/cryptopilot-local-${STAMP}.dump"
REMOTE_BACKUP="/home/ubuntu/backups/cryptopilot-server-${STAMP}.dump"

echo "==> Dumping local database from ${LOCAL_DB_CONTAINER}"
docker exec "${LOCAL_DB_CONTAINER}" pg_dump \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --format=custom \
  --no-owner \
  --no-privileges \
  > "${DUMP_FILE}"

echo "==> Uploading dump to ${REMOTE_HOST}"
scp "${DUMP_FILE}" "${REMOTE_HOST}:${REMOTE_DUMP}"

echo "==> Backing up server database to ${REMOTE_BACKUP}"
ssh "${REMOTE_HOST}" "mkdir -p /home/ubuntu/backups && cd '${REMOTE_APP_DIR}' && docker exec '${REMOTE_DB_CONTAINER}' pg_dump -U '${DB_USER}' -d '${DB_NAME}' --format=custom --no-owner --no-privileges > '${REMOTE_BACKUP}'"

echo "==> Pausing server API during restore"
ssh "${REMOTE_HOST}" "sudo systemctl stop cryptopilot-api"

echo "==> Replacing server database with local data"
ssh "${REMOTE_HOST}" "cd '${REMOTE_APP_DIR}' && trap 'sudo systemctl start cryptopilot-api' EXIT && cat '${REMOTE_DUMP}' | docker exec -i '${REMOTE_DB_CONTAINER}' pg_restore -U '${DB_USER}' -d '${DB_NAME}' --clean --if-exists --exit-on-error --no-owner --no-privileges"

echo "==> Cleaning temporary files"
rm -f "${DUMP_FILE}"
ssh "${REMOTE_HOST}" "rm -f '${REMOTE_DUMP}'"

echo "==> Database sync complete"
echo "    Server backup: ${REMOTE_BACKUP}"
