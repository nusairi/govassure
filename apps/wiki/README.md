# GOV Assured Security Architecture Wiki

An open-source reference for enterprise security architects, engineers and students: foundations, network and application security, identity and access, cloud, data, endpoints, analytics, threat intelligence, risk and governance, and AI security. It is a VitePress site served on [wiki.govassured.com](https://wiki.govassured.com) by an nginx container on Azure Container Apps.

The wiki is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.md`: the home page (hero and section cards).
- `foundations/`, `network-security/`, `network-app-security/`, `identity-access/`, `infrastructure/`, `cloud-security/`, `data-security/`, `endpoint-device/`, `analytics/`, `threat-intelligence/`, `risk-governance/`, `ai-security/`: one folder per section, each with an `index.md` and its topic pages.
- `.vitepress/config.ts`: site title, navigation, sidebar, local search, footer and the LinkedIn link. `buildConcurrency: 1` keeps the search index in a fixed page order, so every build gives the same files.
- `.vitepress/theme/index.ts`: the default theme with the GOV Assured brand bar in the `layout-top` slot; `.vitepress/theme/custom.css`: the brand colours and the brand bar styles.
- `public/`: the crown `favicon.svg`, `favicon.ico` and `apple-touch-icon.png`, `ga-logo.png` and the shared GOV Assured `ga-theme.css`, `ga-app.css` and `ga-sources.js`.
- `package.json`, `package-lock.json`: VitePress 1.6 (Vue 3).
- `tools/postbuild.mjs`: edits to the built HTML: links to the ga-* files at the end of `<head>` with `?v=` set to the first 10 hex digits of each file's SHA-256, and one attribute order (href, target, rel, aria-label, class) on the GOV Assured LinkedIn links.
- `tools/build.sh`: copies the source to a clean build folder, runs `npm ci`, `vitepress build` and `tools/postbuild.mjs`, copies `.vitepress/dist` to the output folder and checks that the brand bar is on every page.
- `tools/nginx/default.conf.template`: the nginx server block (gzip, cache policy by path, `root /sites/${SITE}`).
- `tools/nginx/wiki.conf`: this site's headers (HSTS, nosniff, X-Frame-Options, Referrer-Policy; no CSP, as on the live site), `/healthz`, clean URLs (`/page.html` redirects to `/page`) and the 404 page. As on the live site, a section URL with a trailing slash (`/foundations/`) redirects to `/foundations/index`.
- `tools/Dockerfile`: a Node build stage, then the image (nginx-unprivileged on Alpine, port 8080, `SITE=wiki`).
- `tools/test.sh`: response checks run by the Dockerfile's `test` stage.

## Develop

```bash
npm ci
npm run dev        # http://localhost:5173
```

Add or edit Markdown pages in the section folders and add new pages to the sidebar in `.vitepress/config.ts`. See `CONTRIBUTING.md`.

## Build

From this directory (needs Node.js 24 and npm):

```bash
tools/build.sh . /tmp/wiki-build                          # the site files nginx serves
docker build -f tools/Dockerfile -t govassured-wiki .     # the image
docker build -f tools/Dockerfile --target test .          # the image plus the response checks
docker run --rm -p 8080:8080 govassured-wiki              # then open http://localhost:8080/
```

The output does not depend on the build folder or the time of the build: two builds give the same 220 files.

### Compared with the live site

The pages on wiki.govassured.com were made by editing the built files after the build (site name, people's names in the reading lists, the ga-* links). Those edits are now in this source, so a build gives the same pages and behaviour. Two things differ:

- Rollup names each JavaScript chunk by a hash of the content before the live edits, so the chunks of the 11 edited pages, and the chunks that list them (`app`, `theme`, `VPLocalSearchBox`, the search index), have different file names here. Their content is the same.
- The search index lists the same 705 sections with the same titles in the same order. On the live site it was built before the edits, so it still finds a few words that are no longer on the pages (for example some first names in the reading lists); this build indexes the text as it is now.

Apart from the search index, every file matches the live one: 128 byte for byte and 91 once the new chunk names are swapped for the live ones.

## Deploy

The image is pushed to the container registry and deployed to Azure Container Apps. The nginx image's entrypoint renders the template with `SITE=wiki` when the container starts.

## Licence

The wiki content and code are released under the MIT Licence (see `LICENSE`). The built site also contains VitePress and Vue (MIT) and the Inter font (SIL Open Font Licence 1.1), which come from the npm packages at build time and keep their own notices. MITRE ATT&CK® is a registered trademark of The MITRE Corporation; the home page says so.
