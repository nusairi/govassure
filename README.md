# GOV Assured

The directory at [govassured.com](https://govassured.com) for the apps published by [Jonathan Silvester](https://github.com/jontever). The page groups them into GovAssure, CyberAssure, and learning and other projects. Each card links to the live app and its GitHub repository.

The mark in `public/logo.jpg` is the official logo: a gold crown and serif wordmark on dark green. `public/wordmark.png` is a tight crop of that file for the header. Favicon, Apple touch icon, and the Open Graph image are generated from the same file.

This repository does not contain those apps. It only links to them.

`gitops-certification-examples` is omitted on purpose: it is a fork of certification examples, not a published app.

## Run locally

Any static file server works. From this directory:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

Fetching `data/apps.json` needs HTTP. Opening `index.html` directly from the filesystem will not load the catalogue.

## Add an app

Edit `data/apps.json` and append an object to the `apps` array. Cards appear in file order, inside their category.

```json
{
  "id": "short-id",
  "name": "Name shown on the card",
  "description": "One or two sentences taken from the project's own README or page.",
  "category": "govassure",
  "language": "TypeScript",
  "repo": "repository-name",
  "url": "https://example.com",
  "source": "https://github.com/jontever/repository-name"
}
```

`category` is one of:

| Value | Group |
| --- | --- |
| `govassure` | GovAssure |
| `cyberassure` | CyberAssure |
| `other` | Learning & other projects |

Write the description from the project's README, `index` page, or `package.json`. If those do not say what the app does, keep the description to the name and leave out guessed features.

## Deploy on Vercel

The site is plain HTML, CSS, and JavaScript. Vercel serves it with no build step.

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Framework preset: **Other**. Leave the build command and output directory empty.
4. Deploy.

`vercel.json` only sets security headers. It does not change the build.

## Layout

```
index.html                 page shell
styles.css                 layout and theme
app.js                     search, category filter, and card rendering
data/apps.json             the catalogue
public/logo.jpg            official logo
public/wordmark.png        header crop of the logo
public/favicon.ico         icon
public/apple-touch-icon.png
public/og.jpg              social preview
vercel.json                response headers
```
