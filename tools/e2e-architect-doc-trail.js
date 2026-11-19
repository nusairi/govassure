// Security Architect Corner document trail checks: /architect/document-trail/ and its links.
// B=<site> [SHOTS=dir] node e2e-architect-doc-trail.js
// axe-core is required (see tools/axe.js): run `npm i --no-save axe-core` in tools/ first.
const { chromium } = require('playwright-core');
const fs = require('fs'); const path = require('path');
const axe = require('./axe'); axe.load();
const B = (process.env.B || 'http://127.0.0.1:8000').replace(/\/$/, '');
const SHOTS = process.env.SHOTS || path.join(__dirname, 'shots', 'doc-trail'); fs.mkdirSync(SHOTS, { recursive: true });
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const LOCAL = /127\.0\.0\.1|localhost/.test(B);
const URL_ = B + '/architect/document-trail/';
const CODE = { New: 'N', Update: 'U', Final: 'F', Review: 'R', Use: 'S', Close: 'C' };
// The approved matrix: Discovery, Alpha, Beta, Live, Retirement. N new, U update, F final, R review, S use, C close, - none.
const M = [
  ['Data and sensitivity summary', 'NUFRS'],
  ['Risk register', 'NUUUC'],
  ['Risk owners and sign-off', 'NUFRC'],
  ['Threat model', 'NNUR-'],
  ['Security design', '-NUF-'],
  ['Decision records', 'SSSSS'],
  ['Supplier assurance', 'NNFRC'],
  ['Secure by Design evidence', '-NFU-'],
  ['Penetration test scope and results', '--NR-'],
  ['Ready for beta checklist', '--S--'],
  ['Live security plan', '--NS-'],
  ['Decommission and disposal plan', '---NS'],
];
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  for (const [size, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: size === 'mobile' ? 2 : 1, isMobile: size === 'mobile', hasTouch: size === 'mobile' });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(e.message));
    const r = await p.goto(URL_, { waitUntil: 'networkidle' });
    ok(r.status() === 200, `${size}: 200`);
    if (!LOCAL) {
      ok((r.headers()['content-security-policy'] || '').includes("script-src 'self'"), `${size}: CSP header present`);
      const r2 = await (await ctx.newPage()).goto(B + '/architect/document-trail', { waitUntil: 'domcontentloaded' }); ok(r2.status() === 200, `${size}: slashless URL 200`);
    }
    ok((await p.textContent('h1')).trim() === 'Document trail', `${size}: title`);
    ok(JSON.stringify(await p.$$eval('.arch-crumbs li', x => x.map(e => e.textContent.trim()))) === JSON.stringify(['Home', 'Security Architect Corner', 'Document trail']), `${size}: breadcrumb`);
    // table structure
    const t = await p.$eval('table.arch-trail', tb => ({
      caption: tb.caption && tb.caption.textContent.trim(),
      cols: [...tb.tHead.querySelectorAll('th')].map(th => [th.textContent.trim(), th.getAttribute('scope')]),
      rows: [...tb.tBodies[0].rows].map(tr => ({ th: tr.cells[0].tagName, scope: tr.cells[0].getAttribute('scope'), name: tr.cells[0].querySelector('a').textContent.trim(), href: tr.cells[0].querySelector('a').getAttribute('href'), target: tr.cells[0].querySelector('a').target,
        cells: [...tr.cells].slice(1).map(td => { const g = td.querySelector('.arch-tag'); return g ? g.textContent.trim() : (td.textContent.includes('Not needed') ? '-' : '?'); }) })),
    }));
    ok(t.caption === 'Security documents in each phase of a service', `${size}: table caption`);
    ok(JSON.stringify(t.cols) === JSON.stringify([['Document', 'col'], ['Discovery', 'col'], ['Alpha', 'col'], ['Beta', 'col'], ['Live', 'col'], ['Retirement', 'col']]), `${size}: column headers with scope`);
    ok(t.rows.length === 12 && t.rows.every(x => x.th === 'TH' && x.scope === 'row' && !x.target), `${size}: 12 rows with row headers linking in the same tab`);
    const got = t.rows.map(x => [x.name, x.cells.map(c => c === '-' ? '-' : (CODE[c] || '?')).join('')]);
    ok(JSON.stringify(got) === JSON.stringify(M), `${size}: matrix matches the approved table ${JSON.stringify(got.filter((g, i) => JSON.stringify(g) !== JSON.stringify(M[i])))}`);
    ok(t.rows.find(x => x.name === 'Secure by Design evidence').href === 'https://sbd.govassured.com' && t.rows.find(x => x.name.startsWith('Penetration')).href === 'https://scope.govassured.com', `${size}: SbD and pen test rows link the community tools`);
    ok(t.rows.filter(x => x.href.startsWith('/architect/templates/')).length === 10, `${size}: 10 rows link to templates`);
    // scroll container
    const w = await p.$eval('.arch-table-wrap', e => ({ role: e.getAttribute('role'), tab: e.getAttribute('tabindex'), lab: e.getAttribute('aria-labelledby'), sw: e.scrollWidth, cw: e.clientWidth }));
    ok(w.role === 'region' && w.tab === '0' && w.lab === 'trail-caption', `${size}: table is in a focusable, labelled scroll region`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); ok(sw <= 0, `${size}: no page-level horizontal scroll (${sw})`);
    if (size === 'mobile') {
      ok(w.sw > w.cw, `${size}: table scrolls inside its container (${w.sw} > ${w.cw})`);
      await p.focus('.arch-table-wrap'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(200);
      ok(await p.$eval('.arch-table-wrap', e => e.scrollLeft) > 0, `${size}: keyboard scrolls the table`);
      ok(await p.$eval('.arch-table-wrap', e => getComputedStyle(e).outlineStyle !== 'none'), `${size}: scroll region shows a focus outline`);
      await p.$eval('.arch-table-wrap', e => { e.scrollLeft = 0; e.blur(); });
      ok(await p.isVisible('.arch-table-hint'), `${size}: scroll hint shown`);
    } else ok(!(await p.isVisible('.arch-table-hint')), `${size}: scroll hint hidden on wide screens`);
    // key and gates
    ok(JSON.stringify(await p.$$eval('.arch-key dt', x => x.map(e => e.textContent.trim()))) === JSON.stringify(Object.keys(CODE)), `${size}: key explains the 6 tags`);
    const gates = await p.$$eval('.arch-gate', x => x.map(g => [g.querySelector('h3').textContent.trim(), g.querySelectorAll('li').length]));
    const expect = [0, 1, 2, 3, 4].map(i => M.filter(m => m[1][i] !== '-').length);
    ok(gates.length === 5 && gates.every((g, i) => g[1] === expect[i]) && gates[0][0].startsWith('Before moving to alpha') && gates[4][0] === 'Before the service is closed', `${size}: what you should have by each gate (${gates.map(g => g[1]).join(',')})`);
    // links, headings, wording
    const links = await p.$$eval('a[href]', as => as.map(a => ({ h: a.href, raw: a.getAttribute('href'), t: a.target, r: a.rel })));
    ok(!links.some(l => /\/matrix|\/checklist/.test(l.h)), `${size}: no matrix/checklist links`);
    ok(links.every(l => { const u = new URL(l.h); const internal = u.hostname.endsWith('govassured.com') || u.hostname === new URL(B).hostname; return internal ? l.t !== '_blank' : (l.t === '_blank' && l.r.includes('noopener')); }), `${size}: link targets correct`);
    if (size === 'desktop') {
      const internal = [...new Set(links.map(l => l.raw).filter(h => h.startsWith('/')).map(h => h.split('#')[0]))];
      const st = []; for (const h of internal) st.push([h, (await ctx.request.get(B + h)).status()]);
      ok(st.every(x => x[1] === 200), `${size}: all ${internal.length} internal links return 200 ${JSON.stringify(st.filter(x => x[1] !== 200))}`);
    }
    const hs = await p.$$eval('h1,h2,h3,h4,h5,h6', x => x.map(e => +e.tagName[1])); let jump = false; for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) jump = true;
    ok(hs.filter(h => h === 1).length === 1 && !jump, `${size}: heading order ok`);
    ok(!/\bnew (security )?architects?\b/i.test(await p.textContent('main')), `${size}: no "new architect" wording`);
    ok(errs.length === 0, `${size}: no console/CSP errors ${errs.join(' | ')}`);
    await p.screenshot({ path: `${SHOTS}/${size}-document-trail.png`, fullPage: true });
    await p.locator('#by-phase').screenshot({ path: `${SHOTS}/${size}-document-trail-table.png` });
    // entry points
    await p.goto(B + '/architect/templates/', { waitUntil: 'networkidle' });
    ok(await p.$('a[href="/architect/document-trail/"]') !== null, `${size}: templates index links to the trail`);
    await p.goto(B + '/architect/', { waitUntil: 'networkidle' });
    ok(await p.$('.arch-toc a[href="#document-trail"]') !== null && await p.$('#document-trail a[href="/architect/document-trail/"]') !== null, `${size}: architect page links to the trail (On this page + section)`);
    await ctx.close();
    if (axe.enabled()) {
      const actx = await b.newContext({ viewport: vp, bypassCSP: true }); const ap = await actx.newPage();
      await ap.goto(URL_, { waitUntil: 'networkidle' }); const ax = await axe.scan(ap); await actx.close();
      ok(ax.length === 0, `${size}: axe ${ax.length ? JSON.stringify(ax) : '0 violations'}`);
    }
  }
  if (!LOCAL) { const ctx = await b.newContext(); const sm = await (await (await ctx.newPage()).goto(B + '/sitemap.xml')).text(); ok(sm.includes('/architect/document-trail/<'), 'sitemap has the document trail'); await ctx.close(); }
  axe.report(ok);
  await b.close(); console.log(fail ? `${fail} FAILED` : 'ALL PASS'); process.exit(fail ? 1 : 0);
})();
