// Security vendor origins preview: B=<site> [SHOTS=dir] node e2e-security-vendor-origins.js
// Serve the site with the www Content-Security-Policy so CSP violations are visible.
const {chromium} = require('playwright-core');
const fs = require('fs');
const path = require('path');

const B = (process.env.B || 'http://127.0.0.1:8000').replace(/\/$/, '');
const SHOTS = process.env.SHOTS || path.join(__dirname, 'shots/security-vendor-origins');
fs.mkdirSync(SHOTS, {recursive: true});
const CHROME = process.env.CHROME || ['/usr/bin/google-chrome', '/usr/local/bin/google-chrome'].find(p => fs.existsSync(p));
const CSP = "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

function isOfficial(href) {
  let u;
  try { u = new URL(href); } catch (e) { return false; }
  const host = u.hostname.toLowerCase();
  if (u.protocol !== 'https:' || u.search || u.hash) return false;
  if (host === 'gov' || host.endsWith('.gov') || host.endsWith('.gov.uk') || host.endsWith('.parliament.uk') || host.endsWith('.parliament.scot')) return true;
  return ['gov.uk', 'parliament.uk', 'parliament.scot', 'www.nao.org.uk', 'www.ombudsman.org.uk', 'www.electoralcommission.org.uk', 'www.lgbce.org.uk', 'www.theipsa.org.uk', 'www.audit.wales'].includes(host);
}

function allowedExternal(href) {
  if (isOfficial(href)) return true;
  let u;
  try { u = new URL(href); } catch (e) { return false; }
  const host = u.hostname.toLowerCase();
  if (host === 'govassured.com' || host.endsWith('.govassured.com') || host === new URL(B).hostname) return true;
  const pathOnly = u.pathname.replace(/\/$/, '');
  if (host === 'www.linkedin.com' && pathOnly === '/company/102617034' && !u.search && !u.hash) return true;
  if (host === 'github.com' && pathOnly === '/nusairi/govassure' && !u.search && !u.hash) return true;
  return false;
}

function track(page) {
  const errs = [];
  const csp = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(e.message));
  page.on('response', () => {});
  return {errs, csp};
}

async function openPage(browser, viewport) {
  const ctx = await browser.newContext({
    viewport,
    acceptDownloads: true,
    deviceScaleFactor: viewport.width < 500 ? 2 : 1,
    isMobile: viewport.width < 500,
    hasTouch: viewport.width < 500,
  });
  await ctx.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', e => {
      window.__csp.push(e.violatedDirective + ' ' + e.blockedURI);
    });
  });
  const page = await ctx.newPage();
  const bag = track(page);
  return {ctx, page, bag};
}

