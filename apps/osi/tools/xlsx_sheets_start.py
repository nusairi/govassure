#!/usr/bin/env python3
"""Start here, Lists and hidden Calc sheets."""
from __future__ import annotations

from openpyxl.workbook.defined_name import DefinedName

from xlsx_common import (
    ASSESS_FIRST, BORDER, COMMUNITY, CREAM, FONT_BODY, FONT_TITLE, GOLD,
    GOLD_DEEP, GOLD_HOVER, GREEN_DARK, INK, INPUT_BG, INPUT_BORDER, LEGAL,
    LINKEDIN, MUTED, NA_BG, NA_FG, OK_BG, OK_FG, WARN_BG, WARN_FG, BAD_BG,
    BAD_FG, WHITE, add_logo, align, apply_page, banner_row, fill, font,
    style_cell, set_hyperlink,
)


def build_lists(wb):
    ws = wb.create_sheet("Lists")
    apply_page(ws, landscape=True, fit_width=1, fit_height=1, title="Lists")
    ws["A1"] = "Rating list (used by the Assessment dropdown)"
    style_cell(ws["A1"], fnt=font(FONT_TITLE, 14, bold=True, color=GREEN_DARK), al=align("left", "center", False))
    ws.merge_cells("A1:C1")
    ws["A2"] = "Value"
    style_cell(ws["A2"], fnt=font(FONT_BODY, 10, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False), br=BORDER)
    ratings = ["Achieved", "Partially achieved", "Not achieved", "Not applicable"]
    fills = [OK_BG, WARN_BG, BAD_BG, NA_BG]
    fgs = [OK_FG, WARN_FG, BAD_FG, NA_FG]
    for i, (r, bg, fg) in enumerate(zip(ratings, fills, fgs), start=3):
        ws.cell(i, 1, r)
        style_cell(ws.cell(i, 1), fnt=font(FONT_BODY, 11, bold=True, color=fg), fl=fill(bg), al=align("left", "center", False), br=BORDER)
    ws["A8"] = (
        "This sheet feeds the Rating dropdown on the Assessment sheet. "
        "Leave these values as they are so the Dashboard formulas keep working."
    )
    ws.merge_cells("A8:F8")
    style_cell(ws["A8"], fnt=font(FONT_BODY, 10, italic=True, color=MUTED), al=align("left", "center", True))
    ws.row_dimensions[8].height = 32
    ws["A10"] = "Score map (for reference)"
    style_cell(ws["A10"], fnt=font(FONT_BODY, 11, bold=True, color=GREEN_DARK))
    rows = [("Achieved", 1), ("Partially achieved", 0.5), ("Not achieved", 0), ("Not applicable", "Excluded")]
    ws["A11"] = "Rating"
    ws["B11"] = "Score"
    style_cell(ws["A11"], fnt=font(FONT_BODY, 10, bold=True, color=GOLD), fl=fill(GREEN_DARK), br=BORDER)
    style_cell(ws["B11"], fnt=font(FONT_BODY, 10, bold=True, color=GOLD), fl=fill(GREEN_DARK), br=BORDER)
    for i, (name, val) in enumerate(rows, start=12):
        ws.cell(i, 1, name)
        ws.cell(i, 2, val)
        style_cell(ws.cell(i, 1), fnt=font(FONT_BODY, 11, color=INK), br=BORDER)
        style_cell(ws.cell(i, 2), fnt=font(FONT_BODY, 11, color=INK), br=BORDER, al=align("center", "center", False))
    ws.column_dimensions["A"].width = 28
    ws.column_dimensions["B"].width = 14
    ws.column_dimensions["C"].width = 24
    ws.row_dimensions[1].height = 22
    return ws


