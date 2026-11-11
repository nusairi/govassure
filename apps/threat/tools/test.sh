#!/bin/sh
# Response checks for the threat image: static bodies, CSP and other headers, 404 page,
# /ga-404.html served as 200, and /api/groups.
set -eu
fail=0
PORT=${PORT:-8080}
BASE=http://127.0.0.1:$PORT
ROOT=${ROOT:-/app}
if [ ! -f "$ROOT/app.py" ] && [ -f ./app.py ]; then ROOT=.; fi
PUB="$ROOT/public"

if ! command -v gunicorn >/dev/null 2>&1; then
  echo "gunicorn not found"; exit 1
fi
( cd "$ROOT" && gunicorn -w 1 -b 0.0.0.0:${PORT} --timeout 60 app:app ) &
pid=$!
trap 'kill $pid 2>/dev/null || true' EXIT
i=0
while [ $i -lt 50 ]; do
  if curl -s -o /dev/null -w '%{http_code}' "$BASE/" | grep -qE '200|404'; then break; fi
  i=$((i+1)); sleep 0.1
done

chk_body(){ # path file status
  tmp=$(mktemp)
  st=$(curl -s -o "$tmp" -w '%{http_code}' "$BASE$1")
  if [ "$st" = "$3" ] && cmp -s "$tmp" "$2"; then
    echo "OK $1 body st=$st"
  else
    echo "BAD $1 body st=$st expected=$3"; fail=1
  fi
  rm -f "$tmp"
}
chk_hdr(){ # path header-name expected-regex
  val=$(curl -s -D - -o /dev/null "$BASE$1" | tr -d '\r' | grep -i "^$2:" | cut -d' ' -f2- | head -1)
  if echo "$val" | grep -Eq "$3"; then
    echo "OK $1 $2"
  else
    echo "BAD $1 $2=[$val] expected $3"; fail=1
  fi
}

chk_body / "$PUB/index.html" 200
chk_body /index.html "$PUB/index.html" 200
chk_body /ga-404.html "$PUB/ga-404.html" 200
chk_body /nope-xyz "$PUB/ga-404.html" 404
chk_body /healthz "$PUB/ga-404.html" 404
chk_body /favicon.ico "$PUB/favicon.ico" 200
chk_body /favicon.svg "$PUB/favicon.svg" 200
chk_body /apple-touch-icon.png "$PUB/apple-touch-icon.png" 200
chk_body /ga-theme.css "$PUB/ga-theme.css" 200
chk_body /ga-app.css "$PUB/ga-app.css" 200
chk_body /ga-sources.js "$PUB/ga-sources.js" 200
chk_body /ga-logo.png "$PUB/ga-logo.png" 200
chk_body /css/style.css "$PUB/css/style.css" 200
chk_body /js/app.js "$PUB/js/app.js" 200
chk_body /sample/dettect_sample.yaml "$PUB/sample/dettect_sample.yaml" 200

for p in / /nope-xyz /js/app.js; do
  chk_hdr "$p" 'content-security-policy' "default-src 'self'"
  chk_hdr "$p" 'strict-transport-security' 'max-age=63072000; includeSubDomains; preload'
  chk_hdr "$p" 'x-content-type-options' 'nosniff'
  chk_hdr "$p" 'x-frame-options' 'DENY'
  chk_hdr "$p" 'referrer-policy' 'strict-origin-when-cross-origin'
  chk_hdr "$p" 'permissions-policy' 'geolocation=\(\), microphone=\(\), camera=\(\)'
done

st=$(curl -s -o /tmp/ga-groups -w '%{http_code}' "$BASE/api/groups")
if [ "$st" = 200 ] && grep -q '"id"' /tmp/ga-groups; then
  echo "OK /api/groups st=$st size=$(wc -c < /tmp/ga-groups)"
else
  echo "BAD /api/groups st=$st"; fail=1
fi

kill $pid 2>/dev/null || true
trap - EXIT
wait $pid 2>/dev/null || true
[ $fail = 0 ] && echo ALL-TESTS-PASSED || { echo TESTS-FAILED; exit 1; }
