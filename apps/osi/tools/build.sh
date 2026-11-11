#!/bin/bash
# Build osi.govassured.com: copy src -> out, add SWA config.
# Cache-bust query strings are already in the HTML as served on the live site
# (a mix of content hashes and release tags). Do not rewrite them here: doing
# so would change pages that use tags such as hwcard3 / hwlife9 / hwcheck1
# and would not match production.
set -euo pipefail
SRC=${1:?src}; OUT=${2:?out}
rm -rf "$OUT"; mkdir -p "$OUT"
cp -a "$SRC"/. "$OUT"/
# repo-only files and stray/unpublished paths are never published
rm -rf "$OUT/tools" "$OUT/README.md" "$OUT/.gitignore" \
       "$OUT/download" "$OUT/download (1)" "$OUT/shots"
find "$OUT" -name '__pycache__' -type d -prune -exec rm -rf {} +
find "$OUT" -name '.DS_Store' -delete
cp "$(dirname "$0")/swa-config.json" "$OUT/staticwebapp.config.json"
# the inline ga-brand <style> must still match the CSP hash
python3 - "$OUT" <<'PY'
import sys,re,hashlib,base64,pathlib
root=pathlib.Path(sys.argv[1]); want="vRc79FC9uPLJlMuhzrYFCDJ3KB7kvZCZDT5FD50nWoo="
for f in ["index.html","404.html","tutorial.html","checklist.html"]:
    s=(root/f).read_text(); m=re.search(r'<style id="ga-brand">(.*?)</style>',s,re.S)
    if not m:
        raise SystemExit(f"{f}: missing ga-brand style")
    h=base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode()
    print(f, "inline style hash", "OK" if h==want else "MISMATCH "+h); assert h==want
PY
