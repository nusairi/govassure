#!/usr/bin/env python3
"""Fail if the site links outside *.govassured.com.

mailto links are allowed. The only other web addresses allowed are the GOV
Assured LinkedIn company page, the company repository
https://github.com/nusairi/govassure, and the schema.org JSON-LD context.
"""

import json
import re
import sys
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
    "sitemap.xml",
    "robots.txt",
    "staticwebapp.config.json",
    "vercel.json",
]
BANNED = ("jontever", "nusairi", "silvester", "jonathan", "github.com", "vercel.app")
ALLOWED_EXACT = {
    "https://www.linkedin.com/company/102617034",
    "https://github.com/nusairi/govassure",
    "https://schema.org",
}


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
        if parsed.query or parsed.fragment:
            return "web links must not add a query or fragment"
        host = (parsed.hostname or "").lower()
        path = parsed.path.rstrip("/")
        identity = f"{parsed.scheme.lower()}://{host}{path}"
        if lower.startswith("http://"):
            return "web links must use https"
        if identity in ALLOWED_EXACT:
            return None
        if host == "govassured.com" or host.endswith(".govassured.com"):
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
        "https://github.com/nusairi/govassure": None,
        "https://github.com/nusairi/govassure/": None,
        "https://github.com/nusairi/govassure/issues": "host is outside *.govassured.com",
        "https://github.com/other/govassure": "host is outside *.govassured.com",
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
            for match in URL_RE.findall(text):
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
