/* Runs before first paint to avoid a theme flash. */
(function () {
  var t = new URLSearchParams(location.search).get("theme");
  if (!t) { try { t = localStorage.getItem("osi-theme"); } catch (e) {} }
  if (t !== "dark" && t !== "light" && t !== "auto") t = "dark"; /* GOV Assured: hub dark by default */
  var r = document.documentElement;
  var prefersLight = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches;
  r.setAttribute("data-theme-pref", t);
  r.setAttribute("data-theme", t === "auto" ? (prefersLight ? "light" : "dark") : t);
})();
