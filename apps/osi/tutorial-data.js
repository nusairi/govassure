/* Hardware security lifecycle — data v5 (all-stage learning). Not official NCSC guidance. */
window.HW_TUTORIAL = {
  "stages": [
    {
      "id": "plan",
      "num": 1,
      "short": "Plan & procure",
      "title": "Plan & procure",
      "what": "Decide what devices you need and who you will buy them from. Pick kit that will still get security updates for the years you plan to keep it, with a TPM (a built-in security chip), Secure Boot, and a clear firmware update path — and buy only from suppliers you can trust.",
      "why": "Buying unsupported or hard-to-manage devices locks in risk for years. Weak supply chains can deliver counterfeit kit, pre-installed malware, or devices that cannot enforce encryption or MDM (mobile device management).",
      "do": [
        "Shortlist devices that meet user needs, then check NCSC choosing-devices criteria (support life, TPM 2.0, Secure Boot, update path).",
        "Prefer platforms that are Secure by Default and match the NCSC device security principles for manufacturers.",
        "Write security requirements into procurement (updates, integrity, management, logging, recovery to a known-good state).",
        "Ask suppliers about Cyber Essentials or equivalent baseline controls; map risks to CAF A4 (supply chain).",
        "Pilot before a wide roll-out and keep an approved-device list with support end dates."
      ],
      "links": [
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices",
          "label": "NCSC — Choosing devices"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/supply-chain-security",
          "label": "NCSC — Supply chain security guidance"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain",
          "label": "NCSC CAF — Principle A4 Supply chain"
        },
        {
          "href": "https://www.ncsc.gov.uk/information/secure-default",
          "label": "NCSC — Secure by Default"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers",
          "label": "NCSC — Device security principles for manufacturers"
        },
        {
          "href": "https://www.ncsc.gov.uk/cyberessentials/overview",
          "label": "NCSC — Cyber Essentials overview"
        },
        {
          "href": "https://csrc.nist.gov/pubs/sp/800/161/r1/final",
          "label": "NIST SP 800-161 Rev. 1 — C-SCRM"
        }
      ],
      "checklist": [
        "Approved-device list names support end dates",
        "Procurement asks for TPM 2.0, Secure Boot and automated firmware updates",
        "Supplier security obligations are in the contract (CAF A4)",
        "A short pilot is planned before wide deployment"
      ]
    },
    {
      "id": "receive",
      "num": 2,
      "short": "Receive & verify",
      "title": "Receive & verify",
      "what": "When boxes arrive, check they are the devices you ordered and that nobody has interfered with them — seals intact, serials matching the purchase order — then write each device into the asset register before first use.",
      "why": "Tampering or substitution in transit can implant malicious hardware or firmware. Counterfeit or grey-market devices, and kit that never hits the asset register, become shadow IT you cannot protect or wipe later.",
      "do": [
        "Inspect packaging and seals; investigate breaks before first power-on.",
        "Verify serial numbers and model against the order; reject mismatches.",
        "Enrol every device on the asset register before issue (NCSC asset management).",
        "Only accept deliveries through agreed supply channels (CAF A4 / supply chain guidance).",
        "Hold unexpected, damaged or second-hand stock in quarantine until cleared."
      ],
      "links": [
        {
          "href": "https://www.ncsc.gov.uk/guidance/asset-management",
          "label": "NCSC — Asset management"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/supply-chain-security",
          "label": "NCSC — Supply chain security guidance"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain",
          "label": "NCSC CAF — Principle A4 Supply chain"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/purchasing-devices",
          "label": "NCSC — Purchasing devices"
        }
      ],
      "checklist": [
        "Delivery seals checked and results recorded",
        "Serial numbers matched to the purchase order",
        "Device written to the asset register before first use",
        "Unexpected or damaged stock held in quarantine"
      ]
    },
    {
      "id": "build",
      "num": 3,
      "short": "Build & configure",
      "title": "Build & configure",
      "what": "Before anyone uses the device, put it into a known-good state: Secure Boot on, disk encrypted with the TPM (built-in security chip), unused ports closed, and a gold build (standard secure image) applied — like setting the locks before staff move in.",
      "why": "Malicious or outdated firmware, bootkits, lost unencrypted devices, rogue USB/DMA (direct memory access) sticks, and leftover default accounts are classic ways attackers get lasting control or steal data.",
      "do": [
        "Enable Secure Boot, restrict boot paths and authenticated firmware updates (NCSC managing device firmware).",
        "Apply a documented gold build; remove unused accounts and software (Cyber Essentials secure configuration; CAF B4.b).",
        "Turn on full-disk encryption backed by the TPM; consider a BitLocker PIN for higher assurance.",
        "Disable or tightly control removable media and DMA-capable ports (NCSC using peripherals securely).",
        "Prefer devices with firmware resilience — integrity, detection and recovery (NIST SP 800-193 / 800-147 as secondary reading)."
      ],
      "links": [
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware",
          "label": "NCSC — Managing device firmware"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely",
          "label": "NCSC — Using peripherals securely"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
          "label": "NCSC CAF — Principle B4 System security"
        },
        {
          "href": "https://www.ncsc.gov.uk/cyberessentials/overview",
          "label": "NCSC — Cyber Essentials overview"
        },
        {
          "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
          "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
        },
        {
          "href": "https://csrc.nist.gov/pubs/sp/800/147/final",
          "label": "NIST SP 800-147 — BIOS Protection Guidelines"
        },
        {
          "href": "https://trustedcomputinggroup.org/resource/trusted-platform-module-tpm-summary/",
          "label": "TCG — TPM summary (secondary)"
        }
      ],
      "checklist": [
        "Secure Boot enabled and boot path restricted",
        "Full-disk encryption on, with TPM (and PIN if required)",
        "Gold build applied; unused accounts and auto-run disabled",
        "Unused USB / DMA interfaces disabled or controlled by policy"
      ]
    },
    {
      "id": "deploy",
      "num": 4,
      "short": "Deploy & protect",
      "title": "Deploy & protect",
      "what": "Put the device into service under your management: enrol it in MDM (mobile device management), enforce policies, and protect it physically at desks, racks and stores — with a named custodian and asset tag.",
      "why": "Lost or stolen unmanaged devices can still hold data. Weak enrolment lets rogue kit join the estate. Poor physical control opens the door to theft, tampering or hardware implants.",
      "do": [
        "Use MDM that supports your platforms, strong enrolment authentication and remote wipe (NCSC MDM guidance).",
        "Enforce NCSC platform configuration packs where they fit your estate.",
        "Administer high-value systems from trusted / privileged access workstations (CAF B4.c).",
        "Control physical access to server rooms and device stores; check tamper seals regularly.",
        "Only issue devices that are enrolled and compliant before they touch organisational data."
      ],
      "links": [
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management",
          "label": "NCSC — Mobile Device Management"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance",
          "label": "NCSC — Device security guidance (collection)"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
          "label": "NCSC CAF — Principle B4 System security"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers",
          "label": "NCSC — Device security principles for manufacturers"
        }
      ],
      "checklist": [
        "Device enrolled in MDM before issue to the user",
        "Remote wipe and compliance policies enabled",
        "Physical storage / desk / rack controls documented",
        "Asset tag and named custodian recorded"
      ]
    },
    {
      "id": "operate",
      "num": 5,
      "short": "Operate & patch",
      "title": "Operate & patch",
      "what": "Keep the operating system, apps, drivers and firmware up to date on a schedule so known holes get closed — including the low-level firmware that starts the machine before Windows or macOS loads.",
      "why": "Unpatched firmware or OS flaws are routinely exploited. Devices left on unsupported platforms stop getting fixes. Failed or unsigned updates, and drift from the gold build, quietly reopen doors you thought you closed.",
      "do": [
        "Automate firmware updates where the platform allows; otherwise use OEM / enterprise tools (NCSC managing device firmware).",
        "Follow NCSC keeping-devices-and-software-up-to-date guidance for the estate.",
        "Track announced vulnerabilities and mitigate promptly (CAF B4.d); prefer supported kit.",
        "Meet Cyber Essentials security-update expectations for devices in scope.",
        "Re-verify critical firmware settings after updates."
      ],
      "links": [
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware",
          "label": "NCSC — Managing device firmware"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/keeping-devices-and-software-up-to-date",
          "label": "NCSC — Keeping devices and software up to date"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
          "label": "NCSC CAF — Principle B4 System security"
        },
        {
          "href": "https://www.ncsc.gov.uk/cyberessentials/overview",
          "label": "NCSC — Cyber Essentials overview"
        }
      ],
      "checklist": [
        "Firmware update path defined (OS, OEM or enterprise tool)",
        "Critical / high patches applied within agreed timescales",
        "Unsupported devices identified with a retirement plan",
        "Gold-build drift checked on a schedule"
      ]
    },
    {
      "id": "monitor",
      "num": 6,
      "short": "Monitor & detect",
      "title": "Monitor & detect",
      "what": "Watch for signs a device has been changed or tampered with: firmware version drift, failed attestation (a health check of the device), odd USB events, or unexpected firmware warning screens.",
      "why": "Silent firmware or configuration tampering can leave a device looking normal while it is compromised. Missing logs mean you cannot investigate. Jailbroken or developer-mode devices bypass the protections you think are on.",
      "do": [
        "Collect firmware version, setting changes, update events and boot status where the platform allows (NCSC firmware monitoring).",
        "Prefer Device Health Attestation and feed results into access decisions (NCSC MDM / logging guidance).",
        "Alert on unexpected peripheral use and policy violations.",
        "Teach users what firmware tamper warnings look like and how to report them.",
        "Keep device health visible (NCSC device security principles: transparency of device health)."
      ],
      "links": [
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware",
          "label": "NCSC — Managing device firmware"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/logging-and-protective-monitoring",
          "label": "NCSC — Logging and protective monitoring (devices)"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management",
          "label": "NCSC — Mobile Device Management"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers",
          "label": "NCSC — Device security principles for manufacturers"
        }
      ],
      "checklist": [
        "Firmware version reported into central inventory / MDM",
        "Attestation or compliance checks used where supported",
        "Alerts defined for unexpected USB / policy breaks",
        "Users know how to report firmware warning screens"
      ]
    },
    {
      "id": "respond",
      "num": 7,
      "short": "Respond & recover",
      "title": "Respond & recover",
      "what": "When a device is lost, stolen or suspected compromised, cut access, wipe or rebuild it from a known-good gold image — and revoke the credentials tied to that device.",
      "why": "A lost device you cannot wipe quickly exposes data. Firmware malware can survive an ordinary OS reinstall. Reissuing a half-cleaned device, or a slow response because nobody owns the playbook, turns a bad day into a breach.",
      "do": [
        "Ensure MDM remote wipe is tested and responsive (NCSC MDM).",
        "Recover to a known-good state; prefer hardware with firmware recovery features (device principles; NIST SP 800-193 Recover).",
        "For reissue, follow NCSC erasing-devices and, where needed, secure sanitisation guidance.",
        "Keep gold builds and recovery media protected and available (CAF B4.b).",
        "Practise the lost-device playbook so wipe and revoke steps are fast."
      ],
      "links": [
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management",
          "label": "NCSC — Mobile Device Management"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/erasing-devices",
          "label": "NCSC — Erasing devices"
        },
        {
          "href": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media",
          "label": "NCSC — Secure sanitisation of storage media"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers",
          "label": "NCSC — Device security principles for manufacturers"
        },
        {
          "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
          "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
        }
      ],
      "checklist": [
        "Lost-device playbook names who triggers remote wipe",
        "Remote wipe tested in the last 12 months",
        "Rebuild uses a protected gold image",
        "Credentials revoked as part of the response"
      ]
    },
    {
      "id": "dispose",
      "num": 8,
      "short": "Decommission & dispose",
      "title": "Decommission & dispose",
      "what": "At end of life, remove data so it cannot be read by the next owner, then recycle or destroy the hardware — with certificates and an updated asset register.",
      "why": "Sensitive data is routinely recovered from discarded disks, phones and even printers. Devices that leave without sanitisation (sale, repair, scrap) or through unverified disposal create avoidable breaches.",
      "do": [
        "Follow NCSC secure sanitisation of storage media before re-use, sale, repair or disposal.",
        "Encrypted devices: use the vendor factory reset that deletes keys; unencrypted: overwrite, check remapped/bad sectors, power off ≥15 minutes, read back to verify.",
        "Where data may remain or sensitivity is higher, destroy media to particles of 6 mm or less and verify particle size; consider CAS-S providers for HMG work.",
        "Plan sanitisation at procurement time; keep chain of custody and certificates (NCSC decommissioning assets).",
        "Update the asset register once disposal is confirmed. NIST SP 800-88 r2 is useful secondary reading (Clear / Purge / Destroy)."
      ],
      "links": [
        {
          "href": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media",
          "label": "NCSC — Secure sanitisation of storage media"
        },
        {
          "href": "https://www.ncsc.gov.uk/guidance/decommissioning-assets",
          "label": "NCSC — Decommissioning assets"
        },
        {
          "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/erasing-devices",
          "label": "NCSC — Erasing devices"
        },
        {
          "href": "https://csrc.nist.gov/pubs/sp/800/88/r2/final",
          "label": "NIST SP 800-88 Rev. 2 — Guidelines for Media Sanitization"
        }
      ],
      "checklist": [
        "Re-use / dispose decision recorded against the asset",
        "Sanitisation method matches NCSC guidance for the media type",
        "Destruction certificate filed when media is destroyed",
        "Asset register updated to retired / disposed"
      ]
    }
  ],
  "glossary": [
    {
      "id": "uefi",
      "term": "UEFI",
      "def": "Modern firmware that starts the device before the operating system.",
      "stage": "build",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_2"
    },
    {
      "id": "tpm",
      "term": "TPM 2.0",
      "def": "Built-in security chip for keys and boot measurements.",
      "stage": "build",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices#section_8"
    },
    {
      "id": "bmc",
      "term": "BMC / Redfish",
      "def": "Out-of-band server management controller and its modern API.",
      "stage": "deploy",
      "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/allow-robust-device-management"
    },
    {
      "id": "ipmi",
      "term": "IPMI",
      "def": "Older out-of-band management protocol for servers — keep isolated.",
      "stage": "deploy",
      "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces"
    },
    {
      "id": "microcode",
      "term": "CPU microcode",
      "def": "Low-level CPU fixes delivered as firmware updates.",
      "stage": "operate",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/keeping-devices-and-software-up-to-date"
    },
    {
      "id": "nic-fw",
      "term": "NIC firmware",
      "def": "Firmware on the network interface card — patch it like any other firmware.",
      "stage": "operate",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
    },
    {
      "id": "pcie-dma",
      "term": "PCIe / DMA",
      "def": "Fast bus and direct memory access path devices can abuse if unprotected.",
      "stage": "build",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely#section_2"
    },
    {
      "id": "jtag",
      "term": "JTAG / UART",
      "def": "Hardware debug ports that can expose internals if left open.",
      "stage": "receive",
      "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces"
    },
    {
      "id": "sbom",
      "term": "SPDX / CycloneDX",
      "def": "Standard formats for a software bill of materials (SBOM).",
      "stage": "plan",
      "href": "https://spdx.dev/"
    },
    {
      "id": "secure-measured",
      "term": "Secure & measured boot",
      "def": "Only signed code starts; what ran is recorded for later checks.",
      "stage": "build",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_3"
    },
    {
      "id": "hrt",
      "term": "Hardware root of trust",
      "def": "Immutable starting point (TPM, HSM, Caliptra-class) that everything else is verified against.",
      "stage": "plan",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices#section_8"
    },
    {
      "id": "signed-fw",
      "term": "Signed firmware updates",
      "def": "Updates accepted only if they carry a trusted signature.",
      "stage": "operate",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_3"
    },
    {
      "id": "sbom-assure",
      "term": "SBOM & supplier assurance",
      "def": "Know what you bought and that the supplier meets your security bar.",
      "stage": "plan",
      "href": "https://www.ncsc.gov.uk/collection/supply-chain-security"
    },
    {
      "id": "attest",
      "term": "Device attestation",
      "def": "A remote check that the device booted into an expected healthy state.",
      "stage": "receive",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management"
    },
    {
      "id": "iommu",
      "term": "IOMMU / DMA protection",
      "def": "Stops peripherals reading memory freely via DMA.",
      "stage": "build",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely#section_3"
    },
    {
      "id": "bmc-iso",
      "term": "BMC isolation",
      "def": "Keep management interfaces off the normal user and workload networks.",
      "stage": "deploy",
      "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security"
    },
    {
      "id": "fw-mon",
      "term": "Firmware integrity monitoring",
      "def": "Watch for unexpected firmware or boot-measurement changes.",
      "stage": "monitor",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_2"
    },
    {
      "id": "golden",
      "term": "Golden image recovery",
      "def": "Rebuild from a known-good image after compromise or failure.",
      "stage": "respond",
      "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/enable-recovery-to-a-known-good-state"
    },
    {
      "id": "sanitise",
      "term": "Secure sanitisation",
      "def": "Erase or destroy storage so data cannot be recovered when kit leaves.",
      "stage": "dispose",
      "href": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media"
    },
    {
      "id": "attest-mon",
      "term": "Device attestation (repeat)",
      "def": "Re-checking device health in operation, not only at enrolment.",
      "stage": "monitor",
      "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management"
    }
  ],
  "learn": {
    "plan": {
      "chips": [
        {
          "id": "sbom-assure",
          "label": "SBOM & supplier assurance",
          "what": "An SBOM (software bill of materials) lists what components sit in a product. Supplier assurance means checking the vendor can keep that product secure over its life.",
          "analogy": "Like a full ingredients list on food — plus checking the kitchen passed a hygiene rating before you buy.",
          "without": "You may buy kit with unknown or backdoored parts, and find out only after a public breach.",
          "good": "Procurement asks for an SBOM or equivalent parts list, support life, and evidence the supplier meets your security bar (CAF A4 / supply chain guidance).",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/supply-chain-security",
            "label": "NCSC — Supply chain security guidance"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain",
            "label": "NCSC CAF — Principle A4 Supply chain"
          }
        },
        {
          "id": "sbom",
          "label": "SPDX / CycloneDX",
          "what": "SPDX and CycloneDX are common standard formats for publishing an SBOM so tools can read the same parts list.",
          "analogy": "Two agreed spreadsheet layouts so every supermarket can share shelf stock the same way.",
          "without": "Each vendor invents their own list format; comparing or scanning products for known-bad parts becomes slow and error-prone.",
          "good": "Ask suppliers to provide SBOMs in SPDX or CycloneDX where they can, and keep them with the asset record.",
          "link": {
            "href": "https://spdx.dev/",
            "label": "SPDX — Software Package Data Exchange"
          },
          "link2": {
            "href": "https://cyclonedx.org/",
            "label": "CycloneDX — SBOM standard"
          }
        },
        {
          "id": "hrt",
          "label": "Hardware root of trust",
          "what": "A hardware root of trust is a small, hard-to-change starting point (TPM, HSM, or designs such as Caliptra) that later boot and keys are checked against.",
          "analogy": "The foundation stone of a building — if that moves, every floor above is suspect.",
          "without": "Firmware and keys sit only in ordinary chips that malware or a supply-chain implant can rewrite.",
          "good": "Procurement requires TPM 2.0 (or equivalent), Secure Boot, and a clear hardware root of trust on devices that matter.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices#section_8",
            "label": "NCSC — Choosing devices (Windows / TPM 2.0)"
          },
          "link2": {
            "href": "https://caliptra.org/",
            "label": "Caliptra — open hardware root of trust"
          },
          "link3": {
            "href": "https://trustedcomputinggroup.org/resource/trusted-platform-module-tpm-summary/",
            "label": "TCG — TPM summary"
          }
        }
      ],
      "attack": {
        "title": "Attack stopped",
        "story": "A counterfeit or backdoored component tries to enter the estate. Supplier assurance and an SBOM check expose the unexpected part before the device is bought or enrolled.",
        "steps": [
          {
            "kind": "bad",
            "label": "Counterfeit / backdoored part offered"
          },
          {
            "kind": "ok",
            "label": "Supplier assurance flags the risk"
          },
          {
            "kind": "ok",
            "label": "SBOM shows unexpected components"
          },
          {
            "kind": "ok",
            "label": "Buy is blocked before enrolment"
          }
        ]
      },
      "depth": {
        "basics": {
          "what": "You decide what to buy and who to buy it from — picking devices that will stay updateable, with a security chip (TPM), and from suppliers you can trust.",
          "why": "Buying the wrong kit locks you into years of weak updates or unknown parts. Most of that risk is decided at procurement, not later.",
          "do": [
            "Shortlist devices that match user needs and still get security updates for the years you will keep them.",
            "Prefer TPM 2.0, Secure Boot and a clear firmware update path (NCSC choosing-devices).",
            "Ask suppliers about Cyber Essentials or equivalent, and about SBOMs where they can provide them.",
            "Write security expectations into the contract (CAF A4 / supply chain guidance).",
            "Tap the term chips below for plain-English explainers."
          ]
        },
        "practitioner": {
          "what": "Run procurement against a device security checklist: support life, TPM 2.0, Secure Boot, automated firmware updates, and supplier assurance evidence mapped to CAF A4.",
          "why": "Without a checklist, teams buy convenient kit that cannot be attested, patched or evidenced later — and auditors will ask for that evidence.",
          "do": [
            "Use NCSC choosing-devices criteria in the tender (support life, TPM, Secure Boot, update path).",
            "Request SBOM (SPDX or CycloneDX) or a clear component disclosure where the market can supply it.",
            "Prefer Secure by Default platforms and NCSC device security principles for manufacturers.",
            "Record supplier security obligations in the contract; map residual risk to CAF A4.",
            "Keep NIST SP 800-161 as secondary reading for cyber supply-chain risk management."
          ]
        },
        "architect": {
          "what": "Design a reference architecture that requires a hardware root of trust, measurable boot, and procurement artefacts (SBOM, support life, recovery path) as first-class controls — not optional extras.",
          "why": "Architecture that ignores the supply chain and root of trust cannot be rescued by later OS hardening. CAF A4 and NIST SP 800-161 give a shared language for that risk.",
          "do": [
            "Mandate TPM 2.0 (or equivalent HSM / Caliptra-class root) in the reference design and bill of materials.",
            "Treat SBOM and vendor assurance as architectural inputs to asset and vulnerability management.",
            "Align supplier controls to CAF A4 and NCSC supply chain principles.",
            "Plan for attestation and recovery features at buy time so later stages can use them.",
            "Document which device classes need stronger roots of trust (servers, privileged workstations)."
          ]
        }
      },
      "quiz": {
        "question": "What does an SBOM help you see before you buy?",
        "options": [
          {
            "id": "a",
            "label": "The colour of the device case",
            "correct": false,
            "feedback": "Not the point — an SBOM is about the software and firmware parts inside, not cosmetics."
          },
          {
            "id": "b",
            "label": "Which components and libraries are inside the product",
            "correct": true,
            "feedback": "Yes. An SBOM lists the parts so you can spot unexpected or known-bad components."
          },
          {
            "id": "c",
            "label": "The user's desktop wallpaper",
            "correct": false,
            "feedback": "No — that is user settings, not a bill of materials."
          }
        ]
      }
    },
    "receive": {
      "chips": [
        {
          "id": "attest",
          "label": "Device attestation",
          "what": "Device attestation is a remote health check: the device proves what booted (often via the TPM) so you can decide whether to trust it.",
          "analogy": "Asking a courier to show a sealed delivery note before you open the door — not just trusting the van logo.",
          "without": "A tampered device can look fine on the desk while malware or a firmware change has already landed.",
          "good": "New devices are attested or compliance-checked before they get network or data access (NCSC MDM guidance).",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management",
            "label": "NCSC — Mobile Device Management"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/ensure-transparency-of-device-health",
            "label": "NCSC — Transparency of device health"
          }
        },
        {
          "id": "jtag",
          "label": "JTAG / UART",
          "what": "JTAG and UART are hardware debug ports used in factories and labs. Left open, they can expose memory and control of the device.",
          "analogy": "A locked staff-only service door at the back of a shop — fine for engineers, dangerous if left propped open on the high street.",
          "without": "Someone with physical access can dump firmware, inject code, or bypass software locks through the debug port.",
          "good": "Debug interfaces are disabled or strongly protected on production devices (NCSC device principles: constrain interfaces).",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces",
            "label": "NCSC — Constrain use of all device interfaces"
          }
        }
      ],
      "attack": {
        "title": "Attack stopped",
        "story": "A device arrives with tampered firmware from the supply chain. Device attestation fails the health check, so it is held out of the estate instead of being enrolled.",
        "steps": [
          {
            "kind": "bad",
            "label": "Tampered device arrives"
          },
          {
            "kind": "ok",
            "label": "Attestation / health check runs"
          },
          {
            "kind": "ok",
            "label": "Measurements do not match expected"
          },
          {
            "kind": "ok",
            "label": "Device held — not enrolled"
          }
        ]
      },
      "depth": {
        "basics": {
          "what": "When kit arrives, you check it is the real thing, put it on the asset register, and only then hand it out — like checking a delivery before signing for it.",
          "why": "A swapped or tampered device can bring malware or a backdoor straight into your building. Catching that at the door is far cheaper than cleaning up later.",
          "do": [
            "Match serials and seals to the order before accepting the delivery.",
            "Enrol every device on the asset register before issue (NCSC asset management).",
            "Only accept deliveries through agreed supply channels (CAF A4 / supply chain guidance).",
            "Where your platform allows, run a health or attestation check before full access.",
            "Tap the term chips below for plain-English explainers."
          ]
        },
        "practitioner": {
          "what": "Run a receive process: identity check, asset enrolment, baseline firmware version record, and attestation or compliance gate before the device joins production networks.",
          "why": "Without a gate, tampered or grey-market kit can be enrolled like any other laptop. CAF A4 expects control of what enters the estate.",
          "do": [
            "Photograph seals / record tamper evidence for high-value kit when policy requires it.",
            "Capture firmware and OS build versions at enrolment for later drift detection.",
            "Use MDM enrolment with strong authentication; prefer Device Health Attestation where supported (NCSC MDM).",
            "Keep debug ports (JTAG / UART) disabled on production images — check vendor guidance.",
            "Quarantine devices that fail attestation until investigated."
          ]
        },
        "architect": {
          "what": "Design receive as a control gate: only attested, inventoried devices earn network trust, with supply-chain provenance feeding the asset and vulnerability systems.",
          "why": "Zero-trust access decisions need a trustworthy device identity and health signal from day one. That signal is useless if receive skips attestation.",
          "do": [
            "Define the minimum attestation / compliance signal before each device class gets data access.",
            "Tie receive workflows to CAF A4 and NCSC asset management.",
            "Require vendors to ship with debug interfaces constrained (device principles).",
            "Feed enrolment measurements into monitoring baselines used in later stages.",
            "Plan exception handling for lab and break-glass devices so they stay segmented."
          ]
        }
      },
      "quiz": {
        "question": "Why run device attestation when kit first arrives?",
        "options": [
          {
            "id": "a",
            "label": "To choose a nicer wallpaper",
            "correct": false,
            "feedback": "No — attestation is a health check of what booted, not a style setting."
          },
          {
            "id": "b",
            "label": "To check the device booted into an expected healthy state before you trust it",
            "correct": true,
            "feedback": "Yes. Attestation helps stop tampered devices being enrolled as if they were clean."
          },
          {
            "id": "c",
            "label": "To turn the speakers up",
            "correct": false,
            "feedback": "Not related — attestation is about trust and boot state."
          }
        ]
      }
    },
    "build": {
      "chips": [
        {
          "id": "uefi",
          "label": "UEFI",
          "what": "UEFI is the modern firmware that starts your PC before the operating system loads.",
          "analogy": "Like the building's lobby and door staff — everything that enters the building passes them first.",
          "without": "An attacker can swap the early start-up code and load malware before Windows or security tools even wake up.",
          "good": "UEFI is kept up to date, Secure Boot is on, and only admins can change firmware settings.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_2",
            "label": "NCSC — Managing device firmware (Preparation / Firmware Settings)"
          }
        },
        {
          "id": "secure-measured",
          "label": "Secure & measured boot",
          "what": "Secure Boot only runs signed start-up code; measured boot records what actually ran so you can check later.",
          "analogy": "Secure Boot is the bouncer checking IDs; measured boot is the CCTV log of who came in.",
          "without": "Unsigned or tampered firmware can load quietly, and you have no trustworthy record of what booted.",
          "good": "Secure Boot enabled with allowed boot paths; measurements available for attestation.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_3",
            "label": "NCSC — Managing device firmware (How to manage — Secure Boot)"
          }
        },
        {
          "id": "tpm",
          "label": "TPM 2.0",
          "what": "A TPM (Trusted Platform Module) is a small built-in security chip that holds keys and boot measurements.",
          "analogy": "A sealed safe built into the device that records what booted and keeps encryption keys hard to steal.",
          "without": "Disk encryption keys and boot evidence sit in ordinary software, where malware can copy or fake them.",
          "good": "TPM 2.0 present, used for BitLocker (or equivalent) and for storing boot measurements.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices#section_8",
            "label": "NCSC — Choosing devices (Windows / TPM 2.0)"
          },
          "link2": {
            "href": "https://trustedcomputinggroup.org/resource/trusted-platform-module-tpm-summary/",
            "label": "Standard — TCG TPM summary"
          }
        },
        {
          "id": "iommu",
          "label": "IOMMU / DMA protection",
          "what": "An IOMMU (and Kernel DMA Protection) stops plugged-in devices from reading or writing main memory freely.",
          "analogy": "A security gate between the USB/Thunderbolt porch and the filing cabinets inside.",
          "without": "A rogue Thunderbolt or similar device can scrape memory for passwords and keys while the laptop is locked.",
          "good": "Kernel DMA Protection on (or Thunderbolt security set to need approval); new DMA devices blocked when locked.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely#section_3",
            "label": "NCSC — Using peripherals securely (How to manage — DMA)"
          }
        },
        {
          "id": "pcie-dma",
          "label": "PCIe / DMA",
          "what": "PCIe is the fast internal bus; DMA lets a device move data to memory without the CPU watching every byte.",
          "analogy": "A VIP goods lift that bypasses reception — useful for speed, risky if anyone can use it.",
          "without": "Attackers abuse DMA over external ports to dump memory or inject code outside the OS's view.",
          "good": "Unused DMA-capable ports disabled or tightly controlled; DMA protection enabled where the hardware supports it.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely#section_2",
            "label": "NCSC — Using peripherals securely (Preparation — DMA risks)"
          }
        }
      ],
      "attack": {
        "title": "Attack stopped",
        "story": "A firmware implant tries to load at boot. Secure Boot refuses it because the code isn't signed; measured boot records the attempt in the TPM so attestation flags the device.",
        "steps": [
          {
            "kind": "bad",
            "label": "Implant tries to load"
          },
          {
            "kind": "ok",
            "label": "Secure Boot blocks unsigned code"
          },
          {
            "kind": "ok",
            "label": "TPM records the attempt"
          },
          {
            "kind": "ok",
            "label": "Attestation flags the device"
          }
        ]
      },
      "depth": {
        "basics": {
          "what": "You set the device up safely before anyone uses it — turn on the locks (Secure Boot, encryption) and close spare doors (unused ports), the way you'd set an alarm before leaving a new office empty overnight.",
          "why": "If you skip this, malware can hide in early start-up code, or a stolen laptop can give up its files. Most of that risk is avoidable with a careful first setup.",
          "do": [
            "Turn Secure Boot on and keep firmware settings for admins only.",
            "Encrypt the disk with the built-in TPM chip (and a PIN if your policy asks).",
            "Use one standard 'gold' build so every laptop starts the same way.",
            "Switch off unused USB or Thunderbolt access if people don't need it.",
            "Tap the term chips below for plain-English explainers."
          ]
        },
        "practitioner": {
          "what": "Apply a baseline UEFI and OS configuration: Secure Boot and allowed boot paths, BitLocker with TPM (plus PIN where required), Kernel DMA Protection, and a hardened gold image with unused accounts and auto-run removed.",
          "why": "Misconfigured firmware, open DMA ports and weak encryption are the practical gaps attackers and auditors both look for. CAF B4.b expects consistent secure configuration you can rebuild.",
          "do": [
            "In UEFI: enable Secure Boot, restrict boot devices, set a firmware admin password, disable unused boot-from-USB.",
            "Enable BitLocker (or FileVault) with TPM; add a PIN for higher assurance where NCSC guidance suggests it.",
            "Turn on Kernel DMA Protection / block new DMA devices when locked (NCSC peripherals guidance).",
            "Deploy a documented gold build; remove guest/admin defaults; disable auto-run.",
            "Prefer devices that support Windows UEFI Firmware Capsule Update (or LVFS) so firmware patches are automatable."
          ]
        },
        "architect": {
          "what": "Design the platform for firmware resilience: a hardware root of trust, measured boot into a TPM, attestation of device state, and Protect / Detect / Recover controls aligned to NIST SP 800-193 and CAF B4.",
          "why": "Without an architectural root of trust, higher-layer controls can be bypassed by early firmware. Standards (NIST 800-147/193, TCG) and CAF B4 give a common language for assurance and recovery.",
          "do": [
            "Require TPM 2.0, Secure Boot and measured boot in the reference architecture and procurement.",
            "Map controls to NIST SP 800-193 (protect firmware, detect tamper, recover to known good) and NIST SP 800-147 for BIOS protection.",
            "Plan device attestation (health signals) into access decisions — CAF B4 and NCSC device principles.",
            "Segment management of BMC/out-of-band interfaces from user workloads (see later stages).",
            "Keep gold images and recovery paths as first-class design artefacts, not afterthoughts."
          ]
        }
      },
      "quiz": {
        "question": "Which chip stores the boot measurements?",
        "options": [
          {
            "id": "a",
            "label": "The graphics card",
            "correct": false,
            "feedback": "Not quite — graphics firmware is separate. Boot measurements are kept in the TPM."
          },
          {
            "id": "b",
            "label": "The TPM (Trusted Platform Module)",
            "correct": true,
            "feedback": "Yes. The TPM stores boot measurements so attestation can show what actually started."
          },
          {
            "id": "c",
            "label": "The Wi‑Fi chip",
            "correct": false,
            "feedback": "No — network firmware doesn't hold the platform boot log. That's the TPM's job."
          }
        ]
      }
    },
    "deploy": {
      "chips": [
        {
          "id": "bmc",
          "label": "BMC / Redfish",
          "what": "A BMC (baseboard management controller) is a small computer on a server that can power, monitor and reimage the host even when the main OS is off. Redfish is the modern API used to talk to many BMCs.",
          "analogy": "A building's facilities desk that can unlock rooms and reset alarms without entering each office — powerful, so it needs its own locked corridor.",
          "without": "Admins cannot recover crashed servers remotely — or worse, attackers find an exposed BMC and take over the metal.",
          "good": "BMC reachable only on a dedicated management network; strong admin auth; Redfish preferred over legacy clear-text where available.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/allow-robust-device-management",
            "label": "NCSC — Allow robust device management"
          },
          "link2": {
            "href": "https://www.dmtf.org/sites/default/files/standards/documents/DSP0266_1.20.0.pdf",
            "label": "DMTF — Redfish specification (PDF)"
          }
        },
        {
          "id": "ipmi",
          "label": "IPMI",
          "what": "IPMI is an older out-of-band management protocol for servers. Many implementations have a long history of weak defaults and should be treated as high risk if exposed.",
          "analogy": "An old master key that still opens every plant room — convenient for staff, disastrous if copied.",
          "without": "Leaving IPMI on the office or internet network is a classic way attackers get host control below the OS.",
          "good": "IPMI disabled or strictly isolated; prefer modern Redfish with strong auth; no default passwords.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces",
            "label": "NCSC — Constrain use of all device interfaces"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/allow-robust-device-management",
            "label": "NCSC — Allow robust device management"
          }
        },
        {
          "id": "bmc-iso",
          "label": "BMC isolation",
          "what": "BMC isolation means keeping management interfaces off normal user and workload networks so only trusted admins can reach them.",
          "analogy": "Putting the plant-room door on a separate key system from the public lobby.",
          "without": "Anyone who can reach the office LAN — or the internet — may reach the keys to the server itself.",
          "good": "Dedicated management VLAN or network; MFA for admins; no BMC/IPMI on the internet (CAF B4.c style separation).",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
            "label": "NCSC CAF — Principle B4 System security"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces",
            "label": "NCSC — Constrain use of all device interfaces"
          }
        }
      ],
      "attack": {
        "title": "Attack stopped",
        "story": "An attacker scans for exposed IPMI/BMC on the office network. BMC isolation keeps management off that network, so the probe finds nothing useful and the host stays under admin control.",
        "steps": [
          {
            "kind": "bad",
            "label": "Attacker scans for open IPMI/BMC"
          },
          {
            "kind": "ok",
            "label": "BMC is off the user network"
          },
          {
            "kind": "ok",
            "label": "Only management VLAN can reach it"
          },
          {
            "kind": "ok",
            "label": "Probe finds nothing — host safe"
          }
        ]
      },
      "depth": {
        "basics": {
          "what": "You put the device into service with the right protections — managed by your tools, on the right network, with admin paths locked down.",
          "why": "A server with its management port on the open network is like leaving the master key on the front desk. Isolation and strong admin access stop that.",
          "do": [
            "Enrol devices in MDM or your fleet tool before they hold real data (NCSC MDM).",
            "Keep server BMC/IPMI off the normal office Wi‑Fi and user LAN.",
            "Use strong unique passwords (or better, MFA) for management accounts.",
            "Prefer modern management APIs (Redfish) over old clear-text ones where you can.",
            "Tap the term chips below for plain-English explainers."
          ]
        },
        "practitioner": {
          "what": "Deploy with a known-good image, enforce NCSC platform packs where they fit, and place BMC/out-of-band interfaces on a dedicated management network with strong admin authentication.",
          "why": "Exposed IPMI/BMC is a recurring breach pattern. CAF B4.c expects privileged and management paths to be separated from everyday access.",
          "do": [
            "Put BMC/IPMI on an isolated management VLAN; block from internet and user VLANs.",
            "Disable unused management services; change all default BMC credentials at build time.",
            "Prefer Redfish over legacy IPMI where the platform supports it.",
            "Administer high-value systems from privileged access workstations (CAF B4.c).",
            "Apply NCSC platform configuration packs where they fit your estate."
          ]
        },
        "architect": {
          "what": "Design out-of-band management as its own security domain: segmented networks, hardened Bastion/PAW access, inventory of every BMC, and recovery paths that do not depend on the compromised host OS.",
          "why": "BMC compromise bypasses the guest OS entirely. Architecture must treat management planes as high-impact assets aligned to CAF B4 and device management principles.",
          "do": [
            "Require network isolation of BMC/IPMI in the reference architecture and hosting standards.",
            "Inventory and monitor every out-of-band interface like any other privileged system.",
            "Prefer vendors with robust, authenticated management (Redfish, signed firmware).",
            "Map controls to CAF B4 and NCSC device principles (robust management + constrained interfaces).",
            "Define break-glass physical console procedures that stay audited."
          ]
        }
      },
      "quiz": {
        "question": "Where should a server BMC usually live on the network?",
        "options": [
          {
            "id": "a",
            "label": "On the same Wi‑Fi as staff laptops",
            "correct": false,
            "feedback": "Risky — that mixes powerful management with everyday user traffic."
          },
          {
            "id": "b",
            "label": "On a dedicated, isolated management network",
            "correct": true,
            "feedback": "Yes. BMC isolation keeps out-of-band management away from users and the internet."
          },
          {
            "id": "c",
            "label": "On the public internet for convenience",
            "correct": false,
            "feedback": "No — internet-exposed IPMI/BMC is a classic attack path."
          }
        ]
      }
    },
    "operate": {
      "chips": [
        {
          "id": "signed-fw",
          "label": "Signed firmware updates",
          "what": "Signed firmware updates are patches the device will only accept if they carry a trusted digital signature from the vendor.",
          "analogy": "Only accepting parcels with the official wax seal — unsigned boxes go in the bin.",
          "without": "Anyone who can reach the update channel could push a malicious firmware image and take lasting control.",
          "good": "Firmware updates are signed, delivered through approved channels, and applied promptly (NCSC managing device firmware).",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_3",
            "label": "NCSC — Managing device firmware (How to manage)"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/provide-updates-securely",
            "label": "NCSC — Provide updates securely"
          }
        },
        {
          "id": "microcode",
          "label": "CPU microcode",
          "what": "CPU microcode is low-level fix code for the processor. Vendors ship updates (often via BIOS/UEFI or the OS) to close hardware bugs and some side-channel issues.",
          "analogy": "A quiet software patch for the engine itself — not the bodywork, the engine control unit.",
          "without": "Known CPU flaws stay open, including classes of side-channel issues that can leak secrets across security boundaries.",
          "good": "Microcode updates are part of your normal firmware/OS patch pipeline and tracked like other critical updates.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/keeping-devices-and-software-up-to-date",
            "label": "NCSC — Keeping devices and software up to date"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware",
            "label": "NCSC — Managing device firmware"
          }
        },
        {
          "id": "nic-fw",
          "label": "NIC firmware",
          "what": "NIC firmware runs on the network card. Like any firmware, it needs signing and timely updates — a compromised NIC can see or change traffic below the OS.",
          "analogy": "The post-room staff who handle every letter before it reaches your desk — if they are compromised, every letter is at risk.",
          "without": "Outdated or unsigned NIC firmware can hide implants that sniff credentials or pivot inside the network.",
          "good": "NIC (and other device) firmware is inventoried, signed and patched via OEM or LVFS / enterprise tools.",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware",
            "label": "NCSC — Managing device firmware"
          },
          "link2": {
            "href": "https://fwupd.org/",
            "label": "LVFS / fwupd — Linux Vendor Firmware Service"
          }
        }
      ],
      "attack": {
        "title": "Attack stopped",
        "story": "A known CPU or firmware flaw (for example a side-channel class issue) is announced. Signed, timely microcode and firmware updates land through your patch pipeline before attackers can reliably exploit the estate.",
        "steps": [
          {
            "kind": "bad",
            "label": "Firmware / microcode flaw published"
          },
          {
            "kind": "ok",
            "label": "Signed update available from vendor"
          },
          {
            "kind": "ok",
            "label": "Patch pipeline deploys promptly"
          },
          {
            "kind": "ok",
            "label": "Estate protected before wide abuse"
          }
        ]
      },
      "depth": {
        "basics": {
          "what": "You keep devices healthy over time — apply firmware and software updates, and retire kit that no longer gets fixes.",
          "why": "Yesterday's safe laptop becomes today's open door when a firmware bug is published. Signed, timely updates close that door.",
          "do": [
            "Turn on automatic updates where you trust the channel.",
            "Include firmware (UEFI, NIC, SSD) in the same patch habit as apps (NCSC managing device firmware).",
            "Follow NCSC keeping-devices-and-software-up-to-date guidance for the estate.",
            "Replace devices that the vendor no longer patches.",
            "Tap the term chips below for plain-English explainers."
          ]
        },
        "practitioner": {
          "what": "Run a firmware patch cadence: inventory versions, prefer signed capsule/LVFS updates, track microcode and NIC firmware alongside OS patches, and meet Cyber Essentials security-update expectations.",
          "why": "Firmware lag is invisible in many vulnerability scanners. CAF B4.d expects prompt mitigation of announced weaknesses on supported kit.",
          "do": [
            "Automate firmware updates where the platform allows; otherwise use OEM / enterprise tools.",
            "Track CPU microcode and NIC/storage firmware in the patch CMDB, not only OS KB numbers.",
            "Verify signatures before applying; reject unsigned or unexpected images.",
            "Meet Cyber Essentials security-update expectations for devices in scope.",
            "Test updates on a pilot ring before broad rollout."
          ]
        },
        "architect": {
          "what": "Design patching as a continuous control: signed update roots of trust, inventory coverage for every firmware class, and clear unsupported-kit exit criteria aligned to CAF B4.d and NIST SP 800-193 recoverability.",
          "why": "Architecture that cannot update firmware safely cannot stay resilient. Update authenticity (signatures) and coverage (microcode, NIC, BMC) are design requirements.",
          "do": [
            "Require signed firmware update mechanisms in procurement (NCSC provide-updates-securely principle).",
            "Cover UEFI, microcode, NIC, storage and BMC in the vulnerability management scope.",
            "Align SLA for critical firmware to CAF B4.d / Cyber Essentials expectations.",
            "Prefer LVFS or vendor enterprise channels that support attestation of applied versions.",
            "Plan forced retirement when vendors stop signing or shipping fixes."
          ]
        }
      },
      "quiz": {
        "question": "Why must firmware updates be signed?",
        "options": [
          {
            "id": "a",
            "label": "So the file looks pretty in Explorer",
            "correct": false,
            "feedback": "No — signing is about trust, not appearance."
          },
          {
            "id": "b",
            "label": "So the device only accepts updates from a trusted vendor",
            "correct": true,
            "feedback": "Yes. A signature lets the device reject fake or tampered firmware."
          },
          {
            "id": "c",
            "label": "So the update installs without electricity",
            "correct": false,
            "feedback": "Not related — signing does not change power needs."
          }
        ]
      }
    },
    "monitor": {
      "chips": [
        {
          "id": "fw-mon",
          "label": "Firmware integrity monitoring",
          "what": "Firmware integrity monitoring watches for unexpected changes to firmware versions, settings or boot measurements.",
          "analogy": "A seal on a medicine bottle — if the seal is broken when you next look, you investigate before using it.",
          "without": "A silent firmware change can persist across OS reinstalls and go unnoticed for months.",
          "good": "Firmware versions and boot status are logged and alerted on drift (NCSC firmware monitoring / logging guidance).",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_2",
            "label": "NCSC — Managing device firmware (Preparation)"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/logging-and-protective-monitoring",
            "label": "NCSC — Logging and protective monitoring (devices)"
          }
        },
        {
          "id": "attest-mon",
          "label": "Device attestation (repeat)",
          "what": "Repeating device attestation in operation re-checks that the device still boots into an expected healthy state — not only on day one.",
          "analogy": "Showing your pass every time you enter the building, not only on your first day.",
          "without": "A device that was clean at enrolment can drift or be tampered with later and still keep full access.",
          "good": "Periodic or continuous attestation feeds access decisions (NCSC MDM / logging; device health transparency).",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management",
            "label": "NCSC — Mobile Device Management"
          },
          "link2": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/ensure-transparency-of-device-health",
            "label": "NCSC — Transparency of device health"
          }
        }
      ],
      "attack": {
        "title": "Attack stopped",
        "story": "Someone quietly changes firmware on a live device. Integrity monitoring spots version or measurement drift, raises an alert, and the device is pulled from trusted access until recovered.",
        "steps": [
          {
            "kind": "bad",
            "label": "Silent firmware change"
          },
          {
            "kind": "ok",
            "label": "Integrity monitor sees drift"
          },
          {
            "kind": "ok",
            "label": "Alert reaches responders"
          },
          {
            "kind": "ok",
            "label": "Device trust reduced until fixed"
          }
        ]
      },
      "depth": {
        "basics": {
          "what": "You watch for signs a device has been changed — odd firmware versions, failed health checks, or strange USB events — and investigate early.",
          "why": "Firmware implants and silent changes do not always crash the laptop. Monitoring is how you notice before damage spreads.",
          "do": [
            "Collect firmware version and boot status where the platform allows (NCSC firmware monitoring).",
            "Prefer Device Health Attestation and feed results into access decisions (NCSC MDM / logging guidance).",
            "Alert on unexpected USB / DMA style events where you can.",
            "Keep device health visible (NCSC device security principles: transparency of device health).",
            "Tap the term chips below for plain-English explainers."
          ]
        },
        "practitioner": {
          "what": "Pipe firmware inventory, boot measurements and attestation results into logging and protective monitoring; alert on drift and failed health checks.",
          "why": "Without baselined firmware telemetry, respond teams learn about implants from the press. NCSC logging guidance expects useful device signals, not only OS antivirus alerts.",
          "do": [
            "Baseline firmware versions at build/enrolment; alert on unexpected changes.",
            "Ingest Device Health Attestation or equivalent into SIEM / access control.",
            "Monitor management plane (BMC) logs as well as host OS logs.",
            "Review failed attestation daily for privileged fleets.",
            "Map detections to playbooks in the respond stage."
          ]
        },
        "architect": {
          "what": "Design detectability into the platform: continuous attestation, firmware integrity signals, and health transparency as inputs to zero-trust policy — aligned to NIST SP 800-193 Detect and CAF B4.",
          "why": "Protect without Detect leaves implants invisible. Architecture must expose trustworthy measurements, not only vendor marketing claims.",
          "do": [
            "Require measurable boot and attestation APIs in the reference architecture.",
            "Treat firmware drift as a first-class detection use case in the SOC design.",
            "Align to NCSC maintain-device-integrity and ensure-transparency principles.",
            "Feed health into conditional access (failed attestation → reduced trust).",
            "Keep NIST SP 800-193 Detect/Recover as the resilience frame."
          ]
        }
      },
      "quiz": {
        "question": "What does firmware integrity monitoring look for?",
        "options": [
          {
            "id": "a",
            "label": "Unexpected changes to firmware versions or boot measurements",
            "correct": true,
            "feedback": "Yes. Drift from the expected firmware or measurements is the signal to investigate."
          },
          {
            "id": "b",
            "label": "Whether the desk chair is comfortable",
            "correct": false,
            "feedback": "No — this is about firmware and boot health, not furniture."
          },
          {
            "id": "c",
            "label": "The cafeteria menu",
            "correct": false,
            "feedback": "Not related."
          }
        ]
      }
    },
    "respond": {
      "chips": [
        {
          "id": "golden",
          "label": "Golden image recovery",
          "what": "Golden image recovery means rebuilding a device from a known-good, protected image after compromise or failure — including firmware recovery where the platform supports it.",
          "analogy": "Restoring a flat from the landlord's master plans after a flood — not patching random damp patches and hoping.",
          "without": "You may leave implants behind in firmware or leftover accounts, and the next user inherits the problem.",
          "good": "Tested rebuild from a protected gold image; firmware recovery features used where available (device principles; NIST SP 800-193 Recover).",
          "link": {
            "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/enable-recovery-to-a-known-good-state",
            "label": "NCSC — Enable recovery to a known good state"
          },
          "link2": {
            "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
            "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
          }
        }
      ],
      "attack": {
        "title": "Attack stopped",
        "story": "A firmware implant is confirmed on a device. Responders take it offline, recover firmware to a known-good state, and rebuild from the golden image so the implant is gone before reissue.",
        "steps": [
          {
            "kind": "bad",
            "label": "Firmware implant confirmed"
          },
          {
            "kind": "ok",
            "label": "Device isolated from the network"
          },
          {
            "kind": "ok",
            "label": "Firmware recovered to known good"
          },
          {
            "kind": "ok",
            "label": "Golden image rebuild before reissue"
          }
        ]
      },
      "depth": {
        "basics": {
          "what": "When something goes wrong, you isolate the device, wipe or rebuild it from a trusted copy, and only then give it back — like resetting a phone after it is stolen and found.",
          "why": "Half-fixed devices bring the problem back. A clean rebuild (and firmware recovery where needed) stops implants surviving an OS reinstall.",
          "do": [
            "Take suspect devices off the network quickly.",
            "Ensure MDM remote wipe is tested and responsive (NCSC MDM).",
            "Rebuild from a known-good gold image; prefer hardware with firmware recovery (device principles; NIST SP 800-193 Recover).",
            "For reissue, follow NCSC erasing-devices and secure sanitisation guidance where needed.",
            "Tap the term chips below for plain-English explainers."
          ]
        },
        "practitioner": {
          "what": "Run an incident playbook: isolate, capture evidence if required, recover firmware, rebuild from gold, re-attest, then reissue — with protected recovery media.",
          "why": "OS reinstall alone may miss firmware implants. CAF B4.b expects you can return to a consistent secure configuration you control.",
          "do": [
            "Keep gold builds and recovery media protected and available (CAF B4.b).",
            "Use vendor firmware recovery / known-good capsules when implant is suspected.",
            "Re-run attestation before restoring access.",
            "Follow NCSC erasing-devices before reuse when data sensitivity requires it.",
            "Record the incident against the asset for later lessons learned."
          ]
        },
        "architect": {
          "what": "Design Recover as a first-class control: immutable gold artefacts, firmware recovery paths, and playbooks that assume implants may outlive the OS — aligned to NIST SP 800-193 Recover and NCSC recovery principles.",
          "why": "Detect without Recover leaves you watching the fire. Architecture must make known-good rebuilds fast and trustworthy.",
          "do": [
            "Require firmware recovery capabilities in procurement for high-value classes.",
            "Protect gold images as critical assets (integrity, access control, offline copies).",
            "Map respond playbooks to NIST SP 800-193 Recover and CAF B4.",
            "Ensure out-of-band (BMC) recovery does not depend on the compromised host OS.",
            "Exercise rebuild drills on a schedule, not only after incidents."
          ]
        }
      },
      "quiz": {
        "question": "After a firmware implant, what is the safest reissue approach?",
        "options": [
          {
            "id": "a",
            "label": "Just change the wallpaper and give it back",
            "correct": false,
            "feedback": "No — cosmetics do not remove implants."
          },
          {
            "id": "b",
            "label": "Recover firmware to known good and rebuild from the golden image",
            "correct": true,
            "feedback": "Yes. Known-good firmware plus a gold rebuild clears implants that survive a casual OS reinstall."
          },
          {
            "id": "c",
            "label": "Leave it online so you can watch the implant work",
            "correct": false,
            "feedback": "Dangerous — isolate first, then recover."
          }
        ]
      }
    },
    "dispose": {
      "chips": [
        {
          "id": "sanitise",
          "label": "Secure sanitisation",
          "what": "Secure sanitisation means erasing or destroying storage so the next owner cannot recover your data — using methods that match the media type and sensitivity.",
          "analogy": "Shredding confidential papers properly before the recycling truck arrives — not just tearing them in half.",
          "without": "Discarded disks and phones routinely give up old files, passwords and personal data to whoever buys them next.",
          "good": "Follow NCSC secure sanitisation guidance; verify the result; keep certificates; update the asset register.",
          "link": {
            "href": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media#section_2",
            "label": "NCSC — Secure sanitisation of storage media (What is sanitisation?)"
          },
          "link2": {
            "href": "https://csrc.nist.gov/pubs/sp/800/88/r2/final",
            "label": "NIST SP 800-88 Rev. 2 — Guidelines for Media Sanitization"
          }
        }
      ],
      "attack": {
        "title": "Attack stopped",
        "story": "A discarded drive is sold on. Because it was securely sanitised and verified first, attempts to recover old data fail — the next owner gets empty media, not your files.",
        "steps": [
          {
            "kind": "bad",
            "label": "Someone tries to recover data from discarded media"
          },
          {
            "kind": "ok",
            "label": "Device was sanitised before disposal"
          },
          {
            "kind": "ok",
            "label": "Method verified / certified"
          },
          {
            "kind": "ok",
            "label": "No recoverable data remains"
          }
        ]
      },
      "depth": {
        "basics": {
          "what": "At end of life you wipe or destroy storage so the next owner cannot read your data, then recycle the hardware responsibly.",
          "why": "Thrown-away disks are a favourite source of leaks. A verified wipe (or destruction) closes that door.",
          "do": [
            "Follow NCSC secure sanitisation of storage media before re-use, sale, repair or disposal.",
            "Encrypted devices: use the vendor factory reset that deletes keys; unencrypted: overwrite and verify.",
            "Keep certificates and update the asset register (NCSC decommissioning assets).",
            "When in doubt for sensitive data, destroy the media.",
            "Tap the term chips below for plain-English explainers."
          ]
        },
        "practitioner": {
          "what": "Apply NCSC sanitisation methods by media type, verify (read-back or particle size), file certificates, and close the asset record — using CAS-S style providers where HMG work requires it.",
          "why": "A tick-box wipe without verification fails audits and still leaks. NCSC erasing-devices and sanitisation guidance set the bar.",
          "do": [
            "Choose Clear / Purge / Destroy style methods appropriate to sensitivity (NIST SP 800-88 r2 as secondary reading).",
            "For encrypted devices, cryptographic erase / factory reset that deletes keys; confirm success.",
            "For unencrypted media, overwrite including remapped sectors where guidance requires; verify.",
            "Destroy to ≤6 mm particles when data may remain or sensitivity is higher; verify particle size.",
            "File destruction certificates; update asset register to retired / disposed."
          ]
        },
        "architect": {
          "what": "Design decommission into procurement and architecture: sanitisation obligations in contracts, chain of custody, and media destruction routes sized to classification — aligned to NCSC decommissioning and NIST SP 800-88.",
          "why": "Dispose is often forgotten until a breach from a recycled disk. Architecture must make sanitisation a planned control with evidence.",
          "do": [
            "Require sanitisation plans at procurement (NCSC decommissioning assets).",
            "Define which media classes need destroy vs purge for each data tier.",
            "Keep chain-of-custody and certificate retention as auditable artefacts.",
            "Align secondary reading to NIST SP 800-88 Rev. 2 Clear / Purge / Destroy.",
            "Ensure cloud and hosted exits have equivalent data deletion evidence."
          ]
        }
      },
      "quiz": {
        "question": "Before selling or recycling a drive, what should you do?",
        "options": [
          {
            "id": "a",
            "label": "Nothing — the next owner will sort it out",
            "correct": false,
            "feedback": "Unsafe — discarded media often still holds recoverable data."
          },
          {
            "id": "b",
            "label": "Securely sanitise (or destroy) the storage and keep evidence",
            "correct": true,
            "feedback": "Yes. Follow NCSC secure sanitisation, verify, and record it."
          },
          {
            "id": "c",
            "label": "Only delete the desktop shortcuts",
            "correct": false,
            "feedback": "No — shortcuts are not sanitisation."
          }
        ]
      }
    }
  }
};

