(function () {
  "use strict";

  var CATEGORIES = [
    {
      id: "all",
      label: "All",
      blurb: ""
    },
    {
      id: "govassure",
      label: "GovAssure",
      blurb: "Assessments, governance submissions, scoping, and continuity plans."
    },
    {
      id: "cyberassure",
      label: "CyberAssure",
      blurb: "Architecture references and operating models."
    },
    {
      id: "other",
      label: "Practice and monitoring",
      tag: "Practice",
      blurb: "Quizzes, exercises, and reporting views."
    }
  ];

  var apps = [];
  var searchInput = document.getElementById("search");
  var filtersEl = document.getElementById("filters");
  var catalogEl = document.getElementById("catalog");
  var countEl = document.getElementById("result-count");
  var form = document.getElementById("search-form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    searchInput.focus();
  });

  fetch("data/apps.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load the app list (" + response.status + ").");
      return response.json();
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.apps)) throw new Error("The app list is not in the expected shape.");
      apps = data.apps.filter(isApp);
      renderFilters();
      applyFromUrl();
      searchInput.addEventListener("input", render);
      window.addEventListener("popstate", applyFromUrl);
      render();
    })
    .catch(function (error) {
      catalogEl.innerHTML = "";
      var p = document.createElement("p");
      p.className = "error";
      p.textContent = error.message + " Serve this folder over HTTP so data/apps.json can be read.";
      catalogEl.appendChild(p);
    });

  function isApp(app) {
    return app && app.name && app.description && app.url && categoryById(app.category);
  }

  function categoryById(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) return CATEGORIES[i];
    }
    return null;
  }

  function currentCategory() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("category") || "all";
    return categoryById(id) ? id : "all";
  }

  function applyFromUrl() {
    var params = new URLSearchParams(window.location.search);
    searchInput.value = params.get("q") || "";
    var active = currentCategory();
    var buttons = filtersEl.querySelectorAll(".filter");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", buttons[i].dataset.category === active ? "true" : "false");
    }
    render();
  }

  function renderFilters() {
    filtersEl.innerHTML = "";
    CATEGORIES.forEach(function (category) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "filter";
      button.dataset.category = category.id;
      button.setAttribute("aria-pressed", category.id === currentCategory() ? "true" : "false");
      var count = category.id === "all"
        ? apps.length
        : apps.filter(function (app) { return app.category === category.id; }).length;
      button.appendChild(document.createTextNode(category.label + " "));
      var countSpan = document.createElement("span");
      countSpan.className = "count";
      countSpan.textContent = "(" + count + ")";
      button.appendChild(countSpan);
      button.addEventListener("click", function () {
        var params = new URLSearchParams(window.location.search);
        if (category.id === "all") params.delete("category");
        else params.set("category", category.id);
        var query = params.toString();
        history.pushState(null, "", query ? "?" + query : window.location.pathname);
        applyFromUrl();
      });
      filtersEl.appendChild(button);
    });
  }

  function matches(app, query) {
    if (!query) return true;
    var category = categoryById(app.category);
    var haystack = [
      app.name,
      app.description,
      app.repo,
      app.language,
      category ? category.label : ""
    ].join(" ").toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function render() {
    if (!apps.length && !catalogEl.querySelector(".error")) return;
    var query = searchInput.value.trim().toLowerCase();
    var categoryId = currentCategory();
    var params = new URLSearchParams(window.location.search);
    if (query) params.set("q", searchInput.value.trim());
    else params.delete("q");
    var next = params.toString();
    var current = window.location.search.replace(/^\?/, "");
    if (next !== current) {
      history.replaceState(null, "", next ? "?" + next : window.location.pathname);
    }

    var visible = apps.filter(function (app) {
      if (categoryId !== "all" && app.category !== categoryId) return false;
      return matches(app, query);
    });

    var noun = visible.length === 1 ? "tool" : "tools";
    var category = categoryById(categoryId);
    var message = visible.length + " " + noun;
    if (categoryId !== "all") message += " in " + category.label;
    if (query) message += " matching “" + searchInput.value.trim() + "”";
    countEl.textContent = message + ".";

    catalogEl.innerHTML = "";
    if (!visible.length) {
      var empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No tools match that search. Clear the search or choose another category.";
      catalogEl.appendChild(empty);
      return;
    }

    var groups = categoryId === "all"
      ? CATEGORIES.filter(function (item) { return item.id !== "all"; })
      : [category];

    groups.forEach(function (group) {
      var items = visible.filter(function (app) { return app.category === group.id; });
      if (!items.length) return;
      catalogEl.appendChild(renderGroup(group, items));
    });
  }

  function renderGroup(group, items) {
    var section = document.createElement("section");
    section.className = "group";
    section.setAttribute("aria-labelledby", "group-" + group.id);

    var head = document.createElement("div");
    head.className = "group-head";

    var titles = document.createElement("div");
    var heading = document.createElement("h3");
    heading.id = "group-" + group.id;
    heading.textContent = group.label;
    titles.appendChild(heading);
    if (group.blurb) {
      var blurb = document.createElement("p");
      blurb.textContent = group.blurb;
      titles.appendChild(blurb);
    }
    head.appendChild(titles);

    var count = document.createElement("p");
    count.className = "group-count";
    count.textContent = items.length + (items.length === 1 ? " tool" : " tools");
    head.appendChild(count);
    section.appendChild(head);

    var list = document.createElement("ul");
    list.className = "grid";
    items.forEach(function (app) {
      var item = document.createElement("li");
      item.appendChild(renderCard(app));
      list.appendChild(item);
    });
    section.appendChild(list);
    return section;
  }

  function renderCard(app) {
    var article = document.createElement("article");
    article.className = "card";

    var top = document.createElement("div");
    top.className = "card-top";
    var heading = document.createElement("h4");
    heading.textContent = app.name;
    top.appendChild(heading);

    var category = categoryById(app.category);
    var tag = document.createElement("span");
    tag.className = "tag tag-" + app.category;
    tag.textContent = category.tag || category.label;
    top.appendChild(tag);
    article.appendChild(top);

    var description = document.createElement("p");
    description.className = "description";
    description.textContent = app.description;
    article.appendChild(description);

    if (app.language) {
      var meta = document.createElement("p");
      meta.className = "meta";
      var language = document.createElement("span");
      language.textContent = app.language;
      meta.appendChild(language);
      article.appendChild(meta);
    }

    var actions = document.createElement("div");
    actions.className = "actions";
    actions.appendChild(link(app.url, "Open tool", app.name));
    article.appendChild(actions);
    return article;
  }

  function link(href, label, name) {
    var anchor = document.createElement("a");
    anchor.className = "btn btn-primary";
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.appendChild(document.createTextNode(label));
    var extra = document.createElement("span");
    extra.className = "visually-hidden";
    extra.textContent = ": " + name + " (opens in a new tab)";
    anchor.appendChild(extra);
    return anchor;
  }
})();
