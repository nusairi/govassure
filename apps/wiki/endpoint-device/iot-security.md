# IoT Security

Internet of Things (IoT) devices — building management systems, cameras, printers, industrial sensors, smart TVs, medical devices — introduce significant security risks. They are frequently unmanaged, difficult to patch, and have weak default security postures.

## Why IoT is a security challenge

- **Heterogeneous and unmanaged** — thousands of device types from hundreds of vendors; no standard management plane
- **Long lifespans** — IoT devices are often deployed for 10–20 years; vendor support and patching ends long before end-of-life
- **Weak defaults** — default credentials, open services, no encryption are common
- **Limited compute** — many IoT devices cannot run endpoint agents or support modern TLS
- **Large attack surface** — Shodan regularly finds internet-exposed cameras, PLCs, and building systems

## UK regulatory context

The **Product Security and Telecommunications Infrastructure (PSTI) Act 2022** (effective April 2024) requires manufacturers selling IoT devices in the UK to:
- Prohibit universal default passwords
- Publish a vulnerability disclosure policy
- State the minimum period of security updates

This is a baseline — enterprise security controls must go further.

## IoT security principles

### Network isolation — the most important control

IoT devices should **never** be on the same network as corporate workstations or servers. Use dedicated VLANs and firewall all IoT traffic:

```
IoT VLAN (e.g., VLAN 60)
  │
  ├─ Permit: IoT → controller/management system (specific ports only)
  ├─ Permit: IoT → internet (if required, via proxy)
  ├─ Deny:   IoT → Corporate VLAN
  └─ Deny:   IoT → Server VLAN
```

Use Private VLANs (PVLANs) to prevent IoT devices communicating with each other — see [VLANs & PVLANs](/network-security/vlans-pvlans).

### Change default credentials

The single most impactful control: change all default usernames and passwords before deployment. Store in a PAM credential vault.

### Patch and firmware management

- Maintain a firmware inventory for all IoT devices
- Subscribe to vendor security advisories
- Apply firmware updates within your patch SLA
- For devices that cannot be patched: compensating controls (VLAN isolation, firewall ACLs, IPS signatures)

### Disable unnecessary services

- Disable Telnet (use SSH if CLI access is required)
- Disable HTTP (use HTTPS)
- Disable UPnP (enables automatic firewall bypass)
- Disable unused protocols (FTP, SNMP v1/v2c, mDNS/Bonjour where not needed)

### IoT device inventory

You cannot protect what you cannot see:
- Passive network discovery (nmap, Rumble/runZero) to find IoT devices on the network
- Maintain a CMDB entry for every IoT device: make, model, firmware version, owner, location, VLAN, last seen
- Alert on new devices appearing on IoT VLANs (detect unauthorised additions)

## IoT threat landscape

| Threat | Description |
|--------|-------------|
| Credential abuse | Default/weak credentials exploited for access or botnet enrolment |
| Firmware vulnerabilities | Unpatched CVEs exploited remotely |
| Network pivoting | Compromised IoT used to attack other network segments |
| Botnet enrolment | Mirai and variants conscript IoT into DDoS botnets |
| Physical tampering | Devices in accessible locations (car parks, lobbies) can be physically attacked |
| Supply chain | Compromised firmware from manufacturer or in-transit |

## IoT security architecture

For high-risk IoT (medical devices, OT, physical security systems):

- **Dedicated IoT network segment** with dedicated internet breakout (do not share with corporate)
- **IoT Security Gateway / NAC** — network access control that profiles devices and applies per-device policy (Cisco ISE, Forescout, Claroty)
- **IoT-aware IDS/IPS** — signatures for IoT-specific protocols (MQTT, CoAP, Modbus, BACnet)
- **Traffic baselining** — alert on unexpected communication patterns from IoT devices
- **Regular penetration testing** of IoT devices and their management interfaces

## Further reading

- NCSC IoT security guidance — [ncsc.gov.uk/internet-of-things](https://www.ncsc.gov.uk/section/advice-guidance/all-topics/internet-of-things)
- ETSI EN 303 645 — Cyber Security for Consumer IoT
- NIST SP 800-213 — IoT Device Cybersecurity Guidance
- UK PSTI Act 2022 guidance
