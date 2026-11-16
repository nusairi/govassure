// Government and Parliament publications about IT, cyber, digital, AI, data and technology.
//
// Sources (all official and free to reuse with attribution):
//  - GOV.UK Search API (policy papers, consultations, research and statistics) for selected departments.
//    Open Government Licence v3.0.
//  - UK Parliament: House of Commons Library, House of Lords Library and POST research feeds (RSS),
//    and the Committees API (reports, special reports, government responses). Open Parliament Licence v3.0.
// Items are filtered by phrases in the title, last 30 days, deduplicated, newest first, max 10.
// Plain text only; links must be https on www.gov.uk or *.parliament.uk.

const { fetchFeed } = require("./_rss");
const safeUrl = require("./_url");

const UA = "www.govassured.com-dashboard/1.0";
const MAX_AGE_MS = 30 * 24 * 3600 * 1000;
const MAX_ITEMS = 10;
const MAX_GOV = 7;

// GOV.UK organisations (slug -> pill label).
const ORGS = {
  "department-for-science-innovation-and-technology": "DSIT",
  "ministry-of-defence": "MOD",
  "cabinet-office": "Cabinet Office",
  "central-digital-and-data-office": "CDDO",
  "government-digital-service": "GDS",
  "home-office": "Home Office",
  "national-cyber-security-centre": "NCSC",
  "ai-security-institute": "AISI",
  "information-commissioner-s-office": "ICO",
  "ofcom": "Ofcom",
  "department-for-business-and-trade": "DBT",
  "government-communications-headquarters": "GCHQ",
};

const PARLIAMENT_FEEDS = [
  { url: "https://commonslibrary.parliament.uk/feed/", source: "Commons Library", kind: "Research briefing" },
  { url: "https://lordslibrary.parliament.uk/feed/", source: "Lords Library", kind: "Research briefing" },
  { url: "https://post.parliament.uk/feed/", source: "POST", kind: "Research briefing" },
];

// Committees API publication types: 1 Report, 2 Special Report, 12 Government Response.
const COMMITTEE_TYPES = [1, 2, 12];

// Names that contain "technology" but are not themselves about IT.
const STRIP = [
  /department\s+for\s+science,?\s+innovation\s+and\s+technology/gi,
  /science,?\s+innovation\s+and\s+technology(?:\s+committee)?/gi,
  /science\s+and\s+technology\s+committee/gi,
];

const POSITIVE = [
  /\bcyber\w*/i,
  /\bartificial\s+intelligence\b/i,
  /\bAI\b/,
  /\bmachine\s+learning\b/i,
  /\bdigital\w*\b/i,
  /\btechnolog(?:y|ies|ical)\b/i,
  /\btelecom\w*\b/i,
  /\bbroadband\b/i,
  /\b[56]G\b/,
  /\bsemiconductors?\b/i,
  /\bquantum\b/i,
  /\bonline\s+(?:safety|harms?|world|services?|platforms?|fraud|abuse)\b/i,
  /\bsocial\s+media\b/i,
  /\binternet\b/i,
  /\bsoftware\b/i,
  /\bcomput(?:er|ers|ing)\b/i,
  /\bIT\b/,
  /\bcloud\s+(?:computing|services?|security)\b/i,
  /\bencrypt\w*\b/i,
  /\bransomware\b/i,
  /\bhack(?:ing|ers?|ed)\b/i,
  /\bnetwork\s+and\s+information\s+systems\b/i,
  /\bdata\s+(?:protection|sharing|centres?|bill|strategy|intermediar\w*|privacy|breach\w*|security|use|economy|adequacy|access)\b/i,
  /\bdata\s+\(use\s+and\s+access\)/i,
  /\bfacial\s+recognition\b/i,
  /\bbiometric\w*\b/i,
  /\bdeepfakes?\b/i,
  /\bchatbots?\b/i,
  /\balgorithm\w*\b/i,
  /\bautomated\s+decision\w*\b/i,
  /\belectronic\s+communications\b/i,
  /\binvestigatory\s+powers\s+(?:act|bill|commissioner|tribunal)\b/i,
  /\bspyware\b/i,
  /\bGOV\.UK\b/,
];
// Strong terms that may also be matched in a description (where broad words like "data" are too noisy).
const STRONG = [/\bcyber\w*/i, /\bartificial\s+intelligence\b/i, /\bAI\b/, /\bfacial\s+recognition\b/i, /\bransomware\b/i, /\bnetwork\s+and\s+information\s+systems\b/i];
const NEGATIVE = [/\bpre-release\s+access\b/i];

function strip(s) {
  let t = s;
  for (const r of STRIP) t = t.replace(r, " ");
  return t;
}
function isTechTitle(title, extra) {
  if (typeof title !== "string" || !title.trim()) return false;
  if (NEGATIVE.some((r) => r.test(title))) return false;
  const t = strip(title);
  if (POSITIVE.some((r) => r.test(t))) return true;
  if (typeof extra === "string" && extra) {
    const e = strip(extra);
    return STRONG.some((r) => r.test(e));
  }
  return false;
}

