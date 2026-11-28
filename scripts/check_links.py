#!/usr/bin/env python3
"""Fail if the site links outside *.govassured.com.

mailto links are allowed. The only other web addresses allowed are the GOV
Assured LinkedIn company page, the company repository
https://github.com/nusairi/govassure (plus its security advisory form and
SECURITY.md), the schema.org JSON-LD context, the ISO/IEC 27001 and NIST CSF pages
cited on the Security Architect Corner, and
official UK government and Parliament source pages used by the government map
(gov.uk, parliament.uk, and the named independent bodies), US federal hosts
whose name is gov or ends with .gov (used by the security vendor origins
preview), and the exact YouTube videos (and playlists) cited on the Security
Architect Corner beginner path and on the Start your security journey path
(each clip at its exact start time).
"""

import json
import re
import sys
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

URL_RE = re.compile(r"https?://[^\s\"'<>]+", re.I)

ROOT = Path(__file__).resolve().parents[1]
SERVED = [
    "index.html",
    "apps/index.html",
    "live.js",
    "live.css",
    "404.html",
    "app.js",
    "styles.css",
    "data/apps.json",
    "data/govmap.json",
    "data/govmap-glossary.json",
    "data/govmap-terms.json",
    "data/budget.json",
    "data/parliament.json",
    "sitemap.xml",
    "robots.txt",
    ".well-known/security.txt",
    "staticwebapp.config.json",
    "vercel.json",
    "govmap.js",
    "govmap.css",
    "govmap-chart.js",
    "govmap-chart.css",
    "govmap-glossary.js",
    "govmap-terms.js",
    "govmap-parliament.js",
    "govmap-parliament.css",
    "govmap-budget.js",
    "govmap-budget.css",
    "govmap-budget-share.js",
    "govmap/index.html",
    "govmap/ministerial/index.html",
    "govmap/non-ministerial/index.html",
    "govmap/glossary/index.html",
    "govmap/parliament/index.html",
    "govmap/budget/index.html",
    "architect/index.html",
    "architect/beginners/index.html",
    "architect/beginners/1-role/index.html",
    "architect/beginners/2-principles/index.html",
    "architect/beginners/3-identity/index.html",
    "architect/beginners/4-networks-data/index.html",
    "architect/beginners/5-risk/index.html",
    "architect/beginners/6-lifecycle/index.html",
    "architect/beginners/7-first-exercise/index.html",
    "architect.js",
    "architect.css",
    "architect-beginners.js",
    "architect-beginners.css",
    "start/index.html",
    "start/1-what-is-cyber-security/index.html",
    "start/2-threats-and-attackers/index.html",
    "start/3-passwords-and-accounts/index.html",
    "start/4-devices-and-updates/index.html",
    "start/5-phishing-and-scams/index.html",
    "start/6-networks-and-internet/index.html",
    "start/7-data-and-privacy/index.html",
    "start/8-careers-and-next-steps/index.html",
    "start-journey.js",
    "start-journey.css",
    "architect/templates/index.html",
    "architect/templates/security-design/index.html",
    "architect/templates/risk-register/index.html",
    "architect/templates/threat-model/index.html",
    "architect/templates/decision-record/index.html",
    "architect/templates/supplier-assurance/index.html",
    "architect/templates/ready-for-beta/index.html",
    "architect/templates/data-and-sensitivity-summary/index.html",
    "architect/templates/risk-owners-and-sign-off/index.html",
    "architect/templates/live-security-plan/index.html",
    "architect/templates/decommission-and-disposal-plan/index.html",
    "architect/document-trail/index.html",
    "architect-templates.js",
    "architect-templates.css",
    "architect-patterns.css",
    "architect/patterns/index.html",
    "architect/patterns/zero-trust-access/index.html",
    "architect/patterns/secure-cloud-landing-zone/index.html",
    "architect/patterns/secrets-and-key-management/index.html",
    "architect/patterns/logging-to-a-siem/index.html",
    "architect/patterns/safe-third-party-integration/index.html",
    "security-vendor-origins/index.html",
    "security-vendor-origins.js",
    "security-vendor-origins.css",
    "data/security-vendors.json",
    "data/world-countries.json",
]
BANNED = ("jontever", "nusairi", "silvester", "jonathan", "github.com", "vercel.app")
ALLOWED_EXACT = {
    "https://www.linkedin.com/company/102617034",
    "https://github.com/nusairi/govassure",
    "https://github.com/nusairi/govassure/security/advisories/new",
    "https://github.com/nusairi/govassure/blob/main/SECURITY.md",
    "https://schema.org",
    # Security Architect Corner standards cheat-sheet (official standard pages).
    "https://www.iso.org/standard/27001",
    "https://www.nist.gov/cyberframework",
    # Architect templates: ICO data protection impact assessment template and guide.
    "https://ico.org.uk/media2/migrated/2553993/dpia-template.docx",
    "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/how-do-we-do-a-dpia",
    # Beginner path: exact Cybersecurity Architecture series videos and the playlist.
    "https://www.youtube.com/watch?v=jq_LZ1RFPfU",
    "https://www.youtube.com/watch?v=EqNe55IzjAw",
    "https://www.youtube.com/watch?v=E9pHJRRfAhw",
    "https://www.youtube.com/watch?v=5uNifnVlBy4",
    "https://www.youtube.com/watch?v=Njqid_JpqTs",
    "https://www.youtube.com/watch?v=sesacY7Xz3c",
    "https://www.youtube.com/watch?v=nthEXs12nFE",
    "https://www.youtube.com/watch?v=UpkqXK0B2E0",
    "https://www.youtube.com/watch?v=VEu326IZpsc",
    "https://www.youtube.com/watch?v=Jk79QJCxPkM",
    "https://www.youtube.com/playlist?list=PLOspHqNVtKADkWLFt9OcziQF7EatuANSY",
    # Start your security journey: Google Cybersecurity Certificate playlist and the exact clip start points used.
    "https://www.youtube.com/playlist?list=PL590L5WQmH8d68VyR6RjhgldHMxMJ5B5z",
    "https://www.youtube.com/watch?v=_DVVNOGYtmU&t=616s",
    "https://www.youtube.com/watch?v=34BtwcL7Mkg&t=2139s",
    "https://www.youtube.com/watch?v=_DVVNOGYtmU&t=1574s",
    "https://www.youtube.com/watch?v=34BtwcL7Mkg&t=835s",
    "https://www.youtube.com/watch?v=Rgl7C0P6NsE&t=2678s",
    "https://www.youtube.com/watch?v=NIRXtMg-0z8&t=3352s",
    "https://www.youtube.com/watch?v=Rgl7C0P6NsE&t=5790s",
    "https://www.youtube.com/watch?v=Rgl7C0P6NsE&t=5163s",
    "https://www.youtube.com/watch?v=NIRXtMg-0z8&t=499s",
    "https://www.youtube.com/watch?v=NIRXtMg-0z8&t=2242s",
    "https://www.youtube.com/watch?v=Rgl7C0P6NsE&t=1925s",
    "https://www.youtube.com/watch?v=3EgYr7jR4NI&t=386s",
    "https://www.youtube.com/watch?v=_DVVNOGYtmU&t=2200s",
    "https://www.youtube.com/watch?v=3EgYr7jR4NI&t=3323s",
}

