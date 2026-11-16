# tabletop.govassured.com: nginx serving the static site. Build from apps/tabletop:
#   docker build -f tools/Dockerfile -t govassured-tabletop .
# Same base, template and site config as the shared static-sites image, with only this site in it.
FROM nginxinc/nginx-unprivileged:alpine AS final
USER root
RUN apk upgrade --no-cache && rm -f /etc/nginx/conf.d/default.conf
ENV SITE=tabletop
COPY tools/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY tools/nginx/tabletop.conf /etc/nginx/site/tabletop.conf
COPY index.html attribution.html cards.html design.html rules.html favicon.svg robots.txt ga-404.html ga-app.css ga-logo.png ga-sources.js ga-theme.css /sites/tabletop/
RUN chown -R nginx:nginx /etc/nginx/conf.d
USER 101
RUN SITE=tabletop envsubst '${SITE}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -t -q && rm -f /etc/nginx/conf.d/default.conf /tmp/nginx.pid
EXPOSE 8080

# Optional: docker build -f tools/Dockerfile --target test . runs the response checks.
FROM final AS test
USER root
RUN apk add --no-cache curl
COPY tools/test.sh /test.sh
USER 101
RUN sh /test.sh
