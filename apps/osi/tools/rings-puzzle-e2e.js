// End-to-end check for the public Which Ring? game at /rings-puzzle.
// axe-core 4.14.1 is required (see ../../../tools/axe.js).
// Usage: node tools/rings-puzzle-e2e.js [base-url] [shots-dir]
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");
const axe = require(path.join(__dirname, "../../../tools/axe"));
const axeState = axe.load();
const BASE = process.argv[2] || "http://127.0.0.1:18431";
const SHOTS = process.argv[3] || process.env.SHOTS || path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK " : "BAD ") + m); if (!c) fails++; };
const ALLOWED = /^https:\/\/(www\.linkedin\.com\/company\/102617034\/$|github\.com\/nusairi\/govassure$|www\.govassured\.com\/$|osi\.govassured\.com\/)/;
const MOBILE = { width: 390, height: 844 };
const LAYER_FOR = {
  "NIC firmware": 0, "UEFI": 0, "TPM 2.0": 0, "SPDX/CycloneDX": 0,
  "Fibre (BASE-SX/LX)": 1, "5G NR": 1, "DSL": 1,
  "Ethernet 802.3": 2, "802.1Q VLAN": 2, "STP/RSTP": 2,
  "IPv4": 3, "IPv6": 3, "OSPF": 3,
  "TCP": 4, "UDP": 4, "QUIC": 4,
  "Secure session tokens": 5, "Timeouts & re-auth": 5, "Session recording": 5,
  "ASCII/UTF-8": 6, "JPEG/PNG/GIF": 6, "gzip": 6,
  "HTTP/S": 7, "DNS": 7, "SMTP": 7,
  "JML process": 8, "ISO/IEC 27001": 8, "Risk ownership": 8
};
const cardName = async (pg) => (await pg.textContent("#card-title")).trim();
const cardLayer = async (pg) => LAYER_FOR[await cardName(pg)];
const lane = (pg, n) => pg.locator('#layers button[data-layer="' + n + '"]');

function seriousAxe(violations) {
  return violations.filter(v => /\((serious|critical)\)/.test(v));
}

async function placeUntilCorrect(page) {
  const buttons = page.locator("#layers button.layer-target:not([disabled])");
  const n = await buttons.count();
  for (let i = 0; i < n; i++) {
    await buttons.nth(i).click();
    if (await page.locator("#feedback[data-result='correct']").count()) return true;
  }
  return false;
}

