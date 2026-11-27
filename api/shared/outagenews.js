// Outage headlines for the "What's down in the UK" ticker.
// Public RSS/Atom feeds fetched server-side with the shared parser (_rss.js), then filtered
// to outage stories by a keyword match on the title, last 48 hours, deduplicated, newest first.

const { fetchFeed } = require("./_rss");
const safeUrl = require("./_url");

const FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", source: "BBC" },
  { url: "https://feeds.bbci.co.uk/news/uk/rss.xml", source: "BBC" },
  { url: "https://feeds.bbci.co.uk/news/politics/rss.xml", source: "BBC" },
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC" },
  { url: "https://www.gov.uk/search/news-and-communications.atom", source: "GOV.UK" },
  { url: "https://www.ncsc.gov.uk/api/1/services/v1/news-rss-feed.xml", source: "NCSC" },
  { url: "https://www.ispreview.co.uk/index.php/feed", source: "ISPreview" },
  { url: "https://www.theregister.com/headlines.atom", source: "The Register" },
  { url: "https://www.bleepingcomputer.com/feed/", source: "BleepingComputer" },
  { url: "https://www.theverge.com/rss/index.xml", source: "The Verge" },
];

const MAX_AGE_MS = 48 * 3600 * 1000;
const MAX_ITEMS = 8;

// Title must match one of these. "down" only counts in explicit phrases, so crackdown, breakdown,
// download, rundown, shut down, step down, take down, price down etc. never match.
const POSITIVE = [
  /\boutages?\b/i,
  /\b(?:is|are|was|were|went|goes|go|going|gone|been|still|remains?|remained)\s+(?:completely\s+|partly\s+)?down\b/i,
  /\bdown\s+(?:again|for\s+(?:users|customers|thousands|millions|hours|some|many|everyone))\b/i,
  /\b(?:goes|went|gone|knocked|taken|is|are|was|were|still|remains?)\s+offline\b/i,
  /\boffline\s+(?:for|after|since)\b/i,
  /\bdisruption?s?\b/i,
  /\bdisrupted\b/i,
  /\bnot\s+working\b/i,
  /\bservice\s+(?:issues?|problems?|failures?|interruptions?)\b/i,
  /\bIT\s+(?:failures?|meltdown|outage|glitch(?:es)?|issues?|problems?|fault)\b/,
  /\b(?:systems?|technical|tech|computer|network)\s+(?:failures?|glitch(?:es)?|faults?|problems?|issues?|meltdown)\b/i,
  /\bglitch(?:es)?\b/i,
  /\b(?:services?|access|connectivity|service\s+has\s+been)\s+(?:is\s+|has\s+been\s+|now\s+)?restored\b/i,
  /\bback\s+(?:online|up\s+and\s+running)\b/i,
  /\b(?:app|apps|site|website|websites|system|systems|server|servers|service|services|network|platform)\s+crash(?:es|ed)?\b/i,
  /\bcrash(?:es|ed)?\s+(?:for|across)\s+(?:users|customers|thousands|millions)\b/i,
  /\b(?:users?|customers?|people|millions|thousands)\s+(?:are\s+|were\s+|left\s+)?(?:unable|cannot|can't|can’t)\b/i,
  /\bunable\s+to\s+(?:log\s*in|sign\s*in|access|connect|pay|make\s+payments|send|use|call|get\s+online)\b/i,
  /\b(?:power\s+cut|blackout)s?\b/i,
];

// Reject obvious non-outage senses even if a positive phrase matched.
const NEGATIVE = [
  /\b(?:police|fbi|nca|europol|interpol|doj|authorities|law\s+enforcement)\b.*\bdisrupt/i,
  /\bdisrupt\w*\b.*\b(?:scam|botnet|gang|crime|cybercrime|ransomware\s+gang|operation|network\s+of)\b/i,
  /\b(?:market|stock|stocks|shares|price|prices|crypto|bitcoin|plane|car|helicopter|train)\s+crash/i,
  /\bdisruptive\s+(?:technology|innovation|startup)\b/i,
  /\b(?:shuts?|shutting|closing|closes)\s+down\b(?!.*\boutage\b)/i,
  // Prices and figures: "is down to a new low price", "is down 20%", "shares are down by", "down from £99".
  /\bdown\s+to\s+(?:a\s+|an\s+|its\s+|the\s+|just\s+|only\s+)?(?:new\s+|all-time\s+|record\s+)?(?:low|lowest|record|cheapest|best|£|\$|€|\d)/i,
  /\bdown\s+(?:by\s+)?(?:£|\$|€)?\d/i,
  /\bdown\s+from\s+(?:£|\$|€|\d)/i,
  /\b(?:price|prices|deal|deals|discount|sale|cheapest|lowest)\b(?!.*\boutage\b)/i,
  // Figures and commentary: "immigration stats are down", "unemployment figures are down".
  // Do not use a bare "numbers ... down" rule: that would drop genuine outage headlines
  // such as "Emergency numbers are down after nationwide network outage".
  /\b(?:stats?|statistics|figures?|polls?|polling|immigration|unemployment|inflation|migration)\b.*\bdown\b(?!.*\b(?:outages?|offline|disruption)\b)/i,
  /\bdown\b.*\b(?:stats?|statistics|figures?|polls?|polling)\b(?!.*\b(?:outages?|offline|disruption)\b)/i,
];

function clean(s, max) {
  if (typeof s !== "string") return "";
  // Numeric entities (e.g. &#8217;) that the shared decoder leaves alone; decoded once, then any < > removed below.
  let t = s.replace(/&#(x[0-9a-f]{1,6}|[0-9]{1,7});/gi, (m, n) => {
    const cp = n[0].toLowerCase() === "x" ? parseInt(n.slice(1), 16) : parseInt(n, 10);
    return cp > 31 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff) ? String.fromCodePoint(cp) : " ";
  });
  t = t.replace(/<[^>]*>?/g, " ").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim();
  if (t.length > max) t = t.slice(0, max - 1).trimEnd() + "…";
  return t;
}

