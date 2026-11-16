/* Hardware assurance checklist data. Generated from community analysis of public NCSC / gov.uk sources. Not official NCSC guidance. */
window.CHECKLIST_DATA = {
  "version": "hwcheck1",
  "generated": "2026-11-11",
  "stages": [
    {
      "id": 1,
      "name": "Plan and procure",
      "short": "Plan & procure",
      "caf": [
        "A2",
        "A4",
        "B1"
      ],
      "why": "Requirements, risk appetite, supplier obligations and procurement decisions."
    },
    {
      "id": 2,
      "name": "Receive and verify",
      "short": "Receive & verify",
      "caf": [
        "A3",
        "A4"
      ],
      "why": "Authenticity, intake, assignment to an owner, and confidence that products have not been subverted."
    },
    {
      "id": 3,
      "name": "Build and configure",
      "short": "Build & configure",
      "caf": [
        "B4",
        "B3",
        "B2",
        "B1"
      ],
      "why": "Gold build, firmware, encryption, interface constraint, privileged settings."
    },
    {
      "id": 4,
      "name": "Deploy and protect",
      "short": "Deploy & protect",
      "caf": [
        "B4",
        "B2",
        "B3",
        "B5"
      ],
      "why": "Enrolment, management, physical protection, and safe distribution."
    },
    {
      "id": 5,
      "name": "Operate and patch",
      "short": "Operate & patch",
      "caf": [
        "B4",
        "B1"
      ],
      "why": "Supported products, firmware and software updates, exceptions."
    },
    {
      "id": 6,
      "name": "Monitor and detect",
      "short": "Monitor & detect",
      "caf": [
        "C1",
        "C2",
        "A3"
      ],
      "why": "Logging, attestation, discovery of unmanaged devices, and (where justified) hunting."
    },
    {
      "id": 7,
      "name": "Respond and recover",
      "short": "Respond & recover",
      "caf": [
        "D1",
        "D2",
        "B5",
        "B4"
      ],
      "why": "Loss, compromise, rebuild, and feedback into protective measures."
    },
    {
      "id": 8,
      "name": "Decommission and dispose",
      "short": "Decommission & dispose",
      "caf": [
        "B3",
        "A3"
      ],
      "why": "Sanitisation, destruction, custody, and inventory update."
    }
  ],
  "classes": [
    {
      "id": "L",
      "name": "Laptops"
    },
    {
      "id": "D",
      "name": "Desktops"
    },
    {
      "id": "K",
      "name": "Keyboards"
    },
    {
      "id": "M",
      "name": "Mice / pointing devices"
    },
    {
      "id": "U",
      "name": "USB devices and removable media"
    },
    {
      "id": "Dk",
      "name": "Docks / port replicators / Thunderbolt adapters"
    },
    {
      "id": "Mo",
      "name": "Monitors"
    },
    {
      "id": "P",
      "name": "Printers, scanners and multi-function devices"
    },
    {
      "id": "H",
      "name": "Headsets / audio"
    },
    {
      "id": "C",
      "name": "Webcams, cameras and microphones"
    },
    {
      "id": "W",
      "name": "Wireless peripherals"
    },
    {
      "id": "Kv",
      "name": "KVM switches"
    },
    {
      "id": "X",
      "name": "Data diodes and cross-domain products"
    },
    {
      "id": "V",
      "name": "Vendor / supplier organisation"
    }
  ],
  "caf": {
    "A1": {
      "title": "Governance",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a1-governance"
    },
    "A2": {
      "title": "Risk Management",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a2-risk-management"
    },
    "A3": {
      "title": "Asset Management",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a3-asset-management"
    },
    "A4": {
      "title": "Supply Chain",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain"
    },
    "B1": {
      "title": "Service protection policies, processes and procedures",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b1-service-protection-policies-processes-and-procedures"
    },
    "B2": {
      "title": "Identity and Access Control",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b2-identity-and-access-control"
    },
    "B3": {
      "title": "Data security",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b3-data-security"
    },
    "B4": {
      "title": "System security",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security"
    },
    "B5": {
      "title": "Resilient networks and systems",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b5-resilient-networks-and-systems"
    },
    "B6": {
      "title": "Staff awareness and training",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b6-staff-awareness-and-training"
    },
    "C1": {
      "title": "Security monitoring",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-c-detecting-cyber-security-events/principle-c1-security-monitoring"
    },
    "C2": {
      "title": "Threat Hunting",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-c-detecting-cyber-security-events/principle-c2-threat-hunting"
    },
    "D1": {
      "title": "Response and recovery planning",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-d/principle-d1-response-and-recovery-planning"
    },
    "D2": {
      "title": "Lessons Learned",
      "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-d/principle-d2-lessons-learned"
    }
  },
  "controls": [
    {
      "id": "HW-01",
      "stage": 1,
      "statement": "Security requirements for hardware and peripherals are specified before purchase, including the security properties each product class must have, and are passed to suppliers.",
      "evidence": "Statement of security needs (or draft), mapped to product classes; tender or evaluation questions.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "A2",
        "A4",
        "B1"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All product classes; V",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false,
        "X": false,
        "V": false
      },
      "sources": [
        {
          "label": "CAF A4",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain"
        },
        {
          "label": "supply chain principles, establish control",
          "url": "https://www.ncsc.gov.uk/collection/supply-chain-security/principles-supply-chain-security/ii-establish-control"
        }
      ]
    },
    {
      "id": "HW-02",
      "stage": 1,
      "statement": "End-user devices are chosen so that manufacturer support lasts for the intended life, are piloted before a wide roll-out, and sit on a maintained approved-device list.",
      "evidence": "Support / end-of-life statements for each shortlisted model; alpha pilot plan and later approved list.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "A4",
        "B4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "Choosing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices"
        }
      ]
    },
    {
      "id": "HW-03",
      "stage": 1,
      "statement": "Preferred laptops and desktops provide hardware-backed security needed for the risk: TPM 2.0 (or platform equivalent), UEFI Secure Boot or verified boot, a hardware-backed keystore, and a supported firmware-update mechanism. Higher-criticality buys also prefer firmware integrity, tamper detection and secure recovery.",
      "evidence": "Vendor security guide or bill of materials; confirmation of TPM 2.0, Secure Boot, keystore and capsule or OEM update support. For the enhanced tier, evidence of integrity, detection and recovery features, and a note that SECRET suitability is for the security authority, not the vendor, to declare.",
      "phases": [
        "D",
        "A"
      ],
      "caf": [
        "B3",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for integrity/recovery and for not treating this as SECRET approval",
        "core": true,
        "enhanced": true
      },
      "classesText": "L, D",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "Choosing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices"
        },
        {
          "label": "Managing device firmware",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
        }
      ]
    },
    {
      "id": "HW-04",
      "stage": 1,
      "statement": "Minimum security requirements are set for hardware suppliers, justified and proportionate. Cyber Essentials or equivalent may be a baseline for the **supplier organisation**. Supply-chain risk, including supplier reputation and where in the chain the device is assigned to the customer, is assessed.",
      "evidence": "CE or CE Plus (or equivalent controls) for the vendor organisation; vendor security assessment; record of supply-chain risk questions.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "A4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All; V",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "V": false
      },
      "sources": [
        {
          "label": "Supply chain principle 5",
          "url": "https://www.ncsc.gov.uk/collection/supply-chain-security/principles-supply-chain-security/ii-establish-control"
        },
        {
          "label": "Purchasing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/purchasing-devices"
        },
        {
          "label": "Vendor Security Assessment",
          "url": "https://www.ncsc.gov.uk/report/vendor-security-assessment"
        },
        {
          "label": "PPN 014",
          "url": "https://www.gov.uk/government/publications/ppn-014-cyber-essentials-scheme/ppn-014-cyber-essentials-scheme-html"
        }
      ]
    },
    {
      "id": "HW-05",
      "stage": 1,
      "statement": "Manufacturers or vendors are asked to show how each product meets (or does not meet) the Device security principles and Secure by Default. Where impact justifies it, independent assurance is required. For High Grade cryptography or cross-domain flow control, CAPS is the public route. PBA, CRTF or a recognised Common Criteria certificate may be an input, not a complete SECRET answer.",
      "evidence": "Transparency against the 11 principles; copies of any CE Plus, CRT, CC or CAPS evidence, with **scope and expiry**; a written statement of what has *not* been assured.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "A4",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for requiring an official route the security authority recognises before SECRET use",
        "core": true,
        "enhanced": true
      },
      "classesText": "All product classes; V",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false,
        "X": false,
        "V": false
      },
      "sources": [
        {
          "label": "Device security principles",
          "url": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers"
        },
        {
          "label": "PBA",
          "url": "https://www.ncsc.gov.uk/information/principles-based-assurance"
        },
        {
          "label": "CRTF",
          "url": "https://www.ncsc.gov.uk/schemes/cyber-resilience-test-facilities/introduction"
        },
        {
          "label": "CAPS",
          "url": "https://www.ncsc.gov.uk/schemes/caps-assisted-products/introduction"
        },
        {
          "label": "Common Criteria (UK)",
          "url": "https://www.ncsc.gov.uk/information/common-criteria-0"
        }
      ]
    },
    {
      "id": "HW-41",
      "stage": 1,
      "statement": "The vendor organisation itself is assessed as a supplier, separately from its products. Cyber Essentials or equivalent, if required, is treated as organisational baseline only. PPN 014 does not assure products, and is written around OFFICIAL-level contracts; higher or different controls may be required.",
      "evidence": "Current CE/CE+ (or equivalent) scope and expiry; description of the vendor’s own device management, incident reporting to the customer, and sub-supplier visibility.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "A4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) if the security authority sets a higher organisational bar",
        "core": true,
        "enhanced": true
      },
      "classesText": "V",
      "classes": {
        "L": false,
        "D": false,
        "V": false
      },
      "sources": [
        {
          "label": "PPN 014",
          "url": "https://www.gov.uk/government/publications/ppn-014-cyber-essentials-scheme/ppn-014-cyber-essentials-scheme-html"
        },
        {
          "label": "Assess supply-chain cyber security",
          "url": "https://www.ncsc.gov.uk/collection/assess-supply-chain-cyber-security"
        }
      ]
    },
    {
      "id": "HW-42",
      "stage": 1,
      "statement": "Anyone with regular, uncontrolled access to SECRET information or SECRET-capable equipment has the clearance and need-to-know the GSCP describes (publicly, SC for that regular uncontrolled access). Discovery should identify which vendor roles would need this; actual vetting is a later, official process.",
      "evidence": "Role list for vendor staff who would handle, configure, support or dispose of equipment; confirmation that clearance and briefing would be obtained through official channels before such access. Do not collect or publish personal vetting data on a public site.",
      "phases": [
        "D",
        "L"
      ],
      "caf": [
        "A1",
        "B2",
        "B6"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community), following published GSCP baseline",
        "core": false,
        "enhanced": true
      },
      "classesText": "V",
      "classes": {
        "V": false
      },
      "sources": [
        {
          "label": "Guidance 1.5",
          "url": "https://www.gov.uk/government/publications/government-security-classifications/guidance-15-considerations-for-security-advisors-html"
        },
        {
          "label": "Guidance 1.2",
          "url": "https://www.gov.uk/government/publications/government-security-classifications/guidance-12-working-at-secret-html"
        }
      ]
    },
    {
      "id": "HW-43",
      "stage": 1,
      "statement": "If SECRET work would take place on supplier premises, or suppliers would hold SECRET assets, the security authority is asked whether Facility Security Clearance (List X) and Industry Personnel Security Assurance apply. This checklist does not reconstruct those schemes.",
      "evidence": "A yes/no from the security authority; if yes, the official evidence they name, held privately.",
      "phases": [
        "D",
        "L"
      ],
      "caf": [
        "A4"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community), pointing at GovS 007 rather than inventing rules",
        "core": false,
        "enhanced": true
      },
      "classesText": "V",
      "classes": {
        "L": false,
        "D": false,
        "V": false
      },
      "sources": [
        {
          "label": "GovS 007",
          "url": "https://www.gov.uk/government/publications/government-functional-standard-govs-007-security"
        }
      ]
    },
    {
      "id": "HW-51",
      "stage": 1,
      "statement": "The security authority is asked, early, whether TEMPEST or other electromagnetic-security requirements apply to any class of equipment (including displays, printers and cabling). Vendors may be asked whether they offer formally certified TEMPEST products, but detailed zoning and test levels are not set in this public document.",
      "evidence": "Written question and answer from the security authority; if required, evidence from an NCSC-described formal route (for example CFTCS), held privately.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B5",
        "B3"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community)",
        "core": false,
        "enhanced": true
      },
      "classesText": "L, D, and any class the authority names (often Mo, P, Dk)",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "TEMPEST and Electromagnetic Security",
          "url": "https://www.ncsc.gov.uk/information/tempest-and-electromagnetic-security"
        },
        {
          "label": "TEMPEST and EMS Policy",
          "url": "https://www.ncsc.gov.uk/information/tempest-and-ems-policy"
        }
      ]
    },
    {
      "id": "HW-52",
      "stage": 1,
      "statement": "Where data must move between domains, only a method approved by the security authority is used. For High Grade flow-control products, CAPS is the public evaluation route. Data diodes are a public NCSC example of hardware-enforced one-way export.",
      "evidence": "Whether cross-domain movement is in scope; if yes, product identity and any CAPS (or other official) evidence the authority recognises.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "B4",
        "B5",
        "A4"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community)",
        "core": false,
        "enhanced": true
      },
      "classesText": "X (and any related L/D if used as endpoints)",
      "classes": {
        "X": false
      },
      "sources": [
        {
          "label": "CAPS",
          "url": "https://www.ncsc.gov.uk/schemes/caps-assisted-products/introduction"
        },
        {
          "label": "Safely Exporting Data",
          "url": "https://www.ncsc.gov.uk/guidance/design-pattern-safely-exporting-data"
        },
        {
          "label": "High assurance product design guidelines",
          "url": "https://www.ncsc.gov.uk/guidance/design-guidelines-for-high-assurance-products"
        }
      ]
    },
    {
      "id": "HW-53",
      "stage": 1,
      "statement": "KVM switches are not assumed to be acceptable commodity accessories. If a KVM would connect different classification domains, it is treated as a cross-domain question for the security authority. If it stays inside one approved domain, interface-control and supply-chain rows still apply. **Public NCSC product guidance for KVMs was not found.**",
      "evidence": "Intended use (same domain vs cross-domain); vendor architecture notes; security-authority decision. Mark uncertainty until that decision exists.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B4",
        "A4"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community); guidance thinner",
        "core": false,
        "enhanced": true
      },
      "classesText": "Kv",
      "classes": {
        "Kv": true
      },
      "sources": [
        {
          "label": "Using peripherals securely",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely"
        },
        {
          "label": "CAPS",
          "url": "https://www.ncsc.gov.uk/schemes/caps-assisted-products/introduction"
        },
        {
          "label": "Safely Exporting Data",
          "url": "https://www.ncsc.gov.uk/guidance/design-pattern-safely-exporting-data"
        },
        {
          "label": "High assurance product design guidelines",
          "url": "https://www.ncsc.gov.uk/guidance/design-guidelines-for-high-assurance-products"
        }
      ]
    },
    {
      "id": "HW-56",
      "stage": 1,
      "statement": "For every shortlisted product class, including peripherals, the vendor is asked to show how the product meets or fails the Device security principles that apply (updates, authentication, data protection, integrity, health transparency, trusted software, least privilege, interface control, management, logging, recovery).",
      "evidence": "A completed principles response per class, including “not supported” answers. Alpha should test the claims that matter most (especially updates and interface control).",
      "phases": [
        "D",
        "A"
      ],
      "caf": [
        "B4",
        "A4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All product classes",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false
      },
      "sources": [
        {
          "label": "Device security principles",
          "url": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers"
        }
      ]
    },
    {
      "id": "HW-57",
      "stage": 1,
      "statement": "Firmware or embedded software on peripherals (docks, printers, monitors, cameras, keyboard firmware where relevant) will be supported for the intended life, and can be updated in a controlled way.",
      "evidence": "Support dates and the enterprise update method for each shortlisted peripheral model. If there is no update method, that is a recorded gap, not a silent exception.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) if unsupported firmware would still be placed on a SECRET desk",
        "core": true,
        "enhanced": true
      },
      "classesText": "Dk, P, Mo, C, U, W, and L/D",
      "classes": {
        "L": false,
        "D": false,
        "K": true,
        "M": true,
        "U": false,
        "Dk": false,
        "Mo": true,
        "P": false,
        "C": false,
        "W": false,
        "H": true,
        "Kv": true
      },
      "sources": [
        {
          "label": "Managing device firmware",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
        },
        {
          "label": "Keeping devices and software up to date",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/keeping-devices-and-software-up-to-date"
        }
      ]
    },
    {
      "id": "HW-60",
      "stage": 1,
      "statement": "Contractual security requirements, including classification handling, are drafted in discovery and refined in alpha, so they can be in the contract before a wide buy. Additional controls above the GSCP baseline are made known at the pre-contract stage. A Security Aspects Letter or similar may be used, on a need-to-know basis.",
      "evidence": "Draft security schedule; confirmation that additional controls were signalled before award; any official handling instruction, held privately.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "A4",
        "B1"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for SECRET handling instructions",
        "core": true,
        "enhanced": true
      },
      "classesText": "V",
      "classes": {
        "L": false,
        "D": false,
        "V": false
      },
      "sources": [
        {
          "label": "Guidance 1.6",
          "url": "https://www.gov.uk/government/publications/government-security-classifications/guidance-16-contractors-and-contracting-authorities-html"
        },
        {
          "label": "PPN 012",
          "url": "https://www.gov.uk/government/publications/ppn-012-security-classifications-policy/ppn-012-security-classifications-policy-html"
        },
        {
          "label": "Supply chain principle 6",
          "url": "https://www.ncsc.gov.uk/collection/supply-chain-security/principles-supply-chain-security/ii-establish-control"
        }
      ]
    },
    {
      "id": "HW-06",
      "stage": 2,
      "statement": "Every received device or in-scope peripheral is recorded on the asset register, with owner, purpose and the data classification it will handle, before first use.",
      "evidence": "Asset-register fields and a sample check during alpha intake.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "A3"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All product classes",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false,
        "X": false
      },
      "sources": [
        {
          "label": "Asset management",
          "url": "https://www.ncsc.gov.uk/guidance/asset-management"
        },
        {
          "label": "CAF A3",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a3-asset-management"
        }
      ]
    },
    {
      "id": "HW-07",
      "stage": 2,
      "statement": "Devices are bought through an approved supplier path; zero-touch enrolment is used where it is available and has been risk-assessed; the contract states how returned or faulty devices will be sanitised. For SECRET, the security authority must agree the enrolment and returns path; public NCSC purchasing guidance is written for enterprise devices generally, not as a SECRET enrolment standard.",
      "evidence": "Purchase route; enrolment-programme membership; returns/sanitisation clause; security-authority view of whether zero-touch assignment (which may identify the end customer earlier in the chain) is acceptable.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "A4",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for the SECRET path decision",
        "core": true,
        "enhanced": true
      },
      "classesText": "L, D, Dk, V",
      "classes": {
        "L": false,
        "D": false,
        "Dk": false,
        "V": false
      },
      "sources": [
        {
          "label": "Purchasing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/purchasing-devices"
        }
      ]
    },
    {
      "id": "HW-08",
      "stage": 2,
      "statement": "Incoming equipment is checked for authenticity and integrity (packaging and seals, serials against the purchase order, unexpected or damaged items), including docks, printers and other peripherals, not only PCs.",
      "evidence": "Goods-in checklist covering each class; exception log.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "A3",
        "A4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All product classes",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false,
        "X": false
      },
      "sources": [
        {
          "label": "Purchasing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/purchasing-devices"
        },
        {
          "label": "CAF A4",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain"
        }
      ]
    },
    {
      "id": "HW-09",
      "stage": 2,
      "statement": "Equipment bought outside a trusted supplier path, or that fails intake checks, is quarantined and securely erased (or not used) before any enrolment or first use.",
      "evidence": "Quarantine and erase procedure, tested in alpha on a sacrificial unit if the authority agrees.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "A4",
        "B3"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All product classes",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false,
        "X": false
      },
      "sources": [
        {
          "label": "Purchasing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/purchasing-devices"
        }
      ]
    },
    {
      "id": "HW-10",
      "stage": 2,
      "statement": "Sanitisation and whole-life disposal requirements were understood at purchase, and manufacturer sanitisation instructions are on file for each model that can store data (including printers and docks with storage, not only PC disks).",
      "evidence": "Procurement checklist item; manufacturer wipe/reset guidance per model.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "A4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D, U, Dk, P, and any class with storage",
      "classes": {
        "L": false,
        "D": false,
        "U": false,
        "Dk": false,
        "P": false
      },
      "sources": [
        {
          "label": "Secure sanitisation",
          "url": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media"
        },
        {
          "label": "Decommissioning assets",
          "url": "https://www.ncsc.gov.uk/guidance/decommissioning-assets"
        }
      ]
    },
    {
      "id": "HW-11",
      "stage": 3,
      "statement": "Critical firmware settings are enabled and locked down: Secure Boot or verified boot, allowed boot paths, and authenticated firmware updates. Only administrators can change them.",
      "evidence": "Baseline build standard; sample device evidence from the alpha pilot.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D; P or other classes if they expose equivalent firmware settings",
      "classes": {
        "L": false,
        "D": false,
        "P": false
      },
      "sources": [
        {
          "label": "Managing device firmware",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
        }
      ]
    },
    {
      "id": "HW-12",
      "stage": 3,
      "statement": "Devices are built from a protected gold or baseline image: unused accounts and services removed or disabled, default credentials changed, and standard users unable to weaken security settings. The known-good configuration is recorded so the device can be rebuilt.",
      "evidence": "Gold-build documentation; hardening standard; a rebuild test in alpha or private beta.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B4",
        "B2"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "CAF B4",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security"
        },
        {
          "label": "Cyber Essentials v3.3 PDF",
          "url": "https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf"
        }
      ]
    },
    {
      "id": "HW-13",
      "stage": 3,
      "statement": "Data at rest is protected with hardware-backed encryption in a recommended configuration. For SECRET, the encryption product and configuration must be whatever the security authority requires; a commodity TPM-backed disk encryption feature is not automatically sufficient.",
      "evidence": "Encryption policy; sample hardware-backed encryption state; a recorded question to the security authority about the approved mechanism (CAPS High Grade disk encryption may be in play).",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for the official SECRET mechanism",
        "core": true,
        "enhanced": true
      },
      "classesText": "L, D, U",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "Choosing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices"
        },
        {
          "label": "Device principle: protect data",
          "url": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/protect-data-at-rest-and-in-transit"
        },
        {
          "label": "CAPS",
          "url": "https://www.ncsc.gov.uk/schemes/caps-assisted-products/introduction"
        }
      ]
    },
    {
      "id": "HW-14",
      "stage": 3,
      "statement": "Unused device interfaces, especially DMA-capable ports, are disabled or constrained in line with policy. This includes ports on docks and monitor hubs.",
      "evidence": "Peripheral / port policy; firmware or OS setting evidence from the alpha pilot; physical port control where used.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) to treat unused interfaces as closed by default on SECRET-capable builds",
        "core": true,
        "enhanced": true
      },
      "classesText": "L, D, Dk, Mo, and any class with pass-through ports",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false
      },
      "sources": [
        {
          "label": "Using peripherals securely",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely"
        },
        {
          "label": "Constrain device interfaces",
          "url": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces"
        }
      ]
    },
    {
      "id": "HW-15",
      "stage": 3,
      "statement": "Only trusted, authorised software can be installed, and malware protection is in place and managed.",
      "evidence": "Application-allowance or signing policy; MDM compliance; malware-protection status.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B4",
        "B2"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "Permit only trusted software",
          "url": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/permit-only-trusted-software"
        },
        {
          "label": "Cyber Essentials v3.3 PDF",
          "url": "https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf"
        }
      ]
    },
    {
      "id": "HW-44",
      "stage": 3,
      "statement": "Wireless peripherals (Bluetooth or proprietary) are either not used, or are limited to managed, organisation-approved devices with pairing controlled and older or weak wireless modes disabled. Keystroke interception of a wireless keyboard is a named NCSC risk.",
      "evidence": "Wireless-peripheral policy; approved model list; alpha test that unmanaged pairing is blocked and that traffic is not using a weak mode.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B4",
        "B3"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) to prefer wired, approved input devices unless the authority accepts a specific wireless product",
        "core": true,
        "enhanced": true
      },
      "classesText": "K, M, H, C, W, and the L/D they attach to",
      "classes": {
        "K": false,
        "M": false,
        "W": false
      },
      "sources": [
        {
          "label": "Using peripherals securely",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely"
        }
      ]
    },
    {
      "id": "HW-45",
      "stage": 3,
      "statement": "USB and other physical peripherals are limited so that unknown devices, especially those that present as a keyboard (HID) or other unexpected class, cannot run commands or install software. USB data blockers may be used where only charging is needed.",
      "evidence": "USB / HID allow-list or class restriction; alpha test with a non-approved HID-class device (in a safe evaluation environment); cable and charger policy.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for default-deny of unknown USB on SECRET-capable builds",
        "core": true,
        "enhanced": true
      },
      "classesText": "K, M, U, Dk, L, D",
      "classes": {
        "K": false,
        "M": false,
        "L": false,
        "D": false,
        "U": false
      },
      "sources": [
        {
          "label": "Using peripherals securely",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely"
        }
      ]
    },
    {
      "id": "HW-46",
      "stage": 3,
      "statement": "Cameras and microphones, including those built into laptops, monitors or headsets, cannot be used by applications or remote parties until a user or administrator grants permission. They can be disabled when not required. Smart listening devices and personal wearables are kept out of SECRET conversations unless expressly risk-assessed.",
      "evidence": "Permission model; physical or logical disable method; alpha test; room/device policy for SECRET discussions.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "B2",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for SECRET conversation rules",
        "core": true,
        "enhanced": true
      },
      "classesText": "C, Mo, H, L, D",
      "classes": {
        "Mo": true,
        "C": false
      },
      "sources": [
        {
          "label": "Minimise privilege and reach",
          "url": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/minimise-the-privilege-and-reach-of-applications"
        },
        {
          "label": "Guidance 1.2",
          "url": "https://www.gov.uk/government/publications/government-security-classifications/guidance-12-working-at-secret-html"
        }
      ]
    },
    {
      "id": "HW-47",
      "stage": 3,
      "statement": "Printers, scanners and multi-function devices are treated as computers that can store and transmit data: supported firmware, authentication, encryption of stored jobs where the product allows it, no unnecessary cloud or outbound services, and the ability to sanitise stored data. At SECRET, use of copiers and MFDs is controlled to deter unauthorised copying or transmission.",
      "evidence": "Firmware and storage story; network and cloud services list (and how they are disabled); sanitisation method; proposed physical/process controls for copy and transmit. Public NCSC guidance is general rather than a printer standard; record residual uncertainty.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for SECRET copy/transmit control",
        "core": true,
        "enhanced": true
      },
      "classesText": "P",
      "classes": {
        "P": false
      },
      "sources": [
        {
          "label": "Using peripherals securely",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely"
        },
        {
          "label": "Managing device firmware",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
        },
        {
          "label": "Guidance 1.5",
          "url": "https://www.gov.uk/government/publications/government-security-classifications/guidance-15-considerations-for-security-advisors-html"
        },
        {
          "label": "Secure sanitisation",
          "url": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media"
        }
      ]
    },
    {
      "id": "HW-48",
      "stage": 3,
      "statement": "Docks, Thunderbolt or USB4 adapters, and similar DMA-capable accessories are treated as part of the trusted platform, not as harmless extras. New DMA devices cannot be used when the host is locked, and only approved docks are allowed.",
      "evidence": "Dock model list; DMA and option-ROM controls; alpha test of an unapproved dock against the locked host.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for an approved-dock list only",
        "core": true,
        "enhanced": true
      },
      "classesText": "Dk, L, D",
      "classes": {
        "Dk": false,
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "Using peripherals securely",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely"
        }
      ]
    },
    {
      "id": "HW-49",
      "stage": 3,
      "statement": "Headsets and other audio devices used for official or SECRET conversations are organisation-approved. Devices with unmanaged wireless links, cloud assistants or always-on microphones are not accepted by default.",
      "evidence": "Approved headset list; feature sheet (wireless, assistant, firmware update); alpha check.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for SECRET-approved audio",
        "core": true,
        "enhanced": true
      },
      "classesText": "H",
      "classes": {
        "H": false
      },
      "sources": [
        {
          "label": "Guidance 1.2",
          "url": "https://www.gov.uk/government/publications/government-security-classifications/guidance-12-working-at-secret-html"
        },
        {
          "label": "Using peripherals securely",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely"
        }
      ]
    },
    {
      "id": "HW-54",
      "stage": 3,
      "statement": "Use of removable media is minimised. Where it is used, content is encrypted, and at SECRET it is encrypted unless, by exception, there is appropriate full-life physical protection, as the public GSCP table states. The encryption product is whatever the security authority requires.",
      "evidence": "Removable-media policy; encryption method; exception process.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "B4"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community), following published GSCP",
        "core": false,
        "enhanced": true
      },
      "classesText": "U",
      "classes": {
        "U": false
      },
      "sources": [
        {
          "label": "Guidance 1.5",
          "url": "https://www.gov.uk/government/publications/government-security-classifications/guidance-15-considerations-for-security-advisors-html"
        },
        {
          "label": "Using peripherals securely",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely"
        }
      ]
    },
    {
      "id": "HW-58",
      "stage": 3,
      "statement": "Headphones or headsets used while discussing SECRET are approved by the organisation, as Guidance 1.2 requires.",
      "evidence": "Approval record and model list; user briefing.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "B6"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community), following published GSCP",
        "core": false,
        "enhanced": true
      },
      "classesText": "H",
      "classes": {
        "H": false
      },
      "sources": [
        {
          "label": "Guidance 1.2",
          "url": "https://www.gov.uk/government/publications/government-security-classifications/guidance-12-working-at-secret-html"
        }
      ]
    },
    {
      "id": "HW-59",
      "stage": 3,
      "statement": "Photocopiers and multi-function digital devices are controlled so as to deter unauthorised copying or electronic transmission of SECRET material.",
      "evidence": "Process and technical controls (for example authentication, disabled transmit features, audit, physical siting); security-authority acceptance.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "B4"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community), following published GSCP",
        "core": false,
        "enhanced": true
      },
      "classesText": "P",
      "classes": {
        "P": false
      },
      "sources": [
        {
          "label": "Guidance 1.5",
          "url": "https://www.gov.uk/government/publications/government-security-classifications/guidance-15-considerations-for-security-advisors-html"
        }
      ]
    },
    {
      "id": "HW-16",
      "stage": 4,
      "statement": "Devices are enrolled into management with strong authentication, using zero-touch enrolment only where the platform supports it **and** the security authority has accepted the supply-chain implications, before they are issued for live use.",
      "evidence": "Enrolment design; alpha enrolment test; unenrolled-device exception list.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B2",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for the SECRET enrolment decision",
        "core": true,
        "enhanced": true
      },
      "classesText": "L, D, and managed peripherals if applicable (P, Dk)",
      "classes": {
        "L": false,
        "D": false,
        "Dk": false,
        "P": false
      },
      "sources": [
        {
          "label": "Purchasing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/purchasing-devices"
        },
        {
          "label": "Mobile Device Management",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management"
        }
      ]
    },
    {
      "id": "HW-17",
      "stage": 4,
      "statement": "MDM (or equivalent) enforces the security configuration, monitors compliance, and can lock or wipe a device. The management service itself is protected.",
      "evidence": "Policy set; compliance view; wipe/lock test in a safe environment; hardening of the management service. Whether that service may run at SECRET, and on which infrastructure, is a security-authority decision.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B2",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for the management-plane location and assurance",
        "core": true,
        "enhanced": true
      },
      "classesText": "L, D",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "MDM",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management"
        },
        {
          "label": "Allow robust device management",
          "url": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/allow-robust-device-management"
        }
      ]
    },
    {
      "id": "HW-18",
      "stage": 4,
      "statement": "Devices and systems that support the function are administered only by authorised privileged users, from corporately managed and (for higher assurance) highly trusted or dedicated administration devices.",
      "evidence": "Privileged-access design; admin-device standard.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B2",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for dedicated admin devices",
        "core": true,
        "enhanced": true
      },
      "classesText": "L, D",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "CAF B4",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security"
        }
      ]
    },
    {
      "id": "HW-19",
      "stage": 4,
      "statement": "Where the risk justifies it, physical tamper protections (for example port locks or tamper-evident seals) are fitted and checked regularly. Distribution of equipment uses a secure handling process.",
      "evidence": "Physical-security standard; inspection records; distribution procedure.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B4",
        "B5"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) as default for SECRET-capable assets in transit or in shared spaces",
        "core": true,
        "enhanced": true
      },
      "classesText": "All product classes that leave a controlled store",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false
      },
      "sources": [
        {
          "label": "CAF B4",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security"
        },
        {
          "label": "Purchasing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/purchasing-devices"
        }
      ]
    },
    {
      "id": "HW-20",
      "stage": 4,
      "statement": "Data in transit to and from the device is protected by a method the security authority has accepted. For SECRET, the public GSCP table points to appropriately secured mechanisms, accredited shared services or Enhanced Grade encryption, not to an arbitrary commodity VPN.",
      "evidence": "Design of the approved communications path; vendor compatibility evidence; security-authority acceptance.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "B4"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community)",
        "core": false,
        "enhanced": true
      },
      "classesText": "L, D, X, and any networked P",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "X": false
      },
      "sources": [
        {
          "label": "Guidance 1.5",
          "url": "https://www.gov.uk/government/publications/government-security-classifications/guidance-15-considerations-for-security-advisors-html"
        },
        {
          "label": "Protect data at rest and in transit",
          "url": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/protect-data-at-rest-and-in-transit"
        },
        {
          "label": "CAPS",
          "url": "https://www.ncsc.gov.uk/schemes/caps-assisted-products/introduction"
        }
      ]
    },
    {
      "id": "HW-21",
      "stage": 5,
      "statement": "Operating systems, applications and firmware on in-scope equipment are licensed, still supported, and set to update automatically where that is possible and has been risk-assessed.",
      "evidence": "Support-status report covering PCs **and** peripherals; auto-update method; sample versions.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D, and every class with firmware (see matrix)",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false,
        "X": false
      },
      "sources": [
        {
          "label": "Keeping devices up to date",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/keeping-devices-and-software-up-to-date"
        },
        {
          "label": "CAF B4",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security"
        },
        {
          "label": "Cyber Essentials v3.3 PDF",
          "url": "https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf"
        }
      ]
    },
    {
      "id": "HW-22",
      "stage": 5,
      "statement": "Announced vulnerabilities are tracked and prioritised. Critical or high-risk fixes are applied within a defined time, or a documented temporary mitigation is in place. Cyber Essentials’ 14-day rule is a public baseline for in-scope CE assessments; the programme may set a stricter SECRET target.",
      "evidence": "Vulnerability tracker; patch-compliance report; exception records.",
      "phases": [
        "L"
      ],
      "caf": [
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) if a stricter target is set",
        "core": true,
        "enhanced": true
      },
      "classesText": "L, D, P, and other updatable classes",
      "classes": {
        "L": false,
        "D": false,
        "P": false
      },
      "sources": [
        {
          "label": "Cyber Essentials v3.3 PDF",
          "url": "https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf"
        },
        {
          "label": "CAF B4",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security"
        }
      ]
    },
    {
      "id": "HW-23",
      "stage": 5,
      "statement": "Firmware updates are automated where the platform allows it (for example Windows UEFI Firmware Capsule Update, Linux Vendor Firmware Service, or the OEM enterprise tool), including dock and printer firmware where those tools exist.",
      "evidence": "Firmware-update method per model; last-update reports; list of models that cannot be automated and the compensating process.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D, Dk, P, Mo where supported",
      "classes": {
        "L": false,
        "D": false,
        "Dk": false,
        "Mo": false,
        "P": false
      },
      "sources": [
        {
          "label": "Managing device firmware",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
        }
      ]
    },
    {
      "id": "HW-24",
      "stage": 5,
      "statement": "Unsupported hardware, firmware or software is identified, given additional protection only as a temporary measure, and actively migrated or removed.",
      "evidence": "Unsupported-asset register; migration plan.",
      "phases": [
        "L"
      ],
      "caf": [
        "B4",
        "A3"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All product classes",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false,
        "X": false
      },
      "sources": [
        {
          "label": "CAF B4",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security"
        },
        {
          "label": "Cyber Essentials v3.3 PDF",
          "url": "https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf"
        }
      ]
    },
    {
      "id": "HW-25",
      "stage": 5,
      "statement": "Access to local and remote firmware management interfaces is restricted to authorised administrators.",
      "evidence": "Access standard; privilege list; sample configuration, including printer and dock management interfaces.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B2",
        "B4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D, P, Dk",
      "classes": {
        "L": false,
        "D": false,
        "Dk": false,
        "P": false
      },
      "sources": [
        {
          "label": "Managing device firmware",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
        }
      ]
    },
    {
      "id": "HW-26",
      "stage": 6,
      "statement": "Firmware-relevant events are logged where the device can provide them (version, setting changes, update events, boot status and, where available, boot measurements). NCSC warns that many devices are weak here; a honest partial rating is better than a hidden gap.",
      "evidence": "Logging standard; sample logs from the alpha pilot; note of classes with only limited firmware logging.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "C1",
        "B4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D, and any class that can emit firmware logs (P, Dk, X)",
      "classes": {
        "L": false,
        "D": false,
        "Dk": false,
        "P": false,
        "X": false
      },
      "sources": [
        {
          "label": "Managing device firmware",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
        }
      ]
    },
    {
      "id": "HW-27",
      "stage": 6,
      "statement": "Device Health Attestation, or an equivalent hardware-backed health report, is used where the platform supports it, so that an unhealthy or tampered device can be identified.",
      "evidence": "Attestation or health-compliance policy and reports; action on failed attestation.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "C1",
        "B4"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) where the platform can support it",
        "core": true,
        "enhanced": true
      },
      "classesText": "L, D",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "Transparency of device health",
          "url": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/ensure-transparency-of-device-health"
        },
        {
          "label": "Managing device firmware",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
        }
      ]
    },
    {
      "id": "HW-28",
      "stage": 6,
      "statement": "Device and management-plane security logs are collected and reviewed so that attacks or misconfiguration can be detected in time. Whether, and how, those logs may leave a SECRET environment is a security-authority decision.",
      "evidence": "Protective-monitoring design; log sources on a sample of device types; coverage gaps.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "C1",
        "C2"
      ],
      "tier": {
        "kind": "core-enhanced",
        "note": "Core; Enhanced (community) for the official monitoring path",
        "core": true,
        "enhanced": true
      },
      "classesText": "L, D, P, U, C, W, X",
      "classes": {
        "L": false,
        "D": false,
        "U": false,
        "Dk": false,
        "P": false,
        "C": false,
        "W": false,
        "X": false
      },
      "sources": [
        {
          "label": "Logging and protective monitoring",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/logging-and-protective-monitoring"
        },
        {
          "label": "CAF C1",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-c-detecting-cyber-security-events/principle-c1-security-monitoring"
        },
        {
          "label": "CAF C2",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-c-detecting-cyber-security-events/principle-c2-threat-hunting"
        }
      ]
    },
    {
      "id": "HW-29",
      "stage": 6,
      "statement": "Users are told how to recognise warnings that may indicate firmware tampering or corruption, how to treat unknown peripherals, and how to report them.",
      "evidence": "User guidance; helpdesk category; briefing for evaluation users in alpha.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B6",
        "C1"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D (users of all attached classes)",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "Managing device firmware",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
        },
        {
          "label": "CAF B6",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b6-staff-awareness-and-training"
        },
        {
          "label": "Advice for end users",
          "url": "https://www.ncsc.gov.uk/guidance/end-user-devices-advice-end-users"
        }
      ]
    },
    {
      "id": "HW-30",
      "stage": 6,
      "statement": "The live estate is compared with the asset register so that unexpected or unmanaged devices and peripherals can be found.",
      "evidence": "Discovery versus inventory reconciliation, including docks, printers and wireless accessories as far as the tools allow.",
      "phases": [
        "L"
      ],
      "caf": [
        "A3",
        "C1"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All product classes",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": true,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": true
      },
      "sources": [
        {
          "label": "Asset management",
          "url": "https://www.ncsc.gov.uk/guidance/asset-management"
        },
        {
          "label": "CAF A3",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a3-asset-management"
        }
      ]
    },
    {
      "id": "HW-31",
      "stage": 7,
      "statement": "The incident response plan covers likely hardware events (lost or stolen devices, firmware or boot compromise, supply-chain incidents, emergency patching, rebuild, and supplier-involved incidents) and is understood by the people who must use it, including vendors who would be called.",
      "evidence": "Plan sections; roles (no personal names on a public copy); last review date.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "D1",
        "A4"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All; V",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false,
        "X": false,
        "V": false
      },
      "sources": [
        {
          "label": "CAF D1",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-d/principle-d1-response-and-recovery-planning"
        },
        {
          "label": "10 Steps incident management",
          "url": "https://www.ncsc.gov.uk/collection/10-steps/incident-management"
        }
      ]
    },
    {
      "id": "HW-32",
      "stage": 7,
      "statement": "Lost or stolen devices can be locked or wiped promptly from the management service, and staff know how to report loss. Removable media that cannot be wiped is covered by a separate compensating process.",
      "evidence": "Wipe/lock procedure and a timed test; user reporting route; media-loss process.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "D1",
        "B3"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D, U",
      "classes": {
        "L": false,
        "D": false,
        "U": false
      },
      "sources": [
        {
          "label": "MDM",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management"
        }
      ]
    },
    {
      "id": "HW-33",
      "stage": 7,
      "statement": "A protected gold or known-good build (or equivalent recovery image) is available so that a device or platform can be restored to a known good state.",
      "evidence": "Gold-image protection; successful rebuild test; recovery time.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "D1",
        "B4",
        "B5"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D, P (re-image or reset where applicable)",
      "classes": {
        "L": false,
        "D": false,
        "Dk": false,
        "P": false
      },
      "sources": [
        {
          "label": "Enable recovery to a known good state",
          "url": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/enable-recovery-to-a-known-good-state"
        },
        {
          "label": "Erasing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/erasing-devices"
        },
        {
          "label": "CAF B4",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security"
        }
      ]
    },
    {
      "id": "HW-34",
      "stage": 7,
      "statement": "For higher-criticality platforms, devices can detect firmware compromise or corruption and recover firmware securely, or a compensating process is documented where the hardware cannot do this.",
      "evidence": "Vendor capability evidence; recovery test or documented limitation.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B4",
        "D1"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community)",
        "core": false,
        "enhanced": true
      },
      "classesText": "L, D",
      "classes": {
        "L": false,
        "D": false
      },
      "sources": [
        {
          "label": "Managing device firmware",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
        },
        {
          "label": "NIST SP 800-193",
          "url": "https://csrc.nist.gov/pubs/sp/800/193/final"
        }
      ]
    },
    {
      "id": "HW-35",
      "stage": 7,
      "statement": "Response plans are exercised, including hardware rebuild and a supplier-involved scenario, and lessons are fed back into the plan and into protective measures.",
      "evidence": "Exercise records; findings log; changes made.",
      "phases": [
        "L"
      ],
      "caf": [
        "D1",
        "D2"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All; V",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false,
        "X": false
      },
      "sources": [
        {
          "label": "CAF D1",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-d/principle-d1-response-and-recovery-planning"
        },
        {
          "label": "CAF D2",
          "url": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-d/principle-d2-lessons-learned"
        }
      ]
    },
    {
      "id": "HW-36",
      "stage": 8,
      "statement": "Any device or media that may have stored sensitive data is sanitised before reuse, sale, repair or disposal. Deletion of files alone is not accepted as sanitisation. This includes printer and dock storage, not only PC disks.",
      "evidence": "Reuse and disposal policy; sanitisation records tied to asset IDs.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "A3"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All classes that can store data; process also for accessories until proven otherwise",
      "classes": {
        "L": false,
        "D": false,
        "K": false,
        "M": false,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": false,
        "C": false,
        "W": false,
        "Kv": false,
        "X": false
      },
      "sources": [
        {
          "label": "Secure sanitisation",
          "url": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media"
        },
        {
          "label": "Erasing devices",
          "url": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/erasing-devices"
        }
      ]
    },
    {
      "id": "HW-37",
      "stage": 8,
      "statement": "Encrypted devices are sanitised using the manufacturer factory reset / crypto-erase process. Unencrypted devices are overwritten across user-accessible memory and the overwrite is verified, with residual-risk cases escalated. This is the **public OFFICIAL-proportionate** method.",
      "evidence": "Method used per device type; verification output; escalations.",
      "phases": [
        "L"
      ],
      "caf": [
        "B3"
      ],
      "tier": {
        "kind": "core",
        "note": "Core (OFFICIAL-proportionate method only)",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D, U, P, Dk",
      "classes": {
        "L": false,
        "D": false,
        "U": false,
        "Dk": false,
        "P": false
      },
      "sources": [
        {
          "label": "Secure sanitisation",
          "url": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media"
        }
      ]
    },
    {
      "id": "HW-38",
      "stage": 8,
      "statement": "Where data may remain, or the residual risk is not acceptable, media is erased and then physically destroyed to particles of 6 mm or less, and particle size is verified. This is the public destruction threshold NCSC describes; it is not a substitute for SECRET-specific advice (see HW-55).",
      "evidence": "Destruction method, particle-size check, and “erased before destroyed” evidence.",
      "phases": [
        "L"
      ],
      "caf": [
        "B3"
      ],
      "tier": {
        "kind": "core",
        "note": "Core, with that limit stated",
        "core": true,
        "enhanced": false
      },
      "classesText": "L, D, U, P, and other storage media",
      "classes": {
        "L": false,
        "D": false,
        "U": false,
        "P": false
      },
      "sources": [
        {
          "label": "Secure sanitisation",
          "url": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media"
        }
      ]
    },
    {
      "id": "HW-39",
      "stage": 8,
      "statement": "Chain of custody is kept through decommissioning, awaiting-disposal storage is secured, certificates or equivalent evidence of destruction are retained, and the asset register is updated when the device leaves control.",
      "evidence": "Custody log; storage controls; certificates; inventory updates.",
      "phases": [
        "A",
        "L"
      ],
      "caf": [
        "B3",
        "A3"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "All product classes",
      "classes": {
        "L": false,
        "D": false,
        "K": true,
        "M": true,
        "U": false,
        "Dk": false,
        "Mo": false,
        "P": false,
        "H": true,
        "C": false,
        "W": true,
        "Kv": false,
        "X": false
      },
      "sources": [
        {
          "label": "Decommissioning assets",
          "url": "https://www.ncsc.gov.uk/guidance/decommissioning-assets"
        }
      ]
    },
    {
      "id": "HW-40",
      "stage": 8,
      "statement": "Where a third-party sanitisation or destruction service is used, current NCSC-recognised assurance is checked. CAS-S closed on 5 January 2026; new assurance is through CRTFs. Existing unexpired CAS-S certificates may still be valid.",
      "evidence": "Supplier assurance evidence; contract and job records.",
      "phases": [
        "D",
        "L"
      ],
      "caf": [
        "A4",
        "B3"
      ],
      "tier": {
        "kind": "core",
        "note": "Core",
        "core": true,
        "enhanced": false
      },
      "classesText": "V, and any class sent to a service",
      "classes": {
        "L": false,
        "D": false,
        "U": false,
        "Dk": false,
        "P": false,
        "V": false
      },
      "sources": [
        {
          "label": "CAS-S introduction",
          "url": "https://www.ncsc.gov.uk/schemes/sanitisation-assurance-scheme-cas-s/introduction"
        },
        {
          "label": "CRTF",
          "url": "https://www.ncsc.gov.uk/schemes/cyber-resilience-test-facilities/introduction"
        }
      ]
    },
    {
      "id": "HW-55",
      "stage": 8,
      "statement": "If equipment or media has stored, or may have stored, data at SECRET or above, the public OFFICIAL sanitisation page is **not** treated as sufficient. Separate official guidance is obtained from the organisation’s normal NCSC point of contact, as that page itself requires. OFFICIAL media is not reused to store SECRET or above, even after the public process.",
      "evidence": "A recorded instruction from the security authority (and, where they have it, the official NCSC advice), held privately; a process that keeps SECRET media on a distinct path.",
      "phases": [
        "D",
        "A",
        "L"
      ],
      "caf": [
        "B3"
      ],
      "tier": {
        "kind": "enhanced",
        "note": "Enhanced (community), following the public NCSC “ask for separate guidance” rule rather than inventing methods",
        "core": false,
        "enhanced": true
      },
      "classesText": "L, D, U, P, Dk, and any other storage",
      "classes": {
        "L": false,
        "D": false,
        "U": false,
        "Dk": false,
        "Mo": true,
        "P": false,
        "C": true,
        "Kv": true,
        "X": false,
        "V": false
      },
      "sources": [
        {
          "label": "Secure sanitisation",
          "url": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media"
        }
      ]
    }
  ],
  "matrix": [
    {
      "stage": 1,
      "cells": {
        "L": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-02",
            "partial": false
          },
          {
            "id": "HW-03",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-41",
            "partial": false
          },
          {
            "id": "HW-43",
            "partial": false
          },
          {
            "id": "HW-51",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          },
          {
            "id": "HW-60",
            "partial": false
          }
        ],
        "D": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-02",
            "partial": false
          },
          {
            "id": "HW-03",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-41",
            "partial": false
          },
          {
            "id": "HW-43",
            "partial": false
          },
          {
            "id": "HW-51",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          },
          {
            "id": "HW-60",
            "partial": false
          }
        ],
        "K": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-44",
            "partial": false
          },
          {
            "id": "HW-45",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "M": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-44",
            "partial": false
          },
          {
            "id": "HW-45",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "U": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-54",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "Dk": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-48",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "Mo": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-46",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": true
          }
        ],
        "P": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-47",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          },
          {
            "id": "HW-59",
            "partial": false
          }
        ],
        "H": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-49",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-58",
            "partial": false
          }
        ],
        "C": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-46",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "W": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-44",
            "partial": false
          },
          {
            "id": "HW-56",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "Kv": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-53",
            "partial": true
          }
        ],
        "X": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-52",
            "partial": false
          }
        ],
        "V": [
          {
            "id": "HW-01",
            "partial": false
          },
          {
            "id": "HW-04",
            "partial": false
          },
          {
            "id": "HW-05",
            "partial": false
          },
          {
            "id": "HW-41",
            "partial": false
          },
          {
            "id": "HW-42",
            "partial": false
          },
          {
            "id": "HW-43",
            "partial": false
          },
          {
            "id": "HW-60",
            "partial": false
          }
        ]
      }
    },
    {
      "stage": 2,
      "cells": {
        "L": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-07",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          },
          {
            "id": "HW-10",
            "partial": false
          }
        ],
        "D": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-07",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          },
          {
            "id": "HW-10",
            "partial": false
          }
        ],
        "K": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          }
        ],
        "M": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          }
        ],
        "U": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          },
          {
            "id": "HW-10",
            "partial": false
          }
        ],
        "Dk": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-07",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          },
          {
            "id": "HW-10",
            "partial": false
          }
        ],
        "Mo": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          }
        ],
        "P": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          },
          {
            "id": "HW-10",
            "partial": false
          }
        ],
        "H": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          }
        ],
        "C": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          }
        ],
        "W": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          }
        ],
        "Kv": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          }
        ],
        "X": [
          {
            "id": "HW-06",
            "partial": false
          },
          {
            "id": "HW-08",
            "partial": false
          },
          {
            "id": "HW-09",
            "partial": false
          }
        ],
        "V": [
          {
            "id": "HW-07",
            "partial": false
          },
          {
            "id": "HW-41",
            "partial": false
          }
        ]
      }
    },
    {
      "stage": 3,
      "cells": {
        "L": [
          {
            "id": "HW-11",
            "partial": false
          },
          {
            "id": "HW-12",
            "partial": false
          },
          {
            "id": "HW-13",
            "partial": false
          },
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-15",
            "partial": false
          },
          {
            "id": "HW-45",
            "partial": false
          },
          {
            "id": "HW-48",
            "partial": false
          }
        ],
        "D": [
          {
            "id": "HW-11",
            "partial": false
          },
          {
            "id": "HW-12",
            "partial": false
          },
          {
            "id": "HW-13",
            "partial": false
          },
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-15",
            "partial": false
          },
          {
            "id": "HW-45",
            "partial": false
          },
          {
            "id": "HW-48",
            "partial": false
          }
        ],
        "K": [
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-44",
            "partial": false
          },
          {
            "id": "HW-45",
            "partial": false
          }
        ],
        "M": [
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-44",
            "partial": false
          },
          {
            "id": "HW-45",
            "partial": false
          }
        ],
        "U": [
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-45",
            "partial": false
          },
          {
            "id": "HW-54",
            "partial": false
          }
        ],
        "Dk": [
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-48",
            "partial": false
          }
        ],
        "Mo": [
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-46",
            "partial": true
          }
        ],
        "P": [
          {
            "id": "HW-11",
            "partial": false
          },
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-47",
            "partial": false
          },
          {
            "id": "HW-59",
            "partial": false
          }
        ],
        "H": [
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-49",
            "partial": false
          },
          {
            "id": "HW-58",
            "partial": false
          }
        ],
        "C": [
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-46",
            "partial": false
          }
        ],
        "W": [
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-44",
            "partial": false
          }
        ],
        "Kv": [
          {
            "id": "HW-14",
            "partial": false
          },
          {
            "id": "HW-53",
            "partial": true
          }
        ],
        "X": [
          {
            "id": "HW-52",
            "partial": false
          }
        ],
        "V": []
      }
    },
    {
      "stage": 4,
      "cells": {
        "L": [
          {
            "id": "HW-16",
            "partial": false
          },
          {
            "id": "HW-17",
            "partial": false
          },
          {
            "id": "HW-18",
            "partial": false
          },
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-20",
            "partial": false
          },
          {
            "id": "HW-51",
            "partial": false
          }
        ],
        "D": [
          {
            "id": "HW-16",
            "partial": false
          },
          {
            "id": "HW-17",
            "partial": false
          },
          {
            "id": "HW-18",
            "partial": false
          },
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-20",
            "partial": false
          },
          {
            "id": "HW-51",
            "partial": false
          }
        ],
        "K": [
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-20",
            "partial": false
          }
        ],
        "M": [
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-20",
            "partial": false
          }
        ],
        "U": [
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-20",
            "partial": false
          },
          {
            "id": "HW-54",
            "partial": false
          }
        ],
        "Dk": [
          {
            "id": "HW-16",
            "partial": false
          },
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-20",
            "partial": false
          }
        ],
        "Mo": [
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-20",
            "partial": false
          }
        ],
        "P": [
          {
            "id": "HW-16",
            "partial": false
          },
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-20",
            "partial": false
          },
          {
            "id": "HW-47",
            "partial": false
          }
        ],
        "H": [
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-58",
            "partial": false
          }
        ],
        "C": [
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-46",
            "partial": false
          }
        ],
        "W": [
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-44",
            "partial": false
          }
        ],
        "Kv": [
          {
            "id": "HW-19",
            "partial": false
          },
          {
            "id": "HW-53",
            "partial": true
          }
        ],
        "X": [
          {
            "id": "HW-20",
            "partial": false
          },
          {
            "id": "HW-52",
            "partial": false
          }
        ],
        "V": []
      }
    },
    {
      "stage": 5,
      "cells": {
        "L": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-22",
            "partial": false
          },
          {
            "id": "HW-23",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-25",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "D": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-22",
            "partial": false
          },
          {
            "id": "HW-23",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-25",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "K": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": true
          }
        ],
        "M": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": true
          }
        ],
        "U": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "Dk": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-23",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-25",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "Mo": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-23",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": true
          }
        ],
        "P": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-22",
            "partial": false
          },
          {
            "id": "HW-23",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-25",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "H": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": true
          }
        ],
        "C": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "W": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": false
          }
        ],
        "Kv": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-57",
            "partial": true
          }
        ],
        "X": [
          {
            "id": "HW-21",
            "partial": false
          },
          {
            "id": "HW-24",
            "partial": false
          },
          {
            "id": "HW-52",
            "partial": false
          }
        ],
        "V": [
          {
            "id": "HW-41",
            "partial": false
          }
        ]
      }
    },
    {
      "stage": 6,
      "cells": {
        "L": [
          {
            "id": "HW-26",
            "partial": false
          },
          {
            "id": "HW-27",
            "partial": false
          },
          {
            "id": "HW-28",
            "partial": false
          },
          {
            "id": "HW-29",
            "partial": false
          },
          {
            "id": "HW-30",
            "partial": false
          }
        ],
        "D": [
          {
            "id": "HW-26",
            "partial": false
          },
          {
            "id": "HW-27",
            "partial": false
          },
          {
            "id": "HW-28",
            "partial": false
          },
          {
            "id": "HW-29",
            "partial": false
          },
          {
            "id": "HW-30",
            "partial": false
          }
        ],
        "K": [
          {
            "id": "HW-30",
            "partial": false
          }
        ],
        "M": [
          {
            "id": "HW-30",
            "partial": false
          }
        ],
        "U": [
          {
            "id": "HW-28",
            "partial": false
          },
          {
            "id": "HW-30",
            "partial": false
          }
        ],
        "Dk": [
          {
            "id": "HW-26",
            "partial": false
          },
          {
            "id": "HW-28",
            "partial": false
          },
          {
            "id": "HW-30",
            "partial": false
          }
        ],
        "Mo": [
          {
            "id": "HW-30",
            "partial": true
          }
        ],
        "P": [
          {
            "id": "HW-26",
            "partial": false
          },
          {
            "id": "HW-28",
            "partial": false
          },
          {
            "id": "HW-30",
            "partial": false
          }
        ],
        "H": [
          {
            "id": "HW-30",
            "partial": false
          }
        ],
        "C": [
          {
            "id": "HW-28",
            "partial": false
          },
          {
            "id": "HW-30",
            "partial": false
          },
          {
            "id": "HW-46",
            "partial": false
          }
        ],
        "W": [
          {
            "id": "HW-28",
            "partial": false
          },
          {
            "id": "HW-30",
            "partial": false
          },
          {
            "id": "HW-44",
            "partial": false
          }
        ],
        "Kv": [
          {
            "id": "HW-30",
            "partial": true
          }
        ],
        "X": [
          {
            "id": "HW-26",
            "partial": false
          },
          {
            "id": "HW-28",
            "partial": false
          },
          {
            "id": "HW-52",
            "partial": false
          }
        ],
        "V": []
      }
    },
    {
      "stage": 7,
      "cells": {
        "L": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-32",
            "partial": false
          },
          {
            "id": "HW-33",
            "partial": false
          },
          {
            "id": "HW-34",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "D": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-32",
            "partial": false
          },
          {
            "id": "HW-33",
            "partial": false
          },
          {
            "id": "HW-34",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "K": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "M": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "U": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-32",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "Dk": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-33",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "Mo": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "P": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-33",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "H": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "C": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "W": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "Kv": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          }
        ],
        "X": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-35",
            "partial": false
          },
          {
            "id": "HW-52",
            "partial": false
          }
        ],
        "V": [
          {
            "id": "HW-31",
            "partial": false
          },
          {
            "id": "HW-41",
            "partial": false
          }
        ]
      }
    },
    {
      "stage": 8,
      "cells": {
        "L": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-37",
            "partial": false
          },
          {
            "id": "HW-38",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": false
          },
          {
            "id": "HW-40",
            "partial": false
          },
          {
            "id": "HW-55",
            "partial": false
          }
        ],
        "D": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-37",
            "partial": false
          },
          {
            "id": "HW-38",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": false
          },
          {
            "id": "HW-40",
            "partial": false
          },
          {
            "id": "HW-55",
            "partial": false
          }
        ],
        "K": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": true
          }
        ],
        "M": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": true
          }
        ],
        "U": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-37",
            "partial": false
          },
          {
            "id": "HW-38",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": false
          },
          {
            "id": "HW-40",
            "partial": false
          },
          {
            "id": "HW-55",
            "partial": false
          }
        ],
        "Dk": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-37",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": false
          },
          {
            "id": "HW-40",
            "partial": false
          },
          {
            "id": "HW-55",
            "partial": false
          }
        ],
        "Mo": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": false
          },
          {
            "id": "HW-55",
            "partial": true
          }
        ],
        "P": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-37",
            "partial": false
          },
          {
            "id": "HW-38",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": false
          },
          {
            "id": "HW-40",
            "partial": false
          },
          {
            "id": "HW-47",
            "partial": false
          },
          {
            "id": "HW-55",
            "partial": false
          }
        ],
        "H": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": true
          }
        ],
        "C": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": false
          },
          {
            "id": "HW-55",
            "partial": true
          }
        ],
        "W": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": true
          }
        ],
        "Kv": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": false
          },
          {
            "id": "HW-55",
            "partial": true
          }
        ],
        "X": [
          {
            "id": "HW-36",
            "partial": false
          },
          {
            "id": "HW-39",
            "partial": false
          },
          {
            "id": "HW-55",
            "partial": false
          }
        ],
        "V": [
          {
            "id": "HW-40",
            "partial": false
          },
          {
            "id": "HW-55",
            "partial": false
          }
        ]
      }
    }
  ]
};
