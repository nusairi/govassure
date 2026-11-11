/* Local Playwright test for the v2 tour redesign: desktop 1280 + mobile 390. */
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

  async function overflow(p) {
    return p.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const bad = [];
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > w + 1 || r.right > w + 2) {
          if (r.width === 0) return;
          const tag = el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + String(el.className).trim().split(/\s+/).slice(0, 2).join(".") : "");
          bad.push({ tag, width: Math.round(r.width), right: Math.round(r.right), vw: w });
        }
      });
      return { scrollWidth: document.documentElement.scrollWidth, clientWidth: w, overflow: document.documentElement.scrollWidth > w + 2, samples: bad.slice(0, 8) };
    });
  }

  // ---- Desktop landing ----
  const d = await makePage(1280, 900);
  const p = d.p;
  const resp = await p.goto(BASE + "/", { waitUntil: "networkidle" });
  if (!resp || resp.status() !== 200) fail("home status " + (resp && resp.status()));
  else pass("home 200");
  await p.waitForTimeout(400);

  const home = await p.evaluate(() => ({
    title: document.title,
    brand: document.querySelector(".ga-brandbar a.ga-brandbar__home")?.getAttribute("href"),
    logoOk: !!(document.querySelector(".ga-brandbar img") && document.querySelector(".ga-brandbar img").naturalWidth > 0),
    start: !!document.getElementById("tmStartTour"),
    ringNodes: document.querySelectorAll("#tmRing .tm-node").length,
    listBtns: document.querySelectorAll(".tm-list-btn").length,
    tourHidden: document.getElementById("lifecycle")?.hidden === true || !document.getElementById("lifecycle")?.classList.contains("is-on"),
    wnInDom: (document.querySelector("#tmWhatsNew")?.textContent || "").length > 200,
    example: (document.querySelector("#tmExample")?.textContent || "").includes("Continuity Plan Helper") || (document.querySelector("#ex-h")?.textContent || "").includes("Continuity Plan Helper"),
    disclaimer: document.body.innerText.includes("not a government website") && document.body.innerText.includes("not affiliated with NCSC"),
    community: document.body.innerText.includes("community resource") && document.body.innerText.includes("not official guidance"),
    names: [...document.body.innerText.matchAll(/\b(Adam|John|Schneier|Nusairi)\b/g)].map((m) => m[1]),
    github: [...document.querySelectorAll("a[href*='github.com']")].map((a) => a.href),
    linkedin: [...document.querySelectorAll("a[href*='linkedin.com']")].map((a) => a.href),
    heroBusy: (document.querySelector(".tm-hero")?.innerText || "").length,
    csp: window.__csp || [],
  }));
  if (home.brand !== "https://www.govassured.com/") fail("logo href " + home.brand);
  else pass("logo -> www.govassured.com");
  if (!home.logoOk) fail("logo image"); else pass("logo image loaded");
  if (!home.start) fail("missing Start the tour"); else pass("Start the tour present");
  if (home.ringNodes !== 10) fail("ring nodes " + home.ringNodes); else pass("10 ring nodes");
  if (home.listBtns !== 10) fail("list buttons " + home.listBtns); else pass("10 list buttons");
  if (!home.tourHidden) fail("tour should be hidden on landing"); else pass("landing hides the tour");
  if (!home.wnInDom) fail("what's new missing from DOM"); else pass("what's new in DOM");
  if (!home.example) fail("worked example missing"); else pass("worked example present");
  if (!home.disclaimer || !home.community) fail("disclaimer/community wording"); else pass("disclaimer present");
  if (home.names.length) fail("personal names " + home.names.join(",")); else pass("no personal names in body text");
  if (home.github.some((u) => !/^https:\/\/github.com\/nusairi\/govassure\/?$/.test(u))) fail("unexpected github " + home.github);
  else pass("github only nusairi/govassure (" + home.github.length + ")");
  if (home.linkedin.some((u) => !/^https:\/\/www.linkedin.com\/company\/102617034\/?$/.test(u))) fail("unexpected linkedin");
  else pass("linkedin company page");
  if (p.errs.length) fail("console errors on home: " + p.errs.join(" | ")); else pass("no console errors on home");
  if (home.csp.length || p.csp.length) fail("CSP " + home.csp.concat(p.csp)); else pass("no CSP violations");

  await p.screenshot({ path: path.join(SHOTS, "v2-landing-desktop.png"), fullPage: true });
  pass("screenshot v2-landing-desktop");

  const ovD = await overflow(p);
  if (ovD.overflow) fail("desktop overflow scrollWidth=" + ovD.scrollWidth + " " + JSON.stringify(ovD.samples));
  else pass("no desktop horizontal overflow on landing");

  // What's new view
  await p.locator("#tmNavWhatsNew").click();
  await p.waitForTimeout(250);
  const wnVis = await p.locator("#whatsnew").isVisible();
  const wnItems = await p.locator("#tmWhatsNew .wn-item").count();
  const wnOpen = await p.locator("#tmWhatsNew .wn-item[open]").count();
  if (!wnVis) fail("what's new view not visible"); else pass("what's new view visible");
  if (wnItems < 20) fail("what's new items " + wnItems); else pass("what's new items " + wnItems);
  if (wnOpen !== 0) fail("what's new items should start collapsed, open=" + wnOpen); else pass("what's new items collapsed");
  await p.screenshot({ path: path.join(SHOTS, "v2-whats-new.png"), fullPage: false });
  await p.locator("#tmWhatsNew .wn-item summary").first().click();
  await p.waitForTimeout(150);
  const opened = await p.locator("#tmWhatsNew .wn-item").first().getAttribute("open");
  if (opened === null) fail("read more did not expand"); else pass("what's new Read more expands");

  // Start the tour -> stage 1
  await p.locator("#tmNavHome").click();
  await p.waitForTimeout(200);
  await p.locator("#tmStartTour").click();
  await p.waitForTimeout(300);
  const t1 = await p.evaluate(() => ({
    title: document.getElementById("tmPanelTitle")?.textContent || "",
    view: document.getElementById("lifecycle")?.hidden,
    one: (document.querySelector(".tm-oneliner")?.innerText || ""),
    doVis: [...document.querySelectorAll(".tm-sec")].some((s) => /What you do/i.test(s.innerText) && s.offsetParent !== null),
    openAcc: document.querySelectorAll("#tmPanel details[open]").length,
    acc: document.querySelectorAll("#tmPanel details").length,
  }));
  if (!/Scope/.test(t1.title)) fail("start tour stage 1: " + t1.title); else pass("start tour opens stage 1: " + t1.title);
  if (t1.view) fail("tour still hidden"); else pass("tour visible");
  if (!t1.doVis) fail("What you do not visible by default"); else pass("Purpose + What you do shown by default");
  if (t1.acc < 5) fail("expected collapsed sections, got " + t1.acc); else pass("progressive disclosure sections: " + t1.acc);
  await p.screenshot({ path: path.join(SHOTS, "v2-tour-stage1-desktop.png"), fullPage: false });
  pass("screenshot v2-tour-stage1-desktop");

  // Sources expanded on stage 5 via progress bar (landing ring is hidden during the tour)
  await p.locator('.tm-steps button[data-id="threats"]').click();
  await p.waitForTimeout(250);
  const st5 = await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || "");
  if (!/Identify threats/i.test(st5)) fail("click threats ring -> " + st5); else pass("progress-bar click opened: " + st5);
  await p.locator('#tmPanel details[data-section="sources"] > summary').click();
  await p.waitForTimeout(200);
  await p.locator('#tmPanel details[data-section="sources"]').scrollIntoViewIfNeeded();
  await p.waitForTimeout(100);
  const srcOpen = await p.locator('#tmPanel details[data-section="sources"]').getAttribute("open");
  const srcLinks = await p.locator('#tmPanel details[data-section="sources"] a[href]').count();
  if (srcOpen === null) fail("sources did not expand"); else pass("sources expanded, links " + srcLinks);
  if (srcLinks < 5) fail("too few source links " + srcLinks);
  await p.screenshot({ path: path.join(SHOTS, "v2-stage-sources-expanded.png"), fullPage: false });
  pass("screenshot v2-stage-sources-expanded");

  // Quick check
  const quizAcc = p.locator('#tmPanel details[data-section="quiz"]');
  const quizOpenAlready = await quizAcc.getAttribute("open");
  if (quizOpenAlready === null) await quizAcc.locator("summary").click();
  await p.waitForTimeout(150);
  const firstWrong = p.locator(".tm-quiz__opt").nth(1);
  await firstWrong.click();
  await p.waitForTimeout(150);
  const badClass = await p.locator(".tm-quiz__fb").getAttribute("class");
  if (!/is-bad/.test(badClass || "")) fail("wrong quiz answer not marked"); else pass("wrong quiz answer marked");
  await p.locator(".tm-quiz__opt").nth(0).click();
  await p.waitForTimeout(150);
  await p.locator("#tmQuizAcc").scrollIntoViewIfNeeded();
  const okClass = await p.locator(".tm-quiz__fb").getAttribute("class");
  const badge = await p.locator("#tmQuizBadge").innerText();
  if (!/is-ok/.test(okClass || "")) fail("correct quiz answer not marked"); else pass("correct quiz answer marked");
  if (!/1\/10/.test(badge)) fail("badge after one correct: " + badge); else pass("badge " + badge);
  await p.screenshot({ path: path.join(SHOTS, "v2-quick-check.png"), fullPage: false });
  pass("screenshot v2-quick-check");

  // persist reload via ?stage=
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const after = await p.evaluate(() => ({
    title: document.getElementById("tmPanelTitle")?.textContent || "",
    badge: document.getElementById("tmQuizBadge")?.textContent || "",
    view: document.getElementById("lifecycle")?.hidden,
  }));
  if (!/Identify threats/i.test(after.title) || after.view) fail("stage query persist " + JSON.stringify(after));
  else pass("?stage= persist");
  if (!/1\/10/.test(after.badge)) fail("quiz localStorage persist " + JSON.stringify(after));
  else pass("quiz persisted in localStorage: " + after.badge);
  // open quiz to confirm saved option
  const q2 = p.locator('#tmPanel details[data-section="quiz"]');
  if ((await q2.getAttribute("open")) === null) await q2.locator("summary").click();
  await p.waitForTimeout(100);
  const saved = await p.locator(".tm-quiz__opt.is-ok").count();
  if (!saved) fail("saved quiz option not marked after reload"); else pass("saved quiz option visible after reload");

  // depth toggle
  await p.locator('.tm-depth button[data-depth="architect"]').click();
  await p.waitForTimeout(150);
  const depthOn = await p.locator('.tm-depth button[data-depth="architect"]').getAttribute("aria-selected");
  if (depthOn !== "true") fail("architect toggle"); else pass("Basics/Practitioner/Architect toggle works");

  // term chip
  const termsAcc = p.locator('#tmPanel details[data-section="terms"]');
  if ((await termsAcc.getAttribute("open")) === null) await termsAcc.locator("summary").click();
  await p.waitForTimeout(100);
  const chip = p.locator(".tm-chip-btn").first();
  if (await chip.count()) {
    await chip.click();
    await p.waitForTimeout(200);
    const ov = await p.locator("#tmOverlay").isVisible();
    if (!ov) fail("chip overlay not visible"); else pass("term chip opens overlay");
    await p.locator(".tm-overlay__x").click();
    await p.waitForTimeout(150);
  } else fail("no term chips on stage");

  // glossary page
  await p.locator("#tmGlossBtn").click();
  await p.waitForTimeout(250);
  const gvis = await p.locator("#glossary").isVisible();
  const gcount = await p.locator("#tmGlossaryPage .tm-gloss__list li").count();
  if (!gvis || gcount < 40) fail("glossary " + gvis + " items " + gcount);
  else pass("glossary page with " + gcount + " terms");

  // walk all 10 via Next from stage 1, then ring, then keyboard
  await p.locator("#tmStartTour").click().catch(() => {});
  await p.locator("#tmNavTour").click();
  await p.waitForTimeout(150);
  // jump to scope via steps
  await p.locator('.tm-steps button[data-id="scope"]').click();
  await p.waitForTimeout(150);
  const viaNext = [];
  viaNext.push(await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || ""));
  for (let i = 0; i < 9; i++) {
    await p.locator("#tmTourNav button.tm-next").click();
    await p.waitForTimeout(80);
    viaNext.push(await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || ""));
  }
  if (viaNext.length !== 10 || viaNext.some((t) => !t)) fail("Next click-through " + JSON.stringify(viaNext));
  else pass("Next click-through all 10 stages");

  // list on the landing, plus tour ring
  const viaList = [];
  for (const id of ["scope","landscape","model","boundaries","threats","prioritise","mitigate","validate","record","continuous"]) {
    await p.locator("#tmNavHome").click();
    await p.waitForTimeout(50);
    await p.locator('.tm-list-btn[data-id="' + id + '"]').click();
    await p.waitForTimeout(60);
    viaList.push(await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || ""));
  }
  if (viaList.length !== 10 || viaList.some((t) => !t)) fail("list click-through " + JSON.stringify(viaList));
  else pass("list click-through all 10 stages");

  // tour ring (inside the jump disclosure)
  await p.locator("#tmJumpMini > summary").click();
  await p.waitForTimeout(80);
  await p.locator('#tmTourRing .tm-node[data-id="mitigate"]').click();
  await p.waitForTimeout(150);
  const ringTitle = await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || "");
  if (!/Decide mitigations|Mitigate/i.test(ringTitle)) fail("tour ring click -> " + ringTitle);
  else pass("tour ring jump works: " + ringTitle);

  // keyboard arrows: start at scope, right 2 times
  await p.locator('.tm-steps button[data-id="scope"]').click();
  await p.waitForTimeout(100);
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(80);
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(80);
  const keyTitle = await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || "");
  if (!/Model the real system/i.test(keyTitle)) fail("keyboard arrows -> " + keyTitle);
  else pass("keyboard arrows move stages: " + keyTitle);
  await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(80);
  const keyBack = await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || "");
  if (!/landscape|Refresh/i.test(keyBack)) fail("keyboard left -> " + keyBack);
  else pass("keyboard left works: " + keyBack);

  // link audit across views (show each view so links are in the tree; they stay in DOM anyway)
  const viewsToVisit = ["home", "whatsnew", "tour", "example", "glossary"];
  const allHrefs = new Set();
  for (const v of viewsToVisit) {
    if (v === "tour") await p.locator("#tmNavTour").click();
    else await p.locator('#tmAppNav button[data-view="' + v + '"]').click();
    await p.waitForTimeout(80);
  }
  // expand footer sources and what's new first item already open maybe
  await p.locator("#tmSourcesAcc > summary").click().catch(() => {});
  await p.waitForTimeout(80);
  const links = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      out.push({
        href: a.href || href,
        raw: href,
        target: a.getAttribute("target") || "",
        rel: a.getAttribute("rel") || "",
        keep: a.hasAttribute("data-ga-keep") || a.hasAttribute("data-keep") || !!a.closest("[data-ga-keep],#tmSources,#tmOverlay,.tm-page"),
        text: (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
      });
    });
    const delinked = document.querySelectorAll("a.ga-delinked, a[data-ga-src]").length;
    return { out, delinked, noHref: document.querySelectorAll("a:not([href])").length };
  });
  if (links.delinked) fail("ga-sources stripped links: " + links.delinked);
  else pass("no delinked source links");
  let ext = 0, same = 0, badTarget = 0;
  for (const L of links.out) {
    const extHttp = /^https?:/i.test(L.href);
    const ga = /govassured\.com/i.test(L.href);
    if (extHttp && !ga) {
      ext++;
      if (L.target !== "_blank") { badTarget++; fail("ext link missing _blank: " + L.href); }
    }
    if (ga) {
      same++;
      if (L.target === "_blank") { badTarget++; fail("govassured link should be same tab: " + L.href); }
    }
  }
  if (links.out.length < 80) fail("too few links still present: " + links.out.length);
  else pass("in-page links: " + links.out.length + " hrefs, " + ext + " external new-tab, " + same + " govassured same-tab");

  const ovTour = await overflow(p);
  if (ovTour.overflow) fail("desktop overflow on tour/other view " + JSON.stringify(ovTour.samples));
  else pass("no desktop horizontal overflow after tour");

  // 404
  const r404page = await p.goto(BASE + "/ga-404.html", { waitUntil: "networkidle" });
  if (!r404page || r404page.status() !== 200) fail("ga-404.html status");
  const t404 = await p.evaluate(() => ({ title: document.title, brand: document.querySelector(".ga-brandbar a")?.href, home: !!document.querySelector('a[href="/"]') }));
  if (!/Page not found/.test(t404.title) || t404.brand !== "https://www.govassured.com/") fail("404 content " + JSON.stringify(t404));
  else pass("404 page branded");

  await d.ctx.close();

  // ---- Mobile 390 ----
  const m = await makePage(390, 844);
  const mp = m.p;
  const mresp = await mp.goto(BASE + "/", { waitUntil: "networkidle" });
  if (!mresp || mresp.status() !== 200) fail("mobile home status");
  await mp.waitForTimeout(400);
  if (mp.errs.length) fail("mobile console errors: " + mp.errs.join(" | ")); else pass("no mobile console errors");
  const ovM = await overflow(mp);
  if (ovM.overflow) fail("mobile overflow scrollWidth=" + ovM.scrollWidth + " " + JSON.stringify(ovM.samples));
  else pass("no mobile horizontal overflow on landing");
  await mp.screenshot({ path: path.join(SHOTS, "v2-mobile-landing.png"), fullPage: true });
  pass("screenshot v2-mobile-landing");

  await mp.locator('.tm-list-btn[data-id="model"]').click();
  await mp.waitForTimeout(300);
  const mt = await mp.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || "");
  if (!/Model the real system/i.test(mt)) fail("mobile stage open " + mt); else pass("mobile stage open: " + mt);
  const ovMS = await overflow(mp);
  if (ovMS.overflow) fail("mobile stage overflow " + JSON.stringify(ovMS.samples));
  else pass("no mobile horizontal overflow on stage");
  await mp.screenshot({ path: path.join(SHOTS, "v2-mobile-stage.png"), fullPage: false });
  pass("screenshot v2-mobile-stage");

  const quizM = mp.locator('#tmPanel details[data-section="quiz"]');
  if ((await quizM.getAttribute("open")) === null) await quizM.locator("summary").click();
  await mp.waitForTimeout(100);
  await mp.locator(".tm-quiz__opt").first().click();
  await mp.waitForTimeout(150);
  const mb = await mp.locator("#tmQuizBadge").innerText();
  if (!/\d+\/10/.test(mb)) fail("mobile quiz badge " + mb); else pass("mobile quiz works, badge " + mb);

  // sticky prev/next present
  const sticky = await mp.evaluate(() => {
    const nav = document.getElementById("tmTourNav");
    if (!nav) return null;
    const cs = getComputedStyle(nav);
    const r = nav.getBoundingClientRect();
    return { pos: cs.position, bottom: r.bottom, vh: window.innerHeight, visible: r.height > 0 };
  });
  if (!sticky || !sticky.visible) fail("mobile prev/next missing");
  else if (sticky.pos !== "sticky" && sticky.pos !== "fixed") fail("mobile prev/next not sticky: " + JSON.stringify(sticky));
  else pass("mobile prev/next is " + sticky.pos);

  await m.ctx.close();
  await browser.close();

  const result = { fails, ok: fails.length === 0, shots: fs.readdirSync(SHOTS).filter((n) => n.startsWith("v2-")) };
  fs.writeFileSync(path.join(__dirname, "test-v2-result.json"), JSON.stringify(result, null, 2));
  console.log(result.ok ? "ALL PASS" : "FAILED " + fails.length);
  console.log("shots", result.shots.join(", "));
  process.exit(result.ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
