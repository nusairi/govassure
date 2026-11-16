#!/usr/bin/env python3
"""Build /data/budget.json from PESA 2026 Chapter 1, Table 1.9 (OGL v3.0).

Every amount comes from the workbook. Nothing is invented. Shares are
calculated from the published Total DEL for that year. Rows that cannot
be mapped to a govmap department are marked, not guessed.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
# Hub files sit at the repo root; the box snapshot keeps them under app/.
APP = ROOT / "app" if (ROOT / "app" / "index.html").is_file() else ROOT
WORKBOOK = Path(__file__).resolve().parent / "vendor" / "PESA_2026_CP_Chapter_1_tables.xlsx"
OUT = APP / "data" / "budget.json"
SHEET = "Table_1_9"
YEAR = "2026-27"
SOURCE = {
    "title": "Public Expenditure Statistical Analyses 2026, Table 1.9",
    "publisher": "HM Treasury",
    "published": "16 July 2026",
    "url": "https://www.gov.uk/government/statistics/public-expenditure-statistical-analyses-2026",
    "workbook": "https://assets.publishing.service.gov.uk/media/6a57728b822fbe6b8245c9a1/PESA_2026_CP_Chapter_1_tables.xlsx",
    "sheet": SHEET,
    "licence": "Open Government Licence v3.0",
    "licenceUrl": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3",
}
# Mapping is by cleaned PESA label (footnotes and trailing space stripped).
# "map" is our department name when there is a clear one-to-one (or two-to-one) match.
CROSSWALK = {
    "Health and Social Care": {
        "map": "Department of Health and Social Care",
        "slug": "department-of-health-and-social-care",
        "kind": "min",
    },
    "Education": {
        "map": "Department for Education",
        "slug": "department-for-education",
        "kind": "min",
    },
    "Home Office": {
        "map": "Home Office",
        "slug": "home-office",
        "kind": "min",
        "note": "PESA includes the National Crime Agency in this group.",
    },
    "Justice": {
        "map": "Ministry of Justice",
        "slug": "ministry-of-justice",
        "kind": "min",
    },
    "Law Officers' Departments": {
        "kind": "group",
        "missing": "no-ago-line",
        "note": "The Attorney General's Office has no line of its own in PESA. This group is the Crown Prosecution Service, the Serious Fraud Office, and HM Procurator General and Treasury Solicitor.",
    },
    "Defence": {
        "map": "Ministry of Defence",
        "slug": "ministry-of-defence",
        "kind": "min",
    },
    "Single Intelligence Account": {
        "kind": "other",
        "missing": "not-on-map",
        "note": "Not a department on this map.",
    },
    "Foreign, Commonwealth and Development Office": {
        "map": "Foreign, Commonwealth & Development Office",
        "slug": "foreign-commonwealth-development-office",
        "kind": "min",
    },
    "MHCLG - Local Government": {
        "map": "Ministry of Housing, Communities and Local Government",
        "slug": "ministry-of-housing-communities-local-government",
        "kind": "min",
        "mhclgPart": "local-government",
        "note": "One of two PESA lines for MHCLG. This line is mainly grants to English local authorities.",
    },
    "MHCLG - Housing and Communities": {
        "map": "Ministry of Housing, Communities and Local Government",
        "slug": "ministry-of-housing-communities-local-government",
        "kind": "min",
        "mhclgPart": "housing-and-communities",
        "note": "The other PESA line for MHCLG. Together with Local Government this is one ministerial department on the map.",
    },
    "Culture, Media and Sport": {
        "map": "Department for Digital, Culture, Media and Sport",
        "slug": "department-for-digital-culture-media-and-sport",
        "kind": "min",
        "note": "PESA still uses the older name, without Digital.",
    },
    "Science, Innovation and Technology": {
        "kind": "former",
        "pesaNameNote": "DSIT",
        "missing": "closed-on-map",
        "note": "PESA still lists the Department for Science, Innovation and Technology, which has closed on this map. That work now sits with BIST and DCMS. These figures are not added to Business and Trade and called BIST.",
    },
    "Transport": {
        "map": "Department for Transport",
        "slug": "department-for-transport",
        "kind": "min",
    },
    "Energy Security and Net Zero": {
        "map": "Department for Energy Security and Net Zero",
        "slug": "department-for-energy-security-and-net-zero",
        "kind": "min",
    },
    "Environment, Food and Rural Affairs": {
        "map": "Department for Environment, Food & Rural Affairs",
        "slug": "department-for-environment-food-rural-affairs",
        "kind": "min",
    },
    "Business and Trade": {
        "kind": "former",
        "pesaNameNote": "Business and Trade",
        "missing": "old-name",
        "note": "PESA still lists the Department for Business and Trade as its own group. On this map that work is part of BIST. These figures are not added to the Science, Innovation and Technology line.",
    },
    "Work and Pensions": {
        "map": "Department for Work and Pensions",
        "slug": "department-for-work-pensions",
        "kind": "min",
        "note": "This is DEL only. Most social security spending is Annually Managed Expenditure (AME) and is not in this table.",
    },
    "HM Revenue and Customs": {
        "map": "HM Revenue & Customs",
        "slug": "hm-revenue-customs",
        "kind": "nmd",
    },
    "HM Treasury": {
        "map": "HM Treasury",
        "slug": "hm-treasury",
        "kind": "min",
    },
    "Cabinet Office": {
        "map": "Cabinet Office",
        "slug": "cabinet-office",
        "kind": "min",
    },
    "Scottish Government": {
        "map": "The Scottish Government",
        "slug": "the-scottish-government",
        "kind": "dev",
    },
    "Welsh Government": {
        "map": "Welsh Government",
        "slug": "welsh-government",
        "kind": "dev",
    },
    "Northern Ireland Executive": {
        "map": "Northern Ireland Executive",
        "slug": "northern-ireland-executive",
        "kind": "dev",
    },
    "Small and Independent Bodies": {
        "kind": "group",
        "missing": "many-bodies",
        "note": "PESA folds the Scotland Office, the Office of the Advocate General, the Wales Office, the Northern Ireland Office, UK Export Finance, many non-ministerial departments, the Houses of Parliament, and the bodies accountable to Parliament into this group. Those small offices have no group of their own here.",
    },
    "Growth Mission Fund": {"kind": "adjustment"},
    "Provision for intra-governmental leases": {"kind": "adjustment"},
    "Reserves": {"kind": "adjustment"},
    "OBR allowance for shortfall": {"kind": "adjustment"},
    "Adjustment for Budget Exchange": {"kind": "adjustment"},
    "Total DEL": {"kind": "total"},
}



# PESA 2026 Annex B (pages 199-200) membership, mapped to govmap slugs.
# Only use the Small and Independent Bodies wording for these departments.
SIB_SLUGS = [
    "charity-commission",  # Charity Commission
    "competition-and-markets-authority",  # Competition and Markets Authority
    "uk-export-finance",  # Export Credits Guarantee Department
    "food-standards-agency",
    "government-actuarys-department",
    "nsandi",  # National Savings and Investments
    "northern-ireland-office",
    "ofsted",  # Office for Standards in Education, Children's Services and Skills
    "ofgem",  # Office of Gas and Electricity Markets
    "ofqual",  # Office of Qualifications and Examinations Regulation
    "office-of-rail-and-road",
    "scotland-office",  # Annex B: "Scotland Office and Office of the Advocate General"
    "office-of-the-advocate-general-for-scotland",
    "uk-statistics-authority",  # Statistics Board
    "the-national-archives",
    "supreme-court-of-the-united-kingdom",
    "wales-office",
    "the-water-services-regulation-authority",  # Water Services Regulatory Authority
]
# On the map, but not a Small and Independent Bodies line of their own.
NO_SEPARATE_SLUGS = [
    "attorney-generals-office",  # Law Officers group is CPS, SFO and Treasury Solicitor
    "the-office-of-the-leader-of-the-house-of-commons",  # no separate Estimate; not in Annex B
    "office-of-the-leader-of-the-house-of-lords",
    "national-crime-agency",  # Home Office group
    "crown-prosecution-service",  # Law Officers' Departments
    "serious-fraud-office",
    "government-legal-department",  # HM Procurator General and Treasury Solicitor
    "forestry-commission",  # not in Annex B; no separate Estimate (likely inside Defra)
    "land-registry",  # not listed in Annex B
]


def clean_label(raw) -> str:
    if raw is None:
        return ""
    text = str(raw).strip()
    text = re.sub(r"\s*\(\d+\)\s*$", "", text)
    return re.sub(r"\s+", " ", text).strip()


def is_number(value) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def find_year_col(rows, year: str, status: str) -> int:
    year_row = status_row = None
    for row in rows[:8]:
        vals = [str(c).strip() if c is not None else "" for c in row]
        if year in vals and any(re.match(r"^\d{4}-\d{2}$", v) for v in vals):
            year_row = vals
        if status in vals and ("plans" in vals or "outturn" in vals):
            status_row = vals
    if not year_row or not status_row:
        raise SystemExit(f"Could not find {year} {status} column headers in {SHEET}")
    for i, (y, s) in enumerate(zip(year_row, status_row)):
        if y == year and s == status:
            return i
    raise SystemExit(f"No column for {year} {status} in {SHEET}")


def parse_workbook(path: Path) -> dict:
    if not path.is_file():
        raise SystemExit(f"Missing workbook: {path}")
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    if SHEET not in wb.sheetnames:
        raise SystemExit(f"Sheet {SHEET!r} not in workbook (have {wb.sheetnames})")
    ws = wb[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    wb.close()
    title = rows[0][0] if rows and rows[0] else ""
    plans_col = find_year_col(rows, YEAR, "plans")
    outturn_col = find_year_col(rows, "2025-26", "outturn")
    items = []
    total_plans = None
    total_outturn = None
    footnotes = []
    started = False
    unknown = []
    for row in rows:
        label = clean_label(row[0] if row else None)
        if not label:
            continue
        if label.startswith("Total DEL by departmental group"):
            started = True
            continue
        if label.startswith("(") or label.startswith("Table 1.9"):
            if started:
                footnotes.append(label)
            continue
        plans = row[plans_col] if plans_col < len(row) else None
        outturn = row[outturn_col] if outturn_col < len(row) else None
        if label == "Total DEL":
            if not is_number(plans):
                raise SystemExit("Total DEL plans figure missing from workbook")
            total_plans = int(plans) if float(plans) == int(plans) else float(plans)
            total_outturn = int(outturn) if is_number(outturn) and float(outturn) == int(outturn) else (outturn if is_number(outturn) else None)
            started = True
            items.append({"pesaName": label, "kind": "total", "plansMillion": total_plans, "outturnMillion": total_outturn})
            continue
        if not started:
            continue
        if not is_number(plans):
            unknown.append(label)
            items.append({
                "pesaName": label,
                "kind": "missing",
                "plansMillion": None,
                "outturnMillion": int(outturn) if is_number(outturn) else None,
                "missing": "no-figure-in-workbook",
            })
            continue
        plans_m = int(plans) if float(plans) == int(plans) else float(plans)
        out_m = None
        if is_number(outturn):
            out_m = int(outturn) if float(outturn) == int(outturn) else float(outturn)
        meta = CROSSWALK.get(label)
        if meta is None:
            unknown.append(label)
            rec = {
                "pesaName": label,
                "kind": "unmapped",
                "plansMillion": plans_m,
                "outturnMillion": out_m,
                "missing": "unmapped-group",
                "note": "This PESA group has no mapping on the map yet. The figure is still taken from the workbook.",
            }
        else:
            rec = {"pesaName": label, "plansMillion": plans_m, "outturnMillion": out_m}
            rec.update({k: v for k, v in meta.items()})
        items.append(rec)
    if total_plans is None:
        raise SystemExit("Total DEL not found")
    if unknown:
        # unmapped numeric rows are allowed but flagged; names we did not expect are not invented
        pass
    for rec in items:
        if rec.get("plansMillion") is None or rec.get("kind") == "total":
            continue
        rec["shareOfTotalDel"] = rec["plansMillion"] / total_plans
    # Combined MHCLG, clearly marked as a sum of two workbook lines
    parts = [r for r in items if r.get("mhclgPart")]
    combined = None
    if len(parts) == 2:
        combined = {
            "pesaName": "MHCLG (Local Government plus Housing and Communities)",
            "kind": "combined",
            "map": "Ministry of Housing, Communities and Local Government",
            "slug": "ministry-of-housing-communities-local-government",
            "plansMillion": parts[0]["plansMillion"] + parts[1]["plansMillion"],
            "outturnMillion": (parts[0]["outturnMillion"] or 0) + (parts[1]["outturnMillion"] or 0) if all(p.get("outturnMillion") is not None for p in parts) else None,
            "note": "Sum of the two MHCLG lines in Table 1.9. Not a separate PESA group.",
            "parts": [p["pesaName"] for p in parts],
        }
        combined["shareOfTotalDel"] = combined["plansMillion"] / total_plans
    return {
        "measure": "Total DEL (resource DEL plus capital DEL)",
        "year": YEAR,
        "basis": "plans",
        "unit": "£ million",
        "title": title,
        "source": SOURCE,
        "total": {"plansMillion": total_plans, "outturnMillion": total_outturn, "outturnYear": "2025-26"},
        "groups": [r for r in items if r.get("kind") != "total"],
        "combined": combined,
        "footnotes": footnotes,
        "missingLines": {
            "source": "PESA 2026 Annex B, pages 199-200",
            "smallAndIndependentBodies": SIB_SLUGS,
            "noSeparateFigure": NO_SEPARATE_SLUGS,
        },
        "caveats": [
            "These are Treasury departmental groups, not the 23 ministerial departments on the map.",
            "PESA still uses older names: Science, Innovation and Technology (DSIT) and Business and Trade, and Culture, Media and Sport without Digital.",
            "MHCLG is split into two PESA lines. A combined total is provided separately and is labelled as a sum.",
            "The Home Office group includes the National Crime Agency.",
            "Scotland Office, Wales Office, the Northern Ireland Office, the Office of the Advocate General and UK Export Finance sit under Small and Independent Bodies. The Offices of the Leader of the House of Commons and of the Lords have no separate line.",
            "Welfare payments and debt interest are mostly Annually Managed Expenditure (AME), not DEL, so they are not in this table.",
            "Percentages use the published Total DEL as the denominator, including reserves and the negative OBR shortfall, so the department lines do not add to 100% on their own. PESA also warns that figures may not sum due to rounding.",
            "Bodies accountable to Parliament are not shown on this chart. Even the NAO is about 0.02% of Total DEL and would be invisible on this scale.",
        ],
    }


def _govmap_slugs():
    import json as _json
    gov = _json.loads((APP / "data/govmap.json").read_text(encoding="utf-8"))
    slugs = set()
    for r in gov["roots"]:
        slugs.add(r["u"].rsplit("/", 1)[-1])
    for b in gov["unattached"]:
        slugs.add(b["u"].rsplit("/", 1)[-1])
    return slugs


def main() -> int:
    data = parse_workbook(WORKBOOK)
    known = _govmap_slugs()
    missing = data["missingLines"]
    listed = missing["smallAndIndependentBodies"] + missing["noSeparateFigure"]
    if len(listed) != len(set(listed)):
        raise SystemExit("duplicate slugs in missingLines")
    overlap = set(missing["smallAndIndependentBodies"]) & set(missing["noSeparateFigure"])
    if overlap:
        raise SystemExit(f"slug in both missingLines lists: {overlap}")
    unknown = [s for s in listed if s not in known]
    if unknown:
        raise SystemExit(f"missingLines slugs not in govmap.json: {unknown}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} ({len(data['groups'])} groups, Total DEL {data['total']['plansMillion']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
