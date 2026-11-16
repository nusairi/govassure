#!/usr/bin/env python3
"""Shared styles, constants and data helpers for the hardware assurance workbook."""
from __future__ import annotations

import json
import re
from pathlib import Path

from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.page import PageMargins
from openpyxl.drawing.image import Image as XLImage
from PIL import Image as PILImage

GREEN_DARK = "0B2318"
GOLD = "F0C987"
GOLD_DEEP = "C9A15D"
GOLD_HOVER = "F7E1B8"
CREAM = "F6F4EE"
INK = "1A241F"
MUTED = "5C574C"
LINE = "D4CDBF"
WHITE = "FFFFFF"
INPUT_BG = "FFFBF2"
OK_BG, OK_FG = "D8F3E4", "123D2C"
WARN_BG, WARN_FG = "FBE9C0", "3A3214"
BAD_BG, BAD_FG = "FFD6D0", "3D1C18"
NA_BG, NA_FG = "E6E4DE", "4A4A4A"
ROW_ALT = "F6F4EE"

FONT_TITLE = "Palatino Linotype"
FONT_BODY = "Calibri"
FONT_MONO = "Consolas"

LEGAL = "GOV Assured is a community project and is not a government website"
COMMUNITY = (
    "This is community guidance, not official NCSC guidance. "
    "It does not confer official approval and is not a substitute for the "
    "organisation's security authority."
)
LINKEDIN = "https://www.linkedin.com/company/102617034/"

PHASE_LABEL = {"D": "Discovery", "A": "Alpha", "L": "Later"}
PHASE_ORDER = ["D", "A", "L"]
TIER_LABEL = {
    "core": "Baseline",
    "enhanced": "Community-proposed enhanced",
    "core-enhanced": "Baseline + community-proposed enhanced",
}

ASSESS_HEADER_ROW = 4
ASSESS_FIRST = 5

ASSESS_COLS = [
    ("A", "ID", 10),
    ("B", "Lifecycle stage", 24),
    ("C", "Control statement", 48),
    ("D", "Hardware classes it applies to", 32),
    ("E", "Phase", 22),
    ("F", "Tier", 32),
    ("G", "Evidence to request", 36),
    ("H", "CAF principle(s)", 36),
    ("I", "Rating", 22),
    ("J", "Evidence reference", 24),
    ("K", "Notes", 32),
    ("L", "Owner", 16),
    ("M", "Target date", 14),
    ("N", "Source 1", 28),
    ("O", "Source 2", 28),
    ("P", "Source 3", 28),
    ("Q", "Source 4", 28),
    ("R", "Source 5", 28),
]
HELPER_COLS = [
    ("S", "Score", 10),
    ("T", "NotAchievedRank", 12),
    ("U", "StageNum", 10),
    ("V", "TierKey", 14),
    ("W", "PhaseDiscovery", 8),
    ("X", "PhaseAlpha", 8),
    ("Y", "PhaseLater", 8),
]

THIN = Side(style="thin", color=LINE)
INPUT_BORDER = Border(
    left=Side(style="thin", color=GOLD_DEEP),
    right=Side(style="thin", color=GOLD_DEEP),
    top=Side(style="thin", color=GOLD_DEEP),
    bottom=Side(style="thin", color=GOLD_DEEP),
)
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)


def demark(text: str) -> str:
    if not text:
        return ""
    s = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    s = re.sub(r"\*([^*]+)\*", r"\1", s)
    return s.replace("\u00a0", " ").strip()


def load_data(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    m = re.search(r"window\.CHECKLIST_DATA\s*=\s*", text)
    if not m:
        raise SystemExit(f"Could not find window.CHECKLIST_DATA in {path}")
    obj = text[m.end():].strip()
    if obj.endswith(";"):
        obj = obj[:-1]
    return json.loads(obj)


def font(name=FONT_BODY, size=11, bold=False, italic=False, color=INK, underline=None):
    kw = dict(name=name, size=size, bold=bold, italic=italic, color=color)
    if underline:
        kw["underline"] = underline
    return Font(**kw)


def fill(color):
    return PatternFill("solid", fgColor=color)


def align(h="left", v="center", wrap=True):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)


def style_cell(cell, *, fnt=None, fl=None, al=None, br=None, fmt=None):
    if fnt:
        cell.font = fnt
    if fl:
        cell.fill = fl
    if al:
        cell.alignment = al
    if br:
        cell.border = br
    if fmt:
        cell.number_format = fmt


