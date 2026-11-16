const { chromium } = require("playwright-core");
const B = (process.env.B || "http://127.0.0.1:33775").replace(/\/$/, "");
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const TAG = process.env.TAG || "local";
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const out = {};
  for (const page of ["ministerial", "non-ministerial"]) {
    for (const [name, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
      const key = `${page}-${name}`;
      const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text()); });
      pg.on("pageerror", (e) => errs.push("pageerror " + e.message));
      const r = await pg.goto(`${B}/govmap/${page}/`, { waitUntil: "networkidle" });
      await pg.waitForSelector("#gm-dept-list button");
      await pg.waitForTimeout(800);
      const R = (o) => (out[key] = Object.assign(out[key] || {}, o));
      R({ status: r.status(), csp: !!r.headers()["content-security-policy"] });
      R(await pg.evaluate(() => ({
        stats: [...document.querySelectorAll("#gm-chart-stats .gm-stat")].map((d) => d.textContent.replace(/\s+/g, " ").trim()),
        legend: document.querySelectorAll("#gm-legend li").length,
        depts: document.querySelectorAll("#gm-dept-list button").length,
        tabs: [...document.querySelectorAll(".gm-tabs a")].map((a) => a.textContent + (a.getAttribute("aria-current") ? "*" : "")).join(" | "),
        canvas: (() => { const c = document.getElementById("gm-canvas"); return c.clientWidth + "x" + c.clientHeight; })(),
        hscroll: document.documentElement.scrollWidth > window.innerWidth,
        credit: document.getElementById("gm-credit").textContent.slice(0, 60),
      })));
      const cv = pg.locator("#gm-canvas");
      const a1 = await cv.screenshot();
      await pg.waitForTimeout(700);
      const a2 = await cv.screenshot();
      R({ animating: !a1.equals(a2) });
      await pg.screenshot({ path: `${SHOTS}/chart-${TAG}-${key}-overview.png`, fullPage: false });
      await cv.screenshot({ path: `${SHOTS}/chart-${TAG}-${key}-canvas.png` });
      // keyboard: focus canvas, arrow to a department -> tooltip
      await cv.focus();
      await pg.keyboard.press("ArrowRight");
      await pg.keyboard.press("ArrowRight");
      await pg.waitForTimeout(250);
      R({ kbTip: await pg.evaluate(() => { const t = document.getElementById("gm-tip"); return t.hidden ? null : t.textContent; }), kbStatus: await pg.textContent("#gm-chart-status") });
      if (!mobile) await cv.screenshot({ path: `${SHOTS}/chart-${TAG}-${key}-hover.png` });
      await pg.keyboard.press("Enter");
      await pg.waitForTimeout(1400);
      R({ panel: (await pg.textContent("#gm-panel")).slice(0, 120), panelLinks: await pg.$$eval("#gm-panel a", (as) => as.every((a) => a.target === "_blank" && /noopener/.test(a.rel) && /^https:\/\/www\.gov\.uk\//.test(a.href)) + " n=" + as.length) });
      await cv.screenshot({ path: `${SHOTS}/chart-${TAG}-${key}-focus.png` });
      // keyboard into a body then Enter -> popup to gov.uk
      await pg.keyboard.press("ArrowRight");
      await pg.waitForTimeout(150);
      const nb = await pg.$$eval("#gm-panel li", (l) => l.length);
      if (nb) {
        const [pop] = await Promise.all([ctx.waitForEvent("page", { timeout: 8000 }).catch(() => null), pg.keyboard.press("Enter")]);
        R({ popup: pop ? pop.url() : null });
        if (pop) await pop.close();
      }
      await pg.keyboard.press("Escape");
      await pg.waitForTimeout(1200);
      R({ afterEsc: await pg.textContent("#gm-chart-status") });
      // search
      const q = page === "ministerial" ? "Met Office" : "Ofsted";
      await pg.fill("#gm-find", q);
      await pg.press("#gm-find", "Enter");
      await pg.waitForTimeout(1500);
      R({ find: await pg.textContent("#gm-chart-status") });
      await cv.screenshot({ path: `${SHOTS}/chart-${TAG}-${key}-find.png` });
      // mouse: click a department from list button, then click a body dot on the canvas
      await pg.click("#gm-reset");
      await pg.waitForTimeout(1200);
      await pg.locator("#gm-dept-list button").nth(page === "ministerial" ? 13 : 3).click();
      await pg.waitForTimeout(1500);
      R({ listFocus: (await pg.textContent("#gm-chart-status")).slice(0, 80) });
      if (!mobile) {
        const box = await cv.boundingBox();
        const n = await pg.$$eval("#gm-panel li", (l) => l.length);
        if (n) {
          const S = Math.min(box.width, box.height), ring = n > 14 ? 0.33 : 0.38;
          const x = box.x + box.width / 2, y = box.y + box.height / 2 - S * ring * 0.92;
          await pg.mouse.move(x, y);
          await pg.waitForTimeout(200);
          R({ mouseTip: await pg.evaluate(() => { const t = document.getElementById("gm-tip"); return t.hidden ? null : t.textContent.slice(0, 80); }) });
          const [pop] = await Promise.all([ctx.waitForEvent("page", { timeout: 8000 }).catch(() => null), pg.mouse.click(x, y)]);
          R({ mousePopup: pop ? pop.url() : null });
          if (pop) await pop.close();
        }
      }
      // tab order sanity
      R({ hscrollEnd: await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth) });
      await pg.screenshot({ path: `${SHOTS}/chart-${TAG}-${key}-full.png`, fullPage: true });
      R({ errors: errs });
      await ctx.close();
    }
  }
  // reduced motion
  for (const page of ["ministerial", "non-ministerial"]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: "reduce" });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    await pg.goto(`${B}/govmap/${page}/`, { waitUntil: "networkidle" });
    await pg.waitForSelector("#gm-dept-list button");
    await pg.waitForTimeout(600);
    const cv = pg.locator("#gm-canvas");
    const a1 = await cv.screenshot(); await pg.waitForTimeout(900); const a2 = await cv.screenshot();
    await cv.screenshot({ path: `${SHOTS}/chart-${TAG}-${page}-reduced.png` });
    out[`${page}-reduced`] = { static: a1.equals(a2), pauseLabel: await pg.textContent("#gm-pause"), errors: errs };
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
