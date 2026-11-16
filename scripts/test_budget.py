#!/usr/bin/env python3
"""Check that budget.json is built from the PESA 2026 Table 1.9 workbook."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_budget as bb

def near(a, b, places=10):
    return abs(a - b) < 10 ** (-places)

def main() -> int:
    parsed = bb.parse_workbook(bb.WORKBOOK)
    data = json.loads(bb.OUT.read_text(encoding="utf-8")) if bb.OUT.is_file() else None
    if data is None:
        raise SystemExit("data/budget.json is missing — run scripts/build_budget.py")
    if data["total"] != parsed["total"]:
        raise SystemExit("budget.json total does not match the workbook")
    if data["year"] != "2026-27" or data["measure"] != parsed["measure"]:
        raise SystemExit("year or measure mismatch")
    total = data["total"]["plansMillion"]
    if total != 664958:
        raise SystemExit(f"unexpected Total DEL {total} (workbook should be 664958)")
    if data["total"]["outturnMillion"] != 639807:
        raise SystemExit("2025-26 outturn does not match the workbook")
    by_name = {g["pesaName"]: g for g in data["groups"]}
    # Spot-check figures taken from the sheet, not from memory of a write-up
    expect = {
        "Health and Social Care": 226238,
        "Education": 102398,
        "Defence": 65106,
        "Scottish Government": 50535,
        "Transport": 30188,
        "Welsh Government": 22559,
        "Home Office": 22099,
        "Northern Ireland Executive": 19141,
        "MHCLG - Local Government": 18401,
        "Science, Innovation and Technology": 16127,
        "Work and Pensions": 14890,
        "Justice": 15056,
        "MHCLG - Housing and Communities": 14500,
        "Energy Security and Net Zero": 10568,
        "Foreign, Commonwealth and Development Office": 9427,
        "HM Revenue and Customs": 7611,
        "Environment, Food and Rural Affairs": 7577,
        "Single Intelligence Account": 5539,
        "Small and Independent Bodies": 3597,
        "Business and Trade": 3210,
        "Culture, Media and Sport": 2334,
        "Cabinet Office": 1777,
        "HM Treasury": 1259,
        "Law Officers' Departments": 1192,
        "Reserves": 5847,
        "Provision for intra-governmental leases": 742,
        "Growth Mission Fund": 31,
        "Adjustment for Budget Exchange": -1505,
        "OBR allowance for shortfall": -11487,
    }
    missing = set(expect) - set(by_name)
    extra = set(by_name) - set(expect)
    if missing or extra:
        raise SystemExit(f"group set mismatch: missing {missing} extra {extra}")
    for name, val in expect.items():
        got = by_name[name]["plansMillion"]
        if got != val:
            raise SystemExit(f"{name}: json {got} != workbook {val}")
        share = by_name[name]["shareOfTotalDel"]
        if not near(share, val / total):
            raise SystemExit(f"{name}: share {share} != {val}/{total}")
        if by_name[name].get("plansMillion") is None:
            raise SystemExit(f"{name}: missing figure")
    # percentages used in the research write-up, derived from the workbook
    health_pct = round(226238 / 664958 * 100, 2)
    if health_pct != 34.02:
        raise SystemExit(f"health share rounded to {health_pct}, expected 34.02")
    comb = data["combined"]
    if not comb or comb["plansMillion"] != 18401 + 14500:
        raise SystemExit("combined MHCLG is not the sum of the two workbook lines")
    if "Not a separate PESA group" not in comb["note"]:
        raise SystemExit("combined MHCLG must be labelled as a sum")
    # no invented DSIT+Business = BIST line
    names = [g["pesaName"] for g in data["groups"]]
    if any("BIST" in n for n in names):
        raise SystemExit("do not invent a BIST PESA line")
    if any(g.get("plansMillion") is None for g in data["groups"]):
        raise SystemExit("a group is missing a workbook figure")
    # rebuild from disk must be identical in amounts
    if [g["plansMillion"] for g in data["groups"]] != [g["plansMillion"] for g in parsed["groups"]]:
        raise SystemExit("budget.json is stale — rerun build_budget.py")
    print(f"budget data OK: {len(expect)} groups, Total DEL {total}, Health {health_pct}%")
    return 0

if __name__ == "__main__":
    sys.exit(main())
