# GOV Assured CE Readiness

A free tool that helps UK organisations prepare for [Cyber Essentials](https://www.ncsc.gov.uk/cyberessentials/overview) certification. It walks through the five control areas (firewalls, secure configuration, user access control, malware protection, patch management) with plain-English questions, guidance and remediation advice, then shows a summary per area. Answers stay in the browser (`localStorage`); nothing is sent to a server. It is a Next.js app exported as static files and served on [ce.govassured.com](https://ce.govassured.com) by an nginx container on Azure Container Apps.

The tool is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

This is a self-assessed readiness indicator only. It is not an official Cyber Essentials assessment and does not give or guarantee certification; that comes from an IASME-accredited certification body. "Cyber Essentials" is a registered trademark of DSIT; the tool is not affiliated with or endorsed by NCSC, IASME or DSIT. The question content is based on the NCSC Cyber Essentials technical requirements, published under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), and the original project was released under the same licence.

## Files

- `app/`: the App Router pages. `layout.tsx` has the metadata, the GOV.UK Frontend stylesheet link, the GOV Assured brand bar and the phase banner; `page.tsx` is the landing page; `assessment/page.tsx` the overview; `assessment/[section]/page.tsx` generates the five section pages at build time and renders `SectionClient.tsx` (the question wizard); `results/page.tsx` the results; `accessibility/page.tsx` the accessibility statement; `globals.css` (with the brand bar styles) and `icon.svg`.
- `components/`: `GovHeader.tsx` and `GovFooter.tsx` (with the GOV Assured LinkedIn link).
- `context/AssessmentContext.tsx`, `lib/`: the browser-only state and the results calculation.
- `data/questions.ts`: the question bank.
- `public/`: `govuk-frontend.min.css` and `assets/fonts/` (unchanged copies from the `govuk-frontend` 5.4.0 npm package), `ga-logo.png` and the shared GOV Assured `ga-theme.css`, `ga-app.css` and `ga-sources.js`.
- `next.config.mjs`: static export (`output: 'export'`, trailing slashes, unoptimised images); `NEXT_BUILD_ID` pins the build ID.
- `package.json`, `package-lock.json`: Next.js 14.2.5, React 18, TypeScript.
- `tools/postbuild.mjs`: edits to the exported HTML after `next build`: `<html lang="en-GB">`; links to the ga-* files at the end of `<head>` with `?v=` set to the first 10 hex digits of each file's SHA-256; one attribute order (href, target, rel, aria-label, class) on the GOV Assured LinkedIn links.
- `tools/build.sh`: copies the source to a clean build folder, runs `npm ci`, `next build` and `tools/postbuild.mjs`, copies `out/` to the output folder and checks that the brand bar is on every page.
- `tools/nginx/default.conf.template`: the nginx server block (gzip, cache policy by path, `root /sites/${SITE}`).
- `tools/nginx/ce.conf`: this site's headers (HSTS, nosniff, X-Frame-Options, Referrer-Policy; no CSP, as on the live site), `/healthz`, clean URLs and the 404 page.
- `tools/Dockerfile`: a Node build stage, then the image (nginx-unprivileged on Alpine, port 8080, `SITE=ce`).
- `tools/test.sh`: response checks run by the Dockerfile's `test` stage.

## Develop

```bash
npm ci
npm run dev        # http://localhost:3000
```

## Build

From this directory (needs Node.js 24 and npm):

```bash
tools/build.sh . /tmp/ce-build                          # the site files nginx serves
docker build -f tools/Dockerfile -t govassured-ce .     # the image
docker build -f tools/Dockerfile --target test .        # the image plus the response checks
docker run --rm -p 8080:8080 govassured-ce              # then open http://localhost:8080/
```

### Reproducing the live files exactly

Next.js names its JavaScript chunks by content hashes that depend on the absolute path of the build folder, and it picks a random build ID. The files on ce.govassured.com were built in `/workspace/p2/ce-readiness` with the build ID `QU0z-jtJQu7j5cfhTsQtZ`. With the same two values the output is byte-identical to the live site (51 files):

```bash
docker build -f tools/Dockerfile --build-arg NEXT_BUILD_ID=QU0z-jtJQu7j5cfhTsQtZ \
  --build-arg CE_BUILD_DIR=/workspace/p2/ce-readiness -t govassured-ce .
```

Any other folder gives the same pages, styles and behaviour, with different chunk file names.

## Changing questions

Edit `data/questions.ts`. Each section has an `id`, a `slug` (its URL under `/assessment/`), a title, a description, an NCSC reference and its questions; each question has an `id`, the question `text`, `guidance`, the answer that passes (`passCondition`), `remediationGuidance` and a `weight` (`critical` or `standard`). A new section slug gets its own page at the next build.

## Deploy

The image is pushed to the container registry and deployed to Azure Container Apps. The nginx image's entrypoint renders the template with `SITE=ce` when the container starts.
