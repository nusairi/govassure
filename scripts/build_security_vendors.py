#!/usr/bin/env python3
"""Build data/security-vendors.json for /security-vendor-origins/.

Reads scripts/security-vendors-research.json (not published: it contains
non-government source URLs). Official government URLs are kept as live links.
Every other source becomes a reference code plus a host/path label. The label
has no scheme, so the served JSON does not contain those URLs.

Official hosts match scripts/check_links.py: UK government and Parliament
suffixes, the named public bodies, and a hostname that is "gov" or ends with
".gov" (US federal). europa.eu is not treated as official; it is not in this
dataset.
"""

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "scripts" / "security-vendors-research.json"
OUT = ROOT / "data" / "security-vendors.json"

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
    ".gov",
)
BANNED = ("jontever", "nusairi", "silvester", "jonathan", "github.com", "vercel.app")
URL_RE = re.compile(r"https?://[^\s\"'<>]+", re.I)

CATS = [
    ("Endpoint & antivirus", r"endpoint|antivirus|\bav\b|consumer|edr|xdr|uem|backup"),
    ("SIEM & security operations", r"siem|soar|secops|\bsoc\b|mdr|ndr|ueba|log\b|\bir\b"),
    ("Network, firewall & SASE", r"firewall|sase|sse|network|vpn|zero trust|ddos|waf|microsegmentation|web security|telecom"),
    ("Cloud security", r"cloud|cnapp|container"),
    ("Application security", r"appsec|software supply chain|secrets"),
    ("Identity & access", r"identity|pam|iam|mfa|password"),
    ("Email security", r"email"),
    ("Vulnerability & exposure", r"vulnerab|exposure|pentest|attack simulation|policy management"),
    ("Threat intelligence", r"threat intel|fraud"),
    ("Data security & DLP", r"data security|dlp|dspm|encryption"),
    ("OT & IoT security", r"\bot\b|iot|unidirectional"),
    ("Video surveillance", r"surveillance"),
    ("Other security", r"cybersecurity|security services|secure communications|government security|enterprise security"),
]

