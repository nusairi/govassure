// Beginner path checks: B=<site> [SHOTS=dir] node e2e-architect-beginners.js
// axe-core is required (see tools/axe.js): run `npm i --no-save axe-core` in tools/ first.
const {chromium} = require('playwright-core');
const fs = require('fs');
const path = require('path');
const B = (process.env.B || 'http://127.0.0.1:8000').replace(/\/$/, '');
const SHOTS = process.env.SHOTS || path.join(__dirname, 'shots/beginners');
fs.mkdirSync(SHOTS, {recursive: true});
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const axe = require('./axe');
axe.load();
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

const VIDEOS = [
  'https://www.youtube.com/watch?v=E9pHJRRfAhw',
  'https://www.youtube.com/watch?v=jq_LZ1RFPfU',
  'https://www.youtube.com/watch?v=EqNe55IzjAw',
  'https://www.youtube.com/watch?v=5uNifnVlBy4',
  'https://www.youtube.com/watch?v=Njqid_JpqTs',
  'https://www.youtube.com/watch?v=sesacY7Xz3c',
  'https://www.youtube.com/watch?v=UpkqXK0B2E0',
  'https://www.youtube.com/watch?v=nthEXs12nFE',
  'https://www.youtube.com/watch?v=VEu326IZpsc',
  'https://www.youtube.com/watch?v=Jk79QJCxPkM',
];
const PLAYLIST = 'https://www.youtube.com/playlist?list=PLOspHqNVtKADkWLFt9OcziQF7EatuANSY';

