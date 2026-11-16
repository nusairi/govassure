// Unit tests for the Government and Parliament publications filter and parsers. Run: node api/shared/_govpubs.test.js
const g = require("./govpubs.js");
const { isTechTitle, filterPublications, fromGovUk, fromCommittees, fromFeed, allowedUrl } = g;
const { parseFeed } = require("./_rss.js");

let failed = 0;
function ok(name, cond) { if (!cond) { failed++; console.error("FAIL", name); } else console.log("PASS", name); }

const yes = [
  "Cyber Security and Resilience (Network and Information Systems) Bill: factsheets",
  "Artificial Intelligence sector study 2025",
  "AI Opportunities Action Plan: one year on",
  "UK software market analysis",
  "Legal framework for using facial recognition in law enforcement",
  "Digital Inclusion Action Plan: One Year On",
  "Telecoms Modernisation: Critical National Infrastructure Charter",
  "IT Reuse for Good Charter",
  "How could quantum computers undermine digital security?",
  "Growing up in the online world: a national consultation",
  "Data (Use and Access) Act: commencement plan",
  "Ransomware payments: consultation response",
  "Investigatory Powers Act 2016: code of practice",
];
const no = [
  "British Sign Language (BSL) 5-year plan: Department for Science, Innovation and Technology",
  "5th Report - The science and regulation of hair and beauty products and treatments",
  "Rebuilding forensic science for criminal justice: Science and Technology Committee report",
  "Proceeds of Crime Act 2002: bodies granted investigatory powers",
  "Windrush Compensation Scheme data: August 2026",
  "Crime outcomes year to June 2026: data tables",
  "Police recorded knife-enabled robbery offences: Pre-release access",
  "Building materials and components statistics: October 2027",
  "Benefits Uprating 2027/28",
  "It is time to reform the water sector", // "It" is not "IT"
  "Chalk streams",
  "",
];
yes.forEach((t) => ok("match: " + t, isTechTitle(t)));
no.forEach((t) => ok("no match: " + (t || "(empty)"), !isTechTitle(t)));
ok("non-string", !isTechTitle(null) && !isTechTitle({}));
ok("strong term in description counts", isTechTitle("Police user insights", "Views on retrospective facial recognition"));
ok("weak term in description ignored", !isTechTitle("Migration transparency", "Data on Border Force"));
ok("pre-release excluded even with keyword", !isTechTitle("Cyber security breaches survey: pre-release access list"));

// URL allow-list
ok("gov.uk allowed", allowedUrl("https://www.gov.uk/government/publications/x") === "https://www.gov.uk/government/publications/x");
ok("parliament subdomains allowed", !!allowedUrl("https://commonslibrary.parliament.uk/research-briefings/x/") && !!allowedUrl("https://committees.parliament.uk/publications/1/documents/2/default/"));
ok("http rejected", allowedUrl("http://www.gov.uk/x") === null);
ok("javascript: rejected", allowedUrl("javascript:alert(1)") === null);
ok("other host rejected", allowedUrl("https://evil.example/x") === null && allowedUrl("https://gov.uk.evil.example/x") === null && allowedUrl("https://parliament.uk.evil.example/") === null && allowedUrl("https://notparliament.uk/") === null);
ok("credentials/port rejected", allowedUrl("https://user:pw@www.gov.uk/x") === null && allowedUrl("https://www.gov.uk:8443/x") === null);

// GOV.UK parser
const gov = fromGovUk({ results: [
  { title: "Software Security Ambassadors Scheme", link: "/government/publications/software-security-ambassadors-scheme", public_timestamp: "2026-11-03T12:38:22+00:00", display_type: "Policy paper", organisations: [{ slug: "department-for-culture-media-and-sport", acronym: "DCMS" }, { slug: "department-for-science-innovation-and-technology", acronym: "DSIT" }] },
  { title: "Legal framework for using facial recognition", link: "/government/consultations/legal-framework", public_timestamp: "2026-11-04T10:00:00Z", organisations: [{ slug: "home-office", acronym: "" , title: "Home Office"}] },
  { title: "Unknown org digital paper", link: "//evil.example/x", public_timestamp: "2026-11-04T10:00:00Z", organisations: [{ slug: "x", acronym: "<b>XX</b>" }] },
  null, "junk",
] });
ok("govuk: known org preferred for pill", gov[0].source === "DSIT" && gov[0].url === "https://www.gov.uk/government/publications/software-security-ambassadors-scheme");
ok("govuk: kind from path when display_type missing", gov[1].kind === "Consultation" && gov[1].source === "Home Office");
ok("govuk: hostile acronym cleaned", !/[<>]/.test(gov[2].source));
ok("govuk: bad input", fromGovUk(null).length === 0 && fromGovUk({ results: "x" }).length === 0);

