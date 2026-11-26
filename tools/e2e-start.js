// Start your security journey checks: B=<site> [SHOTS=dir] node e2e-start.js
// axe-core is required (see tools/axe.js): run `npm i --no-save axe-core` in tools/ first.
const {chromium} = require('playwright-core');
const fs = require('fs');
const path = require('path');
const B = (process.env.B || 'http://127.0.0.1:8000').replace(/\/$/, '');
const SHOTS = process.env.SHOTS || path.join(__dirname, 'shots/start');
fs.mkdirSync(SHOTS, {recursive: true});
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const axe = require('./axe');
axe.load();
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const isLocal = /127\.0\.0\.1|localhost/.test(B);
const YT = 'https://www.youtube.com/watch?v=';
const KEY = 'ga-start-journey-progress';

const STEPS = [
  {n: 1, slug: '1-what-is-cyber-security', title: 'What cyber security is', videos: [YT + '_DVVNOGYtmU&t=616s', YT + '34BtwcL7Mkg&t=2139s']},
  {n: 2, slug: '2-threats-and-attackers', title: 'Threats, attackers and risk', videos: [YT + '_DVVNOGYtmU&t=1574s', YT + '34BtwcL7Mkg&t=835s']},
  {n: 3, slug: '3-passwords-and-accounts', title: 'Passwords, 2-step checks and accounts', videos: [YT + 'Rgl7C0P6NsE&t=2678s']},
  {n: 4, slug: '4-devices-and-updates', title: 'Devices, updates and malware', videos: [YT + 'NIRXtMg-0z8&t=3352s', YT + 'Rgl7C0P6NsE&t=5790s']},
  {n: 5, slug: '5-phishing-and-scams', title: 'Phishing and social engineering', videos: [YT + 'Rgl7C0P6NsE&t=5163s']},
  {n: 6, slug: '6-networks-and-internet', title: 'Networks and the internet', videos: [YT + 'NIRXtMg-0z8&t=499s', YT + 'NIRXtMg-0z8&t=2242s']},
  {n: 7, slug: '7-data-and-privacy', title: 'Data, encryption and privacy', videos: [YT + 'Rgl7C0P6NsE&t=1925s', YT + '3EgYr7jR4NI&t=386s']},
  {n: 8, slug: '8-careers-and-next-steps', title: 'Careers and where to go next', videos: [YT + '_DVVNOGYtmU&t=2200s', YT + '3EgYr7jR4NI&t=3323s']},
];
const PLAYLIST = 'https://www.youtube.com/playlist?list=PL590L5WQmH8d68VyR6RjhgldHMxMJ5B5z';
const ALL_VIDEOS = STEPS.flatMap(s => s.videos);
const NAMES = /jontever|nusairi|silvester|jonathan/i;

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
    const host = u.hostname;
    const internal = host === 'govassured.com' || host.endsWith('.govassured.com') || host === new URL(B).hostname;
    if (internal) return l.t === '_blank';
    const company = /linkedin\.com\/company\/102617034|github\.com\/nusairi\/govassure/.test(l.h);
    return l.t !== '_blank' || !l.r.includes('noopener') || (!company && !l.hidden);
  });
  ok(bad.length === 0, `${name}: link targets and new-tab labels correct ${bad.map(x => x.h).join(', ')}`);
  const external = links.filter(l => { const host = new URL(l.h).hostname; return !(host === 'govassured.com' || host.endsWith('.govassured.com') || host === new URL(B).hostname); });
  const stray = external.filter(l => !/youtube\.com|\.gov\.uk$/.test(new URL(l.h).hostname) && !/linkedin\.com\/company\/102617034|github\.com\/nusairi\/govassure/.test(l.h));
  ok(stray.length === 0, `${name}: external links are only YouTube, gov.uk or the two allowed company links ${stray.map(x => x.h).join(', ')}`);
  const hrefs = [...new Set(links.map(l => l.h))];
  const missing = requireVideos.filter(v => !hrefs.includes(v));
  if (requireVideos.length) ok(missing.length === 0, `${name}: expected YouTube clips present (missing ${missing.join(',')})`);
  if (requirePlaylist) ok(hrefs.includes(PLAYLIST), `${name}: playlist is linked`);
  const yt = links.filter(l => /youtube\.com/.test(l.h));
  if (yt.length) ok(yt.every(l => l.t === '_blank' && l.r.includes('noopener') && l.r.includes('noreferrer') && l.hidden), `${name}: YouTube links are new-tab with noopener noreferrer and a hidden label`);
  const official = links.filter(l => /\.gov\.uk$/.test(new URL(l.h).hostname));
  if (official.length) {
    ok(official.every(l => l.t === '_blank' && l.r.includes('noopener') && l.r.includes('noreferrer') && l.hidden), `${name}: official guidance links are new-tab with noopener noreferrer and a hidden label`);
    ok(official.every(l => !new URL(l.h).hash), `${name}: official guidance links have no URL fragments`);
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
    const root = document.querySelector('.beg-step-anim');
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

async function textChecks(p, name) {
  const text = await p.evaluate(() => document.body.innerText);
  ok(!NAMES.test(text), `${name}: no personal names`);
  ok(!/consultanc|we will help your organi[sz]ation|book a call/i.test(text), `${name}: reads as a community, not a consultancy`);
  ok((await p.$$('.footer-note')).length === 1 && (await p.textContent('.footer-note')).includes('Not a government website'), `${name}: exactly one footer disclaimer`);
}

(async () => {
  const b = await chromium.launch({executablePath: CHROME, args: ['--no-sandbox']});

  // Pointers into the path: home tile, Corner card, beginner architecture path
  {
    const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
    const p = await ctx.newPage();
    const errs = track(p);
    await p.goto(B + '/', {waitUntil: 'load'});
    const tile = await p.$eval('a.lv-map-tile[href="/start/"]', a => ({t: a.target, text: a.textContent.replace(/\s+/g, ' ').trim()}));
    ok(!tile.t && /New to security\? Start here/.test(tile.text), `home: tile links the start path in the same tab (${tile.text})`);
    ok(await p.$('a.lv-map-tile[href="/architect/"]') !== null, 'home: architect tile still present');
    const order = await p.$$eval('a.lv-map-tile', as => as.map(a => a.getAttribute('href')));
    ok(order.indexOf('/start/') > -1 && order.indexOf('/start/') < order.indexOf('/architect/'), `home: start tile sits before the architect tile (${order.join(', ')})`);
    await p.locator('a.lv-map-tile[href="/start/"]').screenshot({path: `${SHOTS}/home-tile.png`});
    await p.click('a.lv-map-tile[href="/start/"]');
    await p.waitForLoadState('load');
    ok(p.url().replace(/\/$/, '').endsWith('/start'), 'home: tile opens /start/ in the same tab');

    await p.goto(B + '/architect/', {waitUntil: 'load'});
    const corner = await p.$eval('.arch-start-card a[href="/start/"]', a => ({t: a.target, text: a.textContent.trim()}));
    ok(!corner.t && /Start your security journey/.test(corner.text), 'corner: Start here card points at /start/ in the same tab');

    await p.goto(B + '/architect/beginners/', {waitUntil: 'load'});
    const beg = await p.$eval('.beg-start-first a[href="/start/"]', a => ({t: a.target, text: a.textContent.trim()}));
    ok(!beg.t && /Start your security journey/.test(beg.text), 'architect beginners overview: "new to security? start here first" pointer');
    await p.goto(B + '/architect/beginners/1-role/', {waitUntil: 'load'});
    ok(await p.$('.beg-start-first a[href="/start/"]') !== null, 'architect beginners step 1: start-here-first pointer');
    // The home page asks for live-threat data that a static local server does not have, so ignore 404s there when local.
    const real = errs.filter(e => !(isLocal && /status of 404/.test(e)));
    ok(real.length === 0, `pointers: no console/CSP errors ${real.join(' | ')}`);
    await ctx.close();
  }

  const collectedVideos = new Set();

  for (const [name, vp] of [['desktop', {width: 1440, height: 900}], ['mobile', {width: 390, height: 844}]]) {
    const ctx = await b.newContext({viewport: vp, deviceScaleFactor: name === 'mobile' ? 2 : 1, isMobile: name === 'mobile', hasTouch: name === 'mobile'});
    const p = await ctx.newPage();
    const errs = track(p);
    const r = await p.goto(B + '/start/', {waitUntil: 'load'});
    ok(r.status() === 200, `${name}: /start/ 200`);
    if (!isLocal) {
      const csp = r.headers()['content-security-policy'] || '';
      ok(csp.includes("script-src 'self'"), `${name}: CSP header present`);
      const r2 = await (await ctx.newPage()).goto(B + '/start', {waitUntil: 'domcontentloaded'});
      ok(r2.status() === 200, `${name}: /start (no slash) 200`);
    }
    const sw = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(sw <= 0, `${name} overview: no horizontal scroll (${sw})`);
    ok((await p.$eval('h1', e => e.textContent.trim())).includes('Start your security journey'), `${name}: overview h1`);
    ok(await p.$('#beg-learn') !== null, `${name}: what you will learn is present`);
    const cards = await p.$$eval('[data-beg-card]', x => x.map(e => ({id: e.getAttribute('data-beg-card'), href: e.getAttribute('href'), status: (e.querySelector('.beg-step-card-status') || {}).textContent})));
    ok(cards.map(c => c.id).join() === 'step-1,step-2,step-3,step-4,step-5,step-6,step-7,step-8', `${name}: 8 overview cards`);
    ok(cards.every((c, i) => c.href === `/start/${STEPS[i].slug}/`), `${name}: overview cards link to step pages`);
    ok(cards.every(c => /Not started/.test(c.status || '')), `${name}: overview cards start as not started`);
    ok(/0 of 8/.test((await p.textContent('#beg-progress-status')) || ''), `${name}: progress starts at 0 of 8`);
    ok(await p.$('#glossary') !== null && await p.$$eval('.beg-glossary dt', x => x.length) >= 10, `${name}: glossary present`);
    ok(await p.$('a[href="/architect/beginners/"]') !== null, `${name}: overview leads on to the beginner architecture path`);
    await textChecks(p, `${name} overview`);
    await headingOk(p, `${name} overview`);
    await linkAudit(p, `${name} overview`, {requirePlaylist: true});
    await p.screenshot({path: `${SHOTS}/${name}-overview.png`, fullPage: true});
    ok(errs.length === 0, `${name} overview: no console/CSP errors ${errs.join(' | ')}`);
    await ctx.close();
  }

  // Every step page: load, nav, animation, official box, clips, progress persistence
  {
    const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
    const p = await ctx.newPage();
    const errs = track(p);
    for (const s of STEPS) {
      const url = `/start/${s.slug}/`;
      const r = await p.goto(B + url, {waitUntil: 'load'});
      ok(r.status() === 200, `step ${s.n}: ${url} 200`);
      if (!isLocal) {
        const r2 = await (await ctx.newPage()).goto(B + url.replace(/\/$/, ''), {waitUntil: 'domcontentloaded'});
        ok(r2.status() === 200, `step ${s.n}: slashless 200`);
      }
      const sw = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(sw <= 0, `step ${s.n}: no horizontal scroll (${sw})`);
      ok((await p.$eval('h1', e => e.textContent.trim())) === s.title, `step ${s.n}: h1 is the step title`);
      ok(((await p.textContent('.beg-step-kicker')) || '').includes(`Step ${s.n} of 8`), `step ${s.n}: step indicator`);
      const crumbs = await p.$$eval('.arch-crumbs a', as => as.map(a => a.getAttribute('href')));
      ok(crumbs.includes('/') && crumbs.includes('/start/'), `step ${s.n}: breadcrumb back to home and overview`);
      ok(await p.$('.beg-gov') !== null && ((await p.textContent('.beg-gov h2')) || '').includes('What GOV.UK recommends'), `step ${s.n}: GOV.UK recommendations box`);
      ok(await p.$$eval('.beg-gov li a', as => as.length) >= 2, `step ${s.n}: at least two official links`);
      ok(await p.$('.beg-step-anim') !== null, `step ${s.n}: explainer animation present`);
      ok(((await p.$eval('.beg-step-anim figcaption', e => e.textContent.trim())).length) > 40, `step ${s.n}: animation has a text alternative`);
      ok(await p.$('.beg-step-anim .beg-anim-stage[aria-hidden="true"] svg') !== null, `step ${s.n}: decorative animation is hidden from assistive tech and described by its caption`);
      ok(await p.$('.beg-step-anim [data-beg-anim-toggle]') !== null, `step ${s.n}: pause/play control present`);
      const info = await animInfo(p);
      ok(info && info.name !== 'none' && info.play === 'running' && info.playing, `step ${s.n}: animation is playing by default (${JSON.stringify(info)})`);
      await p.locator('.beg-step-anim [data-beg-anim-toggle]').click();
      const paused = await animInfo(p);
      ok(paused && paused.play === 'paused' && paused.paused && (await p.locator('.beg-step-anim [data-beg-anim-toggle]').textContent()) === 'Play', `step ${s.n}: pause stops the animation (${JSON.stringify(paused)})`);
      await p.locator('.beg-step-anim [data-beg-anim-toggle]').click();
      const resumed = await animInfo(p);
      ok(resumed && resumed.play === 'running' && resumed.playing, `step ${s.n}: play resumes the animation`);
      if (s.n > 1) {
        ok(await p.$(`a.tpl-pager-prev[href="/start/${STEPS[s.n - 2].slug}/"]`) !== null, `step ${s.n}: previous links to step ${s.n - 1}`);
      } else {
        ok(await p.$('a.tpl-pager-prev') === null, 'step 1: no previous link');
      }
      if (s.n < 8) {
        ok(await p.$(`a.tpl-pager-next[href="/start/${STEPS[s.n].slug}/"]`) !== null, `step ${s.n}: next links to step ${s.n + 1}`);
      } else {
        ok(await p.$('a.tpl-pager-next[href="/architect/beginners/"]') !== null, 'step 8: next leads to the beginner architecture path');
        ok(await p.$('.start-next a[href="/architect/beginners/"]') !== null, 'step 8: where-next box links the beginner architecture path');
      }
      ok(await p.$('a[href="/start/"]') !== null, `step ${s.n}: all-steps link`);
      ok(await p.$('.start-try') !== null, `step ${s.n}: try-it-yourself box`);
      ok(await p.$('.beg-check') !== null, `step ${s.n}: check-your-understanding present`);
      ok(await p.locator(`#beg-done-${s.n}`).count() === 1, `step ${s.n}: mark-as-done checkbox`);
      await headingOk(p, `step ${s.n}`);
      await textChecks(p, `step ${s.n}`);
      const links = await linkAudit(p, `step ${s.n}`, {requireVideos: s.videos});
      links.filter(l => /youtube\.com\/watch/.test(l.h)).forEach(l => collectedVideos.add(l.h));
      const videoCards = await p.$$eval('article.beg-video', cards => cards.map(c => {
        const heading = (c.querySelector('.beg-video-covers') || {}).textContent || '';
        const points = [...c.querySelectorAll('.beg-video-points li')].map(li => li.textContent.trim());
        const svg = c.querySelector('svg[role="img"]');
        const title = svg && (svg.querySelector('title') || {}).textContent || '';
        const desc = svg && (svg.querySelector('desc') || {}).textContent || '';
        const fig = c.querySelector('figure.beg-video-info');
        const cap = fig && (fig.querySelector('figcaption') || {}).textContent || '';
        const toggle = fig && fig.querySelector('[data-beg-anim-toggle]');
        const meta = (c.querySelector('.beg-video-meta') || {}).textContent || '';
        return {heading, points: points.length, minPoint: points.length ? Math.min(...points.map(x => x.length)) : 0, title: title.trim().length, desc: title.trim() && desc.trim().length, cap: (cap || '').trim().length, toggle: !!toggle, meta};
      }));
      ok(videoCards.length === s.videos.length, `step ${s.n}: ${s.videos.length} video explainers (have ${videoCards.length})`);
      videoCards.forEach((c, i) => {
        ok(c.heading.includes('What this video covers'), `step ${s.n} video ${i + 1}: covers heading`);
        ok(c.points >= 3 && c.points <= 6, `step ${s.n} video ${i + 1}: 3-6 bullets (have ${c.points})`);
        ok(c.minPoint >= 40, `step ${s.n} video ${i + 1}: bullets are substantial`);
        ok(c.title >= 20 && c.desc >= 40, `step ${s.n} video ${i + 1}: SVG has title and desc`);
        ok(c.cap > 40, `step ${s.n} video ${i + 1}: infographic has a text alternative`);
        ok(c.toggle, `step ${s.n} video ${i + 1}: infographic has a pause control`);
        ok(/starts at \d+:\d\d/.test(c.meta) && /about \d+ minutes?/.test(c.meta), `step ${s.n} video ${i + 1}: start time and length are stated (${c.meta})`);
      });
      const vToggle = p.locator('article.beg-video .beg-video-info [data-beg-anim-toggle]').first();
      const before = await vToggle.textContent();
      await vToggle.click();
      const after = await vToggle.textContent();
      ok((before === 'Pause' && after === 'Play') || (before === 'Play' && after === 'Pause'), `step ${s.n}: video infographic pause/play toggles (${before} -> ${after})`);
      await vToggle.click();
      await p.screenshot({path: `${SHOTS}/step-${s.n}.png`, fullPage: true});
    }

    // Progress on a step page persists to the overview
    await p.goto(B + '/start/1-what-is-cyber-security/', {waitUntil: 'load'});
    await p.evaluate(k => localStorage.removeItem(k), KEY);
    await p.reload({waitUntil: 'load'});
    await p.locator('#beg-done-1').check();
    ok(await p.locator('#beg-done-1').isChecked(), 'progress: can mark step 1 as done');
    ok(await p.evaluate(k => {
      try { return JSON.parse(localStorage.getItem(k) || '{}')['step-1'] === true; } catch (e) { return false; }
    }, KEY), 'progress: step 1 saved to localStorage under its own key');
    ok(await p.evaluate(() => localStorage.getItem('ga-architect-beginners-progress') === null || !JSON.parse(localStorage.getItem('ga-architect-beginners-progress') || '{}')['step-1']), 'progress: does not touch the architect path progress');
    await p.goto(B + '/start/', {waitUntil: 'load'});
    ok(/1 of 8/.test((await p.textContent('#beg-progress-status')) || ''), 'progress: overview label shows 1 of 8');
    ok(await p.$eval('[data-beg-card="step-1"]', e => e.classList.contains('is-done') && (e.querySelector('.beg-step-card-status') || {}).textContent.trim() === 'Done'), 'progress: overview card for step 1 is done');
    ok(await p.$eval('[data-beg-card="step-2"]', e => !e.classList.contains('is-done')), 'progress: other overview cards stay not started');
    await p.goto(B + '/start/1-what-is-cyber-security/', {waitUntil: 'load'});
    ok(await p.locator('#beg-done-1').isChecked(), 'progress: checkbox still checked after visiting the overview');
    await p.locator('#beg-done-1').uncheck();
    await p.goto(B + '/start/', {waitUntil: 'load'});
    ok(/0 of 8/.test((await p.textContent('#beg-progress-status')) || ''), 'progress: unmarking is reflected on the overview');

    // Prev/Next actually navigate, including the hand-over to the architect path
    await p.goto(B + '/start/1-what-is-cyber-security/', {waitUntil: 'load'});
    await p.click('a.tpl-pager-next');
    await p.waitForLoadState('load');
    ok(p.url().includes('/start/2-threats-and-attackers'), 'nav: next from step 1 opens step 2');
    await p.click('a.tpl-pager-prev');
    await p.waitForLoadState('load');
    ok(p.url().includes('/start/1-what-is-cyber-security'), 'nav: previous from step 2 opens step 1');
    await p.goto(B + '/start/8-careers-and-next-steps/', {waitUntil: 'load'});
    await p.click('a.tpl-pager-next');
    await p.waitForLoadState('load');
    ok(/\/architect\/beginners\/?$/.test(p.url()), 'nav: next from step 8 opens the beginner architecture path');

    ok(errs.length === 0, `step pages: no console/CSP errors ${errs.join(' | ')}`);
    await ctx.close();
  }

  ok(ALL_VIDEOS.every(v => collectedVideos.has(v)), `all 14 clips are linked across the step pages (have ${collectedVideos.size})`);
  ok(collectedVideos.size === 14, `exactly 14 distinct clip links (have ${collectedVideos.size})`);

  // prefers-reduced-motion: start from a static frame; Play opts in
  {
    const ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
    const p = await ctx.newPage();
    const errs = track(p);
    for (const slug of ['3-passwords-and-accounts', '6-networks-and-internet']) {
      await p.goto(B + `/start/${slug}/`, {waitUntil: 'load'});
      const btn = p.locator('.beg-step-anim [data-beg-anim-toggle]');
      ok((await btn.textContent()) === 'Play', `reduced-motion ${slug}: control starts as Play`);
      const still = await animInfo(p);
      ok(still && still.name === 'none' && still.paused && !still.playing, `reduced-motion ${slug}: animation is a static frame (${JSON.stringify(still)})`);
      const vstill = await p.evaluate(() => {
        const out = [];
        for (const f of document.querySelectorAll('.beg-video-info')) {
          let moving = false;
          for (const n of f.querySelectorAll('*')) { const s = getComputedStyle(n); if (s.animationName && s.animationName !== 'none' && s.animationPlayState === 'running') moving = true; }
          out.push(moving);
        }
        return out;
      });
      ok(vstill.length > 0 && vstill.every(m => !m), `reduced-motion ${slug}: video infographics are still too`);
      await btn.click();
      const opted = await animInfo(p);
      ok(opted && opted.name !== 'none' && opted.play === 'running' && opted.playing && (await btn.textContent()) === 'Pause', `reduced-motion ${slug}: Play opts in (${JSON.stringify(opted)})`);
    }
    await p.goto(B + '/start/3-passwords-and-accounts/', {waitUntil: 'load'});
    await p.screenshot({path: `${SHOTS}/reduced-motion.png`, fullPage: true});
    ok(errs.length === 0, `reduced-motion: no console/CSP errors ${errs.join(' | ')}`);
    await ctx.close();
  }

  // Mobile: every step, horizontal scroll and SVG fit
  {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
    const p = await ctx.newPage();
    const errs = track(p);
    for (const s of STEPS) {
      await p.goto(B + `/start/${s.slug}/`, {waitUntil: 'load'});
      const sw = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(sw <= 0, `mobile step ${s.n}: no horizontal scroll (${sw})`);
      const wide = await p.$$eval('svg', svgs => svgs.filter(v => v.getBoundingClientRect().right > window.innerWidth + 1).length);
      ok(wide === 0, `mobile step ${s.n}: every SVG fits the screen`);
      ok(await p.$('.beg-anim') !== null && await p.$('.beg-gov') !== null, `mobile step ${s.n}: animation and GOV.UK box present`);
      if (s.n === 3) await p.screenshot({path: `${SHOTS}/mobile-step-3.png`, fullPage: true});
    }
    ok(errs.length === 0, `mobile steps: no console/CSP errors ${errs.join(' | ')}`);
    await ctx.close();
  }

  // axe-core in a CSP-bypassed context: overview + every step, desktop and mobile,
  // plus a light color-scheme pass (the site itself is dark-only).
  if (axe.enabled()) {
    const targets = ['/start/', ...STEPS.map(s => `/start/${s.slug}/`)];
    const views = [
      ['desktop', {width: 1440, height: 900}, {}],
      ['mobile', {width: 390, height: 844}, {isMobile: true, hasTouch: true}],
      ['light', {width: 1440, height: 900}, {colorScheme: 'light'}, ['/start/', '/start/3-passwords-and-accounts/']],
    ];
    for (const [name, vp, extra, only] of views) {
      const actx = await b.newContext({viewport: vp, bypassCSP: true, ...extra});
      const ap = await actx.newPage();
      for (const pathUrl of (only || targets)) {
        let last;
        for (let i = 0; i < 3; i++) {
          try {
            await ap.goto(B + pathUrl, {waitUntil: 'load', timeout: 60000});
            last = null;
            break;
          } catch (err) {
            last = err;
            await new Promise(r => setTimeout(r, 1500));
          }
        }
        if (last) { await actx.close(); throw last; }
        const ax = await axe.scan(ap);
        const short = pathUrl.replace(/\/$/, '') || '/';
        ok(ax.length === 0, `${name} ${short}: axe ${ax.length ? JSON.stringify(ax) : '0 violations'}`);
      }
      await actx.close();
    }
  }

  // Every internal link on the start pages must resolve.
  {
    const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
    const p = await ctx.newPage();
    const paths = new Set();
    const toScan = ['/start/', ...STEPS.map(s => `/start/${s.slug}/`)];
    for (const url of toScan) {
      const r = await p.goto(B + url, {waitUntil: 'domcontentloaded'});
      ok(r.status() === 200, `link-scan: ${url} 200`);
      const hrefs = await p.$$eval('a[href]', as => as.map(a => a.getAttribute('href')));
      for (const h of hrefs) {
        if (!h || !h.startsWith('/') || h.startsWith('//')) continue;
        const pth = h.split('#')[0].split('?')[0];
        if (pth) paths.add(pth);
      }
    }
    const missing = [];
    for (const pth of [...paths].sort()) {
      const r = await p.goto(B + pth, {waitUntil: 'domcontentloaded'});
      if (!r || r.status() !== 200) missing.push(`${pth} (${r && r.status()})`);
    }
    ok(paths.size > 0 && missing.length === 0, `every internal link on the start pages resolves (${paths.size} URLs)${missing.length ? ': ' + missing.join(', ') : ''}`);
    await ctx.close();
  }

  // Sitemap and the unlinked, noindex pages
  {
    const ctx = await b.newContext();
    const p = await ctx.newPage();
    const sm = await (await p.goto(B + '/sitemap.xml')).text();
    ok(sm.includes('/start/</loc>'), 'sitemap has /start/');
    const missingSm = STEPS.filter(s => !sm.includes(`/start/${s.slug}/`));
    ok(missingSm.length === 0, `sitemap has every step page (missing ${missingSm.map(s => s.slug).join(',')})`);
    ok(!/\/matrix|\/checklist/.test(sm), 'sitemap does not list the matrix or checklist');
    await ctx.close();
  }

  axe.report(ok);
  await b.close();
  console.log(fail ? `${fail} FAILED` : 'ALL PASS');
  process.exit(fail ? 1 : 0);
})();
