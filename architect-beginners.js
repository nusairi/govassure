/* Beginner path: remember "mark as done" checkboxes on this device only. */
(function () {
  "use strict";
  var KEY = "ga-architect-beginners-progress";
  var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-beg-step]"));
  if (!boxes.length) return;

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (raw && typeof raw === "object") return raw;
    } catch (err) { /* ignore unreadable values */ }
    return {};
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (err) { /* ignore quota / private mode */ }
  }

  var data = load();
  var bar = document.getElementById("beg-progress-bar");
  var label = document.getElementById("beg-progress-status");

  function sync() {
    var done = 0;
    boxes.forEach(function (box) { if (box.checked) done += 1; });
    var total = boxes.length;
    var text = done + " of " + total + " steps marked as done";
    if (label) label.textContent = text;
    if (bar) {
      bar.value = done;
      bar.textContent = text;
    }
  }

  boxes.forEach(function (box) {
    var id = box.getAttribute("data-beg-step");
    if (data[id]) box.checked = true;
    box.addEventListener("change", function () {
      data[id] = box.checked;
      if (!box.checked) delete data[id];
      save(data);
      sync();
    });
  });
  sync();
})();
