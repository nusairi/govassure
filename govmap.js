/* GOV Assured — UK government map. Data: /data/govmap.json (GOV.UK, OGL v3.0).
   Hybrid view: overview of department cards -> department view (connector-line tree,
   optional diagram) -> search results with paths. All text via textContent; external
   links are only https www.gov.uk (from data). */
(function () {
  "use strict";

  var DATA_URL = "/data/govmap.json";
  var GOVUK_HOST = "www.gov.uk";
  var LICENCE_HOST = "www.nationalarchives.gov.uk";
  var GLOSSARY = "/govmap/glossary/";
  // SVG namespace taken from the inline icons already on the page (keeps web-link checks simple)
  var SVGNS = (document.querySelector("svg") || {}).namespaceURI || "";
  var TYPE_ANCHOR = {
    ministerial: "ministerial-department", nmd: "non-ministerial-department", ea: "executive-agency",
    endpb: "executive-ndpb", andpb: "advisory-ndpb", tribunal: "tribunal", pc: "public-corporation",
    sha: "special-health-authority", imb: "independent-monitoring-body", adhoc: "ad-hoc-advisory-group",
    office: "executive-office", cs: "other-public-body", other: "other-public-body", sub: "sub-organisation",
    devolved: "devolved-government"
  };
  var KIND_ANCHOR = { min: "ministerial-department", nmd: "non-ministerial-department", dev: "devolved-government", none: "not-attached" };
  var COLOR = {
    ministerial: "#f0c987", nmd: "#e8a35c", ea: "#6fd3b0", endpb: "#7fb8ff", andpb: "#c59cff",
    tribunal: "#ff8a80", pc: "#ffd166", sha: "#9be564", imb: "#4dd0e1", adhoc: "#f78fb3",
    office: "#ffffff", cs: "#b0bec5", other: "#a3b8ad", sub: "#5fa08a", devolved: "#d2c8b4"
  };
  var SCOPES = [
    { k: "all", l: "All" },
    { k: "min", l: "Ministerial" },
    { k: "nmd", l: "Non-ministerial" },
    { k: "dev", l: "Devolved governments" },
    { k: "none", l: "Not attached" }
  ];
  var GROUPS = ["min", "nmd", "dev", "none"];
  var KIND_LABEL = { min: "Ministerial department", nmd: "Non-ministerial department", dev: "Devolved government", none: "Not attached to a department" };
  var GROUP_LABEL = { min: "Ministerial departments", nmd: "Non-ministerial departments", dev: "Devolved governments", none: "Not attached to a department" };
  var PARAM_SCOPE = { ministerial: "min", "non-ministerial": "nmd", devolved: "dev", "not-attached": "none", all: "all" };
  var SCOPE_PARAM = { min: "ministerial", nmd: "non-ministerial", dev: "devolved", none: "not-attached" };
  var SEARCH_LIMIT = 60;
  var PARLIAMENT_UNATTACHED = {
    "public-service-ombudsman": { id: "phso", label: "Accountable to Parliament" },
    "the-electoral-commission": { id: "electoral-commission", label: "Accountable to Parliament" },
    "independent-parliamentary-standards-authority": { id: "ipsa", label: "Accountable to Parliament" }
  };

  var el = {
    stats: document.getElementById("gm-stats"),
    form: document.getElementById("gm-form"),
    search: document.getElementById("gm-search"),
    scope: document.getElementById("gm-scope"),
    types: document.getElementById("gm-types"),
    count: document.getElementById("gm-count"),
    view: document.getElementById("gm-tree"),
    credit: document.getElementById("gm-credit"),
    expand: document.getElementById("gm-expand"),
    collapse: document.getElementById("gm-collapse"),
    toggle: document.getElementById("gm-filter-toggle"),
    panel: document.getElementById("gm-filter-panel"),
    badge: document.getElementById("gm-filter-badge"),
    clear: document.getElementById("gm-clear")
  };
  var data = null;
  var typeLabel = {};
  var order = [];
  var depts = [];
  var bySlug = {};
  var byName = {};
  var state = { q: "", scope: "all", type: "all", expand: false, dept: "", org: "", view: "list", sort: "size", all: false };
  var reduceMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var wide = window.matchMedia ? window.matchMedia("(min-width: 900px)") : { matches: true };
  var lastDiagramW = 0;
  var baseTitle = document.title;
  var timer = null;

  /* ---------- helpers ---------- */
  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function safeUrl(u, host) {
    if (typeof u !== "string") return null;
    try {
      var p = new URL(u);
      if (p.protocol !== "https:" || p.hostname !== host || p.username || p.password || p.port) return null;
      return p.href;
    } catch (e) {
      return null;
    }
  }
  function slugOf(u) {
    var s = safeUrl(u, GOVUK_HOST);
    if (!s) return "";
    var m = /\/government\/organisations\/([a-z0-9-]+)\/?$/.exec(new URL(s).pathname);
    return m ? m[1] : "";
  }
  function parliamentFlag(u) {
    var meta = PARLIAMENT_UNATTACHED[slugOf(u)];
    if (!meta) return null;
    var a = make("a", "gm-parl-flag", meta.label);
    a.href = "/govmap/parliament/#" + meta.id;
    a.title = "This body is accountable to Parliament, not to a minister. It is the same organisation as on the Accountable to Parliament page, not a second body.";
    return a;
  }
  function norm(s) {
    return String(s || "").toLowerCase().replace(/&/g, "and").replace(/[’']/g, "").replace(/\s+/g, " ").trim();
  }
  function appendMarked(parent, text, q) {
    text = String(text || "");
    var i = q ? text.toLowerCase().indexOf(q) : -1;
    if (i < 0) { parent.appendChild(document.createTextNode(text)); return; }
    parent.appendChild(document.createTextNode(text.slice(0, i)));
    parent.appendChild(make("mark", null, text.slice(i, i + q.length)));
    parent.appendChild(document.createTextNode(text.slice(i + q.length)));
  }
  function matches(n, ab, q) {
    return !q || norm(n).indexOf(q) >= 0 || (!!ab && norm(ab).indexOf(q) >= 0);
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function dot(k) {
    var s = make("span", "gm-dot gm-bg-" + (COLOR[k] ? k : "other"));
    s.setAttribute("aria-hidden", "true");
    return s;
  }
  function extLink(url, text, label, cls) {
    var safe = safeUrl(url, GOVUK_HOST);
    if (!safe) return null;
    var a = make("a", cls || "gm-link");
    a.href = safe;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.appendChild(document.createTextNode(text));
    a.appendChild(make("span", "visually-hidden", " " + label + " (opens in a new tab)"));
    a.appendChild(make("span", "gm-ext", " \u2197")).setAttribute("aria-hidden", "true");
    return a;
  }
  function whatLink(k) {
    if (!TYPE_ANCHOR[k]) return null;
    var label = typeLabel[k] || k;
    var a = make("a", "gm-what", "?");
    a.href = GLOSSARY + "#" + TYPE_ANCHOR[k];
    a.title = "What is " + label.toLowerCase() + "? (glossary)";
    a.setAttribute("aria-label", "What does " + label + " mean? Glossary");
    return a;
  }
  function deptTotal(d) {
    var n = 0;
    Object.keys(d.r.g || {}).forEach(function (k) { n += d.r.g[k].length; });
    return n;
  }
  function inScope(d) { return state.scope === "all" || state.scope === d.r.k; }

  /* ---------- URL + navigation ---------- */
  function paramsFor(s) {
    var parts = [];
    if (s.dept) {
      parts.push("dept=" + encodeURIComponent(s.dept));
      if (s.org) parts.push("org=" + encodeURIComponent(s.org));
      if (s.view === "diagram") parts.push("view=diagram");
      return parts;
    }
    if (s.scope !== "all") parts.push("show=" + SCOPE_PARAM[s.scope]);
    if (s.type !== "all") parts.push("type=" + encodeURIComponent(s.type));
    if (s.expand) parts.push("expand=1");
    return parts;
  }
  function hrefFor(s) {
    var parts = paramsFor(s);
    return window.location.pathname + (parts.length ? "?" + parts.join("&") : "");
  }
  function deptHref(slug, org) {
    return hrefFor({ dept: slug, org: org || "", view: "list" });
  }
  function writeUrl(push) {
    if (!window.history || !window.history.replaceState) return;
    var url = hrefFor(state);
    try {
      if (push && url !== window.location.pathname + window.location.search) window.history.pushState({ q: state.q }, "", url);
      else window.history.replaceState({ q: state.q }, "", url + window.location.hash);
    } catch (e) { /* ignore */ }
  }
  function readUrl() {
    var p;
    try { p = new URLSearchParams(window.location.search); } catch (e) { p = { get: function () { return null; } }; }
    state.scope = PARAM_SCOPE[(p.get("show") || "").toLowerCase()] || "all";
    var type = (p.get("type") || "").toLowerCase();
    state.type = type && typeLabel[type] && ((data.counts || {}).byType || {})[type] ? type : "all";
    state.expand = p.get("expand") === "1";
    var dept = (p.get("dept") || "").toLowerCase();
    if (!bySlug[dept]) {
      var alias = depts.filter(function (d) { return d.r.ab && norm(d.r.ab) === norm(dept); })[0];
      dept = alias ? alias.slug : "";
    }
    state.dept = dept;
    state.org = dept ? (p.get("org") || "").toLowerCase().replace(/[^a-z0-9-]/g, "") : "";
    state.view = dept && p.get("view") === "diagram" ? "diagram" : "list";
    state.all = false;
  }
  function go(s, opts) {
    try { window.history.replaceState({ q: state.q }, "", window.location.href); } catch (e) { /* ignore */ }
    Object.keys(s).forEach(function (k) { state[k] = s[k]; });
    if (state.dept) { state.q = ""; if (el.search) el.search.value = ""; }
    syncFilters(false);
    writeUrl(true);
    render();
    if (!opts || opts.scroll !== false) afterNav();
  }
  function afterNav() {
    var hl = el.view.querySelector(".gm-hl");
    if (hl) {
      hl.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      try { hl.focus({ preventScroll: true }); } catch (e) { hl.focus(); }
      return;
    }
    var top = el.view.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      (document.getElementById("gm-count") || el.view).scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    }
    var h = el.view.querySelector(".gm-dv-h");
    if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }
  // same-page links (cards, results, breadcrumbs, "also under") use history instead of a reload
  function onNavClick(e) {
    var a = e.target.closest ? e.target.closest("a[data-nav]") : null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    var u = new URL(a.href, window.location.href);
    var p = u.searchParams;
    var dept = p.get("dept") || "";
    if (dept) {
      go({ dept: dept, org: p.get("org") || "", view: p.get("view") === "diagram" ? "diagram" : "list" });
    } else {
      go({ dept: "", org: "", scope: PARAM_SCOPE[p.get("show") || ""] || "all", type: p.get("type") || "all", expand: p.get("expand") === "1", q: "" });
      if (el.search) el.search.value = "";
    }
  }

  /* ---------- connector-line tree (WAI-ARIA tree pattern) ---------- */
  function rowLinks(li) {
    var row = li.firstElementChild;
    return row ? row.querySelectorAll("a") : [];
  }
  function setActive(tree, li, focus) {
    var prev = tree._active;
    if (prev && prev !== li) {
      prev.tabIndex = -1;
      Array.prototype.forEach.call(rowLinks(prev), function (a) { a.tabIndex = -1; });
    }
    tree._active = li;
    li.tabIndex = 0;
    Array.prototype.forEach.call(rowLinks(li), function (a) { a.tabIndex = 0; });
    if (focus) li.focus();
  }
  function visibleItems(tree) {
    var out = [];
    (function walk(ul) {
      for (var c = ul.firstElementChild; c; c = c.nextElementSibling) {
        if (c.getAttribute("role") !== "treeitem") continue;
        out.push(c);
        if (c.getAttribute("aria-expanded") === "true") {
          var g = c.querySelector(":scope > ul");
          if (g) walk(g);
        }
      }
    })(tree);
    return out;
  }
  function setExpanded(li, v, animate) {
    if (!li.hasAttribute("aria-expanded")) return;
    li.setAttribute("aria-expanded", v ? "true" : "false");
    var g = li.querySelector(":scope > ul");
    if (!g) return;
    g.hidden = !v;
    if (v && animate && !reduceMotion.matches) {
      g.classList.remove("gm-ti-anim");
      void g.offsetWidth;
      g.classList.add("gm-ti-anim");
    }
  }
  function parentItem(li) {
    var g = li.parentElement;
    return g && g.getAttribute("role") === "group" ? g.parentElement : null;
  }
  function initTree(tree) {
    var buf = "", bufTimer = null;
    var first = tree.querySelector(".gm-hl") || tree.querySelector("[role=treeitem]");
    if (first) setActive(tree, first, false);
    tree.addEventListener("focusin", function (e) {
      var li = e.target.closest("[role=treeitem]");
      if (li && tree.contains(li) && li !== tree._active) setActive(tree, li, false);
    });
    tree.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      var li = e.target.closest("[role=treeitem]");
      if (!li || !tree.contains(li)) return;
      var row = li.firstElementChild;
      if (!row.contains(e.target)) return;
      setActive(tree, li, true);
      if (li.hasAttribute("aria-expanded")) setExpanded(li, li.getAttribute("aria-expanded") !== "true", true);
    });
    tree.addEventListener("keydown", function (e) {
      var li = e.target.closest("[role=treeitem]");
      if (!li || !tree.contains(li)) return;
      var onItem = e.target === li;
      var items = visibleItems(tree);
      var i = items.indexOf(li);
      var k = e.key;
      var handled = true;
      if (k === "ArrowDown") { if (items[i + 1]) setActive(tree, items[i + 1], true); }
      else if (k === "ArrowUp") { if (i > 0) setActive(tree, items[i - 1], true); }
      else if (k === "Home") { setActive(tree, items[0], true); }
      else if (k === "End") { setActive(tree, items[items.length - 1], true); }
      else if (k === "ArrowRight") {
        if (li.getAttribute("aria-expanded") === "false") setExpanded(li, true, true);
        else if (li.getAttribute("aria-expanded") === "true" && items[i + 1] && parentItem(items[i + 1]) === li) setActive(tree, items[i + 1], true);
      } else if (k === "ArrowLeft") {
        if (li.getAttribute("aria-expanded") === "true") { setExpanded(li, false, true); if (!onItem) li.focus(); }
        else { var p = parentItem(li); if (p) setActive(tree, p, true); }
      } else if ((k === "Enter" || k === " ") && onItem) {
        if (li.hasAttribute("aria-expanded")) setExpanded(li, li.getAttribute("aria-expanded") !== "true", true);
        else { var a = rowLinks(li)[0]; if (a && k === "Enter") a.click(); }
      } else if (k === "*" ) {
        var pg = li.parentElement;
        for (var c = pg.firstElementChild; c; c = c.nextElementSibling) if (c.getAttribute("role") === "treeitem") setExpanded(c, true, true);
      } else if (k.length === 1 && /\S/.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        clearTimeout(bufTimer);
        buf += k.toLowerCase();
        bufTimer = setTimeout(function () { buf = ""; }, 600);
        var n = items.length;
        var start = buf.length === 1 ? i + 1 : i;
        for (var j = 0; j < n; j++) {
          var cand = items[(start + j) % n];
          if ((cand.getAttribute("data-label") || "").toLowerCase().indexOf(buf) === 0) { setActive(tree, cand, true); break; }
        }
      } else handled = false;
      if (handled && (onItem || /^Arrow|Home|End/.test(k))) e.preventDefault();
    });
  }
  function treeItem(level, label, row, expandable) {
    var li = make("li", "gm-ti");
    li.setAttribute("role", "treeitem");
    li.setAttribute("aria-level", String(level));
    li.setAttribute("data-label", label);
    li.tabIndex = -1;
    li.appendChild(row);
    if (expandable) {
      li.setAttribute("aria-expanded", "true");
      var ul = make("ul", "gm-ti-group");
      ul.setAttribute("role", "group");
      li.appendChild(ul);
    }
    return li;
  }
  function noTab(node) {
    Array.prototype.forEach.call(node.querySelectorAll("a"), function (a) { a.tabIndex = -1; });
    return node;
  }

  function bodyRow(b, k, d, q, nestedUnder, viaVisible) {
    var row = make("div", "gm-ti-row gm-ti-body");
    row.appendChild(make("span", "gm-ti-tw")).setAttribute("aria-hidden", "true");
    row.appendChild(dot(k));
    var main = make("span", "gm-ti-main");
    var safe = safeUrl(b.u, GOVUK_HOST);
    var name = make(safe ? "a" : "span", "gm-ti-name");
    if (safe) { name.href = safe; name.target = "_blank"; name.rel = "noopener noreferrer"; }
    appendMarked(name, b.n, q);
    if (safe) {
      name.appendChild(make("span", "visually-hidden", ", " + (typeLabel[k] || "") + " (GOV.UK page, opens in a new tab)"));
      name.appendChild(make("span", "gm-ext", " \u2197")).setAttribute("aria-hidden", "true");
    }
    main.appendChild(name);
    if (b.ab && norm(b.ab) !== norm(b.n)) {
      var ab = make("span", "gm-ab");
      appendMarked(ab, b.ab, q);
      main.appendChild(ab);
    }
    var pflag = parliamentFlag(b.u);
    if (pflag) main.appendChild(pflag);
    if (nestedUnder && nestedUnder !== k) main.appendChild(make("span", "gm-tag", typeLabel[k] || ""));
    if (b.own) main.appendChild(make("span", "gm-mark gm-own", "Own website"));
    if (b.via && !viaVisible) main.appendChild(make("span", "gm-note", "Part of " + b.via));
    if (b.also && b.also.length) {
      main.appendChild(make("span", "gm-mark gm-shared", "Shared"));
      var also = make("span", "gm-note gm-also");
      also.appendChild(document.createTextNode("Also under "));
      b.also.forEach(function (n, i) {
        if (i) also.appendChild(document.createTextNode(i === b.also.length - 1 ? " and " : ", "));
        var od = byName[n];
        if (od) {
          var a = make("a", "gm-also-link", od.r.ab || n);
          a.href = deptHref(od.slug, slugOf(b.u));
          a.setAttribute("data-nav", "1");
          a.title = n;
          if (od.r.ab) a.appendChild(make("span", "visually-hidden", " (" + n + ")"));
          also.appendChild(a);
        } else also.appendChild(document.createTextNode(n));
      });
      main.appendChild(also);
    }
    row.appendChild(main);
    return row;
  }

  // Build the department -> type -> body (-> nested body) structure used by tree + diagram.
  function structure(d, typeFilter) {
    var groups = [];
    var all = [];
    order.forEach(function (k) {
      var list = (d.r.g || {})[k];
      if (!list || (typeFilter !== "all" && typeFilter !== k)) return;
      list.forEach(function (b) { all.push({ b: b, k: k, kids: [] }); });
    });
    var byN = {};
    all.forEach(function (o) { byN[o.b.n] = o; });
    var top = {};
    all.forEach(function (o) {
      var p = o.b.via && byN[o.b.via];
      if (p && p !== o) { p.kids.push(o); o.parent = p; }
      else (top[o.k] = top[o.k] || []).push(o);
    });
    order.forEach(function (k) {
      if (!top[k]) return;
      var total = 0;
      all.forEach(function (o) { if (o.k === k) total += 1; });
      groups.push({ k: k, items: top[k], total: total });
    });
    return { groups: groups, count: all.length };
  }

  function buildTree(d, opts) {
    var q = opts.q || "";
    var st = structure(d, opts.type || "all");
    var tree = make("ul", "gm-ti-tree");
    tree.setAttribute("role", "tree");
    tree.setAttribute("aria-label", d.r.n + ": organisations by type");
    var total = deptTotal(d);
    var row = make("div", "gm-ti-row gm-ti-root");
    row.appendChild(make("span", "gm-ti-tw")).setAttribute("aria-hidden", "true");
    var nm = make("span", "gm-ti-main");
    if (opts.rootLink) {
      var ra = make("a", "gm-ti-dept", d.r.n);
      ra.href = deptHref(d.slug);
      ra.setAttribute("data-nav", "1");
      nm.appendChild(ra);
    } else nm.appendChild(make("span", "gm-ti-dept", d.r.n));
    if (d.r.ab) nm.appendChild(make("span", "gm-ab", d.r.ab));
    nm.appendChild(make("span", "gm-count", st.count !== total ? st.count + " of " + total : String(total)));
    row.appendChild(nm);
    var root = treeItem(1, d.r.n, row, st.groups.length > 0);
    tree.appendChild(root);
    if (!st.groups.length) {
      root.removeAttribute("aria-expanded");
      nm.appendChild(make("span", "gm-note", total ? "No bodies match the current filters." : "GOV.UK lists no bodies for this department."));
      return noTab(tree);
    }
    var rootGroup = root.lastElementChild;
    st.groups.forEach(function (g) {
      var gr = make("div", "gm-ti-row gm-ti-type");
      gr.appendChild(make("span", "gm-ti-tw")).setAttribute("aria-hidden", "true");
      gr.appendChild(dot(g.k));
      var gm = make("span", "gm-ti-main");
      gm.appendChild(make("span", "gm-ti-tname", typeLabel[g.k] || g.k));
      gm.appendChild(make("span", "gm-count", String(g.items.length)));
      var nested = g.total - g.items.length;
      if (nested > 0) gm.appendChild(make("span", "gm-note", "+" + nested + " inside other bodies"));
      var w = whatLink(g.k);
      if (w) gm.appendChild(w);
      gr.appendChild(gm);
      var gli = treeItem(2, typeLabel[g.k] || g.k, gr, true);
      gli.classList.add("gm-ti-k-" + g.k);
      rootGroup.appendChild(gli);
      var gul = gli.lastElementChild;
      (function addBodies(list, ul, level, underK) {
        list.forEach(function (o) {
          var bli = treeItem(level, o.b.n, bodyRow(o.b, o.k, d, q, underK, !!o.parent), o.kids.length > 0);
          if (opts.org && slugOf(o.b.u) === opts.org) bli.classList.add("gm-hl");
          ul.appendChild(bli);
          if (o.kids.length) addBodies(o.kids, bli.lastElementChild, level + 1, o.k);
        });
      })(g.items, gul, 3, g.k);
    });
    if (opts.collapsed) {
      Array.prototype.forEach.call(tree.querySelectorAll("[aria-level='2']"), function (li) { setExpanded(li, false, false); });
    }
    return noTab(tree);
  }


  function wrapLines(text, maxChars) {
    var words = String(text || "").split(/\s+/);
    var lines = [], cur = "";
    function flush() { if (cur) { lines.push(cur); cur = ""; } }
    words.forEach(function (w) {
      if (!w) return;
      if (w.length > maxChars) {
        flush();
        while (w.length > maxChars) { lines.push(w.slice(0, maxChars)); w = w.slice(maxChars); }
        cur = w;
        return;
      }
      var next = cur ? cur + " " + w : w;
      if (next.length <= maxChars) cur = next;
      else { flush(); cur = w; }
    });
    flush();
    return lines.length ? lines : [""];
  }
  function addLines(parent, lines, x, y, cls, anchor, lh) {
    var t = svg("text", { x: String(x), y: String(y), class: cls });
    if (anchor) t.setAttribute("text-anchor", anchor);
    lines.forEach(function (line, i) {
      var ts = svg("tspan", { x: String(x), dy: i === 0 ? "0" : String(lh) });
      ts.textContent = line;
      t.appendChild(ts);
    });
    parent.appendChild(t);
    return t;
  }

  /* Vertical, phone-first diagram. The desktop layout in buildDiagram is unchanged. */
  function buildMobileDiagram(d, avail) {
    var st = structure(d, "all");
    var wrap = make("div", "gm-dg gm-dg-vert");
    var PAD = 10, GAP_X = 8, GAP_Y = 16, MIN_COL = 138, LH = 15, TAP = 32;
    var W = Math.max(248, Math.floor(avail || 300));
    var COLS = Math.max(1, Math.floor((W - 2 * PAD + GAP_X) / (MIN_COL + GAP_X)));
    var colW = (W - 2 * PAD - (COLS - 1) * GAP_X) / COLS;
    var labelW = Math.max(72, colW - 26);
    var maxChars = Math.max(8, Math.floor(labelW / 6.9));

    var nodes = [];
    var rootNode = { id: "n0", label: d.r.ab || d.r.n, full: d.r.n, k: d.r.t || "ministerial", kind: "dept", u: d.r.u };
    nodes.push(rootNode);

    function flatten(list, parent, depth, acc) {
      list.forEach(function (o) {
        var chars = Math.max(6, maxChars - depth * 2);
        var bn = { id: "n" + nodes.length, label: o.b.n, full: o.b.n, ab: o.b.ab, k: o.k, kind: "body", parent: parent, depth: depth, u: o.b.u, own: o.b.own, also: o.b.also, lines: wrapLines(o.b.n, chars) };
        bn.h = Math.max(TAP, 8 + bn.lines.length * LH);
        nodes.push(bn);
        acc.push(bn);
        if (o.kids.length) flatten(o.kids, bn, depth + 1, acc);
      });
    }

    var typeGroups = [];
    st.groups.forEach(function (g) {
      var tn = { id: "n" + nodes.length, label: (typeLabel[g.k] || g.k) + " (" + g.total + ")", full: typeLabel[g.k] || g.k, k: g.k, kind: "type", parent: rootNode };
      tn.lines = wrapLines(tn.label, maxChars);
      tn.h = Math.max(28, 10 + tn.lines.length * LH);
      nodes.push(tn);
      var bodies = [];
      flatten(g.items, tn, 0, bodies);
      var bh = 0;
      bodies.forEach(function (b) { bh += b.h; });
      tn.bodies = bodies;
      tn.blockH = tn.h + 6 + bh;
      typeGroups.push(tn);
    });

    var colY = [], colItems = [], i;
    for (i = 0; i < COLS; i++) { colY.push(0); colItems.push([]); }
    typeGroups.forEach(function (tn) {
      var c = 0, m = colY[0];
      for (i = 1; i < COLS; i++) if (colY[i] < m) { m = colY[i]; c = i; }
      tn.col = c;
      colItems[c].push(tn);
      colY[c] += tn.blockH + GAP_Y;
    });

    var deptLines = wrapLines((d.r.ab || d.r.n) + " \u00b7 " + st.count, Math.max(10, Math.floor(Math.min(W - 28, 240) / 7.2)));
    var deptH = Math.max(34, 16 + deptLines.length * 16);
    var longest = 0;
    deptLines.forEach(function (l) { if (l.length > longest) longest = l.length; });
    var deptW = Math.min(W - 20, Math.max(120, 24 + longest * 7.2));
    rootNode.x = W / 2;
    rootNode.y = PAD + deptH / 2;
    rootNode.deptW = deptW;
    rootNode.deptH = deptH;
    rootNode.lines = deptLines;
    rootNode.h = deptH;

    var typeTop = PAD + deptH + 30;
    for (i = 0; i < COLS; i++) {
      var x0 = PAD + i * (colW + GAP_X);
      var y = typeTop;
      colItems[i].forEach(function (tn) {
        tn.x = x0 + 9;
        tn.y = y + tn.h / 2;
        tn.x0 = x0;
        var by = y + tn.h + 6;
        tn.bodies.forEach(function (bn) {
          var indent = 8 + bn.depth * 12;
          bn.x = x0 + indent + 6;
          bn.y = by + bn.h / 2;
          bn.x0 = x0;
          bn.indent = indent;
          by += bn.h;
        });
        y += tn.blockH + GAP_Y;
      });
    }
    var maxCol = 0;
    for (i = 0; i < COLS; i++) if (colY[i] > maxCol) maxCol = colY[i];
    var H = Math.max(PAD * 2 + deptH, typeTop + maxCol + PAD);
    if (!typeGroups.length) H = PAD * 2 + deptH;

    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: String(W), height: String(H), class: "gm-dg-svg", role: "group", "aria-label": "Diagram of " + d.r.n + " and its " + plural(st.count, "organisation", "organisations") + ". The same information is in the list view." });
    var gl = svg("g", { class: "gm-dg-links" });
    var gn = svg("g", { class: "gm-dg-nodes" });
    s.appendChild(gl);
    s.appendChild(gn);
    nodes.forEach(function (n, idx) {
      if (!n.parent) return;
      var p = n.parent, dpath, x1, y1, x2, y2;
      if (p.kind === "dept") {
        x1 = p.x;
        y1 = p.y + p.deptH / 2;
        x2 = n.x;
        y2 = n.y - n.h / 2 + 1;
        var dy = Math.max(20, (y2 - y1) * 0.5);
        dpath = "M" + x1 + "," + y1 + " C" + x1 + "," + (y1 + dy) + " " + x2 + "," + (y2 - dy) + " " + x2 + "," + y2;
      } else {
        x1 = p.x;
        y1 = p.y + (p.h || 0) / 2 - 2;
        x2 = n.x - 6;
        y2 = n.y;
        var mid = (y1 + y2) / 2;
        dpath = "M" + x1 + "," + y1 + " C" + x1 + "," + mid + " " + x2 + "," + mid + " " + x2 + "," + y2;
      }
      n.link = svg("path", { d: dpath, class: "gm-dg-link", stroke: n.kind === "type" ? "#c9a15d" : (COLOR[n.k] || "#a3b8ad"), pathLength: "1", fill: "none" });
      n.link.style.animationDelay = Math.min(idx * 6, 420) + "ms";
      gl.appendChild(n.link);
    });
    nodes.forEach(function (n) {
      var g, url = n.kind === "type" ? null : safeUrl(n.u, GOVUK_HOST);
      if (url) {
        g = svg("a", { href: url, target: "_blank", class: "gm-dg-node gm-dg-" + n.kind });
        g.setAttribute("rel", "noopener");
        g.setAttribute("aria-label", n.full + (n.ab ? " (" + n.ab + ")" : "") + (n.kind === "body" ? ", " + (typeLabel[n.k] || "") : "") + ". Opens GOV.UK in a new tab.");
      } else {
        g = svg("g", { class: "gm-dg-node gm-dg-" + n.kind, tabindex: "-1" });
      }
      n.el = g;
      n.url = url;
      if (n.kind === "dept") {
        g.appendChild(svg("rect", { x: String(n.x - n.deptW / 2), y: String(n.y - n.deptH / 2), width: String(n.deptW), height: String(n.deptH), class: "gm-dg-hit" }));
        g.appendChild(svg("rect", { x: String(n.x - n.deptW / 2), y: String(n.y - n.deptH / 2), width: String(n.deptW), height: String(n.deptH), rx: String(n.deptH / 2), class: "gm-dg-pill" }));
        addLines(g, n.lines, n.x, n.y - ((n.lines.length - 1) * 16) / 2 + 5, "gm-dg-pill-t", "middle", 16);
      } else if (n.kind === "type") {
        g.appendChild(svg("rect", { x: String(n.x0), y: String(n.y - n.h / 2), width: String(colW), height: String(n.h), class: "gm-dg-hit" }));
        g.appendChild(svg("circle", { cx: String(n.x), cy: String(n.y), r: "7", fill: COLOR[n.k] || "#a3b8ad", class: "gm-dg-dot" }));
        addLines(g, n.lines, n.x + 12, n.y - ((n.lines.length - 1) * LH) / 2 + 4, "gm-dg-type-t", null, LH);
      } else {
        g.appendChild(svg("rect", { x: String(n.x0), y: String(n.y - n.h / 2), width: String(colW), height: String(n.h), class: "gm-dg-hit" }));
        g.appendChild(svg("circle", { cx: String(n.x), cy: String(n.y), r: "5", fill: COLOR[n.k] || "#a3b8ad", class: "gm-dg-dot" }));
        addLines(g, n.lines, n.x + 11, n.y - ((n.lines.length - 1) * LH) / 2 + 4, "gm-dg-body-t", null, LH);
      }
      g.style.animationDelay = Math.min(nodes.indexOf(n) * 6, 420) + "ms";
      gn.appendChild(g);
    });
    wrap.appendChild(s);
    var tip = make("div", "gm-dg-tip");
    tip.hidden = true;
    tip.setAttribute("aria-hidden", "true");
    wrap.appendChild(tip);
    var selected = null;

    function light(n) {
      nodes.forEach(function (m) { m.el.classList.remove("gm-on"); if (m.link) m.link.classList.remove("gm-on"); });
      if (!n) { s.classList.remove("gm-dg-dim"); tip.hidden = true; tip.setAttribute("aria-hidden", "true"); return; }
      s.classList.add("gm-dg-dim");
      for (var c = n; c; c = c.parent) { c.el.classList.add("gm-on"); if (c.link) c.link.classList.add("gm-on"); }
      if (n.kind === "type") nodes.forEach(function (m) { for (var c2 = m.parent; c2; c2 = c2.parent) if (c2 === n) { m.el.classList.add("gm-on"); if (m.link) m.link.classList.add("gm-on"); } });
      tip.textContent = "";
      tip.appendChild(make("strong", null, n.full));
      if (n.ab && norm(n.ab) !== norm(n.full)) tip.appendChild(make("span", "gm-ab", n.ab));
      var path = [];
      for (var p = n.parent; p; p = p.parent) path.unshift(p.kind === "dept" ? (d.r.ab || d.r.n) : p.full);
      tip.appendChild(make("span", "gm-dg-tip-p", (n.kind === "body" ? (typeLabel[n.k] || "") + " \u00b7 " : "") + (path.length ? path.join(" \u203a ") : KIND_LABEL[d.r.k] || "")));
      var flags = [];
      if (n.own) flags.push("Own website");
      if (n.also && n.also.length) flags.push("Shared with " + n.also.join(", "));
      if (flags.length) tip.appendChild(make("span", "gm-dg-tip-p", flags.join(" \u00b7 ")));
      if (n.kind === "dept") appendBudget(tip, n.slug || (d && d.slug));
      if (n.url) {
        var open = make("a", "gm-dg-open", "Open on GOV.UK \u2197");
        open.href = n.url;
        open.target = "_blank";
        open.rel = "noopener noreferrer";
        open.addEventListener("click", function (e) { e.stopPropagation(); });
        tip.appendChild(open);
      }
      tip.hidden = false;
      tip.setAttribute("aria-hidden", "false");
      tip.style.top = "auto";
      tip.style.left = "";
      try { n.el.scrollIntoView({ block: "center", inline: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" }); } catch (err) {}
    }
    function onNodeActivate(n, e) {
      if (!n.url) { selected = n; light(n); return; }
      if (selected === n) {
        if (e) e.preventDefault();
        window.open(n.url, "_blank", "noopener,noreferrer");
        return;
      }
      if (e) e.preventDefault();
      selected = n;
      light(n);
    }
    nodes.forEach(function (n) {
      n.el.addEventListener("click", function (e) { onNodeActivate(n, e); });
      n.el.addEventListener("focus", function () { light(n); });
    });
    wrap.addEventListener("click", function (e) {
      if (e.target.closest(".gm-dg-node") || e.target.closest(".gm-dg-tip")) return;
      selected = null;
      light(null);
    });
    wrap._light = function (slug) {
      var n = nodes.filter(function (m) { return m.kind === "body" && slugOf(m.u) === slug; })[0];
      selected = n || null;
      light(n || null);
    };
    return wrap;
  }

  /* ---------- single-department diagram (SVG) ---------- */
  function buildDiagram(d, avail) {
    if (!wide.matches) return buildMobileDiagram(d, avail);
    var st = structure(d, "all");
    var wrap = make("div", "gm-dg");
    var ROW = 24, TOP = 22;
    var W = Math.max(560, Math.min(1000, (avail || 760) - 28));
    var xDept = 74, xType = Math.round(W * 0.34), xBody = Math.round(W * 0.34) + 150, IND = 22;
    var rows = [];
    var nodes = [];
    var rootNode = { id: "n0", label: d.r.ab || d.r.n, full: d.r.n, k: d.r.t || "ministerial", kind: "dept", u: d.r.u };
    nodes.push(rootNode);
    st.groups.forEach(function (g) {
      var tn = { id: "n" + nodes.length, label: (typeLabel[g.k] || g.k) + " (" + g.total + ")", full: typeLabel[g.k] || g.k, k: g.k, kind: "type", parent: rootNode };
      nodes.push(tn);
      var startRow = rows.length;
      (function add(list, parent, depth) {
        list.forEach(function (o) {
          var bn = { id: "n" + nodes.length, label: o.b.n, full: o.b.n, ab: o.b.ab, k: o.k, kind: "body", parent: parent, depth: depth, u: o.b.u, own: o.b.own, also: o.b.also, row: rows.length };
          nodes.push(bn);
          rows.push(bn);
          if (o.kids.length) add(o.kids, bn, depth + 1);
        });
      })(g.items, tn, 0);
      tn.y = TOP + ((startRow + rows.length - 1) / 2) * ROW;
      tn.x = xType;
    });
    rows.forEach(function (n) { n.y = TOP + n.row * ROW; n.x = xBody + n.depth * IND; });
    rootNode.x = xDept;
    rootNode.y = rows.length ? TOP + ((rows.length - 1) / 2) * ROW : TOP;
    var H = Math.max(120, TOP * 2 + Math.max(rows.length - 1, 0) * ROW);

    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: String(W), height: String(H), class: "gm-dg-svg", role: "group", "aria-label": "Diagram of " + d.r.n + " and its " + plural(st.count, "organisation", "organisations") + ". The same information is in the list view." });
    var gl = svg("g", { class: "gm-dg-links" });
    var gn = svg("g", { class: "gm-dg-nodes" });
    s.appendChild(gl);
    s.appendChild(gn);
    nodes.forEach(function (n, i) {
      if (!n.parent) return;
      var p = n.parent;
      var x1 = p.kind === "body" ? p.x : p.x + (p.kind === "dept" ? 58 : 8);
      var y1 = p.y;
      var x2 = n.x - (n.kind === "body" ? 6 : 8), y2 = n.y;
      var dpath;
      if (p.kind === "body") dpath = "M" + x1 + "," + (y1 + 5) + " C" + x1 + "," + (y2) + " " + x1 + "," + y2 + " " + x2 + "," + y2;
      else { var m = (x1 + x2) / 2; dpath = "M" + x1 + "," + y1 + " C" + m + "," + y1 + " " + m + "," + y2 + " " + x2 + "," + y2; }
      n.link = svg("path", { d: dpath, class: "gm-dg-link", stroke: n.kind === "type" ? "#c9a15d" : (COLOR[n.k] || "#a3b8ad"), pathLength: "1", fill: "none" });
      n.link.style.animationDelay = Math.min(i * 6, 420) + "ms";
      gl.appendChild(n.link);
    });
    var maxChars = function (x) { return Math.max(18, Math.floor((W - x - 14) / 6.7)); };
    nodes.forEach(function (n) {
      var g;
      var url = n.kind === "type" ? null : safeUrl(n.u, GOVUK_HOST);
      if (url) {
        g = svg("a", { href: url, target: "_blank", class: "gm-dg-node gm-dg-" + n.kind });
        g.setAttribute("aria-label", n.full + (n.ab ? " (" + n.ab + ")" : "") + (n.kind === "body" ? ", " + (typeLabel[n.k] || "") : "") + ". Opens GOV.UK in a new tab.");
        g.addEventListener("click", function (e) { e.preventDefault(); window.open(url, "_blank", "noopener,noreferrer"); });
      } else {
        g = svg("g", { class: "gm-dg-node gm-dg-" + n.kind, tabindex: "-1" });
      }
      n.el = g;
      if (n.kind === "dept") {
        g.appendChild(svg("rect", { x: String(n.x - 62), y: String(n.y - 17), width: "120", height: "34", rx: "17", class: "gm-dg-pill" }));
        var t0 = svg("text", { x: String(n.x - 2), y: String(n.y + 5), "text-anchor": "middle", class: "gm-dg-pill-t" });
        var lab = String(n.label);
        t0.textContent = (lab.length > 10 ? lab.slice(0, 9) + "\u2026" : lab) + " \u00b7 " + st.count;
        g.appendChild(t0);
      } else if (n.kind === "type") {
        g.appendChild(svg("circle", { cx: String(n.x), cy: String(n.y), r: "8", fill: COLOR[n.k] || "#a3b8ad", class: "gm-dg-dot" }));
        var t1 = svg("text", { x: String(n.x - 13), y: String(n.y - 11), "text-anchor": "end", class: "gm-dg-type-t" });
        t1.textContent = n.label;
        g.appendChild(t1);
      } else {
        g.appendChild(svg("circle", { cx: String(n.x), cy: String(n.y), r: "5", fill: COLOR[n.k] || "#a3b8ad", class: "gm-dg-dot" }));
        var t2 = svg("text", { x: String(n.x + 11), y: String(n.y + 4), class: "gm-dg-body-t" });
        var mc = maxChars(n.x + 11);
        t2.textContent = n.label.length > mc ? n.label.slice(0, mc - 1) + "\u2026" : n.label;
        g.appendChild(t2);
      }
      gn.appendChild(g);
    });
    wrap.appendChild(s);
    var tip = make("div", "gm-dg-tip");
    tip.hidden = true;
    tip.setAttribute("aria-hidden", "true");
    wrap.appendChild(tip);

    function light(n) {
      nodes.forEach(function (m) { m.el.classList.remove("gm-on"); if (m.link) m.link.classList.remove("gm-on"); });
      if (!n) { s.classList.remove("gm-dg-dim"); tip.hidden = true; return; }
      s.classList.add("gm-dg-dim");
      for (var c = n; c; c = c.parent) { c.el.classList.add("gm-on"); if (c.link) c.link.classList.add("gm-on"); }
      if (n.kind === "type") nodes.forEach(function (m) { for (var c2 = m.parent; c2; c2 = c2.parent) if (c2 === n) { m.el.classList.add("gm-on"); if (m.link) m.link.classList.add("gm-on"); } });
      tip.textContent = "";
      tip.appendChild(make("strong", null, n.full));
      if (n.ab && norm(n.ab) !== norm(n.full)) tip.appendChild(make("span", "gm-ab", n.ab));
      var path = [];
      for (var p = n.parent; p; p = p.parent) path.unshift(p.kind === "dept" ? (d.r.ab || d.r.n) : p.full);
      tip.appendChild(make("span", "gm-dg-tip-p", (n.kind === "body" ? (typeLabel[n.k] || "") + " \u00b7 " : "") + (path.length ? path.join(" \u203a ") : KIND_LABEL[d.r.k] || "")));
      var flags = [];
      if (n.own) flags.push("Own website");
      if (n.also && n.also.length) flags.push("Shared with " + n.also.join(", "));
      if (flags.length) tip.appendChild(make("span", "gm-dg-tip-p", flags.join(" \u00b7 ")));
      if (n.kind === "dept") appendBudget(tip, n.slug || (d && d.slug));
      if (n.kind !== "type") tip.appendChild(make("span", "gm-dg-tip-c", "Click to open on GOV.UK \u2197"));
      tip.hidden = false;
      var sx = s.getBoundingClientRect(), wx = wrap.getBoundingClientRect();
      var scale = sx.width / W;
      var left = sx.left - wx.left + (n.x + (n.kind === "body" ? 14 : 12)) * scale;
      var top = sx.top - wx.top + n.y * scale + 14;
      left = Math.min(left, wrap.clientWidth - 270);
      tip.style.left = Math.max(4, left) + "px";
      tip.style.top = top + "px";
    }
    nodes.forEach(function (n) {
      n.el.addEventListener("pointerenter", function () { light(n); });
      n.el.addEventListener("focus", function () { light(n); });
      n.el.addEventListener("blur", function () { light(null); });
    });
    s.addEventListener("pointerleave", function () { light(null); });
    wrap._light = function (slug) {
      var n = nodes.filter(function (m) { return m.kind === "body" && slugOf(m.u) === slug; })[0];
      light(n || null);
    };
    return wrap;
  }

  /* ---------- views ---------- */
  function breadcrumb(items) {
    var nav = make("nav", "gm-bc");
    nav.setAttribute("aria-label", "Breadcrumb");
    var ol = make("ol");
    items.forEach(function (it, i) {
      var li = make("li");
      if (it.href) {
        var a = make("a", null, it.t);
        a.href = it.href;
        a.setAttribute("data-nav", "1");
        li.appendChild(a);
      } else {
        var sp = make("span", null, it.t);
        if (i === items.length - 1) sp.setAttribute("aria-current", "page");
        li.appendChild(sp);
      }
      ol.appendChild(li);
    });
    nav.appendChild(ol);
    return nav;
  }

  function typeBar(d) {
    var n = deptTotal(d);
    var bar = make("span", "gm-bar");
    bar.setAttribute("aria-hidden", "true");
    if (!n) return bar;
    order.forEach(function (k) {
      var list = (d.r.g || {})[k];
      if (!list || !list.length) return;
      var seg = make("span", "gm-bg-" + (COLOR[k] ? k : "other"));
      seg.style.width = (list.length * 100 / n).toFixed(2) + "%";
      bar.appendChild(seg);
    });
    return bar;
  }
  function mixText(d) {
    return order.filter(function (k) { return (d.r.g || {})[k]; }).map(function (k) { return (typeLabel[k] || k) + " " + d.r.g[k].length; }).join(", ");
  }

  function renderOverview() {
    var frag = make("div", "gm-ov");
    var tools = make("div", "gm-ov-tools");
    var sortG = make("div", "gm-seg");
    sortG.setAttribute("role", "group");
    sortG.setAttribute("aria-label", "Sort departments");
    [["size", "Most bodies"], ["az", "A\u2013Z"]].forEach(function (p) {
      var b = make("button", "gm-seg-b", p[1]);
      b.type = "button";
      b.setAttribute("aria-pressed", state.sort === p[0] ? "true" : "false");
      b.addEventListener("click", function () { state.sort = p[0]; render(); var nb = el.view.querySelector(".gm-seg-b[aria-pressed=true]"); if (nb) nb.focus(); });
      sortG.appendChild(b);
    });
    tools.appendChild(make("span", "gm-ov-label", "Sort"));
    tools.appendChild(sortG);
    frag.appendChild(tools);

    var rootRow = make("div", "gm-root");
    rootRow.appendChild(make("span", "gm-root-node", "UK Government"));
    var shownD = depts.filter(inScope);
    var shownB = 0;
    shownD.forEach(function (d) { shownB += deptTotal(d); });
    rootRow.appendChild(make("span", "gm-root-meta", plural(shownD.length, "group", "groups") + " \u00b7 " + plural(shownB, "body entry", "body entries")));
    frag.appendChild(rootRow);
    var trunk = make("div", "gm-trunk");
    GROUPS.forEach(function (gk) {
      var list = shownD.filter(function (d) { return d.r.k === gk; });
      if (!list.length) return;
      var sec = make("section", "gm-ov-sec gm-ov-" + gk);
      var h = make("h2", "gm-ov-h");
      h.appendChild(document.createTextNode(GROUP_LABEL[gk] + " "));
      h.appendChild(make("span", "gm-ov-n", gk === "none" ? "(" + plural(deptTotal(list[0]), "body", "bodies") + ")" : "(" + list.length + ")"));
      var ka = make("a", "gm-what", "?");
      ka.href = GLOSSARY + "#" + KIND_ANCHOR[gk];
      ka.title = "What does this mean? (glossary)";
      ka.setAttribute("aria-label", "What does " + GROUP_LABEL[gk] + " mean? Glossary");
      h.appendChild(ka);
      sec.appendChild(h);
      var sorted = list.slice().sort(function (a, b) {
        if (state.sort === "size") return deptTotal(b) - deptTotal(a) || a.r.n.localeCompare(b.r.n);
        return a.r.n.replace(/^the /i, "").localeCompare(b.r.n.replace(/^the /i, ""));
      });
      var ul = make("ul", "gm-cards");
      sorted.forEach(function (d) {
        var li = make("li");
        var a = make("a", "gm-card");
        a.href = deptHref(d.slug);
        a.setAttribute("data-nav", "1");
        a.title = mixText(d) || "No bodies listed";
        var top = make("span", "gm-card-top");
        top.appendChild(make("span", "gm-card-n", d.r.n));
        var c = make("span", "gm-card-c", deptTotal(d));
        c.appendChild(make("span", "visually-hidden", deptTotal(d) === 1 ? " body" : " bodies"));
        top.appendChild(c);
        a.appendChild(top);
        a.appendChild(make("span", "gm-card-ab" + (d.r.ab ? "" : " gm-card-ab-none"), d.r.ab || "\u00a0"));
        if (d.r.k !== "none") {
          var bud = make("span", "gm-card-bud");
          if (window.GovmapBudget) window.GovmapBudget.fill(bud, d.slug, { plain: true });
          else { bud.setAttribute("data-budget-slug", d.slug); bud.setAttribute("data-budget-plain", "1"); }
          a.appendChild(bud);
        }
        a.appendChild(typeBar(d));
        li.appendChild(a);
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      trunk.appendChild(sec);
    });
    frag.appendChild(trunk);
    frag.appendChild(legend());
    el.view.appendChild(frag);
    el.count.textContent = "Showing " + plural(shownD.length, "group", "groups") + ". Pick a department to see what it runs, or search.";
  }

  function legend() {
    var p = make("div", "gm-ov-legend");
    p.setAttribute("aria-label", "Colour key for body types");
    p.setAttribute("role", "group");
    order.forEach(function (k) {
      if (!((data.counts || {}).byType || {})[k] || !TYPE_ANCHOR[k]) return;
      var a = make("a", "gm-legend-i");
      a.href = GLOSSARY + "#" + TYPE_ANCHOR[k];
      a.appendChild(dot(k));
      a.appendChild(document.createTextNode(typeLabel[k] || k));
      p.appendChild(a);
    });
    return p;
  }

  function renderSearch() {
    var q = state.q;
    var res = [];
    var groupsHit = {};
    depts.forEach(function (d) {
      if (!inScope(d)) return;
      if (state.type === "all" && d.r.k !== "none" && matches(d.r.n, d.r.ab, q)) { res.push({ d: d }); groupsHit[d.slug] = 1; }
      order.forEach(function (k) {
        if (state.type !== "all" && state.type !== k) return;
        ((d.r.g || {})[k] || []).forEach(function (b) {
          if (matches(b.n, b.ab, q)) { res.push({ d: d, b: b, k: k }); groupsHit[d.slug] = 1; }
        });
      });
    });
    // departments first, then exact abbreviation hits, then names starting with the query
    function rank(r) {
      if (!r.b) return 0;
      if (r.b.ab && norm(r.b.ab) === q) return 1;
      if (norm(r.b.n).indexOf(q) === 0) return 2;
      return 3;
    }
    res.sort(function (a, b) { return rank(a) - rank(b); });
    var bodies = res.filter(function (r) { return r.b; }).length;
    var nd = res.length - bodies;
    var g = Object.keys(groupsHit).length;
    el.count.textContent = res.length
      ? plural(bodies, "body matches", "bodies match") + " in " + plural(g, "group.", "groups.") + (nd ? " " + plural(nd, "department also matches.", "departments also match.") : "")
      : "";
    if (!res.length) {
      el.view.appendChild(make("p", "gm-empty", "Nothing matches. Try a shorter name or abbreviation, or clear the filters."));
      return;
    }
    var ul = make("ul", "gm-results");
    res.slice(0, state.all ? res.length : SEARCH_LIMIT).forEach(function (r) {
      var li = make("li", "gm-res");
      var a = make("a", "gm-res-a");
      a.setAttribute("data-nav", "1");
      var line = make("span", "gm-res-l");
      if (r.b) {
        a.href = deptHref(r.d.slug, slugOf(r.b.u));
        line.appendChild(dot(r.k));
        var nm = make("span", "gm-res-n");
        appendMarked(nm, r.b.n, q);
        line.appendChild(nm);
        if (r.b.ab && norm(r.b.ab) !== norm(r.b.n)) { var ab = make("span", "gm-ab"); appendMarked(ab, r.b.ab, q); line.appendChild(ab); }
        var sflag = parliamentFlag(r.b.u);
        if (sflag) line.appendChild(sflag);
      } else {
        a.href = deptHref(r.d.slug);
        line.appendChild(dot(r.d.r.t || "ministerial"));
        var dn = make("span", "gm-res-n");
        appendMarked(dn, r.d.r.n, q);
        line.appendChild(dn);
        if (r.d.r.ab) { var dab = make("span", "gm-ab"); appendMarked(dab, r.d.r.ab, q); line.appendChild(dab); }
      }
      a.appendChild(line);
      var path = make("span", "gm-res-p");
      var parts = r.b
        ? ["UK Government", r.d.r.k === "none" ? "Not attached" : r.d.r.n, typeLabel[r.k] || ""]
        : ["UK Government", GROUP_LABEL[r.d.r.k], plural(deptTotal(r.d), "body", "bodies")];
      if (r.b && r.b.via) parts.push("part of " + r.b.via);
      parts.forEach(function (t, i) {
        if (i) path.appendChild(make("span", "gm-res-sep", " \u203a ")).setAttribute("aria-hidden", "true");
        path.appendChild(make("span", null, t));
      });
      a.appendChild(path);
      li.appendChild(a);
      var meta = make("span", "gm-res-m");
      if (r.b && r.b.own) meta.appendChild(make("span", "gm-mark gm-own", "Own website"));
      if (r.b && r.b.also && r.b.also.length) meta.appendChild(make("span", "gm-mark gm-shared", "Shared"));
      var x = extLink(r.b ? r.b.u : r.d.r.u, "GOV.UK", "page for " + (r.b ? r.b.n : r.d.r.n));
      if (x) meta.appendChild(x);
      li.appendChild(meta);
      ul.appendChild(li);
    });
    el.view.appendChild(ul);
    if (!state.all && res.length > SEARCH_LIMIT) {
      var more = make("button", "gm-text-btn gm-more", "Show all " + res.length + " results");
      more.type = "button";
      more.addEventListener("click", function () { state.all = true; render(); });
      el.view.appendChild(more);
    }
  }

  function renderList() {
    var filtering = state.type !== "all";
    var n = 0, b = 0;
    var wrapAll = make("div", "gm-list-all");
    depts.forEach(function (d) {
      if (!inScope(d)) return;
      var st = structure(d, state.type);
      if (filtering && !st.count) return;
      n += 1; b += st.count;
      var sec = make("section", "gm-lsec");
      sec.appendChild(buildTree(d, { type: state.type, rootLink: true }));
      wrapAll.appendChild(sec);
    });
    if (!n) { el.view.appendChild(make("p", "gm-empty", "Nothing matches. Try clearing the filters.")); el.count.textContent = ""; return; }
    el.view.appendChild(wrapAll);
    Array.prototype.forEach.call(wrapAll.querySelectorAll("[role=tree]"), initTree);
    el.count.textContent = filtering
      ? plural(b, "body matches", "bodies match") + " in " + plural(n, "group.", "groups.")
      : "Showing all " + plural(b, "body entry", "body entries") + " in " + plural(n, "group.", "groups.");
  }

  function renderDept(d) {
    var total = deptTotal(d);
    var box = make("article", "gm-dv");
    if (d.r.k === "none") {
      var note = make("p", "gm-parl-note");
      note.appendChild(document.createTextNode("Three of these organisations — the Parliamentary and Health Service Ombudsman (listed here as Public Service Ombudsman), the Electoral Commission, and IPSA — are accountable to Parliament, not to a minister. They are flagged below and explained on the "));
      var pl = make("a", null, "Accountable to Parliament");
      pl.href = "/govmap/parliament/";
      note.appendChild(pl);
      note.appendChild(document.createTextNode(" page, so they are not counted twice as if they were separate bodies."));
      box.appendChild(note);
    }
    box.appendChild(breadcrumb([
      { t: "UK Government", href: hrefFor({ scope: "all", type: "all", expand: false }) },
      d.r.k === "none" ? null : { t: GROUP_LABEL[d.r.k], href: hrefFor({ scope: d.r.k, type: "all", expand: false }) },
      { t: d.r.k === "none" ? "Not attached to a department" : d.r.n }
    ].filter(Boolean)));
    var kind = make("p", "gm-dv-kind");
    var ka = make("a", null, KIND_LABEL[d.r.k] || "");
    ka.href = GLOSSARY + "#" + KIND_ANCHOR[d.r.k];
    kind.appendChild(ka);
    box.appendChild(kind);
    var h = make("h2", "gm-dv-h");
    h.appendChild(document.createTextNode(d.r.n));
    if (d.r.ab) h.appendChild(make("span", "gm-ab", d.r.ab));
    box.appendChild(h);
    var meta = make("p", "gm-dv-meta");
    meta.appendChild(document.createTextNode(total ? plural(total, "organisation", "organisations") : "GOV.UK lists no bodies for this department."));
    var x = extLink(d.r.u, "GOV.UK page", "for " + d.r.n);
    if (x) { meta.appendChild(document.createTextNode(" \u00b7 ")); meta.appendChild(x); }
    box.appendChild(meta);
    if (d.r.k !== "none") {
      var dvb = make("p", "gm-dv-bud");
      if (window.GovmapBudget) window.GovmapBudget.fill(dvb, d.slug);
      else dvb.setAttribute("data-budget-slug", d.slug);
      box.appendChild(dvb);
    }

    if (total) {
      var chips = make("ul", "gm-chips");
      chips.setAttribute("aria-label", "Body types in this department (links to the glossary)");
      order.forEach(function (k) {
        var list = (d.r.g || {})[k];
        if (!list) return;
        var li = make("li");
        var a = make("a", "gm-chip");
        a.href = GLOSSARY + "#" + (TYPE_ANCHOR[k] || "");
        a.title = "What is " + (typeLabel[k] || k).toLowerCase() + "? (glossary)";
        a.appendChild(dot(k));
        a.appendChild(document.createTextNode((typeLabel[k] || k) + " "));
        a.appendChild(make("strong", null, list.length));
        li.appendChild(a);
        chips.appendChild(li);
      });
      box.appendChild(chips);

      var seg = make("div", "gm-seg gm-viewseg");
      seg.setAttribute("role", "group");
      seg.setAttribute("aria-label", "View");
      var diagramOn = state.view === "diagram" && !!SVGNS;
      [["list", "List"], ["diagram", "Diagram"]].forEach(function (p) {
        var b = make("button", "gm-seg-b", p[1]);
        b.type = "button";
        b.setAttribute("aria-pressed", (p[0] === "diagram") === diagramOn ? "true" : "false");
        b.addEventListener("click", function () {
          if (state.view === p[0]) return;
          state.view = p[0];
          writeUrl(false);
          render();
          var nb = el.view.querySelector(".gm-viewseg .gm-seg-b[aria-pressed=true]");
          if (nb) nb.focus();
        });
        seg.appendChild(b);
      });
      box.appendChild(seg);

      var body = make("div", "gm-dv-body" + (diagramOn ? (wide.matches ? " gm-split" : " gm-stack") : ""));
      var treeBox = make("div", "gm-dv-tree");
      var tree = buildTree(d, { org: state.org });
      treeBox.appendChild(tree);
      if (diagramOn && !wide.matches) treeBox.setAttribute("hidden", "");
      body.appendChild(treeBox);
      if (diagramOn) {
        var dg = make("div", "gm-dv-dg");
        body.appendChild(dg);
        box.appendChild(body);
        el.view.appendChild(box);
        var padL = 0, padR = 0;
        if (window.getComputedStyle) {
          var cs = window.getComputedStyle(dg);
          padL = parseFloat(cs.paddingLeft) || 0;
          padR = parseFloat(cs.paddingRight) || 0;
        }
        var avail = Math.max(248, dg.clientWidth - padL - padR);
        var diagram = buildDiagram(d, wide.matches ? dg.clientWidth : avail);
        if (!wide.matches) lastDiagramW = dg.clientWidth;
        dg.appendChild(diagram);
        // hovering a row in the list lights up the same body in the diagram
        tree.addEventListener("pointerover", function (e) {
          var a = e.target.closest(".gm-ti-body");
          var nm = a && a.querySelector(".gm-ti-name");
          if (nm && nm.href) diagram._light(slugOf(nm.href));
        });
        tree.addEventListener("pointerleave", function () { diagram._light(""); });
      } else {
        box.appendChild(body);
        el.view.appendChild(box);
      }
      initTree(tree);
    } else {
      el.view.appendChild(box);
    }
    el.count.textContent = d.r.n + ": " + (total ? plural(total, "organisation", "organisations") + "." : "no bodies listed.");
    document.title = (d.r.ab ? d.r.ab + " \u2014 " : d.r.n + " \u2014 ") + baseTitle;
  }

  function render() {
    el.view.textContent = "";
    document.title = baseTitle;
    var d = state.dept ? bySlug[state.dept] : null;
    var mode = d ? "dept" : state.q ? "search" : (state.expand || state.type !== "all") ? "list" : "overview";
    el.view.setAttribute("data-mode", mode);
    if (mode === "dept") renderDept(d);
    else if (mode === "search") renderSearch();
    else if (mode === "list") renderList();
    else renderOverview();
    var diagramMobile = !!(d && state.view === "diagram" && !wide.matches);
    el.expand.hidden = mode === "search" || diagramMobile;
    el.collapse.hidden = mode === "search" || mode === "overview" || diagramMobile;
    el.expand.textContent = mode === "overview" ? "Show all bodies" : "Expand all";
  }

  /* ---------- filters + totals ---------- */
  function option(select, k, label) {
    var o = document.createElement("option");
    o.value = k;
    o.textContent = label;
    select.appendChild(o);
  }
  function syncFilters(write) {
    el.scope.value = state.scope;
    el.types.value = state.type;
    var active = (state.scope !== "all" ? 1 : 0) + (state.type !== "all" ? 1 : 0);
    el.badge.hidden = !active;
    el.badge.textContent = active ? String(active) : "";
    el.toggle.setAttribute("aria-label", active ? "Filters, " + active + " active" : "Filters");
    el.clear.hidden = !active;
    var cards = el.stats.querySelectorAll("button[data-card]");
    for (var i = 0; i < cards.length; i++) {
      var k = cards[i].getAttribute("data-card");
      var on = !state.dept && (k === "bodies" ? state.expand && state.scope === "all" && state.type === "all" : state.scope === k && !state.expand);
      cards[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
    if (write !== false) writeUrl(false);
  }
  function toResults() {
    var target = document.getElementById("gm-count") || el.view;
    target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }
  function pickCard(k) {
    var wasOn = !state.dept && (k === "bodies" ? state.expand && state.scope === "all" && state.type === "all" : state.scope === k && !state.expand);
    var s = { type: "all", dept: "", org: "", q: "" };
    if (el.search) el.search.value = "";
    if (wasOn) { s.scope = "all"; s.expand = false; }
    else if (k === "bodies") { s.scope = "all"; s.expand = true; }
    else { s.scope = k; s.expand = false; }
    go(s, { scroll: false });
    if (!wasOn) toResults();
  }
  function filterChanged() {
    state.dept = ""; state.org = ""; state.all = false;
    syncFilters(false);
    writeUrl(true);
    render();
  }
  function setAll(v) {
    var mode = el.view.getAttribute("data-mode");
    if (mode === "overview") { if (v) go({ expand: true }, { scroll: false }); return; }
    if (mode === "list" && !v && state.expand && state.type === "all") {
      Array.prototype.forEach.call(el.view.querySelectorAll("[role=tree] > [role=treeitem]"), function (li) { setExpanded(li, false, false); });
      return;
    }
    Array.prototype.forEach.call(el.view.querySelectorAll("[role=treeitem][aria-expanded]"), function (li) {
      if (!v && li.getAttribute("aria-level") === "1") return;
      setExpanded(li, v, false);
    });
    if (v) Array.prototype.forEach.call(el.view.querySelectorAll("[role=tree] > [role=treeitem]"), function (li) { setExpanded(li, true, false); });
  }

  var prepared = false;
  function prepareData() {
    if (prepared) return;
    prepared = true;
    data.types.forEach(function (t) { typeLabel[t.k] = t.l; order.push(t.k); });
    data.roots.forEach(function (r, i) {
      var d = { r: r, slug: slugOf(r.u) || "d" + i };
      depts.push(d);
      bySlug[d.slug] = d;
      byName[r.n] = d;
    });
    var none = { r: { n: "Not attached to a department", k: "none", t: "other", g: {} }, slug: "not-attached" };
    data.unattached.forEach(function (b) { (none.r.g[b.t] = none.r.g[b.t] || []).push(b); });
    depts.push(none);
    bySlug[none.slug] = none;
  }

  function budgetLine(slug, opts) {
    if (!window.GovmapBudget) return null;
    return window.GovmapBudget.line(slug, opts || {});
  }
  function appendBudget(tip, slug) {
    var el = budgetLine(slug, { cls: "gm-dg-tip-bud" });
    if (el) tip.appendChild(el);
  }
  function shortDeptLabel(r) {
    if (r.ab && r.ab.length <= 10) return r.ab;
    return String(r.n || "").replace(/^The /, "").replace(/^(Wales|Scotland) Office$/, "$1");
  }
  function overviewList(kind) {
    prepareData();
    return depts.filter(function (d) { return d.r.k === kind; }).sort(function (a, b) {
      return a.r.n.replace(/^the /i, "").localeCompare(b.r.n.replace(/^the /i, ""));
    });
  }
  function hubCopy(kind) {
    if (kind === "nmd") {
      return { title: "Non-ministerial departments", lines: ["Non-ministerial", "departments"], sub: "", kindLabel: "non-ministerial department" };
    }
    return { title: "UK Government", lines: ["UK Government"], sub: "PM \u00b7 No. 10 \u00b7 Cabinet", kindLabel: "ministerial department" };
  }

  function bindOverviewTips(wrap, nodes) {
    var tip = make("div", "gm-dg-tip");
    tip.hidden = true;
    tip.setAttribute("aria-hidden", "true");
    wrap.appendChild(tip);
    var s = wrap.querySelector("svg");
    function light(n) {
      nodes.forEach(function (m) { if (m.el) m.el.classList.remove("gm-on"); if (m.link) m.link.classList.remove("gm-on"); });
      if (!n || n.kind !== "dept") { if (s) s.classList.remove("gm-dg-dim"); tip.hidden = true; tip.setAttribute("aria-hidden", "true"); return; }
      if (s) s.classList.add("gm-dg-dim");
      n.el.classList.add("gm-on");
      if (n.link) n.link.classList.add("gm-on");
      tip.textContent = "";
      tip.appendChild(make("strong", null, n.full));
      if (n.ab && norm(n.ab) !== norm(n.full)) tip.appendChild(make("span", "gm-ab", n.ab));
      tip.appendChild(make("span", "gm-dg-tip-p", plural(n.count, "body", "bodies")));
      appendBudget(tip, n.slug);
      tip.hidden = false;
      tip.setAttribute("aria-hidden", "false");
      if (wrap.classList.contains("gm-dg-vert")) return;
      if (!s) return;
      var sx = s.getBoundingClientRect(), wx = wrap.getBoundingClientRect();
      var scale = sx.width / (s.viewBox && s.viewBox.baseVal && s.viewBox.baseVal.width ? s.viewBox.baseVal.width : sx.width);
      var left = sx.left - wx.left + (n.x + 12) * scale;
      var top = sx.top - wx.top + n.y * scale + 14;
      left = Math.min(left, wrap.clientWidth - 270);
      tip.style.left = Math.max(4, left) + "px";
      tip.style.top = top + "px";
    }
    nodes.forEach(function (n) {
      if (n.kind !== "dept" || !n.el) return;
      n.el.addEventListener("pointerenter", function () { light(n); });
      n.el.addEventListener("focus", function () { light(n); });
      n.el.addEventListener("blur", function () { light(null); });
    });
    if (s) s.addEventListener("pointerleave", function () { light(null); });
  }
  function bindOverviewDept(g, n, onSelect) {
    g.addEventListener("click", function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (typeof onSelect === "function") {
        e.preventDefault();
        onSelect(n.slug);
      }
    });
  }
  function buildDesktopOverview(kind, list, avail, onSelect) {
    var hub = hubCopy(kind);
    var wrap = make("div", "gm-dg gm-dg-ov");
    var ROW = 26, TOP = 28;
    var W = Math.max(560, Math.min(1000, (avail || 760) - 28));
    var xHub = 96, xDept = Math.round(W * 0.38);
    var nodes = [];
    var root = { id: "n0", kind: "hub", label: hub.title, lines: hub.lines, sub: hub.sub };
    nodes.push(root);
    list.forEach(function (d, i) {
      var n = deptTotal(d);
      var short = shortDeptLabel(d.r);
      nodes.push({
        id: "n" + (i + 1), kind: "dept", parent: root, slug: d.slug, u: d.r.u,
        k: kind === "nmd" ? "nmd" : "ministerial",
        full: d.r.n, ab: d.r.ab || "", count: n,
        label: short + " \u00b7 " + n, row: i
      });
    });
    var leaves = nodes.filter(function (n) { return n.kind === "dept"; });
    leaves.forEach(function (n) { n.y = TOP + n.row * ROW; n.x = xDept; });
    root.x = xHub;
    root.y = leaves.length ? TOP + ((leaves.length - 1) / 2) * ROW : TOP;
    root.w = 168;
    root.h = hub.sub ? 50 : 44;
    var H = Math.max(140, TOP * 2 + Math.max(leaves.length - 1, 0) * ROW);
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: String(W), height: String(H), class: "gm-dg-svg", role: "group", "aria-label": "Org chart of " + hub.title + " and " + plural(list.length, hub.kindLabel, hub.kindLabel + "s") + ". Choose a department to open its org chart." });
    var gl = svg("g", { class: "gm-dg-links" });
    var gn = svg("g", { class: "gm-dg-nodes" });
    s.appendChild(gl);
    s.appendChild(gn);
    leaves.forEach(function (n, i) {
      var x1 = root.x + root.w / 2, y1 = root.y, x2 = n.x - 8, y2 = n.y;
      var m = (x1 + x2) / 2;
      var dpath = "M" + x1 + "," + y1 + " C" + m + "," + y1 + " " + m + "," + y2 + " " + x2 + "," + y2;
      n.link = svg("path", { d: dpath, class: "gm-dg-link", stroke: COLOR[n.k] || "#f0c987", pathLength: "1", fill: "none" });
      n.link.style.animationDelay = Math.min(i * 8, 420) + "ms";
      gl.appendChild(n.link);
    });
    nodes.forEach(function (n) {
      var g;
      if (n.kind === "hub") {
        g = svg("g", { class: "gm-dg-node gm-dg-hub", tabindex: "-1" });
        g.appendChild(svg("rect", { x: String(n.x - n.w / 2), y: String(n.y - n.h / 2), width: String(n.w), height: String(n.h), rx: String(n.h / 2), class: "gm-dg-pill" }));
        if (n.sub) {
          addLines(g, n.lines, n.x, n.y - 6, "gm-dg-pill-t", "middle", 14);
          addLines(g, [n.sub], n.x, n.y + 12, "gm-dg-pill-sub", "middle", 12);
        } else {
          addLines(g, n.lines, n.x, n.y - ((n.lines.length - 1) * 14) / 2 + 4, "gm-dg-pill-t", "middle", 14);
        }
      } else {
        var href = location.pathname + "?dept=" + encodeURIComponent(n.slug) + "&view=org";
        g = svg("a", { href: href, class: "gm-dg-node gm-dg-dept" });
        g.setAttribute("data-slug", n.slug);
        g.setAttribute("aria-label", n.full + (n.ab && norm(n.ab) !== norm(n.full) ? " (" + n.ab + ")" : "") + ", " + plural(n.count, "body", "bodies") + ". Open its org chart.");
        g.appendChild(svg("rect", { x: String(n.x - 10), y: String(n.y - 12), width: String(Math.max(120, W - n.x - 8)), height: "24", class: "gm-dg-hit" }));
        g.appendChild(svg("circle", { cx: String(n.x), cy: String(n.y), r: "6", fill: COLOR[n.k] || "#f0c987", class: "gm-dg-dot" }));
        addLines(g, [n.label], n.x + 12, n.y + 4, "gm-dg-body-t", null, 14);
        bindOverviewDept(g, n, onSelect);
      }
      n.el = g;
      g.style.animationDelay = Math.min(nodes.indexOf(n) * 8, 420) + "ms";
      gn.appendChild(g);
    });
    wrap.appendChild(s);
    bindOverviewTips(wrap, nodes);
    return wrap;
  }
  function buildMobileOverview(kind, list, avail, onSelect) {
    var hub = hubCopy(kind);
    var wrap = make("div", "gm-dg gm-dg-vert gm-dg-ov");
    var PAD = 10, GAP_X = 10, GAP_Y = 6, MIN_COL = 138, LH = 15, TAP = 32;
    var W = Math.max(248, Math.floor(avail || 300));
    var COLS = Math.max(1, Math.floor((W - 2 * PAD + GAP_X) / (MIN_COL + GAP_X)));
    var colW = (W - 2 * PAD - (COLS - 1) * GAP_X) / COLS;
    var labelW = Math.max(72, colW - 26);
    var maxChars = Math.max(8, Math.floor(labelW / 6.9));
    var nodes = [];
    var root = { id: "n0", kind: "hub", label: hub.title, lines: hub.lines, sub: hub.sub };
    nodes.push(root);
    var leaves = [];
    list.forEach(function (d) {
      var n = deptTotal(d);
      var short = shortDeptLabel(d.r);
      var label = short + " \u00b7 " + n;
      var bn = {
        id: "n" + nodes.length, kind: "dept", parent: root, slug: d.slug, u: d.r.u,
        k: kind === "nmd" ? "nmd" : "ministerial",
        full: d.r.n, ab: d.r.ab || "", count: n,
        label: label, lines: wrapLines(label, maxChars)
      };
      bn.h = Math.max(TAP, 8 + bn.lines.length * LH);
      nodes.push(bn);
      leaves.push(bn);
    });
    var colItems = [], colY = [], i;
    for (i = 0; i < COLS; i++) { colItems.push([]); colY.push(0); }
    leaves.forEach(function (bn, idx) {
      var c = idx % COLS;
      // fill columns in order but keep them even: put the next item in the shortest column
      c = 0;
      var m = colY[0];
      for (i = 1; i < COLS; i++) if (colY[i] < m) { m = colY[i]; c = i; }
      bn.col = c;
      colItems[c].push(bn);
      colY[c] += bn.h + GAP_Y;
    });
    var hubLines = hub.sub ? hub.lines.concat([hub.sub]) : hub.lines;
    var hubMax = Math.max(12, Math.floor(Math.min(W - 24, 260) / 7.2));
    var drawnHub = [];
    hub.lines.forEach(function (line) { wrapLines(line, hubMax).forEach(function (w) { drawnHub.push(w); }); });
    var hasSub = !!hub.sub;
    var deptH = Math.max(40, 18 + drawnHub.length * 15 + (hasSub ? 14 : 0));
    var longest = 0;
    drawnHub.concat(hub.sub ? [hub.sub] : []).forEach(function (l) { if (l.length > longest) longest = l.length; });
    var deptW = Math.min(W - 16, Math.max(150, 28 + longest * 7.2));
    root.x = W / 2;
    root.y = PAD + deptH / 2;
    root.deptW = deptW;
    root.deptH = deptH;
    root.lines = drawnHub;
    root.h = deptH;
    var typeTop = PAD + deptH + 28;
    for (i = 0; i < COLS; i++) {
      var x0 = PAD + i * (colW + GAP_X);
      var y = typeTop;
      colItems[i].forEach(function (bn) {
        bn.x = x0 + 9;
        bn.y = y + bn.h / 2;
        bn.x0 = x0;
        y += bn.h + GAP_Y;
      });
    }
    var maxCol = 0;
    for (i = 0; i < COLS; i++) if (colY[i] > maxCol) maxCol = colY[i];
    var H = Math.max(PAD * 2 + deptH, typeTop + maxCol + PAD);
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: String(W), height: String(H), class: "gm-dg-svg", role: "group", "aria-label": "Org chart of " + hub.title + " and " + plural(list.length, hub.kindLabel, hub.kindLabel + "s") + ". Choose a department to open its org chart." });
    var gl = svg("g", { class: "gm-dg-links" });
    var gn = svg("g", { class: "gm-dg-nodes" });
    s.appendChild(gl);
    s.appendChild(gn);
    leaves.forEach(function (n, idx) {
      var x1 = root.x, y1 = root.y + root.deptH / 2;
      var x2 = n.x, y2 = n.y - n.h / 2 + 1;
      var dy = Math.max(18, (y2 - y1) * 0.45);
      var dpath = "M" + x1 + "," + y1 + " C" + x1 + "," + (y1 + dy) + " " + x2 + "," + (y2 - dy) + " " + x2 + "," + y2;
      n.link = svg("path", { d: dpath, class: "gm-dg-link", stroke: COLOR[n.k] || "#f0c987", pathLength: "1", fill: "none" });
      n.link.style.animationDelay = Math.min(idx * 8, 420) + "ms";
      gl.appendChild(n.link);
    });
    nodes.forEach(function (n) {
      var g;
      if (n.kind === "hub") {
        g = svg("g", { class: "gm-dg-node gm-dg-hub", tabindex: "-1" });
        g.appendChild(svg("rect", { x: String(n.x - n.deptW / 2), y: String(n.y - n.deptH / 2), width: String(n.deptW), height: String(n.deptH), class: "gm-dg-hit" }));
        g.appendChild(svg("rect", { x: String(n.x - n.deptW / 2), y: String(n.y - n.deptH / 2), width: String(n.deptW), height: String(n.deptH), rx: String(n.deptH / 2), class: "gm-dg-pill" }));
        var textTop = n.y - n.deptH / 2 + 16;
        addLines(g, n.lines, n.x, textTop, "gm-dg-pill-t", "middle", 15);
        if (n.sub) addLines(g, [n.sub], n.x, textTop + n.lines.length * 15 + 2, "gm-dg-pill-sub", "middle", 12);
      } else {
        var href = location.pathname + "?dept=" + encodeURIComponent(n.slug) + "&view=org";
        g = svg("a", { href: href, class: "gm-dg-node gm-dg-dept" });
        g.setAttribute("data-slug", n.slug);
        g.setAttribute("aria-label", n.full + (n.ab && norm(n.ab) !== norm(n.full) ? " (" + n.ab + ")" : "") + ", " + plural(n.count, "body", "bodies") + ". Open its org chart.");
        g.appendChild(svg("rect", { x: String(n.x0), y: String(n.y - n.h / 2), width: String(colW), height: String(n.h), class: "gm-dg-hit" }));
        g.appendChild(svg("circle", { cx: String(n.x), cy: String(n.y), r: "6", fill: COLOR[n.k] || "#f0c987", class: "gm-dg-dot" }));
        addLines(g, n.lines, n.x + 12, n.y - ((n.lines.length - 1) * LH) / 2 + 4, "gm-dg-body-t", null, LH);
        bindOverviewDept(g, n, onSelect);
      }
      n.el = g;
      g.style.animationDelay = Math.min(nodes.indexOf(n) * 8, 420) + "ms";
      gn.appendChild(g);
    });
    wrap.appendChild(s);
    bindOverviewTips(wrap, nodes);
    return wrap;
  }
  function buildOverviewDiagram(kind, avail, onSelect) {
    var list = overviewList(kind);
    if (!wide.matches) return buildMobileOverview(kind, list, avail, onSelect);
    return buildDesktopOverview(kind, list, avail, onSelect);
  }
  function renderOverviewOrg(container, opts) {
    prepareData();
    if (!container) return;
    container.textContent = "";
    var kind = (opts && opts.kind) === "nmd" ? "nmd" : "min";
    var hub = hubCopy(kind);
    if (!SVGNS) {
      container.appendChild(make("p", "error", "This org chart needs SVG support."));
      return;
    }
    var box = make("div", "gm-org-view");
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Org chart of " + hub.title);
    box.setAttribute("data-overview", "1");
    var dg = make("div", "gm-dv-dg");
    box.appendChild(dg);
    container.appendChild(box);
    var padL = 0, padR = 0;
    if (window.getComputedStyle) {
      var cs = window.getComputedStyle(dg);
      padL = parseFloat(cs.paddingLeft) || 0;
      padR = parseFloat(cs.paddingRight) || 0;
    }
    var avail = Math.max(248, dg.clientWidth - padL - padR);
    var diagram = buildOverviewDiagram(kind, wide.matches ? dg.clientWidth : avail, opts && opts.onSelect);
    dg.appendChild(diagram);
  }

  function renderOrgChart(container, slug) {
    prepareData();
    if (!container) return;
    container.textContent = "";
    var d = bySlug[slug];
    if (!d) {
      container.appendChild(make("p", "error", "That department is not in this snapshot."));
      return;
    }
    if (!SVGNS) {
      container.appendChild(make("p", "error", "This org chart needs SVG support."));
      return;
    }
    var box = make("div", "gm-org-view");
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Org chart of " + d.r.n);
    var dg = make("div", "gm-dv-dg");
    box.appendChild(dg);
    container.appendChild(box);
    var padL = 0, padR = 0;
    if (window.getComputedStyle) {
      var cs = window.getComputedStyle(dg);
      padL = parseFloat(cs.paddingLeft) || 0;
      padR = parseFloat(cs.paddingRight) || 0;
    }
    var avail = Math.max(248, dg.clientWidth - padL - padR);
    var diagram = buildDiagram(d, wide.matches ? dg.clientWidth : avail);
    dg.appendChild(diagram);
  }

  var resolveOrgReady, rejectOrgReady;
  var orgReady = new Promise(function (res, rej) { resolveOrgReady = res; rejectOrgReady = rej; });
  window.GovmapOrg = {
    ready: orgReady,
    render: function (container, slug) {
      return orgReady.then(function () { renderOrgChart(container, slug); });
    },
    renderOverview: function (container, opts) {
      return orgReady.then(function () { renderOverviewOrg(container, opts || {}); });
    }
  };

  function setup() {
    prepareData();
    var c = data.counts || {};
    [["min", "Ministerial departments", c.ministerial, "Show ministerial departments"],
     ["nmd", "Non-ministerial departments", c.nonMinisterial, "Show non-ministerial departments"],
     ["bodies", "Agencies and public bodies", c.bodies, "Show every department with all its bodies"],
     ["dev", "Devolved governments", c.devolved, "Show devolved governments"]].forEach(function (p) {
      var b = make("button", "gm-stat");
      b.type = "button";
      b.setAttribute("data-card", p[0]);
      b.setAttribute("aria-pressed", "false");
      b.title = p[3];
      b.appendChild(make("span", "gm-stat-n", p[2] == null ? "\u2013" : p[2]));
      b.appendChild(make("span", "gm-stat-l", p[1]));
      b.addEventListener("click", function () { pickCard(p[0]); });
      el.stats.appendChild(b);
    });

    SCOPES.forEach(function (s) { option(el.scope, s.k, s.l); });
    option(el.types, "all", "All types");
    data.types.forEach(function (t) {
      var n = (c.byType || {})[t.k];
      if (n) option(el.types, t.k, t.l + " (" + n + ")");
    });
    el.scope.addEventListener("change", function () { state.scope = el.scope.value; filterChanged(); });
    el.types.addEventListener("change", function () { state.type = el.types.value; filterChanged(); });
    el.clear.addEventListener("click", function () {
      state.scope = "all"; state.type = "all"; state.expand = false;
      filterChanged();
      el.scope.focus();
    });
    el.toggle.addEventListener("click", function () {
      var o = el.toggle.getAttribute("aria-expanded") !== "true";
      el.toggle.setAttribute("aria-expanded", o ? "true" : "false");
      el.panel.hidden = !o;
    });
    el.form.addEventListener("submit", function (e) { e.preventDefault(); });
    el.search.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var q = norm(el.search.value);
        if (q === state.q) return;
        var wasDept = !!state.dept;
        state.q = q; state.all = false;
        if (wasDept && q) { state.dept = ""; state.org = ""; syncFilters(false); writeUrl(true); }
        render();
      }, 150);
    });
    el.expand.addEventListener("click", function () { setAll(true); });
    el.collapse.addEventListener("click", function () { setAll(false); });
    el.view.addEventListener("click", onNavClick);
    window.addEventListener("popstate", function (e) {
      readUrl();
      state.q = state.dept ? "" : ((e.state && typeof e.state.q === "string") ? e.state.q : "");
      el.search.value = state.q;
      syncFilters(false);
      render();
    });
    if (wide.addEventListener) wide.addEventListener("change", function () { if (state.dept && state.view === "diagram") render(); });
    window.addEventListener("resize", function () {
      if (!state.dept || state.view !== "diagram" || wide.matches) return;
      var box = el.view.querySelector(".gm-dv-dg");
      var w = box ? box.clientWidth : 0;
      if (!w || Math.abs(w - lastDiagramW) < 6) return;
      lastDiagramW = w;
      render();
    });

    readUrl();
    syncFilters(false);
    writeUrl(false);
    credit();
    render();
    if (state.org) afterNav();
  }

  function credit() {
    if (!el.credit) return;
    var s = data.source || {};
    el.credit.textContent = "";
    el.credit.appendChild(document.createTextNode("Organisation data from "));
    var src = safeUrl(s.url, GOVUK_HOST);
    if (src) {
      var a = make("a", null, "GOV.UK");
      a.href = src; a.target = "_blank"; a.rel = "noopener noreferrer";
      el.credit.appendChild(a);
    } else {
      el.credit.appendChild(document.createTextNode("GOV.UK"));
    }
    el.credit.appendChild(document.createTextNode(", contains public sector information licensed under the "));
    var lic = safeUrl(s.licenceUrl, LICENCE_HOST);
    if (lic) {
      var l = make("a", null, "Open Government Licence v3.0");
      l.href = lic; l.target = "_blank"; l.rel = "noopener noreferrer license";
      el.credit.appendChild(l);
    } else {
      el.credit.appendChild(document.createTextNode("Open Government Licence v3.0"));
    }
    var when = "";
    var dt = new Date(data.generated);
    if (!isNaN(dt.getTime())) {
      try {
        when = dt.toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " UK time";
      } catch (e) { when = dt.toISOString().slice(0, 10); }
    }
    el.credit.appendChild(document.createTextNode(". Snapshot " + (when || "date unknown") + "."));
  }

  function fail() {
    el.view.textContent = "";
    el.view.appendChild(make("p", "error", "The government map could not load. Please try again later."));
  }

  fetch(DATA_URL, { credentials: "same-origin" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      if (!d || !Array.isArray(d.roots) || !Array.isArray(d.types)) throw new Error("bad data");
      d.unattached = Array.isArray(d.unattached) ? d.unattached : [];
      data = d;
      prepareData();
      if (document.getElementById("gm-tree")) setup();
      resolveOrgReady();
    })
    .catch(function (e) {
      if (window.console) console.error(e);
      if (el.view) fail();
      rejectOrgReady(e);
    });
})();
