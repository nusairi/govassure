/* GOV Assured "Sources" note (shared by all apps; copied by brand/theme/apply.py).
   External reference links are taken out of headers, navs, buttons and body text and listed
   once in a compact "Sources" section at the foot of the page. Allowed links stay: govassured.com,
   the GOV Assured LinkedIn page, the GOV Assured GitHub repo, mailto/tel and in-site links.
   Live-data links that ARE the app's content stay where they are: containers listed in the
   script's data-keep attribute (CSS selector list) or marked with [data-ga-keep]. */
(function () {
  "use strict";
  var me = document.currentScript;
  var keep = ((me && me.getAttribute("data-keep")) || "").trim();
  var keepSel = "[data-ga-keep],#ga-sources" + (keep ? "," + keep : "");
  var OK = /^(mailto:|tel:|javascript:|#|\/(?!\/)|\.|https?:\/\/([a-z0-9-]+\.)*govassured\.com(?=[\/?#:]|$)|https:\/\/www\.linkedin\.com\/company\/102617034\/?$|https:\/\/github\.com\/nusairi\/govassure\/?$)/i;
  var GENERIC = /^(here|link|this|website|site|source|read more|more|learn more|view|open|guidance|click here)$/i;
  var box, list, last = "";

  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; } }
  function label(a, href) {
    var t = (a.textContent || "").replace(/\s+/g, " ").trim();
    if (!t) t = (a.getAttribute("aria-label") || a.getAttribute("title") || "").trim();
    if (!t || GENERIC.test(t) || /^(https?:\/\/|www\.)/i.test(t) || t.length > 90) t = host(href);
    return t.replace(/\s*[↗→]\s*$/, "");
  }
  function isControl(a) {
    if (a.closest("header,nav,[role=banner],[role=navigation],.ga-brandbar")) return true;
    var c = (a.className && a.className.baseVal !== undefined ? a.className.baseVal : a.className) || "";
    return /(^|[\s_-])(btn|button|cta|chip|pill)([\s_-]|$)/i.test(c) || a.getAttribute("role") === "button";
  }
  function ensureBox() {
    if (box && box.isConnected) return;
    box = document.getElementById("ga-sources");
    if (!box) {
      box = document.createElement("aside");
      box.id = "ga-sources"; box.className = "ga-sources"; box.hidden = true;
      box.setAttribute("aria-labelledby", "ga-sources-h");
      box.innerHTML = '<h2 class="ga-sources__h" id="ga-sources-h">Sources</h2><ul class="ga-sources__list"></ul>';
      var li = document.querySelector("body > p.ga-linkedin");
      if (li) document.body.insertBefore(box, li); else document.body.appendChild(box);
    }
    list = box.querySelector("ul");
  }
  function run() {
    if (!document.body) return;
    var links = document.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var a = links[i], href = a.getAttribute("href") || "";
      if (!/^(https?:)?\/\//i.test(href) || OK.test(href) || a.closest(keepSel)) continue;
      a.setAttribute("data-ga-src", a.href);
      if (!a.getAttribute("data-ga-label")) a.setAttribute("data-ga-label", label(a, a.href));
      a.removeAttribute("href"); a.removeAttribute("target"); a.removeAttribute("rel");
      a.classList.add("ga-delinked");
      if (isControl(a)) a.setAttribute("hidden", "");
    }
    var seen = {}, items = [];
    var moved = document.querySelectorAll("[data-ga-src]");
    for (var j = 0; j < moved.length; j++) {
      var u = moved[j].getAttribute("data-ga-src");
      var lb = moved[j].getAttribute("data-ga-label") || host(u), lk = "L:" + lb.toLowerCase();
      if (moved[j].closest("#ga-sources") || seen[u] || seen[lk]) continue;
      seen[u] = 1; seen[lk] = 1; items.push([u, lb]);
    }
    var sig = JSON.stringify(items);
    ensureBox();
    if (sig === last && list.children.length === items.length) return;
    last = sig; list.textContent = "";
    items.forEach(function (it) {
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = it[0]; a.rel = "noopener"; a.target = "_blank"; a.textContent = it[1];
      var h = host(it[0]); li.appendChild(a);
      if (it[1].toLowerCase().indexOf(h.toLowerCase()) < 0) { var s = document.createElement("span"); s.className = "ga-sources__host"; s.textContent = h; li.appendChild(s); }
      list.appendChild(li);
    });
    box.hidden = items.length === 0;
  }
  var t = 0;
  function soon() { if (!t) t = setTimeout(function () { t = 0; run(); }, 60); }
  function start() {
    run();
    new MutationObserver(soon).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    window.addEventListener("load", soon);
  }
  // Framework apps (Next.js, VitePress) hydrate the server HTML: wait until that is done before touching the DOM.
  var hydrates = !!document.querySelector('script[src*="/_next/"],#__next,#app,script[type=module][src*="/assets/"]');
  function later() { setTimeout(start, 400); }
  if (hydrates) { if (document.readyState === "complete") later(); else window.addEventListener("load", later); }
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
