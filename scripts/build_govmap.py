#!/usr/bin/env python3
"""Build data/govmap.json: UK government departments and their bodies.

Sources (both Open Government Licence v3.0, no key needed):
  * GOV.UK Content API  /api/content/government/organisations  (departments,
    their "works with" bodies grouped by type, acronyms, status, own-website flag)
  * GOV.UK Organisations API  /api/organisations?page=N  (parent links, used to
    place sub-organisations and devolved bodies, and to drop closed bodies)

Usage:  python3 scripts/build_govmap.py [--cache DIR] [--out PATH]
  --cache DIR  reuse/save raw API responses in DIR (handy offline re-runs)
Run from the repo root. Takes ~30 s live (65 small requests). Standard library only.
"""
import argparse, datetime, json, re, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Hub files sit at the repo root; the box snapshot keeps them under app/.
APP = ROOT / "app" if (ROOT / "app" / "index.html").is_file() else ROOT
GOVUK = "https://www.gov.uk"
CONTENT = GOVUK + "/api/content/government/organisations"
ORGS = GOVUK + "/api/organisations?page={}"
HREF_RE = re.compile(r"^/government/organisations/[a-z0-9][a-z0-9-]{0,150}$")
UA = "govassured-govmap-builder/1.0 (+https://www.govassured.com/govmap/)"

TYPES = [  # key, label, works_with key(s)
    ("ministerial", "Ministerial department", ["ministerial_department"]),
    ("nmd", "Non-ministerial department", ["non_ministerial_department"]),
    ("ea", "Executive agency", ["executive_agency"]),
    ("endpb", "Executive NDPB", ["executive_ndpb"]),
    ("andpb", "Advisory NDPB", ["advisory_ndpb"]),
    ("tribunal", "Tribunal", ["tribunal", "court"]),
    ("pc", "Public corporation", ["public_corporation"]),
    ("sha", "Special health authority", ["special_health_authority"]),
    ("imb", "Independent monitoring body", ["independent_monitoring_body"]),
    ("adhoc", "Ad-hoc advisory group", ["adhoc_advisory_group"]),
    ("office", "Executive office", ["executive_office"]),
    ("cs", "Civil service", ["civil_service"]),
    ("devolved", "Devolved government", ["devolved_government"]),
    ("other", "Other public body", ["other"]),
    ("sub", "Sub-organisation", []),
]
WW2KEY = {w: k for k, _, ws in TYPES for w in ws}
FORMAT2KEY = {
    "Ministerial department": "ministerial", "Non-ministerial department": "nmd",
    "Executive agency": "ea", "Executive non-departmental public body": "endpb",
    "Advisory non-departmental public body": "andpb", "Tribunal": "tribunal", "Court": "tribunal",
    "Public corporation": "pc", "Special health authority": "sha",
    "Independent monitoring body": "imb", "Ad-hoc advisory group": "adhoc",
    "Executive office": "office", "Civil service": "cs", "Devolved government": "devolved",
    "Sub-organisation": "sub", "Sub organisation": "sub", "Other": "other",
}


def get(url, cache, name):
    if cache:
        p = cache / name
        if p.exists():
            return json.loads(p.read_text())
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read().decode("utf-8"))
            break
        except Exception as exc:  # retry transient errors
            if attempt == 3:
                raise
            print(f"retry {url}: {exc}", file=sys.stderr)
            time.sleep(2 * (attempt + 1))
    if cache:
        (cache / name).write_text(json.dumps(data))
    return data


def clean(s):
    return re.sub(r"\s+", " ", (s or "")).strip()


