// UK cyber-threat news from security-press, official and UK news RSS/Atom feeds.
//
// Replaces the earlier GDELT-backed version: GDELT's free API rate-limits to ~1 request
// / 5s per IP and Vercel runs functions on shared IPs, so it returned HTTP 429 almost
// every time. These RSS feeds don't rate-limit, are reachable server-side, and give
// cleaner UK-relevant signal. Each source degrades independently if briefly unavailable.
//
// Specialist security press and NCSC items are already on-topic, so they are included as
// published. BBC, The Guardian and GOV.UK are general feeds, so only cyber-relevant
// items are kept (plus official GOV.UK notices of a department service incident).

const { fetchFeed } = require("./_rss");
const safeUrl = require("./_url");

const PRESS = [
  { url: "https://www.infosecurity-magazine.com/rss/news/", source: "Infosecurity Magazine" },
  { url: "https://www.theregister.com/security/headlines.atom", source: "The Register" },
  { url: "https://www.bleepingcomputer.com/feed/", source: "BleepingComputer" },
  { url: "https://feeds.feedburner.com/TheHackersNews", source: "The Hacker News" },
  { url: "https://grahamcluley.com/feed/", source: "Graham Cluley" },
];

const OFFICIAL = [
  { url: "https://www.ncsc.gov.uk/api/1/services/v1/news-rss-feed.xml", source: "NCSC" },
];

// General UK / government feeds. Items are included only when isCyberNews matches.
const GENERAL = [
  { url: "https://feeds.bbci.co.uk/news/politics/rss.xml", source: "BBC" },
  { url: "https://feeds.bbci.co.uk/news/uk/rss.xml", source: "BBC" },
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", source: "BBC" },
  { url: "https://www.theguardian.com/uk-news/rss", source: "The Guardian" },
  { url: "https://www.theguardian.com/uk/technology/rss", source: "The Guardian" },
  { url: "https://www.gov.uk/search/news-and-communications.atom", source: "GOV.UK" },
];

const MAX_ITEMS = 12;

// Tracking params that news RSS links often append; stripped so the same story dedupes
// and the public URL stays clean.
const TRACKING = /^(at_|utm_|fbclid|gclid|mc_eid|ito|ocid|ns_|CMP|cmp$)/i;

const CYBER = [
  /\bcyber[\s-]?security\b/i,
  /\bcyber[\s-]?attacks?\b/i,
  /\bcyber[\s-]?incidents?\b/i,
  /\bcyber[\s-]?threats?\b/i,
  /\bcyber[\s-]?crime\b/i,
  /\bransomware\b/i,
  /\bmalware\b/i,
  /\bphishing\b/i,
  /\bhackers?\b/i,
  /\bhacked\b/i,
  /\bhacking\b/i,
  /\bdata\s+breach(?:es)?\b/i,
  /\bsecurity\s+breach(?:es)?\b/i,
  /\bdata\s+(?:leak|leaked|stolen|exfiltrated|accessed)\b/i,
  /\b(?:stolen|leaked)\s+(?:data|records|information)\b/i,
  /\bzero[\s-]?days?\b/i,
  /\bvulnerabilit(?:y|ies)\b/i,
  /\bNCSC\b/,
  /\bGCHQ\b/,
  /\bAction\s+Fraud\b/i,
  /\bDDoS\b/i,
  /\bdistributed\s+denial[\s-]+of[\s-]+service\b/i,
];

const ORG = [
  /\bDWP\b/,
  /\bDepartment for Work and Pensions\b/i,
  /\bHMRC\b/,
  /\bNHS\b/,
  /\bHome Office\b/i,
  /\bCabinet Office\b/i,
  /\bMinistry of Defence\b/i,
  /\bMoD\b/,
  /\bDVLA\b/,
  /\bHMPPS\b/,
  /\bMinistry of Justice\b/i,
  /\bDHSC\b/,
  /\bDepartment of Health\b/i,
  /\bFCDO\b/,
  /\bDSIT\b/,
  /\bNational Crime Agency\b/i,
  /\bNCA\b/,
  /\bInformation Commissioner's Office\b/i,
  /\bInformation Commissioner\b/i,
];

const SERVICE_INCIDENT = [
  /\boffline\b/i,
  /\bdisrupt(?:ion|ed|ions)\b/i,
  /\bunavailable\b/i,
  /\boutages?\b/i,
  /\bincidents?\b/i,
  /\bbreach(?:es)?\b/i,
  /\bcompromise[ds]?\b/i,
];

function ts(d) {
  const n = Date.parse(d);
  return isNaN(n) ? 0 : n;
}

function haystack(item) {
  return [item && item.title, item && item.summary].filter(Boolean).join(" ");
}

// General UK/government headlines: keep cyber stories. For official GOV.UK notices,
// also keep a named department when its online services are disrupted, even if the
// short title does not use the word "cyber".
function isCyberNews(item, opts) {
  const text = haystack(item);
  if (!text.trim()) return false;
  if (CYBER.some((r) => r.test(text))) return true;
  if (opts && opts.allowOrgIncidents && ORG.some((r) => r.test(text)) && SERVICE_INCIDENT.some((r) => r.test(text))) {
    return true;
  }
  return false;
}

function canonicalUrl(u) {
  const href = safeUrl(u);
  if (!href) return null;
  try {
    const p = new URL(href);
    for (const k of [...p.searchParams.keys()]) {
      if (TRACKING.test(k)) p.searchParams.delete(k);
    }
    p.hash = "";
    let out = p.href;
    if (out.endsWith("?")) out = out.slice(0, -1);
    return out;
  } catch {
    return href;
  }
}

// items: already tagged with source and optionally filtered. Returns the payload list.
function collectNews(items, limit = MAX_ITEMS) {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .filter((i) => i && i.title && i.link)
    .map((i) => ({ title: i.title, url: canonicalUrl(i.link), date: i.date || "", source: i.source || "News" }))
    .filter((i) => {
      if (!i.url) return false;
      const key = i.url.replace(/\/$/, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => ts(b.date) - ts(a.date))
    .slice(0, limit);
}

async function fetchNews() {
  const press = PRESS.map((s) => fetchFeed(s.url, s.source).catch(() => []));
  const official = OFFICIAL.map((s) => fetchFeed(s.url, s.source).catch(() => []));
  const general = GENERAL.map((s) => fetchFeed(s.url, s.source).catch(() => []));
  const [pressRows, officialRows, generalRows] = await Promise.all([
    Promise.all(press),
    Promise.all(official),
    Promise.all(general),
  ]);
  const items = [
    ...pressRows.flat(),
    ...officialRows.flat(),
    ...generalRows.flat().filter((i) => isCyberNews(i, { allowOrgIncidents: i.source === "GOV.UK" })),
  ];
  return collectNews(items);
}

module.exports = async (req, res) => {
  // 2 minutes: near-live for breaking UK incidents, still cheap on the existing SWA function.
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
  try {
    const items = await fetchNews();
    if (!items.length) res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json({ updated: new Date().toISOString(), items });
  } catch (e) {
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json({ error: "News feed temporarily unavailable", items: [] });
  }
};

Object.assign(module.exports, {
  PRESS,
  OFFICIAL,
  GENERAL,
  MAX_ITEMS,
  isCyberNews,
  canonicalUrl,
  collectNews,
  fetchNews,
});
