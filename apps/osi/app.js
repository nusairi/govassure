/* OSI Security Rings — rendering, interaction and animated dataflow.
   No dependencies. Layout is computed at runtime from measured text widths. */
(function () {
"use strict";
const NS = "http://www.w3.org/2000/svg";
const params = new URLSearchParams(location.search);
const root = document.documentElement;
const PRINT = params.has("print");
const OG = params.has("og");
if (PRINT) root.classList.add("print");

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const $ = id => document.getElementById(id);
const svg = $("poster");
const panel = $("panel");
const tip = $("tip");
const byN = Object.fromEntries(LAYERS.map(l => [l.n, l]));
const KIND = { p: "Protocol / standard", s: "Security technology" };
const PDU = n => n === 8 ? "INTENT" : n >= 5 ? "DATA" : n === 4 ? "SEGMENT" : n === 3 ? "PACKET" : n === 2 ? "FRAME" : "BITS";

/* ---------- geometry (SVG user units = millimetres on A3) ---------- */
const G = { R: 96, r0: 26, cy: 151, cx: { p: 109, s: 311 } };
const RINGS = 8;                     // L7 … L0 as rings, L8 as the core disc
const ringW = (G.R - G.r0) / RINGS;
/* Readability: ring label text is TS x the v2.0 size (keep in step with .t-chip-p/.t-chip-s/.t-pill in app.css). */
const TS = 1.16;
const FS = { "t-chip-p": 2.45 * TS, "t-chip-s": 2.55 * TS, "t-pill": 2.45 * TS };
const CHIP_H = 4.25, PAD = 1.2, MINGAP = 0.7, PILL_PAD = 1.7;
const ROW2 = 2.24;                    // radial offset of the two chip rows on crowded rings
const CH = 3.9;                       // half-height of the dataflow channel kept clear of chips
const X0 = G.cx.p + G.r0, X1 = G.cx.s - G.r0;

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const f = v => (+v).toFixed(3);
const pt = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
function arcD(cx, cy, r, a1, a2) {
  const [x1, y1] = pt(cx, cy, r, a1), [x2, y2] = pt(cx, cy, r, a2);
  const sweep = a2 > a1 ? 1 : 0, large = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
  return `M${f(x1)} ${f(y1)} A${f(r)} ${f(r)} 0 ${large} ${sweep} ${f(x2)} ${f(y2)}`;
}

let measurer, defs, pid = 0;
const mcache = new Map();
function measure(text, cls) {
  const key = cls + "|" + text;
  if (mcache.has(key)) return mcache.get(key);
  measurer.setAttribute("class", cls);
  measurer.textContent = text;
  const w = measurer.getComputedTextLength();
  mcache.set(key, w);
  return w;
}

const FN = { P: "Prevent", D: "Detect", R: "Respond" };
const pdr = items => { const c = { P: 0, D: 0, R: 0 }; items.forEach(it => [...(it.f || "")].forEach(k => c[k]++)); return c; };

/* ---------- chips ---------- */
function arcChip(g, cx, cy, r, phi, text, cls, w, pill) {
  const L = w + 2 * (pill ? PILL_PAD : PAD);
  const half = L / 2 / r, cap = CHIP_H / 2 / r;
  let a1 = phi - half + cap, a2 = phi + half - cap;
  if (a2 - a1 < 1e-4) { a1 = phi - 5e-5; a2 = phi + 5e-5; }
  el("path", { d: arcD(cx, cy, r, a1, a2), class: pill ? "pill-bg" : "chip-bg", "stroke-width": CHIP_H }, g);
  const fs = FS[cls];
  const flip = Math.sin(phi) > 0.02;           // keep text upright in the lower half
  const rb = flip ? r + 0.34 * fs : r - 0.34 * fs;
  const span = half + 0.35, id = "tp" + (pid++);
  el("path", { id, d: flip ? arcD(cx, cy, rb, phi + span, phi - span) : arcD(cx, cy, rb, phi - span, phi + span), fill: "none" }, defs);
  const t = el("text", { class: cls, "text-anchor": "middle" }, g);
  const tp = el("textPath", { href: "#" + id, startOffset: "50%" }, t);
  tp.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + id);
  tp.textContent = text;
}
function rectChip(g, x, y, text, cls, w, pill) {
  const L = w + 2 * (pill ? PILL_PAD : PAD);
  el("rect", { x: f(x - L / 2), y: f(y - CHIP_H / 2), width: f(L), height: CHIP_H, rx: CHIP_H / 2, class: pill ? "pill-rect" : "chip-rect" }, g);
  const t = el("text", { x: f(x), y: f(y + 0.34 * FS[cls]), class: cls, "text-anchor": "middle" }, g);
  t.textContent = text;
}
const chipGroup = (parent, layer, kind, idx) =>
  el("g", { class: "chip", "data-layer": layer.n, "data-kind": kind, "data-idx": idx, tabindex: PRINT || OG ? undefined : 0, role: "button",
    "aria-label": layer[kind === "p" ? "protocols" : "security"][idx].n }, parent);

/* Split items, in order, across slots (arc segments) minimising the fullest slot. */
function partition(widths, caps) {
  const n = widths.length, S = caps.length, pre = [0];
  widths.forEach(w => pre.push(pre[pre.length - 1] + w + MINGAP));
  let best = null;
  (function rec(slot, i, cuts, worst) {
    if (best && worst >= best.worst) return;
    if (slot === S - 1) {
      const w = Math.max(worst, (pre[n] - pre[i]) / caps[slot]);
      if (!best || w < best.worst) best = { worst: w, cuts: [...cuts, n] };
      return;
    }
    for (let j = i; j <= n; j++) {
      const ratio = (pre[j] - pre[i]) / caps[slot];
      if (best && ratio >= best.worst) break;
      rec(slot + 1, j, [...cuts, j], Math.max(worst, ratio));
    }
  })(0, 0, [], 0);
  return best;
}

/* ---------- ring layout ---------- */
function layoutRing(g, layer, kind, cx, ri, ro) {
  const cy = G.cy, rMid = (ri + ro) / 2;
  el("circle", { cx, cy, r: rMid, class: "ring", "stroke-width": ro - ri }, g);
  const cls = kind === "p" ? "t-chip-p" : "t-chip-s";
  const items = layer[kind === "p" ? "protocols" : "security"];
  const widths = items.map(it => measure(it.n, cls) + 2 * PAD);
  const label = `${layer.n} · ${layer.name.toUpperCase()}`;
  const lw = measure(label, "t-pill");
  const labelHalf = (lw / 2 + PILL_PAD + 1.1) / rMid;
  const start = -Math.PI / 2 + labelHalf, end = 1.5 * Math.PI - labelHalf;
  const chanA = kind === "p" ? 0 : Math.PI;     // channel faces the other ring set

  for (const radii of [[rMid], [rMid + ROW2, rMid - ROW2]]) {
    const slots = [];
    for (const r of radii) {
      const e = (CH + 0.4) / r;
      slots.push({ r, a: start, b: chanA - e }, { r, a: chanA + e, b: end });
    }
    const part = partition(widths, slots.map(s => (s.b - s.a) * s.r));
    if (part.worst > 0.97 && radii.length === 1) continue;
    if (part.worst > 1) console.warn("Ring overflow", kind, layer.n, part.worst.toFixed(2));
    let from = 0;
    slots.forEach((s, k) => {
      const to = part.cuts[k], ws = widths.slice(from, to);
      const avail = (s.b - s.a) * s.r, gap = (avail - ws.reduce((a, b) => a + b, 0)) / Math.max(1, ws.length);
      let off = gap / 2;
      ws.forEach((w, j) => {
        const i = from + j, phi = s.a + (off + w / 2) / s.r;
        off += w + gap;
        arcChip(chipGroup(g, layer, kind, i), cx, cy, s.r, phi, items[i].n, cls, w - 2 * PAD, false);
      });
      from = to;
    });
    break;
  }
  arcChip(g, cx, cy, rMid, -Math.PI / 2, label, "t-pill", lw, true);
}

function layoutCentre(g, layer, kind, cx) {
  const cy = G.cy, r0 = G.r0;
  el("circle", { cx, cy, r: r0, class: "disc" }, g);
  const cls = kind === "p" ? "t-chip-p" : "t-chip-s";
  const items = layer[kind === "p" ? "protocols" : "security"];
  const widths = items.map(it => measure(it.n, cls) + 2 * PAD);
  const label = `${layer.n} · ${(layer.short || layer.name).toUpperCase()}`;
  const labelY = cy - r0 + 5.0;
  rectChip(g, cx, labelY, label, "t-pill", measure(label, "t-pill"), true);
  const lineH = CHIP_H + 0.9, yTop = labelY + lineH + 0.2, yBot = cy + r0 - 3.0, gapX = 1.0;
  const chord = y => { const dy = Math.abs(y - cy) + CHIP_H / 2; return dy >= r0 ? 0 : 2 * Math.sqrt(r0 * r0 - dy * dy) - 3.6; };
  let plan = null;
  for (let n = 1; n < 14 && !plan; n++) {
    const mid = (yTop + yBot) / 2 + 0.6;
    const ys = Array.from({ length: n }, (_, i) => mid + (i - (n - 1) / 2) * lineH);
    const rows = []; let i = 0;
    for (const y of ys) {
      const cap = chord(y), row = []; let used = 0;
      while (i < items.length && used + widths[i] + (row.length ? gapX : 0) <= cap) { used += widths[i] + (row.length ? gapX : 0); row.push(i); i++; }
      rows.push({ y, row, used });
    }
    if (i === items.length) plan = rows;
  }
  for (const { y, row, used } of plan) {
    let x = cx - used / 2;
    row.forEach(i => {
      const w = widths[i];
      rectChip(chipGroup(g, layer, kind, i), x + w / 2, y, items[i].n, cls, w - 2 * PAD, false);
      x += w + gapX;
    });
  }
}

/* ---------- poster ---------- */
function txt(parent, attrs, s) { const t = el("text", attrs, parent); t.textContent = s; return t; }
function build() {
  svg.textContent = "";
  pid = 0;
  defs = el("defs", {}, svg);
  measurer = el("text", { x: -100, y: -100, visibility: "hidden" }, svg);
  el("rect", { x: 0, y: 0, width: 420, height: 297, class: "bgrect" }, svg);

  txt(svg, { x: 12, y: 17.5, class: "t-title" }, "OSI Model — Protocols & Security Technologies by Layer");
  txt(svg, { x: 12, y: 24.2, class: "t-sub" }, "The seven-layer OSI model (ISO/IEC 7498-1) extended with Layer 0 (hardware, firmware & supply chain) on the outer ring and Layer 8 (people & governance) at the core.");
  txt(svg, { x: 408, y: 14.5, class: "t-meta", "text-anchor": "end" }, "SECURITY ARCHITECTURE REFERENCE");
  txt(svg, { x: 408, y: 19, class: "t-meta", "text-anchor": "end" }, "DEFENCE IN DEPTH · LAYER BY LAYER");
  txt(svg, { x: 408, y: 23.5, class: "t-meta", "text-anchor": "end" }, "OSI.GOVASSURED.COM  ·  v2.0 · OCTOBER 2026");
  el("line", { x1: 12, x2: 408, y1: 29, y2: 29, class: "rule" }, svg);

  for (const kind of ["p", "s"]) {
    const cx = G.cx[kind];
    txt(svg, { x: cx, y: 37.5, class: "t-kick", "text-anchor": "middle" },
      kind === "p" ? "RING SET A  ·  SENDING STACK  ·  WHAT TRAVERSES EACH LAYER" : "RING SET B  ·  RECEIVING STACK  ·  HOW EACH LAYER IS DEFENDED");
    txt(svg, { x: cx, y: 44, class: "t-head", "text-anchor": "middle" }, kind === "p" ? "Protocols & Standards" : "Security Technologies & Controls");
    const set = el("g", { class: "set", "data-set": kind }, svg);
    for (const layer of LAYERS) {
      const g = el("g", { class: "layer", "data-layer": layer.n, style: `--c:${layer.colour}` }, set);
      if (layer.n === 8) layoutCentre(g, layer, kind, cx);
      else { const ri = G.r0 + (7 - layer.n) * ringW; layoutRing(g, layer, kind, cx, ri, ri + ringW); }
    }
    for (let i = 0; i <= RINGS; i++) el("circle", { cx, cy: G.cy, r: G.r0 + i * ringW, class: "sep", "pointer-events": "none" }, set);
  }

  // dataflow channel: sender core → wire → receiver core
  const ch = el("g", { class: "chan-g", "pointer-events": "none" }, svg);
  el("line", { x1: X0, x2: X1, y1: G.cy, y2: G.cy, class: "chan" }, ch);
  const gapMid = (G.cx.p + G.R + G.cx.s - G.R) / 2;
  txt(ch, { x: gapMid, y: G.cy - 2.2, class: "t-wire", "text-anchor": "middle" }, "WIRE");
  txt(ch, { x: gapMid, y: G.cy + 3.4, class: "t-wire", "text-anchor": "middle" }, "BITS");
  for (const dx of [-1.6, 0.2]) el("path", { d: `M${f(gapMid + dx)} ${G.cy - 0.8} l0.9 0.8 l-0.9 0.8`, class: "chev" }, ch);
  el("path", { d: `M${f(X1 - 1.3)} ${G.cy - 0.9} l1 0.9 l-1 0.9`, class: "chev" }, ch);
  flowG = el("g", { id: "flows" }, svg);

  // footer
  el("line", { x1: 12, x2: 408, y1: 254, y2: 254, class: "rule" }, svg);
  txt(svg, { x: 12, y: 260, class: "t-kick" }, "LAYER KEY  ·  DATA UNIT  ·  CONTROLS BY FUNCTION (PREVENT · DETECT · RESPOND)");
  const KEY_W = 276, XL_X = 293;            // layer key width; cross-layer block x
  const keys = [...LAYERS].reverse().map(l => {
    const c = pdr(l.security), line3 = `P${c.P} · D${c.D} · R${c.R}`;
    const nm = l.short || l.name;
    return { l, nm, line3, w: 8.4 + Math.max(measure(nm, "t-key"), measure(l.pdu, "t-keysub"), measure(line3, "t-keysub")) };
  });
  const kgap = (KEY_W - keys.reduce((a, k) => a + k.w, 0)) / (keys.length - 1);
  if (kgap < 1.5) console.warn("Layer key is crowded", kgap.toFixed(2));
  let kx = 12;
  keys.forEach(({ l, nm, line3, w }) => {
    const x = kx, y = 266.5;
    kx += w + kgap;
    const g = el("g", { class: "layer key", "data-layer": l.n, style: `--c:${l.colour}` }, svg);
    el("rect", { x, y: y - 3.7, width: 6.6, height: 6.6, rx: 1.4, class: "pill-rect" }, g);
    txt(g, { x: x + 3.3, y: y + 0.6, class: "t-pill", "text-anchor": "middle" }, l.n);
    txt(g, { x: x + 8.4, y: y - 0.7, class: "t-key" }, nm);
    txt(g, { x: x + 8.4, y: y + 2.9, class: "t-keysub" }, l.pdu);
    txt(g, { x: x + 8.4, y: y + 6.2, class: "t-keysub t-pdr" }, line3);
  });
  txt(svg, { x: XL_X, y: 260, class: "t-kick" }, "CROSS-LAYER CAPABILITIES");
  let x = XL_X, y = 266;
  CROSS_LAYER.forEach((c, i) => {
    const w = measure(c.n, "t-chip-s") + 2 * PAD;
    if (x + w > 408.01) { x = XL_X; y += CHIP_H + 1.0; }
    const g = el("g", { class: "chip xl", "data-kind": "x", "data-idx": i, tabindex: PRINT || OG ? undefined : 0, role: "button", "aria-label": c.n }, svg);
    el("rect", { x: f(x), y: f(y - CHIP_H / 2), width: f(w), height: CHIP_H, rx: CHIP_H / 2, class: "xchip" }, g);
    txt(g, { x: f(x + w / 2), y: f(y + 0.95), class: "t-chip-s", "text-anchor": "middle" }, c.n);
    x += w + 1.1;
  });
  txt(svg, { x: 12, y: 283, class: "t-note" }, "Mapping is indicative: several protocols span layers or sit differently in the TCP/IP model (e.g. TLS spans L4–L7; BGP runs over TCP but is charted at L3 for its routing role).");
  txt(svg, { x: 12, y: 287.5, class: "t-note" }, "Teaching model: ring position does not imply trust — apply Zero Trust at every ring. Controls sit at the layer they primarily act on; P / D / R = prevent, detect, respond.");
  const a = el("a", { href: "https://www.linkedin.com/company/102617034/", target: "_blank", rel: "noopener noreferrer" }, svg);
  txt(a, { x: 408, y: 287.5, class: "t-credit", "text-anchor": "end" }, "GOV Assured · linkedin.com/company/102617034");
  zoomG = el("g", { id: "zoom", "pointer-events": "none", "aria-hidden": "true" }, svg);   // enlarged copy of the hovered label
}

/* ---------- interaction ---------- */
let pinned = null, hovered = null, query = "", zoomG = null, tipChip = null, lastPointer = "mouse", tipMode = null;
function itemOf(node) {
  const k = node.dataset.kind, i = +node.dataset.idx;
  if (k === "x") return { item: CROSS_LAYER[i], kicker: "Cross-layer capability", c: "#8B94A8" };
  const l = byN[node.dataset.layer];
  return { item: l[k === "p" ? "protocols" : "security"][i], kicker: `L${l.n} · ${l.name} · ${KIND[k]}`, c: l.colour };
}
function applyFocus() {
  const n = pinned ?? hovered;
  svg.classList.toggle("focus", n != null && !query);
  svg.querySelectorAll(".layer").forEach(g => g.classList.toggle("on", +g.dataset.layer === n));
}
function setHover(n) { if (hovered === n) return; hovered = n; applyFocus(); if (pinned == null && !query) renderPanel(); }
function select(n) { pinned = (pinned === n ? null : n); applyFocus(); renderPanel(); }
const chipEls = (n, kind, idx) => svg.querySelectorAll(`.chip[data-layer="${n}"][data-kind="${kind}"][data-idx="${idx}"]`);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- readable label tooltip + enlarged hovered label ---------- */
function zoomChip(ch) {
  svg.querySelectorAll(".chip.hl-tip").forEach(c => c.classList.remove("hl-tip"));
  zoomG.textContent = "";
  if (!ch) return;
  ch.classList.add("hl-tip");
  const { c } = itemOf(ch);
  const cl = ch.cloneNode(true);
  ["tabindex", "role", "aria-label"].forEach(a => cl.removeAttribute(a));
  cl.setAttribute("class", "chip zoomed" + (ch.classList.contains("xl") ? " xl" : ""));
  cl.style.setProperty("--c", c);
  const bg = cl.querySelector(".chip-bg");
  if (bg) { const ring = bg.cloneNode(); ring.setAttribute("class", "zoom-ring"); ring.setAttribute("stroke-width", CHIP_H + 0.9); cl.insertBefore(ring, bg); }
  zoomG.appendChild(cl);
}
function placeTipAt(x, y) {
  const pad = 16, r = tip.getBoundingClientRect();
  if (x + pad + r.width > innerWidth - 8) x = x - r.width - pad; else x += pad;
  if (y + pad + r.height > innerHeight - 8) y = y - r.height - pad; else y += pad;
  tip.style.left = Math.max(8, x) + "px"; tip.style.top = Math.max(8, y) + "px";
}
function placeTipNear(ch) {
  const b = ch.getBoundingClientRect(), r = tip.getBoundingClientRect(), gap = 14;
  let x = b.left + b.width / 2 - r.width / 2, y = b.bottom + gap;
  if (y + r.height > innerHeight - 8) y = b.top - r.height - gap;
  x = Math.min(Math.max(8, x), innerWidth - r.width - 8);
  tip.style.left = x + "px"; tip.style.top = Math.max(8, y) + "px";
}
function showTip(ch, mode, e) {
  const { item, kicker, c } = itemOf(ch);
  const dock = mode === "touch" && innerWidth < 760;
  if (tipChip !== ch || tipMode !== mode) {
    tip.style.setProperty("--c", c);
    tip.innerHTML = `<div class="k">${esc(kicker)}</div><div class="n">${esc(item.n)}${fnBadges(item)}</div><div class="d">${esc(item.d)}</div>` +
      (mode === "touch" ? `<div class="h">Tap another label, or tap outside the diagram to close</div>` : "");
    tip.classList.toggle("dock", dock);
    tip.classList.add("show");
    zoomChip(ch);
    tipChip = ch; tipMode = mode;
  }
  if (dock) { tip.style.left = ""; tip.style.top = ""; }
  else if (mode === "mouse" && e) placeTipAt(e.clientX, e.clientY);
  else placeTipNear(ch);
}
function hideTip() { tip.classList.remove("show", "dock"); zoomChip(null); tipChip = null; tipMode = null; }

function wireInteraction() {
  document.addEventListener("pointerdown", e => {
    lastPointer = e.pointerType || "mouse";
    if (tipMode === "touch" && !e.target.closest("#poster")) hideTip();
  }, true);
  svg.addEventListener("mouseover", e => {
    if (lastPointer === "touch") return;            // taps are handled in click
    const lg = e.target.closest(".layer"); setHover(lg ? +lg.dataset.layer : null);
    const ch = e.target.closest(".chip");
    if (ch) showTip(ch, "mouse", e); else if (tipMode === "mouse") hideTip();
  });
  svg.addEventListener("mousemove", e => {
    if (lastPointer === "touch" || tipMode !== "mouse" || !tipChip) return;
    placeTipAt(e.clientX, e.clientY);
  });
  svg.addEventListener("mouseleave", () => { if (lastPointer === "touch") return; setHover(null); if (tipMode === "mouse") hideTip(); });
  svg.addEventListener("focusin", e => {
    const ch = e.target.closest(".chip");
    if (ch && lastPointer !== "touch" && ch.matches(":focus-visible")) { const lg = ch.closest(".layer"); setHover(lg ? +lg.dataset.layer : null); showTip(ch, "focus"); }
  });
  svg.addEventListener("focusout", e => {
    if (tipMode === "focus" && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("#poster .chip"))) { hideTip(); setHover(null); }
  });
  svg.addEventListener("keydown", e => {
    const ch = e.target.closest && e.target.closest(".chip");
    if (!ch || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault(); e.stopPropagation();
    const lg = ch.closest(".layer"); if (lg) select(+lg.dataset.layer);
  });
  addEventListener("scroll", () => { if (tipMode === "touch" && !tip.classList.contains("dock") && tipChip) placeTipNear(tipChip); else if (tipMode === "focus" && tipChip) placeTipNear(tipChip); }, { passive: true });
  addEventListener("resize", () => { if (tipChip) hideTip(); });
  svg.addEventListener("click", e => {
    if (e.target.closest("a")) return;
    const ch = e.target.closest(".chip");
    if (lastPointer === "touch") { if (ch) showTip(ch, "touch"); else hideTip(); }
    const lg = e.target.closest(".layer");
    if (lg) select(+lg.dataset.layer); else { pinned = null; applyFocus(); renderPanel(); }
  });
  panel.addEventListener("click", e => {
    const b = e.target.closest("[data-go]");
    if (b) { const v = b.dataset.go; pinned = v === "all" ? null : +v; hovered = null; applyFocus(); renderPanel(); }
    if (e.target.closest("[data-flow]")) setFlow(!F.on, true);
    const fb = e.target.closest("[data-fn]");
    if (fb) { fnFilter = fb.dataset.fn; applyFnFilter(); renderPanel(); }
  });
  panel.addEventListener("mouseover", e => {
    svg.querySelectorAll(".chip.hl").forEach(c => c.classList.remove("hl"));
    const li = e.target.closest("li[data-kind]");
    if (li) chipEls(li.dataset.layer, li.dataset.kind, li.dataset.idx).forEach(c => c.classList.add("hl"));
  });
  panel.addEventListener("mouseleave", () => svg.querySelectorAll(".chip.hl").forEach(c => c.classList.remove("hl")));

  const qEl = $("q");
  qEl.addEventListener("input", () => {
    query = qEl.value.trim().toLowerCase();
    svg.classList.toggle("searching", !!query);
    svg.querySelectorAll(".chip").forEach(c => {
      if (!query) { c.classList.remove("match"); return; }
      const { item } = itemOf(c);
      c.classList.toggle("match", (item.n + " " + item.d).toLowerCase().includes(query));
    });
    applyFocus(); renderPanel();
  });
  document.addEventListener("keydown", e => {
    if (e.target === qEl) { if (e.key === "Escape") { qEl.value = ""; qEl.dispatchEvent(new Event("input")); qEl.blur(); } return; }
    if (e.target.closest && e.target.closest("input,textarea")) return;
    if (e.key === "Escape") { pinned = null; hovered = null; hideTip(); applyFocus(); renderPanel(); }
    if (/^[0-8]$/.test(e.key)) { pinned = +e.key; applyFocus(); renderPanel(); }
    if (e.key === "/") { e.preventDefault(); qEl.focus(); }
    if (e.key === " " && e.target === document.body) { e.preventDefault(); setFlow(!F.on, true); }
  });
}

const fnBadges = it => it.f ? ` <span class="fnb">${[...it.f].map(k => `<abbr class="fb fb-${k}" title="${FN[k]}">${k}</abbr>`).join("")}</span>` : "";
let fnFilter = "all";
function applyFnFilter() {
  svg.classList.toggle("fnfilter", fnFilter !== "all");
  svg.querySelectorAll('.chip[data-kind="s"], .chip[data-kind="x"]').forEach(c => {
    const { item } = itemOf(c);
    c.classList.toggle("fn-on", fnFilter !== "all" && (item.f || "").includes(fnFilter));
  });
}
function navHTML(active) {
  const fnRow = `<div class="lbl lbl2">Control function</div><div class="fnseg" role="group" aria-label="Filter controls by function">${["all", "P", "D", "R"].map(k => `<button type="button" data-fn="${k}" aria-pressed="${fnFilter === k}">${k === "all" ? "All" : `<abbr class="fb fb-${k}">${k}</abbr>${FN[k]}`}</button>`).join("")}</div>`;
  return `<div class="nav"><div class="lbl">Select a layer · keys 0–8</div><div class="row">
    <button class="all ${active == null ? "on" : ""}" data-go="all" style="--c:var(--ink)">All</button>
    ${[...LAYERS].reverse().map(l => `<button data-go="${l.n}" class="${active === l.n ? "on" : ""}" style="--c:${l.colour}" aria-label="Layer ${l.n} ${l.name}">L${l.n}</button>`).join("")}
  </div>${fnRow}</div>`;
}
function listHTML(l, kind) {
  const items = l[kind === "p" ? "protocols" : "security"];
  return `<ul class="items">${items.map((it, i) => `<li data-layer="${l.n}" data-kind="${kind}" data-idx="${i}" style="--c:${l.colour}" class="${kind === "s" && fnFilter !== "all" && !(it.f || "").includes(fnFilter) ? "fn-dim" : ""}"><b><i></i>${esc(it.n)}${kind === "s" ? fnBadges(it) : ""}</b><span>${esc(it.d)}</span></li>`).join("")}</ul>`;
}
const CREDIT = `<div class="credit">Created by <a href="https://www.linkedin.com/company/102617034/" target="_blank" rel="noopener">GOV Assured</a> — Security Architecture.</div>`;
function covTable() {
  const rows = [...LAYERS].reverse().map(l => { const c = pdr(l.security); return `<tr><th><span class="n" style="--c:${l.colour}">L${l.n}</span>${esc(l.short || l.name)}</th>${["P", "D", "R"].map(k => `<td class="${c[k] ? "" : "zero"}">${c[k]}</td>`).join("")}</tr>`; }).join("");
  return `<table class="covt"><thead><tr><th></th><th><abbr class="fb fb-P">P</abbr></th><th><abbr class="fb fb-D">D</abbr></th><th><abbr class="fb fb-R">R</abbr></th></tr></thead><tbody>${rows}</tbody></table><p class="hint">Most layers are heavy on prevention. Detection and response cluster in a few controls and in the cross-layer capabilities, which is typical and worth challenging.</p>`;
}
function coverage(l) {
  const c = pdr(l.security), max = Math.max(1, c.P, c.D, c.R);
  return `<div class="cov">${["P", "D", "R"].map(k => `<div><abbr class="fb fb-${k}">${k}</abbr><span>${FN[k]}</span><i style="--w:${(c[k] / max) * 100}%"></i><b>${c[k]}</b></div>`).join("")}</div>`;
}
function renderPanel() {
  if (!panel) return;
  if (query) return renderSearch();
  const n = pinned ?? hovered;
  if (n == null) {
    const demo = [...LAYERS].reverse().slice(1, 4).map(l => `<i style="background:${l.colour}"></i>`).join("");
    panel.innerHTML = navHTML(null) + `<div class="pbody">
      <h2>Defence in depth, layer by layer</h2>
      <p>Each ring is one layer of the OSI model, extended with <b>Layer 0</b> (hardware, firmware &amp; supply chain) on the outside and <b>Layer 8</b> (people &amp; governance) at the core. The left set shows what runs at each layer; the right set shows the controls that defend it, tagged <abbr class="fb fb-P">P</abbr> prevent, <abbr class="fb fb-D">D</abbr> detect, <abbr class="fb fb-R">R</abbr> respond.</p>
      <p class="caveat">A teaching model, not a trust model: position on the rings does not confer trust. Phishing and credential theft land straight at Layers 7–8, so apply Zero Trust at every ring.</p>
      <p>Hover a ring to link the two sets, click to pin it, hover any chip for a description. <kbd>Esc</kbd> clears, <kbd>/</kbd> searches.</p>
      <h3>Animated dataflow</h3>
      <p>Packets leave the application at the core of the sending stack and gain a header at every layer on the way out <span class="pk-demo">${demo}<i style="background:var(--payload)"></i></span> (encapsulation). They cross the wire as bits, then the receiving stack inspects and strips each header in turn. <b style="color:var(--bad)">Red</b> packets carry an attack — watch which control stops them.</p>
      <p><button class="btn" type="button" data-flow>${F.on ? "Pause" : "Play"} dataflow</button> <kbd>Space</kbd></p>
      <h3>Layers</h3><div class="legend">${[...LAYERS].reverse().map(l => `<button data-go="${l.n}" style="--c:${l.colour}"><span class="n">L${l.n}</span><span>${l.name}<br><small>${l.pdu}</small></span><small>${l.protocols.length} · ${l.security.length}</small></button>`).join("")}</div>
      <h3>Control coverage by function</h3>${covTable()}
      <h3>Cross-layer capabilities</h3>
      <ul class="items">${CROSS_LAYER.map(c => `<li style="--c:var(--muted)"><b><i></i>${esc(c.n)}${fnBadges(c)}</b><span>${esc(c.d)}</span></li>`).join("")}</ul>
      <h3>Downloads</h3>
      <div class="dl"><a class="btn" href="/OSI-Security-Rings-A3.pdf" download>A3 PDF · dark</a><a class="btn" href="/OSI-Security-Rings-A3-print-light.pdf" download>A3 PDF · light (print)</a></div>
      ${CREDIT}
    </div>`;
    return;
  }
  const l = byN[n], prev = byN[n - 1], next = byN[n + 1];
  const blocked = THREATS.filter(t => t.layer === n);
  panel.innerHTML = navHTML(pinned) + `<div class="pbody" style="--c:${l.colour}">
    <div class="ph"><span class="num">L${l.n}</span><div><h2>${l.name}</h2><div class="pdu">PDU · ${l.pdu}</div></div></div>
    <p class="fn">${esc(l.fn)}</p>
    <h3>Example threats</h3><div class="threats">${l.threats.map(t => `<span>${esc(t)}</span>`).join("")}</div>
    <h3>Protocols & standards <span>${l.protocols.length}</span></h3>${listHTML(l, "p")}
    <h3>Security technologies <span>${l.security.length}</span></h3>${coverage(l)}${listHTML(l, "s")}
    ${blocked.length ? `<h3>Stopped here in the dataflow</h3><ul class="items">${blocked.map(t => `<li data-layer="${n}" data-kind="s" data-idx="${l.security.findIndex(s => s.n === t.control)}" style="--c:var(--bad)"><b><i></i>${esc(t.name)}</b><span>Blocked by ${esc(t.control)}</span></li>`).join("")}</ul>` : ""}
    <div class="pager">${next ? `<button class="btn" data-go="${next.n}">↑ L${next.n} ${next.name}</button>` : "<span></span>"}${prev ? `<button class="btn" data-go="${prev.n}">L${prev.n} ${prev.name} ↓</button>` : ""}</div>
  </div>`;
}
function renderSearch() {
  const res = [];
  for (const l of LAYERS) for (const kind of ["p", "s"]) l[kind === "p" ? "protocols" : "security"].forEach((it, i) => {
    if ((it.n + " " + it.d).toLowerCase().includes(query)) res.push({ l, kind, it, i });
  });
  panel.innerHTML = navHTML(null) + `<div class="pbody"><h3>${res.length} match${res.length === 1 ? "" : "es"} <span>“${esc(query)}”</span></h3>
    <ul class="items">${res.map(r => `<li data-layer="${r.l.n}" data-kind="${r.kind}" data-idx="${r.i}" style="--c:${r.l.colour}"><b><i></i>${esc(r.it.n)}${r.kind === "s" ? fnBadges(r.it) : ""}<em>L${r.l.n} · ${r.kind === "p" ? "protocol" : "control"}</em></b><span>${esc(r.it.d)}</span></li>`).join("")}</ul></div>`;
}

/* ---------- theme ---------- */
const mqLight = window.matchMedia ? matchMedia("(prefers-color-scheme: light)") : { matches: false, addEventListener() {} };
function applyTheme(pref) {
  root.dataset.themePref = pref;
  root.dataset.theme = pref === "auto" ? (mqLight.matches ? "light" : "dark") : pref;
  document.querySelectorAll("#themeSeg [data-set]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.set === pref)));
}
function wireTheme() {
  const seg = $("themeSeg");
  if (!seg) return;
  applyTheme(root.dataset.themePref || "auto");
  seg.addEventListener("click", e => {
    const b = e.target.closest("[data-set]"); if (!b) return;
    store.set("osi-theme", b.dataset.set); applyTheme(b.dataset.set);
  });
  mqLight.addEventListener("change", () => { if (root.dataset.themePref === "auto") applyTheme("auto"); });
}

/* ---------- animated dataflow ---------- */
let flowG = null;
const F = { on: false, pk: [], t: 0, clock: 0, next: 0, raf: 0, delivered: 0, blocked: 0, last: null };
const SPEED = 20;                                    // mm per second along the channel
const rnd = a => a[Math.floor(Math.random() * a.length)];
const bits = () => Array.from({ length: 9 }, () => (Math.random() < 0.5 ? "0" : "1")).join("");
function where(x) {
  const ln = d => d < G.r0 ? 8 : Math.max(0, 7 - Math.floor((d - G.r0) / ringW));
  if (x <= G.cx.p + G.R) return { side: "tx", n: ln(x - G.cx.p) };
  if (x >= G.cx.s - G.R) return { side: "rx", n: ln(G.cx.s - x) };
  return { side: "wire", n: 0 };
}
function paint(p, n) {
  p.g.textContent = "";
  p.bitsEl = null;
  const H = 2.6;
  let w;
  if (n <= 1) {
    p.bitsEl = el("text", { class: "pk-bits", x: 0, y: 0.8, "text-anchor": "end" }, p.g);
    p.bitsEl.textContent = bits();
    w = 12.4;
  } else {
    const parts = [];                                // back → front
    if (n <= 2) parts.push({ w: 0.9, c: byN[2].colour });   // L2 trailer (FCS)
    parts.push({ w: 3.4, pay: true });
    for (let L = 7; L >= n; L--) parts.push({ w: 1.15, c: byN[L].colour });
    let x = 0;
    for (const it of parts.reverse()) {
      x -= it.w;
      el("rect", { x: f(x), y: -H / 2, width: f(it.w - 0.18), height: H, rx: 0.35, class: it.pay ? "pk-pay" : undefined, fill: it.pay ? undefined : it.c }, p.g);
    }
    w = -x;
  }
  const lab = el("text", { class: "pk-label", x: f(-w / 2), y: -H / 2 - 0.65, "text-anchor": "middle", style: `fill:${p.mal ? "var(--bad)" : (n >= 1 ? byN[n].colour : "#9B6BE8")}` }, p.g);
  lab.textContent = PDU(n);
}
function logEvent(kind, head, rest) {
  const list = $("flList"); if (!list) return;
  const li = document.createElement("li");
  li.className = kind;
  li.innerHTML = `<b>${esc(head)}</b>${esc(rest.main)} <span>${esc(rest.sub || "")}</span>`;
  list.prepend(li);
  while (list.children.length > 3) list.lastChild.remove();
  const st = $("flStats"); if (st) st.textContent = `${F.delivered} delivered · ${F.blocked} blocked`;
}
function spawn() {
  const mal = Math.random() < 0.4;
  const p = { x: X0 + 3.6, mal, n: -1, bt: 0, threat: mal ? rnd(THREATS) : null, label: rnd(BENIGN) };
  p.g = el("g", { class: "pk" + (mal ? " mal" : "") }, flowG);
  F.pk.push(p); F.last = p;
}
function block(p) {
  p.dead = true;
  const x = p.x, y = G.cy, t = p.threat;
  p.g.classList.add("dying");
  setTimeout(() => p.g.remove(), 520);
  el("circle", { cx: f(x), cy: y, r: 6, class: "burst" }, flowG).addEventListener("animationend", e => e.target.remove());
  const msg1 = "✕ " + t.name.toUpperCase(), msg2 = "  stopped by " + t.control;
  const bl = el("g", { class: "blk" }, flowG);
  const tw = measure(msg1 + msg2, "blk-m") + 2.6;
  const bx = Math.min(Math.max(x - tw / 2, G.cx.s - G.R + 1), 408 - tw);
  el("rect", { x: f(bx), y: y - 8.9, width: f(tw), height: 3.9, rx: 0.9 }, bl);
  const tt = el("text", { x: f(bx + 1.3), y: y - 6.25 }, bl);
  const s1 = el("tspan", { class: "x" }, tt); s1.textContent = msg1;
  const s2 = el("tspan", {}, tt); s2.textContent = msg2;
  bl.addEventListener("animationend", () => bl.remove());
  const idx = byN[t.layer].security.findIndex(s => s.n === t.control);
  chipEls(t.layer, "s", idx).forEach(c => { c.classList.add("flash"); setTimeout(() => c.classList.remove("flash"), 1600); });
  F.blocked++;
  logEvent("bad", `BLOCKED L${t.layer}`, { main: t.name, sub: "· " + t.control });
}
function deliver(p) {
  p.dead = true; p.g.remove();
  el("circle", { cx: G.cx.s, cy: G.cy, r: G.r0, class: "deliver" }, flowG).addEventListener("animationend", e => e.target.remove());
  F.delivered++;
  logEvent("ok", "DELIVERED", { main: p.label, sub: "· passed all 9 layers" });
}
function tick(ts) {
  if (!F.on) return;
  const dt = F.t ? Math.min(0.05, (ts - F.t) / 1000) : 0;
  F.t = ts; F.clock += dt;
  if (F.clock >= F.next && (!F.last || F.last.dead || F.last.x - X0 > 20)) {
    spawn(); F.next = F.clock + 1.2 + Math.random() * 1.0;
  }
  for (const p of F.pk) {
    if (p.dead) continue;
    p.x += SPEED * dt;
    const w = where(p.x), n = w.side === "wire" ? 0 : w.n;
    if (n !== p.n) { p.n = n; paint(p, n); }
    if (p.bitsEl && F.clock - p.bt > 0.09) { p.bt = F.clock; p.bitsEl.textContent = bits(); }
    p.g.setAttribute("transform", `translate(${f(p.x)} ${G.cy})`);
    if (p.mal && w.side === "rx" && n >= p.threat.layer) block(p);
    else if (p.x >= X1) deliver(p);
  }
  F.pk = F.pk.filter(p => !p.dead);
  F.raf = requestAnimationFrame(tick);
}
function setFlow(on, remember) {
  F.on = on;
  const btn = $("flowBtn"); if (btn) btn.setAttribute("aria-pressed", String(on));
  const log = $("flowlog"); if (log) log.classList.toggle("show", on);
  if (remember) store.set("osi-flow", on ? "on" : "off");
  cancelAnimationFrame(F.raf);
  if (on) { F.t = 0; F.raf = requestAnimationFrame(tick); }
  else { F.pk.forEach(p => p.g.remove()); F.pk = []; F.last = null; }
  const pb = panel && panel.querySelector("[data-flow]"); if (pb) pb.textContent = (on ? "Pause" : "Play") + " dataflow";
}
function wireFlow() {
  const btn = $("flowBtn");
  if (btn) btn.addEventListener("click", () => setFlow(!F.on, true));
  document.addEventListener("visibilitychange", () => {
    if (!F.on) return;
    cancelAnimationFrame(F.raf);
    if (!document.hidden) { F.t = 0; F.raf = requestAnimationFrame(tick); }
  });
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saved = store.get("osi-flow");
  const start = OG || (!PRINT && (saved ? saved === "on" : !reduce));
  setFlow(start, false);
}

/* ---------- boot ---------- */
const loads = ["400", "500", "600", "700"].map(w => document.fonts.load(`${w} 12px "Space Grotesk"`))
  .concat(["400", "500", "600"].map(w => document.fonts.load(`${w} 12px "IBM Plex Mono"`)));
Promise.all(loads).catch(() => {}).then(() => document.fonts.ready).then(() => {
  build();
  wireTheme();
  if (panel) { wireInteraction(); renderPanel(); }
  wireFlow();
  window.__ready = true;
});
})();
