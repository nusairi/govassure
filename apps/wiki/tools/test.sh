#!/bin/sh
# Response checks for the wiki image: status, cache policy, gzip, security headers, 404 page.
# The site sets no Content-Security-Policy (as on the live site); HSTS must appear once.
fail=0
S=/sites/wiki
chk(){ # path expect_cc_regex expect_gzip(yes/no/any) expect_status [expect_location]
  h=$(curl -s -D - -o /dev/null -H 'Accept-Encoding: gzip' "http://127.0.0.1:8080$1")
  st=$(echo "$h" | head -1 | awk '{print $2}')
  cc=$(echo "$h" | grep -i '^cache-control:' | tr -d '\r' | cut -d' ' -f2- | paste -sd';' -)
  ce=$(echo "$h" | grep -i '^content-encoding:' | tr -d '\r' | awk '{print $2}')
  hsts=$(echo "$h" | grep -ic '^strict-transport-security:')
  xfo=$(echo "$h" | grep -ic '^x-frame-options:')
  ok=OK
  echo "$cc" | grep -Eq "^$2\$" || ok=BAD
  [ "$3" = yes ] && [ "$ce" != gzip ] && ok=BAD
  [ "$3" = no ] && [ -n "$ce" ] && ok=BAD
  [ "$st" != "$4" ] && ok=BAD
  loc=$(echo "$h" | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
  [ -n "${5:-}" ] && [ "$loc" != "$5" ] && ok=BAD
  [ "$hsts" != 1 ] && ok=BAD
  [ "$xfo" != 1 ] && ok=BAD
  [ $ok = BAD ] && fail=1
  echo "$ok $1 st=$st cc=[$cc] ce=[$ce] hsts=$hsts${loc:+ location=$loc}"
}
v(){ sha256sum "$S/$1" | cut -c1-10; }
SITE=wiki envsubst '${SITE}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
nginx; sleep 0.5
fw=$(cd $S && ls assets/chunks/framework.*.js | head -1)
app=$(cd $S && ls assets/app.*.js | head -1)
css=$(cd $S && ls assets/style.*.css | head -1)
font=$(cd $S && ls assets/inter-roman-latin.*.woff2 | head -1)
chk / "no-cache" yes 200
chk /index.html "no-cache" yes 200
chk /foundations/zero-trust-principles "no-cache" yes 200
chk /foundations/zero-trust-principles.html "no-cache" any 301 /foundations/zero-trust-principles
chk /foundations/index "no-cache" yes 200
# existing live behaviour, kept: a section URL with a trailing slash redirects to /<section>/index
chk /foundations/ "no-cache" any 301 /foundations/index
chk "/$fw" "public, max-age=31536000, immutable" yes 200
chk "/$app" "public, max-age=31536000, immutable" yes 200
chk "/$css" "public, max-age=31536000, immutable" yes 200
chk "/$font" "public, max-age=31536000, immutable" no 200
chk /hashmap.json "no-cache" any 200
chk /vp-icons.css "public, max-age=3600, stale-while-revalidate=86400" any 200
chk /favicon.svg "public, max-age=3600, stale-while-revalidate=86400" any 200
chk /ga-logo.png "public, max-age=3600, stale-while-revalidate=86400" no 200
chk "/ga-app.css?v=$(v ga-app.css)" "public, max-age=31536000, immutable" yes 200
chk "/ga-theme.css?v=$(v ga-theme.css)" "public, max-age=31536000, immutable" yes 200
chk "/ga-sources.js?v=$(v ga-sources.js)" "public, max-age=31536000, immutable" yes 200
chk /ga-theme.css "public, max-age=3600, stale-while-revalidate=86400" yes 200
chk /healthz "no-cache" no 200
chk /nope-xyz "no-cache" yes 404
chk /404.html "no-cache" yes 404
curl -s http://127.0.0.1:8080/nope-xyz | cmp -s - $S/404.html && echo "OK 404 body is 404.html" || { echo "BAD 404 body"; fail=1; }
for t in ga-theme.css ga-app.css ga-sources.js; do grep -q "/$t?v=$(v $t)\"" $S/index.html && echo "OK index.html links $t at its sha256 version" || { echo "BAD $t version"; fail=1; }; done
nginx -s stop; sleep 0.5
rm -f /etc/nginx/conf.d/default.conf
[ $fail = 0 ] && echo ALL-TESTS-PASSED || { echo TESTS-FAILED; exit 1; }
