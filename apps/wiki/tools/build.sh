#!/bin/sh
# Build wiki.govassured.com: <out> is the folder nginx serves as /sites/wiki.
#   tools/build.sh <src> <out>      (src = apps/wiki)
# Steps: copy the source to a clean build folder, npm ci, vitepress build,
# tools/postbuild.mjs (the ga-* links and the LinkedIn link order), copy .vitepress/dist to <out>,
# check the brand bar.
# Optional environment:
#   WIKI_BUILD_DIR  build folder (default: a new temp folder). It must not exist or be empty.
#                   The output does not depend on it; see README.md.
set -eu
SRC=$(cd "${1:?src}" && pwd); OUT=${2:?out}
if [ -n "${WIKI_BUILD_DIR:-}" ]; then
  BUILD=$WIKI_BUILD_DIR
else
  TMP=$(mktemp -d)
  trap 'rm -rf "$TMP"' EXIT
  BUILD=$TMP/wiki
fi
if [ -e "$BUILD" ] && [ -n "$(ls -A "$BUILD")" ]; then echo "build folder $BUILD is not empty" >&2; exit 1; fi
mkdir -p "$BUILD"
(cd "$SRC" && tar --exclude=./node_modules --exclude=./.vitepress/dist --exclude=./.vitepress/cache \
   --exclude=./tools --exclude=./.gitignore --exclude=./.dockerignore -cf - .) | (cd "$BUILD" && tar -xf -)
cd "$BUILD"
npm ci --no-audit --no-fund --loglevel=error
npx --no-install vitepress build
node "$SRC/tools/postbuild.mjs" .vitepress/dist
cd - >/dev/null
rm -rf "$OUT"; mkdir -p "$OUT"
cp -a "$BUILD/.vitepress/dist/." "$OUT/"
# The brand bar must be on every page. 404.html is an empty shell that the theme fills in
# the browser (as on the live site), so it is checked for the app script instead.
miss=$(find "$OUT" -name '*.html' ! -path "$OUT/404.html" | while read -r f; do grep -q 'class="ga-brandbar"' "$f" || echo "$f"; done)
[ -z "$miss" ] || { echo "brand bar missing: $miss" >&2; exit 1; }
grep -q '<div id="app"></div>' "$OUT/404.html" && grep -q 'src="/assets/app\.[A-Za-z0-9_-]*\.js"' "$OUT/404.html" \
  || { echo "404.html: unexpected shell" >&2; exit 1; }
find "$OUT" -name '*.html' ! -path "$OUT/404.html" | sort | sed "s#^$OUT/##; s#\$# brand bar OK#"
echo "404.html app shell OK (brand bar rendered by the theme)"
