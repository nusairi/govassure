# GOV Assured Secure by Design Statement of Applicability generator

An interactive generator for a Secure by Design Statement of Applicability: it maps NIST SP 800-53 Rev. 5 and NIST CSF 2.0 controls to the GOV.UK Secure by Design principles and activities and the NCSC Cyber Assessment Framework, and exports the result. It is one static HTML page and runs entirely in the browser. It is served on [sbd.govassured.com](https://sbd.govassured.com) by an nginx container on Azure Container Apps.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`: the whole application, with its HTML, CSS, control data and JavaScript in one file. The sources and licences note in the page is unchanged.
- `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`: the site icons.
- `ga-theme.css`, `ga-app.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, theme, sources panel and 404 page.
- `tools/nginx/default.conf.template`: the nginx server block (gzip, cache policy by path, `root /sites/${SITE}`).
- `tools/nginx/sbd.conf`: this site's headers (CSP, HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy), the `/healthz` check, clean URLs (`.html` addresses other than `index.html` redirect with a 301) and the 404 page.
- `tools/Dockerfile`: the container image (nginx-unprivileged on Alpine, port 8080, `SITE=sbd`).
- `tools/test.sh`: response checks run by the Dockerfile's `test` stage.

## Build

From this directory:

```bash
tools/build.sh . /tmp/sbd-build                          # the site files nginx serves
docker build -f tools/Dockerfile -t govassured-sbd .     # the image
docker build -f tools/Dockerfile --target test .         # the image plus the response checks
docker run --rm -p 8080:8080 govassured-sbd              # then open http://localhost:8080/
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and checks that the GOV Assured brand bar is on every page. There is no compile step.

## Deploy

The image is pushed to the container registry and deployed to Azure Container Apps. The nginx image's entrypoint renders the template with `SITE=sbd` when the container starts.
