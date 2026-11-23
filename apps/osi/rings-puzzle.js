"use strict";

(() => {
  const decks = [
    ["NIC firmware", "UEFI", "TPM 2.0", "SPDX/CycloneDX"],
    ["Fibre (BASE-SX/LX)", "5G NR", "DSL"],
    ["Ethernet 802.3", "802.1Q VLAN", "STP/RSTP"],
    ["IPv4", "IPv6", "OSPF"],
    ["TCP", "UDP", "QUIC"],
    ["Secure session tokens", "Timeouts & re-auth", "Session recording"],
    ["ASCII/UTF-8", "JPEG/PNG/GIF", "gzip"],
    ["HTTP/S", "DNS", "SMTP"],
    ["JML process", "ISO/IEC 27001", "Risk ownership"]
  ];
  const clueOverrides = {
    "NIC firmware": "Software built into a network adapter that controls how the hardware operates. It can be updated separately from the operating system.",
    QUIC: "QUIC sends several independent streams over one encrypted connection. It runs over UDP and powers HTTP/3."
  };
  const layerGuides = [
    "Chips, built-in software and the parts devices are made from",
    "Signals that travel through cables, fibre or the air",
    "Moving data between devices on the same local network",
    "Finding a route between different networks",
    "Delivering data between programs",
    "Starting, keeping or ending a conversation or login",
    "How data is formatted, compressed or encrypted",
    "Services used by apps, such as web and email",
    "People, responsibilities and organisational rules"
  ];
  const guessedRoles = [
    "components and built-in software",
    "how signals travel",
    "how nearby devices share a local network",
    "how traffic finds its way between networks",
    "how data gets delivered to the right program",
    "how an ongoing conversation is kept track of",
    "how information is represented or transformed",
    "services that apps use",
    "people, policies and responsibilities"
  ];
  const cardPrompts = {
    "NIC firmware": "Where would you put software built into the adapter itself?",
    UEFI: "What gets a computer ready before the operating system even starts?",
    "TPM 2.0": "Which ring covers a chip that can hold keys and record what started up?",
    "SPDX/CycloneDX": "The format is part of the clue. Which ring covers checking what goes into a device or product?",
    "Fibre (BASE-SX/LX)": "Focus on light moving through glass. Which ring covers how the signal travels?",
    "5G NR": "Focus on how the radio signal gets from a phone to a mast.",
    DSL: "Focus on how the signal travels over the telephone line.",
    "Ethernet 802.3": "Focus on frames and the addresses used to reach devices on the same local network.",
    "802.1Q VLAN": "Look for the ring where switches use tags on frames to keep local groups apart.",
    "STP/RSTP": "Look for the ring where switches cooperate to keep a local network free of loops.",
    IPv4: "Look for the ring that gets packets to an address on another network.",
    IPv6: "Focus on addresses that can be used to route traffic between networks.",
    OSPF: "Where do routers share information about which paths are available?",
    TCP: "Focus on who makes sure the pieces arrive in order at the receiving program.",
    UDP: "Focus on getting data to a program without waiting for delivery confirmation.",
    QUIC: "Focus on how several streams reach a program over one connection.",
    "Secure session tokens": "What lets a website recognise the same login on the next request?",
    "Timeouts & re-auth": "Focus on how long the current login stays valid and when a person must sign in again.",
    "Session recording": "Focus on what happens from the start to the end of an administrator’s connection.",
    "ASCII/UTF-8": "Which ring deals with turning letters and symbols into bytes?",
    "JPEG/PNG/GIF": "Focus on how the image itself is encoded so different programs can read it.",
    gzip: "Focus on how the information is transformed so it takes up less space.",
    "HTTP/S": "Think about the rules a browser and web server use to request and return a page.",
    DNS: "Focus on the service that looks up a name and returns an address.",
    SMTP: "Focus on the rules mail servers use to hand off messages.",
    "JML process": "Who decides what access changes when someone joins, changes role or leaves?",
    "ISO/IEC 27001": "Focus on how the organisation manages information security as a whole.",
    "Risk ownership": "Who is responsible for deciding what to do about a risk?"
  };
  const specificHints = {
    "NIC firmware": {
      1: "Good instinct: the adapter does send signals. This card is about the software built into the adapter. Which ring covers that?",
      2: "The adapter handles local network traffic. Focus on the built-in software that makes the adapter work."
    },
    "SPDX/CycloneDX": {
      6: "These are file formats, so that’s a reasonable guess. In this puzzle, focus on what the list helps you check: the parts a supplier included in a product.",
      8: "People decide what to do about supplier risks. This card is about the parts list they use to check what went into a product."
    },
    "Ethernet 802.3": {
      1: "Ethernet uses cables. This card focuses on how nearby devices address and package the information carried over the cable."
    },
    DNS: {
      3: "DNS returns an address that routing can use later. This card is about the name lookup service."
    },
    QUIC: {
      6: "QUIC encrypts its traffic. Focus on its job of delivering several streams of data independently.",
      7: "HTTP/3 uses QUIC. Look for the ring that handles delivery for the web protocol."
    },
    "Secure session tokens": {
      8: "People and policies decide who may sign in. Focus on how the system remembers a login after it has happened."
    }
  };
  const svgNS = "http://www.w3.org/2000/svg";
  const card = document.querySelector("#card");
  const title = document.querySelector("#card-title");
  const clue = document.querySelector("#clue");
  const feedback = document.querySelector("#feedback");
  const progress = document.querySelector("#progress");
  const roundProgress = document.querySelector("#round-progress");
  const teamScore = document.querySelector("#team-score");
  const roundScore = document.querySelector("#round-score");
  const next = document.querySelector("#next");
  const review = document.querySelector("#review");
  const matches = document.querySelector("#matches");
  const rings = document.querySelector("#rings");
  const layerList = document.querySelector("#layers");
  const targets = new Map();
  let missedLayer = null;
  const orderedLayers = [...LAYERS].reverse();
  let round = [];
  let current = null;
  let position = 0;
  const pointsByTry = [100, 75, 50];
  let score = 0;
  let wrongGuesses = 0;
  let matched = false;
  let dragging = false;
  let highlighted = null;

  function setHighlight(layer) {
    if (highlighted) {
      targets.get(highlighted.n).forEach(element => element.classList.remove("over"));
    }
    highlighted = layer;
    if (layer) {
      targets.get(layer.n).forEach(element => element.classList.add("over"));
    }
  }

  function clearMiss() {
    if (!missedLayer) return;
    const [ring, button] = targets.get(missedLayer.n);
    ring.classList.remove("miss");
    button.classList.remove("miss");
    button.nextElementSibling.textContent = "";
    missedLayer = null;
  }

  function addTargetEvents(element, layer) {
    element.addEventListener("pointerenter", () => {
      if (!dragging && current && !matched) setHighlight(layer);
    });
    element.addEventListener("pointerleave", () => {
      if (!dragging && highlighted === layer) setHighlight(null);
    });
    if (element.tagName === "BUTTON") {
      element.addEventListener("focus", () => {
        if (current && !matched) setHighlight(layer);
      });
      element.addEventListener("blur", () => {
        if (highlighted === layer) setHighlight(null);
      });
    }
    element.addEventListener("click", () => place(layer));
    element.addEventListener("dragover", event => {
      if (!dragging || matched) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setHighlight(layer);
    });
    element.addEventListener("dragleave", event => {
      if (highlighted === layer && !element.contains(event.relatedTarget)) setHighlight(null);
    });
    element.addEventListener("drop", event => {
      if (!dragging) return;
      event.preventDefault();
      dragging = false;
      setHighlight(null);
      place(layer);
    });
  }

  for (const layer of orderedLayers) {
    const radius = 148 - layer.n * 17;
    const ring = document.createElementNS(svgNS, "circle");
    ring.setAttribute("cx", "160");
    ring.setAttribute("cy", "160");
    ring.setAttribute("r", layer.n === 8 ? "18" : String(radius));
    ring.classList.add("ring");
    if (layer.n === 8) ring.classList.add("core");

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", "160");
    label.setAttribute("y", String(layer.n === 8 ? 160 : 160 - radius));
    label.classList.add("ring-label");
    label.textContent = layer.n;
    const marker = document.createElementNS(svgNS, "text");
    marker.setAttribute("x", "160");
    marker.setAttribute("y", String(layer.n === 8 ? 160 : 160 + radius));
    marker.classList.add("ring-marker");
    marker.textContent = "✓";
    rings.append(ring, label, marker);

    const lane = document.createElement("div");
    lane.className = "layer-lane";
    const hint = document.createElement("p");
    hint.className = "lane-hint";
    hint.setAttribute("aria-hidden", "true");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "layer-target";
    const number = document.createElement("span");
    number.className = "layer-number";
    number.textContent = layer.n;
    const text = document.createElement("span");
    const name = document.createElement("strong");
    const guide = document.createElement("span");
    name.textContent = layer.name;
    guide.className = "layer-guide";
    guide.id = `layer-guide-${layer.n}`;
    guide.textContent = layerGuides[layer.n];
    const result = document.createElement("span");
    result.className = "layer-result";
    text.append(name, guide);
    button.append(number, text, result);
    button.setAttribute("aria-describedby", guide.id);
    button.setAttribute("aria-label", `Layer ${layer.n}, ${layer.name}`);
    lane.append(button, hint);
    layerList.append(lane);

    targets.set(layer.n, [ring, button, marker]);
    for (const element of targets.get(layer.n)) {
      element.style.setProperty("--layer-colour", layer.colour);
      if (element !== marker) addTargetEvents(element, layer);
    }
  }

  function place(layer) {
    if (!current || matched) return;
    clearMiss();
    if (layer !== current.layer) {
      wrongGuesses++;
      missedLayer = layer;
      for (const element of targets.get(layer.n)) element.classList.add("miss");
      feedback.dataset.result = "retry";
      const guessContext = `${layer.name} covers ${guessedRoles[layer.n]}.`;
      const hint = `Hint: ${specificHints[current.name]?.[layer.n] || `${guessContext} ${cardPrompts[current.name]}`}`;
      targets.get(layer.n)[1].nextElementSibling.textContent = hint;
      feedback.textContent = hint;
      return;
    }

    matched = true;
    current.points = pointsByTry[Math.min(wrongGuesses, pointsByTry.length - 1)];
    score += current.points;
    teamScore.textContent = score;
    setHighlight(null);
    card.draggable = false;
    const [ring, button, marker] = targets.get(layer.n);
    ring.classList.add("matched");
    button.classList.add("matched");
    marker.classList.add("matched");
    button.querySelector(".layer-result").textContent = current.name;
    roundProgress.value = position + 1;
    progress.textContent = `${position + 1} of ${round.length} matched`;
    feedback.dataset.result = "correct";
    feedback.textContent = `Correct! +${current.points} points. ${current.name} goes in Layer ${layer.n}, ${layer.name}. ${layerGuides[layer.n]}.`;
    next.textContent = position === round.length - 1 ? "Review matches" : "Next card";
    next.hidden = false;
    next.focus();
  }

  function showCard() {
    current = round[position];
    wrongGuesses = 0;
    matched = false;
    card.hidden = false;
    card.draggable = true;
    next.hidden = true;
    delete feedback.dataset.result;
    feedback.textContent = "";
    progress.textContent = `Card ${position + 1} of ${round.length} · ${position} matched`;
    title.textContent = current.name;
    clue.textContent = clueOverrides[current.name] || window.HWCards.description(current.name);
  }

  function startRound(firstRound = false) {
    const previousHardware = round.find(item => item.layer.n === 0)?.name;
    round = orderedLayers.map(layer => {
      const choices = decks[layer.n].filter(name => name !== previousHardware);
      const name = firstRound && layer.n === 0
        ? "NIC firmware"
        : choices[Math.floor(Math.random() * choices.length)];
      return { name, layer };
    });
    for (let i = round.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [round[i], round[j]] = [round[j], round[i]];
    }

    position = 0;
    score = 0;
    teamScore.textContent = score;
    roundProgress.value = 0;
    dragging = false;
    setHighlight(null);
    clearMiss();
    for (const [ring, button, marker] of targets.values()) {
      ring.classList.remove("matched");
      button.classList.remove("matched");
      marker.classList.remove("matched");
      button.querySelector(".layer-result").textContent = "";
    }
    layerList.querySelectorAll("button").forEach(button => { button.disabled = false; });
    review.hidden = true;
    showCard();
  }

  function finishRound() {
    current = null;
    card.hidden = true;
    next.hidden = true;
    delete feedback.dataset.result;
    feedback.textContent = "";
    layerList.querySelectorAll("button").forEach(button => { button.disabled = true; });
    matches.replaceChildren();
    const firstTryMatches = round.filter(item => item.points === pointsByTry[0]).length;
    roundScore.textContent = `${score} / ${round.length * pointsByTry[0]} points · ${firstTryMatches} of ${round.length} cards matched on the first try`;
    for (const { name, layer, points } of [...round].sort((a, b) => a.layer.n - b.layer.n)) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = name;
      button.addEventListener("click", () => window.HWCards.openCard(name));
      item.append(button, ` · Layer ${layer.n}, ${layer.name} · +${points} pts`);
      matches.append(item);
    }
    review.hidden = false;
    document.querySelector("#review-title").focus();
  }

  title.addEventListener("click", () => {
    if (current) window.HWCards.openCard(current.name);
  });
  // Keep the title easy to tap while the rest of the card remains draggable.
  title.addEventListener("dragstart", event => event.preventDefault());
  card.addEventListener("dragstart", event => {
    if (event.defaultPrevented || !current || matched) {
      event.preventDefault();
      return;
    }
    dragging = true;
    event.dataTransfer.setData("text/plain", current.name);
    event.dataTransfer.effectAllowed = "move";
  });
  card.addEventListener("dragend", () => {
    dragging = false;
    setHighlight(null);
  });
  next.addEventListener("click", () => {
    position++;
    if (position === round.length) {
      finishRound();
      return;
    }
    showCard();
    title.focus();
  });
  document.querySelector("#restart").addEventListener("click", () => {
    startRound();
    title.focus();
  });
  startRound(true);
})();
