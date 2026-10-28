// Adapts the Vercel-style (req, res) handlers to Azure Functions (v3 programming model, no dependencies).
// Responses are cached in memory per instance for the handler's s-maxage, like the original server.js.
const cache = new Map();

module.exports = function adapt(name, handler) {
  return async function (context, req) {
    const hit = cache.get(name);
    if (hit && hit.exp > Date.now()) {
      context.res = { status: hit.status, headers: { ...hit.headers, "X-Cache": "HIT" }, body: hit.body };
      return;
    }
    const headers = {};
    let status = 200;
    let body = "";
    const res = {
      setHeader: (k, v) => { headers[k] = v; },
      status: (s) => { status = s; return res; },
      json: (obj) => {
        body = JSON.stringify(obj);
        headers["Content-Type"] = "application/json; charset=utf-8";
      },
    };
    try {
      await handler({ query: req.query || {}, headers: req.headers || {} }, res);
    } catch (e) {
      status = 500;
      body = JSON.stringify({ error: "Feed error", items: [] });
      headers["Content-Type"] = "application/json; charset=utf-8";
    }
    const m = /s-maxage=(\d+)/.exec(headers["Cache-Control"] || "");
    if (m && status === 200) cache.set(name, { exp: Date.now() + Number(m[1]) * 1000, status, headers: { ...headers }, body });
    context.res = { status, headers: { ...headers, "X-Cache": "MISS" }, body };
  };
};