(async () => {
  const browser = await chromium.launch({executablePath: CHROME, args: ['--no-sandbox']});
  const {ctx, page, bag} = await openPage(browser, {width: 1280, height: 900});
  const res = await page.goto(B + '/security-vendor-origins/', {waitUntil: 'networkidle'});
  ok(res.status() === 200, 'page 200');
  const cspHeader = res.headers()['content-security-policy'] || '';
  ok(cspHeader.includes("script-src 'self'") && cspHeader.includes("style-src 'self'"), 'CSP header present');

  await page.waitForSelector('.svo-row', {timeout: 8000});
  const title = await page.title();
  ok(title === 'Security vendor origins and ownership — GOV Assured', 'title ' + title);

  const snap = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3')].map(h => h.textContent.trim());
    const html = document.documentElement.outerHTML;
    return {
      inlineScripts: [...document.scripts].filter(s => !s.src).length,
      styleTags: document.querySelectorAll('style').length,
      sourceStyleAttr: (document.documentElement.innerHTML.match(/ style="/g) || []).length,
      headings: headings.join(' | '),
      h1: document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : '',
      rows: document.querySelectorAll('.svo-row').length,
      count: document.getElementById('count').textContent,
      cards: [...document.querySelectorAll('.svo-card__v')].map(v => v.textContent),
      expanders: [...document.querySelectorAll('.svo-exp')].every(b => b.tagName === 'BUTTON' && b.getAttribute('aria-controls') && b.getAttribute('aria-expanded') === 'false'),
      noindex: (document.querySelector('meta[name=robots]') || {}).content || '',
      nav: [...document.querySelectorAll('.header-nav a')].map(a => a.getAttribute('href')),
      sorted: [...document.querySelectorAll('.svo-row .svo-name')].slice(0, 3).map(x => x.textContent),
      footer: (document.querySelector('.footer-note') || {}).textContent || '',
      styled: [...document.querySelectorAll('[style]')].map(el => el.className),
    };
  });
  ok(snap.inlineScripts === 0, 'no inline scripts');
  ok(snap.styleTags === 0, 'no style elements');
  ok(!/UK Government/i.test(title + ' ' + snap.headings), 'no UK Government in title or headings');
  ok(snap.h1 === 'Security vendor origins and ownership', 'h1 ' + snap.h1);
  ok(snap.rows === 130 && /Showing 130 of 130/.test(snap.count), 'rows ' + snap.rows + ' ' + snap.count);
  ok(snap.cards.join(',') === '130,13,10,24', 'stat cards ' + snap.cards.join(','));
  ok(snap.expanders, 'expanders are buttons with aria-controls');
  ok(snap.noindex === 'noindex', 'noindex ' + snap.noindex);
  ok(snap.sorted[0] === '1Password' && snap.sorted[1] === 'Abnormal AI (Abnormal Security)' && snap.sorted[2] === 'Acronis', 'default sort ' + snap.sorted.join(' | '));
  ok(!snap.nav.some(h => /security-vendor-origins/.test(h || '')), 'not in the nav ' + snap.nav.join(','));
  ok(snap.footer.includes('Not a government website'), 'footer disclaimer');
  ok(snap.styled.every(c => String(c).split(/\s+/).includes('svo-barrow__fill')), 'only bar fills carry a CSSOM width ' + snap.styled.filter(c => !String(c).split(/\s+/).includes('svo-barrow__fill')).join(','));

  const source = await (await page.request.get(B + '/security-vendor-origins/')).text();
  ok(!/<script(?![^>]*\bsrc=)/i.test(source), 'served HTML has no inline script');
  ok(!/<style[\s>]/i.test(source) && !/\sstyle=/.test(source), 'served HTML has no inline style');
  ok(/<meta name="robots" content="noindex">/.test(source), 'served noindex tag');

  const data = await (await page.request.get(B + '/data/security-vendors.json')).json();
  ok(data.vendors.length === 130 && data.refs.length > 0, 'JSON vendor count');
  ok(data.refs.every(r => r.c && r.h && !('u' in r) && !/https?:\/\//i.test(r.h) && !/https?:\/\//i.test(JSON.stringify({c: r.c, h: r.h}).replace(r.h, ''))), 'refs are code plus label');
  const rawJson = await (await page.request.get(B + '/data/security-vendors.json')).text();
  const urls = rawJson.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  ok(urls.length > 0 && urls.every(isOfficial), 'JSON URLs are official government links only (' + urls.length + ')');

  await page.screenshot({path: path.join(SHOTS, 'www-desktop.png')});
  await page.focus('.svo-exp');
  await page.keyboard.press('Enter');
  const key = await page.evaluate(() => {
    const b = document.querySelector('.svo-exp');
    const d = document.getElementById(b.getAttribute('aria-controls'));
    return {exp: b.getAttribute('aria-expanded'), hidden: d.hidden, text: d.innerText};
  });
  ok(key.exp === 'true' && key.hidden === false && /Ultimate owner/.test(key.text) && /Ownership/.test(key.text), 'keyboard expander opens the ownership chain');

  const opened = page.locator('.svo-detail:not([hidden])').first();
  await opened.scrollIntoViewIfNeeded();
  await page.screenshot({path: path.join(SHOTS, 'www-desktop-expanded.png')});

  await page.$$eval('.svo-exp[aria-expanded="false"]', bs => bs.forEach(b => b.click()));
  const all = await page.evaluate(() => {
    const gov = [...document.querySelectorAll('a.svo-src')].map(a => ({
      h: a.href,
      t: a.target,
      r: a.rel,
      hidden: !!a.querySelector('.visually-hidden') && /opens in a new tab/.test(a.querySelector('.visually-hidden').textContent),
    }));
    const refs = [...document.querySelectorAll('a.svo-ref')].map(a => a.getAttribute('href'));
    const refOk = refs.every(href => {
      if (!href || href.charAt(0) !== '#') return false;
      const el = document.getElementById(href.slice(1));
      const list = document.getElementById('sourcesList');
      return !!(el && list && list.contains(el));
    });
    const bodyOut = [...document.querySelectorAll('a[href^="http"]')].map(a => a.href);
    const sourcesText = document.getElementById('sourcesList').innerText;
    const sourceLinks = document.querySelectorAll('#sourcesList a').length;
    return {
      open: document.querySelectorAll('.svo-detail:not([hidden])').length,
      gov, refOk, refs: refs.length, bodyOut, sourcesText, sourceLinks,
      pageUrls: (document.body.innerText.match(/https?:\/\/\S+/g) || []),
    };
  });
  ok(all.open === 130, 'all rows expanded ' + all.open);
  ok(all.gov.length > 0 && all.gov.every(g => isOfficial(g.h) && g.t === '_blank' && /\bnoopener\b/.test(g.r) && /\bnoreferrer\b/.test(g.r) && g.hidden), 'gov links are live https new-tab ' + all.gov.filter(g => !(isOfficial(g.h) && g.t === '_blank' && /\bnoopener\b/.test(g.r) && /\bnoreferrer\b/.test(g.r) && g.hidden)).slice(0, 2).map(g => JSON.stringify(g)).join(' | '));
  ok(all.refOk && all.refs > 0, 'reference codes point at the Sources list (' + all.refs + ')');
  ok(all.sourceLinks === 0 && !/https?:\/\//i.test(all.sourcesText), 'Sources list is plain text');
  ok(all.pageUrls.length === 0, 'no raw URLs in visible text ' + all.pageUrls.slice(0, 3).join(' '));
  ok(all.bodyOut.every(allowedExternal), 'external hrefs are official or the company pages ' + all.bodyOut.filter(h => !allowedExternal(h)).slice(0, 3).join(' '));
  const hosts = [...new Set(all.gov.map(g => new URL(g.h).hostname))];
  ok(hosts.some(h => h.endsWith('.gov')) && hosts.some(h => h.endsWith('.gov.uk') || h.endsWith('.parliament.uk')), 'both US .gov and UK official hosts are linked ' + hosts.join(','));

  await page.selectOption('#fOwner', 'China');
  await page.waitForTimeout(150);
  const filtered = await page.evaluate(() => ({
    c: document.getElementById('count').textContent,
    u: location.search,
    chips: document.querySelectorAll('#active button').length,
  }));
  ok(/Showing 16 of 130/.test(filtered.c) && /owner=China/.test(filtered.u) && filtered.chips === 1, 'owner filter ' + JSON.stringify(filtered));

  await page.fill('#q', 'zzzz-none');
  await page.waitForTimeout(300);
  ok(await page.isVisible('#empty'), 'empty state');
  await page.click('#emptyClear');
  await page.waitForTimeout(150);
  ok(/Showing 130 of 130/.test(await page.textContent('#count')), 'clear all restores the full list');
  ok((await page.evaluate(() => location.search)) === '', 'clear all drops the query string');

  const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(sw <= 1, 'desktop no horizontal scroll (' + sw + ')');

  const cspNow = await page.evaluate(() => window.__csp || []);
  ok(bag.errs.length === 0 && cspNow.length === 0, 'desktop no console or CSP errors ' + bag.errs.concat(cspNow).join(' | '));

  const {ctx: ctxU, page: pageU, bag: bagU} = await openPage(browser, {width: 1280, height: 900});
  await pageU.goto(B + '/security-vendor-origins/?sl=yes&sort=n&dir=-1', {waitUntil: 'networkidle'});
  await pageU.waitForSelector('.svo-row');
  const urlState = await pageU.evaluate(() => ({
    c: document.getElementById('count').textContent,
    sel: document.getElementById('fSl').value,
    search: location.search,
    hash: location.hash,
  }));
  ok(/Showing 10 of 130/.test(urlState.c) && urlState.sel === 'yes' && /sl=yes/.test(urlState.search) && urlState.hash === '', 'URL state ' + JSON.stringify(urlState));
  const [download] = await Promise.all([
    pageU.waitForEvent('download'),
    pageU.click('#dlCsv'),
  ]);
  const csvTxt = fs.readFileSync(await download.path(), 'utf8');
  const csvRows = csvTxt.trim().split(/\r\n/).length - 1;
  const csvUrls = csvTxt.match(/https?:\/\/[^\s",]+/gi) || [];
  ok(csvRows === 10 && /Ultimate owner country/.test(csvTxt), 'CSV rows ' + csvRows);
  ok(csvUrls.every(isOfficial), 'CSV keeps official URLs only ' + csvUrls.filter(u => !isOfficial(u)).slice(0, 2).join(' '));
  const cspU = await pageU.evaluate(() => window.__csp || []);
  ok(bagU.errs.length === 0 && cspU.length === 0, 'filtered view no console or CSP errors ' + bagU.errs.concat(cspU).join(' | '));
  await ctxU.close();

  for (const u of ['/', '/apps', '/apps/', '/sitemap.xml']) {
    const html = await (await page.request.get(B + u)).text();
    ok(!/security-vendor-origins/.test(html), 'not linked from ' + u);
  }
  const apps = await (await page.request.get(B + '/data/apps.json')).json();
  ok(!JSON.stringify(apps).includes('security-vendor-origins') && apps.apps.every(a => !('source' in a)), 'not in the apps catalogue');

  const slashless = await page.request.get(B + '/security-vendor-origins');
  ok(slashless.status() === 200 && /Security vendor origins and ownership/.test(await slashless.text()), 'slashless path serves the page');

  await ctx.close();

  const {ctx: ctxM, page: mob, bag: bagM} = await openPage(browser, {width: 390, height: 844});
  await mob.goto(B + '/security-vendor-origins/', {waitUntil: 'networkidle'});
  await mob.waitForSelector('.svo-row');
  await mob.screenshot({path: path.join(SHOTS, 'www-mobile.png')});
  const mobile = await mob.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    display: getComputedStyle(document.querySelector('.svo-row')).display,
    thead: document.querySelector('#tbl thead').getBoundingClientRect().height,
    sortShown: getComputedStyle(document.querySelector('.svo-msort')).display !== 'none',
  }));
  ok(mobile.overflow <= 1 && mobile.display === 'block' && mobile.thead <= 1 && mobile.sortShown, 'mobile cards ' + JSON.stringify(mobile));
  await mob.click('.svo-exp');
  await mob.locator('.svo-detail:not([hidden])').first().scrollIntoViewIfNeeded();
  const mobileOpen = await mob.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(mobileOpen <= 1, 'mobile expanded row does not overflow (' + mobileOpen + ')');
  await mob.screenshot({path: path.join(SHOTS, 'www-mobile-expanded.png')});
  const cspM = await mob.evaluate(() => window.__csp || []);
  ok(bagM.errs.length === 0 && cspM.length === 0, 'mobile no console or CSP errors ' + bagM.errs.concat(cspM).join(' | '));
  await ctxM.close();

  const {ctx: ctxS, page: sug, bag: bagS} = await openPage(browser, {width: 1280, height: 900});
  await sug.goto(B + '/security-vendor-origins/', {waitUntil: 'networkidle'});
  await sug.waitForSelector('.svo-map__land', {timeout: 8000});
  await sug.locator('#map').scrollIntoViewIfNeeded();
  await sug.screenshot({path: path.join(SHOTS, 'www-map-desktop.png')});
  const lands = await sug.locator('.svo-map__land').count();
  ok(lands > 100, 'map draws countries (' + lands + ')');
  await sug.locator('#q').scrollIntoViewIfNeeded();
  await sug.fill('#q', 'check');
  await sug.waitForTimeout(250);
  const combo = await sug.evaluate(() => {
    const input = document.getElementById('q');
    const list = document.getElementById('svoSuggest');
    return {
      role: input.getAttribute('role'),
      expanded: input.getAttribute('aria-expanded'),
      controls: input.getAttribute('aria-controls'),
      hidden: list.hidden,
      options: [...list.querySelectorAll('[role=option]')].map(o => o.textContent.replace(/\s+/g, ' ').trim()),
    };
  });
  ok(combo.role === 'combobox' && combo.expanded === 'true' && combo.controls === 'svoSuggest' && !combo.hidden, 'combobox open');
  ok(combo.options.some(t => /Checkmarx/.test(t)) && combo.options.some(t => /Check Point/.test(t)), 'check suggestions ' + combo.options.join(' | '));
  await sug.screenshot({path: path.join(SHOTS, 'www-suggest-check-desktop.png')});
  await sug.keyboard.press('Escape');
  const afterEsc = await sug.evaluate(() => ({hidden: document.getElementById('svoSuggest').hidden, value: document.getElementById('q').value}));
  ok(afterEsc.hidden && afterEsc.value === 'check', 'Escape closes suggestions and keeps the text');
  await sug.click('#qSearch');
  const searched = await sug.evaluate(() => ({
    hidden: document.getElementById('svoSuggest').hidden,
    search: location.search,
    count: document.getElementById('count').textContent,
  }));
  ok(searched.hidden && /q=check/.test(searched.search) && /Showing (?!130 )\d+ of 130/.test(searched.count), 'Search button applies the query ' + JSON.stringify(searched));
  await sug.click('#clearAll');
  await sug.waitForTimeout(100);
  await sug.fill('#q', 'check');
  await sug.waitForTimeout(250);
  await sug.keyboard.press('ArrowDown');
  await sug.keyboard.press('Enter');
  await sug.waitForTimeout(300);
  const picked = await sug.evaluate(() => ({
    name: (document.querySelector('.svo-row.is-open .svo-name') || {}).textContent || '',
    expanded: document.querySelector('.svo-exp[aria-expanded="true"]') !== null,
    hidden: document.getElementById('svoSuggest').hidden,
  }));
  ok(/Check/.test(picked.name) && picked.expanded && picked.hidden, 'keyboard selection opens the vendor ' + JSON.stringify(picked));
  await sug.click('#clearAll');
  await sug.waitForTimeout(150);
  await sug.locator('.svo-map__land[data-name="United States"]').click();
  await sug.waitForTimeout(200);
  const mapped = await sug.evaluate(() => ({
    origin: document.getElementById('fOrigin').value,
    count: document.getElementById('count').textContent,
    pressed: document.querySelector('#mapList button[aria-pressed="true"]') ? document.querySelector('#mapList button[aria-pressed="true"]').textContent : '',
  }));
  ok(mapped.origin === 'United States' && /Showing 52 of 130/.test(mapped.count), 'map click filters origin ' + JSON.stringify(mapped));
  await sug.click('#clearAll');
  await sug.waitForTimeout(100);
  await sug.fill('#q', 'CyberArk');
  await sug.waitForTimeout(250);
  await sug.locator('#svoSuggest [role=option]').filter({hasText: 'CyberArk'}).first().click();
  await sug.waitForTimeout(300);
  await sug.locator('#map').scrollIntoViewIfNeeded();
  const links = await sug.evaluate(() => ({
    n: document.querySelectorAll('.svo-map__link').length,
    panel: document.getElementById('mapLinks').innerText,
    home: !!document.querySelector('.svo-map__land.is-home'),
  }));
  ok(links.n >= 1 && links.home && /United States/.test(links.panel) && /Israel/.test(links.panel) && /Headquarters/.test(links.panel), 'CyberArk link lines ' + JSON.stringify(links));
  await sug.screenshot({path: path.join(SHOTS, 'www-map-links-desktop.png')});
  const cspS = await sug.evaluate(() => window.__csp || []);
  ok(bagS.errs.length === 0 && cspS.length === 0, 'suggestions and map have no console or CSP errors ' + bagS.errs.concat(cspS).join(' | '));
  await ctxS.close();

  const {ctx: ctxSM, page: sm, bag: bagSM} = await openPage(browser, {width: 390, height: 844});
  await sm.goto(B + '/security-vendor-origins/', {waitUntil: 'networkidle'});
  await sm.waitForSelector('.svo-map__land');
  await sm.locator('#map').scrollIntoViewIfNeeded();
  await sm.screenshot({path: path.join(SHOTS, 'www-map-mobile.png')});
  await sm.locator('#q').scrollIntoViewIfNeeded();
  await sm.fill('#q', 'check');
  await sm.waitForTimeout(250);
  const tap = await sm.locator('#svoSuggest [role=option]').first().boundingBox();
  const mobSuggest = await sm.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    options: [...document.querySelectorAll('#svoSuggest [role=option]')].map(o => o.textContent),
  }));
  ok(tap && tap.height >= 44 && mobSuggest.overflow <= 1 && mobSuggest.options.some(t => /Checkmarx/.test(t)) && mobSuggest.options.some(t => /Check Point/.test(t)), 'mobile suggestions ' + JSON.stringify({h: tap && tap.height, overflow: mobSuggest.overflow, options: mobSuggest.options}));
  await sm.screenshot({path: path.join(SHOTS, 'www-suggest-check-mobile.png')});
  await sm.fill('#q', 'CyberArk');
  await sm.waitForTimeout(250);
  await sm.locator('#svoSuggest [role=option]').filter({hasText: 'CyberArk'}).first().click();
  await sm.waitForTimeout(300);
  await sm.locator('#map').scrollIntoViewIfNeeded();
  const mobLinks = await sm.evaluate(() => document.querySelectorAll('.svo-map__link').length);
  const mobOverflow = await sm.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(mobLinks >= 1 && mobOverflow <= 1, 'mobile map links (' + mobLinks + ', overflow ' + mobOverflow + ')');
  await sm.screenshot({path: path.join(SHOTS, 'www-map-links-mobile.png')});
  const cspSM = await sm.evaluate(() => window.__csp || []);
  ok(bagSM.errs.length === 0 && cspSM.length === 0, 'mobile suggestions and map have no console or CSP errors ' + bagSM.errs.concat(cspSM).join(' | '));
  await ctxSM.close();

  await browser.close();
  if (fail) {
    console.log(fail + ' failed');
    process.exit(1);
  }
  console.log('Security vendor origins checks passed.');
})().catch(err => { console.error(err); process.exit(1); });
