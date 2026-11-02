# Next-Generation Firewall (NGFW)

A Next-Generation Firewall extends traditional stateful inspection with application identification, user identity awareness, intrusion prevention, and threat intelligence integration. It is the primary enforcement point in modern network security architectures.

## NGFW capabilities

| Capability | Description |
|-----------|-------------|
| **App-ID** | Identifies applications regardless of port (e.g., Zoom on port 443) |
| **User-ID** | Maps IP addresses to user identities via AD/LDAP/RADIUS |
| **Content-ID / IPS** | Inline threat prevention: exploits, malware, C2 |
| **SSL inspection** | Decrypts TLS to enable App-ID and threat prevention on encrypted traffic |
| **URL filtering** | Categorises and controls web destinations |
| **DNS security** | Blocks DNS queries to malicious domains; detects tunnelling |
| **Wildfire / sandbox** | Submits unknown files for cloud-based detonation and analysis |
| **Threat intelligence** | Blocks known-bad IPs, domains, and file hashes in real time |

## On-premises NGFW architecture

### Perimeter deployment

The NGFW sits at the internet edge, replacing or supplementing a traditional stateful firewall:

```
Internet → ISP Router → NGFW (perimeter) → Core Switch → Internal zones
```

The perimeter NGFW enforces:
- Inbound policy: block all unexplicit inbound; allow only published services
- Outbound policy: App-ID and URL filtering; SSL inspection for egress
- Threat prevention on all internet-facing traffic

### Internal segmentation firewall (ISFW)

A second NGFW (or a virtualised instance) enforces east-west policy between internal zones:

```
User VLAN ←→ [ISFW] ←→ Server VLAN ←→ [ISFW] ←→ Restricted VLAN
```

The ISFW provides:
- Micro-segmentation enforcement at the network layer
- Lateral movement detection and prevention
- East-west threat prevention (ransomware, C2)

### HA and performance sizing

- Deploy in **Active/Passive** or **Active/Active** HA pair for redundancy
- Size for **threat prevention throughput** (not just firewall throughput) — IPS/SSL decryption reduces throughput significantly
- Use dedicated management interfaces on an out-of-band management VLAN

## Cloud-native NGFW patterns

### Cloud-hosted NGFW (VM-series)

Deploy a virtualised NGFW instance (Palo Alto VM-Series, Fortinet FortiGate-VM, Check Point CloudGuard) in the cloud VPC/VNet:

```
Internet Gateway → [NGFW VM] → Application subnets
```

Traffic is routed through the NGFW via routing tables or transit gateway inspection.

### Cloud-managed NGFW services

Cloud providers offer managed NGFW services:

- **AWS Network Firewall** — managed stateful inspection with Suricata-compatible rules; scales automatically
- **Azure Firewall Premium** — IDPS, TLS inspection, URL filtering, threat intelligence; autoscales
- **GCP Cloud Next Generation Firewall** — layer 7 inspection with Palo Alto threat prevention integration

These services remove the operational burden of managing NGFW infrastructure but offer less flexibility than self-managed appliances.

### Centralised inspection with Transit Gateway (AWS)

For multi-VPC environments, route inter-VPC and internet traffic through a centralised inspection VPC:

```
VPC A ─┐
VPC B ─┤─ Transit Gateway ─→ Inspection VPC (NGFW) ─→ Internet
VPC C ─┘
```

This model provides a single inspection point for all east-west and north-south traffic in AWS.

## Policy design principles

- **Least-privilege application policy** — permit specific applications, not all on a port
- **User-based policy** — tie policy to user groups from Active Directory (not just IPs)
- **Log everything, deny everything not permitted** — default deny with full logging
- **Review rules quarterly** — remove unused rules; document every rule's business justification
- **Separate security profiles** — define threat, URL, AV, and DNS profiles and attach to policies

## Vendors

| Vendor | Platform |
|--------|---------|
| Palo Alto Networks | PA-Series (hardware), VM-Series (virtual), Prisma Cloud NGFW |
| Fortinet | FortiGate (hardware + VM) |
| Check Point | Quantum (hardware), CloudGuard (cloud) |
| Cisco | Firepower (FTD) |
| Juniper | SRX Series |

## Further reading

- Palo Alto Networks NGFW Architecture Guide
- NIST SP 800-41 — Guidelines on Firewalls
- NSS Labs / CyberRatings NGFW test reports
- AWS Network Firewall Developer Guide
- Azure Firewall documentation
