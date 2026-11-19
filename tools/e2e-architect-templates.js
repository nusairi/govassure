// Security Architect Corner templates checks: the list page and each template page.
// B=<site> [SHOTS=dir] node e2e-architect-templates.js
// axe-core is required (see tools/axe.js): run `npm i --no-save axe-core` in tools/ first.
const { chromium } = require('playwright-core');
const fs = require('fs'); const path = require('path');
const B = (process.env.B || 'http://127.0.0.1:8000').replace(/\/$/, '');
const SHOTS = process.env.SHOTS || path.join(__dirname, 'shots', 'templates'); fs.mkdirSync(SHOTS, { recursive: true });
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const LOCAL = /127\.0\.0\.1|localhost/.test(B);
const axe = require('./axe'); axe.load();
// [localStorage key, slug, title, text to type into the first field, export needle]
const T = [
  ['design', 'security-design', 'One-page security design', 'Book a meeting room (test edit)'],
  ['risks', 'risk-register', 'Risk register starter', 'Book a meeting room (test edit)'],
  ['threats', 'threat-model', 'Threat model worksheet (STRIDE)', 'Admin functions (test edit)'],
  ['adr', 'decision-record', 'Architecture decision record', 'Use the key vault (test edit)'],
  ['supplier', 'supplier-assurance', 'Supplier assurance questionnaire', 'Example Devices Ltd (test edit)'],
  ['beta', 'ready-for-beta', 'Ready for beta checklist', 'Book a meeting room (test edit)'],
];
const TPL = B + '/architect/templates/';
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

