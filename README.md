# GOV Assured

Community site for [www.govassured.com](https://www.govassured.com). The bare `govassured.com` host forwards to `www`. The home page opens with the threat dashboard, then a link to the UK government map; the tools are listed on `/apps`. Every tool opens on a `govassured.com` subdomain.

The mark in `public/logo.jpg` is the official logo: a gold crown and serif wordmark on dark green. `public/wordmark.png` is a tight crop of that file for the header. The crown favicons (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png` at the site root) are the same set every app serves; the Open Graph image is generated from the logo.

This repository is the website. The tools it lists are hosted on their own subdomains. Their source code is being moved into `apps/<name>/`, one app at a time; it is never published on `www`.

## Contact address

`contact@govassured.com` in the contact section is a **placeholder**. Confirm the address before the site goes live.

## Run locally

Any static file server works. From this directory:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

Fetching `data/apps.json` needs HTTP. Opening `index.html` directly from the filesystem will not load the tool list.

## Check links

```bash
python3 scripts/check_links.py
```

The script fails if a served page, stylesheet, script, or data file points outside `*.govassured.com`. `mailto:` links are allowed. The other allowed web addresses are the company LinkedIn page `https://www.linkedin.com/company/102617034`, the company repository `https://github.com/nusairi/govassure`, the JSON-LD context `https://schema.org`, official UK government and Parliament source pages used by the government map (`gov.uk`, `parliament.uk`, and a short list of named independent bodies such as the National Audit Office), and US federal hosts whose name is `gov` or ends with `.gov`. A host such as `example.gov.evil.com` is not a `.gov` host. Query strings and fragments are still rejected on those official links. Any other GitHub address fails the check. It also fails if those files contain a personal name or `vercel.app`, or if a tool still has a `source` field. The publisher named on the site is GOV Assured.

`/security-vendor-origins/` is a noindex preview of where 130 cybersecurity vendors were founded, who owns them, and which government actions name them. It is not in the nav, the home page, `/apps`, or `sitemap.xml`. Official government sources on that page are live links. Every other source is a reference code (R1, R2, …) plus a host and path label in the Sources note, never a URL. Rebuild the page data with `python3 scripts/build_security_vendors.py`. The research file stays under `scripts/` and is not copied by `scripts/build.sh`.

## Add a tool

Edit `data/apps.json` and append an object to the `apps` array. Cards appear in file order, inside their category. Use a `govassured.com` address. Do not add a `source` field or any other external URL.

```json
{
  "id": "short-id",
  "name": "Name shown on the card",
  "description": "One or two sentences taken from the tool’s own page.",
  "category": "govassure",
  "language": "TypeScript",
  "repo": "repository-name",
  "url": "https://tools.govassured.com"
}
```

`category` is one of:

| Value | Group |
| --- | --- |
| `govassure` | GovAssure |
| `cyberassure` | CyberAssure |
| `other` | Practice and monitoring |

Write the description from the tool’s own page. If that page does not say what it does, keep the description to the name and leave out guessed features.

## Deploy on Azure Static Web Apps

The site is plain HTML, CSS, and JavaScript. `scripts/build.sh` assembles the deploy folder from an explicit list of hub files:

```bash
scripts/build.sh /tmp/www-build
swa deploy /tmp/www-build/app --api-location /tmp/www-build/api --env production
```

Do not deploy the repository root. Source code for the subdomain apps lives under `apps/<name>/` and is built and deployed separately. Only `apps/index.html` (the directory page) belongs to the hub. The build stops if anything else under `apps/` reaches the output.

1. Add the custom domain `www.govassured.com` to the Static Web App.
2. Point the apex `govassured.com` at the same app with a 301 to `https://www.govassured.com`. That forward is a host setting, not a rule in this repo, so the `www` site does not redirect to itself.

`staticwebapp.config.json` sets security headers, short caching for HTML and the catalogue, longer caching for images, and a 404 response that serves `404.html` with status 404.

`vercel.json` only sets the same style of security headers. Azure ignores it.

## Tests

From the repository root:

```bash
# Link and wording checks (also run by scripts/build.sh)
python3 scripts/check_links.py

# Data snapshots
python3 scripts/test_govmap_data.py
python3 scripts/test_budget.py          # needs openpyxl, to read the PESA workbook
python3 scripts/test_glossary_terms.py

# API unit tests (Node 18+, no extra packages)
node api/shared/_rss.test.js
node api/shared/_outages.test.js
node api/shared/_outagenews.test.js
node api/shared/_govstatus.test.js
node api/shared/_govpubs.test.js
node api/shared/_cisa-alerts.test.js
node api/shared/_news.test.js
```

Browser checks live in `tools/e2e-*.js`. They use Playwright and a static server for the hub files:

```bash
python3 -m http.server 8000
cd tools && npm install
B=http://127.0.0.1:8000 SHOTS=./shots node e2e-home-govmap.js
```

Set `B` to the URL under test. Screenshots are written to `SHOTS` and are not committed.

## Refresh the government map data

```bash
python3 scripts/build_security_vendors.py       # preview data for /security-vendor-origins/
python3 scripts/build_govmap.py                  # from the GOV.UK APIs (OGL v3.0)
python3 scripts/build_budget.py                  # from scripts/vendor/PESA_2026_CP_Chapter_1_tables.xlsx
python3 scripts/build_glossary.py                # rebuilds the glossary page from the term list
python3 scripts/bust_govmap.py                   # refresh ?v= hashes on govmap pages
```

`data/govmap.json` is a snapshot of GOV.UK organisations. `data/budget.json` is built from the Treasury's Public Expenditure Statistical Analyses 2026 Chapter 1 tables (Open Government Licence). The Accountable to Parliament figures in `data/parliament.json` come from each body's 2026-27 Main Estimate or equivalent, with source links on the page. Do not invent amounts.

## Layout

```
index.html                 home page shell (threat dashboard, then the map tile)
apps/index.html            the /apps tool directory
govmap/                    government map, charts, glossary, Parliament and budget pages
govmap.js, govmap.css      map tree, diagram and shared chrome
govmap-*.js, govmap-*.css  charts, glossary tooltips, Parliament and budget views
styles.css                 layout and theme
app.js                     search, category filter, and card rendering
live.js, live.css          threat dashboard and outage / publication panels (feeds from api/)
api/                       Azure Functions behind the dashboard feeds
data/apps.json             the tool catalogue
data/govmap.json           GOV.UK organisations snapshot (OGL v3.0)
data/budget.json           department budget shares from PESA 2026 (OGL v3.0)
data/parliament.json       bodies accountable to Parliament
data/govmap-glossary.json, data/govmap-terms.json
favicon.ico, favicon.svg   crown favicons (site root)
apple-touch-icon.png       crown touch icon (site root)
scripts/build.sh           builds the deploy folder from an allowlist
scripts/check_links.py     rejects links off *.govassured.com (UK official hosts and US federal .gov)
scripts/build_security_vendors.py  page data for the origins preview
security-vendor-origins/       noindex preview of vendor origin and ownership
security-vendor-origins.js     filters, table and reference codes
security-vendor-origins.css    page styles, scoped off the shared chrome
scripts/build_govmap.py    refresh data/govmap.json from GOV.UK
scripts/build_budget.py    refresh data/budget.json from the PESA workbook
scripts/build_glossary.py  rebuild the glossary page
scripts/bust_govmap.py     cache-bust govmap assets
scripts/test_*.py          data tests
scripts/vendor/            official PESA workbook
tools/                     Playwright browser checks
public/logo.jpg            official logo
public/wordmark.png        header crop of the logo
public/favicon.ico         icon
public/apple-touch-icon.png
public/og.jpg              social preview
404.html                   not-found page
sitemap.xml                https://www.govassured.com/ and /govmap/ pages
robots.txt                 sitemap pointer
staticwebapp.config.json   Azure Static Web Apps headers, cache, and 404
vercel.json                unused on Azure; security headers only
```
