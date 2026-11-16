#!/bin/bash
# Checks for the threatmodel.govassured.com build: file set, brand bar, CSP,
# no inline handlers or style attributes, and no repo-only paths in the output.
# Usage: tools/test.sh [out-dir]
#   If out-dir is omitted, tools/build.sh is run into a temporary directory.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
cleanup() { if [ -n "${tmp:-}" ]; then rm -rf "$tmp"; fi; }
tmp=""
if [ "${1:-}" != "" ]; then
  OUT="$(cd "$1" && pwd)"
else
  tmp="$(mktemp -d)"
  trap cleanup EXIT
  "$here/tools/build.sh" "$here" "$tmp"
  OUT="$tmp"
fi

fail=0
ok() { echo "OK $*"; }
bad() { echo "BAD $*"; fail=1; }

# expected published site files (plus the SWA config)
expected='
app.css
apple-touch-icon.png
ds-app.css
favicon.ico
favicon.svg
ga-404.css
ga-404.html
ga-app.css
ga-brand.css
ga-logo.png
ga-sources.js
ga-theme.css
icon-192.png
icon-512.png
index.html
linkedin.svg
robots.txt
site.webmanifest
sitemap.xml
staticwebapp.config.json
tm-data.js
tm.js
'
got="$(cd "$OUT" && find . -type f | sed 's|^\./||' | sort)"
want="$(printf '%s\n' $expected | sed '/^$/d' | sort)"
if [ "$got" = "$want" ]; then
  ok "22 published files"
else
  bad "file set differs"
  printf '%s\n' "$want" > /tmp/tm-test-want.txt
  printf '%s\n' "$got" > /tmp/tm-test-got.txt
  diff -u /tmp/tm-test-want.txt /tmp/tm-test-got.txt || true
fi

for p in tools README.md .gitignore src shots; do
  if [ -e "$OUT/$p" ]; then bad "repo-only path published: $p"; else ok "excluded $p"; fi
done

python3 - "$OUT" <<'PY' || fail=1
import json,re,sys,pathlib
root=pathlib.Path(sys.argv[1])
cfg=json.loads((root/"staticwebapp.config.json").read_text())
csp=cfg.get("globalHeaders",{}).get("Content-Security-Policy","")
want_csp="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; manifest-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests"
ok=True
def bad(m):
    global ok
    ok=False
    print("BAD", m)
if csp!=want_csp:
    bad("CSP does not match the live config")
else:
    print("OK CSP matches the live config")
ov=cfg.get("responseOverrides",{}).get("404",{})
if ov.get("rewrite")!="/ga-404.html" or ov.get("statusCode")!=404:
    bad("404 override missing or wrong")
else:
    print("OK 404 override rewrites to /ga-404.html with status 404")
if cfg.get("mimeTypes",{}).get(".webmanifest")!="application/manifest+json":
    bad("webmanifest MIME type missing")
else:
    print("OK .webmanifest MIME type")
for f in sorted(root.glob("*.html")):
    s=f.read_text()
    if 'class="ga-brandbar"' not in s:
        bad(f"{f.name}: brand bar missing")
    else:
        print(f"OK {f.name} brand bar")
    if re.search(r"\son[a-z]+=", s, re.I):
        bad(f"{f.name}: inline handler")
    if ' style="' in s:
        bad(f"{f.name}: inline style attribute")
    for m in re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", s, re.S):
        if m.group(1).strip():
            bad(f"{f.name}: inline script")
    for m in re.finditer(r"<style[^>]*>(.*?)</style>", s, re.S):
        if m.group(1).strip():
            bad(f"{f.name}: inline style block")
if not (root/"index.html").read_text().count('https://www.linkedin.com/company/102617034/'):
    bad("LinkedIn company page missing from index.html")
else:
    print("OK LinkedIn company page")
if "https://github.com/nusairi/govassure" not in (root/"index.html").read_text():
    bad("GitHub repo link missing from index.html")
else:
    print("OK GitHub repo link")
sys.exit(0 if ok else 1)
PY

[ "$fail" = 0 ] && echo ALL-TESTS-PASSED || { echo TESTS-FAILED; exit 1; }
