#!/bin/bash
# Build crossword.govassured.com: copy the site files to <out> and add the SWA config.
# There is no compile step. CSS/JS keep fixed file names (cached as immutable, see tools/swa-config.json).
set -euo pipefail
SRC=${1:?src}; OUT=${2:?out}
rm -rf "$OUT"; mkdir -p "$OUT"
cp -a "$SRC"/. "$OUT"/
# repo-only files are never published
rm -rf "$OUT/tools" "$OUT/README.md" "$OUT/.gitignore"
cp "$(dirname "$0")/swa-config.json" "$OUT/staticwebapp.config.json"
# every inline <style> must be allowed by a hash in the CSP, and the brand bar must be present
python3 - "$OUT" <<'PY'
import sys,re,hashlib,base64,json,pathlib
root=pathlib.Path(sys.argv[1])
csp=json.loads((root/"staticwebapp.config.json").read_text())["globalHeaders"]["Content-Security-Policy"]
for f in sorted(root.glob("*.html")):
    s=f.read_text()
    for m in re.finditer(r'<style[^>]*>(.*?)</style>',s,re.S):
        h="sha256-"+base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode()
        assert h in csp, f"{f.name}: inline style {h} not in CSP"
    assert 'class="ga-brandbar"' in s, f"{f.name}: brand bar missing"
    print(f.name, "CSP hashes OK, brand bar OK")
PY
