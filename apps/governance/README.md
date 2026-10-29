# GOV Assured governance review tool

A browser-based tool for running a cyber security governance review: it scores the governance areas, records evidence and actions, and exports the review as a Word document. Everything stays in the browser. It is served on [governance.govassured.com](https://governance.govassured.com) from an Azure Static Web App.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`: the whole application, with its HTML, CSS and JavaScript in one file.
- `vendor/docx-8.5.0.umd.js`: the docx 8.5.0 library (MIT licence), used for the Word export. It is `build/index.umd.js` from the npm package, unchanged, served from this site rather than a CDN.
- `ga-theme.css`, `ga-app.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, theme, sources panel and 404 page.

## Build

From this directory:

```bash
tools/build.sh . /tmp/governance-build
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and adds `staticwebapp.config.json` from `tools/swa-config.json`. It checks that the GOV Assured brand bar is on every page. There is no compile step.

The config sets the security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection, nosniff), a MIME type and the 404 page.

To check the vendored library against npm:

```bash
npm pack docx@8.5.0 && tar -xzOf docx-8.5.0.tgz package/build/index.umd.js | cmp - vendor/docx-8.5.0.umd.js && rm docx-8.5.0.tgz
```

## Deploy

The build output is deployed with the SWA CLI.
