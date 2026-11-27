// Unit tests for the "What's down in the UK" normaliser. Run: node api/shared/_outages.test.js
const assert = require("assert");
const outages = require("./outages.js");
const { normalise, normaliseProvider, CATEGORIES, TICKER, tickerState } = outages;
const SHOWN = CATEGORIES.filter((c) => !c.tickerOnly).length;

let failed = 0;
function ok(name, cond) {
  if (!cond) { failed++; console.error("FAIL", name); } else console.log("PASS", name);
}
const cat = { id: "email", label: "Email and office" };
const noTags = (s) => typeof s === "string" && !/[<>]/.test(s);

// Normal provider
let p = normaliseProvider({ id: "outlook", displayName: "Outlook", indicator: "degraded", summary: "Users may be unable to connect", userReports: "spike", via: "statuspage", sourceUrl: "https://status.cloud.microsoft", activeIncidents: [{}] }, cat);
ok("normal: fields", p.name === "Outlook" && p.status === "degraded" && p.reportLevel === "spike" && p.category === "email" && p.incidents === 1);
ok("normal: links", p.link === "https://status-pages.com/email/outlook" && p.official === "https://status.cloud.microsoft/");
ok("normal: problem flagged", p.problem === true);

// Hostile strings
p = normaliseProvider({ id: "x", displayName: '<img src=x onerror=alert(1)>Evil<script>alert(1)</script>', summary: "<b>bad</b> & <svg/onload=alert(1)> \u0000\u0007 text <", indicator: "major_outage" }, cat);
ok("hostile: name has no tags", noTags(p.name) && !/script|onerror/i.test(p.name) && p.name.includes("Evil"));
ok("hostile: summary has no tags or control chars", noTags(p.summary) && !/[\u0000-\u001f]/.test(p.summary) && p.summary.includes("bad"));
ok("hostile: very long text capped", normaliseProvider({ id: "a", displayName: "A".repeat(500), summary: "B".repeat(5000) }, cat).summary.length <= 160);

// Hostile links
p = normaliseProvider({ id: "javascript:alert(1)", displayName: "JS", sourceUrl: "javascript:alert(1)" }, cat);
ok("javascript: sourceUrl dropped", p.official === null);
ok("unsafe id not used in link", p.link === "https://status-pages.com/email");
ok("data: url dropped", normaliseProvider({ id: "d", displayName: "D", sourceUrl: "data:text/html,<script>alert(1)</script>" }, cat).official === null);
ok("relative url dropped", normaliseProvider({ id: "r", displayName: "R", sourceUrl: "//evil.example/x" }, cat).official === null);
ok("id with quotes rejected", normaliseProvider({ id: 'a"onmouseover="x', displayName: "Q" }, cat).link === "https://status-pages.com/email");

// Missing / odd fields
p = normaliseProvider({ id: "m", displayName: "Missing" }, cat);
ok("missing: defaults", p.status === "unknown" && p.summary === "" && p.reportLevel === "none" && p.official === null && p.incidents === 0 && p.problem === false);
ok("missing name and id: dropped", normaliseProvider({ indicator: "degraded" }, cat) === null);
ok("non-object dropped", normaliseProvider(null, cat) === null && normaliseProvider("x", cat) === null);
ok("unknown indicator -> unknown", normaliseProvider({ id: "u", displayName: "U", indicator: "<b>weird</b>" }, cat).status === "unknown");
ok("bogus userReports ignored", normaliseProvider({ id: "u", displayName: "U", userReports: "<script>" }, cat).reportLevel === "none");
ok("non-string name ignored", normaliseProvider({ id: "n", displayName: { toString() { return "<x>"; } } }, cat).name === "n");
ok("spike alone makes a problem", normaliseProvider({ id: "s", displayName: "S", indicator: "operational", userReports: "spike" }, cat).problem === true);

// Whole payload
const good = { providers: [
  { id: "a", displayName: "A", indicator: "operational" },
  { id: "b", displayName: "B", indicator: "degraded" },
  { id: "c", displayName: "C", indicator: "major_outage" },
  { id: "d", displayName: "D", indicator: "unknown" },
  { id: "e", displayName: "E", indicator: "maintenance" },
] };
let out = normalise([good, null, { providers: "nope" }, {}, good, good]);
const c0 = out.categories[0];
ok("payload: available", out.available === true && !out.error && out.categories.length === SHOWN && !out.categories.some((c) => c.id === "social"));
ok("payload: counts", c0.total === 5 && c0.ok === 1 && c0.unknown === 1 && c0.problems.length === 3);
ok("payload: worst first, maintenance last", c0.problems[0].name === "C" && c0.problems[1].name === "B" && c0.problems[2].name === "E");
ok("payload: internal flag not exposed", !("problem" in c0.problems[0]) && !("id" in c0.problems[0]));
ok("payload: failed categories marked unavailable", out.categories[1].available === false && out.categories[2].available === false && out.categories[3].available === false);

// Ticker
ok("ticker: 15-20 services configured", TICKER.length >= 15 && TICKER.length <= 20);
ok("ticker: states", tickerState({ status: "major_outage", reportLevel: "spike" }) === "outage" && tickerState({ status: "degraded", reportLevel: "spike" }) === "spike" &&
  tickerState({ status: "degraded", reportLevel: "none" }) === "degraded" && tickerState({ status: "unknown", reportLevel: "none" }) === "unclear" &&
  tickerState({ status: "ok", reportLevel: "elevated" }) === "spike" && tickerState({ status: "ok", reportLevel: "none" }) === "ok" && tickerState({ status: "maintenance", reportLevel: "none" }) === "maintenance");
