const { chromium } = require("playwright-core");
const U = process.env.U || "https://jolly-wave-0440ea803-outages.westeurope.5.azurestaticapps.net/";
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const panelInfo = () => {
  const p = (id) => {
    const el = document.getElementById(id);
    const rows = [...el.querySelectorAll(".lv-row")];
    return {
      rows: rows.length,
      visible: rows.filter((r) => !r.closest("details")).length,
      more: el.querySelector(".lv-more summary")?.textContent || null,
      note: el.querySelector(".lv-note")?.textContent || null,
      first: rows.slice(0, 3).map((r) => r.querySelector(".lv-r-title").textContent + " [" + (r.querySelector(".lv-pill")?.textContent || "") + "]"),
      badLinks: [...el.querySelectorAll("a")].filter((a) => !(a.target === "_blank" && /noopener/.test(a.rel) && /^https?:\/\//.test(a.href))).length,
    };
  };
  const cols = getComputedStyle(document.querySelector(".lv-out-panels")).gridTemplateColumns.split(" ").length;
  return {
    problems: p("out-problems"), gov: document.getElementById("out-gov") ? p("out-gov") : null, news: p("out-news"), cols,
    panels: document.querySelectorAll("#outages .lv-panel").length,
    panelHeights: [...document.querySelectorAll("#outages .lv-panel")].map((e) => Math.round(e.getBoundingClientRect().height)),
    servicesGone: !document.getElementById("services") && !document.getElementById("out-services") && !document.querySelector(".service-grid") && !/The work follows the tools/.test(document.body.textContent),
    deadAnchors: [...document.querySelectorAll('a[href*="#"]')].map((a) => a.getAttribute("href")).filter((h) => { const id = h.split("#")[1]; return (h.startsWith("#") || h.startsWith("/#")) && id && !document.getElementById(id); }),
    navLinks: [...document.querySelectorAll(".header-nav a")].map((a) => a.textContent.trim()).filter(Boolean),
    tickerGone: !document.getElementById("out-ticker") && !document.querySelector(".lv-out-tk-track"),
    newsTicker: document.querySelectorAll("#tickerTrack .lv-ticker-item").length,
    newsRows: document.querySelectorAll("#news-body .lv-row").length,
    advRows: document.querySelectorAll("#adv-body .lv-row").length,
    credit: document.querySelector("#out-credit a")?.href || null,
    updated: document.getElementById("out-updated").textContent,
    hscroll: document.documentElement.scrollWidth > window.innerWidth,
  };
};
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const res = {};
  for (const [name, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    pg.on("pageerror", (e) => errs.push("pageerror " + e.message));
    const r = await pg.goto(U, { waitUntil: "networkidle" });
    for (const id of ["out-problems", "out-news", "out-gov", "news-body", "adv-body"]) await pg.waitForSelector(`#${id} .lv-row, #${id} .lv-note`, { timeout: 25000 });
    const info = await pg.evaluate(panelInfo);
    info.status = r.status(); info.csp = r.headers()["content-security-policy"]; info.errors = errs;
    if (await pg.$("#out-news .lv-more summary")) {
      await pg.click("#out-news .lv-more summary");
      info.newsExpanded = await pg.evaluate(() => document.querySelector("#out-news details").open);
      await pg.evaluate(() => document.querySelector("#out-news details").open = false);
    }
    res[name] = info;
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.waitForTimeout(300);
    const box = await pg.evaluate(() => { const s = document.getElementById("outages").getBoundingClientRect(); return { y: s.top + scrollY, h: s.height, w: document.documentElement.clientWidth }; });
    await pg.screenshot({ path: `${SHOTS}/${name}-section.png`, fullPage: true, clip: { x: 0, y: box.y, width: box.w, height: box.h } });
    await pg.screenshot({ path: `${SHOTS}/${name}-full.png`, fullPage: true });
    // Apps page: Services link gone, no errors
    const ap = await ctx.newPage(); const aerr = [];
    ap.on("console", (m) => { if (m.type() === "error") aerr.push(m.text()); });
    await ap.goto(U + "apps", { waitUntil: "networkidle" });
    info.appsPage = await ap.evaluate(() => ({ nav: [...document.querySelectorAll(".header-nav a")].map((a) => a.textContent.trim()).filter(Boolean), services: !!document.querySelector('a[href*="#services"]'), hscroll: document.documentElement.scrollWidth > window.innerWidth }));
    info.appsPage.errors = aerr;
    await ctx.close();
  }
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const pg = await ctx.newPage();
  // API error
  await pg.route("**/api/outages", (r) => r.fulfill({ status: 500, body: "x" }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#out-news .lv-note", { timeout: 20000 });
  res.apiDown = await pg.evaluate(() => ({ p: document.querySelector("#out-problems").textContent, n: document.querySelector("#out-news").textContent, newsRows: document.querySelectorAll("#news-body .lv-row").length }));
  const bx = await pg.evaluate(() => { const s = document.getElementById("outages").getBoundingClientRect(); return { y: s.top + scrollY, h: s.height, w: document.documentElement.clientWidth }; });
  await pg.screenshot({ path: `${SHOTS}/desktop-section-failure.png`, fullPage: true, clip: { x: 0, y: bx.y, width: bx.w, height: bx.h } });
  // Status down, news up
  await pg.unroute("**/api/outages");
  await pg.route("**/api/outages", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: false, error: "Status unavailable", ticker: [], categories: [], news: [{ title: "Example outage headline", source: "BBC", url: "https://www.bbc.co.uk/news/x", date: new Date().toISOString() }] }) }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#out-news .lv-row", { timeout: 20000 });
  res.statusDownNewsUp = await pg.evaluate(() => ({ p: document.querySelector("#out-problems").textContent, n: document.querySelectorAll("#out-news .lv-row").length }));
  // All fine, no problems, no news -> empty states
  await pg.unroute("**/api/outages");
  await pg.route("**/api/outages", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: true, updated: new Date().toISOString(), news: [], ticker: [{ name: "EE", category: "mobile", state: "ok", link: "https://status-pages.com/mobile/ee" }], categories: [{ id: "mobile", label: "Mobile networks", available: true, total: 1, ok: 1, unknown: 0, problems: [] }] }) }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#out-news .lv-note", { timeout: 20000 });
  res.allQuiet = await pg.evaluate(() => ({ p: document.querySelector("#out-problems").textContent, n: document.querySelector("#out-news").textContent }));
  // Hostile payload
  await pg.unroute("**/api/outages");
  await pg.route("**/api/outages", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: true, updated: "<x>", source: { url: "javascript:window.__pwn=1" },
    news: [{ title: "<img src=x onerror=window.__pwn=1>N", source: "<script>window.__pwn=1</script>", url: "javascript:window.__pwn=1", date: "x" }],
    ticker: [{ name: "<svg onload=window.__pwn=1>", category: "<b>", state: '"><img src=x onerror=window.__pwn=1>', link: "https://ok.example/\" onmouseover=\"window.__pwn=1" }],
    categories: [{ id: "x", label: "<img src=x onerror=window.__pwn=1>", available: true, problems: [{ name: "<script>window.__pwn=1</script>", status: "major_outage", summary: "<svg onload=window.__pwn=1>", link: "javascript:window.__pwn=1" }] }] }) }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#out-problems .lv-row", { timeout: 20000 });
  await pg.waitForTimeout(500);
  res.hostile = await pg.evaluate(() => ({ pwned: !!window.__pwn, injected: document.querySelectorAll("#outages img, #outages script, #outages .lv-panel-body svg").length, links: [...document.querySelectorAll("#outages a")].map((a) => a.getAttribute("href")) }));
  await b.close();
  console.log(JSON.stringify(res, null, 1));
})();
