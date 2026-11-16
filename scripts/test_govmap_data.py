#!/usr/bin/env python3
"""Sanity checks for data/govmap.json (run after build_govmap.py)."""
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
# Hub files sit at the repo root; the box snapshot keeps them under app/.
APP = ROOT / "app" if (ROOT / "app" / "index.html").is_file() else ROOT
d = json.loads((APP / "data/govmap.json").read_text())
URL = re.compile(r"^https://www\.gov\.uk/government/organisations/[a-z0-9-]+$")
keys = {t["k"] for t in d["types"]}
errs = []
def chk(b, where):
    if not URL.match(b.get("u", "")): errs.append(f"bad url {where}: {b.get('u')}")
    if b["n"] != b["n"].strip() or "  " in b["n"] or not b["n"]: errs.append(f"untrimmed name {where}: {b['n']!r}")
    if b["t"] not in keys: errs.append(f"unknown type {where}: {b['t']}")
for r in d["roots"]:
    chk(r, "root")
    assert r["k"] in ("min", "nmd", "dev")
    for k, lst in r["g"].items():
        us = [b["u"] for b in lst]
        if len(us) != len(set(us)): errs.append(f"duplicate in {r['n']}/{k}")
        for b in lst: chk(b, r["n"])
for b in d["unattached"]: chk(b, "unattached")
c = d["counts"]
if not (20 <= c["ministerial"] <= 30 and 15 <= c["nonMinisterial"] <= 30 and c["bodies"] > 400): errs.append(f"odd counts {c}")
if "Open Government Licence" not in d["source"]["licence"]: errs.append("licence missing")
print("\n".join(errs) or f"govmap data OK: {c['ministerial']}+{c['nonMinisterial']} departments, {c['bodies']} bodies")
sys.exit(1 if errs else 0)