(async () => {
  if (axe.enabled()) {
    ok(axeState.version === "4.14.1", "axe-core version is 4.14.1 (found " + axeState.version + ")");
    if (axeState.version !== "4.14.1") { console.log("FAILED " + fails); process.exit(1); }
  }

  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", m => { if (m.type() === "error" || /Content Security Policy/i.test(m.text())) errs.push(m.text()); });
  page.on("pageerror", e => errs.push("pageerror " + e.message));
  await page.addInitScript(() => { window.__csp = []; document.addEventListener("securitypolicyviolation", e => window.__csp.push(e.violatedDirective + " " + e.blockedURI)); });

  const home = await page.goto(BASE + "/", { waitUntil: "networkidle" });
  ok(home && home.status() === 200, "GET / " + (home && home.status()));
  const puzzleNav = page.locator('header a[href="/rings-puzzle"]');
  ok(await puzzleNav.count() === 1, "home header has one Puzzle link");
  ok((await puzzleNav.textContent()).trim() === "Puzzle", "home header link text is Puzzle");
  ok(await puzzleNav.getAttribute("title") === "Which Ring? learning game", "home Puzzle link has a title");
  const puzzleBox = await puzzleNav.boundingBox();
  ok(!!puzzleBox && puzzleBox.width > 0 && puzzleBox.height > 0, "Puzzle link is visible at 390px");
  const homeOverflow = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(homeOverflow <= 390, "home header wraps without horizontal overflow at 390px (" + homeOverflow + ")");

  const tut = await page.goto(BASE + "/tutorial", { waitUntil: "networkidle" });
  ok(tut && tut.status() === 200, "GET /tutorial " + (tut && tut.status()));
  const practice = page.locator('a[href="/rings-puzzle"]');
  ok(await practice.count() >= 1 && (await practice.last().textContent()).includes("Practice: Which Ring?"), "tutorial ends with Practice: Which Ring?");
  ok(!(await practice.last().getAttribute("target")), "Practice link opens in the same tab");

  const resp = await page.goto(BASE + "/rings-puzzle", { waitUntil: "networkidle" });
  ok(resp && resp.status() === 200, "GET /rings-puzzle " + (resp && resp.status()));
  const headers = resp.headers();
  ok(/default-src 'none'/.test(headers["content-security-policy"] || "") && headers["x-frame-options"] === "DENY", "CSP and security headers on /rings-puzzle");
  ok(await page.locator('meta[name="robots"]').count() === 0, "puzzle page is indexable (no robots noindex)");
  ok(/not affiliated with or endorsed by NCSC, the Cabinet Office or any UK government department/.test(await page.textContent(".puzzle-legal")), "footer legal line is present");
  ok(await page.locator('a.sr-only[href="#puzzle-main"]').count() === 1, "skip link is present");
  ok(await page.locator("#themeSeg button[data-set]").count() === 3, "theme toggle is present");
  const firstName = await cardName(page);
  ok(Object.prototype.hasOwnProperty.call(LAYER_FOR, firstName), "first card is a known OSI card (" + firstName + ")");
  ok((await page.textContent("#clue")).trim().length > 20, "first card has a clue");
  ok((await page.textContent("#team-score")).trim() === "0", "score starts at 0");
  const firstLayer = LAYER_FOR[firstName];
  const wrongLayer = firstLayer === 7 ? 0 : 7;

  const ext = await page.$$eval("a[href^='http']", as => as.map(a => ({ href: a.href, target: a.target, rel: a.getAttribute("rel") || "" })));
  const internal = await page.$$eval("a[href^='/']", as => as.map(a => ({ href: a.getAttribute("href"), target: a.getAttribute("target") })));
  ok(ext.every(a => ALLOWED.test(a.href)), "only allowed external links (" + ext.map(a => a.href).join(", ") + ")");
  ok(ext.filter(a => /linkedin\.com|github\.com/.test(a.href)).every(a => a.target === "_blank" && /noopener/.test(a.rel) && /noreferrer/.test(a.rel)), "LinkedIn and GitHub open in a new tab with noopener noreferrer");
  ok(ext.filter(a => /govassured\.com/.test(a.href)).every(a => !a.target), "govassured.com links open in the same tab");
  ok(internal.every(a => !a.target), "in-site links open in the same tab");
  ok(internal.every(a => !/\/matrix|checklist/.test(a.href)), "puzzle does not link to /matrix or /checklist");

  // Incorrect placement, then the right lane. Feedback must stay visible.
  await lane(page, wrongLayer).click();
  ok(await page.locator("#feedback[data-result='retry']").count() === 1, "wrong guess sets retry feedback");
  const fbVisible = await page.$eval("#feedback", el => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.position !== "absolute" && r.width > 20 && r.height > 10 && s.clipPath === "none" && el.textContent.trim().length > 10;
  });
  ok(fbVisible, "retry feedback is visible (not clipped)");
  ok(new RegExp("Not Layer " + wrongLayer).test(await page.textContent("#feedback")), "visible status names the missed layer");
  ok((await page.textContent("#team-score")).trim() === "0", "wrong guess does not add points");
  const missedInView = await lane(page, wrongLayer).evaluate(el => {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= (window.innerHeight + 1);
  });
  ok(missedInView, "missed lane was scrolled into view");
  await page.screenshot({ path: path.join(SHOTS, "puzzle-miss-mobile.png") });

  await lane(page, firstLayer).click();
  ok(await page.locator("#feedback[data-result='correct']").count() === 1, "correct placement after a miss");
  ok((await page.textContent("#team-score")).trim() === "75", "second try scores 75");
  ok(await page.locator("#next").isVisible(), "Next card is shown after a match");

  // New round resets score and shows a card.
  await page.click("#restart");
  ok((await page.textContent("#team-score")).trim() === "0", "New round resets the score");
  ok(await page.locator("#card").isVisible(), "New round shows a card");
  ok(await page.locator("#review").isHidden(), "review is hidden after New round");

  // Keyboard-only lane selection on a fresh first-load page (NIC firmware again).
  const keyPage = await ctx.newPage();
  const keyErrs = [];
  keyPage.on("console", m => { if (m.type() === "error") keyErrs.push(m.text()); });
  await keyPage.goto(BASE + "/rings-puzzle", { waitUntil: "networkidle" });
  const keyLayer = await cardLayer(keyPage);
  const wantFocus = "LAYER:" + keyLayer;
  let focused = "";
  await keyPage.locator("body").click({ position: { x: 2, y: 2 } });
  for (let i = 0; i < 50; i++) {
    await keyPage.keyboard.press("Tab");
    focused = await keyPage.evaluate(() => {
      const el = document.activeElement;
      return el && el.classList.contains("layer-target") ? "LAYER:" + el.getAttribute("data-layer") : (el && (el.getAttribute("aria-label") || el.id || el.tagName)) || "";
    });
    if (focused === wantFocus) break;
  }
  ok(focused === wantFocus, "keyboard Tab reaches the correct lane (" + focused + ", want " + wantFocus + ")");
  await keyPage.keyboard.press("Enter");
  ok(await keyPage.locator("#feedback[data-result='correct']").count() === 1, "Enter on the correct lane places the first card");
  ok((await keyPage.textContent("#team-score")).trim() === "100", "first-try keyboard placement scores 100");
  await keyPage.close();

  // Finish a full round and open a review explainer (page is on a fresh New round).
  let safety = 0;
  while (await page.locator("#review").isHidden()) {
    if (++safety > 30) break;
    if (await page.locator("#next:visible").count()) {
      await page.click("#next");
      continue;
    }
    ok(await placeUntilCorrect(page), "placed a card on its layer (" + safety + ")");
  }
  ok(await page.locator("#review").isVisible(), "review is shown after nine matches");
  ok(/points/.test(await page.textContent("#round-score")), "review shows the round score");
  const reviewBtn = page.locator("#matches button").first();
  ok(await reviewBtn.count() === 1, "review lists a match that can be opened");
  await reviewBtn.click();
  const overlay = page.locator("#hwCardOverlay");
  await overlay.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
  ok(await overlay.count() && !(await overlay.isHidden()), "review pop-up opens an explainer");
  await page.keyboard.press("Escape");
  ok(await page.evaluate(() => { const o = document.getElementById("hwCardOverlay"); return !o || o.hidden; }), "Escape closes the explainer");
  await page.screenshot({ path: path.join(SHOTS, "puzzle-review-mobile.png") });

  const firstLoad = await ctx.newPage();
  await firstLoad.goto(BASE + "/rings-puzzle", { waitUntil: "networkidle" });
  let n = 0;
  while (await firstLoad.locator("#review").isHidden()) {
    if (++n > 30) break;
    if (await firstLoad.locator("#next:visible").count()) { await firstLoad.click("#next"); continue; }
    if (!(await placeUntilCorrect(firstLoad))) break;
  }
  ok(/NIC firmware/.test(await firstLoad.textContent("#matches")) && /Layer 0/.test(await firstLoad.textContent("#matches")), "first-load round uses NIC firmware as the Layer 0 card");
  await firstLoad.close();

  const csp = await page.evaluate(() => window.__csp);
  ok(csp.length === 0, "no CSP violations" + (csp.length ? ": " + csp.join(", ") : ""));
  ok(errs.length === 0 && keyErrs.length === 0, "no console errors" + (errs.length || keyErrs.length ? ": " + errs.concat(keyErrs).slice(0, 3).join(" | ") : ""));

  // axe-core in both themes, mobile viewport, bypassing CSP only for the scan injection.
  if (axe.enabled()) {
    const axeCtx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2, isMobile: true, hasTouch: true, bypassCSP: true });
    const axePage = await axeCtx.newPage();
    await axePage.goto(BASE + "/rings-puzzle", { waitUntil: "networkidle" });
    await axePage.click("#themeSeg button[data-set='dark']");
    ok(await axePage.evaluate(() => document.documentElement.getAttribute("data-theme")) === "dark", "dark theme applied");
    const dark = await axe.scan(axePage);
    const darkBad = seriousAxe(dark);
    ok(darkBad.length === 0, "axe dark theme: 0 serious/critical" + (darkBad.length ? " " + JSON.stringify(darkBad) : dark.length ? " (minor/moderate: " + dark.length + ")" : ""));
    if (dark.length) console.log("AXE dark details: " + dark.join(" | "));
    await axePage.screenshot({ path: path.join(SHOTS, "puzzle-axe-dark-mobile.png") });
    await axePage.click("#themeSeg button[data-set='light']");
    ok(await axePage.evaluate(() => document.documentElement.getAttribute("data-theme")) === "light", "light theme applied");
    const light = await axe.scan(axePage);
    const lightBad = seriousAxe(light);
    ok(lightBad.length === 0, "axe light theme: 0 serious/critical" + (lightBad.length ? " " + JSON.stringify(lightBad) : light.length ? " (minor/moderate: " + light.length + ")" : ""));
    if (light.length) console.log("AXE light details: " + light.join(" | "));
    await axePage.screenshot({ path: path.join(SHOTS, "puzzle-axe-light-mobile.png") });
    await axeCtx.close();
  }
  axe.report(ok);

  await browser.close();
  console.log(fails ? `FAILED ${fails}` : "ALL-RINGS-PUZZLE-E2E-PASSED");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
