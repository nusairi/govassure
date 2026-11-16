#!/usr/bin/env python3
"""Build the govmap glossary: govmap/glossary/index.html (static terms, no outside links)
and data/govmap-glossary.json (sources, example slugs, map filters; gov.uk links are added by JS).
Usage: python3 scripts/build_glossary.py [--check-urls]
Definitions are written in our own words, based on Cabinet Office / GOV.UK guidance (OGL v3.0).
"""
import html, json, re, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Hub files sit at the repo root; the box snapshot keeps them under app/.
APP = ROOT / "app" if (ROOT / "app" / "index.html").is_file() else ROOT
G = "https://www.gov.uk"
SRC = {
    "orgs": ("GOV.UK: Departments, agencies and public bodies", G + "/government/organisations"),
    "class": ("Cabinet Office: Classification of public bodies – information and guidance", G + "/government/publications/classification-of-public-bodies-information-and-guidance"),
    "pb": ("Cabinet Office: Public bodies", G + "/guidance/public-bodies-reform"),
    "pb2023": ("Cabinet Office: Public bodies 2023", G + "/government/publications/public-bodies-2023"),
    "sponsor": ("Cabinet Office: Arm's length body sponsorship code of good practice", G + "/government/publications/arms-length-body-sponsorship-code-of-good-practice"),
    "devo": ("GOV.UK: Devolution – Scotland, Wales and Northern Ireland", G + "/government/collections/devolution-scotland-wales-and-northern-ireland"),
    "hmcts": ("GOV.UK: HM Courts & Tribunals Service", G + "/government/organisations/hm-courts-and-tribunals-service"),
    "pesa": ("HM Treasury: Public Expenditure Statistical Analyses 2026", G + "/government/statistics/public-expenditure-statistical-analyses-2026"),
    "estimates": ("HM Treasury: Main Supply Estimates 2026 to 2027", G + "/government/publications/main-supply-estimates-2026-to-2027"),
}
# id, term, short, definition, map {"show"|"type"|"types"|"expand"}, count key, examples (slugs), sources
TERMS = [
    ("ad-hoc-advisory-group", "Ad-hoc advisory group", None,
     "A temporary group of advisers set up for one task or a fixed period, such as reviewing evidence on a particular issue. It is usually less formal than an advisory NDPB and is wound up when its work is done.",
     {"type": "adhoc"}, "type:adhoc", ["labour-market-evidence-group", "building-control-independent-panel"], ["class", "orgs"]),
    ("advisory-ndpb", "Advisory NDPB", "Advisory non-departmental public body",
     "A non-departmental public body whose job is to give ministers independent, expert advice rather than to run services. Its members are usually specialists, and the sponsor department normally provides its staff and pays its costs.",
     {"type": "andpb"}, "type:andpb", ["low-pay-commission", "advisory-council-on-the-misuse-of-drugs"], ["pb", "class"]),
    ("arms-length-body", "Arm's-length body", "ALB",
     "The umbrella term for public bodies that work at a distance from ministers but are still accountable to them through a sponsor department. The Cabinet Office counts three kinds: executive agencies, non-departmental public bodies (executive, advisory and tribunal) and non-ministerial departments. The distance is meant to protect specialist or independent work from day-to-day political control.",
     {"types": ["ea", "endpb", "andpb", "tribunal"], "show": "non-ministerial"}, "alb", ["driver-and-vehicle-licensing-agency", "environment-agency"], ["pb", "pb2023"]),
    ("court", "Court", None,
     "A court that decides civil, family or criminal cases. Courts in England and Wales, and most tribunals, are run by HM Courts & Tribunals Service, an executive agency of the Ministry of Justice. Few courts appear in GOV.UK's main list of organisations, so the map groups any that do with tribunals.",
     {"type": "tribunal"}, "type:tribunal", ["hm-courts-and-tribunals-service"], ["hmcts", "orgs"]),
    ("crown-body", "Crown body / Crown NDPB", None,
     "A body that legally acts on behalf of the Crown and shares some of its legal status, so its staff can be civil servants. Departments and executive agencies are Crown bodies. A small number of NDPBs are Crown bodies too, but guidance says no new ones should be set up this way. GOV.UK does not tag Crown status, so the map cannot show it.",
     None, None, [], ["class"]),
    ("devolved-government", "Devolved government", None,
     "The governments of Scotland, Wales and Northern Ireland. They run devolved areas such as health, education and transport, and answer to their own parliament or assembly rather than to Westminster. The map shows the bodies GOV.UK links to each one.",
     {"show": "devolved"}, "devolved", ["the-scottish-government", "welsh-government"], ["devo", "orgs"]),
    ("executive-agency", "Executive agency", "EA",
     "A part of a government department that has its own management and budget to deliver a particular service, but legally stays inside the department. Its chief executive answers to the department's ministers, who set its targets.",
     {"type": "ea"}, "type:ea", ["driver-and-vehicle-licensing-agency", "met-office"], ["pb", "class"]),
    ("executive-ndpb", "Executive NDPB", "Executive non-departmental public body",
     "A non-departmental public body that delivers services, hands out funding or regulates, at arm's length from ministers. It is not part of a department and usually has its own board and staff, but it works within a framework agreed with its sponsor department.",
     {"type": "endpb"}, "type:endpb", ["environment-agency", "uk-research-and-innovation"], ["pb", "class"]),
    ("executive-office", "Executive office", None,
     "An office whose job is to support the head of government directly. On GOV.UK this is the Prime Minister's Office, 10 Downing Street.",
     {"type": "office"}, "type:office", ["prime-ministers-office-10-downing-street"], ["orgs"]),
    ("independent-monitoring-body", "Independent monitoring body", None,
     "A body that inspects, monitors or reports on part of the system, independently of the department it looks at. Examples include inspectors and commissioners for borders or modern slavery. GOV.UK uses this label for a small group of watchdog-style organisations.",
     {"type": "imb"}, "type:imb", ["independent-chief-inspector-of-borders-and-immigration", "independent-anti-slavery-commissioner"], ["class", "orgs"]),
    ("ministerial-department", "Ministerial department", None,
     "A government department led by a Secretary of State or another minister, who answers to Parliament for its work. Ministerial departments set policy and usually sponsor a family of agencies and public bodies.",
     {"show": "ministerial"}, "ministerial", ["home-office", "ministry-of-defence"], ["orgs"]),
    ("non-ministerial-department", "Non-ministerial department", "NMD",
     "A government department with no minister of its own. It is staffed by civil servants and usually has its own budget, but answers to Parliament through a sponsoring minister. Many are regulators or do work that should be kept apart from politics, such as collecting tax.",
     {"show": "non-ministerial"}, "nonMinisterial", ["hm-revenue-customs", "food-standards-agency"], ["pb", "class"]),
    ("not-attached", "Not attached (map marker)", None,
     "Our label for bodies that GOV.UK lists without a current parent department. They include bodies that answer to Parliament or are independent by design, as well as cross-government professions and networks.",
     {"show": "not-attached"}, "unattached", ["bank-of-england", "the-electoral-commission"], ["orgs"]),
    ("other-public-body", "Other public body", None,
     "GOV.UK's catch-all label for organisations that do not fit a standard category. Examples include commissioners, government-owned companies, cross-government functions and some advisory panels.",
     {"type": "other"}, "type:other", ["british-business-bank", "commissioner-for-public-appointments"], ["orgs"]),
    ("own-website", "Own website (map marker)", None,
     "Our marker for bodies that mainly publish on their own website rather than on GOV.UK. Their GOV.UK page is a short summary that links to their site.",
     {"expand": True}, "own", ["bank-of-england", "met-office"], ["orgs"]),
    ("public-corporation", "Public corporation", None,
     "A publicly owned or controlled body that earns most of its income by selling goods or services, for example broadcasting, mapping or post. The Office for National Statistics decides which bodies count as public corporations.",
     {"type": "pc"}, "type:pc", ["ordnance-survey", "post-office"], ["pb", "class"]),
    ("shared", "Shared (map marker)", None,
     "Our marker for a body that more than one department lists, for example when departments or governments share responsibility for it. The body appears under each of them, with an 'Also under' note.",
     {"expand": True}, "shared", ["animal-and-plant-health-agency", "national-cyber-force"], ["orgs"]),
    ("special-health-authority", "Special health authority", "SHA",
     "A type of NHS body set up to run a single health service function across England, such as blood and organ donation or handling NHS legal claims. They are sponsored by the Department of Health and Social Care.",
     {"type": "sha"}, "type:sha", ["nhs-blood-and-transplant", "nhs-resolution"], ["class", "orgs"]),
    ("sponsor-department", "Sponsor department", None,
     "The department responsible for an arm's-length body. It agrees the body's purpose and funding, oversees its board and answers to Parliament for it, while leaving day-to-day decisions to the body. On the map, bodies sit under their sponsor department.",
     None, None, ["driver-and-vehicle-licensing-agency", "uk-research-and-innovation"], ["sponsor"]),
    ("sub-organisation", "Sub-organisation", None,
     "A team, unit or programme inside a department or body that GOV.UK lists separately because it has its own public profile. Examples are a named agency inside a department, or a centre inside an intelligence agency. It is not a separate legal body. GOV.UK calls these high-profile groups.",
     {"type": "sub"}, "type:sub", ["uk-space-agency", "national-cyber-security-centre"], ["orgs"]),
    ("tribunal", "Tribunal (NDPB)", None,
     "A body that makes legal decisions in a specialist area, such as competition or copyright disputes. Some long-standing tribunals still run as separate NDPBs. New tribunal work is set up inside HM Courts & Tribunals Service instead. On the map, tribunals and courts share this type.",
     {"type": "tribunal"}, "type:tribunal", ["competition-appeal-tribunal", "copyright-tribunal"], ["class", "hmcts"]),

    ("accountable-to-parliament", "Accountable to Parliament", None,
     "A small group of bodies that are independent of ministers. Their budgets are voted by Parliament and examined by a parliamentary or statutory committee, not set by a sponsor department. On this map they have their own page, separate from the government charts. This is different from a body that only reports to a select committee while remaining sponsored by a department.",
     {"page": "/govmap/parliament/"}, None, [], []),
    ("annually-managed-expenditure", "Annually Managed Expenditure", "AME",
     "Spending that is not in the departmental expenditure limit, mainly social security, debt interest, public service pensions and similar demand-led or non-cash items. This map's budget shares use Total DEL, not Total Managed Expenditure, so Annually Managed Expenditure is not included.",
     None, None, [], ["pesa"]),
    ("capital-del", "Capital DEL", "CDEL",
     "The part of a departmental expenditure limit that covers capital spending, such as investment in buildings, equipment and infrastructure. Total DEL is resource DEL plus capital DEL.",
     None, None, [], ["pesa", "estimates"]),
    ("comptroller-and-auditor-general", "Comptroller and Auditor General", "C&AG",
     "The Officer of the House of Commons who leads the National Audit Office. The Public Accounts Commission (TPAC) sets the NAO's budget. The Committee of Public Accounts uses NAO reports to scrutinise government, but it does not set that budget.",
     {"page": "/govmap/parliament/#nao"}, None, [], []),
    ("departmental-expenditure-limit", "Departmental expenditure limit", "DEL",
     "The Treasury's planning and control total for department-like spending. It is the budget a department has been allocated, as opposed to demand-led spending that is managed separately as Annually Managed Expenditure (AME).",
     None, None, [], ["pesa", "estimates"]),
    ("electoral-commission", "Electoral Commission", None,
     "The independent body that oversees elections and referendums and regulates political finance in the UK. It is accountable to the Speaker's Committee on the Electoral Commission, not to a minister. GOV.UK lists it without a parent department; on this map it is flagged in the \"not attached\" group and explained on the Accountable to Parliament page.",
     {"page": "/govmap/parliament/#electoral-commission"}, None, ["the-electoral-commission"], []),
    ("independent-parliamentary-standards-authority", "Independent Parliamentary Standards Authority", "IPSA",
     "The body that independently regulates and pays MPs' salaries, pensions, business costs and expenses. It is accountable to the Speaker's Committee for IPSA. Almost all of its Estimate is MPs' pay and costs, not its own running costs. GOV.UK labels it as an executive NDPB, which is misleading: it is not a government-sponsored NDPB in the usual sense.",
     {"page": "/govmap/parliament/#ipsa"}, None, ["independent-parliamentary-standards-authority"], []),
    ("local-government-boundary-commission-for-england", "Local Government Boundary Commission for England", "LGBCE",
     "Recommends fair electoral and boundary arrangements for local authorities in England, and reviews London Assembly constituencies. It is accountable to the Speaker's Committee on the Electoral Commission and is not a government body. It is not the Boundary Commission for England, which reviews UK Parliament constituencies.",
     {"page": "/govmap/parliament/#lgbce"}, None, [], []),
    ("main-estimates", "Main Estimates", "Main Supply Estimates",
     "The government's annual request to Parliament to vote money for each department and certain other bodies for the financial year. Tables 3 and 5 of the 2026-27 Main Supply Estimates give resource DEL and capital DEL for named departments and independent entities. Use these figures when a one-to-one total is needed for a named body; use PESA for published statistical shares of Total DEL.",
     None, None, [], ["estimates"]),
    ("national-audit-office", "National Audit Office", "NAO",
     "The UK's independent public spending watchdog. It audits government accounts and reports to Parliament on whether public money has been used properly and with value for money. It is led by the Comptroller and Auditor General and is accountable to the Public Accounts Commission (TPAC). It is not a government department and is not on the circle or org charts.",
     {"page": "/govmap/parliament/#nao"}, None, [], []),
    ("non-departmental-public-body", "Non-departmental public body", "NDPB",
     "A public body that works at arm's length from ministers and is not part of a department. The Cabinet Office counts three kinds: executive, advisory and tribunal NDPBs. A sponsor department agrees the body's purpose and funding and answers to Parliament for it, while leaving day-to-day decisions to the body.",
     {"types": ["endpb", "andpb", "tribunal"]}, None, ["environment-agency", "low-pay-commission"], ["pb", "class"]),
    ("parliamentary-and-health-service-ombudsman", "Parliamentary and Health Service Ombudsman", "PHSO",
     "Makes final decisions on complaints that have not been resolved by the NHS in England, UK government departments and some other UK public organisations. It is accountable to Parliament, with the Public Administration and Constitutional Affairs Committee (PACAC) as the principal scrutiny committee. GOV.UK lists it as Public Service Ombudsman, without a parent department.",
     {"page": "/govmap/parliament/#phso"}, None, ["public-service-ombudsman"], []),
    ("pesa", "PESA", "Public Expenditure Statistical Analyses",
     "The Treasury's annual statistics on public spending. Table 1.9 of PESA 2026 gives Total DEL by Treasury departmental group. These groups are not the same as the 23 ministerial departments on this map, and PESA still uses some older department names.",
     None, None, [], ["pesa"]),
    ("public-accounts-commission", "Public Accounts Commission", "TPAC",
     "A statutory committee of MPs that sets the National Audit Office's budget, scrutinises its performance, and appoints most of its non-executive board members and its external auditor. It is not the same as the Committee of Public Accounts (PAC), which uses NAO reports to scrutinise government but does not set the NAO's budget.",
     None, None, [], []),
    ("public-administration-and-constitutional-affairs-committee", "Public Administration and Constitutional Affairs Committee", "PACAC",
     "A House of Commons select committee. It is the principal scrutiny committee for the Parliamentary and Health Service Ombudsman. On this map the committee is shown as a label, not as an organisation in the charts.",
     None, None, [], []),
    ("resource-del", "Resource DEL", "RDEL",
     "The part of a departmental expenditure limit that covers day-to-day (resource) spending. In the Main Estimates 2026-27, and in PESA 2026 from 2026-27, Resource DEL is presented excluding depreciation for most departments, because that depreciation is moved to Annually Managed Expenditure (AME).",
     None, None, [], ["pesa", "estimates"]),
    ("speakers-committee", "Speaker's Committee", None,
     "A statutory committee of MPs, chaired by the Speaker, that oversees certain bodies accountable to Parliament and sets their budgets. The Speaker's Committee on the Electoral Commission oversees the Electoral Commission and the Local Government Boundary Commission for England. The Speaker's Committee for IPSA oversees the Independent Parliamentary Standards Authority. These committees are labels on this map, not organisations in the charts.",
     None, None, [], []),
    ("small-and-independent-bodies", "Small and independent bodies", "PESA group",
     "A Treasury grouping in Public Expenditure Statistical Analyses (PESA). It gathers small departments and independent bodies that do not have a departmental group of their own. Annex B of PESA 2026 lists the Scotland Office and the Office of the Advocate General, the Wales Office, the Northern Ireland Office, UK Export Finance (the Export Credits Guarantee Department), many non-ministerial departments, the Houses of Parliament, and bodies accountable to Parliament. It is not a department on this map. The published PESA 2026 Total DEL for this group in 2026-27 plans is £3,597 million.",
     None, None, [], ["pesa"]),
    ("total-del", "Total DEL", None,
     "Resource DEL plus capital DEL. It is the Treasury's planning and control total for department-like spending, and the measure this map uses for a department's share of the budget. The published PESA 2026 total for 2026-27 plans is £664,958 million. That published total includes reserves and a negative OBR allowance for shortfall, so the department lines do not add to 100% on their own.",
     None, None, [], ["pesa"]),
]

