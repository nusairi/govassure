/* Playwright verification of threatmodel PREVIEW (v4 DevSecOps-style). Desktop 1280 + mobile 390. */
const { chromium } = require("/workspace/favicons/rollout/tools/node_modules/playwright-core");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const BASE = process.argv[2] || "https://black-plant-065a67303-preview.westeurope.4.azurestaticapps.net";
const LOCAL_ICO = path.join(__dirname, "..", "favicon.ico");
const SHOTS = path.join(__dirname, "..", "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const fails = [];
const fail = (m) => { fails.push(m); console.log("FAIL", m); };
const pass = (m) => console.log("PASS", m);

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });

  async function makePage(width, height) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const p = await ctx.newPage();
    p.errs = [];
    p.csp = [];
    await p.addInitScript(() => document.addEventListener("securitypolicyviolation", (e) => {
      (window.__csp = window.__csp || []).push(e.violatedDirective + " " + e.blockedURI);
    }));
    p.on("console", (m) => {
      if (m.type() === "error") p.errs.push(m.text());
      if (/Content Security Policy/i.test(m.text())) p.csp.push(m.text());
    });
    p.on("pageerror", (e) => p.errs.push(String(e)));
    return { ctx, p };
  }

  function overflow(p) {
    return p.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const bad = [];
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > w + 2) bad.push((el.tagName + (el.id ? "#" + el.id : "") + "." + (el.className || "")).slice(0, 80) + " right=" + Math.round(r.right));
      });
      return { scroll: document.documentElement.scrollWidth, client: w, extra: document.documentElement.scrollWidth - w, samples: bad.slice(0, 8) };
    });
  }

  // Favicon is the crown (byte-match local ico)
  const icoBuf = await (await fetch(BASE + "/favicon.ico")).arrayBuffer();
  const localIco = fs.readFileSync(LOCAL_ICO);
  const ico = Buffer.from(icoBuf);
  const icoMatch = ico.length === localIco.length && crypto.createHash("sha256").update(ico).digest("hex") === crypto.createHash("sha256").update(localIco).digest("hex");
  if (!icoMatch) fail("favicon.ico does not match crown file (" + ico.length + " bytes)");
  else pass("favicon is the crown (" + ico.length + " bytes, sha match)");

  // ---- DESKTOP 1280 ----
  const d = await makePage(1280, 900);
  const resp = await d.p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
  if (!resp || resp.status() !== 200) fail("home status " + (resp && resp.status()));
  else pass("home 200");
  await d.p.waitForTimeout(400);

  const title = await d.p.title();
  if (/Threat Modelling/.test(title)) pass("desktop title"); else fail("desktop title " + title);

  const mast = await d.p.locator(".mast h1").textContent();
  if (mast && /Threat Modelling Lifecycle/.test(mast)) pass("desktop mast h1 (v4)"); else fail("desktop mast h1 " + mast);

  const tabCount = await d.p.locator(".tabs .tab").count();
  if (tabCount === 4) pass("four tabs"); else fail("tab count " + tabCount);
  const tabModel = await d.p.locator("#tab-model").textContent();
  if (/Lifecycle model/.test(tabModel || "")) pass("Lifecycle model tab (v4, not v3b ring tour)"); else fail("tab-model " + tabModel);

  const cards = await d.p.locator("#domains .cell").count();
  const life = await d.p.locator("#life .cell").count();
  if (cards === 10) pass("10 domain cards"); else fail("domain cards " + cards);
  if (life === 10) pass("10 pipeline cells"); else fail("life cells " + life);

  const ringGone = await d.p.locator("#tmRing").count();
  if (ringGone === 0) pass("v3b ring not present"); else fail("v3b ring still on page");

  const bigDisc = await d.p.evaluate(() => {
    const mast = document.querySelector(".mast");
    const tools = document.querySelector(".tools");
    const hero = (mast && mast.innerText || "") + (tools && tools.innerText || "");
    return /not a government website/i.test(hero);
  });
  if (!bigDisc) pass("no big disclaimer in mast/tools"); else fail("big disclaimer still in mast");

  const footerLegal = await d.p.locator("footer .legal").count();
  if (footerLegal === 1) pass("one small footer legal line"); else fail("footer legal count " + footerLegal);

  const logo = await d.p.locator(".ga-brandbar__home").getAttribute("href");
  if (logo === "https://www.govassured.com/") pass("logo href"); else fail("logo href " + logo);

  await d.p.screenshot({ path: path.join(SHOTS, "preview-v4-landing-desktop.png"), fullPage: true });
  await d.p.screenshot({ path: path.join(SHOTS, "preview-v4-landing-desktop-hero.png"), fullPage: false });
  pass("screenshot preview-v4-landing-desktop");

  const ov0 = await overflow(d.p);
  if (ov0.extra <= 2) pass("desktop landing no overflow (" + ov0.extra + ")"); else fail("desktop landing overflow " + ov0.extra + " " + JSON.stringify(ov0.samples));

  // open stage 1 via pipeline
  await d.p.locator("#life .cell").first().click();
  await d.p.waitForTimeout(300);
  const modalOn = await d.p.locator("#back.on").count();
  if (modalOn) pass("desktop modal opens"); else fail("desktop modal did not open");
  const mtitle = await d.p.locator("#mtitle").textContent();
  if (/Scope/.test(mtitle || "")) pass("desktop stage 1 title"); else fail("desktop stage title " + mtitle);

  await d.p.screenshot({ path: path.join(SHOTS, "preview-v4-stage-open-desktop.png"), fullPage: false });

  // Next + Prev
  await d.p.locator("#tmNext").click();
  await d.p.waitForTimeout(200);
  const t2 = await d.p.locator("#mtitle").textContent();
  if (/landscape/i.test(t2 || "")) pass("next to stage 2"); else fail("next title " + t2);
  await d.p.locator("#tmPrev").click();
  await d.p.waitForTimeout(200);
  const t1 = await d.p.locator("#mtitle").textContent();
  if (/Scope/.test(t1 || "")) pass("prev back to stage 1"); else fail("prev title " + t1);
  await d.p.keyboard.press("ArrowRight");
  await d.p.waitForTimeout(200);
  const t2b = await d.p.locator("#mtitle").textContent();
  if (/landscape/i.test(t2b || "")) pass("arrow to stage 2"); else fail("arrow title " + t2b);

  await d.p.screenshot({ path: path.join(SHOTS, "preview-v4-tour-stage2-desktop.png"), fullPage: false });

  // reach all 10 via dots
  for (let n = 1; n <= 10; n++) {
    await d.p.locator(".dots button").nth(n - 1).click();
    await d.p.waitForTimeout(80);
  }
  const t10 = await d.p.locator("#mtitle").textContent();
  if (/Keep it continuous|Continuous/.test(t10 || "")) pass("all 10 stages reachable via dots"); else fail("stage 10 title " + t10);

  await d.p.keyboard.press("Escape");
  await d.p.waitForTimeout(150);

  // links clickable
  const linkInfo = await d.p.evaluate(() => {
    const as = [...document.querySelectorAll("a[href]")];
    const clickable = as.filter((a) => {
      const s = getComputedStyle(a);
      const r = a.getBoundingClientRect();
      return s.pointerEvents !== "none" && s.visibility !== "hidden" && s.display !== "none" && a.href;
    });
    const ext = as.filter((a) => /^https?:/i.test(a.href) && !/\.govassured\.com/i.test(a.hostname));
    const ga = as.filter((a) => /\.govassured\.com/i.test(a.hostname));
    const unclickableExt = ext.filter((a) => {
      const s = getComputedStyle(a);
      return s.pointerEvents === "none" || !a.href;
    });
    return { total: as.length, clickable: clickable.length, ext: ext.length, ga: ga.length, unclickableExt: unclickableExt.map((a) => a.href).slice(0, 5) };
  });
  if (linkInfo.total > 10 && linkInfo.unclickableExt.length === 0) pass("links clickable (" + linkInfo.total + " hrefs, " + linkInfo.ext + " external, " + linkInfo.clickable + " clickable)");
  else fail("links issue " + JSON.stringify(linkInfo));

  if (d.p.errs.length === 0) pass("desktop 0 console errors"); else fail("desktop console " + JSON.stringify(d.p.errs));
  if (d.p.csp.length === 0) pass("desktop 0 CSP messages"); else fail("desktop CSP " + JSON.stringify(d.p.csp));
  await d.ctx.close();

  // ---- MOBILE 390 ----
  const m = await makePage(390, 844);
  await m.p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
  await m.p.waitForTimeout(400);
  await m.p.screenshot({ path: path.join(SHOTS, "preview-v4-mobile-landing.png"), fullPage: true });
  const ovM = await overflow(m.p);
  if (ovM.extra <= 2) pass("mobile landing no overflow (" + ovM.extra + ")"); else fail("mobile landing overflow " + ovM.extra + " " + JSON.stringify(ovM.samples));
  const mc = await m.p.locator("#domains .cell").count();
  if (mc === 10) pass("mobile 10 cards"); else fail("mobile cards " + mc);
  await m.p.locator("#domains .cell").first().click();
  await m.p.waitForTimeout(300);
  if (await m.p.locator("#back.on").count()) pass("mobile modal opens"); else fail("mobile modal closed");
  await m.p.screenshot({ path: path.join(SHOTS, "preview-v4-mobile-stage.png"), fullPage: false });
  const ovMs = await overflow(m.p);
  if (ovMs.extra <= 2) pass("mobile stage no overflow (" + ovMs.extra + ")"); else fail("mobile stage overflow " + ovMs.extra + " " + JSON.stringify(ovMs.samples));
  await m.p.locator("#tmNext").click();
  await m.p.waitForTimeout(200);
  const mt = await m.p.locator("#mtitle").textContent();
  if (/landscape/i.test(mt || "")) pass("mobile next works"); else fail("mobile next " + mt);
  await m.p.locator("#tmPrev").click();
  await m.p.waitForTimeout(200);
  const mt1 = await m.p.locator("#mtitle").textContent();
  if (/Scope/.test(mt1 || "")) pass("mobile prev works"); else fail("mobile prev " + mt1);
  if (m.p.errs.length === 0) pass("mobile 0 console errors"); else fail("mobile console " + JSON.stringify(m.p.errs));
  await m.ctx.close();

  await browser.close();
  const result = { ok: fails.length === 0, fails };
  fs.writeFileSync(path.join(__dirname, "preview-v4-test-result.json"), JSON.stringify(result, null, 2));
  console.log(fails.length ? "RESULT FAIL " + fails.length : "RESULT PASS");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
