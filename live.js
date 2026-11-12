/* GOV Assured home: live feeds. Each feed item links to its source (new tab); only http(s) URLs are linked. */
(function () {
  "use strict";
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href").slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", "#" + id);
    });
  });

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(d) {
    if (!d) return "";
    var t = new Date(d);
    if (isNaN(t)) return "";
    return t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  function daysAgo(d) {
    var t = new Date(d);
    if (isNaN(t)) return "";
    var n = Math.round((Date.now() - t) / 86400000);
    return n <= 0 ? "today" : n === 1 ? "1 day ago" : n + " days ago";
  }
  function get(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.json();
    });
  }
  // Wrap a feed item in a link to its source when it has a safe http(s) URL; otherwise render it as plain text.
  function item(tag, cls, url, inner) {
    if (typeof url === "string" && /^https?:\/\/[^\s"'<>]+$/i.test(url)) {
      return '<a class="' + cls + ' lv-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + inner + "</a>";
    }
    return "<" + tag + ' class="' + cls + '">' + inner + "</" + tag + ">";
  }
  function empty(el, msg) { el.innerHTML = '<div class="lv-note">' + esc(msg) + "</div>"; }
  function byId(id) { return document.getElementById(id); }

  // Show the first 3 rows, the rest behind a native "View all" disclosure (no JS toggle needed).
  function list(rows, label) {
    var head = rows.slice(0, 3).join("");
    if (rows.length <= 3) return head;
    return head + '<details class="lv-more"><summary>View all ' + esc(label) + " (" + rows.length + ")</summary>" + rows.slice(3).join("") + "</details>";
  }
  function safe(url) { return typeof url === "string" && /^https?:\/\/[^\s"'<>]+$/i.test(url); }

  // CISA KEV
  get("/api/kev").then(function (data) {
    var fw = byId("featured-wrap");
    if (data.featured) {
      var f = data.featured;
      fw.innerHTML = '<article class="lv-featured" aria-labelledby="lv-fcve">' +
        '<div class="lv-flabel">Latest exploited vulnerability</div>' +
        '<h2 class="lv-fcve" id="lv-fcve">' + esc(f.cveID) + (f.name ? " · " + esc(f.name) : " · " + esc(f.vendor) + " " + esc(f.product)) + "</h2>" +
        '<div class="lv-r-meta">' + esc(f.vendor) + " " + esc(f.product) + " · added to KEV " + esc(fmtDate(f.dateAdded)) +
        (f.ransomware ? ' · <span class="lv-pill lv-pill-ransom">known ransomware use</span>' : "") + "</div>" +
        '<p class="lv-fdesc">' + esc(f.description) + "</p>" +
        (f.action ? '<div class="lv-faction"><div class="lv-faction-h">Required action (from CISA KEV)</div>' + esc(f.action) +
          (f.dueDate ? '<div class="lv-r-meta">US federal due date: ' + esc(fmtDate(f.dueDate)) + "</div>" : "") + "</div>" : "") +
        (safe(f.url) ? '<a class="btn btn-primary lv-fbtn" href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer">View advisory (NVD) →</a>' : "") +
        "</article>";
    } else {
      fw.innerHTML = '<div class="lv-featured"><div class="lv-flabel">Latest exploited vulnerability</div><div class="lv-note">' + esc(data.error || "Not available.") + "</div></div>";
    }
    var el = byId("kev-body");
    var top = "";
    if (typeof data.added30 === "number" && data.trend && data.trend.length) {
      var max = Math.max.apply(null, data.trend.map(function (d) { return d.count; }).concat([1]));
      var w = 300 / data.trend.length;
      var bars = data.trend.map(function (d, i) {
        var h = Math.round((d.count / max) * 56);
        return '<rect x="' + (i * w + 1).toFixed(1) + '" y="' + (60 - h) + '" width="' + (w - 2).toFixed(1) + '" height="' + h + '"><title>' + esc(fmtDate(d.date)) + ": " + d.count + "</title></rect>";
      }).join("");
      top = '<div class="lv-kpi"><div class="lv-kpi-n">' + esc(data.added30) + '</div><div class="lv-kpi-l">added in the last 30 days' +
        (data.total ? '<span class="lv-r-meta">' + esc(Number(data.total).toLocaleString("en-GB")) + " in the catalogue in total</span>" : "") + "</div></div>" +
        '<svg class="lv-trend" viewBox="0 0 300 62" preserveAspectRatio="none" role="img" aria-label="New KEV entries per day, last 30 days">' + bars +
        '<line x1="0" y1="60.5" x2="300" y2="60.5"></line></svg><div class="lv-trend-l"><span>30 days ago</span><span>today</span></div>';
    }
    if (!data.items || !data.items.length) { el.innerHTML = top || ""; if (!top) empty(el, data.error || "No KEV entries available."); return; }
    el.innerHTML = top + list(data.items.map(function (v) {
      return item("div", "lv-row", v.url,
        '<div class="lv-r-top"><span class="lv-r-title">' + esc(v.cveID) + " — " + esc(v.vendor) + " " + esc(v.product) + "</span>" +
        (v.ransomware ? '<span class="lv-pill lv-pill-ransom">ransomware</span>' : '<span class="lv-pill lv-pill-crit">exploited</span>') + "</div>" +
        '<div class="lv-r-meta">Added ' + esc(fmtDate(v.dateAdded)) + (v.dueDate ? " · patch by " + esc(fmtDate(v.dueDate)) : "") + "</div>");
    }), "KEV entries");
  }).catch(function () { empty(byId("kev-body"), "KEV feed unavailable."); empty(byId("featured-wrap"), "KEV feed unavailable."); });

  // UK cyber news: panel and ticker
  function buildTicker(items) {
    var track = byId("tickerTrack");
    if (!track) return;
    if (!items || !items.length) { track.innerHTML = '<span class="lv-ticker-item">No recent UK cyber news.</span>'; return; }
    var sep = '<span class="lv-ticker-sep" aria-hidden="true">•</span>';
    var html = items.map(function (a) {
      return item("span", "lv-ticker-item", a.url, '<span class="lv-ticker-src">' + esc(a.source || "News") + "</span>" + esc(a.title));
    }).join(sep);
    track.innerHTML = html + sep + html;
    var oneCopy = track.scrollWidth / 2;
    track.style.animationDuration = Math.max(25, Math.round(oneCopy / 70)) + "s";
  }
  var lastSig = "";
  function loadNews() {
    get("/api/news").then(function (data) {
      var items = data.items || [];
      var el = byId("news-body");
      if (!items.length) {
        empty(el, data.error || "No recent UK cyber news found.");
      } else {
        el.innerHTML = list(items.map(function (a) {
          return item("div", "lv-row", a.url,
            '<div class="lv-r-top"><span class="lv-r-title">' + esc(a.title) + "</span>" +
            '<span class="lv-pill lv-pill-news">' + esc(a.source || "News") + "</span></div>" +
            (a.date ? '<div class="lv-r-meta">' + esc(fmtDate(a.date)) + " · " + esc(daysAgo(a.date)) + "</div>" : ""));
        }), "news");
      }
      var sig = items.map(function (a) { return a.title + " " + (a.url || ""); }).join("|");
      if (sig !== lastSig) { buildTicker(items); lastSig = sig; }
    }).catch(function () {
      empty(byId("news-body"), "News feed unavailable.");
      if (!lastSig) buildTicker(null);
    });
  }
  loadNews();
  setInterval(loadNews, 5 * 60 * 1000);

  // NCSC and UK advisories
  get("/api/advisories").then(function (data) {
    var el = byId("adv-body");
    if (!data.items || !data.items.length) return empty(el, data.error || "No advisories available.");
    // Severity badges only if the source supplies a rating (NCSC/Action Fraud RSS currently give none).
    el.innerHTML = list(data.items.map(function (a) {
      return item("div", "lv-row", a.url,
        '<div class="lv-r-top"><span class="lv-r-title">' + esc(a.title) + "</span>" +
        (a.severity ? '<span class="lv-pill lv-pill-crit">' + esc(a.severity) + "</span>" : "") +
        '<span class="lv-pill lv-pill-date">' + esc(a.source || "NCSC") + "</span></div>" +
        (a.date ? '<div class="lv-r-meta">' + esc(fmtDate(a.date)) + "</div>" : ""));
    }), "advisories");
  }).catch(function () { empty(byId("adv-body"), "Advisory feed unavailable."); });

  byId("threats-foot").textContent =
    "Sources: CISA KEV (linked to NVD; required action text is quoted from CISA), UK security press, NCSC and Action Fraud. Items open the source in a new tab. Feeds are cached and refreshed automatically. Not exhaustive; for guidance only.";

  // Ransomware tracker
  get("/api/ransomware").then(function (data) {
    var el = byId("ransom-body");
    if (!data.items || !data.items.length) return empty(el, data.error || "No recent UK victims listed.");
    el.innerHTML = data.items.map(function (v) {
      return item("div", "lv-row", v.url,
        '<div class="lv-r-top"><span class="lv-r-title">' + esc(v.victim) + "</span>" +
        '<span class="lv-pill lv-pill-grp">' + esc(v.group) + "</span></div>" +
        '<div class="lv-r-meta">' + (v.sector ? esc(v.sector) + " · " : "") +
        (v.discovered ? esc(fmtDate(v.discovered)) + " (" + esc(daysAgo(v.discovered)) + ")" : "date unknown") + "</div>");
    }).join("");
  }).catch(function () { empty(byId("ransom-body"), "Ransomware feed unavailable."); });
})();
