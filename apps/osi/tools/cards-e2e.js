// End-to-end check for the OSI Rings explainer cards on every layer (L0–L8) and the
// cross-layer capabilities, at phone size (390x844).
// Usage: node tools/cards-e2e.js [base-url] [shots-dir]
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");
const BASE = process.argv[2] || "http://127.0.0.1:18431";
const SHOTS = process.argv[3] || process.env.SHOTS || path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK " : "BAD ") + m); if (!c) fails++; };
const NEED = ["What it is", "Why it needs to be secured", "How to secure it", "NCSC relationship"];
const SHOOT = { "7:RDP": "card-L7-RDP", "3:BGP": "card-L3-BGP", "8:Helpdesk ID checks": "card-L8-helpdesk-id-checks", "2:802.1X / NAC": "card-L2-8021X-NAC", "x:SIEM / SOAR": "card-cross-SIEM-SOAR" };

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", e => errs.push("pageerror " + e.message));
  await page.addInitScript(() => { window.__csp = []; document.addEventListener("securitypolicyviolation", e => window.__csp.push(e.violatedDirective + " " + e.blockedURI)); });
  const resp = await page.goto(BASE + "/", { waitUntil: "networkidle" });
  ok(resp.status() === 200, "GET / " + resp.status());
  const counts = await page.evaluate(() => ({
    layers: LAYERS.map(l => ({ n: l.n, p: l.protocols.length, s: l.security.length })),
    cross: CROSS_LAYER.length
  }));

  async function checkOpenCard(label, key) {
    const overlay = page.locator("#hwCardOverlay");
    await overlay.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
    const info = await page.evaluate(() => {
      const ov = document.getElementById("hwCardOverlay");
      if (!ov || ov.hidden) return null;
      const sheet = ov.querySelector(".osi-card-sheet");
      const sec = {};
      ov.querySelectorAll("#hwCardBody section").forEach(s => { const h = s.querySelector("h4"); if (h) sec[h.textContent.trim()] = s; });
      const txt = k => (sec[k] ? sec[k].textContent.replace(sec[k].querySelector("h4").textContent, "").trim() : "");
      const links = [...ov.querySelectorAll("#hwCardBody a")].map(a => ({ href: a.getAttribute("href"), target: a.getAttribute("target"), rel: a.getAttribute("rel") || "", ext: a.classList.contains("osi-ext-link") }));
      return {
        title: (ov.querySelector("#hwCardTitle") || {}).textContent,
        heads: Object.keys(sec),
        what: txt("What it is"), why: txt("Why it needs to be secured"),
        how: sec["How to secure it"] ? sec["How to secure it"].querySelectorAll("li").length : 0,
        ncsc: sec["NCSC relationship"] ? sec["NCSC relationship"].querySelectorAll("a").length : 0,
        links,
        sheetScrollable: getComputedStyle(sheet).overflowY === "auto" || getComputedStyle(sheet).overflowY === "scroll",
        sheetH: sheet.getBoundingClientRect().height, vh: innerHeight,
        hOverflow: sheet.scrollWidth > sheet.clientWidth + 1,
        sheetW: sheet.getBoundingClientRect().width
      };
    });
    if (!info) { ok(false, label + ": card did not open"); return null; }
    const problems = [];
    if (info.title !== key) problems.push("title " + info.title);
    NEED.forEach(h => { if (!info.heads.includes(h)) problems.push("missing " + h); });
    if (info.what.length < 20) problems.push("short what");
    if (info.why.length < 20) problems.push("short why");
    if (info.how < 3) problems.push("how bullets " + info.how);
    if (info.ncsc < 1) problems.push("no NCSC link");
    info.links.forEach(l => {
      if (l.ext) {
        if (!/^https:\/\//.test(l.href)) problems.push("non-https " + l.href);
        if (l.target !== "_blank" || !/noopener/.test(l.rel)) problems.push("not new tab " + l.href);
      } else if (!/^\//.test(l.href) || l.target) problems.push("bad internal link " + l.href);
    });
    if (!info.sheetScrollable) problems.push("sheet not scrollable");
    if (info.sheetH > info.vh) problems.push("sheet taller than viewport");
    if (info.hOverflow) problems.push("horizontal overflow");
    if (info.sheetW > 390) problems.push("sheet wider than 390");
    if (problems.length) ok(false, label + ": " + problems.join("; "));
    return info;
  }
  async function closeCard() {
    await page.click("#hwCardOverlay .osi-card-x");
    await page.waitForFunction(() => document.getElementById("hwCardOverlay").hidden, null, { timeout: 2000 });
  }

  let opened = 0, total = 0, perLayer = [];
  const allLinks = new Set();
  for (const L of [...counts.layers].reverse()) {
    await page.click(`#panel button[data-go="${L.n}"]`);
    const sel = `#panel ul.items li.has-card[data-layer="${L.n}"]`;
    const n = await page.locator(sel).count();
    const want = L.p + L.s;
    ok(n === want, `L${L.n}: ${n}/${want} items are clickable cards`);
    const hint = await page.locator("#panel .card-hint").count();
    ok(hint >= 1, `L${L.n}: tap hint shown`);
    let good = 0;
    for (let i = 0; i < n; i++) {
      const li = page.locator(sel).nth(i);
      const name = await li.evaluate(el => { const k = el.dataset.kind, l = LAYERS.find(x => x.n === +el.dataset.layer); return l[k === "p" ? "protocols" : "security"][+el.dataset.idx].n; });
      await li.scrollIntoViewIfNeeded();
      await li.click();
      total++;
      const info = await checkOpenCard(`L${L.n} ${name}`, name);
      if (info) { opened++; good++; info.links.forEach(l => allLinks.add(l.href)); }
      const shot = SHOOT[L.n + ":" + name];
      if (shot && info) await page.screenshot({ path: path.join(SHOTS, shot + ".png") });
      if (info) await closeCard();
    }
    perLayer.push(`L${L.n}=${good}/${want}`);
  }
  // cross-layer capabilities (overview panel)
  await page.click('#panel button[data-go="all"]');
  const xsel = '#panel ul.items li.has-card[data-kind="x"]';
  const xn = await page.locator(xsel).count();
  ok(xn === counts.cross, `cross-layer: ${xn}/${counts.cross} items are clickable cards`);
  let xgood = 0;
  for (let i = 0; i < xn; i++) {
    const li = page.locator(xsel).nth(i);
    const name = await li.evaluate(el => CROSS_LAYER[+el.dataset.idx].n);
    await li.scrollIntoViewIfNeeded();
    await li.click();
    total++;
    const info = await checkOpenCard(`cross ${name}`, name);
    if (info) { opened++; xgood++; info.links.forEach(l => allLinks.add(l.href)); }
    if (name === "XDR" && info) ok(/Extended detection/.test(info.what), "cross-layer XDR opens the cross-layer card, not the L6 format");
    const shot = SHOOT["x:" + name];
    if (shot && info) await page.screenshot({ path: path.join(SHOTS, shot + ".png") });
    if (info) await closeCard();
  }
  perLayer.push(`cross=${xgood}/${counts.cross}`);
  ok(opened === total, `opened and checked ${opened}/${total} cards (${perLayer.join(", ")})`);

  // L6 XDR is the data format; keyboard opens a card; Escape closes it
  await page.click('#panel button[data-go="6"]');
  const xdr = page.locator('#panel li.has-card[data-layer="6"]', { hasText: "External Data Representation" });
  await xdr.focus();
  await page.keyboard.press("Enter");
  const t = await page.evaluate(() => document.querySelector("#hwCardBody section p").textContent);
  ok(/External Data Representation/.test(t), "L6 XDR opens the data-format card (keyboard Enter)");
  await page.keyboard.press("Escape");
  ok(await page.evaluate(() => document.getElementById("hwCardOverlay").hidden), "Escape closes the card");

  // a long card scrolls inside the sheet on a phone
  await page.click('#panel button[data-go="7"]');
  await page.locator('#panel li.has-card[data-layer="7"]', { hasText: "Endpoint detection" }).click();
  const sc = await page.evaluate(() => { const s = document.querySelector("#hwCardOverlay .osi-card-sheet"); const before = s.scrollTop; s.scrollTop = s.scrollHeight; return { can: s.scrollHeight > s.clientHeight, moved: s.scrollTop > before }; });
  ok(sc.can && sc.moved, "long card scrolls inside the sheet at 390px");
  await page.screenshot({ path: path.join(SHOTS, "card-L7-EDR-scrolled.png") });
  await closeCard();

  // L0 cards unchanged: still show NIST + tutorial link
  await page.click('#panel button[data-go="0"]');
  await page.locator('#panel li.has-card[data-layer="0"]').first().click();
  const l0 = await page.evaluate(() => [...document.querySelectorAll("#hwCardBody h4")].map(h => h.textContent));
  ok(l0.includes("NIST relationship") && l0.includes("In the tutorial"), "L0 card still has NIST and tutorial sections");
  await closeCard();

  const docW = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(docW <= 390, "page has no horizontal overflow at 390px (" + docW + ")");
  ok(errs.length === 0, "no console errors" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));
  const csp = await page.evaluate(() => window.__csp);
  ok(csp.length === 0, "no CSP violations" + (csp.length ? ": " + csp.join(", ") : ""));
  fs.writeFileSync(path.join(SHOTS, "card-links.txt"), [...allLinks].sort().join("\n") + "\n");
  console.log("links seen in cards: " + allLinks.size);
  await browser.close();
  console.log(fails ? `FAILED ${fails}` : "ALL-CARDS-E2E-PASSED");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
