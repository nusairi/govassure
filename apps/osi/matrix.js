/* Protection matrix. Everything stays in this browser (localStorage); nothing is uploaded.
   No dependencies. All user text is written with textContent / value, never as HTML. */
(function () {
  "use strict";
  var D = window.MATRIX_DATA;
  /* LAYERS is a top-level const in data.js (shared with the rings page) */
  var L = (typeof LAYERS !== "undefined") ? LAYERS : [];
  if (!D || !L.length) return;

  var STORE_KEY = "ga-osi-matrix-v1";
  var EX = /^example:\s*/i;
  var byN = {};
  L.forEach(function (l) { byN[l.n] = l; });
  var ORDER = D.order.filter(function (n) { return byN[n]; });
  var RATE_LABEL = {};
  D.ratings.forEach(function (r) { RATE_LABEL[r.id] = r.label; });
  var FIELDS = [
    { k: "assets", label: "What it protects" },
    { k: "threats", label: "Main threats" },
    { k: "controls", label: "Controls we use" },
    { k: "owner", label: "Owner" },
    { k: "ncsc", label: "NCSC guidance" },
    { k: "gaps", label: "Gaps / actions" },
    { k: "rating", label: "Confidence" }
  ];
  var $ = function (id) { return document.getElementById(id); };

  function layerName(n) { return byN[n].name; }
  function layerTag(n) { return "L" + n; }

  /* ---------- state ---------- */
  function exampleRow(n) {
    var r = D.rows[n] || {};
    return {
      assets: r.assets || "",
      threats: "Example: " + (byN[n].threats || []).join(", "),
      controls: (r.controls || []).slice(),
      owner: r.owner || "",
      gaps: r.gaps || "",
      rating: r.rating || "",
      ratingEx: !!r.rating
    };
  }
  function blankRow() { return { assets: "", threats: "", controls: [], owner: "", gaps: "", rating: "", ratingEx: false }; }
  function examples() { var s = { v: 1, rows: {} }; ORDER.forEach(function (n) { s.rows[n] = exampleRow(n); }); return s; }
  function clean(row) {
    var b = blankRow();
    if (!row || typeof row !== "object") return b;
    ["assets", "threats", "owner", "gaps"].forEach(function (k) { if (typeof row[k] === "string") b[k] = row[k].slice(0, 4000); });
    if (Array.isArray(row.controls)) b.controls = row.controls.filter(function (c) { return typeof c === "string"; }).slice(0, 40).map(function (c) { return c.slice(0, 1000); });
    if (Object.prototype.hasOwnProperty.call(RATE_LABEL, row.rating)) b.rating = row.rating;
    b.ratingEx = !!row.ratingEx;
    return b;
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return examples();
      var o = JSON.parse(raw), s = { v: 1, rows: {} };
      ORDER.forEach(function (n) { s.rows[n] = clean(o && o.rows && o.rows[n]); });
      return s;
    } catch (e) { return examples(); }
  }
  var saveTimer = 0;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); status("Saved in this browser."); }
      catch (e) { status("Could not save: this browser is blocking local storage."); }
    }, 250);
  }
  function saveNow() { clearTimeout(saveTimer); try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }
  var state = load();
  var filter = { layers: {}, show: "all" };

  var statusTimer = 0;
  function status(msg) {
    var s = $("mxStatus"); if (!s) return;
    s.textContent = msg; clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { s.textContent = ""; }, 4000);
  }

  /* ---------- theme (same behaviour as the other OSI pages) ---------- */
  function applyTheme(t) {
    if (t !== "dark" && t !== "light" && t !== "auto") t = "dark";
    try { localStorage.setItem("osi-theme", t); } catch (e) {}
    var r = document.documentElement;
    var light = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches;
    r.setAttribute("data-theme-pref", t);
    r.setAttribute("data-theme", t === "auto" ? (light ? "light" : "dark") : t);
    var seg = $("themeSeg");
    if (seg) seg.querySelectorAll("button[data-set]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-set") === t ? "true" : "false"); });
  }
  function initTheme() {
    var pref = "dark";
    try { pref = localStorage.getItem("osi-theme") || "dark"; } catch (e) {}
    applyTheme(pref);
    var seg = $("themeSeg");
    if (seg) seg.addEventListener("click", function (ev) { var b = ev.target.closest("button[data-set]"); if (b) applyTheme(b.getAttribute("data-set")); });
  }

  /* ---------- helpers ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function grow(t) {
    if (!t.offsetParent) return; /* hidden (filtered row or print): measure later */
    t.style.height = "auto"; t.style.height = (t.scrollHeight + 2) + "px";
  }
  function growAll() { $("mxBody").querySelectorAll("textarea").forEach(grow); }
  function isEx(s) { return EX.test(s || ""); }

  /* ---------- table ---------- */
  function textCell(n, k, label) {
    var id = "mx-" + k + "-" + n;
    var t = el("textarea", { id: id, rows: 2, "data-n": n, "data-k": k, class: "mx-ta" });
    t.value = state.rows[n][k];
    if (isEx(t.value)) t.classList.add("is-ex");
    var lab = el("label", { for: id, class: "sr-only", text: label + " for " + layerTag(n) + " " + layerName(n) });
    return el("td", { "data-label": label, class: "mx-c-" + k }, [lab, t]);
  }
  function controlItem(n, i, text) {
    var id = "mx-ctl-" + n + "-" + i;
    var inp = el("textarea", { id: id, rows: 1, "data-n": n, "data-k": "control", "data-i": i, class: "mx-ta mx-ctl" });
    inp.value = text;
    if (isEx(text)) inp.classList.add("is-ex");
    var lab = el("label", { for: id, class: "sr-only", text: "Control " + (i + 1) + " for " + layerTag(n) + " " + layerName(n) });
    var rm = el("button", { type: "button", class: "mx-rm", "data-rm": i, "data-n": n, "aria-label": "Remove control " + (i + 1) + " from " + layerTag(n), title: "Remove this control", text: "×" });
    return el("li", null, [lab, inp, rm]);
  }
  function controlsCell(n) {
    var ul = el("ul", { class: "mx-ctls", id: "mx-ctls-" + n });
    state.rows[n].controls.forEach(function (c, i) { ul.appendChild(controlItem(n, i, c)); });
    var add = el("button", { type: "button", class: "mx-add", "data-add": n, text: "+ Add control", "aria-label": "Add a control to " + layerTag(n) + " " + layerName(n) });
    return el("td", { "data-label": "Controls we use", class: "mx-c-controls" }, [ul, el("div", { class: "mx-addrow" }, [add, toolPicker(n)])]);
  }
  /* quick tool picker: type your own, "Our tools" (any vendor), then the Microsoft starter set */
  function toolPicker(n) {
    var MS = window.MS_TOOLS, OT = window.OUR_TOOLS;
    if (!MS) return null;
    n = +n;
    var id = "mx-tool-" + n;
    var s = el("select", { id: id, class: "mx-toolpick", "data-pick": n });
    s.appendChild(el("option", { value: "", text: "+ Add a tool…" }));
    if (OT) s.appendChild(el("option", { value: "__new", text: "✎ Type your own tool…" }));
    var seen = {};
    function group(label, list, val, txt) {
      var g = el("optgroup", { label: label });
      list.forEach(function (t) { var v = val(t); if (seen[v]) return; seen[v] = 1; g.appendChild(el("option", { value: v, text: txt(t) })); });
      if (g.children.length) s.appendChild(g);
    }
    if (OT) {
      var ourVal = function (t) { return "our:" + t.id; }, ourTxt = function (t) { return OT.label(t); };
      group("Our tools at " + layerTag(n), OT.forLayer(n), ourVal, ourTxt);
      group("Our tools (other layers)", OT.list(), ourVal, ourTxt);
    }
    var msVal = function (t) { return t.id; }, msTxt = function (t) { return t.name + " (" + t.tag + ")"; };
    group("Microsoft, commonly used at " + layerTag(n), MS.toolsForLayer(n), msVal, msTxt);
    group("Microsoft, across all layers", MS.toolsForLayer("x"), msVal, msTxt);
    group("Other Microsoft tools", MS.tools, msVal, msTxt);
    var lab = el("label", { for: id, class: "sr-only", text: "Add a tool to " + layerTag(n) + " " + layerName(n) });
    return el("span", { class: "mx-pickwrap" }, [lab, s]);
  }
  function refreshPickers() {
    document.querySelectorAll("#mxBody .mx-pickwrap").forEach(function (w) {
      var sel = w.querySelector("select"), n = sel.getAttribute("data-pick"), had = document.activeElement === sel;
      var fresh = toolPicker(+n); w.parentNode.replaceChild(fresh, w);
      if (had) fresh.querySelector("select").focus();
    });
  }
  function addControlText(n, text, msg) {
    state.rows[n].controls.push(text);
    var old = $("mx-ctls-" + n), td = old.parentNode;
    var fresh = controlsCell(n); td.parentNode.replaceChild(fresh, td);
    fresh.querySelectorAll("textarea").forEach(grow);
    var pick = fresh.querySelector(".mx-toolpick"); if (pick) pick.focus();
    status(msg);
    save(); renderPrintSoon();
  }
  function addTool(n, val, sel) {
    var OT = window.OUR_TOOLS, MS = window.MS_TOOLS;
    if (val === "__new" && OT) {
      sel.value = "";
      OT.openForm({ layers: [n], onSave: function (t) { addControlText(n, OT.label(t), t.name + " saved to Our tools and added to " + layerTag(n) + "."); } });
      return;
    }
    if (val.indexOf("our:") === 0 && OT) {
      var o = OT.find(val.slice(4)); if (o) addControlText(n, OT.label(o), OT.label(o) + " added to " + layerTag(n) + ".");
      return;
    }
    var t = MS && MS.byId[val];
    if (t) addControlText(n, t.name + " (" + t.tag + ")", t.name + " added to " + layerTag(n) + ".");
  }
  function ncscCell(n) {
    var ul = el("ul", { class: "mx-refs" });
    ((D.rows[n] || {}).ncsc || []).forEach(function (r) {
      ul.appendChild(el("li", null, [el("a", { href: r.url, target: "_blank", rel: "noopener noreferrer", "data-ga-keep": "" }, [r.label, el("span", { class: "sr-only", text: " (NCSC, opens in a new tab)" }), el("span", { "aria-hidden": "true", text: " ↗" })])]));
    });
    return el("td", { "data-label": "NCSC guidance", class: "mx-c-ncsc" }, [ul]);
  }
  function ratingCell(n) {
    var id = "mx-rating-" + n;
    var s = el("select", { id: id, "data-n": n, "data-k": "rating", class: "mx-rate" });
    D.ratings.forEach(function (r) { var o = el("option", { value: r.id, text: r.label }); if (state.rows[n].rating === r.id) o.selected = true; s.appendChild(o); });
    var lab = el("label", { for: id, class: "sr-only", text: "Confidence for " + layerTag(n) + " " + layerName(n) });
    var td = el("td", { "data-label": "Confidence", class: "mx-c-rating" }, [lab, s]);
    paintRating(td, state.rows[n].rating);
    return td;
  }
  function paintRating(td, v) { td.setAttribute("data-rating", v || "unrated"); }
  function layerCell(n) {
    var l = byN[n];
    var learn = (D.rows[n] || {}).learn;
    var links = el("div", { class: "mx-learn" });
    if (learn && learn.length) learn.forEach(function (x) { links.appendChild(el("a", { href: x.href, text: x.label })); });
    else links.appendChild(el("a", { href: "/", title: "Opens the OSI rings. Press " + n + " there to select this layer.", text: "Explain on the OSI rings (key " + n + ")" }));
    return el("th", { scope: "row", class: "mx-layer", "data-label": "Layer" }, [
      el("span", { class: "mx-tag", text: layerTag(n) }),
      el("span", { class: "mx-lname", text: l.name }),
      links
    ]);
  }
  function rowEl(n) {
    var tr = el("tr", { id: "mx-row-" + n, "data-n": n, class: "mx-row" });
    tr.style.setProperty("--c", byN[n].colour);
    tr.appendChild(layerCell(n));
    tr.appendChild(textCell(n, "assets", "What it protects"));
    tr.appendChild(textCell(n, "threats", "Main threats"));
    tr.appendChild(controlsCell(n));
    tr.appendChild(textCell(n, "owner", "Owner"));
    tr.appendChild(ncscCell(n));
    tr.appendChild(textCell(n, "gaps", "Gaps / actions"));
    tr.appendChild(ratingCell(n));
    return tr;
  }
  function render() {
    var body = $("mxBody");
    body.textContent = "";
    ORDER.forEach(function (n) { body.appendChild(rowEl(n)); });
    applyFilter();
    renderPrint();
  }

  /* ---------- filters ---------- */
  function rowVisible(n) {
    var any = Object.keys(filter.layers).length > 0;
    if (any && !filter.layers[n]) return false;
    if (filter.show === "work") { var r = state.rows[n].rating; if (r === "good" || r === "na") return false; }
    return true;
  }
  function visibleOrder() { return ORDER.filter(rowVisible); }
  function applyFilter() {
    ORDER.forEach(function (n) { var tr = $("mx-row-" + n); if (tr) tr.hidden = !rowVisible(n); });
    growAll();
    var box = $("mxLayerFilter");
    box.querySelectorAll("button[data-f]").forEach(function (b) {
      var f = b.getAttribute("data-f");
      var on = f === "all" ? Object.keys(filter.layers).length === 0 : !!filter.layers[f];
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    renderPrint();
  }
  function buildFilter() {
    var box = $("mxLayerFilter");
    box.appendChild(el("span", { class: "mx-flabel", text: "Layers" }));
    box.appendChild(el("button", { type: "button", class: "mx-chip mx-chip--all", "data-f": "all", "aria-pressed": "true", text: "All" }));
    ORDER.forEach(function (n) {
      var b = el("button", { type: "button", class: "mx-chip", "data-f": String(n), "aria-pressed": "false", title: layerName(n), "aria-label": "Show layer " + n + " " + layerName(n) }, [layerTag(n)]);
      b.style.setProperty("--c", byN[n].colour);
      box.appendChild(b);
    });
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-f]"); if (!b) return;
      var f = b.getAttribute("data-f");
      if (f === "all") filter.layers = {};
      else if (filter.layers[f]) delete filter.layers[f];
      else filter.layers[f] = true;
      applyFilter();
    });
    $("mxShow").addEventListener("change", function (e) { filter.show = e.target.value; applyFilter(); });
  }

  /* ---------- editing ---------- */
  function bindTable() {
    var body = $("mxBody");
    body.addEventListener("input", function (e) {
      var t = e.target, n = t.getAttribute("data-n"), k = t.getAttribute("data-k");
      if (n == null || !state.rows[n]) return;
      if (k === "control") state.rows[n].controls[+t.getAttribute("data-i")] = t.value;
      else if (k === "rating") return;
      else state.rows[n][k] = t.value;
      if (t.tagName === "TEXTAREA") { grow(t); t.classList.toggle("is-ex", isEx(t.value)); }
      save(); renderPrintSoon();
    });
    body.addEventListener("change", function (e) {
      var t = e.target;
      if (t.hasAttribute("data-pick")) { if (t.value) addTool(t.getAttribute("data-pick"), t.value, t); return; }
      if (t.getAttribute("data-k") !== "rating") return;
      var n = t.getAttribute("data-n");
      state.rows[n].rating = t.value; state.rows[n].ratingEx = false;
      paintRating(t.closest("td"), t.value);
      save(); applyFilter();
    });
    body.addEventListener("click", function (e) {
      var add = e.target.closest("button[data-add]");
      if (add) {
        var n = add.getAttribute("data-add");
        state.rows[n].controls.push("");
        var ul = $("mx-ctls-" + n), i = state.rows[n].controls.length - 1;
        var li = controlItem(n, i, ""); ul.appendChild(li);
        li.querySelector("textarea").focus();
        save(); return;
      }
      var rm = e.target.closest("button[data-rm]");
      if (rm) {
        var m = rm.getAttribute("data-n"), idx = +rm.getAttribute("data-rm");
        state.rows[m].controls.splice(idx, 1);
        var old = $("mx-ctls-" + m), td = old.parentNode;
        var fresh = controlsCell(m); td.parentNode.replaceChild(fresh, td);
        fresh.querySelectorAll("textarea").forEach(grow);
        var next = fresh.querySelectorAll("textarea")[Math.min(idx, state.rows[m].controls.length - 1)];
        (next || fresh.querySelector(".mx-add")).focus();
        status("Control removed."); save(); renderPrintSoon();
      }
    });
    body.addEventListener("keydown", function (e) {
      /* Enter in a control adds the next one; Shift+Enter keeps a newline */
      var t = e.target;
      if (e.key === "Enter" && !e.shiftKey && t.getAttribute("data-k") === "control") {
        e.preventDefault();
        var btn = t.closest("td").querySelector(".mx-add"); if (btn) btn.click();
      }
    });
    window.addEventListener("resize", growAll);
    window.addEventListener("afterprint", growAll);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(growAll);
  }

  /* ---------- bulk actions ---------- */
  function clearExamples() {
    if (!confirm("Remove every entry that starts with “Example:”? Your own entries are kept.")) return;
    ORDER.forEach(function (n) {
      var r = state.rows[n];
      ["assets", "threats", "owner", "gaps"].forEach(function (k) { if (isEx(r[k])) r[k] = ""; });
      r.controls = r.controls.filter(function (c) { return !isEx(c); });
      if (r.ratingEx) { r.rating = ""; r.ratingEx = false; }
    });
    saveNow(); render(); status("Examples cleared. Your own entries were kept.");
  }
  function startBlank() {
    if (!confirm("Clear the whole matrix in this browser and start blank? Export a CSV first if you want a copy.")) return;
    state = { v: 1, rows: {} }; ORDER.forEach(function (n) { state.rows[n] = blankRow(); });
    saveNow(); render(); status("Matrix cleared. Start typing to fill it in.");
  }
  function restore() {
    if (!confirm("Replace the whole matrix with the generic examples? Your entries in this browser will be lost.")) return;
    state = examples(); saveNow(); render(); status("Examples restored.");
  }

  /* ---------- CSV ---------- */
  var HEAD = ["Layer", "Layer name", "What it protects", "Main threats", "Controls we use", "Owner", "NCSC guidance", "Gaps / actions", "Confidence"];
  function guard(s) { s = s == null ? "" : String(s); return /^[=+\-@\t\r]/.test(s) ? "'" + s : s; }
  function unguard(s) { return /^'[=+\-@\t\r]/.test(s) ? s.slice(1) : s; }
  function csvCell(s) { s = guard(s); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function toCsv() {
    var rows = [HEAD];
    ORDER.forEach(function (n) {
      var r = state.rows[n];
      rows.push([layerTag(n), layerName(n), r.assets, r.threats,
        r.controls.filter(function (c) { return c.trim(); }).join("\n"), r.owner,
        ((D.rows[n] || {}).ncsc || []).map(function (x) { return x.label + " " + x.url; }).join("\n"),
        r.gaps, r.rating ? RATE_LABEL[r.rating] : ""]);
    });
    return rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n") + "\r\n";
  }
  function download(name, parts, type) {
    var blob = new Blob(parts, { type: type });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }
  function stamp() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function exportCsv(excel) {
    saveNow();
    var csv = toCsv();
    if (excel) download("protection-matrix-" + stamp() + "-excel.csv", ["\uFEFF" + csv], "text/csv;charset=utf-8");
    else download("protection-matrix-" + stamp() + ".csv", [csv], "text/csv;charset=utf-8");
    status(excel ? "Excel-friendly CSV downloaded (UTF-8 with BOM)." : "CSV downloaded.");
  }
  function parseCsv(text) {
    text = text.replace(/^\uFEFF/, "");
    var rows = [], row = [], cell = "", q = false, i = 0, c;
    for (; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (x) { return x.trim() !== ""; }); });
  }
  function importCsv(text) {
    var rows = parseCsv(text);
    if (!rows.length) throw new Error("The file is empty.");
    var h = rows[0].map(function (x) { return x.trim().toLowerCase(); });
    var col = {}; HEAD.forEach(function (name) { col[name] = h.indexOf(name.toLowerCase()); });
    if (col["Layer"] < 0 || col["What it protects"] < 0) throw new Error("This doesn’t look like a protection matrix CSV (missing the Layer and What it protects columns).");
    var byLabel = {}; D.ratings.forEach(function (r) { byLabel[r.label.toLowerCase()] = r.id; });
    var next = { v: 1, rows: {} }; ORDER.forEach(function (n) { next.rows[n] = clean(state.rows[n]); });
    var count = 0;
    rows.slice(1).forEach(function (r) {
      var get = function (name) { var i = col[name]; return i >= 0 && r[i] != null ? unguard(r[i]) : ""; };
      var m = /^\s*L?\s*(\d)\s*$/i.exec(get("Layer"));
      if (!m || !byN[+m[1]] || ORDER.indexOf(+m[1]) < 0) return;
      var n = +m[1];
      var rating = byLabel[(get("Confidence") || "").trim().toLowerCase()] || "";
      next.rows[n] = clean({
        assets: get("What it protects"), threats: get("Main threats"), owner: get("Owner"), gaps: get("Gaps / actions"),
        controls: get("Controls we use").split(/\r?\n/).map(function (s) { return unguard(s.trim()); }).filter(Boolean),
        rating: rating, ratingEx: false
      });
      count++;
    });
    if (!count) throw new Error("No layer rows (L0 to L8) were found in the file.");
    state = next; saveNow(); render();
    return count;
  }
  function bindImport() {
    var inp = $("mxImport");
    inp.addEventListener("change", function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      if (f.size > 1024 * 1024) { status("That file is too large (over 1 MB)."); inp.value = ""; return; }
      if (!confirm("Replace the matching layers in this browser with the contents of “" + f.name + "”?")) { inp.value = ""; return; }
      var rd = new FileReader();
      rd.onload = function () {
        try { var c = importCsv(String(rd.result || "")); status("Imported " + c + " layer" + (c === 1 ? "" : "s") + " from " + f.name + "."); }
        catch (err) { status("Import failed: " + err.message); }
        inp.value = "";
      };
      rd.onerror = function () { status("Could not read that file."); inp.value = ""; };
      rd.readAsText(f);
    });
  }

  /* ---------- print view (static, built from state) ---------- */
  var printTimer = 0;
  function renderPrintSoon() { clearTimeout(printTimer); printTimer = setTimeout(renderPrint, 300); }
  function renderPrint() {
    var box = $("mxPrintView"); if (!box) return;
    box.textContent = "";
    var d = new Date();
    box.appendChild(el("div", { class: "mx-pr-head" }, [
      el("h2", { text: "Protection matrix" }),
      el("p", { text: "OSI Security Rings · osi.govassured.com/matrix · printed " + d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) + ". Entries starting “Example:” are generic examples." })
    ]));
    var t = el("table", { class: "mx-pr-table" });
    var hr = el("tr"); HEAD.slice(1).forEach(function (hh, i) { hr.appendChild(el("th", { text: i === 0 ? "Layer" : hh })); });
    t.appendChild(el("thead", null, [hr]));
    var tb = el("tbody");
    visibleOrder().forEach(function (n) {
      var r = state.rows[n], tr = el("tr");
      tr.style.setProperty("--c", byN[n].colour);
      tr.appendChild(el("th", { class: "mx-pr-l" }, [el("b", { text: layerTag(n) }), " " + layerName(n)]));
      tr.appendChild(el("td", { text: r.assets }));
      tr.appendChild(el("td", { text: r.threats }));
      var ul = el("ul"); r.controls.filter(function (c) { return c.trim(); }).forEach(function (c) { ul.appendChild(el("li", { text: c })); });
      tr.appendChild(el("td", null, [ul]));
      tr.appendChild(el("td", { text: r.owner }));
      var ul2 = el("ul"); ((D.rows[n] || {}).ncsc || []).forEach(function (x) { ul2.appendChild(el("li", { text: x.label })); });
      tr.appendChild(el("td", null, [ul2]));
      tr.appendChild(el("td", { text: r.gaps }));
      var rt = el("td", { class: "mx-pr-rate", "data-rating": r.rating || "unrated", text: r.rating ? RATE_LABEL[r.rating] : "Not rated" });
      tr.appendChild(rt);
      tb.appendChild(tr);
    });
    t.appendChild(tb); box.appendChild(t);
    box.appendChild(el("p", { class: "mx-pr-foot", text: "NCSC guidance links are listed on the page at osi.govassured.com/matrix. GOV Assured is a community project and is not a government website" }));
  }

  /* ---------- presenter mode ---------- */
  var pIdx = 0, lastFocus = null;
  function presentList() { var v = visibleOrder(); return v.length ? v : ORDER; }
  function renderPresent() {
    var list = presentList(); pIdx = Math.max(0, Math.min(pIdx, list.length - 1));
    var n = list[pIdx], r = state.rows[n], l = byN[n];
    var body = $("mxPBody"); body.textContent = "";
    body.style.setProperty("--c", l.colour);
    $("mxPCount").textContent = (pIdx + 1) + " / " + list.length;
    $("mxPPrev").disabled = pIdx === 0; $("mxPNext").disabled = pIdx === list.length - 1;
    body.appendChild(el("div", { class: "mx-p-head" }, [
      el("span", { class: "mx-p-tag", text: layerTag(n) }),
      el("h2", { id: "mxPTitle", text: l.name }),
      el("span", { class: "mx-p-rate", "data-rating": r.rating || "unrated", text: r.rating ? RATE_LABEL[r.rating] : "Not rated" })
    ]));
    if (l.fn) body.appendChild(el("p", { class: "mx-p-fn", text: l.fn }));
    function block(title, content) { return el("section", { class: "mx-p-block" }, [el("h3", { text: title })].concat(content)); }
    function para(s) { return el("p", { text: s || "—" }); }
    var ctl = el("ul"); r.controls.filter(function (c) { return c.trim(); }).forEach(function (c) { ctl.appendChild(el("li", { text: c })); });
    if (!ctl.children.length) ctl.appendChild(el("li", { text: "—" }));
    var refs = el("ul"); ((D.rows[n] || {}).ncsc || []).forEach(function (x) { refs.appendChild(el("li", null, [el("a", { href: x.url, target: "_blank", rel: "noopener noreferrer", "data-ga-keep": "" }, [x.label, el("span", { "aria-hidden": "true", text: " ↗" })])])); });
    body.appendChild(el("div", { class: "mx-p-grid" }, [
      block("What it protects", [para(r.assets)]),
      block("Main threats", [para(r.threats)]),
      block("Controls we use", [ctl]),
      block("Owner", [para(r.owner)]),
      block("Gaps / actions", [para(r.gaps)]),
      block("NCSC guidance", [refs])
    ]));
  }
  function openPresent() {
    lastFocus = document.activeElement; pIdx = 0;
    var v = $("mxPresentView"); v.hidden = false; document.body.classList.add("mx-presenting");
    renderPresent(); $("mxPNext").focus();
  }
  function closePresent() {
    var v = $("mxPresentView"); v.hidden = true; document.body.classList.remove("mx-presenting");
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function bindPresent() {
    $("mxPresent").addEventListener("click", openPresent);
    $("mxPClose").addEventListener("click", closePresent);
    $("mxPPrev").addEventListener("click", function () { pIdx--; renderPresent(); });
    $("mxPNext").addEventListener("click", function () { pIdx++; renderPresent(); });
    $("mxPFull").addEventListener("click", function () {
      var v = $("mxPresentView");
      if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
      else if (v.requestFullscreen) v.requestFullscreen().catch(function () { status("Full screen is not available in this browser."); });
    });
    document.addEventListener("keydown", function (e) {
      if ($("mxPresentView").hidden) return;
      if (e.key === "Escape") { e.preventDefault(); closePresent(); }
      else if (e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && e.target.tagName !== "BUTTON")) { e.preventDefault(); if (pIdx < presentList().length - 1) { pIdx++; renderPresent(); } }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); if (pIdx > 0) { pIdx--; renderPresent(); } }
      else if (e.key === "Tab") {
        /* keep focus inside the dialog */
        var f = $("mxPresentView").querySelectorAll("button:not([disabled]),a[href]");
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function bindActions() {
    $("mxCsv").addEventListener("click", function () { exportCsv(false); });
    $("mxXls").addEventListener("click", function () { exportCsv(true); });
    $("mxPrint").addEventListener("click", function () { saveNow(); renderPrint(); window.print(); });
    $("mxClearEx").addEventListener("click", clearExamples);
    $("mxBlank").addEventListener("click", startBlank);
    $("mxRestore").addEventListener("click", restore);
    window.addEventListener("beforeprint", renderPrint);
    window.addEventListener("pagehide", saveNow);
  }

  initTheme();
  if (window.OUR_TOOLS) window.OUR_TOOLS.onChange(refreshPickers);
  buildFilter();
  render();
  bindTable();
  bindImport();
  bindPresent();
  bindActions();
})();
