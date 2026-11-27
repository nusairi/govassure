// Unit tests for the outage-headline filter. Run: node api/shared/_outagenews.test.js
const { isOutageTitle, filterOutageNews, FEEDS } = require("./outagenews.js");
const outages = require("./outages.js");

let failed = 0;
function ok(name, cond) {
  if (!cond) { failed++; console.error("FAIL", name); } else console.log("PASS", name);
}

const yes = [
  "What we know about the global Microsoft outage",
  "Microsoft Outlook is still down",
  "WhatsApp down for thousands of users",
  "Lego marketplace BrickLink in pieces after 'unusual activity' takes it offline for almost a week",
  "Some UK broadband ISP support services disrupted by Microsoft outage",
  "Lloyds app not working for some customers",
  "Bank IT failure leaves customers unable to pay",
  "Glitch hits NHS booking system",
  "Service restored after Virgin Media outage",
  "Thousands unable to log in to HMRC",
  "Barclays app crashes on payday",
  "Rail travel disruption after signalling fault",
  "Gmail back online after six-hour disruption",
  "Power cut leaves 20,000 homes without electricity",
  "EE network goes offline across London",
  "Microsoft says services fully restored after day-long global outage",
  "Department for Work and Pensions takes some services offline after 'cyber incident'",
  "Temporary disruption to some DWP online services",
];
const no = [
  "Police arrest 354 suspects in dark web cybercrime crackdown",
  "Blink-182 to make Download debut as 2027 festival headliners",
  "Factory breakdown costs firm millions",
  "A rundown of the best phones of 2026",
  "Retailer to shut down 40 stores",
  "Chief executive to step down next year",
  "FBI disrupts North Korean scam network",
  "Europol takedown of botnet disrupts ransomware gang",
  "Stock market crash fears grow",
  "Poundland unable to buy new stock as fears over collapse grow",
  "Prices down 3% in October",
  "Microsoft confirms Windows security updates installation issues",
  "Countdown to Black Friday deals",
  "Police take down phishing site",
  "CMF’s milk carton-shaped Bluetooth speaker is down to a new low price",
  "Pixel 10 is down to £499 in early Black Friday deal",
  "Shares are down 12% after profit warning",
  "AirPods are down from £179 today",
  "Chris Mason: Immigration stats are down but will that be the end of the issue?",
  "Unemployment figures are down this quarter",
  "",
];
yes.forEach((t) => ok("match: " + t, isOutageTitle(t)));
no.forEach((t) => ok("no match: " + (t || "(empty)"), !isOutageTitle(t)));
ok("non-string title", !isOutageTitle(null) && !isOutageTitle({}) && !isOutageTitle(42));

