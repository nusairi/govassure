# OSI Security Rings

An OSI model reference of protocols and security technologies by layer, with a hardware security lifecycle tutorial and an unlisted hardware assurance checklist. It is served on [osi.govassured.com](https://osi.govassured.com) from the Azure Static Web App `swa-govassured-osi`.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`, `app.js`, `app.css`, `data.js`, `hw-cards.js`: the rings page and the Layer 0 hardware pop-ups.
- `tutorial.html`, `tutorial.js`, `tutorial.css`, `tutorial-data.js`: the hardware security lifecycle tutorial.
- `checklist.html`, `checklist.js`, `checklist.css`, `checklist-data.js`: the unlisted hardware assurance checklist.
- `downloads/hardware-assurance-checklist.xlsx`: the offline assessment workbook served from the checklist page.
- `matrix.html`, `matrix.js`, `matrix.css`, `matrix-data.js`: the unlisted protection matrix workshop page at `/matrix` (one row per ring, L0 to L8, generic examples marked "Example:", saved only in the browser, CSV export/import, presenter mode, landscape print). It reuses layer names, colours and threats from `data.js`.
- `rings-puzzle.html`, `rings-puzzle.js`, `rings-puzzle.css`: the “Which Ring?” team puzzle at `/rings-puzzle`, linked from the rings page. Each round uses one existing OSI card per layer.
- `game.html`, `game.js`, `game.css`, `game-data.js`: the unlisted workshop game "Guard the building" at `/matrix/game` (two rounds: which layer, which tool; team scores saved only in the browser).
- `our-tools.js`: "Our tools", tools the user types in (any vendor), saved only in the browser, with JSON/CSV export and import and quick-add suggestions; used by the matrix picker, the tool list (`tools-page.js`) and the game.
- `tools.html` and `ms-tools.js`: the unlisted handout "Which tool covers what" at `/matrix/tools` (Microsoft security tools commonly used at each layer, with Microsoft Learn links). `ms-tools.js` is shared by the matrix tool picker and the game.
- `tools/`: the SWA config, the build script, an optional cache-bust helper, the workbook generator (`build_workbook.py`), and Playwright checks for the matrix, game and tool list (`e2e.js`, `game-e2e.js`, `ourtools-e2e.js`, plus `serve.py`). These are not published.

The checklist, the matrix, the game and the tool list are intentionally unlisted: it is not in `sitemap.xml` or `robots.txt`, and it is not linked from the rings page, the tutorial, or [www.govassured.com](https://www.govassured.com). All of these pages include `<meta name="robots" content="noindex,nofollow">`.

## Build

From this directory:

```bash
tools/build.sh . /tmp/osi-build
tools/test.sh /tmp/osi-build
```

`tools/build.sh` copies the files from `<src>` to `<out>` (leaving out `tools/`, `README.md`, `.gitignore`, `shots/` and stray download files) and adds `staticwebapp.config.json` from `tools/swa-config.json`. The HTML already carries the cache-bust query strings used on the live site (a mix of content hashes and release tags such as `hwcard3`). The build does not rewrite them, so the output stays byte-identical to the live pages.

The config sets the security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, nosniff), the clean URLs for `/tutorial`, `/checklist`, `/matrix`, `/matrix/game`, `/matrix/tools` and `/og`, the web manifest and Excel MIME types, and the 404 page.

The workbook in `downloads/` is the file served on the live site. To regenerate it from `checklist-data.js` after a future data change (the `.xlsx` zip is not bit-for-bit reproducible):

```bash
python3 tools/build_workbook.py
```


## Browser checks

These Playwright scripts are not run by GitHub Actions. After a build, from this directory, with `playwright-core` available:

```bash
python3 tools/serve.py /tmp/osi-build &
node tools/e2e.js http://127.0.0.1:18431 /tmp/osi-matrix-shots
node tools/game-e2e.js http://127.0.0.1:18431 /tmp/osi-matrix-shots
node tools/ourtools-e2e.js http://127.0.0.1:18431 /tmp/osi-matrix-shots
```

## Deploy

The build output is deployed with the SWA CLI.
