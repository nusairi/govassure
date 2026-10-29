#!/bin/sh
# Response checks for the sbd image: status, cache policy, gzip, security headers, 404 page, .html redirect.
fail=0
chk(){ # path expect_cc_regex expect_gzip(yes/no/any) expect_status
  h=$(curl -s -D - -o /dev/null -H 'Accept-Encoding: gzip' "http://127.0.0.1:8080$1")
  st=$(echo "$h" | head -1 | awk '{print $2}')
  cc=$(echo "$h" | grep -i '^cache-control:' | tr -d '\r' | cut -d' ' -f2- | paste -sd';' -)
  ce=$(echo "$h" | grep -i '^content-encoding:' | tr -d '\r' | awk '{print $2}')
  csp=$(echo "$h" | grep -ic '^content-security-policy:')
  hsts=$(echo "$h" | grep -ic '^strict-transport-security:')
  ok=OK
  echo "$cc" | grep -Eq "^$2\$" || ok=BAD
  [ "$3" = yes ] && [ "$ce" != gzip ] && ok=BAD
  [ "$3" = no ] && [ -n "$ce" ] && ok=BAD
  [ "$st" != "$4" ] && ok=BAD
  [ "$csp" != 1 ] && ok=BAD
  [ "$hsts" != 1 ] && ok=BAD
  [ $ok = BAD ] && fail=1
  echo "$ok $1 st=$st cc=[$cc] ce=[$ce] csp=$csp"
}
SITE=sbd envsubst '${SITE}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
nginx; sleep 0.5
chk / "no-cache" yes 200
chk /index.html "no-cache" yes 200
chk /favicon.ico "public, max-age=3600, stale-while-revalidate=86400" yes 200
chk /apple-touch-icon.png "public, max-age=3600, stale-while-revalidate=86400" no 200
chk /favicon.svg "public, max-age=3600, stale-while-revalidate=86400" any 200
chk /ga-logo.png "public, max-age=3600, stale-while-revalidate=86400" no 200
chk "/ga-app.css?v=72c2fead5c" "public, max-age=31536000, immutable" yes 200
chk /ga-app.css "public, max-age=3600, stale-while-revalidate=86400" yes 200
chk /healthz "no-cache" no 200
chk /nope-xyz "no-cache" any 404
chk /ga-404.html "no-cache" any 404
# /ga-404 (no .html) is served by try_files with a 200, as on the live site
chk /ga-404 "no-cache" any 200
curl -s http://127.0.0.1:8080/nope-xyz | cmp -s - /sites/sbd/ga-404.html && echo "OK 404 body is ga-404.html" || { echo "BAD 404 body"; fail=1; }
l=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' http://127.0.0.1:8080/index2.html)
[ "$l" = "301 http://127.0.0.1:8080/index2" ] && echo "OK .html redirect" || { echo "BAD .html redirect: $l"; fail=1; }
nginx -s stop; sleep 0.5
rm -f /etc/nginx/conf.d/default.conf
[ $fail = 0 ] && echo ALL-TESTS-PASSED || { echo TESTS-FAILED; exit 1; }
