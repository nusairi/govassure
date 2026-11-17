/* "Guard the building" workshop game. Plain English, team scoring, keyboard/clicker and touch.
   Saved only in this browser (localStorage). All text is written with textContent. */
(function () {
  "use strict";
  var G = window.GAME_DATA, MS = window.MS_TOOLS, OT = window.OUR_TOOLS;
  if (!G || !MS) return;
  var KEY = "ga-osi-game-v1";
  var $ = function (id) { return document.getElementById(id); };
  var LAYER = {}; G.layers.forEach(function (l) { LAYER[String(l.n)] = l; });
  var COLOUR = {};
  if (typeof LAYERS !== "undefined") LAYERS.forEach(function (l) { COLOUR[String(l.n)] = l.colour; });
  COLOUR.x = "#8B94A8";
  var DEFAULT_NAMES = ["Red team", "Blue team", "Green team", "Gold team", "Purple team", "Orange team"];
  var TEAM_COLOURS = ["#FF6B6B", "#5B9BFF", "#3CC48A", "#F2C14E", "#B48CFF", "#F07A3E"];
  var LETTERS = ["A", "B", "C", "D", "E", "F"];
  var PTS = { r1: { full: 2, near: 1 }, r2: { full: 2 } };

  /* ---------- state ---------- */
  function fresh(prev) {
    return {
      v: 1, teams: prev ? prev.teams : DEFAULT_NAMES.slice(), nTeams: prev ? prev.nTeams : 4,
      perRound: prev ? prev.perRound : 8, timer: prev ? prev.timer : 0, useOurs: prev ? !!prev.useOurs : false,
      step: 0, revealed: {}, skipped: {}, awards: {}, accepted: [], bonus: [0, 0, 0, 0, 0, 0]
    };
  }
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!o || o.v !== 1) return fresh();
      var s = fresh();
      if (Array.isArray(o.teams)) s.teams = DEFAULT_NAMES.map(function (d, i) { return typeof o.teams[i] === "string" && o.teams[i].trim() ? o.teams[i].slice(0, 40) : d; });
      s.nTeams = Math.min(6, Math.max(2, +o.nTeams || 4));
      s.perRound = [6, 8, 10, G.scenarios.length].indexOf(+o.perRound) >= 0 ? +o.perRound : 8;
      s.timer = [0, 30, 60, 90].indexOf(+o.timer) >= 0 ? +o.timer : 0;
      s.useOurs = !!o.useOurs;
      if (Array.isArray(o.accepted)) s.accepted = o.accepted.filter(function (a) { return a && typeof a.k === "string" && typeof a.tool === "string" && a.tool.trim(); }).slice(0, 500).map(function (a) { return { k: a.k.slice(0, 40), t: Math.max(0, Math.min(5, +a.t || 0)), tool: a.tool.slice(0, 120), pts: Math.max(0, Math.min(5, +a.pts || 2)) }; });
      s.step = Math.max(0, +o.step || 0);
      s.lastStep = Math.max(0, +o.lastStep || 0);
      ["revealed", "skipped", "awards"].forEach(function (k) { if (o[k] && typeof o[k] === "object") s[k] = o[k]; });
      if (Array.isArray(o.bonus)) s.bonus = s.bonus.map(function (b, i) { return +o.bonus[i] || 0; });
      return s;
    } catch (e) { return fresh(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  var S = load();

  /* ---------- steps ---------- */
  function scen() { return G.scenarios.slice(0, Math.min(S.perRound, G.scenarios.length)); }
  function steps() {
    var a = [{ k: "title" }, { k: "intro1" }];
    scen().forEach(function (s, i) { a.push({ k: "card", r: "r1", s: s, i: i }); });
    a.push({ k: "score", after: 1 }, { k: "intro2" });
    scen().forEach(function (s, i) { a.push({ k: "card", r: "r2", s: s, i: i }); });
    a.push({ k: "final" }, { k: "tools" });
    return a;
  }
  var STEPS = steps();
  function cur() { S.step = Math.max(0, Math.min(S.step, STEPS.length - 1)); return STEPS[S.step]; }
  function cardKey(st) { return st.r + ":" + st.s.id; }

  /* ---------- scoring ---------- */
  function teamTotal(t) {
    var sum = S.bonus[t] || 0;
    Object.keys(S.awards).forEach(function (k) { var a = S.awards[k]; if (a && a[t]) sum += +a[t] || 0; });
    S.accepted.forEach(function (a) { if (a.t === t) sum += a.pts; });
    return sum;
  }
  function award(key, t, pts) {
    if (t >= S.nTeams) return;
    var a = S.awards[key] || (S.awards[key] = {});
    if (a[t] === pts) delete a[t]; else a[t] = pts;
    save(); render();
  }
  function ranking() {
    var r = []; for (var i = 0; i < S.nTeams; i++) r.push({ i: i, name: S.teams[i], pts: teamTotal(i) });
    return r.sort(function (a, b) { return b.pts - a.pts || a.i - b.i; });
  }

  /* ---------- helpers ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k]; if (v == null || v === false) return;
      if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function ico(s) { return el("span", { class: "g-ico", "aria-hidden": "true", text: s }); }
  function layerLabel(n) { var l = LAYER[String(n)]; return (n === "x" ? "All layers" : "L" + n) + " · " + l.simple; }
  function toolName(id) { return id === "other" ? G.other.name : MS.byId[id].name; }
  /* show options in a fixed but varied order so the right answer is not always A */
  function optionOrder(s, i) { var o = s.options.slice(), k = i % o.length; return o.slice(k).concat(o.slice(0, k)); }
  /* "Use our tools too": up to two of Our tools that cover this scenario's floor (or a next-door floor) */
  function ourOptions(s) {
    if (!S.useOurs || !OT) return [];
    var want = [s.layer].concat(s.near), out = [];
    want.forEach(function (n) { OT.forLayer(n).forEach(function (t) { if (out.length < 2 && out.indexOf(t) < 0) out.push(t); }); });
    return out;
  }
  function namedTools() {
    var seen = {}, out = [];
    S.accepted.forEach(function (a) {
      var k = a.tool.trim().toLowerCase(); if (!k) return;
      var sc = G.scenarios.filter(function (x) { return "r2:" + x.id === a.k || "r1:" + x.id === a.k; })[0];
      if (!seen[k]) { seen[k] = { name: a.tool.trim(), layers: [], cards: [] }; out.push(seen[k]); }
      if (sc) { if (seen[k].layers.indexOf(sc.layer) < 0) seen[k].layers.push(sc.layer); if (seen[k].cards.indexOf(sc.title) < 0) seen[k].cards.push(sc.title); }
    });
    return out;
  }
  function coverageExtra() {
    var ex = [], have = {};
    if (OT) OT.list().forEach(function (t) { have[OT.label(t).toLowerCase()] = 1; have[t.name.toLowerCase()] = 1; ex.push({ name: OT.label(t), layers: t.layers, note: "added by you" }); });
    namedTools().forEach(function (t) { if (!have[t.name.toLowerCase()]) ex.push({ name: t.name, layers: t.layers, note: "named in the game" }); });
    return ex;
  }

  /* ---------- screens ---------- */
  function screenTitle(box) {
    box.appendChild(el("div", { class: "g-hero" }, [
      el("p", { class: "g-kicker", text: "Workshop game" }),
      el("h1", { class: "g-title", text: "Guard the building" }),
      el("p", { class: "g-sub", text: "Think of IT security as a building with nine floors, from the bricks to the people inside. Teams match everyday problems to the right floor, then pick the guard (the tool) that protects it." })
    ]));
    var setup = el("section", { class: "g-setup", "aria-labelledby": "gSetupH" }, [el("h2", { id: "gSetupH", text: "Set up" })]);
    var nt = el("div", { class: "g-seg", role: "group", "aria-label": "Number of teams" }, [el("span", { class: "g-seg__l", text: "Teams" })]);
    [2, 3, 4, 5, 6].forEach(function (n) { nt.appendChild(el("button", { type: "button", "data-teams": n, "aria-pressed": String(S.nTeams === n), text: String(n) })); });
    setup.appendChild(nt);
    var names = el("div", { class: "g-names" });
    for (var i = 0; i < S.nTeams; i++) {
      var id = "gTeam" + i;
      var w = el("div", { class: "g-name" }, [el("label", { for: id, text: "Team " + (i + 1) + " name" }), el("input", { id: id, type: "text", maxlength: "40", "data-team": i, autocomplete: "off" })]);
      w.style.setProperty("--t", TEAM_COLOURS[i]);
      w.querySelector("input").value = S.teams[i];
      names.appendChild(w);
    }
    setup.appendChild(names);
    var pr = el("div", { class: "g-seg", role: "group", "aria-label": "Cards per round" }, [el("span", { class: "g-seg__l", text: "Cards per round" })]);
    [6, 8, 10, G.scenarios.length].forEach(function (n) { pr.appendChild(el("button", { type: "button", "data-per": n, "aria-pressed": String(S.perRound === n), text: n === G.scenarios.length ? "All " + n : String(n) })); });
    setup.appendChild(pr);
    var tm = el("div", { class: "g-seg", role: "group", "aria-label": "Timer per card" }, [el("span", { class: "g-seg__l", text: "Timer" })]);
    [0, 30, 60, 90].forEach(function (n) { tm.appendChild(el("button", { type: "button", "data-timer": n, "aria-pressed": String(S.timer === n), text: n ? n + "s" : "Off" })); });
    setup.appendChild(tm);
    var nOurs = OT ? OT.list().length : 0;
    var uo = el("div", { class: "g-seg", role: "group", "aria-label": "Use our tools too" }, [el("span", { class: "g-seg__l", text: "Our tools" })]);
    uo.appendChild(el("button", { type: "button", "data-ours": "0", "aria-pressed": String(!S.useOurs), text: "Microsoft starter set only" }));
    uo.appendChild(el("button", { type: "button", "data-ours": "1", "aria-pressed": String(!!S.useOurs), text: "Use our tools too" }));
    uo.appendChild(el("span", { class: "g-seg__note" }, nOurs ? [nOurs + " of Our tools saved in this browser. In round 2 they appear as extra choices for the floors they cover."] : ["No Our tools saved yet. ", el("a", { href: "/matrix/tools#our", text: "Add them on the tool list" }), " (any vendor)."]));
    setup.appendChild(uo);
    var played = Object.keys(S.awards).length || Object.keys(S.revealed).length;
    setup.appendChild(el("div", { class: "g-go" }, [
      el("button", { type: "button", class: "btn mx-primary g-big", id: "gStart", text: played ? "Carry on" : "Start the game" }),
      played ? el("button", { type: "button", class: "btn g-big", id: "gNew", text: "New game (reset scores)" }) : null,
      el("a", { class: "btn g-big", href: "/matrix/tools", text: "Skip to the tool list" })
    ]));
    setup.appendChild(el("p", { class: "g-save", text: "Team names and scores are saved only in this browser. Nothing is uploaded." }));
    box.appendChild(setup);
  }
  function building(box, highlight) {
    var ul = el("ol", { class: "g-building", "aria-label": "The nine floors of the building" });
    G.layers.filter(function (l) { return l.n !== "x"; }).forEach(function (l) {
      var li = el("li", { class: "g-floor" + (highlight && highlight === String(l.n) ? " is-on" : "") }, [
        ico(l.icon), el("b", { text: "L" + l.n }), el("span", { class: "g-floor__n", text: l.simple }), el("span", { class: "g-floor__l", text: l.like })
      ]);
      li.style.setProperty("--c", COLOUR[String(l.n)]);
      ul.appendChild(li);
    });
    var cr = LAYER.x;
    var x = el("p", { class: "g-cross" }, [ico(cr.icon), el("b", { text: "Plus: " + cr.simple + "." }), " " + cr.like + "."]);
    box.appendChild(ul); box.appendChild(x);
  }
  function screenIntro(box, r) {
    if (r === 1) {
      box.appendChild(el("div", { class: "g-intro" }, [
        el("p", { class: "g-kicker", text: "Round 1" }),
        el("h2", { class: "g-h", text: "Where does it belong?" }),
        el("p", { class: "g-sub", text: "Each card is something that goes wrong. Teams agree which floor of the building it happens on. Spot on: 2 points. Next door (a nearby floor that also makes sense): 1 point." })
      ]));
      building(box);
    } else {
      box.appendChild(el("div", { class: "g-intro" }, [
        el("p", { class: "g-kicker", text: "Round 2" }),
        el("h2", { class: "g-h", text: "Who’s the guard?" }),
        el("p", { class: "g-sub", text: "Same problems, new question: which tool protects against it, or spots it happening? Choose from A to D (plus your own tools if they are switched on). Right answer: 2 points. Name a different tool that also does the job, from any vendor, and the facilitator can accept it. Sometimes the answer is not software at all." })
      ]));
      var fam = el("ul", { class: "g-fams" });
      MS.families.forEach(function (f) { fam.appendChild(el("li", null, [ico(f.icon), el("b", { text: f.name }), el("span", { text: f.plain })])); });
      box.appendChild(fam);
    }
  }
  function scenarioCard(st) {
    var s = st.s;
    return el("article", { class: "g-card" }, [
      el("div", { class: "g-card__ico", "aria-hidden": "true", text: s.icon }),
      el("div", null, [
        el("p", { class: "g-card__n", text: (st.r === "r1" ? "Round 1 · " : "Round 2 · ") + "Card " + (st.i + 1) + " of " + scen().length }),
        el("h2", { class: "g-card__t", id: "gCardTitle", text: s.title }),
        el("p", { class: "g-card__s", text: s.story })
      ])
    ]);
  }
  function awardStrip(st) {
    var key = cardKey(st), a = S.awards[key] || {};
    var wrap = el("div", { class: "g-award", role: "group", "aria-label": "Give points" }, [el("span", { class: "g-award__l", text: "Which teams got it?" })]);
    for (var t = 0; t < S.nTeams; t++) {
      var team = el("div", { class: "g-award__t" });
      team.style.setProperty("--t", TEAM_COLOURS[t]);
      team.appendChild(el("span", { class: "g-award__name", text: (t + 1) + ". " + S.teams[t] }));
      team.appendChild(el("button", { type: "button", class: "g-pt", "data-award": t, "data-pts": PTS[st.r].full, "aria-pressed": String(a[t] === PTS[st.r].full), text: (st.r === "r1" ? "Spot on +" : "Right +") + PTS[st.r].full }));
      if (st.r === "r1") team.appendChild(el("button", { type: "button", class: "g-pt g-pt--near", "data-award": t, "data-pts": PTS.r1.near, "aria-pressed": String(a[t] === PTS.r1.near), text: "Next door +1" }));
      wrap.appendChild(team);
    }
    return wrap;
  }
  function screenCard(box, st) {
    var key = cardKey(st), shown = !!S.revealed[key], s = st.s;
    box.appendChild(scenarioCard(st));
    if (st.r === "r1") {
      box.appendChild(el("p", { class: "g-q", text: shown ? "The answer" : "Which floor is this?" }));
      var grid = el("ol", { class: "g-grid g-grid--layers" });
      G.layers.forEach(function (l) {
        var n = l.n, cls = "g-opt";
        if (shown) cls += n === s.layer ? " is-right" : (s.near.indexOf(n) >= 0 ? " is-near" : " is-dim");
        var li = el("li", { class: cls }, [ico(l.icon), el("b", { text: n === "x" ? "All" : "L" + n }), el("span", { class: "g-opt__n", text: l.simple })]);
        li.style.setProperty("--c", COLOUR[String(n)]);
        if (shown && n === s.layer) li.appendChild(el("span", { class: "g-badge", text: "Spot on" }));
        else if (shown && s.near.indexOf(n) >= 0) li.appendChild(el("span", { class: "g-badge g-badge--near", text: "Next door" }));
        grid.appendChild(li);
      });
      box.appendChild(grid);
      if (shown) box.appendChild(el("p", { class: "g-why", id: "gWhy" }, [el("b", { text: layerLabel(s.layer) + ". " }), s.whyLayer]));
    } else {
      box.appendChild(el("p", { class: "g-q", text: shown ? "The answer" : "Who’s the guard?" }));
      var g2 = el("ol", { class: "g-grid g-grid--tools" });
      optionOrder(s, st.i).forEach(function (id, j) {
        var right = s.tool.indexOf(id) >= 0;
        var t = id === "other" ? G.other : MS.byId[id];
        var li = el("li", { class: "g-opt g-tool" + (shown ? (right ? " is-right" : " is-dim") : "") }, [
          el("span", { class: "g-letter", text: LETTERS[j] }),
          el("span", { class: "g-tool__n", text: t.name }),
          el("span", { class: "g-tool__p", text: id === "other" ? G.other.plain : t.tag })
        ]);
        if (shown && right) li.appendChild(el("span", { class: "g-badge", text: "Right" }));
        g2.appendChild(li);
      });
      ourOptions(s).forEach(function (t, j) {
        var li = el("li", { class: "g-opt g-tool g-ours" + (shown ? " is-ours" : "") }, [
          el("span", { class: "g-letter", text: LETTERS[s.options.length + j] }),
          el("span", { class: "g-tool__n", text: OT.label(t) }),
          el("span", { class: "g-tool__p", text: "one of our tools" + (t.plain ? " · " + t.plain : "") })
        ]);
        if (shown) li.appendChild(el("span", { class: "g-badge g-badge--ours", text: "Your call" }));
        g2.appendChild(li);
      });
      box.appendChild(g2);
      if (shown) {
        var also = s.tool.filter(function (id) { return s.options.indexOf(id) < 0; }).map(toolName);
        box.appendChild(el("p", { class: "g-why", id: "gWhy" }, [s.whyTool, also.length ? el("span", { class: "g-also", text: " Also helps: " + also.join(", ") + "." }) : null]));
      }
    }
    if (shown) box.appendChild(awardStrip(st));
    if (shown && st.r === "r2") box.appendChild(acceptPanel(st));
    else if (S.skipped[key]) box.appendChild(el("p", { class: "g-hint", text: "Skipped. Press R to reveal anyway." }));
    else box.appendChild(el("p", { class: "g-hint", text: "Talk it over in your team, then press Reveal (R)." }));
  }
  var acceptOpen = false, acceptTeam = 0;
  function toolNameList() {
    var names = [];
    if (OT) OT.list().forEach(function (t) { names.push(OT.label(t)); });
    MS.tools.forEach(function (t) { names.push(t.name); });
    if (OT) OT.suggestions.forEach(function (t) { names.push(t.name); });
    return names.filter(function (n, i) { return names.indexOf(n) === i; });
  }
  function acceptPanel(st) {
    var key = cardKey(st);
    var wrap = el("div", { class: "g-accept", id: "gAccept" });
    var mine = S.accepted.map(function (a, i) { return { a: a, i: i }; }).filter(function (x) { return x.a.k === key; });
    if (mine.length) {
      var ul = el("ul", { class: "g-accepted", "aria-label": "Other tools accepted for this card" });
      mine.forEach(function (x) {
        var li = el("li", null, [el("b", { text: S.teams[x.a.t] || "Team " + (x.a.t + 1) }), " named " + x.a.tool + " (+" + x.a.pts + ") ",
          el("button", { type: "button", class: "g-x", "data-unaccept": x.i, "aria-label": "Undo: " + x.a.tool + " for " + (S.teams[x.a.t] || "team"), text: "×" })]);
        li.style.setProperty("--t", TEAM_COLOURS[x.a.t]);
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    }
    if (!acceptOpen) {
      wrap.appendChild(el("button", { type: "button", class: "btn g-acc-open", id: "gAccOpen", text: "Accept another tool (A)" }));
      return wrap;
    }
    var teams = el("div", { class: "g-acc-teams", role: "group", "aria-label": "Which team named it?" }, [el("span", { class: "g-award__l", text: "Which team?" })]);
    for (var t = 0; t < S.nTeams; t++) {
      var b = el("button", { type: "button", class: "g-pt", "data-accteam": t, "aria-pressed": String(acceptTeam === t), text: (t + 1) + ". " + S.teams[t] });
      b.style.setProperty("--t", TEAM_COLOURS[t]);
      teams.appendChild(b);
    }
    var dl = el("datalist", { id: "gToolNames" });
    toolNameList().forEach(function (n) { dl.appendChild(el("option", { value: n })); });
    var inp = el("input", { id: "gAccName", type: "text", list: "gToolNames", maxlength: "120", autocomplete: "off", placeholder: "Type the tool they named, any vendor" });
    wrap.appendChild(el("div", { class: "g-acc-form" }, [
      teams,
      el("div", { class: "g-acc-row" }, [
        el("label", { for: "gAccName", class: "g-award__l", text: "Tool named" }), inp, dl,
        el("button", { type: "button", class: "btn mx-primary", id: "gAccOk", text: "Accept +2" }),
        el("button", { type: "button", class: "btn", id: "gAccCancel", text: "Cancel" })
      ]),
      el("p", { class: "g-acc-err", id: "gAccErr", role: "alert" })
    ]));
    return wrap;
  }
  function acceptSubmit() {
    var st = cur(), i = $("gAccName"); if (!i || st.k !== "card") return;
    var name = i.value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 120);
    if (!name) { $("gAccErr").textContent = "Type the tool’s name first."; i.focus(); return; }
    S.accepted.push({ k: cardKey(st), t: Math.min(acceptTeam, S.nTeams - 1), tool: name, pts: PTS.r2.full });
    acceptOpen = false; save(); render();
    var o = $("gAccOpen"); if (o) o.focus();
  }
  function openAccept() {
    var st = cur(); if (st.k !== "card" || st.r !== "r2" || !S.revealed[cardKey(st)]) return;
    acceptOpen = true; render(); var i = $("gAccName"); if (i) i.focus();
  }
  function scoreboard(box, big) {
    var r = ranking(), top = r.length ? r[0].pts : 0, max = Math.max(1, top);
    var ol = el("ol", { class: "g-scores" + (big ? " g-scores--big" : "") });
    r.forEach(function (t, place) {
      var bar = el("span", { class: "g-bar__fill" }); bar.style.width = Math.round(100 * Math.max(0, t.pts) / max) + "%";
      var li = el("li", { class: "g-score" + (t.pts === top && top > 0 ? " is-lead" : "") }, [
        el("span", { class: "g-score__place", text: String(place + 1) }),
        el("span", { class: "g-score__name", text: t.name }),
        el("span", { class: "g-bar__track" }, [bar]),
        el("b", { class: "g-score__pts", text: t.pts + " pt" + (t.pts === 1 ? "" : "s") }),
        el("span", { class: "g-bonus" }, [
          el("button", { type: "button", "data-bonus": t.i, "data-d": "-1", "aria-label": "Take a point from " + t.name, text: "−1" }),
          el("button", { type: "button", "data-bonus": t.i, "data-d": "1", "aria-label": "Give a bonus point to " + t.name, text: "+1" })
        ])
      ]);
      li.style.setProperty("--t", TEAM_COLOURS[t.i]);
      ol.appendChild(li);
    });
    box.appendChild(ol);
  }
  function screenScore(box) {
    box.appendChild(el("div", { class: "g-intro" }, [el("p", { class: "g-kicker", text: "Half time" }), el("h2", { class: "g-h", text: "Scores after round 1" })]));
    scoreboard(box, true);
  }
  function screenFinal(box) {
    var r = ranking(), top = r.length ? r[0].pts : 0;
    var winners = r.filter(function (t) { return t.pts === top; }).map(function (t) { return t.name; });
    box.appendChild(el("div", { class: "g-intro g-win" }, [
      el("p", { class: "g-kicker", text: "Final scores" }),
      el("h2", { class: "g-h", text: top > 0 ? (winners.length > 1 ? "It’s a tie: " + winners.join(" and ") + "!" : winners[0] + " win!") : "Final scores" }),
      el("p", { class: "g-sub", text: "Next: the cheat sheet. Which tool covers which floor of the building." })
    ]));
    scoreboard(box, true);
    var named = namedTools();
    var sec = el("section", { class: "g-named", "aria-labelledby": "gNamedH" }, [el("h3", { id: "gNamedH", text: "Tools the room named" })]);
    if (!named.length) sec.appendChild(el("p", { class: "g-hint", text: "None yet. In round 2, use “Accept another tool” when a team names a different tool that also does the job." }));
    else {
      var ul = el("ul", { class: "g-named__list" });
      named.forEach(function (t, i) {
        var inOurs = OT && OT.has({ name: t.name, vendor: "" });
        ul.appendChild(el("li", null, [el("b", { text: t.name }), el("span", { class: "g-named__for", text: " for: " + t.cards.join(", ") }),
          OT ? el("button", { type: "button", class: "btn g-named__add", "data-addnamed": i, disabled: inOurs, text: inOurs ? "✓ In Our tools" : "Save to Our tools" }) : null]));
      });
      sec.appendChild(ul);
    }
    box.appendChild(sec);
  }
  function screenTools(box) {
    box.appendChild(el("div", { class: "g-intro" }, [
      el("p", { class: "g-kicker", text: "Take-away" }),
      el("h2", { class: "g-h", text: "Which tool covers what" }),
      el("p", { class: "g-sub", text: "Which tools protect each floor, in plain words: the Microsoft starter set, plus Our tools and the tools the room named. Organisations use different mixes, vendors and licences, so this is a starting point, not a list of what anyone has." }),
      el("p", { class: "g-go" }, [el("button", { type: "button", class: "btn mx-primary g-big", id: "gPrintTools", text: "Print the handout" }), el("a", { class: "btn g-big", href: "/matrix/tools", text: "Open as its own page" }), el("a", { class: "btn g-big", href: "/matrix", text: "Fill in our matrix" })])
    ]));
    var c = el("div", { class: "g-cover" }); MS.renderCoverage(c, coverageExtra()); box.appendChild(c);
    var ours = oursBlock(); if (ours) box.appendChild(ours);
    box.appendChild(el("h3", { class: "ms-h2", text: "Built-in starter set: Microsoft tools" }));
    var t = el("div", { class: "g-tooltable" }); MS.renderTable(t); box.appendChild(t);
  }

  function oursBlock() {
    var list = OT ? OT.list() : [], named = namedTools();
    if (!list.length && !named.length) return null;
    var sec = el("section", { class: "g-ours-sec" }, [el("h3", { class: "ms-h2", text: "Our tools and tools the room named" })]);
    var t = el("table", { class: "ms-table" });
    t.appendChild(el("thead", null, [el("tr", null, [el("th", { scope: "col", text: "Tool" }), el("th", { scope: "col", text: "What it does, in plain words" }), el("th", { scope: "col", text: "Layers" })])]));
    var tb = el("tbody");
    function row(name, note, plain, layers) {
      var chips = el("div", { class: "ms-chips" }); layers.forEach(function (n) { chips.appendChild(MS.layerChip(n)); });
      tb.appendChild(el("tr", null, [el("th", { scope: "row" }, [el("b", { text: name }), el("span", { class: "ms-tag", text: note })]), el("td", { text: plain || "—" }), el("td", null, [chips])]));
    }
    list.forEach(function (x) { row(OT.label(x), "added by you", x.plain, x.layers); });
    named.forEach(function (x) { if (!(OT && OT.has({ name: x.name, vendor: "" }))) row(x.name, "named in the game", "Named for: " + x.cards.join(", "), x.layers); });
    t.appendChild(tb); sec.appendChild(t);
    return sec;
  }

  /* ---------- render ---------- */
  function mini() {
    var ol = $("gMini"); ol.textContent = "";
    for (var i = 0; i < S.nTeams; i++) {
      var li = el("li", null, [el("span", { class: "g-mini__n", text: S.teams[i] }), el("b", { text: String(teamTotal(i)) })]);
      li.style.setProperty("--t", TEAM_COLOURS[i]);
      ol.appendChild(li);
    }
  }
  function render() {
    var st = cur(), box = $("gScreen");
    box.textContent = "";
    box.className = "g-screen g-screen--" + st.k;
    var where = { title: "Guard the building", intro1: "Round 1", intro2: "Round 2", score: "Half time", final: "Final", tools: "Tool list" }[st.k];
    if (st.k === "card") where = (st.r === "r1" ? "Round 1 · " : "Round 2 · ") + (st.i + 1) + "/" + scen().length;
    $("gWhere").textContent = where;
    if (st.k === "title") screenTitle(box);
    else if (st.k === "intro1") screenIntro(box, 1);
    else if (st.k === "intro2") screenIntro(box, 2);
    else if (st.k === "card") screenCard(box, st);
    else if (st.k === "score") screenScore(box);
    else if (st.k === "final") screenFinal(box);
    else screenTools(box);
    var isCard = st.k === "card", shown = isCard && S.revealed[cardKey(st)];
    $("gSkip").hidden = !isCard;
    $("gPrev").disabled = S.step === 0;
    $("gNext").disabled = S.step === STEPS.length - 1;
    $("gNext").textContent = isCard && !shown ? "Reveal →" : "Next →";
    $("gMini").hidden = st.k === "title";
    mini();
    document.body.classList.toggle("g-on-title", st.k === "title");
    renderPrint();
  }
  function go(i) {
    var before = S.step;
    if (i !== before) acceptOpen = false;
    S.step = Math.max(0, Math.min(STEPS.length - 1, i));
    save(); render();
    if (S.step !== before) { startTimer(); var s = $("gStage"); if (s.scrollIntoView && window.scrollY > s.offsetTop) s.scrollIntoView(); }
  }
  function reveal() {
    var st = cur(); if (st.k !== "card") return;
    S.revealed[cardKey(st)] = true; stopTimer(); save(); render();
    var w = $("gWhy"); if (w) w.setAttribute("tabindex", "-1");
  }
  function next() {
    var st = cur();
    if (st.k === "card" && !S.revealed[cardKey(st)]) { reveal(); return; }
    go(S.step + 1);
  }
  function prev() { go(S.step - 1); }
  function home() { if (S.step > 0) S.lastStep = S.step; go(0); }
  function skip() {
    var st = cur(); if (st.k !== "card") return;
    if (!S.revealed[cardKey(st)]) S.skipped[cardKey(st)] = true;
    go(S.step + 1);
  }

  /* ---------- timer (not saved) ---------- */
  var tLeft = 0, tId = 0, tRun = false;
  function paintTimer() {
    var t = $("gTimer");
    if (!S.timer || cur().k !== "card") { t.hidden = true; return; }
    t.hidden = false;
    t.textContent = (tLeft <= 0 ? "Time’s up!" : "⏱ " + tLeft + "s") + (tRun || tLeft <= 0 ? "" : " (paused, T)");
    t.classList.toggle("is-up", tLeft <= 0);
    t.classList.toggle("is-low", tLeft > 0 && tLeft <= 10);
  }
  function stopTimer() { clearInterval(tId); tRun = false; paintTimer(); }
  function startTimer() {
    clearInterval(tId); tRun = false;
    var st = cur();
    if (!S.timer || st.k !== "card" || S.revealed[cardKey(st)]) { tLeft = S.timer; paintTimer(); return; }
    tLeft = S.timer; tRun = true;
    tId = setInterval(function () { tLeft--; if (tLeft <= 0) { tLeft = 0; stopTimer(); } paintTimer(); }, 1000);
    paintTimer();
  }
  function toggleTimer() {
    if (!S.timer || cur().k !== "card") return;
    if (tRun) { clearInterval(tId); tRun = false; paintTimer(); return; }
    if (tLeft <= 0) tLeft = S.timer;
    tRun = true; tId = setInterval(function () { tLeft--; if (tLeft <= 0) { tLeft = 0; stopTimer(); } paintTimer(); }, 1000);
    paintTimer();
  }

  /* ---------- print: the tool list handout ---------- */
  function renderPrint() {
    var p = $("gPrintView"); if (!p) return;
    p.textContent = "";
    p.appendChild(el("h2", { text: "Which tool covers what" }));
    p.appendChild(el("p", { class: "g-pr-sub", text: "Tools that protect each OSI layer, in plain words: Microsoft starter set, plus Our tools and tools named in the game · osi.govassured.com/matrix/tools" }));
    var c = el("div"); MS.renderCoverage(c, coverageExtra()); p.appendChild(c);
    var o = oursBlock(); if (o) p.appendChild(o);
    p.appendChild(el("h3", { class: "ms-h2", text: "Built-in starter set: Microsoft tools" }));
    var t = el("div"); MS.renderTable(t); p.appendChild(t);
    p.appendChild(el("p", { class: "g-pr-foot", text: "Organisations use different mixes and licences: a starting point for discussion. GOV Assured is a community project and is not a government website" }));
  }

  /* ---------- events ---------- */
  function fullScreen() {
    var s = $("gStage");
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    else if (s.requestFullscreen) s.requestFullscreen().catch(function () {});
  }
  function bind() {
    $("gNext").addEventListener("click", next);
    $("gPrev").addEventListener("click", prev);
    $("gSkip").addEventListener("click", skip);
    $("gFull").addEventListener("click", fullScreen);
    $("gHome").addEventListener("click", home);
    var box = $("gScreen");
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.id === "gStart") { go(S.lastStep > 0 ? S.lastStep : 1); return; }
      if (b.id === "gNew") { if (!confirm("Start a new game? Scores will be reset; team names are kept.")) return; S = fresh(S); S.lastStep = 0; STEPS = steps(); save(); go(1); return; }
      if (b.id === "gPrintTools") { window.print(); return; }
      if (b.hasAttribute("data-teams")) { S.nTeams = +b.getAttribute("data-teams"); save(); render(); return; }
      if (b.hasAttribute("data-per")) { S.perRound = +b.getAttribute("data-per"); STEPS = steps(); save(); render(); return; }
      if (b.hasAttribute("data-timer")) { S.timer = +b.getAttribute("data-timer"); save(); render(); return; }
      if (b.hasAttribute("data-ours")) { S.useOurs = b.getAttribute("data-ours") === "1"; save(); render(); return; }
      if (b.id === "gAccOpen") { openAccept(); return; }
      if (b.id === "gAccCancel") { acceptOpen = false; render(); var o = $("gAccOpen"); if (o) o.focus(); return; }
      if (b.id === "gAccOk") { acceptSubmit(); return; }
      if (b.hasAttribute("data-accteam")) { acceptTeam = +b.getAttribute("data-accteam"); box.querySelectorAll("[data-accteam]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); var ii = $("gAccName"); if (ii) ii.focus(); return; }
      if (b.hasAttribute("data-unaccept")) { S.accepted.splice(+b.getAttribute("data-unaccept"), 1); save(); render(); return; }
      if (b.hasAttribute("data-addnamed") && OT) { var nt = namedTools()[+b.getAttribute("data-addnamed")]; if (nt) { OT.add({ name: nt.name, vendor: "", plain: "", layers: nt.layers }); render(); } return; }
      if (b.hasAttribute("data-award")) { award(cardKey(cur()), +b.getAttribute("data-award"), +b.getAttribute("data-pts")); return; }
      if (b.hasAttribute("data-bonus")) { var t = +b.getAttribute("data-bonus"); S.bonus[t] = (S.bonus[t] || 0) + (+b.getAttribute("data-d")); save(); render(); return; }
    });
    box.addEventListener("input", function (e) {
      var t = e.target; if (!t.hasAttribute("data-team")) return;
      var i = +t.getAttribute("data-team"); S.teams[i] = t.value.slice(0, 40) || DEFAULT_NAMES[i]; save(); mini();
    });
    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (e.target.id === "gAccName") {
        if (e.key === "Enter") { e.preventDefault(); acceptSubmit(); }
        else if (e.key === "Escape") { e.preventDefault(); acceptOpen = false; render(); }
        return;
      }
      if (tag === "input" || tag === "textarea" || tag === "select" || e.altKey || e.ctrlKey || e.metaKey) return;
      var onBtn = tag === "button" || tag === "a";
      var k = e.key;
      if (k === "ArrowRight" || k === "PageDown" || ((k === " " || k === "Enter") && !onBtn)) { e.preventDefault(); next(); }
      else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); prev(); }
      else if (k === "r" || k === "R") { reveal(); }
      else if (k === "s" || k === "S") { skip(); }
      else if (k === "t" || k === "T") { toggleTimer(); }
      else if (k === "f" || k === "F") { fullScreen(); }
      else if (k === "a" || k === "A") { e.preventDefault(); openAccept(); }
      else if (k === "Home") { e.preventDefault(); home(); }
      else if (k === "End") { e.preventDefault(); go(STEPS.length - 1); }
      else if (/^[1-6]$/.test(k) || /^Digit[1-6]$/.test(e.code)) {
        var st = cur(); if (st.k !== "card" || !S.revealed[cardKey(st)]) return;
        var t = (/^[1-6]$/.test(k) ? +k : +e.code.slice(5)) - 1;
        award(cardKey(st), t, e.shiftKey && st.r === "r1" ? PTS.r1.near : PTS[st.r].full);
      }
    });
    /* touch: swipe left for next, right for back */
    var x0 = null, y0 = null;
    $("gScreen").addEventListener("touchstart", function (e) { if (e.touches.length === 1) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; } }, { passive: true });
    $("gScreen").addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy)) { if (dx < 0) next(); else prev(); }
    }, { passive: true });
  }

  (function initTheme() {
    function apply(t) {
      if (t !== "dark" && t !== "light" && t !== "auto") t = "dark";
      try { localStorage.setItem("osi-theme", t); } catch (e) {}
      var r = document.documentElement, light = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches;
      r.setAttribute("data-theme-pref", t); r.setAttribute("data-theme", t === "auto" ? (light ? "light" : "dark") : t);
      var seg = $("themeSeg"); if (seg) seg.querySelectorAll("button[data-set]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set") === t)); });
    }
    var p = "dark"; try { p = localStorage.getItem("osi-theme") || "dark"; } catch (e) {}
    apply(p);
    var seg = $("themeSeg"); if (seg) seg.addEventListener("click", function (ev) { var b = ev.target.closest("button[data-set]"); if (b) apply(b.getAttribute("data-set")); });
  })();
  bind();
  if (OT) OT.onChange(function () { render(); });
  render();
  startTimer();
})();
