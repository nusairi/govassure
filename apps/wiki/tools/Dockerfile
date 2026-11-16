# wiki.govassured.com: the VitePress site served by nginx. Build from apps/wiki:
#   docker build -f tools/Dockerfile -t govassured-wiki .
# Same nginx base, template and site config as the shared static-sites image, with only this site in it.
FROM node:24-alpine AS build
RUN apk add --no-cache findutils tar
WORKDIR /src
COPY . .
RUN WIKI_BUILD_DIR=/build/wiki sh tools/build.sh . /site

FROM nginxinc/nginx-unprivileged:alpine AS final
USER root
RUN apk upgrade --no-cache && rm -f /etc/nginx/conf.d/default.conf
ENV SITE=wiki
COPY tools/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY tools/nginx/wiki.conf /etc/nginx/site/wiki.conf
COPY --from=build /site /sites/wiki
RUN chown -R nginx:nginx /etc/nginx/conf.d
USER 101
RUN SITE=wiki envsubst '${SITE}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -t -q && rm -f /etc/nginx/conf.d/default.conf /tmp/nginx.pid
EXPOSE 8080

# Optional: docker build -f tools/Dockerfile --target test . runs the response checks.
FROM final AS test
USER root
RUN apk add --no-cache curl
COPY tools/test.sh /test.sh
USER 101
RUN sh /test.sh