window.HW_REFS = [
  {
    "phrases": [
      "NCSC managing device firmware",
      "NCSC firmware monitoring"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware#section_3",
    "label": "NCSC — Managing device firmware"
  },
  {
    "phrases": [
      "NCSC using peripherals securely",
      "NCSC peripherals guidance"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely#section_3",
    "label": "NCSC — Using peripherals securely"
  },
  {
    "phrases": [
      "NCSC choosing-devices criteria",
      "NCSC choosing-devices"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices",
    "label": "NCSC — Choosing devices"
  },
  {
    "phrases": [
      "NCSC MDM guidance",
      "NCSC MDM / logging guidance",
      "NCSC MDM"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management",
    "label": "NCSC — Mobile Device Management"
  },
  {
    "phrases": [
      "NCSC asset management"
    ],
    "href": "https://www.ncsc.gov.uk/guidance/asset-management",
    "label": "NCSC — Asset management"
  },
  {
    "phrases": [
      "NCSC keeping-devices-and-software-up-to-date guidance",
      "NCSC keeping-devices-and-software-up-to-date"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/keeping-devices-and-software-up-to-date",
    "label": "NCSC — Keeping devices and software up to date"
  },
  {
    "phrases": [
      "NCSC secure sanitisation of storage media",
      "secure sanitisation guidance",
      "NCSC secure sanitisation"
    ],
    "href": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media",
    "label": "NCSC — Secure sanitisation of storage media"
  },
  {
    "phrases": [
      "NCSC erasing-devices"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/erasing-devices",
    "label": "NCSC — Erasing devices"
  },
  {
    "phrases": [
      "NCSC decommissioning assets"
    ],
    "href": "https://www.ncsc.gov.uk/guidance/decommissioning-assets",
    "label": "NCSC — Decommissioning assets"
  },
  {
    "phrases": [
      "NCSC device security principles for manufacturers",
      "NCSC device security principles",
      "device principles"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers",
    "label": "NCSC — Device security principles for manufacturers"
  },
  {
    "phrases": [
      "Secure by Default"
    ],
    "href": "https://www.ncsc.gov.uk/information/secure-default",
    "label": "NCSC — Secure by Default"
  },
  {
    "phrases": [
      "supply chain guidance"
    ],
    "href": "https://www.ncsc.gov.uk/collection/supply-chain-security",
    "label": "NCSC — Supply chain security guidance"
  },
  {
    "phrases": [
      "NCSC platform configuration packs"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance",
    "label": "NCSC — Device security guidance"
  },
  {
    "phrases": [
      "CAF B4.b",
      "CAF B4.c",
      "CAF B4.d",
      "CAF B4"
    ],
    "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security",
    "label": "NCSC CAF — Principle B4 System security"
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
      "Cyber Essentials secure configuration"
    ],
    "href": "https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf#page=15",
    "label": "Cyber Essentials — Secure Configuration (requirements PDF)"
  },
  {
    "phrases": [
      "Cyber Essentials security-update",
      "Cyber Essentials"
    ],
    "href": "https://www.ncsc.gov.uk/cyberessentials/overview",
    "label": "NCSC — Cyber Essentials overview"
  },
  {
    "phrases": [
      "NIST SP 800-193 / 800-147",
      "NIST 800-147/193",
      "NIST SP 800-193 Recover",
      "NIST SP 800-193"
    ],
    "href": "https://csrc.nist.gov/pubs/sp/800/193/final",
    "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines"
  },
  {
    "phrases": [
      "NIST SP 800-147"
    ],
    "href": "https://csrc.nist.gov/pubs/sp/800/147/final",
    "label": "NIST SP 800-147 — BIOS Protection Guidelines"
  },
  {
    "phrases": [
      "NIST SP 800-88 r2",
      "NIST SP 800-88"
    ],
    "href": "https://csrc.nist.gov/pubs/sp/800/88/r2/final",
    "label": "NIST SP 800-88 Rev. 2 — Guidelines for Media Sanitization"
  },
  {
    "phrases": [
      "NIST SP 800-161"
    ],
    "href": "https://csrc.nist.gov/pubs/sp/800/161/r1/final",
    "label": "NIST SP 800-161 Rev. 1 — Cybersecurity Supply Chain Risk Management"
  },
  {
    "phrases": [
      "Kernel DMA Protection"
    ],
    "href": "https://learn.microsoft.com/en-us/windows/security/hardware-security/kernel-dma-protection-for-thunderbolt",
    "label": "Microsoft — Kernel DMA Protection"
  },
  {
    "phrases": [
      "BitLocker PIN",
      "BitLocker"
    ],
    "href": "https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/",
    "label": "Microsoft — BitLocker"
  },
  {
    "phrases": [
      "FileVault"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/platform-guides/macos",
    "label": "NCSC — macOS device security guidance"
  },
  {
    "phrases": [
      "LVFS"
    ],
    "href": "https://fwupd.org/",
    "label": "LVFS / fwupd — Linux Vendor Firmware Service"
  },
  {
    "phrases": [
      "TCG"
    ],
    "href": "https://trustedcomputinggroup.org/resource/trusted-platform-module-tpm-summary/",
    "label": "TCG — Trusted Platform Module (TPM) summary"
  },
  {
    "phrases": [
      "SPDX"
    ],
    "href": "https://spdx.dev/",
    "label": "SPDX — Software Package Data Exchange"
  },
  {
    "phrases": [
      "CycloneDX"
    ],
    "href": "https://cyclonedx.org/",
    "label": "CycloneDX — SBOM standard"
  },
  {
    "phrases": [
      "Redfish"
    ],
    "href": "https://www.dmtf.org/sites/default/files/standards/documents/DSP0266_1.20.0.pdf",
    "label": "DMTF — Redfish specification (PDF)"
  },
  {
    "phrases": [
      "Caliptra",
      "Caliptra-class"
    ],
    "href": "https://caliptra.org/",
    "label": "Caliptra — open hardware root of trust"
  },
  {
    "phrases": [
      "NCSC device principles: constrain interfaces",
      "constrain interfaces"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces",
    "label": "NCSC — Constrain use of all device interfaces"
  },
  {
    "phrases": [
      "NCSC provide-updates-securely principle"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/provide-updates-securely",
    "label": "NCSC — Provide updates securely"
  },
  {
    "phrases": [
      "transparency of device health",
      "NCSC device security principles: transparency of device health"
    ],
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/ensure-transparency-of-device-health",
    "label": "NCSC — Transparency of device health"
  }
];

window.HW_SOURCES = [
  {
    "label": "NCSC — Managing device firmware",
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware"
  },
  {
    "label": "NCSC — Using peripherals securely",
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/policies-and-settings/using-peripherals-securely"
  },
  {
    "label": "NCSC — Choosing devices",
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/choosing-devices"
  },
  {
    "label": "NCSC — Mobile Device Management",
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/mobile-device-management"
  },
  {
    "label": "NCSC — Keeping devices and software up to date",
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/keeping-devices-and-software-up-to-date"
  },
  {
    "label": "NCSC — Logging and protective monitoring (devices)",
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/logging-and-protective-monitoring"
  },
  {
    "label": "NCSC — Erasing devices",
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/erasing-devices"
  },
  {
    "label": "NCSC — Purchasing devices",
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/getting-ready/purchasing-devices"
  },
  {
    "label": "NCSC — Device security guidance (collection)",
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance"
  },
  {
    "label": "NCSC — Secure sanitisation of storage media",
    "href": "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media"
  },
  {
    "label": "NCSC — Decommissioning assets",
    "href": "https://www.ncsc.gov.uk/guidance/decommissioning-assets"
  },
  {
    "label": "NCSC — Asset management",
    "href": "https://www.ncsc.gov.uk/guidance/asset-management"
  },
  {
    "label": "NCSC — Supply chain security guidance",
    "href": "https://www.ncsc.gov.uk/collection/supply-chain-security"
  },
  {
    "label": "NCSC — Secure by Default",
    "href": "https://www.ncsc.gov.uk/information/secure-default"
  },
  {
    "label": "NCSC — Device security principles for manufacturers",
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers"
  },
  {
    "label": "NCSC CAF — Principle A4 Supply chain",
    "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-a-managing-security-risk/principle-a4-supply-chain"
  },
  {
    "label": "NCSC CAF — Principle B4 System security",
    "href": "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security"
  },
  {
    "label": "NCSC — Cyber Essentials overview",
    "href": "https://www.ncsc.gov.uk/cyberessentials/overview"
  },
  {
    "label": "Cyber Essentials — Requirements for IT Infrastructure v3.3 (PDF)",
    "href": "https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf"
  },
  {
    "label": "NIST SP 800-193 — Platform Firmware Resiliency Guidelines",
    "href": "https://csrc.nist.gov/pubs/sp/800/193/final"
  },
  {
    "label": "NIST SP 800-147 — BIOS Protection Guidelines",
    "href": "https://csrc.nist.gov/pubs/sp/800/147/final"
  },
  {
    "label": "NIST SP 800-88 Rev. 2 — Guidelines for Media Sanitization",
    "href": "https://csrc.nist.gov/pubs/sp/800/88/r2/final"
  },
  {
    "label": "NIST SP 800-161 Rev. 1 — C-SCRM",
    "href": "https://csrc.nist.gov/pubs/sp/800/161/r1/final"
  },
  {
    "label": "TCG — Trusted Platform Module (TPM) summary",
    "href": "https://trustedcomputinggroup.org/resource/trusted-platform-module-tpm-summary/"
  },
  {
    "label": "Microsoft — Kernel DMA Protection",
    "href": "https://learn.microsoft.com/en-us/windows/security/hardware-security/kernel-dma-protection-for-thunderbolt"
  },
  {
    "label": "Microsoft — BitLocker",
    "href": "https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/"
  },
  {
    "label": "NCSC — macOS device security guidance",
    "href": "https://www.ncsc.gov.uk/collection/device-security-guidance/platform-guides/macos"
  },
  {
    "label": "LVFS / fwupd — Linux Vendor Firmware Service",
    "href": "https://fwupd.org/"
  },
  {
    "label": "SPDX — Software Package Data Exchange",
    "href": "https://spdx.dev/"
  },
  {
    "label": "CycloneDX — SBOM standard",
    "href": "https://cyclonedx.org/"
  },
  {
    "label": "DMTF — Redfish specification (PDF)",
    "href": "https://www.dmtf.org/sites/default/files/standards/documents/DSP0266_1.20.0.pdf"
  },
  {
    "label": "Caliptra — open hardware root of trust",
    "href": "https://caliptra.org/"
  },
  {
    "label": "NCSC — Constrain use of all device interfaces",
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/constrain-the-use-of-all-device-interfaces"
  },
  {
    "label": "NCSC — Allow robust device management",
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/allow-robust-device-management"
  },
  {
    "label": "NCSC — Provide updates securely",
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/provide-updates-securely"
  },
  {
    "label": "NCSC — Enable recovery to a known good state",
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/enable-recovery-to-a-known-good-state"
  },
  {
    "label": "NCSC — Transparency of device health",
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/ensure-transparency-of-device-health"
  },
  {
    "label": "NCSC — Maintain device integrity",
    "href": "https://www.ncsc.gov.uk/collection/device-security-principles-for-manufacturers/maintain-device-integrity"
  }
];
