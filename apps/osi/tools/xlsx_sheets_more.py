#!/usr/bin/env python3
"""Coverage matrix and Sources sheets."""
from __future__ import annotations

from openpyxl.comments import Comment
from openpyxl.utils import get_column_letter

from xlsx_common import (
    BORDER, CREAM, FONT_BODY, FONT_MONO, FONT_TITLE, GOLD, GREEN_DARK, INK,
    LEGAL, MUTED, ROW_ALT, WHITE, align, apply_page, banner_row,
    collect_sources, fill, font, set_hyperlink, style_cell,
)


def build_coverage(wb, data, matrix_last):
    ws = wb.create_sheet("Coverage matrix", 3)
    apply_page(ws, landscape=True, fit_width=1, fit_height=1, title="Coverage matrix")
    nclass = len(data["classes"])
    lastc = 2 + nclass  # A + 14 classes + Total
    tot_col = lastc
    banner_row(ws, lastc, rows=2)
    ws.merge_cells(start_row=1, start_column=1, end_row=2, end_column=lastc)
    ws["A1"] = "Coverage matrix  ·  how many controls apply to each class at each stage"
    style_cell(ws["A1"], fnt=font(FONT_TITLE, 16, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False))

    ws.merge_cells(start_row=3, start_column=1, end_row=4, end_column=lastc)
    ws["A3"] = (
        "Each cell is a COUNTIFS formula against the coverage map (the same mapping as the web checklist). "
        "A control can appear in more than one stage. A second figure in brackets, such as (2P), is the number "
        "of those controls where public official guidance is thinner or only indirect for that class. "
        "The Total column counts unique controls in that stage. These counts do not change when you enter ratings."
    )
    style_cell(ws["A3"], fnt=font(FONT_BODY, 9, italic=True, color=MUTED), fl=fill(CREAM), al=align("left", "top", True))
    for c in range(1, lastc + 1):
        style_cell(ws.cell(3, c), fl=fill(CREAM))
        style_cell(ws.cell(4, c), fl=fill(CREAM))
    ws.row_dimensions[3].height = 18
    ws.row_dimensions[4].height = 18

    ws.cell(5, 1, "Stage")
    style_cell(ws.cell(5, 1), fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", True), br=BORDER)
    for i, cl in enumerate(data["classes"], start=2):
        cell = ws.cell(5, i, cl["id"])
        style_cell(cell, fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("center", "center", True), br=BORDER)
        cell.comment = Comment(cl["name"], "GOV Assured")
        cell.comment.width = 160
        cell.comment.height = 40
    style_cell(ws.cell(5, tot_col, "Total"), fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("center", "center", True), br=BORDER)

    # Calc columns: A StageNum, B ClassId, C ControlId, D Partial,
    # E FirstInStage, F FirstInClass, G FirstControl, H FirstPartialInClass
    a = f"Calc!$A$2:$A${matrix_last}"
    b = f"Calc!$B$2:$B${matrix_last}"
    d = f"Calc!$D$2:$D${matrix_last}"
    e = f"Calc!$E$2:$E${matrix_last}"
    fcol = f"Calc!$F$2:$F${matrix_last}"
    g = f"Calc!$G$2:$G${matrix_last}"
    h = f"Calc!$H$2:$H${matrix_last}"

    for i, stage in enumerate(data["stages"]):
        rr = 6 + i
        sid = stage["id"]
        ws.cell(rr, 1, f"{stage['id']}. {stage['short']}")
        style_cell(ws.cell(rr, 1), fnt=font(FONT_BODY, 10, bold=True, color=INK), fl=fill(CREAM), al=align("left", "center", True), br=BORDER)
        for j, cl in enumerate(data["classes"], start=2):
            cid = cl["id"]
            formula = (
                f'=COUNTIFS({a},{sid},{b},"{cid}")'
                f'&IF(COUNTIFS({a},{sid},{b},"{cid}",{d},"P")>0,'
                f'" ("&COUNTIFS({a},{sid},{b},"{cid}",{d},"P")&"P)","")'
            )
            ws.cell(rr, j, formula)
            style_cell(
                ws.cell(rr, j),
                fnt=font(FONT_BODY, 9, color=INK),
                fl=fill(WHITE if i % 2 == 0 else ROW_ALT),
                al=align("center", "center", False),
                br=BORDER,
            )
        ws.cell(rr, tot_col, f"=SUMIF({a},{sid},{e})")
        style_cell(ws.cell(rr, tot_col), fnt=font(FONT_BODY, 10, bold=True, color=GREEN_DARK), fl=fill(GOLD), al=align("center", "center", False), br=BORDER)
        ws.row_dimensions[rr].height = 22

    tr = 14
    ws.cell(tr, 1, "All stages (unique controls)")
    style_cell(ws.cell(tr, 1), fnt=font(FONT_BODY, 9, bold=True, color=GREEN_DARK), fl=fill(GOLD), al=align("left", "center", True), br=BORDER)
    for j, cl in enumerate(data["classes"], start=2):
        cid = cl["id"]
        formula = (
            f'=SUMIF({b},"{cid}",{fcol})'
            f'&IF(SUMIF({b},"{cid}",{h})>0," ("&SUMIF({b},"{cid}",{h})&"P)","")'
        )
        ws.cell(tr, j, formula)
        style_cell(ws.cell(tr, j), fnt=font(FONT_BODY, 9, bold=True, color=GREEN_DARK), fl=fill(GOLD), al=align("center", "center", False), br=BORDER)
    ws.cell(tr, tot_col, f"=SUM({g})")
    style_cell(ws.cell(tr, tot_col), fnt=font(FONT_BODY, 10, bold=True, color=GREEN_DARK), fl=fill(GOLD), al=align("center", "center", False), br=BORDER)
    ws.row_dimensions[tr].height = 24

    ws["A16"] = "Hardware class legend"
    ws.merge_cells("A16:P16")
    style_cell(ws["A16"], fnt=font(FONT_TITLE, 14, bold=True, color=GREEN_DARK))
    mid = 8
    half = (len(data["classes"]) + 1) // 2
    for col_id, col_name, merge_end, title_id, title_name in (
        (1, 2, 7, "ID", "Hardware class"),
        (mid, mid + 1, 16, "ID", "Hardware class"),
    ):
        ws.cell(17, col_id, title_id)
        ws.merge_cells(start_row=17, start_column=col_name, end_row=17, end_column=merge_end)
        ws.cell(17, col_name, title_name)
        style_cell(ws.cell(17, col_id), fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("center", "center", False), br=BORDER)
        for cc in range(col_name, merge_end + 1):
            style_cell(ws.cell(17, cc), fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False), br=BORDER)

    for i, cl in enumerate(data["classes"]):
        if i < half:
            rr = 18 + i
            col_id, col_name, merge_end = 1, 2, 7
        else:
            rr = 18 + (i - half)
            col_id, col_name, merge_end = mid, mid + 1, 16
        # merges may be created twice if we call merge in the loop for the second column
        # First pass creates left, second pass right. OK if we only merge once per cell.
        try:
            ws.merge_cells(start_row=rr, start_column=col_name, end_row=rr, end_column=merge_end)
        except ValueError:
            pass
        ws.cell(rr, col_id, cl["id"])
        ws.cell(rr, col_name, cl["name"])
        style_cell(ws.cell(rr, col_id), fnt=font(FONT_MONO, 9, bold=True, color=GREEN_DARK), fl=fill(CREAM), al=align("center", "center", False), br=BORDER)
        for cc in range(col_name, merge_end + 1):
            style_cell(ws.cell(rr, cc), fnt=font(FONT_BODY, 10, color=INK), fl=fill(WHITE), al=align("left", "center", True), br=BORDER)
        ws.row_dimensions[rr].height = 18

    foot = 18 + half + 1
    ws.merge_cells(start_row=foot, start_column=1, end_row=foot, end_column=lastc)
    ws.cell(foot, 1, LEGAL + "  ·  Community guidance, not official NCSC guidance.")
    style_cell(ws.cell(foot, 1), fnt=font(FONT_BODY, 8, italic=True, color=MUTED))

    ws.column_dimensions["A"].width = 26
    for i in range(2, tot_col):
        ws.column_dimensions[get_column_letter(i)].width = 8
    ws.column_dimensions[get_column_letter(tot_col)].width = 10
    ws.print_area = f"A1:{get_column_letter(lastc)}{foot}"
    ws.freeze_panes = "B6"
    return ws


