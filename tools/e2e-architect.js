// Security Architect Corner checks: B=<site> [SHOTS=dir] [HOME_TILE=1] node e2e-architect.js
// axe-core is required (see tools/axe.js): run `npm i --no-save axe-core` in tools/ first.
const {chromium}=require('playwright-core');const fs=require('fs');const path=require('path');
const B=(process.env.B||'http://127.0.0.1:8000').replace(/\/$/,'');
const SHOTS=process.env.SHOTS||path.join(__dirname,'shots');fs.mkdirSync(SHOTS,{recursive:true});
const CHROME=process.env.CHROME||'/usr/bin/google-chrome';
const axe=require('./axe');axe.load();
let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++;};
(async()=>{const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
for(const [name,vp] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:name=='mobile'?2:1,isMobile:name=='mobile',hasTouch:name=='mobile'});
  const p=await ctx.newPage();const errs=[];
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
  const r=await p.goto(B+'/architect/',{waitUntil:'networkidle'});
  ok(r.status()===200,`${name}: /architect/ 200`);
  if(!/127\.0\.0\.1|localhost/.test(B)){const csp=r.headers()['content-security-policy']||'';ok(csp.includes("script-src 'self'"),`${name}: CSP header present`);}
  if(!/127\.0\.0\.1|localhost/.test(B)){const r2=await (await ctx.newPage()).goto(B+'/architect',{waitUntil:'domcontentloaded'});ok(r2.status()===200,`${name}: /architect (no slash) 200`);}
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);ok(sw<=0,`${name}: no horizontal scroll (${sw})`);
  const n=await p.$$eval('.arch-acc-btn',x=>x.length);ok(n===5,`${name}: 5 accordion buttons`);
  const hidden=await p.$$eval('.arch-acc-content',x=>x.filter(e=>e.hidden).length);ok(hidden===5,`${name}: phases collapsed by default`);
  await p.screenshot({path:`${SHOTS}/${name}-full.png`,fullPage:true});
  await p.click('#stage-beta .arch-acc-btn');
  ok(await p.getAttribute('#stage-beta .arch-acc-btn','aria-expanded')==='true',`${name}: click opens Beta`);
  await p.locator('#stage-beta').screenshot({path:`${SHOTS}/${name}-beta-open.png`});
  await p.click('#stage-beta .arch-acc-btn');
  ok(await p.getAttribute('#stage-beta .arch-acc-btn','aria-expanded')==='false',`${name}: click closes Beta`);
  // keyboard
  await p.focus('#stage-alpha .arch-acc-btn');await p.keyboard.press('Enter');
  ok(await p.getAttribute('#stage-alpha .arch-acc-btn','aria-expanded')==='true',`${name}: Enter opens Alpha`);
  await p.keyboard.press('Space');ok(await p.getAttribute('#stage-alpha .arch-acc-btn','aria-expanded')==='false',`${name}: Space closes Alpha`);
  // phase strip link
  await p.click('.arch-phases a[href="#stage-live"]');await p.waitForTimeout(300);
  ok(await p.getAttribute('#stage-live .arch-acc-btn','aria-expanded')==='true',`${name}: phase link opens Live`);
  await p.click('.arch-acc-all');ok(await p.$$eval('.arch-acc-content',x=>x.every(e=>!e.hidden)),`${name}: Show all opens all`);
  ok((await p.textContent('.arch-acc-all')).includes('Hide all'),`${name}: toggle label updates`);
  const sw2=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);ok(sw2<=0,`${name}: no horizontal scroll with all open (${sw2})`);
  await p.screenshot({path:`${SHOTS}/${name}-all-open.png`,fullPage:true});
  // links
  const links=await p.$$eval('a[href]',as=>as.map(a=>({h:a.href,t:a.target,r:a.rel})));
  const bad2=links.filter(l=>{const u=new URL(l.h);const internal=u.hostname.endsWith('govassured.com')||u.hostname===new URL(B).hostname;return internal?l.t==='_blank':(l.t!=='_blank'||!l.r.includes('noopener'));});
  ok(bad2.length===0,`${name}: link targets correct (${bad2.map(x=>x.h).join(',')})`);
  ok(!links.some(l=>/\/matrix|\/checklist/.test(l.h)),`${name}: no matrix/checklist links`);
  ok(await p.$$eval('.arch-tool',x=>x.length)===8,`${name}: 8 tool cards`);
  for(const [sec,host] of [['alpha','sbd'],['beta','sbd'],['beta','scope']]){const t=await p.$$eval(`#stage-${sec} .arch-try a[href^="https://${host}.govassured.com"]`,x=>x.map(a=>a.target));ok(t.length>=1&&t.every(x=>x!=='_blank'),`${name}: ${sec} has same-tab Try it link to ${host}`);}
  // documents for each phase
  const TAGS=['New','Update','Final','Review','Use','Close'];
  const EXPECT={discovery:6,alpha:8,beta:11,live:11,retirement:6};
  for(const [ph,cnt] of Object.entries(EXPECT)){
    const d=await p.$$eval(`#stage-${ph} .arch-docs`,x=>x.map(e=>({h:e.querySelector('h4').textContent.trim(),items:[...e.querySelectorAll('.arch-docs-list li')].map(li=>({href:li.querySelector('a').getAttribute('href'),t:li.querySelector('a').target,tag:li.querySelector('.arch-tag').textContent.trim()})),more:(e.querySelector('.arch-docs-more a')||{}).getAttribute&&e.querySelector('.arch-docs-more a').getAttribute('href')})));
    ok(d.length===1&&d[0].h==='Documents for this phase',`${name}: ${ph} has a Documents for this phase box`);
    ok(d.length===1&&d[0].items.length===cnt,`${name}: ${ph} lists ${cnt} documents (${d[0]&&d[0].items.length})`);
    ok(d.length===1&&d[0].items.every(i=>TAGS.includes(i.tag)&&!i.t&&(/^\/architect\/templates\/[a-z-]+\/$/.test(i.href)||/^https:\/\/(sbd|scope)\.govassured\.com$/.test(i.href))),`${name}: ${ph} documents have a tag and a same-tab template or tool link`);
    ok(d.length===1&&d[0].more==='/architect/document-trail/',`${name}: ${ph} links to the document trail`);
    const prod=await p.$$eval(`#stage-${ph}-content > h4`,hs=>{const h=hs.find(x=>x.textContent.trim()==='What you produce');return h?[...h.nextElementSibling.querySelectorAll('a')].map(a=>a.getAttribute('href')):[]});
    ok(prod.length>=1&&prod.every(h=>/^\/architect\/templates\/[a-z-]+\/$/.test(h)),`${name}: ${ph} What you produce links to templates (${prod.length})`);
  }
  if(name==='desktop'){const hrefs=[...new Set(await p.$$eval('.arch-docs a, #lifecycle .arch-acc-content ul a[href^="/architect/templates/"]',x=>x.map(a=>a.getAttribute('href')).filter(h=>h.startsWith('/'))))];
    const st=[];for(const h of hrefs){const rr=await ctx.request.get(B+h);st.push(rr.status());}ok(st.every(x=>x===200),`${name}: all ${hrefs.length} phase document links return 200`);}
  await p.locator('#stage-discovery').screenshot({path:`${SHOTS}/${name}-discovery-documents.png`});
  ok(await p.$('.arch-toc a[href="#document-trail"]')!==null&&await p.$('#document-trail a[href="/architect/document-trail/"]')!==null,`${name}: On this page entry and Document trail section link`);
  ok(await p.$('.arch-start-card a[href="/architect/beginners/"]')!==null,`${name}: Start here card links the beginner path`);
  ok(await p.$$eval('.arch-beginner-vid',x=>x.length)===5,`${name}: 5 phase beginner-video notes`);
  // headings order
  const hs=await p.$$eval('h1,h2,h3,h4,h5,h6',x=>x.map(e=>+e.tagName[1]));let jump=false;for(let i=1;i<hs.length;i++)if(hs[i]>hs[i-1]+1)jump=true;
  ok(hs.filter(h=>h===1).length===1&&!jump,`${name}: heading order ok`);
  ok(errs.length===0,`${name}: no console/CSP errors ${errs.join(' | ')}`);
  // axe in a CSP-bypassed context (injection only), collapsed and expanded states
  if(axe.enabled()){const actx=await b.newContext({viewport:vp,bypassCSP:true});const ap=await actx.newPage();await ap.goto(B+'/architect/',{waitUntil:'networkidle'});
  let ax=[];for(const st of ['collapsed','expanded']){if(st==='expanded')await ap.click('.arch-acc-all');ax.push(...(await axe.scan(ap)).map(x=>st+': '+x));}
  await actx.close();
  ok(ax.length===0,`${name}: axe ${ax.length?JSON.stringify(ax):'0 violations (collapsed + expanded)'}`);}
  await ctx.close();}
