#!/bin/bash
# Build kms.govassured.com: copy the site files to <out> (the folder nginx serves as /sites/kms).
# There is no compile step. The ga-* and icon references in the pages carry fixed ?v= versions.
# src/ can regenerate the site, but that also needs the research-arch scrapes, which are not
# in this tree; the committed site files are the live bytes.
# The container image is built with tools/Dockerfile; the headers and routes are in tools/nginx/.
set -euo pipefail
SRC=${1:?src}; OUT=${2:?out}
rm -rf "$OUT"; mkdir -p "$OUT"
# copy only the published site files (not src/, tools/, README, gitignore)
while IFS= read -r -d "" f; do
  rel=${f#"$SRC"/}
  case "$rel" in
    tools/*|src/*|README.md|.gitignore|.dockerignore) continue ;;
    *) ;;
  esac
  mkdir -p "$OUT/$(dirname "$rel")"
  cp -a "$f" "$OUT/$rel"
done < <(find "$SRC" -type f -print0)
# the brand bar must be on every page
python3 - "$OUT" << 'END_PY'
import sys,pathlib
root=pathlib.Path(sys.argv[1])
pages=sorted(root.glob("*.html"))
assert pages, "no html"
for f in pages:
    assert 'class="ga-brandbar"' in f.read_text(), f"{f.name}: brand bar missing"
    print(f.name, "brand bar OK")
END_PY
