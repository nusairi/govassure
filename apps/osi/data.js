/* OSI Security Rings — content model. Edit here to change what appears on the rings. */
"use strict";
const LAYERS = [
  {
    n: 8, name: "People & Governance", short: "People", pdu: "Human intent", colour: "#AEB8CC",
    fn: "The people, decisions and governance that sit above the technology: who has access, what they intend, and how risk is owned. Often called 'Layer 8'.",
    threats: ["Phishing & pretexting", "Helpdesk social engineering (MFA reset)", "Insider misuse", "Human error & misconfiguration", "Weak risk ownership"],
    protocols: [
      { n: "Users", d: "Staff, citizens and customers whose intent drives every request." },
      { n: "Admins", d: "Privileged operators of systems and infrastructure." },
      { n: "Suppliers", d: "Third parties with access to systems, code or data." },
      { n: "JML process", d: "Joiners, movers and leavers – how access is granted, changed and removed." },
      { n: "ISO/IEC 27001", d: "Information security management system standard." },
      { n: "NCSC CAF", d: "Cyber Assessment Framework – outcomes for essential functions (used by the UK government\u2019s GovAssure scheme)." },
      { n: "Secure by Design", d: "UK government approach to building security in from the start of delivery." },
      { n: "SABSA", d: "Business-driven enterprise security architecture framework." }
    ],
    security: [
      { n: "Awareness", d: "Role-based security education, refreshed and measured.", f: "P" },
      { n: "Phish reporting", d: "Simulations plus a one-click report button so users become sensors.", f: "D" },
      { n: "Vetting", d: "Pre-employment and national security vetting (BPSS, SC, DV) proportionate to access.", f: "P" },
      { n: "Access reviews", d: "Periodic recertification of access and prompt leaver removal.", f: "PD" },
      { n: "Duty separation", d: "Separation of duties – no single person can complete a sensitive action alone.", f: "P" },
      { n: "Insider risk", d: "Insider risk programme – behavioural indicators, HR and security working together.", f: "D" },
      { n: "IR exercises", d: "Incident response playbooks and exercises – rehearsed response, crisis comms and lessons learned.", f: "R" },
      { n: "Risk ownership", d: "Named risk owners, risk appetite and board-level reporting.", f: "P" },
      { n: "Helpdesk ID checks", d: "Strong identity checks before MFA resets or password changes.", f: "P" }
    ]
  },
  {
    n: 7, name: "Application", pdu: "Data", colour: "#E5487A",
    fn: "Network services exposed to applications and users: web, mail, naming, directory, remote access and management.",
    threats: ["Injection (SQLi, XSS)", "Credential stuffing", "Phishing", "API abuse", "Malware delivery", "DNS tunnelling"],
    protocols: [
      { n: "HTTP/S", d: "Hypertext Transfer Protocol (TCP 80/443; HTTP/3 runs over QUIC)." },
      { n: "DNS", d: "Domain Name System resolution (UDP/TCP 53; DoT 853, DoH 443)." },
      { n: "SMTP", d: "Mail transfer between servers and submission from clients (TCP 25/587)." },
      { n: "IMAP/POP3", d: "Mailbox retrieval (IMAP 143/993, POP3 110/995)." },
      { n: "FTP", d: "File Transfer Protocol (TCP 20/21) – cleartext; prefer SFTP/FTPS." },
      { n: "SSH", d: "Secure Shell for remote administration, SFTP and tunnelling (TCP 22)." },
      { n: "SNMP", d: "Device monitoring and management (UDP 161/162); use v3 for auth and encryption." },
      { n: "LDAP", d: "Directory access (TCP 389; LDAPS 636)." },
      { n: "DHCP", d: "Dynamic host configuration (UDP 67/68)." },
      { n: "NTP", d: "Network Time Protocol (UDP 123) – time integrity underpins logs and Kerberos." },
      { n: "RDP", d: "Remote Desktop Protocol (TCP/UDP 3389)." },
      { n: "Kerberos", d: "Ticket-based network authentication (TCP/UDP 88)." },
      { n: "SIP", d: "Session Initiation Protocol for VoIP signalling (5060/5061)." },
      { n: "MQTT", d: "Lightweight publish/subscribe messaging for IoT (1883; TLS 8883)." }
    ],
    security: [
      { n: "WAF", d: "Web application firewall – blocks OWASP Top 10 attacks such as SQL injection and XSS at the HTTP layer.", f: "P" },
      { n: "API gateway", d: "Central authentication, authorisation, schema validation and rate limiting for APIs.", f: "P" },
      { n: "IAM · SSO · MFA", d: "Federated identity (SAML, OIDC) with phishing-resistant MFA such as FIDO2/passkeys.", f: "P" },
      { n: "PAM", d: "Privileged access management – credential vaulting, just-in-time elevation, session brokering.", f: "P" },
      { n: "SPF · DKIM · DMARC", d: "Email domain authentication plus secure email gateway filtering against spoofing and phishing.", f: "P" },
      { n: "Protective DNS", d: "Resolver-level blocking of malicious domains (e.g. NCSC PDNS) and DNSSEC validation.", f: "PD" },
      { n: "SWG / CASB", d: "Secure web gateway and cloud access security broker controlling web and SaaS use.", f: "P" },
      { n: "DLP", d: "Data loss prevention – content inspection to detect and stop exfiltration.", f: "PD" },
      { n: "EDR / AV", d: "Endpoint detection and response and anti-malware on hosts running the application.", f: "DR" },
      { n: "SAST · DAST · SCA", d: "Secure development testing: static, dynamic and software composition (dependency) analysis.", f: "P" },
      { n: "RASP", d: "Runtime application self-protection – in-process detection and blocking of attacks.", f: "P" },
      { n: "Secrets vault", d: "Managed storage and rotation of credentials, keys and tokens; removes hard-coded secrets.", f: "P" }
    ]
  },
  {
    n: 6, name: "Presentation", pdu: "Data", colour: "#F07A3E",
    fn: "Translation between application and network formats: encoding, serialisation, compression and encryption.",
    threats: ["TLS downgrade / SSL stripping", "Weak ciphers", "Malicious file formats", "Deserialisation RCE", "Encoding evasion"],
    protocols: [
      { n: "TLS/SSL", d: "Transport Layer Security – commonly mapped to L6 (spans L4–L7). SSL and TLS 1.0/1.1 are deprecated." },
      { n: "MIME", d: "Multipurpose Internet Mail Extensions – content typing and encoding." },
      { n: "ASCII/UTF-8", d: "Character encodings." },
      { n: "EBCDIC", d: "Mainframe character encoding." },
      { n: "JPEG/PNG/GIF", d: "Image formats." },
      { n: "MPEG/MP4", d: "Audio and video formats." },
      { n: "XDR", d: "External Data Representation – used by ONC RPC and NFS.", f: "DR" },
      { n: "ASN.1", d: "Abstract Syntax Notation One (BER/DER) – used by X.509, SNMP and LDAP." },
      { n: "JSON/XML", d: "Structured data serialisation formats." },
      { n: "Base64", d: "Binary-to-text encoding." },
      { n: "gzip", d: "Compression (deflate, gzip, Brotli)." }
    ],
    security: [
      { n: "TLS 1.3 policy", d: "Enforce TLS 1.2+/1.3, strong cipher suites, HSTS; disable SSL and early TLS.", f: "P" },
      { n: "PKI & cert lifecycle", d: "CA hierarchy, automated issuance and renewal (ACME), revocation and certificate transparency monitoring.", f: "P" },
      { n: "S/MIME · PGP", d: "Message-level encryption and digital signatures.", f: "P" },
      { n: "Post-quantum crypto", d: "Migration to ML-KEM / ML-DSA (FIPS 203/204), hybrid key exchange and crypto-agility.", f: "P" },
      { n: "CDR", d: "Content disarm and reconstruction – rebuilds files without active content.", f: "P" },
      { n: "Input canonicalisation", d: "Decode and normalise input before validation to defeat encoding-based bypasses.", f: "P" },
      { n: "Safe deserialisation", d: "Schema validation and type allow-listing to prevent deserialisation attacks.", f: "P" }
    ]
  },
  {
    n: 5, name: "Session", pdu: "Data", colour: "#F2C14E",
    fn: "Establishes, manages, synchronises and terminates dialogues between communicating hosts.",
    threats: ["Session hijacking", "Session fixation", "Replay attacks", "NTLM / SMB relay"],
    protocols: [
      { n: "NetBIOS", d: "NetBIOS session service (TCP 139) – legacy Windows networking." },
      { n: "RPC", d: "Remote procedure call (ONC RPC, DCE/MS-RPC)." },
      { n: "SOCKS", d: "Proxy protocol relaying sessions (TCP 1080)." },
      { n: "PPTP", d: "Point-to-Point Tunnelling Protocol – legacy and cryptographically broken." },
      { n: "L2TP", d: "Layer 2 Tunnelling Protocol – usually paired with IPsec for confidentiality." },
      { n: "H.245", d: "Multimedia call control within the H.323 suite." },
      { n: "SDP", d: "Session Description Protocol – negotiates media sessions for SIP/WebRTC." },
      { n: "RTCP", d: "RTP Control Protocol – session quality and synchronisation." }
    ],
    security: [
      { n: "Secure session tokens", d: "High-entropy session IDs; Secure, HttpOnly and SameSite cookie flags.", f: "P" },
      { n: "Timeouts & re-auth", d: "Idle and absolute timeouts; step-up authentication for sensitive actions.", f: "P" },
      { n: "Mutual TLS", d: "Both parties authenticate with certificates – service-to-service trust.", f: "P" },
      { n: "Anti-replay", d: "Nonces, timestamps and sequence numbers to reject replayed sessions.", f: "P" },
      { n: "SMB/RPC signing", d: "Message signing, SMBv1/NetBIOS disabled, RPC filtering to stop relay attacks.", f: "P" },
      { n: "ZTNA broker", d: "Zero Trust Network Access – per-session, identity and device-posture aware access.", f: "P" },
      { n: "DPoP / token binding", d: "Sender-constrained tokens so stolen tokens cannot be replayed elsewhere.", f: "P" },
      { n: "Session recording", d: "Monitoring and recording of privileged sessions (via PAM).", f: "DR" }
    ]
  },
  {
    n: 4, name: "Transport", pdu: "Segment / Datagram", colour: "#3CC48A",
    fn: "End-to-end delivery between hosts: ports, segmentation, reliability, ordering and flow control.",
    threats: ["SYN flood", "Port scanning", "UDP amplification", "TCP hijack / reset injection"],
    protocols: [
      { n: "TCP", d: "Transmission Control Protocol – connection-oriented, reliable, ordered delivery." },
      { n: "UDP", d: "User Datagram Protocol – connectionless, low-overhead delivery." },
      { n: "QUIC", d: "Encrypted, multiplexed transport over UDP; basis of HTTP/3." },
      { n: "SCTP", d: "Stream Control Transmission Protocol – multi-stream, multi-homed (telecoms signalling)." },
      { n: "DCCP", d: "Datagram Congestion Control Protocol." },
      { n: "MPTCP", d: "Multipath TCP – one connection across several network paths." },
      { n: "SPX", d: "Sequenced Packet Exchange – legacy Novell transport." }
    ],
    security: [
      { n: "Stateful firewall", d: "Tracks connection state; allow-lists permitted ports and flows.", f: "P" },
      { n: "SYN cookies", d: "Resists SYN floods without exhausting connection state.", f: "P" },
      { n: "DDoS & rate limiting", d: "Connection limits and mitigation of protocol and volumetric attacks.", f: "PR" },
      { n: "IDS / IPS", d: "Signature and anomaly detection on flows (typically inspects L3–L7).", f: "DP" },
      { n: "TCP-AO", d: "TCP Authentication Option (RFC 5925) – protects long-lived sessions such as BGP.", f: "P" },
      { n: "Load balancer / proxy", d: "Reverse proxy with TLS termination, connection limits and origin hiding.", f: "P" },
      { n: "Micro-segmentation", d: "Host-based port and service policy restricting east-west traffic.", f: "PR" }
    ]
  },
  {
    n: 3, name: "Network", pdu: "Packet", colour: "#2BB8C8",
    fn: "Logical addressing and routing of packets between networks.",
    threats: ["IP spoofing", "BGP route hijacking", "ICMP floods", "Routing manipulation (MITM)"],
    protocols: [
      { n: "IPv4", d: "Internet Protocol version 4 – 32-bit addressing." },
      { n: "IPv6", d: "Internet Protocol version 6 – 128-bit addressing." },
      { n: "ICMP/ICMPv6", d: "Control and error messaging (ping, traceroute, IPv6 neighbour discovery)." },
      { n: "IGMP", d: "Multicast group membership." },
      { n: "OSPF", d: "Open Shortest Path First – link-state interior routing." },
      { n: "BGP", d: "Border Gateway Protocol – inter-domain routing (carried over TCP 179, charted at L3 for its routing role)." },
      { n: "RIP", d: "Routing Information Protocol – distance-vector routing." },
      { n: "EIGRP", d: "Enhanced Interior Gateway Routing Protocol." },
      { n: "IS-IS", d: "Intermediate System to Intermediate System – link-state routing." },
      { n: "GRE", d: "Generic Routing Encapsulation tunnelling." },
      { n: "IPX", d: "Internetwork Packet Exchange – legacy Novell." }
    ],
    security: [
      { n: "Packet filter / ACLs", d: "Source/destination address allow-listing on routers and firewalls.", f: "P" },
      { n: "IPsec VPN", d: "AH/ESP integrity and encryption for site-to-site and remote access.", f: "P" },
      { n: "Anti-spoofing (uRPF)", d: "Ingress filtering of forged source addresses (BCP 38, unicast RPF).", f: "P" },
      { n: "RPKI / ROV", d: "Route origin validation – cryptographic checking of BGP route origins.", f: "P" },
      { n: "Routing auth", d: "OSPF/BGP/IS-IS HMAC authentication and TTL security (GTSM).", f: "P" },
      { n: "Segmentation (VRF / zones)", d: "Separation of trust zones and routing domains.", f: "PR" },
      { n: "DDoS scrubbing / RTBH", d: "Upstream scrubbing and remote-triggered blackhole routing.", f: "R" },
      { n: "ICMP filtering", d: "Rate-limit and filter ICMP while preserving path MTU discovery.", f: "P" }
    ]
  },
  {
    n: 2, name: "Data Link", pdu: "Frame", colour: "#4A7FE8",
    fn: "Node-to-node delivery across a link: MAC addressing, framing, error detection and switching.",
    threats: ["ARP poisoning", "MAC flooding", "VLAN hopping", "Rogue DHCP", "Evil-twin Wi-Fi", "STP manipulation"],
    protocols: [
      { n: "Ethernet 802.3", d: "IEEE 802.3 framing and MAC addressing." },
      { n: "Wi-Fi 802.11 MAC", d: "Wireless LAN media access control." },
      { n: "ARP", d: "Address Resolution Protocol – maps IPv4 to MAC addresses." },
      { n: "PPP", d: "Point-to-Point Protocol." },
      { n: "802.1Q VLAN", d: "VLAN tagging for logical LAN separation." },
      { n: "STP/RSTP", d: "Spanning Tree – loop prevention in switched networks." },
      { n: "LLDP/CDP", d: "Link-layer neighbour discovery." },
      { n: "LACP", d: "Link aggregation (802.3ad / 802.1AX)." },
      { n: "MPLS", d: "Multiprotocol Label Switching – often described as layer 2.5." },
      { n: "HDLC", d: "High-Level Data Link Control." },
      { n: "Frame Relay", d: "Legacy packet-switched WAN." }
    ],
    security: [
      { n: "802.1X / NAC", d: "Port-based network access control using EAP authentication and device posture.", f: "PR" },
      { n: "MACsec 802.1AE", d: "Hop-by-hop Ethernet encryption and integrity.", f: "P" },
      { n: "Port security", d: "MAC address limiting and sticky MACs to stop MAC flooding.", f: "P" },
      { n: "Dynamic ARP Inspection", d: "Validates ARP against DHCP snooping bindings to block ARP poisoning.", f: "P" },
      { n: "DHCP snooping", d: "Blocks rogue DHCP servers on untrusted ports.", f: "P" },
      { n: "Private VLANs", d: "Host isolation; VLAN hygiene (no VLAN 1 native, DTP disabled) against VLAN hopping.", f: "P" },
      { n: "BPDU / root guard", d: "Protects spanning-tree topology from rogue switches.", f: "P" },
      { n: "RA Guard", d: "Blocks rogue IPv6 router advertisements at the switch port.", f: "P" },
      { n: "WPA3-Enterprise", d: "802.1X / SAE Wi-Fi authentication with modern encryption.", f: "P" },
      { n: "WIPS", d: "Wireless intrusion prevention – rogue AP and evil-twin detection.", f: "D" }
    ]
  },
  {
    n: 1, name: "Physical", pdu: "Bits / Symbols", colour: "#9B6BE8",
    fn: "Transmission of raw bits over a physical medium: cabling, connectors, radio, voltages and timing.",
    threats: ["Wiretapping / fibre tapping", "Theft or damage", "RF jamming", "Compromising emanations", "Rogue hardware implants"],
    protocols: [
      { n: "Ethernet PHY (BASE-T)", d: "Copper Ethernet physical layer (10/100/1000BASE-T and beyond)." },
      { n: "Fibre (BASE-SX/LX)", d: "Optical Ethernet physical layer." },
      { n: "802.11 PHY", d: "Wi-Fi radio (OFDM, 2.4/5/6 GHz)." },
      { n: "Bluetooth PHY", d: "Short-range 2.4 GHz radio." },
      { n: "5G NR", d: "5G New Radio air interface." },
      { n: "DSL", d: "Digital Subscriber Line over copper telephone pairs." },
      { n: "DOCSIS", d: "Data over cable (coaxial) networks." },
      { n: "GPON", d: "Gigabit Passive Optical Network (fibre to the premises)." },
      { n: "SONET/SDH", d: "Synchronous optical transport." },
      { n: "ISDN", d: "Integrated Services Digital Network – legacy." },
      { n: "USB", d: "Universal Serial Bus physical signalling." },
      { n: "RS-232", d: "Serial interface – console and OT/ICS links." }
    ],
    security: [
      { n: "Physical access control", d: "Locks, badges, mantraps and visitor control for comms rooms and data centres.", f: "P" },
      { n: "CCTV & intrusion detection", d: "Monitoring of secure areas and cable routes.", f: "D" },
      { n: "Secure cabling & conduits", d: "Protected distribution systems with inspectable cable runs.", f: "P" },
      { n: "Port blockers & locks", d: "Physically disable unused network and USB ports.", f: "P" },
      { n: "TEMPEST / EMSEC", d: "Emission security – shielding and zoning against compromising emanations.", f: "P" },
      { n: "Fibre-tap detection", d: "Optical power monitoring to detect bending or tapping of fibre.", f: "D" },
      { n: "RF monitoring & anti-jamming", d: "Spectrum monitoring and resilient modulation such as frequency hopping.", f: "D" },
      { n: "Tamper-evident seals", d: "Reveal physical interference with devices and enclosures.", f: "D" },
      { n: "QKD", d: "Quantum key distribution over fibre – NCSC does not currently endorse it for government use; prefer PQC.", f: "P" },
      { n: "Resilient power & diverse routes", d: "UPS, generators and physically diverse paths for availability.", f: "R" }
    ]
  },
  {
    n: 0, name: "Hardware & Firmware", short: "Hardware", pdu: "Silicon & firmware", colour: "#C8A27A",
    fn: "The physical devices, chips and firmware beneath the network stack, and the supply chain that delivers them. Often called 'Layer 0'.",
    threats: ["Firmware implants / bootkits", "Counterfeit or tampered hardware", "DMA attacks", "Compromised BMC", "Supply chain compromise"],
    protocols: [
      { n: "UEFI", d: "Unified Extensible Firmware Interface – the platform boot firmware." },
      { n: "TPM 2.0", d: "Trusted Platform Module – hardware root of trust for keys and measurements." },
      { n: "BMC/Redfish", d: "Baseboard management controller and its REST management API." },
      { n: "IPMI", d: "Legacy out-of-band management protocol – frequently exposed and weak." },
      { n: "CPU microcode", d: "Processor firmware updates, including side-channel mitigations." },
      { n: "NIC firmware", d: "Network interface firmware that sits beneath the physical layer." },
      { n: "PCIe/DMA", d: "Peripheral bus with direct memory access." },
      { n: "JTAG/UART", d: "Hardware debug interfaces." },
      { n: "SPDX/CycloneDX", d: "Software bill of materials (SBOM) formats." }
    ],
    security: [
      { n: "Secure & measured boot", d: "Only signed code boots; measurements recorded in the TPM.", f: "PD" },
      { n: "Hardware root of trust", d: "Immutable trust anchor for keys and boot (TPM, HSM, Caliptra, etc.).", f: "P" },
      { n: "Signed firmware updates", d: "Vendor-signed firmware with controlled, timely patching.", f: "P" },
      { n: "SBOM & supplier assurance", d: "Component transparency and supplier security assurance (NCSC supply chain principles).", f: "P" },
      { n: "Device attestation", d: "Remote verification of device identity and boot state before granting access.", f: "D" },
      { n: "IOMMU / DMA protection", d: "Restricts peripheral memory access (Kernel DMA Protection).", f: "P" },
      { n: "BMC isolation", d: "Out-of-band management on a dedicated, restricted network.", f: "P" },
      { n: "Firmware integrity monitoring", d: "Detects unexpected firmware changes across the estate.", f: "D" },
      { n: "Golden image recovery", d: "Known-good firmware and images to restore compromised devices.", f: "R" },
      { n: "Secure sanitisation", d: "Verified destruction or wiping of media at end of life.", f: "P" }
    ]
  }
];