TYPE_ANCHOR = {"ministerial": "ministerial-department", "nmd": "non-ministerial-department", "ea": "executive-agency",
               "endpb": "executive-ndpb", "andpb": "advisory-ndpb", "tribunal": "tribunal", "pc": "public-corporation",
               "sha": "special-health-authority", "imb": "independent-monitoring-body", "adhoc": "ad-hoc-advisory-group",
               "office": "executive-office", "cs": "other-public-body", "other": "other-public-body",
               "sub": "sub-organisation", "devolved": "devolved-government"}



ALIASES = {
    "accountable-to-parliament": ["Accountable to Parliament", "accountable to Parliament"],
    "annually-managed-expenditure": ["AME", "Annually Managed Expenditure"],
    "arms-length-body": ["ALB", "ALBs", "arm's-length body", "arm's-length bodies", "arm's length body", "arms-length body"],
    "advisory-ndpb": ["Advisory NDPB", "advisory NDPB", "Advisory non-departmental public body"],
    "capital-del": ["CDEL", "Capital DEL", "capital DEL"],
    "comptroller-and-auditor-general": ["C&AG", "Comptroller and Auditor General"],
    "departmental-expenditure-limit": ["DEL", "departmental expenditure limit", "departmental expenditure limits"],
    "devolved-government": ["devolved government", "devolved governments"],
    "electoral-commission": ["Electoral Commission", "the Electoral Commission"],
    "executive-agency": ["executive agency", "executive agencies", "EA", "EAs"],
    "executive-ndpb": ["Executive NDPB", "executive NDPB", "Executive non-departmental public body"],
    "independent-parliamentary-standards-authority": ["IPSA", "Independent Parliamentary Standards Authority"],
    "local-government-boundary-commission-for-england": ["LGBCE", "Local Government Boundary Commission for England"],
    "main-estimates": ["Main Estimates", "Main Supply Estimates"],
    "ministerial-department": ["ministerial department", "ministerial departments"],
    "national-audit-office": ["NAO", "National Audit Office"],
    "non-departmental-public-body": ["NDPB", "NDPBs", "non-departmental public body", "non-departmental public bodies"],
    "non-ministerial-department": ["NMD", "NMDs", "non-ministerial department", "non-ministerial departments"],
    "parliamentary-and-health-service-ombudsman": ["PHSO", "Parliamentary and Health Service Ombudsman", "Public Service Ombudsman"],
    "pesa": ["PESA", "Public Expenditure Statistical Analyses"],
    "public-accounts-commission": ["TPAC", "Public Accounts Commission"],
    "public-administration-and-constitutional-affairs-committee": ["PACAC", "Public Administration and Constitutional Affairs Committee"],
    "public-corporation": ["public corporation", "public corporations"],
    "resource-del": ["RDEL", "Resource DEL", "resource DEL"],
    "small-and-independent-bodies": ["Small and independent bodies", "Small and Independent Bodies", "small and independent bodies"],
    "speakers-committee": ["Speaker's Committee", "Speaker’s Committee", "Speaker's Committee on the Electoral Commission", "Speaker's Committee for IPSA"],
    "special-health-authority": ["SHA", "special health authority", "special health authorities"],
    "sponsor-department": ["sponsor department", "sponsor departments", "sponsoring minister"],
    "total-del": ["Total DEL", "total DEL"],
    "tribunal": ["Tribunal (NDPB)"],
}