// Committees parser
const com = fromCommittees({ items: [
  { id: 55609, description: "Letter from Baroness X, Minister for Space, Cyber and Regulatory Reform to Lord Y", publicationStartDate: "2026-10-30T00:00:00", type: { name: "Government Response" }, committee: { id: 1, name: "Constitution Committee" }, businesses: [{ title: "Cyber Security and Resilience (Network and Information Systems) Bill" }], documents: [{ documentId: 308897 }] },
  { id: 2, description: "5th Report - AI in the public sector", publicationStartDate: "2026-11-01T09:00:00", type: { name: "Report" }, committee: { id: 7, name: "Public Accounts Committee" }, additionalContentUrl: "https://publications.parliament.uk/pa/cm/report.html", documents: [] },
  { id: 3, description: "1st Report - Something", publicationStartDate: "2026-11-01T09:00:00", type: { name: "Report" }, committee: { id: 8, name: "X" }, additionalContentUrl: "javascript:alert(1)", documents: [] },
] });
ok("committees: letter retitled from inquiry", com[0].title === "Cyber Security and Resilience (Network and Information Systems) Bill: ministerial letter" && com[0].url === "https://committees.parliament.uk/publications/55609/documents/308897/default/");
ok("committees: kind includes committee", com[0].kind === "Government Response · Constitution Committee" && com[0].source === "Committee");
ok("committees: report html link used", com[1].url === "https://publications.parliament.uk/pa/cm/report.html");
ok("committees: unsafe additional url ignored, falls back to committee page", com[2].url === "https://committees.parliament.uk/committee/8/");
ok("committees: date treated as UTC", com[1].date === "2026-11-01T09:00:00Z");
ok("committees: bad input", fromCommittees(null).length === 0);

// RSS parser + feed adapter (Commons Library style)
const xml = `<rss><channel>
<item><title>Cyber security &amp; the UK economy</title><link>https://commonslibrary.parliament.uk/research-briefings/cyber/</link><pubDate>Fri, 13 Nov 2026 12:00:00 +0000</pubDate></item>
<item><title>&lt;script&gt;alert(1)&lt;/script&gt;Digital ID &amp;amp; you</title><link>javascript:alert(1)</link><pubDate>Fri, 13 Nov 2026 12:00:00 +0000</pubDate></item>
<item><title>Chalk streams</title><link>https://commonslibrary.parliament.uk/research-briefings/chalk/</link><pubDate>Fri, 13 Nov 2026 11:00:00 +0000</pubDate></item>
</channel></rss>`;
const feed = fromFeed(parseFeed(xml), { source: "Commons Library", kind: "Research briefing" });
ok("rss: parsed and decoded", feed.length === 3 && feed[0].title === "Cyber security & the UK economy" && feed[0].source === "Commons Library");
ok("rss: entity-hidden script removed", !/[<>]/.test(feed[1].title) && feed[1].title.includes("Digital ID"));