const CROSS_LAYER = [
  { n: "Zero Trust architecture", d: "Never trust, always verify – policy decisions use identity, device and context at every layer.", f: "P" },
  { n: "SIEM / SOAR", d: "Central log correlation, detection and automated response across all layers.", f: "DR" },
  { n: "NDR", d: "Network detection and response – behavioural analytics on traffic (L2–L7).", f: "D" },
  { n: "XDR", d: "Extended detection and response correlating endpoint, network, identity and cloud telemetry.", f: "DR" },
  { n: "NGFW (L3–L7)", d: "Next-generation firewall combining stateful filtering, application awareness and IPS.", f: "PD" },
  { n: "Threat intelligence", d: "Indicators and adversary TTPs (e.g. MITRE ATT&CK) informing controls at every layer.", f: "D" },
  { n: "Asset & config management", d: "Inventory, hardening baselines and drift detection.", f: "P" },
  { n: "Vulnerability management", d: "Continuous scanning, prioritisation and patching.", f: "P" }
];

/* Animated dataflow scenarios: a malicious packet is stopped on the receiving
   stack by the named control (must match a security item name at that layer). */
const THREATS = [
  { layer: 0, name: "Firmware implant", control: "Secure & measured boot" },
  { layer: 0, name: "Tampered hardware", control: "Device attestation" },
  { layer: 1, name: "Fibre tap", control: "Fibre-tap detection" },
  { layer: 2, name: "ARP spoofing", control: "Dynamic ARP Inspection" },
  { layer: 2, name: "Rogue DHCP offer", control: "DHCP snooping" },
  { layer: 2, name: "Unauthorised device", control: "802.1X / NAC" },
  { layer: 3, name: "Spoofed source IP", control: "Anti-spoofing (uRPF)" },
  { layer: 3, name: "Hijacked BGP route", control: "RPKI / ROV" },
  { layer: 4, name: "SYN flood", control: "SYN cookies" },
  { layer: 4, name: "Port scan", control: "IDS / IPS" },
  { layer: 5, name: "Replayed session", control: "Anti-replay" },
  { layer: 5, name: "Stolen bearer token", control: "DPoP / token binding" },
  { layer: 6, name: "TLS downgrade", control: "TLS 1.3 policy" },
  { layer: 6, name: "Weaponised document", control: "CDR" },
  { layer: 7, name: "SQL injection", control: "WAF" },
  { layer: 7, name: "Credential stuffing", control: "IAM · SSO · MFA" },
  { layer: 7, name: "Malicious domain lookup", control: "Protective DNS" },
  { layer: 7, name: "Malware payload", control: "EDR / AV" },
  { layer: 8, name: "Phishing email", control: "Phish reporting" },
  { layer: 8, name: "MFA-reset social engineering", control: "Helpdesk ID checks" }
];

const BENIGN = ["HTTPS request", "DNS query", "API call", "SMTP message", "SSH session", "LDAP query", "NTP sync", "MQTT telemetry"];
