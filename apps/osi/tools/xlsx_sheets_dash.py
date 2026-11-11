#!/usr/bin/env python3
"""Dashboard sheet."""
from __future__ import annotations

from openpyxl.chart import BarChart, DoughnutChart, Reference
from openpyxl.chart.series import DataPoint
from openpyxl.formatting.rule import DataBarRule

from xlsx_common import (
    ASSESS_FIRST, BAD_BG, BAD_FG, BORDER, CREAM, FONT_BODY, FONT_MONO,
    FONT_TITLE, GOLD, GOLD_DEEP, GREEN_DARK, INK, LEGAL, MUTED, NA_BG, NA_FG,
    OK_BG, OK_FG, ROW_ALT, WARN_BG, WARN_FG, WHITE, align, apply_page,
    banner_row, fill, font, style_cell,
)


def build_dashboard(wb, data, last_row):
    ws = wb.create_sheet("Dashboard", 2)
    apply_page(ws, landscape=True, fit_width=1, fit_height=1, title="Dashboard")
    lastc = 14
    banner_row(ws, lastc, rows=2)
    ws.merge_cells("A1:N2")
    ws["A1"] = "Progress dashboard"
    style_cell(ws["A1"], fnt=font(FONT_TITLE, 20, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False))

    ws.merge_cells("A3:N3")
    ws["A3"] = (
        '="Assessment: "&IF(AssessDevice="","(device / class not yet entered)",AssessDevice)'
        '&"    Assessor: "&IF(AssessName="","(not yet entered)",AssessName)'
        '&"    Date: "&IF(AssessDate="","(not yet entered)",IF(ISNUMBER(AssessDate),TEXT(AssessDate,"DD/MM/YYYY"),AssessDate))'
        '&"    Scope: "&IF(AssessScope="","(not yet entered)",AssessScope)'
    )
    style_cell(ws["A3"], fnt=font(FONT_BODY, 10, italic=True, color=MUTED), fl=fill(CREAM), al=align("left", "center", True))
    for c in range(1, lastc + 1):
        style_cell(ws.cell(3, c), fl=fill(CREAM))
    ws.row_dimensions[3].height = 22

    n = last_row - ASSESS_FIRST + 1
    counts = {
        5: ("Achieved", '=COUNTIF(RatingCol,"Achieved")'),
        6: ("Partially achieved", '=COUNTIF(RatingCol,"Partially achieved")'),
        7: ("Not achieved", '=COUNTIF(RatingCol,"Not achieved")'),
        8: ("Not applicable", '=COUNTIF(RatingCol,"Not applicable")'),
        9: ("Not rated", '=COUNTIF(RatingCol,"")'),
        10: ("Total controls", f"={n}"),
        11: ("Rated", "=Q5+Q6+Q7+Q8"),
        12: ("Scored n", "=Q5+Q6+Q7"),
        13: ("Score sum", "=SUM(ScoreCol)"),
        14: ("% complete", '=IF(Q10=0,0,Q11/Q10)'),
        15: ("Score", '=IF(Q12=0,0,Q13/Q12)'),
    }
    for r, (label, formula) in counts.items():
        ws.cell(r, 16, label)
        ws.cell(r, 17).value = formula
        if r in (14, 15):
            ws.cell(r, 17).number_format = "0.0%"
    for col in ("P", "Q", "R", "S"):
        ws.column_dimensions[col].hidden = True

    ws["S5"] = (
        '=IF(Q11=0,"Not started",'
        'IF(Q9>0,"In progress",'
        'IF(Q7>0,"Not achieved",'
        'IF(Q6>0,"Partially achieved",'
        '"Achieved"))))'
    )

    cards = [
        (1, "Complete", "=Q14", "0%", "Share of controls with a rating, including Not applicable."),
        (4, "Score", "=IF(Q12=0,\"n/a\",TEXT(Q15,\"0%\"))", None, "Achieved = 1, Partially achieved = 0.5, Not achieved = 0. N/A and unrated are excluded."),
        (7, "Rated", '=Q11&" of "&Q10', None, "How many of the 59 controls have been considered."),
        (10, "CAF-style status", "=S5", None, "Overall status using the CAF rating language. See Start here for the rules."),
    ]
    for col, title, formula, fmt, note in cards:
        end = col + 2
        ws.merge_cells(start_row=6, start_column=col, end_row=6, end_column=end)
        ws.merge_cells(start_row=7, start_column=col, end_row=8, end_column=end)
        ws.merge_cells(start_row=9, start_column=col, end_row=10, end_column=end)
        tcell = ws.cell(6, col, title)
        vcell = ws.cell(7, col, formula)
        ncell = ws.cell(9, col, note)
        for rr in range(6, 11):
            for cc in range(col, end + 1):
                style_cell(ws.cell(rr, cc), fl=fill(CREAM), br=BORDER)
        style_cell(tcell, fnt=font(FONT_BODY, 9, bold=True, color=MUTED), fl=fill(CREAM), al=align("left", "center", True), br=BORDER)
        style_cell(vcell, fnt=font(FONT_TITLE, 22, bold=True, color=GREEN_DARK), fl=fill(CREAM), al=align("left", "center", False), br=BORDER)
        if fmt:
            vcell.number_format = fmt
        style_cell(ncell, fnt=font(FONT_BODY, 8, italic=True, color=MUTED), fl=fill(CREAM), al=align("left", "top", True), br=BORDER)
    ws.row_dimensions[6].height = 18
    ws.row_dimensions[7].height = 22
    ws.row_dimensions[8].height = 22
    ws.row_dimensions[9].height = 16
    ws.row_dimensions[10].height = 16

    ws["A12"] = "Counts by rating"
    ws.merge_cells("A12:C12")
    style_cell(ws["A12"], fnt=font(FONT_TITLE, 14, bold=True, color=GREEN_DARK))
    for i, h in enumerate(["Rating", "Count", "Share of all 59"], 1):
        style_cell(ws.cell(13, i, h), fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False), br=BORDER)
    rating_rows = [
        (14, "Achieved", "=Q5", OK_BG, OK_FG),
        (15, "Partially achieved", "=Q6", WARN_BG, WARN_FG),
        (16, "Not achieved", "=Q7", BAD_BG, BAD_FG),
        (17, "Not applicable", "=Q8", NA_BG, NA_FG),
        (18, "Not rated", "=Q9", "E6E4DE", MUTED),
    ]
    for rr, label, formula, bg, fg in rating_rows:
        ws.cell(rr, 1, label)
        ws.cell(rr, 2, formula)
        ws.cell(rr, 3, f"=IF(Q10=0,0,B{rr}/Q10)")
        ws.cell(rr, 3).number_format = "0%"
        style_cell(ws.cell(rr, 1), fnt=font(FONT_BODY, 11, bold=True, color=fg), fl=fill(bg), al=align("left", "center", False), br=BORDER)
        style_cell(ws.cell(rr, 2), fnt=font(FONT_BODY, 11, bold=True, color=fg), fl=fill(bg), al=align("center", "center", False), br=BORDER)
        style_cell(ws.cell(rr, 3), fnt=font(FONT_BODY, 11, color=fg), fl=fill(bg), al=align("center", "center", False), br=BORDER)

    donut = DoughnutChart()
    donut.title = "Ratings"
    labels = Reference(ws, min_col=1, min_row=14, max_row=18)
    data_ref = Reference(ws, min_col=2, min_row=13, max_row=18)
    donut.add_data(data_ref, titles_from_data=True)
    donut.set_categories(labels)
    donut.holeSize = 55
    donut.style = 10
    donut.legend.position = "b"
    donut.width = 8
    donut.height = 4.2
    slice_colors = [OK_BG, WARN_BG, BAD_BG, NA_BG, "C8C4BA"]
    series = donut.series[0]
    for i, colr in enumerate(slice_colors):
        pt = DataPoint(idx=i)
        pt.graphicalProperties.solidFill = colr
        series.data_points.append(pt)
    ws.add_chart(donut, "E12")

    ws["A20"] = "Progress by lifecycle stage"
    ws.merge_cells("A20:J20")
    style_cell(ws["A20"], fnt=font(FONT_TITLE, 14, bold=True, color=GREEN_DARK))
    sh = ["Stage", "Controls", "Rated", "% complete", "Score", "Achieved", "Partial", "Not achieved", "N/A", "Not rated"]
    for i, h in enumerate(sh, 1):
        style_cell(ws.cell(21, i, h), fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left" if i == 1 else "center", "center", True), br=BORDER)

    for i, stage in enumerate(data["stages"]):
        rr = 22 + i
        sid = stage["id"]
        ws.cell(rr, 1, f"{sid}. {stage['name']}")
        ws.cell(rr, 2, f"=COUNTIF(StageNumCol,{sid})")
        ws.cell(rr, 3, f'=COUNTIFS(StageNumCol,{sid},RatingCol,"<>")')
        ws.cell(rr, 4, f"=IF(B{rr}=0,0,C{rr}/B{rr})")
        ws.cell(rr, 4).number_format = '0%;-0%;"—"'
        ws.cell(rr, 6, f'=COUNTIFS(StageNumCol,{sid},RatingCol,"Achieved")')
        ws.cell(rr, 7, f'=COUNTIFS(StageNumCol,{sid},RatingCol,"Partially achieved")')
        ws.cell(rr, 8, f'=COUNTIFS(StageNumCol,{sid},RatingCol,"Not achieved")')
        ws.cell(rr, 9, f'=COUNTIFS(StageNumCol,{sid},RatingCol,"Not applicable")')
        ws.cell(rr, 10, f'=COUNTIFS(StageNumCol,{sid},RatingCol,"")')
        ws.cell(rr, 5, f"=IF((F{rr}+G{rr}+H{rr})=0,0,SUMPRODUCT((StageNumCol={sid})*(ScoreCol))/(F{rr}+G{rr}+H{rr}))")
        ws.cell(rr, 5).number_format = '0%;-0%;"—"'
        for cc in range(1, 11):
            style_cell(
                ws.cell(rr, cc),
                fnt=font(FONT_BODY, 10, color=INK),
                fl=fill(ROW_ALT) if i % 2 else fill(WHITE),
                al=align("left" if cc == 1 else "center", "center", True),
                br=BORDER,
            )
        ws.row_dimensions[rr].height = 18

    tr = 30
    ws.cell(tr, 1, "All stages")
    ws.cell(tr, 2, "=SUM(B22:B29)")
    ws.cell(tr, 3, "=SUM(C22:C29)")
    ws.cell(tr, 4, f"=IF(B{tr}=0,0,C{tr}/B{tr})")
    ws.cell(tr, 4).number_format = "0%"
    ws.cell(tr, 5, '=IF(Q12=0,0,Q15)')
    ws.cell(tr, 5).number_format = "0%"
    for cc, col in enumerate(["F", "G", "H", "I", "J"], start=6):
        ws.cell(tr, cc, f"=SUM({col}22:{col}29)")
    for cc in range(1, 11):
        style_cell(ws.cell(tr, cc), fnt=font(FONT_BODY, 10, bold=True, color=GREEN_DARK), fl=fill(GOLD), al=align("left" if cc == 1 else "center", "center", False), br=BORDER)

    rule = DataBarRule(start_type="num", start_value=0, end_type="num", end_value=1, color=GOLD_DEEP, showValue=True)
    ws.conditional_formatting.add("D22:D29", rule)
    rule2 = DataBarRule(start_type="num", start_value=0, end_type="num", end_value=1, color=OK_FG, showValue=True)
    ws.conditional_formatting.add("E22:E29", rule2)

    bar = BarChart()
    bar.type = "col"
    bar.title = "% complete by stage"
    bar.y_axis.scaling.min = 0
    bar.y_axis.scaling.max = 1
    bar.y_axis.numFmt = "0%"
    bar.add_data(Reference(ws, min_col=4, min_row=21, max_row=29), titles_from_data=True)
    bar.set_categories(Reference(ws, min_col=1, min_row=22, max_row=29))
    bar.style = 10
    bar.legend = None
    bar.width = 14
    bar.height = 5.2
    bar.series[0].graphicalProperties.solidFill = GOLD_DEEP
    ws.add_chart(bar, "A32")

    ws["L12"] = "Counts by phase"
    ws.merge_cells("L12:N12")
    style_cell(ws["L12"], fnt=font(FONT_TITLE, 14, bold=True, color=GREEN_DARK))
    ws.merge_cells("L13:N13")
    ws["L13"] = "A control may belong to more than one phase, so these rows do not add up to 59."
    style_cell(ws["L13"], fnt=font(FONT_BODY, 8, italic=True, color=MUTED), al=align("left", "center", True))
    for i, h in enumerate(["Phase", "Controls", "Rated"], 12):
        style_cell(ws.cell(14, i, h), fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False), br=BORDER)
    for rr, label, named in ((15, "Discovery", "PhaseDCol"), (16, "Alpha", "PhaseACol"), (17, "Later", "PhaseLCol")):
        ws.cell(rr, 12, label)
        ws.cell(rr, 13, f"=SUM({named})")
        ws.cell(rr, 14, f'=SUMPRODUCT(({named}=1)*(RatingCol<>""))')
        for cc in range(12, 15):
            style_cell(ws.cell(rr, cc), fnt=font(FONT_BODY, 10, color=INK), fl=fill(CREAM), al=align("left" if cc == 12 else "center", "center", False), br=BORDER)

    ws["L19"] = "Counts by tier"
    ws.merge_cells("L19:N19")
    style_cell(ws["L19"], fnt=font(FONT_TITLE, 14, bold=True, color=GREEN_DARK))
    for i, h in enumerate(["Tier", "Controls", "Rated"], 12):
        style_cell(ws.cell(20, i, h), fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", True), br=BORDER)
    for rr, label in (
        (21, "Baseline"),
        (22, "Community-proposed enhanced"),
        (23, "Baseline + community-proposed enhanced"),
    ):
        ws.cell(rr, 12, label)
        ws.cell(rr, 13, f'=COUNTIF(TierCol,"{label}")')
        ws.cell(rr, 14, f'=COUNTIFS(TierCol,"{label}",RatingCol,"<>")')
        for cc in range(12, 15):
            style_cell(ws.cell(rr, cc), fnt=font(FONT_BODY, 10, color=INK), fl=fill(CREAM), al=align("left" if cc == 12 else "center", "center", True), br=BORDER)
        ws.row_dimensions[rr].height = 28
    ws.row_dimensions[21].height = 18

    ws["A45"] = "Controls rated Not achieved"
    ws.merge_cells("A45:J45")
    style_cell(ws["A45"], fnt=font(FONT_TITLE, 14, bold=True, color=GREEN_DARK))
    ws.merge_cells("A46:J46")
    ws["A46"] = (
        '=IF(Q7=0,"None rated Not achieved yet. This list is built with ordinary INDEX/MATCH formulas so it works in older Excel as well as Microsoft 365.",'
        'Q7&" control"&IF(Q7=1," is","s are")&" rated Not achieved, listed below in ID order (up to 20). Filter the Assessment sheet on Rating = Not achieved to see the full set.")'
    )
    style_cell(ws["A46"], fnt=font(FONT_BODY, 9, italic=True, color=MUTED), al=align("left", "center", True))
    ws.row_dimensions[46].height = 28
    for i, h in enumerate(["#", "ID", "Stage", "Control statement"], 1):
        style_cell(ws.cell(47, i, h), fnt=font(FONT_BODY, 9, bold=True, color=GOLD), fl=fill(GREEN_DARK), al=align("left", "center", False), br=BORDER)
    ws.merge_cells("D47:J47")
    for cc in range(5, 11):
        style_cell(ws.cell(47, cc), fl=fill(GREEN_DARK), br=BORDER)

    for i in range(1, 21):
        rr = 47 + i
        ws.cell(rr, 1, f'=IF(B{rr}="","",{i})')
        ws.cell(rr, 2, f'=IFERROR(INDEX(IdCol,MATCH({i},NARankCol,0)),"")')
        ws.cell(rr, 3, f'=IF(B{rr}="","",IFERROR(INDEX(StageLabelCol,MATCH({i},NARankCol,0)),""))')
        ws.merge_cells(start_row=rr, start_column=4, end_row=rr, end_column=10)
        ws.cell(rr, 4, f'=IF(B{rr}="","",IFERROR(INDEX(StatementCol,MATCH({i},NARankCol,0)),""))')
        for cc in range(1, 11):
            style_cell(
                ws.cell(rr, cc),
                fnt=font(FONT_MONO, 9, bold=True, color=BAD_FG) if cc == 2 else font(FONT_BODY, 9, color=INK),
                fl=fill(BAD_BG) if i % 2 == 0 else fill(WHITE),
                al=align("left", "top", True),
                br=BORDER,
            )
        ws.row_dimensions[rr].height = 16

    foot = 69
    ws.merge_cells(f"A{foot}:N{foot}")
    ws[f"A{foot}"] = LEGAL + "  ·  Community guidance, not official NCSC guidance."
    style_cell(ws[f"A{foot}"], fnt=font(FONT_BODY, 8, italic=True, color=MUTED))

    widths = {
        "A": 28, "B": 11, "C": 11, "D": 14, "E": 12,
        "F": 11, "G": 11, "H": 13, "I": 10, "J": 11,
        "K": 3, "L": 36, "M": 12, "N": 10,
    }
    for col, w in widths.items():
        ws.column_dimensions[col].width = w
    ws.print_area = f"A1:N{foot}"
    ws.freeze_panes = "A5"
    return ws
