#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root based on this script's location
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Run the Zillow ETL job container
docker compose run --rm zillow_job "$@"