const axeRun = p => axe.scan(p);
async function common(p, tag, errs) {
  const sw = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); ok(sw <= 0, `${tag}: no horizontal scroll (${sw})`);
  const links = await p.$$eval('a[href]:not([href^="blob:"])', as => as.map(a => ({ h: a.href, t: a.target, r: a.rel })));
  ok(!links.some(l => /\/matrix|\/checklist/.test(l.h)), `${tag}: no matrix/checklist links`);
  ok(links.every(l => { const u = new URL(l.h); const internal = u.hostname.endsWith('govassured.com') || u.hostname === new URL(B).hostname; return internal ? l.t !== '_blank' : (l.t === '_blank' && l.r.includes('noopener')); }), `${tag}: link targets correct`);
  const hs = await p.$$eval('h1,h2,h3,h4,h5,h6', x => x.map(e => +e.tagName[1])); let jump = false; for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) jump = true;
  ok(hs.filter(h => h === 1).length === 1 && !jump, `${tag}: heading order ok`);
  ok(!/\bnew (security )?architects?\b/i.test(await p.textContent('main')), `${tag}: no "new architect" wording`);
  ok(errs.length === 0, `${tag}: no console/CSP errors ${errs.join(' | ')}`);
}

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  for (const [size, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: size === 'mobile' ? 2 : 1, isMobile: size === 'mobile', hasTouch: size === 'mobile', acceptDownloads: true, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
    const p = await ctx.newPage(); const errs = []; const reqs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(e.message));
    p.on('dialog', d => d.accept()); p.on('request', r => reqs.push({ m: r.method(), u: r.url() }));

    // list page
    let r = await p.goto(TPL, { waitUntil: 'networkidle' });
    ok(r.status() === 200, `${size} index: 200`);
    if (!LOCAL) ok((r.headers()['content-security-policy'] || '').includes("script-src 'self'"), `${size} index: CSP header present`);
    const cards = await p.$$eval('.tpl-card h2 a', x => x.map(a => [a.getAttribute('href'), a.textContent.trim(), a.target]));
    ok(cards.length === 6 && cards.every((c, i) => c[0] === `/architect/templates/${T[i][1]}/` && c[1] === T[i][2] && !c[2]), `${size} index: 6 cards linking in the same tab`);
    ok(await p.$$eval('.tpl-card .description', x => x.every(e => e.textContent.trim().length > 10)), `${size} index: each card has a purpose line`);
    ok((await p.textContent('.lede')).includes('Especially useful if you are starting out in the role'), `${size} index: starting-out line`);
    ok(JSON.stringify(await p.$$eval('.arch-crumbs li', x => x.map(e => e.textContent.trim()))) === JSON.stringify(['Home', 'Security Architect Corner', 'Templates']), `${size} index: breadcrumb`);
    await common(p, `${size} index`, errs);
    await p.screenshot({ path: `${SHOTS}/${size}-index.png`, fullPage: true });
    await p.click(`.tpl-card a[href="/architect/templates/${T[0][1]}/"]`); await p.waitForLoadState('networkidle');
    ok(p.url() === TPL + T[0][1] + '/', `${size} index: card opens the template page`);

    for (let i = 0; i < T.length; i++) {
      const [key, slug, title, edit] = T[i]; const tag = `${size} ${slug}`; const url = TPL + slug + '/';
      errs.length = 0;
      r = await p.goto(url, { waitUntil: 'networkidle' }); ok(r.status() === 200, `${tag}: 200`);
      if (!LOCAL) { const r2 = await (await ctx.newPage()).goto(TPL + slug, { waitUntil: 'domcontentloaded' }); ok(r2.status() === 200, `${tag}: slashless URL 200`); }
      ok((await p.textContent('h1')).trim() === title, `${tag}: title`);
      const cr = await p.$$eval('.arch-crumbs li', x => x.map(e => [e.textContent.trim(), e.querySelector('a') ? e.querySelector('a').getAttribute('href') : null]));
      ok(JSON.stringify(cr) === JSON.stringify([['Home', '/'], ['Security Architect Corner', '/architect/'], ['Templates', '/architect/templates/'], [title, null]]), `${tag}: breadcrumb`);
      const prev = await p.$eval('.tpl-pager', n => { const a = n.querySelector('[rel=prev]'); return a ? a.getAttribute('href') : null; });
      const next = await p.$eval('.tpl-pager', n => { const a = n.querySelector('[rel=next]'); return a ? a.getAttribute('href') : null; });
      ok(prev === (i ? `/architect/templates/${T[i - 1][1]}/` : null) && next === (i < T.length - 1 ? `/architect/templates/${T[i + 1][1]}/` : null), `${tag}: previous/next links`);
      ok(await p.$$eval(`[data-template="${key}"] form`, x => x.length) === 1, `${tag}: form built`);
      reqs.length = 0;
      await p.click('.tpl-example');
      const n = await p.$$eval('[data-key]', x => x.filter(e => e.value).length); ok(n >= 5, `${tag}: worked example filled (${n} fields)`);
      if (key === 'risks') ok(/Score 6 out of 25: Medium/.test(await p.textContent('.tpl-row')), `${tag}: risk score calculated`);
      await p.screenshot({ path: `${SHOTS}/${size}-${slug}-filled.png`, fullPage: true });
      const first = await p.$eval('[data-key]', e => e.id);
      await p.fill('#' + first, edit);
      if (key === 'risks') { await p.selectOption('.tpl-row >> nth=0 >> select[data-key="impact"]', '5 Severe'); await p.click('.tpl-add'); }
      await p.waitForTimeout(600);
      ok((await p.textContent('.tpl-status')).includes('Saved in this browser'), `${tag}: save status shown`);
      ok(await p.evaluate(k => !!localStorage.getItem('ga-arch-tpl-v1-' + k), key), `${tag}: saved under existing key ga-arch-tpl-v1-${key}`);
      await p.reload({ waitUntil: 'networkidle' });
      ok(await p.inputValue('#' + first) === edit, `${tag}: answer restored after reload`);
      if (key === 'risks') {
        ok(await p.$$eval('.tpl-row', x => x.length) === 3 && /Score 10 out of 25: High/.test(await p.textContent('.tpl-row')), `${tag}: rows and edited score restored`);
        await p.click('.tpl-row:nth-child(3) .tpl-remove'); ok(await p.$$eval('.tpl-row', x => x.length) === 2, `${tag}: remove row`);
      }
      // print
      const before = await p.evaluate(() => window.__printed);
      await p.click('.tpl-print');
      ok(await p.evaluate(() => window.__printed) === before + 1 && (await p.textContent('#tpl-print-view')).includes(edit), `${tag}: print view built with answers`);
      await p.emulateMedia({ media: 'print' });
      ok(await p.evaluate(() => !document.querySelector('.site-header').checkVisibility() && !document.querySelector('.tpl-pager').checkVisibility() && !document.querySelector('.tpl-form').checkVisibility() && document.getElementById('tpl-print-view').checkVisibility()), `${tag}: print stylesheet shows only the template`);
      if (size === 'desktop') { await p.pdf({ path: `${SHOTS}/print-${slug}.pdf`, format: 'A4' }); ok(fs.statSync(`${SHOTS}/print-${slug}.pdf`).size > 5000, `${tag}: PDF rendered`); }
      await p.emulateMedia({ media: 'screen' }); await p.evaluate(() => window.dispatchEvent(new Event('afterprint')));
      // exports
      for (const kind of ['doc', 'md']) {
        const [dl] = await Promise.all([p.waitForEvent('download'), p.click(`.tpl-${kind}`)]);
        const txt = fs.readFileSync(await dl.path(), 'utf8');
        ok(dl.suggestedFilename().endsWith('.' + kind) && txt.includes(edit) && txt.includes(title), `${tag}: .${kind} export (${dl.suggestedFilename()})`);
        if (size === 'desktop') fs.copyFileSync(await dl.path(), `${SHOTS}/${dl.suggestedFilename()}`);
      }
      const bad = reqs.filter(x => x.m !== 'GET' || new URL(x.u).origin !== new URL(B).origin);
      ok(bad.length === 0, `${tag}: no data sent (only same-origin GETs) ${bad.map(x => x.m + ' ' + x.u).join(', ')}`);
      await common(p, tag, errs);
      // pager navigation
      if (next) { await p.click('.tpl-pager [rel=next]'); await p.waitForLoadState('networkidle'); ok(p.url() === B + next, `${tag}: next link navigates`); }
      if (prev) { await p.goto(url, { waitUntil: 'networkidle' }); await p.click('.tpl-pager [rel=prev]'); await p.waitForLoadState('networkidle'); ok(p.url() === B + prev, `${tag}: previous link navigates`); }
    }
    // clear works by keyboard, and other templates keep their answers
    await p.goto(TPL + 'decision-record/', { waitUntil: 'networkidle' });
    await p.focus('.tpl-clear'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
    ok(await p.inputValue('#tpl-adr-title') === '' && await p.evaluate(() => !localStorage.getItem('ga-arch-tpl-v1-adr') && !!localStorage.getItem('ga-arch-tpl-v1-design')), `${size}: clear via keyboard removes only that template`);
    await ctx.close();

    if (axe.enabled()) {
      const actx = await b.newContext({ viewport: vp, bypassCSP: true }); const ap = await actx.newPage(); ap.on('dialog', d => d.accept());
      await ap.goto(TPL, { waitUntil: 'networkidle' }); let ax = (await axeRun(ap)).map(x => 'index: ' + x);
      for (const [, slug] of T) {
        await ap.goto(TPL + slug + '/', { waitUntil: 'networkidle' });
        ax = ax.concat((await axeRun(ap)).map(x => slug + ' empty: ' + x));
        await ap.click('.tpl-example');
        ax = ax.concat((await axeRun(ap)).map(x => slug + ' filled: ' + x));
      }
      await actx.close();
      ok(ax.length === 0, `${size}: axe ${ax.length ? JSON.stringify(ax) : '0 violations (index + 6 pages, empty and filled)'}`);
    }
  }
  { const ctx = await b.newContext(); const p = await ctx.newPage(); await p.goto(B + '/architect/', { waitUntil: 'networkidle' });
    const hrefs = await p.$$eval('#templates a', x => x.map(a => a.getAttribute('href')));
    ok(T.every(t => hrefs.includes(`/architect/templates/${t[1]}/`)) && hrefs.includes('/architect/templates/'), 'architect page: links to each template page and the list');
    ok((await p.textContent('#templates-title')).trim() === 'Templates for security architects', 'architect page: section heading');
    ok((await p.textContent('#templates')).includes('Especially useful if you are starting out in the role'), 'architect page: starting-out line');
    ok(!(await p.textContent('.arch-next')).includes('templates'), 'architect page: coming next no longer mentions templates');
    if (!LOCAL) { const sm = await (await p.goto(B + '/sitemap.xml')).text(); ok(['', ...T.map(t => t[1] + '/')].every(s => sm.includes('/architect/templates/' + s + '<')), 'sitemap has the list and all 6 template pages'); }
    await ctx.close(); }
  axe.report(ok);
  await b.close(); console.log(fail ? `${fail} FAILED` : 'ALL PASS'); process.exit(fail ? 1 : 0);
})();