function isOutageTitle(title) {
  if (typeof title !== "string" || !title.trim()) return false;
  if (!POSITIVE.some((r) => r.test(title))) return false;
  return !NEGATIVE.some((r) => r.test(title));
}

const STOP = new Set("a an the of to in on for and or with by as at from is are was were be has have after over its it this that what we know about new latest live how why".split(" "));
function tokens(title) {
  return new Set(title.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)));
}
function similar(a, b) {
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union > 0 && inter / union >= 0.6;
}

// items: [{ title, link, date, source }] from fetchFeed. Returns [{ title, source, url, date }].
function filterOutageNews(items, now = Date.now()) {
  const out = [];
  const seenUrls = new Set();
  const seenTok = [];
  const list = (Array.isArray(items) ? items : [])
    .filter((i) => i && typeof i === "object")
    .map((i) => ({ title: clean(i.title, 140), source: clean(i.source, 30), url: safeUrl(i.link), ts: Date.parse(i.date) }))
    .filter((i) => i.title && i.url && !isNaN(i.ts) && i.ts <= now + 3600 * 1000 && now - i.ts <= MAX_AGE_MS && isOutageTitle(i.title))
    .sort((a, b) => b.ts - a.ts);
  for (const i of list) {
    const key = i.url.replace(/[?#].*$/, "").replace(/\/$/, "");
    if (seenUrls.has(key)) continue;
    const tk = tokens(i.title);
    if (seenTok.some((t) => similar(t, tk))) continue;
    seenUrls.add(key);
    seenTok.push(tk);
    out.push({ title: i.title, source: i.source || "News", url: i.url, date: new Date(i.ts).toISOString() });
    if (out.length >= MAX_ITEMS) break;
  }
  return out;
}

async function fetchOutageNews() {
  try {
    const results = await Promise.all(FEEDS.map((f) => fetchFeed(f.url, f.source).catch(() => [])));
    return filterOutageNews(results.flat());
  } catch {
    return [];
  }
}

module.exports = { FEEDS, isOutageTitle, filterOutageNews, fetchOutageNews };
