#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 - "$ROOT_DIR" <<'PY'
from __future__ import annotations

import sys
from pathlib import Path

root = Path(sys.argv[1]).resolve()
roots = [root / "server" / "src", root / "server" / "data"]
skip_names = {
    ".DS_Store",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".venv",
    "__pycache__",
    "tests",
}
skip_suffixes = {
    ".pyc",
    ".pyo",
}


def visible(path: Path) -> bool:
    return path.name not in skip_names and path.suffix not in skip_suffixes


def children(path: Path) -> list[Path]:
    if not path.is_dir():
        return []
    return sorted(
        (child for child in path.iterdir() if visible(child)),
        key=lambda child: (not child.is_dir(), child.name.lower()),
    )


def print_tree(path: Path, prefix: str = "") -> None:
    items = children(path)
    for index, item in enumerate(items):
        last = index == len(items) - 1
        connector = "`-- " if last else "|-- "
        print(f"{prefix}{connector}{item.name}")
        if item.is_dir():
            extension = "    " if last else "|   "
            print_tree(item, prefix + extension)


print("server")
for index, tree_root in enumerate(roots):
    if not tree_root.exists():
        continue
    last = index == len(roots) - 1
    connector = "`-- " if last else "|-- "
    print(f"{connector}{tree_root.relative_to(root / 'server')}")
    print_tree(tree_root, "    " if last else "|   ")
PY
