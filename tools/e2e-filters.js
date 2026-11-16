const { chromium } = require("playwright-core");
const U = process.env.U || "http://127.0.0.1:33775/govmap/";
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const out = {};
  for (const [name, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text()); });
    pg.on("pageerror", (e) => errs.push("pageerror " + e.message));
    await pg.goto(U, { waitUntil: "networkidle" });
    await pg.waitForSelector("#gm-tree .gm-dept");
    const info = () => pg.evaluate(() => {
      const vis = (id) => { const e = document.getElementById(id); const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; };
      const depts = [...document.querySelectorAll("#gm-tree .gm-dept")];
      return {
        toggleVisible: vis("gm-filter-toggle"), toggleExpanded: document.getElementById("gm-filter-toggle").getAttribute("aria-expanded"),
        selectsVisible: vis("gm-scope") && vis("gm-types"),
        badge: document.getElementById("gm-filter-badge").hidden ? null : document.getElementById("gm-filter-badge").textContent,
        clearVisible: vis("gm-clear"), count: document.getElementById("gm-count").textContent,
        expandSameRow: Math.abs(document.getElementById("gm-expand").getBoundingClientRect().top - document.getElementById("gm-count").getBoundingClientRect().top) < 30,
        deptsInFirstScreen: depts.filter((d) => d.getBoundingClientRect().top < innerHeight).length,
        firstDeptTop: Math.round(depts[0].getBoundingClientRect().top),
        labels: [...document.querySelectorAll(".gm-select label")].map((l) => l.textContent + "->" + l.htmlFor).join(","),
        hscroll: document.documentElement.scrollWidth > innerWidth,
      };
    });
    out[name] = { initial: await info() };
    await pg.screenshot({ path: `${SHOTS}/filters-${name}.png` });
    if (mobile) { await pg.click("#gm-filter-toggle"); out[name].opened = await info(); }
    await pg.selectOption("#gm-scope", "min");
    await pg.selectOption("#gm-types", "ea");
    await pg.waitForTimeout(200);
    out[name].filtered = await info();
    if (mobile) { await pg.evaluate(() => window.scrollTo(0, document.getElementById("gm-form").getBoundingClientRect().top + scrollY - 12)); await pg.waitForTimeout(150); await pg.screenshot({ path: `${SHOTS}/filters-mobile-open.png` }); await pg.evaluate(() => window.scrollTo(0, 0)); }
    // keyboard: focus types select and change with keyboard
    await pg.click("#gm-clear");
    await pg.waitForTimeout(150);
    out[name].cleared = await info();
    out[name].focusAfterClear = await pg.evaluate(() => document.activeElement.id);
    await pg.click("#gm-expand"); await pg.waitForTimeout(150);
    out[name].expanded = await pg.evaluate(() => document.querySelectorAll("#gm-tree .gm-dept-h .gm-toggle[aria-expanded='true']").length);
    await pg.click("#gm-collapse"); await pg.waitForTimeout(150);
    out[name].collapsed = await pg.evaluate(() => document.querySelectorAll("#gm-tree .gm-dept-h .gm-toggle[aria-expanded='true']").length);
    if (mobile) { await pg.click("#gm-filter-toggle"); out[name].reclosed = (await info()).selectsVisible; }
    out[name].errors = errs;
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
