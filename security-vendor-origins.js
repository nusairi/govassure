/* Security vendor origins and ownership. Same-origin JSON, no inline code. */
(function () {
  "use strict";
  var root = document.getElementById("svo");
  if (!root) return;

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var TAGS = {
    "Origin": "origin",
    "HQ": "hq",
    "Owner": "owner",
    "R&D": "rd",
    "Gov action": "gov",
    "State-linked investor": "state"
  };
  var SLRANK = { yes: 0, unverified: 1, no: 2 };
  var DATA = [];
  var REFS = {};
  var META = {};
  var S = { q: "", cat: "", origin: "", owner: "", sl: "", gov: "", sort: "n", dir: 1, open: "" };
  var KEYS = ["q", "cat", "origin", "owner", "sl", "gov", "sort", "dir", "open"];
  var F = { cat: "fCat", origin: "fOrigin", owner: "fOwner", sl: "fSl", gov: "fGov" };
  var FLABEL = { cat: "Category", origin: "Origin", owner: "Owner", sl: "State-linked", gov: "Gov action" };

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch (e) { return "official source"; }
  }
  function src(s) {
    if (!s) return "";
    if (s.g) {
      return ' <a class="svo-src" href="' + esc(s.g) + '" target="_blank" rel="noopener noreferrer">' +
        esc(hostOf(s.g)) + '<span class="visually-hidden"> (opens in a new tab)</span></a>';
    }
    var code = s.r;
    var ref = REFS[code] || {};
    return ' <a class="svo-ref" href="#src-' + esc(code) + '" title="Source ' + esc(code) + ": " + esc(ref.h || "") + ', listed in Sources">' + esc(code) + "</a>";
  }
  function unv(v) {
    return (!v || v === "unverified") ? '<span class="svo-unv">unverified</span>' : esc(v);
  }
  function tag(t) {
    var cls = TAGS[t.k] || "other";
    return '<span class="svo-tag svo-tag--' + cls + '"><span class="svo-tag__l">' + esc(t.k) + ":</span> " + esc(t.t) + src(t.s) + "</span>";
  }
  function slBadge(v) {
    var label = v === "yes" ? "Yes" : v === "no" ? "None found" : "Unverified";
    return '<span class="svo-sl svo-sl--' + esc(v) + '">' + label + "</span>";
  }
  function verifiedLabel() {
    var p = String(META.verified || "").split("-");
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (p.length !== 3 || !months[+p[1] - 1]) return META.verified || "";
    return (+p[2]) + " " + months[+p[1] - 1] + " " + p[0];
  }

  function readURL() {
    var p = new URLSearchParams(location.search);
    KEYS.forEach(function (k) {
      if (!p.has(k)) return;
      S[k] = k === "dir" ? (p.get(k) === "-1" ? -1 : 1) : p.get(k);
    });
  }
  function writeURL() {
    var p = new URLSearchParams();
    KEYS.forEach(function (k) {
      var v = S[k];
      if (k === "sort" && v === "n") return;
      if (k === "dir" && v === 1) return;
      if (v !== "" && v != null) p.set(k, v);
    });
    var qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
  }

  function hay(v) {
    return (v.n + " " + v.cat + " " + v.o + " " + v.hq + " " + v.uo + " " + v.uoc + " " + v.own + " " +
      v.chain.map(function (c) { return c.e + " " + c.c; }).join(" ")).toLowerCase();
  }
  function match(v, except) {
    if (S.q) {
      var terms = S.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < terms.length; i++) if (v._h.indexOf(terms[i]) < 0) return false;
    }
    if (except !== "cat" && S.cat && v.b.indexOf(S.cat) < 0) return false;
    if (except !== "origin" && S.origin && v.po !== S.origin) return false;
    if (except !== "owner" && S.owner && v.puoc !== S.owner) return false;
    if (except !== "sl" && S.sl && v.sl.v !== S.sl) return false;
    if (except !== "gov" && S.gov && ((S.gov === "yes") !== (v.gov.length > 0))) return false;
    return true;
  }
  function sorted(list) {
    var k = S.sort, d = S.dir;
    function key(v) {
      if (k === "sl") return SLRANK[v.sl.v];
      if (k === "gov") return -v.gov.length;
      var x = k === "o" ? v.o : k === "hq" ? v.hq : k === "uoc" ? v.uoc : v.n;
      return (x === "unverified" ? "~" : x).toLowerCase();
    }
    return list.slice().sort(function (a, b) {
      var x = key(a), y = key(b);
      return (x < y ? -1 : x > y ? 1 : a.n.localeCompare(b.n)) * d;
    });
  }

  function count(arr, f) {
    var m = {};
    arr.forEach(function (v) { var k = f(v); m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (a, b) {
      return b[1] - a[1] || a[0].localeCompare(b[0]);
    });
  }
  function fillSelect(id, pairs) {
    var sel = $(id), first = sel.options[0];
    sel.textContent = "";
    sel.appendChild(first);
    pairs.forEach(function (pair) {
      var o = document.createElement("option");
      o.value = pair[0];
      o.textContent = pair[0] + " (" + pair[1] + ")";
      sel.appendChild(o);
    });
  }
  function cards() {
    var n = DATA.length;
    var gov = DATA.filter(function (v) { return v.gov.length; }).length;
    var sl = DATA.filter(function (v) { return v.sl.v === "yes"; }).length;
    var diff = DATA.filter(function (v) { return v.po !== "Unverified" && v.puoc !== "Unverified" && v.po !== v.puoc; }).length;
    var origins = count(DATA, function (v) { return v.po; }).filter(function (p) { return p[0] !== "Unverified"; }).length;
    var items = [
      [n, "Vendors", "across " + origins + " countries of origin", null],
      [gov, "With government actions", "US listings, sanctions or UK guidance", { gov: "yes" }],
      [sl, "With a state-linked investor", "state, state-owned company or sovereign fund", { sl: "yes" }],
      [diff, "Owned outside their origin country", "founded in one country, owned from another", null]
    ];
    $("svoCards").innerHTML = items.map(function (c) {
      var inner = '<span class="svo-card__v">' + c[0] + '</span><span class="svo-card__l">' + esc(c[1]) + '</span><span class="svo-card__d">' + esc(c[2]) + "</span>";
      if (!c[3]) return '<div class="svo-card">' + inner + "</div>";
      return '<button type="button" class="svo-card" data-apply="' + esc(JSON.stringify(c[3])) + '">' + inner + '<span class="svo-card__go">Show these</span></button>';
    }).join("");
  }
  function bars(id, key, field) {
    var pairs = count(DATA, function (v) { return v[field]; });
    var top = pairs.slice(0, 8);
    var rest = pairs.slice(8);
    var max = pairs[0][1];
    var html = top.map(function (p) {
      var apply = {};
      apply[key] = p[0];
      var width = Math.round(p[1] / max * 100);
      return '<button type="button" class="svo-barrow" data-apply="' + esc(JSON.stringify(apply)) + '" aria-label="' + esc(p[0] + ": " + p[1] + " vendors. Filter the list") + '"><span class="svo-barrow__n">' + esc(p[0]) + '</span><span class="svo-barrow__t"><span class="svo-barrow__fill" data-w="' + width + '"></span></span><span class="svo-barrow__c">' + p[1] + "</span></button>";
    }).join("");
    if (rest.length) {
      html += '<p class="svo-barrest">Also: ' + rest.map(function (p) { return esc(p[0]) + " " + p[1]; }).join(" · ") + "</p>";
    }
    $(id).innerHTML = html;
    $(id).querySelectorAll("[data-w]").forEach(function (el) {
      el.style.width = el.getAttribute("data-w") + "%";
    });
  }
  function recent() {
    var items = [];
    (META.recent || []).forEach(function (name) {
      var v = DATA.filter(function (x) { return x.n === name; })[0];
      if (!v || !v.deals.length) return;
      var d = v.deals[0];
      items.push('<li><span class="svo-recent__d">' + esc(d.d) + '</span><span><b>' + esc(v.n) + "</b> " + esc(d.t) + src(d.s) + ' <button type="button" class="svo-link" data-show="' + esc(v.n) + '">View entry</button></span></li>');
    });
    $("recentList").innerHTML = items.join("");
  }
  function sources() {
    var list = $("sourcesList");
    list.textContent = "";
    var codes = Object.keys(REFS).sort(function (a, b) { return (+a.slice(1)) - (+b.slice(1)); });
    var range = $("svoRefRange");
    if (range && codes.length) range.textContent = codes[0] + "–" + codes[codes.length - 1];
    codes.forEach(function (code) {
      var li = document.createElement("li");
      li.id = "src-" + code;
      var mark = document.createElement("span");
      mark.className = "svo-code";
      mark.textContent = code;
      var label = document.createElement("span");
      label.textContent = REFS[code].h || "";
      li.appendChild(mark);
      li.appendChild(label);
      list.appendChild(li);
    });
  }

  function detail(v) {
    var h = '<div class="svo-detail__grid">';
    h += '<div><h3>Ownership</h3><p>' + esc(v.own) + "</p>";
    if (v.chain.length) {
      h += '<ol class="svo-chain">' + v.chain.map(function (c) {
        var since = "";
        if (c.since && c.since !== "unverified") since = " · since " + esc(c.since);
        else if (c.since === "unverified") since = ' · since <span class="svo-unv">unverified</span>';
        return "<li><b>" + esc(c.e) + '</b> <span class="svo-chain__c">' + unv(c.c) + '</span><br><span class="svo-chain__r">' + esc(c.r) + since + "</span>" + src(c.s) + "</li>";
      }).join("") + "</ol>";
    }
    h += '<dl class="svo-dl"><dt>Ultimate owner</dt><dd>' + esc(v.uo) + " (" + unv(v.uoc) + ")</dd>";
    h += "<dt>Shareholders over 10%</dt><dd>" + unv(v.sh) + "</dd>";
    h += "<dt>State-linked investor</dt><dd>" + slBadge(v.sl.v) + (v.sl.n ? " " + esc(v.sl.n) : "") + src(v.sl.s) + "</dd></dl></div>";
    h += "<div><h3>Government actions</h3>";
    h += v.gov.length ? '<ul class="svo-gov">' + v.gov.map(function (g) {
      return "<li>" + esc(g.a) + ' <span class="svo-date">' + esc(g.d) + "</span>" + src(g.s) + "</li>";
    }).join("") + "</ul>" : '<p class="svo-muted">None recorded in the sources checked.</p>';
    if (v.deals.length) {
      h += '<h3>Recent deals</h3><ul class="svo-gov">' + v.deals.map(function (d) {
        return '<li><span class="svo-date">' + esc(d.d) + "</span> " + esc(d.t) + src(d.s) + "</li>";
      }).join("") + "</ul>";
    }
    h += '<h3>Company facts</h3><dl class="svo-dl"><dt>Category</dt><dd>' + esc(v.cat) + "</dd><dt>Founded</dt><dd>" + unv(v.fy) + (v.fp && v.fp !== "unverified" ? ", " + esc(v.fp) : "") + "</dd>";
    if (v.fb) h += "<dt>Founding background</dt><dd>" + esc(v.fb) + "</dd>";
    h += "<dt>R&amp;D locations</dt><dd>" + (v.rd.length ? esc(v.rd.join(", ")) : '<span class="svo-muted">None documented here</span>') + "</dd></dl>";
    if (v.notes) h += '<p class="svo-note"><b>Notes:</b> ' + esc(v.notes) + "</p>";
    h += "</div></div>";
    h += '<div class="svo-detail__tags"><h3>Tags</h3><div class="svo-tags">' + v.tags.map(tag).join("") + "</div>";
    h += '<p class="svo-srcs"><b>Main sources:</b>' + v.src.map(function (s) { return src(s); }).join(" ") + " · Last verified " + esc(verifiedLabel()) + "</p></div>";
    return h;
  }
  function row(v, i) {
    var id = "d" + i;
    var open = S.open === v.n;
    var gov = v.gov.length ? '<span class="svo-govn">' + v.gov.length + "</span>" : '<span class="svo-muted">None</span>';
    var owner = v.puoc === "Unverified" ? unv("unverified") : esc(v.uoc);
    var html = '<tr class="svo-row' + (open ? " is-open" : "") + '">' +
      '<th scope="row" data-label="Vendor"><span class="svo-name">' + esc(v.n) + '</span><span class="svo-catline">' + esc(v.b.join(" · ")) + "</span></th>" +
      '<td data-label="Origin">' + unv(v.o) + "</td>" +
      '<td data-label="HQ">' + unv(v.hq) + "</td>" +
      '<td data-label="Ultimate owner">' + owner + "</td>" +
      '<td data-label="State-linked">' + slBadge(v.sl.v) + "</td>" +
      '<td data-label="Gov actions">' + gov + "</td>" +
      '<td class="svo-tdbtn"><button type="button" class="svo-exp" aria-expanded="' + open + '" aria-controls="' + id + '" data-name="' + esc(v.n) + '"><span class="svo-exp__t">' + (open ? "Hide details" : "Details") + '</span><span class="visually-hidden"> for ' + esc(v.n) + '</span><svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></td></tr>';
    html += '<tr class="svo-detail" id="' + id + '"' + (open ? "" : " hidden") + "><td colspan=\"7\">" + (open ? detail(v) : "") + "</td></tr>";
    return html;
  }

  var LIST = [];
  function render() {
    LIST = sorted(DATA.filter(function (v) { return match(v); }));
    $("rows").innerHTML = LIST.map(row).join("");
    $("empty").hidden = LIST.length > 0;
    $("tbl").classList.toggle("is-empty", !LIST.length);
    $("count").innerHTML = "Showing <b>" + LIST.length + "</b> of " + DATA.length + " vendors";
    var act = [];
    if (S.q) act.push(["q", 'Search: "' + S.q + '"']);
    Object.keys(F).forEach(function (k) {
      if (!S[k]) return;
      var sel = $(F[k]);
      var opt = sel.options[sel.selectedIndex];
      act.push([k, FLABEL[k] + ": " + (opt ? opt.textContent.replace(/\s\(\d+\)$/, "") : S[k])]);
    });
    $("active").innerHTML = act.map(function (a) {
      return '<button type="button" class="svo-chip" data-clear="' + a[0] + '" aria-label="Remove filter ' + esc(a[1]) + '">' + esc(a[1]) + '<span aria-hidden="true">×</span></button>';
    }).join("");
    $("clearAll").hidden = !act.length;
    document.querySelectorAll("#tbl thead th").forEach(function (th) {
      var b = th.querySelector("button[data-sort]");
      if (!b) return;
      if (b.getAttribute("data-sort") === S.sort) th.setAttribute("aria-sort", S.dir === 1 ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
    });
    var ms = $("mSort");
    var mv = S.sort + ":" + S.dir;
    if (ms) {
      if (![].some.call(ms.options, function (o) { return o.value === mv; })) {
        var extra = document.createElement("option");
        extra.value = mv;
        extra.textContent = "Custom sort";
        ms.appendChild(extra);
      }
      ms.value = mv;
    }
    writeURL();
    refreshMap();
  }
  function syncControls() {
    $("q").value = S.q;
    if ($("qClear")) $("qClear").hidden = !S.q;
    Object.keys(F).forEach(function (k) {
      $(F[k]).value = S[k];
      if ($(F[k]).value !== S[k]) S[k] = "";
    });
  }
  function apply(obj) {
    Object.keys(obj).forEach(function (k) { S[k] = obj[k]; });
    syncControls();
    render();
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("listH").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  function clearAll() {
    S.q = "";
    Object.keys(F).forEach(function (k) { S[k] = ""; });
    S.open = "";
    syncControls();
    render();
    $("q").focus();
  }
  function refText(s) {
    if (!s) return "";
    if (s.g) return s.g;
    var ref = REFS[s.r];
    return ref ? (s.r + " " + ref.h) : s.r;
  }
  function cell(x) {
    x = String(x == null ? "" : x);
    if (/^[=+\-@\t\r]/.test(x)) x = "'" + x;
    return '"' + x.replace(/"/g, '""') + '"';
  }
  function csv() {
    var head = ["Vendor", "Category", "Founded", "Founded place", "Country of origin", "HQ country", "Ownership", "Ownership chain", "Ultimate owner", "Ultimate owner country", "Shareholders over 10%", "State-linked investor", "State-linked note", "Government actions", "Recent deals", "R&D locations", "Tags", "Sources", "Notes", "Last verified"];
    var lines = [head.map(cell).join(",")];
    LIST.forEach(function (v) {
      lines.push([
        v.n, v.cat, v.fy, v.fp, v.o, v.hq, v.own,
        v.chain.map(function (c) { return c.e + " [" + c.c + "; " + c.r + "; since " + c.since + "]"; }).join(" > "),
        v.uo, v.uoc, v.sh, v.sl.v, v.sl.n,
        v.gov.map(function (g) { return g.a + " (" + g.d + ") " + refText(g.s); }).join(" | "),
        v.deals.map(function (d) { return d.d + " " + d.t; }).join(" | "),
        v.rd.join("; "),
        v.tags.map(function (t) { return t.k + ": " + t.t; }).join(" | "),
        v.src.map(refText).join(" "),
        v.notes,
        META.verified
      ].map(cell).join(","));
    });
    var blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "security-vendor-origins-" + META.verified + (LIST.length < DATA.length ? "-filtered" : "") + ".csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  var MAPGEO = null;
  var mapByName = {};
  var mapMode = "origin";
  var mapZoom = 1;
  var suggestItems = [];
  var suggestActive = -1;
  var suggestTimer = 0;
  var EXAMPLES = [
    { kind: "vendor", label: "CrowdStrike", value: "CrowdStrike" },
    { kind: "vendor", label: "Splunk", value: "Splunk" },
    { kind: "vendor", label: "Checkmarx", value: "Checkmarx" }
  ];
  var GROUP_LABEL = { vendor: "Vendor", owner: "Owner", category: "Category", country: "Country", example: "Examples" };
  var LINK_LABEL = {
    hq: "Headquarters",
    owner: "Ultimate owner",
    parent: "Parent",
    rd: "Research and development",
    state: "State-linked investor",
    share: "Shareholder over 10%"
  };
  var PLACE_WORDS = [
    ["united states of america", "United States"],
    ["united states", "United States"],
    ["united kingdom", "United Kingdom"],
    ["united arab emirates", "United Arab Emirates"],
    ["czech republic", "Czech Republic"],
    ["south korea", "South Korea"],
    ["abu dhabi", "United Arab Emirates"],
    ["netherlands", "Netherlands"],
    ["beijing", "China"],
    ["singapore", "Singapore"],
    ["french", "France"],
    ["german", "Germany"],
    ["russian", "Russia"],
    ["chinese", "China"],
    ["israel", "Israel"],
    ["china", "China"],
    ["russia", "Russia"],
    ["germany", "Germany"],
    ["france", "France"],
    ["finland", "Finland"],
    ["india", "India"],
    ["canada", "Canada"],
    ["slovakia", "Slovakia"],
    ["romania", "Romania"],
    ["denmark", "Denmark"],
    ["turkey", "Turkey"],
    ["sweden", "Sweden"],
    ["italy", "Italy"],
    ["japan", "Japan"],
    ["luxembourg", "Luxembourg"],
    ["taiwan", "Taiwan"],
    ["philippines", "Philippines"],
    ["spain", "Spain"],
    ["korea", "South Korea"]
  ];

  function levenshtein(a, b) {
    if (a === b) return 0;
    var prev = [];
    var i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      var cur = [i];
      for (j = 1; j <= b.length; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      prev = cur;
    }
    return prev[b.length];
  }
  function scoreText(query, text) {
    var q = String(query || "").toLowerCase();
    var t = String(text || "").toLowerCase();
    if (q.length < 2 || !t) return 0;
    var at = t.indexOf(q);
    if (at === 0) return 100;
    if (at > 0) return 70;
    if (q.length < 4) return 0;
    var words = t.split(/[^a-z0-9]+/);
    var best = 0;
    words.forEach(function (word) {
      if (!word || Math.abs(word.length - q.length) > 2) return;
      var dist = levenshtein(q, word);
      var allow = q.length >= 8 ? 2 : 1;
      if (dist <= allow) best = Math.max(best, 40 - dist);
    });
    return best;
  }
  function usefulOwner(name) {
    if (!name || name === "unverified") return false;
    var lower = name.toLowerCase();
    if (lower.indexOf("no controlling") >= 0 || lower.indexOf("not disclosed") >= 0 || lower.indexOf("not checked") >= 0) return false;
    if (lower.indexOf("public company") === 0 || lower.indexOf("private (") === 0) return false;
    return true;
  }
  function countriesInText(text) {
    var found = [];
    var lower = String(text || "").toLowerCase();
    var used = [];
    PLACE_WORDS.forEach(function (pair) {
      var word = pair[0];
      var idx = lower.indexOf(word);
      if (idx < 0) return;
      var before = idx === 0 || !/[a-z0-9]/.test(lower.charAt(idx - 1));
      var after = idx + word.length >= lower.length || !/[a-z0-9]/.test(lower.charAt(idx + word.length));
      if (!before || !after) return;
      var inside = used.some(function (span) { return idx >= span[0] && idx < span[1]; });
      if (inside) return;
      used.push([idx, idx + word.length]);
      if (found.indexOf(pair[1]) < 0) found.push(pair[1]);
    });
    return found;
  }
  function knownCountry(name) {
    if (!name) return "";
    var clean = String(name).replace(/\s*\(.*$/, "").trim();
    if (!clean || clean.toLowerCase() === "unverified") return "";
    if (mapByName[clean]) return clean;
    var hits = countriesInText(clean);
    return hits.length ? hits[0] : "";
  }
  function splitCountries(value) {
    if (!value || value === "unverified") return [];
    var out = [];
    String(value).split(/\s*\/\s*/).forEach(function (part) {
      var name = knownCountry(part);
      if (name && out.indexOf(name) < 0) out.push(name);
    });
    return out;
  }
  function fillMatch(el, text, query) {
    var q = String(query || "");
    var at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
    el.textContent = "";
    if (at < 0) {
      el.textContent = text;
      return;
    }
    el.appendChild(document.createTextNode(text.slice(0, at)));
    var mark = document.createElement("mark");
    mark.className = "svo-hit";
    mark.textContent = text.slice(at, at + q.length);
    el.appendChild(mark);
    el.appendChild(document.createTextNode(text.slice(at + q.length)));
  }
  function hideSuggest() {
    var list = $("svoSuggest");
    if (!list) return;
    list.hidden = true;
    list.textContent = "";
    suggestItems = [];
    suggestActive = -1;
    $("q").setAttribute("aria-expanded", "false");
    $("q").setAttribute("aria-activedescendant", "");
  }
  function paintSuggest(items, query, emptyText) {
    var list = $("svoSuggest");
    list.textContent = "";
    suggestItems = items;
    suggestActive = -1;
    if (!items.length) {
      var empty = document.createElement("li");
      empty.className = "svo-suggest__empty";
      empty.setAttribute("role", "presentation");
      empty.textContent = emptyText || "No matches — try CrowdStrike, Splunk or Checkmarx";
      list.appendChild(empty);
    } else {
      var last = "";
      items.forEach(function (item, index) {
        if (item.kind !== last) {
          var head = document.createElement("li");
          head.className = "svo-suggest__group";
          head.setAttribute("role", "presentation");
          head.textContent = GROUP_LABEL[item.kind] || item.kind;
          list.appendChild(head);
          last = item.kind;
        }
        var opt = document.createElement("li");
        opt.className = "svo-suggest__opt";
        opt.id = "svo-opt-" + index;
        opt.setAttribute("role", "option");
        opt.setAttribute("aria-selected", "false");
        var hidden = document.createElement("span");
        hidden.className = "visually-hidden";
        hidden.textContent = (GROUP_LABEL[item.kind] || "") + " ";
        opt.appendChild(hidden);
        var label = document.createElement("span");
        fillMatch(label, item.label, query);
        opt.appendChild(label);
        list.appendChild(opt);
      });
    }
    list.hidden = false;
    $("q").setAttribute("aria-expanded", "true");
  }
  function showSuggest(query) {
    var q = String(query || "").trim();
    if (q.length < 2) {
      paintSuggest(EXAMPLES.map(function (item) { return { kind: "example", label: item.label, value: item.value, pick: "vendor" }; }), "", "");
      return;
    }
    var groups = { vendor: [], owner: [], category: [], country: [] };
    var seen = {};
    function push(kind, label, value) {
      var key = kind + "\0" + value;
      if (seen[key]) return;
      var rank = scoreText(q, label);
      if (!rank) return;
      seen[key] = true;
      groups[kind].push({ kind: kind, label: label, value: value, score: rank, pick: kind });
    }
    DATA.forEach(function (v) {
      push("vendor", v.n, v.n);
      if (usefulOwner(v.uo)) push("owner", v.uo, v.uo);
      v.chain.forEach(function (c) { if (usefulOwner(c.e)) push("owner", c.e, c.e); });
      v.b.forEach(function (b) { push("category", b, b); });
      [v.po, v.hq, v.puoc].forEach(function (c) {
        var name = knownCountry(c);
        if (name) push("country", name, name);
      });
    });
    function byRank(a, b) { return b.score - a.score || a.label.localeCompare(b.label); }
    var picked = groups.vendor.sort(byRank).slice(0, 4);
    var others = groups.owner.concat(groups.category, groups.country).sort(byRank);
    others.slice(0, 8 - picked.length).forEach(function (item) { picked.push(item); });
    if (picked.length < 8) groups.vendor.sort(byRank).slice(4, 4 + (8 - picked.length)).forEach(function (item) { picked.push(item); });
    var order = { vendor: 0, owner: 1, category: 2, country: 3 };
    picked.sort(function (a, b) { return order[a.kind] - order[b.kind] || b.score - a.score || a.label.localeCompare(b.label); });
    paintSuggest(picked, q);
  }
  function moveSuggest(step) {
    if (!$("svoSuggest") || $("svoSuggest").hidden) showSuggest($("q").value.trim());
    if (!suggestItems.length) return;
    suggestActive = (suggestActive + step + suggestItems.length) % suggestItems.length;
    suggestItems.forEach(function (item, index) {
      var opt = $("svo-opt-" + index);
      if (!opt) return;
      var on = index === suggestActive;
      opt.setAttribute("aria-selected", on ? "true" : "false");
      if (on) {
        $("q").setAttribute("aria-activedescendant", opt.id);
        opt.scrollIntoView({ block: "nearest" });
      }
    });
  }
  function cancelSuggestTimer() {
    clearTimeout(suggestTimer);
    suggestTimer = 0;
  }
  function chooseSuggest(item) {
    cancelSuggestTimer();
    hideSuggest();
    var kind = item.pick || item.kind;
    if (kind === "vendor") {
      apply({ q: item.value, cat: "", origin: "", owner: "", sl: "", gov: "", open: item.value });
      var row = root.querySelector(".svo-row.is-open");
      if (row) row.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    if (kind === "category") {
      apply({ q: "", cat: item.value, origin: "", owner: "", sl: "", gov: "", open: "" });
      return;
    }
    if (kind === "country") {
      var origins = DATA.filter(function (v) { return v.po === item.value; }).length;
      var owners = DATA.filter(function (v) { return v.puoc === item.value; }).length;
      if (origins) {
        apply({ q: "", cat: "", origin: item.value, owner: "", sl: "", gov: "", open: "" });
        return;
      }
      if (owners) {
        apply({ q: "", cat: "", origin: "", owner: item.value, sl: "", gov: "", open: "" });
        return;
      }
      apply({ q: item.value, cat: "", origin: "", owner: "", sl: "", gov: "", open: "" });
      return;
    }
    apply({ q: item.value, cat: "", origin: "", owner: "", sl: "", gov: "", open: "" });
  }
  function submitSearch() {
    cancelSuggestTimer();
    S.q = $("q").value.trim();
    hideSuggest();
    render();
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("listH").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  function clearQuery() {
    cancelSuggestTimer();
    $("q").value = "";
    S.q = "";
    $("qClear").hidden = true;
    hideSuggest();
    render();
    $("q").focus();
  }
  function vendorPlaces(v) {
    var origin = knownCountry(v.po) || knownCountry(v.o);
    var links = [];
    function add(country, type) {
      if (!country || country === origin) return;
      links.push({ country: country, type: type });
    }
    splitCountries(v.hq).forEach(function (c) { add(c, "hq"); });
    add(knownCountry(v.puoc), "owner");
    v.chain.forEach(function (c) { add(knownCountry(c.c), "parent"); });
    (v.rd || []).forEach(function (c) { add(knownCountry(c), "rd"); });
    if (v.sl && v.sl.v === "yes") countriesInText(v.sl.n).forEach(function (c) { add(c, "state"); });
    countriesInText(v.sh).forEach(function (c) { add(c, "share"); });
    return { origin: origin, links: links };
  }
  function curve(a, b, offset) {
    var mx = (a.x + b.x) / 2;
    var my = (a.y + b.y) / 2;
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    return "M" + a.x + " " + a.y + " Q" + (mx + (-dy / len) * offset) + " " + (my + (dx / len) * offset) + " " + b.x + " " + b.y;
  }
  function setMapZoom(next) {
    if (!MAPGEO) return;
    mapZoom = Math.max(1, Math.min(4, next));
    var vw = MAPGEO.view[0] / mapZoom;
    var vh = MAPGEO.view[1] / mapZoom;
    var x = (MAPGEO.view[0] - vw) / 2;
    var y = (MAPGEO.view[1] - vh) / 2;
    $("svoMap").setAttribute("viewBox", x + " " + y + " " + vw + " " + vh);
  }
  function selectCountry(name) {
    var field = mapMode === "owner" ? "owner" : "origin";
    var next = {};
    next[field] = S[field] === name ? "" : name;
    apply(next);
  }
  function countBucket(n) {
    if (!n) return "";
    if (n >= 21) return " is-4";
    if (n >= 9) return " is-3";
    if (n >= 3) return " is-2";
    return " is-1";
  }
  function buildMap() {
    if (!MAPGEO || !$("svoMap")) return;
    mapByName = {};
    var svg = $("svoMap");
    svg.setAttribute("viewBox", "0 0 " + MAPGEO.view[0] + " " + MAPGEO.view[1]);
    var markup = MAPGEO.countries.map(function (c) {
      mapByName[c.name] = c;
      if (c.point) {
        return '<circle class="svo-map__land" data-name="' + esc(c.name) + '" cx="' + c.x + '" cy="' + c.y + '" r="6" tabindex="0" role="button"></circle>';
      }
      return '<path class="svo-map__land" data-name="' + esc(c.name) + '" d="' + c.d + '" tabindex="0" role="button"></path>';
    }).join("") + '<g id="svoMapLinks"></g>';
    svg.innerHTML = markup;
    svg.querySelectorAll(".svo-map__land").forEach(function (el) {
      var name = el.getAttribute("data-name");
      el.addEventListener("click", function () { selectCountry(name); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectCountry(name); }
      });
      function status() {
        var count = el.getAttribute("data-count") || "0";
        $("mapStatus").textContent = name + " — " + count + (count === "1" ? " vendor" : " vendors");
      }
      el.addEventListener("pointerover", status);
      el.addEventListener("focus", status);
    });
    if (MAPGEO.note) {
      var note = document.getElementById("mapNote");
      if (note) note.textContent = MAPGEO.note;
    }
  }
  function refreshMap() {
    if (!MAPGEO || !$("svoMap") || !$("svoMap").querySelector(".svo-map__land")) return;
    var field = mapMode === "owner" ? "puoc" : "po";
    var except = mapMode === "owner" ? "owner" : "origin";
    var counts = {};
    DATA.forEach(function (v) {
      if (!match(v, except)) return;
      var name = knownCountry(v[field]);
      if (!name) return;
      counts[name] = (counts[name] || 0) + 1;
    });
    var active = mapMode === "owner" ? S.owner : S.origin;
    $("svoMap").querySelectorAll(".svo-map__land").forEach(function (el) {
      var name = el.getAttribute("data-name");
      var n = counts[name] || 0;
      el.setAttribute("data-count", String(n));
      el.setAttribute("class", "svo-map__land" + countBucket(n) + (name === active ? " is-selected" : ""));
      el.setAttribute("aria-label", name + ", " + n + (n === 1 ? " vendor" : " vendors"));
    });
    var list = $("mapList");
    if (list) {
      var names = Object.keys(mapByName).filter(function (name) { return counts[name]; }).sort(function (a, b) {
        return counts[b] - counts[a] || a.localeCompare(b);
      });
      list.textContent = "";
      names.forEach(function (name) {
        var li = document.createElement("li");
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = name + " (" + counts[name] + ")";
        button.setAttribute("aria-pressed", name === active ? "true" : "false");
        button.addEventListener("click", function () { selectCountry(name); });
        li.appendChild(button);
        list.appendChild(li);
      });
    }
    var vendor = DATA.filter(function (v) { return v.n === S.open; })[0];
    var panel = $("mapPanel");
    var linkList = $("mapLinks");
    var lines = $("svoMapLinks");
    if (lines) lines.textContent = "";
    if (!vendor) {
      if (panel) panel.hidden = true;
      $("mapOrigin").setAttribute("aria-pressed", mapMode === "origin" ? "true" : "false");
      $("mapOwner").setAttribute("aria-pressed", mapMode === "owner" ? "true" : "false");
      return;
    }
    var info = vendorPlaces(vendor);
    if (info.origin && mapByName[info.origin]) {
      var home = $("svoMap").querySelector('.svo-map__land[data-name="' + info.origin.replace(/"/g, "") + '"]');
      if (home && home.getAttribute("class").indexOf("is-home") < 0) home.setAttribute("class", home.getAttribute("class") + " is-home");
    }
    var grouped = {};
    info.links.forEach(function (link) {
      if (!grouped[link.country]) grouped[link.country] = [];
      if (grouped[link.country].indexOf(link.type) < 0) grouped[link.country].push(link.type);
    });
    var offsets = { hq: 16, owner: -16, parent: 30, rd: -30, state: 44, share: -44 };
    if (lines && info.origin && mapByName[info.origin]) {
      var from = mapByName[info.origin];
      var markup = [];
      info.links.forEach(function (link) {
        var to = mapByName[link.country];
        if (!to) return;
        markup.push('<path class="svo-map__link svo-map__link--' + link.type + '" d="' + curve(from, to, offsets[link.type] || 18) + '"></path>');
      });
      lines.innerHTML = markup.join("");
    }
    panel.hidden = false;
    $("mapPanelH").textContent = vendor.n;
    linkList.textContent = "";
    var rows = [];
    if (info.origin) rows.push("Origin: " + info.origin);
    var countries = Object.keys(grouped).sort();
    if (!countries.length) rows.push("No links to other countries.");
    countries.forEach(function (country) {
      rows.push(country + " — " + grouped[country].map(function (type) { return LINK_LABEL[type] || type; }).join(", "));
    });
    rows.forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text;
      linkList.appendChild(li);
    });
    $("mapOrigin").setAttribute("aria-pressed", mapMode === "origin" ? "true" : "false");
    $("mapOwner").setAttribute("aria-pressed", mapMode === "owner" ? "true" : "false");
  }

  function bind() {
    $("q").addEventListener("input", function () {
      cancelSuggestTimer();
      var val = this.value;
      $("qClear").hidden = !val;
      suggestTimer = setTimeout(function () {
        suggestTimer = 0;
        S.q = val.trim();
        render();
        showSuggest(val.trim());
      }, 80);
    });
    $("q").addEventListener("focus", function () { showSuggest(this.value.trim()); });
    $("q").addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); moveSuggest(1); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); moveSuggest(-1); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        if (suggestActive >= 0 && suggestItems[suggestActive]) chooseSuggest(suggestItems[suggestActive]);
        else submitSearch();
        return;
      }
      if (e.key === "Escape") {
        if ($("svoSuggest") && !$("svoSuggest").hidden) { e.preventDefault(); hideSuggest(); return; }
        if (this.value) { cancelSuggestTimer(); this.value = ""; S.q = ""; $("qClear").hidden = true; render(); }
      }
    });
    $("svoSuggest").addEventListener("mousedown", function (e) { e.preventDefault(); });
    $("svoSuggest").addEventListener("click", function (e) {
      var opt = e.target.closest("[role=option]");
      if (!opt) return;
      var index = +opt.id.replace("svo-opt-", "");
      if (suggestItems[index]) chooseSuggest(suggestItems[index]);
    });
    $("qClear").addEventListener("click", clearQuery);
    $("qSearch").addEventListener("click", submitSearch);
    document.addEventListener("click", function (e) {
      if (e.target.closest(".svo-searchrow")) return;
      hideSuggest();
    });
    $("mapOrigin").addEventListener("click", function () { mapMode = "origin"; refreshMap(); });
    $("mapOwner").addEventListener("click", function () { mapMode = "owner"; refreshMap(); });
    $("mapZoomIn").addEventListener("click", function () { setMapZoom(mapZoom * 1.4); });
    $("mapZoomOut").addEventListener("click", function () { setMapZoom(mapZoom / 1.4); });
    $("mapZoomReset").addEventListener("click", function () { setMapZoom(1); });
    Object.keys(F).forEach(function (k) {
      $(F[k]).addEventListener("change", function () { S[k] = this.value; render(); });
    });
    document.querySelectorAll("#tbl thead button[data-sort]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-sort");
        if (S.sort === k) S.dir = -S.dir;
        else { S.sort = k; S.dir = 1; }
        render();
      });
    });
    $("mSort").addEventListener("change", function () {
      var p = this.value.split(":");
      S.sort = p[0];
      S.dir = +p[1];
      render();
    });
    $("clearAll").addEventListener("click", clearAll);
    $("emptyClear").addEventListener("click", clearAll);
    $("dlCsv").addEventListener("click", csv);
    $("copyLink").addEventListener("click", function () {
      var button = this;
      var done = function () {
        button.textContent = "Link copied";
        setTimeout(function () { button.textContent = "Copy link to this view"; }, 1800);
      };
      var href = location.href;
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(href).then(done, function () { window.prompt("Copy this link", href); });
      else window.prompt("Copy this link", href);
    });
    root.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || !root.contains(b)) return;
      if (b.hasAttribute("data-apply")) {
        var obj = JSON.parse(b.getAttribute("data-apply"));
        var base = { q: "", cat: "", origin: "", owner: "", sl: "", gov: "", open: "" };
        Object.keys(obj).forEach(function (k) { base[k] = obj[k]; });
        apply(base);
        return;
      }
      if (b.hasAttribute("data-clear")) {
        S[b.getAttribute("data-clear")] = "";
        syncControls();
        render();
        $("q").focus();
        return;
      }
      if (b.hasAttribute("data-show")) {
        var name = b.getAttribute("data-show");
        apply({ q: name, cat: "", origin: "", owner: "", sl: "", gov: "", open: name });
        return;
      }
      if (b.classList.contains("svo-exp")) {
        var tr = document.getElementById(b.getAttribute("aria-controls"));
        var name = b.getAttribute("data-name");
        var open = b.getAttribute("aria-expanded") !== "true";
        var v = DATA.filter(function (x) { return x.n === name; })[0];
        if (open && tr.firstChild && !tr.firstChild.innerHTML) tr.firstChild.innerHTML = detail(v);
        tr.hidden = !open;
        b.setAttribute("aria-expanded", String(open));
        b.querySelector(".svo-exp__t").textContent = open ? "Hide details" : "Details";
        b.closest("tr").classList.toggle("is-open", open);
        S.open = open ? name : (S.open === name ? "" : S.open);
        writeURL();
        refreshMap();
      }
    });
  }

  fetch("/data/security-vendors.json", { credentials: "same-origin" }).then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function (d) {
    META = d.meta;
    d.refs.forEach(function (r) { REFS[r.c] = r; });
    DATA = d.vendors;
    DATA.forEach(function (v) { v._h = hay(v); });
    var flat = [].concat.apply([], DATA.map(function (v) { return v.b.map(function (b) { return { b: b }; }); }));
    fillSelect("fCat", count(flat, function (x) { return x.b; }).sort(function (a, b) { return a[0].localeCompare(b[0]); }));
    fillSelect("fOrigin", count(DATA, function (v) { return v.po; }));
    fillSelect("fOwner", count(DATA, function (v) { return v.puoc; }));
    if (window.matchMedia("(max-width: 760px)").matches) {
      var legend = root.querySelector(".svo-legend");
      if (legend) legend.open = false;
    }
    cards();
    bars("barsOrigin", "origin", "po");
    bars("barsOwner", "owner", "puoc");
    recent();
    sources();
    readURL();
    syncControls();
    bind();
    render();
    fetch("/data/world-countries.json", { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (geo) {
      MAPGEO = geo;
      buildMap();
      refreshMap();
      $("mapStatus").textContent = "Hover or focus a country, or open the country list.";
    }).catch(function () {
      $("mapStatus").textContent = "The map could not be loaded.";
    });
    if (S.open) {
      var opened = root.querySelector('.svo-exp[aria-expanded="true"]');
      if (opened) opened.closest("tr").scrollIntoView({ block: "center" });
    }
  }).catch(function () {
    $("rows").innerHTML = '<tr><td colspan="7" class="svo-loading">The vendor list could not be loaded. Please refresh the page.</td></tr>';
    $("count").textContent = "The vendor list could not be loaded.";
  });
})();
