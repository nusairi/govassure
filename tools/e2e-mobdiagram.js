const { chromium } = require("playwright-core");
const B = (process.env.B || "http://127.0.0.1:33777").replace(/\/$/, "");
const SHOTS = process.env.SHOTS || require("path").join(__dirname, "shots");
const TAG = process.env.TAG || "mobile-diagram-";
const DEPTS = [
  { key: "bist", q: "dept=department-for-business-innovation-science-and-trade&view=diagram", ab: "BIST", minBodies: 50 },
  { key: "dcms", q: "dept=department-for-digital-culture-media-and-sport&view=diagram", ab: "DCMS", minBodies: 45 },
  { key: "dft", q: "dept=dft&view=diagram", ab: "DfT", minBodies: 20 },
];

function overlap(a, b, pad) {
  return a.left < b.right - pad && a.right > b.left + pad && a.top < b.bottom - pad && a.bottom > b.top + pad;
}
async function tapNode(pg, loc) {
  await loc.evaluate((el) => el.scrollIntoView({ block: "center", inline: "nearest" }));
  await pg.waitForTimeout(200);
  await loc.tap();
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const out = {};
  const views = [
    ["phone360", { width: 360, height: 800 }, true],
    ["phone390", { width: 390, height: 844 }, true],
    ["desktop", { width: 1440, height: 900 }, false],
  ];
  for (const [name, vp, mobile] of views) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, hasTouch: mobile });
    const pg = await ctx.newPage();
    const errors = [];
    pg.on("pageerror", (e) => errors.push("pageerror " + e.message));
    pg.on("console", (m) => { if (m.type() === "error") errors.push("console " + m.text()); });
    const rec = { errors: [] };
    out[name] = rec;

    // list toggle visible on a department page first (list view)
    const r0 = await pg.goto(B + "/govmap/?dept=dft", { waitUntil: "networkidle" });
    rec.listStatus = r0.status();
    rec.csp = (r0.headers()["content-security-policy"] || "").slice(0, 80);
    rec.toggleOnList = await pg.locator(".gm-viewseg .gm-seg-b >> text=Diagram").isVisible();
    rec.hsList = await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

    for (const d of DEPTS) {
      const resp = await pg.goto(B + "/govmap/?" + d.q, { waitUntil: "networkidle" });
      await pg.waitForSelector(".gm-dg-svg", { timeout: 8000 });
      await pg.waitForTimeout(700);
      const R = {};
      rec[d.key] = R;
      R.status = resp.status();
      R.heading = (await pg.locator(".gm-dv-h").innerText()).replace(/\s+/g, " ");
      R.toggle = await pg.locator(".gm-viewseg .gm-seg-b >> text=Diagram").isVisible();
      R.pressed = await pg.locator(".gm-viewseg .gm-seg-b >> text=Diagram").getAttribute("aria-pressed");
      R.nodes = await pg.locator(".gm-dg-node").count();
      R.links = await pg.locator(".gm-dg-link").count();
      R.bodies = await pg.locator("a.gm-dg-body").count();
      R.vert = await pg.evaluate(() => !!document.querySelector(".gm-dg-vert"));
      R.split = await pg.evaluate(() => document.querySelector(".gm-dv-body")?.className || "");
      Object.assign(R, await pg.evaluate(() => {
        const svg = document.querySelector(".gm-dg-svg");
        const wrap = document.querySelector(".gm-dg, .gm-dv-dg");
        const sb = svg.getBoundingClientRect();
        const nodes = [...document.querySelectorAll(".gm-dg-node")].map((n) => {
          const b = n.getBoundingClientRect();
          return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height };
        });
        let overlaps = 0;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], c = nodes[j];
            if (a.l < c.r - 1 && a.r > c.l + 1 && a.t < c.b - 1 && a.b > c.t + 1) overlaps++;
          }
        }
        const overflowRight = nodes.filter((n) => n.r > sb.right + 2).length;
        const overflowLeft = nodes.filter((n) => n.l < sb.left - 2).length;
        const vb = svg.viewBox.baseVal;
        return {
          svgW: Math.round(sb.width),
          svgH: Math.round(sb.height),
          viewBox: vb ? vb.width + "x" + vb.height : "",
          hscroll: document.documentElement.scrollWidth > window.innerWidth + 1,
          scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
          overlaps,
          overflowRight,
          overflowLeft,
          anim: getComputedStyle(document.querySelector(".gm-dg-link")).animationName,
        };
      }));
      await pg.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; const b = document.querySelector(".gm-dv-dg") || document.querySelector(".gm-dg"); if (b) window.scrollTo(0, b.getBoundingClientRect().top + scrollY - 16); });
      await pg.screenshot({ path: `${SHOTS}/${TAG}${d.key}-${name}.png`, fullPage: true });

      if (mobile) {
        const body = pg.locator("a.gm-dg-body").nth(1);
        await tapNode(pg, body);
        await pg.waitForTimeout(300);
        R.tip1 = await pg.evaluate(() => {
          const tip = document.querySelector(".gm-dg-tip");
          return { hidden: tip.hidden, text: tip.innerText.replace(/\s+/g, " ").slice(0, 180), hasOpen: !!tip.querySelector(".gm-dg-open"), dim: document.querySelector(".gm-dg-svg").classList.contains("gm-dg-dim"), on: document.querySelectorAll(".gm-dg-node.gm-on").length };
        });
        await pg.screenshot({ path: `${SHOTS}/${TAG}${d.key}-${name}-tap.png`, fullPage: false });
        // second tap opens a tab
        const [pop] = await Promise.all([
          ctx.waitForEvent("page", { timeout: 5000 }).catch(() => null),
          tapNode(pg, body),
        ]);
        R.secondTap = pop ? pop.url() : "none";
        if (pop) await pop.close();
        // also test the Open on GOV.UK button after selecting another body
        const body2 = pg.locator("a.gm-dg-body").nth(3);
        await tapNode(pg, body2);
        await pg.waitForTimeout(250);
        const [pop2] = await Promise.all([
          ctx.waitForEvent("page", { timeout: 5000 }).catch(() => null),
          pg.locator(".gm-dg-open").click(),
        ]);
        R.openBtn = pop2 ? pop2.url() : "none";
        if (pop2) await pop2.close();
      } else {
        // desktop: hover tip should not include the button; click opens immediately
        const node = pg.locator("a.gm-dg-body").nth(1);
        await node.scrollIntoViewIfNeeded();
        await node.hover();
        await pg.waitForTimeout(250);
        R.deskTip = await pg.evaluate(() => {
          const tip = document.querySelector(".gm-dg-tip");
          return { hidden: tip.hidden, text: tip.innerText.replace(/\s+/g, " ").slice(0, 200), hasOpen: !!tip.querySelector(".gm-dg-open"), vert: !!document.querySelector(".gm-dg-vert") };
        });
        const [pop] = await Promise.all([
          ctx.waitForEvent("page", { timeout: 5000 }).catch(() => null),
          node.click(),
        ]);
        R.deskClick = pop ? pop.url() : "none";
        if (pop) await pop.close();
        await pg.screenshot({ path: `${SHOTS}/${TAG}${d.key}-${name}-hover.png`, fullPage: false });
      }
    }
    rec.errors = errors;
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