(async () => {
  const b = await chromium.launch({executablePath: CHROME, args: ['--no-sandbox']});

  // The Start here card on the Corner page
  {
    const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
    const p = await ctx.newPage();
    const r = await p.goto(B + '/architect/', {waitUntil: 'networkidle'});
    ok(r.status() === 200, 'corner: /architect/ 200');
    const href = await p.$eval('.arch-start-card a.btn[href="/architect/beginners/"]', a => ({href: a.getAttribute('href'), t: a.target, text: a.textContent.trim()}));
    ok(href.href === '/architect/beginners/' && !href.t && /Open the beginner path/.test(href.text), 'corner: Start here card links same-tab to /architect/beginners/');
    await p.locator('.arch-start-card').screenshot({path: `${SHOTS}/start-card.png`});
    await p.click('.arch-start-card a.btn[href="/architect/beginners/"]');
    await p.waitForLoadState('networkidle');
    ok(p.url().replace(/\/$/, '').endsWith('/architect/beginners'), 'corner: card opens the beginner path in the same tab');
    await ctx.close();
  }

  for (const [name, vp] of [['desktop', {width: 1440, height: 900}], ['mobile', {width: 390, height: 844}]]) {
    const ctx = await b.newContext({viewport: vp, deviceScaleFactor: name === 'mobile' ? 2 : 1, isMobile: name === 'mobile', hasTouch: name === 'mobile'});
    const p = await ctx.newPage();
    const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(e.message));
    const r = await p.goto(B + '/architect/beginners/', {waitUntil: 'networkidle'});
    ok(r.status() === 200, `${name}: /architect/beginners/ 200`);
    if (!/127\.0\.0\.1|localhost/.test(B)) {
      const csp = r.headers()['content-security-policy'] || '';
      ok(csp.includes("script-src 'self'"), `${name}: CSP header present`);
      const r2 = await (await ctx.newPage()).goto(B + '/architect/beginners', {waitUntil: 'domcontentloaded'});
      ok(r2.status() === 200, `${name}: /architect/beginners (no slash) 200`);
    }
    const sw = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(sw <= 0, `${name}: no horizontal scroll (${sw})`);
    ok((await p.$eval('h1', e => e.textContent.trim())).includes('New to security architecture'), `${name}: h1 is the beginner path`);
    const steps = await p.$$eval('section.beg-step', x => x.map(s => s.id));
    ok(steps.join() === 'step-1,step-2,step-3,step-4,step-5,step-6,step-7', `${name}: 7 steps present (${steps.join()})`);
    const boxes = await p.$$eval('[data-beg-step]', x => x.map(e => e.getAttribute('data-beg-step')));
    ok(boxes.join() === 'step-1,step-2,step-3,step-4,step-5,step-6,step-7', `${name}: 7 progress checkboxes`);
    const checks = await p.$$eval('.beg-check', x => x.length);
    ok(checks === 7, `${name}: 7 check-your-understanding questions (${checks})`);
    ok(await p.$('#glossary') !== null && await p.$$eval('.beg-glossary dt', x => x.length) >= 10, `${name}: glossary present`);
    ok(await p.$('.footer-note') !== null && (await p.textContent('.footer-note')).includes('Not a government website'), `${name}: footer disclaimer present`);

    const links = await p.$$eval('a[href]', as => as.map(a => ({
      h: a.href,
      t: a.target,
      r: a.rel,
      hidden: !!(a.querySelector('.visually-hidden') && a.querySelector('.visually-hidden').textContent.includes('opens in a new tab')),
    })));
    ok(!links.some(l => /\/matrix|\/checklist/.test(l.h)), `${name}: no matrix/checklist links`);
    const bad = links.filter(l => {
      const u = new URL(l.h);
      const internal = u.hostname.endsWith('govassured.com') || u.hostname === new URL(B).hostname;
      if (internal) return l.t === '_blank';
      const company = /linkedin\.com\/company\/102617034|github\.com\/nusairi\/govassure/.test(l.h);
      return l.t !== '_blank' || !l.r.includes('noopener') || (!company && !l.hidden);
    });
    ok(bad.length === 0, `${name}: link targets and new-tab labels correct ${bad.map(x => x.h).join(', ')}`);
    const yt = links.filter(l => /youtube\.com/.test(l.h));
    const ytHrefs = [...new Set(yt.map(l => l.h.replace(/\/$/, '')))];
    const missing = VIDEOS.filter(v => !ytHrefs.includes(v));
    ok(missing.length === 0 && ytHrefs.includes(PLAYLIST), `${name}: all 10 videos and the playlist are linked (missing ${missing.join(',')})`);
    ok(yt.every(l => l.t === '_blank' && l.r.includes('noopener') && l.r.includes('noreferrer') && l.hidden), `${name}: YouTube links are new-tab with noopener noreferrer`);

    const hs = await p.$$eval('h1,h2,h3,h4,h5,h6', x => x.map(e => +e.tagName[1]));
    let jump = false;
    for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) jump = true;
    ok(hs.filter(h => h === 1).length === 1 && !jump, `${name}: heading order ok`);

    // Progress checkbox persists after reload
    const box = p.locator('#beg-done-1');
    await box.check();
    ok(await box.isChecked(), `${name}: can mark step 1 as done`);
    ok(await p.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('ga-architect-beginners-progress') || '{}')['step-1'] === true; } catch (e) { return false; }
    }), `${name}: step 1 saved to localStorage`);
    const status = (await p.textContent('#beg-progress-status')) || '';
    ok(/1 of 7/.test(status), `${name}: progress label updates (${status.trim()})`);
    await p.reload({waitUntil: 'networkidle'});
    ok(await p.locator('#beg-done-1').isChecked(), `${name}: step 1 checkbox still checked after reload`);
    ok(/1 of 7/.test((await p.textContent('#beg-progress-status')) || ''), `${name}: progress label persists after reload`);
    await p.locator('#beg-done-1').uncheck();
    ok(!(await p.locator('#beg-done-1').isChecked()), `${name}: can unmark step 1`);

    // Disclosure for a check-your-understanding answer
    const summary = p.locator('#step-1 .beg-check summary');
    await summary.click();
    ok(await p.$eval('#step-1 .beg-check details', d => d.open), `${name}: check-your-understanding answer can be opened`);

    await p.screenshot({path: `${SHOTS}/${name}-full.png`, fullPage: true});
    if (name === 'mobile') await p.locator('#step-1').screenshot({path: `${SHOTS}/mobile-step-1.png`});
    ok(errs.length === 0, `${name}: no console/CSP errors ${errs.join(' | ')}`);
    await ctx.close();
  }

  // axe-core in a CSP-bypassed context, desktop and mobile
  if (axe.enabled()) {
    for (const [name, vp] of [['desktop', {width: 1440, height: 900}], ['mobile', {width: 390, height: 844}]]) {
      const actx = await b.newContext({viewport: vp, bypassCSP: true, isMobile: name === 'mobile', hasTouch: name === 'mobile'});
      const ap = await actx.newPage();
      await ap.goto(B + '/architect/beginners/', {waitUntil: 'networkidle'});
      const ax = await axe.scan(ap);
      ok(ax.length === 0, `${name}: axe ${ax.length ? JSON.stringify(ax) : '0 violations'}`);
      await actx.close();
    }
  }

  {
    const ctx = await b.newContext();
    const p = await ctx.newPage();
    const sm = await (await p.goto(B + '/sitemap.xml')).text();
    ok(sm.includes('/architect/beginners/'), 'sitemap has /architect/beginners/');
    await ctx.close();
  }

  axe.report(ok);
  await b.close();
  console.log(fail ? `${fail} FAILED` : 'ALL PASS');
  process.exit(fail ? 1 : 0);
})();