# Official UK government, Parliament and related public-body hosts used as
# sources on the government map. Suffixes are matched on the hostname only
# (www.gov.uk is allowed; gov.uk.evil.example is not).
ALLOWED_SOURCE_HOSTS = {
    "gov.uk",
    "parliament.uk",
    "parliament.scot",
    "www.nao.org.uk",
    "www.ombudsman.org.uk",
    "www.electoralcommission.org.uk",
    "www.lgbce.org.uk",
    "www.theipsa.org.uk",
    "www.audit.wales",
}
ALLOWED_SOURCE_SUFFIXES = (
    ".gov.uk",
    ".parliament.uk",
    ".parliament.scot",
    # US federal. "www.example.gov" matches; "example.gov.evil.com" does not.
    ".gov",
)


def is_official_source_host(host):
    name = (host or "").lower().rstrip(".")
    if name in ALLOWED_SOURCE_HOSTS or name == "gov":
        return True
    return any(name.endswith(suffix) for suffix in ALLOWED_SOURCE_SUFFIXES)


class AttrParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.found = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for key in ("href", "src", "action"):
            if values.get(key):
                self.found.append((key, values[key]))
        content = values.get("content")
        if content and looks_like_url(content):
            self.found.append(("content", content))


def looks_like_url(value):
    text = value.strip().lower()
    return text.startswith(("http://", "https://", "mailto:", "//"))