// home page link (only when HOME_TILE=1, e.g. the preview build)
if(process.env.HOME_TILE==='1'){
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true});const p=await ctx.newPage();const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(B+'/',{waitUntil:'networkidle'});ok(await p.$('a.lv-map-tile[href="/architect/"]')!==null,'home: preview tile present');
ok(await p.$('.header-nav a[href="/architect/"]')!==null,'home: preview nav link present');
await p.locator('a.lv-map-tile[href="/architect/"]').screenshot({path:SHOTS+'/home-tile-mobile.png'});
await p.click('a.lv-map-tile[href="/architect/"]');await p.waitForLoadState();ok(p.url().endsWith('/architect/'),'home: tile opens same tab');
ok(errs.length===0,'home: no console errors '+errs.join('|'));await ctx.close();}
{const ctx=await b.newContext();const p=await ctx.newPage();
for(const u of ['/sitemap.xml','/govmap/','/govmap/glossary/','/.well-known/security.txt',...(/127\.0\.0\.1|localhost/.test(B)?[]:['/apps'])]){const r=await p.goto(B+u);ok(r.status()===200,'regression '+u+' 200');}
const sm=await (await p.goto(B+'/sitemap.xml')).text();ok(sm.includes('/architect/')&&sm.includes('/architect/beginners/'),'sitemap has /architect/ and /architect/beginners/');await ctx.close();}
axe.report(ok);
await b.close();console.log(fail?`${fail} FAILED`:'ALL PASS');process.exit(fail?1:0);})();
