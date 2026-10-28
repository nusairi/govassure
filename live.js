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

  // CISA KEV
  get("/api/kev").then(function (data) {
    var fw = byId("featured-wrap");
    if (data.featured) {
      var f = data.featured;
      fw.innerHTML = item("div", "lv-featured", f.url,
        '<div class="lv-flabel">Latest exploited vulnerability</div>' +
        '<div class="lv-fcve">' + esc(f.cveID) + " · " + esc(f.vendor) + " " + esc(f.product) + "</div>" +
        '<div class="lv-fdesc">' + esc(f.description) + "</div>" +
        '<div class="lv-faction"><b>Action:</b> ' + esc(f.action || "Apply vendor updates.") +
        (f.dueDate ? " <b>· US federal due date:</b> " + esc(fmtDate(f.dueDate)) : "") + "</div>");
    }
    var el = byId("kev-body");
    if (!data.items || !data.items.length) return empty(el, data.error || "No KEV entries available.");
    el.innerHTML = data.items.map(function (v) {
      return item("div", "lv-row", v.url,
        '<div class="lv-r-top"><span class="lv-r-title">' + esc(v.cveID) + " — " + esc(v.vendor) + " " + esc(v.product) + "</span>" +
        (v.ransomware ? '<span class="lv-pill lv-pill-ransom">ransomware</span>' : '<span class="lv-pill lv-pill-crit">exploited</span>') + "</div>" +
        '<div class="lv-r-meta">Added ' + esc(fmtDate(v.dateAdded)) + (v.dueDate ? " · patch by " + esc(fmtDate(v.dueDate)) : "") + "</div>" +
        '<div class="lv-r-desc">' + esc(v.description) + "</div>");
    }).join("");
  }).catch(function () { empty(byId("kev-body"), "KEV feed unavailable."); });

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
        el.innerHTML = items.map(function (a) {
          return item("div", "lv-row", a.url,
            '<div class="lv-r-top"><span class="lv-r-title">' + esc(a.title) + "</span>" +
            '<span class="lv-pill lv-pill-news">' + esc(a.source || "News") + "</span></div>" +
            (a.date ? '<div class="lv-r-meta">' + esc(fmtDate(a.date)) + " · " + esc(daysAgo(a.date)) + "</div>" : ""));
        }).join("");
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
    el.innerHTML = data.items.map(function (a) {
      return item("div", "lv-row", a.url,
        '<div class="lv-r-top"><span class="lv-r-title">' + esc(a.title) + "</span>" +
        '<span class="lv-pill lv-pill-date">' + esc(a.source || "NCSC") + "</span></div>" +
        (a.date ? '<div class="lv-r-meta">' + esc(fmtDate(a.date)) + "</div>" : "") +
        (a.summary ? '<div class="lv-r-desc">' + esc(a.summary) + "</div>" : ""));
    }).join("");
  }).catch(function () { empty(byId("adv-body"), "Advisory feed unavailable."); });

  byId("threats-foot").textContent =
    "Sources: CISA KEV (linked to NVD), UK security press, NCSC and Action Fraud. Items open the source in a new tab. Feeds are cached and refreshed automatically. Not exhaustive; for guidance only.";

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
