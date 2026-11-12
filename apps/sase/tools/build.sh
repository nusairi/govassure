#!/bin/bash
# Build sase.govassured.com: copy the site files to <out> and add the SWA config.
# There is no compile step. The ga-* references in index.html carry fixed ?v= versions.
set -euo pipefail
SRC=${1:?src}; OUT=${2:?out}
rm -rf "$OUT"; mkdir -p "$OUT"
cp -a "$SRC"/. "$OUT"/
# repo-only files are never published
rm -rf "$OUT/tools" "$OUT/README.md" "$OUT/.gitignore"
cp "$(dirname "$0")/swa-config.json" "$OUT/staticwebapp.config.json"
# the brand bar must be on every page; if the CSP lists style hashes, every inline <style> must be one of them
python3 - "$OUT" <<'PY'
import sys,re,hashlib,base64,json,pathlib
root=pathlib.Path(sys.argv[1])
csp=json.loads((root/"staticwebapp.config.json").read_text()).get("globalHeaders",{}).get("Content-Security-Policy")
for f in sorted(root.glob("*.html")):
    s=f.read_text()
    if csp and "sha256-" in csp:
        for m in re.finditer(r'<style[^>]*>(.*?)</style>',s,re.S):
            h="sha256-"+base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode()
            assert h in csp, f"{f.name}: inline style {h} not in CSP"
    assert 'class="ga-brandbar"' in s, f"{f.name}: brand bar missing"
    print(f.name, "brand bar OK" + (", CSP hashes OK" if csp and "sha256-" in csp else " (CSP uses no hashes)"))
PY
