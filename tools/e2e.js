const { chromium } = require("playwright-core");
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const U = process.env.B || process.env.U || "https://jolly-wave-0440ea803-outages.westeurope.5.azurestaticapps.net/";
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
    await pg.waitForSelector("#out-body .lv-out-lines, #out-body .lv-note", { timeout: 20000 });
    await pg.waitForSelector("#news-body .lv-row, #news-body .lv-note", { timeout: 20000 });
    const info = await pg.evaluate(() => ({
      csp: null,
      cards: document.querySelectorAll("#out-body .lv-out-card").length,
      lines: [...document.querySelectorAll("#out-body .lv-out-line")].map((l) => l.querySelector(".lv-out-cat")?.textContent + ": " + l.querySelector(".lv-out-sum")?.textContent),
      note: document.querySelector("#out-body .lv-note")?.textContent || null,
      updated: document.getElementById("out-updated").textContent,
      newsRows: document.querySelectorAll("#news-body .lv-row").length,
      advRows: document.querySelectorAll("#adv-body .lv-row").length,
      extLinksBad: [...document.querySelectorAll("#outages a")].filter((a) => !(a.target === "_blank" && /noopener/.test(a.rel) && /^https:\/\//.test(a.href))).map((a) => a.href),
      credit: document.querySelector(".lv-out-credit")?.href,
      hscroll: document.documentElement.scrollWidth > window.innerWidth,
      tkItems: document.querySelectorAll("#outTickerTrack .lv-out-tk-svc:not(.lv-out-tk-dup)").length,
      tkNews: [...document.querySelectorAll("#outTickerTrack .lv-out-tk-news:not(.lv-out-tk-dup)")].map((a) => ({ src: a.querySelector(".lv-out-tk-src").textContent, title: a.querySelector(".lv-out-tk-hl").textContent, href: a.href, newTab: a.target === "_blank" && /noopener/.test(a.rel) })),
      tkSequence: [...document.querySelectorAll("#outTickerTrack .lv-out-tk-item:not(.lv-out-tk-dup)")].map((a) => a.classList.contains("lv-out-tk-news") ? "NEWS" : a.querySelector(".lv-out-tk-st").textContent),
      tkDups: document.querySelectorAll("#outTickerTrack .lv-out-tk-dup").length,
      tkOrder: [...document.querySelectorAll("#outTickerTrack .lv-out-tk-svc:not(.lv-out-tk-dup)")].map((a) => a.querySelector(".lv-out-tk-name").textContent + "=" + a.querySelector(".lv-out-tk-st").textContent),
      tkLinksOk: [...document.querySelectorAll("#outTickerTrack a.lv-out-tk-svc")].every((a) => a.target === "_blank" && /noopener/.test(a.rel) && /^https:\/\/status-pages\.com\//.test(a.href)) && [...document.querySelectorAll("#outTickerTrack a")].every((a) => /^https?:\/\//.test(a.href) && a.target === "_blank"),
      tkAnim: getComputedStyle(document.getElementById("outTickerTrack")).animationName,
      tickerBelowHeading: (() => { const h = document.getElementById("outages-title").getBoundingClientRect(), t = document.getElementById("out-ticker").getBoundingClientRect(); return t.top >= h.bottom - 1; })(),
    }));
    info.status = r.status(); info.cspHeader = (r.headers()["content-security-policy"] || "").slice(0, 60); info.errors = errs;
    res[name] = info;
    // Hover pauses the ticker
    await pg.hover("#out-ticker");
    info.tkPausedOnHover = await pg.evaluate(() => getComputedStyle(document.getElementById("outTickerTrack")).animationPlayState);
    await pg.mouse.move(0, 0);
    await pg.focus("#outTickerTrack a");
    info.tkPausedOnFocus = await pg.evaluate(() => getComputedStyle(document.getElementById("outTickerTrack")).animationPlayState);
    await pg.evaluate(() => document.activeElement.blur());
    await pg.screenshot({ path: `${SHOTS}/${name}-full.png`, fullPage: true });
    // Page-coordinate crops on a full-page capture: the sticky news ticker stays at the top of the page, so it cannot overlap.
    const box = await pg.evaluate(() => { const s = document.getElementById("outages").getBoundingClientRect(), t = document.getElementById("out-ticker").getBoundingClientRect(), y = window.scrollY;
      return { x: 0, y: s.top + y, w: document.documentElement.clientWidth, h: s.height, th: t.bottom - s.top + 70 }; });
    await pg.screenshot({ path: `${SHOTS}/${name}-outages-section.png`, fullPage: true, clip: { x: 0, y: box.y, width: box.w, height: box.h } });
    await pg.screenshot({ path: `${SHOTS}/${name}-heading-ticker.png`, fullPage: true, clip: { x: 0, y: box.y, width: box.w, height: box.th } });
    // In-viewport check after jumping to #outages: heading must sit below the sticky news ticker.
    await pg.goto(U + "#outages", { waitUntil: "networkidle" });
    await pg.waitForSelector("#outTickerTrack a", { timeout: 20000 });
    await pg.evaluate(() => document.getElementById("outages").scrollIntoView({ block: "start" }));
    await pg.waitForTimeout(500);
    info.headingClearOfNewsTicker = await pg.evaluate(() => document.getElementById("outages-title").getBoundingClientRect().top >= document.getElementById("ticker").getBoundingClientRect().bottom);
    await pg.screenshot({ path: `${SHOTS}/${name}-viewport-at-outages.png` });
    await ctx.close();
  }
  // Failure mode: API down -> 'Status unavailable', news still works
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const pg = await ctx.newPage();
  await pg.route("**/api/outages", (r) => r.fulfill({ status: 500, body: "x" }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#out-body .lv-note", { timeout: 20000 });
  res.apiDown = await pg.evaluate(() => ({ note: document.querySelector("#out-body .lv-note").textContent, ticker: document.getElementById("outTickerTrack").textContent, newsRows: document.querySelectorAll("#news-body .lv-row").length }));
  // Upstream down (API returns its clean unavailable payload)
  await pg.unroute("**/api/outages");
  await pg.route("**/api/outages", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: false, error: "Status unavailable", ticker: [], categories: [] }) }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#out-body .lv-note", { timeout: 20000 });
  res.upstreamDownNote = 1;
  res.upstreamDown = await pg.evaluate(() => ({ note: document.querySelector("#out-body .lv-note").textContent, ticker: document.getElementById("outTickerTrack").textContent, newsRows: document.querySelectorAll("#news-body .lv-row").length }));
  // Status down but headlines available: 'Status unavailable' first, then the headlines
  await pg.unroute("**/api/outages");
  await pg.route("**/api/outages", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: false, error: "Status unavailable", ticker: [], categories: [], news: [{ title: "Example outage headline", source: "BBC", url: "https://www.bbc.co.uk/news/x", date: new Date().toISOString() }] }) }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#outTickerTrack .lv-out-tk-news", { timeout: 20000 });
  res.statusDownNewsUp = await pg.evaluate(() => ({ first: document.querySelector("#outTickerTrack .lv-out-tk-item").textContent, news: document.querySelectorAll("#outTickerTrack .lv-out-tk-news:not(.lv-out-tk-dup)").length, body: document.querySelector("#out-body .lv-note").textContent }));
  // Status fine, no headlines: no NEWS items at all (no filler)
  await pg.unroute("**/api/outages");
  await pg.route("**/api/outages", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: true, updated: new Date().toISOString(), news: [], ticker: [{ name: "EE", category: "mobile", state: "ok", link: "https://status-pages.com/mobile/ee" }], categories: [{ id: "mobile", label: "Mobile networks", available: true, total: 1, ok: 1, unknown: 0, link: "https://status-pages.com/mobile", okNames: ["EE"], problems: [] }] }) }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#outTickerTrack .lv-out-tk-svc", { timeout: 20000 });
  res.noNews = await pg.evaluate(() => ({ newsItems: document.querySelectorAll("#outTickerTrack .lv-out-tk-news").length, svc: document.querySelectorAll("#outTickerTrack .lv-out-tk-svc:not(.lv-out-tk-dup)").length }));
  // Hostile payload rendering check
  await pg.unroute("**/api/outages");
  await pg.route("**/api/outages", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: true, updated: new Date().toISOString(), news: [{ title: "<img src=x onerror=window.__pwn=1>Bad", source: "<script>window.__pwn=1</script>", url: "javascript:window.__pwn=1" }, { title: "x", source: "y", url: "https://ok.example/\" onmouseover=\"window.__pwn=1" }], ticker: [{ name: "<img src=x onerror=window.__pwn=1>T", state: '"><svg onload=window.__pwn=1>', link: "javascript:window.__pwn=1" }], categories: [{ id: "x", label: "<img src=x onerror=window.__pwn=1>", available: true, total: 1, ok: 0, unknown: 0, link: "javascript:window.__pwn=1", okNames: ["<b>x</b>"], problems: [{ name: "<script>window.__pwn=1</script>", status: '"><img src=x onerror=window.__pwn=1>', summary: "<svg onload=window.__pwn=1>", reportLevel: "spike", link: "javascript:window.__pwn=1", official: "https://ok.example/\"onmouseover=\"window.__pwn=1" }] }] }) }));
  await pg.goto(U, { waitUntil: "networkidle" });
  await pg.waitForSelector("#out-body .lv-out-card", { timeout: 20000 });
  await pg.waitForSelector("#outTickerTrack .lv-out-tk-name", { timeout: 20000 });
  res.hostile = await pg.evaluate(() => ({ pwned: !!window.__pwn, imgs: document.querySelectorAll("#outages img, #outages script, #outages svg:not(.lv-panel-head svg)").length, tk: document.getElementById("outTickerTrack").textContent.slice(0, 80), tkState: document.querySelector("#outTickerTrack .lv-out-tk-st").textContent, jsLinks: [...document.querySelectorAll("#outages a")].filter((a) => /^javascript:/i.test(a.getAttribute("href"))).length, links: [...document.querySelectorAll("#out-body a")].map((a) => a.getAttribute("href")) }));
  // Reduced motion: static wrap, one copy, no animation
  const rctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const rp = await rctx.newPage();
  await rp.goto(U, { waitUntil: "networkidle" });
  await rp.waitForSelector("#outTickerTrack a", { timeout: 20000 });
  res.reducedMotion = await rp.evaluate(() => ({ sequence: [...document.querySelectorAll("#outTickerTrack .lv-out-tk-item")].map((a) => a.classList.contains("lv-out-tk-news") ? "NEWS" : a.querySelector(".lv-out-tk-st").textContent).join(","), anim: getComputedStyle(document.getElementById("outTickerTrack")).animationName, dups: document.querySelectorAll(".lv-out-tk-dup").length, items: document.querySelectorAll("#outTickerTrack .lv-out-tk-item").length, wrap: getComputedStyle(document.getElementById("outTickerTrack")).flexWrap }));
  await rp.locator("#out-ticker").screenshot({ path: `${SHOTS}/mobile-reduced-motion-ticker.png` });
  const rd = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rdp = await rd.newPage();
  await rdp.goto(U, { waitUntil: "networkidle" });
  await rdp.waitForSelector("#outTickerTrack a", { timeout: 20000 });
  const bx = await rdp.evaluate(() => { const s = document.getElementById("outages").getBoundingClientRect(), t = document.getElementById("out-ticker").getBoundingClientRect(); return { y: s.top + scrollY, h: t.bottom - s.top + 70, w: document.documentElement.clientWidth }; });
  await rdp.screenshot({ path: `${SHOTS}/desktop-reduced-motion-heading-ticker.png`, fullPage: true, clip: { x: 0, y: bx.y, width: bx.w, height: bx.h } });
  const rbx = await rp.evaluate(() => { const s = document.getElementById("outages").getBoundingClientRect(), t = document.getElementById("out-ticker").getBoundingClientRect(); return { y: s.top + scrollY, h: t.bottom - s.top + 70, w: document.documentElement.clientWidth }; });
  await rp.screenshot({ path: `${SHOTS}/mobile-reduced-motion-heading-ticker.png`, fullPage: true, clip: { x: 0, y: rbx.y, width: rbx.w, height: rbx.h } });
  await b.close();
  console.log(JSON.stringify(res, null, 1));
})();
