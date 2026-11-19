/* Security Architect Corner: progressive accordion for the lifecycle map.
   Without JavaScript every phase stays open and readable. */
(function () {
  "use strict";
  var acc = document.getElementById("arch-acc");
  if (!acc) return;
  var sections = Array.prototype.slice.call(acc.querySelectorAll(".arch-acc-section"));
  var buttons = [];

  function setOpen(btn, open) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (panel) panel.hidden = !open;
    btn.parentNode.parentNode.classList.toggle("is-open", open);
  }

  function syncAll() {
    var allOpen = buttons.every(function (b) { return b.getAttribute("aria-expanded") === "true"; });
    toggleAll.setAttribute("aria-expanded", allOpen ? "true" : "false");
    toggleAll.textContent = allOpen ? "Hide all phases" : "Show all phases";
  }

  sections.forEach(function (sec) {
    var h = sec.querySelector(".arch-acc-heading");
    var panel = sec.querySelector(".arch-acc-content");
    if (!h || !panel) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "arch-acc-btn";
    btn.setAttribute("aria-controls", panel.id);
    while (h.firstChild) btn.appendChild(h.firstChild);
    var icon = document.createElement("span");
    icon.className = "arch-acc-icon";
    icon.setAttribute("aria-hidden", "true");
    btn.appendChild(icon);
    h.appendChild(btn);
    btn.addEventListener("click", function () {
      setOpen(btn, btn.getAttribute("aria-expanded") !== "true");
      syncAll();
    });
    buttons.push(btn);
    setOpen(btn, false);
  });

  var bar = document.createElement("div");
  bar.className = "arch-acc-controls";
  var toggleAll = document.createElement("button");
  toggleAll.type = "button";
  toggleAll.className = "btn btn-quiet arch-acc-all";
  toggleAll.addEventListener("click", function () {
    var open = toggleAll.getAttribute("aria-expanded") !== "true";
    buttons.forEach(function (b) { setOpen(b, open); });
    syncAll();
  });
  bar.appendChild(toggleAll);
  acc.parentNode.insertBefore(bar, acc);
  acc.classList.add("is-enhanced");
  syncAll();

  function openFromHash(focus) {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!/^stage-[a-z]+$/.test(id)) return;
    var sec = document.getElementById(id);
    if (!sec) return;
    var btn = sec.querySelector(".arch-acc-btn");
    if (!btn) return;
    setOpen(btn, true);
    syncAll();
    if (focus) btn.focus({ preventScroll: true });
    sec.scrollIntoView({ block: "start" });
  }
  window.addEventListener("hashchange", function () { openFromHash(true); });
  openFromHash(false);
})();
