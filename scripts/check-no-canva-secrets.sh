#!/usr/bin/env bash
set -euo pipefail

SEARCH_ROOT="${1:-.}"

if grep -RIn \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=.firebase \
  --exclude-dir=.pnpm-store \
  --exclude='*.map' \
  '[c]nvca' "$SEARCH_ROOT"; then
  echo "Canva secret-looking value found. Rotate and remove it before build."
  exit 1
fi

if grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=.firebase \
  --exclude-dir=.pnpm-store \
  --exclude='*.map' \
  '^CANVA_CLIENT_SECRET=[^#[:space:]].+$' "$SEARCH_ROOT"; then
  echo "CANVA_CLIENT_SECRET must not be stored in files."
  exit 1
fi

echo "No Canva client secrets found in repository files."
