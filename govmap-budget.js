/* GOV Assured — department budget share from PESA Table 1.9. Text via textContent.
   Figures come from /data/budget.json, built from the PESA workbook. */
(function () {
  "use strict";
  var mount = document.getElementById("gm-budget");
  if (!mount) return;
  var credit = document.getElementById("gm-credit");
  var HOSTS = { "www.gov.uk": 1, "assets.publishing.service.gov.uk": 1, "www.nationalarchives.gov.uk": 1 };

  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }
  function safeHref(u, host) {
    try {
      var p = new URL(u);
      if (p.protocol !== "https:" || p.username || p.password || p.port) return null;
      if (host && p.hostname !== host) return null;
      if (!HOSTS[p.hostname]) return null;
      return p.href;
    } catch (e) { return null; }
  }
  function ext(label, url, host) {
    var href = safeHref(url, host);
    if (!href) return document.createTextNode(label);
    var a = make("a", null, label);
    a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.appendChild(make("span", "visually-hidden", " (opens in a new tab)"));
    return a;
  }
  function pct(share) {
    if (share == null || !isFinite(share)) return "—";
    return (share * 100).toFixed(2) + "%";
  }
  function pounds(million, places) {
    if (million == null || !isFinite(million)) return "Figure missing";
    var sign = million < 0 ? "\u2212" : "";
    var abs = Math.abs(million);
    if (abs >= 1000) {
      var dec = places != null ? places : 1;
      return sign + "\u00a3" + (abs / 1000).toFixed(dec) + "bn";
    }
    return sign + "\u00a3" + abs.toLocaleString("en-GB") + "m";
  }
  function kindClass(kind) {
    if (kind === "adjustment") return "gm-budg-adj";
    return "";
  }

  function render(data) {
    mount.textContent = "";
    var meta = make("p", "gm-budg-meta");
    meta.appendChild(document.createTextNode("Treasury departmental groups, "));
    var yr = make("strong", null, data.year + " " + (data.basis || "plans"));
    meta.appendChild(yr);
    meta.appendChild(document.createTextNode(". The measure is " + data.measure + ". Amounts are published in " + data.unit + " and shown here as £ billion (or £ million when under £1 billion)."));
    mount.appendChild(meta);

    var total = data.total || {};
    var box = make("p", "gm-budg-total");
    box.appendChild(make("span", "gm-budg-total-n", pounds(total.plansMillion, 2)));
    box.appendChild(make("span", "gm-budg-total-l", "Total DEL, " + data.year + " plans (" + (total.plansMillion && total.plansMillion.toLocaleString("en-GB")) + " million). Shares below use this published total as the denominator."));
    mount.appendChild(box);

    var groups = (data.groups || []).slice();
    var depts = groups.filter(function (g) { return g.kind !== "adjustment"; });
    var adjs = groups.filter(function (g) { return g.kind === "adjustment"; });
    depts.sort(function (a, b) { return (b.plansMillion || 0) - (a.plansMillion || 0); });
    var max = 0;
    depts.concat(adjs).forEach(function (g) {
      var a = Math.abs(g.plansMillion || 0);
      if (a > max) max = a;
    });
    var list = make("ul", "gm-budg-bars");
    list.setAttribute("aria-label", "Total DEL by departmental group, " + data.year);
    function row(g) {
      var li = make("li", "gm-budg-item " + kindClass(g.kind) + (g.plansMillion < 0 ? " gm-budg-neg" : ""));
      var row = make("div", "gm-budg-row");
      var h = make("div", "gm-budg-h");
      var name = make("div", "gm-budg-name", g.pesaName);
      if (g.map && g.map !== g.pesaName) name.appendChild(make("span", "gm-budg-map", "On this map: " + g.map));
      else if (g.missing === "closed-on-map" || g.pesaNameNote) name.appendChild(make("span", "gm-budg-map", "Older PESA name — not combined into BIST"));
      h.appendChild(name);
      var fig = make("div", "gm-budg-fig", pct(g.shareOfTotalDel) + " · " + pounds(g.plansMillion));
      var exact = (g.plansMillion != null) ? (g.plansMillion.toLocaleString("en-GB") + " million") : "missing";
      fig.title = exact;
      fig.appendChild(make("span", "visually-hidden", " (" + exact + ")"));
      h.appendChild(fig);
      row.appendChild(h);
      var track = make("div", "gm-budg-track");
      track.setAttribute("aria-hidden", "true");
      var fill = make("div", "gm-budg-fill");
      var w = max ? (Math.abs(g.plansMillion || 0) / max) * 100 : 0;
      fill.style.width = w.toFixed(3) + "%";
      track.appendChild(fill);
      row.appendChild(track);
      li.appendChild(row);
      if (g.note) li.appendChild(make("p", "gm-budg-note", g.note));
      list.appendChild(li);
    }
    depts.forEach(row);
    mount.appendChild(list);
    if (adjs.length) {
      mount.appendChild(make("h2", "gm-letter-h", "Reserves and adjustments"));
      var list2 = make("ul", "gm-budg-bars");
      adjs.forEach(row);
      mount.appendChild(list2);
    }

    if (data.combined) {
      var c = data.combined;
      var p = make("p", "gm-budg-combined");
      p.appendChild(make("strong", null, c.map + " combined: "));
      p.appendChild(document.createTextNode(pounds(c.plansMillion) + " (" + pct(c.shareOfTotalDel) + "). " + c.note + " The two published lines are " + (c.parts || []).join(" and ") + "."));
      mount.appendChild(p);
    }

    var cav = make("div", null);
    cav.appendChild(make("h2", "gm-letter-h", "How to read this"));
    var ul = make("ul", "gm-budg-caveats");
    (data.caveats || []).forEach(function (t) { ul.appendChild(make("li", null, t)); });
    cav.appendChild(ul);
    mount.appendChild(cav);

    var src = data.source || {};
    var psrc = make("p", "gm-budg-src");
    psrc.appendChild(document.createTextNode("Source: "));
    psrc.appendChild(ext(src.title || "PESA 2026 Table 1.9", src.url, "www.gov.uk"));
    psrc.appendChild(document.createTextNode((src.published ? ", published " + src.published : "") + ". Sheet " + (src.sheet || "Table_1_9") + ". "));
    if (src.workbook) {
      psrc.appendChild(ext("Chapter 1 tables (XLSX)", src.workbook, "assets.publishing.service.gov.uk"));
      psrc.appendChild(document.createTextNode(". "));
    }
    psrc.appendChild(ext(src.licence || "Open Government Licence v3.0", src.licenceUrl, "www.nationalarchives.gov.uk"));
    mount.appendChild(psrc);
    if (credit) {
      credit.textContent = "";
      credit.appendChild(document.createTextNode("Contains public sector information licensed under the "));
      var a = ext("Open Government Licence v3.0", src.licenceUrl, "www.nationalarchives.gov.uk");
      credit.appendChild(a);
      credit.appendChild(document.createTextNode("."));
    }
  }

  fetch("/data/budget.json", { credentials: "same-origin" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () {
      mount.appendChild(make("p", "error", "This page could not load the PESA budget figures."));
    });
})();
