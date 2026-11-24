/* Beginner path: progress checkboxes, overview status, and animation pause/play. */
(function () {
  "use strict";
  var KEY = "ga-architect-beginners-progress";
  var STEPS = ["step-1", "step-2", "step-3", "step-4", "step-5", "step-6", "step-7"];

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
  var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-beg-step]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-beg-card]"));
  var bar = document.getElementById("beg-progress-bar");
  var label = document.getElementById("beg-progress-status");

  function doneCount() {
    var n = 0;
    STEPS.forEach(function (id) { if (data[id]) n += 1; });
    return n;
  }

  function sync() {
    var done = doneCount();
    var total = STEPS.length;
    var text = done + " of " + total + " steps marked as done";
    if (label) label.textContent = text;
    if (bar) {
      bar.value = done;
      bar.max = total;
      bar.textContent = text;
    }
    cards.forEach(function (card) {
      var id = card.getAttribute("data-beg-card");
      var isDone = !!data[id];
      card.classList.toggle("is-done", isDone);
      var status = card.querySelector(".beg-step-card-status");
      if (status) status.textContent = isDone ? "Done" : "Not started";
    });
  }

  boxes.forEach(function (box) {
    var id = box.getAttribute("data-beg-step");
    if (data[id]) box.checked = true;
    box.addEventListener("change", function () {
      if (box.checked) data[id] = true;
      else delete data[id];
      save(data);
      sync();
    });
  });
  sync();
})();

(function () {
  "use strict";
  var figures = Array.prototype.slice.call(document.querySelectorAll(".beg-anim"));
  if (!figures.length) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setPlaying(figure, playing) {
    figure.classList.toggle("is-paused", !playing);
    figure.classList.toggle("is-playing", playing);
    var btn = figure.querySelector("[data-beg-anim-toggle]");
    if (!btn) return;
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    btn.setAttribute("aria-label", playing ? "Pause animation" : "Play animation");
    btn.textContent = playing ? "Pause" : "Play";
  }

  figures.forEach(function (figure) {
    setPlaying(figure, !reduce);
    var btn = figure.querySelector("[data-beg-anim-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      setPlaying(figure, figure.classList.contains("is-paused"));
    });
  });
})();
