#!/bin/sh
# Build quiz.govassured.com: <out> is the folder nginx serves as /sites/quiz.
#   tools/build.sh <src> <out>      (src = apps/quiz)
# Steps: copy the source to a clean build folder, npm ci, next build (static export),
# tools/postbuild.mjs (lang en-GB and the ga-* links), copy out/ to <out>, check the brand bar.
# Optional environment:
#   NEXT_BUILD_ID   pin the Next build ID (default: random)
#   QUIZ_BUILD_DIR  build folder (default: a new temp folder). It must not exist or be empty.
#                   Next's chunk hashes depend on this absolute path; see README.md.
set -eu
SRC=$(cd "${1:?src}" && pwd); OUT=${2:?out}
if [ -n "${QUIZ_BUILD_DIR:-}" ]; then
  BUILD=$QUIZ_BUILD_DIR
else
  TMP=$(mktemp -d)
  trap 'rm -rf "$TMP"' EXIT
  BUILD=$TMP/ai-safety-quiz
fi
if [ -e "$BUILD" ] && [ -n "$(ls -A "$BUILD")" ]; then echo "build folder $BUILD is not empty" >&2; exit 1; fi
mkdir -p "$BUILD"
(cd "$SRC" && tar --exclude=./node_modules --exclude=./.next --exclude=./out --exclude=./tools \
   --exclude=./README.md --exclude=./.gitignore --exclude=./next-env.d.ts -cf - .) | (cd "$BUILD" && tar -xf -)
cd "$BUILD"
npm ci --no-audit --no-fund --loglevel=error
NEXT_TELEMETRY_DISABLED=1 npx --no-install next build
node "$SRC/tools/postbuild.mjs" out
cd - >/dev/null
rm -rf "$OUT"; mkdir -p "$OUT"
cp -a "$BUILD/out/." "$OUT/"
find "$OUT" -type d -empty -delete
# the brand bar must be on every page
miss=$(find "$OUT" -name '*.html' | while read -r f; do grep -q 'class="ga-brandbar"' "$f" || echo "$f"; done)
[ -z "$miss" ] || { echo "brand bar missing: $miss" >&2; exit 1; }
find "$OUT" -name '*.html' | sort | sed "s#^$OUT/##; s#\$# brand bar OK#"
