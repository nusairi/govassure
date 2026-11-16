const { chromium } = require("playwright-core");
const B = process.env.B || "http://127.0.0.1:33776";
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const TAG = process.env.TAG || "";
const VIDEO = process.env.VIDEO || "";
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const out = {};
  for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const ctxOpts = { viewport: vp, deviceScaleFactor: 1, hasTouch: name === "mobile", isMobile: name === "mobile" };
    if (VIDEO && name === "desktop") ctxOpts.recordVideo = { dir: VIDEO, size: { width: 1440, height: 900 } };
    const ctx = await browser.newContext(ctxOpts);
    const pg = await ctx.newPage();
    const errors = [];
    pg.on("pageerror", (e) => errors.push("pageerror " + e.message));
    pg.on("console", (m) => { if (m.type() === "error") errors.push("console " + m.text()); });
    const r = {};
    const hs = () => pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    const shot = (n, full) => pg.screenshot({ path: `${SHOTS}/${TAG}hybrid-${n}-${name}.png`, fullPage: !!full });
    const settle = (ms) => pg.waitForTimeout(ms || 350);

    // 1. overview
    const resp = await pg.goto(B + "/govmap/", { waitUntil: "networkidle" });
    r.status = resp.status();
    r.csp = (resp.headers()["content-security-policy"] || "").slice(0, 40);
    await pg.waitForSelector(".gm-card");
    r.cards = await pg.locator(".gm-card").count();
    r.sections = await pg.locator(".gm-ov-sec h2").allInnerTexts();
    r.root = await pg.locator(".gm-root").innerText();
    r.count = await pg.locator("#gm-count").innerText();
    r.hsOverview = await hs();
    await shot("overview", name === "desktop");
    if (name === "mobile") { await pg.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, document.querySelector("#gm-count").getBoundingClientRect().top + scrollY - 8); }); await pg.screenshot({ path: `${SHOTS}/${TAG}hybrid-overview-cards-mobile.png` }); }
    await pg.click(".gm-seg-b >> text=A–Z"); await settle(150);
    r.azFirst = await pg.locator(".gm-ov-min .gm-card-n").first().innerText();
    await pg.click(".gm-seg-b >> text=Most bodies"); await settle(150);
    r.sizeFirst = await pg.locator(".gm-ov-min .gm-card-n").first().innerText();

    // 2. search DVLA -> parent
    await pg.fill("#gm-search", "dvla"); await settle(500);
    r.searchCount = await pg.locator("#gm-count").innerText();
    r.res1 = (await pg.locator(".gm-res").first().innerText()).replace(/\s+/g, " ");
    r.hsSearch = await hs();
    await shot("search");
    await pg.fill("#gm-search", "agency"); await settle(500);
    r.searchAgency = await pg.locator("#gm-count").innerText();
    r.moreBtn = await pg.locator(".gm-more").count();
    await pg.fill("#gm-search", "dvla"); await settle(500);
    await pg.locator(".gm-res-a").first().click(); await settle(700);
    r.dvlaUrl = pg.url().replace(B, "");
    r.dvlaCrumb = (await pg.locator(".gm-bc").innerText()).replace(/\s+/g, " ");
    r.dvlaHl = await pg.evaluate(() => { const h = document.querySelector(".gm-hl"); if (!h) return null; const b = h.getBoundingClientRect(); return { label: h.getAttribute("data-label"), focused: document.activeElement === h, inView: b.top >= 0 && b.bottom <= innerHeight, parentType: h.parentElement.closest("[role=treeitem]").getAttribute("data-label") }; });
    await pg.goBack(); await settle(400);
    r.backMode = await pg.getAttribute("#gm-tree", "data-mode") + " q=" + (await pg.inputValue("#gm-search"));
    await pg.goForward(); await settle(400);
    r.fwdMode = await pg.getAttribute("#gm-tree", "data-mode") + " " + pg.url().replace(B, "");
    await pg.fill("#gm-search", ""); await settle(400);

    // 3. open BIST from overview
    await pg.goto(B + "/govmap/", { waitUntil: "networkidle" });
    await pg.locator(".gm-card", { hasText: "Business, Innovation" }).click(); await settle(500);
    r.bistUrl = pg.url().replace(B, "");
    r.bistH = (await pg.locator(".gm-dv-h").innerText()).replace(/\s+/g, " ");
    r.bistItems = await pg.locator(".gm-dv-tree [role=treeitem]").count();
    r.bistChips = await pg.locator(".gm-chip").count();
    r.chipHref = await pg.locator(".gm-chip").first().getAttribute("href");
    r.whatHrefs = (await pg.locator(".gm-dv-tree .gm-what").evaluateAll((a) => a.map((x) => x.getAttribute("href")))).slice(0, 3).join(" ");
    r.nested = await pg.locator(".gm-dv-tree [aria-level='4']").count();
    r.alsoLinks = await pg.locator(".gm-dv-tree .gm-also-link").count();
    r.ownMarks = await pg.locator(".gm-dv-tree .gm-own").count();
    r.hsDept = await hs();
    await pg.waitForTimeout(600);
    await pg.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; const b = document.querySelector(".gm-bc"); window.scrollTo(0, b.getBoundingClientRect().top + scrollY - 12); });
    await shot("department");
    // keyboard: tree pattern
    await pg.focus(".gm-dv-tree [role=treeitem]");
    const kb = [];
    const act = () => pg.evaluate(() => { const a = document.activeElement; return (a.getAttribute("aria-level") || "") + ":" + (a.getAttribute("data-label") || a.tagName) + ":" + (a.getAttribute("aria-expanded") || "-"); });
    kb.push(await act());
    await pg.keyboard.press("ArrowDown"); kb.push(await act());
    await pg.keyboard.press("ArrowLeft"); kb.push(await act());
    await pg.keyboard.press("ArrowRight"); kb.push(await act());
    await pg.keyboard.press("ArrowRight"); kb.push(await act());
    await pg.keyboard.press("ArrowLeft"); kb.push(await act());
    await pg.keyboard.press("e"); kb.push(await act());
    await pg.keyboard.press("End"); kb.push(await act());
    await pg.keyboard.press("Home"); kb.push(await act());
    await pg.keyboard.press("Tab"); kb.push(await act());
    r.keys = kb;
    r.tabbable = await pg.evaluate(() => document.querySelectorAll(".gm-dv-tree [tabindex='0']").length);
    // collapse / expand all
    await pg.click("#gm-collapse"); await settle(150);
    r.afterCollapse = await pg.locator(".gm-dv-tree [role=treeitem]:visible").count();
    await pg.click("#gm-expand"); await settle(150);
    r.afterExpand = await pg.locator(".gm-dv-tree [role=treeitem]:visible").count();

    // 4. diagram
    r.diagramBtnVisible = await pg.locator(".gm-viewseg .gm-seg-b >> text=Diagram").isVisible();
    if (name === "desktop") {
      await pg.click(".gm-viewseg .gm-seg-b >> text=Diagram"); await settle(900);
      r.dgUrl = pg.url().replace(B, "");
      r.dgNodes = await pg.locator(".gm-dg-node").count();
      r.dgLinks = await pg.locator(".gm-dg-link").count();
      const node = pg.locator("a.gm-dg-body").nth(7);
      await node.scrollIntoViewIfNeeded();
      await node.hover(); await settle(250);
      r.dgHover = await pg.evaluate(() => ({ dim: document.querySelector(".gm-dg-svg").classList.contains("gm-dg-dim"), on: document.querySelectorAll(".gm-dg-link.gm-on").length, tip: document.querySelector(".gm-dg-tip").hidden ? "" : document.querySelector(".gm-dg-tip").innerText.replace(/\s+/g, " ") }));
      await pg.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; const b = document.querySelector(".gm-dv-body"); window.scrollTo(0, b.getBoundingClientRect().top + scrollY - 90); });
      await node.hover(); await settle(250);
      await pg.screenshot({ path: `${SHOTS}/${TAG}hybrid-diagram.png` });
      const [pop] = await Promise.all([ctx.waitForEvent("page", { timeout: 5000 }).catch(() => null), node.click()]);
      r.dgPopup = pop ? pop.url() : "none";
      if (pop) await pop.close();
      // list hover lights diagram
      await pg.locator(".gm-dv-tree .gm-ti-body").nth(2).hover(); await settle(150);
      r.listLights = await pg.locator(".gm-dg-node.gm-on").count();
      await pg.goto(B + "/govmap/?dept=dft&view=diagram", { waitUntil: "networkidle" }); await settle(800);
      r.dftAlias = (await pg.locator(".gm-dv-h").innerText()).replace(/\s+/g, " ") + " nodes=" + (await pg.locator(".gm-dg-node").count());
      await pg.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; const b = document.querySelector(".gm-dv-body"); window.scrollTo(0, b.getBoundingClientRect().top + scrollY - 60); });
      await pg.locator("a.gm-dg-body").nth(1).hover(); await settle(250);
      await pg.screenshot({ path: `${SHOTS}/${TAG}hybrid-diagram-dft.png` });
    }

    // 5. filters Ministerial + Executive agency
    await pg.goto(B + "/govmap/", { waitUntil: "networkidle" });
    if (name === "mobile") await pg.click("#gm-filter-toggle");
    await pg.selectOption("#gm-scope", "min"); await settle(200);
    r.scopeCards = await pg.locator(".gm-card").count();
    await pg.selectOption("#gm-types", "ea"); await settle(300);
    r.filterUrl = pg.url().replace(B, "");
    r.filterCount = await pg.locator("#gm-count").innerText();
    r.filterTrees = await pg.locator("#gm-tree [role=tree]").count();
    r.badge = await pg.locator("#gm-filter-badge").innerText();
    r.hsFilter = await hs();
    await shot("filter");
    await pg.click("#gm-clear"); await settle(300);
    r.cleared = pg.url().replace(B, "") + " cards=" + (await pg.locator(".gm-card").count()) + " badgeHidden=" + (await pg.locator("#gm-filter-badge").isHidden());

    // 6. totals
    await pg.click("button.gm-stat[data-card=min]"); await settle(400);
    r.totMin = pg.url().replace(B, "") + " cards=" + (await pg.locator(".gm-card").count()) + " pressed=" + (await pg.getAttribute("button.gm-stat[data-card=min]", "aria-pressed"));
    await pg.click("button.gm-stat[data-card=bodies]"); await settle(400);
    const t0 = Date.now();
    r.totBodies = pg.url().replace(B, "") + " trees=" + (await pg.locator("#gm-tree [role=tree]").count()) + " items=" + (await pg.locator("#gm-tree [role=treeitem]").count()) + " count=" + (await pg.locator("#gm-count").innerText());
    r.hsAll = await hs();
    if (name === "desktop") await pg.screenshot({ path: `${SHOTS}/${TAG}hybrid-expanded-desktop.png` });
    await pg.click("button.gm-stat[data-card=bodies]"); await settle(400);
    r.totOff = pg.url().replace(B, "") + " mode=" + (await pg.getAttribute("#gm-tree", "data-mode"));
    // perf: expand=1 load + render
    const t1 = Date.now();
    await pg.goto(B + "/govmap/?expand=1", { waitUntil: "networkidle" });
    await pg.waitForSelector("#gm-tree [role=tree]");
    r.expandLoadMs = Date.now() - t1;
    r.renderMs = await pg.evaluate(() => { const b = document.querySelector("#gm-expand"); const s = performance.now(); b.click(); document.body.offsetHeight; return Math.round(performance.now() - s); });
    void t0;

    // 7. URLs + glossary links
    await pg.goto(B + "/govmap/?type=ea", { waitUntil: "networkidle" }); await settle(200);
    r.typeEa = await pg.locator("#gm-count").innerText();
    await pg.goto(B + "/govmap/?show=devolved", { waitUntil: "networkidle" }); await settle(200);
    r.showDev = await pg.locator(".gm-card").allInnerTexts().then((a) => a.length);
    await pg.goto(B + "/govmap/?show=ministerial&expand=1", { waitUntil: "networkidle" }); await settle(200);
    r.minExpand = pg.url().replace(B, "") + " trees=" + (await pg.locator("#gm-tree [role=tree]").count());
    await pg.goto(B + "/govmap/?dept=department-for-transport", { waitUntil: "networkidle" }); await settle(200);
    await pg.locator(".gm-chip", { hasText: "Executive agency" }).click();
    await pg.waitForLoadState("networkidle"); await settle(500);
    r.chipNav = pg.url().replace(B, "") + " target=" + (await pg.evaluate(() => { const t = document.querySelector(":target"); return t ? t.id : null; }));
    await pg.goto(B + "/govmap/glossary/#executive-agency", { waitUntil: "networkidle" });
    await pg.locator("#executive-agency .gm-g-map").first().click(); await pg.waitForLoadState("networkidle"); await settle(300);
    r.glossaryToMap = pg.url().replace(B, "") + " " + (await pg.locator("#gm-count").innerText());
    // 8. chart -> tree
    await pg.goto(B + "/govmap/ministerial/", { waitUntil: "networkidle" });
    await pg.locator("#gm-dept-list button").first().click(); await settle(400);
    const tl = pg.locator("#gm-panel a.gm-tool-link");
    r.chartLink = (await tl.count()) ? await tl.getAttribute("href") : "none";
    if (await tl.count()) { await tl.click(); await pg.waitForLoadState("networkidle"); await settle(300); r.chartToTree = (await pg.locator(".gm-dv-h").innerText()).replace(/\s+/g, " "); }
    r.chartLegendLinks = await (async () => { await pg.goto(B + "/govmap/ministerial/", { waitUntil: "networkidle" }); return pg.locator("#gm-legend a").count(); })();
    r.chartHs = await hs();

    // mobile department shot (DfT, nested + markers visible)
    if (name === "mobile") {
      await pg.goto(B + "/govmap/?dept=department-for-transport&org=driver-and-vehicle-licensing-agency", { waitUntil: "networkidle" }); await settle(700);
      r.hsMobileDept = await hs();
      await pg.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, document.querySelector(".gm-bc").getBoundingClientRect().top + scrollY - 8); });
      await pg.screenshot({ path: `${SHOTS}/${TAG}hybrid-department-dft-mobile.png` });
    }
    r.errors = errors;
    out[name] = r;
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
