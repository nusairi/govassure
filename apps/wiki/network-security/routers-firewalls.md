# Routers & Firewalls

Routers and firewalls form the primary enforcement points for network security policy. This page covers on-premises and cloud-native firewall patterns, stateful inspection, and ACL design.

## Firewall generations

| Generation | Capability |
|-----------|-----------|
| Packet filter | Layer 3/4 ACL — source/dest IP, port, protocol |
| Stateful inspection | Tracks connection state; allows return traffic implicitly |
| Application-layer gateway (ALG) | Understands specific application protocols (FTP, SIP, H.323) |
| Next-Generation Firewall (NGFW) | App-ID, user-ID, threat prevention, SSL inspection — see [NGFW](/infrastructure/ngfw) |

## Stateful inspection

A stateful firewall maintains a connection state table. For each TCP connection:
1. SYN packet inspected and rule-matched → entry added to state table
2. Subsequent packets in the flow matched against state table — no full rule evaluation needed
3. FIN/RST or timeout → state entry removed

Benefits: return traffic is implicitly permitted; protects against unsolicited inbound packets.

## ACL design principles

- **Default deny** — explicit deny-all at the end of every ACL
- **Most specific first** — put specific permit/deny entries before general ones
- **Egress filtering** — filter outbound traffic as well as inbound
- **Separate inbound and outbound ACLs** — avoid bidirectional rules that create ambiguity
- **Document every rule** — include the ticket reference and owner in comments
- **Review regularly** — audit ACLs quarterly and remove orphaned rules

```
! Example IOS ACL — internet-facing interface (inbound)
ip access-list extended INET-IN
  remark --- Block RFC1918 sources ---
  deny ip 10.0.0.0 0.255.255.255 any
  deny ip 172.16.0.0 0.15.255.255 any
  deny ip 192.168.0.0 0.0.255.255 any
  remark --- Permit established TCP ---
  permit tcp any any established
  remark --- Permit ICMP unreachable and echo-reply only ---
  permit icmp any any unreachable
  permit icmp any any echo-reply
  remark --- Deny all else ---
  deny ip any any log
```

## On-premises firewall architecture

### Single-tier (flat)

One firewall between internet and internal network. Suitable only for very small environments.

### Two-tier (DMZ)

Firewall 1 (internet → DMZ), Firewall 2 (DMZ → internal). The DMZ hosts internet-facing services; the internal network is protected by a second firewall. The two firewalls should ideally be from different vendors to avoid common vulnerabilities.

### Three-tier (corporate / data centre / restricted)

Adds a restricted zone (e.g., PCI, crown jewels) behind a third firewall tier. Requires explicit policy to reach restricted resources from corporate.

## Cloud firewall patterns

### AWS

- **Security Groups** — stateful, instance-level; default deny inbound
- **Network ACLs** — stateless, subnet-level; evaluated before security groups
- **AWS Network Firewall** — managed stateful inspection + Suricata-compatible IDS/IPS rules
- **AWS WAF** — Layer 7, attached to ALB/CloudFront/API Gateway

### Azure

- **Network Security Groups (NSG)** — stateful, NIC/subnet level; default deny inbound from internet
- **Azure Firewall** — managed, stateful, FQDN filtering, threat intel-based filtering
- **Azure WAF** — attached to Application Gateway or Front Door

### GCP

- **VPC Firewall Rules** — stateful; applied to VM instances by tag or service account
- **Hierarchical Firewall Policies** — organisation/folder-level policies enforced before VPC rules
- **Cloud Armor** — WAF and DDoS protection for load balancers

## Firewall rule lifecycle management

All firewall rules should have:
- **Owner** — team responsible for the rule
- **Business justification** — what the rule enables
- **Review date** — when the rule should be re-evaluated
- **Change ticket reference** — traceability

Tooling: Tufin, AlgoSec, Firemon, or policy-as-code (Terraform + OPA) for automated compliance checking.

## Further reading

- NIST SP 800-41 — Guidelines on Firewalls and Firewall Policy
- CIS Benchmark for Cisco ASA / Palo Alto / Fortinet
- AWS/Azure/GCP security best practices documentation