def apply_page(ws, landscape=True, fit_width=1, fit_height=0, title=""):
    ws.page_setup.orientation = "landscape" if landscape else "portrait"
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToPage = True
    ws.page_setup.fitToWidth = fit_width
    ws.page_setup.fitToHeight = fit_height
    ws.page_setup.horizontalCentered = True
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_options.horizontalCentered = True
    ws.page_margins = PageMargins(
        left=0.45, right=0.45, top=0.6, bottom=0.6, header=0.25, footer=0.28
    )
    ws.oddHeader.left.text = title or ws.title
    ws.oddHeader.right.text = "Page &P of &N"
    ws.oddFooter.left.text = "Hardware assurance checklist"
    ws.oddFooter.center.text = LEGAL
    ws.oddFooter.right.text = "Community guidance, not official NCSC guidance"
    ws.evenHeader.left.text = ws.oddHeader.left.text
    ws.evenHeader.right.text = ws.oddHeader.right.text
    ws.evenFooter.left.text = ws.oddFooter.left.text
    ws.evenFooter.center.text = ws.oddFooter.center.text
    ws.evenFooter.right.text = ws.oddFooter.right.text
    ws.sheet_view.showGridLines = False
    ws.sheet_properties.tabColor = GOLD_DEEP


def banner_row(ws, last_col, rows=2):
    ws.merge_cells(start_row=1, start_column=1, end_row=rows, end_column=last_col)
    for r in range(1, rows + 1):
        for c in range(1, last_col + 1):
            style_cell(
                ws.cell(r, c),
                fl=fill(GREEN_DARK),
                fnt=font(FONT_TITLE, 18, bold=True, color=GOLD),
                al=align("left", "center", False),
            )
    ws.row_dimensions[1].height = 22
    if rows >= 2:
        ws.row_dimensions[2].height = 22


def prepare_logo(tmpdir: Path, src: Path) -> Path:
    im = PILImage.open(src)
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    out = tmpdir / "ga-logo-xlsx.png"
    im.save(out, "PNG")
    return out


def add_logo(ws, logo_path: Path, anchor: str, width=128, height=40):
    img = XLImage(str(logo_path))
    img.width = width
    img.height = height
    ws.add_image(img, anchor)


def class_names_for(control, classes):
    bits = []
    for cl in classes:
        if cl["id"] not in control["classes"]:
            continue
        thin = bool(control["classes"][cl["id"]])
        bits.append(f"{cl['name']} (P)" if thin else cl["name"])
    return "; ".join(bits)


def phase_text(control):
    return "; ".join(PHASE_LABEL[p] for p in PHASE_ORDER if p in control["phases"])


def tier_text(control):
    kind = (control.get("tier") or {}).get("kind") or "core"
    return TIER_LABEL.get(kind, kind)


def caf_text(control, caf):
    bits = []
    for cid in control.get("caf") or []:
        meta = caf.get(cid) or {}
        title = meta.get("title") or ""
        bits.append(f"{cid} {title}".strip())
    return "; ".join(bits)


def collect_sources(data):
    by_url = {}
    for c in data["controls"]:
        for s in c.get("sources") or []:
            url = s["url"]
            rec = by_url.setdefault(url, {"url": url, "labels": [], "controls": []})
            if s["label"] not in rec["labels"]:
                rec["labels"].append(s["label"])
            if c["id"] not in rec["controls"]:
                rec["controls"].append(c["id"])
    for cid, meta in data["caf"].items():
        url = meta["url"]
        rec = by_url.setdefault(url, {"url": url, "labels": [], "controls": []})
        label = f"CAF {cid} {meta['title']}"
        if label not in rec["labels"]:
            rec["labels"].append(label)
        for c in data["controls"]:
            if cid in (c.get("caf") or []) and c["id"] not in rec["controls"]:
                rec["controls"].append(c["id"])
    rows = []
    for url, rec in by_url.items():
        rows.append({
            "title": rec["labels"][0],
            "also": rec["labels"][1:],
            "url": url,
            "controls": rec["controls"],
        })
    rows.sort(key=lambda r: r["title"].lower())
    return rows


def set_hyperlink(cell, url, label):
    cell.value = label
    cell.hyperlink = url
    cell.font = font(FONT_BODY, 11, color="1F4A3A", underline="single")
    cell.alignment = align("left", "center", True)
