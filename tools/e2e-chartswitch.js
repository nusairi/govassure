const { chromium } = require("playwright-core");
const B = (process.env.B || "http://127.0.0.1:33778").replace(/\/$/, "");
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const TAG = process.env.TAG || "cabinet-";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const out = {};
  const views = [
    ["phone360", { width: 360, height: 800 }, true],
    ["phone390", { width: 390, height: 844 }, true],
    ["desktop", { width: 1440, height: 900 }, false],
  ];
  for (const [name, vp, mobile] of views) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    const errors = [];
    pg.on("pageerror", (e) => errors.push("pageerror " + e.message));
    pg.on("console", (m) => { if (m.type() === "error") errors.push("console " + m.text()); });
    const rec = {};
    out[name] = rec;

    // deep link org
    let r = await pg.goto(B + "/govmap/ministerial/?dept=cabinet-office&view=org", { waitUntil: "networkidle" });
    await pg.waitForSelector(".gm-dg-svg, .gm-org .gm-dv-dg", { timeout: 10000 });
    await pg.waitForTimeout(800);
    rec.orgLink = {
      status: r.status(),
      csp: (r.headers()["content-security-policy"] || "").slice(0, 80),
      url: pg.url().replace(B, ""),
      toggle: await pg.locator(".gm-chart-switch").isVisible(),
      pressed: await pg.locator(".gm-chart-switch .gm-seg-b[aria-pressed=true]").innerText().catch(() => ""),
      hasOrg: await pg.evaluate(() => !!document.querySelector(".gm-org:not([hidden]) .gm-dg-svg, .gm-org:not([hidden]) .gm-dg-vert, .gm-stage-org .gm-dg-svg")),
      canvasHidden: await pg.evaluate(() => document.getElementById("gm-canvas").hasAttribute("hidden")),
      heading: (await pg.locator("#gm-panel .gm-panel-h").innerText().catch(() => "")).replace(/\s+/g, " "),
      nodes: await pg.locator(".gm-org .gm-dg-node").count(),
      vert: await pg.evaluate(() => !!document.querySelector(".gm-org .gm-dg-vert")),
      hscroll: await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    };
    await pg.screenshot({ path: `${SHOTS}/${TAG}org-${name}.png`, fullPage: true });

    // switch to circle
    await pg.locator(".gm-chart-switch .gm-seg-b >> text=Circle").click();
    await pg.waitForTimeout(700);
    rec.afterCircle = {
      url: pg.url().replace(B, ""),
      pressed: await pg.locator(".gm-chart-switch .gm-seg-b[aria-pressed=true]").innerText().catch(() => ""),
      canvasHidden: await pg.evaluate(() => document.getElementById("gm-canvas").hasAttribute("hidden")),
      orgHidden: await pg.evaluate(() => document.getElementById("gm-org").hidden),
      hscroll: await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    };
    await pg.evaluate(() => { const s = document.querySelector("#gm-stage"); if (s) { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 12); } });
    await pg.waitForTimeout(200);
    await pg.screenshot({ path: `${SHOTS}/${TAG}circle-${name}.png`, fullPage: false });

    // switch back to org via button
    await pg.locator(".gm-chart-switch .gm-seg-b >> text=Org chart").click();
    await pg.waitForSelector(".gm-org:not([hidden]) .gm-dg-svg", { timeout: 8000 });
    rec.afterOrg = {
      url: pg.url().replace(B, ""),
      pressed: await pg.locator(".gm-chart-switch .gm-seg-b[aria-pressed=true]").innerText().catch(() => ""),
      nodes: await pg.locator(".gm-org .gm-dg-node").count(),
    };

    // circle deep link (no view=org)
    r = await pg.goto(B + "/govmap/ministerial/?dept=cabinet-office", { waitUntil: "networkidle" });
    await pg.waitForTimeout(700);
    rec.circleLink = {
      status: r.status(),
      url: pg.url().replace(B, ""),
      canvasHidden: await pg.evaluate(() => document.getElementById("gm-canvas").hasAttribute("hidden")),
      toggle: await pg.locator(".gm-chart-switch").isVisible(),
      pressed: await pg.locator(".gm-chart-switch .gm-seg-b[aria-pressed=true]").innerText().catch(() => ""),
      hscroll: await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    };

    // overview circle: toggle still visible
    await pg.goto(B + "/govmap/ministerial/", { waitUntil: "networkidle" });
    await pg.waitForTimeout(400);
    rec.overviewCircle = {
      toggleVisible: await pg.locator(".gm-chart-switch").isVisible(),
      pressed: await pg.locator(".gm-chart-switch .gm-seg-b[aria-pressed=true]").innerText().catch(() => ""),
      url: pg.url().replace(B, ""),
    };
    if (!rec.overviewCircle.toggleVisible) errors.push("overview circle toggle hidden");

    // overview org deep link
    r = await pg.goto(B + "/govmap/ministerial/?view=org", { waitUntil: "networkidle" });
    await pg.waitForSelector(".gm-org .gm-dg-ov .gm-dg-svg, .gm-org [data-overview='1'] .gm-dg-svg", { timeout: 10000 });
    await pg.waitForTimeout(800);
    rec.overviewOrg = {
      status: r.status(),
      url: pg.url().replace(B, ""),
      toggle: await pg.locator(".gm-chart-switch").isVisible(),
      pressed: await pg.locator(".gm-chart-switch .gm-seg-b[aria-pressed=true]").innerText().catch(() => ""),
      hasOverview: await pg.evaluate(() => !!document.querySelector(".gm-org [data-overview='1'] .gm-dg-svg")),
      canvasHidden: await pg.evaluate(() => document.getElementById("gm-canvas").hasAttribute("hidden")),
      nodes: await pg.locator(".gm-org .gm-dg-node").count(),
      depts: await pg.locator(".gm-org a.gm-dg-dept, .gm-org a.gm-dg-node[data-slug]").count(),
      hub: await pg.evaluate(() => (document.querySelector(".gm-org .gm-dg-hub") || {}).textContent || ""),
      vert: await pg.evaluate(() => !!document.querySelector(".gm-org .gm-dg-vert")),
      hscroll: await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    };
    if (rec.overviewOrg.url !== "/govmap/ministerial/?view=org") errors.push("overview org url " + rec.overviewOrg.url);
    if (rec.overviewOrg.pressed !== "Org chart") errors.push("overview org not pressed");
    if (!rec.overviewOrg.hasOverview) errors.push("overview org missing");
    if (rec.overviewOrg.depts !== 23) errors.push("expected 23 ministerial depts, got " + rec.overviewOrg.depts);
    if (rec.overviewOrg.nodes !== 24) errors.push("expected 24 overview nodes, got " + rec.overviewOrg.nodes);
    if (!/UK Government/.test(rec.overviewOrg.hub) || !/PM/.test(rec.overviewOrg.hub)) errors.push("hub text " + rec.overviewOrg.hub);
    if (mobile && !rec.overviewOrg.vert) errors.push("expected vertical overview on " + name);
    if (!mobile && rec.overviewOrg.vert) errors.push("expected curved overview on desktop");
    if (rec.overviewOrg.hscroll) errors.push("overview org sideways scroll");
    await pg.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      const t = document.querySelector(".gm-chart-switch");
      if (t) window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 12);
    });
    await pg.waitForTimeout(200);
    await pg.screenshot({ path: `${SHOTS}/${TAG}overview-org-${name}.png`, fullPage: name !== "desktop" });
    if (name === "desktop") await pg.screenshot({ path: `${SHOTS}/${TAG}overview-org-desktop.png`, fullPage: true });

    // click a department in the overview org chart
    await pg.locator('.gm-org a[data-slug="cabinet-office"]').click();
    await pg.waitForSelector(".gm-org .gm-dg-svg", { timeout: 8000 });
    await pg.waitForFunction(() => !document.querySelector(".gm-org [data-overview='1']"));
    rec.fromOverview = {
      url: pg.url().replace(B, ""),
      heading: (await pg.locator("#gm-panel .gm-panel-h").innerText().catch(() => "")).replace(/\s+/g, " "),
      nodes: await pg.locator(".gm-org .gm-dg-node").count(),
    };
    if (rec.fromOverview.url !== "/govmap/ministerial/?dept=cabinet-office&view=org") errors.push("click dept url " + rec.fromOverview.url);
    if (!/Cabinet Office/.test(rec.fromOverview.heading)) errors.push("click dept heading " + rec.fromOverview.heading);
    if (rec.fromOverview.nodes !== 52) errors.push("click dept nodes " + rec.fromOverview.nodes);

    // Back to all departments should keep org overview
    await pg.locator("button.gm-tool", { hasText: "Back to all departments" }).click();
    await pg.waitForSelector(".gm-org [data-overview='1'] .gm-dg-svg", { timeout: 8000 });
    rec.backOverview = {
      url: pg.url().replace(B, ""),
      depts: await pg.locator(".gm-org a[data-slug]").count(),
    };
    if (rec.backOverview.url !== "/govmap/ministerial/?view=org") errors.push("back url " + rec.backOverview.url);

    // toggle to circle on overview
    await pg.locator(".gm-chart-switch .gm-seg-b >> text=Circle").click();
    await pg.waitForTimeout(400);
    rec.overviewToCircle = {
      url: pg.url().replace(B, ""),
      pressed: await pg.locator(".gm-chart-switch .gm-seg-b[aria-pressed=true]").innerText().catch(() => ""),
      canvasHidden: await pg.evaluate(() => document.getElementById("gm-canvas").hasAttribute("hidden")),
    };
    if (rec.overviewToCircle.url !== "/govmap/ministerial/" && rec.overviewToCircle.url !== "/govmap/ministerial") errors.push("circle overview url " + rec.overviewToCircle.url);
    if (rec.overviewToCircle.canvasHidden) errors.push("canvas still hidden after circle");

    // non-ministerial overview org (once per desktop to save time, plus phone390)

    // reduced motion org
    if (name === "phone390") {
      const ctx2 = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
      const pg2 = await ctx2.newPage();
      const e2 = [];
      pg2.on("pageerror", (e) => e2.push(String(e)));
      await pg2.goto(B + "/govmap/ministerial/?dept=cabinet-office&view=org", { waitUntil: "networkidle" });
      await pg2.waitForSelector(".gm-org .gm-dg-svg");
      rec.reduced = await pg2.evaluate(() => {
        const link = document.querySelector(".gm-org .gm-dg-link");
        return { anim: link ? getComputedStyle(link).animationName : "none", nodes: document.querySelectorAll(".gm-org .gm-dg-node").length };
      });
      rec.reduced.errors = e2;
      await ctx2.close();
    }

    if (name === "phone390" || name === "desktop") {
      r = await pg.goto(B + "/govmap/non-ministerial/?view=org", { waitUntil: "networkidle" });
      await pg.waitForSelector(".gm-org [data-overview='1'] .gm-dg-svg", { timeout: 10000 });
      rec.nmdOverview = {
        status: r.status(),
        url: pg.url().replace(B, ""),
        depts: await pg.locator(".gm-org a[data-slug]").count(),
        nodes: await pg.locator(".gm-org .gm-dg-node").count(),
        hub: await pg.evaluate(() => (document.querySelector(".gm-org .gm-dg-hub") || {}).textContent || ""),
        vert: await pg.evaluate(() => !!document.querySelector(".gm-org .gm-dg-vert")),
        hscroll: await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
      };
      if (rec.nmdOverview.depts !== 20) errors.push("nmd depts " + rec.nmdOverview.depts);
      if (rec.nmdOverview.nodes !== 21) errors.push("nmd nodes " + rec.nmdOverview.nodes);
      if (!/Non-ministerial/.test(rec.nmdOverview.hub)) errors.push("nmd hub " + rec.nmdOverview.hub);
      if (rec.nmdOverview.hscroll) errors.push("nmd overview sideways scroll");
    }

    rec.errors = errors;
    await ctx.close();
  }

  // reduced motion on overview org
  {
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const pg2 = await ctx2.newPage();
    const e2 = [];
    pg2.on("pageerror", (e) => e2.push(String(e)));
    await pg2.goto(B + "/govmap/ministerial/?view=org", { waitUntil: "networkidle" });
    await pg2.waitForSelector(".gm-org .gm-dg-svg");
    out.overviewReduced = await pg2.evaluate(() => {
      const link = document.querySelector(".gm-org .gm-dg-link");
      return { anim: link ? getComputedStyle(link).animationName : "none", nodes: document.querySelectorAll(".gm-org .gm-dg-node").length, depts: document.querySelectorAll(".gm-org a[data-slug]").length };
    });
    out.overviewReduced.errors = e2;
    if (out.overviewReduced.anim && out.overviewReduced.anim !== "none") e2.push("overview reduced anim " + out.overviewReduced.anim);
    await ctx2.close();
  }

  const failed = [];
  for (const [k, rec] of Object.entries(out)) {
    const errs = rec.errors || [];
    if (errs.length) failed.push(k + ": " + errs.join(" | "));
  }
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  if (failed.length) {
    console.error("FAIL\n" + failed.join("\n"));
    process.exit(1);
  }
})().catch((e) => { console.error(e); process.exit(1); });
