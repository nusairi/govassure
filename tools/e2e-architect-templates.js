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
  ['data', 'data-and-sensitivity-summary', 'Data and sensitivity summary', 'Book a meeting room (test edit)'],
  ['risks', 'risk-register', 'Risk register starter', 'Book a meeting room (test edit)'],
  ['raci', 'risk-owners-and-sign-off', 'Risk owners and sign-off', 'Book a meeting room (test edit)'],
  ['threats', 'threat-model', 'Threat model worksheet (STRIDE)', 'Admin functions (test edit)'],
  ['design', 'security-design', 'One-page security design', 'Book a meeting room (test edit)'],
  ['adr', 'decision-record', 'Architecture decision record', 'Use the key vault (test edit)'],
  ['supplier', 'supplier-assurance', 'Supplier assurance questionnaire', 'Example Devices Ltd (test edit)'],
  ['beta', 'ready-for-beta', 'Ready for beta checklist', 'Book a meeting room (test edit)'],
  ['live', 'live-security-plan', 'Live security plan', 'Book a meeting room (test edit)'],
  ['decom', 'decommission-and-disposal-plan', 'Decommission and disposal plan', 'Book a meeting room (test edit)'],
];
const NEW = ['data', 'raci', 'live', 'decom'];
// Templates aligned with an official template (they get an "Official template" inset and an index tag).
const OFFICIAL = ['data', 'risks', 'threats', 'adr', 'supplier', 'beta', 'live'];
const OFFSHOTS = process.env.OFFSHOTS || '';
// Answers saved by the previous layout of each template (version 1, before the official alignment).
const OLD = {
  adr: { fields: { title: 'Old ADR subject', number: 'ADR-009', status: 'Accepted', date: '2026-10-01', context: 'Old problem text', options: 'Old options', decision: 'Old decision', consequences: 'Old consequences', security: 'Old security', agreed: 'Design authority' } },
  threats: { fields: { system: 'Old system', scope: 'Old scope', assets: 'Old assets', s_threat: 'Old spoofing threat', s_mit: 'Old spoofing mitigation', i_threat: 'Old disclosure threat', i_mit: '', e_mit: 'Old privilege mitigation', gaps: 'Old gaps', reviewed: '2026-10-02' } },
  data: { fields: { service: 'Old data service', phase: 'Alpha', iao: 'Head of records', types: 'Old list of data types', personal: 'Yes', classification: 'Old classification', impact: 'Old impact', retention: 'Old retention' } },
  risks: { fields: { service: 'Old risk service', owner: 'Service owner' }, rows: [
    { title: 'Old risk one', likelihood: '4 Likely', impact: '5 Severe', owner: 'IAO', treatment: 'Reduce', actions: 'Old actions', due: '2027-01-01' },
    { title: 'Old risk two', likelihood: '1 Rare', impact: '1 Minimal', owner: 'IAO', treatment: 'Accept' }] },
  supplier: { fields: { supplier: 'Old supplier', certs: 'Old certs', certs_view: 'Acceptable', sbom: 'Old SBOM answer', owner: 'Service owner' } },
  beta: { fields: { service: 'Old beta service', controls: 'Partly', controls_ev: 'Old controls evidence', pentest: 'Yes', outcome: 'Not ready yet' } },
  live: { fields: { service: 'Old live service', logs: 'Old logs', backups: 'Old backups', next: '2027-02-02' } },
  decom: { fields: { service: 'Old decom service', copies: 'Old copies', media_ev: 'Old media evidence', residual: 'Old residual' } },
};
const DOCSHOTS = process.env.DOCSHOTS || '';
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
    ok(cards.length === 10 && cards.every((c, i) => c[0] === `/architect/templates/${T[i][1]}/` && c[1] === T[i][2] && !c[2]), `${size} index: 10 cards in lifecycle order linking in the same tab`);
    ok(await p.$('.tpl-trail-note a[href="/architect/document-trail/"]') !== null && (await p.textContent('.lede')).startsWith('Ten fill-in templates'), `${size} index: links to the document trail and says ten`);
    ok(await p.$$eval('.tpl-card .description', x => x.every(e => e.textContent.trim().length > 10)), `${size} index: each card has a purpose line`);
    const tags = await p.$$eval('.tpl-card', x => x.map(c => { const t = c.querySelector('.tpl-tag'); return t ? t.textContent.trim() : ''; }));
    ok(T.every((t, i) => tags[i] === (OFFICIAL.includes(t[0]) ? 'Aligned with official template' : '')), `${size} index: "Aligned with official template" tag on exactly the ${OFFICIAL.length} aligned templates`);
    ok((await p.textContent('.lede')).includes('Especially useful if you are starting out in the role'), `${size} index: starting-out line`);
    ok(JSON.stringify(await p.$$eval('.arch-crumbs li', x => x.map(e => e.textContent.trim()))) === JSON.stringify(['Home', 'Security Architect Corner', 'Templates']), `${size} index: breadcrumb`);
    await common(p, `${size} index`, errs);
    await p.screenshot({ path: `${SHOTS}/${size}-index.png`, fullPage: true });
    if (OFFSHOTS) { await p.screenshot({ path: `${OFFSHOTS}/${size}-index-tags.png`, fullPage: true }); await (await p.$('.tpl-cards')).screenshot({ path: `${OFFSHOTS}/${size}-index-tags-cards.png` }); }
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
      // official template / guidance inset
      const ins = await p.$eval('.tpl-official', n => ({ h: n.querySelector('h2').textContent.trim(), txt: n.textContent,
        links: [...n.querySelectorAll('a')].map(a => ({ h: a.getAttribute('href'), t: a.target, r: a.rel, hid: (a.querySelector('.visually-hidden') || {}).textContent || '', txt: a.textContent })) }));
      const isOff = OFFICIAL.includes(key);
      ok(ins.h === (isOff ? 'Official template' : 'Guidance this follows'), `${tag}: "${ins.h}" inset`);
      ok(ins.links.length >= 2 && ins.links.every(l => l.h.startsWith('https://') && l.t === '_blank' && l.r.includes('noopener') && l.hid === ' (opens in a new tab)'), `${tag}: inset links open in a new tab with a hidden label (${ins.links.length})`);
      ok(ins.links.filter(l => /\.(docx|xlsx|pdf)$/.test(l.h)).every(l => /\((MS Word Document|MS Excel Spreadsheet|PDF), [\d.]+ (KB|MB)(, \d+ pages)?\)/.test(l.txt)), `${tag}: file links show type and size`);
      if (isOff) ok(/Based on .+, licensed under the Open Government Licence v3\.0/.test(ins.txt.replace(/\s+/g, ' ')) && ins.links.some(l => l.h === 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'), `${tag}: OGL v3 attribution line with licence link`);
      else ok(!/Based on/.test(ins.txt), `${tag}: guidance inset makes no "based on" claim`);
      if (key === 'data') ok(ins.links.some(l => l.h.startsWith('https://ico.org.uk/')) && !/Based on[^.]*Information Commissioner/.test(ins.txt), `${tag}: ICO DPIA linked, without an OGL "based on" claim`);
      if (key === 'decom') ok(['retiring-service-components-securely', 'decommissioning-assets', 'secure-sanitisation-storage-media'].every(x => ins.links.some(l => l.h.includes(x))), `${tag}: SbD retirement, NCSC decommissioning and NCSC sanitisation linked`);
      if (OFFSHOTS && (key === 'adr' || key === 'supplier')) {
        await (await p.$('.arch-hero')).screenshot({ path: `${OFFSHOTS}/${size}-${slug}-official-inset.png` });
        await p.screenshot({ path: `${OFFSHOTS}/${size}-${slug}-page.png`, fullPage: false });
      }
      reqs.length = 0;
      await p.click('.tpl-example');
      const n = await p.$$eval('[data-key]', x => x.filter(e => e.value).length); ok(n >= 5, `${tag}: worked example filled (${n} fields)`);
      if (key === 'risks') ok(/Risk severity 6 out of 25: Medium/.test(await p.textContent('.tpl-row')), `${tag}: risk severity calculated`);
      if (key === 'threats') ok(await p.$$eval('.tpl-row', x => x.length) === 6 && JSON.stringify(await p.$$eval('.tpl-row [data-key="stride"]', x => x.map(e => e.value))) === JSON.stringify(['Spoofing', 'Tampering', 'Repudiation', 'Information disclosure', 'Denial of service', 'Elevation of privilege']), `${tag}: six threat rows, one per STRIDE category`);
      if (key === 'data') ok(await p.$$eval('.tpl-row', x => x.length) === 5 && await p.inputValue('.tpl-row [data-key="c"]') === '2 Minor', `${tag}: five asset rows with CIA impact`);
      await p.screenshot({ path: `${SHOTS}/${size}-${slug}-filled.png`, fullPage: true });
      if (DOCSHOTS && NEW.includes(key)) await p.screenshot({ path: `${DOCSHOTS}/${size}-template-${slug}-filled.png`, fullPage: true });
      if (key === 'raci') ok(await p.$$eval('.tpl-row', x => x.length) === 4 && await p.inputValue('[data-key="outcome"]') === 'Approved with conditions', `${tag}: four RACI rows and the sign-off record filled`);
      if (NEW.includes(key)) { const roles = await p.$$eval('[data-key]', x => x.map(e => e.value).join(' ')); ok(roles.includes('Book a meeting room') && !/\b(Mr|Mrs|Ms|Dr)\.? [A-Z]/.test(roles), `${tag}: worked example uses the meeting-room service and roles, not names`); }
      const first = await p.$eval('[data-key]', e => e.id);
      await p.fill('#' + first, edit);
      if (key === 'risks') { await p.selectOption('.tpl-row >> nth=0 >> select[data-key="impact"]', '5 Critical'); await p.click('.tpl-add'); }
      if (key === 'raci') { await p.click('.tpl-add'); await p.fill('.tpl-row:nth-child(5) [data-key="activity"]', 'Approve a supplier (test row)'); }
      await p.waitForTimeout(600);
      ok((await p.textContent('.tpl-status')).includes('Saved in this browser'), `${tag}: save status shown`);
      ok(await p.evaluate(k => !!localStorage.getItem('ga-arch-tpl-v1-' + k), key), `${tag}: saved under existing key ga-arch-tpl-v1-${key}`);
      await p.reload({ waitUntil: 'networkidle' });
      ok(await p.inputValue('#' + first) === edit, `${tag}: answer restored after reload`);
      if (key === 'risks') {
        ok(await p.$$eval('.tpl-row', x => x.length) === 3 && /Risk severity 10 out of 25: High/.test(await p.textContent('.tpl-row')), `${tag}: rows and edited score restored`);
        await p.click('.tpl-row:nth-child(3) .tpl-remove'); ok(await p.$$eval('.tpl-row', x => x.length) === 2, `${tag}: remove row`);
      }
      if (key === 'raci') ok(await p.$$eval('.tpl-row', x => x.length) === 5 && await p.inputValue('.tpl-row:nth-child(5) [data-key="activity"]') === 'Approve a supplier (test row)', `${tag}: added RACI row restored after reload`);
      // print
      const before = await p.evaluate(() => window.__printed);
      await p.click('.tpl-print');
      ok(await p.evaluate(() => window.__printed) === before + 1 && (await p.textContent('#tpl-print-view')).includes(edit), `${tag}: print view built with answers`);
      if (key === 'raci') ok(/Sign-off record[\s\S]*Approved with conditions/.test(await p.textContent('#tpl-print-view')) && (await p.textContent('#tpl-print-view')).indexOf('Decision 1') < (await p.textContent('#tpl-print-view')).indexOf('Sign-off record'), `${tag}: print shows the RACI rows then the sign-off record`);
      await p.emulateMedia({ media: 'print' });
      ok(await p.evaluate(() => !document.querySelector('.site-header').checkVisibility() && !document.querySelector('.tpl-pager').checkVisibility() && !document.querySelector('.tpl-form').checkVisibility() && document.getElementById('tpl-print-view').checkVisibility()), `${tag}: print stylesheet shows only the template`);
      if (size === 'desktop') { await p.pdf({ path: `${SHOTS}/print-${slug}.pdf`, format: 'A4' }); ok(fs.statSync(`${SHOTS}/print-${slug}.pdf`).size > 5000, `${tag}: PDF rendered`); }
      await p.emulateMedia({ media: 'screen' }); await p.evaluate(() => window.dispatchEvent(new Event('afterprint')));
      // exports
      for (const kind of ['doc', 'md']) {
        const [dl] = await Promise.all([p.waitForEvent('download'), p.click(`.tpl-${kind}`)]);
        const txt = fs.readFileSync(await dl.path(), 'utf8');
        ok(dl.suggestedFilename().endsWith('.' + kind) && txt.includes(edit) && txt.includes(title), `${tag}: .${kind} export (${dl.suggestedFilename()})`);
        if (OFFICIAL.includes(key)) ok(/based on .*Open Government Licence v3\.0/.test(txt), `${tag}: .${kind} export credits the official template`);
        const labels = { adr: "What's the problem we are trying to solve?", threats: 'STRIDE category', risks: 'Threat likelihood (1 to 5)', data: 'Confidentiality impact', supplier: 'Offshoring and personal data', beta: 'Privacy (Service Standard point 9)', live: 'Required changes register', decom: 'Retirement risk assessment' };
        if (labels[key]) ok(txt.includes(labels[key]), `${tag}: .${kind} export uses the new fields ("${labels[key]}")`);
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

    // migration: answers saved by the previous layout are moved to the new fields, under the same keys
    { const mctx = await b.newContext({ viewport: vp }); const mp = await mctx.newPage(); const merrs = [];
      mp.on('console', m => { if (m.type() === 'error') merrs.push(m.text()); }); mp.on('pageerror', e => merrs.push(e.message));
      await mp.goto(TPL, { waitUntil: 'networkidle' });
      await mp.evaluate(o => { for (const k in o) localStorage.setItem('ga-arch-tpl-v1-' + k, JSON.stringify(o[k])); }, OLD);
      const val = (sel) => mp.inputValue(sel);
      const saved = (k) => mp.evaluate(k => JSON.parse(localStorage.getItem('ga-arch-tpl-v1-' + k)), k);
      const go = async (slug) => { await mp.goto(TPL + slug + '/', { waitUntil: 'networkidle' }); await mp.waitForTimeout(100); return (await mp.textContent('.tpl-status')).trim(); };
      let st = await go('decision-record');
      let sv = await saved('adr');
      ok(/moved them to this template's updated layout/.test(st) && await val('#tpl-adr-title') === 'Old ADR subject' && await val('#tpl-adr-ratified') === '2026-10-01' && await val('#tpl-adr-context') === 'Old problem text' && await val('#tpl-adr-agreed') === 'Design authority' && sv.v === 2 && !('date' in sv.fields), `${size} migrate adr: old date moved to "Date ratified", other answers kept, saved as v2`);
      st = await go('threat-model'); sv = await saved('threats');
      const rows = await mp.$$eval('.tpl-row', x => x.map(r => ['id', 'stride', 'event', 'mitigation'].map(k => r.querySelector(`[data-key="${k}"]`).value)));
      ok(/updated layout/.test(st) && JSON.stringify(rows) === JSON.stringify([['T1', 'Spoofing', 'Old spoofing threat', 'Old spoofing mitigation'], ['T2', 'Information disclosure', 'Old disclosure threat', ''], ['T3', 'Elevation of privilege', '', 'Old privilege mitigation']]) && await val('#tpl-threats-system') === 'Old system' && await val('#tpl-threats-gaps') === 'Old gaps' && sv.v === 2 && sv.rows.length === 3 && !Object.keys(sv.fields).some(k => /_threat$|_mit$/.test(k)), `${size} migrate threats: STRIDE answers became threat rows`);
      st = await go('data-and-sensitivity-summary'); sv = await saved('data');
      ok(/updated layout/.test(st) && await mp.$$eval('.tpl-row', x => x.length) === 1 && await val('.tpl-row [data-key="description"]') === 'Old list of data types' && await val('#tpl-data-classification') === 'Old classification' && await val('#tpl-data-iao') === 'Head of records' && sv.v === 2 && !('types' in sv.fields), `${size} migrate data: data types became the first asset row`);
      st = await go('risk-register'); sv = await saved('risks');
      ok(/updated layout/.test(st) && JSON.stringify(await mp.$$eval('.tpl-row', x => x.map(r => [r.querySelector('[data-key="id"]').value, r.querySelector('[data-key="title"]').value, r.querySelector('[data-key="impact"]').value, r.querySelector('[data-key="likelihood"]').value]))) === JSON.stringify([['R1', 'Old risk one', '5 Critical', '4 Likely'], ['R2', 'Old risk two', '1 Negligible', '1 Rare']]) && /Risk severity 20 out of 25: Very high/.test(await mp.textContent('.tpl-row')) && sv.v === 2, `${size} migrate risks: IDs added, impact names mapped, severity kept`);
      st = await go('supplier-assurance');
      ok(/^Restored your saved answers from this browser/.test(st) && await val('#tpl-supplier-certs') === 'Old certs' && await val('#tpl-supplier-sbom') === 'Old SBOM answer' && await val('#tpl-supplier-certs_view') === 'Acceptable', `${size} keep supplier: old answers load unchanged in the renamed sections`);
      st = await go('ready-for-beta');
      ok(/^Restored/.test(st) && await val('#tpl-beta-controls') === 'Partly' && await val('#tpl-beta-controls_ev') === 'Old controls evidence' && await val('#tpl-beta-outcome') === 'Not ready yet', `${size} keep beta: old answers load`);
      st = await go('live-security-plan');
      ok(/^Restored/.test(st) && await val('#tpl-live-logs') === 'Old logs' && await val('#tpl-live-backups') === 'Old backups', `${size} keep live: old answers load`);
      st = await go('decommission-and-disposal-plan');
      ok(/^Restored/.test(st) && await val('#tpl-decom-copies') === 'Old copies' && await val('#tpl-decom-media_ev') === 'Old media evidence', `${size} keep decom: old answers load`);
      // reloading a migrated template does not migrate again
      st = await go('threat-model');
      ok(/^Restored your saved answers from this browser/.test(st) && await mp.$$eval('.tpl-row', x => x.length) === 3, `${size} migrate: second load uses the saved v2 data`);
      ok(merrs.length === 0, `${size} migrate: no console errors ${merrs.join(' | ')}`);
      await mctx.close(); }

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
      ok(ax.length === 0, `${size}: axe ${ax.length ? JSON.stringify(ax) : '0 violations (index + 10 pages, empty and filled)'}`);
    }
  }
  { const ctx = await b.newContext(); const p = await ctx.newPage(); await p.goto(B + '/architect/', { waitUntil: 'networkidle' });
    const hrefs = await p.$$eval('#templates a', x => x.map(a => a.getAttribute('href')));
    ok(T.every(t => hrefs.includes(`/architect/templates/${t[1]}/`)) && hrefs.includes('/architect/templates/'), 'architect page: links to each template page and the list');
    ok((await p.textContent('#templates-title')).trim() === 'Templates for security architects', 'architect page: section heading');
    ok((await p.textContent('#templates')).includes('Especially useful if you are starting out in the role'), 'architect page: starting-out line');
    ok(!(await p.textContent('.arch-next')).includes('templates'), 'architect page: coming next no longer mentions templates');
    if (!LOCAL) { const sm = await (await p.goto(B + '/sitemap.xml')).text(); ok(['', ...T.map(t => t[1] + '/')].every(s => sm.includes('/architect/templates/' + s + '<')), 'sitemap has the list and all 10 template pages'); }
    await ctx.close(); }
  axe.report(ok);
  await b.close(); console.log(fail ? `${fail} FAILED` : 'ALL PASS'); process.exit(fail ? 1 : 0);
})();