def build_start(wb, data, logo_path, n):
    ws = wb.create_sheet("Start here", 0)
    apply_page(ws, landscape=True, fit_width=1, fit_height=1, title="Start here")
    last = 8
    for r in range(1, 4):
        for c in range(1, last + 1):
            style_cell(ws.cell(r, c), fl=fill(GREEN_DARK), al=align("left", "center", False))
    ws.merge_cells("C1:H2")
    ws["C1"] = "Hardware assurance checklist"
    style_cell(ws["C1"], fnt=font(FONT_TITLE, 22, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False))
    ws.merge_cells("C3:H3")
    ws["C3"] = "Offline assessment workbook  ·  for use on your own laptop"
    style_cell(ws["C3"], fnt=font(FONT_BODY, 11, italic=True, color=GOLD_HOVER), fl=fill(GREEN_DARK), al=align("left", "center", False))
    add_logo(ws, logo_path, "A1", width=133, height=42)
    ws.row_dimensions[1].height = 18
    ws.row_dimensions[2].height = 18
    ws.row_dimensions[3].height = 18
    for c in range(1, last + 1):
        ws.cell(4, c).fill = fill(GOLD_DEEP)
    ws.row_dimensions[4].height = 6

    ws.merge_cells("A6:H6")
    ws["A6"] = "Purpose"
    style_cell(ws["A6"], fnt=font(FONT_TITLE, 16, bold=True, color=GREEN_DARK))
    ws.merge_cells("A7:H8")
    ws["A7"] = (
        "Use this workbook to assess hardware against the 59 generic community controls "
        "that sit across the eight-stage hardware security lifecycle. Assess one device, "
        "or one hardware class (for example all laptops, or a vendor organisation), at a time "
        "on your own laptop. Rate each control Achieved, Partially achieved, Not achieved or "
        "Not applicable, using the same discipline as NCSC's Cyber Assessment Framework (CAF) v4.0. "
        "The Dashboard sheet keeps a live progress view while you work."
    )
    style_cell(ws["A7"], fnt=font(FONT_BODY, 11, color=INK), al=align("left", "top", True))
    ws.row_dimensions[7].height = 22
    ws.row_dimensions[8].height = 22

    ws.merge_cells("A10:H10")
    ws["A10"] = "How to use"
    style_cell(ws["A10"], fnt=font(FONT_TITLE, 16, bold=True, color=GREEN_DARK))
    steps = [
        "1. Fill in the assessment details below (assessor, device or hardware class, date and scope). Leave them blank until you start. Do not put classified or programme-specific detail in a copy of this file that is shared or stored insecurely.",
        "2. Open the Assessment sheet. Work through the controls that apply to the device or class you are assessing. For each one, choose a rating and record an evidence reference, notes, an owner and a target date where you need them.",
        "3. If a control does not apply to this assessment, rate it Not applicable and say why in the notes. Do not leave it blank — a blank rating means it has not yet been considered.",
        "4. Watch progress on the Dashboard. The charts, counts, score and overall CAF-style status are formulas and update when you enter ratings (in Excel this is usually automatic; in LibreOffice press F9 if a total has not refreshed).",
        "5. Use the Coverage matrix to see how many controls apply to each hardware class at each lifecycle stage. Open Sources for the public official links cited by the controls.",
        "6. Rows marked Community-proposed enhanced are a suggested uplift for higher-classification work. They are not an official NCSC profile. The organisation's security authority may raise, lower or replace them.",
    ]
    for i, step in enumerate(steps):
        rr = 11 + i
        ws.merge_cells(f"A{rr}:H{rr}")
        ws[f"A{rr}"] = step
        style_cell(ws[f"A{rr}"], fnt=font(FONT_BODY, 11, color=INK), al=align("left", "top", True))
        ws.row_dimensions[rr].height = 32

    ws.merge_cells("A18:H18")
    ws["A18"] = "Rating scale"
    style_cell(ws["A18"], fnt=font(FONT_TITLE, 16, bold=True, color=GREEN_DARK))
    scale = [
        ("Achieved", OK_BG, OK_FG, "The control is met, and you can point to evidence."),
        ("Partially achieved", WARN_BG, WARN_FG, "Some of the intent is met, but there is a clear gap or a dependency still open."),
        ("Not achieved", BAD_BG, BAD_FG, "The control is not met, or you have no evidence that it is."),
        ("Not applicable", NA_BG, NA_FG, "The control does not apply to this device or class. Say why in the notes."),
    ]
    ws["A19"] = "Rating"
    ws.merge_cells("B19:H19")
    ws["B19"] = "Meaning"
    for col in range(1, 9):
        style_cell(ws.cell(19, col), fnt=font(FONT_BODY, 10, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False), br=BORDER)
    for i, (name, bg, fg, meaning) in enumerate(scale):
        rr = 20 + i
        ws[f"A{rr}"] = name
        ws.merge_cells(f"B{rr}:H{rr}")
        ws[f"B{rr}"] = meaning
        style_cell(ws[f"A{rr}"], fnt=font(FONT_BODY, 11, bold=True, color=fg), fl=fill(bg), al=align("left", "center", False), br=BORDER)
        for col in range(2, 9):
            style_cell(ws.cell(rr, col), fnt=font(FONT_BODY, 11, color=INK), fl=fill(bg), al=align("left", "center", True), br=BORDER)
        ws.row_dimensions[rr].height = 20

    ws.merge_cells("A25:H25")
    ws["A25"] = "Scoring on the Dashboard"
    style_cell(ws["A25"], fnt=font(FONT_TITLE, 16, bold=True, color=GREEN_DARK))
    ws.merge_cells("A26:H26")
    ws["A26"] = (
        "% complete is the share of the 59 controls that have any rating, including Not applicable. "
        "The score treats Achieved as 1, Partially achieved as 0.5 and Not achieved as 0, and excludes "
        "Not applicable and unrated controls. The overall CAF-style status is Achieved only when every "
        "control has a rating and no applicable control is short of Achieved; Partially achieved when all "
        "are rated, none are Not achieved, and at least one is Partially achieved; Not achieved if any "
        "control is Not achieved once the sheet is complete; and In progress while ratings are still blank."
    )
    style_cell(ws["A26"], fnt=font(FONT_BODY, 11, color=INK), al=align("left", "top", True))
    ws.row_dimensions[26].height = 48

    ws.merge_cells("A28:H28")
    ws["A28"] = "Community guidance note"
    style_cell(ws["A28"], fnt=font(FONT_TITLE, 16, bold=True, color=GREEN_DARK))
    ws.merge_cells("A29:H29")
    ws["A29"] = COMMUNITY + " " + LEGAL + "."
    style_cell(ws["A29"], fnt=font(FONT_BODY, 11, italic=True, color=INK), al=align("left", "top", True), fl=fill(CREAM), br=BORDER)
    for col in range(2, 9):
        style_cell(ws.cell(29, col), fl=fill(CREAM), br=BORDER)
    ws.row_dimensions[29].height = 36

    ws["A31"] = "LinkedIn"
    style_cell(ws["A31"], fnt=font(FONT_BODY, 11, bold=True, color=GREEN_DARK), al=align("left", "center", False))
    ws.merge_cells("B31:D31")
    set_hyperlink(ws["B31"], LINKEDIN, "GOV Assured on LinkedIn")
    ws["E31"] = "Workbook version"
    style_cell(ws["E31"], fnt=font(FONT_BODY, 11, bold=True, color=GREEN_DARK), al=align("right", "center", False))
    ws.merge_cells("F31:H31")
    ws["F31"] = f"{data.get('version', '')}  ·  criteria dated {data.get('generated', '')}  ·  {n} controls"
    style_cell(ws["F31"], fnt=font(FONT_BODY, 11, color=INK), al=align("left", "center", False))

    ws.merge_cells("A33:H33")
    ws["A33"] = "Assessment details"
    style_cell(ws["A33"], fnt=font(FONT_TITLE, 16, bold=True, color=GREEN_DARK))
    ws.merge_cells("A34:H34")
    ws["A34"] = (
        "Type into the gold-outlined cells. They are left blank for you to complete. "
        "Do not enter personal names in a published or widely shared copy if your organisation would not want them there."
    )
    style_cell(ws["A34"], fnt=font(FONT_BODY, 10, italic=True, color=MUTED), al=align("left", "center", True))

    details = [
        (36, "Assessor", "AssessName", "The person or role carrying out this assessment."),
        (37, "Device / hardware class", "AssessDevice", "For example a specific laptop model, or “Laptops” as a class."),
        (38, "Date", "AssessDate", "The date of this assessment (day/month/year)."),
        (39, "Scope", "AssessScope", "What is in scope, and what is out of scope, for this pass."),
    ]
    ws["A35"] = "Field"
    ws.merge_cells("B35:D35")
    ws["B35"] = "Enter here"
    ws.merge_cells("E35:H35")
    ws["E35"] = "Guidance"
    for col in range(1, 9):
        style_cell(ws.cell(35, col), fnt=font(FONT_BODY, 10, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False), br=BORDER)

    named_cells = {}
    for rr, label, name, hint in details:
        ws[f"A{rr}"] = label
        style_cell(ws[f"A{rr}"], fnt=font(FONT_BODY, 11, bold=True, color=INK), fl=fill(CREAM), al=align("left", "center", False), br=BORDER)
        ws.merge_cells(f"B{rr}:D{rr}")
        cell = ws[f"B{rr}"]
        cell.value = None
        style_cell(cell, fnt=font(FONT_BODY, 11, color=INK), fl=fill(INPUT_BG), al=align("left", "center", True), br=INPUT_BORDER)
        for col in range(2, 5):
            style_cell(ws.cell(rr, col), fl=fill(INPUT_BG), br=INPUT_BORDER)
        ws.merge_cells(f"E{rr}:H{rr}")
        ws[f"E{rr}"] = hint
        for col in range(5, 9):
            style_cell(ws.cell(rr, col), fnt=font(FONT_BODY, 10, italic=True, color=MUTED), fl=fill(WHITE), al=align("left", "center", True), br=BORDER)
        ws.row_dimensions[rr].height = 22
        named_cells[name] = f"'Start here'!$B${rr}"
    ws["B38"].number_format = "DD/MM/YYYY"

    ws.merge_cells("A41:H41")
    ws["A41"] = LEGAL
    style_cell(ws["A41"], fnt=font(FONT_BODY, 9, italic=True, color=MUTED), al=align("left", "center", False))

    widths = {"A": 28, "B": 22, "C": 18, "D": 18, "E": 18, "F": 16, "G": 16, "H": 18}
    for col, w in widths.items():
        ws.column_dimensions[col].width = w
    for r in (6, 10, 18, 25, 28, 33):
        ws.row_dimensions[r].height = 22
    ws.freeze_panes = "A5"
    ws.print_area = "A1:H41"
    return named_cells


