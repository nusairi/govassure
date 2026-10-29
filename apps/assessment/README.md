# GOV Assured CAF v4.0 Self-Assessment

A free tool for working through the [NCSC Cyber Assessment Framework (CAF) v4.0](https://www.ncsc.gov.uk/collection/caf). It covers the 4 objectives, 14 principles and 38 contributing outcomes (IGPs): for each IGP you pick Not achieved, Partially achieved (where the CAF has that level) or Achieved, and the results page summarises the scores by objective and principle. Answers are saved in the browser (`localStorage`) and can be exported as JSON (and imported again) or as a Word document; nothing is sent to a server. It is a Next.js app (Pages Router) exported as static files and served on [assessment.govassured.com](https://assessment.govassured.com) by an nginx container on Azure Container Apps.

The tool is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

This is a self-assessment only. It is not an official NCSC assessment, and GOV Assured is not affiliated with, endorsed by, or produced by NCSC, Cabinet Office, or any UK government department.

## Files

- `pages/`: `_document.js` (`<html lang="en-GB">`, the GOV.UK Frontend stylesheet link and the GOV Assured brand bar), `_app.js`, `index.js` (start, continue or import an assessment), `assessment/index.js` (the objectives and principles), `assessment/[principleId].js` (one page per principle, `/assessment/a1/` to `/assessment/d2/`, generated at build time), `results.js` (the summary and the JSON and Word exports).
- `components/Layout.js`: page title, header (with the GOV Assured LinkedIn link), phase banner and footer.
- `data/caf.js`: the CAF v4.0 objectives, principles and IGPs.
- `lib/storage.js` (browser-only state, merging an imported file, progress counts), `lib/wordExport.js` (the Word export).
- `styles/globals.css`: the app styles.
- `public/`: `govuk-frontend.min.css` and `assets/fonts/` (unchanged copies of GOV.UK Frontend 5.4.1), `favicon.svg`, `favicon.ico`, `ga-logo.png` and the shared GOV Assured `ga-theme.css`, `ga-app.css` and `ga-sources.js`.
- `next.config.mjs`: static export (`output: 'export'`, trailing slashes, unoptimised images); `NEXT_BUILD_ID` pins the build ID.
- `package.json`, `package-lock.json`: Next.js 16.2.7 (Turbopack), React 18.
- `tools/postbuild.mjs`: edits to the exported HTML after `next build`: the brand bar styles from `tools/ga-brand.css` inlined as `<style id="ga-brand">`, and links to the ga-* files at the end of `<head>` with `?v=` set to the first 10 hex digits of each file's SHA-256.
- `tools/build.sh`: copies the source to a clean build folder, runs `npm ci`, `next build` and `tools/postbuild.mjs`, copies `out/` to the output folder and checks that the brand bar is on every page.
- `tools/nginx/default.conf.template`: the nginx server block (gzip, cache policy by path, `root /sites/${SITE}`).
- `tools/nginx/assessment.conf`: this site's headers (HSTS, nosniff, X-Frame-Options, Referrer-Policy; no CSP, as on the live site), `/healthz`, clean URLs and the 404 page.
- `tools/Dockerfile`: a Node build stage, then the image (nginx-unprivileged on Alpine, port 8080, `SITE=assessment`).
- `tools/test.sh`: response checks run by the Dockerfile's `test` stage.

## Develop

```bash
npm ci
npm run dev        # http://localhost:3000
```

## Build

From this directory (needs Node.js 24 and npm):

```bash
tools/build.sh . /tmp/assessment-build                          # the site files nginx serves
docker build -f tools/Dockerfile -t govassured-assessment .     # the image
docker build -f tools/Dockerfile --target test .                # the image plus the response checks
docker run --rm -p 8080:8080 govassured-assessment              # then open http://localhost:8080/
```

### Comparing with the live files

Next.js picks a random build ID for each build. The files on assessment.govassured.com use the build ID `ARpQSJIIQF3h35iT9oHsg`. The chunk names do not depend on the build folder (builds in different folders give the same files), so only the build ID needs pinning:

```bash
docker build -f tools/Dockerfile --build-arg NEXT_BUILD_ID=ARpQSJIIQF3h35iT9oHsg -t govassured-assessment .
```

On the live site the "GOV Assured" wording was changed in the built files after the build, so the live chunk names are those of the earlier wording. Built from this source with that build ID, the output has the same 72 files; after renaming the chunks, the pages, data files, styles and app chunks are byte-identical to the live ones, and the five Turbopack runtime chunks differ only in minified variable names. The home page's assessment date field is pre-filled with the build date (it is replaced by the visitor's date in the browser).

## Changing the framework content

Edit `data/caf.js`. Each objective has principles, and each principle has its IGPs with an `id`, a `code` (such as `A1.a`), a `title`, a `description` and `hasPa` (whether the CAF defines a "Partially achieved" level). A new principle id gets its own page at the next build.

## Deploy

The image is pushed to the container registry and deployed to Azure Container Apps. The nginx image's entrypoint renders the template with `SITE=assessment` when the container starts.
