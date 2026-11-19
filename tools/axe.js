// axe-core loader for the e2e checks. It finds axe-core, says where it came from,
// counts every scan and fails the run if axe-core is missing, so an accessibility
// scan can no longer be skipped without anyone noticing.
//
// Lookup order: AXE_CORE=/path/to/axe.min.js, tools/node_modules/axe-core, then
// Node's normal lookup (including NODE_PATH). Install it next to these scripts with
// `npm i --no-save axe-core` (or unpack `npm pack axe-core` into tools/node_modules).
// Set AXE=off only when you mean to skip the scans; the run then says so.
const fs = require('fs');
const path = require('path');

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const state = { src: null, version: null, file: null, scans: 0, rules: 0 };

function find() {
  const tries = [process.env.AXE_CORE, path.join(__dirname, 'node_modules', 'axe-core', 'axe.min.js')].filter(Boolean);
  for (const f of tries) if (fs.existsSync(f)) return f;
  try { return require.resolve('axe-core/axe.min.js'); } catch (e) { return null; }
}

function load() {
  if (process.env.AXE === 'off') { console.log('SKIP axe-core scans turned off with AXE=off'); return state; }
  const file = find();
  if (!file) {
    console.log('FAIL axe-core not found. Run `npm i --no-save axe-core` in tools/, or set AXE_CORE=/path/to/axe.min.js (AXE=off skips on purpose).');
    process.exit(2);
  }
  state.file = file;
  state.src = fs.readFileSync(file, 'utf8');
  state.version = (state.src.match(/axe v(\d+\.\d+\.\d+)/) || [])[1] || 'unknown';
  console.log(`AXE axe-core ${state.version} loaded from ${file}`);
  return state;
}

// Inject axe into the page (use a context created with bypassCSP: true) and run it.
// Returns a list of violation strings; also checks that axe really ran in the page.
async function scan(page) {
  if (!state.src) return [];
  await page.addScriptTag({ content: state.src });
  const r = await page.evaluate(async (tags) => {
    const res = await window.axe.run(document, { runOnly: { type: 'tag', values: tags } });
    return {
      version: window.axe.version,
      passes: res.passes.length,
      violations: res.violations.map(v => v.id + ' (' + v.impact + ') x' + v.nodes.length + ': ' + v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')),
    };
  }, TAGS);
  if (r.version !== state.version || r.passes < 1) throw new Error(`axe did not run properly (version ${r.version}, ${r.passes} passing rules)`);
  state.scans++; state.rules += r.passes;
  return r.violations;
}

function enabled() { return !!state.src; }

// Print the proof line and return false if scans were expected but none ran.
function report(ok) {
  if (!state.src) { console.log('AXE scans skipped (AXE=off)'); return; }
  console.log(`AXE ran ${state.scans} scans with axe-core ${state.version} (${state.rules} passing rule checks in total)`);
  ok(state.scans > 0, 'axe-core scans actually ran');
}

module.exports = { load, scan, enabled, report, TAGS };