def build_calc(wb, data):
    """Hidden sheet: one row per coverage-matrix appearance, plus first-occurrence flags."""
    ws = wb.create_sheet("Calc")
    ws.sheet_state = "hidden"
    headers = [
        "StageNum", "ClassId", "ControlId", "Partial",
        "FirstInStage", "FirstInClass", "FirstControl", "FirstPartialInClass",
    ]
    for i, h in enumerate(headers, 1):
        ws.cell(1, i, h)
    r = 2
    for row in data["matrix"]:
        stage = row["stage"]
        for cl in data["classes"]:
            items = (row.get("cells") or {}).get(cl["id"]) or []
            for it in items:
                ws.cell(r, 1, stage)
                ws.cell(r, 2, cl["id"])
                ws.cell(r, 3, it["id"])
                ws.cell(r, 4, "P" if it.get("partial") else "N")
                # First occurrence helpers (ordinary COUNTIFS, no array formulas)
                ws.cell(r, 5, f'=IF(COUNTIFS($A$2:A{r},A{r},$C$2:C{r},C{r})=1,1,0)')
                ws.cell(r, 6, f'=IF(COUNTIFS($B$2:B{r},B{r},$C$2:C{r},C{r})=1,1,0)')
                ws.cell(r, 7, f'=IF(COUNTIFS($C$2:C{r},C{r})=1,1,0)')
                ws.cell(r, 8, f'=IF(AND(D{r}="P",COUNTIFS($B$2:B{r},B{r},$C$2:C{r},C{r},$D$2:D{r},"P")=1),1,0)')
                r += 1
    last = r - 1
    return last


def add_named_inputs(wb, named_cells):
    for name, ref in named_cells.items():
        wb.defined_names.add(DefinedName(name=name, attr_text=ref))
    wb.defined_names.add(DefinedName(name="RatingList", attr_text="Lists!$A$3:$A$6"))
