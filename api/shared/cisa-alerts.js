// CISA cybersecurity alerts and advisories — official all.xml feed.
// Complements /api/kev: this shows CISA alerts, including ones not yet on the KEV list.
// Feed is listed on https://www.cisa.gov/about/contact-us/subscribe-updates-cisa
// as "Cybersecurity Alerts & Advisories". robots.txt does not disallow it.
const { parseFeed } = require("./_rss");
const safeUrl = require("./_url");

const FEED_URL = "https://www.cisa.gov/cybersecurity-advisories/all.xml";
const KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const UA = "www.govassured.com-dashboard/1.0";
const CVE_RE = /CVE-\d{4}-\d{4,}/gi;
const LIMIT = 8;
const TYPE_RANK = { Alert: 0, Analysis: 1, Advisory: 2, Medical: 3, ICS: 4 };

function itemType(url) {
  const u = String(url || "").toLowerCase();
  if (u.includes("/news-events/alerts/")) return "Alert";
  if (u.includes("/news-events/ics-medical-advisories/") || u.includes("/ics-medical-advisories/")) return "Medical";
  if (u.includes("/news-events/ics-advisories/") || u.includes("/ics-advisories/")) return "ICS";
  if (u.includes("/news-events/analysis-reports/")) return "Analysis";
  return "Advisory";
}

function ts(d) {
  const n = Date.parse(d);
  return isNaN(n) ? 0 : n;
}

function toIso(d) {
  const n = Date.parse(d);
  return isNaN(n) ? "" : new Date(n).toISOString();
}

function extractCves(text) {
  const seen = new Set();
  const out = [];
  const hits = String(text || "").match(CVE_RE) || [];
  for (const id of hits) {
    const cve = id.toUpperCase();
    if (!seen.has(cve)) {
      seen.add(cve);
      out.push(cve);
    }
  }
  return out;
}

function cvesFromXml(xml) {
  const map = new Map();
  const blocks = String(xml || "").match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const one = parseFeed("<rss>" + block + "</rss>")[0];
    if (one && one.link) map.set(one.link, extractCves(block));
  }
  return map;
}

function itemsFromXml(xml, kevIds) {
  const kev = kevIds instanceof Set ? kevIds : new Set(kevIds || []);
  const fromRaw = cvesFromXml(xml);
  const seen = new Set();
  const items = parseFeed(xml || "")
    .filter((i) => i.title && i.link)
    .map((i) => {
      const url = safeUrl(i.link);
      const ids = [];
      const seenCve = new Set();
      for (const id of extractCves(i.title).concat(extractCves(i.link), fromRaw.get(i.link) || [])) {
        if (!seenCve.has(id)) {
          seenCve.add(id);
          ids.push(id);
        }
      }
      return {
        title: i.title,
        url,
        date: toIso(i.date) || "",
        type: itemType(url || i.link),
        cves: ids.map((id) => ({ id, inKev: kev.has(id) })),
      };
    })
    .filter((i) => i.url)
    .sort((a, b) => {
      const dt = ts(b.date) - ts(a.date);
      if (dt) return dt;
      return (TYPE_RANK[a.type] ?? 9) - (TYPE_RANK[b.type] ?? 9);
    })
    .filter((i) => !seen.has(i.url) && seen.add(i.url))
    .slice(0, LIMIT);
  return items;
}

async function fetchText(url, accept, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA, Accept: accept } });
    if (!r.ok) return null;
    return r;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function loadKevIds() {
  const r = await fetchText(KEV_URL, "application/json", 9000);
  if (!r) return new Set();
  try {
    const data = await r.json();
    return new Set(
      (data.vulnerabilities || [])
        .map((v) => String(v.cveID || "").toUpperCase())
        .filter((id) => /^CVE-\d{4}-\d{4,}$/.test(id))
    );
  } catch {
    return new Set();
  }
}

async function loadFeedXml() {
  const r = await fetchText(FEED_URL, "application/rss+xml, application/xml, text/xml", 9000);
  if (!r) return "";
  try {
    return await r.text();
  } catch {
    return "";
  }
}

async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  try {
    const [xml, kevIds] = await Promise.all([loadFeedXml(), loadKevIds()]);
    const items = itemsFromXml(xml, kevIds);
    if (!items.length) res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json({ updated: new Date().toISOString(), source: FEED_URL, items });
  } catch (e) {
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json({ error: "CISA alerts temporarily unavailable", items: [] });
  }
}

handler.itemsFromXml = itemsFromXml;
handler.itemType = itemType;
handler.extractCves = extractCves;
module.exports = handler;
