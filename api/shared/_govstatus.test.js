// Unit tests for official GOV.UK status parsing. Run: node api/shared/_govstatus.test.js
const { fromOfficial, extrasFromStatusPages, mergeServices, PAGES } = require("./govstatus.js");

let failed = 0;
function ok(name, cond) {
  if (!cond) { failed++; console.error("FAIL", name); } else console.log("PASS", name);
}

ok("tracks One Login, Pay, Notify and the GOV.UK website",
  PAGES.map((p) => p.id).join(" ") === "publishing one-login pay notify" &&
  PAGES.every((p) => /^https:\/\//.test(p.summary) && /^https:\/\//.test(p.page)));

const now = Date.parse("2026-11-27T10:00:00Z");
const payPage = PAGES.find((p) => p.id === "pay");
const paySummary = { page: { name: "GOV.UK Pay", updated_at: "2026-11-26T16:14:54.094Z" }, status: { indicator: "none", description: "All Systems Operational" } };
const payIncidents = { incidents: [
  { name: "Ongoing issue with payments timing out", status: "resolved", impact: "none", created_at: "2026-11-26T10:45:45.564Z", resolved_at: "2026-11-26T16:14:54.094Z", shortlink: "https://payments.statuspage.io/incidents/abc", incident_updates: [{ body: "Payments have returned to normal levels." }] },
  { name: "Old Revolut outage", status: "resolved", impact: "minor", created_at: "2026-10-20T11:21:56Z", resolved_at: "2026-10-20T16:13:17Z" },
] };
const pay = fromOfficial(payPage, paySummary, payIncidents, now);
ok("Pay current status is ok after the timeout was resolved", pay && pay.status === "ok" && pay.name === "GOV.UK Pay" && pay.url === "https://payments.statuspage.io/");
ok("Pay keeps yesterday's resolved timeout and drops older incidents",
  pay.incidents.length === 1 && pay.incidents[0].name.includes("payments timing out") && pay.incidents[0].status === "resolved" && pay.incidents[0].resolved === "2026-11-26T16:14:54.094Z");
ok("Pay incident URL is official https", /^https:\/\/payments\.statuspage\.io\//.test(pay.incidents[0].url));

const live = fromOfficial(PAGES.find((p) => p.id === "one-login"), {
  status: { indicator: "major", description: "Partial System Outage" },
}, { incidents: [{ name: "Sign-in failing", status: "investigating", impact: "major", created_at: "2026-11-27T09:00:00Z" }] }, now);
ok("active major incident is flagged", live.status === "partial_outage" && live.incidents[0].status === "investigating");

ok("missing or unsafe page is dropped", fromOfficial({ name: "X", page: "javascript:alert(1)" }, paySummary, null, now) === null);
ok("hostile incident text is stripped", fromOfficial(payPage, paySummary, { incidents: [{ name: "<b>Pay down</b>", status: "resolved", created_at: "2026-11-26T12:00:00Z", resolved_at: "2026-11-26T13:00:00Z" }] }, now).incidents[0].name === "Pay down");
ok("empty summary with no incidents is dropped", fromOfficial(payPage, null, null, now) === null);
ok("summary missing but a recent incident is kept", fromOfficial(payPage, null, payIncidents, now) && fromOfficial(payPage, null, payIncidents, now).incidents.length === 1);

const extras = extrasFromStatusPages({ providers: [
  { id: "govuk", displayName: "GOV.UK", indicator: "operational", summary: "All Systems Operational", sourceUrl: "https://status.publishing.service.gov.uk", via: "statuspage" },
  { id: "universal-credit", displayName: "Universal Credit", indicator: "unknown", summary: "No unusual user reports; our own check could not reach the site", sourceUrl: "https://www.universal-credit.service.gov.uk", via: "crowd", userReports: "none" },
  { id: "hmrc", displayName: "HMRC online services", indicator: "operational", summary: "HMRC reports no unplanned downtime", sourceUrl: "https://www.gov.uk/guidance/find-out-which-hmrc-services-are-experiencing-issues", via: "statuspage" },
  { id: "bad", displayName: "<b>Evil</b>", indicator: "operational", sourceUrl: "javascript:alert(1)" },
] }, now);
ok("official StatusPages rows already covered are not duplicated", !extras.some((e) => e.id === "govuk" || /GOV\.UK$/.test(e.name)));
ok("Universal Credit is kept as unknown/unreachable", extras.some((e) => e.name === "Universal Credit" && e.status === "unknown" && /could not reach/.test(e.description) && e.url.includes("universal-credit")));
ok("HMRC official guidance URL is kept", extras.some((e) => e.name === "HMRC online services" && e.url.includes("gov.uk")));
ok("javascript official URLs are never used", !JSON.stringify(extras).includes("javascript:"));
ok("HTML in StatusPages names is stripped", extras.every((e) => e.name === e.name.replace(/[<>]/g, "")));

const merged = mergeServices([pay, live], extras);
ok("merge lists unresolved official issues before ok rows", merged[0].name === "GOV.UK One Login" && merged.some((s) => s.name === "GOV.UK Pay"));

if (failed) { console.error(failed + " failed"); process.exit(1); }
console.log("All tests passed");
