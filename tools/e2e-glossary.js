const { chromium } = require("playwright-core");
const B = (process.env.B || "http://127.0.0.1:33776").replace(/\/$/, "");
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const TAG = process.env.TAG || "";
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const out = {};
  for (const [name, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text()); });
    pg.on("pageerror", (e) => errs.push("pageerror " + e.message));
    const R = {}; out[name] = R;
    const r = await pg.goto(B + "/govmap/glossary/", { waitUntil: "networkidle" });
    await pg.waitForSelector("#gm-gloss .gm-g-facts");
    R.status = r.status(); R.csp = (r.headers()["content-security-policy"] || "").slice(0, 40);
    Object.assign(R, await pg.evaluate(() => {
      const arts = [...document.querySelectorAll(".gm-term")];
      const links = [...document.querySelectorAll("#gm-gloss a")];
      const ext = links.filter((a) => a.target === "_blank");
      return {
        terms: arts.length, withFacts: arts.filter((a) => a.querySelector(".gm-g-facts")).length,
        withSource: arts.filter((a) => [...a.querySelectorAll("dt")].some((d) => d.textContent === "Source")).length,
        withExample: arts.filter((a) => [...a.querySelectorAll("dt")].some((d) => /^Example/.test(d.textContent))).length,
        mapLinks: [...new Set([...document.querySelectorAll(".gm-g-map")].map((a) => a.getAttribute("href")))].join(" "),
        extOk: ext.length + " " + ext.every((a) => /^https:\/\/www\.gov\.uk\//.test(a.href) && /noopener/.test(a.rel)),
        sample: document.querySelector("#executive-agency").innerText.replace(/\s+/g, " ").slice(0, 400),
        tabs: [...document.querySelectorAll(".gm-tabs a")].map((a) => a.textContent + (a.getAttribute("aria-current") ? "*" : "")).join("|"),
        az: [...document.querySelectorAll("#gm-az a")].map((a) => a.textContent).join(""),
        credit: document.getElementById("gm-credit").textContent.slice(0, 90),
        hscroll: document.documentElement.scrollWidth > innerWidth,
      };
    }));
    await pg.screenshot({ path: `${SHOTS}/${TAG}glossary-${name}.png` });
    await pg.fill("#gm-g-q", "ndpb"); await pg.waitForTimeout(300);
    R.searchNdpb = await pg.evaluate(() => document.getElementById("gm-g-count").textContent + " " + [...document.querySelectorAll(".gm-term:not([hidden]) .gm-anchor")].map((a) => a.textContent).join(", ") + " offLetters=" + document.querySelectorAll("#gm-az .gm-az-off").length);
    await pg.fill("#gm-g-q", "zzzz"); await pg.waitForTimeout(300);
    R.searchNone = await pg.textContent("#gm-g-count");
    await pg.fill("#gm-g-q", ""); await pg.waitForTimeout(300);
    await pg.click("#gm-az a >> text=S"); await pg.waitForTimeout(400);
    R.azHash = await pg.evaluate(() => location.hash + " top=" + Math.round(document.getElementById("letter-s").getBoundingClientRect().top));
    // deep link
    await pg.goto(B + "/govmap/glossary/#executive-ndpb", { waitUntil: "networkidle" }); await pg.waitForSelector(".gm-g-facts"); await pg.waitForTimeout(300);
    R.deep = await pg.evaluate(() => Math.round(document.getElementById("executive-ndpb").getBoundingClientRect().top));
    // see on map link works
    await pg.click("#executive-agency .gm-g-map"); await pg.waitForSelector("#gm-tree [role=tree]");
    R.mapFromGloss = await pg.evaluate(() => location.search + " " + document.getElementById("gm-count").textContent);
    // tree "?" links + key links
    R.treeWhat = await pg.evaluate(() => [...document.querySelectorAll("#gm-tree .gm-what")].map((a) => a.getAttribute("href")).slice(0, 3).join(" ") + " key=" + [...document.querySelectorAll("#gm-key a")].map((a) => a.getAttribute("href")).join(" "));
    await pg.locator("#gm-tree .gm-what").locator("visible=true").first().click(); await pg.waitForSelector(".gm-g-facts"); await pg.waitForTimeout(300);
    R.whatNav = await pg.evaluate(() => location.pathname + location.hash);
    // chart legend links
    await pg.goto(B + "/govmap/ministerial/", { waitUntil: "networkidle" }); await pg.waitForSelector("#gm-legend .gm-legend-link");
    R.legend = await pg.evaluate(() => [...document.querySelectorAll("#gm-legend .gm-legend-link")].map((a) => a.getAttribute("href").split("#")[1]).join(","));
    R.chartTabs = await pg.evaluate(() => [...document.querySelectorAll(".gm-tabs a")].map((a) => a.textContent).join("|") + " hscroll=" + (document.documentElement.scrollWidth > innerWidth));
    for (const p of ["/govmap/", "/govmap/non-ministerial/"]) {
      await pg.goto(B + p, { waitUntil: "networkidle" }); await pg.waitForTimeout(500);
      R["hs " + p] = await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    }
    R.errors = errs;
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
