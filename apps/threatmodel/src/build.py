#!/usr/bin/env python3
"""Build the Threat Modelling Lifecycle static site into /workspace/threatmodel-app."""
import hashlib, json, os, re, shutil, base64
SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(SRC)  # site is the app root itself

# Shared assets already live in OUT; refresh from src where we keep editable copies
for f in ("tm-data.js",):
    # tm-data.js is generated next to OUT already
    pass

# app.css = ds-app.css + tm.css (same pattern as KMS)
app_css = open(os.path.join(OUT, "ds-app.css")).read().rstrip() + "\n" + open(os.path.join(SRC, "tm.css")).read()
open(os.path.join(OUT, "app.css"), "w").write(app_css)
shutil.copy(os.path.join(SRC, "tm.js"), os.path.join(OUT, "tm.js"))
# tm-data.js already written to OUT

def v(name):
    return hashlib.sha256(open(os.path.join(OUT, name), "rb").read()).hexdigest()[:10]

def fill(t):
    return re.sub(r"%%V:([^%]+)%%", lambda m: v(m.group(1)), t)

li = open(os.path.join(OUT, "linkedin.svg")).read()
html = open(os.path.join(SRC, "index.tpl.html")).read().replace("%%LI%%", li)
open(os.path.join(OUT, "index.html"), "w").write(fill(html))
open(os.path.join(OUT, "ga-404.html"), "w").write(fill(open(os.path.join(SRC, "ga-404.tpl.html")).read()))

open(os.path.join(OUT, "robots.txt"), "w").write(
    "User-agent: *\nAllow: /\nSitemap: https://threatmodel.govassured.com/sitemap.xml\n"
)
open(os.path.join(OUT, "sitemap.xml"), "w").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    "  <url><loc>https://threatmodel.govassured.com/</loc><lastmod>2026-11-10</lastmod></url>\n"
    "</urlset>\n"
)
manifest = {
    "name": "GOV Assured",
    "short_name": "GOV Assured",
    "icons": [
        {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
        {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
    ],
    "theme_color": "#021c17",
    "background_color": "#021c17",
    "display": "standalone",
    "start_url": "/",
}
json.dump(manifest, open(os.path.join(OUT, "site.webmanifest"), "w"), indent=2)
# trailing newline
open(os.path.join(OUT, "site.webmanifest"), "a").write("\n")

# CSP: hash any inline script/style (pages are built to have none); forbid inline handlers / style attrs
sh, st = set(), set()
for p in ("index.html", "ga-404.html"):
    t = open(os.path.join(OUT, p)).read()
    assert not re.search(r"\son[a-z]+=", t, re.I), p + ": inline handler"
    assert ' style="' not in t, p + ": inline style attribute"
    for m in re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", t, re.S):
        sh.add(base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode())
    for m in re.finditer(r"<style[^>]*>(.*?)</style>", t, re.S):
        st.add(base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode())
hs = lambda s: "".join(f" 'sha256-{x}'" for x in sorted(s))
csp = (
    "default-src 'none'; script-src 'self'"
    + hs(sh)
    + "; style-src 'self'"
    + hs(st)
    + "; img-src 'self' data:; font-src 'self'; manifest-src 'self'; connect-src 'none'; "
    "object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests"
)
cfg = {
    "globalHeaders": {
        "Content-Security-Policy": csp,
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()",
        "Cross-Origin-Opener-Policy": "same-origin",
    },
    "routes": [],
    "mimeTypes": {".webmanifest": "application/manifest+json"},
    "responseOverrides": {"404": {"rewrite": "/ga-404.html", "statusCode": 404}},
}
json.dump(cfg, open(os.path.join(OUT, "staticwebapp.config.json"), "w"), indent=2)
open(os.path.join(OUT, "staticwebapp.config.json"), "a").write("\n")
print("built", "inline scripts", len(sh), "inline styles", len(st))