# Dated ownership events (2022-2026) shown on the recent-changes list.
# The URLs stay in this script only. The page JSON stores a reference code.
DEALS = {
    "Zscaler": [("2026-11-23", "CrowdStrike announced an all-stock agreement to acquire Zscaler (about US$43.9bn). Pending shareholder and regulatory approval.", "https://ir.crowdstrike.com/news-releases/news-release-details/crowdstrike-acquire-zscaler-bringing-network-security-and-zero/")],
    "CrowdStrike": [("2026-11-23", "Announced agreement to acquire Zscaler (pending).", "https://ir.crowdstrike.com/news-releases/news-release-details/crowdstrike-acquire-zscaler-bringing-network-security-and-zero/"),
                    ("2026-09-08", "Bought XM Cyber intellectual property and source code from Schwarz Digits (closed).", "https://en.globes.co.il/en/article-crowdstrike-buys-israeli-german-co-xm-cybers-ip-1001559322")],
    "Varonis": [("2026-10-15", "Proofpoint announced an all-cash agreement to acquire Varonis (about US$6.3bn). Pending; expected to close in the first half of 2027.", "https://www.proofpoint.com/us/newsroom/press-releases/proofpoint-acquire-varonis-creating-global-leader-data-and-ai-security")],
    "Proofpoint": [("2026-10-15", "Announced agreement to acquire Varonis (pending).", "https://www.proofpoint.com/us/newsroom/press-releases/proofpoint-acquire-varonis-creating-global-leader-data-and-ai-security")],
    "XM Cyber": [("2026-09-08", "CrowdStrike bought its intellectual property and source code; the company stays with Schwarz Group and continues under licence.", "https://en.globes.co.il/en/article-crowdstrike-buys-israeli-german-co-xm-cybers-ip-1001559322")],
    "Armis": [("2026-04-20", "ServiceNow completed its acquisition.", "https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-completes-Armis-acquisition-closing-the-gap-between-asset-visibility-and-cyber-risk/")],
    "Guardsix (formerly Logpoint)": [("2026-03-12", "Logpoint renamed itself Guardsix.", "https://guardsix.com/blog/logpoint-becomes-guardsix-standing-closer-to-europes-defenders")],
    "WithSecure": [("2026-03-26", "Delisted from Nasdaq Helsinki after the CVC-backed Diana BidCo takeover.", "https://www.withsecure.com/en/recommended-cash-tender-offer/diana-bidco-oy-has-gained-title-to-the-minority-shares-in-withsecure-corporation/")],
    "Wiz": [("2026-03-11", "Google completed its acquisition (announced March 2025).", "https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/wiz-acquisition/")],
    "CyberArk": [("2026-02-11", "Palo Alto Networks completed its acquisition; CyberArk delisted from NASDAQ.", "https://investors.paloaltonetworks.com/news-releases/news-release-details/palo-alto-networks-completes-acquisition-cyberark-secure--ai-era")],
    "Palo Alto Networks": [("2026-02-11", "Completed acquisition of CyberArk.", "https://investors.paloaltonetworks.com/news-releases/news-release-details/palo-alto-networks-completes-acquisition-cyberark-secure--ai-era")],
    "Nozomi Networks": [("2026-01-28", "Mitsubishi Electric completed its acquisition.", "https://www.nozominetworks.com/press-release/nozomi-networks-enters-next-phase-of-growth-as-mitsubishi-electric-completes-acquisition")],
    "Cybereason": [("2025-11-25", "LevelBlue completed its acquisition; SoftBank and Liberty Strategic Capital invested in LevelBlue.", "https://www.levelblue.com/newsroom/press-releases/levelblue-completes-acquisition-of-cybereason-expanding-global-leadership-in-managed-detection-and-response-xdr-and-incident-response")],
    "Sophos": [("2025-02-03", "Completed acquisition of Secureworks.", "https://www.sophos.com/en-us/press/press-releases/2025/02/sophos-completes-secureworks-acquisition")],
    "Recorded Future": [("2024-12-20", "Mastercard completed its acquisition.", "https://investor.mastercard.com/investor-news/investor-newsdetails/2024/Mastercard-Finalizes-Acquisition-of-Recorded-Future/default.aspx")],
    "Darktrace": [("2024-10-01", "Thoma Bravo completed its take-private; delisted from the London Stock Exchange.", "https://www.thomabravo.com/press-releases/thoma-bravo-completes-acquisition-of-darktrace")],
    "Splunk": [("2024-03-18", "Cisco completed its acquisition.", "https://investor.cisco.com/news/news-details/2024/Cisco-Completes-Acquisition-of-Splunk/default.aspx")],
    "Acronis": [("2024-08", "EQT agreed to buy a majority stake (completed 2025).", "https://www.acronis.com/en/pr/2024/eqt-to-acquire-a-majority-stake-in-acronis/")],
    "Group-IB": [("2023-04", "Completed its exit from Russia; the Russian business was sold to local management as F.A.C.C.T. (now F6).", "https://www.group-ib.com/media-center/press-releases/group-ib-exits-russia/")],
    "F6 (formerly F.A.C.C.T.)": [("2025-02", "Cyberus fund closed its purchase of the business.", "https://www.vedomosti.ru/technology/articles/2025/02/17/1092702-saiberus-zakril-group-ib")],
}
RECENT = ["Zscaler", "Varonis", "Wiz", "CyberArk", "Armis", "Nozomi Networks", "Cybereason", "XM Cyber"]


def is_official_source_host(host):
    name = (host or "").lower().rstrip(".")
    if name in ALLOWED_SOURCE_HOSTS or name == "gov":
        return True
    return any(name.endswith(suffix) for suffix in ALLOWED_SOURCE_SUFFIXES)


def is_official_url(url):
    parsed = urlparse(url)
    return parsed.scheme.lower() == "https" and is_official_source_host(parsed.hostname)


def primary(country):
    if not country or country == "unverified":
        return "Unverified"
    return re.split(r"\s*/\s*|\s*\(", country)[0].strip()


def buckets(cat):
    text = cat.lower()
    out = [name for name, rx in CATS if re.search(rx, text)]
    return out or ["Other security"]


def clean_cat(cat):
    return (cat.replace("(physical security; included per brief)", "(physical security)")
               .replace("(physical security, included per brief)", "(physical security)"))


def host_label(url):
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    path = parsed.path or "/"
    path = "" if path == "/" else path.rstrip("/")
    extra = ""
    if parsed.query:
        extra += "?" + parsed.query
    if parsed.fragment:
        extra += "#" + parsed.fragment
    label = f"{host}{path}{extra}"
    if len(label) > 96:
        label = label[:93] + "..."
    return label


