#!/usr/bin/env bash
set -euo pipefail

cp .env.local .env
echo "Local environment applied to .env"
cat .env
