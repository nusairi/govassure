/* Local Playwright test for v4 DevSecOps-style layout: desktop 1280 + mobile 390. */
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

  const disc = await d.p.evaluate(() => {
    const t = document.body.innerText;
    return /not a government website/i.test(t) && !/footer|legal/i.test("x");
  });
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

  await d.p.screenshot({ path: path.join(SHOTS, "v4-landing-desktop.png"), fullPage: true });
  await d.p.screenshot({ path: path.join(SHOTS, "v4-landing-desktop-hero.png"), fullPage: false });

  const ov0 = await overflow(d.p);
  if (ov0.extra <= 2) pass("desktop landing no overflow (" + ov0.extra + ")"); else fail("desktop landing overflow " + ov0.extra + " " + JSON.stringify(ov0.samples));

  // open stage 1 via pipeline
  await d.p.locator("#life .cell").first().click();
  await d.p.waitForTimeout(300);
  const modalOn = await d.p.locator("#back.on").count();
  if (modalOn) pass("desktop modal opens"); else fail("desktop modal did not open");
  const mtitle = await d.p.locator("#mtitle").textContent();
  if (/Scope/.test(mtitle || "")) pass("desktop stage 1 title"); else fail("desktop stage title " + mtitle);
  const purposeOpen = await d.p.evaluate(() => {
    const secs = [...document.querySelectorAll("#mbody .tm-sec h3")].map((h) => h.textContent);
    return secs.includes("What it is") && secs.includes("What you do");
  });
  if (purposeOpen) pass("purpose and what you do open"); else fail("missing open sections");
  const closedAcc = await d.p.locator("#mbody details.tm-acc:not([open])").count();
  if (closedAcc >= 4) pass("other sections collapsed (" + closedAcc + ")"); else fail("expected collapsed sections, got " + closedAcc);

  await d.p.screenshot({ path: path.join(SHOTS, "v4-stage-open-desktop.png"), fullPage: false });

  // Next + keyboard
  await d.p.locator("#tmNext").click();
  await d.p.waitForTimeout(200);
  const t2 = await d.p.locator("#mtitle").textContent();
  if (/landscape/i.test(t2 || "")) pass("next to stage 2"); else fail("next title " + t2);
  await d.p.keyboard.press("ArrowRight");
  await d.p.waitForTimeout(200);
  const t3 = await d.p.locator("#mtitle").textContent();
  if (/Model/.test(t3 || "")) pass("arrow to stage 3"); else fail("arrow title " + t3);

  // reach all 10 via dots
  for (let n = 1; n <= 10; n++) {
    await d.p.locator(".dots button").nth(n - 1).click();
    await d.p.waitForTimeout(80);
  }
  const t10 = await d.p.locator("#mtitle").textContent();
  if (/Keep it continuous|Continuous/.test(t10 || "")) pass("all 10 stages reachable via dots"); else fail("stage 10 title " + t10);

  // depth toggle
  await d.p.locator(".dots button").first().click();
  await d.p.waitForTimeout(150);
  const depths = await d.p.locator(".tm-depth button").count();
  if (depths === 3) pass("depth toggle present"); else fail("depth count " + depths);
  await d.p.locator('.tm-depth button[data-depth="architect"]').click();
  await d.p.waitForTimeout(100);
  const archOn = await d.p.locator('.tm-depth button[data-depth="architect"]').getAttribute("aria-selected");
  if (archOn === "true") pass("architect depth selected"); else fail("architect not selected");

  // quiz persist
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
    const ext = as.filter((a) => /^https?:/i.test(a.href) && !/\.govassured\.com/i.test(a.hostname));
    const ga = as.filter((a) => /\.govassured\.com/i.test(a.hostname));
    const badExt = ext.filter((a) => a.target !== "_blank" || !a.hasAttribute("data-ga-keep") && !a.hasAttribute("data-keep") && !a.closest("[data-ga-keep],#tmSources,footer"));
    const badGa = ga.filter((a) => a.target === "_blank" && !/linkedin|github/i.test(a.href));
    return { total: as.length, ext: ext.length, ga: ga.length, badExt: badExt.map((a) => a.href).slice(0, 5), badGa: badGa.map((a) => a.href).slice(0, 5) };
  });
  if (linkInfo.total > 10) pass("links present (" + linkInfo.total + " hrefs, " + linkInfo.ext + " external)"); else fail("too few links " + JSON.stringify(linkInfo));

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
  await m.p.screenshot({ path: path.join(SHOTS, "v4-mobile-landing.png"), fullPage: true });
  const ovM = await overflow(m.p);
  if (ovM.extra <= 2) pass("mobile landing no overflow (" + ovM.extra + ")"); else fail("mobile landing overflow " + ovM.extra + " " + JSON.stringify(ovM.samples));
  const mc = await m.p.locator("#domains .cell").count();
  if (mc === 10) pass("mobile 10 cards"); else fail("mobile cards " + mc);
  await m.p.locator("#domains .cell").first().click();
  await m.p.waitForTimeout(300);
  if (await m.p.locator("#back.on").count()) pass("mobile modal opens"); else fail("mobile modal closed");
  await m.p.screenshot({ path: path.join(SHOTS, "v4-mobile-stage.png"), fullPage: false });
  const ovMs = await overflow(m.p);
  if (ovMs.extra <= 2) pass("mobile stage no overflow (" + ovMs.extra + ")"); else fail("mobile stage overflow " + ovMs.extra + " " + JSON.stringify(ovMs.samples));
  await m.p.locator("#tmNext").click();
  await m.p.waitForTimeout(200);
  const mt = await m.p.locator("#mtitle").textContent();
  if (/landscape/i.test(mt || "")) pass("mobile next works"); else fail("mobile next " + mt);
  if (m.p.errs.length === 0) pass("mobile 0 console errors"); else fail("mobile console " + JSON.stringify(m.p.errs));
  await m.ctx.close();

  await browser.close();
  const result = { ok: fails.length === 0, fails };
  fs.writeFileSync(path.join(__dirname, "test-v4-result.json"), JSON.stringify(result, null, 2));
  console.log(fails.length ? "RESULT FAIL " + fails.length : "RESULT PASS");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
