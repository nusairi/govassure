#!/usr/bin/env python3
"""Build the standalone Key Management Lifecycle app into ../site (static, no build tools needed).
Run: python3 src/build.py   (from /workspace/apps-new/kms)"""
import hashlib, json, os, re, shutil, base64
SRC = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(SRC, '..', 'site')
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
COPY = ['kms-data.js','kms.js','kms-compare.js','kms-arch.js','kms-glossary.js','ga-brand.css','ga-theme.css','ga-app.css','ga-sources.js','ga-logo.png',
        'favicon.ico','favicon.svg','apple-touch-icon.png','icon-192.png','icon-512.png','site.webmanifest']
for f in COPY: shutil.copy(os.path.join(SRC, f), OUT)
# one app stylesheet: the DevSecOps look (ds-app.css) + the key-management additions
open(os.path.join(OUT,'app.css'),'w').write(open(os.path.join(SRC,'ds-app.css')).read().rstrip()+'\n'+open(os.path.join(SRC,'kms.css')).read())
open(os.path.join(OUT,'ga-404.css'),'w').write(open(os.path.join(SRC,'ga-404.css')).read())
def v(name): return hashlib.sha256(open(os.path.join(OUT,name),'rb').read()).hexdigest()[:10]
def fill(t): return re.sub(r'%%V:([^%]+)%%', lambda m: v(m.group(1)), t)
SRCS = json.load(open(os.path.join(SRC,'sources.json')))
assert all(len(c+' '+t) <= 90 for c,t,u in SRCS)
assert [c for c,t,u in SRCS] == ['S%d' % i for i in range(1, len(SRCS)+1)]
# Architect's pack: generated data module + downloadable ADR pack (validated at build time)
import sys; sys.path.insert(0, SRC); import build_arch, arch_aws
build_arch.build(arch_aws, 'aws', SRCS, OUT)
src_html = '<span hidden>' + ''.join(f'<a href="{u}">{c} {t}</a>' for c,t,u in SRCS) + '</span>'
li = open(os.path.join(SRC,'linkedin.svg')).read()
html = open(os.path.join(SRC,'index.tpl.html')).read().replace('%%LI%%', li).replace('%%SOURCES%%', src_html)
open(os.path.join(OUT,'index.html'),'w').write(fill(html))
open(os.path.join(OUT,'ga-404.html'),'w').write(fill(open(os.path.join(SRC,'ga-404.tpl.html')).read()))
open(os.path.join(OUT,'robots.txt'),'w').write('User-agent: *\nAllow: /\nSitemap: https://kms.govassured.com/sitemap.xml\n')
open(os.path.join(OUT,'sitemap.xml'),'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://kms.govassured.com/</loc><lastmod>2026-11-04</lastmod></url>\n</urlset>\n')
# CSP: hash any inline <script>/<style> blocks (the pages are built to have none) and inline event handlers are forbidden
sh, st = set(), set()
for p in ('index.html','ga-404.html'):
    t = open(os.path.join(OUT,p)).read()
    assert not re.search(r'\son[a-z]+=', t, re.I), p+': inline handler'
    assert ' style="' not in t, p+': inline style attribute'
    for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', t, re.S): sh.add(base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode())
    for m in re.finditer(r'<style[^>]*>(.*?)</style>', t, re.S): st.add(base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode())
hs = lambda s: ''.join(f" 'sha256-{x}'" for x in sorted(s))
csp = ("default-src 'none'; script-src 'self'"+hs(sh)+"; style-src 'self'"+hs(st)+"; img-src 'self' data:; font-src 'self'; "
       "manifest-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests")
cfg = {
  "globalHeaders": {
    "Content-Security-Policy": csp,
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()",
    "Cross-Origin-Opener-Policy": "same-origin"
  },
  "routes": [],
  "mimeTypes": { ".webmanifest": "application/manifest+json", ".md": "text/markdown; charset=utf-8" },
  "responseOverrides": { "404": { "rewrite": "/ga-404.html", "statusCode": 404 } }
}
json.dump(cfg, open(os.path.join(OUT,'staticwebapp.config.json'),'w'), indent=2)
print('built', sorted(os.listdir(OUT)), 'inline scripts', len(sh), 'inline styles', len(st))
# Same headers for the fallback host (shared static-sites nginx image): conf/kms.conf, format as conf/devsecops.conf
os.makedirs(os.path.join(SRC,'..','deploy'), exist_ok=True)
H = cfg['globalHeaders']
hdr = (f'add_header Content-Security-Policy "{H["Content-Security-Policy"]}" always;\n'
       'add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;\n'
       'add_header X-Content-Type-Options "nosniff" always;\n'
       'add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n'
       'add_header Cross-Origin-Opener-Policy "same-origin" always;\n'
       'add_header Cross-Origin-Resource-Policy "same-site" always;\n'
       f'add_header Permissions-Policy "{H["Permissions-Policy"]}" always;\n'
       'add_header X-Frame-Options "DENY" always;\n')
conf = ('absolute_redirect off;\nindex index.html;\n' + hdr +
        'location = /healthz { access_log off; return 200 "ok"; }\n'
        'location = /staticwebapp.config.json { return 404; }\n'
        'location ~ ^/(?!index\\.html$|ga-404\\.html$)(.+)\\.html$ { return 301 /$1$is_args$args; }\n'
        'location ~ \\.md$ { types { } default_type text/markdown; charset utf-8; charset_types text/markdown; add_header Cache-Control $ga_cache always; ' + hdr.replace('\n', ' ') + 'try_files $uri =404; }\n'
        'location / { try_files $uri $uri.html $uri/ =404; }\n'
        'error_page 404 /ga-404.html;\nlocation = /ga-404.html { internal; }\n')
open(os.path.join(SRC,'..','deploy','nginx-kms.conf'),'w').write(conf)
