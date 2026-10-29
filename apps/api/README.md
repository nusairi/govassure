# GOV Assured API security controls matrix

An interactive reference that maps the NCSC's seven HTTP API security pillars against the UK Government Security Classifications tiers, with cumulative controls per tier, a BFF/facade overlay, a by-classification view and an escalation matrix. It is one static HTML page and runs entirely in the browser. It is served on [api.govassured.com](https://api.govassured.com) by an nginx container on Azure Container Apps.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`: the whole application, with its HTML, CSS, data and JavaScript in one file.
- `ga-theme.css`, `ga-app.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, theme, sources panel and 404 page.
- `tools/nginx/default.conf.template`: the nginx server block (gzip, cache policy by path, `root /sites/${SITE}`).
- `tools/nginx/api.conf`: this site's headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection, nosniff), the `/healthz` check, clean URLs (`.html` addresses redirect with a 301) and the 404 page.
- `tools/Dockerfile`: the container image (nginx-unprivileged on Alpine, port 8080, `SITE=api`).
- `tools/test.sh`: response checks run by the Dockerfile's `test` stage.

## Build

From this directory:

```bash
tools/build.sh . /tmp/api-build                          # the site files nginx serves
docker build -f tools/Dockerfile -t govassured-api .     # the image
docker build -f tools/Dockerfile --target test .         # the image plus the response checks
docker run --rm -p 8080:8080 govassured-api              # then open http://localhost:8080/
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and checks that the GOV Assured brand bar is on every page. There is no compile step.

## Deploy

The image is pushed to the container registry and deployed to Azure Container Apps. The nginx image's entrypoint renders the template with `SITE=api` when the container starts.
