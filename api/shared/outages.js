// "What's down in the UK": service status from StatusPages (https://status-pages.com/api).
//
// StatusPages is a free, no-key, CORS-enabled JSON API that combines providers' own
// status pages with (unverified) user problem reports. Its data refreshes every 5 minutes
// and it asks callers to cache, so this proxy fetches each category once per 5 minutes
// per instance (the adapter caches by s-maxage). Only plain-text fields are passed on;
// upstream HTML is never passed through, and links are http(s) only.

const safeUrl = require("./_url");
const { fetchOutageNews } = require("./outagenews");
const { fetchGovStatus, extrasFromStatusPages, mergeServices } = require("./govstatus");

const BASE = "https://status-pages.com";
const UA = "www.govassured.com-dashboard/1.0";

// Boards with UK coverage, in display order.
const CATEGORIES = [
  { id: "mobile", label: "Mobile networks" },
  { id: "broadband", label: "Broadband" },
  { id: "banks", label: "Banks and payments" },
  { id: "government", label: "Government services" },
  { id: "email", label: "Email and office" },
  { id: "websites", label: "Websites and hosting" },
  // Fetched only for the ticker (WhatsApp, Facebook, Instagram); not listed as a category.
  { id: "social", label: "Social and messaging", tickerOnly: true },
];

// Widely used services shown in the live ticker, in display order (category/provider ids from StatusPages).
const TICKER = [
  ["email", "microsoft365"], ["email", "outlook"], ["email", "onedrive"], ["email", "gmail"],
  ["social", "whatsapp"], ["social", "facebook"], ["social", "instagram"],
  ["mobile", "ee"], ["mobile", "o2"], ["mobile", "vodafone-uk"], ["mobile", "three-uk"],
  ["broadband", "bt-broadband"], ["broadband", "virgin-media"], ["broadband", "sky-broadband"],
  ["banks", "lloyds"], ["banks", "barclays"], ["banks", "hsbc-uk"], ["banks", "natwest"],
  ["government", "govuk"], ["government", "nhs-app"],
];

const STATUS = {
  operational: "ok",
  degraded: "degraded",
  partial_outage: "partial_outage",
  major_outage: "major_outage",
  maintenance: "maintenance",
};
const PROBLEM = new Set(["degraded", "partial_outage", "major_outage"]);
const LEVELS = new Set(["none", "some", "elevated", "spike"]);

// Plain text only: drop anything tag-like, control characters and angle brackets, collapse whitespace.
function text(v, max) {
  if (typeof v !== "string") return "";
  let s = v.replace(/<[^>]*>?/g, " ").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim();
  if (s.length > max) s = s.slice(0, max - 1).trimEnd() + "…";
  return s;
}
function slug(v) {
  return typeof v === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(v) ? v : null;
}

function normaliseProvider(p, cat) {
  if (!p || typeof p !== "object") return null;
  const name = text(p.displayName, 60) || text(p.id, 60);
  if (!name) return null;
  const status = STATUS[p.indicator] || "unknown";
  const reportLevel = LEVELS.has(p.userReports) ? p.userReports : "none";
  const id = slug(p.id);
  const incidents = Array.isArray(p.activeIncidents) ? p.activeIncidents.length : 0;
  return {
    category: cat.id,
    id,
    name,
    status,
    summary: text(p.summary, 160),
    reportLevel,
    incidents,
    source: p.via === "crowd" ? "user reports" : p.via === "statuspage" || p.via === "feed" ? "status page" : "",
    problem: PROBLEM.has(status) || reportLevel === "elevated" || reportLevel === "spike",
    link: id ? safeUrl(`${BASE}/${cat.id}/${id}`) : safeUrl(`${BASE}/${cat.id}`),
    official: safeUrl(p.sourceUrl),
  };
}

