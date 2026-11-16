# devsecops.govassured.com: nginx serving the static site. Build from apps/devsecops:
#   docker build -f tools/Dockerfile -t govassured-devsecops .
# Same base, template and site config as the shared static-sites image, with only this site in it.
FROM nginxinc/nginx-unprivileged:alpine AS final
USER root
RUN apk upgrade --no-cache && rm -f /etc/nginx/conf.d/default.conf
ENV SITE=devsecops
COPY tools/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY tools/nginx/devsecops.conf /etc/nginx/site/devsecops.conf
COPY index.html ga-404.html ga-app.css ga-logo.png ga-sources.js ga-theme.css og.png /sites/devsecops/
RUN chown -R nginx:nginx /etc/nginx/conf.d
USER 101
RUN SITE=devsecops envsubst '${SITE}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -t -q && rm -f /etc/nginx/conf.d/default.conf /tmp/nginx.pid
EXPOSE 8080

# Optional: docker build -f tools/Dockerfile --target test . runs the response checks.
FROM final AS test
USER root
RUN apk add --no-cache curl
COPY tools/test.sh /test.sh
USER 101
RUN sh /test.sh
