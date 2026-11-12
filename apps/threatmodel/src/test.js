/* Local Playwright test: desktop 1280 + mobile 390. */
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

  // ---- Desktop home ----
  const d = await makePage(1280, 900);
  const p = d.p;
  const resp = await p.goto(BASE + "/", { waitUntil: "networkidle" });
  if (!resp || resp.status() !== 200) fail("home status " + (resp && resp.status()));
  else pass("home 200");
  await p.waitForTimeout(400);
  const home = await p.evaluate(() => ({
    title: document.title,
    brand: document.querySelector(".ga-brandbar a.ga-brandbar__home")?.getAttribute("href"),
    brandAlt: document.querySelector(".ga-brandbar img")?.getAttribute("alt"),
    logoOk: !!(document.querySelector(".ga-brandbar img") && document.querySelector(".ga-brandbar img").naturalWidth > 0),
    favicon: document.querySelector('link[rel="icon"][sizes]')?.getAttribute("href") || "",
    stages: document.querySelectorAll(".tm-node, .tm-list-btn").length,
    ringNodes: document.querySelectorAll(".tm-node").length,
    listBtns: document.querySelectorAll(".tm-list-btn").length,
    wn: !!document.querySelector("#whatsnew") && (document.querySelector("#tmWhatsNew")?.innerText || "").length > 200,
    wnHeading: document.getElementById("wn-h")?.textContent || "",
    example: (document.querySelector("#tmExample")?.innerText || "").includes("Continuity Plan Helper") || (document.querySelector("#ex-h")?.textContent || "").includes("Continuity Plan Helper"),
    disclaimer: document.body.innerText.includes("not a government website") && document.body.innerText.includes("not affiliated with NCSC"),
    community: document.body.innerText.includes("community resource") && document.body.innerText.includes("not official guidance"),
    names: [...document.body.innerText.matchAll(/\b(Adam|John|Schneier|Nusairi)\b/g)].map((m) => m[1]),
    github: [...document.querySelectorAll("a[href*='github.com']")].map((a) => a.href),
    linkedin: [...document.querySelectorAll("a[href*='linkedin.com']")].map((a) => a.href),
    panelTitle: document.getElementById("tmPanelTitle")?.textContent || "",
    csp: window.__csp || [],
  }));
  if (home.brand !== "https://www.govassured.com/") fail("logo href " + home.brand);
  else pass("logo -> www.govassured.com");
  if (!home.logoOk) fail("logo image"); else pass("logo image loaded");
  if (home.ringNodes !== 10) fail("ring nodes " + home.ringNodes); else pass("10 ring nodes");
  if (home.listBtns !== 10) fail("list buttons " + home.listBtns); else pass("10 list buttons");
  if (!home.wn) fail("what's new empty"); else pass("what's new present: " + home.wnHeading);
  if (!home.example) fail("worked example missing"); else pass("worked example present");
  if (!home.disclaimer || !home.community) fail("disclaimer/community wording"); else pass("disclaimer present");
  if (home.names.length) fail("personal names " + home.names.join(",")); else pass("no personal names in body text");
  if (home.github.some((u) => !/^https:\/\/github.com\/nusairi\/govassure\/?$/.test(u))) fail("unexpected github " + home.github);
  else pass("github only nusairi/govassure (" + home.github.length + ")");
  if (home.linkedin.some((u) => !/^https:\/\/www\.linkedin\.com\/company\/102617034\/?$/.test(u))) fail("unexpected linkedin");
  else pass("linkedin company page");
  if (!/Scope/.test(home.panelTitle)) fail("default panel " + home.panelTitle); else pass("default stage open: " + home.panelTitle);
  if (p.errs.length) fail("console errors on home: " + p.errs.join(" | ")); else pass("no console errors on home");
  if (home.csp.length || p.csp.length) fail("CSP " + home.csp.concat(p.csp)); else pass("no CSP violations");

  await p.screenshot({ path: path.join(SHOTS, "home-desktop.png"), fullPage: true });
  const wn = p.locator("#whatsnew");
  await wn.scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(SHOTS, "whats-new.png"), fullPage: false });
  pass("screenshots home-desktop + whats-new");

  const ovD = await overflow(p);
  if (ovD.overflow) fail("desktop overflow scrollWidth=" + ovD.scrollWidth + " " + JSON.stringify(ovD.samples));
  else pass("no desktop horizontal overflow");

  // Link audit on the page: href presence + target rules
  const links = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      out.push({
        href: a.href || href,
        raw: href,
        target: a.getAttribute("target") || "",
        rel: a.getAttribute("rel") || "",
        keep: a.hasAttribute("data-ga-keep") || !!a.closest("[data-ga-keep],#tmSources,#tmOverlay,.tm-page"),
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
  pass("in-page links: " + links.out.length + " hrefs, " + ext + " external new-tab, " + same + " govassured same-tab");

  // Stage click-through (ring + next)
  await p.locator('.tm-node[data-id="threats"]').click();
  await p.waitForTimeout(200);
  const st5 = await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || "");
  if (!/Identify threats/i.test(st5)) fail("click threats ring -> " + st5); else pass("ring click opened: " + st5);
  await p.screenshot({ path: path.join(SHOTS, "stage-open-desktop.png"), fullPage: false });

  // Quiz on stage 5
  const quizBefore = await p.locator("#tmQuizBadge").innerText();
  const firstWrong = p.locator(".tm-quiz__opt").nth(1);
  await firstWrong.click();
  await p.waitForTimeout(150);
  const badFb = await p.locator(".tm-quiz__fb").innerText();
  const badClass = await p.locator(".tm-quiz__fb").getAttribute("class");
  if (!/is-bad/.test(badClass || "")) fail("wrong quiz answer not marked"); else pass("wrong quiz answer marked");
  const firstOk = p.locator(".tm-quiz__opt").nth(0);
  await firstOk.click();
  await p.waitForTimeout(150);
  const okClass = await p.locator(".tm-quiz__fb").getAttribute("class");
  const badge = await p.locator("#tmQuizBadge").innerText();
  if (!/is-ok/.test(okClass || "")) fail("correct quiz answer not marked"); else pass("correct quiz answer marked");
  if (!/1\/10/.test(badge)) fail("badge after one correct: " + badge); else pass("badge " + badge);

  // persist reload
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  // should reopen threats via ?stage=
  const after = await p.evaluate(() => ({
    title: document.getElementById("tmPanelTitle")?.textContent || "",
    badge: document.getElementById("tmQuizBadge")?.textContent || "",
    saved: document.querySelector(".tm-quiz__opt.is-ok") ? true : false,
  }));
  if (!/Identify threats/i.test(after.title)) fail("stage query persist " + after.title); else pass("?stage= persist");
  if (!after.saved || !/1\/10/.test(after.badge)) fail("quiz localStorage persist " + JSON.stringify(after));
  else pass("quiz persisted in localStorage: " + after.badge);

  // depth toggle
  await p.locator('.tm-depth button[data-depth="architect"]').click();
  await p.waitForTimeout(150);
  const depthOn = await p.locator('.tm-depth button[data-depth="architect"]').getAttribute("aria-selected");
  if (depthOn !== "true") fail("architect toggle"); else pass("Basics/Practitioner/Architect toggle works");

  // term chip + glossary
  const chip = p.locator(".tm-chip-btn").first();
  if (await chip.count()) {
    await chip.click();
    await p.waitForTimeout(200);
    const ov = await p.locator("#tmOverlay").isVisible();
    if (!ov) fail("chip overlay not visible"); else pass("term chip opens overlay");
    await p.locator(".tm-overlay__x").click();
    await p.waitForTimeout(150);
  } else fail("no term chips on stage");

  await p.locator("#tmGlossBtn").click();
  await p.waitForTimeout(200);
  const gvis = await p.locator("#tmOverlay").isVisible();
  const gcount = await p.locator(".tm-gloss__list li").count();
  if (!gvis || gcount < 40) fail("glossary " + gvis + " items " + gcount);
  else pass("glossary open with " + gcount + " terms");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(100);

  // walk remaining stages via list and next
  const titles = [];
  for (const id of ["scope","landscape","model","boundaries","threats","prioritise","mitigate","validate","record","continuous"]) {
    await p.locator('.tm-list-btn[data-id="' + id + '"]').click();
    await p.waitForTimeout(80);
    titles.push(await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || ""));
  }
  if (titles.length !== 10 || titles.some((t) => !t)) fail("stage list click-through " + JSON.stringify(titles));
  else pass("list click-through all 10 stages");

  // 404 page
  const r404 = await p.goto(BASE + "/no-such-page", { waitUntil: "networkidle" });
  // python http.server returns 404 without rewrite — check ga-404.html directly
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
  else pass("no mobile horizontal overflow");
  await mp.screenshot({ path: path.join(SHOTS, "home-mobile.png"), fullPage: true });

  await mp.locator('.tm-list-btn[data-id="model"]').click();
  await mp.waitForTimeout(250);
  const mt = await mp.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || "");
  if (!/Model the real system/i.test(mt)) fail("mobile stage open " + mt); else pass("mobile stage open: " + mt);
  await mp.locator("#tmPanel").scrollIntoViewIfNeeded();
  await mp.screenshot({ path: path.join(SHOTS, "stage-open-mobile.png"), fullPage: false });

  // quiz on mobile
  await mp.locator(".tm-quiz__opt").first().click();
  await mp.waitForTimeout(150);
  const mb = await mp.locator("#tmQuizBadge").innerText();
  if (!/\d+\/10/.test(mb)) fail("mobile quiz badge " + mb); else pass("mobile quiz works, badge " + mb);

  await m.ctx.close();
  await browser.close();

  const result = { fails, ok: fails.length === 0, shots: fs.readdirSync(SHOTS) };
  fs.writeFileSync(path.join(__dirname, "test-result.json"), JSON.stringify(result, null, 2));
  console.log(result.ok ? "ALL PASS" : "FAILED " + fails.length);
  console.log("shots", result.shots.join(", "));
  process.exit(result.ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
