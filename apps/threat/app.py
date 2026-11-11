"""
Threat-Informed Defense Planner
Flask backend for Vercel deployment.

Routes:
  GET  /api/groups             → list ATT&CK groups
  POST /api/analyze            → run gap analysis
  GET  /api/d3fend/<tech_id>   → proxy D3FEND countermeasures
"""

import gzip
import json
import os
import re
import concurrent.futures
import requests
import yaml
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="public", static_url_path="")
CORS(app)

SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Content-Security-Policy": (
        "default-src 'self'; script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; "
        "connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; "
        "frame-ancestors 'none'; upgrade-insecure-requests"
    ),
}


_COMPRESSIBLE = ("text/", "application/json", "application/javascript", "image/svg+xml", "application/xml")
_HASHED_QS = re.compile(r"^v=[0-9a-f]{6,}$")


@app.before_request
def _strip_gzip_etag_suffix():
    # gzip responses carry ETag "<file-etag>-gz"; map it back so conditional requests still get 304
    inm = request.environ.get("HTTP_IF_NONE_MATCH")
    if inm and '-gz"' in inm:
        request.environ["HTTP_IF_NONE_MATCH"] = inm.replace('-gz"', '"')


@app.after_request
def add_security_headers(resp):
    for k, v in SECURITY_HEADERS.items():
        resp.headers.setdefault(k, v)
    # Cache policy: HTML revalidates (ETag), content-hashed ?v= assets are immutable, other static assets 1h
    if not request.path.startswith("/api/") and resp.status_code in (200, 304):
        mt = resp.mimetype or ""
        if mt == "text/html":
            resp.headers["Cache-Control"] = "no-cache"
        elif _HASHED_QS.match(request.query_string.decode("latin-1")):
            resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        else:
            resp.headers["Cache-Control"] = "public, max-age=3600, stale-while-revalidate=86400"
    elif not request.path.startswith("/api/"):
        resp.headers["Cache-Control"] = "no-cache"
    # gzip compressible responses (static files and API JSON)
    if (
        resp.status_code in (200, 404)
        and "gzip" in request.headers.get("Accept-Encoding", "").lower()
        and "Content-Encoding" not in resp.headers
        and (resp.mimetype or "").startswith(_COMPRESSIBLE)
        and request.method != "HEAD"
    ):
        resp.direct_passthrough = False
        data = resp.get_data()
        if len(data) >= 1024:
            resp.set_data(gzip.compress(data, compresslevel=6))
            resp.headers["Content-Encoding"] = "gzip"
            etag = resp.headers.get("ETag")
            if etag and etag.endswith('"') and not etag.endswith('-gz"'):
                resp.headers["ETag"] = etag[:-1] + '-gz"'
    if (resp.mimetype or "").startswith(_COMPRESSIBLE):
        resp.vary.add("Accept-Encoding")
    return resp

# ---------------------------------------------------------------------------
# Load bundled ATT&CK data at startup
# ---------------------------------------------------------------------------
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "attack_data.json")

with open(DATA_PATH) as f:
    ATTACK_DATA = json.load(f)

GROUPS     = ATTACK_DATA["groups"]      # {G0016: {name, aliases, techniques, ...}}
TECHNIQUES = ATTACK_DATA["techniques"]  # {T1059: {name, tactics, url}}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def fetch_d3fend(technique_id: str) -> dict:
    """Call D3FEND API for a single ATT&CK technique ID."""
    # Normalise sub-technique: T1059.001 → T1059.001 (D3FEND uses dots)
    url = f"https://d3fend.mitre.org/api/offensive-technique/attack/{technique_id}.json"
    try:
        r = requests.get(url, timeout=8)
        if r.status_code == 200:
            data = r.json()
            # D3FEND returns {"results": {"bindings": [...]}}
            bindings = (data.get("off_to_def") or data).get("results", {}).get("bindings", [])
            countermeasures = []
            seen = set()
            for b in bindings:
                name = b.get("def_tactic_label", {}).get("value", "") or b.get("def_tactic", {}).get("value", "").split("#")[-1]
                tech = b.get("def_tech", {}).get("value", "")
                label = b.get("def_tech_label", {}).get("value", "")
                d3f_id = b.get("def_tech_id", {}).get("value", "")
                if d3f_id and d3f_id not in seen:
                    seen.add(d3f_id)
                    countermeasures.append({
                        "tactic": name,
                        "technique": label or tech.split("/")[-1].replace("_", " "),
                        "id": d3f_id,
                        "url": f"https://d3fend.mitre.org/technique/d3f:{tech.split('#')[-1]}/" if tech else f"https://d3fend.mitre.org/technique/{d3f_id}/",
                    })
            return {"technique_id": technique_id, "countermeasures": countermeasures}
    except Exception:
        pass
    return {"technique_id": technique_id, "countermeasures": []}


