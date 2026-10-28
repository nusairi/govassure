#!/usr/bin/env bash
# Build the SWA deploy folder: <out>/app (static) + <out>/api (functions), with versioned asset URLs.
# Usage: scripts/build.sh <out_dir>     then: swa deploy <out>/app --api-location <out>/api ...
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"; out="${1:?out dir}"
rm -rf "$out" && mkdir -p "$out"
cp -r "$here" "$out/app"
rm -rf "$out/app/api" "$out/app/scripts" "$out/app/diag" "$out/app/README.md" "$out/app/.git"
cp -r "$here/api" "$out/api"
python3 "$here/scripts/version_assets.py" "$out/app"
python3 "$here/scripts/check_links.py"
