#!/bin/sh
# Response checks for the ce image: status, cache policy, gzip, security headers, 404 page.
# The site sets no Content-Security-Policy (as on the live site); HSTS must appear once.
fail=0
S=/sites/ce
chk(){ # path expect_cc_regex expect_gzip(yes/no/any) expect_status
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
  [ "$hsts" != 1 ] && ok=BAD
  [ "$xfo" != 1 ] && ok=BAD
  [ $ok = BAD ] && fail=1
  echo "$ok $1 st=$st cc=[$cc] ce=[$ce] hsts=$hsts"
}
v(){ sha256sum "$S/$1" | cut -c1-10; }
SITE=ce envsubst '${SITE}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
nginx; sleep 0.5
page=$(cd $S && ls _next/static/chunks/framework-*.js | head -1)  # app/page-*.js is below gzip_min_length
css=$(cd $S && ls _next/static/css/*.css | head -1)
font=$(cd $S && ls assets/fonts/*.woff2 | head -1)
chk / "no-cache" yes 200
chk /index.html "no-cache" yes 200
chk /index.txt "no-cache" yes 200
chk /404/ "no-cache" yes 200
chk "/$page" "public, max-age=31536000, immutable" yes 200
chk "/$css" "public, max-age=31536000, immutable" yes 200
chk "/$font" "public, max-age=31536000, immutable" no 200
chk /icon.svg "public, max-age=3600, stale-while-revalidate=86400" any 200
chk /govuk-frontend.min.css "public, max-age=3600, stale-while-revalidate=86400" yes 200
chk /assessment/firewalls/ "no-cache" yes 200
chk /assessment/firewalls/index.txt "no-cache" yes 200
chk /ga-logo.png "public, max-age=3600, stale-while-revalidate=86400" no 200
chk "/ga-app.css?v=$(v ga-app.css)" "public, max-age=31536000, immutable" yes 200
chk "/ga-theme.css?v=$(v ga-theme.css)" "public, max-age=31536000, immutable" yes 200
chk "/ga-sources.js?v=$(v ga-sources.js)" "public, max-age=31536000, immutable" yes 200
chk /ga-app.css "public, max-age=3600, stale-while-revalidate=86400" yes 200
chk /healthz "no-cache" no 200
chk /nope-xyz "no-cache" yes 404
chk /404.html "no-cache" yes 404
curl -s http://127.0.0.1:8080/nope-xyz | cmp -s - $S/404.html && echo "OK 404 body is 404.html" || { echo "BAD 404 body"; fail=1; }
for t in ga-theme.css ga-app.css ga-sources.js; do grep -q "/$t?v=$(v $t)\"" $S/index.html && echo "OK index.html links $t at its sha256 version" || { echo "BAD $t version"; fail=1; }; done
nginx -s stop; sleep 0.5
rm -f /etc/nginx/conf.d/default.conf
[ $fail = 0 ] && echo ALL-TESTS-PASSED || { echo TESTS-FAILED; exit 1; }
