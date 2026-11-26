#!/usr/bin/env python3
"""Check the "Start your security journey" path (/start/) is complete and wired up.

For the overview and each step page: the page exists, is in the sitemap, has a slashless
rewrite in staticwebapp.config.json and is scanned by check_links.py. Every clip link is
on the exact YouTube allowlist, the shared CSS and JS are built and scanned, every
internal link resolves, and the pointers from the home page, the Security Architect
Corner and the beginner architecture path are in place. Exits 1 on any problem.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from start_path_content import CLIPS, STEPS  # noqa: E402

problems = []
sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
routes = {r["route"]: r for r in json.loads((ROOT / "staticwebapp.config.json").read_text(encoding="utf-8"))["routes"]}
served = (ROOT / "scripts" / "check_links.py").read_text(encoding="utf-8")
build = (ROOT / "scripts" / "build.sh").read_text(encoding="utf-8")

pages = ["start"] + [f"start/{s['slug']}" for s in STEPS]
for p in pages:
    f = ROOT / p / "index.html"
    if not f.is_file():
        problems.append(f"missing page {p}/index.html")
    if f"https://www.govassured.com/{p}/</loc>" not in sitemap:
        problems.append(f"sitemap is missing /{p}/")
    r = routes.get("/" + p)
    if not r or r.get("rewrite") != f"/{p}/index.html":
        problems.append(f"staticwebapp.config.json has no slashless rewrite for /{p}")
    if f"/{p}/index.html" not in routes:
        problems.append(f"staticwebapp.config.json has no cache header route for /{p}/index.html")
    if f'"{p}/index.html"' not in served:
        problems.append(f"check_links.py does not scan {p}/index.html")

for asset in ("start-journey.css", "start-journey.js"):
    if not (ROOT / asset).is_file():
        problems.append(f"missing {asset}")
    if f'"{asset}"' not in served:
        problems.append(f"check_links.py does not scan {asset}")
    if asset not in build:
        problems.append(f"build.sh does not publish {asset}")
if "architect start)" not in build and "start)" not in build:
    problems.append("build.sh HUB_DIRS does not include start")

# Clip links: each must be on the exact allowlist, and each must be used by a step page.
used = set()
for s in STEPS:
    html = (ROOT / "start" / s["slug"] / "index.html").read_text(encoding="utf-8")
    for m in re.finditer(r'href="(https://www\.youtube\.com/watch\?v=[^"]+)"', html):
        used.add(m.group(1).replace("&amp;", "&"))
for key in CLIPS:
    vid, secs = key.split("@")
    url = f"https://www.youtube.com/watch?v={vid}&t={int(secs)}s"
    if url not in used:
        problems.append(f"no step page links clip {url}")
    if f'"{url}"' not in served:
        problems.append(f"check_links.py does not allow clip {url}")

# Every internal link on /start/ pages must resolve.
def target_exists(href):
    path = href.split("#", 1)[0].split("?", 1)[0]
    if not path.startswith("/") or path.startswith("//"):
        return True
    rel = path.lstrip("/")
    if path == "/":
        return (ROOT / "index.html").is_file()
    if (ROOT / rel).is_file():
        return True
    if (ROOT / rel / "index.html").is_file() or (ROOT / (rel + ".html")).is_file():
        return True
    route = routes.get(path) or routes.get(path.rstrip("/"))
    return bool(route and route.get("rewrite") and (ROOT / route["rewrite"].lstrip("/")).is_file())

for p in pages:
    f = ROOT / p / "index.html"
    if not f.is_file():
        continue
    text = f.read_text(encoding="utf-8")
    for href in re.findall(r'href="([^"]+)"', text):
        if href.startswith("/") and not target_exists(href):
            problems.append(f"{p}/index.html links to missing {href}")
    if text.count('class="beg-gov"') != (0 if p == "start" else 1):
        problems.append(f"{p}/index.html should have exactly one What GOV.UK recommends box on a step page")
    if p != "start":
        if "What GOV.UK recommends" not in text:
            problems.append(f"{p}/index.html has no What GOV.UK recommends heading")
        if "beg-anim beg-step-anim" not in text:
            problems.append(f"{p}/index.html has no step animation")
        n = text.count('class="beg-video"')
        if n < 1:
            problems.append(f"{p}/index.html has no video clip")
        if text.count("What this video covers") != n:
            problems.append(f"{p}/index.html: every video needs a What this video covers explainer")

# Pointers into the path.
pointers = {
    "index.html": 'href="/start/"',
    "architect/index.html": 'href="/start/"',
    "architect/beginners/index.html": 'href="/start/"',
    "architect/beginners/1-role/index.html": 'href="/start/"',
}
for rel, needle in pointers.items():
    if needle not in (ROOT / rel).read_text(encoding="utf-8"):
        problems.append(f"{rel} does not link /start/")
overview = (ROOT / "start" / "index.html").read_text(encoding="utf-8") if (ROOT / "start" / "index.html").is_file() else ""
if 'href="/architect/beginners/"' not in overview:
    problems.append("/start/ does not lead on to /architect/beginners/")

if problems:
    print("\n".join("FAIL " + p for p in problems))
    sys.exit(1)
print(f"Start path check passed ({len(pages)} pages, {len(CLIPS)} video clips).")
