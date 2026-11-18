// Browser checks for the CISA alerts panel. Run:
//   B=https://preview-host SHOTS=/path/to/shots node tools/e2e-cisa-alerts.js
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const U = (process.env.B || process.env.U || "https://www.govassured.com/").replace(/\/?$/, "/");
const SHOTS = process.env.SHOTS || path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

function fail(errors, cond, msg) {
  if (!cond) errors.push(msg);
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const res = { url: U };
  let failed = 0;

  for (const [name, vp, mobile] of [
    ["desktop", { width: 1440, height: 900 }, false],
    ["mobile", { width: 390, height: 844 }, true],
  ]) {
    const ctx = await b.newContext({
      viewport: vp,
      isMobile: mobile,
      hasTouch: mobile,
      deviceScaleFactor: mobile ? 2 : 1,
      timezoneId: "Europe/London",
      locale: "en-GB",
    });
    const pg = await ctx.newPage();
    const errors = [];
    const consoleErrors = [];
    pg.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    pg.on("pageerror", (e) => errors.push("pageerror " + e.message));

    const r = await pg.goto(U, { waitUntil: "networkidle", timeout: 45000 });
    await pg.waitForSelector("#cisa-body .lv-row, #cisa-body .lv-note", { timeout: 25000 });
    await pg.waitForSelector("#kev-body .lv-row, #kev-body .lv-note", { timeout: 25000 });

    const info = await pg.evaluate(() => {
      const rows = [...document.querySelectorAll("#cisa-body .lv-row")];
      const visible = rows.filter((row) => !row.closest("details"));
      const grid = document.querySelector(".lv-dash-even");
      const cisa = document.getElementById("cisa-body");
      const threats = document.getElementById("threats");
      const panel = cisa && cisa.closest(".lv-panel");
      const kevPanel = document.getElementById("kev-body") && document.getElementById("kev-body").closest(".lv-panel");
      return {
        cisaRows: rows.length,
        visibleRows: visible.length,
        more: document.querySelector("#cisa-body .lv-more summary")?.textContent || null,
        titles: rows.map((row) => row.querySelector(".lv-r-title")?.textContent || ""),
        types: rows.map((row) => {
          const pills = [...row.querySelectorAll(".lv-r-top .lv-pill")];
          return pills[0]?.textContent || "";
        }),
        dates: rows.map((row) => row.querySelector(".lv-r-meta")?.textContent || ""),
        cves: rows.map((row) => [...row.querySelectorAll(".lv-cves .lv-pill")].map((p) => p.textContent)),
        links: rows.filter((row) => row.tagName === "A").map((a) => ({ href: a.getAttribute("href"), target: a.target, rel: a.rel })),
        badLinks: [...cisa.querySelectorAll("a")].filter((a) => !(a.target === "_blank" && /noopener/.test(a.rel) && /^https:\/\//.test(a.href))).map((a) => a.getAttribute("href")),
        gridCols: grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length : 0,
        dashPanels: document.querySelectorAll(".lv-dash-even > .lv-panel").length,
        cisaIsInGrid: !!(panel && grid && grid.contains(panel)),
        cisaBelowGrid: !!(panel && grid && panel.getBoundingClientRect().top >= grid.getBoundingClientRect().bottom - 1),
        hscroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        foot: document.getElementById("threats-foot")?.textContent || "",
        intro: document.querySelector("#threats .section-intro")?.textContent || "",
        java: rows.some((row) => /Java Vulnerability|Java4Shell|CVE-2026-114938/i.test(row.textContent)),
        kevWidth: kevPanel ? Math.round(kevPanel.getBoundingClientRect().width) : 0,
        cisaWidth: panel ? Math.round(panel.getBoundingClientRect().width) : 0,
      };
    });
    info.status = r.status();
    info.csp = r.headers()["content-security-policy"] || "";
    info.consoleErrors = consoleErrors;
    info.errors = errors;

    fail(errors, info.status === 200, "home status " + info.status);
    fail(errors, /default-src 'self'/.test(info.csp) && /connect-src 'self'/.test(info.csp), "csp " + info.csp);
    fail(errors, consoleErrors.length === 0, "console errors " + JSON.stringify(consoleErrors));
    fail(errors, info.dashPanels === 4, "2x2 grid panel count " + info.dashPanels);
    fail(errors, name === "desktop" ? info.gridCols === 2 : info.gridCols === 1, "grid cols " + info.gridCols + " on " + name);
    fail(errors, !info.cisaIsInGrid && info.cisaBelowGrid, "cisa panel should sit under the 2x2, not inside it");
    fail(errors, !info.hscroll, "horizontal scroll on " + name);
    fail(errors, info.cisaRows >= 1 && info.visibleRows <= 3, "row visibility " + info.visibleRows + "/" + info.cisaRows);
    fail(errors, info.java, "Java / CVE-2026-114938 alert missing from panel");
    fail(errors, info.links.every((a) => a.target === "_blank" && /noopener/.test(a.rel) && /^https:\/\/www\.cisa\.gov\//.test(a.href)), "unsafe or off-source CISA links " + JSON.stringify(info.links));
    fail(errors, info.badLinks.length === 0, "bad links " + JSON.stringify(info.badLinks));
    fail(errors, /CISA alerts and advisories/.test(info.foot), "footer missing CISA alerts source");
    fail(errors, /CISA alerts/.test(info.intro), "intro missing CISA alerts");
    fail(errors, info.types.includes("Alert"), "no Alert type pill");
    if (name === "desktop") fail(errors, info.cisaWidth > info.kevWidth, "cisa panel should be full width under the grid");

    await pg.evaluate(() => document.getElementById("threats").scrollIntoView({ block: "start" }));
    await pg.waitForTimeout(300);
    await pg.screenshot({ path: path.join(SHOTS, `${name}-threats-top.png`) });

    const box = await pg.evaluate(() => {
      const s = document.getElementById("threats").getBoundingClientRect();
      return { y: Math.max(0, s.top + scrollY), h: s.height, w: document.documentElement.clientWidth };
    });
    await pg.screenshot({ path: path.join(SHOTS, `${name}-threats-section.png`), fullPage: true, clip: { x: 0, y: box.y, width: box.w, height: Math.min(box.h, 2400) } });

    const cisaBox = await pg.evaluate(() => {
      const el = document.getElementById("cisa-body").closest(".lv-panel").getBoundingClientRect();
      return { y: Math.max(0, el.top + scrollY - 8), h: el.height + 16, w: document.documentElement.clientWidth };
    });
    await pg.screenshot({ path: path.join(SHOTS, `${name}-cisa-panel.png`), fullPage: true, clip: { x: 0, y: cisaBox.y, width: cisaBox.w, height: cisaBox.h } });

    if (await pg.$("#cisa-body .lv-more summary")) {
      await pg.click("#cisa-body .lv-more summary");
      await pg.waitForTimeout(200);
      info.expanded = await pg.evaluate(() => document.querySelector("#cisa-body details").open);
      fail(errors, info.expanded, "view all did not expand");
      const expandedBox = await pg.evaluate(() => {
        const el = document.getElementById("cisa-body").closest(".lv-panel").getBoundingClientRect();
        return { y: Math.max(0, el.top + scrollY - 8), h: el.height + 16, w: document.documentElement.clientWidth };
      });
      await pg.screenshot({ path: path.join(SHOTS, `${name}-cisa-panel-expanded.png`), fullPage: true, clip: { x: 0, y: expandedBox.y, width: expandedBox.w, height: expandedBox.h } });
    }

    await pg.screenshot({ path: path.join(SHOTS, `${name}-full.png`), fullPage: true });

    info.errors = errors;
    res[name] = info;
    if (errors.length) failed += errors.length;
    await ctx.close();
  }

  // Hostile payload: no XSS, no javascript: links
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: "Europe/London", locale: "en-GB" });
  const pg = await ctx.newPage();
  await pg.route("**/api/cisa-alerts", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      items: [
        { title: "<img src=x onerror=window.__pwn=1>Bad", type: "<script>window.__pwn=1</script>", url: "javascript:window.__pwn=1", date: "2026-11-17T12:00:00.000Z", cves: [{ id: "<svg onload=window.__pwn=1>", inKev: true }] },
        { title: "Safe item", type: "Alert", url: "https://www.cisa.gov/news-events/alerts/2026/11/17/ok", date: "2026-11-17T12:00:00.000Z", cves: [{ id: "CVE-2026-114938", inKev: false }] },
        { title: "ok", type: "Alert", url: "https://evil.example/\" onmouseover=\"window.__pwn=1", date: "2026-11-16T12:00:00.000Z", cves: [] },
      ],
    }),
  }));
  await pg.goto(U, { waitUntil: "networkidle", timeout: 45000 });
  await pg.waitForSelector("#cisa-body .lv-row, #cisa-body .lv-note", { timeout: 20000 });
  await pg.waitForTimeout(400);
  res.hostile = await pg.evaluate(() => ({
    pwned: !!window.__pwn,
    injected: document.querySelectorAll("#cisa-body img, #cisa-body script, #cisa-body svg").length,
    jsLinks: [...document.querySelectorAll("#cisa-body a")].filter((a) => /^javascript:/i.test(a.getAttribute("href") || "")).length,
    text: document.getElementById("cisa-body").textContent,
    hrefs: [...document.querySelectorAll("#cisa-body a")].map((a) => a.getAttribute("href")),
  }));
  const hErr = [];
  fail(hErr, !res.hostile.pwned, "hostile payload executed script");
  fail(hErr, res.hostile.injected === 0, "hostile markup injected " + res.hostile.injected);
  fail(hErr, res.hostile.jsLinks === 0, "javascript: link rendered");
  fail(hErr, res.hostile.hrefs.every((h) => !h || /^https:\/\//.test(h)), "non-https href " + JSON.stringify(res.hostile.hrefs));
  fail(hErr, /CVE-2026-114938/.test(res.hostile.text), "safe item missing after hostile route");
  res.hostile.errors = hErr;
  if (hErr.length) failed += hErr.length;
  await pg.screenshot({ path: path.join(SHOTS, "desktop-cisa-hostile.png") });

  // API down
  await pg.unroute("**/api/cisa-alerts");
  await pg.route("**/api/cisa-alerts", (route) => route.fulfill({ status: 500, body: "x" }));
  await pg.goto(U, { waitUntil: "networkidle", timeout: 45000 });
  await pg.waitForSelector("#cisa-body .lv-note", { timeout: 20000 });
  res.apiDown = await pg.evaluate(() => document.querySelector("#cisa-body .lv-note")?.textContent || "");
  if (!/unavailable/i.test(res.apiDown)) {
    failed++;
    res.apiDownError = "expected unavailable note, got " + res.apiDown;
  }
  await b.close();

  res.failed = failed;
  console.log(JSON.stringify(res, null, 2));
  if (failed) process.exit(1);
})();
