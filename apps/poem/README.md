# GOV Assured cyber poem

"Social Engineering", a short poem about phishing, the cyber kill chain and the human element. It is served on [poem.govassured.com](https://poem.govassured.com) from an Azure Static Web App.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`: the poem page, with its styles inline.
- `favicon.svg`: the site icon.
- `ga-theme.css`, `ga-app.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, theme, sources panel and 404 page.

## Build

From this directory:

```bash
tools/build.sh . /tmp/poem-build
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and adds `staticwebapp.config.json` from `tools/swa-config.json`. It checks that the GOV Assured brand bar is on every page. There is no compile step.

The config only sets the 404 page and a MIME type. It sets no security headers of its own; the response headers on the live site are the Azure Static Web Apps defaults.

## Deploy

The build output is deployed with the SWA CLI.