// Filter end to end
const now = Date.parse("2026-11-14T07:00:00Z");
const d = (days) => new Date(now - days * 86400000).toISOString();
const cands = [
  ...feed,
  { title: "AI sector study", source: "DSIT", kind: "Research", date: d(2), url: "https://www.gov.uk/government/publications/ai-sector-study?x=1" },
  { title: "AI sector study", source: "DSIT", kind: "Research", date: d(2), url: "https://www.gov.uk/government/publications/ai-sector-study" }, // same page
  { title: "Old cyber paper", source: "DSIT", kind: "Policy paper", date: d(45), url: "https://www.gov.uk/government/publications/old" },
  { title: "Future cyber paper", source: "DSIT", kind: "Policy paper", date: new Date(now + 3 * 86400000).toISOString(), url: "https://www.gov.uk/government/publications/future" },
  { title: "Cyber on another site", source: "X", kind: "Paper", date: d(1), url: "https://evil.example/cyber" },
  { title: "<img src=x onerror=alert(1)>Digital strategy", source: "<script>x</script>MOD", kind: "<b>Policy paper</b>", date: d(1), url: "https://www.gov.uk/government/publications/digital-strategy" },
  { title: "Undated digital paper", source: "MOD", kind: "Policy paper", date: "", url: "https://www.gov.uk/government/publications/undated" },
];
const out = filterPublications(cands, now);
const titles = out.map((i) => i.title);
ok("filter: newest first", out.every((x, k) => k === 0 || Date.parse(out[k - 1].date) >= Date.parse(x.date)));
ok("filter: off-topic dropped", !titles.includes("Chalk streams"));
ok("filter: javascript: link dropped", !titles.some((t) => t.includes("Digital ID")));
ok("filter: dedupe same page", titles.filter((t) => t === "AI sector study").length === 1);
ok("filter: >30 days, future, undated dropped", !titles.some((t) => /Old|Future|Undated/.test(t)));
ok("filter: other hosts dropped", !titles.includes("Cyber on another site"));
ok("filter: hostile text cleaned", out.every((i) => !/[<>]/.test(i.title + i.source + i.kind)) && titles.some((t) => t.includes("Digital strategy")));
ok("filter: expected count", out.length === 3);
const many = Array.from({ length: 15 }, (_, k) => ({ title: `Cyber paper ${k} topic${k}`, source: "DSIT", kind: "Policy paper", date: d(k / 10), url: `https://www.gov.uk/government/publications/p${k}` }));
const parl = Array.from({ length: 5 }, (_, k) => ({ title: `Digital briefing ${k} area${k}`, source: "POST", kind: "Research briefing", date: d(5 + k), url: `https://post.parliament.uk/b${k}` }));
const mix = filterPublications(many.concat(parl), now);
ok("filter: capped at 10 with Parliament mix kept", mix.length === 10 && mix.filter((i) => i.source === "POST").length === 3);
ok("filter: fills with GOV.UK when no Parliament items", filterPublications(many, now).length === 10);
ok("filter: bad input", filterPublications(null, now).length === 0);

// Handler: all upstreams down -> clean unavailable payload
(async () => {
  const real = global.fetch;
  global.fetch = async () => { throw new Error("down"); };
  const res = { h: {}, setHeader(k, v) { this.h[k] = v; }, status(s) { this.s = s; return this; }, json(o) { this.o = o; } };
  await g({}, res);
  ok("handler: upstream down -> 200 unavailable", res.s === 200 && res.o.available === false && res.o.error === "Publications unavailable" && res.o.items.length === 0 && res.h["Cache-Control"] === "s-maxage=60");
  global.fetch = async (url) => new Response("<html>nope</html>", { status: 200, headers: { "content-type": "text/html" } });
  await g({}, res);
  ok("handler: HTML upstream -> unavailable", res.o.available === false);
  global.fetch = async (url) => {
    if (String(url).startsWith("https://www.gov.uk/api/search.json")) return new Response(JSON.stringify({ results: [{ title: "Cyber paper", link: "/government/publications/cyber", public_timestamp: new Date().toISOString(), organisations: [{ slug: "cabinet-office" }] }] }), { status: 200, headers: { "content-type": "application/json" } });
    throw new Error("down");
  };
  await g({}, res);
  ok("handler: one source up -> items, 15 min cache", res.o.available === true && res.o.items.length === 1 && res.o.items[0].source === "Cabinet Office" && res.h["Cache-Control"].startsWith("s-maxage=900"));
  ok("handler: licences provided", res.o.licences.length === 2 && res.o.licences.every((l) => /^https:\/\/www\.(nationalarchives\.gov\.uk|parliament\.uk)\//.test(l.url)));
  global.fetch = real;
  if (failed) { console.error(failed + " failed"); process.exit(1); }
  console.log("ALL-TESTS-PASSED");
})();
