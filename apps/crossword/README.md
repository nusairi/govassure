# GOV Assured crossword

Cyber security and general-knowledge crosswords that play in the browser. It is served on [crossword.govassured.com](https://crossword.govassured.com) from the Azure Static Web App `swa-govassured-crossword`.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `index.html`, `styles.css`, `app.js`: the page and the crossword player.
- `wordlists.json`: the puzzles as word lists (answer, clue and an optional explanation).
- `puzzles.js`: the laid-out grids, generated from `wordlists.json` by `tools/generate.py`. Don't edit it by hand.
- `theme.js`: light and dark themes and the optional background photos (Unsplash, credited on screen).
- `ga-*.css`, `ga-sources.js`, `ga-logo.png`, `ga-404.html`: the shared GOV Assured brand bar, sources panel and 404 page.

## Build

From this directory:

```bash
tools/build.sh . /tmp/crossword-build
```

`tools/build.sh` copies the site files to the output folder (leaving out `tools/`, `README.md` and `.gitignore`) and adds `staticwebapp.config.json` from `tools/swa-config.json`. It then checks that every inline style is allowed by a hash in the Content Security Policy and that the GOV Assured brand bar is on every page. There is no compile step.

The config caches `app.js`, `puzzles.js`, `theme.js`, `styles.css` and the `ga-*` files as immutable for a year, and those names carry no version. Returning visitors keep the old copy after a change, so give a changed file a new name or add a `?v=` query in `index.html` when you edit it.

## Puzzles

To add or change a puzzle, edit `wordlists.json` and run `python3 tools/generate.py` from this directory. The generator is deterministic, so the same input always gives the same `puzzles.js`; a full run takes about three minutes. Puzzle ids are part of saved progress keys, so don't rename an existing id.

## Smoke test

`tools/smoke.js <url>` opens the page in headless Chromium at phone size, types into the grid and prints the status, brand-bar count, puzzle title, cell count and any console errors. It needs `playwright-core` and a Chromium build.

## Deploy

The build output is deployed with the SWA CLI.
