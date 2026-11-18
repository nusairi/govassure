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

  // What's down in the UK (our own /api/outages, data from StatusPages + outage headlines): three panels in the advisories style.
  var OUT_RANK = { outage: 0, spike: 1, degraded: 2, maintenance: 3 };
  var OUT_PILL = {
    outage: ["Outage", "lv-pill-crit"],
    spike: ["Spike", "lv-pill-ransom"],
    degraded: ["Degraded", "lv-pill-ransom"],
    maintenance: ["Maintenance", "lv-pill-news"]
  };
  function outState(p) {
    if (p.status === "major_outage" || p.status === "partial_outage") return "outage";
    if (p.reportLevel === "spike" || p.reportLevel === "elevated") return "spike";
    if (p.status === "degraded") return "degraded";
    if (p.status === "maintenance") return "maintenance";
    return "";
  }
  function hhmm(d) {
    var t = new Date(d);
    return isNaN(t) ? "" : t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  function ago(d) {
    var t = new Date(d);
    if (isNaN(t)) return "";
    var m = Math.round((Date.now() - t) / 60000);
    if (m < 60) return m <= 1 ? "just now" : m + " min ago";
    var h = Math.round(m / 60);
    return h < 48 ? h + (h === 1 ? " hour ago" : " hours ago") : daysAgo(d);
  }
  function loadOutages() {
    get("/api/outages").then(function (data) {
      var ok = data && data.available;
      var cats = (data && data.categories) || [];
      var when = hhmm(data && data.updated);

      // 1. Problems right now
      var probs = [];
      cats.forEach(function (c) {
        (c.problems || []).forEach(function (p) {
          var st = outState(p);
          if (st) probs.push({ p: p, c: c, st: st });
        });
      });
      probs.sort(function (a, b) { return OUT_RANK[a.st] - OUT_RANK[b.st]; });
      var pel = byId("out-problems");
      if (!ok) empty(pel, "Status unavailable.");
      else if (!probs.length) empty(pel, "No major problems reported right now.");
      else pel.innerHTML = list(probs.map(function (x) {
        var pill = OUT_PILL[x.st];
        var rep = x.p.reportLevel === "spike" ? "spike in user reports" : x.p.reportLevel === "elevated" ? "more user reports than usual" : (x.p.source ? "from " + x.p.source : "");
        return item("div", "lv-row", x.p.link,
          '<div class="lv-r-top"><span class="lv-r-title">' + esc(x.p.name) + "</span>" +
          '<span class="lv-pill ' + pill[1] + '">' + esc(pill[0]) + "</span></div>" +
          '<div class="lv-r-meta">' + esc(x.c.label) + (rep ? " · " + esc(rep) : "") + (when ? " · checked " + esc(when) : "") + "</div>" +
          (x.p.summary ? '<div class="lv-r-desc">' + esc(x.p.summary) + "</div>" : ""));
      }), "problems");

      // 2. Outage news
      var news = (data && data.news) || [];
      var nel = byId("out-news");
      if (!news.length) empty(nel, data && (ok || data.news) ? "No outage news in the last 48 hours." : "Status unavailable.");
      else nel.innerHTML = list(news.map(function (n) {
        return item("div", "lv-row", n.url,
          '<div class="lv-r-top"><span class="lv-r-title">' + esc(n.title) + "</span>" +
          '<span class="lv-pill lv-pill-news">' + esc(n.source || "News") + "</span></div>" +
          (n.date ? '<div class="lv-r-meta">' + esc(fmtDate(n.date)) + " " + esc(hhmm(n.date)) + " · " + esc(ago(n.date)) + "</div>" : ""));
      }), "outage news");

      if (ok && when) byId("out-updated").textContent = "StatusPages · " + when;
      var src = (data && data.source) || {};
      if (safe(src.url)) byId("out-credit").innerHTML = '<a class="lv-out-credit" href="' + esc(src.url) + '" target="_blank" rel="noopener noreferrer">Data: StatusPages (user reports are unverified)</a>';
    }).catch(function () {
      empty(byId("out-problems"), "Status unavailable.");
      empty(byId("out-news"), "Status unavailable.");
    });
  }
  if (byId("out-problems")) {
    loadOutages();
    setInterval(loadOutages, 5 * 60 * 1000);
  }

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

  // Government and Parliament publications (our own /api/govpubs: GOV.UK Search API, Commons/Lords Library, POST, Committees API)
  get("/api/govpubs").then(function (data) {
    var el = byId("pubs-body");
    if (!data || !data.available) return empty(el, "Publications unavailable.");
    if (!data.items || !data.items.length) return empty(el, "No IT-related publications in the last 30 days.");
    el.innerHTML = list(data.items.map(function (p) {
      var parl = /^https:\/\/([a-z0-9-]+\.)*parliament\.uk\//i.test(p.url || "");
      return item("div", "lv-row", p.url,
        '<div class="lv-r-top"><span class="lv-r-title">' + esc(p.title) + "</span>" +
        '<span class="lv-pill ' + (parl ? "lv-pill-grp" : "lv-pill-news") + '">' + esc(p.source || (parl ? "Parliament" : "GOV.UK")) + "</span></div>" +
        '<div class="lv-r-meta">' + (p.kind ? esc(p.kind) + " · " : "") + esc(fmtDate(p.date)) + "</div>");
    }), "publications");
    (data.licences || []).forEach(function (l, k) {
      var span = byId(k === 0 ? "pubs-ogl" : "pubs-opl");
      if (span && /^https:\/\/www\.(nationalarchives\.gov\.uk|parliament\.uk)\/[^\s"'<>]*$/.test(l.url || "")) {
        span.innerHTML = '<a class="lv-out-credit" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.name) + "</a>";
      }
    });
  }).catch(function () { empty(byId("pubs-body"), "Publications unavailable."); });

  // CISA alerts and advisories (including items not yet on the KEV list)
  get("/api/cisa-alerts").then(function (data) {
    var el = byId("cisa-body");
    if (!el) return;
    if (!data.items || !data.items.length) return empty(el, data.error || "No CISA alerts available.");
    el.innerHTML = list(data.items.map(function (a) {
      var pills = (a.cves || []).slice(0, 4).map(function (c) {
        var id = c && c.id ? c.id : c;
        var onKev = c && c.inKev;
        return '<span class="lv-pill ' + (onKev ? "lv-pill-kev" : "lv-pill-cve") + '">' + esc(id) + (onKev ? " · on KEV list" : "") + "</span>";
      }).join("");
      var extra = (a.cves && a.cves.length > 4) ? '<span class="lv-r-meta">and ' + esc(String(a.cves.length - 4)) + " more</span>" : "";
      var typeClass = a.type === "Alert" ? "lv-pill-crit" : a.type === "ICS" || a.type === "Medical" ? "lv-pill-news" : "lv-pill-date";
      return item("div", "lv-row", a.url,
        '<div class="lv-r-top"><span class="lv-r-title">' + esc(a.title) + "</span>" +
        (a.type ? '<span class="lv-pill ' + typeClass + '">' + esc(a.type) + "</span>" : "") + "</div>" +
        (a.date ? '<div class="lv-r-meta">' + esc(fmtDate(a.date)) + " · " + esc(daysAgo(a.date)) + "</div>" : "") +
        (pills ? '<div class="lv-cves">' + pills + extra + "</div>" : ""));
    }), "CISA alerts");
  }).catch(function () { var el = byId("cisa-body"); if (el) empty(el, "CISA alerts unavailable."); });

  byId("threats-foot").textContent =
    "Sources: CISA KEV (linked to NVD; required action text is quoted from CISA), CISA alerts and advisories, UK security press, NCSC, Action Fraud, GOV.UK and UK Parliament. Items open the source in a new tab. Feeds are cached and refreshed automatically. Not exhaustive; for guidance only.";

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
