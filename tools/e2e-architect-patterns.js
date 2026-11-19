// Security Architect Corner patterns library checks: the list page and each pattern page.
// B=<site> [SHOTS=dir] node e2e-architect-patterns.js
// axe-core is optional: run `npm i --no-save axe-core` to include the accessibility scan.
const { chromium } = require('playwright-core');
const fs = require('fs'); const path = require('path');
const B = (process.env.B || 'http://127.0.0.1:8000').replace(/\/$/, '');
const SHOTS = process.env.SHOTS || path.join(__dirname, 'shots', 'patterns'); fs.mkdirSync(SHOTS, { recursive: true });
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const LOCAL = /127\.0\.0\.1|localhost/.test(B);
let axeSrc = null; try { axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); } catch (e) { console.log('SKIP axe-core not installed'); }
const P = [
  ['zero-trust-access', 'Zero trust access'],
  ['secure-cloud-landing-zone', 'Secure cloud landing zone'],
  ['secrets-and-key-management', 'Secrets and key management'],
  ['logging-to-a-siem', 'Logging to a SIEM'],
  ['safe-third-party-integration', 'Safe third-party integration'],
];
const SECTIONS = ['when', 'diagram', 'parts', 'risks', 'controls', 'maps', 'related', 'mistakes'];
const PAT = B + '/architect/patterns/';
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

