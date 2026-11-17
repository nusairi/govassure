const { chromium } = require("playwright-core");
const fs = require("fs");
const BASE = process.argv[2] || "http://127.0.0.1:18431";
const path = require("path");
const SHOTS = process.argv[3] || process.env.SHOTS || path.join(__dirname, "shots");
const TMP = "/tmp/mx-e2e"; fs.mkdirSync(TMP, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK " : "BAD ") + m); if (!c) fails++; };
(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", m => { if (m.type() === "error" || /Content Security Policy/i.test(m.text())) errs.push(m.text()); });
  page.on("pageerror", e => errs.push("pageerror " + e.message));
  page.on("dialog", d => d.accept());
  await page.addInitScript(() => { window.__csp = []; document.addEventListener("securitypolicyviolation", e => window.__csp.push(e.violatedDirective + " " + e.blockedURI)); });
  const resp = await page.goto(BASE + "/matrix", { waitUntil: "networkidle" });
  ok(resp.status() === 200, "GET /matrix " + resp.status());
  const h = resp.headers();
  ok(/default-src 'none'/.test(h["content-security-policy"] || ""), "CSP header present");
  ok(h["x-frame-options"] === "DENY" && h["x-content-type-options"] === "nosniff" && !!h["strict-transport-security"], "security headers present");
  ok(await page.locator("#mxBody tr.mx-row").count() === 9, "9 layer rows (L0-L8)");
  ok((await page.locator("#mxBody tr.mx-row th .mx-tag").allTextContents()).join(",") === "L0,L1,L2,L3,L4,L5,L6,L7,L8", "rows ordered L0..L8");
  ok(await page.locator(".mx-ta.is-ex").count() > 30, "examples shown and marked");
  // links
  const ext = await page.$$eval("a[href^='http']", as => as.map(a => [a.href, a.target, a.closest("header,.ga-brandbar") ? 1 : 0]));
  ok(ext.filter(x => /ncsc\.gov\.uk/.test(x[0])).every(x => x[1] === "_blank"), "NCSC links open in new tab");
  ok(ext.every(x => /^https:\/\/(www\.ncsc\.gov\.uk\/|www\.linkedin\.com\/company\/102617034\/$|learn\.microsoft\.com\/en-us\/|github\.com\/nusairi\/govassure$|www\.govassured\.com\/$)/.test(x[0])), "only allowed external links (" + ext.length + ")");
  const internal = await page.$$eval("a[href^='/']", as => as.map(a => a.getAttribute("target")));
  ok(internal.length > 0 && internal.every(t => !t), "in-site links open in same tab");
  ok(await page.locator(".mx-learn a[href='/tutorial']").count() === 1, "hardware row links to /tutorial");
  ok(await page.locator("#ga-sources:not([hidden])").count() === 0, "NCSC links not moved to Sources box");
  await page.screenshot({ path: SHOTS + "/desktop-matrix.png", fullPage: false });
  await page.screenshot({ path: SHOTS + "/desktop-matrix-full.png", fullPage: true });
  // Microsoft tool picker
  ok(await page.locator("select.mx-toolpick").count() === 9, "Microsoft tool picker on every row");
  const firstGroup = await page.$eval("#mx-tool-6 optgroup", g => g.label + ": " + [...g.querySelectorAll("option")].map(o => o.value).join(","));
  ok(/Microsoft, commonly used at L6: .*keyvault/.test(firstGroup), "picker lists tools for that layer first (" + firstGroup + ")");
  const before6 = await page.locator("#mx-ctls-6 textarea").count();
  await page.selectOption("#mx-tool-6", "keyvault");
  ok(await page.locator("#mx-ctls-6 textarea").count() === before6 + 1, "picking a tool adds a control");
  const added = await page.$$eval("#mx-ctls-6 textarea", t => t.map(x => x.value).pop());
  ok(added === "Azure Key Vault (secrets safe)", "added control names the tool (" + added + ")");
  ok(await page.inputValue("#mx-tool-6") === "", "picker resets after adding");
  await page.waitForTimeout(400);
  await page.reload({ waitUntil: "networkidle" });
  ok((await page.$$eval("#mx-ctls-6 textarea", t => t.map(x => x.value))).includes("Azure Key Vault (secrets safe)"), "picked tool persists after reload");
  ok(await page.locator("a[href='/matrix/game']").count() >= 1 && await page.locator("a[href='/matrix/tools']").count() >= 1, "matrix links to game and tool list");
  // keyboard
  await page.keyboard.press("Tab");
  let tabbedTo = "";
  for (let i = 0; i < 60; i++) { await page.keyboard.press("Tab"); tabbedTo = await page.evaluate(() => document.activeElement.className); if (/mx-ta/.test(tabbedTo)) break; }
  ok(/mx-ta/.test(tabbedTo), "keyboard Tab reaches an editable cell");
  const unlabelled = await page.$$eval("#mxBody textarea, #mxBody select, #mxShow, #mxImport", els => els.filter(e => !(e.labels && e.labels.length) && !e.getAttribute("aria-label")).length);
  ok(unlabelled === 0, "every input has a label");
  // edit + persist
  await page.fill("#mx-assets-3", "Our core routers (test)");
  await page.click("button[data-add='3']");
  await page.keyboard.type("Test control: =SUM(1,2) \"quoted\", comma");
  await page.selectOption("#mx-rating-3", "good");
  await page.click("#mx-ctls-5 li:first-child .mx-rm");
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: "networkidle" });
  ok(await page.inputValue("#mx-assets-3") === "Our core routers (test)", "edited cell persists after reload");
  const ctl3 = await page.$$eval("#mx-ctls-3 textarea", t => t.map(x => x.value));
  ok(ctl3.includes("Test control: =SUM(1,2) \"quoted\", comma"), "added control persists after reload");
  ok(await page.inputValue("#mx-rating-3") === "good" && await page.getAttribute("#mx-rating-3 >> xpath=..", "data-rating") === "good", "rating persists and is coloured");
  ok(await page.locator("#mx-ctls-5 textarea").count() === 2, "removed control stays removed");
  // export CSV
  let [dl] = await Promise.all([page.waitForEvent("download"), page.click("#mxCsv")]);
  const csvPath = TMP + "/export.csv"; await dl.saveAs(csvPath);
  const csv = fs.readFileSync(csvPath, "utf8");
  ok(csv.charCodeAt(0) !== 0xFEFF && csv.startsWith("Layer,Layer name,What it protects"), "CSV header, no BOM");
  ok(csv.includes("\"'=SUM") === false && csv.includes("Test control: =SUM(1,2) \"\"quoted\"\", comma"), "CSV quoting correct");
  [dl] = await Promise.all([page.waitForEvent("download"), page.click("#mxXls")]);
  const xlsPath = TMP + "/export-excel.csv"; await dl.saveAs(xlsPath);
  const xls = fs.readFileSync(xlsPath);
  ok(xls[0] === 0xEF && xls[1] === 0xBB && xls[2] === 0xBF, "Excel CSV has UTF-8 BOM (" + dl.suggestedFilename() + ")");
  // round trip: blank then import
  await page.click("#mxBlank");
  ok(await page.inputValue("#mx-assets-3") === "" && await page.locator("#mxBody .mx-ctls li").count() === 0, "Start blank clears everything");
  await page.setInputFiles("#mxImport", xlsPath);
  await page.waitForFunction(() => /Imported 9 layers/.test(document.getElementById("mxStatus").textContent));
  ok(await page.inputValue("#mx-assets-3") === "Our core routers (test)", "import restores edited cell");
  [dl] = await Promise.all([page.waitForEvent("download"), page.click("#mxCsv")]);
  await dl.saveAs(TMP + "/export2.csv");
  ok(fs.readFileSync(TMP + "/export2.csv", "utf8") === csv, "CSV export -> import -> export round-trips identically");
  // formula guard
  await page.fill("#mx-owner-4", "=HYPERLINK(\"x\")");
  [dl] = await Promise.all([page.waitForEvent("download"), page.click("#mxCsv")]);
  await dl.saveAs(TMP + "/export3.csv");
  const c3 = fs.readFileSync(TMP + "/export3.csv", "utf8");
  ok(c3.includes("\"'=HYPERLINK(\"\"x\"\")\""), "formula-like cells guarded in CSV");
  await page.click("#mxBlank");
  await page.setInputFiles("#mxImport", TMP + "/export3.csv");
  await page.waitForFunction(() => /Imported/.test(document.getElementById("mxStatus").textContent));
  ok(await page.inputValue("#mx-owner-4") === "=HYPERLINK(\"x\")", "guard removed again on import");
  // bad import
  fs.writeFileSync(TMP + "/bad.csv", "foo,bar\n1,2\n");
  await page.setInputFiles("#mxImport", TMP + "/bad.csv");
  await page.waitForFunction(() => /Import failed/.test(document.getElementById("mxStatus").textContent));
  ok(await page.inputValue("#mx-owner-4") === "=HYPERLINK(\"x\")", "invalid CSV rejected without changing data");
  // clear examples keeps own entries
  await page.click("#mxRestore");
  await page.fill("#mx-gaps-2", "Own gap note");
  await page.click("#mxClearEx");
  ok(await page.locator(".mx-ta.is-ex").count() === 0 && await page.inputValue("#mx-gaps-2") === "Own gap note", "Clear examples removes examples, keeps own text");
  await page.click("#mxRestore");
  // filter
  await page.click("#mxLayerFilter button[data-f='3']");
  ok(await page.locator("#mxBody tr.mx-row:visible").count() === 1, "layer filter shows one layer");
  await page.click("#mxLayerFilter button[data-f='all']");
  await page.selectOption("#mxShow", "work");
  const vis = await page.locator("#mxBody tr.mx-row:visible").count();
  ok(vis > 0 && vis < 9, "needs-work filter (" + vis + " rows)");
  await page.selectOption("#mxShow", "all");
  const clip2 = await page.$$eval("#mxBody textarea", ts => ts.filter(t => t.offsetParent && t.scrollHeight > t.clientHeight + 2).length);
  ok(clip2 === 0, "rows revealed by a filter are sized to their text (" + clip2 + ")");
  // presenter
  await page.click("#mxPresent");
  ok(await page.isVisible("#mxPresentView"), "presenter opens");
  ok((await page.textContent("#mxPCount")).trim() === "1 / 9" && /Hardware/.test(await page.textContent("#mxPTitle")), "presenter starts at L0");
  await page.screenshot({ path: SHOTS + "/desktop-presenter-L0.png" });
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight");
  ok(/Network/.test(await page.textContent("#mxPTitle")), "arrow keys move to next layer");
  await page.screenshot({ path: SHOTS + "/desktop-presenter-L3.png" });
  await page.keyboard.press("Escape");
  ok(!(await page.isVisible("#mxPresentView")), "Esc closes presenter");
  // print
  await page.emulateMedia({ media: "print" });
  ok(await page.isVisible("#mxPrintView") && !(await page.isVisible("#mxToolbar")), "print view shows static table, hides toolbar");
  ok(await page.locator("#mxPrintView tbody tr").count() === 9, "print table has 9 layers");
  await page.screenshot({ path: SHOTS + "/print-view.png", fullPage: true });
  await page.pdf({ path: SHOTS + "/print-handout.pdf", landscape: true, format: "A4", printBackground: true, preferCSSPageSize: true });
  await page.emulateMedia({ media: "screen" });
  // light theme shot
  await page.click("#themeSeg button[data-set='light']");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  const clipped = await page.$$eval("#mxBody textarea", ts => ts.filter(t => t.offsetParent && t.scrollHeight > t.clientHeight + 2).length);
  ok(clipped === 0, "no clipped text in cells after print/resize (" + clipped + ")");
  await page.screenshot({ path: SHOTS + "/desktop-matrix-light.png" });
  await page.click("#themeSeg button[data-set='dark']");
  const csp = await page.evaluate(() => window.__csp);
  ok(csp.length === 0, "no CSP violations " + JSON.stringify(csp));
  ok(errs.length === 0, "no console errors " + JSON.stringify(errs));
  // phone
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pp = await phone.newPage(); const perr = [];
  pp.on("console", m => { if (m.type() === "error") perr.push(m.text()); });
  await pp.goto(BASE + "/matrix", { waitUntil: "networkidle" });
  const disp = await pp.$eval("#mx-row-3", e => getComputedStyle(e).display);
  ok(disp === "block", "phone: rows are stacked cards (display " + disp + ")");
  const sw = await pp.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= 392, "phone: no horizontal scroll (" + sw + ")");
  await pp.screenshot({ path: SHOTS + "/phone-matrix.png" });
  await pp.evaluate(() => document.getElementById("mx-row-5").scrollIntoView());
  await pp.screenshot({ path: SHOTS + "/phone-card-L5.png" });
  await pp.screenshot({ path: SHOTS + "/phone-matrix-full.png", fullPage: true });
  await pp.click("#mxPresent"); await pp.screenshot({ path: SHOTS + "/phone-presenter.png" });
  ok(perr.length === 0, "phone: no console errors " + JSON.stringify(perr));
  await browser.close();
  console.log(fails ? "E2E-FAILED " + fails : "E2E-PASSED");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
