/* Hardware lifecycle tutorial UI v5 — all-stage learning */
(function () {
  var data = window.HW_TUTORIAL;
  if (!data || !data.stages || !data.stages.length) return;

  var STORAGE_KEY = "ga-osi-hw-checklist-v1";
  var DEPTH_KEY = "ga-osi-hw-depth-v1";
  var QUIZ_KEY = "ga-osi-hw-quiz-v2";
  var QUIZ_KEY_LEGACY = "ga-osi-hw-quiz-v1";

  function learnFor(stageId) {
    return (data.learn && data.learn[stageId]) || null;
  }
  function findChip(stageId, chipId) {
    var L = learnFor(stageId);
    if (!L || !L.chips) return null;
    for (var i = 0; i < L.chips.length; i++) if (L.chips[i].id === chipId) return L.chips[i];
    return null;
  }
  function loadQuizMap() {
    var cur = loadJSON(QUIZ_KEY, null);
    if (cur && typeof cur === "object" && !cur.choice) return cur;
    // migrate legacy single build answer
    var leg = loadJSON(QUIZ_KEY_LEGACY, null);
    var map = {};
    if (leg && leg.choice) map.build = leg;
    if (cur && cur.choice) map.build = cur;
    return map;
  }
  function saveQuizAnswer(stageId, payload) {
    var map = loadQuizMap();
    map[stageId] = payload;
    saveJSON(QUIZ_KEY, map);
  }
  function quizProgress() {
    var map = loadQuizMap();
    var ids = (data.stages || []).map(function (s) { return s.id; });
    var done = 0;
    ids.forEach(function (id) {
      var a = map[id];
      if (a && a.correct) done++;
    });
    return { done: done, total: ids.length };
  }
  var ringHost = document.getElementById("tutRing");
  var panel = document.getElementById("tutPanel");
  var themeSeg = document.getElementById("themeSeg");
  var glossBtn = document.getElementById("tutGlossBtn");
  var activeId = null;

  var stages = data.stages;
  var REFS = (window.HW_REFS || []).slice().sort(function (a, b) {
    var al = (a.phrases && a.phrases[0] || "").length;
    var bl = (b.phrases && b.phrases[0] || "").length;
    return bl - al;
  });

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function makeExtLink(href, label) {
    var a = document.createElement("a");
    a.className = "tut-ext-link";
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("data-ga-keep", "");
    a.setAttribute("aria-label", label + " (opens in a new tab)");
    var words = String(label).split(/(\s+)/);
    // Keep arrow attached to last non-space token
    var html = "";
    for (var i = 0; i < words.length; i++) {
      if (i === words.length - 1 && words[i].trim()) {
        html += '<span class="tut-ext-link__tail">' + escapeHtml(words[i]) + '<span class="tut-ext-link__icon" aria-hidden="true">↗</span></span>';
      } else {
        html += escapeHtml(words[i]);
      }
    }
    if (!/[^\s]/.test(label)) html = escapeHtml(label);
    // If label has spaces, rebuild: all but last word + nowrap last+icon
    var parts = String(label).trim().split(/\s+/);
    if (parts.length) {
      var last = parts.pop();
      var head = parts.length ? escapeHtml(parts.join(" ")) + " " : "";
      a.innerHTML = head + '<span class="tut-ext-link__tail">' + escapeHtml(last) + '<span class="tut-ext-link__icon" aria-hidden="true">↗</span></span>';
    } else {
      a.textContent = label;
    }
    a.addEventListener("click", function (ev) { ev.stopPropagation(); });
    return a;
  }

  function linkifyToNode(text) {
    var wrap = document.createElement("span");
    wrap.className = "tut-linkified";
    var remaining = String(text);
    // Build combined regex from phrases
    var pairs = [];
    REFS.forEach(function (ref) {
      (ref.phrases || []).forEach(function (ph) {
        pairs.push({ ph: ph, href: ref.href, label: ref.label || ph });
      });
    });
    pairs.sort(function (a, b) { return b.ph.length - a.ph.length; });
    if (!pairs.length) { wrap.textContent = text; return wrap; }
    var alt = pairs.map(function (p) {
      return p.ph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|");
    var re = new RegExp("(" + alt + ")", "gi");
    var last = 0; var m;
    while ((m = re.exec(remaining)) !== null) {
      if (m.index > last) wrap.appendChild(document.createTextNode(remaining.slice(last, m.index)));
      var matched = m[1];
      var hit = null;
      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].ph.toLowerCase() === matched.toLowerCase()) { hit = pairs[i]; break; }
      }
      if (hit) wrap.appendChild(makeExtLink(hit.href, matched));
      else wrap.appendChild(document.createTextNode(matched));
      last = m.index + matched.length;
    }
    if (last < remaining.length) wrap.appendChild(document.createTextNode(remaining.slice(last)));
    return wrap;
  }

  function fillLinkified(el, text) {
    el.textContent = "";
    el.appendChild(linkifyToNode(text));
  }

  function renderSourcesFooter() {
    var host = document.getElementById("tutSources");
    if (!host) return;
    var list = host.querySelector("ul");
    if (!list) return;
    list.textContent = "";
    (window.HW_SOURCES || []).forEach(function (s) {
      var li = document.createElement("li");
      li.appendChild(makeExtLink(s.href, s.label));
      list.appendChild(li);
    });
  }
  var lastFocus = null;

  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
  }
  function loadChecks() { return loadJSON(STORAGE_KEY, {}); }
  function saveChecks(obj) { saveJSON(STORAGE_KEY, obj); }
  function getDepth() {
    var d = loadJSON(DEPTH_KEY, "basics");
    if (d !== "basics" && d !== "practitioner" && d !== "architect") d = "basics";
    return d;
  }
  function setDepth(d) { saveJSON(DEPTH_KEY, d); }

  function stageById(id) {
    for (var i = 0; i < stages.length; i++) if (stages[i].id === id) return stages[i];
    return null;
  }
  function stageIndex(id) {
    for (var i = 0; i < stages.length; i++) if (stages[i].id === id) return i;
    return -1;
  }
  function polar(cx, cy, r, angleDeg) {
    var a = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function renderRing() {
    if (!ringHost) return;
    var NS = "http://www.w3.org/2000/svg";
    var size = 720, cx = 360, cy = 360, r = 205;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    svg.setAttribute("role", "group");
    svg.setAttribute("aria-label", "Hardware security lifecycle ring with eight stages. Click a stage to open its tutorial.");

    var bg = document.createElementNS(NS, "circle");
    bg.setAttribute("class", "tut-ring-bg");
    bg.setAttribute("cx", cx); bg.setAttribute("cy", cy); bg.setAttribute("r", r);
    svg.appendChild(bg);

    var n = stages.length;
    for (var i = 0; i < n; i++) {
      var a0 = (i / n) * 360, a1 = ((i + 1) / n) * 360;
      var p0 = polar(cx, cy, r, a0 + 10), p1 = polar(cx, cy, r, a1 - 10);
      var arc = document.createElementNS(NS, "path");
      arc.setAttribute("class", "tut-ring-arc");
      arc.setAttribute("d", "M " + p0.x + " " + p0.y + " A " + r + " " + r + " 0 0 1 " + p1.x + " " + p1.y);
      svg.appendChild(arc);
    }

    var hub = document.createElementNS(NS, "circle");
    hub.setAttribute("class", "tut-hub");
    hub.setAttribute("cx", cx); hub.setAttribute("cy", cy); hub.setAttribute("r", 86);
    svg.appendChild(hub);
    var ht = document.createElementNS(NS, "text");
    ht.setAttribute("class", "tut-hub-label");
    ht.setAttribute("x", cx); ht.setAttribute("y", cy - 8);
    ht.textContent = "HARDWARE";
    svg.appendChild(ht);
    var hs = document.createElementNS(NS, "text");
    hs.setAttribute("class", "tut-hub-sub");
    hs.setAttribute("x", cx); hs.setAttribute("y", cy + 14);
    hs.textContent = "LIFECYCLE";
    svg.appendChild(hs);

    stages.forEach(function (st, idx) {
      var ang = (idx / n) * 360;
      var p = polar(cx, cy, r, ang);
      var lp = polar(cx, cy, r + 88, ang);
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "tut-node");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("data-id", st.id);
      g.setAttribute("aria-label", "Stage " + st.num + ": " + st.title);
      g.setAttribute("aria-pressed", "false");

      var hit = document.createElementNS(NS, "circle");
      hit.setAttribute("cx", p.x); hit.setAttribute("cy", p.y); hit.setAttribute("r", 42);
      hit.setAttribute("fill", "transparent");
      hit.setAttribute("class", "tut-node-hit");
      g.appendChild(hit);

      var dot = document.createElementNS(NS, "circle");
      dot.setAttribute("class", "tut-node-dot");
      dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); dot.setAttribute("r", 24);
      g.appendChild(dot);

      var num = document.createElementNS(NS, "text");
      num.setAttribute("class", "tut-node-num");
      num.setAttribute("x", p.x); num.setAttribute("y", p.y);
      num.textContent = String(st.num);
      g.appendChild(num);

      var lab = document.createElementNS(NS, "text");
      lab.setAttribute("class", "tut-node-label");
      lab.setAttribute("x", lp.x); lab.setAttribute("y", lp.y);
      var parts = st.short.split(" & ");
      if (parts.length === 2) {
        var t1 = document.createElementNS(NS, "tspan");
        t1.setAttribute("x", lp.x); t1.setAttribute("dy", "-0.4em");
        t1.textContent = parts[0] + " &";
        var t2 = document.createElementNS(NS, "tspan");
        t2.setAttribute("x", lp.x); t2.setAttribute("dy", "1.2em");
        t2.textContent = parts[1];
        lab.appendChild(t1); lab.appendChild(t2);
      } else {
        lab.textContent = st.short;
      }
      g.appendChild(lab);

      function activate() { openStage(st.id); }
      g.addEventListener("click", activate);
      g.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); activate(); }
      });
      svg.appendChild(g);
    });

    ringHost.textContent = "";
    ringHost.appendChild(svg);
  }

  function setActiveNode(id) {
    var nodes = ringHost.querySelectorAll(".tut-node");
    for (var i = 0; i < nodes.length; i++) {
      var on = nodes[i].getAttribute("data-id") === id;
      nodes[i].classList.toggle("is-active", on);
      nodes[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function listItems(arr) {
    var ul = document.createElement("ul");
    (arr || []).forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
    return ul;
  }
  function listItemsLinkified(arr) {
    var ul = document.createElement("ul");
    (arr || []).forEach(function (t) {
      var li = document.createElement("li");
      fillLinkified(li, t);
      ul.appendChild(li);
    });
    return ul;
  }

  function ensureOverlay() {
    var el = document.getElementById("tutOverlay");
    if (el) return el;
    el = document.createElement("div");
    el.id = "tutOverlay";
    el.className = "tut-overlay";
    el.setAttribute("data-ga-keep", "");
    el.hidden = true;
    el.innerHTML = '<div class="tut-overlay__backdrop" data-close="1"></div><div class="tut-overlay__sheet" role="dialog" aria-modal="true" aria-labelledby="tutOverlayTitle" tabindex="-1"><button type="button" class="tut-overlay__x" aria-label="Close">×</button><div class="tut-overlay__body" id="tutOverlayBody"></div></div>';
    document.body.appendChild(el);
    el.querySelector(".tut-overlay__backdrop").addEventListener("click", closeOverlay);
    el.querySelector(".tut-overlay__x").addEventListener("click", closeOverlay);
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !el.hidden) closeOverlay();
    });
    return el;
  }

  function openOverlay(html, opts) {
    opts = opts || {};
    lastFocus = document.activeElement;
    var el = ensureOverlay();
    var body = el.querySelector("#tutOverlayBody");
    body.innerHTML = "";
    if (typeof html === "string") body.innerHTML = html;
    else body.appendChild(html);
    el.hidden = false;
    el.classList.toggle("is-sheet", !!opts.sheet);
    document.body.classList.add("tut-overlay-open");
    var focusable = el.querySelector(".tut-overlay__sheet");
    if (focusable) focusable.focus();
  }

  function closeOverlay() {
    var el = document.getElementById("tutOverlay");
    if (!el) return;
    el.hidden = true;
    document.body.classList.remove("tut-overlay-open");
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }

  function isMobile() {
    return window.matchMedia && window.matchMedia("(max-width:960px)").matches;
  }

  function openChipCard(chip) {
    var wrap = document.createElement("div");
    wrap.className = "tut-card";
    wrap.innerHTML = "<h3 id=\"tutOverlayTitle\">" + chip.label + "</h3>";
    function row(k, v) {
      var s = document.createElement("section");
      var h = document.createElement("h4"); h.textContent = k; s.appendChild(h);
      var p = document.createElement("p"); fillLinkified(p, v); s.appendChild(p);
      wrap.appendChild(s);
    }
    row("What it is", chip.what);
    row("Everyday analogy", chip.analogy);
    row("Without it", chip.without);
    row("What good looks like", chip.good);
    function addSourceLink(title, link) {
      if (!link || !link.href) return;
      var s = document.createElement("section");
      s.className = "tut-card__source";
      var h = document.createElement("h4"); h.textContent = title; s.appendChild(h);
      s.appendChild(makeExtLink(link.href, link.label));
      wrap.appendChild(s);
    }
    addSourceLink("NCSC / source", chip.link);
    if (chip.link2) addSourceLink("Further reading", chip.link2);
    if (chip.link3) addSourceLink("Further reading", chip.link3);
    openOverlay(wrap, { sheet: isMobile() });
  }

  function openGlossary() {
    var wrap = document.createElement("div");
    wrap.className = "tut-gloss";
    var h = document.createElement("h3");
    h.id = "tutOverlayTitle";
    h.textContent = "Glossary";
    wrap.appendChild(h);
    var p = document.createElement("p");
    p.className = "tut-gloss__note";
    p.textContent = "Twenty hardware terms. Tap a term or stage number to jump there and open its card.";
    wrap.appendChild(p);
    var ul = document.createElement("ul");
    ul.className = "tut-gloss__list";
    (data.glossary || []).forEach(function (g) {
      var li = document.createElement("li");
      var st = stageById(g.stage);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tut-gloss__stage";
      btn.textContent = st ? String(st.num) : "?";
      btn.setAttribute("aria-label", "Open stage " + (st ? st.title : g.stage));
      function jumpTerm() {
        closeOverlay();
        openStage(g.stage, { openChipId: g.id });
      }
      btn.addEventListener("click", jumpTerm);
      var main = document.createElement("div");
      main.className = "tut-gloss__main";
      main.setAttribute("role", "button");
      main.tabIndex = 0;
      main.setAttribute("aria-label", "Open " + g.term + " on stage " + (st ? st.title : g.stage));
      main.addEventListener("click", jumpTerm);
      main.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); jumpTerm(); }
      });
      var t = document.createElement("strong"); t.textContent = g.term;
      var d = document.createElement("span"); d.textContent = g.def;
      main.appendChild(t); main.appendChild(d);
      if (g.href) {
        var ga = document.createElement("a");
        ga.className = "tut-ext-link tut-ext-link--small";
        ga.href = g.href; ga.target = "_blank"; ga.rel = "noopener noreferrer";
        ga.setAttribute("data-ga-keep", "");
        ga.textContent = "NCSC source ↗";
        ga.setAttribute("aria-label", g.term + " NCSC source (opens in a new tab)");
        ga.addEventListener("click", function (ev) { ev.stopPropagation(); });
        main.appendChild(ga);
      }
      li.appendChild(btn); li.appendChild(main);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    openOverlay(wrap, { sheet: true });
  }

  function renderAttack(host, learn) {
    var a = learn && learn.attack;
    if (!a) return;
    var card = document.createElement("section");
    card.className = "tut-attack";
    card.setAttribute("aria-label", a.title);
    var h = document.createElement("h3"); h.textContent = a.title; card.appendChild(h);
    var story = document.createElement("p"); fillLinkified(story, a.story); card.appendChild(story);
    var flow = document.createElement("ol"); flow.className = "tut-attack__flow";
    (a.steps || []).forEach(function (s) {
      var li = document.createElement("li");
      li.className = "is-" + s.kind;
      li.textContent = s.label;
      flow.appendChild(li);
    });
    card.appendChild(flow);
    host.appendChild(card);
  }

  function renderChips(host, learn) {
    var chips = learn && learn.chips;
    if (!chips) return;
    var sec = document.createElement("section");
    sec.className = "tut-sec";
    var h = document.createElement("h3"); h.textContent = "Key terms"; sec.appendChild(h);
    var hint = document.createElement("p"); hint.className = "tut-chip-hint";
    hint.textContent = "Tap a chip for a plain-English card.";
    sec.appendChild(hint);
    var row = document.createElement("div");
    row.className = "tut-chips";
    row.setAttribute("role", "list");
    chips.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tut-chip-btn";
      b.setAttribute("role", "listitem");
      b.textContent = c.label;
      b.setAttribute("aria-label", c.label + " — open explainer");
      b.addEventListener("click", function () { openChipCard(c); });
      row.appendChild(b);
    });
    sec.appendChild(row);
    host.appendChild(sec);
  }

  function renderQuiz(host, stageId, learn) {
    var q = learn && learn.quiz;
    if (!q) return;
    var savedMap = loadQuizMap();
    var saved = savedMap[stageId] || {};
    var sec = document.createElement("section");
    sec.className = "tut-quiz";
    var h = document.createElement("h3"); h.textContent = "Quick check"; sec.appendChild(h);
    var qp = document.createElement("p"); qp.className = "tut-quiz__q"; qp.textContent = q.question; sec.appendChild(qp);
    var opts = document.createElement("div"); opts.className = "tut-quiz__opts"; opts.setAttribute("role", "radiogroup"); opts.setAttribute("aria-label", q.question);
    var fb = document.createElement("p"); fb.className = "tut-quiz__fb"; fb.setAttribute("aria-live", "polite");
    q.options.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tut-quiz__opt";
      b.textContent = o.label;
      b.setAttribute("aria-pressed", saved.choice === o.id ? "true" : "false");
      if (saved.choice === o.id) {
        b.classList.add(o.correct ? "is-ok" : "is-bad");
        fb.textContent = o.feedback;
        fb.className = "tut-quiz__fb " + (o.correct ? "is-ok" : "is-bad");
      }
      b.addEventListener("click", function () {
        saveQuizAnswer(stageId, { choice: o.id, correct: !!o.correct });
        opts.querySelectorAll("button").forEach(function (x) {
          x.setAttribute("aria-pressed", "false");
          x.classList.remove("is-ok", "is-bad");
        });
        b.setAttribute("aria-pressed", "true");
        b.classList.add(o.correct ? "is-ok" : "is-bad");
        fb.textContent = o.feedback;
        fb.className = "tut-quiz__fb " + (o.correct ? "is-ok" : "is-bad");
        updateQuizBadge();
        updateProg(stageById(stageId), (loadChecks()[stageId] || {}));
      });
      opts.appendChild(b);
    });
    sec.appendChild(opts);
    sec.appendChild(fb);
    host.appendChild(sec);
  }

  function contentForStage(st) {
    var learn = learnFor(st.id);
    if (!learn || !learn.depth) {
      return { what: st.what, why: st.why, do: st.do };
    }
    var d = getDepth();
    var block = learn.depth[d] || learn.depth.basics;
    return { what: block.what, why: block.why, do: block.do };
  }

  function openStage(id, opts) {
    opts = opts || {};
    var st = stageById(id);
    if (!st) return;
    activeId = id;
    var learn = learnFor(id);
    setActiveNode(id);
    var checks = loadChecks();
    var stageChecks = checks[id] || {};
    var content = contentForStage(st);

    panel.textContent = "";
    var ph = document.createElement("div");
    ph.className = "tut-ph";
    var meta = document.createElement("div");
    meta.innerHTML = '<h2 id="tutPanelTitle">' + st.title + '</h2><div class="tut-progress" id="tutProg"></div>';
    var num = document.createElement("span");
    num.className = "num";
    num.setAttribute("aria-hidden", "true");
    num.textContent = String(st.num);
    ph.appendChild(num);
    ph.appendChild(meta);
    var close = document.createElement("button");
    close.type = "button";
    close.className = "close";
    close.setAttribute("aria-label", "Close panel");
    close.textContent = "×";
    close.addEventListener("click", function () { openStage(stages[0].id); });
    ph.appendChild(close);
    panel.appendChild(ph);
    panel.setAttribute("aria-labelledby", "tutPanelTitle");

    var body = document.createElement("div");
    body.className = "tut-body";

    if (learn && learn.depth) {
      var depth = document.createElement("div");
      depth.className = "tut-depth";
      depth.setAttribute("role", "tablist");
      depth.setAttribute("aria-label", "How deep do you want to go");
      ["basics", "practitioner", "architect"].forEach(function (key) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.dataset.depth = key;
        b.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        var on = getDepth() === key;
        b.setAttribute("aria-selected", on ? "true" : "false");
        if (on) b.classList.add("is-on");
        b.addEventListener("click", function () {
          setDepth(key);
          openStage(id);
        });
        depth.appendChild(b);
      });
      body.appendChild(depth);
    }

    function sec(title, node) {
      var s = document.createElement("section");
      s.className = "tut-sec";
      var h = document.createElement("h3");
      h.textContent = title;
      s.appendChild(h);
      s.appendChild(node);
      body.appendChild(s);
    }

    var pWhat = document.createElement("p");
    fillLinkified(pWhat, content.what);
    sec("What it is", pWhat);

    var pWhy = document.createElement("p");
    fillLinkified(pWhy, content.why);
    sec("Why it matters", pWhy);

    sec("What to do (NCSC)", listItemsLinkified((content.do || []).slice(0, 5)));

    if (learn) {
      renderChips(body, learn);
      renderAttack(body, learn);
    }

    var links = document.createElement("ul");
    links.className = "tut-links";
    (st.links || []).forEach(function (L) {
      var li = document.createElement("li");
      li.appendChild(makeExtLink(L.href, L.label));
      links.appendChild(li);
    });
    sec("NCSC links & standards", links);

    var ul = document.createElement("ul");
    ul.className = "tut-check";
    (st.checklist || []).slice(0, 5).forEach(function (item, cidx) {
      var li = document.createElement("li");
      var lab = document.createElement("label");
      var inp = document.createElement("input");
      inp.type = "checkbox";
      inp.checked = !!stageChecks[cidx];
      inp.addEventListener("change", function () {
        var c = loadChecks();
        c[id] = c[id] || {};
        c[id][cidx] = inp.checked;
        saveChecks(c);
        updateProg(st, c[id]);
      });
      lab.appendChild(inp);
      var span = document.createElement("span");
      span.textContent = item;
      lab.appendChild(span);
      li.appendChild(lab);
      ul.appendChild(li);
    });
    sec("Checklist", ul);

    if (learn) renderQuiz(body, id, learn);

    var nav = document.createElement("div");
    nav.className = "tut-nav-btns";
    var prev = document.createElement("button");
    prev.type = "button";
    prev.textContent = "‹ Previous";
    prev.setAttribute("aria-label", "Previous stage");
    prev.addEventListener("click", function () {
      var i = stageIndex(activeId);
      openStage(stages[(i - 1 + stages.length) % stages.length].id);
    });
    var next = document.createElement("button");
    next.type = "button";
    next.textContent = "Next ›";
    next.setAttribute("aria-label", "Next stage");
    next.addEventListener("click", function () {
      var i = stageIndex(activeId);
      openStage(stages[(i + 1) % stages.length].id);
    });
    nav.appendChild(prev);
    nav.appendChild(next);
    body.appendChild(nav);

    panel.appendChild(body);
    updateProg(st, stageChecks);
    updateQuizBadge();

    if (window.matchMedia && window.matchMedia("(max-width:960px)").matches) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (opts.openChipId) {
      var chip = findChip(id, opts.openChipId);
      if (chip) {
        setTimeout(function () { openChipCard(chip); }, 60);
      }
    }
  }

  function updateProg(st, stageChecks) {
    var el = document.getElementById("tutProg");
    if (!el) return;
    var total = Math.min(5, (st.checklist || []).length);
    var done = 0;
    for (var i = 0; i < total; i++) if (stageChecks && stageChecks[i]) done++;
    var qp = quizProgress();
    el.textContent = done + " / " + total + " checklist · Quick checks " + qp.done + "/" + qp.total + " (saved in this browser)";
  }
  function updateQuizBadge() {
    var el = document.getElementById("tutQuizBadge");
    if (!el) return;
    var qp = quizProgress();
    el.textContent = "Quick checks " + qp.done + "/" + qp.total;
    el.hidden = false;
  }

  function applyTheme(t) {
    if (t !== "dark" && t !== "light" && t !== "auto") t = "dark";
    try { localStorage.setItem("osi-theme", t); } catch (e) {}
    var prefersLight = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches;
    var r = document.documentElement;
    r.setAttribute("data-theme-pref", t);
    r.setAttribute("data-theme", t === "auto" ? (prefersLight ? "light" : "dark") : t);
    if (themeSeg) {
      var btns = themeSeg.querySelectorAll("button[data-set]");
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-set") === t ? "true" : "false");
      }
    }
  }
  if (themeSeg) {
    themeSeg.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-set]");
      if (b) applyTheme(b.getAttribute("data-set"));
    });
    var pref = "dark";
    try { pref = localStorage.getItem("osi-theme") || "dark"; } catch (e) {}
    applyTheme(pref);
  }

  if (glossBtn) glossBtn.addEventListener("click", openGlossary);

  renderRing();
  ensureOverlay();
  renderSourcesFooter();
  updateQuizBadge();
  var q = new URLSearchParams(location.search).get("stage");
  if (q && stageById(q)) openStage(q);
  else openStage(stages[0].id);
})();
