/* Local Playwright test for the v3 ring-in-tour redesign: desktop 1280 + mobile 390. */
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

  function hrefChecks(data) {
    if (data.github.some((u) => !/^https:\/\/github.com\/nusairi\/govassure\/?$/.test(u))) fail("unexpected github " + data.github);
    else pass("github only nusairi/govassure (" + data.github.length + ")");
    if (data.linkedin.some((u) => !/^https:\/\/www\.linkedin\.com\/company\/102617034\/?$/.test(u))) fail("unexpected linkedin");
    else pass("linkedin company page");
    if (data.names && data.names.length) fail("personal names " + data.names.join(","));
    else pass("no personal names in body text");
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
    ringBtns: document.querySelectorAll("#tmRing .tm-node-btn").length,
    ringAria: document.querySelector("#tmRing .tm-node-btn[data-id='model']")?.getAttribute("aria-label") || "",
    loop: !!document.querySelector("#tmRing .tm-loop-arc"),
    listHidden: document.getElementById("tmList")?.hidden === true,
    showList: !!document.getElementById("tmShowListHome"),
    tourHidden: document.getElementById("lifecycle")?.hidden === true || !document.getElementById("lifecycle")?.classList.contains("is-on"),
    twoCol: (() => {
      const land = document.querySelector(".tm-landing");
      return land && getComputedStyle(land).display === "grid";
    })(),
    wnInDom: (document.querySelector("#tmWhatsNew")?.textContent || "").length > 200,
    example: (document.querySelector("#tmExample")?.textContent || "").includes("Continuity Plan Helper") || (document.querySelector("#ex-h")?.textContent || "").includes("Continuity Plan Helper"),
    disclaimerHero: !!document.querySelector(".tm-disclaimer") || /not affiliated with NCSC, the Cabinet Office/i.test(document.querySelector(".tm-hero")?.innerText || ""),
    legalCount: document.querySelectorAll(".tm-legal").length,
    legalText: (document.querySelector(".tm-legal")?.textContent || "").replace(/\s+/g, " ").trim(),
    community: /community resource/i.test(document.body.innerText),
    names: [...document.body.innerText.matchAll(/\b(Adam|John|Schneier|Nusairi)\b/g)].map((m) => m[1]),
    github: [...document.querySelectorAll("a[href*='github.com']")].map((a) => a.href),
    linkedin: [...document.querySelectorAll("a[href*='linkedin.com']")].map((a) => a.href),
    csp: window.__csp || [],
  }));
  if (home.brand !== "https://www.govassured.com/") fail("logo href " + home.brand);
  else pass("logo -> www.govassured.com");
  if (!home.logoOk) fail("logo image"); else pass("logo image loaded");
  if (!home.start) fail("missing Start the tour"); else pass("Start the tour present");
  if (home.ringBtns !== 10) fail("ring buttons " + home.ringBtns); else pass("10 ring buttons");
  if (!/Stage 3 of 10: Model the real system/.test(home.ringAria)) fail("aria-label " + home.ringAria);
  else pass("ring aria-label: " + home.ringAria);
  if (!home.loop) fail("missing loop arrow"); else pass("loop arrow present");
  if (!home.listHidden) fail("list should be hidden until Show as list"); else pass("list hidden by default");
  if (!home.showList) fail("missing Show as list"); else pass("Show as list present");
  if (!home.tourHidden) fail("tour should be hidden on landing"); else pass("landing hides the tour");
  if (!home.twoCol) fail("landing should be two-column at 1280"); else pass("landing two-column");
  if (!home.wnInDom) fail("what's new missing from DOM"); else pass("what's new in DOM");
  if (!home.example) fail("worked example missing"); else pass("worked example present");
  if (home.disclaimerHero) fail("large hero disclaimer still present"); else pass("hero has no large disclaimer");
  if (home.legalCount !== 1) fail("expected one footer legal line, got " + home.legalCount); else pass("single footer disclaimer");
  if (home.legalText !== "Community resource by GOV Assured. Not a government website; not official NCSC, NIST, MITRE or OWASP guidance.") fail("footer legal text: " + home.legalText);
  else pass("footer legal is one muted line");
  if (!home.community) fail("community resource wording missing"); else pass("community wording present");
  hrefChecks(home);
  if (p.errs.length) fail("console errors on home: " + p.errs.join(" | ")); else pass("no console errors on home");
  if (home.csp.length || p.csp.length) fail("CSP " + home.csp.concat(p.csp)); else pass("no CSP violations");

  await p.screenshot({ path: path.join(SHOTS, "v3-landing-desktop.png"), fullPage: true });
  await p.screenshot({ path: path.join(SHOTS, "v3b-landing-desktop.png"), fullPage: true });
  pass("screenshot v3-landing-desktop and v3b-landing-desktop");

  const ovD = await overflow(p);
  if (ovD.overflow) fail("desktop overflow scrollWidth=" + ovD.scrollWidth + " " + JSON.stringify(ovD.samples));
  else pass("no desktop horizontal overflow on landing");

  // Show as list
  await p.locator("#tmShowListHome").click();
  await p.waitForTimeout(150);
  const listVis = await p.evaluate(() => !document.getElementById("tmList").hidden && document.querySelectorAll("#tmList .tm-list-btn").length);
  if (listVis !== 10) fail("show as list did not reveal 10 buttons, got " + listVis);
  else pass("Show as list reveals 10 stage buttons");

  // What's new still accordion
  await p.locator("#tmNavWhatsNew").click();
  await p.waitForTimeout(250);
  const wnVis = await p.locator("#whatsnew").isVisible();
  const wnItems = await p.locator("#tmWhatsNew .wn-item").count();
  const wnOpen = await p.locator("#tmWhatsNew .wn-item[open]").count();
  if (!wnVis) fail("what's new view not visible"); else pass("what's new view visible");
  if (wnItems < 20) fail("what's new items " + wnItems); else pass("what's new items " + wnItems);
  if (wnOpen !== 0) fail("what's new items should start collapsed, open=" + wnOpen); else pass("what's new items collapsed");

  // Start the tour from home, then go to stage 3 via ring
  await p.locator("#tmNavHome").click();
  await p.waitForTimeout(200);
  await p.locator("#tmStartTour").click();
  await p.waitForTimeout(350);
  const t1 = await p.evaluate(() => ({
    title: document.getElementById("tmPanelTitle")?.textContent || "",
    view: document.getElementById("lifecycle")?.hidden,
    twoCol: getComputedStyle(document.querySelector(".tm-tour")).display === "grid",
    mapRing: document.querySelectorAll("#tmTourRing .tm-node-btn").length,
    hub: document.querySelector("#tmTourRing [data-hub='main']")?.textContent,
    hubSub: document.querySelector("#tmTourRing [data-hub='sub']")?.textContent,
    purpose: !!document.querySelector(".tm-oneliner"),
    doSec: (document.querySelector(".tm-sec h3")?.textContent || ""),
    openAcc: document.querySelectorAll("#tmPanel .tm-acc[open]").length,
    totalAcc: document.querySelectorAll("#tmPanel .tm-acc").length,
    depth: document.querySelector(".tm-depth button.is-on")?.textContent,
    sub: document.querySelector(".tm-stage-sub")?.textContent || "",
    dotsBar: getComputedStyle(document.getElementById("tmDotsBar")).display,
  }));
  if (t1.view) fail("tour still hidden after start"); else pass("tour visible after Start the tour");
  if (t1.title !== "Scope the change") fail("stage 1 title " + t1.title); else pass("stage 1 title");
  if (!t1.twoCol) fail("tour should be two-column at 1280"); else pass("tour two-column");
  if (t1.mapRing !== 10) fail("tour ring buttons " + t1.mapRing); else pass("tour map ring has 10 buttons");
  if (t1.hub !== "1" || t1.hubSub !== "Scope") fail("hub " + t1.hub + " / " + t1.hubSub);
  else pass("tour hub shows 1 / Scope");
  if (t1.dotsBar !== "none") fail("dots bar should be hidden on desktop, " + t1.dotsBar); else pass("dots bar hidden on desktop");
  if (t1.sub !== "including AI, identity and the pipeline") fail("subtitle should be parenthetical only, got: " + t1.sub);
  else pass("subtitle tidied (no title repeat)");
  if (!t1.purpose || t1.doSec !== "What you do") fail("purpose / what you do missing"); else pass("Purpose + What you do visible");
  if (t1.openAcc !== 0) fail("accordions should start collapsed, open=" + t1.openAcc); else pass("progressive disclosure collapsed");
  if (t1.totalAcc < 5) fail("accordion count " + t1.totalAcc); else pass("accordions present: " + t1.totalAcc);
  if (t1.depth !== "Basics") fail("default depth " + t1.depth); else pass("Basics default");

  // Keyboard next twice -> stage 3, ticks on 1 and 2
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(200);
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(300);
  const t3 = await p.evaluate(() => ({
    title: document.getElementById("tmPanelTitle")?.textContent || "",
    hub: document.querySelector("#tmTourRing [data-hub='main']")?.textContent,
    hubSub: document.querySelector("#tmTourRing [data-hub='sub']")?.textContent,
    active: document.querySelector("#tmTourRing .tm-node-btn.is-active")?.getAttribute("data-id"),
    ticks: [...document.querySelectorAll("#tmTourRing .tm-node-btn.is-done")].map((b) => b.getAttribute("data-id")),
    sub: document.querySelector(".tm-stage-sub")?.textContent || "",
  }));
  if (t3.title !== "Model the real system") fail("stage 3 title " + t3.title); else pass("keyboard to stage 3");
  if (t3.hub !== "3" || t3.hubSub !== "Model") fail("hub at 3: " + t3.hub + "/" + t3.hubSub);
  else pass("hub shows 3 / Model");
  if (t3.active !== "model") fail("active node " + t3.active); else pass("stage 3 node active");
  if (!(t3.ticks.includes("scope") && t3.ticks.includes("landscape"))) fail("ticks missing, got " + t3.ticks);
  else pass("stages 1 and 2 ticked after Next");
  if (t3.sub !== "cloud, identity, supply chain and AI") fail("stage 3 subtitle " + t3.sub);
  else pass("stage 3 subtitle is the added clause only");

  await p.screenshot({ path: path.join(SHOTS, "v3-tour-stage3-desktop.png"), fullPage: false });
  await p.screenshot({ path: path.join(SHOTS, "v3b-tour-stage3-desktop.png"), fullPage: false });
  pass("screenshot v3-tour-stage3-desktop and v3b-tour-stage3-desktop");

  const ovT = await overflow(p);
  if (ovT.overflow) fail("desktop tour overflow " + JSON.stringify(ovT.samples));
  else pass("no desktop overflow on tour");

  // Click ring node to jump to stage 7, then next to 8 for more ticks
  await p.locator("#tmTourRing .tm-node-btn[data-id='mitigate']").click();
  await p.waitForTimeout(250);
  const jumped = await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent);
  if (jumped !== "Decide mitigations") fail("ring jump " + jumped); else pass("clicking tour ring jumps to stage 7");

  // Prev then continue with Next to build ticks through 7, screenshot later stage
  await p.locator(".tm-next").click();
  await p.waitForTimeout(200);
  await p.locator(".tm-next").click();
  await p.waitForTimeout(250);
  const later = await p.evaluate(() => ({
    title: document.getElementById("tmPanelTitle")?.textContent || "",
    ticks: [...document.querySelectorAll("#tmTourRing .tm-node-btn.is-done")].map((b) => b.getAttribute("data-id")),
    hub: document.querySelector("#tmTourRing [data-hub='main']")?.textContent,
  }));
  if (later.title !== "Record the model") fail("later title " + later.title); else pass("later stage: Record the model");
  if (!(later.ticks.includes("mitigate") && later.ticks.includes("validate"))) fail("later ticks " + later.ticks);
  else pass("ticks show progress on later stage: " + later.ticks.join(","));
  await p.screenshot({ path: path.join(SHOTS, "v3-tour-progress-desktop.png"), fullPage: false });
  pass("screenshot v3-tour-progress-desktop");

  // Quiz persist
  await p.locator("#tmQuizAcc summary").click();
  await p.waitForTimeout(150);
  const firstOpt = p.locator("#tmQuizAcc .tm-quiz__opt").first();
  await firstOpt.click();
  await p.waitForTimeout(150);
  const quizSaved = await p.evaluate(() => {
    const raw = localStorage.getItem("ga-tm-quiz-v1");
    return raw && raw.length > 2;
  });
  if (!quizSaved) fail("quiz not saved"); else pass("quiz saved to localStorage");

  // All links still present and clickable
  const links = await p.evaluate(() => {
    const as = [...document.querySelectorAll("a[href]")];
    const bad = [];
    as.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const cs = getComputedStyle(a);
      const clickable = cs.pointerEvents !== "none" && cs.visibility !== "hidden";
      const keep = a.hasAttribute("data-keep") || a.hasAttribute("data-ga-keep") || href.startsWith("https://") || href.startsWith("/") || href.startsWith("#");
      if (!href || href === "#" || !clickable) bad.push({ href, clickable, text: a.textContent.slice(0, 40) });
      const ext = /^https?:/i.test(href) && !/(^|\.)govassured\.com$/i.test((() => { try { return new URL(href, location.href).hostname; } catch (e) { return ""; } })());
      if (ext && a.target !== "_blank") bad.push({ href, issue: "external not new tab" });
    });
    return { count: as.length, bad: bad.slice(0, 8), external: as.filter((a) => a.target === "_blank").length };
  });
  if (links.bad.length) fail("link issues " + JSON.stringify(links.bad));
  else pass("all " + links.count + " links present and clickable (" + links.external + " external new-tab)");

  if (p.errs.length) fail("console errors during desktop tour: " + p.errs.join(" | "));
  else pass("no console errors during desktop tour");

  // Persist ticks across reload
  const beforeReload = later.ticks.slice().sort().join(",");
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const afterReload = await p.evaluate(() => [...document.querySelectorAll("#tmTourRing .tm-node-btn.is-done")].map((b) => b.getAttribute("data-id")).sort().join(","));
  // URL should still have stage
  const url = p.url();
  if (!/stage=/.test(url)) fail("stage not in url after reload " + url); else pass("stage persisted in URL");
  if (!afterReload.includes("mitigate")) fail("ticks did not persist, got " + afterReload + " (before " + beforeReload + ")");
  else pass("ticks persist after reload: " + afterReload);

  await d.ctx.close();

  // ---- Mobile 390 ----
  const m = await makePage(390, 844);
  const mp = m.p;
  await mp.goto(BASE + "/", { waitUntil: "networkidle" });
  await mp.waitForTimeout(400);
  if (mp.errs.length) fail("mobile console on home: " + mp.errs.join(" | ")); else pass("no console errors on mobile home");
  const ovM0 = await overflow(mp);
  if (ovM0.overflow) fail("mobile landing overflow " + JSON.stringify(ovM0.samples));
  else pass("no mobile overflow on landing");

  await mp.screenshot({ path: path.join(SHOTS, "v3b-mobile-landing.png"), fullPage: true });
  pass("screenshot v3b-mobile-landing");

  await mp.locator("#tmStartTour").click();
  await mp.waitForTimeout(400);
  const mobileTour = await mp.evaluate(() => {
    const dots = document.getElementById("tmDotsBar");
    const map = document.getElementById("tmTourMap");
    const nav = document.querySelector(".tm-tour-nav");
    const btns = [...document.querySelectorAll("#tmSteps button")];
    const sizes = btns.map((b) => {
      const r = b.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    const navCs = getComputedStyle(nav);
    const mapBtn = document.getElementById("tmMapBtn");
    const mapR = mapBtn.getBoundingClientRect();
    return {
      dotsDisplay: getComputedStyle(dots).display,
      mapDisplay: getComputedStyle(map).display,
      navFixed: navCs.position,
      title: document.getElementById("tmPanelTitle")?.textContent || "",
      dotCount: btns.length,
      minW: Math.min(...sizes.map((s) => s.w)),
      minH: Math.min(...sizes.map((s) => s.h)),
      mapBtn: { w: Math.round(mapR.width), h: Math.round(mapR.height) },
    };
  });
  if (mobileTour.dotsDisplay === "none") fail("dots bar should show on mobile"); else pass("mobile dots bar visible");
  if (mobileTour.mapDisplay !== "none") fail("sidebar map should hide on mobile, " + mobileTour.mapDisplay); else pass("sidebar map hidden on mobile");
  if (mobileTour.navFixed !== "fixed") fail("prev/next should be fixed on mobile, " + mobileTour.navFixed); else pass("sticky Prev/Next at bottom");
  if (mobileTour.dotCount !== 10) fail("dot count " + mobileTour.dotCount); else pass("10 mobile dots");
  if (mobileTour.minH < 44) fail("dot tap height " + mobileTour.minH); else pass("dot tap height >= 44 (" + mobileTour.minH + ")");
  if (mobileTour.minW < 32) fail("dot tap width too small " + mobileTour.minW); else pass("dot tap width " + mobileTour.minW);
  if (mobileTour.mapBtn.h < 44 || mobileTour.mapBtn.w < 44) fail("Map button tap " + JSON.stringify(mobileTour.mapBtn));
  else pass("Map button >= 44px");

  await mp.screenshot({ path: path.join(SHOTS, "v3-mobile-tour.png"), fullPage: false });
  pass("screenshot v3-mobile-tour");

  const ovM1 = await overflow(mp);
  if (ovM1.overflow) fail("mobile tour overflow " + JSON.stringify(ovM1.samples));
  else pass("no mobile overflow on tour");

  // Next / Prev on mobile
  await mp.locator(".tm-next").click();
  await mp.waitForTimeout(250);
  const t2m = await mp.evaluate(() => document.getElementById("tmPanelTitle")?.textContent);
  if (t2m !== "Refresh the landscape") fail("mobile next " + t2m); else pass("mobile Next works");
  await mp.locator(".tm-prev").click();
  await mp.waitForTimeout(250);
  const t1m = await mp.evaluate(() => document.getElementById("tmPanelTitle")?.textContent);
  if (t1m !== "Scope the change") fail("mobile prev " + t1m); else pass("mobile Previous works");

  // Map drawer
  await mp.locator("#tmMapBtn").click();
  await mp.waitForTimeout(400);
  const drawer = await mp.evaluate(() => {
    const ov = document.getElementById("tmOverlay");
    const ringBtns = document.querySelectorAll("#tmDrawerRing .tm-node-btn");
    const sizes = [...ringBtns].map((b) => {
      const r = b.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), id: b.getAttribute("data-id") };
    });
    return {
      hidden: ov?.hidden === true,
      sheet: ov?.classList.contains("is-sheet"),
      count: ringBtns.length,
      loop: !!document.querySelector("#tmDrawerRing .tm-loop-arc"),
      minW: sizes.length ? Math.min(...sizes.map((s) => s.w)) : 0,
      minH: sizes.length ? Math.min(...sizes.map((s) => s.h)) : 0,
      title: document.getElementById("tmOverlayTitle")?.textContent || "",
    };
  });
  if (drawer.hidden) fail("map drawer not open"); else pass("map drawer open");
  if (!drawer.sheet) fail("drawer should be a bottom sheet"); else pass("drawer is bottom sheet");
  if (drawer.count !== 10) fail("drawer ring " + drawer.count); else pass("drawer has 10 ring buttons");
  if (!drawer.loop) fail("drawer missing loop arrow"); else pass("drawer loop arrow present");
  if (drawer.minH < 44 || drawer.minW < 44) fail("drawer tap targets " + drawer.minW + "x" + drawer.minH);
  else pass("drawer ring tap targets >= 44px");
  await mp.screenshot({ path: path.join(SHOTS, "v3-mobile-map-drawer.png"), fullPage: false });
  pass("screenshot v3-mobile-map-drawer");

  const ovM2 = await overflow(mp);
  if (ovM2.overflow) fail("mobile drawer overflow " + JSON.stringify(ovM2.samples));
  else pass("no mobile overflow with drawer");

  // Tap a node in the drawer -> jumps and closes
  await mp.locator("#tmDrawerRing .tm-node-btn[data-id='threats']").click();
  await mp.waitForTimeout(350);
  const afterJump = await mp.evaluate(() => ({
    title: document.getElementById("tmPanelTitle")?.textContent || "",
    overlayHidden: document.getElementById("tmOverlay")?.hidden === true,
  }));
  if (afterJump.title !== "Identify threats") fail("drawer jump " + afterJump.title); else pass("drawer node opens stage 5");
  if (!afterJump.overlayHidden) fail("drawer did not close"); else pass("drawer closes on jump");

  if (mp.errs.length) fail("mobile console during tour: " + mp.errs.join(" | "));
  else pass("no console errors during mobile tour");

  await m.ctx.close();
  await browser.close();

  const out = { fails, pass: fails.length === 0 };
  fs.writeFileSync(path.join(__dirname, "test-v3-result.json"), JSON.stringify(out, null, 2));
  console.log(out.pass ? "\nALL PASS" : "\nFAILED " + fails.length);
  if (fails.length) fails.forEach((f) => console.log(" - " + f));
  process.exit(out.pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
