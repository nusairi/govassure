# kms.govassured.com: nginx serving the static site. Build from apps/kms:
#   docker build -f tools/Dockerfile -t govassured-kms .
# Same base, template and site config as the shared static-sites image, with only this site in it.
FROM nginxinc/nginx-unprivileged:alpine AS final
USER root
RUN apk upgrade --no-cache && rm -f /etc/nginx/conf.d/default.conf
ENV SITE=kms
COPY tools/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY tools/nginx/kms.conf /etc/nginx/site/kms.conf
COPY app.css apple-touch-icon.png aws-kms-adr-pack.md favicon.ico favicon.svg \
     ga-404.css ga-404.html ga-app.css ga-brand.css ga-logo.png ga-sources.js ga-theme.css \
     icon-192.png icon-512.png index.html kms-arch-aws.js kms-arch.js kms-compare.js \
     kms-data.js kms-glossary.js kms.js robots.txt site.webmanifest sitemap.xml /sites/kms/
RUN chown -R nginx:nginx /etc/nginx/conf.d
USER 101
RUN SITE=kms envsubst '${SITE}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -t -q && rm -f /etc/nginx/conf.d/default.conf /tmp/nginx.pid
EXPOSE 8080

# Optional: docker build -f tools/Dockerfile --target test . runs the response checks.
FROM final AS test
USER root
RUN apk add --no-cache curl
COPY tools/test.sh /test.sh
USER 101
RUN sh /test.sh
