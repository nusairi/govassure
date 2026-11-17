/* "Our tools": tools the user types in (any vendor). Saved only in this browser (localStorage).
   Shared by the matrix picker, the tool list page and the game. Text nodes only. */
(function () {
  "use strict";
  var KEY = "ga-osi-our-tools-v1";
  var LAYER_IDS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "x"];
  var LAYER_NAMES = { x: "All layers", 0: "Hardware", 1: "Physical", 2: "Data Link", 3: "Network", 4: "Transport", 5: "Session", 6: "Presentation", 7: "Application", 8: "People" };
  var MAX = 300;
  /* Quick-add suggestions: common, well-known products. Suggestions only, not a claim about anyone's setup. No links. */
  var SUGGESTIONS = [
    { name: "Cisco Secure Firewall (ASA / Firepower)", vendor: "Cisco", plain: "Firewall between networks and the internet; only allowed traffic gets through.", layers: [3, 4, 7] },
    { name: "Cisco Identity Services Engine (ISE)", vendor: "Cisco", plain: "Network access control: checks a device and user before letting them onto the office network (802.1X).", layers: [2, 5] },
    { name: "Cisco Umbrella", vendor: "Cisco", plain: "DNS security: blocks connections to known bad websites before they start.", layers: [7, 3] },
    { name: "Cisco Duo", vendor: "Cisco", plain: "Multifactor authentication: a second check on top of the password.", layers: [5] },
    { name: "Cisco Meraki", vendor: "Cisco", plain: "Cloud-managed switches, Wi-Fi and security appliances for offices.", layers: [1, 2, 3] },
    { name: "Palo Alto Networks next-generation firewall", vendor: "Palo Alto Networks", plain: "Firewall that understands apps and blocks threats in traffic.", layers: [3, 4, 7] },
    { name: "Fortinet FortiGate", vendor: "Fortinet", plain: "Firewall and VPN for offices and data centres.", layers: [3, 4, 7] },
    { name: "Check Point firewall", vendor: "Check Point", plain: "Firewall and threat prevention between networks.", layers: [3, 4, 7] },
    { name: "CrowdStrike Falcon", vendor: "CrowdStrike", plain: "Endpoint detection and response: a security guard on every laptop and server.", layers: [7, 0] },
    { name: "Splunk", vendor: "Splunk", plain: "SIEM: collects logs from everywhere so the team can search and spot attacks.", layers: ["x"] },
    { name: "Zscaler", vendor: "Zscaler", plain: "Secure route to the internet and to work apps from anywhere (zero trust access).", layers: [3, 5, 7] },
    { name: "Okta", vendor: "Okta", plain: "Single sign-on and identity: one login, checked properly, for many apps.", layers: [5] },
    { name: "Proofpoint", vendor: "Proofpoint", plain: "Email security: filters phishing and malware before it reaches inboxes.", layers: [7, 8] },
    { name: "Mimecast", vendor: "Mimecast", plain: "Email security and archiving.", layers: [7, 8] },
    { name: "Tenable", vendor: "Tenable", plain: "Vulnerability scanning: finds missing patches and weak settings.", layers: [7, 0] },
    { name: "Qualys", vendor: "Qualys", plain: "Vulnerability scanning and asset inventory.", layers: [7, 0] },
    { name: "Door access control (badge readers)", vendor: "", plain: "Door badges and readers so only the right people get into the building and rooms.", layers: [1] },
    { name: "CCTV", vendor: "", plain: "Cameras covering entrances and secure areas, with recordings kept for a set time.", layers: [1] }
  ];

  function clip(s, n) { return (typeof s === "string" ? s : "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, n); }
  function cleanLayers(a) {
    var out = [];
    (Array.isArray(a) ? a : []).forEach(function (v) { v = String(v).replace(/^L/i, "").toLowerCase(); if (v === "all") v = "x"; if (LAYER_IDS.indexOf(v) >= 0 && out.indexOf(v) < 0) out.push(v); });
    return out.sort(function (a, b) { return a === "x" ? 1 : b === "x" ? -1 : +a - +b; }).map(function (v) { return v === "x" ? "x" : +v; });
  }
  function clean(t) {
    if (!t || typeof t !== "object") return null;
    var name = clip(t.name, 120); if (!name) return null;
    return { id: /^our-[a-z0-9]{1,24}$/.test(t.id || "") ? t.id : newId(), name: name, vendor: clip(t.vendor, 80), plain: clip(t.plain, 400), layers: cleanLayers(t.layers) };
  }
  var seq = 0;
  function newId() { seq++; return "our-" + Date.now().toString(36) + seq.toString(36) + Math.floor(Math.random() * 1296).toString(36); }
  function read() {
    try { var a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a.map(clean).filter(Boolean).slice(0, MAX) : []; } catch (e) { return []; }
  }
  var list = read();
  var subs = [];
  function write() { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} subs.forEach(function (f) { try { f(); } catch (e) {} }); }
  function key(t) { return (t.name + "|" + (t.vendor || "")).toLowerCase(); }
  function find(id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function has(t) { var k = key(t); return list.some(function (x) { return key(x) === k; }); }
  function add(t) {
    var c = clean(t); if (!c) return null;
    var k = key(c), dup = list.filter(function (x) { return key(x) === k; })[0];
    if (dup) return dup;
    if (list.length >= MAX) return null;
    c.id = newId(); list.push(c); write(); return c;
  }
  function update(id, t) {
    var cur = find(id), c = clean(t); if (!cur || !c) return null;
    cur.name = c.name; cur.vendor = c.vendor; cur.plain = c.plain; cur.layers = c.layers; write(); return cur;
  }
  function remove(id) { list = list.filter(function (x) { return x.id !== id; }); write(); }
  function label(t) { return t.vendor && t.name.toLowerCase().indexOf(t.vendor.toLowerCase()) < 0 ? t.name + " (" + t.vendor + ")" : t.name; }
  function forLayer(n) { return list.filter(function (t) { return t.layers.indexOf(n) >= 0; }); }
  window.addEventListener("storage", function (e) { if (e.key === KEY) { list = read(); subs.forEach(function (f) { try { f(); } catch (x) {} }); } });

  /* ---------- export / import ---------- */
  function guard(s) { s = s == null ? "" : String(s); return /^[=+\-@\t\r]/.test(s) ? "'" + s : s; }
  function unguard(s) { return /^'[=+\-@\t\r]/.test(s) ? s.slice(1) : s; }
  function csvCell(s) { s = guard(s); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function layerText(a) { return a.map(function (n) { return n === "x" ? "All" : "L" + n; }).join(" "); }
  function toCsv() {
    var rows = [["Tool", "Vendor", "What it does", "Layers"]];
    list.forEach(function (t) { rows.push([t.name, t.vendor, t.plain, layerText(t.layers)]); });
    return rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n") + "\r\n";
  }
  function toJson() {
    return JSON.stringify({ type: "ga-osi-our-tools", v: 1, tools: list.map(function (t) { return { name: t.name, vendor: t.vendor, plain: t.plain, layers: t.layers }; }) }, null, 2) + "\n";
  }
  function parseCsv(text) {
    var rows = [], row = [], cell = "", q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += c;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (x) { return x.trim() !== ""; }); });
  }
  /* returns { added, skipped } ; throws Error with a plain message */
  function importText(text) {
    text = String(text || "").replace(/^\uFEFF/, "");
    var items = [];
    if (/^\s*[\[{]/.test(text)) {
      var o; try { o = JSON.parse(text); } catch (e) { throw new Error("The file is not valid JSON."); }
      var arr = Array.isArray(o) ? o : (o && Array.isArray(o.tools) ? o.tools : null);
      if (!arr) throw new Error("No tools found in the JSON file.");
      items = arr;
    } else {
      var rows = parseCsv(text);
      if (!rows.length) throw new Error("The file is empty.");
      var h = rows[0].map(function (x) { return x.trim().toLowerCase(); });
      var ci = { name: h.indexOf("tool"), vendor: h.indexOf("vendor"), plain: h.indexOf("what it does"), layers: h.indexOf("layers") };
      if (ci.name < 0) throw new Error("This doesn’t look like an Our tools file (missing the Tool column).");
      rows.slice(1).forEach(function (r) {
        var g = function (k) { return ci[k] >= 0 && r[ci[k]] != null ? unguard(r[ci[k]]) : ""; };
        items.push({ name: g("name"), vendor: g("vendor"), plain: g("plain"), layers: g("layers").split(/[\s,;]+/).filter(Boolean) });
      });
    }
    var added = 0, skipped = 0;
    items.slice(0, MAX).forEach(function (t) {
      var c = clean(t); if (!c || has(c) || list.length >= MAX) { skipped++; return; }
      c.id = newId(); list.push(c); added++;
    });
    if (!added && !skipped) throw new Error("No tools found in the file.");
    write();
    return { added: added, skipped: skipped };
  }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }

  /* ---------- add / edit form (a modal <dialog>, no <form> so CSP form-action never applies) ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { var v = attrs[k]; if (v == null || v === false) return; if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else n.setAttribute(k, v === true ? "" : v); });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  var dlg = null;
  function openForm(opts) {
    opts = opts || {};
    var init = opts.tool || {}, back = document.activeElement;
    if (dlg) dlg.remove();
    dlg = el("dialog", { class: "ot-dialog", id: "otDialog", "aria-labelledby": "otTitle" });
    var name = el("input", { id: "otName", type: "text", maxlength: "120", autocomplete: "off", required: true });
    var vendor = el("input", { id: "otVendor", type: "text", maxlength: "80", autocomplete: "off", placeholder: "For example Cisco" });
    var plain = el("textarea", { id: "otPlain", rows: "3", maxlength: "400", placeholder: "For example: checks devices before they join the office network" });
    name.value = init.name || ""; vendor.value = init.vendor || ""; plain.value = init.plain || "";
    var pre = (init.layers || opts.layers || []).map(String);
    var boxes = el("div", { class: "ot-layers" });
    LAYER_IDS.forEach(function (id) {
      var cbid = "otL" + id;
      var cb = el("input", { type: "checkbox", id: cbid, value: id });
      if (pre.indexOf(id) >= 0) cb.checked = true;
      boxes.appendChild(el("label", { for: cbid, class: "ot-cb" }, [cb, " " + (id === "x" ? "All layers" : "L" + id + " " + LAYER_NAMES[id])]));
    });
    var err = el("p", { class: "ot-err", id: "otErr", role: "alert" });
    var save = el("button", { type: "button", class: "btn mx-primary", id: "otSave", text: init.id ? "Save changes" : "Add tool" });
    var cancel = el("button", { type: "button", class: "btn", id: "otCancel", text: "Cancel" });
    dlg.appendChild(el("div", { class: "ot-box" }, [
      el("h2", { id: "otTitle", text: init.id ? "Edit tool" : "Type your own tool" }),
      el("p", { class: "ot-note", text: "Any vendor. Saved only in this browser as one of “Our tools”, and reusable everywhere tools are chosen." }),
      el("label", { for: "otName", class: "ot-l", text: "Tool name (required)" }), name,
      el("label", { for: "otVendor", class: "ot-l", text: "Vendor (optional)" }), vendor,
      el("label", { for: "otPlain", class: "ot-l", text: "What it does, in plain words (optional)" }), plain,
      el("fieldset", { class: "ot-fs" }, [el("legend", { text: "Which layers does it cover?" }), boxes]),
      err,
      el("div", { class: "ot-btns" }, [save, cancel])
    ]));
    document.body.appendChild(dlg);
    function close() { dlg.close(); dlg.remove(); dlg = null; if (back && back.focus) back.focus(); }
    function submit() {
      var t = { name: name.value, vendor: vendor.value, plain: plain.value, layers: [].slice.call(boxes.querySelectorAll("input:checked")).map(function (c) { return c.value; }) };
      if (!clip(t.name, 120)) { err.textContent = "Please type the tool’s name."; name.focus(); return; }
      var r = init.id ? update(init.id, t) : add(t);
      if (!r) { err.textContent = "Could not save (the list may be full)."; return; }
      close(); if (opts.onSave) opts.onSave(r);
    }
    save.addEventListener("click", submit);
    cancel.addEventListener("click", function () { close(); if (opts.onCancel) opts.onCancel(); });
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); close(); if (opts.onCancel) opts.onCancel(); });
    [name, vendor].forEach(function (i) { i.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); submit(); } }); });
    dlg.showModal(); name.focus();
    return dlg;
  }

  window.OUR_TOOLS = {
    list: function () { return list.slice(); }, find: find, add: add, update: update, remove: remove, has: has,
    label: label, forLayer: forLayer, layerText: layerText, suggestions: SUGGESTIONS, onChange: function (f) { subs.push(f); },
    toCsv: toCsv, toJson: toJson, importText: importText, download: download, openForm: openForm
  };
})();
