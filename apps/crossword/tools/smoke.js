const { chromium } = require('playwright-core');
(async () => {
  const url = process.argv[2];
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error' || m.type()==='warning') errs.push(m.type()+': '+m.text()); });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  const r = await p.goto(url, { waitUntil: 'networkidle' });
  const bar = await p.locator('.ga-brandbar').count();
  const title = await p.textContent('#puzzle-title');
  const cells = await p.locator('.cell.letter').count();
  await p.locator('.cell.letter').first().click();
  await p.keyboard.type('ABC');
  const txt = await p.evaluate(() => [...document.querySelectorAll('.cell.letter')].slice(0, 12).map(c => c.textContent.replace(/\d/g,'').trim()).join('|'));
  console.log(JSON.stringify({ status: r.status(), bar, title, cells, firstCells: txt, errors: errs }));
  await b.close();
})();
