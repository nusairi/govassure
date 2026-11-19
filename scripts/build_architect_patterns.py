#!/usr/bin/env python3
"""Write the Security Architect Corner patterns library pages.

Creates architect/patterns/index.html and one page per pattern under
architect/patterns/<slug>/index.html, reusing the head, header and footer from
architect/index.html. Diagrams are plain HTML and CSS (no script), so they
read as a list for assistive technology and stack vertically on small screens.
Run scripts/bust_govmap.py afterwards to refresh the ?v= cache busters.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.govassured.com"
NCSC = "https://www.ncsc.gov.uk"
CAF = NCSC + "/collection/cyber-assessment-framework"
CAF_A3 = (CAF + "/caf-objective-a-managing-security-risk/principle-a3-asset-management", "A3 Asset management")
CAF_A4 = (CAF + "/caf-objective-a-managing-security-risk/principle-a4-supply-chain", "A4 Supply chain")
CAF_B2 = (CAF + "/caf-objective-b/principle-b2-identity-and-access-control", "B2 Identity and access control")
CAF_B3 = (CAF + "/caf-objective-b/principle-b3-data-security", "B3 Data security")
CAF_B4 = (CAF + "/caf-objective-b/principle-b4-system-security", "B4 System security")
CAF_B5 = (CAF + "/caf-objective-b/principle-b5-resilient-networks-and-systems", "B5 Resilient networks and systems")
CAF_C1 = (CAF + "/caf-objective-c-detecting-cyber-security-events/principle-c1-security-monitoring", "C1 Security monitoring")
CAF_D1 = (CAF + "/caf-objective-d/principle-d1-response-and-recovery-planning", "D1 Response and recovery planning")

TPL = {
    "security-design": "One-page security design",
    "risk-register": "Risk register starter",
    "threat-model": "Threat model worksheet (STRIDE)",
    "decision-record": "Architecture decision record",
    "supplier-assurance": "Supplier assurance questionnaire",
    "ready-for-beta": "Ready for beta checklist",
}

PATTERNS = [
    {
        "slug": "zero-trust-access",
        "title": "Zero trust access",
        "purpose": "Give people access to each application based on who they are and the health of their device, not where they are.",
        "when": [
            "Staff or suppliers need to reach internal applications from home, the office and on the move.",
            "You want to move away from a VPN that gives access to the whole network.",
            "Your services are a mix of on-premises, cloud and software-as-a-service applications.",
        ],
        "diagram": {
            "desc": "A user on a managed device signs in to the identity provider. A policy engine checks who they are, the health of their device and what they are asking for. If the request is allowed, an access gateway connects them to that one application. Every decision is logged.",
            "nodes": [
                ("zone", "User and device", ["Person signing in", "Managed device", "Multi-factor authentication"]),
                ("flow", "asks for access"),
                ("zone", "Policy decision", ["Identity provider", "Device health check", "Access policy"]),
                ("flow", "allows one request at a time"),
                ("zone", "Access gateway", ["Checks every request", "Encrypted session"]),
                ("flow", "connects to"),
                ("zone", "Application and data", ["Only reachable through the gateway", "Logs every access"]),
            ],
        },
        "parts": [
            ("Identity provider", "Holds user accounts and handles sign-in and multi-factor authentication."),
            ("Device management", "Enrols devices and reports whether they are patched, encrypted and configured correctly."),
            ("Policy engine", "Decides each request using identity, device health, the application and the context."),
            ("Access gateway or proxy", "Sits in front of applications and only lets allowed requests through."),
            ("Logging", "Records every access decision and sends it to security monitoring."),
        ],
        "risks": [
            "Stolen or phished passwords used to sign in.",
            "Unmanaged or compromised devices getting access.",
            "Policies that are too broad, so everyone can reach everything.",
            "Applications that can still be reached directly, bypassing the gateway.",
            "The identity provider failing and locking everyone out.",
        ],
        "controls": [
            "Phishing-resistant multi-factor authentication for everyone, especially administrators.",
            "Device health checks before access, and again during the session.",
            "Least-privilege policies for each application and role.",
            "Applications only accept traffic from the gateway.",
            "Short sessions and re-checks when risk changes.",
            "Tested emergency access accounts, stored and monitored securely.",
        ],
        "caf": [CAF_B2, CAF_C1],
        "ncsc": [
            (NCSC + "/collection/zero-trust/architecture-design-principles", "NCSC zero trust architecture design principles"),
            (NCSC + "/collection/mfa-for-your-corporate-online-services", "NCSC multi-factor authentication for your corporate online services"),
            (NCSC + "/collection/10-steps/identity-and-access-management", "NCSC 10 Steps: identity and access management"),
            (NCSC + "/collection/device-security-guidance", "NCSC device security guidance"),
        ],
        "templates": ["security-design", "threat-model", "decision-record"],
        "tools": ["sase-cyberassure", "osi"],
        "mistakes": [
            "Calling a VPN “zero trust” while it still gives access to the whole network.",
            "Treating the office network as trusted.",
            "Letting administrator accounts skip multi-factor authentication.",
            "Having no tested plan for when the identity provider is down.",
            "Writing one policy that gives all staff access to all applications.",
        ],
    },
    {
        "slug": "secure-cloud-landing-zone",
        "title": "Secure cloud landing zone",
        "purpose": "Set up cloud accounts, guardrails and shared services before the first workload arrives.",
        "when": [
            "Your organisation is starting to host services in a public cloud.",
            "Several teams will build in the same cloud and need consistent controls.",
            "You want security built in by default rather than checked afterwards.",
        ],
        "diagram": {
            "desc": "Organisation-wide guardrails apply to every cloud account. Shared services provide central logging, networking, key management and security tooling. Each team gets separate accounts for development, test and production. Changes are made through a reviewed delivery pipeline using infrastructure as code.",
            "nodes": [
                ("zone", "Organisation guardrails", ["Policies that block risky settings", "Approved regions", "Single sign-on for admins"]),
                ("flow", "apply to every account"),
                ("zone", "Shared services", ["Central logging", "Network hub", "Key management", "Security tooling"]),
                ("flow", "connect and monitor"),
                ("zone", "Workload accounts", ["Separate development, test and production", "One owner per account"]),
                ("flow", "changed only through"),
                ("zone", "Delivery pipeline", ["Infrastructure as code", "Peer review", "Approved templates"]),
            ],
        },
        "parts": [
            ("Organisation structure", "The top-level cloud organisation, with accounts or subscriptions grouped by purpose."),
            ("Guardrail policies", "Rules that stop risky settings, such as public storage or unapproved regions."),
            ("Shared services", "Central logging, networking, key management and security tools used by every team."),
            ("Workload accounts", "Separate accounts for each service and environment, each with a named owner."),
            ("Delivery pipeline", "The reviewed route for all changes, using infrastructure as code."),
        ],
        "risks": [
            "Storage or services exposed to the internet by mistake.",
            "Administrators with far more access than they need.",
            "No central record of what happened, because logs stay in each account.",
            "Development and production mixed together.",
            "Accounts that nobody owns, left running and unpatched.",
        ],
        "controls": [
            "Separate accounts for each environment and service.",
            "Guardrail policies written as code and applied from the top.",
            "Federated sign-in for administrators, with no local user accounts.",
            "Logs sent to a central account that workload teams cannot change.",
            "All changes through reviewed infrastructure as code.",
            "Tags for owner and data sensitivity, and budget alerts.",
        ],
        "caf": [CAF_B4, CAF_B2, CAF_A3, CAF_C1],
        "ncsc": [
            (NCSC + "/collection/cloud", "NCSC cloud security guidance"),
            (NCSC + "/collection/cloud/the-cloud-security-principles", "NCSC Cloud Security Principles"),
            (NCSC + "/collection/cloud/using-cloud-services-securely", "NCSC using cloud services securely"),
            (NCSC + "/collection/secure-system-administration", "NCSC secure system administration"),
        ],
        "templates": ["security-design", "decision-record", "risk-register"],
        "tools": ["devsecops", "kms", "cyber-assessment"],
        "mistakes": [
            "Building workloads first and adding guardrails later.",
            "Putting everything in one big account.",
            "Using the top-level administrator account for day-to-day work.",
            "Keeping logs in the same account they are meant to protect.",
            "Making changes by hand in the console, so they are never reviewed or recorded.",
        ],
    },
    {
        "slug": "secrets-and-key-management",
        "title": "Secrets and key management",
        "purpose": "Keep passwords, API keys, certificates and encryption keys out of code and under control.",
        "when": [
            "Your service uses passwords, API keys, certificates or encryption keys.",
            "Secrets are currently in configuration files, code or shared documents.",
            "You need to show who can use keys and how they are rotated.",
        ],
        "diagram": {
            "desc": "The application and the delivery pipeline prove their identity and ask a secrets vault for what they need at run time. The vault holds secrets, keys and certificates under access policies, and its master keys are protected by hardware-backed key storage. Every access is logged to security monitoring.",
            "nodes": [
                ("zone", "Application and pipeline", ["Uses its own workload identity", "No secrets in code"]),
                ("flow", "asks for a secret at run time"),
                ("zone", "Secrets vault", ["Secrets, keys and certificates", "Access policy per secret", "Rotation and expiry"]),
                ("flow", "master keys protected by"),
                ("zone", "Hardware-backed key storage", ["Hardware security module or cloud key service"]),
                ("flow", "every access logged to"),
                ("zone", "Security monitoring", ["Alerts on unusual use", "Certificate expiry warnings"]),
            ],
        },
        "parts": [
            ("Secrets vault", "A managed service that stores secrets and controls who can read them."),
            ("Key management service", "Creates, stores and rotates encryption keys, and can encrypt data without exposing the key."),
            ("Hardware-backed key storage", "A hardware security module or cloud key service that protects the most important keys."),
            ("Workload identity", "Lets an application prove who it is without a stored password."),
            ("Monitoring", "Logs every use of a secret or key and warns before certificates expire."),
        ],
        "risks": [
            "Secrets committed to code repositories or pasted into tickets.",
            "Keys that are never rotated, or are shared between environments.",
            "Too many people able to read production secrets.",
            "Lost keys making data impossible to recover.",
            "Expired certificates taking the service down.",
        ],
        "controls": [
            "Secret scanning on code repositories, and no secrets in code or configuration files.",
            "Workload identities instead of stored passwords where possible.",
            "Least-privilege access for each secret, and separate secrets per environment.",
            "Automated rotation on a schedule, and immediately after suspected exposure.",
            "Separation of duties between key administrators and data users.",
            "Tested backup and recovery for keys, and alerts before certificates expire.",
        ],
        "caf": [CAF_B3, CAF_B2, CAF_C1],
        "ncsc": [
            (NCSC + "/guidance/using-tls-to-protect-data", "NCSC using TLS to protect data"),
            (NCSC + "/collection/in-house-public-key-infrastructure", "NCSC design and build a privately hosted public key infrastructure"),
            (NCSC + "/collection/developers-collection/principles/protect-your-code-repository", "NCSC protect your code repository"),
            (NCSC + "/collection/developers-collection/principles/secure-the-build-and-deployment-pipeline", "NCSC secure the build and deployment pipeline"),
            (NCSC + "/guidance/pqc-migration-timelines", "NCSC timelines for migration to post-quantum cryptography"),
        ],
        "templates": ["decision-record", "security-design", "risk-register"],
        "tools": ["kms", "devsecops"],
        "mistakes": [
            "Leaving a “temporary” secret in a configuration file.",
            "Using one key for everything.",
            "Storing keys next to the data they protect.",
            "Having no plan for certificate expiry.",
            "Never testing whether keys can be restored from backup.",
        ],
    },
    {
        "slug": "logging-to-a-siem",
        "title": "Logging to a SIEM",
        "purpose": "Collect the right security logs in one protected place, and make sure someone acts on the alerts.",
        "when": [
            "You need to detect attacks on a service, not just prevent them.",
            "Logs are spread across systems and nobody looks at them.",
            "You need evidence for investigations, audits or incident response.",
        ],
        "diagram": {
            "desc": "Log sources such as identity, devices, cloud services, applications and networks send events securely to collection and protected storage. A SIEM (security information and event management system) analyses them and raises alerts, which go to a response team who triage them, respond and feed lessons back into detection.",
            "nodes": [
                ("zone", "Log sources", ["Identity and sign-in", "Devices", "Cloud control plane", "Applications and network"]),
                ("flow", "send events securely"),
                ("zone", "Collection and storage", ["Accurate time on every source", "Protected, long-term storage"]),
                ("flow", "analysed by"),
                ("zone", "SIEM and detection", ["Detection rules", "Threat intelligence", "Alerts"]),
                ("flow", "alerts go to"),
                ("zone", "Response team", ["Triage", "Incident response", "Lessons learned"]),
            ],
        },
        "parts": [
            ("Log sources", "The systems that record security events: identity, devices, cloud services, applications and networks."),
            ("Collection", "Agents or connectors that send logs securely and reliably."),
            ("Protected storage", "Storage that administrators of the monitored systems cannot change or delete."),
            ("SIEM", "The security information and event management system that searches, correlates and raises alerts."),
            ("Response team", "The people who triage alerts and handle incidents, in-house or through a provider."),
        ],
        "risks": [
            "Important sources, such as sign-in or cloud administration logs, not collected.",
            "Attackers changing or deleting logs to hide their tracks.",
            "So many alerts that real ones are missed.",
            "Nobody responsible for watching or responding.",
            "Logs collecting more personal data than needed.",
        ],
        "controls": [
            "Start from the attacks you want to detect, then choose sources.",
            "Collect identity, administrator and cloud control plane logs first.",
            "Keep accurate time on every source.",
            "Protect stored logs with separate access and, where possible, immutable storage.",
            "Write a triage guide for each alert and tune noisy rules.",
            "Check regularly that every source is still sending, and test detections.",
        ],
        "caf": [CAF_C1, CAF_D1, CAF_B3],
        "ncsc": [
            (NCSC + "/collection/10-steps/logging-and-monitoring", "NCSC 10 Steps: logging and monitoring"),
            (NCSC + "/guidance/introduction-logging-security-purposes", "NCSC introduction to logging for security purposes"),
            (NCSC + "/collection/building-a-security-operations-centre", "NCSC building a security operations centre"),
            (NCSC + "/collection/10-steps/incident-management", "NCSC 10 Steps: incident management"),
        ],
        "templates": ["threat-model", "risk-register", "security-design"],
        "tools": ["threat-defence-planner", "tabletop-game", "osi"],
        "mistakes": [
            "Collecting everything and using none of it.",
            "Alerts with no named owner.",
            "Letting the administrators being monitored also manage the logs.",
            "Not noticing when a source stops sending.",
            "Forgetting cloud administration and sign-in logs.",
        ],
    },
    {
        "slug": "safe-third-party-integration",
        "title": "Safe third-party integration",
        "purpose": "Connect your service to a supplier's system without giving them more access or data than they need.",
        "when": [
            "Your service sends data to, or receives data from, a supplier's system or API.",
            "A supplier needs access to your systems to provide a service.",
            "You are adding a payment, messaging, identity or analytics provider.",
        ],
        "diagram": {
            "desc": "Our service sends only the data that is needed through an integration layer and an API gateway, which authenticates, limits and logs every call. Calls travel over encrypted, mutually authenticated connections to the supplier's service. Supplier assurance and the contract set what the supplier must do with the data.",
            "nodes": [
                ("zone", "Our service", ["Shares the minimum data", "Validates everything it receives"]),
                ("flow", "calls through"),
                ("zone", "API gateway", ["Strong authentication", "Rate limits and timeouts", "Logs every call"]),
                ("flow", "encrypted, mutually authenticated"),
                ("zone", "Supplier's service", ["Their API", "Their data handling"]),
                ("flow", "held to account by"),
                ("zone", "Assurance and contract", ["Supplier questionnaire", "Security clauses", "Exit plan"]),
            ],
        },
        "parts": [
            ("Integration layer", "The part of your service that talks to the supplier, kept separate from the rest."),
            ("API gateway", "Handles authentication, rate limits, input checks and logging for every call."),
            ("Credentials", "Separate, strong credentials for each integration and environment, kept in a secrets vault."),
            ("Supplier's service", "The external system, with its own security that you need assurance about."),
            ("Assurance and contract", "What you checked, what the supplier has agreed to and how you would leave."),
        ],
        "risks": [
            "A compromised supplier being used as a route into your service.",
            "Sharing more data than the integration needs.",
            "Weak or shared credentials, such as one API key for every environment.",
            "Trusting data from the supplier without checking it.",
            "A supplier outage taking your service down.",
            "Data stored or processed somewhere you did not agree to.",
        ],
        "controls": [
            "Share the minimum data, and record what is shared and why.",
            "Strong authentication for each integration, such as mutual TLS or short-lived tokens.",
            "Credentials in a secrets vault, rotated regularly.",
            "Validate data in both directions, with rate limits and timeouts.",
            "Supplier assurance before go-live and at renewal, with security clauses in the contract.",
            "Monitoring, and a plan for supplier outages and exit.",
        ],
        "caf": [CAF_A4, CAF_B2, CAF_B3, CAF_B5],
        "ncsc": [
            (NCSC + "/collection/supply-chain-security", "NCSC supply chain security guidance"),
            (NCSC + "/collection/securing-http-based-apis", "NCSC securing HTTP-based APIs"),
            (NCSC + "/collection/cloud/the-cloud-security-principles", "NCSC Cloud Security Principles"),
            (NCSC + "/collection/cyber-security-design-principles", "NCSC cyber security design principles"),
        ],
        "templates": ["supplier-assurance", "threat-model", "risk-register"],
        "tools": ["api-govassure", "scope-govassure", "govassure-sbd"],
        "mistakes": [
            "Trusting supplier data without validating it.",
            "Using one shared API key across all environments.",
            "Having no list of which suppliers are connected to what.",
            "Doing supplier assurance once and never again.",
            "Having no plan for when the supplier is unavailable.",
        ],
    },
]

INDEX_TITLE = "Patterns library"


def ext(url, text):
    return f'<a href="{url}" target="_blank" rel="noopener">{html.escape(text)}<span class="visually-hidden"> (opens in a new tab)</span></a>'


def parts():
    a = (ROOT / "architect" / "index.html").read_text(encoding="utf-8")
    head = a[:a.index("</head>")]
    header = a[a.index('  <header class="site-header">'):a.index("  </header>") + len("  </header>")]
    footer = a[a.index('  <footer class="site-footer">'):a.index("  </footer>") + len("  </footer>")]
    return head, header, footer


def make_head(head, title, desc, path):
    full = f"{title} — GOV Assured"
    h = re.sub(r"<title>.*?</title>", f"<title>{html.escape(full)}</title>", head)
    h = re.sub(r'(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*"',
               lambda m: m.group(1) + html.escape(desc) + '"', h)
    h = re.sub(r'(<meta (?:property|name)="(?:og:title|twitter:title)" content=")[^"]*"',
               lambda m: m.group(1) + html.escape(full) + '"', h)
    h = h.replace(f'{BASE}/architect/"', f'{BASE}{path}"')
    h = re.sub(r'  <link rel="stylesheet" href="/architect\.css[^"]*">',
               '  <link rel="stylesheet" href="/architect.css">\n  <link rel="stylesheet" href="/architect-patterns.css">', h)
    return h


def crumbs(items):
    lis = [f'          <li><a href="{h}">{t}</a></li>' if h else f'          <li aria-current="page">{t}</li>' for h, t in items]
    return ('    <div class="wrap">\n      <nav class="arch-crumbs" aria-label="Breadcrumb">\n        <ol>\n'
            + "\n".join(lis) + "\n        </ol>\n      </nav>\n    </div>")


def page(head, header, footer, main):
    return (head + "</head>\n<body>\n  <a class=\"skip-link\" href=\"#main\">Skip to content</a>\n\n" + header
            + "\n\n  <main id=\"main\" tabindex=\"-1\">\n" + main + "\n  </main>\n\n" + footer + "\n</body>\n</html>\n")


def ul(items, cls=None, indent=10):
    pad = " " * indent
    c = f' class="{cls}"' if cls else ""
    return f"{pad}<ul{c}>\n" + "\n".join(f"{pad}  <li>{html.escape(i, quote=False)}</li>" for i in items) + f"\n{pad}</ul>"


def diagram(p):
    d = p["diagram"]
    rows = []
    for kind, *rest in d["nodes"]:
        if kind == "zone":
            title, items = rest
            lis = "".join(f"<li>{html.escape(i, quote=False)}</li>" for i in items)
            rows.append(f'            <li class="pat-zone"><p class="pat-zone-title">{html.escape(title, quote=False)}</p><ul>{lis}</ul></li>')
        else:
            rows.append(f'            <li class="pat-link"><span class="pat-arrow" aria-hidden="true"></span><span class="pat-link-label">{html.escape(rest[0], quote=False)}</span></li>')
    sid = p["slug"] + "-diagram-desc"
    return (f'          <figure class="pat-diagram" aria-describedby="{sid}">\n'
            f'            <ol class="pat-flow" aria-label="Diagram of the {html.escape(p["title"].lower())} pattern, in order">\n'
            + "\n".join(rows) + "\n            </ol>\n"
            f'            <figcaption id="{sid}"><strong>What the diagram shows:</strong> {html.escape(d["desc"], quote=False)}</figcaption>\n'
            "          </figure>")


def index_page(head, header, footer):
    cards = "\n".join(f'''          <li class="card pat-card">
            <h2><a href="/architect/patterns/{p["slug"]}/">{p["title"]}</a></h2>
            <p class="description">{html.escape(p["purpose"], quote=False)}</p>
          </li>''' for p in PATTERNS)
    main = crumbs([("/", "Home"), ("/architect/", "Security Architect Corner"), (None, "Patterns")]) + f'''

    <section class="band arch-hero" aria-labelledby="pat-title">
      <div class="wrap">
        <p class="eyebrow">Security Architect Corner</p>
        <h1 id="pat-title">{INDEX_TITLE}</h1>
        <p class="lede">Reusable security designs for problems that come up again and again. Each pattern explains when to use it, shows the parts in a simple diagram, and lists the main risks, the usual controls and the guidance it maps to.</p>
        <p class="section-intro">The patterns are vendor-neutral. Adapt them to your organisation&#39;s approved platforms and its own handling rules for sensitive information.</p>
      </div>
    </section>

    <section class="band arch-section" aria-labelledby="pat-list-title">
      <div class="wrap">
        <h2 id="pat-list-title" class="section-title">Choose a pattern</h2>
        <ul class="grid pat-cards">
{cards}
        </ul>
      </div>
    </section>'''
    desc = "Vendor-neutral security architecture patterns for UK public services: zero trust access, secure cloud landing zone, secrets and key management, logging to a SIEM and safe third-party integration."
    return page(make_head(head, INDEX_TITLE, desc, "/architect/patterns/"), header, footer, main)


def pattern_page(head, header, footer, i, apps):
    p = PATTERNS[i]
    s = p["slug"]
    when = ul(p["when"])
    parts_dl = "\n".join(f"            <div><dt>{html.escape(n, quote=False)}</dt><dd>{html.escape(d, quote=False)}</dd></div>" for n, d in p["parts"])
    caf = "\n".join(f"            <li>{ext(u, 'CAF ' + t)}</li>" for u, t in p["caf"])
    ncsc = "\n".join(f"            <li>{ext(u, t)}</li>" for u, t in p["ncsc"])
    tpls = "\n".join(f'            <li><a href="/architect/templates/{t}/">{TPL[t]}</a></li>' for t in p["templates"])
    tools = "\n".join(f'            <li><a href="{apps[t]["url"]}">{html.escape(apps[t]["name"], quote=False)}</a></li>' for t in p["tools"])
    pager = []
    if i > 0:
        q = PATTERNS[i - 1]
        pager.append(f'          <a class="tpl-pager-prev" href="/architect/patterns/{q["slug"]}/" rel="prev"><span class="tpl-pager-label">Previous pattern</span> <span class="tpl-pager-title">{q["title"]}</span></a>')
    if i < len(PATTERNS) - 1:
        q = PATTERNS[i + 1]
        pager.append(f'          <a class="tpl-pager-next" href="/architect/patterns/{q["slug"]}/" rel="next"><span class="tpl-pager-label">Next pattern</span> <span class="tpl-pager-title">{q["title"]}</span></a>')
    main = crumbs([("/", "Home"), ("/architect/", "Security Architect Corner"), ("/architect/patterns/", "Patterns"), (None, p["title"])]) + f'''

    <section class="band arch-hero" aria-labelledby="pat-title">
      <div class="wrap">
        <p class="eyebrow">{INDEX_TITLE}</p>
        <h1 id="pat-title">{p["title"]}</h1>
        <p class="lede">{html.escape(p["purpose"], quote=False)}</p>
      </div>
    </section>

    <section class="band arch-section pat-body" aria-label="{p["title"]} pattern">
      <div class="wrap pat-wrap">
        <h2 id="when">When to use it</h2>
{when}

        <h2 id="diagram">How it fits together</h2>
{diagram(p)}

        <h2 id="parts">The parts</h2>
          <dl class="pat-parts">
{parts_dl}
          </dl>

        <h2 id="risks">Main risks</h2>
{ul(p["risks"])}

        <h2 id="controls">Usual controls</h2>
{ul(p["controls"])}

        <h2 id="maps">What it maps to</h2>
        <h3>NCSC Cyber Assessment Framework principles</h3>
          <ul class="arch-refs">
{caf}
          </ul>
        <h3>NCSC guidance</h3>
          <ul class="arch-refs">
{ncsc}
          </ul>

        <h2 id="related">Related templates and tools</h2>
        <h3>Templates</h3>
          <ul>
{tpls}
          </ul>
        <h3>GOV Assured tools</h3>
          <ul>
{tools}
          </ul>

        <h2 id="mistakes">Common mistakes</h2>
{ul(p["mistakes"], "pat-mistakes")}

        <nav class="tpl-pager" aria-label="Patterns">
{chr(10).join(pager)}
        </nav>
        <p class="tpl-top"><a href="/architect/patterns/">All patterns</a></p>
      </div>
    </section>'''
    desc = p["purpose"] + " A vendor-neutral security architecture pattern with a diagram, risks, controls and NCSC mappings."
    return page(make_head(head, p["title"], desc, f"/architect/patterns/{s}/"), header, footer, main)


def main():
    apps = {a["id"]: a for a in json.loads((ROOT / "data" / "apps.json").read_text(encoding="utf-8"))["apps"]}
    head, header, footer = parts()
    out = ROOT / "architect" / "patterns"
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(index_page(head, header, footer), encoding="utf-8")
    for i, p in enumerate(PATTERNS):
        d = out / p["slug"]
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(pattern_page(head, header, footer, i, apps), encoding="utf-8")
    print(f"Wrote {len(PATTERNS) + 1} pattern pages")


if __name__ == "__main__":
    main()
