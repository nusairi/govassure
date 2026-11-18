#!/usr/bin/env python3
"""Write the Security Architect Corner template pages.

Creates architect/templates/index.html (the list of templates) and one page per
template under architect/templates/<slug>/index.html, reusing the head, header
and footer from architect/index.html. The fill-in forms themselves are built in
the browser by architect-templates.js from each page's data-template key, which
is also the localStorage key, so keys must not change.
Run scripts/bust_govmap.py afterwards to refresh the ?v= cache busters.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.govassured.com"

# (localStorage key, URL slug, title, one-line purpose, intro, what good looks like, worked example)
TEMPLATES = [
    ("design", "security-design", "One-page security design",
     "How a service is kept secure, on one page.",
     "A short summary of how a service is kept secure: the data it holds, how it is built, the main controls and the risks that remain. Start it in alpha and keep it up to date in beta and live.",
     ["It fits on one or two pages and someone outside the team can understand it.",
      "It describes data and sensitivity at a high level, without real records or detailed handling rules.",
      "Every control says what it protects, not just which product is used.",
      "It names a risk owner by role and says when it was last reviewed."],
     "For a staff meeting-room booking service: “Staff sign in with single sign-on and multi-factor authentication. Only the facilities team has the admin role. All traffic uses TLS and the database is encrypted at rest.”"),
    ("risks", "risk-register", "Risk register starter",
     "Likelihood, impact, owner and treatment for each security risk.",
     "A simple list of security risks, how likely and how serious each one is, who owns it and what you will do about it. Start it in discovery and review it at every phase.",
     ["Each risk is written as cause, event and effect, so anyone can see why it matters.",
      "Likelihood and impact use the same 1 to 5 scale every time. The score is likelihood × impact.",
      "Each risk has an owner by role, a treatment (reduce, accept, transfer or avoid) and a review date.",
      "Accepted risks are accepted by the right person, and you record that."],
     "“Because admin accounts can delete any booking, there is a risk that a compromised admin account is used to cancel bookings, which would disrupt meetings.” Likelihood 2, impact 3, score 6 (medium). Treatment: reduce, with MFA and alerts on bulk cancellations."),
    ("threats", "threat-model", "Threat model worksheet (STRIDE)",
     "What could go wrong, and what you will do about it.",
     "A guided way to ask “what could go wrong?” using the six STRIDE categories. Use it in alpha, and again when the design changes a lot.",
     ["The scope is small enough to finish in an hour or two, such as one feature or data flow.",
      "Each threat is specific to your service, not a generic list.",
      "Every threat has a planned mitigation, or goes into the risk register.",
      "You record gaps and follow-ups so the work leads to action."],
     "Elevation of privilege: “A normal user calls an admin page directly.” Mitigation: “Check the role on the server for every admin action, and test this in the IT health check.”"),
    ("adr", "decision-record", "Architecture decision record",
     "One important decision, the options and why it was made.",
     "A short record of one important design decision: why it was needed, the options, what was chosen and what follows. Write one whenever a decision affects security.",
     ["It covers one decision and has a clear title and status.",
      "It lists the real options considered, with honest pros and cons.",
      "It says what the decision means for security and risk.",
      "It records who agreed it, by role, so later teams know why things are the way they are."],
     "“Use the platform key vault for application secrets.” Options: config file, environment variables or key vault. Decision: key vault, because it is managed, audited and supports rotation."),
    ("supplier", "supplier-assurance", "Supplier assurance questionnaire",
     "Questions for suppliers, including hardware and supply chain.",
     "Questions to send to a supplier before they handle your data or supply equipment, with space to record your view of the answers. It includes questions on hardware and the supply chain. Use it in alpha, and again at contract renewal.",
     ["You only ask the questions that matter for what the supplier will actually do.",
      "You ask for evidence, such as a certificate and its scope, not just “yes”.",
      "Hardware questions cover where parts come from, firmware updates, tamper protection, support life and secure disposal.",
      "You record your view of each section and the follow-ups, and the supplier risk has an owner."],
     "“Where do the devices you supply come from, and how do you check they are genuine?” Answer: “Bought direct from the manufacturer's approved distributor, with serial numbers recorded on delivery.” Our view: acceptable."),
    ("beta", "ready-for-beta", "Ready for beta checklist",
     "The Beta gate questions, with evidence and a decision.",
     "A short check before a service moves into beta, built from the Beta gate questions on the Architect Corner, with space for evidence and the decision.",
     ["Every answer has evidence, or a clear next step if the answer is “partly” or “no”.",
      "Anything not ready is either fixed or accepted by the risk owner, and that is recorded.",
      "The outcome is clear: ready, ready with conditions, or not ready yet.",
      "Conditions have owners (by role) and dates."],
     "“Have the penetration test findings been fixed or formally accepted?” Partly: “Two high findings fixed and retested. One medium finding accepted until the next release.”"),
]

INDEX_TITLE = "Templates for security architects"
PRIVACY = """        <div class="arch-callout tpl-privacy">
          <p><strong>Your answers stay in this browser.</strong> They save automatically to this device only and are never sent to GOV Assured or anyone else. You do not need an account.</p>
          <p>Do not enter sensitive or classified details here. Download or print a copy and keep it in your organisation&#39;s approved systems.</p>
        </div>"""


def parts():
    a = (ROOT / "architect" / "index.html").read_text(encoding="utf-8")
    head = a[:a.index("</head>")]
    header = a[a.index('  <header class="site-header">'):a.index("  </header>") + len("  </header>")]
    footer = a[a.index('  <footer class="site-footer">'):a.index("  </footer>") + len("  </footer>")]
    return head, header, footer


def make_head(head, title, desc, path):
    full = f"{title} — GOV Assured"
    h = re.sub(r"<title>.*?</title>", f"<title>{full}</title>", head)
    h = re.sub(r'(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*"',
               lambda m: m.group(1) + desc + '"', h)
    h = re.sub(r'(<meta (?:property|name)="(?:og:title|twitter:title)" content=")[^"]*"',
               lambda m: m.group(1) + full + '"', h)
    h = h.replace(f'{BASE}/architect/"', f'{BASE}{path}"')
    h = re.sub(r'  <link rel="stylesheet" href="/architect\.css[^"]*">',
               '  <link rel="stylesheet" href="/architect.css">\n  <link rel="stylesheet" href="/architect-templates.css">', h)
    return h


def crumbs(items):
    lis = []
    for href, text in items:
        lis.append(f'          <li><a href="{href}">{text}</a></li>' if href else f'          <li aria-current="page">{text}</li>')
    return ('    <div class="wrap">\n      <nav class="arch-crumbs" aria-label="Breadcrumb">\n        <ol>\n'
            + "\n".join(lis) + "\n        </ol>\n      </nav>\n    </div>")


def page(head, header, footer, main, script=True):
    s = '\n\n  <script src="/architect-templates.js" defer></script>' if script else ""
    return (head + "</head>\n<body>\n  <a class=\"skip-link\" href=\"#main\">Skip to content</a>\n\n" + header
            + "\n\n  <main id=\"main\" tabindex=\"-1\">\n" + main + "\n  </main>\n\n" + footer + s + "\n</body>\n</html>\n")


def index_page(head, header, footer):
    cards = "\n".join(f'''          <li class="card tpl-card">
            <h2><a href="/architect/templates/{slug}/">{title}</a></h2>
            <p class="description">{purpose}</p>
          </li>''' for _k, slug, title, purpose, *_ in TEMPLATES)
    main = crumbs([("/", "Home"), ("/architect/", "Security Architect Corner"), (None, "Templates")]) + f'''

    <section class="band arch-hero" aria-labelledby="tpl-title">
      <div class="wrap">
        <p class="eyebrow">Security Architect Corner</p>
        <h1 id="tpl-title">{INDEX_TITLE}</h1>
        <p class="lede">Six fill-in templates for the documents you will be asked for most often. Each one explains what good looks like and has a worked example you can load and change. Especially useful if you are starting out in the role.</p>
{PRIVACY}
      </div>
    </section>

    <section class="band arch-section" aria-labelledby="tpl-list-title">
      <div class="wrap">
        <h2 id="tpl-list-title" class="section-title">Choose a template</h2>
        <ul class="grid tpl-cards">
{cards}
        </ul>
        <h2 class="arch-toc-h tpl-how-h">How to use a template</h2>
        <ol class="tpl-how">
          <li>Read “What good looks like”.</li>
          <li>Select “Fill in the worked example” to see a finished version, then change it to fit your service.</li>
          <li>Print it, save it as a PDF, or download it for Word.</li>
        </ol>
      </div>
    </section>'''
    desc = ("Six free fill-in templates for security architects: a one-page security design, risk register, STRIDE threat model, "
            "architecture decision record, supplier assurance questionnaire and ready for beta checklist. Answers stay in your browser.")
    return page(make_head(head, INDEX_TITLE, desc, "/architect/templates/"), header, footer, main, script=False)


def template_page(head, header, footer, i):
    key, slug, title, purpose, intro, good, example = TEMPLATES[i]
    gl = "\n".join(f"            <li>{g}</li>" for g in good)
    pager = []
    if i > 0:
        p = TEMPLATES[i - 1]
        pager.append(f'          <a class="tpl-pager-prev" href="/architect/templates/{p[1]}/" rel="prev"><span class="tpl-pager-label">Previous template</span> <span class="tpl-pager-title">{p[2]}</span></a>')
    if i < len(TEMPLATES) - 1:
        n = TEMPLATES[i + 1]
        pager.append(f'          <a class="tpl-pager-next" href="/architect/templates/{n[1]}/" rel="next"><span class="tpl-pager-label">Next template</span> <span class="tpl-pager-title">{n[2]}</span></a>')
    main = crumbs([("/", "Home"), ("/architect/", "Security Architect Corner"), ("/architect/templates/", "Templates"), (None, title)]) + f'''

    <section class="band arch-hero" aria-labelledby="tpl-title">
      <div class="wrap">
        <p class="eyebrow">{INDEX_TITLE}</p>
        <h1 id="tpl-title">{title}</h1>
        <p class="lede">{intro}</p>
{PRIVACY}
      </div>
    </section>

    <section class="band arch-section tpl" id="{key}" data-template="{key}" aria-labelledby="{key}-fill">
      <div class="wrap">
        <div class="tpl-guide">
          <h2>What good looks like</h2>
          <ul>
{gl}
          </ul>
          <p class="tpl-example-text"><strong>Short worked example:</strong> {example}</p>
        </div>
        <h2 class="tpl-fill-h" id="{key}-fill">Fill it in</h2>
        <p class="tpl-status" role="status"></p>
        <noscript><p class="noscript">This template needs JavaScript to fill in, save and download. The guidance and worked example above still work without it.</p></noscript>
        <div class="tpl-actions"></div>
        <div class="tpl-form-slot"></div>
        <nav class="tpl-pager" aria-label="Templates">
{chr(10).join(pager)}
        </nav>
        <p class="tpl-top"><a href="/architect/templates/">All templates</a></p>
      </div>
    </section>'''
    desc = f"{purpose} A free fill-in template for security architects, with guidance and a worked example. Answers stay in your browser."
    return page(make_head(head, title, desc, f"/architect/templates/{slug}/"), header, footer, main)


def main():
    head, header, footer = parts()
    out = ROOT / "architect" / "templates"
    (out / "index.html").write_text(index_page(head, header, footer), encoding="utf-8")
    for i, t in enumerate(TEMPLATES):
        d = out / t[1]
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(template_page(head, header, footer, i), encoding="utf-8")
    print(f"Wrote {len(TEMPLATES) + 1} template pages")


if __name__ == "__main__":
    main()
