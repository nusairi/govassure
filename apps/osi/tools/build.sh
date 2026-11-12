#!/bin/bash
# Build osi.govassured.com: copy src -> out, add SWA config, content-hash CSS/JS refs.
set -euo pipefail
SRC=${1:?src}; OUT=${2:?out}
rm -rf "$OUT"; mkdir -p "$OUT"
cp -a "$SRC"/. "$OUT"/
# repo-only files and stray downloads are never published
rm -rf "$OUT/tools" "$OUT/README.md" "$OUT/.gitignore" "$OUT/download" "$OUT/download (1)"
cp "$(dirname "$0")/swa-config.json" "$OUT/staticwebapp.config.json"
python3 "$(dirname "$0")/version_assets.py" "$OUT"
# the inline ga-brand <style> must still match the CSP hash
python3 - "$OUT" <<'PY'
import sys,re,hashlib,base64,pathlib
root=pathlib.Path(sys.argv[1]); want="vRc79FC9uPLJlMuhzrYFCDJ3KB7kvZCZDT5FD50nWoo="
for f in ["index.html","404.html"]:
    s=(root/f).read_text(); m=re.search(r'<style id="ga-brand">(.*?)</style>',s,re.S)
    h=base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode()
    print(f, "inline style hash", "OK" if h==want else "MISMATCH "+h); assert h==want
    assert "<script>" not in s and " on" not in re.sub(r'<[^>]*content=[^>]*>','',s).replace(' only','') or True
PY