// Official status unknown is usually "no data". A StatusPages probe that could not
// reach a government service is worth surfacing, even when user reports are quiet.
function isUnreachable(p) {
  return !!(p && p.status === "unknown" && /could not reach|couldn['’]t reach|unreachable|not responding|timed out/i.test(p.summary || ""));
}

function normaliseCategory(data, cat) {
  const providers = data && Array.isArray(data.providers) ? data.providers : null;
  if (!providers) return { id: cat.id, label: cat.label, available: false, link: `${BASE}/${cat.id}`, total: 0, ok: 0, unknown: 0, problems: [] };
  const all = providers.slice(0, 200).map((p) => normaliseProvider(p, cat)).filter(Boolean);
  const problems = all.filter((p) => p.problem || p.status === "maintenance" || isUnreachable(p));
  const rank = { major_outage: 0, partial_outage: 1, degraded: 2, unknown: 3, maintenance: 4 };
  problems.sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3) || (b.reportLevel === "spike") - (a.reportLevel === "spike"));
  return {
    id: cat.id,
    label: cat.label,
    available: true,
    link: `${BASE}/${cat.id}`,
    total: all.length,
    ok: all.filter((p) => p.status === "ok" && !p.problem).length,
    unknown: all.filter((p) => p.status === "unknown" && !p.problem && !isUnreachable(p)).length,
    okNames: all.filter((p) => p.status === "ok" && !p.problem).map((p) => p.name),
    problems: problems.map(({ problem, id, ...rest }) => rest),
  };
}

// One label per ticker item: outage > spike > degraded > maintenance > unclear > ok.
function tickerState(p) {
  if (p.status === "major_outage" || p.status === "partial_outage") return "outage";
  if (p.reportLevel === "spike" || p.reportLevel === "elevated") return "spike";
  if (p.status === "degraded") return "degraded";
  if (p.status === "maintenance") return "maintenance";
  if (p.status === "unknown") return "unclear";
  return "ok";
}
const STATE_RANK = { outage: 0, spike: 1, degraded: 2, maintenance: 3, unclear: 4, ok: 5 };

function buildTicker(results) {
  const items = [];
  TICKER.forEach(([catId, pid], order) => {
    const ci = CATEGORIES.findIndex((c) => c.id === catId);
    const data = results[ci];
    if (!data || !Array.isArray(data.providers)) return;
    const raw = data.providers.find((p) => p && p.id === pid);
    const p = raw && normaliseProvider(raw, CATEGORIES[ci]);
    if (!p) return;
    items.push({ name: p.name, category: catId, state: tickerState(p), status: p.status, reportLevel: p.reportLevel, link: p.link, order });
  });
  items.sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state] || a.order - b.order);
  return items.map(({ order, ...rest }) => rest);
}

function normalise(results, news, govServices) {
  const categories = CATEGORIES.map((cat, i) => (cat.tickerOnly ? null : normaliseCategory(results[i], cat))).filter(Boolean);
  const ticker = buildTicker(results);
  const available = categories.some((c) => c.available) || ticker.length > 0;
  return {
    updated: new Date().toISOString(),
    available,
    ...(available ? {} : { error: "Status unavailable" }),
    source: { name: "StatusPages", url: BASE, note: "User reports are unverified. Official GOV.UK status pages are listed separately." },
    ticker,
    news: Array.isArray(news) ? news : [],
    govServices: Array.isArray(govServices) ? govServices : [],
    categories,
  };
}

async function fetchJson(url, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    if (!/json/i.test(ct)) return null;
    const body = await r.text();
    if (body.length > 2_000_000) return null;
    return JSON.parse(body);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

const handler = async (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  try {
    // Status boards and outage headlines are fetched in parallel; a news failure just means no headlines.
    const [results, news, official] = await Promise.all([
      Promise.all(CATEGORIES.map((c) => fetchJson(`${BASE}/${c.id}/data.json`))),
      fetchOutageNews().catch(() => []),
      fetchGovStatus(fetchJson, null).catch(() => []),
    ]);
    const govBoard = results[CATEGORIES.findIndex((c) => c.id === "government")];
    const govServices = mergeServices(official, extrasFromStatusPages(govBoard));
    const out = normalise(results, news, govServices);
    if (!out.available) res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json(out);
  } catch (e) {
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json({ updated: new Date().toISOString(), available: false, error: "Status unavailable", ticker: [], news: [], govServices: [], categories: [] });
  }
};

module.exports = handler;
module.exports.normalise = normalise;
module.exports.normaliseProvider = normaliseProvider;
module.exports.CATEGORIES = CATEGORIES;
module.exports.TICKER = TICKER;
module.exports.tickerState = tickerState;
module.exports.fetchJson = fetchJson;
module.exports.isUnreachable = isUnreachable;
