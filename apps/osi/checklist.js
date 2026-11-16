/* Hardware assurance checklist. Ratings stay in this browser only. */
(function () {
  "use strict";
  var DATA = window.CHECKLIST_DATA;
  if (!DATA) return;

  var STORE_KEY = "ga-osi-hw-checklist-v1";
  var RATINGS = [
    { id: "achieved", label: "Achieved" },
    { id: "partial", label: "Partially achieved" },
    { id: "not", label: "Not achieved" },
    { id: "na", label: "N/A" }
  ];
  var PHASE_LABEL = { D: "Discovery", A: "Alpha", L: "Later" };
  var className = {};
  DATA.classes.forEach(function (c) { className[c.id] = c.name; });

  function inStagesMap() {
    var map = {};
    DATA.matrix.forEach(function (row) {
      Object.keys(row.cells).forEach(function (cid) {
        row.cells[cid].forEach(function (it) {
          if (!map[it.id]) map[it.id] = {};
          map[it.id][row.stage] = true;
        });
      });
    });
    return map;
  }
  var IN_STAGES = inStagesMap();

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { ratings: {}, notes: {} };
      var o = JSON.parse(raw);
      return { ratings: o.ratings || {}, notes: o.notes || {} };
    } catch (e) {
      return { ratings: {}, notes: {} };
    }
  }
  function save(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = load();
  var filters = { stage: "", phase: "", classId: "" };

  function controlVisible(c) {
    if (filters.phase && c.phases.indexOf(filters.phase) === -1) return false;
    if (filters.classId && !Object.prototype.hasOwnProperty.call(c.classes, filters.classId)) return false;
    if (filters.stage) {
      var st = parseInt(filters.stage, 10);
      var inM = IN_STAGES[c.id] && IN_STAGES[c.id][st];
      if (c.stage !== st && !inM) return false;
    }
    return true;
  }

  function applyTheme(t) {
    if (t !== "dark" && t !== "light" && t !== "auto") t = "dark";
    try { localStorage.setItem("osi-theme", t); } catch (e) {}
    var r = document.documentElement;
    var prefersLight = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches;
    r.setAttribute("data-theme-pref", t);
    r.setAttribute("data-theme", t === "auto" ? (prefersLight ? "light" : "dark") : t);
    var themeSeg = document.getElementById("themeSeg");
    if (themeSeg) {
      var btns = themeSeg.querySelectorAll("button[data-set]");
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-set") === t ? "true" : "false");
      }
    }
  }

  function initTheme() {
    var themeSeg = document.getElementById("themeSeg");
    var pref = "dark";
    try { pref = localStorage.getItem("osi-theme") || "dark"; } catch (e) {}
    applyTheme(pref);
    if (themeSeg) {
      themeSeg.addEventListener("click", function (ev) {
        var b = ev.target.closest("button[data-set]");
        if (b) applyTheme(b.getAttribute("data-set"));
      });
    }
    if (window.matchMedia) {
      matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () {
        var t = "dark";
        try { t = localStorage.getItem("osi-theme") || "dark"; } catch (e) {}
        if (t === "auto") applyTheme("auto");
      });
    }
  }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") n.className = attrs[k];
        else if (k === "text") n.textContent = attrs[k];
        else if (k === "html") n.innerHTML = attrs[k];
        else if (k === "checked") { if (attrs[k]) n.checked = true; }
        else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function extLink(href, label) {
    var a = el("a", {
      href: href,
      class: "cl-ext",
      target: "_blank",
      rel: "noopener noreferrer",
      "data-ga-keep": "",
      "data-keep": ""
    });
    a.textContent = label;
    var icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = " ↗";
    a.appendChild(icon);
    return a;
  }

  function fillFilters() {
    var st = document.getElementById("fStage");
    DATA.stages.forEach(function (s) {
      st.appendChild(el("option", { value: String(s.id), text: s.id + ". " + s.name }));
    });
    var cl = document.getElementById("fClass");
    DATA.classes.forEach(function (c) {
      cl.appendChild(el("option", { value: c.id, text: c.name }));
    });
  }

  function badgeFor(tier) {
    var label, cls;
    if (tier.kind === "enhanced") {
      label = "Enhanced (community-proposed)";
      cls = "cl-badge is-enhanced";
    } else if (tier.kind === "core-enhanced") {
      label = "Core + enhanced (community-proposed)";
      cls = "cl-badge is-both";
    } else {
      label = "Core";
      cls = "cl-badge is-core";
    }
    var b = el("span", { class: cls, text: label });
    if (tier.note && tier.enhanced) b.title = tier.note.replace(/Enhanced \(community\)/gi, "Enhanced (community-proposed)");
    return b;
  }

  function renderMatrix() {
    var table = document.getElementById("clMatrix");
    table.textContent = "";
    var thead = el("thead");
    var hr = el("tr");
    hr.appendChild(el("th", { text: "Stage", scope: "col" }));
    DATA.classes.forEach(function (c) {
      hr.appendChild(el("th", { text: c.id, title: c.name, scope: "col" }));
    });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tb = el("tbody");
    DATA.matrix.forEach(function (row) {
      var tr = el("tr");
      var stage = DATA.stages[row.stage - 1];
      tr.appendChild(el("th", { text: row.stage + " " + (stage ? stage.short : ""), scope: "row" }));
      DATA.classes.forEach(function (c) {
        var td = el("td");
        var items = row.cells[c.id] || [];
        if (!items.length) {
          td.className = "is-empty";
          td.textContent = "—";
        } else {
          var wrap = el("div", { class: "ids" });
          items.forEach(function (it) {
            var a = el("a", { href: "#" + it.id, text: it.id.replace("HW-", "") });
            if (it.partial) {
              a.appendChild(el("span", { class: "p", text: "P", title: "Public official guidance is thinner or only indirect" }));
            }
            wrap.appendChild(a);
          });
          td.appendChild(wrap);
        }
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    table.appendChild(tb);
  }

  function renderCard(c) {
    var article = el("article", { class: "cl-card", id: c.id, "data-id": c.id });
    var head = el("div", { class: "cl-card__head" });
    head.appendChild(el("span", { class: "cl-id", text: c.id }));
    head.appendChild(badgeFor(c.tier));
    var phases = el("div", { class: "cl-phases", "aria-label": "Phases" });
    ["D", "A", "L"].forEach(function (p) {
      var on = c.phases.indexOf(p) !== -1;
      phases.appendChild(el("span", {
        class: "cl-ph" + (on ? " is-on" : ""),
        text: PHASE_LABEL[p],
        title: on ? "Assess in " + PHASE_LABEL[p] : "Not tagged for " + PHASE_LABEL[p]
      }));
    });
    head.appendChild(phases);
    article.appendChild(head);
    article.appendChild(el("h3", { text: c.statement }));

    var ev = el("div", { class: "cl-dl" });
    ev.appendChild(el("h4", { text: "Evidence to request" }));
    ev.appendChild(el("p", { text: c.evidence }));
    article.appendChild(ev);

    var cafBox = el("div", { class: "cl-dl" });
    cafBox.appendChild(el("h4", { text: "CAF v4.0 principles" }));
    var cafLinks = el("div", { class: "cl-sources" });
    (c.caf || []).forEach(function (id) {
      var meta = DATA.caf[id];
      if (!meta) {
        cafLinks.appendChild(el("span", { text: id }));
        return;
      }
      cafLinks.appendChild(extLink(meta.url, id + " " + meta.title));
    });
    cafBox.appendChild(cafLinks);
    article.appendChild(cafBox);

    var clsBox = el("div", { class: "cl-dl" });
    clsBox.appendChild(el("h4", { text: "Applies to" }));
    var list = el("div", { class: "cl-classlist" });
    DATA.classes.forEach(function (cl) {
      if (!Object.prototype.hasOwnProperty.call(c.classes, cl.id)) return;
      var thin = !!c.classes[cl.id];
      list.appendChild(el("span", {
        class: thin ? "is-thin" : "",
        text: cl.name + (thin ? " (P)" : ""),
        title: thin ? "Public official guidance is thinner or only indirect for this class" : cl.name
      }));
    });
    clsBox.appendChild(list);
    article.appendChild(clsBox);

    var srcBox = el("div", { class: "cl-dl" });
    srcBox.appendChild(el("h4", { text: "Sources" }));
    var srcs = el("div", { class: "cl-sources" });
    (c.sources || []).forEach(function (s) {
      srcs.appendChild(extLink(s.url, s.label));
    });
    srcBox.appendChild(srcs);
    article.appendChild(srcBox);

    var fs = el("fieldset", { class: "cl-rate" });
    fs.appendChild(el("legend", { text: "CAF-style rating" }));
    var opts = el("div", { class: "cl-rate-opts", role: "radiogroup", "aria-label": c.id + " rating" });
    var current = state.ratings[c.id] || "";
    RATINGS.forEach(function (r) {
      var id = c.id + "-" + r.id;
      var lab = el("label", { for: id });
      var inp = el("input", {
        type: "radio",
        name: "rate-" + c.id,
        id: id,
        value: r.id,
        checked: current === r.id
      });
      lab.appendChild(inp);
      lab.appendChild(document.createTextNode(r.label));
      opts.appendChild(lab);
    });
    fs.appendChild(opts);
    article.appendChild(fs);

    var notes = el("div", { class: "cl-notes" });
    var nid = "note-" + c.id;
    notes.appendChild(el("label", { for: nid, text: "Notes" }));
    var ta = el("textarea", { id: nid, rows: "3", placeholder: "Evidence held, reasons for N/A, follow-ups…" });
    ta.value = state.notes[c.id] || "";
    notes.appendChild(ta);
    article.appendChild(notes);
    return article;
  }

  function renderStages() {
    var main = document.getElementById("clMain");
    main.textContent = "";
    DATA.stages.forEach(function (s) {
      var section = el("section", { class: "cl-stage", id: "stage-" + s.id, "aria-labelledby": "stage-h-" + s.id });
      section.appendChild(el("h2", { id: "stage-h-" + s.id, text: "Stage " + s.id + " — " + s.name }));
      var meta = el("p", { class: "cl-stage-meta" });
      meta.appendChild(document.createTextNode("Primary CAF mapping: "));
      (s.caf || []).forEach(function (id, i) {
        var metaC = DATA.caf[id];
        if (i) meta.appendChild(document.createTextNode(" · "));
        if (metaC) meta.appendChild(extLink(metaC.url, id + " " + metaC.title));
        else meta.appendChild(document.createTextNode(id));
      });
      if (s.why) {
        meta.appendChild(document.createTextNode(". " + s.why + " B6 Staff awareness and training can apply whenever users handle devices or peripherals."));
      }
      section.appendChild(meta);
      var cards = el("div", { class: "cl-cards" });
      DATA.controls.filter(function (c) { return c.stage === s.id; }).forEach(function (c) {
        cards.appendChild(renderCard(c));
      });
      section.appendChild(cards);
      main.appendChild(section);
    });
  }

  function updateVisibility() {
    DATA.controls.forEach(function (c) {
      var node = document.getElementById(c.id);
      if (!node) return;
      var show = controlVisible(c);
      node.classList.toggle("is-hidden", !show);
    });
    DATA.stages.forEach(function (s) {
      var sec = document.getElementById("stage-" + s.id);
      if (!sec) return;
      var any = sec.querySelector(".cl-card:not(.is-hidden)");
      sec.hidden = !any;
    });
    renderDash();
  }

  function countsFor(list) {
    var out = { achieved: 0, partial: 0, not: 0, na: 0, unrated: 0, total: list.length };
    list.forEach(function (c) {
      var r = state.ratings[c.id] || "";
      if (r === "achieved") out.achieved++;
      else if (r === "partial") out.partial++;
      else if (r === "not") out.not++;
      else if (r === "na") out.na++;
      else out.unrated++;
    });
    out.rated = out.total - out.unrated;
    return out;
  }

  function renderDash() {
    var visible = DATA.controls.filter(controlVisible);
    var c = countsFor(visible);
    var ul = document.getElementById("clCounts");
    ul.textContent = "";
    function item(cls, n, label) {
      var li = el("li", { class: cls });
      li.appendChild(el("span", { class: "n", text: String(n) }));
      li.appendChild(el("span", { class: "l", text: label }));
      ul.appendChild(li);
    }
    item("is-achieved", c.achieved, "Achieved");
    item("is-partial", c.partial, "Partially achieved");
    item("is-not", c.not, "Not achieved");
    item("", c.na, "N/A");
    item("", c.unrated, "Not rated");
    item("", c.total, "Visible controls");

    var box = document.getElementById("clStagePct");
    box.textContent = "";
    DATA.stages.forEach(function (s) {
      var list = DATA.controls.filter(function (ctrl) {
        var phaseOk = !filters.phase || ctrl.phases.indexOf(filters.phase) !== -1;
        var classOk = !filters.classId || Object.prototype.hasOwnProperty.call(ctrl.classes, filters.classId);
        var inThis = ctrl.stage === s.id || (IN_STAGES[ctrl.id] && IN_STAGES[ctrl.id][s.id]);
        return phaseOk && classOk && inThis;
      });
      var cc = countsFor(list);
      var pct = cc.total ? Math.round((cc.rated / cc.total) * 100) : 0;
      var row = el("div", { class: "cl-sp" });
      row.appendChild(el("b", { text: s.id + ". " + s.short }));
      row.appendChild(document.createTextNode(pct + "% complete (" + cc.rated + "/" + cc.total + ")"));
      var bar = el("div", { class: "bar", "aria-hidden": "true" });
      var i = el("i");
      i.style.width = pct + "%";
      bar.appendChild(i);
      row.appendChild(bar);
      box.appendChild(row);
    });
  }

  function bind() {
    document.getElementById("fStage").addEventListener("change", function (e) {
      filters.stage = e.target.value;
      updateVisibility();
    });
    document.getElementById("fPhase").addEventListener("change", function (e) {
      filters.phase = e.target.value;
      updateVisibility();
    });
    document.getElementById("fClass").addEventListener("change", function (e) {
      filters.classId = e.target.value;
      updateVisibility();
    });
    document.getElementById("clMain").addEventListener("change", function (e) {
      var t = e.target;
      if (t && t.name && t.name.indexOf("rate-") === 0) {
        var id = t.name.slice(5);
        if (t.checked) state.ratings[id] = t.value;
        save(state);
        renderDash();
      }
    });
    document.getElementById("clMain").addEventListener("input", function (e) {
      var t = e.target;
      if (t && t.tagName === "TEXTAREA" && t.id.indexOf("note-") === 0) {
        state.notes[t.id.slice(5)] = t.value;
        save(state);
      }
    });
    document.getElementById("btnCsv").addEventListener("click", exportCsv);
    document.getElementById("btnPrint").addEventListener("click", function () {
      window.print();
    });
    document.getElementById("btnClear").addEventListener("click", function () {
      if (!confirm("Clear all saved ratings and notes in this browser?")) return;
      state = { ratings: {}, notes: {} };
      save(state);
      document.querySelectorAll('#clMain input[type="radio"]').forEach(function (r) { r.checked = false; });
      document.querySelectorAll("#clMain textarea").forEach(function (t) { t.value = ""; });
      renderDash();
    });
  }

  function csvEscape(s) {
    s = (s == null ? "" : String(s));
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function exportCsv() {
    var rateLabel = { achieved: "Achieved", partial: "Partially achieved", not: "Not achieved", na: "N/A" };
    var rows = [[
      "ID", "Stage", "Statement", "Evidence", "Phases", "CAF", "Tier", "Classes",
      "Rating", "Notes", "Sources"
    ]];
    DATA.controls.filter(controlVisible).forEach(function (c) {
      var classes = DATA.classes.filter(function (cl) {
        return Object.prototype.hasOwnProperty.call(c.classes, cl.id);
      }).map(function (cl) { return cl.id + (c.classes[cl.id] ? " (P)" : ""); }).join("; ");
      var sources = (c.sources || []).map(function (s) { return s.label + " " + s.url; }).join(" | ");
      var tier = c.tier.enhanced ? (c.tier.core ? "Core + enhanced (community-proposed)" : "Enhanced (community-proposed)") : "Core";
      rows.push([
        c.id,
        String(c.stage),
        c.statement,
        c.evidence,
        c.phases.join(" "),
        (c.caf || []).join(" "),
        tier,
        classes,
        rateLabel[state.ratings[c.id]] || "",
        state.notes[c.id] || "",
        sources
      ]);
    });
    var csv = rows.map(function (r) { return r.map(csvEscape).join(","); }).join("\r\n");
    var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hardware-assurance-checklist.csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  initTheme();
  fillFilters();
  renderMatrix();
  renderStages();
  bind();
  updateVisibility();
})();
