const { chromium } = require("playwright-core");
const B = (process.env.B || "http://127.0.0.1:33775").replace(/\/$/, "");
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
    await pg.goto(B + "/govmap/", { waitUntil: "networkidle" });
    await pg.waitForSelector("#gm-tree .gm-dept");
    const st = () => pg.evaluate(() => ({
      pressed: [...document.querySelectorAll("#gm-stats button")].map((b) => b.dataset.card + "=" + b.getAttribute("aria-pressed")).join(" "),
      scope: document.getElementById("gm-scope").value, type: document.getElementById("gm-types").value,
      badge: document.getElementById("gm-filter-badge").hidden ? null : document.getElementById("gm-filter-badge").textContent,
      clear: !document.getElementById("gm-clear").hidden, count: document.getElementById("gm-count").textContent,
      roots: document.querySelectorAll("#gm-tree .gm-dept").length,
      expanded: document.querySelectorAll("#gm-tree .gm-dept-h .gm-toggle[aria-expanded='true']").length,
      visibleBodies: [...document.querySelectorAll("#gm-tree .gm-body")].filter((e) => e.offsetParent).length,
      url: location.search, scrollY: Math.round(scrollY), hscroll: document.documentElement.scrollWidth > innerWidth,
    }));
    const R = {}; out[name] = R;
    R.initial = await st();
    await pg.click("#gm-stats button[data-card='min']"); await pg.waitForTimeout(700);
    R.min = await st();
    await pg.evaluate(() => window.scrollTo(0, document.getElementById("gm-stats").getBoundingClientRect().top + scrollY - 10)); await pg.waitForTimeout(200);
    await pg.screenshot({ path: `${SHOTS}/totals-${name}-active.png` });
    await pg.click("#gm-stats button[data-card='min']"); await pg.waitForTimeout(400);
    R.minAgain = await st();
    await pg.click("#gm-stats button[data-card='bodies']"); await pg.waitForTimeout(700);
    R.bodies = await st();
    if (mobile) await pg.click("#gm-filter-toggle");
    await pg.selectOption("#gm-scope", "dev"); await pg.waitForTimeout(200);
    R.dropdownDev = await st();
    await pg.click("#gm-clear"); await pg.waitForTimeout(200);
    R.cleared = await st();
    await pg.click("#gm-stats button[data-card='nmd']"); await pg.waitForTimeout(300);
    await pg.selectOption("#gm-types", "ea"); await pg.waitForTimeout(200);
    R.nmdThenType = await st();
    // keyboard
    await pg.click("#gm-clear");
    await pg.focus("#gm-stats button[data-card='dev']"); await pg.keyboard.press("Enter"); await pg.waitForTimeout(300);
    R.kbDev = await st();
    // URL params
    await pg.goto(B + "/govmap/?show=non-ministerial&type=ea", { waitUntil: "networkidle" }); await pg.waitForSelector("#gm-tree .gm-dept");
    R.urlNmdEa = await st();
    await pg.goto(B + "/govmap/?show=ministerial&expand=1", { waitUntil: "networkidle" }); await pg.waitForSelector("#gm-tree .gm-dept");
    R.urlMinExpand = await st();
    await pg.goto(B + "/govmap/?show=<script>&type=zzz", { waitUntil: "networkidle" }); await pg.waitForSelector("#gm-tree .gm-dept");
    R.urlBad = await st();
    // chart page links
    await pg.goto(B + "/govmap/ministerial/", { waitUntil: "networkidle" }); await pg.waitForSelector("#gm-chart-stats .gm-stat");
    R.chartLinks = await pg.$$eval("#gm-chart-stats .gm-stat", (a) => a.map((x) => x.tagName + ":" + (x.getAttribute("href") || "-")).join(" "));
    await pg.click("#gm-chart-stats a >> nth=0"); await pg.waitForSelector("#gm-tree .gm-dept");
    R.fromChart = await st();
    R.errors = errs;
    await ctx.close();
  }
  // reduced motion scroll behaviour sanity
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  await pg.goto(B + "/govmap/", { waitUntil: "networkidle" }); await pg.waitForSelector("#gm-tree .gm-dept");
  await pg.click("#gm-stats button[data-card='nmd']");
  out.reducedScrollImmediate = await pg.evaluate(() => Math.round(scrollY));
  await ctx.close();
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
