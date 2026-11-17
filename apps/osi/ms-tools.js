/* Built-in starter set: Microsoft security tools commonly used to protect each OSI ring, in plain words.
   Users add any other vendor's tools as "Our tools" (our-tools.js).
   Shared by the protection matrix (/matrix), the workshop game (/matrix/game) and the
   handout (/matrix/tools). Generic: "commonly used", no claims about any organisation.
   Every link is an official Microsoft Learn page, checked to return 200. */
(function () {
  "use strict";
  var L = "https://learn.microsoft.com/en-us/";
  var FAMILIES = [
    { id: "watch", name: "Watch and respond", icon: "📡", plain: "The control room: sees alerts from everywhere and acts on them." },
    { id: "identity", name: "Identity and sign-in", icon: "🪪", plain: "Who you are and what you are allowed into." },
    { id: "device", name: "Devices", icon: "💻", plain: "Laptops, phones and servers: keeping them healthy and watched." },
    { id: "email", name: "Email and apps", icon: "📧", plain: "Email, cloud apps and websites people use every day." },
    { id: "data", name: "Information", icon: "🏷️", plain: "The documents and data themselves, wherever they go." },
    { id: "network", name: "Network and cloud", icon: "🛣️", plain: "The roads into and between systems in Azure and the office." },
    { id: "hardware", name: "Hardware and start-up", icon: "🧱", plain: "The chips and firmware that start the device safely." }
  ];
  var TOOLS = [
    { id: "sentinel", name: "Microsoft Sentinel", tag: "SIEM and SOAR", family: "watch", layers: ["x"],
      plain: "The CCTV control room. Collects logs and alerts from every layer, spots patterns and can run automatic responses (playbooks).",
      url: L + "azure/sentinel/overview", more: [{ label: "Automation and playbooks (SOAR)", url: L + "azure/sentinel/automation/automation" }] },
    { id: "xdr", name: "Microsoft Defender XDR", tag: "joined-up detection", family: "watch", layers: ["x"],
      plain: "Joins the Defender alerts from email, devices, identities and apps into one incident, so the team sees the whole story.",
      url: L + "defender-xdr/microsoft-365-defender" },
    { id: "exposure", name: "Microsoft Secure Score and Exposure Management", tag: "posture", family: "watch", layers: ["x"],
      plain: "A health score and to-do list: shows weak spots and how an attacker could chain them, and what to fix first.",
      url: L + "security-exposure-management/microsoft-security-exposure-management", more: [{ label: "Microsoft Secure Score", url: L + "defender-xdr/microsoft-secure-score" }] },
    { id: "entra-ca", name: "Entra ID Conditional Access", tag: "access rules", family: "identity", layers: [5],
      plain: "The bouncer at the door. Checks who you are, where you are and which device you use before letting you in.",
      url: L + "entra/identity/conditional-access/overview", more: [{ label: "What is Microsoft Entra?", url: L + "entra/fundamentals/what-is-entra" }] },
    { id: "entra-mfa", name: "Entra ID multifactor authentication (MFA)", tag: "second check", family: "identity", layers: [5],
      plain: "A second check on top of the password, like a code or an app prompt, so a stolen password is not enough.",
      url: L + "entra/identity/authentication/concept-mfa-howitworks" },
    { id: "entra-pim", name: "Entra Privileged Identity Management (PIM)", tag: "admin rights on loan", family: "identity", layers: [5, 8],
      plain: "Admin keys on loan. Admin rights only when needed, for a short time, with approval and a record.",
      url: L + "entra/id-governance/privileged-identity-management/pim-configure" },
    { id: "entra-idp", name: "Entra ID Protection", tag: "risky sign-ins", family: "identity", layers: [5],
      plain: "Spots risky sign-ins and leaked passwords, and asks for extra checks or blocks them.",
      url: L + "entra/id-protection/overview-identity-protection" },
    { id: "hello", name: "Windows Hello for Business", tag: "passwordless", family: "identity", layers: [5, 0],
      plain: "Face, fingerprint or PIN tied to the device instead of a password that can be phished.",
      url: L + "windows/security/identity-protection/hello-for-business/" },
    { id: "mdi", name: "Microsoft Defender for Identity", tag: "on-premises sign-in", family: "identity", layers: [5, 7],
      plain: "Watches the office sign-in system (Active Directory) for stolen passwords and attackers moving around.",
      url: L + "defender-for-identity/what-is" },
    { id: "mde", name: "Microsoft Defender for Endpoint", tag: "EDR", family: "device", layers: [7, 0, 3],
      plain: "A security guard on every laptop and server. Spots malware and odd behaviour, can isolate a device, and can block USB sticks.",
      url: L + "defender-endpoint/microsoft-defender-endpoint", more: [{ label: "Device control (USB and removable media)", url: L + "defender-endpoint/device-control-overview" }, { label: "Attack surface reduction rules", url: L + "defender-endpoint/attack-surface-reduction-rules-overview" }] },
    { id: "intune", name: "Microsoft Intune", tag: "device management", family: "device", layers: [0, 7],
      plain: "Sets the house rules for every laptop and phone: encryption on, updates on, and wipe it if it is lost.",
      url: L + "intune/intune-service/fundamentals/what-is-intune" },
    { id: "autopatch", name: "Windows Autopatch and Windows Update", tag: "patching", family: "device", layers: [7, 0],
      plain: "Keeps Windows and Office updated automatically, in waves, so fixes arrive without anyone chasing them.",
      url: L + "windows/deployment/windows-autopatch/overview/windows-autopatch-overview", more: [{ label: "Windows Update client policies", url: L + "windows/deployment/update/windows-update-client-policies" }] },
    { id: "mdvm", name: "Microsoft Defender Vulnerability Management", tag: "find missing patches", family: "device", layers: [7, 0],
      plain: "Finds missing patches and weak settings across devices and ranks what to fix first.",
      url: L + "defender-vulnerability-management/defender-vulnerability-management" },
    { id: "mdo", name: "Microsoft Defender for Office 365", tag: "email protection", family: "email", layers: [7, 8],
      plain: "The post room scanner. Checks emails, links and attachments for phishing and malware, and runs phishing practice for staff.",
      url: L + "defender-office-365/mdo-about", more: [{ label: "Email authentication (SPF, DKIM, DMARC)", url: L + "defender-office-365/email-authentication-about" }, { label: "Attack simulation training", url: L + "defender-office-365/attack-simulation-training-get-started" }] },
    { id: "mdca", name: "Microsoft Defender for Cloud Apps", tag: "CASB", family: "email", layers: [7],
      plain: "Sees which cloud apps people use, and controls risky sharing, downloads or unapproved apps.",
      url: L + "defender-cloud-apps/what-is-defender-for-cloud-apps" },
    { id: "afd-waf", name: "Azure Front Door and Web Application Firewall", tag: "WAF", family: "email", layers: [7, 4],
      plain: "The front desk for public websites. Filters attacks such as injection and spreads out heavy traffic.",
      url: L + "azure/web-application-firewall/overview", more: [{ label: "Azure Front Door", url: L + "azure/frontdoor/front-door-overview" }] },
    { id: "purview-dlp", name: "Microsoft Purview Data Loss Prevention (DLP)", tag: "stop leaks", family: "data", layers: [6, 7, 8],
      plain: "Stops sensitive information leaving by email, public sharing, USB or upload, and warns the person why.",
      url: L + "purview/dlp-learn-about-dlp", more: [{ label: "Microsoft Purview overview", url: L + "purview/purview" }] },
    { id: "purview-labels", name: "Microsoft Purview Information Protection (sensitivity labels)", tag: "labels and encryption", family: "data", layers: [6],
      plain: "A label stamped on a file or email that travels with it, and can encrypt it so only the right people can open it.",
      url: L + "purview/sensitivity-labels" },
    { id: "purview-irm", name: "Microsoft Purview Insider Risk Management", tag: "insider risk", family: "data", layers: [8],
      plain: "Spots risky patterns, such as someone downloading lots of files just before they leave, with privacy controls built in.",
      url: L + "purview/insider-risk-management" },
    { id: "purview-audit", name: "Microsoft Purview Audit and eDiscovery", tag: "logbook and records", family: "data", layers: [8, "x"],
      plain: "The logbook of who did what, and a way to find and hold records for an investigation.",
      url: L + "purview/audit-solutions-overview", more: [{ label: "eDiscovery", url: L + "purview/edisc" }] },
    { id: "keyvault", name: "Azure Key Vault", tag: "secrets safe", family: "data", layers: [6],
      plain: "A safe for the passwords, keys and certificates that apps use, so they are not left in code or files.",
      url: L + "azure/key-vault/general/overview" },
    { id: "mdc", name: "Microsoft Defender for Cloud", tag: "cloud security posture", family: "network", layers: [3, 4, 7],
      plain: "Health check and guard for Azure and other cloud servers. Finds weak settings, missing patches and attacks.",
      url: L + "azure/defender-for-cloud/defender-for-cloud-introduction" },
    { id: "azfw", name: "Azure Firewall", tag: "firewall", family: "network", layers: [3, 4, 7],
      plain: "The security gate between networks. Only lets through the traffic that is allowed.",
      url: L + "azure/firewall/overview" },
    { id: "nsg", name: "Azure Network Security Groups (NSGs)", tag: "traffic rules", family: "network", layers: [3, 4],
      plain: "Simple allow and deny rules on each network area, like locked doors between rooms.",
      url: L + "azure/virtual-network/network-security-groups-overview" },
    { id: "ddos", name: "Azure DDoS Protection", tag: "flood protection", family: "network", layers: [3, 4],
      plain: "Absorbs floods of fake traffic aimed at knocking a website or service offline.",
      url: L + "azure/ddos-protection/ddos-protection-overview" },
    { id: "gsa", name: "Entra Global Secure Access", tag: "zero trust network access", family: "network", layers: [3, 5],
      plain: "A modern replacement for the old VPN: a checked, secure route to work apps and the internet from anywhere.",
      url: L + "entra/global-secure-access/overview-what-is-global-secure-access" },
    { id: "vpngw", name: "Azure VPN Gateway", tag: "VPN", family: "network", layers: [3],
      plain: "An encrypted tunnel between the office, home workers and Azure.",
      url: L + "azure/vpn-gateway/vpn-gateway-about-vpngateways" },
    { id: "bastion", name: "Azure Bastion", tag: "secure admin access", family: "network", layers: [5, 4],
      plain: "A secure staff entrance for admins to reach servers, without opening remote desktop to the internet.",
      url: L + "azure/bastion/bastion-overview" },
    { id: "mdiot", name: "Microsoft Defender for IoT", tag: "smart devices", family: "network", layers: [2, 1, 0],
      plain: "Watches smart and building devices on the network, such as cameras, door controllers and sensors.",
      url: L + "azure/defender-for-iot/organizations/overview" },
    { id: "bitlocker", name: "BitLocker", tag: "disk encryption", family: "hardware", layers: [0, 6],
      plain: "Locks the laptop's disk, so a lost or stolen laptop is just a brick to whoever finds it.",
      url: L + "windows/security/operating-system-security/data-protection/bitlocker/" },
    { id: "secureboot", name: "Secure Boot", tag: "safe start-up", family: "hardware", layers: [0],
      plain: "Checks the start-up software is genuine before Windows loads, so hidden malware cannot start first.",
      url: L + "windows-hardware/design/device-experiences/oem-secure-boot" },
    { id: "tpm", name: "Trusted Platform Module (TPM)", tag: "security chip", family: "hardware", layers: [0],
      plain: "A small security chip that keeps keys safe and proves the device started cleanly.",
      url: L + "windows/security/hardware-security/tpm/trusted-platform-module-overview" },
    { id: "pluton", name: "Microsoft Pluton", tag: "security chip in the CPU", family: "hardware", layers: [0],
      plain: "A security chip built into the processor itself, harder to tamper with than a separate chip.",
      url: L + "windows/security/hardware-security/pluton/microsoft-pluton-security-processor" }
  ];
  /* Where Microsoft tools do not usually cover a layer, the gap is filled by other things. */
  var GAPS = {
    0: "Hardware supply chain: buy from trusted suppliers, check devices on arrival, and use certified disposal. Mostly people, process and suppliers.",
    1: "Physical security: door badges, visitor sign-in, CCTV, locked comms rooms, cabling and power. Usually facilities and building systems, not Microsoft.",
    2: "Office switches and Wi-Fi: network access control (802.1X), guest Wi-Fi kept separate. Usually set up on the network equipment itself.",
    8: "People and process: training, vetting, clear policies, and a culture where reporting mistakes is welcome. Tools help, but cannot replace this."
  };
  var byId = {};
  TOOLS.forEach(function (t) { byId[t.id] = t; });

  /* ---------- shared renderer (text nodes only) ---------- */
  var LAYER_SIMPLE = {
    x: "All layers", 0: "Hardware", 1: "Physical", 2: "Data Link", 3: "Network", 4: "Transport",
    5: "Session", 6: "Presentation", 7: "Application", 8: "People"
  };
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] == null) return;
      if (k === "class") n.className = attrs[k]; else if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function colourOf(n) {
    if (n === "x") return "#8B94A8";
    if (typeof LAYERS !== "undefined") { for (var i = 0; i < LAYERS.length; i++) if (LAYERS[i].n === n) return LAYERS[i].colour; }
    return "#f0c987";
  }
  function layerChip(n) {
    var c = el("span", { class: "ms-lchip", title: n === "x" ? "Cross-layer: works across every ring" : "Layer " + n + " " + LAYER_SIMPLE[n], text: n === "x" ? "All" : "L" + n });
    c.style.setProperty("--c", colourOf(n));
    return c;
  }
  function link(label, url) {
    return el("a", { href: url, target: "_blank", rel: "noopener noreferrer", "data-ga-keep": "" }, [label, el("span", { class: "sr-only", text: " (Microsoft Learn, opens in a new tab)" }), el("span", { "aria-hidden": "true", text: " ↗" })]);
  }
  function renderTable(box) {
    box.textContent = "";
    FAMILIES.forEach(function (f) {
      var list = TOOLS.filter(function (t) { return t.family === f.id; });
      var sec = el("section", { class: "ms-fam", "aria-label": f.name });
      sec.appendChild(el("h3", { class: "ms-fam__h" }, [el("span", { "aria-hidden": "true", class: "ms-ico", text: f.icon }), " " + f.name]));
      sec.appendChild(el("p", { class: "ms-fam__p", text: f.plain }));
      var t = el("table", { class: "ms-table" });
      t.appendChild(el("thead", null, [el("tr", null, [el("th", { scope: "col", text: "Tool" }), el("th", { scope: "col", text: "What it does, in plain words" }), el("th", { scope: "col", text: "Layers" }), el("th", { scope: "col", class: "ms-learn-h", text: "Learn more" })])]));
      var tb = el("tbody");
      list.forEach(function (tool) {
        var chips = el("div", { class: "ms-chips" }); tool.layers.forEach(function (n) { chips.appendChild(layerChip(n)); });
        var links = el("ul", { class: "ms-links" }, [el("li", null, [link("Microsoft Learn", tool.url)])]);
        (tool.more || []).forEach(function (m) { links.appendChild(el("li", null, [link(m.label, m.url)])); });
        tb.appendChild(el("tr", { id: "ms-" + tool.id }, [
          el("th", { scope: "row" }, [el("b", { text: tool.name }), el("span", { class: "ms-tag", text: tool.tag })]),
          el("td", { text: tool.plain }),
          el("td", null, [chips]),
          el("td", { class: "ms-learn" }, [links])
        ]));
      });
      t.appendChild(tb); sec.appendChild(t); box.appendChild(sec);
    });
  }
  function toolsForLayer(n) { return TOOLS.filter(function (t) { return t.layers.indexOf(n) >= 0; }); }
  /* extra: tools added by the user or named in the game, [{ name, layers, note }] */
  function renderCoverage(box, extra) {
    box.textContent = "";
    extra = extra || [];
    var order = ["x", 8, 7, 6, 5, 4, 3, 2, 1, 0];
    var t = el("table", { class: "ms-cover" });
    t.appendChild(el("thead", null, [el("tr", null, [el("th", { scope: "col", text: "Layer" }), el("th", { scope: "col", text: "Tools commonly used (Microsoft starter set, plus yours)" }), el("th", { scope: "col", text: "Usually covered by other things" })])]));
    var tb = el("tbody");
    order.forEach(function (n) {
      var cell = el("td", { class: "ms-cover__tools" });
      var names = toolsForLayer(n).map(function (x) { return x.name; });
      names.forEach(function (nm, i) { if (i) cell.appendChild(document.createTextNode(" · ")); cell.appendChild(el("span", { text: nm })); });
      var mine = extra.filter(function (x) { return (x.layers || []).indexOf(n) >= 0; });
      if (mine.length) {
        var ul = el("ul", { class: "ms-mine-list" });
        mine.forEach(function (x) { ul.appendChild(el("li", { class: "ms-mine" }, [el("b", { text: x.name }), el("span", { class: "ms-mine__tag", text: " " + (x.note || "added by you") })])); });
        cell.appendChild(ul);
      }
      if (!names.length && !mine.length) cell.textContent = "Very little";
      tb.appendChild(el("tr", null, [
        el("th", { scope: "row" }, [layerChip(n), " " + LAYER_SIMPLE[n]]),
        cell,
        el("td", { text: GAPS[n] || "" })
      ]));
    });
    t.appendChild(tb); box.appendChild(t);
  }

  window.MS_TOOLS = { families: FAMILIES, tools: TOOLS, byId: byId, gaps: GAPS, layerSimple: LAYER_SIMPLE,
    toolsForLayer: toolsForLayer, renderTable: renderTable, renderCoverage: renderCoverage, layerChip: layerChip };

})();
