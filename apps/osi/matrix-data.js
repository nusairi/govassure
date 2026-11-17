/* Protection matrix: generic example content. Layer names, colours and threats come from data.js.
   Every example is marked "Example:" so it can be cleared in one go. Nothing here is
   organisation-specific. NCSC links were checked to return 200. */
"use strict";
window.MATRIX_DATA = {
  version: 1,
  order: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  ratings: [
    { id: "", label: "Not rated" },
    { id: "none", label: "Not started" },
    { id: "partial", label: "Partial" },
    { id: "good", label: "Good" },
    { id: "na", label: "N/A" }
  ],
  rows: {
    0: {
      assets: "Example: laptops, servers and network appliances, plus their firmware",
      controls: [
        "Example: Secure Boot, TPM and BitLocker on laptops",
        "Example: firmware and driver updates pushed by Intune",
        "Example: buy only through approved resellers",
        "Example: Defender for Endpoint blocking unknown USB devices",
        "Example: certified sanitisation before disposal"
      ],
      owner: "Example: IT asset manager",
      gaps: "Example: firmware versions are not reported centrally",
      rating: "partial",
      learn: [
        { href: "/tutorial", label: "Hardware lifecycle tutorial" },
        { href: "/checklist", label: "Hardware assurance checklist" }
      ],
      ncsc: [
        { label: "Managing device firmware", url: "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/managing-device-firmware" },
        { label: "Supply chain security", url: "https://www.ncsc.gov.uk/collection/supply-chain-security" },
        { label: "Secure sanitisation of storage media", url: "https://www.ncsc.gov.uk/guidance/secure-sanitisation-storage-media" }
      ]
    },
    1: {
      assets: "Example: cabling, comms rooms, Wi-Fi radio and power",
      controls: [
        "Example: locked comms rooms with access logging",
        "Example: UPS and diverse power for core kit",
        "Example: unused wall ports disabled"
      ],
      owner: "Example: facilities and network team",
      gaps: "Example: no record of who has comms room keys",
      rating: "good",
      ncsc: [
        { label: "CAF B5: Resilient networks and systems", url: "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b5-resilient-networks-and-systems" },
        { label: "10 Steps: Asset management", url: "https://www.ncsc.gov.uk/collection/10-steps/asset-management" }
      ]
    },
    2: {
      assets: "Example: switches, VLANs and Wi-Fi access",
      controls: [
        "Example: 802.1X network access control on wired and Wi-Fi",
        "Example: port security and DHCP snooping on switches",
        "Example: guest Wi-Fi kept on its own VLAN",
        "Example: Defender for IoT watching building devices"
      ],
      owner: "Example: network team",
      gaps: "Example: some meeting rooms still have open ports",
      rating: "partial",
      ncsc: [
        { label: "Preventing lateral movement", url: "https://www.ncsc.gov.uk/guidance/preventing-lateral-movement" },
        { label: "CAF B4: System security", url: "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b4-system-security" }
      ]
    },
    3: {
      assets: "Example: routers, firewalls, IP ranges and remote access",
      controls: [
        "Example: network segments with default-deny rules (Azure Firewall, NSGs)",
        "Example: Entra Global Secure Access or VPN for remote staff",
        "Example: egress filtering to the internet"
      ],
      owner: "Example: network and security team",
      gaps: "Example: firewall rules not reviewed this year",
      rating: "partial",
      ncsc: [
        { label: "Virtual private networks", url: "https://www.ncsc.gov.uk/collection/device-security-guidance/infrastructure/virtual-private-networks" },
        { label: "Zero trust architecture design principles", url: "https://www.ncsc.gov.uk/collection/zero-trust/architecture-design-principles" },
        { label: "CAF B5: Resilient networks and systems", url: "https://www.ncsc.gov.uk/collection/cyber-assessment-framework/caf-objective-b/principle-b5-resilient-networks-and-systems" }
      ]
    },
    4: {
      assets: "Example: service ports and TCP/UDP connections",
      controls: [
        "Example: unused ports closed and scanned monthly",
        "Example: Azure DDoS Protection on public services",
        "Example: TLS 1.2 or later on every service"
      ],
      owner: "Example: platform team",
      gaps: "Example: no regular external port scan",
      rating: "none",
      ncsc: [
        { label: "Denial of service (DoS) guidance", url: "https://www.ncsc.gov.uk/collection/denial-service-dos-guidance-collection" },
        { label: "Using TLS to protect data", url: "https://www.ncsc.gov.uk/guidance/using-tls-to-protect-data" }
      ]
    },
    5: {
      assets: "Example: logins, sessions and access tokens",
      controls: [
        "Example: MFA for admin accounts (Entra ID)",
        "Example: Conditional Access with sign-in frequency for sensitive apps",
        "Example: admin rights on request with Entra PIM"
      ],
      owner: "Example: identity team",
      gaps: "Example: MFA not yet on every cloud service",
      rating: "partial",
      ncsc: [
        { label: "10 Steps: Identity and access management", url: "https://www.ncsc.gov.uk/collection/10-steps/identity-and-access-management" },
        { label: "MFA for your corporate online services", url: "https://www.ncsc.gov.uk/collection/mfa-for-your-corporate-online-services" },
        { label: "Password policy", url: "https://www.ncsc.gov.uk/collection/passwords" }
      ]
    },
    6: {
      assets: "Example: encrypted data, certificates and file formats",
      controls: [
        "Example: keys and certificates kept in Azure Key Vault",
        "Example: sensitivity labels that encrypt confidential files (Purview)",
        "Example: plan for post-quantum cryptography migration"
      ],
      owner: "Example: security architecture",
      gaps: "Example: no inventory of where cryptography is used",
      rating: "none",
      ncsc: [
        { label: "Using TLS to protect data", url: "https://www.ncsc.gov.uk/guidance/using-tls-to-protect-data" },
        { label: "10 Steps: Data security", url: "https://www.ncsc.gov.uk/collection/10-steps/data-security" },
        { label: "Timelines for migration to post-quantum cryptography", url: "https://www.ncsc.gov.uk/guidance/pqc-migration-timelines" }
      ]
    },
    7: {
      assets: "Example: websites, email, APIs and business applications",
      controls: [
        "Example: Azure Front Door WAF in front of public sites",
        "Example: Defender for Office 365 with SPF, DKIM and DMARC",
        "Example: protective DNS",
        "Example: Defender Vulnerability Management and Autopatch, critical fixes within 14 days"
      ],
      owner: "Example: application owners",
      gaps: "Example: DMARC still set to monitor only",
      rating: "partial",
      ncsc: [
        { label: "Email security and anti-spoofing", url: "https://www.ncsc.gov.uk/collection/email-security-and-anti-spoofing" },
        { label: "Protective DNS", url: "https://www.ncsc.gov.uk/information/pdns" },
        { label: "10 Steps: Vulnerability management", url: "https://www.ncsc.gov.uk/collection/10-steps/vulnerability-management" },
        { label: "Developers collection", url: "https://www.ncsc.gov.uk/collection/developers-collection" }
      ]
    },
    8: {
      assets: "Example: staff, admins, suppliers and the decisions they make",
      controls: [
        "Example: phishing practice with attack simulation training",
        "Example: joiner, mover and leaver access reviews",
        "Example: incident response exercise each year, using Sentinel and Defender XDR",
        "Example: Purview DLP and Insider Risk Management for data leaks"
      ],
      owner: "Example: security lead and HR",
      gaps: "Example: supplier access not reviewed",
      rating: "good",
      ncsc: [
        { label: "10 Steps: Engagement and training", url: "https://www.ncsc.gov.uk/collection/10-steps/engagement-and-training" },
        { label: "Phishing attacks: defending your organisation", url: "https://www.ncsc.gov.uk/guidance/phishing" },
        { label: "10 Steps: Incident management", url: "https://www.ncsc.gov.uk/collection/10-steps/incident-management" },
        { label: "10 Steps: Risk management", url: "https://www.ncsc.gov.uk/collection/10-steps/risk-management" }
      ]
    }
  }
};
