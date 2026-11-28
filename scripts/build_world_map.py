#!/usr/bin/env python3
"""Build data/world-countries.json from Natural Earth 110m admin-0 countries.

The source file is public-domain Natural Earth, kept under scripts/vendor and
not published. The output is simplified SVG paths and centroids only: names,
ids and coordinates, with no web addresses.

Natural Earth 110m omits a few small states. Singapore is added as a point
because vendors in the origins dataset use it.
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "scripts" / "vendor" / "ne_110m_admin_0_countries.geojson"
OUT = ROOT / "data" / "world-countries.json"

W, H = 960.0, 500.0
LAT_MIN, LAT_MAX = -56.0, 84.0
# Names used by the vendor dataset, keyed by Natural Earth ADM0_A3.
CANON = {
    "USA": "United States",
    "RUS": "Russia",
    "KOR": "South Korea",
    "CZE": "Czech Republic",
    "TWN": "Taiwan",
    "GBR": "United Kingdom",
    "FRA": "France",
    "DEU": "Germany",
    "CHN": "China",
    "ISR": "Israel",
    "IND": "India",
    "CAN": "Canada",
    "JPN": "Japan",
    "SWE": "Sweden",
    "FIN": "Finland",
    "DNK": "Denmark",
    "NLD": "Netherlands",
    "ITA": "Italy",
    "ESP": "Spain",
    "ROU": "Romania",
    "SVK": "Slovakia",
    "TUR": "Turkey",
    "LUX": "Luxembourg",
    "PHL": "Philippines",
    "ARE": "United Arab Emirates",
    "SGP": "Singapore",
}
SKIP = {"ATA"}
POINTS = [
    {"id": "SGP", "name": "Singapore", "lon": 103.8, "lat": 1.35},
]


def project(lon, lat):
    lat = max(LAT_MIN, min(LAT_MAX, lat))
    x = (lon + 180.0) / 360.0 * W
    y = (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * H
    return (round(x, 1), round(y, 1))


def dist(p, a, b):
    ax, ay = a
    bx, by = b
    px, py = p
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    qx, qy = ax + t * dx, ay + t * dy
    return ((px - qx) ** 2 + (py - qy) ** 2) ** 0.5


def simplify(points, eps):
    if len(points) < 3:
        return points
    end = len(points) - 1
    a, b = points[0], points[end]
    index, best = 0, 0.0
    for i in range(1, end):
        d = dist(points[i], a, b)
        if d > best:
            index, best = i, d
    if best > eps:
        left = simplify(points[: index + 1], eps)
        right = simplify(points[index:], eps)
        return left[:-1] + right
    return [a, b]


def ring_path(ring):
    pts = simplify([(float(x), float(y)) for x, y in ring], 0.35)
    proj = []
    for lon, lat in pts:
        p = project(lon, lat)
        if not proj or p != proj[-1]:
            proj.append(p)
    if len(proj) < 3:
        return "", None
    d = "M" + " L".join(f"{x} {y}" for x, y in proj) + " Z"
    cx = round(sum(p[0] for p in proj) / len(proj), 1)
    cy = round(sum(p[1] for p in proj) / len(proj), 1)
    return d, (cx, cy, len(proj))


def feature_path(geom):
    polygons = []
    if geom["type"] == "Polygon":
        polygons = [geom["coordinates"]]
    elif geom["type"] == "MultiPolygon":
        polygons = geom["coordinates"]
    else:
        return "", None
    parts = []
    best = None
    for poly in polygons:
        for ring in poly:
            d, info = ring_path(ring)
            if d:
                parts.append(d)
                if info and (best is None or info[2] > best[2]):
                    best = info
    if not parts or not best:
        return "", None
    return " ".join(parts), (best[0], best[1])


def canonical(props):
    code = props.get("ADM0_A3") or ""
    if code in CANON:
        return CANON[code]
    name = props.get("NAME_LONG") or props.get("NAME") or ""
    return name


def main():
    if not SRC.is_file():
        sys.exit(f"missing {SRC}")
    data = json.loads(SRC.read_text(encoding="utf-8"))
    countries = []
    seen = set()
    for feature in data["features"]:
        props = feature.get("properties") or {}
        code = props.get("ADM0_A3") or ""
        if code in SKIP:
            continue
        name = canonical(props)
        if not name or name in seen:
            continue
        d, centre = feature_path(feature.get("geometry") or {})
        if not d or not centre:
            continue
        seen.add(name)
        countries.append({
            "id": code,
            "name": name,
            "d": d,
            "x": centre[0],
            "y": centre[1],
        })
    for point in POINTS:
        if point["name"] in seen:
            continue
        x, y = project(point["lon"], point["lat"])
        countries.append({
            "id": point["id"],
            "name": point["name"],
            "d": "",
            "x": x,
            "y": y,
            "point": True,
        })
    countries.sort(key=lambda c: c["name"])
    doc = {
        "view": [int(W), int(H)],
        "note": "Country shapes: Natural Earth, public domain, simplified for this page.",
        "countries": countries,
    }
    text = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
    if "http://" in text.lower() or "https://" in text.lower():
        sys.exit("map JSON contains a web address")
    OUT.write_text(text, encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}: {len(countries)} countries, {len(text)} bytes")


if __name__ == "__main__":
    main()
