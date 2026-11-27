// Official GOV.UK service status from the services' own Statuspage.io APIs.
// No API key. Each page degrades independently if briefly unavailable.
// Recent incidents (last 48 hours, including resolved) are kept so an overnight
// fault is still visible the next morning. We do not scrape Downdetector.

const safeUrl = require("./_url");

const PAGES = [
  { id: "publishing", name: "GOV.UK website", summary: "https://status.publishing.service.gov.uk/api/v2/summary.json", incidents: "https://status.publishing.service.gov.uk/api/v2/incidents.json", page: "https://status.publishing.service.gov.uk" },
  { id: "one-login", name: "GOV.UK One Login", summary: "https://status.account.gov.uk/api/v2/summary.json", incidents: "https://status.account.gov.uk/api/v2/incidents.json", page: "https://status.account.gov.uk" },
  { id: "pay", name: "GOV.UK Pay", summary: "https://payments.statuspage.io/api/v2/summary.json", incidents: "https://payments.statuspage.io/api/v2/incidents.json", page: "https://payments.statuspage.io" },
  { id: "notify", name: "GOV.UK Notify", summary: "https://status.notifications.service.gov.uk/api/v2/summary.json", incidents: "https://status.notifications.service.gov.uk/api/v2/incidents.json", page: "https://status.notifications.service.gov.uk" },
];

const RECENT_MS = 48 * 3600 * 1000;

const INDICATOR = {
  none: "ok",
  minor: "degraded",
  major: "partial_outage",
  critical: "major_outage",
  maintenance: "maintenance",
};

function text(v, max) {
  if (typeof v !== "string") return "";
  let s = v.replace(/<[^>]*>?/g, " ").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim();
  if (s.length > max) s = s.slice(0, max - 1).trimEnd() + "…";
  return s;
}

function iso(v) {
  const n = Date.parse(v);
  return isNaN(n) ? "" : new Date(n).toISOString();
}

function fromIndicator(v) {
  return INDICATOR[v] || (typeof v === "string" && v ? "unknown" : "unknown");
}

// Statuspage.io summary.json + incidents.json → one service row.
function fromOfficial(page, summary, incidents, now = Date.now()) {
  if (!page || !page.name || !page.page) return null;
  const url = safeUrl(page.page);
  if (!url) return null;
  const hasSummary = summary && typeof summary === "object";
  const hasIncidents = incidents && typeof incidents === "object";
  if (!hasSummary && !hasIncidents) return null;
  const statusObj = hasSummary ? summary.status : null;
  const status = fromIndicator(statusObj && statusObj.indicator);
  const description = text((statusObj && statusObj.description) || "", 160);
  const list = incidents && Array.isArray(incidents.incidents) ? incidents.incidents
    : Array.isArray(incidents) ? incidents : [];
  const recent = [];
  const seen = new Set();
  for (const inc of list) {
    if (!inc || typeof inc !== "object") continue;
    const started = Date.parse(inc.created_at || inc.started_at || "");
    const resolved = Date.parse(inc.resolved_at || "");
    const when = !isNaN(resolved) ? resolved : started;
    if (isNaN(when) || now - when > RECENT_MS || when > now + 3600 * 1000) continue;
    const name = text(inc.name, 140);
    const incUrl = safeUrl(inc.shortlink || inc.html_url) || url;
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    const updates = Array.isArray(inc.incident_updates) ? inc.incident_updates : [];
    const latest = updates[0] && text(updates[0].body, 180);
    recent.push({
      name,
      status: text(inc.status, 30) || "unknown",
      impact: text(inc.impact, 20) || "none",
      started: isNaN(started) ? "" : new Date(started).toISOString(),
      resolved: isNaN(resolved) ? "" : new Date(resolved).toISOString(),
      summary: latest,
      url: incUrl,
    });
    if (recent.length >= 3) break;
  }
  recent.sort((a, b) => Date.parse(b.started || 0) - Date.parse(a.started || 0));
  if (!statusObj && !recent.length) return null;
  return {
    id: page.id,
    name: page.name,
    status,
    description: description || (status === "ok" ? "All systems operational" : ""),
    url,
    source: "official status page",
    updated: iso((summary && summary.page && summary.page.updated_at) || "") || new Date(now).toISOString(),
    incidents: recent,
  };
}

// StatusPages government board rows that are not already covered by an official page.
const OFFICIAL_IDS = new Set(["govuk", "govuk-one-login", "govuk-notify"]);

function extrasFromStatusPages(govCategory, now = Date.now()) {
  const providers = govCategory && Array.isArray(govCategory.providers) ? govCategory.providers : [];
  const out = [];
  for (const p of providers) {
    if (!p || typeof p !== "object" || OFFICIAL_IDS.has(p.id)) continue;
    const name = text(p.displayName || p.id, 60);
    const official = safeUrl(p.sourceUrl);
    const link = official || (p.id ? safeUrl("https://status-pages.com/government/" + p.id) : null);
    if (!name || !link) continue;
    const statusMap = { operational: "ok", degraded: "degraded", partial_outage: "partial_outage", major_outage: "major_outage", maintenance: "maintenance" };
    const status = statusMap[p.indicator] || "unknown";
    out.push({
      id: text(p.id, 40) || name.toLowerCase().replace(/\s+/g, "-").slice(0, 40),
      name,
      status,
      description: text(p.summary, 160),
      url: link,
      source: p.via === "statuspage" || p.via === "feed" ? "status page" : "StatusPages",
      updated: new Date(now).toISOString(),
      incidents: [],
      reportLevel: p.userReports === "elevated" || p.userReports === "spike" ? p.userReports : "",
    });
  }
  return out;
}

function rankStatus(s) {
  return { major_outage: 0, partial_outage: 1, degraded: 2, unknown: 3, maintenance: 4, ok: 5 }[s] ?? 3;
}

function mergeServices(official, extras) {
  const list = [...(official || []), ...(extras || [])].filter(Boolean);
  list.sort((a, b) => rankStatus(a.status) - rankStatus(b.status) || (b.incidents && b.incidents.length) - (a.incidents && a.incidents.length) || 0);
  return list;
}

async function fetchGovStatus(fetchJson, govBoard, now = Date.now()) {
  const official = await Promise.all(PAGES.map(async (page) => {
    try {
      const [summary, incidents] = await Promise.all([
        fetchJson(page.summary).catch(() => null),
        fetchJson(page.incidents).catch(() => null),
      ]);
      return fromOfficial(page, summary, incidents, now);
    } catch {
      return null;
    }
  }));
  return mergeServices(official.filter(Boolean), extrasFromStatusPages(govBoard, now));
}

module.exports = {
  PAGES,
  RECENT_MS,
  fromOfficial,
  extrasFromStatusPages,
  mergeServices,
  fetchGovStatus,
};
