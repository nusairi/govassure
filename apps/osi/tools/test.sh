#!/bin/bash
# Checks for the osi.govassured.com build: file set, exclusions, SWA config,
# unlisted checklist, brand-bar CSP hash, and byte-identity with the source.
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

expected='
404.html
LICENSE-IBMPlexMono-OFL.txt
LICENSE-SpaceGrotesk-OFL.txt
OSI-Security-Rings-A3-print-light.pdf
OSI-Security-Rings-A3.pdf
app.css
app.js
apple-touch-icon.png
checklist-data.js
checklist.css
checklist.html
checklist.js
data.js
downloads/hardware-assurance-checklist.xlsx
favicon.ico
favicon.svg
ga-app.css
ga-logo.png
ga-sources.js
ga-theme.css
hw-cards.js
ibm-plex-mono-latin-400-normal.woff2
ibm-plex-mono-latin-500-normal.woff2
ibm-plex-mono-latin-600-normal.woff2
icon-192.png
icon-512-maskable.png
icon-512.png
index.html
og.html
og.png
robots.txt
site.webmanifest
sitemap.xml
space-grotesk-latin-400-normal.woff2
space-grotesk-latin-500-normal.woff2
space-grotesk-latin-600-normal.woff2
space-grotesk-latin-700-normal.woff2
staticwebapp.config.json
theme-init.js
tutorial-data.js
tutorial.css
tutorial.html
tutorial.js
'
got="$(cd "$OUT" && find . -type f | sed 's|^\./||' | sort)"
want="$(printf '%s\n' $expected | sed '/^$/d' | sort)"
if [ "$got" = "$want" ]; then
  ok "43 published files"
else
  bad "file set differs"
  printf '%s\n' "$want" > /tmp/osi-test-want.txt
  printf '%s\n' "$got" > /tmp/osi-test-got.txt
  diff -u /tmp/osi-test-want.txt /tmp/osi-test-got.txt || true
fi

for p in tools README.md .gitignore shots download 'download (1)' src node_modules; do
  if [ -e "$OUT/$p" ]; then bad "repo-only path published: $p"; else ok "excluded $p"; fi
done

# Output files (except the injected config) must be byte-identical to the source
python3 - "$here" "$OUT" <<'PY' || fail=1
import json, sys, pathlib
here, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
cfg_src = (here/"tools"/"swa-config.json").read_bytes()
cfg_out = (out/"staticwebapp.config.json").read_bytes()
if cfg_src != cfg_out:
    print("BAD staticwebapp.config.json is not byte-identical to tools/swa-config.json")
    sys.exit(1)
print("OK config matches tools/swa-config.json")
mismatch = []
for p in sorted(out.rglob("*")):
    if not p.is_file():
        continue
    rel = p.relative_to(out)
    if rel.as_posix() == "staticwebapp.config.json":
        continue
    src = here / rel
    if not src.is_file():
        mismatch.append(f"output-only {rel}")
        continue
    if p.read_bytes() != src.read_bytes():
        mismatch.append(str(rel))
if mismatch:
    print("BAD not byte-identical to source:", *mismatch)
    sys.exit(1)
print("OK published files byte-identical to source")

sitemap = (out/"sitemap.xml").read_text(encoding="utf-8")
robots = (out/"robots.txt").read_text(encoding="utf-8")
index = (out/"index.html").read_text(encoding="utf-8")
tutorial = (out/"tutorial.html").read_text(encoding="utf-8")
checklist = (out/"checklist.html").read_text(encoding="utf-8")
ok = True
if "/checklist" in sitemap or "checklist" in robots:
    print("BAD checklist listed in sitemap.xml or robots.txt"); ok=False
else:
    print("OK checklist not in sitemap.xml or robots.txt")
if "/checklist" in index or "/checklist" in tutorial:
    print("BAD checklist linked from index.html or tutorial.html"); ok=False
else:
    print("OK checklist not linked from index.html or tutorial.html")
if '<meta name="robots" content="noindex,nofollow">' not in checklist:
    print("BAD checklist.html missing noindex,nofollow meta"); ok=False
else:
    print("OK checklist.html has noindex,nofollow meta")
if 'app.css?v=hwcard3' not in index or 'tutorial.css?v=hwlife9' not in tutorial or 'checklist.css?v=hwcheck2' not in checklist:
    print("BAD cache-bust release tags were rewritten or missing"); ok=False
else:
    print("OK live cache-bust release tags left in place")

cfg=json.loads((out/"staticwebapp.config.json").read_text())
hdrs=cfg.get("globalHeaders",{})
want_csp="default-src 'none'; script-src 'self'; style-src 'self' 'sha256-vRc79FC9uPLJlMuhzrYFCDJ3KB7kvZCZDT5FD50nWoo='; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; manifest-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests"
if hdrs.get("Content-Security-Policy")!=want_csp:
    print("BAD CSP does not match the live config"); ok=False
else:
    print("OK CSP matches the live config")
for k,v in {
    "Strict-Transport-Security":"max-age=63072000; includeSubDomains",
    "X-Content-Type-Options":"nosniff",
    "X-Frame-Options":"DENY",
    "Referrer-Policy":"strict-origin-when-cross-origin",
    "Permissions-Policy":"accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()",
    "Cross-Origin-Opener-Policy":"same-origin",
}.items():
    if hdrs.get(k)!=v:
        print(f"BAD header {k}"); ok=False
routes={(r.get("route"), r.get("rewrite"), r.get("redirect"), r.get("statusCode")) for r in cfg.get("routes",[])}
need={
    ("/checklist", "/checklist.html", None, None),
    ("/checklist.html", None, "/checklist", 301),
    ("/tutorial", "/tutorial.html", None, None),
    ("/tutorial.html", None, "/tutorial", 301),
    ("/og", "/og.html", None, None),
    ("/og.html", None, "/og", 301),
}
if not need <= routes:
    print("BAD missing or wrong clean-URL routes"); ok=False
else:
    print("OK /tutorial /checklist /og routes")
mt=cfg.get("mimeTypes",{})
if mt.get(".webmanifest")!="application/manifest+json":
    print("BAD webmanifest MIME type"); ok=False
else:
    print("OK webmanifest MIME type")
if mt.get(".xlsx")!="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    print("BAD xlsx MIME type"); ok=False
else:
    print("OK xlsx MIME type")
ov=cfg.get("responseOverrides",{}).get("404",{})
if ov.get("rewrite")!="/404.html":
    print("BAD 404 override missing or wrong"); ok=False
else:
    print("OK 404 rewrite")
if not ok:
    sys.exit(1)
PY

if [ "$fail" -ne 0 ]; then
  echo "SOME-TESTS-FAILED"
  exit 1
fi
echo "ALL-TESTS-PASSED"
