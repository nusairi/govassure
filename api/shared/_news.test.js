// Unit tests for the UK cyber-threat news filter and collector. Run: node api/shared/_news.test.js
const { isCyberNews, canonicalUrl, collectNews, PRESS, OFFICIAL, GENERAL, MAX_ITEMS } = require("./news.js");

let failed = 0;
function ok(name, cond) {
  if (!cond) { failed++; console.error("FAIL", name); } else console.log("PASS", name);
}

ok("press sources still include The Register and BleepingComputer",
  PRESS.some((s) => s.source === "The Register") && PRESS.some((s) => s.source === "BleepingComputer") && PRESS.length === 5);
ok("official sources include the NCSC news RSS",
  OFFICIAL.some((s) => s.source === "NCSC" && /news-rss-feed\.xml$/.test(s.url)));
ok("general sources include BBC politics, BBC UK, GOV.UK and The Guardian",
  GENERAL.some((s) => s.source === "BBC" && /politics/.test(s.url)) &&
  GENERAL.some((s) => s.source === "BBC" && /\/uk\/rss/.test(s.url)) &&
  GENERAL.some((s) => s.source === "GOV.UK" && /gov\.uk/.test(s.url)) &&
  GENERAL.some((s) => s.source === "The Guardian"));
ok("panel still caps at 12 items", MAX_ITEMS === 12);

const yes = [
  { title: "Department for Work and Pensions takes some services offline after 'cyber incident'" },
  { title: "UK pensions department hit by a cyber incident" },
  { title: "NCSC warns of ransomware attacks on UK organisations" },
  { title: "Hackers steal customer records in travel firm data breach" },
  { title: "GCHQ and NCSC issue advice after a phishing campaign" },
  { title: "Switzerland confirms AI-assisted cyberattacks breached operators" },
];
for (const i of yes) {
  ok("cyber: " + i.title, isCyberNews(i));
}

ok("GOV.UK official DWP disruption is kept when org incidents are allowed",
  isCyberNews(
    { title: "Temporary disruption to some DWP online services", summary: "Some DWP online services may be temporarily unavailable." },
    { allowOrgIncidents: true }
  ));
ok("same GOV.UK title is not kept on a general feed without the word cyber",
  !isCyberNews({ title: "Temporary disruption to some DWP online services", summary: "Some DWP online services may be temporarily unavailable." }));

const no = [
  { title: "Chris Mason: Immigration stats are down but will that be the end of the issue?" },
  { title: "NHS boss warns of 'horrible spike' in flu as hospital admissions surge" },
  { title: "Water firms to identify 250,000 vulnerable households in England eligible for discounts",
    summary: "Department for Work and Pensions to provide data about households missing out on WaterSure support scheme" },
  { title: "UK to pay 'participation' fee to deliver EU deals" },
  { title: "Why is there a shortage of 'wizard' elevator mechanics?" },
];
for (const i of no) {
  ok("not cyber: " + i.title, !isCyberNews(i) && !isCyberNews(i, { allowOrgIncidents: true }));
}

ok("canonicalUrl drops BBC RSS tracking params",
  canonicalUrl("https://www.bbc.co.uk/news/articles/c8wy5p6pv2e2o?at_medium=RSS&at_campaign=rss")
    === "https://www.bbc.co.uk/news/articles/c8wy5p6pv2e2o");
ok("canonicalUrl drops Guardian CMP and utm params",
  canonicalUrl("https://www.theguardian.com/uk-news/2026/nov/27/example?CMP=share&utm_source=rss")
    === "https://www.theguardian.com/uk-news/2026/nov/27/example");
ok("canonicalUrl rejects javascript and relative URLs",
  canonicalUrl("javascript:alert(1)") === null && canonicalUrl("/news/example") === null);

const mixed = [
  { title: "Older press story", link: "https://www.theregister.com/security/old/", date: "Thu, 26 Nov 2026 10:00:00 GMT", source: "The Register" },
  { title: "Department for Work and Pensions takes some services offline after 'cyber incident'",
    link: "https://www.bbc.co.uk/news/articles/c8wy5p6pv2e2o?at_medium=RSS&at_campaign=rss",
    date: "Fri, 27 Nov 2026 09:08:50 GMT", source: "BBC" },
  { title: "Temporary disruption to some DWP online services",
    link: "https://www.gov.uk/government/news/temporary-disruption-to-some-dwp-online-services",
    date: "2026-11-27T08:11:20+00:00", source: "GOV.UK" },
  { title: "Duplicate BBC URL after tracking stripped",
    link: "https://www.bbc.co.uk/news/articles/c8wy5p6pv2e2o",
    date: "Fri, 27 Nov 2026 09:09:00 GMT", source: "BBC" },
  { title: "No link", date: "Fri, 27 Nov 2026 12:00:00 GMT", source: "BBC" },
  { title: "Bad scheme", link: "javascript:alert(1)", date: "Fri, 27 Nov 2026 12:00:00 GMT", source: "BBC" },
];
const out = collectNews(mixed, 12);
ok("collectNews keeps official and BBC items and drops the duplicate",
  out.length === 3 && out[0].source === "BBC" && out[1].source === "GOV.UK" && out[2].source === "The Register");
ok("collectNews lists newest first",
  out[0].title.includes("cyber incident") && out[1].title.includes("Temporary disruption"));
ok("collectNews stripped the BBC tracking query",
  out[0].url === "https://www.bbc.co.uk/news/articles/c8wy5p6pv2e2o");

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("All tests passed");
