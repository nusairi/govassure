# Hub browser checks

These Playwright scripts check the live www.govassured.com features (outages, publications, the government map, glossary tooltips, and the home-page link). They are not run by GitHub Actions.

```bash
python3 -m http.server 8000   # from the repository root
cd tools && npm install
B=http://127.0.0.1:8000 SHOTS=./shots node e2e-home-govmap.js
```

`B` is the site under test (local, preview, or production). `SHOTS` defaults to `tools/shots/` and is gitignored. `CHROME` can point at a Chrome or Chromium binary; the default is `/usr/bin/google-chrome`.

`e2e-architect.js` checks the Security Architect Corner (`/architect/`): the phase accordion (mouse and keyboard), link targets, heading order, no horizontal scroll at 1440px and 390px, and no console or CSP errors. Install `axe-core` with `npm i --no-save axe-core` to add the WCAG 2.2 AA scan. Set `HOME_TILE=1` only when the build under test links the page from the home page.
