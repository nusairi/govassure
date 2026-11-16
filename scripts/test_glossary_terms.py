#!/usr/bin/env python3
"""Glossary HTML, terms JSON and budget-share mapping stay in sync. No invented figures."""
import json, re, sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Hub files sit at the repo root; the box snapshot keeps them under app/.
APP = ROOT / "app" if (ROOT / "app" / "index.html").is_file() else ROOT
html = (APP / "govmap/glossary/index.html").read_text(encoding="utf-8")
terms = json.loads((APP / "data/govmap-terms.json").read_text())["terms"]
budget = json.loads((APP / "data/budget.json").read_text())
ids_html = set(re.findall(r'<article class="gm-term" id="([^"]+)"', html))
ids_json = {t["id"] for t in terms}
if ids_html != ids_json:
    sys.exit(f"id mismatch html-json {sorted(ids_html-ids_json)} / {sorted(ids_json-ids_html)}")

required = [
    "departmental-expenditure-limit", "resource-del", "capital-del", "total-del",
    "pesa", "main-estimates", "public-accounts-commission",
    "public-administration-and-constitutional-affairs-committee",
    "speakers-committee", "non-ministerial-department", "non-departmental-public-body",
    "national-audit-office", "annually-managed-expenditure", "small-and-independent-bodies",
]
missing = [i for i in required if i not in ids_json]
if missing:
    sys.exit(f"required terms missing: {missing}")

# defs come from the glossary page (first sentence), not invented later
arts = dict(re.findall(
    r'<article class="gm-term" id="([^"]+)"[\s\S]*?<p class="gm-def">([^<]+)</p>',
    html,
))
if set(arts) != ids_html:
    sys.exit(f"could not parse defs for {sorted(ids_html-set(arts))}")

def unescape(s):
    return (s.replace("&#x27;", "'").replace("&amp;", "&").replace("&quot;", '"')
            .replace("&lt;", "<").replace("&gt;", ">"))

def first_sentence(d):
    d = unescape(d).strip()
    for i, ch in enumerate(d):
        if ch == "." and (i + 1 == len(d) or d[i + 1] in " \t"):
            return d[: i + 1]
    return d

by = {t["id"]: t for t in terms}
for i, raw in arts.items():
    got = by[i]["def"].strip()
    want = first_sentence(raw)
    if got != want:
        sys.exit(f"def mismatch {i}:\n  json: {got}\n  html: {want}")

# published Total DEL figure must appear, uninvented
if "£664,958 million" not in unescape(arts["total-del"]):
    sys.exit("Total DEL definition must cite the published £664,958 million")

# every term has at least one pattern
for t in terms:
    if not t.get("patterns"):
        sys.exit(f"no patterns for {t['id']}")

# budget mapping used by department tooltips — figures from the workbook JSON only
total = budget["total"]["plansMillion"]
assert total == 664958
mod = next(g for g in budget["groups"] if g.get("slug") == "ministry-of-defence")
assert mod["plansMillion"] == 65106
assert round(mod["plansMillion"] / total * 100, 2) == 9.79
comb = budget["combined"]
assert comb["slug"] == "ministry-of-housing-communities-local-government"
assert comb["plansMillion"] == 18401 + 14500 == 32901
assert round(comb["plansMillion"] / total * 100, 2) == 4.95
bt = next(g for g in budget["groups"] if g["pesaName"] == "Business and Trade")
assert bt.get("slug") in (None, "") or bt.get("missing") == "old-name"
assert bt["plansMillion"] == 3210
dsit = next(g for g in budget["groups"] if g["pesaName"] == "Science, Innovation and Technology")
assert bt["plansMillion"] + dsit["plansMillion"] != 3210  # must not invent a BIST sum as the line
assert "department-for-business-innovation-science-and-trade" not in {g.get("slug") for g in budget["groups"]}

miss = budget.get("missingLines") or {}
sib = set(miss.get("smallAndIndependentBodies") or [])
none = set(miss.get("noSeparateFigure") or [])
if not sib or not none:
    sys.exit("budget.json missingLines is incomplete")
for s in ("scotland-office", "wales-office", "northern-ireland-office", "uk-export-finance", "office-of-the-advocate-general-for-scotland", "ofsted", "ofgem"):
    if s not in sib:
        sys.exit(f"{s} should be in Small and Independent Bodies")
    if s in none:
        sys.exit(f"{s} must not also be in noSeparateFigure")
for s in ("attorney-generals-office", "the-office-of-the-leader-of-the-house-of-commons", "office-of-the-leader-of-the-house-of-lords", "national-crime-agency", "forestry-commission"):
    if s not in none:
        sys.exit(f"{s} should be noSeparateFigure")
    if s in sib:
        sys.exit(f"{s} must not be classed as Small and Independent Bodies")
if set(sib) & set(none):
    sys.exit("slug in both missingLines lists")
print(f"glossary terms OK: {len(terms)} terms, Total DEL 664958, Defence 9.79%, MHCLG combined 32901, SIB {len(sib)}, no-line {len(none)}")