function clean(s, max) {
  if (typeof s !== "string") return "";
  let t = s.replace(/&#(x[0-9a-f]{1,6}|[0-9]{1,7});/gi, (m, n) => {
    const cp = n[0].toLowerCase() === "x" ? parseInt(n.slice(1), 16) : parseInt(n, 10);
    return cp > 31 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff) ? String.fromCodePoint(cp) : " ";
  });
  t = t.replace(/<[^>]*>?/g, " ").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim();
  if (t.length > max) t = t.slice(0, max - 1).trimEnd() + "…";
  return t;
}

// https only, and only GOV.UK or UK Parliament hosts.
function allowedUrl(u) {
  const s = safeUrl(u);
  if (!s) return null;
  const p = new URL(s);
  if (p.protocol !== "https:" || p.username || p.password || p.port) return null;
  const h = p.hostname.toLowerCase();
  if (h === "www.gov.uk" || h === "parliament.uk" || h.endsWith(".parliament.uk")) return p.href;
  return null;
}

// ---- Normalisers (each returns { title, source, kind, date, url, extra } candidates) ----

function fromGovUk(json) {
  const rows = json && Array.isArray(json.results) ? json.results.slice(0, 300) : [];
  return rows.map((r) => {
    if (!r || typeof r !== "object") return null;
    const orgs = Array.isArray(r.organisations) ? r.organisations : [];
    let source = "";
    for (const o of orgs) if (o && ORGS[o.slug]) { source = ORGS[o.slug]; break; }
    if (!source) {
      const o = orgs.find((x) => x && (x.acronym || x.title));
      source = o ? clean(o.acronym || o.title, 24) : "GOV.UK";
    }
    const link = typeof r.link === "string" && r.link.startsWith("/") && !r.link.startsWith("//") ? "https://www.gov.uk" + r.link : r.link;
    const path = typeof r.link === "string" ? r.link : "";
    const kind = clean(r.display_type || "", 40) ||
      (/^\/government\/consultations\//.test(path) ? "Consultation" : /^\/government\/calls-for-evidence\//.test(path) ? "Call for evidence" : /^\/government\/statistics\//.test(path) ? "Statistics" : "Publication");
    return { title: r.title, source, kind, date: r.public_timestamp, url: link, extra: r.description };
  }).filter(Boolean);
}

function fromCommittees(json) {
  const rows = json && Array.isArray(json.items) ? json.items.slice(0, 300) : [];
  return rows.map((i) => {
    if (!i || typeof i !== "object") return null;
    const committee = i.committee && typeof i.committee.name === "string" ? i.committee.name : "";
    const business = Array.isArray(i.businesses) && i.businesses[0] && typeof i.businesses[0].title === "string" ? i.businesses[0].title : "";
    let url = null;
    if (typeof i.additionalContentUrl === "string" && /^https:\/\/publications\.parliament\.uk\//i.test(i.additionalContentUrl)) url = i.additionalContentUrl;
    const pid = Number.isInteger(i.id) ? i.id : null;
    const doc = Array.isArray(i.documents) && i.documents[0] && Number.isInteger(i.documents[0].documentId) ? i.documents[0].documentId : null;
    if (!url && pid && doc) url = `https://committees.parliament.uk/publications/${pid}/documents/${doc}/default/`;
    const cid = i.committee && Number.isInteger(i.committee.id) ? i.committee.id : null;
    if (!url && cid) url = `https://committees.parliament.uk/committee/${cid}/`;
    const typeName = i.type && typeof i.type.name === "string" ? i.type.name : "Publication";
    // Letters are titled "Letter from <minister> to <chair> ..."; the inquiry or bill title says more.
    let title = typeof i.description === "string" ? i.description : "";
    if (business && /^\s*(?:letter|correspondence)\b/i.test(title)) title = business + ": ministerial letter";
    return {
      title,
      source: "Committee",
      kind: clean(typeName, 30) + (committee ? " · " + clean(committee, 70) : ""),
      date: i.publicationStartDate ? String(i.publicationStartDate).replace(/^(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d)$/, "$1Z") : "",
      url,
      extra: business,
      titleExtra: business,
    };
  }).filter(Boolean);
}

function fromFeed(items, feed) {
  return (Array.isArray(items) ? items : []).map((i) => i && ({ title: i.title, source: feed.source, kind: feed.kind, date: i.date, url: i.link, extra: i.summary })).filter(Boolean);
}

const STOP = new Set("a an the of to in on for and or with by as at from is are be its it this that what how why report 1st 2nd 3rd 4th 5th 6th 7th 8th 9th 10th special government response".split(" "));
function tokens(title) {
  return new Set(title.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)));
}
function similar(a, b) {
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union > 0 && inter / union >= 0.8;
}

