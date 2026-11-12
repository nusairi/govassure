// GOV Assured edits applied to the exported HTML after `next build` (no dependencies).
// - the brand bar styles from tools/ga-brand.css, inlined as <style id="ga-brand"> (newlines removed)
// - the shared ga-theme.css, ga-app.css and ga-sources.js, linked at the end of <head> with
//   ?v=<first 10 hex of the file's sha256> so they can be cached as immutable.
// <html lang="en-GB"> and the brand bar itself are rendered by pages/_document.js.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const out = process.argv[2] || "out";
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "ga-brand.css"), "utf8").replace(/\n/g, "");
const v = (f) => createHash("sha256").update(readFileSync(join(out, f))).digest("hex").slice(0, 10);
const tags =
  `<style id="ga-brand">${css}</style>` +
  `<link rel="stylesheet" href="/ga-theme.css?v=${v("ga-theme.css")}" id="ga-theme">` +
  `<link rel="stylesheet" href="/ga-app.css?v=${v("ga-app.css")}" id="ga-app">` +
  `<script src="/ga-sources.js?v=${v("ga-sources.js")}" id="ga-sources-js" defer></script>`;

const walk = (d) =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? (n === "_next" ? [] : walk(p)) : p.endsWith(".html") ? [p] : [];
  });

const shell = '<html lang="en-GB" class="govuk-template">';
const body = '<body class="govuk-template__body"><div class="ga-brandbar">';
for (const f of walk(out)) {
  let s = readFileSync(f, "utf8");
  if (!s.includes(shell) || !s.includes(body) || s.split("</head>").length !== 2) throw new Error(`${f}: unexpected HTML shell`);
  s = s.replace("</head>", tags + "</head>");
  writeFileSync(f, s);
  console.log(`${f}: brand styles and ga-* links added`);
}