async function axeRun(p) {
  await p.addScriptTag({ content: axeSrc });
  return p.evaluate(async () => { const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
    return r.violations.map(v => v.id + ' (' + v.impact + ') x' + v.nodes.length + ': ' + v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')); });
}
async function common(p, tag, errs) {
  const sw = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); ok(sw <= 0, `${tag}: no horizontal scroll (${sw})`);
  const links = await p.$$eval('a[href]', as => as.map(a => ({ h: a.href, t: a.target, r: a.rel, hidden: !!a.querySelector('.visually-hidden') && a.querySelector('.visually-hidden').textContent.includes('opens in a new tab') })));
  ok(!links.some(l => /\/matrix|\/checklist/.test(l.h)), `${tag}: no matrix/checklist links`);
  const bad = links.filter(l => { const u = new URL(l.h); const internal = u.hostname.endsWith('govassured.com') || u.hostname === new URL(B).hostname;
    if (internal) return l.t === '_blank';
    const company = /linkedin\.com\/company\/102617034|github\.com\/nusairi\/govassure/.test(l.h);
    return l.t !== '_blank' || !l.r.includes('noopener') || (!company && !l.hidden); });
  ok(bad.length === 0, `${tag}: link targets and new-tab labels correct ${bad.map(x => x.h).join(', ')}`);
  const hs = await p.$$eval('h1,h2,h3,h4,h5,h6', x => x.map(e => +e.tagName[1])); let jump = false; for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) jump = true;
  ok(hs.filter(h => h === 1).length === 1 && !jump, `${tag}: heading order ok`);
  ok(errs.length === 0, `${tag}: no console/CSP errors ${errs.join(' | ')}`);
}

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const internal = new Set();
  for (const [size, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: size === 'mobile' ? 2 : 1, isMobile: size === 'mobile', hasTouch: size === 'mobile', reducedMotion: 'reduce' });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(e.message));
    let r = await p.goto(PAT, { waitUntil: 'networkidle' });
    ok(r.status() === 200, `${size} index: 200`);
    if (!LOCAL) { ok((r.headers()['content-security-policy'] || '').includes("script-src 'self'"), `${size} index: CSP header present`);
      ok((await (await ctx.newPage()).goto(B + '/architect/patterns', { waitUntil: 'domcontentloaded' })).status() === 200, `${size} index: slashless URL 200`); }
    const cards = await p.$$eval('.pat-card h2 a', x => x.map(a => [a.getAttribute('href'), a.textContent.trim(), a.target]));
    ok(cards.length === 5 && cards.every((c, i) => c[0] === `/architect/patterns/${P[i][0]}/` && c[1] === P[i][1] && !c[2]), `${size} index: 5 cards linking in the same tab`);
    ok(JSON.stringify(await p.$$eval('.arch-crumbs li', x => x.map(e => e.textContent.trim()))) === JSON.stringify(['Home', 'Security Architect Corner', 'Patterns']), `${size} index: breadcrumb`);
    await common(p, `${size} index`, errs);
    await p.screenshot({ path: `${SHOTS}/${size}-index.png`, fullPage: true });

    for (let i = 0; i < P.length; i++) {
      const [slug, title] = P[i]; const tag = `${size} ${slug}`; errs.length = 0;
      r = await p.goto(PAT + slug + '/', { waitUntil: 'networkidle' }); ok(r.status() === 200, `${tag}: 200`);
      if (!LOCAL) { ok((r.headers()['content-security-policy'] || '').includes("script-src 'self'"), `${tag}: CSP header present`);
        ok((await (await ctx.newPage()).goto(PAT + slug, { waitUntil: 'domcontentloaded' })).status() === 200, `${tag}: slashless URL 200`); }
      ok((await p.textContent('h1')).trim() === title, `${tag}: title`);
      const cr = await p.$$eval('.arch-crumbs li', x => x.map(e => [e.textContent.trim(), e.querySelector('a') ? e.querySelector('a').getAttribute('href') : null]));
      ok(JSON.stringify(cr) === JSON.stringify([['Home', '/'], ['Security Architect Corner', '/architect/'], ['Patterns', '/architect/patterns/'], [title, null]]), `${tag}: breadcrumb`);
      ok(await p.evaluate(ids => ids.every(id => document.getElementById(id) && document.getElementById(id).tagName === 'H2'), SECTIONS), `${tag}: all ${SECTIONS.length} sections present`);
      const dg = await p.evaluate(() => { const f = document.querySelector('figure.pat-diagram'); const cap = f && document.getElementById(f.getAttribute('aria-describedby'));
        return { zones: f ? f.querySelectorAll('.pat-zone').length : 0, links: f ? f.querySelectorAll('.pat-link-label').length : 0, cap: cap ? cap.textContent.length : 0, arrowsHidden: f ? [...f.querySelectorAll('.pat-arrow')].every(a => a.getAttribute('aria-hidden') === 'true') : false,
          fits: f ? [...f.querySelectorAll('.pat-zone, .pat-link')].every(e => e.getBoundingClientRect().right <= f.getBoundingClientRect().right + 0.5) : false }; });
      ok(dg.zones >= 3 && dg.links === dg.zones - 1 && dg.cap > 80 && dg.arrowsHidden && dg.fits, `${tag}: diagram has ${dg.zones} zones, labelled links, text description, fits its box`);
      const caf = await p.$$eval('#maps ~ ul.arch-refs a[href*="cyber-assessment-framework"]', x => x.length); ok(caf >= 2, `${tag}: CAF mappings (${caf})`);
      const rel = await p.$$eval('a[href^="/architect/templates/"]', x => x.map(a => a.getAttribute('href'))); rel.forEach(h => internal.add(h)); ok(rel.length >= 3, `${tag}: related templates (${rel.length})`);
      const tools = await p.$$eval('a[href$=".govassured.com"]', x => x.map(a => a.href)); tools.forEach(h => internal.add(h)); ok(tools.length >= 2, `${tag}: related GOV Assured tools (${tools.length})`);
      if (slug === 'secrets-and-key-management') ok(tools.some(h => h.startsWith('https://kms.govassured.com')), `${tag}: links the KMS tool`);
      const prev = await p.$eval('.tpl-pager', n => { const a = n.querySelector('[rel=prev]'); return a ? a.getAttribute('href') : null; });
      const next = await p.$eval('.tpl-pager', n => { const a = n.querySelector('[rel=next]'); return a ? a.getAttribute('href') : null; });
      ok(prev === (i ? `/architect/patterns/${P[i - 1][0]}/` : null) && next === (i < P.length - 1 ? `/architect/patterns/${P[i + 1][0]}/` : null), `${tag}: previous/next links`);
      ok(await p.$eval('.tpl-top a', a => a.getAttribute('href')) === '/architect/patterns/', `${tag}: All patterns link`);
      await common(p, tag, errs);
      await p.screenshot({ path: `${SHOTS}/${size}-${slug}.png`, fullPage: true });
      await p.locator('figure.pat-diagram').screenshot({ path: `${SHOTS}/${size}-${slug}-diagram.png` });
      if (next) { await p.click('.tpl-pager [rel=next]'); await p.waitForLoadState('networkidle'); ok(p.url() === B + next, `${tag}: next link navigates`); }
      if (prev) { await p.goto(PAT + slug + '/', { waitUntil: 'networkidle' }); await p.click('.tpl-pager [rel=prev]'); await p.waitForLoadState('networkidle'); ok(p.url() === B + prev, `${tag}: previous link navigates`); }
    }
    await ctx.close();
    if (axeSrc) {
      const actx = await b.newContext({ viewport: vp, bypassCSP: true }); const ap = await actx.newPage();
      let ax = []; for (const u of [PAT, ...P.map(x => PAT + x[0] + '/')]) { await ap.goto(u, { waitUntil: 'networkidle' }); ax = ax.concat((await axeRun(ap)).map(x => u.replace(B, '') + ': ' + x)); }
      await actx.close();
      ok(ax.length === 0, `${size}: axe ${ax.length ? JSON.stringify(ax) : '0 violations (index + 5 pattern pages)'}`);
    }
  }
  { const ctx = await b.newContext(); const p = await ctx.newPage();
    for (const h of [...internal].filter(h => h.startsWith('/'))) { const r = await p.goto(B + h, { waitUntil: 'domcontentloaded' }); ok(r.status() === 200, `related link ${h} 200`); }
    await p.goto(B + '/architect/', { waitUntil: 'networkidle' });
    const hrefs = await p.$$eval('#patterns a', x => x.map(a => a.getAttribute('href')));
    ok(P.every(x => hrefs.includes(`/architect/patterns/${x[0]}/`)) && hrefs.includes('/architect/patterns/'), 'architect page: Patterns library section links every pattern and the list');
    ok(await p.$('.arch-toc a[href="#patterns"]') !== null, 'architect page: On this page entry');
    const nx = (await p.textContent('.arch-next')).toLowerCase(); ok(nx.includes('decision helpers') && !nx.includes('pattern') && !nx.includes('template'), 'architect page: Coming next mentions only decision helpers');
    if (!LOCAL) { const sm = await (await p.goto(B + '/sitemap.xml')).text(); ok(['', ...P.map(x => x[0] + '/')].every(s => sm.includes('/architect/patterns/' + s + '<')), 'sitemap has the list and all 5 pattern pages'); }
    await ctx.close(); }
  await b.close(); console.log(fail ? `${fail} FAILED` : 'ALL PASS'); process.exit(fail ? 1 : 0);
})();