# Short generic labels that should only match in this exact form, not as loose words.
STRICT = {"court", "shared", "own-website", "not-attached", "sub-organisation", "other-public-body", "executive-office", "crown-body", "independent-monitoring-body", "ad-hoc-advisory-group"}


def first_sentence(d):
    d = d.strip()
    for i, ch in enumerate(d):
        if ch == "." and (i + 1 == len(d) or d[i + 1] in " 	"):
            return d[: i + 1]
    return d


def patterns_for(i, term, short):
    seen = set()
    out = []
    def add(s, sensitive):
        s = (s or "").strip()
        if not s:
            return
        key = s.casefold()
        if key in seen:
            return
        seen.add(key)
        out.append({"t": s, "s": bool(sensitive)})
    # longer aliases first is applied later globally
    for a in ALIASES.get(i, []):
        add(a, len(a) <= 5 or a.isupper() or i in STRICT)
    add(term, i in STRICT)
    if short:
        add(short, len(short) <= 5 or short.isupper())
    return out


def write_terms_json(terms):
    items = []
    for i, term, short, d, mp, ck, ex, src in terms:
        items.append({
            "id": i,
            "term": term,
            "short": short,
            "def": first_sentence(d),
            "patterns": patterns_for(i, term, short),
        })
    items.sort(key=lambda x: x["id"])
    path = APP / "data/govmap-terms.json"
    path.write_text(json.dumps({"terms": items}, ensure_ascii=False, indent=2) + "\n")
    npat = sum(len(x["patterns"]) for x in items)
    print(f"terms json: {len(items)} terms, {npat} patterns")


