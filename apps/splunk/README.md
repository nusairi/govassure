# GOV Assured Splunk SABSA operating model

An interactive reference for a SABSA-aligned operating model for Splunk Core and Splunk Enterprise Security: stakeholder roles, use cases, the SABSA layer matrix and animated, clickable data and information flows. It is served on [splunk.govassured.com](https://splunk.govassured.com) from an Azure Static Web App.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`: the whole application, with its HTML, CSS and JavaScript in one file.
- `favicon.svg`: the site icon.
- `ga-theme.css`, `ga-app.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, theme, sources panel and 404 page.

## Build

From this directory:

```bash
tools/build.sh . /tmp/splunk-build
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and adds `staticwebapp.config.json` from `tools/swa-config.json`. It checks that the GOV Assured brand bar is on every page. There is no compile step.

The config sets the security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff), a one-day cache for `favicon.svg`, a MIME type and the 404 page.

## Deploy

The build output is deployed with the SWA CLI.
