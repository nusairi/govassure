#!/bin/bash
# Build threat.govassured.com: copy the Python app, data and public files to <out>.
# There is no compile step. The container image is built with tools/Dockerfile.
set -euo pipefail
SRC=${1:?src}; OUT=${2:?out}
rm -rf "$OUT"; mkdir -p "$OUT"
cp -a "$SRC/app.py" "$OUT/app.py"
cp -a "$SRC/requirements.txt" "$OUT/requirements.txt"
cp -a "$SRC/data" "$OUT/data"
cp -a "$SRC/public" "$OUT/public"
# the brand bar must be on every page
python3 - "$OUT/public" << 'END_PY'
import sys,pathlib
root=pathlib.Path(sys.argv[1])
pages=sorted(root.glob("*.html"))
assert pages, "no html"
for f in pages:
    assert 'class="ga-brandbar"' in f.read_text(), f"{f.name}: brand bar missing"
    print(f.name, "brand bar OK")
END_PY
