# OSI Security Rings

An OSI model reference of protocols and security technologies by layer. It is served on [osi.govassured.com](https://osi.govassured.com) from the Azure Static Web App `swa-govassured-osi`.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Build

From this directory:

```bash
tools/build.sh . /tmp/osi-build
```

`tools/build.sh` copies the files from `<src>` to `<out>` (leaving out `tools/`, `README.md` and `.gitignore`), adds `staticwebapp.config.json` from `tools/swa-config.json`, and content-hashes the CSS and JS references.

## Deploy

The build output is deployed with the SWA CLI.
