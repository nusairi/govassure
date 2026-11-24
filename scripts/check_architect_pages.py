#!/usr/bin/env python3
"""Check the generated Security Architect Corner pages are complete and wired up.

For every template in build_architect_templates.TEMPLATES, every pattern page and
the document trail, check that the page exists, is in the sitemap, has a slashless
rewrite in staticwebapp.config.json and is scanned by check_links.py; that every
template key has a form definition in architect-templates.js; that each lifecycle
phase on /architect/ has its "Documents for this phase" box; and that every
template linked from the document trail exists. Exits 1 on any problem.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_architect_templates import TEMPLATES  # noqa: E402
from build_architect_doc_trail import DOCS, PHASES  # noqa: E402

problems = []
sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
routes = {r["route"]: r for r in json.loads((ROOT / "staticwebapp.config.json").read_text(encoding="utf-8"))["routes"]}
served = (ROOT / "scripts" / "check_links.py").read_text(encoding="utf-8")
js = (ROOT / "architect-templates.js").read_text(encoding="utf-8")
arch = (ROOT / "architect" / "index.html").read_text(encoding="utf-8")

pages = ["architect/templates", "architect/patterns", "architect/document-trail", "architect/beginners"]
pages += [f"architect/beginners/{d.name}" for d in sorted((ROOT / "architect" / "beginners").iterdir()) if d.is_dir()]
pages += [f"architect/templates/{t[1]}" for t in TEMPLATES]
pages += [f"architect/patterns/{d.name}" for d in sorted((ROOT / "architect" / "patterns").iterdir()) if d.is_dir()]
for p in pages:
    if not (ROOT / p / "index.html").is_file():
        problems.append(f"missing page {p}/index.html")
    if f"https://www.govassured.com/{p}/</loc>" not in sitemap:
        problems.append(f"sitemap is missing /{p}/")
    r = routes.get("/" + p)
    if not r or r.get("rewrite") != f"/{p}/index.html":
        problems.append(f"staticwebapp.config.json has no slashless rewrite for /{p}")
    if f'"{p}/index.html"' not in served:
        problems.append(f"check_links.py does not scan {p}/index.html")

for key, slug, title, *_ in TEMPLATES:
    if not re.search(r"(?m)^\s*(?:T\.)?" + re.escape(key) + r"\s*[:=]\s*\{", js):
        problems.append(f"architect-templates.js has no form for {key}")
    if f'data-template="{key}"' not in (ROOT / "architect" / "templates" / slug / "index.html").read_text(encoding="utf-8"):
        problems.append(f"{slug} page is not wired to data-template {key}")
    if f'href="/architect/templates/{slug}/"' not in arch:
        problems.append(f"/architect/ does not link {slug}")

for key, *_ in PHASES:
    if f"<!-- doc-trail:{key} -->" not in arch or f'id="docs-{key}"' not in arch:
        problems.append(f"/architect/ phase {key} has no Documents for this phase box")

if 'href="/architect/beginners/"' not in arch or "New to security architecture?" not in arch:
    problems.append("/architect/ Start here has no beginner path card")

slugs = {t[1] for t in TEMPLATES}
for name, href, kind, _cells in DOCS:
    if kind == "template" and href.split("/")[3] not in slugs:
        problems.append(f"document trail links a missing template: {name} {href}")

if problems:
    print("\n".join("FAIL " + p for p in problems))
    sys.exit(1)
print(f"Architect pages check passed ({len(pages)} pages, {len(TEMPLATES)} templates, {len(DOCS)} trail documents).")
