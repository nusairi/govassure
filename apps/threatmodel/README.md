# GOV Assured Threat Modelling Lifecycle

A 10-stage threat modelling walkthrough: Scope, Landscape, Model, Boundaries, Threats, Prioritise, Mitigate, Validate, Record and Continuous. Each stage has a short briefing, sources, term chips and a quick check. Everything stays in the browser. It is served on [threatmodel.govassured.com](https://threatmodel.govassured.com) from the Azure Static Web App `swa-govassured-threatmodel`.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`, `tm.js`, `tm-data.js`, `app.css`: the application, its behaviour and the stage, glossary and source data.
- `ds-app.css`: the shared DevSecOps-style sheet; `app.css` is this file plus `src/tm.css`.
- `src/`: templates, JSON sources, `build.py` (rebuilds the HTML, CSS, JS, robots, sitemap, manifest and SWA config) and Playwright checks.
- `ga-theme.css`, `ga-app.css`, `ga-brand.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`, `ga-404.css`: the shared GOV Assured brand bar, theme, sources panel and 404 page.

## Build

From this directory:

```bash
tools/build.sh . /tmp/threatmodel-build
tools/test.sh /tmp/threatmodel-build
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `src/`, `README.md` and `.gitignore`) and adds `staticwebapp.config.json` from `tools/swa-config.json`. It checks that the GOV Assured brand bar is on every page. There is no compile step.

The config sets the security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, nosniff), the web manifest MIME type and the 404 page.

To rebuild the generated site files from `src/`:

```bash
python3 src/build.py
```

That must leave the published files unchanged. It also writes `staticwebapp.config.json` in the app directory, byte-identical to `tools/swa-config.json`.

## Deploy

The build output is deployed with the SWA CLI.
