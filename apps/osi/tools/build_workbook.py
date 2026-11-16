#!/usr/bin/env python3
"""Build the offline Hardware assurance checklist workbook from checklist-data.js.

Usage:
  python3 tools/build_workbook.py
  python3 tools/build_workbook.py --out /path/to/file.xlsx

The workbook is for offline assessment on a laptop. No macros. Formulas only
for the dashboard and coverage counts. Community guidance, not official NCSC
guidance.
"""
from __future__ import annotations

import argparse
import shutil
import sys
import tempfile
from pathlib import Path

# Allow "python3 tools/build_workbook.py" from the app root or tools dir
TOOLS = Path(__file__).resolve().parent
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

from openpyxl import Workbook

from xlsx_common import LEGAL, load_data, prepare_logo
from xlsx_sheets_start import add_named_inputs, build_calc, build_lists, build_start
from xlsx_sheets_assess import build_assessment
from xlsx_sheets_dash import build_dashboard
from xlsx_sheets_more import build_coverage, build_sources

ROOT = TOOLS.parent
DEFAULT_DATA = ROOT / "checklist-data.js"
DEFAULT_OUT = ROOT / "downloads" / "hardware-assurance-checklist.xlsx"
LOGO_SRC = ROOT / "ga-logo.png"


def build(data, out_path: Path, tmpdir: Path):
    logo_path = prepare_logo(tmpdir, LOGO_SRC)
    wb = Workbook()
    default = wb.active
    default.title = "_tmp"

    n = len(data["controls"])
    named_cells = build_start(wb, data, logo_path, n)
    build_lists(wb)
    matrix_last = build_calc(wb, data)
    last_row = build_assessment(wb, data)
    build_dashboard(wb, data, last_row)
    build_coverage(wb, data, matrix_last)
    _, nsrc = build_sources(wb, data)
    add_named_inputs(wb, named_cells)

    del wb["_tmp"]

    order = ["Start here", "Assessment", "Dashboard", "Coverage matrix", "Sources", "Lists", "Calc"]
    for i, name in enumerate(order):
        current = wb.sheetnames.index(name)
        if current != i:
            wb.move_sheet(name, offset=i - current)

    wb.properties.creator = "GOV Assured"
    wb.properties.title = "Hardware assurance checklist"
    wb.properties.subject = "Community hardware assurance checklist across the eight-stage lifecycle"
    wb.properties.description = "Community guidance, not official NCSC guidance. " + LEGAL + "."
    wb.properties.keywords = "hardware assurance, CAF, community checklist"
    wb.properties.category = "Assessment workbook"
    wb.calculation.calcMode = "auto"
    wb.calculation.fullCalcOnLoad = True
    wb.calculation.calcOnSave = True
    wb.calculation.iterate = False

    out_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out_path)
    return {"controls": n, "sources": nsrc, "last_row": last_row, "matrix_last": matrix_last}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=Path, default=DEFAULT_DATA)
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--docs-copy", type=Path, default=None,
                    help="optional extra path to copy the workbook to")
    args = ap.parse_args()
    data = load_data(args.data)
    with tempfile.TemporaryDirectory(prefix="hw-xlsx-build-") as td:
        info = build(data, args.out, Path(td))
    if args.docs_copy:
        args.docs_copy.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(args.out, args.docs_copy)
    print("Wrote", args.out, "size", args.out.stat().st_size)
    if args.docs_copy:
        print("Copied", args.docs_copy)
    print("Controls", info["controls"], "source URL rows", info["sources"])
    print("Assessment last row", info["last_row"], "matrix rows", info["matrix_last"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
