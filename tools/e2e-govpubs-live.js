const { chromium } = require("playwright-core");
const U = process.env.U || "https://jolly-wave-0440ea803-outages.westeurope.5.azurestaticapps.net/";
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
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
    for (const id of ["kev-body", "news-body", "adv-body", "pubs-body", "out-problems", "out-news"]) await pg.waitForSelector(`#${id} .lv-row, #${id} .lv-note`, { timeout: 25000 });
    res[name] = await pg.evaluate(() => {
      const panels = [...document.querySelectorAll("#threats .lv-dash-grid > .lv-panel")];
      const el = document.getElementById("pubs-body");
      const rows = [...el.querySelectorAll(".lv-row")];
      return {
        cols: getComputedStyle(document.querySelector("#threats .lv-dash-grid")).gridTemplateColumns.split(" ").length,
        panels: panels.map((p) => p.querySelector(".lv-h").textContent.trim() + " " + Math.round(p.getBoundingClientRect().height) + "px@" + Math.round(p.getBoundingClientRect().top + scrollY)),
        pubRows: rows.length, pubVisible: rows.filter((r) => !r.closest("details")).length,
        more: el.querySelector(".lv-more summary")?.textContent || null,
        note: el.querySelector(".lv-note")?.textContent || null,
        sample: rows.slice(0, 4).map((r) => r.querySelector(".lv-r-title").textContent + " [" + r.querySelector(".lv-pill").textContent + "] " + r.querySelector(".lv-r-meta").textContent),
        linksOk: [...el.querySelectorAll("a")].every((a) => a.target === "_blank" && /noopener/.test(a.rel) && /^https:\/\/(www\.gov\.uk|([a-z0-9-]+\.)*parliament\.uk)\//.test(a.href)),
        licenceLinks: [...document.querySelectorAll("#pubs-foot a")].map((a) => a.href),
        kevRows: document.querySelectorAll("#kev-body .lv-row").length, newsRows: document.querySelectorAll("#news-body .lv-row").length, advRows: document.querySelectorAll("#adv-body .lv-row").length,
        outRows: document.querySelectorAll("#out-problems .lv-row, #out-problems .lv-note").length + "/" + document.querySelectorAll("#out-news .lv-row").length,
        hscroll: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    Object.assign(res[name], { status: r.status(), csp: r.headers()["content-security-policy"], errors: errs });
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.waitForTimeout(300);
    const box = await pg.evaluate(() => { const g = document.querySelector("#threats .lv-dash-grid").getBoundingClientRect(), f = document.getElementById("pubs-foot").getBoundingClientRect(); return { y: g.top + scrollY - 10, h: f.bottom - g.top + 20, w: document.documentElement.clientWidth }; });
    await pg.screenshot({ path: `${SHOTS}/govpubs-${name}.png`, fullPage: true, clip: { x: 0, y: box.y, width: box.w, height: box.h } });
    await ctx.close();
  }
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const pg = await ctx.newPage();
  await pg.route("**/api/govpubs", (r) => r.fulfill({ status: 500, body: "x" }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#pubs-body .lv-note", { timeout: 20000 });
  res.apiDown = await pg.evaluate(() => ({ pubs: document.querySelector("#pubs-body").textContent, adv: document.querySelectorAll("#adv-body .lv-row").length, news: document.querySelectorAll("#news-body .lv-row").length }));
  await pg.unroute("**/api/govpubs");
  await pg.route("**/api/govpubs", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: false, error: "Publications unavailable", items: [] }) }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#pubs-body .lv-note", { timeout: 20000 });
  res.upstreamDown = await pg.evaluate(() => document.querySelector("#pubs-body").textContent);
  await pg.unroute("**/api/govpubs");
  await pg.route("**/api/govpubs", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: true, items: [
    { title: "<img src=x onerror=window.__pwn=1>T", source: "<script>window.__pwn=1</script>", kind: "<b>k</b>", date: "x", url: "javascript:window.__pwn=1" },
    { title: "ok", source: "DSIT", kind: "Policy paper", date: new Date().toISOString(), url: "https://www.gov.uk/x\" onmouseover=\"window.__pwn=1" }],
    licences: [{ name: "<img src=x onerror=window.__pwn=1>", url: "javascript:window.__pwn=1" }, { name: "x", url: "https://evil.example/" }] }) }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#pubs-body .lv-row", { timeout: 20000 });
  await pg.waitForTimeout(400);
  res.hostile = await pg.evaluate(() => ({ pwned: !!window.__pwn, injected: document.querySelectorAll("#pubs-body img, #pubs-body script, #pubs-foot img, #pubs-foot a").length, links: [...document.querySelectorAll("#pubs-body a")].map((a) => a.getAttribute("href")) }));
  await b.close();
  console.log(JSON.stringify(res, null, 1));
})();
