const { chromium } = require("playwright-core");
const B = (process.env.B || "http://127.0.0.1:33778").replace(/\/$/, "");
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const TAG = process.env.TAG || "tt-";

function fail(errors, cond, msg) { if (!cond) errors.push(msg); }

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const out = {};
  const views = [
    ["phone360", { width: 360, height: 800 }, true],
    ["phone390", { width: 390, height: 844 }, true],
    ["desktop", { width: 1440, height: 900 }, false],
  ];
  for (const [name, vp, mobile] of views) {
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    const errors = [];
    const rec = { errors };
    out[name] = rec;
    pg.on("pageerror", (e) => errors.push("pageerror " + e.message));

    const r = await pg.goto(B + "/govmap/budget/", { waitUntil: "networkidle" });
    await pg.waitForSelector("#gm-budget .gm-budg-total, .gm-gterm");
    await pg.waitForTimeout(400);
    rec.status = r.status();
    rec.csp = (r.headers()["content-security-policy"] || "").slice(0, 90);
    rec.budget = await pg.evaluate(() => {
      const intro = (document.querySelector(".section-intro") || {}).textContent || "";
      const marks = [...document.querySelectorAll("#govmap .gm-gterm")];
      const first = marks[0];
      const h1 = document.querySelector("#gm-title");
      const inH1 = !!(h1 && h1.querySelector(".gm-gterm"));
      const inLink = marks.some((m) => m.closest("a"));
      return {
        intro,
        marks: marks.length,
        first: first ? first.textContent : "",
        firstTerm: first ? first.getAttribute("data-term") : "",
        inH1,
        inLink,
        hscroll: document.documentElement.scrollWidth > innerWidth + 1,
        ids: marks.map((m) => m.getAttribute("data-term") + ":" + m.textContent).slice(0, 12),
      };
    });
    fail(errors, rec.status === 200, "budget status");
    fail(errors, /Total DEL \(departmental expenditure limit\)/.test(rec.budget.intro), "spell-out " + rec.budget.intro.slice(0, 120));
    fail(errors, rec.budget.marks >= 1, "no term marks " + rec.budget.marks);
    fail(errors, !rec.budget.inH1, "marked inside heading");
    fail(errors, !rec.budget.inLink, "marked inside link");
    fail(errors, !rec.budget.hscroll, "hscroll budget");

    if (mobile) {
      const term = pg.locator("#govmap .gm-gterm").first();
      await term.scrollIntoViewIfNeeded();
      await term.tap();
      await pg.waitForTimeout(250);
      rec.tip = await pg.evaluate(() => {
        const tip = document.getElementById("gm-gterm-tip");
        const more = tip && tip.querySelector(".gm-gterm-more");
        return {
          visible: !!(tip && !tip.hidden),
          role: tip && tip.getAttribute("role"),
          text: tip ? tip.innerText.replace(/\s+/g, " ").trim() : "",
          href: more ? more.getAttribute("href") : "",
          target: more ? more.getAttribute("target") : "",
          left: tip ? tip.getBoundingClientRect().left : -1,
          right: tip ? tip.getBoundingClientRect().right : -1,
          vw: innerWidth,
        };
      });
      fail(errors, rec.tip.visible, "tap tip not visible");
      fail(errors, rec.tip.role === "tooltip", "role tooltip");
      fail(errors, /More in glossary/.test(rec.tip.text), "more link text");
      fail(errors, (rec.tip.href || "").indexOf("/govmap/glossary/#") === 0, "more href " + rec.tip.href);
      fail(errors, !rec.tip.target, "more should be same tab");
      fail(errors, rec.tip.left >= -1 && rec.tip.right <= rec.tip.vw + 1, "tip overflow " + rec.tip.left + ".." + rec.tip.right);
      if (name === "phone390") {
        await pg.screenshot({ path: `${SHOTS}/${TAG}budget-tooltip-phone390.png`, fullPage: false });
      }
      await pg.keyboard.press("Escape");
      await pg.waitForTimeout(150);
      rec.esc = await pg.evaluate(() => {
        const tip = document.getElementById("gm-gterm-tip");
        return !tip || tip.hidden;
      });
      fail(errors, rec.esc, "esc did not close");
    } else {
      const term = pg.locator("#govmap .gm-gterm").first();
      await term.hover();
      await pg.waitForTimeout(250);
      rec.tip = await pg.evaluate(() => {
        const tip = document.getElementById("gm-gterm-tip");
        const more = tip && tip.querySelector(".gm-gterm-more");
        const btn = document.querySelector("#govmap .gm-gterm");
        return {
          visible: !!(tip && !tip.hidden),
          role: tip && tip.getAttribute("role"),
          described: btn && btn.getAttribute("aria-describedby"),
          text: tip ? tip.innerText.replace(/\s+/g, " ").trim() : "",
          href: more ? more.getAttribute("href") : "",
          target: more ? more.getAttribute("target") : "",
        };
      });
      fail(errors, rec.tip.visible, "hover tip not visible");
      fail(errors, rec.tip.role === "tooltip" && rec.tip.described === "gm-gterm-tip", "a11y");
      fail(errors, /More in glossary/.test(rec.tip.text) && (rec.tip.href || "").indexOf("/govmap/glossary/#") === 0 && !rec.tip.target, "more link");
      await pg.screenshot({ path: `${SHOTS}/${TAG}budget-tooltip-desktop.png`, fullPage: false });
      await term.focus();
      await pg.waitForTimeout(150);
      rec.focusTip = await pg.evaluate(() => {
        const tip = document.getElementById("gm-gterm-tip");
        return !!(tip && !tip.hidden);
      });
      fail(errors, rec.focusTip, "focus tip");
      await pg.keyboard.press("Escape");
    }

    // glossary has the required terms
    await pg.goto(B + "/govmap/glossary/", { waitUntil: "networkidle" });
    await pg.waitForSelector("#gm-gloss .gm-term");
    rec.glossary = await pg.evaluate(() => {
      const need = ["departmental-expenditure-limit","resource-del","capital-del","total-del","pesa","main-estimates","public-accounts-commission","public-administration-and-constitutional-affairs-committee","speakers-committee","non-ministerial-department","non-departmental-public-body","small-and-independent-bodies"];
      const missing = need.filter((id) => !document.getElementById(id));
      const del = (document.querySelector("#departmental-expenditure-limit .gm-def") || {}).textContent || "";
      const total = (document.querySelector("#total-del .gm-def") || {}).textContent || "";
      return { missing, del, total, n: document.querySelectorAll(".gm-term").length, hscroll: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    fail(errors, rec.glossary.missing.length === 0, "glossary missing " + rec.glossary.missing);
    fail(errors, /£664,958 million/.test(rec.glossary.total), "total del figure");
    fail(errors, !rec.glossary.hscroll, "hscroll glossary");

    // tree cards
    await pg.goto(B + "/govmap/", { waitUntil: "networkidle" });
    await pg.waitForSelector(".gm-card");
    await pg.waitForFunction(() => [...document.querySelectorAll(".gm-card-bud")].some((el) => el.textContent && /Budget:/.test(el.textContent)));
    rec.tree = await pg.evaluate(() => {
      function card(name) {
        const a = [...document.querySelectorAll(".gm-card")].find((c) => (c.querySelector(".gm-card-n") || {}).textContent === name);
        return a ? ((a.querySelector(".gm-card-bud") || {}).textContent || "") : "";
      }
      return {
        mod: card("Ministry of Defence"),
        mhclg: card("Ministry of Housing, Communities and Local Government"),
        ago: card("Attorney General's Office"),
        bist: card("Department for Business, Innovation, Science and Trade"),
        sco: card("Scotland Office"),
        wales: card("Wales Office"),
        nio: card("Northern Ireland Office"),
        ukef: card("UK Export Finance"),
        oag: card("Office of the Advocate General for Scotland"),
        olhc: card("Office of the Leader of the House of Commons"),
        nca: card("National Crime Agency"),
        hscroll: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    const SIB = "Budget: included in the Treasury's 'small and independent bodies' total, no separate figure";
    const NONE = "Budget: no separate Treasury figure";
    fail(errors, /9\.79%/.test(rec.tree.mod) && /£65\.1bn/.test(rec.tree.mod) && /2026-27/.test(rec.tree.mod), "MOD card " + rec.tree.mod);
    fail(errors, /4\.95%/.test(rec.tree.mhclg) && /£32\.9bn/.test(rec.tree.mhclg) && /combined total of two PESA lines/.test(rec.tree.mhclg), "MHCLG card " + rec.tree.mhclg);
    fail(errors, rec.tree.sco === SIB && rec.tree.wales === SIB && rec.tree.nio === SIB && rec.tree.ukef === SIB && rec.tree.oag === SIB, "SIB cards " + rec.tree.sco + " / " + rec.tree.wales);
    fail(errors, rec.tree.ago === NONE && rec.tree.olhc === NONE && rec.tree.nca === NONE, "no-line cards " + rec.tree.ago + " / " + rec.tree.olhc + " / " + rec.tree.nca);
    fail(errors, /0\.48%/.test(rec.tree.bist) && /£3\.2bn/.test(rec.tree.bist) && /Business and Trade/.test(rec.tree.bist) && !/16\.1/.test(rec.tree.bist) && !/19\.3/.test(rec.tree.bist), "BIST card " + rec.tree.bist);
    fail(errors, !rec.tree.hscroll, "hscroll tree");

    // ministerial circle: keyboard to MOD tip
    await pg.goto(B + "/govmap/ministerial/", { waitUntil: "networkidle" });
    await pg.waitForSelector("#gm-canvas");
    await pg.waitForTimeout(500);
    await pg.locator("#gm-canvas").focus();
    rec.modTip = "";
    for (let i = 0; i < 30; i++) {
      await pg.keyboard.press("ArrowRight");
      await pg.waitForTimeout(40);
      const t = await pg.locator("#gm-tip").innerText().catch(() => "");
      if (/Ministry of Defence/.test(t)) { rec.modTip = t.replace(/\s+/g, " ").trim(); break; }
    }
    fail(errors, /Ministry of Defence/.test(rec.modTip), "MOD tip name " + rec.modTip);
    fail(errors, /Budget: 9\.79% of Total DEL \(£65\.1bn\), 2026-27/.test(rec.modTip), "MOD budget " + rec.modTip);
    rec.modDelLink = await pg.evaluate(() => {
      const a = document.querySelector("#gm-tip a.gm-bud-del");
      return a ? { href: a.getAttribute("href"), target: a.getAttribute("target") || "" } : null;
    });
    fail(errors, rec.modDelLink && rec.modDelLink.href === "/govmap/glossary/#total-del" && !rec.modDelLink.target, "Total DEL link " + JSON.stringify(rec.modDelLink));
    if (name === "desktop") {
      await pg.screenshot({ path: `${SHOTS}/${TAG}mod-tooltip-desktop.png`, fullPage: false });
    }
    // Scotland Office circle tooltip
    rec.scoTip = "";
    for (let i = 0; i < 30; i++) {
      await pg.keyboard.press("ArrowRight");
      await pg.waitForTimeout(40);
      const t = await pg.locator("#gm-tip").innerText().catch(() => "");
      if (/Scotland Office/.test(t)) { rec.scoTip = t.replace(/\s+/g, " ").trim(); break; }
    }
    fail(errors, /Scotland Office/.test(rec.scoTip), "Scotland Office tip name " + rec.scoTip);
    fail(errors, /included in the Treasury's 'small and independent bodies' total, no separate figure/.test(rec.scoTip), "Scotland Office wording " + rec.scoTip);
    rec.scoLink = await pg.evaluate(() => {
      const a = document.querySelector("#gm-tip a.gm-bud-del");
      return a ? { href: a.getAttribute("href"), text: a.textContent, target: a.getAttribute("target") || "" } : null;
    });
    fail(errors, rec.scoLink && rec.scoLink.href === "/govmap/glossary/#small-and-independent-bodies" && rec.scoLink.text === "small and independent bodies" && !rec.scoLink.target, "SIB glossary link " + JSON.stringify(rec.scoLink));
    if (name === "desktop") {
      await pg.screenshot({ path: `${SHOTS}/${TAG}scotland-office-tooltip-desktop.png`, fullPage: false });
    }

    // org overview tooltip for MHCLG (or MOD)
    await pg.locator('.gm-chart-switch .gm-seg-b[data-view="org"]').click();
    await pg.waitForSelector(".gm-dg-ov .gm-dg-dept");
    await pg.waitForTimeout(300);
    const ov = pg.locator('.gm-dg-ov .gm-dg-dept[data-slug="ministry-of-defence"]');
    if (mobile) {
      // hover via dispatch — click would navigate; use pointerenter
      await ov.evaluate((el) => el.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true })));
    } else {
      await ov.hover({ force: true });
    }
    await pg.waitForTimeout(250);
    rec.orgTip = await pg.evaluate(() => {
      const tip = document.querySelector(".gm-dg-tip:not([hidden])");
      return tip ? tip.innerText.replace(/\s+/g, " ").trim() : "";
    });
    fail(errors, /Ministry of Defence/.test(rec.orgTip) && /9\.79%/.test(rec.orgTip) && /£65\.1bn/.test(rec.orgTip), "org tip " + rec.orgTip);
    rec.chartHscroll = await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    fail(errors, !rec.chartHscroll, "hscroll chart");

    rec.errors = errors;
    await ctx.close();
  }

  // reduced motion: tips still work, no need for width transition
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const pg = await ctx.newPage();
    const errors = [];
    await pg.goto(B + "/govmap/budget/", { waitUntil: "networkidle" });
    await pg.waitForSelector(".gm-gterm");
    recRed = {};
    recRed.trans = await pg.evaluate(() => {
      const el = document.querySelector(".gm-gterm");
      return el ? getComputedStyle(el).transitionDuration : "";
    });
    await pg.locator("#govmap .gm-gterm").first().tap();
    recRed.visible = await pg.evaluate(() => {
      const tip = document.getElementById("gm-gterm-tip");
      return !!(tip && !tip.hidden);
    });
    if (!recRed.visible) errors.push("reduced tip");
    recRed.errors = errors;
    out.reduced = recRed;
    await ctx.close();
  }

  console.log(JSON.stringify(out, null, 1));
  const bad = Object.values(out).some((r) => (r.errors || []).length);
  await b.close();
  process.exit(bad ? 1 : 0);
})();
