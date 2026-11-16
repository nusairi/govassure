#!/usr/bin/env python3
"""Cache-bust local CSS/JS: rewrite href/src="/x.css|js[?v=...]" in every HTML file
to "/x.css?v=<sha256[:10] of file content>". Idempotent; run before every deploy.
Usage: python3 scripts/version_assets.py [site_root]   (default: repo root)"""
import hashlib, pathlib, re, sys

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent)
REF = re.compile(r'((?:href|src)=")(/[^"?#]+\.(?:css|js))(?:\?v=[0-9a-f]*)?(")')
cache, missing, changed = {}, [], 0

def h(path):
    if path not in cache:
        f = root / path.lstrip("/")
        cache[path] = hashlib.sha256(f.read_bytes()).hexdigest()[:10] if f.is_file() else None
    return cache[path]

for html in sorted(root.rglob("*.html")):
    if any(p in ("api", "diag", "node_modules", ".git") for p in html.relative_to(root).parts):
        continue
    src = html.read_text(encoding="utf-8")
    def sub(m):
        v = h(m.group(2))
        if v is None:
            missing.append(f"{html.relative_to(root)}: {m.group(2)}"); return m.group(0)
        return f"{m.group(1)}{m.group(2)}?v={v}{m.group(3)}"
    out = REF.sub(sub, src)
    if out != src:
        html.write_text(out, encoding="utf-8"); changed += 1
for p, v in sorted(cache.items()):
    print(f"{p}?v={v}")
print(f"{changed} HTML file(s) updated")
if missing:
    print("MISSING:", *missing, sep="\n  "); sys.exit(1)
