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
const isLocal = /127\.0\.0\.1|localhost/.test(B);

const STEPS = [
  {n: 1, slug: '1-role', title: 'What a security architect does', videos: ['https://www.youtube.com/watch?v=E9pHJRRfAhw']},
  {n: 2, slug: '2-principles', title: 'Ideas that turn up everywhere', videos: ['https://www.youtube.com/watch?v=jq_LZ1RFPfU', 'https://www.youtube.com/watch?v=EqNe55IzjAw']},
  {n: 3, slug: '3-identity', title: 'Identity and the devices people use', videos: ['https://www.youtube.com/watch?v=5uNifnVlBy4', 'https://www.youtube.com/watch?v=Njqid_JpqTs']},
  {n: 4, slug: '4-networks-data', title: 'Networks and data', videos: ['https://www.youtube.com/watch?v=sesacY7Xz3c', 'https://www.youtube.com/watch?v=UpkqXK0B2E0']},
  {n: 5, slug: '5-risk', title: 'Thinking about risk and threats', videos: ['https://www.youtube.com/watch?v=nthEXs12nFE']},
  {n: 6, slug: '6-lifecycle', title: 'How this fits the five-phase lifecycle', videos: ['https://www.youtube.com/watch?v=VEu326IZpsc', 'https://www.youtube.com/watch?v=Jk79QJCxPkM']},
  {n: 7, slug: '7-first-exercise', title: 'Your first exercise, and where to go next', videos: []},
];
const PLAYLIST = 'https://www.youtube.com/playlist?list=PLOspHqNVtKADkWLFt9OcziQF7EatuANSY';
const ALL_VIDEOS = STEPS.flatMap(s => s.videos);

function track(page) {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(e.message));
  return errs;
}