def build_sources(wb, data):
    ws = wb.create_sheet("Sources", 4)
    apply_page(ws, landscape=True, fit_width=1, fit_height=3, title="Sources")
    lastc = 6
    banner_row(ws, lastc, rows=2)
    ws.merge_cells("A1:F2")
    ws["A1"] = "Sources  ·  public official links cited by the checklist"
    style_cell(ws["A1"], fnt=font(FONT_TITLE, 16, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False))
    ws.merge_cells("A3:F3")
    ws["A3"] = (
        "Every link is a public official or standards page used by the generic community checklist. "
        "This list is community guidance, not official NCSC guidance. Links open when you have a network connection."
    )
    style_cell(ws["A3"], fnt=font(FONT_BODY, 9, italic=True, color=MUTED), fl=fill(CREAM), al=align("left", "center", True))
    for c in range(1, lastc + 1):
        style_cell(ws.cell(3, c), fl=fill(CREAM))
    ws.row_dimensions[3].height = 24

    headers = ["#", "Title", "URL", "Also listed as", "Cited by"]
    for i, h in enumerate(headers, 1):
        style_cell(ws.cell(4, i, h), fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", True), br=BORDER)
    style_cell(ws.cell(4, 6), fl=fill(GREEN_DARK), br=BORDER)
    ws.merge_cells("E4:F4")

    rows = collect_sources(data)
    for i, rec in enumerate(rows, start=1):
        rr = 4 + i
        ws.cell(rr, 1, i)
        set_hyperlink(ws.cell(rr, 2), rec["url"], rec["title"])
        set_hyperlink(ws.cell(rr, 3), rec["url"], rec["url"])
        ws.cell(rr, 4, "; ".join(rec["also"]))
        ws.merge_cells(start_row=rr, start_column=5, end_row=rr, end_column=6)
        ws.cell(rr, 5, ", ".join(rec["controls"]))
        base = fill(ROW_ALT) if i % 2 == 0 else fill(WHITE)
        for cc in range(1, 7):
            cell = ws.cell(rr, cc)
            if cc not in (2, 3):
                style_cell(cell, fnt=font(FONT_BODY, 9, color=INK), fl=base, al=align("left", "top", True), br=BORDER)
            else:
                cell.fill = base
                cell.border = BORDER
                cell.alignment = align("left", "top", True)
        ws.row_dimensions[rr].height = 22

    last_row = 4 + len(rows)
    foot = last_row + 2
    ws.merge_cells(f"A{foot}:F{foot}")
    ws[f"A{foot}"] = LEGAL + "  ·  Community guidance, not official NCSC guidance."
    style_cell(ws[f"A{foot}"], fnt=font(FONT_BODY, 8, italic=True, color=MUTED))

    ws.column_dimensions["A"].width = 5
    ws.column_dimensions["B"].width = 42
    ws.column_dimensions["C"].width = 55
    ws.column_dimensions["D"].width = 36
    ws.column_dimensions["E"].width = 28
    ws.column_dimensions["F"].width = 20
    ws.auto_filter.ref = f"A4:F{last_row}"
    ws.freeze_panes = "A5"
    ws.print_title_rows = "1:4"
    ws.print_area = f"A1:F{foot}"
    return ws, len(rows)
