# Hardening Hybrid Infrastructure

Hybrid infrastructure spans on-premises data centres, private cloud, and one or more public cloud environments. Each tier has distinct hardening requirements, and the hybrid model introduces additional attack surface at the connectivity layer.

## On-premises hardening

### OS hardening

Apply CIS Benchmarks for all server operating systems:

- **Disable unused services** — run only what is required
- **Remove unnecessary packages** — reduce attack surface
- **Configure host-based firewall** — iptables/nftables (Linux), Windows Firewall
- **Enable auditing** — auditd (Linux), Windows Event Auditing
- **Enforce strong authentication** — disable root SSH login; require key-based auth
- **Apply STIG or CIS Level 2** for high-security systems

```bash
# Example: disable root SSH login (Linux)
sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd
```

### Patch management

- Maintain a patch SLA: Critical (CVSS ≥9.0) within 24–72 hours; High (7.0–8.9) within 7 days; Medium within 30 days
- Use automated patch management tooling: WSUS/SCCM for Windows, Ansible/Satellite for Linux
- Test patches in non-production before production rollout
- Track and report patch compliance to management

### Privileged access hardening

- **Privileged Access Workstations (PAWs)** — dedicated, hardened devices for admin tasks
- **Jump servers / bastion hosts** — single, audited ingress point to management networks
- **Just-In-Time (JIT) access** — elevate privileges only when needed, for a limited time window
- **Session recording** — all privileged sessions recorded for audit

## Cloud hardening

### AWS hardening

- Enable **CloudTrail** in all regions with log file integrity validation
- Enable **AWS Config** with conformance packs (CIS AWS Foundations)
- Enable **GuardDuty** for threat detection
- Use **AWS Organizations SCPs** to enforce guardrails (deny public S3 buckets, require MFA, restrict regions)
- Require **IMDSv2** on all EC2 instances (prevents SSRF-based metadata access)
- Enable **S3 Block Public Access** at the organisation level

### Azure hardening

- Enable **Microsoft Defender for Cloud** (previously Security Center) with all plans
- Apply **Azure Policy** initiatives (CIS Benchmark, Azure Security Benchmark)
- Enable **Azure Defender** for servers, SQL, Storage, Key Vault
- Use **Privileged Identity Management (PIM)** for JIT role activation
- Enable **diagnostic settings** on all resources, forward to a central Log Analytics workspace

### GCP hardening

- Enable **Security Command Center** (SCC) Premium tier
- Apply **Organisation Policy constraints** (require OS Login, restrict public IPs, enforce uniform bucket-level access)
- Enable **VPC Service Controls** for API perimeters around sensitive services
- Use **Cloud Audit Logs** (data access logs enabled for sensitive APIs)

## Hybrid connectivity security

### Site-to-site VPN

When connecting on-premises to cloud via IPsec VPN:
- Use **IKEv2** with AES-256-GCM and SHA-256
- Require **certificate-based authentication** (PSK is acceptable for test but not production)
- Implement **DPD (Dead Peer Detection)** for failover
- Audit VPN policy quarterly — remove unused peers and obsolete ciphers

### Private connectivity (ExpressRoute / Direct Connect / Cloud Interconnect)

Dedicated private circuits offer lower latency and higher bandwidth than internet VPN, with no traffic traversing the public internet:
- **AWS Direct Connect** — dedicated 1G/10G/100G circuit to AWS
- **Azure ExpressRoute** — private peering or Microsoft peering
- **GCP Cloud Interconnect** — Dedicated or Partner interconnect

Even with private circuits, apply route filtering, BGP authentication, and MACsec (Layer 2 encryption) where supported.

### Network security at the hybrid boundary

- Place a **firewall** at the on-premises side of all cloud connectivity
- Apply **egress filtering** to cloud-destined traffic from on-premises
- Log and monitor all cross-environment traffic flows
- Separate development/test cloud environments from production via separate circuits or VPN tunnels with different routing tables

## Immutable infrastructure

Treat servers and containers as **cattle, not pets**:
- Deploy from known-good, hardened images (golden AMIs, base container images)
- Disable SSH/RDP to production workloads where possible — use Systems Manager Session Manager (AWS) or equivalent
- Rebuild rather than patch running instances where the platform supports it
- Use infrastructure-as-code (Terraform, CloudFormation, Bicep) — configuration in code is auditable and repeatable

## Further reading

- CIS Benchmarks for AWS, Azure, GCP
- AWS Security Best Practices whitepaper
- Azure Security Benchmark v3
- NIST SP 800-123 — Guide to General Server Security
- DISA STIGs for Linux / Windows Server
