# quiz.govassured.com: the Next.js static export served by nginx. Build from apps/quiz:
#   docker build -f tools/Dockerfile -t govassured-quiz .
# Same nginx base, template and site config as the shared static-sites image, with only this site in it.
# To reproduce the live files byte for byte, pass the two build args listed in README.md.
FROM node:24-alpine AS build
RUN apk add --no-cache findutils tar
WORKDIR /src
COPY . .
ARG NEXT_BUILD_ID=
ARG QUIZ_BUILD_DIR=/build/ai-safety-quiz
RUN NEXT_BUILD_ID="$NEXT_BUILD_ID" QUIZ_BUILD_DIR="$QUIZ_BUILD_DIR" sh tools/build.sh . /site

FROM nginxinc/nginx-unprivileged:alpine AS final
USER root
RUN apk upgrade --no-cache && rm -f /etc/nginx/conf.d/default.conf
ENV SITE=quiz
COPY tools/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY tools/nginx/quiz.conf /etc/nginx/site/quiz.conf
COPY --from=build /site /sites/quiz
RUN chown -R nginx:nginx /etc/nginx/conf.d
USER 101
RUN SITE=quiz envsubst '${SITE}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -t -q && rm -f /etc/nginx/conf.d/default.conf /tmp/nginx.pid
EXPOSE 8080

# Optional: docker build -f tools/Dockerfile --target test . runs the response checks.
FROM final AS test
USER root
RUN apk add --no-cache curl
COPY tools/test.sh /test.sh
USER 101
RUN sh /test.sh