def problem(url):
    """Return an error string, or None when the reference may stay."""
    raw = url.strip()
    if not raw or raw.startswith("#"):
        return None
    lower = raw.lower()
    if lower.startswith("mailto:"):
        if "://" in raw.split(":", 1)[1]:
            return "mailto target contains a web URL"
        return None
    if lower.startswith(("javascript:", "data:")):
        return "disallowed URL scheme"
    if raw.startswith("//"):
        return "protocol-relative URL"
    if lower.startswith(("http://", "https://")):
        parsed = urlparse(raw)
        host = (parsed.hostname or "").lower()
        path = parsed.path.rstrip("/")
        identity = f"{parsed.scheme.lower()}://{host}{path}"
        identity_full = f"{identity}?{parsed.query}" if parsed.query else identity
        if lower.startswith("http://"):
            return "web links must use https"
        # Exact allowlist may include a specific query (YouTube watch/playlist URLs).
        # A match on the path alone must not let a different query through.
        if not parsed.fragment and (
            (parsed.query and identity_full in ALLOWED_EXACT)
            or (not parsed.query and identity in ALLOWED_EXACT)
        ):
            return None
        if parsed.query or parsed.fragment:
            return "web links must not add a query or fragment"
        if host == "govassured.com" or host.endswith(".govassured.com"):
            return None
        if is_official_source_host(host):
            return None
        return "host is outside *.govassured.com"
    if "://" in raw:
        return "disallowed URL scheme"
    return None


def self_test():
    cases = {
        "https://www.govassured.com/": None,
        "https://poem.govassured.com": None,
        "https://govassured.com/tools": None,
        "mailto:contact@govassured.com": None,
        "/services": None,
        "#contact": None,
        "styles.css": None,
        "https://example.com": "host is outside *.govassured.com",
        "https://govassured.com.evil.com": "host is outside *.govassured.com",
        "https://notgovassured.com": "host is outside *.govassured.com",
        "http://www.govassured.com": "web links must use https",
        "//cdn.example.com/app.js": "protocol-relative URL",
        "javascript:alert(1)": "disallowed URL scheme",
        "https://www.linkedin.com/company/102617034": None,
        "https://www.linkedin.com/company/102617034/": None,
        "https://www.linkedin.com/in/example": "host is outside *.govassured.com",
        "https://www.linkedin.com/company/102617034?trk=public": "web links must not add a query or fragment",
        "https://schema.org": None,
        "https://schema.org/Person": "host is outside *.govassured.com",
        "https://www.iso.org/standard/27001": None,
        "https://www.iso.org/standard/27002": "host is outside *.govassured.com",
        "https://www.nist.gov/cyberframework": None,
        # Any https URL on a US federal .gov host is official, not only the CSF page.
        "https://www.nist.gov/other": None,
        "https://www.nist.gov/other?x=1": "web links must not add a query or fragment",
        "https://home.treasury.gov/news/press-releases/jy0127": None,
        "https://www.federalregister.gov/documents/2019/05/21/2019-10616/addition-of-entities-to-the-entity-list": None,
        "https://www.cisa.gov/news-events/directives/bod-17-01-removal-kaspersky-branded-products": None,
        "https://www.cisa.gov/news-events/directives/bod-17-01-removal-kaspersky-branded-products?x=1": "web links must not add a query or fragment",
        "http://www.cisa.gov/news-events/directives/bod-17-01-removal-kaspersky-branded-products": "web links must use https",
        "https://example.gov.evil.com/path": "host is outside *.govassured.com",
        "https://ico.org.uk/media2/migrated/2553993/dpia-template.docx": None,
        "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/how-do-we-do-a-dpia/": None,
        "https://ico.org.uk/": "host is outside *.govassured.com",
        "https://ico.org.uk/media2/migrated/2553993/other.docx": "host is outside *.govassured.com",
        "https://ico.org.uk.evil.example/media2/migrated/2553993/dpia-template.docx": "host is outside *.govassured.com",
        "https://www.ncsc.gov.uk/guidance/decommissioning-assets": None,
        "https://www.security.gov.uk/policy-and-guidance/secure-by-design/activities/": None,
        "https://github.com/nusairi/govassure": None,
        "https://github.com/nusairi/govassure/": None,
        "https://github.com/nusairi/govassure/security/advisories/new": None,
        "https://github.com/nusairi/govassure/blob/main/SECURITY.md": None,
        "https://github.com/nusairi/govassure/issues": "host is outside *.govassured.com",
        "https://github.com/other/govassure": "host is outside *.govassured.com",
        "https://www.gov.uk/government/organisations": None,
        "https://assets.publishing.service.gov.uk/media/x.xlsx": None,
        "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3": None,
        "https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence": None,
        "https://publications.parliament.uk/pa/cm5902/cmselect/cmspeak/309/report.html": None,
        "https://www.nao.org.uk/about-us/governance/": None,
        "https://www.audit.wales/publication.pdf": None,
        "https://gov.uk.evil.example/x": "host is outside *.govassured.com",
        "https://parliament.uk.evil.example/": "host is outside *.govassured.com",
        "https://www.gov.uk/search?q=1": "web links must not add a query or fragment",
        "http://www.gov.uk/government/organisations": "web links must use https",
        "https://www.youtube.com/watch?v=jq_LZ1RFPfU": None,
        "https://www.youtube.com/playlist?list=PLOspHqNVtKADkWLFt9OcziQF7EatuANSY": None,
        "https://www.youtube.com/watch?v=jq_LZ1RFPfU#t=1m": "web links must not add a query or fragment",
        "https://www.youtube.com/watch?v=not-on-the-allowlist": "web links must not add a query or fragment",
        "https://www.youtube.com/": "host is outside *.govassured.com",
        "https://www.youtube.com/watch?v=_DVVNOGYtmU&t=616s": None,
        "https://www.youtube.com/watch?v=_DVVNOGYtmU&t=617s": "web links must not add a query or fragment",
        "https://www.youtube.com/watch?v=_DVVNOGYtmU": "web links must not add a query or fragment",
        "https://www.youtube.com/playlist?list=PL590L5WQmH8d68VyR6RjhgldHMxMJ5B5z": None,
        "https://www.youtube.com/playlist?list=PL590L5WQmH8d68VyR6RjhgldHMxMJ5B5z&x=1": "web links must not add a query or fragment",
        "https://nationalcareers.service.gov.uk/job-profiles/cyber-intelligence-officer": None,
        "https://www.nicybersecuritycentre.gov.uk/securing-your-home-network-and-wi-fi": None,
        "https://youtu.be/jq_LZ1RFPfU": "host is outside *.govassured.com",
    }
    failed = False
    for url, expected in cases.items():
        got = problem(url)
        if got != expected:
            print(f"self-test failed for {url!r}: expected {expected!r}, got {got!r}", file=sys.stderr)
            failed = True
    if failed:
        sys.exit(1)


