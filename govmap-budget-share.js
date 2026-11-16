/* GOV Assured — look up a department's PESA Total DEL share from /data/budget.json. */
(function (w) {
  "use strict";
  var data = null, waiters = [], BIST = "department-for-business-innovation-science-and-trade";

  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }
  function pct(share) {
    if (share == null || !isFinite(share)) return null;
    return (share * 100).toFixed(2) + "%";
  }
  function pounds(million) {
    if (million == null || !isFinite(million)) return null;
    var sign = million < 0 ? "\u2212" : "";
    var abs = Math.abs(million);
    if (abs >= 1000) return sign + "\u00a3" + (abs / 1000).toFixed(1) + "bn";
    return sign + "\u00a3" + abs.toLocaleString("en-GB") + "m";
  }
  function yearOf() { return (data && data.year) || "2026-27"; }
  function shareOf(g) {
    if (!g) return null;
    if (g.shareOfTotalDel != null) return g.shareOfTotalDel;
    var tot = data && data.total && data.total.plansMillion;
    if (!tot || g.plansMillion == null) return null;
    return g.plansMillion / tot;
  }
  function rec(mode, g, extra) {
    var r = {
      mode: mode,
      year: yearOf(),
      percent: g ? pct(shareOf(g)) : null,
      amount: g ? pounds(g.plansMillion) : null,
      pesaName: g && g.pesaName,
      note: extra || (g && g.note) || null
    };
    return r;
  }
  function forSlug(slug) {
    if (!data || data.failed || !slug) return null;
    if (slug === "ministry-of-housing-communities-local-government" && data.combined) {
      return rec("combined", data.combined, "combined total of two PESA lines");
    }
    var groups = data.groups || [];
    if (slug === BIST) {
      var bt = null;
      groups.forEach(function (g) { if (g.pesaName === "Business and Trade") bt = g; });
      if (bt) return rec("old-name", bt, "PESA still uses the name Business and Trade");
    }
    var hits = [];
    groups.forEach(function (g) { if (g.slug === slug) hits.push(g); });
    if (hits.length === 1) return rec("line", hits[0], null);
    var miss = data.missingLines || {};
    var sib = miss.smallAndIndependentBodies || [];
    var none = miss.noSeparateFigure || [];
    if (sib.indexOf(slug) >= 0) return rec("sib", null, null);
    if (none.indexOf(slug) >= 0) return rec("no-line", null, null);
    return rec("missing", null, null);
  }
  function text(slug) {
    var r = forSlug(slug);
    if (!r) return "";
    if (r.mode === "sib") return "Budget: included in the Treasury's 'small and independent bodies' total, no separate figure";
    if (r.mode === "no-line" || r.mode === "missing" || !r.percent || !r.amount) return "Budget: no separate Treasury figure";
    var s = "Budget: " + r.percent + " of Total DEL (" + r.amount + "), " + r.year;
    if (r.mode === "combined") s += ", " + r.note;
    else if (r.mode === "old-name") s += ". " + r.note + ".";
    return s;
  }
  function fill(el, slug, opts) {
    if (!el) return;
    opts = opts || {};
    if (opts.cls) el.className = opts.cls;
    el.setAttribute("data-budget-slug", slug || "");
    if (opts.plain) el.setAttribute("data-budget-plain", "1");
    var r = forSlug(slug);
    el.textContent = "";
    if (!data || data.failed) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    if (!r || r.mode === "sib" || r.mode === "no-line" || r.mode === "missing" || !r.percent || !r.amount) {
      if (r && r.mode === "sib" && !opts.plain && el.getAttribute("data-budget-plain") !== "1") {
        el.appendChild(document.createTextNode("Budget: included in the Treasury's '"));
        var sib = make("a", "gm-bud-del", "small and independent bodies");
        sib.href = "/govmap/glossary/#small-and-independent-bodies";
        el.appendChild(sib);
        el.appendChild(document.createTextNode("' total, no separate figure"));
      } else {
        el.appendChild(document.createTextNode(text(slug)));
      }
      return;
    }
    if (opts.plain || el.getAttribute("data-budget-plain") === "1") {
      el.appendChild(document.createTextNode(text(slug)));
      return;
    }
    el.appendChild(document.createTextNode("Budget: " + r.percent + " of "));
    var a = make("a", "gm-bud-del", "Total DEL");
    a.href = "/govmap/glossary/#total-del";
    el.appendChild(a);
    el.appendChild(document.createTextNode(" (" + r.amount + "), " + r.year));
    if (r.mode === "combined") el.appendChild(document.createTextNode(", " + r.note));
    else if (r.mode === "old-name") el.appendChild(document.createTextNode(". " + r.note + "."));
  }
  function attach(el, slug, opts) {
    if (!el) return el;
    fill(el, slug, opts);
    return el;
  }
  function line(slug, opts) {
    opts = opts || {};
    var el = make("span", opts.cls || "gm-bud-line");
    attach(el, slug, opts);
    return el;
  }
  function whenReady(fn) {
    if (data) fn();
    else waiters.push(fn);
  }
  function refresh() {
    var nodes = document.querySelectorAll("[data-budget-slug]");
    for (var i = 0; i < nodes.length; i++) fill(nodes[i], nodes[i].getAttribute("data-budget-slug"));
    waiters.forEach(function (fn) { try { fn(); } catch (e) {} });
    waiters = [];
  }

  w.GovmapBudget = {
    ready: function (fn) { whenReady(fn); },
    forSlug: forSlug,
    text: text,
    fill: fill,
    attach: attach,
    line: line,
    loaded: function () { return !!data; }
  };

  fetch("/data/budget.json", { credentials: "same-origin" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      if (!d || !d.total || !Array.isArray(d.groups)) throw new Error("bad budget data");
      data = d;
      refresh();
    })
    .catch(function () { data = { year: "2026-27", total: {}, groups: [], failed: true }; refresh(); });
})(window);
