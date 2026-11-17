/* /matrix/tools: built-in Microsoft starter set plus "Our tools" (add, edit, remove, import, export). */
(function () {
  "use strict";
  var MS = window.MS_TOOLS, OT = window.OUR_TOOLS;
  if (!MS || !OT) return;
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { var v = attrs[k]; if (v == null || v === false) return; if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else n.setAttribute(k, v === true ? "" : v); });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  var stT = 0;
  function status(m) { var s = $("otStatus"); s.textContent = m; clearTimeout(stT); stT = setTimeout(function () { s.textContent = ""; }, 5000); }
  function stamp() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  function renderList() {
    var box = $("otList"); box.textContent = "";
    var list = OT.list();
    if (!list.length) { box.appendChild(el("p", { class: "ot-empty", text: "No tools added yet. Type your own, or quick-add a suggestion below." })); return; }
    var t = el("table", { class: "ms-table ot-table" });
    t.appendChild(el("thead", null, [el("tr", null, [el("th", { scope: "col", text: "Tool" }), el("th", { scope: "col", text: "What it does, in plain words" }), el("th", { scope: "col", text: "Layers" }), el("th", { scope: "col", class: "ot-act-h", text: "Change" })])]));
    var tb = el("tbody");
    list.forEach(function (x) {
      var chips = el("div", { class: "ms-chips" });
      x.layers.forEach(function (n) { chips.appendChild(MS.layerChip(n)); });
      if (!x.layers.length) chips.appendChild(el("span", { class: "ms-tag", text: "No layer chosen" }));
      tb.appendChild(el("tr", { "data-id": x.id }, [
        el("th", { scope: "row" }, [el("b", { text: x.name }), el("span", { class: "ms-tag", text: (x.vendor ? x.vendor + " · " : "") + "added by you" })]),
        el("td", { text: x.plain || "—" }),
        el("td", null, [chips]),
        el("td", { class: "ot-act" }, [
          el("button", { type: "button", class: "btn ot-edit", "data-edit": x.id, "aria-label": "Edit " + x.name, text: "Edit" }),
          el("button", { type: "button", class: "btn ot-del", "data-del": x.id, "aria-label": "Remove " + x.name, text: "Remove" })
        ])
      ]));
    });
    t.appendChild(tb); box.appendChild(t);
  }
  function renderChips() {
    var ul = $("otChips"); ul.textContent = "";
    OT.suggestions.forEach(function (s, i) {
      var have = OT.has(s);
      ul.appendChild(el("li", null, [el("button", { type: "button", class: "ot-chip", "data-sugg": i, disabled: have, "aria-label": (have ? "Already added: " : "Quick-add ") + s.name, text: (have ? "✓ " : "+ ") + s.name })]));
    });
  }
  function extra() { return OT.list().map(function (x) { return { name: OT.label(x), layers: x.layers, note: "added by you" }; }); }
  function renderAll() { renderList(); renderChips(); MS.renderCoverage($("msCover"), extra()); }

  function bind() {
    $("otAdd").addEventListener("click", function () { OT.openForm({ onSave: function (t) { status(t.name + " added to Our tools."); } }); });
    $("otList").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.hasAttribute("data-edit")) { var t = OT.find(b.getAttribute("data-edit")); if (t) OT.openForm({ tool: t, onSave: function (r) { status(r.name + " updated."); } }); }
      if (b.hasAttribute("data-del")) { var d = OT.find(b.getAttribute("data-del")); if (d && confirm("Remove “" + d.name + "” from Our tools in this browser?")) { OT.remove(d.id); status(d.name + " removed."); } }
    });
    $("otChips").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-sugg]"); if (!b) return;
      var s = OT.suggestions[+b.getAttribute("data-sugg")], r = OT.add(s);
      if (r) status(r.name + " added to Our tools. Edit it to match yours.");
    });
    $("otExportJson").addEventListener("click", function () { OT.download("our-tools-" + stamp() + ".json", OT.toJson(), "application/json"); status("Our tools exported as JSON."); });
    $("otExportCsv").addEventListener("click", function () { OT.download("our-tools-" + stamp() + ".csv", "\uFEFF" + OT.toCsv(), "text/csv;charset=utf-8"); status("Our tools exported as CSV (opens in Excel)."); });
    var inp = $("otImport");
    inp.addEventListener("change", function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      if (f.size > 512 * 1024) { status("That file is too large (over 512 KB)."); inp.value = ""; return; }
      var rd = new FileReader();
      rd.onload = function () {
        try { var r = OT.importText(String(rd.result || "")); status("Imported " + r.added + " tool" + (r.added === 1 ? "" : "s") + (r.skipped ? " (" + r.skipped + " already in the list or invalid, skipped)" : "") + "."); }
        catch (err) { status("Import failed: " + err.message); }
        inp.value = "";
      };
      rd.onerror = function () { status("Could not read that file."); inp.value = ""; };
      rd.readAsText(f);
    });
    $("msPrint").addEventListener("click", function () { window.print(); });
    OT.onChange(renderAll);
  }
  (function initTheme() {
    function apply(t) {
      if (t !== "dark" && t !== "light" && t !== "auto") t = "dark";
      try { localStorage.setItem("osi-theme", t); } catch (e) {}
      var r = document.documentElement, light = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches;
      r.setAttribute("data-theme-pref", t); r.setAttribute("data-theme", t === "auto" ? (light ? "light" : "dark") : t);
      var seg = $("themeSeg"); if (seg) seg.querySelectorAll("button[data-set]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set") === t)); });
    }
    var p = "dark"; try { p = localStorage.getItem("osi-theme") || "dark"; } catch (e) {}
    apply(p);
    var seg = $("themeSeg"); if (seg) seg.addEventListener("click", function (ev) { var b = ev.target.closest("button[data-set]"); if (b) apply(b.getAttribute("data-set")); });
  })();
  MS.renderTable($("msTable"));
  renderAll();
  bind();
})();