def slug_of(href_or_url):
    return href_or_url.rstrip("/").rsplit("/", 1)[-1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache")
    ap.add_argument("--out", default=str(APP / "data" / "govmap.json"))
    a = ap.parse_args()
    cache = Path(a.cache) if a.cache else None
    if cache:
        cache.mkdir(parents=True, exist_ok=True)

    content = get(CONTENT, cache, "content.json")["details"]
    orgs, page, pages = {}, 1, 1
    while page <= pages:
        d = get(ORGS.format(page), cache, f"orgs-{page}.json")
        pages = d.get("pages", 1)
        for o in d["results"]:
            orgs[o["details"]["slug"]] = o
        page += 1
    if len(orgs) < 500:
        sys.exit(f"too few organisations from API ({len(orgs)}); refusing to write")

    def closed(slug):
        o = orgs.get(slug)
        return bool(o and (o["details"].get("govuk_status") == "closed" or o["details"].get("closed_at")))

    listing, group_of = {}, {}
    for g, items in content.items():
        for o in items:
            href = o.get("href", "")
            if HREF_RE.match(href) and not closed(slug_of(href)) and o.get("govuk_status") != "closed":
                listing[href] = o
                group_of[href] = g

    def body(href, tkey):
        o = listing[href]
        raw = orgs.get(slug_of(href), {})
        ab = clean(o.get("acronym") or raw.get("details", {}).get("abbreviation"))
        name = clean(o.get("title"))
        n = {"n": name, "t": tkey, "u": GOVUK + href}
        if ab and ab.lower() != name.lower():
            n["ab"] = ab
        if o.get("separate_website") or o.get("govuk_status") == "exempt":
            n["own"] = 1
        return n

    roots, placed = [], {}  # placed: href -> list of root names

    def add_root(o, kind):
        href = o["href"]
        root = body(href, {"min": "ministerial", "nmd": "nmd", "dev": "devolved"}[kind])
        root["k"] = kind
        root["g"] = {}
        for ww, lst in (o.get("works_with") or {}).items():
            tkey = WW2KEY.get(ww, "other")
            for x in lst:
                h = x.get("href", "")
                if h in listing and h != href:
                    root["g"].setdefault(tkey, []).append(body(h, tkey))
                    placed.setdefault(h, []).append(root["n"])
        roots.append(root)
        return root

    by_href = {}
    for o in content.get("ordered_ministerial_departments", []):
        if o["href"] in listing:
            by_href[o["href"]] = add_root(o, "min")
    for o in content.get("ordered_non_ministerial_departments", []):
        if o["href"] in listing:
            by_href[o["href"]] = add_root(o, "nmd")
    for o in content.get("ordered_devolved_administrations", []):
        if o["href"] in listing:
            by_href[o["href"]] = add_root(o, "dev")
    root_slug = {slug_of(h): r for h, r in by_href.items()}
    placed_root_of = {}  # href -> first root it sits in
    for r in roots:
        for lst in r["g"].values():
            for b in lst:
                placed_root_of.setdefault(b["u"][len(GOVUK):], r)

    def live_parents(slug):
        o = orgs.get(slug) or {}
        return [slug_of(p.get("id") or p.get("web_url", "")) for p in o.get("parent_organisations", []) if not closed(slug_of(p.get("id") or p.get("web_url", "")))]

    # Place remaining bodies (sub-organisations and anything not in "works with")
    # via the Organisations API parent links: directly under a department/devolved
    # government, or under the department of a parent body ("via" that body).
    unattached = []
    for href, o in listing.items():
        if href in by_href or href in placed:
            continue
        if group_of[href] in ("ordered_executive_offices",):
            continue
        slug = slug_of(href)
        tkey = FORMAT2KEY.get(o.get("format"), "other")
        homes = []
        for p in live_parents(slug):
            if p in root_slug:
                homes.append((root_slug[p], None))
            else:
                ph = "/government/organisations/" + p
                if ph in placed_root_of and ph in listing:
                    homes.append((placed_root_of[ph], clean(listing[ph].get("title"))))
        if not homes:
            unattached.append(body(href, tkey))
            continue
        seen = set()
        for r, via in homes:
            if r["n"] in seen:
                continue
            seen.add(r["n"])
            b = body(href, tkey)
            if via:
                b["via"] = via
            r["g"].setdefault(tkey, []).append(b)
            placed.setdefault(href, []).append(r["n"])

    # Shared bodies: list the other homes
    for r in roots:
        for lst in r["g"].values():
            for b in lst:
                homes = placed.get(b["u"][len(GOVUK):], [])
                others = sorted({h for h in homes if h != r["n"]})
                if others:
                    b["also"] = others
    order = [k for k, _, _ in TYPES]
    for r in roots:
        g = {}
        for k in order:
            if k in r["g"]:
                g[k] = sorted(r["g"][k], key=lambda b: b["n"].lower())
        r["g"] = g
        r["c"] = sum(len(v) for v in g.values())
    unattached.sort(key=lambda b: b["n"].lower())

    counts = {}
    root_urls = {r["u"] for r in roots}
    uniq = set()
    for r in roots:
        for lst in r["g"].values():
            for b in lst:
                if b["u"] not in uniq and b["u"] not in root_urls:
                    uniq.add(b["u"])
                    counts[b["t"]] = counts.get(b["t"], 0) + 1
    for b in unattached:
        uniq.add(b["u"])
        counts[b["t"]] = counts.get(b["t"], 0) + 1

    out = {
        "generated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": {
            "name": "GOV.UK Content API and Organisations API",
            "url": GOVUK + "/government/organisations",
            "licence": "Open Government Licence v3.0",
            "licenceUrl": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
        },
        "types": [{"k": k, "l": l} for k, l, _ in TYPES],
        "counts": {
            "ministerial": sum(1 for r in roots if r["k"] == "min"),
            "nonMinisterial": sum(1 for r in roots if r["k"] == "nmd"),
            "devolved": sum(1 for r in roots if r["k"] == "dev"),
            "bodies": len(uniq),
            "shared": sum(1 for h, v in placed.items() if len(set(v)) > 1),
            "unattached": len(unattached),
            "byType": counts,
        },
        "roots": roots,
        "unattached": unattached,
    }
    # Self-checks before writing
    for r in roots + unattached:
        assert r["u"].startswith(GOVUK + "/government/organisations/"), r
    text = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(text + "\n", encoding="utf-8")
    c = out["counts"]
    print(f"wrote {a.out}: {len(text.encode())} bytes; {c['ministerial']} ministerial, "
          f"{c['nonMinisterial']} non-ministerial, {c['devolved']} devolved, {c['bodies']} bodies, "
          f"{c['shared']} shared, {c['unattached']} unattached")


if __name__ == "__main__":
    main()
