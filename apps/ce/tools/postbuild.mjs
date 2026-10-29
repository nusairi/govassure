// GOV Assured edits applied to the exported HTML after `next build` (no dependencies).
// - <html lang="en-GB"> (the RSC payloads in the .txt files keep "en", as on the live site)
// - the shared ga-theme.css, ga-app.css and ga-sources.js, linked at the end of <head> with
//   ?v=<first 10 hex of the file's sha256> so they can be cached as immutable.
// - the GOV Assured LinkedIn links in the HTML get one attribute order: href, target, rel,
//   aria-label, class (the RSC payloads keep the source order, as on the live site)
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

const liLink = (tag) => {
  const attrs = Object.fromEntries([...tag.matchAll(/ ([a-z-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  const keys = ["href", "target", "rel", "aria-label", "class"];
  if (Object.keys(attrs).sort().join() !== [...keys].sort().join()) throw new Error(`unexpected LinkedIn link: ${tag}`);
  return "<a" + keys.map((k) => ` ${k}="${attrs[k]}"`).join("") + ">";
};

const shell = '<html lang="en" class="govuk-template">';
for (const f of walk(out)) {
  let s = readFileSync(f, "utf8");
  if (!s.includes(shell) || s.split("</head>").length !== 2) throw new Error(`${f}: unexpected HTML shell`);
  s = s.replace(shell, '<html lang="en-GB" class="govuk-template">').replace("</head>", tags + "</head>");
  s = s.replace(/<a [^>]*href="https:\/\/www\.linkedin\.com\/company\/102617034\/"[^>]*>/g, liLink);
  writeFileSync(f, s);
  console.log(`${f}: lang en-GB, ga-* links added, LinkedIn links normalised`);
}
