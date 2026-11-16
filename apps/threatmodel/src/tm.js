/* Threat Modelling Lifecycle UI. Community resource — not official guidance. */
(function () {
  "use strict";
  var data = window.TM;
  if (!data || !data.stages || !data.stages.length) return;

  var DEPTH_KEY = "ga-tm-depth-v1";
  var QUIZ_KEY = "ga-tm-quiz-v1";
  var DONE_KEY = "ga-tm-completed-v1";

  var activeId = null;
  var currentTab = "model";
  var lastFocus = null;
  var chipLastFocus = null;
  var stages = data.stages;
  var srcById = {};
  (data.sources || []).forEach(function (s) { srcById[s.id] = s; });

  var FEATURED = [
    "MITRE ATT&CK current version is v20.1",
    "MITRE ATLAS content version 2026.10",
    "OWASP Top 10 for LLM Applications 2026",
    "Managing the cyber risk of agentic AI",
    "OWASP pytm v1.4.1",
    "SLSA version 1.2 announced"
  ];

  var REFS = (window.TM_REFS || []).slice().sort(function (a, b) {
    var al = (a.phrases && a.phrases[0] || "").length;
    var bl = (b.phrases && b.phrases[0] || "").length;
    return bl - al;
  });

  var TABS = [
    ["tab-model", "view-model", "model"],
    ["tab-whatsnew", "view-whatsnew", "whatsnew"],
    ["tab-example", "view-example", "example"],
    ["tab-glossary", "view-glossary", "glossary"]
  ];
  var HASH = {
    "#model": "model",
    "#lifecycle": "model",
    "#whatsnew": "whatsnew",
    "#example": "example",
    "#glossary": "glossary"
  };

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
  }
  function getDepth() {
    var d = loadJSON(DEPTH_KEY, "basics");
    if (d !== "basics" && d !== "practitioner" && d !== "architect") d = "basics";
    return d;
  }
  function setDepth(d) { saveJSON(DEPTH_KEY, d); }
  function loadQuizMap() {
    var cur = loadJSON(QUIZ_KEY, null);
    return (cur && typeof cur === "object") ? cur : {};
  }
  function saveQuizAnswer(stageId, payload) {
    var map = loadQuizMap();
    map[stageId] = payload;
    saveJSON(QUIZ_KEY, map);
  }
  function quizFor(stageId) {
    var a = loadQuizMap()[stageId];
    return a && typeof a === "object" ? a : null;
  }
  function loadDone() {
    var a = loadJSON(DONE_KEY, []);
    return Array.isArray(a) ? a : [];
  }
  function markDone(stageId) {
    if (!stageId) return;
    var a = loadDone();
    if (a.indexOf(stageId) === -1) {
      a.push(stageId);
      saveJSON(DONE_KEY, a);
    }
  }
  function isStageDone(stageId) {
    if (loadDone().indexOf(stageId) !== -1) return true;
    var a = quizFor(stageId);
    return !!(a && a.correct);
  }
  function stageSubtitle(st) {
    var title = String(st.title || "").trim();
    var full = String(st.full || "").trim();
    if (!full || full === title) return "";
    var paren = full.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    if (paren) {
      var before = paren[1].trim();
      if (!before || before === title || title.indexOf(before) === 0 || before.indexOf(title) === 0) {
        return paren[2];
      }
    }
    if (full.indexOf(title) === 0) {
      return full.slice(title.length).replace(/^[\s:,;—–-]+/, "").trim();
    }
    return full !== title ? full : "";
  }
  function firstSentence(s) {
    var t = String(s || "").trim();
    var m = t.match(/^(.+?[.?!])(?:\s|$)/);
    return m ? m[1] : t;
  }
  function ncscFlag(st) {
    var t = String(st.ncsc || "").trim();
    if (/^yes\b/i.test(t)) return "NCSC: Yes";
    if (/^partial\b/i.test(t)) return "NCSC: Partial";
    return t ? "NCSC: " + t.split(".")[0] : "";
  }
  function quizProgress() {
    var done = 0;
    stages.forEach(function (s) {
      var a = quizFor(s.id);
      if (a && a.correct) done++;
    });
    return { done: done, total: stages.length };
  }
  function learnFor(stageId) {
    return (data.learn && data.learn[stageId]) || null;
  }
  function findChip(stageId, chipId) {
    var L = learnFor(stageId);
    if (!L || !L.chips) return null;
    for (var i = 0; i < L.chips.length; i++) if (L.chips[i].id === chipId) return L.chips[i];
    return null;
  }
  function stageById(id) {
    for (var i = 0; i < stages.length; i++) if (stages[i].id === id) return stages[i];
    return null;
  }
  function stageIndex(id) {
    for (var i = 0; i < stages.length; i++) if (stages[i].id === id) return i;
    return -1;
  }
  function isGovAssured(href) {
    try {
      var h = new URL(href, location.href);
      return /(^|\.)govassured\.com$/i.test(h.hostname);
    } catch (e) { return false; }
  }
  function makeExtLink(href, label) {
    var a = document.createElement("a");
    a.className = "tm-ext-link";
    a.href = href;
    var same = isGovAssured(href) || !/^https?:/i.test(href);
    if (!same) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", label + " (opens in a new tab)");
    }
    a.setAttribute("data-ga-keep", "");
    a.setAttribute("data-keep", "");
    var parts = String(label).trim().split(/\s+/);
    if (parts.length) {
      var last = parts.pop();
      var head = parts.length ? escapeHtml(parts.join(" ")) + " " : "";
      var icon = same ? "" : '<span class="tm-ext-link__icon" aria-hidden="true">↗</span>';
      a.innerHTML = head + '<span class="tm-ext-link__tail">' + escapeHtml(last) + icon + "</span>";
    } else {
      a.textContent = label;
    }
    a.addEventListener("click", function (ev) { ev.stopPropagation(); });
    return a;
  }
  function linkifyToNode(text) {
    var wrap = document.createElement("span");
    wrap.className = "tm-linkified";
    var remaining = String(text);
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
    var re = new RegExp("(" + alt + ")", "g");
    var last = 0, m;
    while ((m = re.exec(remaining)) !== null) {
      if (m.index > last) wrap.appendChild(document.createTextNode(remaining.slice(last, m.index)));
      var matched = m[1];
      var hit = null;
      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].ph === matched) { hit = pairs[i]; break; }
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
  function sourceLink(sid) {
    var s = srcById[sid];
    if (!s) return document.createTextNode(sid);
    var a = makeExtLink(s.href, sid + " " + s.title);
    a.className += " refl";
    return a;
  }
  function ptext(t) {
    var p = document.createElement("p");
    fillLinkified(p, t);
    return p;
  }

  function updateQuizBadge() {
    var el = document.getElementById("tmQuizBadge");
    if (!el) return;
    var qp = quizProgress();
    el.textContent = "Quick checks " + qp.done + "/" + qp.total;
    el.hidden = false;
  }

  function paintDone() {
    document.querySelectorAll("#domains .cell, #life .cell").forEach(function (b) {
      var id = b.getAttribute("data-stage");
      b.classList.toggle("is-done", !!(id && isStageDone(id)));
    });
  }

  function renderDomains() {
    var host = document.getElementById("domains");
    if (!host) return;
    host.textContent = "";
    stages.forEach(function (st) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cell";
      b.setAttribute("data-stage", st.id);
      b.setAttribute("aria-label", "Stage " + st.num + " of " + stages.length + ": " + st.title);
      var hd = document.createElement("div");
      hd.className = "hd";
      var num = document.createElement("span");
      num.className = "num";
      num.textContent = (st.num < 10 ? "0" : "") + st.num;
      var ct = document.createElement("span");
      ct.className = "ct";
      ct.textContent = st.title;
      hd.appendChild(num);
      hd.appendChild(ct);
      b.appendChild(hd);
      var ul = document.createElement("ul");
      var li1 = document.createElement("li");
      li1.textContent = firstSentence(st.purpose);
      ul.appendChild(li1);
      b.appendChild(ul);
      var ft = document.createElement("div");
      ft.className = "ft";
      var flag = ncscFlag(st);
      if (flag) {
        var r = document.createElement("span");
        r.className = "r";
        r.textContent = flag;
        ft.appendChild(r);
      }
      b.appendChild(ft);
      b.addEventListener("click", function () { openStage(st.id); });
      host.appendChild(b);
    });
  }

  function renderLife() {
    var host = document.getElementById("life");
    var strip = document.getElementById("stages");
    if (!host) return;
    host.textContent = "";
    stages.forEach(function (st) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cell";
      b.setAttribute("data-stage", st.id);
      b.setAttribute("aria-label", "Stage " + st.num + " of " + stages.length + ": " + st.title);
      var ct = document.createElement("span");
      ct.className = "ct";
      ct.textContent = String(st.short || st.title).toUpperCase();
      var cs = document.createElement("span");
      cs.className = "cs";
      cs.textContent = stageSubtitle(st) || firstSentence(st.purpose);
      b.appendChild(ct);
      b.appendChild(cs);
      b.addEventListener("click", function () { openStage(st.id); });
      host.appendChild(b);
    });
    if (strip) {
      var lab = strip.querySelector(".sl");
      strip.textContent = "";
      if (lab) strip.appendChild(lab);
      else {
        var sl = document.createElement("span");
        sl.className = "sl";
        sl.textContent = "TEN STAGES";
        strip.appendChild(sl);
      }
      stages.forEach(function (st) {
        var s = document.createElement("span");
        s.className = "s";
        s.textContent = "S" + st.num + " " + st.short;
        strip.appendChild(s);
      });
    }
  }

  function renderHighlights() {
    var host = document.getElementById("wnHigh");
    var wn = data.whatsNew;
    if (!host || !wn) return;
    host.textContent = "";
    var byTitle = {};
    (wn.groups || []).forEach(function (g) {
      (g.items || []).forEach(function (it) { byTitle[it.title] = it; });
    });
    FEATURED.forEach(function (title) {
      var it = byTitle[title];
      if (!it) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "wnchip";
      b.setAttribute("data-wn", title);
      if (it.when) {
        var w = document.createElement("span");
        w.className = "when";
        w.textContent = it.when;
        b.appendChild(w);
      }
      b.appendChild(document.createTextNode(it.title));
      b.addEventListener("click", function () { showTab("whatsnew", { openItem: title }); });
      host.appendChild(b);
    });
  }

  function renderWhatsNew() {
    var host = document.getElementById("tmWhatsNew");
    var wn = data.whatsNew;
    if (!host || !wn) return;
    host.textContent = "";
    var checked = document.createElement("p");
    checked.className = "wn-checked";
    checked.textContent = "Last checked: " + (wn.checked || data.checked);
    host.appendChild(checked);
    var about = document.createElement("details");
    about.className = "wn-about";
    var aboutSum = document.createElement("summary");
    aboutSum.textContent = "About this briefing";
    about.appendChild(aboutSum);
    var intro = document.createElement("p");
    intro.className = "wn-intro";
    fillLinkified(intro, wn.intro);
    about.appendChild(intro);
    host.appendChild(about);
    (wn.groups || []).forEach(function (g) {
      var box = document.createElement("div");
      box.className = "wn-group";
      var h = document.createElement("h3");
      h.textContent = g.title;
      box.appendChild(h);
      (g.items || []).forEach(function (it) {
        var item = document.createElement("details");
        item.className = "wn-item";
        item.setAttribute("data-wn-title", it.title);
        var sum = document.createElement("summary");
        var main = document.createElement("span");
        if (it.when) {
          var when = document.createElement("span");
          when.className = "when";
          when.textContent = it.when;
          main.appendChild(when);
        }
        var h4 = document.createElement("span");
        h4.className = "wn-title";
        h4.textContent = it.title;
        main.appendChild(h4);
        var more = document.createElement("span");
        more.className = "wn-more";
        more.innerHTML = '<span class="wn-more__closed">Read more</span><span class="wn-more__open">Show less</span>';
        sum.appendChild(main);
        sum.appendChild(more);
        item.appendChild(sum);
        var body = document.createElement("div");
        body.className = "wn-body";
        var p = document.createElement("p");
        fillLinkified(p, it.body);
        body.appendChild(p);
        if (it.sources && it.sources.length) {
          var row = document.createElement("div");
          row.className = "srcs refs";
          it.sources.forEach(function (sid) { row.appendChild(sourceLink(sid)); });
          body.appendChild(row);
        }
        item.appendChild(body);
        box.appendChild(item);
      });
      host.appendChild(box);
    });
  }

  function renderExample() {
    var host = document.getElementById("tmExample");
    var ex = data.example;
    if (!host || !ex) return;
    host.textContent = "";
    var lede = document.createElement("p");
    lede.className = "wn-intro";
    fillLinkified(lede, ex.lede);
    host.appendChild(lede);
    var ul = document.createElement("ul");
    ul.className = "ex-setup";
    (ex.setup || []).forEach(function (t) {
      var li = document.createElement("li");
      fillLinkified(li, t);
      ul.appendChild(li);
    });
    host.appendChild(ul);
    var ol = document.createElement("ol");
    ol.className = "ex-steps";
    (ex.steps || []).forEach(function (step) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ex-jump";
      b.innerHTML = '<span class="ex-num">STAGE ' + step.num + "</span> " + escapeHtml(step.title);
      b.setAttribute("aria-label", "Open stage " + step.num + ": " + step.title);
      b.addEventListener("click", function () { openStage(step.id); });
      var p = document.createElement("p");
      fillLinkified(p, step.text);
      li.appendChild(b); li.appendChild(p);
      ol.appendChild(li);
    });
    host.appendChild(ol);
  }

  function fillGlossary(host) {
    if (!host) return;
    host.textContent = "";
    var wrap = document.createElement("div");
    wrap.className = "tm-gloss";
    var p = document.createElement("p");
    p.className = "tm-gloss__note";
    p.textContent = "Terms are introduced at the stage where they first appear. Tap a term or stage number to open that stage.";
    wrap.appendChild(p);
    var ul = document.createElement("ul");
    ul.className = "tm-gloss__list";
    (data.glossary || []).forEach(function (g) {
      var li = document.createElement("li");
      var st = stageById(g.stage);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tm-gloss__stage";
      btn.textContent = st ? String(st.num) : "?";
      btn.setAttribute("aria-label", "Open stage " + (st ? st.title : g.stage));
      function jumpTerm() { openStage(g.stage, { openChipId: g.id }); }
      btn.addEventListener("click", jumpTerm);
      var main = document.createElement("div");
      main.className = "tm-gloss__main";
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
        var ga = makeExtLink(g.href, "Source");
        ga.className += " tm-ext-link--small";
        ga.setAttribute("aria-label", g.term + " source (opens in a new tab)");
        main.appendChild(ga);
      }
      li.appendChild(btn); li.appendChild(main);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    host.appendChild(wrap);
  }

  function renderSourcesFooter() {
    var list = document.getElementById("tmSourcesList");
    if (!list) return;
    list.textContent = "";
    var groups = [];
    var seen = {};
    var total = 0;
    (data.sources || []).forEach(function (s) {
      if (!seen[s.group]) { seen[s.group] = []; groups.push(s.group); }
      seen[s.group].push(s);
      total++;
    });
    var countEl = document.getElementById("tmSourcesCount");
    if (countEl) countEl.textContent = "(" + total + ")";
    groups.forEach(function (g) {
      var h = document.createElement("h3");
      h.className = "tm-src-group";
      h.textContent = g;
      list.appendChild(h);
      var ul = document.createElement("ul");
      ul.className = "tm-sources__list";
      seen[g].forEach(function (s) {
        var li = document.createElement("li");
        var sid = document.createElement("span");
        sid.className = "sid";
        sid.textContent = s.id;
        li.appendChild(sid);
        li.appendChild(makeExtLink(s.href, s.title));
        ul.appendChild(li);
      });
      list.appendChild(ul);
    });
  }

  function accSection(title, countLabel, node, attrs) {
    var acc = document.createElement("details");
    acc.className = "tm-acc";
    if (attrs && attrs.section) acc.setAttribute("data-section", attrs.section);
    if (attrs && attrs.open) acc.setAttribute("open", "");
    var sum = document.createElement("summary");
    var h = document.createElement("span");
    h.className = "tm-acc__h";
    h.textContent = title;
    sum.appendChild(h);
    if (countLabel) {
      var c = document.createElement("span");
      c.className = "tm-acc__count";
      c.textContent = countLabel;
      sum.appendChild(c);
    }
    acc.appendChild(sum);
    var body = document.createElement("div");
    body.className = "tm-acc__body";
    body.appendChild(node);
    acc.appendChild(body);
    return acc;
  }

  function contentForStage(st) {
    var learn = learnFor(st.id);
    if (!learn || !learn.depth) {
      return { purpose: st.purpose, do: st.do, output: st.output, mistake: st.mistake };
    }
    var d = getDepth();
    var block = learn.depth[d] || learn.depth.basics;
    return {
      purpose: block.purpose || st.purpose,
      do: block.do || st.do,
      output: block.output || st.output,
      mistake: block.mistake || st.mistake
    };
  }

  function renderChips(host, learn) {
    var chips = learn && learn.chips;
    if (!chips) return;
    var acc = document.createElement("details");
    acc.className = "tm-acc";
    acc.setAttribute("data-section", "terms");
    var sum = document.createElement("summary");
    var h = document.createElement("span");
    h.className = "tm-acc__h";
    h.textContent = "Key terms";
    var count = document.createElement("span");
    count.className = "tm-acc__count";
    count.textContent = String(chips.length);
    sum.appendChild(h);
    sum.appendChild(count);
    acc.appendChild(sum);
    var body = document.createElement("div");
    body.className = "tm-acc__body";
    var hint = document.createElement("p");
    hint.className = "tm-chip-hint";
    hint.textContent = "Tap a chip for a plain-English card. Terms are introduced at the stage where they first appear.";
    body.appendChild(hint);
    var row = document.createElement("div");
    row.className = "tm-chips";
    row.setAttribute("role", "list");
    chips.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tm-chip-btn";
      b.setAttribute("role", "listitem");
      b.textContent = c.label;
      b.setAttribute("aria-label", c.label + " — open explainer");
      b.addEventListener("click", function () { openChipCard(c); });
      row.appendChild(b);
    });
    body.appendChild(row);
    acc.appendChild(body);
    host.appendChild(acc);
  }

  function renderQuiz(host, stageId, learn, opts) {
    var q = learn && learn.quiz;
    if (!q) return;
    opts = opts || {};
    var savedMap = loadQuizMap();
    var saved = savedMap[stageId] || {};
    var acc = document.createElement("details");
    acc.className = "tm-acc tm-quiz";
    acc.id = "tmQuizAcc";
    acc.setAttribute("data-section", "quiz");
    if (opts.open || saved.choice) acc.setAttribute("open", "");
    var sum = document.createElement("summary");
    var h = document.createElement("span");
    h.className = "tm-acc__h";
    h.textContent = "Quick check";
    var count = document.createElement("span");
    count.className = "tm-acc__count";
    count.textContent = saved.correct ? "Done" : (saved.choice ? "Tried" : "1 question");
    sum.appendChild(h);
    sum.appendChild(count);
    acc.appendChild(sum);
    var body = document.createElement("div");
    body.className = "tm-acc__body";
    var qp = document.createElement("p"); qp.className = "tm-quiz__q"; qp.textContent = q.question; body.appendChild(qp);
    var optsBox = document.createElement("div"); optsBox.className = "tm-quiz__opts";
    optsBox.setAttribute("role", "radiogroup"); optsBox.setAttribute("aria-label", q.question);
    var fb = document.createElement("p"); fb.className = "tm-quiz__fb"; fb.setAttribute("aria-live", "polite");
    q.options.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tm-quiz__opt";
      b.textContent = o.label;
      b.setAttribute("aria-pressed", saved.choice === o.id ? "true" : "false");
      if (saved.choice === o.id) {
        b.classList.add(o.correct ? "is-ok" : "is-bad");
        fb.textContent = o.feedback;
        fb.className = "tm-quiz__fb " + (o.correct ? "is-ok" : "is-bad");
      }
      b.addEventListener("click", function () {
        saveQuizAnswer(stageId, { choice: o.id, correct: !!o.correct });
        optsBox.querySelectorAll("button").forEach(function (x) {
          x.setAttribute("aria-pressed", "false");
          x.classList.remove("is-ok", "is-bad");
        });
        b.setAttribute("aria-pressed", "true");
        b.classList.add(o.correct ? "is-ok" : "is-bad");
        fb.textContent = o.feedback;
        fb.className = "tm-quiz__fb " + (o.correct ? "is-ok" : "is-bad");
        count.textContent = o.correct ? "Done" : "Tried";
        if (o.correct) markDone(stageId);
        updateQuizBadge();
        paintDone();
        renderDots();
      });
      optsBox.appendChild(b);
    });
    body.appendChild(optsBox);
    body.appendChild(fb);
    acc.appendChild(body);
    host.appendChild(acc);
  }

  function modalOpen() {
    return document.getElementById("back").classList.contains("on");
  }
  function chipOpen() {
    return document.getElementById("chipback").classList.contains("on");
  }

  function renderDots() {
    var host = document.getElementById("mDots");
    if (!host) return;
    host.textContent = "";
    stages.forEach(function (st) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = String(st.num);
      b.setAttribute("aria-label", "Stage " + st.num + ": " + st.title);
      if (st.id === activeId) b.setAttribute("aria-current", "true");
      if (isStageDone(st.id)) b.classList.add("is-done");
      b.addEventListener("click", function () { openStage(st.id, { keepOpen: true }); });
      li.appendChild(b);
      host.appendChild(li);
    });
  }

  function renderNav() {
    var host = document.getElementById("mNav");
    if (!host) return;
    host.textContent = "";
    var i = stageIndex(activeId);
    var prev = document.createElement("button");
    prev.type = "button";
    prev.id = "tmPrev";
    prev.textContent = "Previous";
    prev.disabled = i <= 0;
    prev.addEventListener("click", function () {
      if (i > 0) openStage(stages[i - 1].id, { fromNav: true });
    });
    var lab = document.createElement("span");
    lab.className = "mnav-label";
    lab.textContent = "Stage " + (i + 1) + " of " + stages.length;
    var next = document.createElement("button");
    next.type = "button";
    next.id = "tmNext";
    next.className = "mnav-next";
    if (i < stages.length - 1) {
      next.textContent = "Next";
      next.addEventListener("click", function () {
        markDone(activeId);
        openStage(stages[i + 1].id, { fromNav: true });
      });
    } else {
      next.textContent = "Start again";
      next.addEventListener("click", function () {
        markDone(activeId);
        openStage(stages[0].id, { fromNav: true });
      });
    }
    host.appendChild(prev);
    host.appendChild(lab);
    host.appendChild(next);
  }

  function fillStageModal(st, opts) {
    opts = opts || {};
    var learn = learnFor(st.id);
    var content = contentForStage(st);
    document.getElementById("mkind").textContent = "Stage " + st.num + " of " + stages.length;
    document.getElementById("mtitle").textContent = st.title;
    document.getElementById("msub").textContent = stageSubtitle(st);
    renderDots();
    renderNav();

    var body = document.getElementById("mbody");
    body.textContent = "";

    if (learn && learn.depth) {
      var depth = document.createElement("div");
      depth.className = "tm-depth";
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
        b.addEventListener("click", function () { setDepth(key); openStage(st.id, { noScroll: true, keepOpen: true }); });
        depth.appendChild(b);
      });
      body.appendChild(depth);
    }

    var pur = document.createElement("section");
    pur.className = "tm-sec";
    var ph = document.createElement("h3");
    ph.textContent = "What it is";
    pur.appendChild(ph);
    pur.appendChild(ptext(content.purpose));
    body.appendChild(pur);

    var doSec = document.createElement("section");
    doSec.className = "tm-sec";
    var doH = document.createElement("h3");
    doH.textContent = "What you do";
    doSec.appendChild(doH);
    doSec.appendChild(ptext(content.do));
    body.appendChild(doSec);

    body.appendChild(accSection("Typical output", null, ptext(content.output), { section: "output" }));
    body.appendChild(accSection("Common mistake", null, ptext(content.mistake), { section: "mistake" }));

    var nc = document.createElement("p");
    nc.className = "tm-ncsc";
    fillLinkified(nc, "NCSC coverage: " + (st.ncsc || (learn && learn.ncsc) || "See sources."));
    body.appendChild(accSection("NCSC coverage", null, nc, { section: "ncsc" }));

    if (learn) renderChips(body, learn);

    var links = document.createElement("div");
    links.className = "refs";
    var srcCount = (st.sources || []).length;
    var srcWrap = document.createElement("div");
    (st.sources || []).forEach(function (sid) {
      var row = document.createElement("div");
      row.appendChild(sourceLink(sid));
      var note = st.sourceNotes && st.sourceNotes[sid];
      if (note) {
        var em = document.createElement("div");
        em.className = "tm-src-note";
        fillLinkified(em, note);
        row.appendChild(em);
      }
      srcWrap.appendChild(row);
    });
    body.appendChild(accSection("Sources", String(srcCount), srcWrap, { section: "sources", open: !!opts.openSources }));

    if (learn) renderQuiz(body, st.id, learn, { open: !!opts.openQuiz });

    if (opts.openChipId) {
      var terms = body.querySelector('[data-section="terms"]');
      if (terms) terms.setAttribute("open", "");
      var chip = findChip(st.id, opts.openChipId);
      if (chip) setTimeout(function () { openChipCard(chip); }, 40);
    }

    if (!opts.noScroll) {
      var modal = document.getElementById("modal");
      if (modal) modal.scrollTop = 0;
    }
  }

  function openStage(id, opts) {
    opts = opts || {};
    var st = stageById(id);
    if (!st) return;
    var back = document.getElementById("back");
    var wasOpen = back.classList.contains("on");
    if (!wasOpen) lastFocus = document.activeElement;
    activeId = id;
    fillStageModal(st, opts);
    back.classList.add("on");
    paintDone();
    updateQuizBadge();
    syncUrl();
    if (!wasOpen) {
      var closer = document.getElementById("close");
      if (closer) closer.focus();
    }
  }

  function closeStage() {
    var back = document.getElementById("back");
    back.classList.remove("on");
    activeId = null;
    syncUrl();
    if (lastFocus && lastFocus.focus) {
      try { lastFocus.focus(); } catch (e) {}
    }
  }

  function openChipCard(chip) {
    var back = document.getElementById("chipback");
    chipLastFocus = document.activeElement;
    document.getElementById("chiptitle").textContent = chip.label;
    var body = document.getElementById("chipbody");
    body.textContent = "";
    function row(k, v) {
      if (!v) return;
      var s = document.createElement("section");
      var h = document.createElement("h3"); h.textContent = k; s.appendChild(h);
      var p = document.createElement("p"); fillLinkified(p, v); s.appendChild(p);
      body.appendChild(s);
    }
    row("What it is", chip.what);
    row("Everyday analogy", chip.analogy);
    row("Without it", chip.without);
    row("What good looks like", chip.good);
    function addSourceLink(title, link) {
      if (!link || !link.href) return;
      var s = document.createElement("section");
      var h = document.createElement("h3"); h.textContent = title; s.appendChild(h);
      s.appendChild(makeExtLink(link.href, link.label || "Source"));
      body.appendChild(s);
    }
    addSourceLink("NCSC / source", chip.link);
    if (chip.link2) addSourceLink("Further reading", chip.link2);
    back.classList.add("on");
    document.getElementById("chipmodal").scrollTop = 0;
    document.getElementById("chipclose").focus();
  }

  function closeChip() {
    document.getElementById("chipback").classList.remove("on");
    if (chipLastFocus && chipLastFocus.focus) {
      try { chipLastFocus.focus(); } catch (e) {}
    }
  }

  function showTab(name, opts) {
    opts = opts || {};
    currentTab = name;
    TABS.forEach(function (t) {
      var sel = t[2] === name;
      document.getElementById(t[0]).setAttribute("aria-selected", String(sel));
      document.getElementById(t[1]).hidden = !sel;
    });
    if (!modalOpen()) syncUrl();
    if (opts.openItem) {
      var item = document.querySelector('#tmWhatsNew [data-wn-title="' + opts.openItem.replace(/"/g, "") + '"]');
      if (item) {
        item.setAttribute("open", "");
        if (item.scrollIntoView) item.scrollIntoView({ block: "start" });
      }
    }
  }

  function syncUrl() {
    var hash = "#model";
    if (modalOpen() && activeId) hash = "#stage-" + activeId;
    else if (currentTab === "whatsnew") hash = "#whatsnew";
    else if (currentTab === "example") hash = "#example";
    else if (currentTab === "glossary") hash = "#glossary";
    if (location.hash !== hash && history.replaceState) history.replaceState(null, "", hash);
  }

  function fromHash() {
    var h = location.hash || "";
    var m = h.match(/^#stage-([a-z0-9-]+)$/);
    if (m && stageById(m[1])) { openStage(m[1], { noScroll: true }); return; }
    if (HASH[h]) showTab(HASH[h]);
  }

  function bindNav() {
    TABS.forEach(function (t) {
      document.getElementById(t[0]).addEventListener("click", function () {
        if (modalOpen()) closeStage();
        showTab(t[2]);
      });
    });
    var start = document.getElementById("tmStartTour");
    if (start) start.addEventListener("click", function () { openStage(stages[0].id); });
    document.getElementById("close").addEventListener("click", closeStage);
    document.getElementById("back").addEventListener("click", function (e) {
      if (e.target === document.getElementById("back") && !chipOpen()) closeStage();
    });
    document.getElementById("chipclose").addEventListener("click", closeChip);
    document.getElementById("chipback").addEventListener("click", function (e) {
      if (e.target === document.getElementById("chipback")) closeChip();
    });
    document.addEventListener("keydown", function (ev) {
      var tag = ev.target && ev.target.tagName;
      if (ev.key === "Escape") {
        if (chipOpen()) { ev.preventDefault(); closeChip(); return; }
        if (modalOpen()) { ev.preventDefault(); closeStage(); }
        return;
      }
      if (!modalOpen() || chipOpen()) return;
      if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      ev.preventDefault();
      var i = stageIndex(activeId);
      if (ev.key === "ArrowRight") {
        markDone(activeId);
        if (i < stages.length - 1) openStage(stages[i + 1].id, { fromNav: true });
        else openStage(stages[0].id, { fromNav: true });
      } else if (i > 0) {
        openStage(stages[i - 1].id, { fromNav: true });
      }
    });
    window.addEventListener("hashchange", fromHash);
  }

  renderDomains();
  renderLife();
  renderHighlights();
  renderWhatsNew();
  renderExample();
  fillGlossary(document.getElementById("tmGlossaryPage"));
  renderSourcesFooter();
  updateQuizBadge();
  paintDone();
  bindNav();

  var q = null, v = null;
  try {
    var params = new URLSearchParams(location.search);
    q = params.get("stage");
    v = params.get("view");
  } catch (e) {}
  if (q && stageById(q)) openStage(q, { noScroll: true });
  else if (v === "whatsnew" || v === "example" || v === "glossary") showTab(v);
  else fromHash();
})();