def e(s):
    return html.escape(s, quote=True)


def main():
    data = json.loads((APP / "data/govmap.json").read_text())
    slugs = set()
    for r in data["roots"]:
        slugs.add(r["u"].rsplit("/", 1)[1])
        for lst in r["g"].values():
            slugs.update(b["u"].rsplit("/", 1)[1] for b in lst)
    slugs.update(b["u"].rsplit("/", 1)[1] for b in data["unattached"])
    missing = [(t[0], s) for t in TERMS for s in t[6] if s not in slugs]
    if missing:
        sys.exit(f"example slugs not in govmap.json: {missing}")
    ids = [t[0] for t in TERMS]
    assert len(ids) == len(set(ids)) and all(re.fullmatch(r"[a-z0-9-]+", i) for i in ids)
    assert set(TYPE_ANCHOR.values()) <= set(ids)
    if "--check-urls" in sys.argv:
        for k, (_, u) in SRC.items():
            req = urllib.request.Request(u, headers={"User-Agent": "govassured-glossary-check/1.0"}, method="GET")
            with urllib.request.urlopen(req, timeout=30) as r:
                print(r.status, u)
                assert r.status == 200
    out = {"sources": {k: {"t": t, "u": u} for k, (t, u) in SRC.items()}, "typeAnchor": TYPE_ANCHOR, "terms": {}}
    for i, term, short, d, mp, ck, ex, src in TERMS:
        out["terms"][i] = {"map": mp, "count": ck, "ex": ex, "src": src}
    (APP / "data/govmap-glossary.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n")
    write_terms_json(TERMS)

    # static HTML body (definitions only; links to gov.uk are added by JS from the JSON)
    letters = {}
    for t in sorted(TERMS, key=lambda t: t[1].lower()):
        letters.setdefault(t[1][0].upper(), []).append(t)
    az = []
    for L in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        az.append(f'<a href="#letter-{L.lower()}">{L}</a>' if L in letters else f'<span aria-hidden="true">{L}</span>')
    parts = ['        <nav class="gm-az" id="gm-az" aria-label="Jump to letter">' + "".join(az) + "</nav>"]
    parts.append('        <div class="gm-gloss" id="gm-gloss">')
    for L, ts in letters.items():
        parts.append(f'          <section class="gm-letter" id="letter-{L.lower()}" aria-labelledby="letter-{L.lower()}-h">')
        parts.append(f'            <h2 class="gm-letter-h" id="letter-{L.lower()}-h">{L}</h2>')
        for i, term, short, d, mp, ck, ex, src in ts:
            parts.append(f'            <article class="gm-term" id="{i}" data-term="{i}">')
            sh = f' <span class="gm-term-short">{e(short)}</span>' if short else ""
            parts.append(f'              <h3 class="gm-term-h"><a class="gm-anchor" href="#{i}">{e(term)}</a>{sh}</h3>')
            parts.append(f'              <p class="gm-def">{e(d)}</p>')
            parts.append('              <div class="gm-term-extra" data-extra></div>')
            parts.append("            </article>")
        parts.append("          </section>")
    parts.append("        </div>")
    block = "\n".join(parts)
    page = APP / "govmap/glossary/index.html"
    tpl = page.read_text()
    tpl = re.sub(r"<!-- GLOSSARY:START -->.*<!-- GLOSSARY:END -->",
                 lambda m: "<!-- GLOSSARY:START -->\n" + block + "\n        <!-- GLOSSARY:END -->", tpl, flags=re.S)
    page.write_text(tpl)
    print(f"glossary: {len(TERMS)} terms, {len(letters)} letters; json {len(json.dumps(out))} bytes")


if __name__ == "__main__":
    main()
