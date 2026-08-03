#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/client/app/src"
COMPONENTS_DIR="$SRC_DIR/components"

printf 'Unused component files in client/app/src/components:\n\n'

find "$COMPONENTS_DIR" -type f \( -name '*.ts' -o -name '*.tsx' \) | sort |
  while IFS= read -r file; do
    rel="${file#$SRC_DIR/}"
    import_path="@/${rel%.*}"
    importers="$(
      {
        rg -l --fixed-strings "'$import_path'" "$SRC_DIR" \
          --glob '*.ts' \
          --glob '*.tsx' || true
        rg -l --fixed-strings "\"$import_path\"" "$SRC_DIR" \
          --glob '*.ts' \
          --glob '*.tsx' || true
      } |
      sort -u |
      while IFS= read -r importer; do
        [[ "$importer" == "$file" ]] && continue
        printf '%s\n' "$importer"
      done
    )"

    if [[ -z "$importers" ]]; then
      lines="$(wc -l < "$file" | tr -d ' ')"
      printf '%8s  %s\n' "$lines" "$rel"
    fi
  done |
  sort -rn
