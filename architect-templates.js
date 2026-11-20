/* Security Architect Corner templates (/architect/templates/).
   Everything stays in this browser: answers are saved to localStorage only and
   nothing is sent to any server. Export builds a file in the browser. */
(function () {
  "use strict";

  var STORE = "ga-arch-tpl-v1-";
  var L5 = ["1 Rare", "2 Unlikely", "3 Possible", "4 Likely", "5 Almost certain"];
  var I5 = ["1 Minimal", "2 Minor", "3 Moderate", "4 Major", "5 Severe"];

  var T = {
    design: {
      title: "One-page security design",
      file: "security-design",
      blocks: [
        { legend: "About the service", fields: [
          { id: "service", label: "Service name" },
          { id: "purpose", label: "What the service does and who uses it", type: "area" },
          { id: "phase", label: "Current phase", type: "select", options: ["Discovery", "Alpha", "Beta", "Live", "Retirement"] }
        ]},
        { legend: "Data", fields: [
          { id: "data", label: "Data the service holds", type: "area", hint: "List the types of data, such as names and contact details. Do not paste real records." },
          { id: "sensitivity", label: "How sensitive the data is", type: "area", hint: "Say which classification applies and why, at a high level. Keep detailed handling rules in your organisation's own documents." }
        ]},
        { legend: "Design", fields: [
          { id: "overview", label: "Architecture overview", type: "area", hint: "Describe the main parts and how data flows between them, in a few sentences." },
          { id: "access", label: "Users, roles and how they sign in", type: "area" },
          { id: "controls", label: "Key security controls", type: "area", hint: "Cover identity and access, protecting data in transit and at rest, network, logging and monitoring, and keys and secrets." },
          { id: "thirdparties", label: "Suppliers and third parties", type: "area" }
        ]},
        { legend: "Risks and decisions", fields: [
          { id: "risks", label: "Main risks and open issues", type: "area" },
          { id: "assumptions", label: "Assumptions", type: "area" },
          { id: "owner", label: "Risk owner (role)", hint: "Use a role, such as 'Service owner', not a person's name." },
          { id: "reviewed", label: "Date last reviewed", type: "date" }
        ]}
      ],
      example: { fields: {
        service: "Book a meeting room",
        purpose: "Lets staff at a public body book meeting rooms across three offices. Used by about 2,000 staff on work laptops and phones.",
        phase: "Alpha",
        data: "Staff work email address, display name, room bookings (date, time, room, meeting title).",
        sensitivity: "Low-sensitivity internal data at the organisation's standard classification. Meeting titles could reveal sensitive work, so users are told not to put details in them.",
        overview: "A web app hosted on the organisation's approved cloud platform. It reads staff identities from the existing identity provider and stores bookings in a managed database. No public access.",
        access: "Staff sign in with single sign-on and multi-factor authentication. Two roles: staff (book and cancel own bookings) and facilities admins (manage rooms).",
        controls: "Single sign-on with MFA; admin role limited to the facilities team; TLS for all traffic; database encrypted at rest with platform-managed keys; secrets in the platform key vault; logs sent to the central monitoring service.",
        thirdparties: "Cloud platform provider (already assured). No other suppliers.",
        risks: "Admin accounts could be misused to delete bookings. Meeting titles may contain sensitive detail.",
        assumptions: "The identity provider and cloud platform controls are already assured and in scope of their own reviews.",
        owner: "Service owner",
        reviewed: "2026-11-18"
      }}
    }
  };

  var RAG = ["Yes", "Partly", "No", "Not applicable"];
  var VIEW = ["Acceptable", "Needs follow-up", "Not acceptable"];
  var YNS = ["Yes", "No", "Not sure"];
  /* Impact scale used by the Secure by Design assets evaluation sheet. */
  var IMPACT = ["1 Negligible", "2 Minor", "3 Moderate", "4 Significant", "5 Critical"];
  var STRIDE = ["Spoofing", "Tampering", "Repudiation", "Information disclosure", "Denial of service", "Elevation of privilege"];
  function q(id, label, hint) { return { id: id, label: label, type: "area", hint: hint }; }
  function view(id) { return { id: id, label: "Our view of these answers", type: "select", options: VIEW }; }
  function check(id, label, hint) {
    return [{ id: id, label: label, type: "select", options: RAG, hint: hint },
            { id: id + "_ev", label: "Evidence or next step", type: "area" }];
  }
  function area(id, label, hint) { return { id: id, label: label, type: "area", hint: hint }; }
  function role(id, label, hint) { return { id: id, label: label, hint: hint || "Use a role, not a person's name." }; }
  function copy(o) { var r = {}; Object.keys(o || {}).forEach(function (k) { r[k] = o[k]; }); return r; }

  /* Risk register: fields follow the Secure by Design example risk register entry. */
  T.risks = {
    title: "Risk register starter",
    file: "risk-register",
    version: 2,
    basis: "Fields based on the Secure by Design example security risk assessment, Government Cyber Unit (security.gov.uk), licensed under the Open Government Licence v3.0.",
    blocks: [
      { legend: "About this register", fields: [
        { id: "service", label: "Service or project" },
        role("owner", "Who owns this register (role)"),
        { id: "reviewed", label: "Date last reviewed", type: "date" }
      ]}
    ],
    group: {
      key: "rows", item: "Risk", add: "Add another risk",
      fields: [
        { id: "id", label: "Risk ID", hint: "For example R1." },
        area("title", "Risk description", "Write it as: there is a risk that [threat actor] [threat event] by exploiting [vulnerability of an asset], resulting in [consequences]."),
        { id: "threat", label: "Threat actor", hint: "Who or what could cause it, such as a criminal group, an insider or an accident." },
        { id: "event_type", label: "Threat event type", hint: "For example unauthorised access, data loss or denial of service." },
        { id: "asset", label: "Information asset", hint: "From your data and sensitivity summary." },
        { id: "component", label: "Component", hint: "Where in the service, such as the admin pages or the database." },
        { id: "impact", label: "Business impact (1 to 5)", type: "select", options: IMPACT },
        { id: "likelihood", label: "Threat likelihood (1 to 5)", type: "select", options: L5 },
        role("accountable", "Accountable (role, usually the senior responsible owner)"),
        role("owner", "Risk owner (role, usually the information asset owner)"),
        { id: "treatment", label: "Treatment", type: "select", options: ["Reduce", "Accept", "Transfer", "Avoid"] },
        area("actions", "Actions, controls and comments", "Include anything escalated and why."),
        { id: "due", label: "Review or due date", type: "date" }
      ],
      score: true
    },
    migrate: function (d) {
      var map = { "1 Minimal": "1 Negligible", "4 Major": "4 Significant", "5 Severe": "5 Critical" };
      return { fields: copy(d.fields), rows: (d.rows || []).map(function (r, i) {
        var n = copy(r);
        if (map[n.impact]) n.impact = map[n.impact];
        if (!n.id) n.id = "R" + (i + 1);
        return n;
      }) };
    },
    example: {
      fields: { service: "Book a meeting room", owner: "Service owner", reviewed: "2026-11-18" },
      rows: [
        { id: "R1", title: "There is a risk that a criminal using a stolen password signs in as a facilities admin by exploiting a reused password on an admin account, resulting in bookings being cancelled across all offices.", threat: "Criminal using stolen credentials", event_type: "Unauthorised access", asset: "Room bookings", component: "Admin pages", impact: "3 Moderate", likelihood: "2 Unlikely", accountable: "Senior responsible owner", owner: "Information asset owner", treatment: "Reduce", actions: "Limit the admin role to the facilities team, require MFA, alert on bulk cancellations, keep a daily backup.", due: "2027-01-31" },
        { id: "R2", title: "There is a risk that a member of staff sees sensitive meeting details by reading free-text meeting titles on the shared room calendar, resulting in sensitive work being disclosed.", threat: "Curious or careless insider", event_type: "Information disclosure", asset: "Meeting titles", component: "Room calendar", impact: "2 Minor", likelihood: "3 Possible", accountable: "Senior responsible owner", owner: "Information asset owner", treatment: "Reduce", actions: "Add guidance next to the field; show titles only to the person who booked.", due: "2027-01-31" }
      ]
    }
  };

  /* Threat model: one row per threat, following the Secure by Design example threat model. */
  T.threats = {
    title: "Threat model worksheet (STRIDE)",
    file: "threat-model",
    version: 2,
    basis: "Fields based on the Secure by Design example threat model, Government Cyber Unit (security.gov.uk), licensed under the Open Government Licence v3.0.",
    blocks: [
      { legend: "Scenario and scope", fields: [
        { id: "system", label: "System or feature" },
        area("scope", "Scenario and what is in scope", "Name the parts, data flows and trust boundaries you are looking at."),
        area("assets", "What we are protecting", "The assets from your data and sensitivity summary."),
        { id: "diagram", label: "Where the architecture diagram is kept", hint: "A document name or location in your organisation's systems." }
      ]}
    ],
    group: {
      key: "rows", item: "Threat", add: "Add another threat",
      fields: [
        { id: "id", label: "Threat ID", hint: "For example T1." },
        { id: "stride", label: "STRIDE category", type: "select", options: STRIDE },
        area("event", "Threat event", "What could happen, in one or two sentences."),
        area("vuln", "Vulnerability it exploits"),
        area("mitigation", "Mitigation", "How you will stop it or reduce it. If you cannot, add it to the risk register."),
        { id: "ref", label: "Mitigation reference (optional)", hint: "For example a MITRE ATT&CK mitigation ID, if your organisation uses them." }
      ]
    },
    after: [
      { legend: "Did we do a good job?", fields: [
        area("gaps", "Gaps, follow-ups and risks to add to the register"),
        { id: "reviewed", label: "Date of this threat model", type: "date" }
      ]}
    ],
    migrate: function (d) {
      var f = copy(d.fields), rows = [], n = 0;
      [["s", 0], ["t", 1], ["r", 2], ["i", 3], ["d", 4], ["e", 5]].forEach(function (p) {
        var th = f[p[0] + "_threat"], mi = f[p[0] + "_mit"];
        delete f[p[0] + "_threat"]; delete f[p[0] + "_mit"];
        if (th || mi) { n++; rows.push({ id: "T" + n, stride: STRIDE[p[1]], event: th || "", mitigation: mi || "" }); }
      });
      return { fields: f, rows: rows };
    },
    example: {
      fields: {
        system: "Book a meeting room: admin functions",
        scope: "The admin pages, the bookings database and the sign-in flow from the identity provider. The trust boundary is between staff laptops and the hosted app.",
        assets: "Room bookings, meeting titles, the list of rooms, admin accounts.",
        diagram: "Booking service architecture diagram, version 3, in the team's design folder.",
        gaps: "Add the bulk-cancellation risk to the register. Confirm the audit log retention period.",
        reviewed: "2026-11-18"
      },
      rows: [
        { id: "T1", stride: "Spoofing", event: "Someone uses a stolen password to sign in as an admin.", vuln: "Admin accounts protected by password alone.", mitigation: "Single sign-on with MFA; admin role only for named facilities team accounts.", ref: "" },
        { id: "T2", stride: "Tampering", event: "An admin changes or deletes bookings without a reason.", vuln: "No record of who changed what.", mitigation: "Record every change with who and when; daily backups.", ref: "" },
        { id: "T3", stride: "Repudiation", event: "An admin says they did not cancel a booking.", vuln: "Logs held where admins can edit them.", mitigation: "Audit log sent to central monitoring, which admins cannot edit.", ref: "" },
        { id: "T4", stride: "Information disclosure", event: "Meeting titles shown to all staff reveal sensitive work.", vuln: "Free-text titles visible on the shared calendar.", mitigation: "Show titles only to the person who booked; guidance next to the field.", ref: "" },
        { id: "T5", stride: "Denial of service", event: "A script books every room for a year.", vuln: "No limit on bookings per person.", mitigation: "Limit bookings per person; alert on unusual volume.", ref: "" },
        { id: "T6", stride: "Elevation of privilege", event: "A normal user calls an admin page directly.", vuln: "Role checked only in the browser.", mitigation: "Check the role on the server for every admin action; test this in the IT health check.", ref: "" }
      ]
    }
  };

  /* Architecture decision record: headings follow GOV.UK ADR-000: Subject of Decision. */
  T.adr = {
    title: "Architecture decision record",
    file: "architecture-decision",
    version: 2,
    basis: "Headings based on ADR-000: Subject of Decision, Department for Science, Innovation and Technology and Government Digital Service, licensed under the Open Government Licence v3.0.",
    blocks: [
      { legend: "About this decision", fields: [
        { id: "title", label: "Subject of decision", hint: "A short phrase, such as 'Use the platform key vault for application secrets'." },
        { id: "number", label: "ADR number", hint: "For example ADR-003." },
        { id: "status", label: "Status", type: "select", options: ["Proposed", "Accepted", "Superseded", "Rejected"] },
        role("authors", "Authors (roles)", "Use roles, such as 'Security architect', not people's names."),
        { id: "proposed", label: "Date proposed", type: "date" },
        { id: "discussed", label: "Date discussed", type: "date" },
        { id: "ratified", label: "Date ratified", type: "date" },
        { id: "version", label: "Current version", hint: "For example 1.0." },
        area("changelog", "Change log", "One line per version: version, date, author role and what changed.")
      ]},
      { legend: "Summary", fields: [
        area("summary", "Summary", "Two or three sentences: the problem and the recommendation.")
      ]},
      { legend: "The decision", fields: [
        area("context", "What's the problem we are trying to solve?", "What is the problem, and what limits us?"),
        area("options", "What options have we considered?", "List two or three options with their main pros and cons."),
        area("decision", "What is the recommendation?"),
        area("consequences", "What are the consequences of this recommendation?", "What gets easier, what gets harder, and what we must now do."),
        area("security", "Security and risk impact"),
        area("details", "Where can I find more details?", "Names or locations of supporting documents, such as the threat model or risk register.")
      ]},
      { legend: "People involved", fields: [
        area("consulted", "Key areas consulted (roles or teams)"),
        role("agreed", "Ratified by (role)")
      ]}
    ],
    migrate: function (d) {
      var f = copy(d.fields);
      if (f.date) {
        if (f.status === "Accepted" && !f.ratified) f.ratified = f.date;
        else if (!f.proposed) f.proposed = f.date;
        delete f.date;
      }
      return { fields: f };
    },
    example: { fields: {
      title: "Use the platform key vault for application secrets",
      number: "ADR-003",
      status: "Accepted",
      authors: "Security architect, technical architect",
      proposed: "2026-11-04",
      discussed: "2026-11-11",
      ratified: "2026-11-18",
      version: "1.0",
      changelog: "0.1, 4 November 2026, security architect: first draft. 1.0, 18 November 2026, technical architect: ratified at the design authority.",
      summary: "Application secrets are in a configuration file that many people can read. We recommend moving them to the platform key vault.",
      context: "The booking app needs a database password and an API key. Today they sit in a configuration file in the code repository, which many people can read.",
      options: "1. Keep them in the config file: simple, but anyone with repo access sees them. 2. Environment variables set by hand: better, but hard to rotate and audit. 3. The platform key vault: managed, audited and supports rotation, but needs a small code change.",
      decision: "Use the platform key vault (option 3). The app reads secrets at start-up using its managed identity.",
      consequences: "Secrets leave the repository and can be rotated without a release. The team must remove old secrets from the repo history and rotate them.",
      security: "Reduces the risk of secret exposure. Access to the vault is logged and limited to the app and two platform engineers.",
      details: "Threat model for the booking service (threat T1); risk register entry R1; the secrets and key management pattern.",
      consulted: "Platform team, service owner, information asset owner",
      agreed: "Technical design authority"
    }}
  };

  /* Supplier assurance: sections follow the NCSC supplier assurance questions. */
  T.supplier = {
    title: "Supplier assurance questionnaire",
    file: "supplier-assurance",
    basis: "Sections based on the NCSC supplier assurance questions, National Cyber Security Centre, licensed under the Open Government Licence v3.0.",
    blocks: [
      { legend: "About the supplier and service", fields: [
        { id: "supplier", label: "Supplier and product or service", hint: "Use the organisation and product name, not a contact's name." },
        q("what", "What they will do for us, and what data or systems they will touch"),
        { id: "reviewed", label: "Date sent or reviewed", type: "date" }
      ]},
      { legend: "Security governance", fields: [
        q("governance", "Who is responsible for cyber security in your organisation, and are senior decision makers aware of their responsibilities?"),
        q("certs", "Which security certifications do you hold, and what is in scope?", "For example Cyber Essentials Plus or ISO/IEC 27001. Ask for the certificate and its scope."),
        q("cloud", "If you provide a cloud service, how do you meet the NCSC Cloud Security Principles?"),
        view("certs_view")
      ]},
      { legend: "Managing and recovering from incidents", fields: [
        q("incident", "How will you cope with an incident and recover from it, and how quickly will you tell us?"),
        q("breaches", "Have you had any material security breaches that you need to declare?"),
        q("bcp", "How will you keep a minimum level of service for us during an incident, such as a ransomware attack?"),
        view("inc_view")
      ]},
      { legend: "Protecting your network", fields: [
        q("access", "How do you control who can access your network and our data, including privileged and remote access?"),
        q("patch", "How quickly do you fix security vulnerabilities, starting with those being actively exploited?"),
        q("monitor", "What security logging and monitoring do you run, and can we see relevant logs?"),
        view("ops_view")
      ]},
      { legend: "Protecting data", fields: [
        q("encrypt", "How is our data protected in transit, at rest and on portable devices, and who manages the keys?"),
        q("location", "Where will our data be stored and processed, including backups?"),
        view("data_view")
      ]},
      { legend: "Offshoring and personal data", fields: [
        q("offshore", "Will any of your service to us be provided from outside the UK, and under which countries' laws?"),
        q("personal", "If you process personal data for us, how do you meet data protection law?"),
        view("privacy_view")
      ]},
      { legend: "Personnel and physical security", fields: [
        q("personnel", "What checks and security training do staff with access to our data or systems have?"),
        q("physical", "How do you protect the sites and equipment that hold our data?"),
        view("people_view")
      ]},
      { legend: "Independent testing and assurance", fields: [
        q("testing", "How is your security independently tested, and will you share the results with us?"),
        view("test_view")
      ]},
      { legend: "Hardware and supply chain", fields: [
        q("hw_source", "Where do the hardware, devices or components you supply come from, and how do you check they are genuine?", "Ask about approved resellers, provenance records and checks for counterfeit or tampered parts."),
        q("firmware", "How do you keep firmware up to date and protect it, for example with signed updates and secure boot?"),
        q("sbom", "Can you give a list of the software and components in your product (a software bill of materials, or SBOM)?"),
        q("tamper", "How are devices protected from tampering between your factory and our site?"),
        q("support", "How long will you provide security updates, and what happens at end of life?"),
        q("disposal", "How do you securely wipe or destroy storage media and returned or faulty devices that held our data?"),
        q("upstream", "How do you check the security of your own suppliers?"),
        view("hw_view")
      ]},
      { legend: "Subcontractors, contract and exit", fields: [
        q("subs", "Which subcontractors or other parties can access our data?"),
        q("return", "How will you return and securely delete our data when the contract ends?"),
        q("exit", "How will you help us move the service to another supplier?"),
        view("exit_view")
      ]},
      { legend: "Summary", fields: [
        { id: "summary", label: "Overall view and follow-up actions", type: "area" },
        role("owner", "Who owns this supplier risk (role)")
      ]}
    ],
    example: { fields: {
      supplier: "Example Devices Ltd: meeting room booking panels",
      what: "Supplies and maintains 40 touch-screen panels outside meeting rooms. The panels connect to the booking service over the office network and show room names and booking times.",
      reviewed: "2026-11-18",
      governance: "A named head of security reports to their board every quarter. Security policies are published to all staff.",
      certs: "Cyber Essentials Plus, covering their whole organisation. Certificate seen, valid until next year.",
      cloud: "Not applicable: the panels connect to our own service, not a supplier cloud.",
      certs_view: "Acceptable",
      incident: "Incident plan tested every year. They will tell our service desk within 24 hours by email and phone.",
      breaches: "None declared in the last three years.",
      bcp: "Spare panels held; replacement within two working days. Bookings still work from laptops if panels fail.",
      inc_view: "Acceptable",
      access: "Remote support only through our approved remote access tool, approved per session. Admin access limited to two named support roles.",
      patch: "Critical firmware fixes within 14 days.",
      monitor: "Panels send logs to our central monitoring.",
      ops_view: "Acceptable",
      encrypt: "Panels connect with TLS. Device certificates are issued by our platform. Support laptops are encrypted.",
      location: "No data stored by the supplier. Panels cache today's bookings only.",
      data_view: "Acceptable",
      offshore: "All support is from the UK.",
      personal: "Panels show room names and times only; no personal data is processed by the supplier.",
      privacy_view: "Acceptable",
      personnel: "Support engineers have baseline personnel security checks and yearly security training.",
      physical: "Spare panels and repair stock are kept in a locked, alarmed store.",
      people_view: "Acceptable",
      testing: "Yearly independent penetration test of the panel firmware; summary shared on request.",
      test_view: "Acceptable",
      hw_source: "Bought direct from the manufacturer's approved distributor, with serial numbers recorded on delivery.",
      firmware: "Signed firmware updates and secure boot enabled. Updates pushed monthly.",
      sbom: "SBOM provided on request in a standard format.",
      tamper: "Tamper-evident seals on packaging; serials checked against the delivery note.",
      support: "Security updates promised for five years from purchase.",
      disposal: "Storage wiped following NCSC sanitisation guidance; certificate of destruction for faulty units.",
      upstream: "Asks its own suppliers for Cyber Essentials; no wider checks yet.",
      hw_view: "Needs follow-up",
      subs: "A named repair partner may handle faulty panels.",
      return: "Panels are wiped on site before return.",
      exit: "Panels can be reset to factory settings and handed to a new maintainer, with the configuration export.",
      exit_view: "Acceptable",
      summary: "Acceptable with one follow-up: ask how the supplier checks the security of its own component suppliers.",
      owner: "Service owner"
    }}
  };

  /* Ready for beta: questions follow the Secure by Design self-assessment tracker
     (private beta) and Service Standard point 9. */
  T.beta = {
    title: "Ready for beta checklist",
    file: "ready-for-beta",
    basis: "Questions based on the Secure by Design self-assessment tracker, Government Cyber Unit (security.gov.uk), and Service Standard point 9, Government Digital Service, licensed under the Open Government Licence v3.0.",
    blocks: [
      { legend: "About the service", fields: [
        { id: "service", label: "Service name" },
        { id: "date", label: "Date of this check", type: "date" }
      ]},
      { legend: "Roles and responsibilities", fields: [].concat(
        check("roles", "Are a senior responsible owner and a service owner appointed, and are Secure by Design responsibilities assigned?")
      )},
      { legend: "Service assets and their importance", fields: [].concat(
        check("assets", "Are the service's assets documented, each with an owner?"),
        check("impact", "Is there a business impact assessment for confidentiality, integrity and availability?")
      )},
      { legend: "Threat modelling and design review", fields: [].concat(
        check("threats", "Are the likely threat events documented, with the controls that reduce them?"),
        check("design", "Has the security design been reviewed against good practice and patterns, and does it match what was built?")
      )},
      { legend: "Risk assessment and treatment", fields: [].concat(
        check("risks", "Are the service's risks documented, and are the risks above the risk appetite treated?"),
        check("evidence", "Is there enough evidence for the risk owner to make a decision on any residual risks?")
      )},
      { legend: "Security controls", fields: [].concat(
        check("controls", "Is every control in the design built, tested and owned by someone?"),
        check("sbd", "Is the Secure by Design evidence complete for the controls in scope?")
      )},
      { legend: "Vulnerabilities and testing", fields: [].concat(
        check("vuln", "Is there a documented process to find, prioritise and fix new vulnerabilities?"),
        check("pentest", "Have the penetration test findings been fixed or formally accepted?")
      )},
      { legend: "Observability", fields: [].concat(
        check("logging", "Do we have the logging and alerts we need on day one, and someone to act on them?")
      )},
      { legend: "Third parties", fields: [].concat(
        check("suppliers", "Have the main suppliers and third-party products been assessed, and have they given the assurance we asked for?")
      )},
      { legend: "Privacy (Service Standard point 9)", fields: [].concat(
        check("privacy", "Does the service protect users' privacy, with a data protection impact assessment where personal data is used?")
      )},
      { legend: "Decision", fields: [
        { id: "outcome", label: "Outcome", type: "select", options: ["Ready for beta", "Ready with conditions", "Not ready yet"] },
        area("conditions", "Conditions, open risks and who accepted them (roles)"),
        role("owner", "Risk owner (role)")
      ]}
    ],
    example: { fields: {
      service: "Book a meeting room",
      date: "2026-11-18",
      roles: "Yes", roles_ev: "Senior responsible owner and service owner named by role in the risk owners and sign-off record.",
      assets: "Yes", assets_ev: "Data and sensitivity summary lists five assets, each with an owner.",
      impact: "Yes", impact_ev: "Confidentiality, integrity and availability rated for each asset; highest impact is moderate.",
      threats: "Yes", threats_ev: "Threat model with six threats, one per STRIDE category, each with a mitigation.",
      design: "Yes", design_ev: "Design reviewed against the patterns library and checked against the build last week.",
      risks: "Yes", risks_ev: "Risk register R1 and R2 treated; no risk above appetite.",
      evidence: "Yes", evidence_ev: "Security design, threat model, risk register and IT health check report shared with the risk owner.",
      controls: "Yes", controls_ev: "Control list in the security design, each with an owner and a test result.",
      sbd: "Partly", sbd_ev: "Two controls still need evidence. Due before public beta.",
      vuln: "Yes", vuln_ev: "Weekly dependency scanning; fix times agreed in the live security plan draft.",
      pentest: "Partly", pentest_ev: "Two high findings fixed and retested. One medium finding accepted until the next release.",
      logging: "Yes", logging_ev: "Sign-in, admin actions and bulk cancellations alert the monitoring team.",
      suppliers: "Yes", suppliers_ev: "Booking panel supplier questionnaire returned and reviewed.",
      privacy: "Yes", privacy_ev: "DPIA completed; meeting titles shown only to the person who booked.",
      outcome: "Ready with conditions",
      conditions: "Fix the accepted medium finding in the next release. Complete the Secure by Design evidence. Accepted by the service owner.",
      owner: "Service owner"
    }}
  };

  /* Data and sensitivity summary: the asset fields follow the Secure by Design
     example service assets list and assets evaluation sheet. */
  T.data = {
    title: "Data and sensitivity summary",
    file: "data-and-sensitivity-summary",
    version: 2,
    basis: "Asset fields based on the Secure by Design example service assets list and assets evaluation sheet, Government Cyber Unit (security.gov.uk), licensed under the Open Government Licence v3.0.",
    blocks: [
      { legend: "About the service", fields: [
        { id: "service", label: "Service name" },
        { id: "phase", label: "Current phase", type: "select", options: ["Discovery", "Alpha", "Beta", "Live", "Retirement"] },
        role("iao", "Information asset owner (role)", "For example 'Head of facilities'. Use a role, not a person's name."),
        { id: "reviewed", label: "Date last reviewed", type: "date" }
      ]}
    ],
    group: {
      key: "rows", item: "Asset", add: "Add another asset",
      fields: [
        { id: "name", label: "Asset name", hint: "For example 'Room bookings'. Do not paste real records." },
        area("description", "Description"),
        { id: "class", label: "Security classification", hint: "The classification tier at a high level only. Keep detailed handling rules in your organisation's own documents." },
        { id: "category", label: "Category", type: "select", options: ["Data", "Software", "Hardware"] },
        { id: "stage", label: "Life cycle stage", type: "select", options: ["Input", "Processing", "Transmission", "Storage", "Not known yet"] },
        { id: "component", label: "Technology component", hint: "Where the asset sits in the service." },
        role("owner", "Owner (role)"),
        { id: "c", label: "Confidentiality impact", type: "select", options: IMPACT },
        { id: "i", label: "Integrity impact", type: "select", options: IMPACT },
        { id: "a", label: "Availability impact", type: "select", options: IMPACT }
      ]
    },
    after: [
      { legend: "Personal data", fields: [
        { id: "personal", label: "Does it include personal data?", type: "select", options: YNS },
        { id: "special", label: "Does it include special category or criminal offence data?", type: "select", options: YNS },
        area("volume", "Roughly how much data, and about how many people"),
        { id: "dpia", label: "Is a data protection impact assessment needed?", type: "select", options: ["Yes", "No", "Already done", "Not sure"] }
      ]},
      { legend: "Overall sensitivity", fields: [
        area("classification", "Which classification applies overall", "At a high level. Keep detailed handling rules in your organisation's own documents."),
        area("impact", "Highest business impact, and why", "The highest of the confidentiality, integrity and availability impacts above."),
        area("aggregation", "Does combining the data make it more sensitive?", "Lots of low-sensitivity records together, or linked to other data, can need more protection."),
        area("flows", "Where the data comes from and where it goes", "Name the other services, suppliers and teams that send or receive it.")
      ]},
      { legend: "Duties and handling", fields: [
        area("legal", "Legal and regulatory duties", "For example data protection law, records management and any sector rules."),
        area("retention", "How long it is kept, and how it is deleted"),
        area("questions", "Open questions and assumptions")
      ]}
    ],
    migrate: function (d) {
      var f = copy(d.fields), rows = d.rows && d.rows.length ? d.rows : [];
      if (f.types) { rows = [{ name: "Data held by the service", description: f.types }].concat(rows); }
      delete f.types;
      return { fields: f, rows: rows };
    },
    example: {
      fields: {
        service: "Book a meeting room",
        phase: "Discovery",
        iao: "Head of facilities",
        reviewed: "2026-11-18",
        personal: "Yes",
        special: "No",
        volume: "About 2,000 staff and 40,000 bookings a year.",
        dpia: "Yes",
        classification: "Internal data at the organisation's standard classification tier. Nothing here needs a higher classification.",
        impact: "Moderate, for the availability of room bookings and the confidentiality of meeting titles.",
        aggregation: "A year of bookings shows who meets whom and when. Limit who can see other people's bookings.",
        flows: "Staff identities come from the organisation's identity provider. Bookings are shown on the room panels outside each room. No data is shared outside the organisation.",
        legal: "Data protection law applies to staff names and email addresses. Bookings are not official records.",
        retention: "Keep bookings for 12 months, then delete them automatically.",
        questions: "Confirm whether meeting titles need to be shown on the room panels at all."
      },
      rows: [
        { name: "Staff identity details", description: "Work email address and display name, from the identity provider.", class: "Standard tier", category: "Data", stage: "Input", component: "Sign-in", owner: "Head of IT", c: "2 Minor", i: "2 Minor", a: "3 Moderate" },
        { name: "Room bookings", description: "Date, time, room and booker for each booking.", class: "Standard tier", category: "Data", stage: "Storage", component: "Bookings database", owner: "Head of facilities", c: "2 Minor", i: "3 Moderate", a: "3 Moderate" },
        { name: "Meeting titles", description: "Free-text title entered by the person booking.", class: "Standard tier", category: "Data", stage: "Storage", component: "Bookings database", owner: "Head of facilities", c: "3 Moderate", i: "2 Minor", a: "1 Negligible" },
        { name: "Booking web app", description: "The application staff use to book rooms.", class: "Standard tier", category: "Software", stage: "Processing", component: "Cloud platform", owner: "Service owner", c: "1 Negligible", i: "3 Moderate", a: "3 Moderate" },
        { name: "Room panels", description: "40 touch-screen panels showing today's bookings.", class: "Standard tier", category: "Hardware", stage: "Transmission", component: "Office network", owner: "Head of facilities", c: "1 Negligible", i: "2 Minor", a: "2 Minor" }
      ]
    }
  };

  T.raci = {
    title: "Risk owners and sign-off",
    file: "risk-owners-and-sign-off",
    blocks: [
      { legend: "About the service", fields: [
        { id: "service", label: "Service name" },
        { id: "reviewed", label: "Date last reviewed", type: "date" }
      ]},
      { legend: "Who owns the risk", fields: [
        role("sro", "Senior risk owner (role)", "The senior person who accepts the most serious risks. Use a role, not a person's name."),
        role("owner", "Day-to-day risk owner (role)"),
        role("iao", "Information asset owner (role)"),
        area("appetite", "Risk appetite or tolerance agreed for this service", "For example: high and very high risks need the senior risk owner; medium and low can be accepted by the service owner."),
        area("escalation", "When and how risks are escalated")
      ]}
    ],
    group: {
      key: "rows", item: "Decision", add: "Add another decision",
      fields: [
        { id: "activity", label: "Decision or activity", hint: "For example 'Accept a high risk' or 'Approve the security design'." },
        role("r", "Responsible: does the work (role)"),
        role("a", "Accountable: makes the decision, one role only"),
        role("c", "Consulted: asked before the decision (roles)"),
        role("i", "Informed: told afterwards (roles)")
      ]
    },
    after: [
      { legend: "Sign-off record", fields: [
        area("what", "What is being signed off", "For example 'Security risk acceptance for moving into public beta'."),
        { id: "outcome", label: "Outcome", type: "select", options: ["Approved", "Approved with conditions", "Not approved"] },
        area("conditions", "Conditions and accepted risks"),
        role("by", "Signed off by (role)"),
        { id: "date", label: "Date signed off", type: "date" }
      ]}
    ],
    example: {
      fields: {
        service: "Book a meeting room",
        reviewed: "2026-11-18",
        sro: "Director of corporate services (senior risk owner)",
        owner: "Service owner",
        iao: "Head of facilities (information asset owner)",
        appetite: "Low appetite for risks to staff data. High and very high risks need the senior risk owner. Medium and low risks can be accepted by the service owner.",
        escalation: "Any new high risk is raised with the senior risk owner within five working days, and reviewed at the monthly service board.",
        what: "Security risk acceptance for moving into private beta.",
        outcome: "Approved with conditions",
        conditions: "Fix the medium penetration test finding before public beta. Complete the Secure by Design evidence for the two open controls.",
        by: "Senior risk owner",
        date: "2026-11-18"
      },
      rows: [
        { activity: "Accept a high or very high security risk", r: "Security architect", a: "Senior risk owner", c: "Service owner, information asset owner", i: "Delivery team" },
        { activity: "Accept a medium or low security risk", r: "Security architect", a: "Service owner", c: "Technical architect", i: "Senior risk owner" },
        { activity: "Approve the security design", r: "Security architect", a: "Technical design authority", c: "Service owner, platform team", i: "Delivery team" },
        { activity: "Go-live security sign-off", r: "Security architect", a: "Senior risk owner", c: "Service owner, information asset owner", i: "Service desk, delivery team" }
      ]
    }
  };

  /* Live security plan: sections follow the Security Management Plan template
     (security.gov.uk, contracting securely). */
  T.live = {
    title: "Live security plan",
    file: "live-security-plan",
    basis: "Sections based on the Security Management Plan template, UK Government Security (security.gov.uk), licensed under the Open Government Licence v3.0.",
    blocks: [
      { legend: "About the service", fields: [
        { id: "service", label: "Service name" },
        role("owner", "Who owns this plan (role)"),
        { id: "reviewed", label: "Date last reviewed", type: "date" }
      ]},
      { legend: "Protective monitoring", fields: [
        area("logs", "What is logged, and where the logs go", "Cover sign-in, admin actions, errors and security events."),
        area("alerts", "Which alerts are set up, and who acts on them and when")
      ]},
      { legend: "Vulnerability management", fields: [
        area("patch", "How quickly you apply security updates", "Start with flaws that are being actively exploited, then critical and high."),
        area("find", "How you find vulnerabilities", "For example scanning, supplier advisories, the IT health check and reports from the public."),
        area("track", "Where vulnerabilities are recorded and tracked until fixed")
      ]},
      { legend: "Identity verification and access controls", fields: [
        area("access", "Who reviews user and admin access, and how often"),
        area("leavers", "How access is removed when people leave or change roles")
      ]},
      { legend: "Personnel security", fields: [
        area("personnel", "Checks and security training for people with access to the service", "Say which level of check applies to which role, at a high level.")
      ]},
      { legend: "Backups and business continuity", fields: [
        area("backups", "What is backed up, how often and how backups are protected"),
        area("restore", "How often restores are tested, and how long recovery should take")
      ]},
      { legend: "Supply chain security", fields: [
        area("supply", "Suppliers, subcontractors and third-party tools, and how their security is checked")
      ]},
      { legend: "Major hardware and software and end of support dates", fields: [
        area("eos", "Main products and platforms, and when security support ends")
      ]},
      { legend: "Incident management process", fields: [
        area("incident", "What to do in a security incident: who to call and how", "Link to your organisation's incident process rather than repeating it."),
        area("exercise", "When the plan was last tested, and the next exercise")
      ]},
      { legend: "Required changes register", fields: [
        area("changes", "Security changes still needed, with an owner (role) and a due date")
      ]},
      { legend: "Review cadence", fields: [
        area("cadence", "What is reviewed and how often", "For example: risk register quarterly, threat model on every significant change, suppliers each year, penetration re-test each year."),
        { id: "next", label: "Date of the next full review", type: "date" }
      ]}
    ],
    example: { fields: {
      service: "Book a meeting room",
      owner: "Service owner",
      reviewed: "2026-11-18",
      logs: "Sign-in, admin actions, bulk cancellations and application errors go to the central monitoring service. Logs are kept for 12 months.",
      alerts: "Alerts on admin sign-in from a new device, more than 20 cancellations in an hour and repeated failed sign-ins. The security operations team responds in working hours; out of hours, critical alerts page the on-call engineer.",
      patch: "Actively exploited flaws within 48 hours; other critical within 7 days; high within 14 days. Platform updates are applied automatically each week.",
      find: "Weekly dependency and container scanning in the build pipeline, supplier advisories, the yearly IT health check and the organisation's vulnerability disclosure contact.",
      track: "Each finding is a ticket in the team backlog with a severity and a due date. Overdue items are reviewed at the monthly service board.",
      access: "The service owner reviews the admin role list every quarter. Staff access comes from the identity provider and ends automatically when people leave.",
      leavers: "Leavers lose access when their account is disabled in the identity provider. Admin role changes are checked at the quarterly review.",
      personnel: "All staff have the organisation's standard baseline check. Platform engineers with production access have yearly security training.",
      backups: "Database backed up daily by the platform, kept for 35 days, encrypted and stored in a separate account.",
      restore: "Restore tested every six months. Target: back online within 4 hours, losing no more than 24 hours of bookings.",
      supply: "Cloud platform (assured centrally) and the room panel supplier (questionnaire reviewed every year).",
      eos: "Application runtime supported until 2028. Room panel firmware updates promised until 2031.",
      incident: "Follow the organisation's incident process: call the service desk security line, then the on-call engineer. The service owner decides whether to take the service offline.",
      exercise: "Tabletop exercise in October 2026 (compromised admin account). Next exercise April 2027.",
      changes: "Fix the accepted medium penetration test finding (technical lead, January 2027). Ask the panel supplier about its own supplier checks (service owner, December 2026).",
      cadence: "Risk register every quarter; threat model on every significant change; supplier review every year; penetration re-test every year; this plan every six months.",
      next: "2027-05-18"
    }}
  };

  /* Decommission and disposal: steps follow the Secure by Design guidance on
     retiring service components, with NCSC decommissioning and sanitisation guidance. */
  T.decom = {
    title: "Decommission and disposal plan",
    file: "decommission-and-disposal-plan",
    blocks: [
      { legend: "About the service", fields: [
        { id: "service", label: "Service name" },
        role("owner", "Who owns this plan (role)"),
        { id: "closing", label: "Planned closing date", type: "date" },
        area("replacement", "What replaces the service, if anything")
      ]},
      { legend: "Assets and asset owners", fields: [
        area("copies", "Every asset and copy of the data to retire, from your asset list", "Include backups, logs, exports and test copies. Use asset IDs or serial numbers where you have them."),
        area("asset_owners", "Asset owners you have agreed the plan with (roles)")
      ]},
      { legend: "Retirement risk assessment", fields: [
        area("retire_risk", "Risks of retiring the service, and how you will manage them", "For example losing data you must keep, or leaving old accounts or DNS records behind.")
      ]},
      { legend: "Backups before removal", fields: [
        area("backups_pre", "What you back up or archive before removing anything, and where it is kept")
      ]},
      { legend: "Data: keep, move or destroy", fields: [
        area("retention", "What will be kept, for how long and under which retention rule"),
        area("transfer", "What will be moved to another service or archive, and how it is protected on the way"),
        area("destroy", "What will be destroyed, and how")
      ]},
      { legend: "Media sanitisation", fields: [
        area("media", "Devices and storage to sanitise or destroy, and the method", "Follow the NCSC guidance on secure sanitisation of storage media. For cloud storage, record how the provider deletes data and keys."),
        area("media_ev", "Evidence of sanitisation or destruction", "Record asset IDs, the method, the date, who did it (roles), certificates of destruction and the chain of custody.")
      ]},
      { legend: "Access removal", fields: [
        area("accounts", "User, admin and service accounts to remove"),
        area("integrations", "Connections, API keys, firewall rules and network routes to remove"),
        area("dns", "Domains, DNS records and public pages to remove or redirect", "Leaving old DNS records pointing at deleted resources can let someone else take them over.")
      ]},
      { legend: "Supplier exit", fields: [
        area("exit", "Contracts to end and the exit steps for each supplier"),
        area("supplier_ev", "Evidence that suppliers have returned or deleted our data")
      ]},
      { legend: "Certificates and keys", fields: [
        area("certs", "Certificates to revoke"),
        area("keys", "Encryption keys and secrets to revoke or destroy, and when", "Destroy keys only after confirming that no data you must keep depends on them.")
      ]},
      { legend: "Close-out and sign-off", fields: [
        { id: "done", label: "Is every step above done and evidenced?", type: "select", options: ["Yes", "Partly", "No"] },
        area("closeout", "Close-out report: what it covers and who receives it (roles)", "For example the senior responsible owner and the security lead."),
        area("residual", "Remaining risks and who accepted them (roles)", "Record them in the risk register."),
        role("by", "Signed off by (role)"),
        { id: "date", label: "Date signed off", type: "date" }
      ]}
    ],
    example: { fields: {
      service: "Book a meeting room",
      owner: "Service owner",
      closing: "2027-09-30",
      replacement: "Room booking moves to the organisation's new workplace platform.",
      copies: "Production database, 35 days of platform backups, 12 months of logs in central monitoring, a CSV export held by the facilities team, the test environment copy and the 40 room panels (serial numbers in the asset list).",
      asset_owners: "Head of facilities (bookings, panels), Head of IT (identity details), service owner (web app).",
      retire_risk: "Bookings lost before the move: test the import first. Old DNS record taken over: redirect, then remove. Panels returned with data: wipe and certify before collection.",
      backups_pre: "A final encrypted export of future bookings, kept in the new platform's import area until the import is checked, then deleted.",
      retention: "No bookings need to be kept as records. Usage totals by room are kept for 2 years for estates planning.",
      transfer: "Future bookings (from the closing date onwards) move to the new platform through its import tool over an encrypted connection. The import file is deleted after a successful check.",
      destroy: "Database, backups, test copy and the facilities CSV export are deleted. Logs age out under the normal 12-month rule.",
      media: "No physical storage of our own. The 40 room panels are wiped to the NCSC sanitisation guidance before return. Cloud database and storage accounts are deleted, and the provider's deletion process recorded.",
      media_ev: "Supplier certificate of sanitisation listing each panel serial number, the method and the date; collection signed by the facilities team; platform deletion records for the database and storage accounts.",
      accounts: "Remove the facilities admin role, the app's managed identity and the two platform engineer accounts for the service.",
      integrations: "Remove the identity provider app registration, the panel API keys and the firewall rule allowing panels to reach the service.",
      dns: "Redirect the booking address to the new platform for 6 months, then remove the DNS record.",
      exit: "End the panel support contract on the closing date. Follow the exit clause: return or wipe all panels and close remote support access.",
      supplier_ev: "Written confirmation from the panel supplier that no copies of our data remain, with the sanitisation certificate.",
      certs: "Revoke the TLS certificate for the booking address after the redirect ends, and the device certificates issued to the panels.",
      keys: "Delete the application secrets in the key vault. Delete the database encryption key 30 days after the database, once the deletion is confirmed.",
      done: "Partly",
      closeout: "Lists each asset, what happened to it and the evidence. Sent to the senior responsible owner and the security lead.",
      residual: "DNS redirect stays for 6 months; accepted by the service owner and recorded in the risk register.",
      by: "Senior risk owner",
      date: "2027-10-15"
    }}
  };

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }

  function fieldControl(prefix, f) {
    var wrap = el("div", { "class": "tpl-field" });
    var id = prefix + "-" + f.id;
    wrap.appendChild(el("label", { "for": id }, f.label));
    var attrs = { id: id, name: f.id, "data-key": f.id };
    if (f.hint) {
      wrap.appendChild(el("p", { "class": "tpl-hint", id: id + "-hint" }, f.hint));
      attrs["aria-describedby"] = id + "-hint";
    }
    var c;
    if (f.type === "area") { attrs.rows = "4"; c = el("textarea", attrs); }
    else if (f.type === "select") {
      c = el("select", attrs);
      c.appendChild(el("option", { value: "" }, "Choose…"));
      f.options.forEach(function (o) { c.appendChild(el("option", { value: o }, o)); });
    } else {
      attrs.type = f.type === "date" ? "date" : "text";
      attrs.autocomplete = "off";
      c = el("input", attrs);
    }
    wrap.appendChild(c);
    return wrap;
  }

  function scoreText(row) {
    var l = parseInt(row.likelihood, 10), i = parseInt(row.impact, 10);
    if (!l || !i) return "Choose likelihood and impact to see the score.";
    var s = l * i;
    var r = s <= 4 ? "Low" : s <= 9 ? "Medium" : s <= 16 ? "High" : "Very high";
    return "Risk severity " + s + " out of 25: " + r;
  }

  function Template(root) {
    this.key = root.getAttribute("data-template");
    this.def = T[this.key];
    this.root = root;
    this.status = root.querySelector(".tpl-status");
    this.build();
    this.load();
  }

  Template.prototype.build = function () {
    var self = this, def = this.def, form = el("form", { "class": "tpl-form", novalidate: "", "aria-label": def.title });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    def.blocks.forEach(function (b) {
      var fs = el("fieldset", { "class": "tpl-fieldset" });
      fs.appendChild(el("legend", null, b.legend));
      b.fields.forEach(function (f) { fs.appendChild(fieldControl("tpl-" + self.key, f)); });
      form.appendChild(fs);
    });
    if (def.group) {
      this.rowsWrap = el("div", { "class": "tpl-rows" });
      form.appendChild(this.rowsWrap);
      var add = el("button", { type: "button", "class": "btn btn-quiet tpl-add" }, def.group.add);
      add.addEventListener("click", function () { var r = self.addRow({}); self.save(); r.querySelector("textarea, input, select").focus(); });
      form.appendChild(add);
    }
    (def.after || []).forEach(function (b) {
      var fs = el("fieldset", { "class": "tpl-fieldset" });
      fs.appendChild(el("legend", null, b.legend));
      b.fields.forEach(function (f) { fs.appendChild(fieldControl("tpl-" + self.key, f)); });
      form.appendChild(fs);
    });
    form.addEventListener("input", function (e) { self.onEdit(e); });
    form.addEventListener("change", function (e) { self.onEdit(e); });
    this.form = form;
    this.root.querySelector(".tpl-form-slot").appendChild(form);

    var bar = this.root.querySelector(".tpl-actions");
    function btn(label, cls, fn) { var b = el("button", { type: "button", "class": "btn " + cls }, label); b.addEventListener("click", fn); bar.appendChild(b); return b; }
    btn("Fill in the worked example", "btn-quiet tpl-example", function () { self.fillExample(); });
    btn("Print or save as PDF", "btn-primary tpl-print", function () { self.print(); });
    btn("Download for Word (.doc)", "btn-quiet tpl-doc", function () { self.download("doc"); });
    btn("Download as text (.md)", "btn-quiet tpl-md", function () { self.download("md"); });
    btn("Clear this template", "btn-quiet tpl-clear", function () { self.clear(); });
  };

  Template.prototype.addRow = function (data) {
    var self = this, g = this.def.group, n = this.rowsWrap.children.length + 1;
    var fs = el("fieldset", { "class": "tpl-fieldset tpl-row" });
    fs.appendChild(el("legend", null, g.item + " " + n));
    var uid = "tpl-" + this.key + "-r" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
    g.fields.forEach(function (f) { fs.appendChild(fieldControl(uid, f)); });
    if (g.score) fs.appendChild(el("p", { "class": "tpl-score", "aria-live": "polite" }));
    var rm = el("button", { type: "button", "class": "btn btn-quiet tpl-remove" }, "Remove " + g.item.toLowerCase() + " " + n);
    rm.addEventListener("click", function () {
      fs.remove(); self.renumber(); self.save();
      var next = self.rowsWrap.querySelector(".tpl-remove") || self.form.querySelector(".tpl-add");
      if (next) next.focus();
    });
    fs.appendChild(rm);
    this.rowsWrap.appendChild(fs);
    this.setValues(fs, data);
    this.updateScore(fs);
    return fs;
  };

  Template.prototype.renumber = function () {
    var g = this.def.group;
    Array.prototype.forEach.call(this.rowsWrap.children, function (fs, i) {
      fs.querySelector("legend").textContent = g.item + " " + (i + 1);
      fs.querySelector(".tpl-remove").textContent = "Remove " + g.item.toLowerCase() + " " + (i + 1);
    });
  };

  Template.prototype.updateScore = function (fs) {
    var p = fs.querySelector(".tpl-score");
    if (p) p.textContent = scoreText(this.values(fs));
  };

  Template.prototype.values = function (scope) {
    var o = {};
    Array.prototype.forEach.call(scope.querySelectorAll("[data-key]"), function (c) {
      if (c.closest(".tpl-row") && !scope.classList.contains("tpl-row")) return;
      o[c.getAttribute("data-key")] = c.value;
    });
    return o;
  };

  Template.prototype.setValues = function (scope, data) {
    Array.prototype.forEach.call(scope.querySelectorAll("[data-key]"), function (c) {
      if (c.closest(".tpl-row") && !scope.classList.contains("tpl-row")) return;
      var v = data[c.getAttribute("data-key")];
      c.value = v == null ? "" : v;
    });
  };

  Template.prototype.data = function () {
    var d = { v: this.def.version || 1, fields: this.values(this.form) };
    if (this.def.group) d.rows = Array.prototype.map.call(this.rowsWrap.children, this.values.bind(this));
    return d;
  };

  Template.prototype.isEmpty = function () {
    var d = this.data(), has = function (o) { return Object.keys(o).some(function (k) { return o[k]; }); };
    return !has(d.fields) && !(d.rows || []).some(has);
  };

  Template.prototype.apply = function (d) {
    this.setValues(this.form, d.fields || {});
    if (this.def.group) {
      this.rowsWrap.textContent = "";
      var rows = d.rows && d.rows.length ? d.rows : [{}];
      rows.forEach(this.addRow.bind(this));
    }
  };

  Template.prototype.onEdit = function (e) {
    var fs = e.target.closest(".tpl-row");
    if (fs) this.updateScore(fs);
    var self = this;
    clearTimeout(this.t);
    this.t = setTimeout(function () { self.save(); }, 250);
  };

  Template.prototype.say = function (msg) { if (this.status) this.status.textContent = msg; };

  Template.prototype.save = function () {
    try {
      localStorage.setItem(STORE + this.key, JSON.stringify(this.data()));
      var t = new Date();
      this.say("Saved in this browser at " + String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0") + ".");
    } catch (err) {
      this.say("Could not save in this browser. Download a copy to keep your work.");
    }
  };

  /* Saved answers from an earlier layout of a template are moved to the
     current fields, under the same storage key, so nothing is lost. */
  Template.prototype.migrate = function (d) {
    var def = this.def, want = def.version || 1;
    if (!d || typeof d !== "object") return { d: null, moved: false };
    if (!d.fields || typeof d.fields !== "object") d.fields = {};
    if ((d.v || 1) >= want || !def.migrate) return { d: d, moved: false };
    var m = def.migrate(d);
    m.v = want;
    return { d: m, moved: true };
  };

  Template.prototype.load = function () {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(STORE + this.key) || "null"); } catch (err) { raw = null; }
    var r = this.migrate(raw), d = r.d;
    this.apply(d || {});
    if (r.moved) {
      this.save();
      this.say("Restored your saved answers and moved them to this template's updated layout. Nothing was lost.");
      return;
    }
    this.say(d ? "Restored your saved answers from this browser." : "Answers save automatically in this browser only.");
  };

  Template.prototype.fillExample = function () {
    if (!this.isEmpty() && !window.confirm("Replace your answers in this template with the worked example?")) return;
    this.apply(this.def.example);
    this.save();
    this.say("Worked example filled in and saved in this browser. Change it to fit your service.");
  };

  Template.prototype.clear = function () {
    if (!window.confirm("Clear all answers in this template? This cannot be undone.")) return;
    try { localStorage.removeItem(STORE + this.key); } catch (err) { /* ignore */ }
    this.apply({});
    this.say("Template cleared.");
  };

  /* Output model shared by print, Word and text exports. */
  Template.prototype.model = function () {
    var self = this, d = this.data(), out = [];
    this.def.blocks.forEach(function (b) {
      out.push({ h: b.legend, items: b.fields.map(function (f) { return [f.label, d.fields[f.id] || ""]; }) });
    });
    if (this.def.group) {
      (d.rows || []).forEach(function (r, i) {
        var items = self.def.group.fields.map(function (f) { return [f.label, r[f.id] || ""]; });
        if (self.def.group.score) items.push(["Risk severity", scoreText(r)]);
        out.push({ h: self.def.group.item + " " + (i + 1), items: items });
      });
    }
    (this.def.after || []).forEach(function (b) {
      out.push({ h: b.legend, items: b.fields.map(function (f) { return [f.label, d.fields[f.id] || ""]; }) });
    });
    return out;
  };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  Template.prototype.html = function () {
    var h = "<h1>" + esc(this.def.title) + "</h1>";
    this.model().forEach(function (s) {
      h += "<h2>" + esc(s.h) + "</h2>";
      s.items.forEach(function (it) {
        h += "<h3>" + esc(it[0]) + "</h3>";
        h += it[1] ? esc(it[1]).split(/\n+/).map(function (p) { return "<p>" + p + "</p>"; }).join("") : "<p><em>Not filled in</em></p>";
      });
    });
    if (this.def.basis) h += "<p><small>" + esc(this.def.basis) + "</small></p>";
    return h + "<p><small>Made with the GOV Assured Security Architect Corner templates. Check your organisation's handling rules before sharing.</small></p>";
  };

  Template.prototype.markdown = function () {
    var m = "# " + this.def.title + "\n";
    this.model().forEach(function (s) {
      m += "\n## " + s.h + "\n";
      s.items.forEach(function (it) { m += "\n**" + it[0] + "**\n\n" + (it[1] || "_Not filled in_") + "\n"; });
    });
    if (this.def.basis) m += "\n" + this.def.basis + "\n";
    return m + "\n---\nMade with the GOV Assured Security Architect Corner templates. Check your organisation's handling rules before sharing.\n";
  };

  Template.prototype.download = function (kind) {
    var body, type;
    if (kind === "doc") {
      body = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>" + esc(this.def.title) + "</title>" +
        "<style>body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.4}h1{font-size:18pt}h2{font-size:14pt;margin-top:16pt}h3{font-size:11pt;margin:8pt 0 2pt}</style></head><body>" +
        this.html() + "</body></html>";
      type = "application/msword";
    } else {
      body = this.markdown();
      type = "text/markdown;charset=utf-8";
    }
    var blob = new Blob(["\ufeff", body], { type: type });
    var url = URL.createObjectURL(blob);
    var a = el("a", { href: url, download: this.def.file + "." + kind, "class": "visually-hidden" });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
    this.say("Downloaded " + this.def.file + "." + kind + ". It was made in your browser; nothing was sent anywhere.");
  };

  Template.prototype.print = function () {
    var view = document.getElementById("tpl-print-view");
    if (!view) { view = el("div", { id: "tpl-print-view", "class": "tpl-print-view" }); document.body.appendChild(view); }
    view.textContent = "";
    view.appendChild(el("h1", null, this.def.title));
    this.model().forEach(function (sec) {
      view.appendChild(el("h2", null, sec.h));
      sec.items.forEach(function (it) {
        view.appendChild(el("h3", null, it[0]));
        if (!it[1]) { view.appendChild(el("p", { "class": "tpl-empty" }, "Not filled in")); return; }
        it[1].split(/\n+/).forEach(function (para) { view.appendChild(el("p", null, para)); });
      });
    });
    if (this.def.basis) view.appendChild(el("p", { "class": "tpl-print-note" }, this.def.basis));
    view.appendChild(el("p", { "class": "tpl-print-note" }, "Made with the GOV Assured Security Architect Corner templates. Check your organisation's handling rules before sharing."));
    document.body.classList.add("is-printing");
    window.print();
  };

  window.addEventListener("afterprint", function () {
    document.body.classList.remove("is-printing");
    var view = document.getElementById("tpl-print-view");
    if (view) view.textContent = "";
  });

  var templates = Array.prototype.map.call(document.querySelectorAll("[data-template]"), function (r) { return new Template(r); });
  if (templates.length) document.documentElement.classList.add("tpl-ready");
})();