async function linkAudit(p, name, {requirePlaylist = false, requireVideos = []} = {}) {
  const links = await p.$$eval('a[href]', as => as.map(a => ({
    h: a.href,
    t: a.target,
    r: a.rel || '',
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
  const hrefs = [...new Set(links.map(l => l.h.replace(/\/$/, '')))];
  const missing = requireVideos.filter(v => !hrefs.includes(v));
  if (requireVideos.length) ok(missing.length === 0, `${name}: expected YouTube videos present (missing ${missing.join(',')})`);
  if (requirePlaylist) ok(hrefs.includes(PLAYLIST), `${name}: playlist is linked`);
  const yt = links.filter(l => /youtube\.com/.test(l.h));
  if (yt.length) ok(yt.every(l => l.t === '_blank' && l.r.includes('noopener') && l.r.includes('noreferrer') && l.hidden), `${name}: YouTube links are new-tab with noopener noreferrer`);
  const official = links.filter(l => /ncsc\.gov\.uk|security\.gov\.uk|www\.gov\.uk|service\.gov\.uk/.test(l.h));
  if (official.length) {
    ok(official.every(l => l.t === '_blank' && l.r.includes('noopener') && l.r.includes('noreferrer') && l.hidden), `${name}: official guidance links are new-tab with noopener noreferrer`);
    ok(official.every(l => !/#/.test(new URL(l.h).hash)), `${name}: official guidance links have no URL fragments`);
  }
  return links;
}

async function headingOk(p, name) {
  const hs = await p.$$eval('h1,h2,h3,h4,h5,h6', x => x.map(e => +e.tagName[1]));
  let jump = false;
  for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) jump = true;
  ok(hs.filter(h => h === 1).length === 1 && !jump, `${name}: heading order ok`);
}

async function animInfo(p) {
  return p.evaluate(() => {
    const root = document.querySelector('.beg-anim');
    if (!root) return null;
    for (const n of root.querySelectorAll('*')) {
      const s = getComputedStyle(n);
      if (s.animationName && s.animationName !== 'none') {
        return {name: s.animationName, play: s.animationPlayState, paused: root.classList.contains('is-paused'), playing: root.classList.contains('is-playing')};
      }
    }
    return {name: 'none', play: 'none', paused: root.classList.contains('is-paused'), playing: root.classList.contains('is-playing')};
  });
}

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
    const phaseHrefs = await p.$$eval('.arch-beginner-vid a[href^="/architect/beginners/"]', as => as.map(a => a.getAttribute('href')));
    ok(phaseHrefs.every(h => !h.includes('#step-')), `corner: phase beginner links point at step pages (${phaseHrefs.join(', ')})`);
    ok(phaseHrefs.includes('/architect/beginners/2-principles/') && phaseHrefs.includes('/architect/beginners/5-risk/') && phaseHrefs.includes('/architect/beginners/6-lifecycle/') && phaseHrefs.includes('/architect/beginners/4-networks-data/'), 'corner: phase beginner links cover principles, risk, lifecycle and networks-data');
    await p.locator('.arch-start-card').screenshot({path: `${SHOTS}/start-card.png`});
    await p.click('.arch-start-card a.btn[href="/architect/beginners/"]');
    await p.waitForLoadState('networkidle');
    ok(p.url().replace(/\/$/, '').endsWith('/architect/beginners'), 'corner: card opens the beginner path in the same tab');
    await ctx.close();
  }

  const collectedVideos = new Set();

  for (const [name, vp] of [['desktop', {width: 1440, height: 900}], ['mobile', {width: 390, height: 844}]]) {
    const ctx = await b.newContext({viewport: vp, deviceScaleFactor: name === 'mobile' ? 2 : 1, isMobile: name === 'mobile', hasTouch: name === 'mobile'});
    const p = await ctx.newPage();
    const errs = track(p);
    const r = await p.goto(B + '/architect/beginners/', {waitUntil: 'networkidle'});
    ok(r.status() === 200, `${name}: /architect/beginners/ 200`);
    if (!isLocal) {
      const csp = r.headers()['content-security-policy'] || '';
      ok(csp.includes("script-src 'self'"), `${name}: CSP header present`);
      const r2 = await (await ctx.newPage()).goto(B + '/architect/beginners', {waitUntil: 'domcontentloaded'});
      ok(r2.status() === 200, `${name}: /architect/beginners (no slash) 200`);
    }
    const sw = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(sw <= 0, `${name} overview: no horizontal scroll (${sw})`);
    ok((await p.$eval('h1', e => e.textContent.trim())).includes('New to security architecture'), `${name}: overview h1`);
    ok(await p.$('#beg-learn') !== null, `${name}: what you will learn is present`);
    const cards = await p.$$eval('[data-beg-card]', x => x.map(e => ({id: e.getAttribute('data-beg-card'), href: e.getAttribute('href'), status: (e.querySelector('.beg-step-card-status') || {}).textContent})));
    ok(cards.map(c => c.id).join() === 'step-1,step-2,step-3,step-4,step-5,step-6,step-7', `${name}: 7 overview cards`);
    ok(cards.every((c, i) => c.href === `/architect/beginners/${STEPS[i].slug}/`), `${name}: overview cards link to step pages`);
    ok(cards.every(c => /Not started/.test(c.status || '')), `${name}: overview cards start as not started`);
    ok(/0 of 7/.test((await p.textContent('#beg-progress-status')) || ''), `${name}: progress starts at 0 of 7`);
    ok(await p.$('#glossary') !== null && await p.$$eval('.beg-glossary dt', x => x.length) >= 10, `${name}: glossary present`);
    ok(await p.$('.footer-note') !== null && (await p.textContent('.footer-note')).includes('Not a government website'), `${name}: footer disclaimer present`);
    await headingOk(p, `${name} overview`);
    await linkAudit(p, `${name} overview`, {requirePlaylist: true});
    await p.screenshot({path: `${SHOTS}/${name}-overview.png`, fullPage: true});
    ok(errs.length === 0, `${name} overview: no console/CSP errors ${errs.join(' | ')}`);
    await ctx.close();
  }

  // Every step page: load, nav, animation, official box, progress persistence
  {
    const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
    const p = await ctx.newPage();
    const errs = track(p);
    for (const s of STEPS) {
      const url = `/architect/beginners/${s.slug}/`;
      const r = await p.goto(B + url, {waitUntil: 'networkidle'});
      ok(r.status() === 200, `step ${s.n}: ${url} 200`);
      if (!isLocal) {
        const r2 = await (await ctx.newPage()).goto(B + url.replace(/\/$/, ''), {waitUntil: 'domcontentloaded'});
        ok(r2.status() === 200, `step ${s.n}: slashless 200`);
      }
      const sw = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(sw <= 0, `step ${s.n}: no horizontal scroll (${sw})`);
      ok((await p.$eval('h1', e => e.textContent.trim())) === s.title, `step ${s.n}: h1 is the step title`);
      ok(((await p.textContent('.beg-step-kicker')) || '').includes(`Step ${s.n} of 7`), `step ${s.n}: step indicator`);
      const crumbs = await p.$$eval('.arch-crumbs a', as => as.map(a => a.getAttribute('href')));
      ok(crumbs.includes('/architect/') && crumbs.includes('/architect/beginners/'), `step ${s.n}: breadcrumb back to Corner and overview`);
      ok(await p.$('.beg-gov') !== null && ((await p.textContent('.beg-gov h2')) || '').includes('What GOV.UK recommends'), `step ${s.n}: GOV.UK recommendations box`);
      ok(await p.$('.beg-anim') !== null, `step ${s.n}: explainer animation present`);
      ok(((await p.$eval('.beg-anim figcaption', e => e.textContent.trim())).length) > 40, `step ${s.n}: animation has a text alternative`);
      ok(await p.$('[data-beg-anim-toggle]') !== null, `step ${s.n}: pause/play control present`);
      const info = await animInfo(p);
      ok(info && info.name !== 'none' && info.play === 'running' && info.playing, `step ${s.n}: animation is playing by default (${JSON.stringify(info)})`);
      await p.locator('[data-beg-anim-toggle]').click();
      const paused = await animInfo(p);
      ok(paused && paused.play === 'paused' && paused.paused && (await p.locator('[data-beg-anim-toggle]').textContent()) === 'Play', `step ${s.n}: pause stops the animation (${JSON.stringify(paused)})`);
      await p.locator('[data-beg-anim-toggle]').click();
      const resumed = await animInfo(p);
      ok(resumed && resumed.play === 'running' && resumed.playing, `step ${s.n}: play resumes the animation`);
      if (s.n > 1) {
        const prev = STEPS[s.n - 2];
        ok(await p.$(`a.tpl-pager-prev[href="/architect/beginners/${prev.slug}/"]`) !== null, `step ${s.n}: previous links to step ${prev.n}`);
      } else {
        ok(await p.$('a.tpl-pager-prev') === null, 'step 1: no previous link');
      }
      if (s.n < 7) {
        const nxt = STEPS[s.n];
        ok(await p.$(`a.tpl-pager-next[href="/architect/beginners/${nxt.slug}/"]`) !== null, `step ${s.n}: next links to step ${nxt.n}`);
      } else {
        ok(await p.$('a.tpl-pager-next') === null, 'step 7: no next link');
      }
      ok(await p.$('a[href="/architect/beginners/"]') !== null, `step ${s.n}: all-steps link`);
      if (s.n < 7) ok(await p.$('.beg-check') !== null, `step ${s.n}: check-your-understanding present`);
      const box = p.locator(`#beg-done-${s.n}`);
      ok(await box.count() === 1, `step ${s.n}: mark-as-done checkbox`);
      await headingOk(p, `step ${s.n}`);
      const links = await linkAudit(p, `step ${s.n}`, {requireVideos: s.videos});
      links.filter(l => /youtube\.com\/watch/.test(l.h)).forEach(l => collectedVideos.add(l.h.replace(/\/$/, '')));
      ok(await p.$('.footer-note') !== null && (await p.textContent('.footer-note')).includes('Not a government website'), `step ${s.n}: footer disclaimer present`);
      await p.screenshot({path: `${SHOTS}/step-${s.n}.png`, fullPage: true});
    }

    // Progress on a step page persists to the overview
    await p.goto(B + '/architect/beginners/1-role/', {waitUntil: 'networkidle'});
    await p.evaluate(() => localStorage.removeItem('ga-architect-beginners-progress'));
    await p.reload({waitUntil: 'networkidle'});
    await p.locator('#beg-done-1').check();
    ok(await p.locator('#beg-done-1').isChecked(), 'progress: can mark step 1 as done');
    ok(await p.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('ga-architect-beginners-progress') || '{}')['step-1'] === true; } catch (e) { return false; }
    }), 'progress: step 1 saved to localStorage');
    await p.goto(B + '/architect/beginners/', {waitUntil: 'networkidle'});
    ok(/1 of 7/.test((await p.textContent('#beg-progress-status')) || ''), 'progress: overview label shows 1 of 7');
    ok(await p.$eval('[data-beg-card="step-1"]', e => e.classList.contains('is-done') && (e.querySelector('.beg-step-card-status') || {}).textContent.trim() === 'Done'), 'progress: overview card for step 1 is done');
    ok(await p.$eval('[data-beg-card="step-2"]', e => !e.classList.contains('is-done')), 'progress: other overview cards stay not started');
    await p.goto(B + '/architect/beginners/1-role/', {waitUntil: 'networkidle'});
    ok(await p.locator('#beg-done-1').isChecked(), 'progress: checkbox still checked after visiting the overview');
    await p.locator('#beg-done-1').uncheck();
    await p.goto(B + '/architect/beginners/', {waitUntil: 'networkidle'});
    ok(/0 of 7/.test((await p.textContent('#beg-progress-status')) || ''), 'progress: unmarking is reflected on the overview');

    // Prev/Next actually navigate
    await p.goto(B + '/architect/beginners/1-role/', {waitUntil: 'networkidle'});
    await p.click('a.tpl-pager-next');
    await p.waitForLoadState('networkidle');
    ok(p.url().includes('/architect/beginners/2-principles'), 'nav: next from step 1 opens step 2');
    await p.click('a.tpl-pager-prev');
    await p.waitForLoadState('networkidle');
    ok(p.url().includes('/architect/beginners/1-role'), 'nav: previous from step 2 opens step 1');

    ok(errs.length === 0, `step pages: no console/CSP errors ${errs.join(' | ')}`);
    await ctx.close();
  }

  ok(ALL_VIDEOS.every(v => collectedVideos.has(v)), `all 10 videos are linked across the step pages (have ${collectedVideos.size})`);

  // prefers-reduced-motion: start from a static frame; Play opts in
  {
    const ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
    const p = await ctx.newPage();
    const errs = track(p);
    await p.goto(B + '/architect/beginners/2-principles/', {waitUntil: 'networkidle'});
    const btn = p.locator('[data-beg-anim-toggle]');
    ok((await btn.textContent()) === 'Play', 'reduced-motion: control starts as Play');
    const still = await animInfo(p);
    ok(still && still.name === 'none' && still.paused && !still.playing, `reduced-motion: animation is a static frame (${JSON.stringify(still)})`);
    await btn.click();
    const opted = await animInfo(p);
    ok(opted && opted.name !== 'none' && opted.play === 'running' && opted.playing && (await btn.textContent()) === 'Pause', `reduced-motion: Play opts in (${JSON.stringify(opted)})`);
    await p.screenshot({path: `${SHOTS}/reduced-motion.png`, fullPage: true});
    ok(errs.length === 0, `reduced-motion: no console/CSP errors ${errs.join(' | ')}`);
    await ctx.close();
  }

  // Mobile smoke: a mid-path step plus horizontal scroll
  {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
    const p = await ctx.newPage();
    const errs = track(p);
    await p.goto(B + '/architect/beginners/3-identity/', {waitUntil: 'networkidle'});
    const sw = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(sw <= 0, `mobile step 3: no horizontal scroll (${sw})`);
    ok(await p.$('.beg-anim') !== null && await p.$('.beg-gov') !== null, 'mobile step 3: animation and GOV.UK box present');
    await p.screenshot({path: `${SHOTS}/mobile-step-3.png`, fullPage: true});
    ok(errs.length === 0, `mobile step 3: no console/CSP errors ${errs.join(' | ')}`);
    await ctx.close();
  }

  // axe-core in a CSP-bypassed context: overview + every step, desktop and mobile,
  // plus a light color-scheme pass (the site itself is dark-only).
  if (axe.enabled()) {
    const targets = ['/architect/beginners/', ...STEPS.map(s => `/architect/beginners/${s.slug}/`)];
    const views = [
      ['desktop', {width: 1440, height: 900}, {}],
      ['mobile', {width: 390, height: 844}, {isMobile: true, hasTouch: true}],
    ];
    for (const [name, vp, extra] of views) {
      for (const pathUrl of targets) {
        const actx = await b.newContext({viewport: vp, bypassCSP: true, ...extra});
        const ap = await actx.newPage();
        await ap.goto(B + pathUrl, {waitUntil: 'networkidle'});
        const ax = await axe.scan(ap);
        const short = pathUrl.replace('/architect/beginners/', 'beginners/').replace(/\/$/, '') || 'beginners';
        ok(ax.length === 0, `${name} ${short}: axe ${ax.length ? JSON.stringify(ax) : '0 violations'}`);
        await actx.close();
      }
    }
    for (const pathUrl of ['/architect/beginners/', '/architect/beginners/2-principles/']) {
      const actx = await b.newContext({viewport: {width: 1440, height: 900}, bypassCSP: true, colorScheme: 'light'});
      const ap = await actx.newPage();
      await ap.goto(B + pathUrl, {waitUntil: 'networkidle'});
      const ax = await axe.scan(ap);
      const short = pathUrl.replace('/architect/beginners/', 'beginners/').replace(/\/$/, '') || 'beginners';
      ok(ax.length === 0, `light ${short}: axe ${ax.length ? JSON.stringify(ax) : '0 violations'}`);
      await actx.close();
    }
  }

  {
    const ctx = await b.newContext();
    const p = await ctx.newPage();
    const sm = await (await p.goto(B + '/sitemap.xml')).text();
    ok(sm.includes('/architect/beginners/'), 'sitemap has /architect/beginners/');
    const missingSm = STEPS.filter(s => !sm.includes(`/architect/beginners/${s.slug}/`));
    ok(missingSm.length === 0, `sitemap has every step page (missing ${missingSm.map(s => s.slug).join(',')})`);
    await ctx.close();
  }

  axe.report(ok);
  await b.close();
  console.log(fail ? `${fail} FAILED` : 'ALL PASS');
  process.exit(fail ? 1 : 0);
})();
