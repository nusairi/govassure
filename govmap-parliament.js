/* GOV Assured — bodies accountable to Parliament. Text via textContent.
   External links are built from /data/parliament.json and opened in a new tab. */
(function () {
  "use strict";
  var mount = document.getElementById("gm-parliament");
  if (!mount) return;
  var credit = document.getElementById("gm-credit");
  var HOSTS = {
    "www.nao.org.uk": 1, "www.ombudsman.org.uk": 1, "www.electoralcommission.org.uk": 1,
    "www.theipsa.org.uk": 1, "www.lgbce.org.uk": 1, "www.gov.uk": 1,
    "assets.publishing.service.gov.uk": 1, "publications.parliament.uk": 1,
    "www.parliament.uk": 1, "www.nationalarchives.gov.uk": 1,
    "www.parliament.scot": 1, "www.audit.wales": 1, "www.legislation.gov.uk": 1
  };

  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }
  function safeHref(u, host) {
    if (typeof u !== "string") return null;
    try {
      var p = new URL(u);
      if (p.protocol !== "https:" || p.username || p.password || p.port) return null;
      if (host && p.hostname !== host) return null;
      if (!HOSTS[p.hostname]) return null;
      return p.href;
    } catch (e) { return null; }
  }
  function extLink(spec, extra) {
    if (!spec) return null;
    var href = safeHref(spec.url, spec.host);
    if (!href) return null;
    var a = make("a", null, spec.label);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.appendChild(make("span", "visually-hidden", (extra || " Source") + " (opens in a new tab)"));
    return a;
  }
  function moneyM(n) {
    if (n == null || !isFinite(n)) return "Figure missing";
    return (n < 0 ? "\u2212" : "") + "\u00a3" + Math.abs(n).toFixed(3) + " million";
  }

  function render(data) {
    mount.textContent = "";
    var banner = make("div", "gm-parl-banner");
    banner.appendChild(make("p", "gm-parl-kicker", "Outside government"));
    banner.appendChild(make("p", null, data.intro));
    mount.appendChild(banner);

    var list = make("ul", "gm-parl-list");
    (data.bodies || []).forEach(function (b) {
      var li = make("li", "gm-parl-card");
      li.id = b.id;
      var h = make("h2", "gm-parl-name", b.name);
      if (b.abbreviation) h.appendChild(make("span", "gm-parl-ab", b.abbreviation));
      li.appendChild(h);
      if (b.also) li.appendChild(make("p", "gm-parl-fn", b.also));
      li.appendChild(make("p", "gm-parl-role", b.role));
      var acc = make("p", "gm-parl-acc");
      acc.appendChild(make("span", "gm-parl-acc-l", "Accountable to"));
      acc.appendChild(document.createTextNode(b.accountableTo));
      li.appendChild(acc);
      if (b.accountableToNote) li.appendChild(make("p", "gm-parl-fn", b.accountableToNote));
      var bud = make("p", "gm-parl-budget");
      bud.appendChild(make("span", "gm-parl-bud-l", "2026-27 Total DEL"));
      bud.appendChild(make("span", "gm-parl-del", moneyM(b.totalDelMillion)));
      li.appendChild(bud);
      var split = [];
      if (b.rdelMillion != null) split.push("Resource DEL " + moneyM(b.rdelMillion));
      if (b.cdelMillion != null) split.push("capital DEL " + moneyM(b.cdelMillion));
      if (split.length) li.appendChild(make("p", "gm-parl-fn", split.join(", ") + (b.rdelNote ? ". " + b.rdelNote : ".")));
      if (b.note) li.appendChild(make("p", "gm-parl-fn", b.note));
      if (b.unattachedOnMap) {
        li.appendChild(make("p", "gm-parl-fn", "GOV.UK also lists this body without a parent department, so it appears in the map’s “not attached” group. That is the same organisation, not a second body."));
      }
      var links = make("ul", "gm-parl-links");
      var off = extLink(b.official, " Official site");
      if (off) { var o = make("li"); o.appendChild(off); links.appendChild(o); }
      var gk = extLink(b.govuk, "");
      if (gk) { var g = make("li"); g.appendChild(gk); links.appendChild(g); }
      (b.sources || []).forEach(function (s) {
        var a = extLink(s, " Source");
        if (!a) return;
        var item = make("li");
        item.appendChild(a);
        links.appendChild(item);
      });
      if (links.childNodes.length) li.appendChild(links);
      list.appendChild(li);
    });
    mount.appendChild(list);

    var dev = data.devolved || {};
    var box = make("section", "gm-parl-dev");
    box.id = "devolved";
    box.appendChild(make("h2", null, "Accountable to a devolved legislature"));
    box.appendChild(make("p", null, dev.intro));
    var ul = make("ul");
    (dev.bodies || []).forEach(function (d) {
      var li = make("li");
      var strong = make("strong", null, d.name);
      li.appendChild(strong);
      if (d.abbreviation) li.appendChild(document.createTextNode(" (" + d.abbreviation + ")"));
      li.appendChild(document.createTextNode(" — accountable to " + d.accountableTo + ". " + d.figure));
      if (d.also) li.appendChild(document.createTextNode(" " + d.also));
      var src = extLink(d.source, " Source");
      if (src) { li.appendChild(document.createTextNode(" ")); li.appendChild(src); }
      ul.appendChild(li);
    });
    box.appendChild(ul);
    mount.appendChild(box);

    if (credit && data.licences) {
      credit.textContent = "";
      data.licences.forEach(function (lic, i) {
        if (i) credit.appendChild(document.createTextNode(" "));
        var a = extLink(lic, "");
        if (a) credit.appendChild(a);
        else credit.appendChild(document.createTextNode(lic.label));
      });
    }
  }

  fetch("/data/parliament.json", { credentials: "same-origin" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () {
      mount.appendChild(make("p", "error", "This page could not load the list of bodies accountable to Parliament."));
    });
})();
