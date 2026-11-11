# GOV Assured Key Management Lifecycle

A vendor-neutral key management lifecycle for the community: 12 stages from Plan to Compromise response, with checklists, controls, risks, an architect's pack (including an AWS KMS ADR pack) and a compare tab. It is a static site and runs entirely in the browser. It is served on [kms.govassured.com](https://kms.govassured.com) by an nginx container on Azure Container Apps.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`, `app.css`, `kms.js`, `kms-data.js`, `kms-arch.js`, `kms-arch-aws.js`, `kms-compare.js`, `kms-glossary.js`: the application, the architect's pack and the compare tab.
- `aws-kms-adr-pack.md`: the downloadable AWS KMS architecture-decision pack (served as `text/markdown; charset=utf-8`).
- `ga-theme.css`, `ga-app.css`, `ga-brand.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`, `ga-404.css`: the shared GOV Assured brand bar, theme, sources panel and 404 page.
- `src/`: the templates and scripts that can regenerate the site. A full rebuild also needs the research-arch scrapes, which are not in this tree; the committed site files are the bytes served on kms.govassured.com.
- `tools/nginx/default.conf.template`: the nginx server block (gzip, cache policy by path, `root /sites/${SITE}`).
- `tools/nginx/kms.conf`: this site's headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, CORP, nosniff), `/healthz`, the markdown type, a 404 for `/staticwebapp.config.json`, clean-URL 301s (except `/index.html` and `/ga-404.html`) and the 404 page.
- `tools/Dockerfile`: the container image (nginx-unprivileged on Alpine, port 8080, `SITE=kms`).
- `tools/test.sh`: response checks run by the Dockerfile's `test` stage.

## Build

From this directory:

```bash
tools/build.sh . /tmp/kms-build                          # the site files nginx serves
docker build -f tools/Dockerfile -t govassured-kms .     # the image
docker build -f tools/Dockerfile --target test .         # the image plus the response checks
docker run --rm -p 8080:8080 govassured-kms              # then open http://localhost:8080/
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `src/`, `README.md` and `.gitignore`) and checks that the GOV Assured brand bar is on every page. There is no compile step.

## Deploy

The image is pushed to the container registry and deployed to Azure Container Apps. The nginx image's entrypoint renders the template with `SITE=kms` when the container starts.
