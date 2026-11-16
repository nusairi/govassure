#!/bin/bash
# Build tabletop.govassured.com: copy the site files to <out> (the folder nginx serves as /sites/tabletop).
# There is no compile step. The ga-* references in index.html carry fixed ?v= versions.
# The container image is built with tools/Dockerfile; the headers and routes are in tools/nginx/.
set -euo pipefail
SRC=${1:?src}; OUT=${2:?out}
rm -rf "$OUT"; mkdir -p "$OUT"
cp -a "$SRC"/. "$OUT"/
# repo-only files are never published
rm -rf "$OUT/tools" "$OUT/README.md" "$OUT/.gitignore"
# the brand bar must be on every page
python3 - "$OUT" <<'PY'
import sys,pathlib
root=pathlib.Path(sys.argv[1])
for f in sorted(root.glob("*.html")):
    assert 'class="ga-brandbar"' in f.read_text(), f"{f.name}: brand bar missing"
    print(f.name, "brand bar OK")
PY
