#!/usr/bin/env python3
"""Write the Security Architect Corner document trail.

One matrix (DOCS below) says which security documents to start, update,
finalise, review, use or close in each GOV.UK service phase. This script uses it to
  * write architect/document-trail/index.html (the full table, a key and
    "what you should have by each gate"), reusing the head, header and footer
    from architect/index.html, and
  * rewrite the "Documents for this phase" box inside each lifecycle phase of
    architect/index.html, between the <!-- doc-trail:<phase> --> and
    <!-- /doc-trail --> markers.
Run scripts/bust_govmap.py afterwards to refresh the ?v= cache busters.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_architect_templates import crumbs, make_head, page, parts  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]

PHASES = [
    ("discovery", "Discovery", "Before moving to alpha (end of discovery)"),
    ("alpha", "Alpha", "Before moving to beta (end of alpha)"),
    ("beta", "Beta", "Before going live (end of beta)"),
    ("live", "Live", "At each live review"),
    ("retirement", "Retirement", "Before the service is closed"),
]

# Tag -> (CSS modifier, plain-English meaning used in the key)
TAGS = {
    "New": ("new", "Start the document."),
    "Update": ("update", "Bring it up to date with what you now know."),
    "Final": ("final", "Finish it: it should be complete and agreed."),
    "Review": ("review", "Check it is still right, and change it if not."),
    "Use": ("use", "Use it to do the work or make a decision."),
    "Close": ("close", "Close it off and record the outcome."),
}

T = "/architect/templates/"
# (name, href, kind, cells for the 5 phases). A cell is None (not needed in that
# phase) or (tag, note, what you should have by the gate).
DOCS = [
    ("Data and sensitivity summary", T + "data-and-sensitivity-summary/", "template", [
        ("New", "", "a first data and sensitivity summary"),
        ("Update", "", "an updated data and sensitivity summary"),
        ("Final", "", "a final data and sensitivity summary"),
        ("Review", "", "a reviewed data and sensitivity summary"),
        ("Use", "for disposal", "the data and sensitivity summary, used to plan disposal")]),
    ("Risk register", T + "risk-register/", "template", [
        ("New", "", "a first risk register"),
        ("Update", "", "an updated risk register with owners"),
        ("Update", "", "an updated risk register, with every risk treated or accepted"),
        ("Update", "ongoing", "a risk register that is kept up to date"),
        ("Close", "", "a closed risk register, with remaining risks accepted")]),
    ("Risk owners and sign-off", T + "risk-owners-and-sign-off/", "template", [
        ("New", "", "named risk owners (by role) and how sign-off works"),
        ("Update", "", "updated risk owners and decisions"),
        ("Final", "", "the go-live sign-off record"),
        ("Review", "", "risk owners checked after any change of role"),
        ("Close", "sign off retirement", "the retirement sign-off record")]),
    ("Threat model", T + "threat-model/", "template", [
        ("New", "early sketch", "an early sketch of the threats"),
        ("New", "", "a threat model the team understands"),
        ("Update", "", "a threat model updated for what was built"),
        ("Review", "on change", "a threat model reviewed for each significant change"),
        None]),
    ("Security design", T + "security-design/", "template", [
        None,
        ("New", "", "a first security design with a recommended approach"),
        ("Update", "", "a detailed security design and the controls it relies on"),
        ("Final", "as built", "a security design that matches what is running"),
        None]),
    ("Decision records", T + "decision-record/", "template", [
        ("Use", "as needed", "decision records for any decision that affects security"),
        ("Use", "as needed", "decision records for any decision that affects security"),
        ("Use", "as needed", "decision records for any decision that affects security"),
        ("Use", "as needed", "decision records for any decision that affects security"),
        ("Use", "as needed", "decision records for any decision that affects security")]),
    ("Supplier assurance", T + "supplier-assurance/", "template", [
        ("New", "early check", "an early check of the likely suppliers"),
        ("New", "", "supplier assurance questions sent and answers reviewed"),
        ("Final", "", "final supplier assurance for every main supplier"),
        ("Review", "annual", "supplier assurance reviewed every year"),
        ("Close", "exit", "supplier exit completed, with evidence that data has gone")]),
    ("Secure by Design evidence", "https://sbd.govassured.com", "tool", [
        None,
        ("New", "", "Secure by Design evidence started for the controls in scope"),
        ("Final", "complete", "complete Secure by Design evidence"),
        ("Update", "maintain", "Secure by Design evidence kept up to date"),
        None]),
    ("Penetration test scope and results", "https://scope.govassured.com", "tool", [
        None,
        None,
        ("New", "", "a penetration test scope, results and a fix plan"),
        ("Review", "re-test", "a penetration re-test on the agreed cycle"),
        None]),
    ("Ready for beta checklist", T + "ready-for-beta/", "template", [
        None, None,
        ("Use", "", "a completed ready for beta checklist"),
        None, None]),
    ("Live security plan", T + "live-security-plan/", "template", [
        None, None,
        ("New", "draft", "a draft live security plan"),
        ("Use", "", "a live security plan in use, with reviews on time"),
        None]),
    ("Decommission and disposal plan", T + "decommission-and-disposal-plan/", "template", [
        None, None, None,
        ("New", "draft", "a draft decommission and disposal plan"),
        ("Use", "", "a completed decommission and disposal plan, with evidence")]),
]

assert all(len(d[3]) == 5 for d in DOCS)
assert all(c is None or c[0] in TAGS for d in DOCS for c in d[3])

TOOL_NOTE = '<span class="arch-trail-kind">(community tool)</span>'


def tag(cell):
    t, note, _ = cell
    s = f'<strong class="arch-tag arch-tag--{TAGS[t][0]}">{t}</strong>'
    if note:
        s += f' <span class="arch-tag-note">{note}</span>'
    return s


def doc_link(d):
    name, href, kind, _ = d
    return f'<a href="{href}">{name}</a>' + (f" {TOOL_NOTE}" if kind == "tool" else "")


def phase_box(i):
    key, label, _gate = PHASES[i]
    items = []
    for d in DOCS:
        c = d[3][i]
        if c:
            items.append(f'                <li><span class="arch-docs-name">{doc_link(d)}</span>'
                         f'<span class="visually-hidden">: </span> <span class="arch-docs-status">{tag(c)}</span></li>')
    return (f'            <!-- doc-trail:{key} -->\n'
            f'            <div class="arch-docs">\n'
            f'              <h4 id="docs-{key}">Documents for this phase</h4>\n'
            f'              <ul class="arch-docs-list" aria-labelledby="docs-{key}">\n'
            + "\n".join(items) + "\n"
            f'              </ul>\n'
            f'              <p class="arch-docs-more"><a href="/architect/document-trail/">Every document in every phase</a></p>\n'
            f'            </div>\n'
            f'            <!-- /doc-trail -->')


def table():
    head = "\n".join(f'              <th scope="col">{label}</th>' for _k, label, _g in PHASES)
    rows = []
    for d in DOCS:
        cells = []
        for c in d[3]:
            if c:
                cells.append(f"              <td>{tag(c)}</td>")
            else:
                cells.append('              <td class="arch-trail-none"><span aria-hidden="true">–</span><span class="visually-hidden">Not needed</span></td>')
        rows.append(f'            <tr>\n              <th scope="row">{doc_link(d)}</th>\n' + "\n".join(cells) + "\n            </tr>")
    return f'''        <p class="arch-table-hint" id="trail-hint">Security documents in each phase of a service. On a small screen, scroll the table sideways to see every phase, or use the lists by gate further down.</p>
        <div class="arch-table-wrap" role="region" aria-labelledby="trail-caption" aria-describedby="trail-hint" tabindex="0">
          <table class="arch-trail">
            <caption id="trail-caption">Security documents in each phase of a service</caption>
            <thead>
            <tr>
              <th scope="col">Document</th>
{head}
            </tr>
            </thead>
            <tbody>
{chr(10).join(rows)}
            </tbody>
          </table>
        </div>'''


def gates():
    out = []
    for i, (key, _label, gate) in enumerate(PHASES):
        lis = [f'            <li><a href="{d[1]}">{d[0]}</a>: {d[3][i][2]}.</li>' for d in DOCS if d[3][i]]
        out.append(f'''        <div class="arch-gate" id="gate-{key}">
          <h3>{gate}</h3>
          <ul>
{chr(10).join(lis)}
          </ul>
        </div>''')
    return "\n".join(out)


def key_list():
    return "\n".join(f'''          <div class="arch-key-item">
            <dt>{tag((t, "", ""))}</dt>
            <dd>{m}</dd>
          </div>''' for t, (_c, m) in TAGS.items())


def trail_page(head, header, footer):
    title = "Document trail"
    main = crumbs([("/", "Home"), ("/architect/", "Security Architect Corner"), (None, title)]) + f'''

    <section class="band arch-hero" aria-labelledby="trail-title">
      <div class="wrap arch-prose">
        <p class="eyebrow">Security Architect Corner</p>
        <h1 id="trail-title">{title}</h1>
        <p class="lede">Which security documents to start, update, finish and review in each phase of a service, and what you should have by each gate.</p>
        <p>Most documents are not written once. You start them early with what you know, improve them as the design becomes real, and keep them up to date while the service runs. The table shows where each document is in each phase. Each document links to a fill-in template or a community tool.</p>
        <p>Use it as a guide, not a rule. A small, low-risk service may need less; a high-risk one may need more. Keep the classification of your documents generic here, and follow your organisation&#39;s own handling rules.</p>
      </div>
    </section>

    <section class="band arch-section" id="by-phase" aria-labelledby="table-title">
      <div class="wrap">
        <h2 id="table-title" class="section-title">Documents by phase</h2>
        <h3 class="arch-key-h" id="key-title">What the tags mean</h3>
        <dl class="arch-key" aria-labelledby="key-title">
{key_list()}
        </dl>
{table()}
      </div>
    </section>

    <section class="band arch-section" id="gates" aria-labelledby="gates-title">
      <div class="wrap arch-prose">
        <h2 id="gates-title" class="section-title">What you should have by each gate</h2>
        <p>Before a service moves on, check you have these. This is the same information as the table, set out by gate. The lifecycle map has the <a href="/architect/#lifecycle">gate questions for each phase</a>.</p>
{gates()}
        <p class="tpl-top"><a href="/architect/templates/">All templates</a></p>
      </div>
    </section>'''
    desc = ("Which security documents to start, update, finish and review in each phase of a UK public service, "
            "from discovery to retirement, and what you should have by each gate.")
    h = make_head(head, title, desc, "/architect/document-trail/")
    h = h.replace('  <link rel="stylesheet" href="/architect-templates.css">\n', "")
    return page(h, header, footer, main, script=False)


def update_architect_page():
    p = ROOT / "architect" / "index.html"
    s = p.read_text(encoding="utf-8")
    for i, (key, _l, _g) in enumerate(PHASES):
        pat = re.compile(r"            <!-- doc-trail:" + key + r" -->.*?<!-- /doc-trail -->", re.S)
        if not pat.search(s):
            raise SystemExit(f"marker for {key} missing in architect/index.html")
        s = pat.sub(lambda _m: phase_box(i), s, count=1)
    p.write_text(s, encoding="utf-8")


def main():
    update_architect_page()
    head, header, footer = parts()
    d = ROOT / "architect" / "document-trail"
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(trail_page(head, header, footer), encoding="utf-8")
    print(f"Wrote the document trail ({len(DOCS)} documents) and 5 phase boxes")


if __name__ == "__main__":
    main()
