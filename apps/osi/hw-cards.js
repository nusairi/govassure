/* Hardware layer explainers for the OSI Rings detail panel. Not official NCSC guidance. */
(function () {
  "use strict";
  var CARDS = {
  "UEFI": {
    "stage": "build",
    "stageLabel": "Build & configure",
    "what": "UEFI is the modern firmware that starts your PC before the operating system loads. Every boot passes through it first.",
    "why": "If an attacker can change UEFI, they can load a bootkit or implant that runs before Windows, security tools or disk encryption wake up. That foothold can survive OS reinstalls.",
    "how": [
      "Keep UEFI up to date through a signed, official channel.",
      "Turn Secure Boot on, restrict boot devices, and set a firmware administrator password.",
      "Disable unused boot-from-USB or network boot if people do not need it.",
      "Only allow trusted administrators to change firmware settings."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_2",
        "label": "NCSC — Managing device firmware (Preparation / Firmware Settings)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_3",
        "label": "NCSC — Managing device firmware (How to manage — Secure Boot)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
        "label": "NCSC CAF — Principle B4 System security"
      },
      {
        "href": "https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf#page=15",
        "label": "Cyber Essentials — Secure configuration (requirements PDF, p.15)"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/147/final",
        "label": "NIST SP 800-147 — BIOS Protection Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SI-7 Software, Firmware, and Information Integrity"
      }
    ]
  },
  "TPM 2.0": {
    "stage": "build",
    "stageLabel": "Build & configure",
    "what": "A TPM (Trusted Platform Module) 2.0 is a small built-in security chip that holds keys and records what actually booted, so later checks can be trusted.",
    "why": "Without a TPM, disk-encryption keys and boot evidence sit in ordinary software, where malware can copy or fake them. Attackers then unlock disks or pretend a tampered device is healthy.",
    "how": [
      "Require TPM 2.0 on devices you buy (NCSC choosing-devices).",
      "Use it for disk encryption (BitLocker or equivalent) and for storing boot measurements.",
      "Prefer a PIN as well as the TPM where your policy asks for higher assurance.",
      "Treat a missing or cleared TPM as a security event, not just a support issue."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices#section_8",
        "label": "NCSC — Choosing devices (Windows / TPM 2.0)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_3",
        "label": "NCSC — Managing device firmware (How to manage)"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — IA-7 Cryptographic Module Authentication; SI-7"
      },
      {
        "href": "https://trustedcomputinggroup.org/resource/trusted-platform-module-tpm-summary/",
        "label": "TCG — Trusted Platform Module (TPM) summary"
      }
    ]
  },
  "BMC/Redfish": {
    "stage": "deploy",
    "stageLabel": "Deploy & protect",
    "what": "A BMC (baseboard management controller) is a small computer on a server that can power, monitor and reimage the host even when the main OS is off. Redfish is the modern API used to talk to many BMCs.",
    "why": "An exposed or weakly authenticated BMC gives an attacker control of the metal, below the operating system. Default passwords and internet-facing management are a classic path in.",
    "how": [
      "Put the BMC on a dedicated, isolated management network — never the office LAN or the internet.",
      "Change all default credentials; use strong unique passwords or MFA.",
      "Prefer Redfish with strong authentication over older clear-text protocols.",
      "Inventory and monitor every BMC like any other privileged system."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/allow-robust-device-management",
        "label": "NCSC — Allow robust device management"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces",
        "label": "NCSC — Constrain use of all device interfaces"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
        "label": "NCSC CAF — Principle B4 System security"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/147/b/final",
        "label": "NIST SP 800-147B — BIOS Protection Guidelines for Servers"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — AC-17 / SC-7 (remote access and boundary protection)"
      },
      {
        "href": "https://www.dmtf.org/sites/default/files/standards/documents/DSP0266_1.20.0.pdf",
        "label": "DMTF — Redfish specification (PDF)"
      }
    ]
  },
  "IPMI": {
    "stage": "deploy",
    "stageLabel": "Deploy & protect",
    "what": "IPMI is an older out-of-band management protocol for servers. Many implementations have a long history of weak defaults and should be treated as high risk if exposed.",
    "why": "Leaving IPMI on the office or internet network is a well-known way attackers get host control below the OS, often with default or recoverable passwords.",
    "how": [
      "Disable IPMI where you can, or isolate it strictly on a management network.",
      "Prefer modern Redfish with strong authentication.",
      "Never expose IPMI to the internet; change all default passwords.",
      "Scan your estate for forgotten IPMI interfaces."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces",
        "label": "NCSC — Constrain use of all device interfaces"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/allow-robust-device-management",
        "label": "NCSC — Allow robust device management"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
        "label": "NCSC CAF — Principle B4 System security"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/147/b/final",
        "label": "NIST SP 800-147B — BIOS Protection Guidelines for Servers"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — AC-17 Remote Access; SC-7 Boundary Protection"
      }
    ]
  },
  "CPU microcode": {
    "stage": "operate",
    "stageLabel": "Operate & patch",
    "what": "CPU microcode is low-level fix code for the processor. Vendors ship updates (often via UEFI or the OS) to close hardware bugs and some side-channel issues.",
    "why": "Unpatched microcode can leave known CPU flaws open, including classes of side-channel issues that can leak secrets across security boundaries.",
    "how": [
      "Treat microcode updates as part of your normal firmware and OS patch pipeline.",
      "Track versions in your inventory, not only OS knowledge-base numbers.",
      "Apply vendor-signed updates promptly after a pilot ring.",
      "Retire devices the vendor no longer patches."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/keeping-devices-and-software-up-to-date",
        "label": "NCSC — Keeping devices and software up to date"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware",
        "label": "NCSC — Managing device firmware"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
        "label": "NCSC CAF — Principle B4 System security"
      },
      {
        "href": "https://www.ncsc.gov.uk/cyberessentials/overview",
        "label": "NCSC — Cyber Essentials overview (security updates)"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SI-2 Flaw Remediation; SI-7"
      }
    ]
  },
  "NIC firmware": {
    "stage": "operate",
    "stageLabel": "Operate & patch",
    "what": "NIC firmware runs on the network interface card. Like any firmware, it needs signing and timely updates — a compromised NIC can see or change traffic below the OS.",
    "why": "Outdated or unsigned NIC firmware can hide implants that sniff credentials or pivot inside the network, out of sight of ordinary antivirus.",
    "how": [
      "Inventory NIC (and other device) firmware alongside OS patches.",
      "Apply signed updates through OEM tools or LVFS / enterprise channels.",
      "Reject unsigned or unexpected images.",
      "Include NICs in firmware integrity monitoring where the platform allows."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware",
        "label": "NCSC — Managing device firmware"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/keeping-devices-and-software-up-to-date",
        "label": "NCSC — Keeping devices and software up to date"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/provide-updates-securely",
        "label": "NCSC — Provide updates securely"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SI-2; SI-7"
      },
      {
        "href": "https://fwupd.org/",
        "label": "LVFS / fwupd — Linux Vendor Firmware Service"
      }
    ]
  },
  "PCIe/DMA": {
    "stage": "build",
    "stageLabel": "Build & configure",
    "what": "PCIe is the fast internal bus; DMA (direct memory access) lets a device move data to memory without the CPU watching every byte. External ports such as Thunderbolt can extend that path.",
    "why": "Attackers abuse DMA over external ports to dump memory or inject code while a laptop looks locked — capturing passwords and keys outside the OS's view.",
    "how": [
      "Disable or tightly control unused DMA-capable ports.",
      "Turn on Kernel DMA Protection (or equivalent Thunderbolt security that needs approval).",
      "Block new DMA devices when the machine is locked.",
      "Follow NCSC peripherals guidance for removable media and high-speed ports."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely#section_2",
        "label": "NCSC — Using peripherals securely (Preparation — DMA risks)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely#section_3",
        "label": "NCSC — Using peripherals securely (How to manage — DMA)"
      },
      {
        "href": "https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf#page=15",
        "label": "Cyber Essentials — Secure configuration (requirements PDF, p.15)"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SC-7 Boundary Protection; SI-3 / SI-7 (related)"
      },
      {
        "href": "https://learn.microsoft.com/en-us/windows/security/hardware-security/kernel-dma-protection-for-thunderbolt",
        "label": "Microsoft — Kernel DMA Protection"
      }
    ]
  },
  "JTAG/UART": {
    "stage": "receive",
    "stageLabel": "Receive & verify",
    "what": "JTAG and UART are hardware debug ports used in factories and labs. Left open on production devices, they can expose memory and control of the board.",
    "why": "Someone with physical access can dump firmware, inject code, or bypass software locks through an unprotected debug port — a back door that never appears in the OS.",
    "how": [
      "Require vendors to disable or strongly protect debug interfaces on production devices.",
      "Check that JTAG/UART are not left enabled on gold images.",
      "Control physical access to server rooms and high-value workstations.",
      "Treat unexpected open debug ports as a receive / supply-chain finding."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces",
        "label": "NCSC — Constrain use of all device interfaces"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain",
        "label": "NCSC CAF — Principle A4 Supply chain"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — CM-7 Least Functionality; SC-7"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/161/r1/final",
        "label": "NIST SP 800-161 Rev. 1 — Cybersecurity Supply Chain Risk Management"
      }
    ]
  },
  "SPDX/CycloneDX": {
    "stage": "plan",
    "stageLabel": "Plan & procure",
    "what": "SPDX and CycloneDX are common standard formats for publishing a software bill of materials (SBOM), so tools can read the same parts list from different vendors.",
    "why": "Without a standard list, you may buy kit with unknown or backdoored components and only find out after a public breach. Homemade formats make scanning for known-bad parts slow and error-prone.",
    "how": [
      "Ask suppliers to provide an SBOM in SPDX or CycloneDX where they can.",
      "Keep the SBOM with the asset record and feed it into vulnerability management.",
      "Use it alongside wider supplier assurance (contracts, support life, CAF A4).",
      "Prefer vendors who can update the SBOM when the product changes."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/supply-chain-security",
        "label": "NCSC — Supply chain security guidance"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain",
        "label": "NCSC CAF — Principle A4 Supply chain"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/161/r1/final",
        "label": "NIST SP 800-161 Rev. 1 — Cybersecurity Supply Chain Risk Management"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SR family (Supply Chain Risk Management)"
      },
      {
        "href": "https://spdx.dev/",
        "label": "SPDX — Software Package Data Exchange"
      },
      {
        "href": "https://cyclonedx.org/",
        "label": "CycloneDX — SBOM standard"
      }
    ]
  },
  "Secure & measured boot": {
    "stage": "build",
    "stageLabel": "Build & configure",
    "what": "Secure Boot only runs signed start-up code; measured boot records what actually ran (often in the TPM) so you can check later.",
    "why": "Unsigned or tampered firmware can load quietly at boot. Without measurements, you have no trustworthy record that the device started in a known-good state.",
    "how": [
      "Enable Secure Boot and restrict allowed boot paths.",
      "Keep the boot firmware updated and signed.",
      "Store measurements in the TPM and use them for attestation or health checks.",
      "Investigate devices that fail measurement or Secure Boot."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_3",
        "label": "NCSC — Managing device firmware (How to manage — Secure Boot)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
        "label": "NCSC CAF — Principle B4 System security"
      },
      {
        "href": "https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf#page=15",
        "label": "Cyber Essentials — Secure configuration (requirements PDF, p.15)"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/147/final",
        "label": "NIST SP 800-147 — BIOS Protection Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/155/ipd",
        "label": "NIST SP 800-155 (withdrawn draft) — BIOS Integrity Measurement Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/1800/34/final",
        "label": "NIST SP 1800-34 — Validating the Integrity of Computing Devices"
      }
    ]
  },
  "Hardware root of trust": {
    "stage": "plan",
    "stageLabel": "Plan & procure",
    "what": "A hardware root of trust is a small, hard-to-change starting point (TPM, HSM, or designs such as Caliptra) that later boot and keys are checked against.",
    "why": "If that foundation can be rewritten, every control above it — encryption, attestation, even a clean OS image — can be bypassed by early firmware.",
    "how": [
      "Require TPM 2.0 or an equivalent hardware root in procurement for devices that matter.",
      "Prefer platforms with an immutable or write-protected root of trust.",
      "Plan measured boot and attestation so the root is actually used, not just present.",
      "Document which device classes need a stronger root (servers, privileged workstations)."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices#section_8",
        "label": "NCSC — Choosing devices (Windows / TPM 2.0)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/maintain-device-integrity",
        "label": "NCSC — Maintain device integrity"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SI-7; SA-8 Security and Privacy Engineering Principles"
      },
      {
        "href": "https://caliptra.org/",
        "label": "Caliptra — open hardware root of trust"
      },
      {
        "href": "https://trustedcomputinggroup.org/resource/trusted-platform-module-tpm-summary/",
        "label": "TCG — TPM summary"
      }
    ]
  },
  "Signed firmware updates": {
    "stage": "operate",
    "stageLabel": "Operate & patch",
    "what": "Signed firmware updates are patches the device will only accept if they carry a trusted digital signature from the vendor.",
    "why": "Anyone who can reach an unsigned update channel could push a malicious firmware image and take lasting control of the device.",
    "how": [
      "Only accept firmware from official, signed channels (capsule, OEM, or LVFS).",
      "Apply updates promptly after a pilot, including UEFI, microcode, NIC, storage and BMC.",
      "Reject unsigned or unexpected images.",
      "Meet Cyber Essentials security-update expectations for devices in scope."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_3",
        "label": "NCSC — Managing device firmware (How to manage)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/provide-updates-securely",
        "label": "NCSC — Provide updates securely"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/keeping-devices-and-software-up-to-date",
        "label": "NCSC — Keeping devices and software up to date"
      },
      {
        "href": "https://www.ncsc.gov.uk/cyberessentials/overview",
        "label": "NCSC — Cyber Essentials overview (security updates)"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SI-2 Flaw Remediation; SI-7"
      }
    ]
  },
  "SBOM & supplier assurance": {
    "stage": "plan",
    "stageLabel": "Plan & procure",
    "what": "An SBOM lists the components inside a product. Supplier assurance means checking the vendor can keep that product secure over its life — support, updates, and honest disclosure.",
    "why": "A counterfeit or backdoored part can enter the estate at purchase time. Without assurance and a parts list, you may only learn after a public incident.",
    "how": [
      "Put support life, TPM, Secure Boot and a firmware update path into the tender (NCSC choosing-devices).",
      "Request an SBOM (SPDX or CycloneDX) or equivalent disclosure where the market can supply it.",
      "Write security obligations into the contract and map residual risk to CAF A4.",
      "Block enrolment of kit that fails provenance or assurance checks."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/supply-chain-security",
        "label": "NCSC — Supply chain security guidance"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain",
        "label": "NCSC CAF — Principle A4 Supply chain"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices",
        "label": "NCSC — Choosing devices"
      },
      {
        "href": "https://www.ncsc.gov.uk/cyberessentials/overview",
        "label": "NCSC — Cyber Essentials overview"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/161/r1/final",
        "label": "NIST SP 800-161 Rev. 1 — Cybersecurity Supply Chain Risk Management"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SR family (Supply Chain Risk Management)"
      }
    ]
  },
  "Device attestation": {
    "stage": "receive",
    "stageLabel": "Receive & verify",
    "what": "Device attestation is a remote health check: the device proves what booted (often via the TPM) so you can decide whether to trust it — at arrival and again during use.",
    "why": "A tampered device can look fine on the desk while firmware has already been changed. Without a health check, it gets enrolled and keeps access even after later drift.",
    "how": [
      "Run attestation or a compliance check before a new device gets data access.",
      "Repeat the check in operation and feed failures into access decisions (reduce trust).",
      "Quarantine devices that fail until they are investigated.",
      "Baseline measurements at enrolment so later monitoring has something to compare."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management",
        "label": "NCSC — Mobile Device Management"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/ensure-transparency-of-device-health",
        "label": "NCSC — Transparency of device health"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/logging-and-protective-monitoring",
        "label": "NCSC — Logging and protective monitoring (devices)"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/155/ipd",
        "label": "NIST SP 800-155 (withdrawn draft) — BIOS Integrity Measurement Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/1800/34/final",
        "label": "NIST SP 1800-34 — Validating the Integrity of Computing Devices"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
      },
      {
        "href": "https://trustedcomputinggroup.org/resource/tcg-pc-client-platform-firmware-integrity-measurement/",
        "label": "TCG — PC Client Platform Firmware Integrity Measurement"
      }
    ]
  },
  "IOMMU / DMA protection": {
    "stage": "build",
    "stageLabel": "Build & configure",
    "what": "An IOMMU, together with Kernel DMA Protection (or similar), stops plugged-in devices from reading or writing main memory freely.",
    "why": "A rogue Thunderbolt or similar device can scrape memory for passwords and keys while the laptop appears locked, bypassing the operating system's screen lock.",
    "how": [
      "Turn on Kernel DMA Protection, or set Thunderbolt security so new devices need approval.",
      "Block new DMA devices when the machine is locked.",
      "Disable unused high-speed ports if people do not need them.",
      "Include this in the gold build, not as an optional extra."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely#section_3",
        "label": "NCSC — Using peripherals securely (How to manage — DMA)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely#section_2",
        "label": "NCSC — Using peripherals securely (Preparation — DMA risks)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
        "label": "NCSC CAF — Principle B4 System security"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SC-7 Boundary Protection; SI-7 (related)"
      },
      {
        "href": "https://learn.microsoft.com/en-us/windows/security/hardware-security/kernel-dma-protection-for-thunderbolt",
        "label": "Microsoft — Kernel DMA Protection"
      }
    ]
  },
  "BMC isolation": {
    "stage": "deploy",
    "stageLabel": "Deploy & protect",
    "what": "BMC isolation means keeping management interfaces off normal user and workload networks so only trusted administrators can reach them.",
    "why": "Anyone who can reach the office LAN — or the internet — may otherwise reach the keys to the server itself, bypassing the guest operating system.",
    "how": [
      "Place BMC/IPMI on a dedicated management VLAN; block user VLANs and the internet.",
      "Administer high-value systems from privileged access workstations (CAF B4).",
      "Disable unused management services; no default passwords.",
      "Log and monitor access to the management plane."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
        "label": "NCSC CAF — Principle B4 System security"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces",
        "label": "NCSC — Constrain use of all device interfaces"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/allow-robust-device-management",
        "label": "NCSC — Allow robust device management"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SC-7 Boundary Protection; AC-17 Remote Access"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/147/b/final",
        "label": "NIST SP 800-147B — BIOS Protection Guidelines for Servers"
      }
    ]
  },
  "Firmware integrity monitoring": {
    "stage": "monitor",
    "stageLabel": "Monitor & detect",
    "what": "Firmware integrity monitoring watches for unexpected changes to firmware versions, settings or boot measurements across the estate.",
    "why": "A silent firmware change can persist across OS reinstalls and go unnoticed for months. Monitoring is how you notice before damage spreads.",
    "how": [
      "Baseline firmware versions at build or enrolment; alert on unexpected drift.",
      "Collect boot status and measurement changes where the platform allows.",
      "Feed failed attestation into SIEM or access control.",
      "Include BMC and device firmware, not only the host OS."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_2",
        "label": "NCSC — Managing device firmware (Preparation)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/logging-and-protective-monitoring",
        "label": "NCSC — Logging and protective monitoring (devices)"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/ensure-transparency-of-device-health",
        "label": "NCSC — Transparency of device health"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/maintain-device-integrity",
        "label": "NCSC — Maintain device integrity"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines (Detect)"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/155/ipd",
        "label": "NIST SP 800-155 (withdrawn draft) — BIOS Integrity Measurement Guidelines"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/1800/34/final",
        "label": "NIST SP 1800-34 — Validating the Integrity of Computing Devices"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — SI-7 Software, Firmware, and Information Integrity"
      }
    ]
  },
  "Golden image recovery": {
    "stage": "respond",
    "stageLabel": "Respond & recover",
    "what": "Golden image recovery means rebuilding a device from a known-good, protected image after compromise or failure — including firmware recovery where the platform supports it.",
    "why": "A casual OS reinstall can leave a firmware implant or leftover accounts behind. The next user then inherits the problem.",
    "how": [
      "Isolate the device first, then recover firmware to a known-good state if implant is suspected.",
      "Rebuild from a protected gold image; re-attest before restoring access.",
      "Keep gold builds and recovery media as protected, tested assets.",
      "Exercise rebuild drills, not only after incidents."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/enable-recovery-to-a-known-good-state",
        "label": "NCSC — Enable recovery to a known good state"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
        "label": "NCSC CAF — Principle B4 System security"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/erasing-devices",
        "label": "NCSC — Erasing devices"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management",
        "label": "NCSC — Mobile Device Management"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
        "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines (Recover)"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — CP-10 Information System Recovery; SI-7"
      }
    ]
  },
  "Secure sanitisation": {
    "stage": "dispose",
    "stageLabel": "Decommission & dispose",
    "what": "Secure sanitisation means erasing or destroying storage so the next owner cannot recover your data — using methods that match the media type and sensitivity.",
    "why": "Discarded disks, phones and printers routinely give up old files, passwords and personal data to whoever buys them next. A tick-box wipe without verification still leaks.",
    "how": [
      "Follow NCSC secure sanitisation guidance before re-use, sale, repair or disposal.",
      "Encrypted devices: use the vendor factory reset that deletes keys; unencrypted: overwrite and verify.",
      "Destroy media when data may remain or sensitivity is higher; keep certificates.",
      "Update the asset register once disposal is confirmed."
    ],
    "ncsc": [
      {
        "href": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media#section_2",
        "label": "NCSC — Secure sanitisation of storage media (What is sanitisation?)"
      },
      {
        "href": "https://www.ncsc.gov.uk/guidance/decommissioning-assets",
        "label": "NCSC — Decommissioning assets"
      },
      {
        "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/erasing-devices",
        "label": "NCSC — Erasing devices"
      }
    ],
    "nist": [
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/88/r2/final",
        "label": "NIST SP 800-88 Rev. 2 — Guidelines for Media Sanitization (Clear / Purge / Destroy)"
      },
      {
        "href": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "label": "NIST SP 800-53 Rev. 5 — MP-6 Media Sanitization"
      }
    ]
  }
};
  var THREATS = {
  "Firmware implants / bootkits": {
    "blurb": "Malware hidden in early start-up code can load before the operating system and survive a normal reinstall.",
    "control": "Secure & measured boot",
    "stage": "build",
    "stageLabel": "Build & configure"
  },
  "Counterfeit or tampered hardware": {
    "blurb": "A device can arrive already changed, or be swapped in transit, and still look genuine on the desk.",
    "control": "Device attestation",
    "stage": "receive",
    "stageLabel": "Receive & verify"
  },
  "DMA attacks": {
    "blurb": "A plugged-in high-speed device can read or write memory directly, including while the laptop appears locked.",
    "control": "IOMMU / DMA protection",
    "stage": "build",
    "stageLabel": "Build & configure"
  },
  "Compromised BMC": {
    "blurb": "If the server's out-of-band controller is exposed or weakly set up, an attacker can control the host below the OS.",
    "control": "BMC isolation",
    "stage": "deploy",
    "stageLabel": "Deploy & protect"
  },
  "Supply chain compromise": {
    "blurb": "A backdoored or counterfeit component can enter at purchase time if suppliers and parts are not checked.",
    "control": "SBOM & supplier assurance",
    "stage": "plan",
    "stageLabel": "Plan & procure"
  }
};

  var lastFocus = null;
  var openKind = null;
  var overlay, sheet, bodyEl, titleEl;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function isMobile() {
    return window.matchMedia && window.matchMedia("(max-width:960px)").matches;
  }
  function makeExt(href, label) {
    var a = document.createElement("a");
    a.className = "osi-ext-link";
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("data-ga-keep", "");
    a.setAttribute("aria-label", label + " (opens in a new tab)");
    var parts = String(label).trim().split(/\s+/);
    var last = parts.pop();
    var head = parts.length ? esc(parts.join(" ")) + " " : "";
    a.innerHTML = head + '<span class="osi-ext-link__tail">' + esc(last) + '<span class="osi-ext-link__icon" aria-hidden="true">↗</span></span>';
    return a;
  }
  function makeInternal(href, label) {
    var a = document.createElement("a");
    a.className = "osi-int-link";
    a.href = href;
    a.setAttribute("data-ga-keep", "");
    a.textContent = label;
    return a;
  }
  function section(title, node) {
    var s = document.createElement("section");
    var h = document.createElement("h4");
    h.textContent = title;
    s.appendChild(h);
    s.appendChild(node);
    return s;
  }
  function pText(t) {
    var p = document.createElement("p");
    p.textContent = t;
    return p;
  }
  function list(items, renderer) {
    var ul = document.createElement("ul");
    ul.className = "osi-card__list";
    (items || []).forEach(function (it) {
      var li = document.createElement("li");
      if (typeof renderer === "function") renderer(li, it);
      else li.textContent = it;
      ul.appendChild(li);
    });
    return ul;
  }

  function ensure() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "hwCardOverlay";
    overlay.hidden = true;
    overlay.innerHTML = '<div class="osi-card-backdrop" data-hw-close="1"></div>' +
      '<div class="osi-card-sheet" role="dialog" aria-modal="true" aria-labelledby="hwCardTitle" tabindex="-1">' +
      '<button type="button" class="osi-card-x" aria-label="Close explainer" data-hw-close="1">×</button>' +
      '<div class="osi-card" id="hwCardBody"></div></div>';
    document.body.appendChild(overlay);
    sheet = overlay.querySelector(".osi-card-sheet");
    bodyEl = overlay.querySelector("#hwCardBody");
    overlay.addEventListener("click", function (e) {
      if (e.target && e.target.getAttribute("data-hw-close")) close();
    });
    overlay.addEventListener("keydown", onKey);
    return overlay;
  }

  function focusables() {
    return sheet ? [...sheet.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(function (el) {
      return !el.hidden && el.getClientRects().length;
    }) : [];
  }
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    var list = focusables();
    if (!list.length) { e.preventDefault(); sheet.focus(); return; }
    var first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }


  var EXAMPLES = {
    "UEFI": [
      {"href":"https://www.ami.com/products/aptio-v/","label":"AMI — Aptio V (UEFI/BIOS firmware)"},
      {"href":"https://www.insyde.com/products/insydeh2o/","label":"Insyde — InsydeH2O UEFI BIOS"},
      {"href":"https://phoenixtech.com/phoenix-securecore/","label":"Phoenix — SecureCore (UEFI platform firmware)"}
    ],
    "TPM 2.0": [
      {"href":"https://www.infineon.com/products/security-smart-card-solutions/optiga-embedded-security-solutions/optiga-tpm","label":"Infineon — OPTIGA TPM"},
      {"href":"https://www.st.com/en/applications/embedded-security/trusted-platform-module.html","label":"STMicroelectronics — STSAFE-TPM (ST33 family)"},
      {"href":"https://www.nuvoton.com/products/cloud-computing/security/trusted-platform-module-tpm/npct7xx/","label":"Nuvoton — NPCT7xx TPM 2.0"},
      {"href":"https://www.intel.com/content/www/us/en/support/articles/000094205/processors/intel-core-processors.html","label":"Intel — Platform Trust Technology (PTT, firmware TPM)"},
      {"href":"https://www.amd.com/en/resources/support-articles/faqs/PA-200.html","label":"AMD — Firmware TPM (fTPM) updates"}
    ],
    "BMC/Redfish": [
      {"href":"https://www.dell.com/en-us/learn/it-infrastructure/lp/open-manage/open-manage-idrac","label":"Dell — iDRAC (Integrated Dell Remote Access Controller)"},
      {"href":"https://www.hpe.com/us/en/products/compute/integrated-lights-out-ilo.html","label":"HPE — Integrated Lights-Out (iLO)"},
      {"href":"https://pubs.lenovo.com/lxcc-overview/","label":"Lenovo — XClarity Controller"},
      {"href":"https://www.openbmc.org/","label":"OpenBMC — open-source BMC firmware"}
    ],
    "IPMI": [
      {"href":"https://www.supermicro.com/en/solutions/management-software/bmc-resources","label":"Supermicro — BMC / IPMI intelligent management"}
    ],
    "CPU microcode": [
      {"href":"https://www.intel.com/content/www/us/en/developer/articles/technical/software-security-guidance/secure-coding/loading-microcode-os.html","label":"Intel — Loading microcode from the OS (security guidance)"},
      {"href":"https://github.com/intel/Intel-Linux-Processor-Microcode-Data-Files","label":"Intel — Official Linux processor microcode data files"},
      {"href":"https://www.amd.com/en/resources/product-security.html","label":"AMD — Product Security (microcode and firmware updates)"}
    ],
    "NIC firmware": [
      {"href":"https://www.intel.com/content/www/us/en/products/details/ethernet.html","label":"Intel — Ethernet products (controllers and adapters)"},
      {"href":"https://www.broadcom.com/support/knowledgebase/3211238682022/updating-firmware-on-broadcom-ethernet-nic","label":"Broadcom — Updating firmware on Ethernet NICs"},
      {"href":"https://networking-docs.nvidia.com/software/adapter-firmware","label":"NVIDIA — ConnectX adapter firmware"}
    ],
    "PCIe/DMA": [
      {"href":"https://www.intel.com/content/www/us/en/content-details/753497/security-brief-thunderbolt-4.html","label":"Intel — Thunderbolt 4 security brief (DMA protection)"},
      {"href":"https://learn.microsoft.com/en-us/windows/security/hardware-security/kernel-dma-protection-for-thunderbolt","label":"Microsoft — Kernel DMA Protection"},
      {"href":"https://cdrdv2-public.intel.com/831418/vt-directed-io-spec.pdf","label":"Intel — VT-d (Virtualization Technology for Directed I/O) specification (PDF)"}
    ],
    "JTAG/UART": [
      {"href":"https://www.segger.com/products/debug-probes/j-link/","label":"SEGGER — J-Link debug probes"},
      {"href":"https://www.arm.com/products/silicon-ip-system/coresight-debug-trace/soc-600","label":"Arm — CoreSight SoC-600 debug and trace"}
    ],
    "SPDX/CycloneDX": [
      {"href":"https://github.com/anchore/syft","label":"Syft (Anchore) — SBOM generation tool"},
      {"href":"https://cyclonedx.org/tool-center/","label":"CycloneDX — Tool Center"},
      {"href":"https://github.com/microsoft/sbom-tool","label":"Microsoft — SBOM tool"}
    ],
    "Secure & measured boot": [
      {"href":"https://learn.microsoft.com/en-us/windows/security/operating-system-security/system-security/trusted-boot","label":"Microsoft — Windows Secure Boot and Trusted Boot"},
      {"href":"https://support.apple.com/guide/security/boot-process-secac71d5623/web","label":"Apple — Secure boot process (Platform Security Guide)"}
    ],
    "Hardware root of trust": [
      {"href":"https://docs.cloud.google.com/docs/security/titan-hardware-chip","label":"Google — Titan hardware security chip"},
      {"href":"https://learn.microsoft.com/en-us/windows/security/hardware-security/pluton/microsoft-pluton-security-processor","label":"Microsoft — Pluton security processor"},
      {"href":"https://support.apple.com/guide/security/the-secure-enclave-sec59b0b31ff/web","label":"Apple — Secure Enclave"},
      {"href":"https://caliptra.org/","label":"Caliptra — open hardware root of trust (CHIPS Alliance)"}
    ],
    "Signed firmware updates": [
      {"href":"https://www.dell.com/support/kbdoc/en-us/000177325/dell-command-update","label":"Dell Command | Update"},
      {"href":"https://ftp.ext.hp.com/pub/caps-softpaq/cmit/HPIA.html","label":"HP Image Assistant (BIOS and firmware updates)"},
      {"href":"https://www.lenovo.com/us/en/software/lenovo-system-update/","label":"Lenovo System Update"},
      {"href":"https://fwupd.org/","label":"LVFS / fwupd — Linux Vendor Firmware Service"}
    ],
    "SBOM & supplier assurance": [
      {"href":"https://iasme.co.uk/cyber-essentials/ncsc-certificate-search/","label":"Cyber Essentials — find a certified supplier (NCSC certificate search)"},
      {"href":"https://github.com/anchore/syft","label":"Syft (Anchore) — SBOM generation tool"},
      {"href":"https://cyclonedx.org/tool-center/","label":"CycloneDX — Tool Center"},
      {"href":"https://github.com/microsoft/sbom-tool","label":"Microsoft — SBOM tool"}
    ],
    "Device attestation": [
      {"href":"https://learn.microsoft.com/en-us/intune/device-security/compliance/ref-windows-settings","label":"Microsoft Intune — Windows compliance and device health settings"},
      {"href":"https://learn.microsoft.com/en-us/windows-server/security/device-health-attestation","label":"Microsoft — Device Health Attestation"},
      {"href":"https://cloud.google.com/beyondcorp","label":"Google — BeyondCorp (device and user context access)"}
    ],
    "IOMMU / DMA protection": [
      {"href":"https://learn.microsoft.com/en-us/windows/security/hardware-security/kernel-dma-protection-for-thunderbolt","label":"Microsoft — Windows Kernel DMA Protection"},
      {"href":"https://cdrdv2-public.intel.com/831418/vt-directed-io-spec.pdf","label":"Intel — VT-d (Virtualization Technology for Directed I/O) specification (PDF)"},
      {"href":"https://www.intel.com/content/www/us/en/content-details/753497/security-brief-thunderbolt-4.html","label":"Intel — Thunderbolt 4 security brief (DMA protection)"}
    ],
    "BMC isolation": [
      {"href":"https://www.dell.com/support/manuals/en-us/poweredge-r670/idrac10_1.xx_scg/dedicated-nic-and-shared-lom?guid=guid-ef6c9481-caf0-4f37-ba43-fa9431fe9ab8&lang=en-us","label":"Dell — iDRAC dedicated NIC and Shared LOM (Security Configuration Guide)"},
      {"href":"https://support.hpe.com/hpesc/public/docDisplay?docId=sd00005342en_us&docLocale=en_US&page=GUID-062F8342-BB4B-42D9-AB93-48FE1FFC04F2.html","label":"HPE — Enabling the iLO Dedicated Network Port"}
    ],
    "Firmware integrity monitoring": [
      {"href":"https://eclypsium.com/solutions/firmware-security-for-enterprises/","label":"Eclypsium — firmware security for enterprises"},
      {"href":"https://learn.microsoft.com/en-us/defender-endpoint/uefi-scanning-in-defender-for-endpoint","label":"Microsoft Defender for Endpoint — UEFI/firmware scanning"}
    ],
    "Golden image recovery": [
      {"href":"https://www.dell.com/support/kbdoc/en-us/000132453/how-to-recover-the-bios-on-a-dell-computer-or-tablet","label":"Dell — BIOS recovery after boot or POST failure"},
      {"href":"https://www8.hp.com/h20195/v2/GetDocument.aspx?docname=4AA7-2562ENW","label":"HP Sure Start (official datasheet, self-healing BIOS)"},
      {"href":"https://download.lenovo.com/manual/thinkpad_t14g5_t16g3_p14sg5/ug/html_en/en/Recover_the_UEFI_BIOS.html","label":"Lenovo — Recover the UEFI BIOS (ThinkPad documentation)"}
    ],
    "Secure sanitisation": [
      {"href":"https://www.blancco.com/products/drive-eraser/","label":"Blancco — Drive Eraser"},
      {"href":"https://semiconductor.samsung.com/consumer-storage/magician/","label":"Samsung Magician (includes Secure Erase)"},
      {"href":"https://www.crucial.com/support/storage-executive","label":"Crucial Storage Executive (includes Sanitize / secure erase)"}
    ]
  };
  var EXAMPLE_NOTES = {
    "IPMI": "On newer platforms, vendors increasingly replace standalone IPMI with Redfish (see the BMC/Redfish examples).",
    "JTAG/UART": "These are legitimate engineering tools. Attackers can use the same debug ports if they are left open on production devices.",
    "BMC isolation": "Treat this as a design pattern: put BMC/iLO/iDRAC traffic on a dedicated management port or VLAN, off the user and workload network.",
    "PCIe/DMA": "AMD-Vi (AMD’s IOMMU) is the equivalent protection on AMD platforms; a stable official AMD document URL could not be verified at publish time, so it is not linked here.",
    "IOMMU / DMA protection": "AMD-Vi (AMD’s IOMMU) is the equivalent protection on AMD platforms; a stable official AMD document URL could not be verified at publish time, so it is not linked here."
  };

  function fillCard(name, card) {
    bodyEl.textContent = "";
    var h = document.createElement("h3");
    h.id = "hwCardTitle";
    h.textContent = name;
    bodyEl.appendChild(h);

    bodyEl.appendChild(section("What it is", pText(card.what)));
    bodyEl.appendChild(section("Why it needs to be secured", pText(card.why)));

    var howWrap = document.createElement("div");
    howWrap.appendChild(list(card.how));
    bodyEl.appendChild(section("How to secure it", howWrap));

    var nc = document.createElement("div");
    nc.appendChild(list(card.ncsc, function (li, it) { li.appendChild(makeExt(it.href, it.label)); }));
    bodyEl.appendChild(section("NCSC relationship", nc));

    var ni = document.createElement("div");
    ni.appendChild(list(card.nist, function (li, it) { li.appendChild(makeExt(it.href, it.label)); }));
    bodyEl.appendChild(section("NIST relationship", ni));

    var st = document.createElement("p");
    st.className = "osi-card__tutorial";
    st.appendChild(makeInternal("/tutorial?stage=" + encodeURIComponent(card.stage),
      "Open in the hardware lifecycle tutorial — " + card.stageLabel));
    bodyEl.appendChild(section("In the tutorial", st));

    var exList = EXAMPLES[name] || [];
    if (exList.length) {
      var ex = document.createElement("div");
      ex.appendChild(list(exList, function (li, it) { li.appendChild(makeExt(it.href, it.label)); }));
      if (EXAMPLE_NOTES[name]) {
        var extra = document.createElement("p");
        extra.className = "osi-card__examples-extra";
        extra.textContent = EXAMPLE_NOTES[name];
        ex.appendChild(extra);
      }
      var exNote = document.createElement("p");
      exNote.className = "osi-card__examples-note";
      exNote.textContent = "Examples only — not recommendations or endorsements.";
      ex.appendChild(exNote);
      bodyEl.appendChild(section("Examples in the real world", ex));
    }

    var note = document.createElement("p");
    note.className = "osi-card__note";
    note.textContent = "Not official NCSC guidance · community learning aid. Not affiliated with or endorsed by NCSC.";
    bodyEl.appendChild(note);
  }

  function fillThreat(name, t) {
    bodyEl.textContent = "";
    var h = document.createElement("h3");
    h.id = "hwCardTitle";
    h.textContent = name;
    bodyEl.appendChild(h);

    bodyEl.appendChild(section("What it is", pText(t.blurb)));

    var p = document.createElement("p");
    p.appendChild(document.createTextNode("A relevant control on this layer is "));
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "osi-card-jump";
    btn.textContent = t.control;
    btn.addEventListener("click", function () { openCard(t.control); });
    p.appendChild(btn);
    p.appendChild(document.createTextNode("."));
    bodyEl.appendChild(section("Related control", p));

    var st = document.createElement("p");
    st.className = "osi-card__tutorial";
    st.appendChild(makeInternal("/tutorial?stage=" + encodeURIComponent(t.stage),
      "Open in the hardware lifecycle tutorial — " + t.stageLabel));
    bodyEl.appendChild(section("In the tutorial", st));

    var note = document.createElement("p");
    note.className = "osi-card__note";
    note.textContent = "Not official NCSC guidance · community learning aid. Not affiliated with or endorsed by NCSC.";
    bodyEl.appendChild(note);
  }

  function show() {
    ensure();
    overlay.hidden = false;
    overlay.classList.toggle("is-sheet", isMobile());
    document.body.classList.add("hw-card-open");
    sheet.focus();
  }

  function openCard(name) {
    var card = CARDS[name];
    if (!card) return false;
    ensure();
    if (!lastFocus) lastFocus = document.activeElement;
    openKind = "card";
    fillCard(name, card);
    show();
    return true;
  }
  function openThreat(name, fromEl) {
    var t = THREATS[name];
    if (!t) return false;
    ensure();
    lastFocus = fromEl || document.activeElement;
    openKind = "threat";
    fillThreat(name, t);
    show();
    return true;
  }
  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("hw-card-open");
    openKind = null;
    var back = lastFocus;
    lastFocus = null;
    if (back && back.focus) try { back.focus(); } catch (e) {}
  }
  function isOpen() { return !!(overlay && !overlay.hidden); }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      close();
    }
  }, true);

  window.HWCards = {
    has: function (name) { return !!CARDS[name]; },
    threat: function (name) { return !!THREATS[name]; },
    openCard: openCard,
    openThreat: openThreat,
    close: close,
    isOpen: isOpen,
    names: function () { return Object.keys(CARDS); },
    threatNames: function () { return Object.keys(THREATS); }
  };
})();
