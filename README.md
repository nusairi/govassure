# GOV Assured

Consultancy site for [www.govassured.com](https://www.govassured.com). The bare `govassured.com` host forwards to `www`. The page sets out services and the tools used for that work. Every tool opens on a `govassured.com` subdomain.

The mark in `public/logo.jpg` is the official logo: a gold crown and serif wordmark on dark green. `public/wordmark.png` is a tight crop of that file for the header. Favicon, Apple touch icon, and the Open Graph image are generated from the same file.

This repository is the website. The tools it lists are hosted on their own subdomains, and their code is not copied here.

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

The script fails if a page, stylesheet, script, or `data/apps.json` points outside `*.govassured.com`. `mailto:` links are allowed, and so is the company page `https://www.linkedin.com/company/102617034`. The JSON-LD context `https://schema.org` is allowed. It also fails if those files contain a personal name, `github.com`, or `vercel.app`, or if a tool still has a `source` field. The publisher named on the site is GOV Assured.

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

The site is plain HTML, CSS, and JavaScript. There is no build step.

1. In Azure, create a Static Web App from this repository.
2. App location: `/`. Leave the API location empty. Skip the build, and leave the output location empty.
3. Add the custom domain `www.govassured.com`.
4. Point the apex `govassured.com` at the same app with a 301 to `https://www.govassured.com`. That forward is a host setting, not a rule in this repo, so the `www` site does not redirect to itself.

`staticwebapp.config.json` sets security headers, short caching for HTML and the catalogue, longer caching for images, and a 404 response that serves `404.html` with status 404.

`vercel.json` only sets the same style of security headers. Azure ignores it.

## Layout

```
index.html                 page shell
styles.css                 layout and theme
app.js                     search, category filter, and card rendering
data/apps.json             the tool catalogue
scripts/check_links.py     rejects links off *.govassured.com
public/logo.jpg            official logo
public/wordmark.png        header crop of the logo
public/favicon.ico         icon
public/apple-touch-icon.png
public/og.jpg              social preview
404.html                   not-found page
sitemap.xml                https://www.govassured.com/
robots.txt                 sitemap pointer
staticwebapp.config.json   Azure Static Web Apps headers, cache, and 404
vercel.json                unused on Azure; security headers only
```
