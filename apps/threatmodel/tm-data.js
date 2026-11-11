/* Threat Modelling Lifecycle — page data. Community resource; not official guidance. Sources verified 10 November 2026 (Europe/London). */
window.TM = {
  "checked": "10 November 2026 (Europe/London)",
  "stages": [
    {
      "id": "scope",
      "num": 1,
      "short": "Scope",
      "title": "Scope the change",
      "full": "Scope the change (including AI, identity and the pipeline)",
      "purpose": "Decide what you are modelling this time, why, and what “good enough” looks like.",
      "do": "Name the system or the change — a new feature, a new model or agent, a new cloud identity, a new dependency, or a change to CI/CD — and set in-scope and out-of-scope. Agree who will take part (this remains a team activity). Time-box the work. The four questions from the Threat Modeling Manifesto, which NCSC also uses as its handrail, are the foundation for the whole pass, not a separate method.",
      "output": "A short scoping note: system or change name, in-scope and out-of-scope (including AI components, identities, and the build pipeline), attendees, and depth.",
      "mistake": "Modelling the entire estate in one sitting, or scoping only the application code and leaving out the model, the identity provider, or the pipeline.",
      "ncsc": "Partial. NCSC has a page on when and why to do the work, but none devoted only to how to write a scope note.",
      "sources": [
        "S1",
        "S42",
        "S43",
        "S44",
        "S46",
        "S37"
      ]
    },
    {
      "id": "landscape",
      "num": 2,
      "short": "Landscape",
      "title": "Refresh the landscape",
      "full": "Refresh the current threat landscape",
      "purpose": "Understand, with current sources, who might try to harm this service and which catalogues apply now — not a static list from a previous year.",
      "do": "Describe what the service does and what would go wrong if it failed. Using the best threat information you have, list plausible threat actors and their intent, motivation and capability (this is the first step on the NCSC threat-modelling page). Then pick the current catalogues that apply: ATT&CK v20.1 for conventional techniques; ATLAS 2026.10 and the OWASP GenAI / Agentic guides if the service uses a model or an agent; relevant advisories and your own incident history. This is not a classified intelligence product.",
      "output": "A short context statement, a short threat-actor list, and a note of which catalogues and versions will be used on this pass.",
      "mistake": "Jumping straight to technical threats; listing nation-state actors that are not realistic for this service; or using an out-of-date ATT&CK or LLM Top 10 slide.",
      "ncsc": "Yes.",
      "sources": [
        "S1",
        "S10",
        "S20",
        "S50",
        "S50a",
        "S58",
        "S70",
        "S71",
        "S73",
        "S75",
        "S27"
      ],
      "sourceNotes": {
        "S27": "Useful public guidance, but it is government Secure by Design policy, not NCSC, and is not mandatory for this community."
      }
    },
    {
      "id": "model",
      "num": 3,
      "short": "Model",
      "title": "Model the real system",
      "full": "Model the real system: cloud, identity, supply chain and AI",
      "purpose": "Draw a good-enough picture of how the service actually runs, including the parts classic application diagrams often miss.",
      "do": "The foundation, from NCSC, is a model good enough for analysis: components (including users), data flows, connections to other systems, and — marked properly in stage 4 — trust boundaries. A data flow diagram (DFD) is the usual form; an architecture or use-case diagram also works. The model should include, where they exist: the identity provider and cloud IAM (users and service identities); CI/CD and artefact registries; third-party packages and model providers; any LLM or agent, its tools, memory and callbacks; data stores; and external feeds. You can start from a whiteboard, or from threat-modelling-as-code (for example pytm or Threagile YAML) in the same repository. An LLM may draft a diagram; a person who knows the system must correct it. The model will never be perfect.",
      "output": "A DFD or architecture model, or a checked-in model file, with components and flows labelled.",
      "mistake": "A neat diagram of the web app that omits the identity provider, the build pipeline, admin paths, backups, or the model API.",
      "ncsc": "Yes.",
      "sources": [
        "S1",
        "S15",
        "S86",
        "S87",
        "S85",
        "S26",
        "S32",
        "S78",
        "S80",
        "S41"
      ]
    },
    {
      "id": "boundaries",
      "num": 4,
      "short": "Boundaries",
      "title": "Assets and boundaries",
      "full": "Identify assets, identities, data and trust boundaries",
      "purpose": "Be explicit about what you are protecting, which identities can act, and where trust changes.",
      "do": "Mark the data and functions that matter — including organisation or user content, prompts and model outputs, API credentials, database contents, the integrity of public feeds, and the integrity of the build. Treat identities and secrets as first-class assets, not an afterthought. Mark entry points (web UI, APIs, admin, CI/CD, callbacks, tool interfaces). Draw trust boundaries: browser to app, app to database, app to a cloud model or other API, pipeline to production, and the identity provider. For personal data, privacy threats can be added later with LINDDUN; many community apps will have little personal data, so treat that as an optional track.",
      "output": "Assets, identities, entry points and trust boundaries marked on the model.",
      "mistake": "Treating everything inside “the cloud” as equally trusted, or forgetting operators, service identities and the build system as entry points.",
      "ncsc": "Yes.",
      "sources": [
        "S1",
        "S21",
        "S22b",
        "S86",
        "S87",
        "S31",
        "S32n",
        "S37"
      ],
      "sourceNotes": {
        "S31": "NIST SP 800-154 is still an Initial Public Draft (March 2016), not a final standard.",
        "S32n": "Draft PDF of SP 800-154."
      }
    },
    {
      "id": "threats",
      "num": 5,
      "short": "Threats",
      "title": "Identify threats",
      "full": "Identify threats from current catalogues, then check with a structured method",
      "purpose": "Work out what can go wrong using up-to-date catalogues for this system, then use a structured method so whole classes of threat are not missed.",
      "do": "Take one part of the model at a time. Lead with the catalogues you chose in stage 2: ATT&CK techniques that actually fit; ATLAS and OWASP LLM / Agentic Top 10 for model and agent flows (prompt injection, goal hijack, tool misuse, data leakage in prompts, poisoning, unbounded consumption); SLSA and NCSC supply-chain guidance for the pipeline and dependencies. Then, as NCSC still recommends, apply a structured check: STRIDE (spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege) across the same boundary, and an attack tree for a high-value attacker goal. STRIDE is a foundation and a completeness check, not the only lens — it does not, on its own, cover several AI-specific harms. Do not paste the entire ATT&CK or ATLAS matrix into the model.",
      "output": "A structured threat list, each item tied to a place on the model and, where useful, to a catalogue ID.",
      "mistake": "An unstructured brainstorm; or listing every technique in a catalogue; or using only STRIDE on an LLM or agent and thinking the job is done.",
      "ncsc": "Partial. NCSC has pages on threat modelling and attack trees, but none for LINDDUN, SLSA, or applying the OWASP LLM Top 10; those link to their own sources.",
      "sources": [
        "S1",
        "S3",
        "S16",
        "S31a",
        "S82",
        "S22a",
        "S50",
        "S51",
        "S58",
        "S70",
        "S71",
        "S73",
        "S75",
        "S89",
        "S90",
        "S47",
        "S52",
        "S49"
      ]
    },
    {
      "id": "prioritise",
      "num": 6,
      "short": "Prioritise",
      "title": "Assess and prioritise",
      "full": "Assess and prioritise, including AI-specific harms",
      "purpose": "Decide which threats matter most, given impact, likelihood and your risk appetite, including harms that are not only confidentiality, integrity or availability.",
      "do": "For each credible threat, consider impact and likelihood, using the actors from stage 2 and the controls you already have. Rank them. For generative AI, also consider the kinds of risk called out in NIST AI 600-1 and NCSC’s ML and agentic advice (for example harmful or untrue output, over-reliance, or an agent acting beyond its brief). Record residual risk you might later accept. Align language with your organisation’s method — NCSC’s basic risk assessment guidance and CAF A2 are the UK starting points; NIST SP 800-30 is a detailed alternative. Avoid teaching DREAD: it often produces false precision, and it is not current Microsoft or NCSC practice.",
      "output": "A prioritised threat and risk list, with a short rationale for the top items.",
      "mistake": "Scoring everything “critical”, or ignoring AI-specific harms because they do not fit a classic CIA score neatly.",
      "ncsc": "Yes.",
      "sources": [
        "S1",
        "S5",
        "S20",
        "S35",
        "S36",
        "S61",
        "S62",
        "S63",
        "S64",
        "S26"
      ]
    },
    {
      "id": "mitigate",
      "num": 7,
      "short": "Mitigate",
      "title": "Decide mitigations",
      "full": "Decide proportionate mitigations",
      "purpose": "Choose what you will prevent, detect or recover from — or accept or transfer — and why.",
      "do": "For each priority threat, pick a proportionate control. Prefer measures that make compromise and disruption difficult, make detection easier, and reduce the impact of a compromise (NCSC secure design principles 2–5). Use ATT&CK and ATLAS mitigation guidance where it fits; for the pipeline, consider SLSA source and build practices; for models and agents, use NCSC’s secure AI development guidelines and the OWASP GenAI mitigations. For access, follow CAF B2 and Cloud Security Principles 9 and 10. Say clearly when you are accepting a risk, who accepted it, and until when. Put chosen work into the design, the backlog and the pipeline.",
      "output": "A mitigation plan mapped to threats, with owners, and an accept or transfer record where relevant.",
      "mistake": "A long control catalogue copied from a standard and not tied to the threats you found; or “accept” with no named owner.",
      "ncsc": "Yes.",
      "sources": [
        "S1",
        "S11",
        "S12",
        "S13",
        "S14",
        "S28",
        "S29a",
        "S22",
        "S22b",
        "S88",
        "S33",
        "S65",
        "S56"
      ],
      "sourceNotes": {
        "S56": "CISA Secure by Design is US guidance; not UK official policy."
      }
    },
    {
      "id": "validate",
      "num": 8,
      "short": "Validate",
      "title": "Validate",
      "full": "Validate with testing, red teaming and detection",
      "purpose": "Check that the model is good enough, that the controls work, and that you can detect important failures.",
      "do": "Ask NCSC’s fourth question: did we miss anything? Get a review from someone who was not in the workshop. Test the important controls — design review, automated security tests in the pipeline, and a penetration test for higher-risk services. If the service uses an LLM or an agent, include GenAI red teaming (OWASP guide, January 2025), not only a conventional web test. Check that logging and detection would notice the priority attacks (CAF C1; NCSC design principle 4). Any LLM-assisted review is itself a draft until a person accepts it. Track known issues so a later test confirms residual risk rather than surprising you.",
      "output": "Review comments, test or red-team evidence, detection coverage notes, and an updated residual-issue list.",
      "mistake": "Treating workshop notes as finished work, with no test of the controls and no thought about detection.",
      "ncsc": "Partial. NCSC has pages on testing, review and continual improvement, but none that is a GenAI red-teaming method; that links to the OWASP GenAI Red Teaming Guide.",
      "sources": [
        "S1",
        "S4",
        "S15",
        "S18",
        "S23",
        "S13",
        "S72"
      ]
    },
    {
      "id": "record",
      "num": 9,
      "short": "Record",
      "title": "Record the model",
      "full": "Record a living artefact, preferably as code",
      "purpose": "Write the work down so others can use it, challenge it, and keep it next to the service.",
      "do": "Keep a living threat model: the diagram or model file, the threat list, the mitigations, residual risks and who accepted them. Prefer a file in the service repository (threat-modelling-as-code, or an exported Threat Dragon model) plus a short readable pack. A 40-page report that nobody opens is worse than a short, current file. Make clear this is community or organisational analysis, not an official government assessment. STIX is mentioned by NCSC for sharing threat information; most community teams will not need it.",
      "output": "A threat-model pack and, where practical, a version-controlled model file, with a date and an owner.",
      "mistake": "Notes left only on a whiteboard photograph, or a document that cannot be updated when the code changes.",
      "ncsc": "Partial. The NCSC threat-modelling page covers why outputs should be recorded and used, but there is no NCSC page on how to structure a threat-model document or a model-as-code file.",
      "sources": [
        "S1",
        "S20",
        "S37",
        "S78",
        "S80",
        "S41",
        "S29"
      ],
      "sourceNotes": {
        "S29": "This is government Secure by Design material, not an NCSC how-to, and GOV Assured should not present it as a required template."
      }
    },
    {
      "id": "continuous",
      "num": 10,
      "short": "Continuous",
      "title": "Keep it continuous",
      "full": "Keep it continuous in CI/CD",
      "purpose": "Keep the model alive as the system, the threats, or your assumptions change — in the same pipeline that ships the service.",
      "do": "Revisit the model when a change alters data flows, trust boundaries, identities, a model or agent, or a dependency; when a relevant incident or advisory appears; or on a planned cadence. If the model is in the repository, the pipeline can warn (or, where you have agreed a gate, block) when a new component has no review, or when the model file is stale. Feed monitoring, incidents and lessons learned back into stages 2 and 5 (CAF D2). An assistant can propose an update; a person accepts it. Retire the model when the service is retired.",
      "output": "Review triggers, pipeline checks if you use them, an updated model (or a dated “no material change” note), and a retirement note when the service ends.",
      "mistake": "A one-off workshop whose diagram is never opened again.",
      "ncsc": "Partial. NCSC covers making threat modelling business as usual in CI/CD, but has no page that specifies a particular tool or a pipeline gate for threat-model files.",
      "sources": [
        "S1",
        "S15",
        "S85",
        "S25",
        "S56",
        "S37"
      ],
      "sourceNotes": {
        "S56": "CISA Secure by Design (update as functionality changes) is US guidance; not UK official policy."
      }
    }
  ],
  "learn": {
    "scope": {
      "depth": {
        "basics": {
          "purpose": "Decide what you are modelling this time, why, and what “good enough” looks like.",
          "do": "Name the system or the change, set what is in scope and out of scope, agree who will take part, and time-box the work. The four questions (what are we working on; what can go wrong; what will we do about it; did we do a good enough job) are the handrail for the whole pass.",
          "output": "A short scoping note: what is in, what is out, who is involved, and how deep you will go.",
          "mistake": "Trying to model everything at once, or looking only at the new screen and missing the model, the identity provider, or the pipeline."
        },
        "practitioner": {
          "purpose": "Decide what you are modelling this time, why, and what “good enough” looks like.",
          "do": "Name the system or the change — a new feature, a new model or agent, a new cloud identity, a new dependency, or a change to CI/CD — and set in-scope and out-of-scope. Agree who will take part (this remains a team activity). Time-box the work. The four questions from the Threat Modeling Manifesto, which NCSC also uses as its handrail, are the foundation for the whole pass, not a separate method.",
          "output": "A short scoping note: system or change name, in-scope and out-of-scope (including AI components, identities, and the build pipeline), attendees, and depth.",
          "mistake": "Modelling the entire estate in one sitting, or scoping only the application code and leaving out the model, the identity provider, or the pipeline."
        },
        "architect": {
          "purpose": "Decide what you are modelling this time, why, and what “good enough” looks like — as a programme habit, not only a single workshop.",
          "do": "Name the system or the change — a new feature, a new model or agent, a new cloud identity, a new dependency, or a change to CI/CD — and set in-scope and out-of-scope. Agree who will take part (this remains a team activity). Time-box the work. Use the four questions as the foundation for the whole pass. The Threat Modeling Capabilities catalogue treats this as part of a programme (strategy, education, creating models, acting on them, communications, measurement, programme management), not a one-off workshop. OWASP’s cheat sheet also places threat modelling early in the lifecycle, then kept alive. There is no NCSC page devoted only to how to write a scope note; the NCSC threat-modelling page covers when and why to do the work, and asks for it to be folded into design, risk management and CI/CD.",
          "output": "A short scoping note: system or change name, in-scope and out-of-scope (including AI components, identities, and the build pipeline), attendees, and depth.",
          "mistake": "Modelling the entire estate in one sitting, or scoping only the application code and leaving out the model, the identity provider, or the pipeline."
        }
      },
      "quiz": {
        "question": "You are adding a cloud model that drafts text for users. What must be in scope as well as the new screen?",
        "options": [
          {
            "id": "a",
            "label": "The model API, its credentials, prompts and outputs, and any change to the pipeline — not only the new page.",
            "correct": true,
            "feedback": "Yes. The model API, its credentials, prompts and outputs, and any change to the pipeline must be in scope — not only the new page."
          },
          {
            "id": "b",
            "label": "Only the new screen and its buttons, because threat modelling starts after the feature ships.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          },
          {
            "id": "c",
            "label": "The entire estate in one sitting, so that nothing can be missed.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          }
        ]
      },
      "ncsc": "Partial. NCSC has a page on when and why to do the work, but none devoted only to how to write a scope note.",
      "chips": [
        {
          "id": "tm",
          "label": "threat modelling",
          "stage": "scope",
          "what": "A structured way to understand a system, who might harm it, what can go wrong, what you will do about it, and whether that work was good enough. NCSC treats it as a team workshop and asks for it to be folded into design, risk management and CI/CD.",
          "analogy": "Like a walk-through of a building before you open it, asking who might get in and what you will lock, rather than waiting for a break-in.",
          "without": "You only find problems after something goes wrong, or you harden the wrong part of the service.",
          "good": "A short, current model of this change, done as a team, and kept next to the service.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://www.threatmodelingmanifesto.org/",
            "label": "Threat Modeling Manifesto"
          }
        },
        {
          "id": "scope-term",
          "label": "scope",
          "stage": "scope",
          "what": "The decision about what you are modelling this time: the system or change, what is in and out, who takes part, and how deep is good enough. It should include AI components, identities and the build pipeline where they exist, not only application code.",
          "analogy": "Deciding which rooms you will inspect today, not trying to survey the whole street in one visit.",
          "without": "You either model the entire estate in one sitting, or you miss the model API, the identity provider or the pipeline.",
          "good": "A short scoping note that names the change, in-scope and out-of-scope, attendees and depth.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html",
            "label": "OWASP Threat Modeling Cheat Sheet"
          }
        },
        {
          "id": "fourq",
          "label": "four questions",
          "stage": "scope",
          "what": "The handrail used by the Threat Modeling Manifesto and by NCSC: what are we working on (or building); what can go wrong; what are we going to do about it; and did we do a good enough job? They underpin every stage of this lifecycle; they are not a separate four-stage method.",
          "analogy": "Four questions you keep asking, like a pilot’s checklist, rather than a one-page form you fill in once.",
          "without": "The work becomes a loose brainstorm with no way to tell whether you finished, or a claim that the four questions are the only four stages you need.",
          "good": "Each pass can answer the four questions, even when you use ten teaching stages to get there.",
          "link": {
            "href": "https://shostack.org/blog/four-question-frame/",
            "label": "The Four Question Framework"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "trigger",
          "label": "change trigger",
          "stage": "scope",
          "what": "The reason you start or reopen a pass: a new feature, a new model or agent, a new cloud identity, a new dependency, or a change to CI/CD — and later, a relevant incident or advisory.",
          "analogy": "The event that sends you back to the checklist: a new door, a new contractor, or a new alarm.",
          "without": "Threat modelling only happens when someone asks for a “security feature”, so real changes go unreviewed.",
          "good": "The scoping note names the change that triggered this pass.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html",
            "label": "OWASP Threat Modeling Cheat Sheet"
          }
        }
      ]
    },
    "landscape": {
      "depth": {
        "basics": {
          "purpose": "Understand who might try to harm this service, and which up-to-date catalogues apply — not a list from last year.",
          "do": "Say what the service does and what would go wrong if it failed. List plausible threat actors and their intent, motivation and capability. Then pick the current catalogues: ATT&CK v20.1 for conventional techniques; ATLAS 2026.10 and the current OWASP GenAI / Agentic guides if you use a model or an agent.",
          "output": "A short context statement, a short threat-actor list, and which catalogue versions you will use.",
          "mistake": "Jumping straight to technical threats, listing unrealistic nation-state actors, or using last year’s slide."
        },
        "practitioner": {
          "purpose": "Understand, with current sources, who might try to harm this service and which catalogues apply now — not a static list from a previous year.",
          "do": "Describe what the service does and what would go wrong if it failed. Using the best threat information you have, list plausible threat actors and their intent, motivation and capability (this is the first step on the NCSC threat-modelling page). Then pick the current catalogues that apply: ATT&CK v20.1 for conventional techniques; ATLAS 2026.10 and the OWASP GenAI / Agentic guides if the service uses a model or an agent; relevant advisories and your own incident history. This is not a classified intelligence product. NCSC secure design principle 1 includes “Establish the context” and 1.2, understand the threat model. CAF A2 is the risk-management hook.",
          "output": "A short context statement, a short threat-actor list, and a note of which catalogues and versions will be used on this pass.",
          "mistake": "Jumping straight to technical threats; listing nation-state actors that are not realistic for this service; or using an out-of-date ATT&CK or LLM Top 10 slide."
        },
        "architect": {
          "purpose": "Understand, with current sources, who might try to harm this service and which catalogues apply now — not a static list from a previous year.",
          "do": "Describe what the service does and what would go wrong if it failed. Using the best threat information you have, list plausible threat actors and their intent, motivation and capability (the first step on the NCSC threat-modelling page). Pick the current catalogues: ATT&CK v20.1 (current from 13 October 2026) for conventional techniques; ATLAS 2026.10 (28 October 2026) and the OWASP GenAI / Agentic guides if the service uses a model or an agent; relevant advisories and your own incident history. This is not a classified intelligence product. UK Government Security “Sourcing a threat assessment” is useful public guidance, but it is government Secure by Design policy, not NCSC, and is not mandatory for this community. security.gov.uk pages were in Beta when checked and are written for government departments; they must not be presented as rules for this community site.",
          "output": "A short context statement, a short threat-actor list, and a note of which catalogues and versions will be used on this pass.",
          "mistake": "Jumping straight to technical threats; listing nation-state actors that are not realistic for this service; or using an out-of-date ATT&CK or LLM Top 10 slide."
        }
      },
      "quiz": {
        "question": "Why is “use last year’s ATT&CK slide” a weak way to start?",
        "options": [
          {
            "id": "a",
            "label": "Catalogues are updated; the current ATT&CK and, if you use AI, ATLAS and the current OWASP GenAI guides should be the ones you check.",
            "correct": true,
            "feedback": "Yes. Catalogues are updated; the current ATT&CK and, if you use AI, ATLAS and the current OWASP GenAI guides should be the ones you check."
          },
          {
            "id": "b",
            "label": "Last year’s slide is enough if it already lists nation-state actors.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          },
          {
            "id": "c",
            "label": "ATT&CK is a one-off mnemonic, so the version does not matter.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          }
        ]
      },
      "ncsc": "Yes.",
      "chips": [
        {
          "id": "actor",
          "label": "threat actor",
          "stage": "landscape",
          "what": "Someone or some group who might try to harm the service. NCSC’s first step is to understand who might be motivated to harm you, with their intent, motivation and capability. List actors that are plausible for this service, not a generic list of nation states.",
          "analogy": "Asking who might actually try to break in, rather than listing every burglar in the country.",
          "without": "You jump straight to technical threats, or you list actors that are not realistic for this service.",
          "good": "A short, realistic threat-actor list used to choose catalogues and later to judge likelihood.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/establish-the-context-before-designing-a-system",
            "label": "NCSC — Principle 1: Establish the context"
          }
        },
        {
          "id": "intent",
          "label": "intent",
          "stage": "landscape",
          "what": "What a threat actor is trying to achieve — their motivation and what success looks like for them. It sits with capability when you judge who is relevant.",
          "analogy": "The difference between someone who wants to deface a homepage and someone who wants a copy of every draft plan.",
          "without": "You treat every actor as having the same goal, so you prioritise the wrong work.",
          "good": "Each listed actor has a short note of intent and motivation that is plausible for this service.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "capability",
          "label": "capability",
          "stage": "landscape",
          "what": "What a threat actor can actually do — their skill, access and resources. Used with intent when you decide who is relevant and, later, how likely a threat is.",
          "analogy": "Knowing whether you are planning for a curious passer-by or a well-equipped specialist.",
          "without": "You assume every actor can do everything, or you ignore a realistic actor who already has enough capability.",
          "good": "Capability is stated in plain language and used when you later assess likelihood.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "attack",
          "label": "ATT&CK",
          "stage": "landscape",
          "what": "MITRE ATT&CK is a living catalogue of adversary techniques. The current version when this page was checked was v20.1, from 13 October 2026. Use the current site for conventional techniques that actually fit this system, not a frozen teaching slide, and not the entire matrix pasted into the model.",
          "analogy": "An up-to-date catalogue of known methods, like a current field guide rather than last year’s photocopied page.",
          "without": "You start from last year’s slide, or you dump every technique into the model.",
          "good": "The pass names ATT&CK v20.1 (or whatever is current) and uses only techniques that fit.",
          "link": {
            "href": "https://attack.mitre.org/",
            "label": "MITRE ATT&CK"
          }
        },
        {
          "id": "atlas",
          "label": "ATLAS",
          "stage": "landscape",
          "what": "MITRE ATLAS (Adversarial Threat Landscape for AI Systems) is a separate, living knowledge base for attacks involving AI. Content version 2026.10 is dated 28 October 2026. Reach for ATLAS, not ATT&CK alone, when the system includes a model or an agent.",
          "analogy": "The AI-focused field guide you pick up when the service uses a model or an agent.",
          "without": "You only use ATT&CK or STRIDE on an LLM or agent and miss AI-specific threats.",
          "good": "If the service uses a model or an agent, the pass names ATLAS 2026.10 (or whatever is current) as a catalogue.",
          "link": {
            "href": "https://atlas.mitre.org/",
            "label": "MITRE ATLAS"
          }
        },
        {
          "id": "cti",
          "label": "cyber threat intelligence (CTI)",
          "stage": "landscape",
          "what": "The best threat information you have — catalogues, advisories and your own incident history — used to understand who might harm this service. This lifecycle is not a classified intelligence product.",
          "analogy": "Reading current reports and your own incident notes before you guess what might go wrong.",
          "without": "You invent a dramatic actor list, or you rely on a static slide and ignore recent advisories.",
          "good": "A short note of which current sources and versions informed this pass.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/establish-the-context-before-designing-a-system",
            "label": "NCSC — Principle 1: Establish the context"
          }
        }
      ]
    },
    "model": {
      "depth": {
        "basics": {
          "purpose": "Draw a good-enough picture of how the service actually runs, including the parts a neat web-app diagram often misses.",
          "do": "Show the components (including users), the data flows, and connections to other systems. Include, where they exist, the identity provider, CI/CD, third-party packages and model providers, any LLM or agent, data stores and external feeds. A data flow diagram is the usual form. The model will never be perfect.",
          "output": "A labelled diagram, or a model file in the repository, of components and flows.",
          "mistake": "A neat picture of the web app that leaves out the identity provider, the pipeline, or the model API."
        },
        "practitioner": {
          "purpose": "Draw a good-enough picture of how the service actually runs, including the parts classic application diagrams often miss.",
          "do": "The foundation, from NCSC, is a model good enough for analysis: components (including users), data flows, connections to other systems, and — marked properly in stage 4 — trust boundaries. A data flow diagram (DFD) is the usual form; an architecture or use-case diagram also works. The model should include, where they exist: the identity provider and cloud IAM (users and service identities); CI/CD and artefact registries; third-party packages and model providers; any LLM or agent, its tools, memory and callbacks; data stores; and external feeds. You can start from a whiteboard, or from threat-modelling-as-code (for example pytm or Threagile YAML) in the same repository. An LLM may draft a diagram; a person who knows the system must correct it. The model will never be perfect.",
          "output": "A DFD or architecture model, or a checked-in model file, with components and flows labelled.",
          "mistake": "A neat diagram of the web app that omits the identity provider, the build pipeline, admin paths, backups, or the model API."
        },
        "architect": {
          "purpose": "Draw a good-enough picture of how the service actually runs, including the parts classic application diagrams often miss.",
          "do": "The foundation, from NCSC threat modelling Stage 1, is a model good enough for analysis: components (including users), data flows, connections to other systems, and trust boundaries in the next stage. Include the identity provider and cloud IAM (Cloud Security Principles 9 and 10, including service identities), CI/CD and artefact registries (Principle 7; NCSC secure development and deployment), third-party packages and model providers, any LLM or agent, its tools, memory and callbacks, data stores and external feeds. NCSC machine-learning principle 1.2 is “Model the threats to your system”. The agentic AI blog asks you to model failure scenarios before deployment. You can start from a whiteboard or from threat-modelling-as-code: pytm v1.4.1, Threagile (latest tag v0.9.1, 30 July 2024 — the tag may lag the code), or an exported Threat Dragon model. An LLM may draft a diagram; a person who knows the system must correct it. No NCSC page endorses replacing a workshop with a model. The model will never be perfect.",
          "output": "A DFD or architecture model, or a checked-in model file, with components and flows labelled.",
          "mistake": "A neat diagram of the web app that omits the identity provider, the build pipeline, admin paths, backups, or the model API."
        }
      },
      "quiz": {
        "question": "Which of these is most often missing from a neat web-app diagram?",
        "options": [
          {
            "id": "a",
            "label": "The identity provider, the CI/CD pipeline, or the model API — all three are in a “real system” model.",
            "correct": true,
            "feedback": "Yes. The identity provider, the CI/CD pipeline, or the model API are most often missing — all three belong in a “real system” model."
          },
          {
            "id": "b",
            "label": "Only the public home page, because that is what users see.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          },
          {
            "id": "c",
            "label": "A perfect diagram of every packet, because the model must be complete.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          }
        ]
      },
      "ncsc": "Yes.",
      "chips": [
        {
          "id": "dfd",
          "label": "data flow diagram (DFD)",
          "stage": "model",
          "what": "The usual form of a good-enough model for analysis: components (including users), data flows and connections to other systems. An architecture or use-case diagram also works. The model will never be perfect.",
          "analogy": "A simple map of who talks to whom and what moves between them, good enough to walk around, not a wiring diagram of every cable.",
          "without": "A neat picture of the web app that omits the identity provider, the pipeline, admin paths, backups or the model API.",
          "good": "A labelled DFD or equivalent that includes those real-system parts where they exist.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "sid",
          "label": "service identity",
          "stage": "model",
          "what": "A non-human identity a workload uses to call another service — for example a stored credential used to call a model API. Cloud Security Principles 9 and 10 cover user management and identity, including service identities. Treat these identities as first-class assets and entry points.",
          "analogy": "The staff pass a machine uses, not only the logins that people type.",
          "without": "The diagram shows users but not the credentials the app uses in the background.",
          "good": "Service identities appear on the model, with the trust boundary where they are used.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles/principle-10-identity-and-authentication",
            "label": "NCSC Cloud Security Principle 10: Identity and authentication"
          }
        },
        {
          "id": "cicd",
          "label": "CI/CD",
          "stage": "model",
          "what": "Continuous integration and continuous delivery: the pipeline that builds and deploys the service, including artefact registries. NCSC asks for threat modelling to be folded into CI/CD, and Cloud Security Principle 7 covers secure development and an automated pipeline.",
          "analogy": "The factory line that turns code into the running service.",
          "without": "The pipeline is left off the diagram, so a compromised build or a stolen service identity in the pipeline is never discussed.",
          "good": "CI/CD and artefact registries appear on the real-system model.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/developers-collection",
            "label": "NCSC — Secure development and deployment"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles/principle-7-secure-development",
            "label": "NCSC Cloud Security Principle 7: Secure development"
          }
        },
        {
          "id": "tmac",
          "label": "threat-modelling-as-code",
          "stage": "model",
          "what": "A practical option: the model is a YAML or Python file in the same repository as the service, checked on pull requests, and updated when architecture or dependencies change. Verified examples include OWASP pytm v1.4.1 (1 November 2026) and Threagile (latest tag v0.9.1, 30 July 2024 — the tag may lag the code). You can still start from a whiteboard.",
          "analogy": "Keeping the map in the same filing cabinet as the plans, so it is updated when the plans change.",
          "without": "The only record is a whiteboard photograph that nobody can update when the code changes.",
          "good": "Where practical, a version-controlled model file sits next to the service.",
          "link": {
            "href": "https://owasp.org/projects/pytm",
            "label": "OWASP pytm"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "agent",
          "label": "agent",
          "stage": "model",
          "what": "An AI component that can use tools, memory or callbacks, and may act beyond a single prompt-and-response. NCSC’s August 2026 blog gives interim advice on the cyber risk of agentic AI, including modelling failure scenarios before deployment. When an agent is in scope, ATLAS and the OWASP Agentic guides apply from stage 2 onwards.",
          "analogy": "A helper that can not only draft text but also take actions, so you have to model those actions and how they can go wrong.",
          "without": "The agent is treated as just another text box, and goal hijack, tool misuse or a rogue agent are never considered.",
          "good": "Any agent, its tools, memory and callbacks are on the model, and failure scenarios are thought through before deployment.",
          "link": {
            "href": "https://www.ncsc.gov.uk/blogs/managing-the-cyber-risk-of-agentic-ai",
            "label": "NCSC — Managing the cyber risk of agentic AI"
          },
          "link2": {
            "href": "https://atlas.mitre.org/",
            "label": "MITRE ATLAS"
          }
        },
        {
          "id": "mapi",
          "label": "model API",
          "stage": "model",
          "what": "The external (or internal) interface used to call a cloud or hosted model: prompts go out, outputs come back, usually with a service identity. It is one of the parts most often missing from a neat web-app diagram, and a trust boundary sits where that data and identity leave your app.",
          "analogy": "The hatch in the wall where you pass a question to an outside specialist and get an answer back.",
          "without": "The diagram stops at the new screen, so prompt injection, leaked credentials and untrue output are never placed on the model.",
          "good": "The model API, its credentials, prompts and outputs are in scope and on the diagram.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/machine-learning-principles/secure-design/model-threats",
            "label": "NCSC — Machine learning principles, 1.2 Model the threats to your system"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        }
      ]
    },
    "boundaries": {
      "depth": {
        "basics": {
          "purpose": "Be clear what you are protecting, who can act, and where trust changes.",
          "do": "Mark the data and functions that matter, including prompts and model outputs, credentials, database contents, and the integrity of feeds and the build. Treat identities and secrets as assets. Mark entry points and draw trust boundaries — for example browser to app, app to database, app to a model API, and pipeline to production. Do not treat everything inside “the cloud” as equally trusted.",
          "output": "Assets, identities, entry points and trust boundaries marked on the model.",
          "mistake": "Treating the cloud as one trusted place, or forgetting operators, service identities and the build system as entry points."
        },
        "practitioner": {
          "purpose": "Be explicit about what you are protecting, which identities can act, and where trust changes.",
          "do": "Mark the data and functions that matter — including organisation or user content, prompts and model outputs, API credentials, database contents, the integrity of public feeds, and the integrity of the build. Treat identities and secrets as first-class assets, not an afterthought. Mark entry points (web UI, APIs, admin, CI/CD, callbacks, tool interfaces). Draw trust boundaries: browser to app, app to database, app to a cloud model or other API, pipeline to production, and the identity provider. For personal data, privacy threats can be added later with LINDDUN; many community apps will have little personal data, so treat that as an optional track.",
          "output": "Assets, identities, entry points and trust boundaries marked on the model.",
          "mistake": "Treating everything inside “the cloud” as equally trusted, or forgetting operators, service identities and the build system as entry points."
        },
        "architect": {
          "purpose": "Be explicit about what you are protecting, which identities can act, and where trust changes.",
          "do": "Mark the data and functions that matter — including organisation or user content, prompts and model outputs, API credentials, database contents, the integrity of public feeds, and the integrity of the build. Treat identities and secrets as first-class assets. Mark entry points (web UI, APIs, admin, CI/CD, callbacks, tool interfaces). Draw trust boundaries: browser to app, app to database, app to a cloud model or other API, pipeline to production, and the identity provider. NCSC defines trust boundaries on its threat-modelling page. CAF A3 covers asset management and CAF B2 identity and access control; Cloud Security Principles 9 and 10 cover user management and identity, including service identities. NIST SP 800-154 (still a 2016 draft, not a final standard) is useful for identifying and characterising the system and data. LINDDUN has no NCSC page; use it only if personal data justifies a privacy track. The OWASP cheat sheet covers decomposition.",
          "output": "Assets, identities, entry points and trust boundaries marked on the model.",
          "mistake": "Treating everything inside “the cloud” as equally trusted, or forgetting operators, service identities and the build system as entry points."
        }
      },
      "quiz": {
        "question": "A workload in the cloud calls a model API with a stored credential. Where is a trust boundary?",
        "options": [
          {
            "id": "a",
            "label": "Where that service identity and the prompt data leave your app and enter the model provider.",
            "correct": true,
            "feedback": "Yes. A trust boundary is where that service identity and the prompt data leave your app and enter the model provider."
          },
          {
            "id": "b",
            "label": "Nowhere — everything inside “the cloud” is equally trusted.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          },
          {
            "id": "c",
            "label": "Only at the browser, because the model API is inside your network.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          }
        ]
      },
      "ncsc": "Yes.",
      "chips": [
        {
          "id": "asset",
          "label": "asset",
          "stage": "boundaries",
          "what": "Something you are protecting: data and functions that matter, including organisation or user content, prompts and model outputs, API credentials, database contents, the integrity of public feeds, and the integrity of the build. Identities and secrets are first-class assets, not an afterthought. CAF A3 covers asset management.",
          "analogy": "The valuables in the building — not only the furniture people can see, but also the keys and the integrity of the noticeboard.",
          "without": "You protect the web page and forget drafts, prompts, credentials or the build.",
          "good": "Assets are named on the model, including identities and secrets.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a3-asset-management",
            "label": "NCSC CAF — Principle A3 Asset management"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "entry",
          "label": "entry point",
          "stage": "boundaries",
          "what": "A place where someone or something can interact with the service: web UI, APIs, admin paths, CI/CD, callbacks and tool interfaces. Operators, service identities and the build system are entry points too.",
          "analogy": "Every door, hatch and service entrance, including the staff door and the loading bay, not only the front door.",
          "without": "You only mark the public website and miss admin paths, callbacks, or the pipeline.",
          "good": "Entry points are marked on the model, including operators, service identities and the build system.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html",
            "label": "OWASP Threat Modeling Cheat Sheet"
          }
        },
        {
          "id": "tb",
          "label": "trust boundary",
          "stage": "boundaries",
          "what": "A place where trust changes — for example browser to app, app to database, app to a cloud model or other API, pipeline to production, and the identity provider. NCSC defines trust boundaries on its threat-modelling page. Everything inside “the cloud” is not equally trusted. Where a service identity and prompt data leave your app and enter a model provider, that is a trust boundary.",
          "analogy": "The line between rooms with different keys: crossing it should be deliberate and visible on the map.",
          "without": "You treat the cloud as one trusted place, so a call to a model API looks like an internal step.",
          "good": "Trust boundaries are drawn at each hop where trust changes, including the model API and the pipeline.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "asurf",
          "label": "attack surface",
          "stage": "boundaries",
          "what": "The set of entry points and exposed flows an attacker could use. It grows when you add APIs, admin paths, CI/CD, callbacks, tool interfaces, or a model API. Marking assets, identities and trust boundaries makes that surface visible.",
          "analogy": "How much of the building is reachable from the street, the loading bay and the staff entrance.",
          "without": "The surface is assumed to be “just the website”, so new interfaces are never added to the model.",
          "good": "The marked entry points and trust boundaries give a realistic picture of the attack surface for this change.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html",
            "label": "OWASP Threat Modeling Cheat Sheet"
          }
        },
        {
          "id": "ssc",
          "label": "software supply chain",
          "stage": "boundaries",
          "what": "The third-party packages, model providers, artefact registries and build pipeline that your service depends on. Integrity of the build is an asset. NCSC supply-chain guidance (reviewed 22 October 2025) and CAF A4 are the UK hooks; SLSA v1.2 is an industry companion for CI/CD, dependencies and provenance.",
          "analogy": "Not only your own kitchen, but the suppliers, the delivery van and the packing room.",
          "without": "Dependencies and the pipeline are left off the model, so a poisoned package or a compromised build is never discussed.",
          "good": "Third-party packages, model providers and the build appear as part of the real system and its assets.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/supply-chain-security",
            "label": "NCSC — Supply chain security guidance"
          },
          "link2": {
            "href": "https://slsa.dev/spec/v1.2/",
            "label": "SLSA specification v1.2"
          }
        }
      ]
    },
    "threats": {
      "depth": {
        "basics": {
          "purpose": "Work out what can go wrong, using current catalogues for this system, then check with a structured method so whole classes of threat are not missed.",
          "do": "Take one part of the model at a time. Start with the catalogues you chose: ATT&CK where it fits; ATLAS and the OWASP LLM / Agentic lists for model and agent flows; SLSA and NCSC supply-chain guidance for the pipeline. Then apply STRIDE as a completeness check, and an attack tree for a high-value attacker goal. STRIDE alone does not cover every AI-specific harm. Do not paste an entire catalogue into the model.",
          "output": "A structured threat list, each item tied to a place on the model.",
          "mistake": "An unstructured brainstorm, listing every technique, or using only STRIDE on an LLM or agent and stopping there."
        },
        "practitioner": {
          "purpose": "Work out what can go wrong using up-to-date catalogues for this system, then use a structured method so whole classes of threat are not missed.",
          "do": "Take one part of the model at a time. Lead with the catalogues you chose in stage 2: ATT&CK techniques that actually fit; ATLAS and OWASP LLM / Agentic Top 10 for model and agent flows (prompt injection, goal hijack, tool misuse, data leakage in prompts, poisoning, unbounded consumption); SLSA and NCSC supply-chain guidance for the pipeline and dependencies. Then, as NCSC still recommends, apply a structured check: STRIDE (spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege) across the same boundary, and an attack tree for a high-value attacker goal. STRIDE is a foundation and a completeness check, not the only lens — it does not, on its own, cover several AI-specific harms. Do not paste the entire ATT&CK or ATLAS matrix into the model.",
          "output": "A structured threat list, each item tied to a place on the model and, where useful, to a catalogue ID.",
          "mistake": "An unstructured brainstorm; or listing every technique in a catalogue; or using only STRIDE on an LLM or agent and thinking the job is done."
        },
        "architect": {
          "purpose": "Work out what can go wrong using up-to-date catalogues for this system, then use a structured method so whole classes of threat are not missed.",
          "do": "Take one part of the model at a time. Lead with the catalogues from stage 2: ATT&CK v20.1 techniques that actually fit; ATLAS 2026.10 and OWASP LLM / Agentic Top 10 for model and agent flows (prompt injection, goal hijack, tool misuse, data leakage in prompts, poisoning, unbounded consumption); SLSA v1.2 and NCSC supply-chain guidance (reviewed 22 October 2025) for the pipeline and dependencies. Then, as NCSC threat modelling Stage 2 still recommends, apply STRIDE and an attack tree for a high-value attacker goal. The NCSC adversarial-attacks paper (29 April 2026) and CAF A4 are further hooks. STRIDE is a foundation and a completeness check, not the only lens — it does not, on its own, cover several AI-specific harms. There is no NCSC page for LINDDUN, SLSA, or how to apply the OWASP LLM Top 10. PASTA is an alternative risk-centric method, not the spine of this lifecycle. Do not paste the entire ATT&CK or ATLAS matrix into the model.",
          "output": "A structured threat list, each item tied to a place on the model and, where useful, to a catalogue ID.",
          "mistake": "An unstructured brainstorm; or listing every technique in a catalogue; or using only STRIDE on an LLM or agent and thinking the job is done."
        }
      },
      "quiz": {
        "question": "You have walked STRIDE on an LLM feature and found nothing about “the model being tricked into ignoring its instructions”. What should you do?",
        "options": [
          {
            "id": "a",
            "label": "Check ATLAS and the OWASP LLM / Agentic lists — STRIDE alone does not cover every AI-specific threat.",
            "correct": true,
            "feedback": "Yes. Check ATLAS and the OWASP LLM / Agentic lists — STRIDE alone does not cover every AI-specific threat."
          },
          {
            "id": "b",
            "label": "Stop there; STRIDE is the only lens you need for an LLM or agent.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          },
          {
            "id": "c",
            "label": "Paste the entire ATT&CK and ATLAS matrices into the model.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          }
        ]
      },
      "ncsc": "Partial. NCSC has pages on threat modelling and attack trees, but none for LINDDUN, SLSA, or applying the OWASP LLM Top 10; those link to their own sources.",
      "chips": [
        {
          "id": "stride",
          "label": "STRIDE",
          "stage": "threats",
          "what": "A structured check used across a boundary: spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege. NCSC still recommends it, with ATT&CK and attack trees, as a method. It is a foundation and a completeness check, not the only lens — it does not, on its own, cover several AI-specific harms.",
          "analogy": "A six-point inspection of each doorway, useful but not the only inspection when the service includes a model or an agent.",
          "without": "You use only STRIDE on an LLM or agent and think the job is done, or you skip a structured check and brainstorm only.",
          "good": "STRIDE is applied across the same boundaries as the catalogues, then ATLAS and OWASP lists are used where AI is in scope.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://www.microsoft.com/en-us/securityengineering/sdl/threatmodeling",
            "label": "Microsoft SDL threat modelling"
          }
        },
        {
          "id": "atree",
          "label": "attack tree",
          "stage": "threats",
          "what": "A structured way to explore how an attacker might reach a high-value goal, by breaking the goal into paths and conditions. NCSC has a page on using attack trees to understand cyber security risk, and also discusses them in Building and operating a secure online service.",
          "analogy": "A family tree of ways someone might reach one important goal, so you can see the most likely or damaging paths.",
          "without": "You only list isolated techniques and never work through how they combine to reach a goal.",
          "good": "At least one high-value attacker goal has an attack tree, alongside catalogue and STRIDE findings.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/using-attack-trees-to-understand-cyber-security-risk",
            "label": "NCSC — Using attack trees"
          },
          "link2": {
            "href": "https://www.schneier.com/academic/archives/1999/12/attack_trees.html",
            "label": "Attack Trees"
          }
        },
        {
          "id": "capec",
          "label": "CAPEC",
          "stage": "threats",
          "what": "MITRE CAPEC is a catalogue of common attack patterns. It is a supporting catalogue when you identify threats, alongside ATT&CK, ATLAS and a structured method. Do not paste an entire catalogue into the model.",
          "analogy": "A library of known attack patterns you can consult, not a list you copy out in full.",
          "without": "Every pattern is dumped into the model, or the catalogue is ignored when a named pattern would have helped.",
          "good": "Where useful, a threat is tied to a catalogue ID that actually fits this part of the model.",
          "link": {
            "href": "https://capec.mitre.org/",
            "label": "MITRE CAPEC"
          }
        },
        {
          "id": "pinj",
          "label": "prompt injection",
          "stage": "threats",
          "what": "An AI-specific threat in which crafted input tricks a model into ignoring its instructions or leaking data. It appears in the OWASP LLM Top 10 2026 and in ATLAS. STRIDE alone does not reliably surface it. There is no NCSC page on how to apply the OWASP LLM Top 10.",
          "analogy": "Slipping a new instruction into a letter so the assistant who reads it does the wrong thing.",
          "without": "You walk STRIDE, find nothing about the model being tricked, and stop.",
          "good": "Model and agent flows are checked against ATLAS and the OWASP LLM / Agentic lists, including prompt injection.",
          "link": {
            "href": "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/",
            "label": "OWASP GenAI LLM Top 10 2026"
          },
          "link2": {
            "href": "https://atlas.mitre.org/",
            "label": "MITRE ATLAS"
          }
        },
        {
          "id": "agency",
          "label": "excessive agency",
          "stage": "threats",
          "what": "An AI-specific risk in which a model or agent can take actions beyond what is needed or intended. It is listed in the OWASP LLM Top 10 2026. Related agentic risks include tool misuse and an agent acting beyond its brief.",
          "analogy": "Giving a helper the keys to every room when it only needed a notepad.",
          "without": "You only score data theft and outages, and you miss an agent that can act too widely.",
          "good": "The model records what the agent or model is allowed to do, and excessive agency is on the threat list where it applies.",
          "link": {
            "href": "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/",
            "label": "OWASP GenAI LLM Top 10 2026"
          }
        },
        {
          "id": "hijack",
          "label": "goal hijack",
          "stage": "threats",
          "what": "An agentic threat in which an attacker steers an agent away from its intended goal. It is listed in the OWASP Top 10 for Agentic Applications 2026. STRIDE and PASTA must be expanded for AI threats of this kind.",
          "analogy": "Persuading a helper to chase a different task than the one you gave it.",
          "without": "You treat the agent as a simple text generator and never ask how its goal could be redirected.",
          "good": "Where an agent is in scope, goal hijack is checked using ATLAS and the OWASP Agentic lists.",
          "link": {
            "href": "https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/",
            "label": "OWASP Top 10 for Agentic Applications 2026"
          },
          "link2": {
            "href": "https://atlas.mitre.org/",
            "label": "MITRE ATLAS"
          }
        }
      ]
    },
    "prioritise": {
      "depth": {
        "basics": {
          "purpose": "Decide which threats matter most, given impact, likelihood and your risk appetite — including harms that are not only a data theft or an outage.",
          "do": "For each credible threat, consider impact and likelihood, using the actors you listed and the controls you already have. Rank them. For generative AI, also consider harms such as harmful or untrue output, over-reliance, or an agent acting beyond its brief. Do not score everything “critical”. Avoid DREAD; it often produces false precision and is not current Microsoft or NCSC practice.",
          "output": "A prioritised list, with a short rationale for the top items.",
          "mistake": "Scoring everything “critical”, or ignoring AI-specific harms because they do not fit a classic confidentiality, integrity or availability score."
        },
        "practitioner": {
          "purpose": "Decide which threats matter most, given impact, likelihood and your risk appetite, including harms that are not only confidentiality, integrity or availability.",
          "do": "For each credible threat, consider impact and likelihood, using the actors from stage 2 and the controls you already have. Rank them. For generative AI, also consider the kinds of risk called out in NIST AI 600-1 and NCSC’s ML and agentic advice (for example harmful or untrue output, over-reliance, or an agent acting beyond its brief). Record residual risk you might later accept. Align language with your organisation’s method — NCSC’s basic risk assessment guidance and CAF A2 are the UK starting points; NIST SP 800-30 is a detailed alternative. Avoid teaching DREAD: it often produces false precision, and it is not current Microsoft or NCSC practice.",
          "output": "A prioritised threat and risk list, with a short rationale for the top items.",
          "mistake": "Scoring everything “critical”, or ignoring AI-specific harms because they do not fit a classic CIA score neatly."
        },
        "architect": {
          "purpose": "Decide which threats matter most, given impact, likelihood and your risk appetite, including harms that are not only confidentiality, integrity or availability.",
          "do": "For each credible threat, consider impact and likelihood, using the actors from stage 2 and the controls you already have. Rank them. For generative AI, also consider the kinds of risk called out in NIST AI 600-1 (published 26 July 2024) and NCSC’s ML principle 1.2 and agentic advice (for example harmful or untrue output, over-reliance, or an agent acting beyond its brief). AI RMF 1.0 (26 January 2023) remains the current framework; it is not yet a 2.0 publication. Record residual risk you might later accept. Align language with your organisation’s method — NCSC’s basic risk assessment guidance and CAF A2 are the UK starting points; NIST SP 800-30 Rev. 1 is a detailed alternative. Avoid teaching DREAD: it often produces false precision, and it is not current Microsoft or NCSC practice.",
          "output": "A prioritised threat and risk list, with a short rationale for the top items.",
          "mistake": "Scoring everything “critical”, or ignoring AI-specific harms because they do not fit a classic CIA score neatly."
        }
      },
      "quiz": {
        "question": "Why might a wrong but confident continuity plan matter even if no data was stolen?",
        "options": [
          {
            "id": "a",
            "label": "AI-specific harm: people may rely on untrue output.",
            "correct": true,
            "feedback": "Yes. That is an AI-specific harm: people may rely on untrue output."
          },
          {
            "id": "b",
            "label": "It does not matter, because only confidentiality, integrity and availability count.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          },
          {
            "id": "c",
            "label": "It only matters if you scored it “critical” with DREAD.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          }
        ]
      },
      "ncsc": "Yes.",
      "chips": [
        {
          "id": "appetite",
          "label": "risk appetite",
          "stage": "prioritise",
          "what": "How much risk you are prepared to take, used with impact and likelihood when you decide which threats matter most. NCSC threat modelling Stage 3 covers risk appetite and risk treatment; CAF A2 and NCSC’s basic risk assessment method are the UK starting points.",
          "analogy": "How much residual mess you are willing to live with, agreed in advance, not decided quietly at the end.",
          "without": "Everything is scored “critical”, or accepted risks have no relation to an agreed appetite.",
          "good": "Priorities and any accepted residual risk are stated against a clear appetite.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/a-basic-risk-assessment-and-management-method",
            "label": "NCSC — A basic risk assessment and management method"
          }
        },
        {
          "id": "likelihood",
          "label": "likelihood",
          "stage": "prioritise",
          "what": "How plausible a threat is, given the actors from stage 2 and the controls you already have. Used with impact to rank threats. Avoid DREAD: it often produces false precision, and it is not current Microsoft or NCSC practice.",
          "analogy": "A plain-language view of how likely this is, not a made-up score to two decimal places.",
          "without": "Unrealistic actors make everything look likely, or a scoring scheme gives a false sense of precision.",
          "good": "Each priority item has a short, reasoned view of likelihood, tied to realistic actors and existing controls.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/a-basic-risk-assessment-and-management-method",
            "label": "NCSC — A basic risk assessment and management method"
          }
        },
        {
          "id": "impact",
          "label": "impact",
          "stage": "prioritise",
          "what": "How bad it would be if the threat succeeded. Include harms that are not only confidentiality, integrity or availability — for generative AI, also harmful or untrue output, over-reliance, or an agent acting beyond its brief.",
          "analogy": "Not only “was data stolen?”, but also “did people act on a confident but wrong plan?”",
          "without": "You ignore AI-specific harms because they do not fit a classic CIA score neatly.",
          "good": "Impact statements cover classic harm and, where relevant, AI-specific harm.",
          "link": {
            "href": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
            "label": "NIST AI 600-1 PDF"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/a-basic-risk-assessment-and-management-method",
            "label": "NCSC — A basic risk assessment and management method"
          }
        },
        {
          "id": "residual",
          "label": "residual risk",
          "stage": "prioritise",
          "what": "The risk that remains after you take account of the controls you already have, and that you might later accept. Record it so stage 7 can assign an owner, and so later tests confirm it rather than surprise you.",
          "analogy": "What is still at stake after the locks you already have are taken into account.",
          "without": "Residual risk is left implicit, so “accept” later has nothing written down.",
          "good": "Residual risk is recorded for items you might later accept, with enough detail to assign an owner.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a2-risk-management",
            "label": "NCSC CAF — Principle A2 Risk management"
          }
        },
        {
          "id": "aiharm",
          "label": "AI-specific harm",
          "stage": "prioritise",
          "what": "A harm that may not fit a classic confidentiality, integrity or availability score neatly — for example harmful or untrue output, over-reliance, or an agent acting beyond its brief. Called out in NIST AI 600-1 and in NCSC’s ML and agentic advice. A wrong but confident continuity plan can matter even if no data was stolen, because people may rely on untrue output.",
          "analogy": "The damage from a confident wrong answer, not only from a stolen file.",
          "without": "You only rank data theft and outages, and untrue or over-confident output never makes the list.",
          "good": "AI-specific harms are included in the prioritised list where a model or agent is in scope.",
          "link": {
            "href": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
            "label": "NIST AI 600-1 PDF"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/machine-learning-principles/secure-design/model-threats",
            "label": "NCSC — Machine learning principles, 1.2"
          }
        }
      ]
    },
    "mitigate": {
      "depth": {
        "basics": {
          "purpose": "Choose what you will prevent, detect or recover from — or accept or transfer — and why.",
          "do": "For each priority threat, pick a proportionate control. Prefer measures that make compromise and disruption difficult, make detection easier, and reduce the impact of a compromise. Say clearly when you are accepting a risk, who accepted it, and until when. Put the work into the design, the backlog and the pipeline.",
          "output": "A mitigation plan mapped to threats, with owners, and an accept or transfer record where relevant.",
          "mistake": "A long control list copied from a standard and not tied to the threats you found; or “accept” with no named owner."
        },
        "practitioner": {
          "purpose": "Choose what you will prevent, detect or recover from — or accept or transfer — and why.",
          "do": "For each priority threat, pick a proportionate control. Prefer measures that make compromise and disruption difficult, make detection easier, and reduce the impact of a compromise (NCSC secure design principles 2–5). Use ATT&CK and ATLAS mitigation guidance where it fits; for the pipeline, consider SLSA source and build practices; for models and agents, use NCSC’s secure AI development guidelines and the OWASP GenAI mitigations. For access, follow CAF B2 and Cloud Security Principles 9 and 10. Say clearly when you are accepting a risk, who accepted it, and until when. Put chosen work into the design, the backlog and the pipeline.",
          "output": "A mitigation plan mapped to threats, with owners, and an accept or transfer record where relevant.",
          "mistake": "A long control catalogue copied from a standard and not tied to the threats you found; or “accept” with no named owner."
        },
        "architect": {
          "purpose": "Choose what you will prevent, detect or recover from — or accept or transfer — and why.",
          "do": "For each priority threat, pick a proportionate control. Prefer NCSC secure design principles 2–5 (make compromise and disruption difficult, make detection easier, reduce the impact of a compromise). Use ATT&CK and ATLAS mitigation guidance where it fits; for the pipeline, consider SLSA v1.2 source and build practices; for models and agents, use NCSC’s guidelines for secure AI system development (v1.0, 27 November 2023) and the OWASP GenAI mitigations. For access, follow CAF B2 and B4 and Cloud Security Principles 9 and 10. SSDF 1.1 practice PW.1, and SP 800-218A for AI software practices, are useful industry companions; SSDF 1.2 is still a draft and should not be treated as final. CISA Secure by Design is US guidance, not UK official policy. Say clearly when you are accepting a risk, who accepted it, and until when. Put chosen work into the design, the backlog and the pipeline.",
          "output": "A mitigation plan mapped to threats, with owners, and an accept or transfer record where relevant.",
          "mistake": "A long control catalogue copied from a standard and not tied to the threats you found; or “accept” with no named owner."
        }
      },
      "quiz": {
        "question": "What is wrong with “accepted” on a risk with no name next to it?",
        "options": [
          {
            "id": "a",
            "label": "Acceptance needs a named owner and a review point.",
            "correct": true,
            "feedback": "Yes. Acceptance needs a named owner and a review point."
          },
          {
            "id": "b",
            "label": "Nothing — “accept” can be left blank if the control catalogue is long.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          },
          {
            "id": "c",
            "label": "The word “accepted” is never allowed; every risk must be transferred.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          }
        ]
      },
      "ncsc": "Yes.",
      "chips": [
        {
          "id": "mitigation",
          "label": "mitigation",
          "stage": "mitigate",
          "what": "A proportionate control you will use to prevent, detect or recover from a priority threat — or a decision to accept or transfer it. Prefer measures that make compromise and disruption difficult, make detection easier, and reduce the impact of a compromise (NCSC secure design principles 2–5). Put chosen work into the design, the backlog and the pipeline.",
          "analogy": "The specific locks, alarms and backup plans you choose for the doors you actually worry about, not a copied catalogue of every possible lock.",
          "without": "A long control list copied from a standard and not tied to the threats you found.",
          "good": "Each priority threat has a mapped mitigation (or an accept or transfer record) with an owner.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/making-compromise-difficult",
            "label": "NCSC — Principle 2: Make compromise difficult"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "slsa",
          "label": "SLSA",
          "stage": "mitigate",
          "what": "Supply-chain Levels for Software Artifacts. Version 1.2 was announced 24 November 2025 and adds a Source Track alongside the Build Track. Its threats and mitigations pages are an industry companion to NCSC supply-chain guidance when you model CI/CD, dependencies and provenance. There is no NCSC page for SLSA itself.",
          "analogy": "A set of levels for how you build and prove where software came from, used when you choose pipeline mitigations.",
          "without": "Pipeline and dependency threats have no provenance or build practice attached.",
          "good": "Where the pipeline is in scope, SLSA v1.2 source and build practices are considered as mitigations.",
          "link": {
            "href": "https://slsa.dev/spec/v1.2/",
            "label": "SLSA specification v1.2"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/supply-chain-security",
            "label": "NCSC — Supply chain security guidance"
          }
        },
        {
          "id": "accept",
          "label": "accept",
          "stage": "mitigate",
          "what": "A decision to live with a residual risk rather than prevent, detect, recover or transfer it. Acceptance needs a named owner and a review point (“who accepted it, and until when”). “Accepted” with no name next to it is not a complete decision.",
          "analogy": "Signing the exception in a named person’s book, with a date to look at it again — not ticking a box and walking away.",
          "without": "“Accept” appears with no owner and no review date.",
          "good": "Every accepted risk has a named owner and a review point, written in the mitigation plan.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a2-risk-management",
            "label": "NCSC CAF — Principle A2 Risk management"
          }
        },
        {
          "id": "transfer",
          "label": "transfer",
          "stage": "mitigate",
          "what": "A decision that another party will carry the residual risk (for example by contract or insurance), instead of preventing, detecting, recovering from or accepting it yourself. Like accept, it should be recorded with an owner and enough detail to be challenged.",
          "analogy": "Handing a residual risk to someone else, in writing, rather than assuming it has gone away.",
          "without": "“Transfer” is stated with no record of to whom, or with no owner for the decision.",
          "good": "Any transferred risk is written in the plan, with an owner and the other party named.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        }
      ]
    },
    "validate": {
      "depth": {
        "basics": {
          "purpose": "Check that the model is good enough, that the controls work, and that you can detect important failures.",
          "do": "Ask whether you missed anything. Get a review from someone who was not in the workshop. Test the important controls. If the service uses an LLM or an agent, include GenAI red teaming, not only a conventional web scan. Check that logging and detection would notice the priority attacks.",
          "output": "Review comments, test or red-team evidence, detection notes, and an updated list of residual issues.",
          "mistake": "Treating workshop notes as finished work, with no test of the controls and no thought about detection."
        },
        "practitioner": {
          "purpose": "Check that the model is good enough, that the controls work, and that you can detect important failures.",
          "do": "Ask NCSC’s fourth question: did we miss anything? Get a review from someone who was not in the workshop. Test the important controls — design review, automated security tests in the pipeline, and a penetration test for higher-risk services. If the service uses an LLM or an agent, include GenAI red teaming (OWASP guide, January 2025), not only a conventional web test. Check that logging and detection would notice the priority attacks (CAF C1; NCSC design principle 4). Any LLM-assisted review is itself a draft until a person accepts it. Track known issues so a later test confirms residual risk rather than surprising you.",
          "output": "Review comments, test or red-team evidence, detection coverage notes, and an updated residual-issue list.",
          "mistake": "Treating workshop notes as finished work, with no test of the controls and no thought about detection."
        },
        "architect": {
          "purpose": "Check that the model is good enough, that the controls work, and that you can detect important failures.",
          "do": "Ask NCSC’s fourth question (threat modelling Stage 4): did we miss anything? Get a review from someone who was not in the workshop. Test the important controls — design review, automated security tests in the pipeline (NCSC secure development and deployment: “continually test”), and a penetration test for higher-risk services. If the service uses an LLM or an agent, include GenAI red teaming using the OWASP GenAI Red Teaming Guide v1.0 (23 January 2025), not only a conventional web test. There is no NCSC page that is a GenAI red-teaming method. Check that logging and detection would notice the priority attacks (CAF C1; NCSC design principle 4). Any LLM-assisted review is itself a draft until a person accepts it. Track known issues so a later test confirms residual risk rather than surprising you. NCSC’s “How to gain and maintain assurance” and “Building a secure digital service” are the wider assurance hooks.",
          "output": "Review comments, test or red-team evidence, detection coverage notes, and an updated residual-issue list.",
          "mistake": "Treating workshop notes as finished work, with no test of the controls and no thought about detection."
        }
      },
      "quiz": {
        "question": "You have a new agent feature. Why is a conventional web scan not enough?",
        "options": [
          {
            "id": "a",
            "label": "You also need tests that target agent or GenAI failures — for example prompt injection and tool misuse — and a view of detection.",
            "correct": true,
            "feedback": "Yes. You also need tests that target agent or GenAI failures — for example prompt injection and tool misuse — and a view of detection."
          },
          {
            "id": "b",
            "label": "A conventional web scan already covers prompt injection and tool misuse.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          },
          {
            "id": "c",
            "label": "Workshop notes are finished work, so no further test is needed.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          }
        ]
      },
      "ncsc": "Partial. NCSC has pages on testing, review and continual improvement, but none that is a GenAI red-teaming method; that links to the OWASP GenAI Red Teaming Guide.",
      "chips": [
        {
          "id": "assurance",
          "label": "assurance",
          "stage": "validate",
          "what": "Evidence that the model is good enough and that important controls work, including a review from someone who was not in the workshop. NCSC’s “How to gain and maintain assurance” is the hook; the fourth question is “did we miss anything?”",
          "analogy": "A second pair of eyes, plus tests, so the walk-through is not the last word.",
          "without": "Workshop notes are treated as finished work.",
          "good": "A review from outside the workshop, plus test or red-team evidence, is on file.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/how-to-gain-and-maintain-assurance",
            "label": "NCSC — How to gain and maintain assurance"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "stest",
          "label": "security testing",
          "stage": "validate",
          "what": "Tests of the important controls: design review, automated security tests in the pipeline, and a penetration test for higher-risk services. NCSC secure development and deployment asks you to “continually test”. A conventional web scan is not enough when the service has an LLM or an agent.",
          "analogy": "Trying the locks and alarms, not only writing down that they exist.",
          "without": "No test of the controls, so residual issues only appear in an incident.",
          "good": "Important controls have test evidence, including pipeline tests where you use them.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/developers-collection",
            "label": "NCSC — Secure development and deployment"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "rt",
          "label": "red teaming",
          "stage": "validate",
          "what": "A focused attempt to find failures the workshop missed. If the service uses an LLM or an agent, include GenAI red teaming (OWASP GenAI Red Teaming Guide v1.0, 23 January 2025), covering failures such as prompt injection and tool misuse, not only a conventional web test. There is no NCSC page that is a GenAI red-teaming method.",
          "analogy": "Asking a specialist to try to trick the new agent, not only to scan the website.",
          "without": "A conventional web scan is treated as enough for an agent or LLM feature.",
          "good": "LLM or agent features have a GenAI red-team pass, and conventional tests still cover the rest of the service.",
          "link": {
            "href": "https://genai.owasp.org/download/44859/",
            "label": "OWASP GenAI Red Teaming Guide v1.0"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        },
        {
          "id": "detection",
          "label": "detection",
          "stage": "validate",
          "what": "Whether logging and monitoring would notice the priority attacks. NCSC design principle 4 is “make compromise detection easier”; CAF C1 covers security monitoring. Stage 8 should include a view of detection, not only prevention tests.",
          "analogy": "Checking that the alarm would actually sound, not only that a lock was fitted.",
          "without": "Controls are tested, but nobody asks whether you would notice the priority attacks.",
          "good": "Detection coverage notes sit with the test evidence for the priority threats.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/making-compromise-detection-easier",
            "label": "NCSC — Principle 4: Make compromise detection easier"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-c-detecting-cyber-security-events/principle-c1-security-monitoring",
            "label": "NCSC CAF — Principle C1 Security monitoring"
          }
        }
      ]
    },
    "record": {
      "depth": {
        "basics": {
          "purpose": "Write the work down so others can use it, challenge it, and keep it next to the service.",
          "do": "Keep a living threat model: the diagram or model file, the threat list, the mitigations, residual risks and who accepted them. If the team already keeps code in git, prefer a file in the same repository plus a short readable pack. A long report that nobody opens is worse than a short, current file. Make clear this is community or organisational analysis, not an official government assessment.",
          "output": "A short pack and, where practical, a version-controlled model file, with a date and an owner.",
          "mistake": "Notes left only on a whiteboard photograph, or a document that cannot be updated when the code changes."
        },
        "practitioner": {
          "purpose": "Write the work down so others can use it, challenge it, and keep it next to the service.",
          "do": "Keep a living threat model: the diagram or model file, the threat list, the mitigations, residual risks and who accepted them. Prefer a file in the service repository (threat-modelling-as-code, or an exported Threat Dragon model) plus a short readable pack. A 40-page report that nobody opens is worse than a short, current file. Make clear this is community or organisational analysis, not an official government assessment. STIX is mentioned by NCSC for sharing threat information; most community teams will not need it.",
          "output": "A threat-model pack and, where practical, a version-controlled model file, with a date and an owner.",
          "mistake": "Notes left only on a whiteboard photograph, or a document that cannot be updated when the code changes."
        },
        "architect": {
          "purpose": "Write the work down so others can use it, challenge it, and keep it next to the service.",
          "do": "Keep a living threat model: the diagram or model file, the threat list, the mitigations, residual risks and who accepted them. Prefer a file in the service repository — threat-modelling-as-code with pytm or Threagile, or an exported Threat Dragon model — plus a short readable pack. The NCSC threat-modelling page covers why outputs should be recorded and used (articulate risks; feed risk treatment and assurance plans) and CAF A2 is the risk-management hook. There is no NCSC page on how to structure a threat-model document or a model-as-code file. UK Government Security has an example threat-model pack; it is government Secure by Design material, not an NCSC how-to, and GOV Assured should not present it as a required template. A 40-page report that nobody opens is worse than a short, current file. Make clear this is community or organisational analysis, not an official government assessment. STIX is mentioned by NCSC for sharing threat information; most community teams will not need it.",
          "output": "A threat-model pack and, where practical, a version-controlled model file, with a date and an owner.",
          "mistake": "Notes left only on a whiteboard photograph, or a document that cannot be updated when the code changes."
        }
      },
      "quiz": {
        "question": "Where should the living model live if the team already keeps code in git?",
        "options": [
          {
            "id": "a",
            "label": "In the repository, as a model file or exported diagram, with a short readable pack.",
            "correct": true,
            "feedback": "Yes. Keep it in the repository, as a model file or exported diagram, with a short readable pack."
          },
          {
            "id": "b",
            "label": "Only as a whiteboard photograph, so it stays informal.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          },
          {
            "id": "c",
            "label": "In a 40-page report that is not updated when the code changes.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          }
        ]
      },
      "ncsc": "Partial. The NCSC threat-modelling page covers why outputs should be recorded and used, but there is no NCSC page on how to structure a threat-model document or a model-as-code file.",
      "chips": [
        {
          "id": "artefact",
          "label": "threat model (the artefact)",
          "stage": "record",
          "what": "The living record of the work: the diagram or model file, the threat list, the mitigations, residual risks and who accepted them. Prefer a file in the service repository plus a short readable pack, with a date and an owner. This is community or organisational analysis, not an official government assessment. The NCSC page covers why outputs should be recorded and used; there is no NCSC page on how to structure the document or a model-as-code file.",
          "analogy": "The actual folder you can hand to a colleague, kept next to the code, not a photo of a whiteboard.",
          "without": "Notes exist only as a photograph, or as a long report that cannot be updated when the code changes.",
          "good": "A dated, owned pack and, where practical, a version-controlled model file sit with the service.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://owasp.org/projects/pytm",
            "label": "OWASP pytm"
          }
        },
        {
          "id": "rrrec",
          "label": "residual risk record",
          "stage": "record",
          "what": "The written list of residual risks, including who accepted them, that forms part of the living threat-model pack. It is what later tests should confirm, rather than rediscovering the same issues by surprise.",
          "analogy": "The signed list of what you have agreed to live with, kept with the model so it can be reviewed.",
          "without": "Accepted risks live only in someone’s memory, so a later test or a new colleague cannot see them.",
          "good": "The pack includes residual risks and who accepted them, with a date.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a2-risk-management",
            "label": "NCSC CAF — Principle A2 Risk management"
          }
        }
      ]
    },
    "continuous": {
      "depth": {
        "basics": {
          "purpose": "Keep the model alive as the system, the threats, or your assumptions change — in the same pipeline that ships the service.",
          "do": "Revisit the model when data flows, trust boundaries, identities, a model or agent, or a material dependency change, or when a relevant advisory appears — even if nobody asked for a “security feature”. Feed lessons learned back in. Retire the model when the service is retired.",
          "output": "Review triggers, an updated model or a dated “no material change” note, and a retirement note when the service ends.",
          "mistake": "A one-off workshop whose diagram is never opened again."
        },
        "practitioner": {
          "purpose": "Keep the model alive as the system, the threats, or your assumptions change — in the same pipeline that ships the service.",
          "do": "Revisit the model when a change alters data flows, trust boundaries, identities, a model or agent, or a dependency; when a relevant incident or advisory appears; or on a planned cadence. If the model is in the repository, the pipeline can warn (or, where you have agreed a gate, block) when a new component has no review, or when the model file is stale. Feed monitoring, incidents and lessons learned back into stages 2 and 5 (CAF D2). An assistant can propose an update; a person accepts it. Retire the model when the service is retired.",
          "output": "Review triggers, pipeline checks if you use them, an updated model (or a dated “no material change” note), and a retirement note when the service ends.",
          "mistake": "A one-off workshop whose diagram is never opened again."
        },
        "architect": {
          "purpose": "Keep the model alive as the system, the threats, or your assumptions change — in the same pipeline that ships the service.",
          "do": "Revisit the model when a change alters data flows, trust boundaries, identities, a model or agent, or a dependency; when a relevant incident or advisory appears; or on a planned cadence. NCSC already asked, in 2023, for threat modelling to be business as usual in risk management, development and CI/CD (Stage 4 continual improvement). Secure development and deployment and Cloud Security Principle 7 are the development hooks. If the model is in the repository, the pipeline can warn (or, where you have agreed a gate, block) when a new component has no review, or when the model file is stale. There is no NCSC page that specifies a particular tool or a pipeline gate for threat-model files. Feed monitoring, incidents and lessons learned back into stages 2 and 5 (CAF D2). CISA Secure by Design says to update as functionality changes; that is US guidance, not UK official policy. The OWASP cheat sheet says to maintain the model alongside the system. An assistant can propose an update; a person accepts it. Prompts must not contain secrets or other people’s data. Retire the model when the service is retired.",
          "output": "Review triggers, pipeline checks if you use them, an updated model (or a dated “no material change” note), and a retirement note when the service ends.",
          "mistake": "A one-off workshop whose diagram is never opened again."
        }
      },
      "quiz": {
        "question": "When must you reopen the model even if no “security feature” was requested?",
        "options": [
          {
            "id": "a",
            "label": "When data flows, trust boundaries, identities, the model or agent, or a material dependency change — or when a relevant advisory appears.",
            "correct": true,
            "feedback": "Yes. Reopen when data flows, trust boundaries, identities, the model or agent, or a material dependency change — or when a relevant advisory appears."
          },
          {
            "id": "b",
            "label": "Only when someone asks for a new security feature.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          },
          {
            "id": "c",
            "label": "Never; a one-off workshop is enough for the life of the service.",
            "correct": false,
            "feedback": "That is not what this stage teaches."
          }
        ]
      },
      "ncsc": "Partial. NCSC covers making threat modelling business as usual in CI/CD, but has no page that specifies a particular tool or a pipeline gate for threat-model files.",
      "chips": [
        {
          "id": "ctm",
          "label": "continuous threat modelling",
          "stage": "continuous",
          "what": "Keeping the model alive in the same pipeline that ships the service, as a business-as-usual activity in risk management, development and CI/CD. NCSC already asked for this in 2023. There is no NCSC page that specifies a particular tool or a pipeline gate for threat-model files.",
          "analogy": "Treating the map as something you update whenever the building changes, not a poster from the opening day.",
          "without": "A one-off workshop whose diagram is never opened again.",
          "good": "Review triggers exist, and the model is updated — or a dated “no material change” note is recorded.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/developers-collection",
            "label": "NCSC — Secure development and deployment"
          }
        },
        {
          "id": "rtrigger",
          "label": "review trigger",
          "stage": "continuous",
          "what": "A reason to reopen the model even if nobody requested a “security feature”: a change to data flows, trust boundaries, identities, a model or agent, or a material dependency; a relevant incident or advisory; or a planned cadence. If the model is in the repository, the pipeline can warn, or block where you have agreed a gate, when a new component has no review or the file is stale.",
          "analogy": "The events that automatically send you back to the map: a new doorway, a new supplier, or a new warning.",
          "without": "The model is only reopened when someone asks for a security feature.",
          "good": "Triggers are written down, and a pipeline check can warn when the model file is stale, if you use one.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          },
          "link2": {
            "href": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html",
            "label": "OWASP Threat Modeling Cheat Sheet"
          }
        },
        {
          "id": "lessons",
          "label": "lessons learned",
          "stage": "continuous",
          "what": "What monitoring, incidents and reviews teach you, fed back into stages 2 and 5. CAF D2 is the NCSC hook. The cycle is not complete until those lessons change the landscape or the threat list.",
          "analogy": "Writing down what the last alarm taught you, and using it the next time you walk the building.",
          "without": "Incidents are closed without updating the model, so the same gap recurs.",
          "good": "Lessons from monitoring and incidents are fed back into the landscape and the threat list.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-d/principle-d2-lessons-learned",
            "label": "NCSC CAF — Principle D2 Lessons learned"
          }
        },
        {
          "id": "llmdraft",
          "label": "LLM-assisted draft (human review)",
          "stage": "continuous",
          "what": "An assistant can draft a DFD, a threat list, a review of a change, or a proposed update to the model. It can also invent threats, miss context, and leak prompts if used carelessly. No NCSC page endorses replacing a workshop with a model. Any assisted draft needs a named human reviewer, and prompts must not contain secrets or other people’s data. This is emerging practice, not a verified standard method.",
          "analogy": "A first draft from a helper, which a person who knows the system must correct and accept.",
          "without": "An unreviewed draft is treated as the model, or prompts contain secrets or other people’s data.",
          "good": "Any assisted update is clearly a draft until a named person accepts it, and prompts are kept clean of secrets and other people’s data.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
            "label": "NCSC — Threat modelling"
          }
        }
      ]
    }
  },
  "glossary": [
    {
      "id": "tm",
      "term": "threat modelling",
      "stage": "scope",
      "def": "A structured way to understand a system, who might harm it, what can go wrong, what you will do about it, and whether that work was good enough.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "scope-term",
      "term": "scope",
      "stage": "scope",
      "def": "The decision about what you are modelling this time: the system or change, what is in and out, who takes part, and how deep is good enough.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "fourq",
      "term": "four questions",
      "stage": "scope",
      "def": "The handrail used by the Threat Modeling Manifesto and by NCSC: what are we working on (or building); what can go wrong; what are we going to do about it; and did we do a good enough job? They underpin every stage of this lifecycle; they are not a separate four-stage method.",
      "href": "https://shostack.org/blog/four-question-frame/"
    },
    {
      "id": "trigger",
      "term": "change trigger",
      "stage": "scope",
      "def": "The reason you start or reopen a pass: a new feature, a new model or agent, a new cloud identity, a new dependency, or a change to CI/CD — and later, a relevant incident or advisory.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "actor",
      "term": "threat actor",
      "stage": "landscape",
      "def": "Someone or some group who might try to harm the service.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "intent",
      "term": "intent",
      "stage": "landscape",
      "def": "What a threat actor is trying to achieve — their motivation and what success looks like for them.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "capability",
      "term": "capability",
      "stage": "landscape",
      "def": "What a threat actor can actually do — their skill, access and resources.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "attack",
      "term": "ATT&CK",
      "stage": "landscape",
      "def": "MITRE ATT&CK is a living catalogue of adversary techniques.",
      "href": "https://attack.mitre.org/"
    },
    {
      "id": "atlas",
      "term": "ATLAS",
      "stage": "landscape",
      "def": "MITRE ATLAS (Adversarial Threat Landscape for AI Systems) is a separate, living knowledge base for attacks involving AI.",
      "href": "https://atlas.mitre.org/"
    },
    {
      "id": "cti",
      "term": "cyber threat intelligence (CTI)",
      "stage": "landscape",
      "def": "The best threat information you have — catalogues, advisories and your own incident history — used to understand who might harm this service.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "dfd",
      "term": "data flow diagram (DFD)",
      "stage": "model",
      "def": "The usual form of a good-enough model for analysis: components (including users), data flows and connections to other systems.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "sid",
      "term": "service identity",
      "stage": "model",
      "def": "A non-human identity a workload uses to call another service — for example a stored credential used to call a model API.",
      "href": "https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles/principle-10-identity-and-authentication"
    },
    {
      "id": "cicd",
      "term": "CI/CD",
      "stage": "model",
      "def": "Continuous integration and continuous delivery: the pipeline that builds and deploys the service, including artefact registries.",
      "href": "https://www.ncsc.gov.uk/collection/developers-collection"
    },
    {
      "id": "tmac",
      "term": "threat-modelling-as-code",
      "stage": "model",
      "def": "A practical option: the model is a YAML or Python file in the same repository as the service, checked on pull requests, and updated when architecture or dependencies change.",
      "href": "https://owasp.org/projects/pytm"
    },
    {
      "id": "agent",
      "term": "agent",
      "stage": "model",
      "def": "An AI component that can use tools, memory or callbacks, and may act beyond a single prompt-and-response.",
      "href": "https://www.ncsc.gov.uk/blogs/managing-the-cyber-risk-of-agentic-ai"
    },
    {
      "id": "mapi",
      "term": "model API",
      "stage": "model",
      "def": "The external (or internal) interface used to call a cloud or hosted model: prompts go out, outputs come back, usually with a service identity.",
      "href": "https://www.ncsc.gov.uk/collection/machine-learning-principles/secure-design/model-threats"
    },
    {
      "id": "asset",
      "term": "asset",
      "stage": "boundaries",
      "def": "Something you are protecting: data and functions that matter, including organisation or user content, prompts and model outputs, API credentials, database contents, the integrity of public feeds, and the integrity of the build.",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a3-asset-management"
    },
    {
      "id": "entry",
      "term": "entry point",
      "stage": "boundaries",
      "def": "A place where someone or something can interact with the service: web UI, APIs, admin paths, CI/CD, callbacks and tool interfaces.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "tb",
      "term": "trust boundary",
      "stage": "boundaries",
      "def": "A place where trust changes — for example browser to app, app to database, app to a cloud model or other API, pipeline to production, and the identity provider.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "asurf",
      "term": "attack surface",
      "stage": "boundaries",
      "def": "The set of entry points and exposed flows an attacker could use.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "ssc",
      "term": "software supply chain",
      "stage": "boundaries",
      "def": "The third-party packages, model providers, artefact registries and build pipeline that your service depends on.",
      "href": "https://www.ncsc.gov.uk/collection/supply-chain-security"
    },
    {
      "id": "stride",
      "term": "STRIDE",
      "stage": "threats",
      "def": "A structured check used across a boundary: spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "atree",
      "term": "attack tree",
      "stage": "threats",
      "def": "A structured way to explore how an attacker might reach a high-value goal, by breaking the goal into paths and conditions.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/using-attack-trees-to-understand-cyber-security-risk"
    },
    {
      "id": "capec",
      "term": "CAPEC",
      "stage": "threats",
      "def": "MITRE CAPEC is a catalogue of common attack patterns.",
      "href": "https://capec.mitre.org/"
    },
    {
      "id": "pinj",
      "term": "prompt injection",
      "stage": "threats",
      "def": "An AI-specific threat in which crafted input tricks a model into ignoring its instructions or leaking data.",
      "href": "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/"
    },
    {
      "id": "agency",
      "term": "excessive agency",
      "stage": "threats",
      "def": "An AI-specific risk in which a model or agent can take actions beyond what is needed or intended.",
      "href": "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/"
    },
    {
      "id": "hijack",
      "term": "goal hijack",
      "stage": "threats",
      "def": "An agentic threat in which an attacker steers an agent away from its intended goal.",
      "href": "https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/"
    },
    {
      "id": "appetite",
      "term": "risk appetite",
      "stage": "prioritise",
      "def": "How much risk you are prepared to take, used with impact and likelihood when you decide which threats matter most.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "likelihood",
      "term": "likelihood",
      "stage": "prioritise",
      "def": "How plausible a threat is, given the actors from stage 2 and the controls you already have.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/a-basic-risk-assessment-and-management-method"
    },
    {
      "id": "impact",
      "term": "impact",
      "stage": "prioritise",
      "def": "How bad it would be if the threat succeeded.",
      "href": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf"
    },
    {
      "id": "residual",
      "term": "residual risk",
      "stage": "prioritise",
      "def": "The risk that remains after you take account of the controls you already have, and that you might later accept.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "aiharm",
      "term": "AI-specific harm",
      "stage": "prioritise",
      "def": "A harm that may not fit a classic confidentiality, integrity or availability score neatly — for example harmful or untrue output, over-reliance, or an agent acting beyond its brief.",
      "href": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf"
    },
    {
      "id": "mitigation",
      "term": "mitigation",
      "stage": "mitigate",
      "def": "A proportionate control you will use to prevent, detect or recover from a priority threat — or a decision to accept or transfer it.",
      "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/making-compromise-difficult"
    },
    {
      "id": "slsa",
      "term": "SLSA",
      "stage": "mitigate",
      "def": "Supply-chain Levels for Software Artifacts.",
      "href": "https://slsa.dev/spec/v1.2/"
    },
    {
      "id": "accept",
      "term": "accept",
      "stage": "mitigate",
      "def": "A decision to live with a residual risk rather than prevent, detect, recover or transfer it.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "transfer",
      "term": "transfer",
      "stage": "mitigate",
      "def": "A decision that another party will carry the residual risk (for example by contract or insurance), instead of preventing, detecting, recovering from or accepting it yourself.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "assurance",
      "term": "assurance",
      "stage": "validate",
      "def": "Evidence that the model is good enough and that important controls work, including a review from someone who was not in the workshop.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/how-to-gain-and-maintain-assurance"
    },
    {
      "id": "stest",
      "term": "security testing",
      "stage": "validate",
      "def": "Tests of the important controls: design review, automated security tests in the pipeline, and a penetration test for higher-risk services.",
      "href": "https://www.ncsc.gov.uk/collection/developers-collection"
    },
    {
      "id": "rt",
      "term": "red teaming",
      "stage": "validate",
      "def": "A focused attempt to find failures the workshop missed.",
      "href": "https://genai.owasp.org/download/44859/"
    },
    {
      "id": "detection",
      "term": "detection",
      "stage": "validate",
      "def": "Whether logging and monitoring would notice the priority attacks.",
      "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/making-compromise-detection-easier"
    },
    {
      "id": "artefact",
      "term": "threat model (the artefact)",
      "stage": "record",
      "def": "The living record of the work: the diagram or model file, the threat list, the mitigations, residual risks and who accepted them.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "rrrec",
      "term": "residual risk record",
      "stage": "record",
      "def": "The written list of residual risks, including who accepted them, that forms part of the living threat-model pack.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "ctm",
      "term": "continuous threat modelling",
      "stage": "continuous",
      "def": "Keeping the model alive in the same pipeline that ships the service, as a business-as-usual activity in risk management, development and CI/CD.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "rtrigger",
      "term": "review trigger",
      "stage": "continuous",
      "def": "A reason to reopen the model even if nobody requested a “security feature”: a change to data flows, trust boundaries, identities, a model or agent, or a material dependency; a relevant incident or advisory; or a planned cadence.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    },
    {
      "id": "lessons",
      "term": "lessons learned",
      "stage": "continuous",
      "def": "What monitoring, incidents and reviews teach you, fed back into stages 2 and 5.",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-d/principle-d2-lessons-learned"
    },
    {
      "id": "llmdraft",
      "term": "LLM-assisted draft (human review)",
      "stage": "continuous",
      "def": "An assistant can draft a DFD, a threat list, a review of a change, or a proposed update to the model.",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling"
    }
  ],
  "whatsNew": {
    "title": "What’s new in threat modelling (2024–2026)",
    "checked": "10 November 2026 (Europe/London)",
    "intro": "The important change since the classic workshop and STRIDE model is not that the four questions have been replaced. It is that the system under review and the catalogues you use have moved on: AI and agentic components, software and model supply chains, cloud identities, and a living model that can sit in the same pipeline as the code. The ten stages below are shaped around that. Dates and versions are those stated on the source pages or files themselves, unless noted. Every source link on this page returned HTTP 200 when checked on 10 November 2026 (Europe/London).",
    "groups": [
      {
        "id": "ncsc",
        "title": "NCSC — new AI guidance; the core threat-modelling page is unchanged",
        "items": [
          {
            "when": "23 June 2023",
            "title": "NCSC threat modelling page is still version 2.0",
            "body": "Published and reviewed 23 June 2023, and not revised in 2024–2026. It remains the best official UK handrail: understand who might harm you; then the four questions (what are you building; what can go wrong; what should you do about it; did we do a good job); use a structured method such as STRIDE, MITRE ATT&CK or attack trees; treat threat modelling as a team workshop; and fold it into design, risk management and CI/CD.",
            "sources": [
              "S1"
            ]
          },
          {
            "when": "27 November 2023",
            "title": "Guidelines for secure AI system development, version 1.0",
            "body": "Published and reviewed 27 November 2023, issued with CISA and other international agencies. Still the current NCSC collection for secure AI development.",
            "sources": [
              "S28",
              "S29a",
              "S30a",
              "S31b"
            ]
          },
          {
            "when": "22 May 2024",
            "title": "Machine learning principles, version 2.0",
            "body": "Published and reviewed 22 May 2024. Principle 1.2 is explicitly “Model the threats to your system”.",
            "sources": [
              "S26",
              "S26a",
              "S26b"
            ]
          },
          {
            "when": "22 October 2025",
            "title": "Supply chain security guidance, reviewed",
            "body": "Version 1.0, first published 28 January 2018, reviewed 22 October 2025.",
            "sources": [
              "S82"
            ]
          },
          {
            "when": "29 April 2026",
            "title": "Understanding adversarial attacks against Machine Learning and AI",
            "body": "Paper, version 1.0, published 29 April 2026.",
            "sources": [
              "S31a"
            ]
          },
          {
            "when": "20 August 2026",
            "title": "Managing the cyber risk of agentic AI",
            "body": "NCSC blog with interim practical advice, including modelling failure scenarios before deployment. The working URL is /blogs/managing-the-cyber-risk-of-agentic-ai (the /blog-post/ path returns 404 and is not used here).",
            "sources": [
              "S32"
            ]
          },
          {
            "when": "18 April 2024; reviewed 30 October 2026",
            "title": "Cyber Assessment Framework (CAF) version 4.0",
            "body": "Published 18 April 2024 and reviewed 30 October 2026 on the principle pages checked (A2, A3, A4, B2, B4, C1, D1, D2).",
            "sources": [
              "S19",
              "S20",
              "S21",
              "S22a",
              "S22b",
              "S22",
              "S23",
              "S24",
              "S25"
            ]
          },
          {
            "when": "7 June 2023",
            "title": "Cloud Security Principles remain version 2.1",
            "body": "Reviewed 7 June 2023. Older than the AI material but still the current official pages, and the right NCSC hook for cloud and identity (including service identities).",
            "sources": [
              "S83",
              "S85",
              "S84",
              "S86",
              "S87"
            ]
          }
        ]
      },
      {
        "id": "mitre",
        "title": "MITRE ATT&CK and ATLAS — living catalogues, not a one-off mnemonic",
        "items": [
          {
            "when": "13 October 2026",
            "title": "MITRE ATT&CK current version is v20.1",
            "body": "The official Version History page lists v20.1 as current from 13 October 2026. The October 2026 updates page describes the v20 release of that date and lists both v20.0 and v20.1 data. The release expands recent adversary activity and includes AI-focused and AI-enabled techniques in Enterprise. Use the current ATT&CK site, not a frozen teaching slide.",
            "sources": [
              "S50",
              "S50a",
              "S50b"
            ]
          },
          {
            "when": "28 October 2026",
            "title": "MITRE ATLAS content version 2026.10",
            "body": "ATLAS (Adversarial Threat Landscape for AI Systems) is a separate, living knowledge base for attacks involving AI. The data manifest lists content version 2026.10, release date 28 October 2026 (format-version 6.1.0): 16 tactics, and (on the homepage when checked) 221 techniques, 44 mitigations and 77 case studies. ATLAS, not ATT&CK alone, is the catalogue to reach for when the system includes a model or an agent.",
            "sources": [
              "S58"
            ]
          }
        ]
      },
      {
        "id": "owasp",
        "title": "OWASP GenAI and agentic threat modelling",
        "items": [
          {
            "when": "3 August 2026",
            "title": "OWASP Top 10 for LLM Applications 2026",
            "body": "Version 2026. The resource page is dated 3 August 2026. The PDF cover shows “August 4th, 2026” under a still-present “[Publication date to be set]” placeholder — that inconsistency is on the file itself. Risks include prompt injection, sensitive information disclosure, excessive agency, supply chain, data and model poisoning, and improper output handling. Appendix mappings in the PDF are to ATLAS content v2026.06 and ATT&CK v19.1, which already lag the catalogues above, so treat those matrices as a starting map, not as current.",
            "sources": [
              "S70",
              "S71"
            ]
          },
          {
            "when": "December 2025",
            "title": "OWASP Top 10 for Agentic Applications 2026",
            "body": "Version 2026, December 2025 (project blog 9 December 2025). Risks include agent goal hijack, tool misuse, identity and privilege abuse, agentic supply chain, memory and context poisoning, insecure inter-agent communication, and rogue agents.",
            "sources": [
              "S75",
              "S75a",
              "S75b"
            ]
          },
          {
            "when": "December 2025",
            "title": "Agentic AI — Threats and Mitigations, version 1.1",
            "body": "Sets out a reference threat model for LLM-based agents, and notes that STRIDE and PASTA must be expanded for AI threats.",
            "sources": [
              "S73"
            ]
          },
          {
            "when": "23 April 2025",
            "title": "Multi-Agentic System Threat Modeling Guide v1.0",
            "body": "Resource page dated 23 April 2025.",
            "sources": [
              "S74"
            ]
          },
          {
            "when": "23 January 2025",
            "title": "GenAI Red Teaming Guide, version 1.0",
            "body": "Includes a section on threat modelling for GenAI/LLM systems and points to NIST AI 600-1, MITRE ATLAS and STRIDE as starting points.",
            "sources": [
              "S72"
            ]
          }
        ]
      },
      {
        "id": "nist",
        "title": "NIST — AI risk, not only software threat modelling",
        "items": [
          {
            "when": "26 January 2023; note of 7 April 2026",
            "title": "AI RMF 1.0 remains the current framework",
            "body": "NIST AI 100-1, 26 January 2023, remains the current framework. NIST’s AI RMF landing page, when checked, said the framework is being revised and that a concept note for a Critical Infrastructure profile was released 7 April 2026. AI RMF 1.0 itself is not yet a 2.0 publication.",
            "sources": [
              "S61",
              "S62"
            ]
          },
          {
            "when": "26 July 2024",
            "title": "NIST AI 600-1, Generative Artificial Intelligence Profile",
            "body": "Published 26 July 2024 (PDF dated 5 August 2024). Companion profile for generative AI risks and actions.",
            "sources": [
              "S63",
              "S64"
            ]
          },
          {
            "when": "26 July 2024",
            "title": "SP 800-218A, SSDF Community Profile for generative AI",
            "body": "Final, 26 July 2024, for generative AI and dual-use foundation models.",
            "sources": [
              "S65",
              "S66",
              "S68"
            ]
          },
          {
            "when": "February 2022; draft 17 December 2025",
            "title": "SSDF 1.1 is final; SSDF 1.2 is still a draft",
            "body": "SP 800-218 SSDF 1.1 remains the final software framework (February 2022); practice PW.1.1 asks for risk modelling “such as threat modeling”. SP 800-218 Rev. 1 (SSDF 1.2) is an initial public draft, 17 December 2025 (comment period closed 30 January 2026). Do not treat 1.2 as final.",
            "sources": [
              "S33",
              "S34",
              "S67"
            ]
          },
          {
            "when": "March 2016",
            "title": "SP 800-154 remains an Initial Public Draft",
            "body": "Guide to Data-Centric System Threat Modeling has not been finalised. Useful for its four data-centric steps; it is not a current final standard.",
            "sources": [
              "S31",
              "S32n"
            ]
          }
        ]
      },
      {
        "id": "ascode",
        "title": "Threat-modelling-as-code, automation and continuous use in CI/CD",
        "items": [
          {
            "when": "1 November 2026",
            "title": "OWASP pytm v1.4.1",
            "body": "Published 1 November 2026 (GitHub published_at, converted from UTC to Europe/London). Python-defined models that can generate DFDs, sequence diagrams and threats.",
            "sources": [
              "S78"
            ]
          },
          {
            "when": "10 May 2026",
            "title": "OWASP Threat Dragon v2.6.2",
            "body": "Published 10 May 2026. Visual web or desktop tool; supports STRIDE, LINDDUN, CIA, DIE and PLOT4ai, with a rule engine. The repository was still receiving commits in early November 2026.",
            "sources": [
              "S41"
            ]
          },
          {
            "when": "30 July 2024",
            "title": "Threagile latest tagged release is v0.9.1",
            "body": "The repository still had pushes on 8 April 2026, so the tag may lag the code. Declarative YAML architecture models with automated risk rules, usable from a CLI, Docker or a REST server. Confirm the tag before relying on a version number.",
            "sources": [
              "S80"
            ]
          },
          {
            "when": "Checked 10 November 2026",
            "title": "Commercial “AI threat modeling” platforms were not evaluated",
            "body": "IriusRisk is a commercial platform. Its marketing page loaded; this is not an evaluation or a recommendation. GOV Assured should prefer open tools and human-reviewed models unless a later, approved decision is made to buy something.",
            "sources": [
              "S81"
            ]
          },
          {
            "when": "Emerging; not a standard",
            "title": "LLM-assisted modelling is a draft, not a replacement",
            "body": "Assistants can draft a DFD, a threat list or a review of a change. They also invent threats, miss context, and leak prompts if used carelessly. No NCSC page endorses replacing a workshop with a model. Any assisted draft needs a named human reviewer, and prompts must not contain secrets or other people’s data."
          }
        ]
      },
      {
        "id": "slsa",
        "title": "Supply chain — SLSA v1.2",
        "items": [
          {
            "when": "24 November 2025",
            "title": "SLSA version 1.2 announced",
            "body": "It adds a Source Track alongside the Build Track. The v1.2 threats and mitigations pages are the right industry companion to NCSC supply-chain guidance when modelling CI/CD, dependencies and provenance.",
            "sources": [
              "S88",
              "S88a",
              "S88b",
              "S89",
              "S90"
            ]
          }
        ]
      },
      {
        "id": "foundations",
        "title": "The four questions and the Manifesto were not rewritten",
        "items": [
          {
            "when": "12 January 2024",
            "title": "Threat Modeling Capabilities catalogue added",
            "body": "The Threat Modeling Manifesto itself does not show a 2024–2026 revision. What was added is the companion Threat Modeling Capabilities catalogue (process areas: Strategy, Education, Creating Threat Models, Acting on Threat Models, Communications, Measurement, Program Management). The four questions remain the foundation. This lifecycle uses them as a handrail, not as the only four stages.",
            "sources": [
              "S42",
              "S46",
              "S46a",
              "S43",
              "S44",
              "S45"
            ]
          },
          {
            "when": "12 March 2025; 24 February 2026",
            "title": "Microsoft still documents STRIDE and SDL, plus newer AI pages",
            "body": "Two newer AI pages also loaded: Threat Modeling AI/ML Systems and Dependencies (last updated 12 March 2025) and Complete AI threat modeling in the Secure Future Initiative (last updated 24 February 2026). Use them as vendor guidance, not as UK official policy.",
            "sources": [
              "S47",
              "S48",
              "S48b",
              "S48c"
            ]
          }
        ]
      }
    ]
  },
  "example": {
    "title": "Worked example — Continuity Plan Helper",
    "lede": "A generic GOV Assured-style community web app, with no personal names. This is an illustrative walk-through, not a complete threat model.",
    "setup": [
      "People complete a form about continuity needs and can optionally save a draft.",
      "A cloud model API generates a draft plan.",
      "Drafts are stored in a database.",
      "The home page also shows a public threat dashboard whose items link out to their sources.",
      "The service is built and deployed through CI/CD to a cloud platform, with a service identity for the model API."
    ],
    "steps": [
      {
        "num": 1,
        "id": "scope",
        "title": "Scope",
        "text": "This service, including the model API, the database, the public feed, identities and the pipeline; not the rest of the GOV Assured estate."
      },
      {
        "num": 2,
        "id": "landscape",
        "title": "Landscape",
        "text": "Opportunistic web attackers, abuse of the model API, supply-chain compromise of a dependency or the pipeline; catalogues: ATT&CK v20.1, ATLAS 2026.10, OWASP LLM Top 10 2026 (prompt injection, sensitive disclosure, excessive agency, supply chain)."
      },
      {
        "num": 3,
        "id": "model",
        "title": "Model",
        "text": "Browser → app → database; app → model API; app → external feeds; CI/CD → production; identity and service credentials."
      },
      {
        "num": 4,
        "id": "boundaries",
        "title": "Assets and boundaries",
        "text": "Draft plan content, prompts and outputs, model API credentials, feed integrity, community reputation; trust boundaries at each of those hops."
      },
      {
        "num": 5,
        "id": "threats",
        "title": "Threats",
        "text": "Examples: spoofed or tampered feed items; another organisation’s draft being disclosed; prompt injection into the model; the service identity for the model being stolen from the pipeline; a poisoned dependency."
      },
      {
        "num": 6,
        "id": "prioritise",
        "title": "Prioritise",
        "text": "Information disclosure of drafts, abuse of the model API, and pipeline compromise typically outrank cosmetic defacement; include untrue or over-confident plan text as an AI-specific harm."
      },
      {
        "num": 7,
        "id": "mitigate",
        "title": "Mitigations",
        "text": "Least-privilege service identity, no secrets in prompts or logs, signed builds / provenance, output handling, rate limits, owner-accepted residual risk for a public feed that only links to sources."
      },
      {
        "num": 8,
        "id": "validate",
        "title": "Validate",
        "text": "Tests for access control on drafts; a GenAI red-team pass for prompt injection; a check that detection would notice credential misuse."
      },
      {
        "num": 9,
        "id": "record",
        "title": "Record",
        "text": "A version-controlled model file plus a short pack, dated and owned."
      },
      {
        "num": 10,
        "id": "continuous",
        "title": "Continuous",
        "text": "Re-open when the model provider, the feed, or a major dependency changes; pipeline warns if the model file is stale."
      }
    ]
  },
  "sources": [
    {
      "id": "S1",
      "title": "NCSC — Threat modelling (v2.0, published and reviewed 23 June 2023)",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
      "group": "NCSC threat modelling, risk and assurance"
    },
    {
      "id": "S2",
      "title": "NCSC — Risk management collection",
      "href": "https://www.ncsc.gov.uk/collection/risk-management",
      "group": "NCSC threat modelling, risk and assurance"
    },
    {
      "id": "S3",
      "title": "NCSC — Using attack trees to understand cyber security risk",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/using-attack-trees-to-understand-cyber-security-risk",
      "group": "NCSC threat modelling, risk and assurance"
    },
    {
      "id": "S4",
      "title": "NCSC — How to gain and maintain assurance",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/how-to-gain-and-maintain-assurance",
      "group": "NCSC threat modelling, risk and assurance"
    },
    {
      "id": "S5",
      "title": "NCSC — A basic risk assessment and management method",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/a-basic-risk-assessment-and-management-method",
      "group": "NCSC threat modelling, risk and assurance"
    },
    {
      "id": "S6",
      "title": "NCSC — The fundamentals and basics of cyber risk",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/the-fundamentals-and-basics-of-cyber-risk",
      "group": "NCSC threat modelling, risk and assurance"
    },
    {
      "id": "S7",
      "title": "NCSC — Cyber security risk management framework",
      "href": "https://www.ncsc.gov.uk/collection/risk-management/cyber-security-risk-management-framework",
      "group": "NCSC threat modelling, risk and assurance"
    },
    {
      "id": "S8",
      "title": "NCSC — Secure design principles (collection)",
      "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S9",
      "title": "NCSC — Cyber security design principles (overview)",
      "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/cyber-security-design-principles",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S10",
      "title": "NCSC — Principle 1: Establish the context before designing a system",
      "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/establish-the-context-before-designing-a-system",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S11",
      "title": "NCSC — Principle 2: Make compromise difficult",
      "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/making-compromise-difficult",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S12",
      "title": "NCSC — Principle 3: Make disruption difficult",
      "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/making-disruption-difficult",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S13",
      "title": "NCSC — Principle 4: Make compromise detection easier",
      "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/making-compromise-detection-easier",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S14",
      "title": "NCSC — Principle 5: Reduce the impact of compromise",
      "href": "https://www.ncsc.gov.uk/collection/cyber-security-design-principles/reducing-the-impact-of-compromise",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S15",
      "title": "NCSC — Secure development and deployment guidance",
      "href": "https://www.ncsc.gov.uk/collection/developers-collection",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S16",
      "title": "NCSC — Building and operating a secure online service",
      "href": "https://www.ncsc.gov.uk/guidance/building-operating-secure-online-service",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S17",
      "title": "NCSC — Digital Service Security",
      "href": "https://www.ncsc.gov.uk/collection/digital-service-security",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S18",
      "title": "NCSC — Building a secure digital service",
      "href": "https://www.ncsc.gov.uk/collection/digital-service-security/digital-services-building-secure-digital-service",
      "group": "NCSC secure design, development and digital services"
    },
    {
      "id": "S19",
      "title": "NCSC — Cyber Assessment Framework",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework",
      "group": "NCSC CAF v4.0"
    },
    {
      "id": "S20",
      "title": "NCSC CAF — Principle A2 Risk management",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a2-risk-management",
      "group": "NCSC CAF v4.0"
    },
    {
      "id": "S21",
      "title": "NCSC CAF — Principle A3 Asset management",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a3-asset-management",
      "group": "NCSC CAF v4.0"
    },
    {
      "id": "S22a",
      "title": "NCSC CAF — Principle A4 Supply chain",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain",
      "group": "NCSC CAF v4.0"
    },
    {
      "id": "S22b",
      "title": "NCSC CAF — Principle B2 Identity and access control",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b2-identity-and-access-control",
      "group": "NCSC CAF v4.0"
    },
    {
      "id": "S22",
      "title": "NCSC CAF — Principle B4 System security",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
      "group": "NCSC CAF v4.0"
    },
    {
      "id": "S23",
      "title": "NCSC CAF — Principle C1 Security monitoring",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-c-detecting-cyber-security-events/principle-c1-security-monitoring",
      "group": "NCSC CAF v4.0"
    },
    {
      "id": "S24",
      "title": "NCSC CAF — Principle D1 Response and recovery planning",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-d/principle-d1-response-and-recovery-planning",
      "group": "NCSC CAF v4.0"
    },
    {
      "id": "S25",
      "title": "NCSC CAF — Principle D2 Lessons learned",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-d/principle-d2-lessons-learned",
      "group": "NCSC CAF v4.0"
    },
    {
      "id": "S26",
      "title": "NCSC — Machine learning principles, 1.2 Model the threats to your system (collection v2.0, 22 May 2024)",
      "href": "https://www.ncsc.gov.uk/collection/machine-learning-principles/secure-design/model-threats",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S26a",
      "title": "NCSC — Machine learning principles (collection)",
      "href": "https://www.ncsc.gov.uk/collection/machine-learning-principles",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S26b",
      "title": "NCSC — Machine learning principles (PDF)",
      "href": "https://www.ncsc.gov.uk/files/NCSC-Machine-learning-principles.pdf",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S28",
      "title": "NCSC — Guidelines for secure AI system development (v1.0, 27 November 2023)",
      "href": "https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S29a",
      "title": "NCSC — Guidelines for secure AI system development (detail)",
      "href": "https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development/guidelines",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S30a",
      "title": "NCSC — Introducing the guidelines for secure AI (27 November 2023)",
      "href": "https://www.ncsc.gov.uk/blog-post/introducing-guidelines-secure-ai-system-development",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S31b",
      "title": "NCSC — UK and US develop new global guidelines for AI security (27 November 2023)",
      "href": "https://www.ncsc.gov.uk/news/uk-develops-new-global-guidelines-ai-security",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S32",
      "title": "NCSC — Managing the cyber risk of agentic AI (20 August 2026)",
      "href": "https://www.ncsc.gov.uk/blogs/managing-the-cyber-risk-of-agentic-ai",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S31a",
      "title": "NCSC — Understanding adversarial attacks against Machine Learning and AI (v1.0, 29 April 2026)",
      "href": "https://www.ncsc.gov.uk/paper/understanding-adversarial-attacks-against-machine-learning-and-ai",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S82",
      "title": "NCSC — Supply chain security guidance (v1.0, reviewed 22 October 2025)",
      "href": "https://www.ncsc.gov.uk/collection/supply-chain-security",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S83",
      "title": "NCSC — The cloud security principles (v2.1, reviewed 7 June 2023)",
      "href": "https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S85",
      "title": "NCSC Cloud Security Principle 7: Secure development",
      "href": "https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles/principle-7-secure-development",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S84",
      "title": "NCSC Cloud Security Principle 8: Supply chain security",
      "href": "https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles/principle-8-supply-chain-security",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S86",
      "title": "NCSC Cloud Security Principle 9: Secure user management",
      "href": "https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles/principle-9-secure-user-management",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S87",
      "title": "NCSC Cloud Security Principle 10: Identity and authentication",
      "href": "https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles/principle-10-identity-and-authentication",
      "group": "NCSC AI, ML, agentic, cloud and supply chain"
    },
    {
      "id": "S26g",
      "title": "UK Government Security — Performing threat modelling (not NCSC; public Secure by Design material; not a GOV Assured requirement)",
      "href": "https://www.security.gov.uk/policy-and-guidance/secure-by-design/activities/performing-threat-modelling/",
      "group": "UK Government Security (not NCSC)"
    },
    {
      "id": "S27",
      "title": "UK Government Security — Sourcing a threat assessment (not NCSC; not a GOV Assured requirement)",
      "href": "https://www.security.gov.uk/policy-and-guidance/secure-by-design/activities/sourcing-a-threat-assessment/",
      "group": "UK Government Security (not NCSC)"
    },
    {
      "id": "S28g",
      "title": "UK Government Security — Secure by Design principles (not NCSC; not a GOV Assured requirement)",
      "href": "https://www.security.gov.uk/policy-and-guidance/secure-by-design/principles/",
      "group": "UK Government Security (not NCSC)"
    },
    {
      "id": "S29",
      "title": "UK Government Security — Example threat model (not NCSC; not a GOV Assured requirement)",
      "href": "https://www.security.gov.uk/policy-and-guidance/secure-by-design/activities/performing-threat-modelling/example-threat-model/",
      "group": "UK Government Security (not NCSC)"
    },
    {
      "id": "S30",
      "title": "UK Government Security — Secure by Design activities (not NCSC; not a GOV Assured requirement)",
      "href": "https://www.security.gov.uk/policy-and-guidance/secure-by-design/activities/",
      "group": "UK Government Security (not NCSC)"
    },
    {
      "id": "S31",
      "title": "NIST SP 800-154 (Initial Public Draft, March 2016) landing",
      "href": "https://csrc.nist.gov/pubs/sp/800/154/ipd",
      "group": "NIST"
    },
    {
      "id": "S32n",
      "title": "NIST SP 800-154 draft PDF",
      "href": "https://csrc.nist.gov/files/pubs/sp/800/154/ipd/docs/sp800_154_draft.pdf",
      "group": "NIST"
    },
    {
      "id": "S33",
      "title": "NIST SP 800-218 SSDF 1.1 (final, February 2022)",
      "href": "https://csrc.nist.gov/pubs/sp/800/218/final",
      "group": "NIST"
    },
    {
      "id": "S34",
      "title": "NIST SP 800-218 SSDF 1.1 PDF",
      "href": "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf",
      "group": "NIST"
    },
    {
      "id": "S35",
      "title": "NIST SP 800-30 Rev. 1 landing",
      "href": "https://csrc.nist.gov/pubs/sp/800/30/r1/final",
      "group": "NIST"
    },
    {
      "id": "S36",
      "title": "NIST SP 800-30 Rev. 1 PDF",
      "href": "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf",
      "group": "NIST"
    },
    {
      "id": "S61",
      "title": "NIST — AI Risk Management Framework landing",
      "href": "https://www.nist.gov/itl/ai-risk-management-framework",
      "group": "NIST"
    },
    {
      "id": "S62",
      "title": "NIST AI RMF 1.0 PDF (NIST AI 100-1, 26 January 2023)",
      "href": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
      "group": "NIST"
    },
    {
      "id": "S63",
      "title": "NIST AI 600-1 publication record (26 July 2024)",
      "href": "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence",
      "group": "NIST"
    },
    {
      "id": "S64",
      "title": "NIST AI 600-1 PDF",
      "href": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
      "group": "NIST"
    },
    {
      "id": "S65",
      "title": "NIST SP 800-218A (final, 26 July 2024)",
      "href": "https://csrc.nist.gov/pubs/sp/800/218/a/final",
      "group": "NIST"
    },
    {
      "id": "S66",
      "title": "NIST SP 800-218A PDF",
      "href": "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218A.pdf",
      "group": "NIST"
    },
    {
      "id": "S67",
      "title": "NIST SP 800-218 Rev. 1 IPD (SSDF 1.2 draft, 17 December 2025)",
      "href": "https://csrc.nist.gov/pubs/sp/800/218/r1/ipd",
      "group": "NIST"
    },
    {
      "id": "S68",
      "title": "NIST publishes SP 800-218A (news, 26 July 2024)",
      "href": "https://csrc.nist.gov/News/2024/nist-publishes-sp-800-218a",
      "group": "NIST"
    },
    {
      "id": "S37",
      "title": "OWASP — Threat Modeling Cheat Sheet",
      "href": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html",
      "group": "OWASP"
    },
    {
      "id": "S38",
      "title": "OWASP Threat Modeling Project",
      "href": "https://owasp.org/projects/threat-modeling-project",
      "group": "OWASP"
    },
    {
      "id": "S39",
      "title": "OWASP — Threat Modeling Process (Historical)",
      "href": "https://community.owasp.org/Threat_Modeling_Process",
      "group": "OWASP"
    },
    {
      "id": "S40",
      "title": "OWASP Developer Guide — threat modeling",
      "href": "https://devguide.owasp.org/en/04-design/01-threat-modeling/",
      "group": "OWASP"
    },
    {
      "id": "S41",
      "title": "OWASP Threat Dragon (latest tagged release v2.6.2, 10 May 2026)",
      "href": "https://owasp.org/projects/threat-dragon",
      "group": "OWASP"
    },
    {
      "id": "S69",
      "title": "OWASP Gen AI Security Project",
      "href": "https://genai.owasp.org/",
      "group": "OWASP"
    },
    {
      "id": "S70",
      "title": "OWASP GenAI LLM Top 10 2026 (resource, 3 August 2026)",
      "href": "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/",
      "group": "OWASP"
    },
    {
      "id": "S71",
      "title": "OWASP Top 10 for LLM Applications 2026 (PDF)",
      "href": "https://genai.owasp.org/download/56857/",
      "group": "OWASP"
    },
    {
      "id": "S72",
      "title": "OWASP GenAI Red Teaming Guide v1.0 (23 January 2025)",
      "href": "https://genai.owasp.org/download/44859/",
      "group": "OWASP"
    },
    {
      "id": "S73",
      "title": "OWASP Agentic AI — Threats and Mitigations v1.1 (December 2025)",
      "href": "https://genai.owasp.org/download/45674/",
      "group": "OWASP"
    },
    {
      "id": "S74",
      "title": "OWASP Multi-Agentic system Threat Modeling Guide v1.0 (23 April 2025)",
      "href": "https://genai.owasp.org/resource/multi-agentic-system-threat-modeling-guide-v1-0/",
      "group": "OWASP"
    },
    {
      "id": "S75",
      "title": "OWASP Top 10 for Agentic Applications 2026 (blog, 9 December 2025)",
      "href": "https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/",
      "group": "OWASP"
    },
    {
      "id": "S75a",
      "title": "OWASP Top 10 for Agentic Applications 2026 (PDF, December 2025)",
      "href": "https://genai.owasp.org/download/52117/",
      "group": "OWASP"
    },
    {
      "id": "S75b",
      "title": "OWASP Agentic Security Initiative",
      "href": "https://genai.owasp.org/initiatives/agentic-security-initiative/",
      "group": "OWASP"
    },
    {
      "id": "S75c",
      "title": "OWASP GenAI resources archive",
      "href": "https://genai.owasp.org/resources/",
      "group": "OWASP"
    },
    {
      "id": "S78",
      "title": "OWASP pytm (v1.4.1, 1 November 2026)",
      "href": "https://owasp.org/projects/pytm",
      "group": "OWASP"
    },
    {
      "id": "S42",
      "title": "Threat Modeling Manifesto",
      "href": "https://www.threatmodelingmanifesto.org/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S46",
      "title": "Threat Modeling Capabilities",
      "href": "https://www.threatmodelingmanifesto.org/capabilities/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S46a",
      "title": "Threat Modeling Capabilities announcement (12 January 2024)",
      "href": "https://shostack.org/blog/threat-modeling-capabilities/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S43",
      "title": "Beginner’s guide to threat modeling",
      "href": "https://shostack.org/resources/threat-modeling.html",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S44",
      "title": "The Four Question Framework",
      "href": "https://shostack.org/blog/four-question-frame/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S45",
      "title": "The Four-Question Framework (PDF)",
      "href": "https://shostack.org/files/papers/The_Four_Question_Framework.pdf",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S47",
      "title": "Microsoft SDL threat modelling",
      "href": "https://www.microsoft.com/en-us/securityengineering/sdl/threatmodeling",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S48",
      "title": "Microsoft Threat Modeling Tool — threats (STRIDE)",
      "href": "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S48a",
      "title": "Uncover security design flaws using STRIDE (MSDN archive)",
      "href": "https://learn.microsoft.com/en-us/archive/msdn-magazine/2006/november/uncover-security-design-flaws-using-the-stride-approach",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S48b",
      "title": "Microsoft — Threat Modeling AI/ML Systems and Dependencies (last updated 12 March 2025)",
      "href": "https://learn.microsoft.com/en-us/security/engineering/threat-modeling-aiml",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S48c",
      "title": "Microsoft — Complete AI threat modeling, Secure Future Initiative (last updated 24 February 2026)",
      "href": "https://learn.microsoft.com/en-us/security/zero-trust/sfi/threat-modeling-ai",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S49",
      "title": "LINDDUN",
      "href": "https://linddun.org/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S50",
      "title": "MITRE ATT&CK (current v20.1)",
      "href": "https://attack.mitre.org/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S50a",
      "title": "MITRE ATT&CK — Version History",
      "href": "https://attack.mitre.org/resources/versions/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S50b",
      "title": "MITRE ATT&CK — October 2026 updates",
      "href": "https://attack.mitre.org/resources/updates/updates-october-2026/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S51",
      "title": "MITRE CAPEC",
      "href": "https://capec.mitre.org/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S58",
      "title": "MITRE ATLAS (content 2026.10, 28 October 2026)",
      "href": "https://atlas.mitre.org/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S52",
      "title": "Attack Trees",
      "href": "https://www.schneier.com/academic/archives/1999/12/attack_trees.html",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S53",
      "title": "OASIS STIX Version 2.1",
      "href": "https://www.oasis-open.org/standard/stix-version-2-1/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S54",
      "title": "PASTA book record (Wiley)",
      "href": "https://www.wiley.com/en-us/Risk+Centric+Threat+Modeling%3A+Process+for+Attack+Simulation+and+Threat+Analysis-p-9780470500965",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S55",
      "title": "PASTA, AppSecEU 2012 PDF",
      "href": "https://wiki.owasp.org/images/a/aa/AppSecEU2012_PASTA.pdf",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S56",
      "title": "CISA Secure by Design (US guidance; not UK official policy)",
      "href": "https://www.cisa.gov/resources-tools/resources/secure-by-design",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S57",
      "title": "CISA Secure by Design PDF (2023)",
      "href": "https://www.cisa.gov/sites/default/files/2023-10/Shifting-the-Balance-of-Cybersecurity-Risk-Principles-and-Approaches-for-Secure-by-Design-Software.pdf",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S80",
      "title": "Threagile (latest tagged release v0.9.1, 30 July 2024)",
      "href": "https://threagile.io/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S81",
      "title": "IriusRisk platform (commercial; not evaluated or recommended)",
      "href": "https://www.iriusrisk.com/threat-modeling-platform",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S88",
      "title": "SLSA specification v1.2",
      "href": "https://slsa.dev/spec/v1.2/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S88a",
      "title": "SLSA — v1.2 announcement (24 November 2025)",
      "href": "https://slsa.dev/blog/2025/11/announce-slsa-v1.2",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S88b",
      "title": "SLSA home",
      "href": "https://slsa.dev/",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S89",
      "title": "SLSA v1.2 threats and mitigations",
      "href": "https://slsa.dev/spec/v1.2/threats",
      "group": "Manifesto, catalogues, methods and tools"
    },
    {
      "id": "S90",
      "title": "SLSA v1.2 supply chain threats",
      "href": "https://slsa.dev/spec/v1.2/threats-overview",
      "group": "Manifesto, catalogues, methods and tools"
    }
  ]
};
window.TM_REFS = [
  {
    "phrases": [
      "NCSC threat-modelling page",
      "NCSC threat modelling page",
      "NCSC threat modelling"
    ],
    "href": "https://www.ncsc.gov.uk/collection/risk-management/threat-modelling",
    "label": "NCSC — Threat modelling (v2.0, published and reviewed 23 June 2023)"
  },
  {
    "phrases": [
      "Threat Modeling Manifesto"
    ],
    "href": "https://www.threatmodelingmanifesto.org/",
    "label": "Threat Modeling Manifesto"
  },
  {
    "phrases": [
      "four questions"
    ],
    "href": "https://shostack.org/blog/four-question-frame/",
    "label": "The Four Question Framework"
  },
  {
    "phrases": [
      "Threat Modeling Capabilities"
    ],
    "href": "https://www.threatmodelingmanifesto.org/capabilities/",
    "label": "Threat Modeling Capabilities"
  },
  {
    "phrases": [
      "ATT&CK v20.1",
      "MITRE ATT&CK",
      "ATT&CK"
    ],
    "href": "https://attack.mitre.org/",
    "label": "MITRE ATT&CK (current v20.1)"
  },
  {
    "phrases": [
      "ATLAS 2026.10",
      "MITRE ATLAS",
      "ATLAS"
    ],
    "href": "https://atlas.mitre.org/",
    "label": "MITRE ATLAS (content 2026.10, 28 October 2026)"
  },
  {
    "phrases": [
      "OWASP LLM Top 10 2026",
      "OWASP GenAI / Agentic",
      "OWASP LLM / Agentic"
    ],
    "href": "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/",
    "label": "OWASP GenAI LLM Top 10 2026 (resource, 3 August 2026)"
  },
  {
    "phrases": [
      "OWASP Top 10 for Agentic Applications 2026"
    ],
    "href": "https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/",
    "label": "OWASP Top 10 for Agentic Applications 2026 (blog, 9 December 2025)"
  },
  {
    "phrases": [
      "GenAI Red Teaming Guide"
    ],
    "href": "https://genai.owasp.org/download/44859/",
    "label": "OWASP GenAI Red Teaming Guide v1.0 (23 January 2025)"
  },
  {
    "phrases": [
      "NIST AI 600-1"
    ],
    "href": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
    "label": "NIST AI 600-1 PDF"
  },
  {
    "phrases": [
      "AI RMF 1.0"
    ],
    "href": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    "label": "NIST AI RMF 1.0 PDF (NIST AI 100-1, 26 January 2023)"
  },
  {
    "phrases": [
      "SLSA v1.2",
      "SLSA"
    ],
    "href": "https://slsa.dev/spec/v1.2/",
    "label": "SLSA specification v1.2"
  },
  {
    "phrases": [
      "CAF A2"
    ],
    "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a2-risk-management",
    "label": "NCSC CAF — Principle A2 Risk management"
  },
  {
    "phrases": [
      "CAF A3"
    ],
    "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a3-asset-management",
    "label": "NCSC CAF — Principle A3 Asset management"
  },
  {
    "phrases": [
      "CAF A4"
    ],
    "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain",
    "label": "NCSC CAF — Principle A4 Supply chain"
  },
  {
    "phrases": [
      "CAF B2"
    ],
    "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b2-identity-and-access-control",
    "label": "NCSC CAF — Principle B2 Identity and access control"
  },
  {
    "phrases": [
      "CAF B4"
    ],
    "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
    "label": "NCSC CAF — Principle B4 System security"
  },
  {
    "phrases": [
      "CAF C1"
    ],
    "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-c-detecting-cyber-security-events/principle-c1-security-monitoring",
    "label": "NCSC CAF — Principle C1 Security monitoring"
  },
  {
    "phrases": [
      "CAF D2"
    ],
    "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-d/principle-d2-lessons-learned",
    "label": "NCSC CAF — Principle D2 Lessons learned"
  },
  {
    "phrases": [
      "pytm"
    ],
    "href": "https://owasp.org/projects/pytm",
    "label": "OWASP pytm (v1.4.1, 1 November 2026)"
  },
  {
    "phrases": [
      "Threagile"
    ],
    "href": "https://threagile.io/",
    "label": "Threagile (latest tagged release v0.9.1, 30 July 2024)"
  },
  {
    "phrases": [
      "Threat Dragon"
    ],
    "href": "https://owasp.org/projects/threat-dragon",
    "label": "OWASP Threat Dragon (latest tagged release v2.6.2, 10 May 2026)"
  },
  {
    "phrases": [
      "STRIDE"
    ],
    "href": "https://www.microsoft.com/en-us/securityengineering/sdl/threatmodeling",
    "label": "Microsoft SDL threat modelling"
  },
  {
    "phrases": [
      "LINDDUN"
    ],
    "href": "https://linddun.org/",
    "label": "LINDDUN"
  }
];
