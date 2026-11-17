import http.server, json, os, sys
root = sys.argv[1]; cfg = json.load(open(os.path.join(root, "staticwebapp.config.json")))
rew = {r["route"]: r["rewrite"] for r in cfg["routes"] if "rewrite" in r}
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=root, **k)
    def end_headers(s):
        for k, v in cfg["globalHeaders"].items(): s.send_header(k, v)
        super().end_headers()
    def translate_path(s, p):
        q = p.split("?")[0]
        return super().translate_path(rew.get(q, q))
    def log_message(s, *a): pass
http.server.ThreadingHTTPServer(("127.0.0.1", 18431), H).serve_forever()
