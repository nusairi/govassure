/* GOV Assured — government map glossary. Adds counts, examples, sources and map links
   from /data/govmap.json + /data/govmap-glossary.json. Text via textContent; links https www.gov.uk only. */
(function () {
  "use strict";
  var GOVUK = "www.gov.uk";
  var gloss = document.getElementById("gm-gloss");
  if (!gloss) return;
  var q = document.getElementById("gm-g-q");
  var form = document.getElementById("gm-g-form");
  var countEl = document.getElementById("gm-g-count");
  var az = document.getElementById("gm-az");
  var credit = document.getElementById("gm-credit");
  var SHOW = { ministerial: 1, "non-ministerial": 1, devolved: 1, "not-attached": 1 };

  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }
  function safeUrl(u, host) {
    try {
      var p = new URL(u);
      return p.protocol === "https:" && p.hostname === host && !p.username && !p.password && !p.port ? p.href : null;
    } catch (e) { return null; }
  }
  function ext(text, url, extra) {
    var safe = safeUrl(url, GOVUK);
    if (!safe) return make("span", null, text);
    var a = make("a", "gm-g-ext", text);
    a.href = safe; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.appendChild(make("span", "visually-hidden", (extra || "") + " (opens in a new tab)"));
    return a;
  }
  function mapHref(m, typeKey) {
    var parts = [];
    if (typeKey) parts.push("type=" + encodeURIComponent(typeKey));
    else if (m.show && SHOW[m.show]) parts.push("show=" + m.show);
    if (m.expand) parts.push("expand=1");
    return "/govmap/" + (parts.length ? "?" + parts.join("&") : "");
  }

  function fill(data, g) {
    var index = {}, own = {}, typeLabel = {};
    data.types.forEach(function (t) { typeLabel[t.k] = t.l; });
    data.roots.forEach(function (r) {
      var slug = r.u.split("/").pop();
      index[slug] = { b: r, home: null, t: r.k === "min" ? "ministerial" : r.k === "nmd" ? "nmd" : "devolved" };
      if (r.own) own[r.u] = 1;
      Object.keys(r.g).forEach(function (k) {
        r.g[k].forEach(function (b) {
          var s = b.u.split("/").pop();
          if (!index[s]) index[s] = { b: b, home: r.n, t: k };
          if (b.own) own[b.u] = 1;
        });
      });
    });
    data.unattached.forEach(function (b) {
      var s = b.u.split("/").pop();
      if (!index[s]) index[s] = { b: b, home: null, t: b.t, unattached: true };
      if (b.own) own[b.u] = 1;
    });
    var c = data.counts || {}, bt = c.byType || {};
    function count(key) {
      if (!key) return null;
      if (key.indexOf("type:") === 0) return bt[key.slice(5)] || 0;
      if (key === "alb") return (bt.ea || 0) + (bt.endpb || 0) + (bt.andpb || 0) + (bt.tribunal || 0) + (c.nonMinisterial || 0);
      if (key === "own") return Object.keys(own).length;
      return c[key] == null ? null : c[key];
    }
    var countNote = {
      alb: "with one of these labels (executive agencies, NDPBs, tribunals and non-ministerial departments)",
      "type:tribunal": "courts and tribunals",
      own: "organisations with this marker",
      shared: "bodies listed under more than one department",
      unattached: "bodies with no parent department"
    };

    var arts = gloss.querySelectorAll(".gm-term");
    for (var i = 0; i < arts.length; i++) {
      var art = arts[i], id = art.getAttribute("data-term"), t = g.terms[id];
      var box = art.querySelector("[data-extra]");
      if (!t || !box) continue;
      box.textContent = "";
      var dl = make("dl", "gm-g-facts");
      function row(label, node) {
        var w = make("div");
        w.appendChild(make("dt", null, label));
        var dd = make("dd");
        dd.appendChild(node);
        w.appendChild(dd);
        dl.appendChild(w);
      }
      // count + map link(s)
      var n = count(t.count);
      if (n != null || t.map) {
        var span = make("span");
        if (n != null) {
          span.appendChild(make("strong", "gm-g-num", n));
          span.appendChild(document.createTextNode(" " + (countNote[t.count] || (n === 1 ? "organisation" : "organisations"))));
        }
        if (t.map) {
          var links = [];
          if (t.map.page && t.map.page.indexOf("/govmap/") === 0) {
            links.push(["Accountable to Parliament page", t.map.page]);
          } else if (t.map.types) {
            t.map.types.forEach(function (k) { links.push([typeLabel[k] || k, mapHref({}, k)]); });
            if (t.map.show) links.push(["Non-ministerial departments", mapHref({ show: t.map.show })]);
          } else {
            links.push(["See on the map", mapHref(t.map, t.map.type)]);
          }
          links.forEach(function (l, j) {
            span.appendChild(document.createTextNode(j === 0 ? (n != null ? " · " : "") : ", "));
            var a = make("a", "gm-g-map", l[0]);
            a.href = l[1];
            span.appendChild(a);
          });
        }
        row(n != null ? "On the map" : "Map", span);
      } else {
        row("On the map", make("span", null, "Not shown as a separate label on the map."));
      }
      // examples
      if (t.ex && t.ex.length) {
        var exs = make("span");
        t.ex.forEach(function (s, j) {
          var hit = index[s];
          if (!hit) return;
          if (exs.childNodes.length) exs.appendChild(document.createTextNode("; "));
          exs.appendChild(ext(hit.b.n, hit.b.u, ""));
          if (hit.b.ab) exs.appendChild(make("span", "gm-ab", hit.b.ab));
          if (hit.home && (id === "sponsor-department" || id === "executive-agency" || id === "executive-ndpb")) {
            exs.appendChild(document.createTextNode(" — sponsored by " + hit.home));
          }
          if (id === "shared" && hit.b.also) exs.appendChild(document.createTextNode(" — under " + hit.home + " and " + hit.b.also.join(", ")));
        });
        if (exs.childNodes.length) row(t.ex.length > 1 ? "Examples" : "Example", exs);
      }
      // sources
      if (t.src && t.src.length) {
        var ss = make("span");
        t.src.forEach(function (k) {
          var s = g.sources[k];
          if (!s) return;
          if (ss.childNodes.length) ss.appendChild(document.createTextNode("; "));
          ss.appendChild(ext(s.t, s.u, ""));
        });
        row("Source", ss);
      }
      box.appendChild(dl);
    }
  }

  function norm(s) { return String(s || "").toLowerCase().replace(/[’']/g, "").replace(/\s+/g, " ").trim(); }
  function filter() {
    var v = norm(q.value), shown = 0;
    var secs = gloss.querySelectorAll(".gm-letter");
    for (var i = 0; i < secs.length; i++) {
      var any = false, arts = secs[i].querySelectorAll(".gm-term");
      for (var j = 0; j < arts.length; j++) {
        var hit = !v || norm(arts[j].textContent).indexOf(v) >= 0;
        arts[j].hidden = !hit;
        if (hit) { any = true; shown++; }
      }
      secs[i].hidden = !any;
      var link = az.querySelector('a[href="#' + secs[i].id + '"]');
      if (link) link.classList.toggle("gm-az-off", !any);
    }
    countEl.textContent = v ? (shown ? shown + (shown === 1 ? " term matches." : " terms match.") : "No terms match. Try a shorter word.") : "";
  }
  var timer;
  q.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(filter, 120); });
  form.addEventListener("submit", function (e) { e.preventDefault(); filter(); });

  function setCredit(data) {
    if (!credit) return;
    var s = data.source || {};
    credit.textContent = "";
    credit.appendChild(document.createTextNode("Definitions are our own summaries of Cabinet Office and GOV.UK guidance. Organisation data from "));
    credit.appendChild(ext("GOV.UK", s.url, ""));
    credit.appendChild(document.createTextNode(", contains public sector information licensed under the "));
    var lic = safeUrl(s.licenceUrl, "www.nationalarchives.gov.uk");
    var l = make("a", null, "Open Government Licence v3.0");
    if (lic) { l.href = lic; l.target = "_blank"; l.rel = "noopener noreferrer license"; }
    credit.appendChild(l);
    credit.appendChild(document.createTextNode("."));
  }

  Promise.all([
    fetch("/data/govmap.json", { credentials: "same-origin" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }),
    fetch("/data/govmap-glossary.json", { credentials: "same-origin" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
  ]).then(function (res) {
    if (!res[0] || !Array.isArray(res[0].roots) || !res[1] || !res[1].terms) throw new Error("bad data");
    fill(res[0], res[1]);
    setCredit(res[0]);
    if (location.hash) {
      var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) t.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }).catch(function () {
    countEl.textContent = "Counts and examples could not load. The definitions below still apply.";
  });
})();
