# GOV Assured BLAST RADIUS: a cooperative incident response tabletop game

A cooperative tabletop incident response game for 3–7 players, built on MITRE ATT&CK®, MITRE ATLAS™, NIST SP 800-53 and the NCSC Cyber Assessment Framework. The site has the game overview, the printable cards, the rules, the design notes and the attribution page. It is static HTML and runs entirely in the browser. It is served on [tabletop.govassured.com](https://tabletop.govassured.com) by an nginx container on Azure Container Apps.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`, `cards.html`, `rules.html`, `design.html`, `attribution.html`: the pages (served on clean URLs such as `/cards`). `cards.html` carries the deck data.
- `attribution.html`: the third-party notices for MITRE ATT&CK, MITRE ATLAS, the NIST 800-53 mappings and the Open Government Licence. Keep them unchanged.
- `favicon.svg`, `robots.txt`: the site icon and the crawler file.
- `ga-theme.css`, `ga-app.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, theme, sources panel and 404 page.
- `tools/nginx/default.conf.template`: the nginx server block (gzip, cache policy by path, `root /sites/${SITE}`).
- `tools/nginx/tabletop.conf`: this site's headers (a hash-based script CSP, HSTS, nosniff, Referrer-Policy, X-Frame-Options), the `/healthz` check, clean URLs (`.html` addresses other than `index.html` redirect with a 301) and the 404 page.
- `tools/Dockerfile`: the container image (nginx-unprivileged on Alpine, port 8080, `SITE=tabletop`).
- `tools/test.sh`: response checks run by the Dockerfile's `test` stage.

The CSP allows inline scripts only by hash. If an inline `<script>` block in a page changes, update the hashes in `tools/nginx/tabletop.conf`.

## Build

From this directory:

```bash
tools/build.sh . /tmp/tabletop-build                          # the site files nginx serves
docker build -f tools/Dockerfile -t govassured-tabletop .     # the image
docker build -f tools/Dockerfile --target test .              # the image plus the response checks
docker run --rm -p 8080:8080 govassured-tabletop              # then open http://localhost:8080/
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and checks that the GOV Assured brand bar is on every page. There is no compile step.

## Deploy

The image is pushed to the container registry and deployed to Azure Container Apps. The nginx image's entrypoint renders the template with `SITE=tabletop` when the container starts.
