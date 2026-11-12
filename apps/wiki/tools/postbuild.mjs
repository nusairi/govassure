// GOV Assured edits applied to the VitePress output after `vitepress build` (no dependencies).
// - the shared ga-theme.css, ga-app.css and ga-sources.js, linked at the end of <head> with
//   ?v=<first 10 hex of the file's sha256> so they can be cached as immutable.
// - the GOV Assured LinkedIn links in the HTML get one attribute order: href, target, rel,
//   aria-label, class, then Vue's data-v-* scope attributes (the page data embedded as JSON
//   keeps the source order, as on the live site).
// The brand bar itself is rendered by .vitepress/theme/index.ts; its styles are in custom.css.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] || ".vitepress/dist";
const v = (f) => createHash("sha256").update(readFileSync(join(out, f))).digest("hex").slice(0, 10);
const tags =
  `<link rel="stylesheet" href="/ga-theme.css?v=${v("ga-theme.css")}" id="ga-theme">` +
  `<link rel="stylesheet" href="/ga-app.css?v=${v("ga-app.css")}" id="ga-app">` +
  `<script src="/ga-sources.js?v=${v("ga-sources.js")}" id="ga-sources-js" defer></script>`;

const walk = (d) =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? (n === "assets" ? [] : walk(p)) : p.endsWith(".html") ? [p] : [];
  });

const keys = ["href", "target", "rel", "aria-label", "class"];
const liLink = (tag) => {
  const body = tag.slice(2, -1);
  const attrs = Object.fromEntries([...body.matchAll(/ ([a-z-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  const scopes = body.replace(/ ([a-z-]+)="([^"]*)"/g, "").match(/ data-v-[0-9a-f]+/g) || [];
  if (body.replace(/ ([a-z-]+)="([^"]*)"/g, "").replace(/ data-v-[0-9a-f]+/g, "") !== "")
    throw new Error(`unexpected LinkedIn link: ${tag}`);
  const have = Object.keys(attrs);
  if (have.some((k) => !keys.includes(k)) || !["href", "target", "rel", "aria-label"].every((k) => k in attrs))
    throw new Error(`unexpected LinkedIn link: ${tag}`);
  return "<a" + keys.filter((k) => k in attrs).map((k) => ` ${k}="${attrs[k]}"`).join("") + scopes.join("") + ">";
};

for (const f of walk(out)) {
  let s = readFileSync(f, "utf8");
  if (s.split("</head>").length !== 2) throw new Error(`${f}: expected exactly one </head>`);
  if (s.includes("CyberAssure")) throw new Error(`${f}: old site name left in the output`);
  s = s.replace("</head>", tags + "</head>");
  s = s.replace(/<a [^>]*href="https:\/\/www\.linkedin\.com\/company\/102617034\/"[^>]*>/g, liLink);
  writeFileSync(f, s);
  console.log(`${f}: ga-* links added, LinkedIn links normalised`);
}
