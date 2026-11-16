const { chromium } = require("playwright-core");
const B = (process.env.B || "http://127.0.0.1:33778").replace(/\/$/, "");
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const TAG = process.env.TAG || "pb-";

function fail(errors, cond, msg) { if (!cond) errors.push(msg); }

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const out = {};
  const views = [
    ["phone360", { width: 360, height: 800 }, true],
    ["phone390", { width: 390, height: 844 }, true],
    ["desktop", { width: 1440, height: 900 }, false],
  ];
  for (const [name, vp, mobile] of views) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    const errors = [];
    pg.on("pageerror", (e) => errors.push("pageerror " + e.message));
    pg.on("console", (m) => { if (m.type() === "error") errors.push("console " + m.text()); });
    const rec = {};
    out[name] = rec;

    let r = await pg.goto(B + "/govmap/parliament/", { waitUntil: "networkidle" });
    await pg.waitForSelector(".gm-parl-card", { timeout: 10000 });
    rec.parliament = await pg.evaluate(() => {
      const cards = [...document.querySelectorAll(".gm-parl-card")].map((c) => ({
        id: c.id,
        text: c.innerText.replace(/\s+/g, " ").slice(0, 240),
      }));
      const ext = [...document.querySelectorAll("#gm-parliament a[href^='http']")].map((a) => ({
        href: a.getAttribute("href"),
        target: a.getAttribute("target"),
        rel: a.getAttribute("rel") || "",
      }));
      return {
        statusOk: true,
        csp: "",
        heading: (document.querySelector("#gm-title") || {}).textContent || "",
        banner: (document.querySelector(".gm-parl-kicker") || {}).textContent || "",
        intro: (document.querySelector(".section-intro") || {}).textContent || "",
        cards: cards.length,
        ids: cards.map((c) => c.id),
        nao: (document.querySelector("#nao") || {}).innerText || "",
        phso: (document.querySelector("#phso") || {}).innerText || "",
        ipsa: (document.querySelector("#ipsa") || {}).innerText || "",
        devolved: (document.querySelector("#devolved") || {}).innerText || "",
        portcullis: document.body.innerText.toLowerCase().includes("portcullis") || !!document.querySelector("img[alt*='portcullis' i], [class*='portcullis']"),
        hscroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        ext,
        sameTabInternal: [...document.querySelectorAll("a[href^='/govmap/']")].every((a) => !a.target || a.target === "_self"),
      };
    });
    rec.parliament.status = r.status();
    rec.parliament.csp = (r.headers()["content-security-policy"] || "").slice(0, 90);
    fail(errors, rec.parliament.status === 200, "parliament status");
    fail(errors, /Accountable to Parliament/.test(rec.parliament.heading), "heading " + rec.parliament.heading);
    fail(errors, /Outside government/.test(rec.parliament.banner), "banner");
    fail(errors, rec.parliament.cards === 5, "cards " + rec.parliament.cards);
    fail(errors, rec.parliament.ids.join(",") === "nao,phso,electoral-commission,ipsa,lgbce", "ids " + rec.parliament.ids);
    fail(errors, /117.750 million/.test(rec.parliament.nao) && /TPAC/.test(rec.parliament.nao), "NAO figure/committee");
    fail(errors, /59.258 million/.test(rec.parliament.phso) && /PACAC/.test(rec.parliament.phso), "PHSO figure/committee");
    fail(errors, /318.353 million/.test(rec.parliament.ipsa) && /MPs/.test(rec.parliament.ipsa), "IPSA figure/note");
    fail(errors, /Audit Scotland/.test(rec.parliament.devolved) && /Audit Wales/.test(rec.parliament.devolved) && /Northern Ireland Audit Office/.test(rec.parliament.devolved), "devolved note");
    fail(errors, !rec.parliament.portcullis, "portcullis present");
    fail(errors, !rec.parliament.hscroll, "parliament hscroll");
    fail(errors, rec.parliament.ext.length > 0 && rec.parliament.ext.every((a) => a.target === "_blank" && /noopener/.test(a.rel)), "external targets");
    fail(errors, rec.parliament.sameTabInternal, "internal links should be same tab");
    await pg.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0); });
    if (name === "phone390" || name === "desktop") {
      await pg.screenshot({ path: `${SHOTS}/${TAG}parliament-${name}.png`, fullPage: name === "desktop" });
      if (name === "phone390") {
        await pg.evaluate(() => {
          const t = document.querySelector(".gm-parl-banner") || document.querySelector("#gm-title");
          if (t) window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 8);
        });
        await pg.screenshot({ path: `${SHOTS}/${TAG}parliament-${name}-view.png`, fullPage: false });
      }
    }

    r = await pg.goto(B + "/govmap/budget/", { waitUntil: "networkidle" });
    await pg.waitForSelector(".gm-budg-item", { timeout: 10000 });
    rec.budget = await pg.evaluate(() => {
      const bars = document.querySelectorAll(".gm-budg-item");
      const first = (document.querySelector(".gm-budg-item") || {}).innerText || "";
      const names = [...document.querySelectorAll(".gm-budg-name")].map((n) => n.childNodes[0] && n.childNodes[0].textContent ? n.childNodes[0].textContent : n.textContent);
      const fills = [...document.querySelectorAll(".gm-budg-fill")].map((f) => f.style.width);
      return {
        heading: (document.querySelector("#gm-title") || {}).textContent || "",
        total: (document.querySelector(".gm-budg-total") || {}).innerText || "",
        bars: bars.length,
        first: first.replace(/\\s+/g, " "),
        names,
        hasHealth: names.some((n) => /Health and Social Care/.test(n)),
        hasNaoBar: names.some((n) => /National Audit Office|Electoral Commission|IPSA|LGBCE|PHSO/.test(n)),
        bistInvented: names.some((n) => /\\bBIST\\b/.test(n)),
        combined: (document.querySelector(".gm-budg-combined") || {}).innerText || "",
        caveats: (document.querySelector(".gm-budg-caveats") || {}).innerText || "",
        source: (document.querySelector(".gm-budg-src") || {}).innerText || "",
        hscroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        extTargets: [...document.querySelectorAll("#gm-budget a[href^='http']")].every((a) => a.target === "_blank"),
        fillsOk: fills.length > 0 && fills.every((w) => /%$/.test(w)),
      };
    });
    rec.budget.status = r.status();
    rec.budget.csp = (r.headers()["content-security-policy"] || "").slice(0, 90);
    fail(errors, rec.budget.status === 200, "budget status");
    fail(errors, /664,958/.test(rec.budget.total) || /664958/.test(rec.budget.total) || /£665/.test(rec.budget.total) || /£664\\.9/.test(rec.budget.total), "total " + rec.budget.total);
    fail(errors, rec.budget.hasHealth && /34.02%/.test(rec.budget.first) && /£226.2bn/.test(rec.budget.first), "health bar " + rec.budget.first);
    fail(errors, rec.budget.bars >= 24, "bar count " + rec.budget.bars);
    fail(errors, !rec.budget.hasNaoBar, "parliament body on budget chart");
    fail(errors, !rec.budget.bistInvented, "invented BIST line");
    fail(errors, /32/.test(rec.budget.combined) && /MHCLG/.test(rec.budget.combined), "combined MHCLG " + rec.budget.combined);
    fail(errors, /AME/.test(rec.budget.caveats) && /Small and Independent/.test(rec.budget.caveats), "caveats");
    fail(errors, /Table 1.9/.test(rec.budget.source) && /2026/.test(rec.budget.source), "source");
    fail(errors, !rec.budget.hscroll, "budget hscroll");
    fail(errors, rec.budget.extTargets, "budget ext targets");
    if (name === "phone390" || name === "desktop") {
      await pg.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0); });
      const el = await pg.$(".gm-budg-bars");
      if (name === "phone390") {
        await pg.evaluate(() => {
          const t = document.querySelector(".gm-budg-total") || document.querySelector("#gm-title");
          if (t) window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 8);
        });
        await pg.screenshot({ path: `${SHOTS}/${TAG}budget-${name}-view.png`, fullPage: false });
        await pg.screenshot({ path: `${SHOTS}/${TAG}budget-${name}.png`, fullPage: true });
      } else {
        await pg.screenshot({ path: `${SHOTS}/${TAG}budget-${name}-view.png`, fullPage: false });
        await pg.screenshot({ path: `${SHOTS}/${TAG}budget-${name}.png`, fullPage: true });
      }
    }

    // tree teaser + unattached flag
    if (name === "desktop" || name === "phone390") {
      await pg.goto(B + "/govmap/", { waitUntil: "networkidle" });
      await pg.waitForSelector(".gm-extra-parl");
      rec.tree = await pg.evaluate(() => ({
        parl: !!document.querySelector("a.gm-extra-parl[href='/govmap/parliament/']"),
        budg: !!document.querySelector("a.gm-extra-budg[href='/govmap/budget/']"),
        hscroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        tabs: [...document.querySelectorAll(".gm-tabs a")].map((a) => a.getAttribute("href")),
      }));
      fail(errors, rec.tree.parl && rec.tree.budg, "tree teasers");
      fail(errors, !rec.tree.hscroll, "tree hscroll");
      fail(errors, rec.tree.tabs.includes("/govmap/parliament/") && rec.tree.tabs.includes("/govmap/budget/"), "tabs");
      await pg.goto(B + "/govmap/?dept=not-attached", { waitUntil: "networkidle" });
      await pg.waitForSelector(".gm-parl-flag, .gm-parl-note", { timeout: 8000 });
      rec.unattached = await pg.evaluate(() => ({
        note: !!(document.querySelector(".gm-parl-note")),
        flags: document.querySelectorAll(".gm-parl-flag").length,
        hrefs: [...document.querySelectorAll(".gm-parl-flag")].map((a) => a.getAttribute("href")),
      }));
      fail(errors, rec.unattached.note, "unattached note");
      fail(errors, rec.unattached.flags >= 3, "flags " + rec.unattached.flags);
      fail(errors, rec.unattached.hrefs.includes("/govmap/parliament/#ipsa"), "ipsa flag href " + rec.unattached.hrefs);
    }

    rec.errors = errors;
    await ctx.close();
  }

  {
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const pg2 = await ctx2.newPage();
    const e2 = [];
    pg2.on("pageerror", (e) => e2.push(String(e)));
    await pg2.goto(B + "/govmap/budget/", { waitUntil: "networkidle" });
    await pg2.waitForSelector(".gm-budg-fill");
    out.reduced = await pg2.evaluate(() => {
      const fill = document.querySelector(".gm-budg-fill");
      return { transition: fill ? getComputedStyle(fill).transitionDuration : "n/a" };
    });
    out.reduced.errors = e2;
    const dur = parseFloat(out.reduced.transition);
    if (out.reduced.transition !== "0s" && !(dur === 0)) e2.push("bar transition " + out.reduced.transition);
    await ctx2.close();
  }

  const failed = [];
  for (const [k, rec] of Object.entries(out)) {
    const errs = rec.errors || [];
    if (errs.length) failed.push(k + ": " + errs.join(" | "));
  }
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  if (failed.length) {
    console.error("FAIL\\n" + failed.join("\\n"));
    process.exit(1);
  }
})().catch((e) => { console.error(e); process.exit(1); });
