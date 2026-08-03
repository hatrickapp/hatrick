#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 - "$ROOT_DIR" <<'PY'
from __future__ import annotations

import ast
import re
import sys
from pathlib import Path

root = Path(sys.argv[1]).resolve()
skip_dirs = {
    ".git",
    ".mypy_cache",
    ".pytest_cache",
    ".venv",
    "__pycache__",
    "builds",
    "dist",
    "node_modules",
}
exts = {".py", ".ts", ".tsx"}

files = sorted(
    path
    for base in (root / "client", root / "server")
    for path in base.rglob("*")
    if path.is_file()
    and path.suffix in exts
    and not any(part in skip_dirs for part in path.parts)
)
files = [path.resolve() for path in files]
file_set = set(files)
inbound: dict[Path, set[Path]] = {path: set() for path in files}

ts_import_re = re.compile(
    r"""(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)"""
)


def candidates(base: Path) -> list[Path]:
    if base.suffix in exts:
        return [base.resolve()]
    return [
        base.with_suffix(".ts").resolve(),
        base.with_suffix(".tsx").resolve(),
        base.with_suffix(".py").resolve(),
        (base / "index.ts").resolve(),
        (base / "index.tsx").resolve(),
        (base / "__init__.py").resolve(),
    ]


def owning_src(path: Path) -> Path | None:
    current = path.parent
    while current != root:
        if current.name == "src":
            return current
        current = current.parent
    return None


def add_edge(src: Path, dest: Path | None) -> None:
    if dest in file_set and dest != src:
        inbound[dest].add(src)


def resolve_ts(src: Path, spec: str) -> Path | None:
    if spec.startswith("@/"):
        src_root = owning_src(src)
        if src_root is None:
            return None
        base = src_root / spec[2:]
    elif spec.startswith("."):
        base = (src.parent / spec).resolve()
    else:
        return None
    for item in candidates(base):
        if item in file_set:
            return item
    return None


def module_to_path(module: str) -> Path | None:
    parts = module.split(".")
    base = root
    for part in parts:
        base = base / part
    for item in (base.with_suffix(".py").resolve(), (base / "__init__.py").resolve()):
        if item in file_set:
            return item
    return None


def module_name(path: Path) -> str | None:
    try:
        rel = path.relative_to(root)
    except ValueError:
        return None
    if path.name == "__init__.py":
        rel = rel.parent
    else:
        rel = rel.with_suffix("")
    return ".".join(rel.parts)


def resolve_py_from(src: Path, module: str | None, level: int, names: list[str]) -> list[Path]:
    src_module = module_name(src)
    if not src_module:
        return []
    if level == 0:
        package_parts = module.split(".") if module else []
    else:
        package_parts = src_module.split(".")[:-1]
        package_parts = package_parts[: max(0, len(package_parts) - level + 1)]
        if module:
            package_parts.extend(module.split("."))
    base_module = ".".join(package_parts)

    found: list[Path] = []
    base_path = module_to_path(base_module) if base_module else None
    if base_path:
        found.append(base_path)
    for name in names:
        child_module = f"{base_module}.{name}" if base_module else name
        child_path = module_to_path(child_module)
        if child_path:
            found.append(child_path)
    return found


for src in files:
    text = src.read_text(errors="ignore")
    if src.suffix in {".ts", ".tsx"}:
        for match in ts_import_re.finditer(text):
            spec = next(group for group in match.groups() if group)
            add_edge(src, resolve_ts(src, spec))
        continue

    try:
        tree = ast.parse(text)
    except SyntaxError:
        continue
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                add_edge(src, module_to_path(alias.name))
        elif isinstance(node, ast.ImportFrom):
            names = [alias.name for alias in node.names if alias.name != "*"]
            for dest in resolve_py_from(src, node.module, node.level, names):
                add_edge(src, dest)

entrypoint_patterns = (
    "client/app/capacitor.config.ts",
    "client/app/vite.config.ts",
    "client/app/src/main.tsx",
    "client/app/src/vite-env.d.ts",
    "client/website/vite.config.ts",
    "client/website/src/main.tsx",
    "client/website/src/vite-env.d.ts",
    "server/main.py",
    "server/tests/",
    "server/src/app/start/app.py",
    "server/src/scripts/",
)

unused = []
for path in files:
    rel = path.relative_to(root).as_posix()
    if any(rel == pattern or rel.startswith(pattern) for pattern in entrypoint_patterns):
        continue
    if not inbound[path]:
        lines = sum(1 for _ in path.open(errors="ignore"))
        unused.append((lines, rel))

print("Potential unused source files in client/ and server/:\n")
for lines, rel in sorted(unused, reverse=True):
    print(f"{lines:8d}  {rel}")
PY