def build():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    codes = {}
    order = []
    used_official = []

    def ref(url):
        if not url:
            return None
        if is_official_url(url):
            parsed = urlparse(url)
            if parsed.query or parsed.fragment:
                raise SystemExit(f"official URL has a query or fragment: {url}")
            used_official.append(url)
            return {"g": url}
        if url not in codes:
            codes[url] = "R%d" % (len(codes) + 1)
            order.append(url)
        return {"r": codes[url]}

    names = {row["name"] for row in data["vendors"]}
    missing = [name for name in list(DEALS) + RECENT if name not in names]
    if missing:
        raise SystemExit("deal or recent name is not a vendor: " + ", ".join(missing))

    vendors = []
    for row in data["vendors"]:
        tags = []
        for tag in row["tags"]:
            key, _, val = tag["tag"].partition(": ")
            tags.append({"k": key, "t": val, "s": ref(tag["source"])})
        deals = [{"d": when, "t": text, "s": ref(url)} for when, text, url in DEALS.get(row["name"], [])]
        state = row["state_linked_investor"]
        vendors.append({
            "n": row["name"],
            "cat": clean_cat(row["category"]),
            "b": buckets(row["category"]),
            "fy": row["founded_year"],
            "fp": row["founded_place"],
            "o": row["country_of_origin"],
            "po": primary(row["country_of_origin"]),
            "hq": row["hq_country"],
            "own": row["ownership"],
            "chain": [{
                "e": part["entity"],
                "c": part["country"],
                "r": part["relationship"],
                "since": part["since"],
                "s": ref(part["source"]),
            } for part in row["parent_chain"]],
            "uo": row["ultimate_owner"],
            "uoc": row["ultimate_owner_country"],
            "puoc": primary(row["ultimate_owner_country"]),
            "sh": row["major_shareholders_over_10pct"],
            "sl": {"v": state["value"], "n": state["note"], "s": ref(state["source"])},
            "fb": row["founding_background"],
            "rd": row["rd_locations"],
            "gov": [{"a": act["action"], "d": act["date"], "s": ref(act["source"])} for act in row["government_actions"]],
            "tags": tags,
            "src": [ref(url) for url in row["sources"]],
            "deals": deals,
            "notes": row["notes"].replace("included per brief", "included because of the government actions"),
        })

    refs = []
    for url in order:
        label = host_label(url)
        if "://" in label or label.lower().startswith("http"):
            raise SystemExit(f"reference label still looks like a URL: {label}")
        refs.append({"c": codes[url], "h": label})

    doc = {
        "meta": {
            "verified": data.get("generated", "2026-11-27"),
            "count": len(vendors),
            "recent": RECENT,
        },
        "vendors": vendors,
        "refs": refs,
    }
    check(doc, used_official)
    OUT.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    outside = sum(1 for v in vendors if v["po"] != "Unverified" and v["puoc"] != "Unverified" and v["po"] != v["puoc"])
    print(
        f"Wrote {OUT.relative_to(ROOT)}: {len(vendors)} vendors, "
        f"{sum(1 for v in vendors if v['gov'])} with government actions, "
        f"{sum(1 for v in vendors if v['sl']['v'] == 'yes')} state-linked, "
        f"{outside} owned outside origin, {len(refs)} reference codes, "
        f"{len(set(used_official))} official URLs."
    )


def check(doc, used_official):
    if doc["meta"]["count"] != 130 or len(doc["vendors"]) != 130:
        raise SystemExit(f"expected 130 vendors, got {len(doc['vendors'])}")
    if doc["meta"]["verified"] != "2026-11-27":
        raise SystemExit(f"unexpected verified date {doc['meta']['verified']}")
    gov_n = sum(1 for v in doc["vendors"] if v["gov"])
    state_n = sum(1 for v in doc["vendors"] if v["sl"]["v"] == "yes")
    outside = sum(1 for v in doc["vendors"] if v["po"] != "Unverified" and v["puoc"] != "Unverified" and v["po"] != v["puoc"])
    if (gov_n, state_n, outside) != (13, 10, 24):
        raise SystemExit(f"headline figures changed: gov={gov_n} state={state_n} outside={outside}")
    for ref in doc["refs"]:
        if set(ref) != {"c", "h"}:
            raise SystemExit(f"reference must be {{c, h}} only: {ref}")
    text = json.dumps(doc, ensure_ascii=False)
    lowered = text.lower()
    for banned in BANNED:
        if banned in lowered:
            raise SystemExit(f"banned text in page JSON: {banned}")
    for match in URL_RE.findall(text):
        parsed = urlparse(match)
        if not is_official_url(match) or parsed.query or parsed.fragment:
            raise SystemExit(f"disallowed URL in page JSON: {match}")
    if len(set(used_official)) < 1:
        raise SystemExit("no official government URLs were kept")


if __name__ == "__main__":
    try:
        build()
    except BrokenPipeError:
        sys.exit(0)