def parse_dettect(yaml_text: str) -> dict:
    """
    Parse a DeTT&CT techniques YAML.
    Returns {technique_id: {visibility: int, detection: int}} (scores 0-5).
    """
    coverage = {}
    try:
        doc = yaml.safe_load(yaml_text)
        for tech in doc.get("techniques", []):
            tid = tech.get("technique_id", "")
            if not tid:
                continue

            vis_score  = 0
            det_score  = 0

            # Visibility block
            for v in tech.get("visibility", []):
                for s in v.get("score_logbook", []):
                    vis_score = max(vis_score, s.get("score", 0))

            # Detection block
            for d in tech.get("detection", []):
                for s in d.get("score_logbook", []):
                    det_score = max(det_score, s.get("score", 0))

            coverage[tid] = {
                "visibility": vis_score,
                "detection":  det_score,
            }
    except Exception:
        pass
    return coverage


def priority_label(visibility: int, detection: int, has_d3fend: bool) -> str:
    gap = (5 - visibility) + (5 - detection)  # 0-10
    if gap >= 7 and has_d3fend:
        return "critical"
    if gap >= 5 and has_d3fend:
        return "high"
    if gap >= 3:
        return "medium"
    return "low"


# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------

@app.route("/api/groups")
def api_groups():
    result = []
    for gid, g in sorted(GROUPS.items(), key=lambda x: x[1]["name"]):
        result.append({
            "id":          gid,
            "name":        g["name"],
            "aliases":     g["aliases"],
            "description": g["description"],
            "url":         g["url"],
            "tech_count":  len(g["techniques"]),
        })
    return jsonify(result)


@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    data = request.get_json(silent=True) or {}
    group_id   = data.get("group_id", "").upper()
    yaml_text  = data.get("dettect_yaml", "")

    if group_id not in GROUPS:
        return jsonify({"error": f"Unknown group: {group_id}"}), 400

    group      = GROUPS[group_id]
    coverage   = parse_dettect(yaml_text) if yaml_text else {}
    tech_ids   = group["techniques"]

    # Fetch D3FEND data concurrently (cap at 20 parallel requests)
    d3fend_map = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
        futures = {pool.submit(fetch_d3fend, tid): tid for tid in tech_ids}
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            d3fend_map[result["technique_id"]] = result["countermeasures"]

    results = []
    for tid in sorted(tech_ids):
        tech       = TECHNIQUES.get(tid, {})
        cov        = coverage.get(tid, {})
        vis        = cov.get("visibility", 0)
        det        = cov.get("detection",  0)
        cms        = d3fend_map.get(tid, [])
        priority   = priority_label(vis, det, bool(cms))

        results.append({
            "technique_id":      tid,
            "technique_name":    tech.get("name", tid),
            "technique_url":     tech.get("url",  ""),
            "tactics":           tech.get("tactics", []),
            "visibility_score":  vis,
            "detection_score":   det,
            "d3fend_count":      len(cms),
            "d3fend":            cms,
            "priority":          priority,
        })

    # Sort: critical → high → medium → low, then by gap descending
    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    results.sort(key=lambda r: (
        order[r["priority"]],
        -(10 - r["visibility_score"] - r["detection_score"])
    ))

    return jsonify({
        "group": {
            "id":          group_id,
            "name":        group["name"],
            "aliases":     group["aliases"],
            "url":         group["url"],
            "description": group["description"],
        },
        "results":  results,
        "coverage": {
            "techniques_total":    len(tech_ids),
            "techniques_covered":  sum(1 for t in results if t["visibility_score"] > 0 or t["detection_score"] > 0),
            "critical_gaps":       sum(1 for t in results if t["priority"] == "critical"),
            "high_gaps":           sum(1 for t in results if t["priority"] == "high"),
        },
    })


@app.route("/api/d3fend/<technique_id>")
def api_d3fend(technique_id):
    if not re.match(r"^T\d{4}(\.\d{3})?$", technique_id):
        return jsonify({"error": "Invalid technique ID"}), 400
    return jsonify(fetch_d3fend(technique_id))


# ---------------------------------------------------------------------------
# Serve static frontend
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return send_from_directory("public", "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory("public", path)


@app.errorhandler(404)
def not_found(_e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Not found"}), 404
    return send_from_directory("public", "ga-404.html"), 404


if __name__ == "__main__":
    app.run(debug=True, port=5000)
