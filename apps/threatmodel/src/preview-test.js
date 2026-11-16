/* Playwright verification of the threatmodel PREVIEW environment. */
const { chromium } = require("/workspace/favicons/rollout/tools/node_modules/playwright-core");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const BASE = process.argv[2] || "https://black-plant-065a67303-preview.westeurope.4.azurestaticapps.net";
const SHOTS = path.join(__dirname, "..", "shots");
const LOCAL_ICO = path.join(__dirname, "..", "favicon.ico");
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
      return { overflow: document.documentElement.scrollWidth > w + 2, scrollWidth: document.documentElement.scrollWidth, samples: bad.slice(0, 8) };
    });
  }

  // Favicon is the crown (byte-match local ico)
  const icoBuf = await (await fetch(BASE + "/favicon.ico")).arrayBuffer();
  const localIco = fs.readFileSync(LOCAL_ICO);
  const ico = Buffer.from(icoBuf);
  const icoMatch = ico.length === localIco.length && crypto.createHash("sha256").update(ico).digest("hex") === crypto.createHash("sha256").update(localIco).digest("hex");
  if (!icoMatch) fail("favicon.ico does not match crown file (" + ico.length + " bytes)");
  else pass("favicon is the crown (" + ico.length + " bytes, sha match)");

  // ---- Desktop 1280 ----
  const d = await makePage(1280, 800);
  const p = d.p;
  const resp = await p.goto(BASE + "/", { waitUntil: "networkidle" });
  if (!resp || resp.status() !== 200) fail("desktop home status " + (resp && resp.status()));
  else pass("desktop home 200");
  await p.waitForTimeout(400);

  const home = await p.evaluate(() => ({
    title: document.title,
    logo: document.querySelector(".ga-brandbar a, a.ga-logo, header a[href]")?.getAttribute("href") || document.querySelector('a[href="https://www.govassured.com/"]')?.href,
    stages: document.querySelectorAll(".tm-node, .tm-list-btn").length,
    example: !!document.getElementById("example") || /Continuity Plan Helper/i.test(document.body.innerText),
    disclaimer: /not (an )?official/i.test(document.body.innerText) || /community/i.test(document.body.innerText),
    community: /community/i.test(document.body.innerText),
    names: [],
    github: [...document.querySelectorAll("a[href*='github.com']")].map((a) => a.href),
    linkedin: [...document.querySelectorAll("a[href*='linkedin.com']")].map((a) => a.href),
    panelTitle: document.getElementById("tmPanelTitle")?.textContent || "",
    icon: (document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]'))?.getAttribute("href") || "",
    csp: window.__csp || [],
  }));
  if (!/Threat Modelling Lifecycle/i.test(home.title)) fail("title " + home.title); else pass("title ok");
  if (!/govassured\.com/.test(home.logo || "")) fail("logo href " + home.logo); else pass("logo -> www.govassured.com");
  if (!/favicon/i.test(home.icon)) fail("icon link " + home.icon); else pass("page icon link " + home.icon);
  if (p.errs.length) fail("console errors on home: " + p.errs.join(" | ")); else pass("0 console errors on desktop home");
  if (home.csp.length || p.csp.length) fail("CSP " + home.csp.concat(p.csp)); else pass("no CSP violations");

  await p.screenshot({ path: path.join(SHOTS, "preview-home-desktop.png"), fullPage: true });
  const wn = p.locator("#whatsnew");
  if (await wn.count()) {
    await wn.scrollIntoViewIfNeeded();
    await p.screenshot({ path: path.join(SHOTS, "preview-whats-new.png"), fullPage: false });
  }
  pass("screenshot preview-home-desktop");

  const ovD = await overflow(p);
  if (ovD.overflow) fail("desktop overflow scrollWidth=" + ovD.scrollWidth + " " + JSON.stringify(ovD.samples));
  else pass("no desktop horizontal overflow");

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
      });
    });
    return { out, delinked: document.querySelectorAll("a.ga-delinked, a[data-ga-src]").length, noHref: document.querySelectorAll("a:not([href])").length };
  });
  if (links.delinked) fail("ga-sources stripped links: " + links.delinked);
  else pass("links remain clickable (no delinked sources)");
  if (links.noHref) fail("anchors missing href: " + links.noHref);
  let ext = 0, same = 0;
  for (const L of links.out) {
    const extHttp = /^https?:/i.test(L.href);
    const ga = /govassured\.com/i.test(L.href);
    if (extHttp && !ga) {
      ext++;
      if (L.target !== "_blank") fail("ext link missing _blank: " + L.href);
    }
    if (ga && L.target === "_blank") fail("govassured link should be same tab: " + L.href);
    else if (ga) same++;
  }
  pass("in-page links: " + links.out.length + " hrefs, " + ext + " external new-tab, " + same + " govassured same-tab");

  // Stage 5 click + coverage wording
  await p.locator('.tm-node[data-id="threats"]').click();
  await p.waitForTimeout(250);
  const st5 = await p.evaluate(() => ({
    title: document.getElementById("tmPanelTitle")?.textContent || "",
    ncsc: (document.body.innerText.match(/NCSC coverage:[\s\S]{0,400}/) || [""])[0].replace(/\s+/g, " ").trim(),
  }));
  if (!/Identify threats/i.test(st5.title)) fail("click threats ring -> " + st5.title);
  else pass("ring click opened: " + st5.title);
  if (!/Partial/i.test(st5.ncsc) || !/LINDDUN/i.test(st5.ncsc) || /^NCSC coverage:\s*Yes\./i.test(st5.ncsc)) {
    fail("stage 5 NCSC coverage wording: " + st5.ncsc.slice(0, 240));
  } else pass("stage 5 NCSC coverage is Partial: " + st5.ncsc.slice(0, 180));
  await p.locator("#tmPanel").scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(SHOTS, "preview-stage5-desktop.png"), fullPage: false });

  // All 10 stages via list
  const titles = [];
  for (const id of ["scope","landscape","model","boundaries","threats","prioritise","mitigate","validate","record","continuous"]) {
    await p.locator('.tm-list-btn[data-id="' + id + '"]').click();
    await p.waitForTimeout(80);
    titles.push(await p.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || ""));
  }
  if (titles.length !== 10 || titles.some((t) => !t)) fail("stage list click-through " + JSON.stringify(titles));
  else pass("list click-through all 10 stages: " + titles.map((t) => t.slice(0, 24)).join(" | "));

  // 404 rewrite
  const r404 = await p.goto(BASE + "/no-such-page", { waitUntil: "networkidle" });
  const t404 = await p.evaluate(() => document.title);
  if (!r404 || r404.status() !== 404) fail("404 status " + (r404 && r404.status()));
  else if (!/Page not found/i.test(t404)) fail("404 title " + t404);
  else pass("404 rewrite branded (" + t404 + ")");
  const unexpected404 = p.errs.filter((e) => !/status of 404/.test(e));
  if (unexpected404.length) fail("console errors after 404: " + unexpected404.join(" | "));
  else pass("no unexpected console errors on 404 (browser 404 log ignored)");

  await d.ctx.close();

  // ---- Mobile 390 ----
  const m = await makePage(390, 844);
  const mp = m.p;
  const mresp = await mp.goto(BASE + "/", { waitUntil: "networkidle" });
  if (!mresp || mresp.status() !== 200) fail("mobile home status");
  else pass("mobile home 200");
  await mp.waitForTimeout(400);
  if (mp.errs.length) fail("mobile console errors: " + mp.errs.join(" | ")); else pass("0 console errors on mobile home");
  const ovM = await overflow(mp);
  if (ovM.overflow) fail("mobile overflow scrollWidth=" + ovM.scrollWidth + " " + JSON.stringify(ovM.samples));
  else pass("no mobile horizontal overflow");
  await mp.screenshot({ path: path.join(SHOTS, "preview-home-mobile.png"), fullPage: true });

  await mp.locator('.tm-list-btn[data-id="model"]').click();
  await mp.waitForTimeout(250);
  const mt = await mp.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || "");
  if (!/Model the real system/i.test(mt)) fail("mobile stage open " + mt); else pass("mobile stage open: " + mt);
  await mp.locator("#tmPanel").scrollIntoViewIfNeeded();
  await mp.screenshot({ path: path.join(SHOTS, "preview-stage-open-mobile.png"), fullPage: false });

  // mobile stage click-through a couple more
  await mp.locator('.tm-list-btn[data-id="threats"]').click();
  await mp.waitForTimeout(200);
  const mt5 = await mp.evaluate(() => document.getElementById("tmPanelTitle")?.textContent || "");
  if (!/Identify threats/i.test(mt5)) fail("mobile threats click " + mt5); else pass("mobile threats click ok");
  if (mp.errs.length) fail("mobile console errors after clicks: " + mp.errs.join(" | "));
  else pass("0 console errors after mobile click-through");

  await m.ctx.close();
  await browser.close();

  const previewShots = fs.readdirSync(SHOTS).filter((f) => f.startsWith("preview-") && f.endsWith(".png"));
  const result = { fails, ok: fails.length === 0, shots: previewShots, base: BASE };
  fs.writeFileSync(path.join(__dirname, "preview-test-result.json"), JSON.stringify(result, null, 2));
  console.log(result.ok ? "ALL PASS" : "FAILED " + fails.length);
  console.log("shots", previewShots.join(", "));
  process.exit(result.ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
