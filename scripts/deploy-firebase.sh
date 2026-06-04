#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  npm run env:local
}

trap cleanup EXIT

npm run env:production
npm run build
npm --prefix functions run lint
npm --prefix functions run build
firebase deploy --only functions,hosting --project canva-app-5f36c
