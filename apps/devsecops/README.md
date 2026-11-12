# GOV Assured secure software delivery: DevSecOps operating model

An interactive reference model for securing a software delivery pipeline: eight security domains, a toolchain plane, the pipeline phases mapped to the GOV.UK Secure by Design stages, pipeline gates, a BPMN process model and a dependency fault tree, aligned to NCSC CAF v4.0. It is one static HTML page and runs entirely in the browser. It is served on [devsecops.govassured.com](https://devsecops.govassured.com) by an nginx container on Azure Container Apps.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`: the whole application, with its HTML, CSS, data and JavaScript in one file.
- `og.png`: the social preview image.
- `ga-theme.css`, `ga-app.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, theme, sources panel and 404 page.
- `tools/nginx/default.conf.template`: the nginx server block (gzip, cache policy by path, `root /sites/${SITE}`).
- `tools/nginx/devsecops.conf`: this site's headers (a hash-based CSP, HSTS, nosniff, Referrer-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, Permissions-Policy, X-Frame-Options), the `/healthz` check, clean URLs (`.html` addresses other than `index.html` redirect with a 301), the `og.png` cache and cross-origin rule, and the 404 page.
- `tools/Dockerfile`: the container image (nginx-unprivileged on Alpine, port 8080, `SITE=devsecops`).
- `tools/test.sh`: response checks run by the Dockerfile's `test` stage.

The CSP allows inline code only by hash. If the inline `<script>` or `<style>` blocks in `index.html` change, update the hashes in `tools/nginx/devsecops.conf`.

## Build

From this directory:

```bash
tools/build.sh . /tmp/devsecops-build                          # the site files nginx serves
docker build -f tools/Dockerfile -t govassured-devsecops .     # the image
docker build -f tools/Dockerfile --target test .               # the image plus the response checks
docker run --rm -p 8080:8080 govassured-devsecops              # then open http://localhost:8080/
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and checks that the GOV Assured brand bar is on every page. There is no compile step.

## Deploy

The image is pushed to the container registry and deployed to Azure Container Apps. The nginx image's entrypoint renders the template with `SITE=devsecops` when the container starts.
