const { chromium } = require("playwright-core");
const U = process.env.U || "http://127.0.0.1:8765/govmap/";
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const TAG = process.env.TAG || "local";
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const out = {};
  for (const [name, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text()); });
    pg.on("pageerror", (e) => errs.push("pageerror " + e.message));
    const r = await pg.goto(U, { waitUntil: "networkidle" });
    await pg.waitForSelector("#gm-tree .gm-dept");
    const R = (o) => (out[name] = Object.assign(out[name] || {}, o));
    R({ status: r.status(), csp: r.headers()["content-security-policy"] });
    R(await pg.evaluate(() => ({
      stats: [...document.querySelectorAll("#gm-stats .gm-stat")].map((d) => d.textContent.replace(/\s+/g, " ").trim()),
      roots: document.querySelectorAll("#gm-tree .gm-dept").length,
      count: document.getElementById("gm-count").textContent,
      credit: document.getElementById("gm-credit").textContent,
      creditLinks: [...document.querySelectorAll("#gm-credit a")].map((a) => a.href + " " + a.target + " " + a.rel),
      chips: [...document.querySelectorAll("#gm-types option")].map((b) => b.textContent).join(" | "),
      hscroll: document.documentElement.scrollWidth > window.innerWidth,
    })));
    await pg.screenshot({ path: `${SHOTS}/${TAG}-${name}-top.png` });
    // keyboard: focus first department toggle and press Enter
    const first = pg.locator("#gm-tree .gm-dept-h .gm-toggle").first();
    await first.focus(); await pg.keyboard.press("Enter");
    R({ kbExpanded: await first.getAttribute("aria-expanded"), firstDeptBodies: await pg.locator("#gm-tree .gm-dept").first().locator(".gm-body").count() });
    await pg.keyboard.press("Space");
    R({ kbCollapsed: await first.getAttribute("aria-expanded") });
    // open MOD
    const mod = pg.locator(".gm-dept").filter({ has: pg.locator(".gm-dept-name", { hasText: /^Ministry of Defence$/ }) }).locator(".gm-dept-h .gm-toggle");
    await mod.click();
    R({ modOpen: await mod.getAttribute("aria-expanded"), modHscroll: await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth) });
    await mod.scrollIntoViewIfNeeded();
    const modBox = await pg.locator(".gm-dept").filter({ has: pg.locator(".gm-dept-name", { hasText: /^Ministry of Defence$/ }) }).boundingBox();
    await pg.screenshot({ path: `${SHOTS}/${TAG}-${name}-mod.png`, fullPage: true, clip: { x: 0, y: Math.max(0, modBox.y + (await pg.evaluate(() => scrollY)) - 10), width: vp.width, height: Math.min(modBox.height + 20, 2400) } });
    // search
    await pg.fill("#gm-search", "dvla");
    await pg.waitForTimeout(400);
    R(await pg.evaluate(() => ({
      searchDvla: document.getElementById("gm-count").textContent,
      dvlaHits: [...document.querySelectorAll("#gm-tree .gm-body")].map((li) => li.querySelector(".gm-name").textContent + " / " + li.closest(".gm-dept").querySelector(".gm-dept-name").textContent),
      dvlaExpanded: [...document.querySelectorAll("#gm-tree .gm-dept-h .gm-toggle")].map((b) => b.getAttribute("aria-expanded")).join(","),
      marks: document.querySelectorAll("#gm-tree mark").length,
    })));
    await pg.fill("#gm-search", "cyber");
    await pg.waitForTimeout(400);
    R(await pg.evaluate(() => ({ searchCyber: document.getElementById("gm-count").textContent,
      cyberHits: [...document.querySelectorAll("#gm-tree .gm-body")].map((li) => li.querySelector(".gm-name").textContent + " [" + li.querySelector(".gm-meta").textContent.replace(/\s+/g, " ").trim() + "]").slice(0, 8) })));
    await pg.screenshot({ path: `${SHOTS}/${TAG}-${name}-search-cyber.png`, fullPage: true });
    // XSS-ish search input stays text
    await pg.fill("#gm-search", "<img src=x onerror=alert(1)>");
    await pg.waitForTimeout(300);
    R({ xssEmpty: await pg.locator("#gm-tree .gm-empty").textContent(), imgs: await pg.locator("#gm-tree img").count() });
    // filters
    await pg.fill("#gm-search", "");
    if (await pg.isVisible("#gm-filter-toggle")) await pg.click("#gm-filter-toggle");
    await pg.selectOption("#gm-types", "ea");
    await pg.waitForTimeout(200);
    R(await pg.evaluate(() => ({ eaFilter: document.getElementById("gm-count").textContent, eaPressed: document.getElementById("gm-types").value + " badge=" + document.getElementById("gm-filter-badge").textContent })));
    await pg.selectOption("#gm-types", "all");
    await pg.selectOption("#gm-scope", "nmd");
    await pg.waitForTimeout(200);
    R(await pg.evaluate(() => ({ nmdScope: document.getElementById("gm-count").textContent + " roots=" + document.querySelectorAll("#gm-tree .gm-dept").length })));
    await pg.selectOption("#gm-scope", "none");
    await pg.click("#gm-expand");
    await pg.waitForTimeout(200);
    R(await pg.evaluate(() => ({ unattached: document.querySelectorAll("#gm-tree .gm-body").length })));
    await pg.selectOption("#gm-scope", "dev");
    await pg.click("#gm-expand");
    R(await pg.evaluate(() => ({ devolved: [...document.querySelectorAll("#gm-tree .gm-dept")].map((d) => d.querySelector(".gm-dept-name").textContent + ":" + d.querySelectorAll(".gm-body").length).join(", ") })));
    await pg.screenshot({ path: `${SHOTS}/${TAG}-${name}-devolved.png`, fullPage: true });
    await pg.click("#gm-clear");
    await pg.click("#gm-expand");
    await pg.waitForTimeout(300);
    R(await pg.evaluate(() => {
      const links = [...document.querySelectorAll("#gm-tree a")];
      return { allLinks: links.length, linksOk: links.every((a) => a.target === "_blank" && /noopener/.test(a.rel) && /^https:\/\/www\.gov\.uk\/government\/organisations\/[a-z0-9-]+$/.test(a.href)),
        bodiesExpanded: document.querySelectorAll("#gm-tree .gm-body").length, hscrollAll: document.documentElement.scrollWidth > window.innerWidth,
        wideEls: [...document.querySelectorAll("#gm-tree *")].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 3).map((e) => e.className) };
    }));
    R({ errors: errs });
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
