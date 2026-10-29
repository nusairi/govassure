# GOV Assured penetration test scoping tool

A browser-based tool for scoping a penetration test: it walks through the client, targets, rules of engagement and contacts, and produces a printable scoping document. Everything stays in the browser. It is served on [scope.govassured.com](https://scope.govassured.com) from an Azure Static Web App.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`: the whole application, with its HTML, CSS and JavaScript in one file.
- `ga-theme.css`, `ga-app.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, theme, sources panel and 404 page.

## Build

From this directory:

```bash
tools/build.sh . /tmp/scope-build
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and adds `staticwebapp.config.json` from `tools/swa-config.json`. It checks that the GOV Assured brand bar is on every page. There is no compile step.

The config sets the security headers (X-Frame-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection, nosniff), a MIME type and the 404 page. It sets no Content Security Policy.

## Deploy

The build output is deployed with the SWA CLI.
