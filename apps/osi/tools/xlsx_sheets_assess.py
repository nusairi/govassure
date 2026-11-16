#!/usr/bin/env python3
"""Assessment sheet."""
from __future__ import annotations

from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation

from xlsx_common import (
    ASSESS_COLS, ASSESS_FIRST, ASSESS_HEADER_ROW, BAD_BG, BAD_FG, BORDER,
    CREAM, FONT_BODY, FONT_MONO, FONT_TITLE, GOLD, GREEN_DARK, HELPER_COLS,
    INK, INPUT_BG, INPUT_BORDER, MUTED, NA_BG, NA_FG, OK_BG, OK_FG, ROW_ALT,
    WARN_BG, WARN_FG, WHITE, align, apply_page, banner_row, caf_text,
    class_names_for, demark, fill, font, phase_text, set_hyperlink, style_cell,
    tier_text,
)


def build_assessment(wb, data):
    ws = wb.create_sheet("Assessment", 1)
    apply_page(ws, landscape=True, fit_width=1, fit_height=8, title="Assessment")
    last_vis_col = 18
    n = len(data["controls"])
    last_row = ASSESS_FIRST + n - 1

    banner_row(ws, last_vis_col, rows=2)
    ws.merge_cells("A1:R2")
    ws["A1"] = "Assessment  ·  rate each control on this sheet"
    style_cell(ws["A1"], fnt=font(FONT_TITLE, 18, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False))

    ws.merge_cells("A3:R3")
    ws["A3"] = (
        "Fill Rating, Evidence reference, Notes, Owner and Target date. "
        "The other columns are the generic community criteria — leave them as they are so the Dashboard keeps working. "
        "A (P) after a hardware class means public official guidance is thinner or only indirect for that class. "
        "Community guidance, not official NCSC guidance."
    )
    style_cell(ws["A3"], fnt=font(FONT_BODY, 9, italic=True, color=MUTED), fl=fill(CREAM), al=align("left", "center", True))
    for c in range(1, last_vis_col + 1):
        style_cell(ws.cell(3, c), fl=fill(CREAM))
    ws.row_dimensions[3].height = 28

    header_fill = fill(GREEN_DARK)
    header_font = font(FONT_BODY, 10, bold=True, color=GOLD)
    for i, (col, title, width) in enumerate(ASSESS_COLS, start=1):
        cell = ws.cell(ASSESS_HEADER_ROW, i, title)
        style_cell(cell, fnt=header_font, fl=header_fill, al=align("left", "center", True), br=BORDER)
        ws.column_dimensions[col].width = width
    ws.row_dimensions[ASSESS_HEADER_ROW].height = 24
    for col, title, width in HELPER_COLS:
        ws.column_dimensions[col].width = width
        cell = ws.cell(ASSESS_HEADER_ROW, ord(col) - 64, title)
        style_cell(cell, fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("center", "center", True))

    caf = data["caf"]
    classes = data["classes"]
    stages = {s["id"]: s for s in data["stages"]}

    for i, c in enumerate(data["controls"]):
        rr = ASSESS_FIRST + i
        stage = stages[c["stage"]]
        stage_label = f"{stage['id']}. {stage['name']}"
        sources = c.get("sources") or []
        values = {
            "A": c["id"],
            "B": stage_label,
            "C": demark(c["statement"]),
            "D": class_names_for(c, classes),
            "E": phase_text(c),
            "F": tier_text(c),
            "G": demark(c["evidence"]),
            "H": caf_text(c, caf),
        }
        alt = (i % 2 == 1)
        base_fl = fill(ROW_ALT) if alt else fill(WHITE)
        for col_idx, (col, title, width) in enumerate(ASSESS_COLS, start=1):
            cell = ws.cell(rr, col_idx, values.get(col))
            is_input = col in ("I", "J", "K", "L", "M")
            style_cell(
                cell,
                fnt=font(FONT_MONO, 10, bold=True, color=GREEN_DARK) if col == "A" else font(FONT_BODY, 10, color=INK),
                fl=fill(INPUT_BG) if is_input else base_fl,
                al=align("center" if col in ("A", "I", "M") else "left", "top", True),
                br=INPUT_BORDER if is_input else BORDER,
            )
        for s_i in range(5):
            cell = ws.cell(rr, 14 + s_i)
            if s_i < len(sources):
                set_hyperlink(cell, sources[s_i]["url"], sources[s_i]["label"])
                cell.fill = base_fl
                cell.border = BORDER
                cell.alignment = align("left", "top", True)
            else:
                cell.value = None
                style_cell(cell, fl=base_fl, br=BORDER)
        ws.cell(rr, 13).number_format = "DD/MM/YYYY"

        # Score: 1 / 0.5 / 0 (N/A and unrated are 0 and excluded by the score denominator)
        ws.cell(rr, 19).value = f'=IF(I{rr}="Achieved",1,IF(I{rr}="Partially achieved",0.5,0))'
        ws.cell(rr, 19).number_format = "0.0"
        if i == 0:
            ws.cell(rr, 20).value = f'=IF(I{rr}="Not achieved",1,0)'
        else:
            prev = rr - 1
            ws.cell(rr, 20).value = f'=IF(I{rr}="Not achieved",MAX($T${ASSESS_FIRST}:T{prev})+1,0)'
        ws.cell(rr, 21).value = c["stage"]
        ws.cell(rr, 22).value = tier_text(c)
        ws.cell(rr, 23).value = 1 if "D" in c["phases"] else 0
        ws.cell(rr, 24).value = 1 if "A" in c["phases"] else 0
        ws.cell(rr, 25).value = 1 if "L" in c["phases"] else 0
        for col in range(19, 26):
            style_cell(ws.cell(rr, col), fnt=font(FONT_BODY, 9, color=MUTED), al=align("center", "center", False))
        ws.row_dimensions[rr].height = 48

    dv = DataValidation(
        type="list",
        formula1="=RatingList",
        allow_blank=True,
        showDropDown=False,
        showErrorMessage=True,
        showInputMessage=True,
        errorTitle="Choose a rating",
        error="Please choose Achieved, Partially achieved, Not achieved or Not applicable.",
        promptTitle="CAF-style rating",
        prompt="Choose a rating from the list. Leave blank only if this control has not yet been considered.",
        errorStyle="warning",
    )
    dv.add(f"I{ASSESS_FIRST}:I{last_row}")
    ws.add_data_validation(dv)

    rng = f"I{ASSESS_FIRST}:I{last_row}"
    def cf(value, bg, fg):
        return CellIsRule(
            operator="equal",
            formula=[f'"{value}"'],
            fill=fill(bg),
            font=font(FONT_BODY, 10, bold=True, color=fg),
        )
    ws.conditional_formatting.add(rng, cf("Achieved", OK_BG, OK_FG))
    ws.conditional_formatting.add(rng, cf("Partially achieved", WARN_BG, WARN_FG))
    ws.conditional_formatting.add(rng, cf("Not achieved", BAD_BG, BAD_FG))
    ws.conditional_formatting.add(rng, cf("Not applicable", NA_BG, NA_FG))

    id_rng = f"A{ASSESS_FIRST}:A{last_row}"
    ws.conditional_formatting.add(
        id_rng,
        FormulaRule(formula=[f'$I{ASSESS_FIRST}="Achieved"'], fill=fill(OK_BG), font=font(FONT_MONO, 10, bold=True, color=OK_FG)),
    )
    ws.conditional_formatting.add(
        id_rng,
        FormulaRule(formula=[f'$I{ASSESS_FIRST}="Partially achieved"'], fill=fill(WARN_BG), font=font(FONT_MONO, 10, bold=True, color=WARN_FG)),
    )
    ws.conditional_formatting.add(
        id_rng,
        FormulaRule(formula=[f'$I{ASSESS_FIRST}="Not achieved"'], fill=fill(BAD_BG), font=font(FONT_MONO, 10, bold=True, color=BAD_FG)),
    )
    ws.conditional_formatting.add(
        id_rng,
        FormulaRule(formula=[f'$I{ASSESS_FIRST}="Not applicable"'], fill=fill(NA_BG), font=font(FONT_MONO, 10, bold=True, color=NA_FG)),
    )

    ws.auto_filter.ref = f"A{ASSESS_HEADER_ROW}:R{last_row}"
    ws.freeze_panes = f"A{ASSESS_FIRST}"
    ws.print_title_rows = f"1:{ASSESS_HEADER_ROW}"
    ws.print_area = f"A1:R{last_row}"
    for col in ("S", "T", "U", "V", "W", "X", "Y"):
        ws.column_dimensions[col].hidden = True

    def nm(name, ref):
        wb.defined_names.add(DefinedName(name=name, attr_text=ref))

    nm("RatingCol", f"Assessment!$I${ASSESS_FIRST}:$I${last_row}")
    nm("ScoreCol", f"Assessment!$S${ASSESS_FIRST}:$S${last_row}")
    nm("NARankCol", f"Assessment!$T${ASSESS_FIRST}:$T${last_row}")
    nm("StageNumCol", f"Assessment!$U${ASSESS_FIRST}:$U${last_row}")
    nm("TierCol", f"Assessment!$F${ASSESS_FIRST}:$F${last_row}")
    nm("IdCol", f"Assessment!$A${ASSESS_FIRST}:$A${last_row}")
    nm("StatementCol", f"Assessment!$C${ASSESS_FIRST}:$C${last_row}")
    nm("StageLabelCol", f"Assessment!$B${ASSESS_FIRST}:$B${last_row}")
    nm("PhaseDCol", f"Assessment!$W${ASSESS_FIRST}:$W${last_row}")
    nm("PhaseACol", f"Assessment!$X${ASSESS_FIRST}:$X${last_row}")
    nm("PhaseLCol", f"Assessment!$Y${ASSESS_FIRST}:$Y${last_row}")
    return last_row
