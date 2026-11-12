# GOV Assured human cyber impact framework

A reference framework of the cyber harms that affect people: each attack type has a code, a definition, the attacker's goal and vector, the human impact, and a link to the matching recovery guide. It runs entirely in the browser, with a light and dark theme. It is served on [framework.govassured.com](https://framework.govassured.com) from an Azure Static Web App.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`: the whole application, with its HTML, CSS, data and JavaScript in one file.
- `ga-theme.css`, `ga-app.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, theme, sources panel and 404 page.

## Build

From this directory:

```bash
tools/build.sh . /tmp/framework-build
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and adds `staticwebapp.config.json` from `tools/swa-config.json`. It checks that the GOV Assured brand bar is on every page. There is no compile step.

The config sets the security headers (X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff), a no-cache rule for the page itself, a MIME type and the 404 page.

## Deploy

The build output is deployed with the SWA CLI.
