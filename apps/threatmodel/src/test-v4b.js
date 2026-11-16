/* Local Playwright test for v4b landing tweaks: desktop 1280 + mobile 390. */
const { chromium } = require("/workspace/favicons/rollout/tools/node_modules/playwright-core");
const fs = require("fs");
const path = require("path");
const BASE = process.argv[2] || "http://127.0.0.1:8765";
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
        if (r.width > 0 && r.right > w + 2) bad.push((el.tagName + "." + (el.className || "")).slice(0, 80) + " right=" + Math.round(r.right));
      });
      return { scroll: document.documentElement.scrollWidth, client: w, extra: document.documentElement.scrollWidth - w, samples: bad.slice(0, 8) };
    });
  }

  // ---- DESKTOP ----
  const d = await makePage(1280, 900);
  await d.p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
  await d.p.waitForTimeout(400);
  const title = await d.p.title();
  if (/Threat Modelling/.test(title)) pass("desktop title"); else fail("desktop title " + title);

  const mast = await d.p.locator(".mast h1").textContent();
  if (mast && /Threat Modelling Lifecycle/.test(mast)) pass("desktop mast h1"); else fail("desktop mast h1 " + mast);

  const tabCount = await d.p.locator(".tabs .tab").count();
  if (tabCount === 4) pass("four tabs"); else fail("tab count " + tabCount);

  const cards = await d.p.locator("#domains .cell").count();
  const life = await d.p.locator("#life .cell").count();
  if (cards === 10) pass("10 domain cards"); else fail("domain cards " + cards);
  if (life === 10) pass("10 pipeline cells"); else fail("life cells " + life);

  const relLayout = await d.p.evaluate(() => {
    const mastRel = document.querySelector(".mast nav.rel, .mast .rel");
    const mastText = (document.querySelector(".mast") || {}).innerText || "";
    const footer = document.querySelector("footer");
    const footerText = (footer && footer.innerText) || "";
    const tools = document.querySelector(".tools");
    const stages = document.querySelector("#domains") && document.querySelector("#domains").closest(".sec");
    const cat = [...document.querySelectorAll(".dark .h")].find((h) => /CURRENT CATALOGUES/.test(h.textContent || ""));
    const catBar = cat && cat.closest(".dark");
    const q = [...document.querySelectorAll(".dark .h")].find((h) => /FOUR QUESTIONS/.test(h.textContent || ""));
    const wn = document.querySelector(".wnbar");
    const e2e = [...document.querySelectorAll(".sec .lbl")].find((l) => /end to end/i.test(l.textContent || ""));
    const reopen = [...document.querySelectorAll(".cad .h")].find((h) => /WHEN TO REOPEN/.test(h.textContent || ""));
    const order = [tools, stages, catBar, q && q.closest(".dark"), wn, e2e && e2e.closest(".sec"), reopen && reopen.closest(".cad")]
      .map((el) => el && (el.compareDocumentPosition ? el : null));
    const pos = [tools, stages, catBar, q && q.closest(".dark"), wn, e2e && e2e.closest(".sec"), reopen && reopen.closest(".cad")];
    let ordered = true;
    for (let i = 1; i < pos.length; i++) {
      if (!pos[i - 1] || !pos[i] || !(pos[i - 1].compareDocumentPosition(pos[i]) & Node.DOCUMENT_POSITION_FOLLOWING)) ordered = false;
    }
    const stagesAboveCat = !!(stages && catBar && (stages.compareDocumentPosition(catBar) & Node.DOCUMENT_POSITION_FOLLOWING));
    const immediatelyAfterTools = !!(tools && stages && tools.nextElementSibling === stages);
    return {
      mastHasRelNav: !!mastRel,
      mastHasRelated: /Related:/i.test(mastText),
      footerHasRelated: /Related:/i.test(footerText) && /DevSecOps operating model/.test(footerText) && /Key Management Lifecycle/.test(footerText),
      stagesAboveCat,
      immediatelyAfterTools,
      ordered,
      ids: pos.map((el) => el && (el.id || el.className || el.tagName)),
    };
  });
  if (!relLayout.mastHasRelNav && !relLayout.mastHasRelated) pass("no Related line in masthead"); else fail("masthead still has Related " + JSON.stringify(relLayout));
  if (relLayout.footerHasRelated) pass("footer Related links kept"); else fail("footer Related missing " + JSON.stringify(relLayout));
  if (relLayout.stagesAboveCat && relLayout.immediatelyAfterTools && relLayout.ordered) pass("ten stages sit above catalogues, after tools row"); else fail("section order wrong " + JSON.stringify(relLayout));

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

  await d.p.screenshot({ path: path.join(SHOTS, "v4b-landing-desktop.png"), fullPage: true });

  const ov0 = await overflow(d.p);
  if (ov0.extra <= 2) pass("desktop landing no overflow (" + ov0.extra + ")"); else fail("desktop landing overflow " + ov0.extra + " " + JSON.stringify(ov0.samples));

  // open all 10 stages from the numbered cards
  const expected = [/Scope/i, /landscape/i, /Model/i, /Boundaries|assets|identit/i, /Threat/i, /Priorit/i, /Mitigat/i, /Validat/i, /Record/i, /continuous/i];
  for (let n = 0; n < 10; n++) {
    await d.p.locator("#domains .cell").nth(n).click();
    await d.p.waitForTimeout(150);
    if (!(await d.p.locator("#back.on").count())) fail("card " + (n + 1) + " did not open modal");
    const mt = await d.p.locator("#mtitle").textContent();
    if (expected[n].test(mt || "")) pass("card " + (n + 1) + " opens (" + (mt || "").trim() + ")"); else fail("card " + (n + 1) + " title " + mt);
    if (n === 0) {
      const purposeOpen = await d.p.evaluate(() => {
        const secs = [...document.querySelectorAll("#mbody .tm-sec h3")].map((h) => h.textContent);
        return secs.includes("What it is") && secs.includes("What you do");
      });
      if (purposeOpen) pass("purpose and what you do open"); else fail("missing open sections");
      const closedAcc = await d.p.locator("#mbody details.tm-acc:not([open])").count();
      if (closedAcc >= 4) pass("other sections collapsed (" + closedAcc + ")"); else fail("expected collapsed sections, got " + closedAcc);
    }
    if (n < 9) {
      await d.p.keyboard.press("Escape");
      await d.p.waitForTimeout(80);
    }
  }

  // Prev/Next from last card (stage 10)
  await d.p.locator("#tmPrev").click();
  await d.p.waitForTimeout(200);
  const t9 = await d.p.locator("#mtitle").textContent();
  if (/Record/i.test(t9 || "")) pass("prev to stage 9"); else fail("prev title " + t9);
  await d.p.locator("#tmNext").click();
  await d.p.waitForTimeout(200);
  const t10n = await d.p.locator("#mtitle").textContent();
  if (/continuous/i.test(t10n || "")) pass("next back to stage 10"); else fail("next title " + t10n);
  await d.p.keyboard.press("ArrowLeft");
  await d.p.waitForTimeout(200);
  const t9k = await d.p.locator("#mtitle").textContent();
  if (/Record/i.test(t9k || "")) pass("arrow prev works"); else fail("arrow prev title " + t9k);

  // depth toggle + quiz persist
  await d.p.locator(".dots button").first().click();
  await d.p.waitForTimeout(150);
  const depths = await d.p.locator(".tm-depth button").count();
  if (depths === 3) pass("depth toggle present"); else fail("depth count " + depths);
  await d.p.locator('.tm-depth button[data-depth="architect"]').click();
  await d.p.waitForTimeout(100);
  const archOn = await d.p.locator('.tm-depth button[data-depth="architect"]').getAttribute("aria-selected");
  if (archOn === "true") pass("architect depth selected"); else fail("architect not selected");

  await d.p.locator("#tmQuizAcc summary").click();
  await d.p.waitForTimeout(100);
  const firstOpt = d.p.locator("#tmQuizAcc .tm-quiz__opt").first();
  await firstOpt.click();
  await d.p.waitForTimeout(150);
  const stored = await d.p.evaluate(() => localStorage.getItem("ga-tm-quiz-v1"));
  if (stored && /scope/.test(stored)) pass("quiz saved to localStorage"); else fail("quiz not saved " + stored);

  await d.p.keyboard.press("Escape");
  await d.p.waitForTimeout(150);
  const closed = await d.p.locator("#back.on").count();
  if (!closed) pass("escape closes modal"); else fail("escape did not close");

  await d.p.reload({ waitUntil: "networkidle" });
  await d.p.waitForTimeout(300);
  const badge = await d.p.locator("#tmQuizBadge").textContent();
  if (/Quick checks [1-9]\/10/.test(badge || "")) pass("quiz persists after reload (" + badge + ")"); else fail("badge after reload " + badge);

  // links clickable
  const linkInfo = await d.p.evaluate(() => {
    const as = [...document.querySelectorAll("a[href]")];
    const disabled = as.filter((a) => a.getAttribute("href") === "" || a.hasAttribute("disabled") || getComputedStyle(a).pointerEvents === "none");
    const ext = as.filter((a) => /^https?:/i.test(a.href) && !/\.govassured\.com/i.test(a.hostname));
    const ga = as.filter((a) => /\.govassured\.com/i.test(a.hostname));
    return { total: as.length, ext: ext.length, ga: ga.length, disabled: disabled.length };
  });
  if (linkInfo.total > 10 && linkInfo.disabled === 0) pass("links clickable (" + linkInfo.total + " hrefs, " + linkInfo.ext + " external)"); else fail("links issue " + JSON.stringify(linkInfo));

  // tabs
  await d.p.locator("#tab-whatsnew").click();
  await d.p.waitForTimeout(200);
  const wn = await d.p.locator("#view-whatsnew:not([hidden]) .wn-group").count();
  if (wn >= 5) pass("whats new tab (" + wn + " groups)"); else fail("whats new groups " + wn);
  await d.p.locator("#tab-example").click();
  await d.p.waitForTimeout(200);
  const ex = await d.p.locator("#view-example:not([hidden]) .ex-steps li").count();
  if (ex === 10) pass("example 10 steps"); else fail("example steps " + ex);
  await d.p.locator("#tab-glossary").click();
  await d.p.waitForTimeout(200);
  const gl = await d.p.locator("#view-glossary:not([hidden]) .tm-gloss__list li").count();
  if (gl === 46) pass("glossary 46 terms"); else fail("glossary " + gl);

  if (d.p.errs.length === 0) pass("desktop 0 console errors"); else fail("desktop console " + JSON.stringify(d.p.errs));
  if (d.p.csp.length === 0) pass("desktop 0 CSP messages"); else fail("desktop CSP " + JSON.stringify(d.p.csp));
  await d.ctx.close();

  // ---- MOBILE ----
  const m = await makePage(390, 844);
  await m.p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
  await m.p.waitForTimeout(400);
  await m.p.screenshot({ path: path.join(SHOTS, "v4b-mobile-landing.png"), fullPage: true });
  const ovM = await overflow(m.p);
  if (ovM.extra <= 2) pass("mobile landing no overflow (" + ovM.extra + ")"); else fail("mobile landing overflow " + ovM.extra + " " + JSON.stringify(ovM.samples));
  const mc = await m.p.locator("#domains .cell").count();
  if (mc === 10) pass("mobile 10 cards"); else fail("mobile cards " + mc);
  const mRel = await m.p.evaluate(() => {
    const mastText = (document.querySelector(".mast") || {}).innerText || "";
    const footerText = (document.querySelector("footer") && document.querySelector("footer").innerText) || "";
    const tools = document.querySelector(".tools");
    const stages = document.querySelector("#domains") && document.querySelector("#domains").closest(".sec");
    const cat = [...document.querySelectorAll(".dark .h")].find((h) => /CURRENT CATALOGUES/.test(h.textContent || ""));
    const catBar = cat && cat.closest(".dark");
    return {
      mastHasRelated: /Related:/i.test(mastText),
      footerHasRelated: /Related:/i.test(footerText),
      immediatelyAfterTools: !!(tools && stages && tools.nextElementSibling === stages),
      stagesAboveCat: !!(stages && catBar && (stages.compareDocumentPosition(catBar) & Node.DOCUMENT_POSITION_FOLLOWING)),
    };
  });
  if (!mRel.mastHasRelated && mRel.footerHasRelated && mRel.immediatelyAfterTools && mRel.stagesAboveCat) pass("mobile layout: no mast Related, stages above catalogues"); else fail("mobile layout " + JSON.stringify(mRel));
  await m.p.locator("#domains .cell").first().click();
  await m.p.waitForTimeout(300);
  if (await m.p.locator("#back.on").count()) pass("mobile modal opens from card"); else fail("mobile modal closed");
  const ovMs = await overflow(m.p);
  if (ovMs.extra <= 2) pass("mobile stage no overflow (" + ovMs.extra + ")"); else fail("mobile stage overflow " + ovMs.extra + " " + JSON.stringify(ovMs.samples));
  await m.p.locator("#tmNext").click();
  await m.p.waitForTimeout(200);
  const mt = await m.p.locator("#mtitle").textContent();
  if (/landscape/i.test(mt || "")) pass("mobile next works"); else fail("mobile next " + mt);
  await m.p.locator("#tmPrev").click();
  await m.p.waitForTimeout(200);
  const mt1 = await m.p.locator("#mtitle").textContent();
  if (/Scope/i.test(mt1 || "")) pass("mobile prev works"); else fail("mobile prev " + mt1);
  if (m.p.errs.length === 0) pass("mobile 0 console errors"); else fail("mobile console " + JSON.stringify(m.p.errs));
  await m.ctx.close();

  await browser.close();
  const result = { ok: fails.length === 0, fails };
  fs.writeFileSync(path.join(__dirname, "test-v4b-result.json"), JSON.stringify(result, null, 2));
  console.log(fails.length ? "RESULT FAIL " + fails.length : "RESULT PASS");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
