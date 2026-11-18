const { chromium } = require("playwright-core");
const B = (process.env.B || "http://127.0.0.1:33778").replace(/\/$/, "");
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const TAG = process.env.TAG || "home-";

function fail(errors, cond, msg) { if (!cond) errors.push(msg); }

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const out = {};
  for (const [name, vp, mobile] of [
    ["phone360", { width: 360, height: 800 }, true],
    ["phone390", { width: 390, height: 844 }, true],
    ["desktop", { width: 1440, height: 900 }, false],
  ]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    const errors = [];
    const rec = { errors };
    out[name] = rec;
    pg.on("pageerror", (e) => errors.push("pageerror " + e.message));

    const r = await pg.goto(B + "/", { waitUntil: "networkidle" });
    rec.status = r.status();
    rec.csp = (r.headers()["content-security-policy"] || "").slice(0, 90);
    rec.home = await pg.evaluate(() => {
      const tile = document.querySelector("a.lv-map-tile");
      const nav = [...document.querySelectorAll(".header-nav a")].find((a) => a.getAttribute("href") === "/govmap/");
      return {
        tileHref: tile ? tile.getAttribute("href") : null,
        tileTarget: tile ? tile.getAttribute("target") : null,
        tileText: tile ? tile.innerText.replace(/\s+/g, " ").trim() : "",
        navHref: nav ? nav.getAttribute("href") : null,
        navTarget: nav ? nav.getAttribute("target") : null,
        navText: nav ? nav.textContent.trim() : "",
        hscroll: document.documentElement.scrollWidth > innerWidth + 1,
        kev: !!document.getElementById("kev-body"),
        pubs: !!document.getElementById("pubs-body"),
        outages: !!document.getElementById("out-problems"),
        cisa: !!document.getElementById("cisa-body"),
      };
    });
    fail(errors, rec.status === 200, "home status");
    fail(errors, /default-src 'self'/.test(rec.csp) && /script-src 'self'/.test(rec.csp), "csp " + rec.csp);
    fail(errors, rec.home.tileHref === "/govmap/" && !rec.home.tileTarget, "tile " + JSON.stringify(rec.home));
    fail(errors, /UK government map/i.test(rec.home.tileText) && /arm'?s-length bodies/i.test(rec.home.tileText) && /Parliament/i.test(rec.home.tileText), "tile text " + rec.home.tileText);
    fail(errors, rec.home.navHref === "/govmap/" && !rec.home.navTarget && rec.home.navText === "Government map", "nav " + rec.home.navText);
    fail(errors, !rec.home.hscroll, "hscroll home");
    fail(errors, rec.home.kev && rec.home.pubs && rec.home.outages && rec.home.cisa, "home sections missing");

    const tile = pg.locator("a.lv-map-tile");
    await tile.scrollIntoViewIfNeeded();
    await pg.waitForTimeout(200);
    if (name === "phone390" || name === "desktop") {
      await pg.screenshot({ path: `${SHOTS}/${TAG}home-govmap-${name}.png`, fullPage: false });
    }

    await tile.click();
    await pg.waitForURL(/\/govmap\/?$/);
    rec.fromTile = await pg.evaluate(() => location.pathname);
    fail(errors, rec.fromTile === "/govmap/" || rec.fromTile === "/govmap", "tile nav " + rec.fromTile);
    rec.sameTab = pg.url().startsWith(B);
    fail(errors, rec.sameTab, "tile opened off-site " + pg.url());

    await pg.goto(B + "/apps", { waitUntil: "networkidle" });
    await pg.waitForSelector("#catalog, a.lv-map-tile");
    rec.apps = await pg.evaluate(() => {
      const tile = document.querySelector("a.lv-map-tile");
      const nav = [...document.querySelectorAll(".header-nav a")].find((a) => a.getAttribute("href") === "/govmap/");
      const open = [...document.querySelectorAll("#catalog a")].find((a) => /govmap/.test(a.getAttribute("href") || "") || /government map/i.test(a.textContent));
      return {
        tileHref: tile ? tile.getAttribute("href") : null,
        tileTarget: tile ? tile.getAttribute("target") : null,
        nav: nav ? nav.getAttribute("href") : null,
        catalogHref: open ? open.getAttribute("href") : null,
        catalogTarget: open ? open.getAttribute("target") : null,
        hscroll: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    fail(errors, rec.apps.tileHref === "/govmap/" && !rec.apps.tileTarget && rec.apps.nav === "/govmap/", "apps tile/nav");
    fail(errors, rec.apps.catalogHref && /govassured\.com\/govmap\/?/.test(rec.apps.catalogHref) && !rec.apps.catalogTarget, "apps catalog " + rec.apps.catalogHref + " t=" + rec.apps.catalogTarget);
    fail(errors, !rec.apps.hscroll, "hscroll apps");

    rec.errors = errors;
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  const bad = Object.values(out).some((r) => (r.errors || []).length);
  await b.close();
  process.exit(bad ? 1 : 0);
})();