// candidates -> [{ title, source, kind, date, url }]
function filterPublications(candidates, now = Date.now()) {
  const list = (Array.isArray(candidates) ? candidates : [])
    .filter((c) => c && typeof c === "object")
    .map((c) => {
      const title = clean(c.title, 160);
      // Committee report titles are often "5th Report - <topic>"; the inquiry title also counts as a title.
      const match = isTechTitle(title, clean(c.extra, 400)) || (c.titleExtra ? isTechTitle(clean(c.titleExtra, 200)) : false);
      return { title, source: clean(c.source, 24) || "GOV.UK", kind: clean(c.kind, 110), url: allowedUrl(c.url), ts: Date.parse(c.date), match };
    })
    .filter((c) => c.title && c.url && c.match && !isNaN(c.ts) && c.ts <= now + 24 * 3600 * 1000 && now - c.ts <= MAX_AGE_MS)
    .sort((a, b) => b.ts - a.ts);
  const out = [];
  const seenUrl = new Set();
  const seenTok = [];
  for (const c of list) {
    const key = c.url.replace(/[?#].*$/, "").replace(/\/$/, "");
    if (seenUrl.has(key)) continue;
    const tk = tokens(c.title);
    if (seenTok.some((t) => similar(t, tk))) continue;
    seenUrl.add(key);
    seenTok.push(tk);
    out.push({ title: c.title, source: c.source, kind: c.kind, date: new Date(c.ts).toISOString(), url: c.url, house: /parliament\.uk$/.test(new URL(c.url).hostname) ? "parliament" : "gov" });
  }
  // Keep a mix: up to MAX_GOV GOV.UK items, the rest Parliament, then fill any spare slots; newest first.
  const gov = out.filter((i) => i.house === "gov");
  const parl = out.filter((i) => i.house === "parliament");
  const pick = gov.slice(0, MAX_GOV).concat(parl.slice(0, MAX_ITEMS - Math.min(gov.length, MAX_GOV)));
  if (pick.length < MAX_ITEMS) pick.push(...gov.slice(MAX_GOV, MAX_GOV + MAX_ITEMS - pick.length));
  return pick.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, MAX_ITEMS).map(({ house, ...rest }) => rest);
}

async function fetchJson(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!r.ok || !/json/i.test(r.headers.get("content-type") || "")) return null;
    const body = await r.text();
    if (body.length > 3_000_000) return null;
    return JSON.parse(body);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function govUkUrl(now) {
  const from = new Date(now - MAX_AGE_MS).toISOString().slice(0, 10);
  const q = new URLSearchParams();
  Object.keys(ORGS).forEach((o) => q.append("filter_organisations[]", o));
  q.append("filter_content_purpose_supergroup[]", "policy_and_engagement");
  q.append("filter_content_purpose_supergroup[]", "research_and_statistics");
  q.append("filter_public_timestamp", "from:" + from);
  q.append("order", "-public_timestamp");
  q.append("count", "200");
  ["title", "link", "public_timestamp", "organisations", "display_type", "description"].forEach((f) => q.append("fields[]", f));
  return "https://www.gov.uk/api/search.json?" + q.toString();
}
function committeesUrl(now) {
  const from = new Date(now - MAX_AGE_MS).toISOString().slice(0, 10);
  const q = new URLSearchParams({ StartDate: from, Take: "200" });
  COMMITTEE_TYPES.forEach((t) => q.append("PublicationTypeIds", String(t)));
  return "https://committees-api.parliament.uk/api/Publications?" + q.toString();
}

const LICENCES = [
  { name: "Open Government Licence v3.0", url: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" },
  { name: "Open Parliament Licence v3.0", url: "https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/" },
];

const handler = async (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
  const now = Date.now();
  try {
    const [gov, com, ...feeds] = await Promise.all([
      fetchJson(govUkUrl(now)),
      fetchJson(committeesUrl(now)),
      ...PARLIAMENT_FEEDS.map((f) => fetchFeed(f.url, f.source).catch(() => [])),
    ]);
    const candidates = [
      ...fromGovUk(gov),
      ...fromCommittees(com),
      ...feeds.flatMap((items, k) => fromFeed(items, PARLIAMENT_FEEDS[k])),
    ];
    const items = filterPublications(candidates, now);
    const anySource = !!gov || !!com || feeds.some((f) => f && f.length);
    if (!anySource) {
      res.setHeader("Cache-Control", "s-maxage=60");
      return res.status(200).json({ updated: new Date().toISOString(), available: false, error: "Publications unavailable", items: [], licences: LICENCES });
    }
    res.status(200).json({ updated: new Date().toISOString(), available: true, items, licences: LICENCES });
  } catch (e) {
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json({ updated: new Date().toISOString(), available: false, error: "Publications unavailable", items: [], licences: LICENCES });
  }
};

module.exports = handler;
Object.assign(module.exports, { isTechTitle, filterPublications, fromGovUk, fromCommittees, fromFeed, allowedUrl, ORGS, LICENCES });
