// GOV Assured edits applied to the exported HTML after `next build` (no dependencies).
// - <html lang="en-GB"> (the RSC payload in index.txt keeps "en", as on the live site)
// - the shared ga-theme.css, ga-app.css and ga-sources.js, linked at the end of <head> with
//   ?v=<first 10 hex of the file's sha256> so they can be cached as immutable.
// The brand bar itself is rendered by app/layout.tsx; its styles are in app/globals.css.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] || "out";
const v = (f) => createHash("sha256").update(readFileSync(join(out, f))).digest("hex").slice(0, 10);
const tags =
  `<link rel="stylesheet" href="/ga-theme.css?v=${v("ga-theme.css")}" id="ga-theme">` +
  `<link rel="stylesheet" href="/ga-app.css?v=${v("ga-app.css")}" id="ga-app">` +
  `<script src="/ga-sources.js?v=${v("ga-sources.js")}" id="ga-sources-js" defer></script>`;

const walk = (d) =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? (n === "_next" ? [] : walk(p)) : p.endsWith(".html") ? [p] : [];
  });

for (const f of walk(out)) {
  let s = readFileSync(f, "utf8");
  if (!s.includes('<html lang="en">') || s.split("</head>").length !== 2) throw new Error(`${f}: unexpected HTML shell`);
  s = s.replace('<html lang="en">', '<html lang="en-GB">').replace("</head>", tags + "</head>");
  writeFileSync(f, s);
  console.log(`${f}: lang en-GB, ga-* links added`);
}
