# assessment.govassured.com: the Next.js static export served by nginx. Build from apps/assessment:
#   docker build -f tools/Dockerfile -t govassured-assessment .
# Same nginx base, template and site config as the shared static-sites image, with only this site in it.
# To reproduce the live build ID, pass NEXT_BUILD_ID (see README.md).
FROM node:24-alpine AS build
RUN apk add --no-cache findutils tar
WORKDIR /src
COPY . .
ARG NEXT_BUILD_ID=
ARG ASSESSMENT_BUILD_DIR=/build/cyber-assessment
RUN NEXT_BUILD_ID="$NEXT_BUILD_ID" ASSESSMENT_BUILD_DIR="$ASSESSMENT_BUILD_DIR" sh tools/build.sh . /site

FROM nginxinc/nginx-unprivileged:alpine AS final
USER root
RUN apk upgrade --no-cache && rm -f /etc/nginx/conf.d/default.conf
ENV SITE=assessment
COPY tools/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY tools/nginx/assessment.conf /etc/nginx/site/assessment.conf
COPY --from=build /site /sites/assessment
RUN chown -R nginx:nginx /etc/nginx/conf.d
USER 101
RUN SITE=assessment envsubst '${SITE}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -t -q && rm -f /etc/nginx/conf.d/default.conf /tmp/nginx.pid
EXPOSE 8080

# Optional: docker build -f tools/Dockerfile --target test . runs the response checks.
FROM final AS test
USER root
RUN apk add --no-cache curl
COPY tools/test.sh /test.sh
USER 101
RUN sh /test.sh
