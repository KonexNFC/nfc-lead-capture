#!/usr/bin/env bash
set -euo pipefail

# Keep dependencies aligned with the committed lockfile after task merges.
# Database schema changes are intentionally not applied here: production data
# migrations need an explicit, reviewed deployment step.
npm ci --ignore-scripts