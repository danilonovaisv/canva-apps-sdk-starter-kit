#!/usr/bin/env bash
set -euo pipefail

cp .env.production .env
echo "Production environment applied to .env"
cat .env