const byCat = {};
TICKER.forEach(([c, id]) => { (byCat[c] = byCat[c] || []).push({ id, displayName: id.toUpperCase(), indicator: "operational" }); });
byCat.mobile.find((p) => p.id === "o2").indicator = "major_outage";
byCat.email.find((p) => p.id === "outlook").userReports = "spike";
byCat.banks.find((p) => p.id === "lloyds").indicator = "degraded";
byCat.government.find((p) => p.id === "govuk").indicator = "unknown";
byCat.social.find((p) => p.id === "whatsapp").displayName = '<img src=x onerror=alert(1)>WhatsApp';
byCat.email.push({ id: "not-in-ticker", displayName: "Other", indicator: "major_outage" });
const results = CATEGORIES.map((c) => ({ providers: byCat[c.id] || [] }));
out = normalise(results);
const tk = out.ticker;
ok("ticker: all configured services present", tk.length === TICKER.length && !tk.some((t) => t.name === "Other"));
ok("ticker: problems first in severity order", tk[0].name === "O2" && tk[0].state === "outage" && tk[1].name === "OUTLOOK" && tk[1].state === "spike" && tk[2].state === "degraded" && tk[3].state === "unclear" && tk.slice(4).every((t) => t.state === "ok"));
ok("ticker: ok items keep configured order", tk[4].name === "MICROSOFT365" && tk[5].name === "ONEDRIVE");
ok("ticker: hostile name sanitised", tk.every((t) => noTags(t.name)) && tk.some((t) => t.name.includes("WhatsApp")));
ok("ticker: links are StatusPages pages", tk.every((t) => /^https:\/\/status-pages\.com\/[a-z]+\/[a-z0-9-]+$/.test(t.link)));
ok("ticker: no internal fields", tk.every((t) => !("order" in t)));
ok("ticker: missing ids skipped", normalise(CATEGORIES.map(() => ({ providers: [{ id: "nope", displayName: "N" }] }))).ticker.length === 0);
ok("ticker only (social) still counts as available", normalise(CATEGORIES.map((c) => (c.id === "social" ? { providers: byCat.social } : null))).available === true);

// Upstream fully down
out = normalise(CATEGORIES.map(() => null));
ok("upstream down: clean unavailable payload", out.available === false && out.error === "Status unavailable" && out.categories.every((c) => !c.available && c.problems.length === 0) && out.ticker.length === 0);
ok("upstream down: JSON-serialisable", typeof JSON.stringify(out) === "string");

// Handler with fetch failing: never throws, returns 200 + unavailable
(async () => {
  const realFetch = global.fetch;
  global.fetch = async () => { throw new Error("network down"); };
  const res = { h: {}, setHeader(k, v) { this.h[k] = v; }, status(s) { this.s = s; return this; }, json(o) { this.o = o; } };
  await outages({}, res);
  ok("handler: upstream throws -> 200 unavailable", res.s === 200 && res.o.available === false && res.o.error === "Status unavailable");
  ok("handler: short cache when unavailable", res.h["Cache-Control"] === "s-maxage=60");
  global.fetch = async () => new Response("<html><script>alert(1)</script></html>", { status: 200, headers: { "content-type": "text/html" } });
  await outages({}, res);
  ok("handler: HTML upstream rejected", res.o.available === false);
  global.fetch = async () => new Response("{not json", { status: 200, headers: { "content-type": "application/json" } });
  await outages({}, res);
  ok("handler: bad JSON rejected", res.o.available === false);
  global.fetch = async () => new Response("err", { status: 503 });
  await outages({}, res);
  ok("handler: 503 upstream -> unavailable", res.o.available === false);
  global.fetch = async () => new Response(JSON.stringify(good), { status: 200, headers: { "content-type": "application/json" } });
  await outages({}, res);
  ok("handler: good upstream -> 5 min cache", res.o.available === true && res.h["Cache-Control"].startsWith("s-maxage=300"));
  global.fetch = realFetch;
  
const { isUnreachable } = require("./outages");
const uc = { status: "unknown", summary: "No unusual user reports; our own check could not reach the site" };
ok("unreachable: UC probe wording counts", isUnreachable(uc));
ok("unreachable: plain unknown does not", !isUnreachable({ status: "unknown", summary: "No data" }));
ok("unreachable: operational does not", !isUnreachable({ status: "ok", summary: "could not reach" }));

const govIdx = CATEGORIES.findIndex((c) => c.id === "government");
const govBoard = CATEGORIES.map((c, i) => i === govIdx ? { providers: [
  { id: "govuk", displayName: "GOV.UK", indicator: "operational", summary: "All Systems Operational", sourceUrl: "https://status.publishing.service.gov.uk", via: "statuspage", userReports: "none", activeIncidents: [] },
  { id: "universal-credit", displayName: "Universal Credit", indicator: "unknown", summary: "No unusual user reports; our own check could not reach the site", sourceUrl: "https://www.universal-credit.service.gov.uk", via: "crowd", userReports: "none", activeIncidents: [] },
] } : { providers: [] });
const govOut = normalise(govBoard, [], []);
const govCat = govOut.categories.find((c) => c.id === "government");
ok("UC unreachable appears in government problems", govCat.problems.some((p) => p.name === "Universal Credit" && p.status === "unknown"));
ok("UC is not left in the unknown count once surfaced", govCat.unknown === 0 && govCat.problems.length === 1);
ok("operational GOV.UK is not a problem", !govCat.problems.some((p) => p.name === "GOV.UK") && govCat.ok === 1);
ok("govServices defaults to an array", Array.isArray(govOut.govServices) && govOut.govServices.length === 0);

if (failed) { console.error(failed + " failed"); process.exit(1); }
  console.log("ALL-TESTS-PASSED");
})();
