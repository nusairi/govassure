# Macro, Micro & Identity-Based Segmentation

Segmentation reduces attack surface and limits lateral movement. The level of segmentation granularity — macro, micro, or identity-based — should match the asset sensitivity and operational model.

## Macro-segmentation

Macro-segmentation divides the network into large zones separated by firewalls or ACLs. This is traditional perimeter-plus-DMZ architecture:

- Internet zone
- DMZ (public-facing services)
- Corporate / user zone
- Server zone
- Management zone (OOB)
- Restricted / PCI zone

**Strength:** Relatively simple to operate; well-understood by most teams.
**Weakness:** Wide blast radius within each zone; east-west traffic within zones is not inspected.

## Micro-segmentation

Micro-segmentation applies policy at the workload or application level — typically at the hypervisor, container, or host-based firewall level — rather than at a physical network boundary.

### How it works

- Policies defined by workload identity (VM tag, pod label, security group) rather than IP address
- Enforced by a distributed firewall at the hypervisor layer (e.g., VMware NSX-T, AWS Security Groups)
- East-west traffic is inspected and controlled between every workload pair
- New workloads inherit policy automatically based on their identity/tag

### Micro-segmentation use cases

- **Crown jewel isolation** — database tier can only be reached from the application tier, not from workstations
- **PCI scope reduction** — cardholder data environment (CDE) is micro-segmented from all other workloads
- **Ransomware containment** — lateral movement via SMB/RDP is blocked between workstations

### Key vendors / platforms

- VMware NSX-T Distributed Firewall
- Illumio Core
- Guardicore (Akamai)
- AWS Security Groups (per-instance micro-segmentation in VPC)
- Kubernetes NetworkPolicy

## Identity-based segmentation

Identity-based segmentation replaces IP-based policy with user/device identity as the control plane. Policy says "this user on this device class can access this application" rather than "this IP subnet can reach this subnet."

### Components

- **Identity Provider (IdP)** — authenticates users and issues identity tokens
- **MDM / EDR** — provides device health and compliance posture signals
- **Policy Engine** — evaluates identity + device + context against policy
- **Enforcement Point** — gateway, proxy, or firewall enforces the decision

This is the core of Zero Trust Network Access (ZTNA) — see [VPNs, ZTNA & SASE](/network-app-security/vpn-ztna-sase).

### Benefits over IP-based policy

- Policies follow the user regardless of network location (on-prem, remote, cloud)
- No need to re-engineer ACLs when users move or subnets change
- Context-aware policy (time of day, device posture, location) is straightforward to express

## Choosing the right level

| Scenario | Recommended approach |
|----------|---------------------|
| Legacy on-premises, limited virtualisation | Macro-segmentation with VLAN boundaries |
| VMware or cloud-native environment | Micro-segmentation (NSX-T, Security Groups) |
| Remote workforce, SaaS-heavy | Identity-based segmentation (ZTNA) |
| High-security / compliance requirement | All three — layered |

## Further reading

- VMware NSX-T Micro-Segmentation Design Guide
- Illumio Zero Trust Segmentation whitepaper
- NIST SP 800-207 — Zero Trust Architecture
- [Network vs Access Segmentation](./network-access-segmentation)
