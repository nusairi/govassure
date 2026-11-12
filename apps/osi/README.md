# OSI Security Rings

An OSI model reference of protocols and security technologies by layer, with a hardware security lifecycle tutorial and an unlisted hardware assurance checklist. It is served on [osi.govassured.com](https://osi.govassured.com) from the Azure Static Web App `swa-govassured-osi`.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`, `app.js`, `app.css`, `data.js`, `hw-cards.js`: the rings page and the Layer 0 hardware pop-ups.
- `tutorial.html`, `tutorial.js`, `tutorial.css`, `tutorial-data.js`: the hardware security lifecycle tutorial.
- `checklist.html`, `checklist.js`, `checklist.css`, `checklist-data.js`: the unlisted hardware assurance checklist.
- `downloads/hardware-assurance-checklist.xlsx`: the offline assessment workbook served from the checklist page.
- `tools/`: the SWA config, the build script, an optional cache-bust helper, and the workbook generator (`build_workbook.py`). These are not published.

The checklist is intentionally unlisted: it is not in `sitemap.xml` or `robots.txt`, and it is not linked from the rings page, the tutorial, or [www.govassured.com](https://www.govassured.com). The page includes `<meta name="robots" content="noindex,nofollow">`.

## Build

From this directory:

```bash
tools/build.sh . /tmp/osi-build
tools/test.sh /tmp/osi-build
```

`tools/build.sh` copies the files from `<src>` to `<out>` (leaving out `tools/`, `README.md`, `.gitignore`, `shots/` and stray download files) and adds `staticwebapp.config.json` from `tools/swa-config.json`. The HTML already carries the cache-bust query strings used on the live site (a mix of content hashes and release tags such as `hwcard3`). The build does not rewrite them, so the output stays byte-identical to the live pages.

The config sets the security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, nosniff), the clean URLs for `/tutorial`, `/checklist` and `/og`, the web manifest and Excel MIME types, and the 404 page.

The workbook in `downloads/` is the file served on the live site. To regenerate it from `checklist-data.js` after a future data change (the `.xlsx` zip is not bit-for-bit reproducible):

```bash
python3 tools/build_workbook.py
```

## Deploy

The build output is deployed with the SWA CLI.
