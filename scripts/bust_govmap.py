#!/usr/bin/env python3
"""Refresh ?v= cache busters (first 10 hex of md5) for govmap assets in govmap/**/index.html and architect/**/index.html."""
import hashlib, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
# Hub files sit at the repo root; the box snapshot keeps them under app/.
APP = ROOT / "app" if (ROOT / "app" / "index.html").is_file() else ROOT
ASSETS = ("govmap-budget-share.js", "govmap-parliament.css", "govmap-parliament.js", "govmap-glossary.js", "govmap-budget.css", "govmap-budget.js", "govmap-chart.css", "govmap-chart.js", "govmap-terms.js", "govmap.css", "govmap.js", "styles.css", "architect.css", "architect.js", "architect-templates.css", "architect-templates.js", "architect-patterns.css", "architect-beginners.css", "architect-beginners.js")
h = {a: hashlib.md5((APP / a).read_bytes()).hexdigest()[:10] for a in ASSETS}
for f in [*APP.glob("govmap/**/index.html"), *APP.glob("architect/**/index.html")]:
    s = f.read_text(encoding="utf-8")
    for a in ASSETS:
        s = re.sub(re.escape("/" + a) + r"(?:\?v=\w+)?", "/" + a + "?v=" + h[a], s)
    f.write_text(s, encoding="utf-8")
    print(f.relative_to(APP), "ok")
