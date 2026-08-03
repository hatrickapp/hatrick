#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

find "$ROOT_DIR/client" "$ROOT_DIR/server" \
  \( \
    -path '*/node_modules/*' -o \
    -path '*/dist/*' -o \
    -path '*/builds/*' -o \
    -path '*/__pycache__/*' -o \
    -path '*/.venv/*' -o \
    -path '*/.mypy_cache/*' -o \
    -path '*/.pytest_cache/*' \
  \) -prune -o \
  -type f \( -name '*.tsx'  \) -print0 |
  sort -z |
  while IFS= read -r -d '' file; do
    rel="${file#$ROOT_DIR/}"
    lines="$(wc -l < "$file" | tr -d ' ')"
    printf '%8s  %s\n' "$lines" "$rel"
  done |
  sort -rn