const now = Date.parse("2026-11-13T09:00:00Z");
const h = (n) => new Date(now - n * 3600 * 1000).toUTCString();
const items = [
  { title: "Global Microsoft outage affecting tens of thousands of users", link: "https://www.bbc.co.uk/news/articles/a1?at_medium=RSS", date: h(6), source: "BBC" },
  { title: "Global Microsoft outage affecting tens of thousands of users", link: "https://www.bbc.co.uk/news/articles/a1?at_campaign=rss", date: h(6), source: "BBC" }, // same article, other feed
  { title: "Global Microsoft outage affects tens of thousands of users", link: "https://example.com/copy", date: h(5), source: "Copy" }, // near-duplicate title
  { title: "Microsoft Outlook is still down", link: "https://www.theverge.com/x", date: h(1), source: "The Verge" },
  { title: "<script>alert(1)</script>WhatsApp down for thousands of users <img src=x onerror=alert(1)>", link: "https://news.example/w", date: h(2), source: "<b>Evil</b>" },
  { title: "Gmail is down again", link: "javascript:alert(1)", date: h(1), source: "X" },
  { title: "Teams outage", link: "data:text/html,<script>alert(1)</script>", date: h(1), source: "X" },
  { title: "Zoom outage", link: "//evil.example/z", date: h(1), source: "X" },
  { title: "Old Sky outage", link: "https://news.example/old", date: h(60), source: "Old" },
  { title: "Future outage", link: "https://news.example/future", date: new Date(now + 5 * 3600 * 1000).toUTCString(), source: "F" },
  { title: "Undated outage", link: "https://news.example/nodate", date: "", source: "U" },
  { title: "Retailer to shut down 40 stores", link: "https://news.example/shut", date: h(1), source: "S" },
  null,
  "junk",
  { link: "https://news.example/notitle", date: h(1) },
];
const out = filterOutageNews(items, now);
const titles = out.map((i) => i.title);
ok("filter: newest first", out[0].title === "Microsoft Outlook is still down" && out.every((i, k) => k === 0 || Date.parse(out[k - 1].date) >= Date.parse(i.date)));
ok("filter: same article and near-duplicate titles deduped (newest kept)", titles.filter((t) => t.startsWith("Global Microsoft outage")).length === 1 && out.some((i) => i.source === "Copy"));
ok("filter: same article across feeds (query differs) deduped", filterOutageNews([items[0], items[1]], now).length === 1);
ok("filter: hostile title/source stripped", out.every((i) => !/[<>]/.test(i.title) && !/[<>]/.test(i.source)) && titles.some((t) => t.includes("WhatsApp down")));
ok("filter: javascript:/data:/protocol-relative links dropped", !titles.some((t) => /Gmail|Teams|Zoom/.test(t)));
ok("filter: older than 48h dropped", !titles.includes("Old Sky outage"));
ok("filter: future and undated dropped", !titles.includes("Future outage") && !titles.includes("Undated outage"));
ok("filter: false positives dropped", !titles.some((t) => /shut down/.test(t)));
ok("filter: only http(s) urls", out.every((i) => /^https?:\/\//.test(i.url)));
ok("filter: exact count", out.length === 3);
const many = Array.from({ length: 20 }, (_, k) => ({ title: `Service ${k} alpha${k} outage`, link: `https://news.example/${k}`, date: h(k / 10), source: "N" }));
const ent = filterOutageNews([{ title: "Microsoft&#8217;s Outlook outage &#x2014; &#60;script&#62;alert(1)&#60;/script&#62; &#0;", link: "https://news.example/e", date: h(1), source: "S" }], now);
ok("filter: numeric entities decoded, no tags", ent.length === 1 && ent[0].title.startsWith("Microsoft’s Outlook outage —") && !/[<>&]/.test(ent[0].title));
ok("filter: capped at 8", filterOutageNews(many, now).length === 8);
ok("filter: no outage news -> empty (no filler)", filterOutageNews([{ title: "Nice weather today", link: "https://news.example/w", date: h(1) }], now).length === 0);
ok("filter: bad input", filterOutageNews(null, now).length === 0 && filterOutageNews("x", now).length === 0);
ok("feeds: http(s) only", FEEDS.length >= 3 && FEEDS.every((f) => /^https:\/\//.test(f.url)));

// Handler: news feeds fail while status works -> statuses still returned, news empty
(async () => {
  const realFetch = global.fetch;
  const good = { providers: [{ id: "outlook", displayName: "Outlook", indicator: "degraded" }] };
  global.fetch = async (url) => {
    if (String(url).startsWith("https://status-pages.com/")) return new Response(JSON.stringify(good), { status: 200, headers: { "content-type": "application/json" } });
    throw new Error("news down");
  };
  const res = { h: {}, setHeader(k, v) { this.h[k] = v; }, status(s) { this.s = s; return this; }, json(o) { this.o = o; } };
  await outages({}, res);
  ok("handler: news down, status still available", res.s === 200 && res.o.available === true && Array.isArray(res.o.news) && res.o.news.length === 0 && res.o.ticker.length > 0);
  // News works, status down -> news still returned, unavailable flagged
  const rss = `<rss><channel><item><title>Microsoft Outlook is still down</title><link>https://www.theverge.com/x</link><pubDate>${new Date().toUTCString()}</pubDate></item></channel></rss>`;
  global.fetch = async (url) => {
    if (String(url).startsWith("https://status-pages.com/")) return new Response("err", { status: 503 });
    return new Response(rss, { status: 200, headers: { "content-type": "application/rss+xml" } });
  };
  await outages({}, res);
  ok("handler: status down, news still returned", res.o.available === false && res.o.error === "Status unavailable" && res.o.news.length === 1 && res.o.news[0].url === "https://www.theverge.com/x");
  global.fetch = realFetch;
  if (failed) { console.error(failed + " failed"); process.exit(1); }
  console.log("ALL-TESTS-PASSED");
})();
