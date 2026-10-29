# GOV Assured SASE operating model

Three static pages on Secure Access Service Edge (SASE): the main SASE reference page, a defence-in-depth view of SASE controls by OSI layer, and a SASE operating model mapped to SABSA, NCSC CAF v4.0 and Secure by Design. They run entirely in the browser. They are served on [sase.govassured.com](https://sase.govassured.com) from an Azure Static Web App.

The pages are part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`: the main SASE page.
- `osi-model.html`: the OSI defence-in-depth model, served at `/osi-model`.
- `sase-operating-model.html`: the operating model, served at `/sase-operating-model`.
- `sase-og-image.png`: the social preview image.
- `ga-theme.css`, `ga-app.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, theme, sources panel and 404 page.

## Build

From this directory:

```bash
tools/build.sh . /tmp/sase-build
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and adds `staticwebapp.config.json` from `tools/swa-config.json`. It checks that the GOV Assured brand bar is on every page. There is no compile step.

The config sets the security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff), clean URLs for the two sub-pages (the `.html` addresses redirect with a 301), a MIME type and the 404 page.

## Deploy

The build output is deployed with the SWA CLI.
