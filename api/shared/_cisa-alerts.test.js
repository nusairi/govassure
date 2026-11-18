// Unit tests for the CISA alerts selector. Run: node api/shared/_cisa-alerts.test.js
const { itemsFromXml, itemType, extractCves } = require("./cisa-alerts.js");

let failed = 0;
function ok(name, cond) {
  if (!cond) {
    failed++;
    console.error("FAIL", name);
  } else {
    console.log("PASS", name);
  }
}

ok("type from alert path", itemType("https://www.cisa.gov/news-events/alerts/2026/11/17/critical-java-vulnerability-requires-immediate-patching") === "Alert");
ok("type from ics path", itemType("https://www.cisa.gov/news-events/ics-advisories/icsa-26-321-06") === "ICS");
ok("type from medical path", itemType("https://www.cisa.gov/news-events/ics-medical-advisories/icsma-26-001-01") === "Medical");
ok("type from analysis path", itemType("https://www.cisa.gov/news-events/analysis-reports/ar26-001") === "Analysis");
ok("type default advisory", itemType("https://www.cisa.gov/resources-tools/resources/example") === "Advisory");

ok("extract unique uppercase CVEs", extractCves("see cve-2026-114938 and CVE-2026-114938 and CVE-2024-1234").join(",") === "CVE-2026-114938,CVE-2024-1234");
ok("extract ignores junk", extractCves("CVE-12-1 and no ids").length === 0);

const xml = `<?xml version="1.0"?><rss><channel>
<item>
  <title>Siemens ROS#</title>
  <link>https://www.cisa.gov/news-events/ics-advisories/icsa-26-321-06</link>
  <description>ICS advisory mentioning CVE-2026-111111</description>
  <pubDate>Tue, 17 Nov 26 12:00:00 +0000</pubDate>
</item>
<item>
  <title>Critical Java Vulnerability Requires Immediate Patching</title>
  <link>https://www.cisa.gov/news-events/alerts/2026/11/17/critical-java-vulnerability-requires-immediate-patching</link>
  <description>&lt;p&gt;CISA urges organisations to patch CVE-2026-114938 (Java4Shell).&lt;/p&gt;</description>
  <pubDate>Tue, 17 Nov 26 12:00:00 +0000</pubDate>
</item>
<item>
  <title>Older ICS item</title>
  <link>https://www.cisa.gov/news-events/ics-advisories/icsa-26-300-01</link>
  <description>CVE-2024-99999</description>
  <pubDate>Mon, 16 Nov 26 12:00:00 +0000</pubDate>
</item>
<item>
  <title>CISA Adds One Known Exploited Vulnerability to Catalog</title>
  <link>https://www.cisa.gov/news-events/alerts/2026/11/17/cisa-adds-one-known-exploited-vulnerability-catalog</link>
  <description>Added CVE-2026-115731 to the KEV catalog.</description>
  <pubDate>Tue, 17 Nov 26 12:00:00 +0000</pubDate>
</item>
<item>
  <title>Dropped javascript link</title>
  <link>javascript:alert(1)</link>
  <description>CVE-2026-0000001</description>
  <pubDate>Wed, 18 Nov 26 12:00:00 +0000</pubDate>
</item>
<item>
  <title>&lt;script&gt;alert(1)&lt;/script&gt; Hidden</title>
  <link>https://www.cisa.gov/news-events/alerts/2026/11/15/safe</link>
  <description>A &lt;b&gt;bold&lt;/b&gt; title</description>
  <pubDate>Sun, 15 Nov 26 12:00:00 +0000</pubDate>
</item>
</channel></rss>`;

// Pad with extra same-day ICS items so the 8-item cap and Alert preference are both tested.
let padded = xml.replace("</channel>", "");
for (let i = 1; i <= 8; i++) {
  padded += `<item><title>Extra ICS ${i}</title><link>https://www.cisa.gov/news-events/ics-advisories/icsa-26-extra-0${i}</link><description>x</description><pubDate>Tue, 17 Nov 26 12:00:00 +0000</pubDate></item>`;
}
padded += "</channel></rss>";

const kev = new Set(["CVE-2026-115731"]);
const items = itemsFromXml(padded, kev);

ok("caps at 8", items.length === 8);
ok("drops javascript links", items.every((i) => i.url && i.url.startsWith("https://")));
ok("same-day alerts sort before ICS", items[0].type === "Alert" && items[1].type === "Alert");
ok("Java4Shell alert is in the top items", items.some((i) => /Java Vulnerability/i.test(i.title) && i.cves.some((c) => c.id === "CVE-2026-114938")));
const java = items.find((i) => /Java Vulnerability/i.test(i.title));
ok("Java4Shell type is Alert", java && java.type === "Alert");
ok("Java4Shell CVE is not marked KEV", java && java.cves[0].inKev === false);
ok("Java4Shell date is 17 Nov 2026 ISO", java && java.date === "2026-11-17T12:00:00.000Z");
const kevAlert = items.find((i) => /Known Exploited/i.test(i.title));
ok("KEV-add alert marks CVE as on the catalogue", kevAlert && kevAlert.cves.some((c) => c.id === "CVE-2026-115731" && c.inKev === true));
ok("older ICS is pushed out of the top 8 by same-day items", !items.some((i) => /Older ICS/.test(i.title)));
const hidden = itemsFromXml(xml, kev).find((i) => i.url && i.url.endsWith("/safe"));
ok("entity-hidden tags are stripped from titles by the shared RSS parser", hidden && hidden.title === "alert(1) Hidden" && !hidden.title.includes("<"));
ok("titles do not contain raw angle brackets", items.every((i) => !i.title.includes("<") && !i.title.includes(">")));

// Duplicate URL is collapsed.
const dupXml = `<?xml version="1.0"?><rss><channel>
<item><title>First</title><link>https://www.cisa.gov/news-events/alerts/2026/11/17/x</link><pubDate>Tue, 17 Nov 26 12:00:00 +0000</pubDate></item>
<item><title>Second copy</title><link>https://www.cisa.gov/news-events/alerts/2026/11/17/x</link><pubDate>Tue, 17 Nov 26 13:00:00 +0000</pubDate></item>
</channel></rss>`;
const dups = itemsFromXml(dupXml, []);
ok("duplicate links are collapsed", dups.length === 1 && dups[0].title === "Second copy");

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("ALL-TESTS-PASSED");
