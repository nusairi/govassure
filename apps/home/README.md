# GOV Assured home

The GOV Assured landing page for UK public-sector cyber assurance. It is served on [home.govassured.com](https://home.govassured.com) from the Azure Static Web App `swa-govassured-home`.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Build

From this directory:

```bash
tools/build.sh . /tmp/home-build
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `art/`, `README.md` and `.gitignore`) and adds `staticwebapp.config.json` from `tools/swa-config.json`. It then checks that every inline style is allowed by a hash in the Content Security Policy and that the GOV Assured brand bar is on every page. There is no compile step. `index.html` uses fixed `?v=` versions for `home.css`, `home-layout.css`, `home-nojs.css` and `home.js`. Raise the number when you change one of those files.

## Deploy

The build output is deployed with the SWA CLI.

## Images

The illustrations in `img/` are original artwork. `art/gen.js` writes the SVG sources and `art/raster.js` renders them to AVIF, WebP and JPEG in `img/`. Run both from `art/`; `raster.js` needs `sharp`. Rendering again with a different `sharp` version may not give byte-identical files.
