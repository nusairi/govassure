/* GOV Assured — first-use glossary tooltips on govmap pages. No library. */
(function () {
  "use strict";
  if (document.querySelector(".gm-glossary")) return;

  var TERMS = [], PATS = [], used = {}, tip, tipBody, tipLink, openEl = null, hideTimer = 0, scanning = false;

  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }
  function normApos(s) { return String(s || "").replace(/[\u2018\u2019]/g, "'"); }
  function isSkipped(el) {
    while (el && el.nodeType === 1) {
      var tag = el.tagName;
      if (/^(A|BUTTON|H1|H2|H3|H4|H5|H6|INPUT|TEXTAREA|SELECT|OPTION|LABEL|CANVAS|SVG|SCRIPT|STYLE|NOSCRIPT|CODE|TITLE)$/.test(tag)) return true;
      if (el.id === "gm-canvas" || el.id === "gm-az" || el.id === "gm-gterm-tip") return true;
      if (el.getAttribute("role") === "tooltip") return true;
      if (el.classList && (el.classList.contains("gm-gterm") || el.classList.contains("gm-tabs") || el.classList.contains("gm-bud-del"))) return true;
      el = el.parentElement;
    }
    return false;
  }
  function root() {
    return document.getElementById("govmap") || document.querySelector("main") || document.body;
  }

  function compile(list) {
    TERMS = list || [];
    var raw = [];
    TERMS.forEach(function (t) {
      (t.patterns || []).forEach(function (p) {
        if (!p || !p.t) return;
        raw.push({ id: t.id, term: t.term, def: t.def, t: p.t, s: !!p.s, n: p.t.length });
      });
    });
    raw.sort(function (a, b) { return b.n - a.n || a.id.localeCompare(b.id); });
    PATS = raw.map(function (p) {
      var src = normApos(p.t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['\\u2018\\u2019]");
      var flags = p.s ? "g" : "gi";
      var re = new RegExp("(^|[^A-Za-z0-9&\\-])(" + src + ")(?![A-Za-z0-9&\\-])", flags);
      return { id: p.id, term: p.term, def: p.def, re: re };
    });
  }

  function wrap(term, text) {
    var b = make("button", "gm-gterm", text);
    b.type = "button";
    b.setAttribute("data-term", term.id);
    b.setAttribute("aria-describedby", "gm-gterm-tip");
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-label", text + ", glossary term");
    b.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "touch") return;
      show(b, false);
    });
    b.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      scheduleHide();
    });
    b.addEventListener("focus", function () { show(b, false); });
    b.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (openEl === b && tip && !tip.hidden && tip._sticky) hide();
      else show(b, true);
    });
    return b;
  }

  function markNode(node) {
    if (!node || node.nodeType !== 3) return;
    if (isSkipped(node.parentElement)) return;
    var text = node.nodeValue;
    if (!text || !/[A-Za-z]/.test(text)) return;
    var probe = normApos(text);
    var best = null;
    for (var i = 0; i < PATS.length; i++) {
      var p = PATS[i];
      if (used[p.id]) continue;
      p.re.lastIndex = 0;
      var m = p.re.exec(probe);
      if (m && (best == null || m.index < best.index || (m.index === best.index && m[2].length > best.len))) {
        best = { p: p, index: m.index, pre: m[1].length, len: m[2].length, at: m.index + m[1].length };
      }
    }
    if (!best) return;
    var start = best.at, end = start + best.len;
    var before = text.slice(0, start), hit = text.slice(start, end), after = text.slice(end);
    var parent = node.parentNode;
    if (before) parent.insertBefore(document.createTextNode(before), node);
    var btn = wrap(best.p, hit);
    parent.insertBefore(btn, node);
    if (after) {
      var rest = document.createTextNode(after);
      parent.insertBefore(rest, node);
      parent.removeChild(node);
      used[best.p.id] = 1;
      markNode(rest);
      return;
    }
    parent.removeChild(node);
    used[best.p.id] = 1;
  }

  function walk(el) {
    if (!el || isSkipped(el)) return;
    var n = el.firstChild;
    while (n) {
      var next = n.nextSibling;
      if (n.nodeType === 3) markNode(n);
      else if (n.nodeType === 1 && !isSkipped(n)) walk(n);
      n = next;
    }
  }

  function scan() {
    if (!PATS.length || scanning) return;
    scanning = true;
    try {
      var live = {}, r = root();
      if (!r) return;
      var marks = r.querySelectorAll(".gm-gterm");
      for (var i = 0; i < marks.length; i++) {
        var id = marks[i].getAttribute("data-term");
        if (id) live[id] = 1;
      }
      used = live;
      walk(r);
    } finally { scanning = false; }
  }

  function ensureTip() {
    if (tip) return;
    tip = make("div", "gm-gterm-tip");
    tip.id = "gm-gterm-tip";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    var h = make("p", "gm-gterm-tip-h");
    tipBody = make("p", "gm-gterm-tip-d");
    tipLink = make("a", "gm-gterm-more", "More in glossary");
    tip.appendChild(h);
    tip.appendChild(tipBody);
    tip.appendChild(tipLink);
    tip.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    tip.addEventListener("mouseleave", scheduleHide);
    document.body.appendChild(tip);
    tip._h = h;
  }

  function place(anchor) {
    var r = anchor.getBoundingClientRect();
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var margin = 8;
    var left = r.left;
    if (left + tw > window.innerWidth - margin) left = window.innerWidth - tw - margin;
    if (left < margin) left = margin;
    var top = r.bottom + 8;
    if (top + th > window.innerHeight - margin) {
      top = r.top - th - 8;
      if (top < margin) top = margin;
    }
    tip.style.left = Math.round(left) + "px";
    tip.style.top = Math.round(top) + "px";
  }

  function show(btn, sticky) {
    if (!btn) return;
    ensureTip();
    clearTimeout(hideTimer);
    if (openEl && openEl !== btn) openEl.setAttribute("aria-expanded", "false");
    var id = btn.getAttribute("data-term");
    var term = null;
    TERMS.forEach(function (t) { if (t.id === id) term = t; });
    if (!term) return;
    tip._h.textContent = term.term + (term.short ? " (" + term.short + ")" : "");
    tipBody.textContent = term.def || "";
    tipLink.href = "/govmap/glossary/#" + encodeURIComponent(term.id);
    tipLink.removeAttribute("target");
    tip.hidden = false;
    openEl = btn;
    btn.setAttribute("aria-expanded", "true");
    place(btn);
    tip._sticky = !!sticky;
  }

  function hide() {
    clearTimeout(hideTimer);
    if (openEl) openEl.setAttribute("aria-expanded", "false");
    openEl = null;
    if (tip) tip.hidden = true;
  }
  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 200);
  }

  function onDoc(e) {
    if (!openEl || !tip || tip.hidden) return;
    if (e.type === "keydown" && e.key === "Escape") { hide(); return; }
    if (e.type === "pointerdown") {
      if (tip.contains(e.target) || (openEl && openEl.contains(e.target))) return;
      hide();
    }
  }

  document.addEventListener("keydown", onDoc);
  document.addEventListener("pointerdown", onDoc, true);
  window.addEventListener("resize", function () { if (openEl && tip && !tip.hidden) place(openEl); });
  window.addEventListener("scroll", function () { if (openEl && tip && !tip.hidden) place(openEl); }, true);

  wScan.scan = scan;
  function wScan() { scan(); }

  window.GovmapTerms = { scan: scan, hide: hide };

  fetch("/data/govmap-terms.json", { credentials: "same-origin" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      if (!d || !Array.isArray(d.terms)) throw new Error("bad terms");
      compile(d.terms);
      scan();
      if (window.MutationObserver) {
        var mo = new MutationObserver(function () {
          if (scanning) return;
          clearTimeout(wScan._t);
          wScan._t = setTimeout(scan, 80);
        });
        var r = root();
        if (r) mo.observe(r, { childList: true, subtree: true });
      }
    })
    .catch(function () { /* pages still work without tooltips */ });
})();
