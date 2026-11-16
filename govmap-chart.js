/* GOV Assured — UK government map, animated chart views.
   Canvas only, no libraries. Data: /data/govmap.json (GOV.UK, OGL v3.0).
   Text is drawn with fillText or set with textContent; links are https www.gov.uk only. */
(function () {
  "use strict";

  var KIND = document.body.getAttribute("data-chart") === "nmd" ? "nmd" : "min";
  var GOVUK_HOST = "www.gov.uk";
  var COLORS = {
    ministerial: "#f0c987", nmd: "#e8a35c", ea: "#6fd3b0", endpb: "#7fb8ff", andpb: "#c59cff",
    tribunal: "#ff8a80", pc: "#ffd166", sha: "#9be564", imb: "#4dd0e1", adhoc: "#f78fb3",
    office: "#ffffff", cs: "#b0bec5", other: "#a3b8ad", sub: "#5fa08a", devolved: "#d2c8b4"
  };
  var GLOSSARY = "/govmap/glossary/#";
  var TYPE_ANCHOR = {
    ministerial: "ministerial-department", nmd: "non-ministerial-department", ea: "executive-agency",
    endpb: "executive-ndpb", andpb: "advisory-ndpb", tribunal: "tribunal", pc: "public-corporation",
    sha: "special-health-authority", imb: "independent-monitoring-body", adhoc: "ad-hoc-advisory-group",
    office: "executive-office", cs: "other-public-body", other: "other-public-body", sub: "sub-organisation",
    devolved: "devolved-government"
  };
  function glossLink(anchor, text) {
    var a = document.createElement("a");
    a.className = "gm-legend-link";
    a.href = GLOSSARY + anchor;
    a.textContent = text;
    return a;
  }
  var GOLD = "#f0c987", INK = "#f6f0e4", SOFT = "#d2c8b4", FIELD = "#021c17";

  var $ = function (id) { return document.getElementById(id); };
  var stage = $("gm-stage"), canvas = $("gm-canvas"), tip = $("gm-tip");
  if (!stage || !canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var ui = {
    find: $("gm-find"), findList: $("gm-find-list"), findForm: $("gm-find-form"), reset: $("gm-reset"),
    pause: $("gm-pause"), legend: $("gm-legend"), list: $("gm-dept-list"), panel: $("gm-panel"),
    status: $("gm-chart-status"), stats: $("gm-chart-stats"), credit: $("gm-credit")
  };

  var reduceMq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var state = {
    w: 0, h: 0, dpr: 1, cx: 0, cy: 0, S: 0, R: 0, mobile: false,
    orbit: 0, time: 0, playing: !reduceMq.matches, visible: true,
    focus: -1, prevFocus: -1, t: 0, tTarget: 0,
    hover: null, kb: -1, kbBody: -1, pulse: null, last: 0, raf: 0,
    orgView: "circle"
  };
  var data, typeLabel = {}, typeOrder = [], depts = [], links = [], sponsors = [];

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
  function shortLabel(r) {
    if (r.ab && r.ab.length <= 10) return r.ab;
    var n = r.n.replace(/^The /, "").replace(/^(Wales|Scotland) Office$/, "$1");
    if (n.length <= 16) return n;
    var words = n.replace(/[(),&']/g, " ").split(/\s+/).filter(function (w) { return w && !/^(of|and|for|the|on|in|to)$/i.test(w); });
    return words.map(function (w) { return w.charAt(0).toUpperCase(); }).join("").slice(0, 6);
  }
  function bodyLabel(b) {
    if (b.ab && b.ab.length <= 12) return b.ab;
    var n = b.n.replace(/^The /, "");
    return n.length > 24 ? n.slice(0, 22) + "…" : n;
  }
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function norm(s) { return String(s || "").toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim(); }
  function slugOfDept(d) {
    var u = safeUrl(d.r.u, GOVUK_HOST);
    if (!u) return "";
    var m = /\/government\/organisations\/([a-z0-9-]+)\/?$/.exec(new URL(u).pathname);
    return m ? m[1] : "";
  }
  function indexBySlug(slug) {
    if (!slug) return -1;
    for (var i = 0; i < depts.length; i++) if (slugOfDept(depts[i]) === slug) return i;
    return -1;
  }
  function chartQuery() {
    try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); }
  }
  function writeChartUrl() {
    var p = new URLSearchParams();
    if (state.focus >= 0) {
      var slug = slugOfDept(depts[state.focus]);
      if (slug) p.set("dept", slug);
    }
    if (state.orgView === "org") p.set("view", "org");
    var q = p.toString();
    var url = location.pathname + (q ? "?" + q : "") + (location.hash || "");
    if (url !== location.pathname + location.search + (location.hash || "")) history.replaceState({ focus: state.focus, orgView: state.orgView }, "", url);
  }
  function applyChartUrl() {
    var p = chartQuery();
    var i = indexBySlug(p.get("dept") || "");
    var view = p.get("view") === "org" ? "org" : "circle";
    state.orgView = view;
    if (i >= 0) {
      if (state.focus !== i) focusDept(i, true);
      else { syncViewSwitch(); writeChartUrl(); if (view === "org") renderOrg(); else hideOrg(); }
    } else if (state.focus >= 0) {
      reset();
    } else {
      syncViewSwitch();
      if (view === "org") renderOrg();
      else hideOrg();
    }
  }

  /* ---------- data ---------- */
  function build() {
    data.types.forEach(function (t) { typeLabel[t.k] = t.l; typeOrder.push(t.k); });
    var roots = data.roots.filter(function (r) { return r.k === KIND; });
    var byName = {};
    roots.forEach(function (r, i) {
      var bodies = [];
      typeOrder.forEach(function (k) {
        (r.g[k] || []).forEach(function (b) { bodies.push({ b: b, k: k, label: bodyLabel(b), x: 0, y: 0, r: 2 }); });
      });
      // golden-angle spiral offsets for the overview cluster
      bodies.forEach(function (o, j) { o.sr = Math.sqrt(j + 0.5); o.sa = j * 2.39996; });
      var d = { r: r, i: i, label: shortLabel(r), bodies: bodies, n: bodies.length, a0: 0, x: 0, y: 0, rad: 6, alpha: 1 };
      depts.push(d);
      byName[r.n] = d;
    });
    // spread big and small departments evenly round the ring (largest, smallest, next largest, ...)
    var bySize = depts.slice().sort(function (a, b) { return b.n - a.n || a.i - b.i; });
    var ring = [];
    while (bySize.length) { ring.push(bySize.shift()); if (bySize.length) ring.push(bySize.pop()); }
    var step = (Math.PI * 2) / ring.length;
    ring.forEach(function (d, k) { d.a0 = -Math.PI / 2 + k * step; d.stagger = k % 2; });

    if (KIND === "min") {
      // departments linked by bodies they share
      var seen = {};
      depts.forEach(function (d) {
        d.bodies.forEach(function (o) {
          (o.b.also || []).forEach(function (other) {
            var e = byName[other];
            if (!e || e === d) return;
            var key = d.i < e.i ? d.i + "-" + e.i : e.i + "-" + d.i;
            if (!seen[key]) { seen[key] = { a: d.i < e.i ? d : e, b: d.i < e.i ? e : d, names: [] }; links.push(seen[key]); }
            if (seen[key].names.indexOf(o.b.n) < 0) seen[key].names.push(o.b.n);
          });
        });
      });
    } else {
      // ministerial departments that list a non-ministerial department as a body they work with
      var nmdByUrl = {};
      depts.forEach(function (d) { nmdByUrl[d.r.u] = d; });
      data.roots.forEach(function (m) {
        if (m.k !== "min") return;
        var targets = (m.g.nmd || []).map(function (b) { return nmdByUrl[b.u]; }).filter(Boolean);
        if (targets.length) sponsors.push({ r: m, label: shortLabel(m), targets: targets, x: 0, y: 0, a0: 0 });
      });
      var s2 = (Math.PI * 2) / Math.max(1, sponsors.length);
      sponsors.forEach(function (s, i) {
        s.a0 = -Math.PI / 2 + i * s2 + s2 / 2;
        s.targets.forEach(function (t) { (t.sponsors = t.sponsors || []).push(s); });
      });
    }
  }

  /* ---------- layout ---------- */
  function resize() {
    var w = stage.clientWidth;
    var mobile = w < 640;
    var h = mobile ? Math.round(Math.min(w * 1.15, window.innerHeight * 0.78)) : Math.round(Math.min(Math.max(520, w * 0.62), 780));
    state.dpr = Math.min(2, window.devicePixelRatio || 1);
    state.w = w; state.h = h; state.mobile = mobile;
    canvas.width = Math.round(w * state.dpr);
    canvas.height = Math.round(h * state.dpr);
    canvas.style.height = h + "px";
    state.cx = w / 2; state.cy = h / 2; state.S = Math.min(w, h);
    var maxN = depts.reduce(function (m, d) { return Math.max(m, d.n); }, 1);
    state.spiral = mobile ? 2.1 : 3.1;
    state.R = Math.max(70, state.S / 2 - state.spiral * Math.sqrt(maxN) * 2 - (mobile ? 22 : 30));
    if (KIND === "nmd") state.R = state.S / 2 - (mobile ? 40 : 62);
    depts.forEach(function (d) { d.rad0 = (mobile ? 4.5 : 7) + (mobile ? 1 : 1.5) * Math.sqrt(d.n); });
    draw();
  }

  function layout() {
    var cx = state.cx, cy = state.cy, R = state.R, t = ease(state.t);
    var f = state.focus >= 0 ? depts[state.focus] : (state.prevFocus >= 0 ? depts[state.prevFocus] : null);
    var hubR = state.S * (KIND === "min" ? 0.11 : 0.1);
    state.hubR = hubR;
    depts.forEach(function (d) {
      var a = d.a0 + state.orbit;
      d.ang = a;
      var bx = cx + Math.cos(a) * R, by = cy + Math.sin(a) * R;
      var push = d === f ? 0 : 1 + 0.18 * t;
      d.x = d === f ? bx + (cx - bx) * t : cx + (bx - cx) * push;
      d.y = d === f ? by + (cy - by) * t : cy + (by - cy) * push;
      d.rad = d === f ? d.rad0 + (state.S * 0.06 - d.rad0) * t : d.rad0 * (1 - 0.3 * t);
      d.alpha = d === f ? 1 : 1 - 0.88 * t;
      // overview cluster sits just outside the department, pointing outward
      var off = d.rad0 + 4 + state.spiral * Math.sqrt(d.n);
      var px = bx + Math.cos(a) * off, py = by + Math.sin(a) * off;
      var n = d.bodies.length;
      d.bodies.forEach(function (o, j) {
        var ox = px + Math.cos(o.sa + a) * o.sr * state.spiral;
        var oy = py + Math.sin(o.sa + a) * o.sr * state.spiral;
        if (d === f && t > 0) {
          var ring = state.mobile ? (n > 14 ? (j % 2 ? 0.35 : 0.26) : 0.31) : (n > 14 ? (j % 2 ? 0.43 : 0.33) : 0.38);
          var ta = -Math.PI / 2 + (j / n) * Math.PI * 2;
          var rr = state.S * ring;
          var tx = cx + Math.cos(ta) * rr, ty = cy + Math.sin(ta) * rr * (state.mobile ? 1 : 0.92);
          o.x = ox + (tx - ox) * t; o.y = oy + (ty - oy) * t; o.ta = ta;
          o.r = 1.8 + (state.mobile ? 3.2 : 4.6) * t;
        } else {
          var pf = d === f ? 1 : push;
          o.x = cx + (ox - cx) * pf;
          o.y = cy + (oy - cy) * pf;
          o.r = state.mobile ? 1.5 : 1.9;
        }
      });
    });
    sponsors.forEach(function (s) {
      var a = s.a0 - state.orbit * 0.6;
      var rr = state.R * 0.52;
      s.x = cx + Math.cos(a) * rr; s.y = cy + Math.sin(a) * rr;
    });
  }

  /* ---------- drawing ---------- */
  function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function dot(x, y, r, color) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
  function particle(x1, y1, x2, y2, p, color, r) {
    dot(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p, r, color);
  }

  function draw() {
    if (!depts.length || !state.w) return;
    layout();
    var c = ctx, cx = state.cx, cy = state.cy, t = ease(state.t), time = state.time, moving = state.playing;
    var hov = state.hover, focusD = state.focus >= 0 ? depts[state.focus] : null;
    var hovD = hov && hov.d ? hov.d : null;
    c.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    c.clearRect(0, 0, state.w, state.h);

    // background glow
    var g = c.createRadialGradient(cx, cy, 0, cx, cy, state.S * 0.7);
    g.addColorStop(0, "rgba(240,201,135,0.10)"); g.addColorStop(1, "rgba(2,28,23,0)");
    c.fillStyle = g; c.fillRect(0, 0, state.w, state.h);

    // orbit rings
    c.save();
    c.globalAlpha = 0.35 * (1 - t);
    c.strokeStyle = GOLD; c.lineWidth = 1;
    c.setLineDash([2, 7]); c.lineDashOffset = -time * 8;
    c.beginPath(); c.arc(cx, cy, state.R, 0, Math.PI * 2); c.stroke();
    c.setLineDash([1, 10]); c.lineDashOffset = time * 5;
    c.beginPath(); c.arc(cx, cy, state.R * 0.52, 0, Math.PI * 2); c.stroke();
    c.restore();

    // shared-body links between departments (ministerial) / sponsor links (non-ministerial)
    c.save();
    c.setLineDash([4, 6]); c.lineDashOffset = -time * 18;
    links.forEach(function (l) {
      var on = hovD && (l.a === hovD || l.b === hovD);
      c.globalAlpha = (on ? 0.9 : 0.22) * (1 - t);
      if (c.globalAlpha < 0.02) return;
      c.strokeStyle = on ? GOLD : "#c9a15d"; c.lineWidth = on ? 2 : 1;
      var mx = (l.a.x + l.b.x) / 2, my = (l.a.y + l.b.y) / 2;
      c.beginPath(); c.moveTo(l.a.x, l.a.y);
      c.quadraticCurveTo(cx + (mx - cx) * 0.25, cy + (my - cy) * 0.25, l.b.x, l.b.y); c.stroke();
    });
    sponsors.forEach(function (s) {
      s.targets.forEach(function (d) {
        var on = hovD === d || (hov && hov.s === s);
        c.globalAlpha = (on ? 0.95 : 0.35) * (focusD && focusD !== d ? 1 - t : 1);
        c.strokeStyle = on ? GOLD : "#c9a15d"; c.lineWidth = on ? 2 : 1;
        line(s.x, s.y, d.x, d.y);
        if (moving) particle(s.x, s.y, d.x, d.y, (time * 0.25 + d.i * 0.13) % 1, GOLD, 1.8);
      });
    });
    c.restore();

    // hub -> department spokes with flowing particles
    depts.forEach(function (d) {
      var on = hovD === d || focusD === d;
      c.globalAlpha = d.alpha * (on ? 0.9 : 0.4);
      c.strokeStyle = on ? GOLD : "rgba(240,201,135,0.55)"; c.lineWidth = on ? 2 : 1;
      if (focusD !== d) line(cx, cy, d.x, d.y);
      if (moving && focusD !== d) {
        for (var k = 0; k < 2; k++) {
          var p = (time * 0.12 + d.i * 0.071 + k * 0.5) % 1;
          particle(cx, cy, d.x, d.y, p, k ? "#ffffff" : GOLD, on ? 2.4 : 1.6);
        }
      }
    });
    c.globalAlpha = 1;

    // bodies
    depts.forEach(function (d) {
      var isF = d === focusD && t > 0.01;
      var on = hovD === d;
      d.bodies.forEach(function (o, j) {
        var a = isF ? 1 : (focusD ? d.alpha * 0.4 : d.alpha * (on ? 1 : 0.85));
        var col = COLORS[o.k] || COLORS.other;
        if (isF || on) {
          c.globalAlpha = a * (isF ? 0.5 : 0.35);
          c.strokeStyle = col; c.lineWidth = 1;
          line(d.x, d.y, o.x, o.y);
          if (isF && moving) particle(d.x, d.y, o.x, o.y, (time * 0.35 + j * 0.173) % 1, col, 2);
        }
        c.globalAlpha = a;
        var hb = hov && hov.o === o;
        dot(o.x, o.y, o.r + (hb ? 3 : 0), col);
        if (state.pulse === o) {
          c.strokeStyle = GOLD; c.lineWidth = 2; c.globalAlpha = 0.6 + 0.4 * Math.sin(time * 5);
          c.beginPath(); c.arc(o.x, o.y, o.r + 6, 0, Math.PI * 2); c.stroke();
        }
      });
      c.globalAlpha = 1;
      if (isF && t > 0.6) drawBodyLabels(d, (t - 0.6) / 0.4);
    });

    // hub
    var hubR = state.hubR;
    var hg = c.createRadialGradient(cx, cy, hubR * 0.2, cx, cy, hubR * 1.35);
    hg.addColorStop(0, "#1c4a3d"); hg.addColorStop(1, "#0b241e");
    c.globalAlpha = 1 - 0.75 * t;
    dot(cx, cy, hubR * (1 - 0.35 * t), hg);
    c.strokeStyle = GOLD; c.lineWidth = 1.5;
    c.setLineDash([6, 5]); c.lineDashOffset = time * 10;
    c.beginPath(); c.arc(cx, cy, hubR * (1.12 - 0.35 * t) + (moving ? Math.sin(time * 1.6) * 2 : 0), 0, Math.PI * 2); c.stroke();
    c.setLineDash([]);
    c.fillStyle = GOLD; c.textAlign = "center"; c.textBaseline = "middle";
    var hs = Math.max(10, Math.min(18, hubR * 0.24));
    c.font = "600 " + hs + "px 'Palatino Linotype', Palatino, Georgia, serif";
    if (t < 0.5) {
      if (KIND === "min") {
        c.fillText("UK Government", cx, cy - hs * 0.45);
        c.fillStyle = SOFT; c.font = Math.round(hs * 0.62) + "px 'Segoe UI', Helvetica, Arial, sans-serif";
        c.fillText("PM · No. 10 · Cabinet", cx, cy + hs * 0.7);
      } else {
        c.fillText("Non-ministerial", cx, cy - hs * 0.45);
        c.fillText("departments", cx, cy + hs * 0.65);
      }
    }
    c.globalAlpha = 1;

    // sponsor chips (non-ministerial view)
    sponsors.forEach(function (s) {
      var on = hov && hov.s === s;
      c.globalAlpha = focusD ? (s.targets.indexOf(focusD) >= 0 ? 1 : 1 - t) : 1;
      dot(s.x, s.y, state.mobile ? 4 : 6, on ? GOLD : "#c9a15d");
      c.fillStyle = INK; c.font = (state.mobile ? 9 : 11) + "px 'Segoe UI', Helvetica, Arial, sans-serif";
      c.fillText(s.label, s.x, s.y + (state.mobile ? 11 : 15));
    });
    c.globalAlpha = 1;

    // departments
    depts.forEach(function (d, i) {
      var on = hovD === d || state.kb === i;
      c.globalAlpha = d.alpha;
      var col = KIND === "min" ? COLORS.ministerial : COLORS.nmd;
      if (on || d === focusD) {
        c.globalAlpha = d.alpha * 0.35;
        dot(d.x, d.y, d.rad + 6 + (moving ? Math.sin(time * 3) * 2 : 0), col);
        c.globalAlpha = d.alpha;
      }
      var dg = c.createRadialGradient(d.x - d.rad * 0.3, d.y - d.rad * 0.3, 1, d.x, d.y, d.rad);
      dg.addColorStop(0, "#fff3d6"); dg.addColorStop(1, col);
      dot(d.x, d.y, d.rad, dg);
      if (state.kb === i) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(d.x, d.y, d.rad + 3, 0, Math.PI * 2); c.stroke(); }
      // label: inside the ring (toward the hub) in overview, centred in focus
      var fs = state.mobile ? 9 : 11.5;
      c.font = "600 " + fs + "px 'Segoe UI', Helvetica, Arial, sans-serif";
      if (d === focusD && t > 0.4) {
        c.fillStyle = FIELD; c.textAlign = "center"; c.textBaseline = "middle";
        c.font = "700 " + Math.min(16, d.rad * 0.38) + "px 'Segoe UI', Helvetica, Arial, sans-serif";
        c.fillText(d.label, d.x, d.y);
      } else if (d.alpha > 0.3) {
        // ministerial: label inside the ring; non-ministerial: outside (the inner ring holds partners)
        var dir = KIND === "min" ? -1 : 1;
        var gap = d.rad + (state.mobile ? 6 : 9) + (dir > 0 ? state.spiral * Math.sqrt(d.n) * 2 : 0) + d.stagger * (state.mobile ? 9 : 13);
        var lx = d.x + dir * Math.cos(d.ang) * gap;
        var ly = d.y + dir * Math.sin(d.ang) * gap;
        var cs = dir * Math.cos(d.ang), sn = dir * Math.sin(d.ang);
        c.textAlign = cs < -0.3 ? "right" : cs > 0.3 ? "left" : "center";
        c.textBaseline = sn < -0.3 ? "bottom" : sn > 0.3 ? "top" : "middle";
        c.fillStyle = on ? GOLD : INK;
        c.fillText(d.label, lx, ly);
      }
    });
    c.globalAlpha = 1;
  }

  function drawBodyLabels(d, a) {
    var c = ctx, n = d.bodies.length;
    var showAll = state.mobile ? n <= 16 : n <= 34;
    c.font = (state.mobile ? 9 : 11) + "px 'Segoe UI', Helvetica, Arial, sans-serif";
    c.textBaseline = "middle";
    d.bodies.forEach(function (o) {
      if (!showAll && !(o.b.ab && o.b.ab.length <= 12) && !(state.hover && state.hover.o === o) && state.pulse !== o) return;
      var cos = Math.cos(o.ta), sin = Math.sin(o.ta);
      c.globalAlpha = a;
      c.textAlign = cos > 0.15 ? "left" : cos < -0.15 ? "right" : "center";
      var off = o.r + 5;
      var ly = o.y + sin * off + (Math.abs(cos) <= 0.15 ? (sin > 0 ? 6 : -6) : 0);
      c.fillStyle = state.hover && state.hover.o === o ? GOLD : INK;
      c.fillText(state.hover && state.hover.o === o ? o.b.n : o.label, o.x + cos * off, ly);
    });
    c.globalAlpha = 1;
  }

  /* ---------- loop ---------- */
  function animating() { return state.playing || Math.abs(state.t - state.tTarget) > 0.001 || state.pulse; }
  function frame(ts) {
    state.raf = 0;
    var dt = state.last ? Math.min(0.05, (ts - state.last) / 1000) : 0;
    state.last = ts;
    if (state.playing) { state.time += dt; if (state.focus < 0) state.orbit += dt * (Math.PI * 2 / 240); }
    else if (state.pulse) state.time += dt;
    if (state.t !== state.tTarget) {
      var speed = reduceMq.matches ? 100 : 1.4;
      state.t = state.tTarget > state.t ? Math.min(state.tTarget, state.t + dt * speed) : Math.max(state.tTarget, state.t - dt * speed);
      if (state.t === 0 && state.tTarget === 0) state.prevFocus = -1;
    }
    draw();
    kick();
  }
  function kick() {
    if (!state.raf && state.visible && animating()) state.raf = requestAnimationFrame(frame);
    else if (!animating()) state.last = 0;
  }
  function redraw() { if (!state.raf) { draw(); } kick(); }

  /* ---------- interaction ---------- */
  function hit(x, y) {
    var best = null, bd = 1e9;
    function test(obj, ox, oy, r) {
      var dx = x - ox, dy = y - oy, dd = dx * dx + dy * dy;
      if (dd <= r * r && dd < bd) { bd = dd; best = obj; }
    }
    var f = state.focus >= 0 ? depts[state.focus] : null;
    var pad = state.mobile ? 8 : 5;
    if (f && state.t > 0.5) {
      f.bodies.forEach(function (o) { test({ o: o, d: f }, o.x, o.y, o.r + pad + 2); });
      test({ d: f }, f.x, f.y, f.rad + pad);
      if (!best) depts.forEach(function (d) { if (d !== f) test({ d: d, other: true }, d.x, d.y, d.rad + pad); });
      return best;
    }
    depts.forEach(function (d) { test({ d: d }, d.x, d.y, d.rad + pad + 2); });
    sponsors.forEach(function (s) { test({ s: s }, s.x, s.y, 10); });
    if (!best) depts.forEach(function (d) { d.bodies.forEach(function (o) { test({ d: d, cluster: true }, o.x, o.y, 4); }); });
    return best;
  }

  function countsText(d) {
    var counts = {};
    d.bodies.forEach(function (o) { counts[o.k] = (counts[o.k] || 0) + 1; });
    return typeOrder.filter(function (k) { return counts[k]; }).map(function (k) { return typeLabel[k] + " " + counts[k]; }).join(" · ");
  }

  function showTip(h, x, y) {
    if (!h) { tip.hidden = true; return; }
    tip.textContent = "";
    if (h.o) {
      tip.appendChild(make("strong", null, h.o.b.n));
      if (h.o.b.ab) tip.appendChild(make("span", "gm-tip-ab", h.o.b.ab));
      tip.appendChild(make("span", "gm-tip-line", (typeLabel[h.o.k] || "Body") + (h.o.b.via ? " · part of " + h.o.b.via : "")));
      if (h.o.b.also) tip.appendChild(make("span", "gm-tip-line", "Also under " + h.o.b.also.join(", ")));
      tip.appendChild(make("span", "gm-tip-hint", "Click to open its GOV.UK page"));
    } else if (h.s) {
      tip.appendChild(make("strong", null, h.s.r.n));
      tip.appendChild(make("span", "gm-tip-line", "Ministerial department that works with " + h.s.targets.map(function (t) { return t.label; }).join(", ")));
      var sslug = slugOfDept({ r: h.s.r }) || (h.s.r && h.s.r.u && (h.s.r.u.split("/").pop()));
      if (sslug && window.GovmapBudget) tip.appendChild(window.GovmapBudget.line(sslug, { cls: "gm-tip-bud" }));
    } else if (h.d) {
      var d = h.d;
      tip.appendChild(make("strong", null, d.r.n));
      if (d.r.ab) tip.appendChild(make("span", "gm-tip-ab", d.r.ab));
      tip.appendChild(make("span", "gm-tip-line", d.n ? d.n + (d.n === 1 ? " body" : " bodies") + ": " + countsText(d) : "No bodies listed on GOV.UK"));
      var slug = slugOfDept(d);
      if (slug && window.GovmapBudget) tip.appendChild(window.GovmapBudget.line(slug, { cls: "gm-tip-bud" }));
      if (d.sponsors) tip.appendChild(make("span", "gm-tip-line", "Works with " + d.sponsors.map(function (s) { return s.r.n; }).join(", ")));
      var shared = links.filter(function (l) { return l.a === d || l.b === d; });
      if (shared.length) tip.appendChild(make("span", "gm-tip-line", "Shares bodies with " + shared.map(function (l) { return (l.a === d ? l.b : l.a).label; }).join(", ")));
      tip.appendChild(make("span", "gm-tip-hint", state.focus === d.i ? "Click a body to open it on GOV.UK" : "Click to open it up"));
    }
    tip.hidden = false;
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = Math.min(Math.max(4, x + 14), state.w - tw - 4);
    var top = y + 16 + th > state.h ? y - th - 12 : y + 16;
    tip.style.left = left + "px";
    tip.style.top = Math.max(4, top) + "px";
  }

  function pos(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  canvas.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    var p = pos(e), h = hit(p.x, p.y);
    state.hover = h;
    canvas.classList.toggle("gm-pointer", !!h);
    showTip(h, p.x, p.y);
    redraw();
  });
  canvas.addEventListener("pointerleave", function () { state.hover = null; showTip(null); redraw(); });
  canvas.addEventListener("click", function (e) {
    var p = pos(e), h = hit(p.x, p.y);
    if (!h) { if (state.focus >= 0) reset(); return; }
    if (h.o) {
      if (state.mobile && !(state.hover && state.hover.o === h.o)) { state.hover = h; showTip(h, p.x, p.y); redraw(); return; }
      openBody(h.o);
      return;
    }
    if (h.s) { state.hover = h; showTip(h, p.x, p.y); redraw(); return; }
    if (h.d) {
      if (state.focus === h.d.i) { state.hover = h; showTip(h, p.x, p.y); redraw(); return; }
      focusDept(h.d.i);
      state.hover = null; showTip(null);
    }
  });
  canvas.addEventListener("keydown", function (e) {
    var f = state.focus >= 0 ? depts[state.focus] : null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      var step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      if (f && f.n) {
        state.kbBody = (state.kbBody + step + f.n) % f.n;
        var o = f.bodies[state.kbBody];
        state.hover = { o: o, d: f }; state.pulse = o;
        showTip(state.hover, o.x, o.y);
        say(o.b.n + ", " + (typeLabel[o.k] || "") + ". Press Enter to open on GOV.UK.");
      } else if (!f) {
        state.kb = (state.kb + step + depts.length) % depts.length;
        var d = depts[state.kb];
        state.hover = { d: d };
        showTip(state.hover, d.x, d.y);
        say(d.r.n + ", " + d.n + " bodies. Press Enter to open it up.");
      }
      redraw();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (f && state.kbBody >= 0) openBody(f.bodies[state.kbBody]);
      else if (!f && state.kb >= 0) focusDept(state.kb);
    } else if (e.key === "Escape") {
      reset();
    }
  });
  canvas.addEventListener("blur", function () { showTip(null); });

  function openBody(o) {
    var u = safeUrl(o.b.u, GOVUK_HOST);
    if (u) window.open(u, "_blank", "noopener,noreferrer");
  }

  function say(msg) { if (ui.status) ui.status.textContent = msg; }

  function focusDept(i, keepPulse) {
    if (state.focus >= 0 && state.focus !== i) { state.prevFocus = -1; state.t = 0; }
    state.focus = i; state.prevFocus = i; state.tTarget = 1; state.kb = i; state.kbBody = -1;
    if (!keepPulse) state.pulse = null;
    var d = depts[i];
    state.hover = null; showTip(null);
    say(d.r.n + " opened: " + (d.n ? d.n + " bodies" : "no bodies listed") + ". Use arrow keys on the chart, or the list below.");
    renderPanel(d);
    markList(i);
    syncViewSwitch();
    writeChartUrl();
    if (state.orgView === "org") renderOrg();
    kick();
  }
  function reset() {
    if (state.focus >= 0) state.prevFocus = state.focus;
    state.focus = -1; state.tTarget = 0; state.pulse = null; state.kbBody = -1; state.hover = null;
    showTip(null);
    renderPanel(null);
    markList(-1);
    syncViewSwitch();
    writeChartUrl();
    if (state.orgView === "org") renderOrg();
    else hideOrg();
    say(state.orgView === "org"
      ? ((KIND === "min" ? "UK Government" : "Non-ministerial departments") + " as an org chart. Choose a department to open it.")
      : "Showing all departments.");
    kick();
    redraw();
  }

  /* ---------- circle / org-chart switch ---------- */
  var viewBar, orgEl, orgTimer = null;
  function buildViewSwitch() {
    viewBar = make("div", "gm-chart-switch");
    viewBar.hidden = false;
    viewBar.setAttribute("role", "group");
    viewBar.setAttribute("aria-label", "How to show the chart");
    var lab = make("span", "gm-chart-switch-l", "Show as");
    var seg = make("div", "gm-seg");
    [["circle", "Circle"], ["org", "Org chart"]].forEach(function (p) {
      var b = make("button", "gm-seg-b", p[1]);
      b.type = "button";
      b.setAttribute("data-view", p[0]);
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { setOrgView(p[0]); });
      seg.appendChild(b);
    });
    viewBar.appendChild(lab);
    viewBar.appendChild(seg);
    var layout = document.querySelector(".gm-chart-layout");
    if (layout && layout.parentNode) layout.parentNode.insertBefore(viewBar, layout);
    else stage.parentNode.insertBefore(viewBar, stage);
    orgEl = make("div", "gm-org");
    orgEl.id = "gm-org";
    orgEl.hidden = true;
    stage.appendChild(orgEl);
    window.addEventListener("resize", function () {
      if (state.orgView !== "org") return;
      clearTimeout(orgTimer);
      orgTimer = setTimeout(function () { renderOrg(); }, 160);
    });
  }
  function syncViewSwitch() {
    if (!viewBar) return;
    viewBar.hidden = false;
    var bs = viewBar.querySelectorAll(".gm-seg-b");
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute("aria-pressed", bs[i].getAttribute("data-view") === state.orgView ? "true" : "false");
    }
  }
  function setOrgView(mode, fromUrl) {
    var next = mode === "org" ? "org" : "circle";
    state.orgView = next;
    syncViewSwitch();
    if (next === "org") {
      showTip(null);
      renderOrg();
      if (state.focus >= 0) say((depts[state.focus].r.n) + " as an org chart. Switch back to Circle for the animated view.");
      else say((KIND === "min" ? "UK Government" : "Non-ministerial departments") + " as an org chart. Choose a department to open it.");
    } else {
      hideOrg();
      if (state.focus >= 0) say(depts[state.focus].r.n + " on the circle chart.");
      else say("Showing all departments.");
      kick();
    }
    if (!fromUrl) writeChartUrl();
    var nb = viewBar && viewBar.querySelector(".gm-seg-b[aria-pressed=true]");
    if (nb && !fromUrl) nb.focus();
  }
  function renderOrg() {
    if (!orgEl) return;
    canvas.setAttribute("hidden", "");
    orgEl.hidden = false;
    stage.classList.add("gm-stage-org");
    var go = function () {
      if (!window.GovmapOrg) return;
      if (state.focus >= 0) {
        var slug = slugOfDept(depts[state.focus]);
        if (window.GovmapOrg.render) window.GovmapOrg.render(orgEl, slug);
      } else if (window.GovmapOrg.renderOverview) {
        window.GovmapOrg.renderOverview(orgEl, { kind: KIND, onSelect: function (slug) {
          var i = indexBySlug(slug);
          if (i >= 0) { state.orgView = "org"; focusDept(i, true); }
        }});
      }
    };
    if (window.GovmapOrg && window.GovmapOrg.ready && window.GovmapOrg.ready.then) window.GovmapOrg.ready.then(go);
    else go();
  }
  function hideOrg() {
    if (orgEl) { orgEl.hidden = true; orgEl.textContent = ""; }
    canvas.removeAttribute("hidden");
    stage.classList.remove("gm-stage-org");
    resize();
  }

  /* ---------- side panel, list fallback, search ---------- */
  function renderPanel(d) {
    var p = ui.panel;
    p.textContent = "";
    if (!d) {
      p.appendChild(make("p", "gm-panel-hint", "Pick a department on the chart or in the list to see its bodies here."));
      return;
    }
    var h = make("h2", "gm-panel-h");
    h.appendChild(document.createTextNode(d.r.n));
    if (d.r.ab) h.appendChild(make("span", "gm-ab", d.r.ab));
    p.appendChild(h);
    var meta = make("p", "gm-panel-meta", d.n ? d.n + (d.n === 1 ? " body: " : " bodies: ") + countsText(d) : "GOV.UK lists no bodies for this department.");
    p.appendChild(meta);
    var pslug = slugOfDept(d);
    if (pslug) {
      var pbud = make("p", "gm-panel-bud");
      if (window.GovmapBudget) window.GovmapBudget.fill(pbud, pslug);
      else pbud.setAttribute("data-budget-slug", pslug);
      p.appendChild(pbud);
    }
    if (d.sponsors) p.appendChild(make("p", "gm-panel-meta", "Works with " + d.sponsors.map(function (s) { return s.r.n; }).join(", ") + "."));
    var du = safeUrl(d.r.u, GOVUK_HOST);
    var actions = make("div", "gm-panel-actions");
    if (du) {
      var a = make("a", "gm-link", "Department on GOV.UK");
      a.href = du; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.appendChild(make("span", "visually-hidden", " (opens in a new tab)"));
      actions.appendChild(a);
    }
    var slug = (/\/government\/organisations\/([a-z0-9-]+)\/?$/.exec(du ? new URL(du).pathname : "") || [])[1];
    if (slug) {
      var tv = make("a", "gm-tool gm-tool-link", "Open in the tree");
      tv.href = "/govmap/?dept=" + encodeURIComponent(slug);
      actions.appendChild(tv);
    }
    var back = make("button", "gm-tool", "Back to all departments");
    back.type = "button";
    back.addEventListener("click", reset);
    actions.appendChild(back);
    p.appendChild(actions);
    if (!d.n) return;
    var ul = make("ul", "gm-panel-list");
    d.bodies.forEach(function (o) {
      var li = make("li");
      li.appendChild(make("span", "gm-sw gm-sw-" + o.k));
      var u = safeUrl(o.b.u, GOVUK_HOST);
      var a = make("a", null, o.b.n);
      if (u) { a.href = u; a.target = "_blank"; a.rel = "noopener noreferrer"; }
      a.appendChild(make("span", "visually-hidden", " (" + (typeLabel[o.k] || "") + ", opens in a new tab)"));
      li.appendChild(a);
      if (o.b.ab) li.appendChild(make("span", "gm-ab", o.b.ab));
      li.addEventListener("mouseenter", function () { state.pulse = o; kick(); });
      ul.appendChild(li);
    });
    p.appendChild(ul);
  }

  function markList(i) {
    var bs = ui.list.querySelectorAll("button");
    for (var k = 0; k < bs.length; k++) bs[k].setAttribute("aria-pressed", String(k === i));
  }

  function setupUi() {
    buildViewSwitch();
    // stats: the first two link to the tree view with the matching filter
    var bodies = depts.reduce(function (s, d) { return s + d.n; }, 0);
    var show = KIND === "min" ? "ministerial" : "non-ministerial";
    [[KIND === "min" ? "Ministerial departments" : "Non-ministerial departments", depts.length, "/govmap/?show=" + show],
     ["Bodies linked", bodies, "/govmap/?show=" + show + "&expand=1"],
     [KIND === "min" ? "Departments sharing bodies" : "Ministerial partners", KIND === "min" ? links.length + " links" : sponsors.length, null]].forEach(function (p) {
      var card = make(p[2] ? "a" : "div", "gm-stat");
      if (p[2]) { card.href = p[2]; card.title = "Open in the tree view"; }
      card.appendChild(make("span", "gm-stat-n", p[1]));
      card.appendChild(make("span", "gm-stat-l", p[0]));
      ui.stats.appendChild(card);
    });
    // legend
    var present = {};
    depts.forEach(function (d) { d.bodies.forEach(function (o) { present[o.k] = (present[o.k] || 0) + 1; }); });
    var li0 = make("li");
    li0.appendChild(make("span", "gm-sw gm-sw-" + (KIND === "min" ? "ministerial" : "nmd") + " gm-sw-big"));
    li0.appendChild(glossLink(KIND === "min" ? "ministerial-department" : "non-ministerial-department", KIND === "min" ? "Ministerial department" : "Non-ministerial department"));
    ui.legend.appendChild(li0);
    if (KIND === "nmd") {
      var lis = make("li");
      lis.appendChild(make("span", "gm-sw gm-sw-sponsor"));
      lis.appendChild(glossLink("sponsor-department", "Ministerial department it works with"));
      ui.legend.appendChild(lis);
    } else {
      var lil = make("li");
      lil.appendChild(make("span", "gm-sw gm-sw-link"));
      lil.appendChild(glossLink("shared", "Shares a body"));
      ui.legend.appendChild(lil);
    }
    typeOrder.forEach(function (k) {
      if (!present[k]) return;
      var li = make("li");
      li.appendChild(make("span", "gm-sw gm-sw-" + k));
      li.appendChild(glossLink(TYPE_ANCHOR[k] || "other-public-body", typeLabel[k]));
      li.appendChild(document.createTextNode(" (" + present[k] + ")"));
      ui.legend.appendChild(li);
    });
    // list fallback
    depts.forEach(function (d, i) {
      var li = make("li");
      var b = make("button", "gm-dept-btn");
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.appendChild(make("span", "gm-dept-btn-name", d.r.n));
      b.appendChild(make("span", "gm-count", d.n));
      b.addEventListener("click", function () {
        focusDept(i);
        if (stage.getBoundingClientRect().top < 0) stage.scrollIntoView({ behavior: reduceMq.matches ? "auto" : "smooth", block: "start" });
      });
      li.appendChild(b);
      ui.list.appendChild(li);
    });
    // search options
    var seen = {};
    depts.forEach(function (d) {
      [d.r.n].concat(d.r.ab ? [d.r.ab] : []).concat(d.bodies.map(function (o) { return o.b.n; })).forEach(function (v) {
        if (seen[v]) return; seen[v] = 1;
        var opt = document.createElement("option"); opt.value = v; ui.findList.appendChild(opt);
      });
    });
    ui.findForm.addEventListener("submit", function (e) { e.preventDefault(); find(ui.find.value); });
    ui.find.addEventListener("change", function () { find(ui.find.value); });
    ui.reset.addEventListener("click", function () { ui.find.value = ""; reset(); });
    ui.pause.addEventListener("click", function () {
      state.playing = !state.playing;
      syncPause();
      kick();
    });
    syncPause();
    renderPanel(null);
  }
  function syncPause() {
    ui.pause.setAttribute("aria-pressed", state.playing ? "false" : "true");
    ui.pause.textContent = state.playing ? "Pause motion" : "Play motion";
  }

  function find(q) {
    q = norm(q);
    if (!q) return;
    var di = -1, body = null;
    depts.forEach(function (d, i) {
      if (di < 0 && (norm(d.r.n) === q || norm(d.r.ab) === q)) di = i;
    });
    if (di < 0) depts.forEach(function (d, i) {
      d.bodies.forEach(function (o) { if (!body && (norm(o.b.n) === q || norm(o.b.ab) === q)) { body = o; di = i; } });
    });
    if (di < 0) depts.forEach(function (d, i) { if (di < 0 && norm(d.r.n).indexOf(q) >= 0) di = i; });
    if (di < 0) depts.forEach(function (d, i) {
      d.bodies.forEach(function (o) { if (!body && (norm(o.b.n).indexOf(q) >= 0 || norm(o.b.ab).indexOf(q) >= 0)) { body = o; di = i; } });
    });
    if (di < 0) { say("Nothing called “" + q + "” in this chart. Try the tree view, which covers every department."); return; }
    focusDept(di, true);
    if (body) {
      state.pulse = body;
      say(body.b.n + " is under " + depts[di].r.n + ". It is highlighted on the chart.");
    }
    kick();
  }

  function credit() {
    if (!ui.credit) return;
    var s = data.source || {};
    ui.credit.textContent = "";
    ui.credit.appendChild(document.createTextNode("Organisation data from "));
    var src = safeUrl(s.url, GOVUK_HOST);
    var a = make("a", null, "GOV.UK");
    if (src) { a.href = src; a.target = "_blank"; a.rel = "noopener noreferrer"; }
    ui.credit.appendChild(a);
    ui.credit.appendChild(document.createTextNode(", contains public sector information licensed under the "));
    var lic = safeUrl(s.licenceUrl, "www.nationalarchives.gov.uk");
    var l = make("a", null, "Open Government Licence v3.0");
    if (lic) { l.href = lic; l.target = "_blank"; l.rel = "noopener noreferrer license"; }
    ui.credit.appendChild(l);
    var d = new Date(data.generated), when = "";
    if (!isNaN(d.getTime())) {
      try { when = d.toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " UK time"; } catch (e) { when = ""; }
    }
    ui.credit.appendChild(document.createTextNode(". Snapshot " + (when || "date unknown") + "."));
  }

  /* ---------- start ---------- */
  function start() {
    build();
    setupUi();
    credit();
    resize();
    if (window.ResizeObserver) new ResizeObserver(function () { resize(); }).observe(stage);
    else window.addEventListener("resize", resize);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { state.visible = es[0].isIntersecting; kick(); }).observe(stage);
    }
    document.addEventListener("visibilitychange", function () { state.visible = !document.hidden; kick(); });
    var onMq = function () { if (reduceMq.matches) { state.playing = false; syncPause(); } };
    if (reduceMq.addEventListener) reduceMq.addEventListener("change", onMq);
    stage.classList.add("gm-ready");
    kick();
    applyChartUrl();
    window.addEventListener("popstate", function () { applyChartUrl(); });
  }

  fetch("/data/govmap.json", { credentials: "same-origin" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      if (!d || !Array.isArray(d.roots) || !Array.isArray(d.types)) throw new Error("bad data");
      data = d;
      start();
    })
    .catch(function () { say("The chart could not load. The tree view lists the same departments."); });
})();
