#!/usr/bin/env bash
# Build the www.govassured.com deploy folder from an explicit allowlist.
# Only the hub's own files are published. App sources under apps/<name>/ (and README,
# scripts/, tools) are never copied, so they cannot appear on www.
# Usage: scripts/build.sh <out_dir>
#   then: swa deploy <out>/app --api-location <out>/api ...
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"; out="${1:?out dir}"

HUB_FILES=(index.html 404.html apps/index.html app.js styles.css live.js live.css
           robots.txt sitemap.xml staticwebapp.config.json vercel.json)
HUB_DIRS=(data public)

rm -rf "$out" && mkdir -p "$out/app"
for f in "${HUB_FILES[@]}"; do
  mkdir -p "$out/app/$(dirname "$f")" && cp -p "$here/$f" "$out/app/$f"
done
for d in "${HUB_DIRS[@]}"; do cp -rp "$here/$d" "$out/app/$d"; done
cp -rp "$here/api" "$out/api"
rm -rf "$out/api/node_modules"

# Cache-bust CSS/JS when the versioning script is present.
if [ -f "$here/scripts/version_assets.py" ]; then
  python3 "$here/scripts/version_assets.py" "$out/app"
fi
python3 "$here/scripts/check_links.py"

# Guard: apps/ in the output may hold only the hub's directory page.
extra="$(cd "$out/app" && find apps -mindepth 1 ! -path apps/index.html)"
if [ -n "$extra" ]; then
  echo "build.sh: app sources found in the hub output:" >&2; echo "$extra" >&2; exit 1
fi
echo "Hub build: $(find "$out/app" -type f | wc -l) files in $out/app"