def scrub(text):
    cleaned = text
    for url in sorted(ALLOWED_EXACT, key=len, reverse=True):
        cleaned = re.sub(re.escape(url) + "/?", "", cleaned, flags=re.IGNORECASE)
    return cleaned


def collect():
    found = []
    for rel in SERVED:
        path = ROOT / rel
        text = path.read_text(encoding="utf-8")
        lower = scrub(text).lower()
        for banned in BANNED:
            if banned in lower:
                found.append((rel, "text", banned, f"banned text {banned}"))
        if rel.endswith(".html"):
            parser = AttrParser()
            parser.feed(text)
            for key, value in parser.found:
                found.append((rel, key, value, problem(value)))
        if rel == "sitemap.xml":
            for loc in re.findall(r"<loc>\s*([^<]+)\s*</loc>", text):
                found.append((rel, "loc", loc.strip(), problem(loc.strip())))
        elif rel != "sitemap.xml":
            for match in URL_RE.findall(unescape(text) if rel.endswith(".html") else text):
                found.append((rel, "url", match, problem(match)))
        if rel == "data/apps.json":
            for app in json.loads(text)["apps"]:
                if "source" in app:
                    found.append((rel, "source", app.get("id", ""), "source field is not allowed"))
                url = app.get("url", "")
                found.append((rel, "url", url, problem(url)))
    readme = ROOT / "README.md"
    readme_text = readme.read_text(encoding="utf-8")
    for match in URL_RE.findall(readme_text):
        if "github.com" in match.lower():
            url = match.rstrip("`.,;:!?)]}\"'")
            found.append(("README.md", "url", url, problem(url)))
    if "github.com" in scrub(readme_text).lower():
        found.append(("README.md", "text", "github.com", "GitHub URL other than the company repository"))
    return found


def main():
    self_test()
    errors = [item for item in collect() if item[3]]
    if errors:
        for rel, key, value, reason in errors:
            print(f"{rel}: {key} {value!r} — {reason}", file=sys.stderr)
        print(f"{len(errors)} disallowed reference(s).", file=sys.stderr)
        sys.exit(1)
    print("Link check passed.")


if __name__ == "__main__":
    main()
