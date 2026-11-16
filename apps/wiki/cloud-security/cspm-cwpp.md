# Cloud Security Posture & Workload Protection

As cloud estates grow in scale and complexity, manual security reviews become impractical. Two complementary tooling categories address this: **CSPM** continuously scans the cloud control plane for misconfigurations, and **CWPP** protects the workloads (VMs, containers, serverless) running within it.

## CSPM — Cloud Security Posture Management

CSPM continuously assesses cloud configurations against security best practices and compliance baselines, detecting drift and misconfigurations before they are exploited.

### What CSPM does

| Capability | Description |
|-----------|-------------|
| Configuration assessment | Compares resource configuration against CIS Benchmarks, NCSC, NIST, and vendor best practices |
| Compliance mapping | Maps findings to frameworks (ISO 27001, SOC 2, PCI DSS, UK Cyber Essentials) |
| Drift detection | Alerts when configuration deviates from a known-good baseline |
| Attack path analysis | Identifies chains of misconfigurations that could be combined by an attacker to reach sensitive resources |
| Inventory | Discovers all cloud resources across accounts and regions |
| Remediation guidance | Provides step-by-step fix instructions or auto-remediation playbooks |

### Common misconfigurations CSPM detects

- Public S3 buckets / Azure Storage containers with anonymous read access
- Security groups with unrestricted inbound access (0.0.0.0/0 on SSH, RDP, or all ports)
- MFA not enforced on privileged IAM accounts
- CloudTrail / Azure Activity Log / GCP Cloud Audit Logs disabled or not covering all regions
- Encryption at rest not enabled for databases, volumes, or storage accounts
- Overly permissive IAM policies (wildcard actions or resources)
- Key rotation not configured
- Public snapshots or AMIs

### CSPM tools

| Tool | Notes |
|------|-------|
| **Microsoft Defender for Cloud** | Native to Azure; extended to AWS and GCP via connectors; strong regulatory compliance dashboards |
| **AWS Security Hub** | Aggregates findings from GuardDuty, Inspector, Macie, and third-party tools; CIS and AWS Foundational benchmarks |
| **Google Security Command Center** | GCP-native; asset inventory + threat detection + compliance |
| **Wiz** | Agentless; multi-cloud; strong attack path analysis; widely adopted |
| **Orca Security** | Agentless side-scanning; no agent deployment required |
| **Prisma Cloud (Palo Alto)** | Comprehensive CNAPP including CSPM, CWPP, and code security |
| **Lacework** | Behaviour-based anomaly detection combined with CSPM |

### CSPM in practice

CSPM is most effective when:

1. **All cloud accounts are onboarded** — shadow accounts create blind spots
2. **Findings are prioritised by exploitability and blast radius**, not just CVSS score — a public S3 bucket with PII is higher priority than a theoretical misconfiguration on an internal resource
3. **Policies are enforced via guardrails** (AWS SCPs, Azure Policy, GCP Organisation Policies) to prevent the misconfiguration from being created in the first place
4. **Remediation is tracked** — CSPM findings should flow into a ticketing system or be auto-remediated via Lambda/Function playbooks

---

## CWPP — Cloud Workload Protection Platform

CWPP protects the workloads themselves — virtual machines, containers, and serverless functions — at runtime. Where CSPM watches the control plane (configuration), CWPP watches the data plane (what is running).

### What CWPP does

| Capability | Description |
|-----------|-------------|
| Vulnerability assessment | Scans running workloads for OS and application-layer CVEs |
| Anti-malware / threat detection | Detects malicious files, processes, and behaviour on VMs and containers |
| Runtime behavioural monitoring | Detects anomalous process execution, network connections, and file activity |
| Host IDS/IPS | Intrusion detection/prevention at the workload level |
| File integrity monitoring (FIM) | Alerts on unexpected changes to critical system files or configurations |
| Container runtime security | Enforces policy on container behaviour; detects escapes and privilege escalation |
| Network micro-segmentation | Controls east-west traffic between workloads based on identity/label |
| Compliance scanning | CIS Benchmark compliance at the OS level |

### CWPP and containers

For containerised workloads, CWPP extends to:

- **Image scanning** integrated with registries and CI pipelines (see [Container Security](/network-app-security/container-security))
- **Runtime policy enforcement** — detecting and blocking unexpected syscalls, file writes, or network connections inside containers
- **Kubernetes admission control integration** — blocking non-compliant pod specs at deploy time

### CWPP tools

| Tool | Notes |
|------|-------|
| **Microsoft Defender for Servers / Containers** | Azure-native; extended to hybrid and multi-cloud via Azure Arc |
| **CrowdStrike Falcon Cloud Security** | Cloud-native CWPP; strong threat intelligence integration |
| **Prisma Cloud Compute** | Containers and serverless; tight Kubernetes integration |
| **Aqua Security** | Strong container and serverless focus; full lifecycle |
| **Sysdig** | eBPF-based runtime security; Falco rules engine; Kubernetes-native |
| **Lacework** | Behaviour-based; anomaly detection across workloads |

---

## CNAPP — Cloud Native Application Protection Platform

CNAPP is the convergence of CSPM, CWPP, CIEM (Cloud Infrastructure Entitlement Management), and application security (IaC scanning, SCA) into a single platform. Analysts (Gartner, Forrester) use this term to describe platforms that cover the full cloud security lifecycle from code to cloud.

```
Code / IaC scanning  →  CSPM (posture)  →  CWPP (runtime)
         ↑                                        ↓
    Supply chain                           SIEM / SOAR
```

Leading CNAPP vendors: Wiz, Prisma Cloud, Microsoft Defender for Cloud, CrowdStrike Falcon Cloud Security, Sysdig.

---

## Cloud infrastructure entitlement management (CIEM)

CIEM is a specialised capability (often bundled within CNAPP or CSPM) focused on identifying and right-sizing over-permissive cloud identity entitlements:

- Discovers all IAM users, roles, service accounts, and their effective permissions across cloud accounts
- Identifies unused permissions (permissions granted but never exercised)
- Detects toxic privilege combinations — entitlements that, in combination, enable privilege escalation
- Recommends least-privilege replacements

Examples: Wiz CIEM, Authomize, CrowdStrike Falcon Identity Protection.

---

## Integrating CSPM and CWPP with the security operations centre

For maximum value, CSPM and CWPP findings should flow into the SIEM:

- Aggregate findings across cloud providers into a single pane of glass
- Correlate cloud misconfigurations with active exploitation detected by CWPP runtime alerts
- Feed SOAR playbooks — e.g., automatically isolate a compromised EC2 instance when CWPP detects malware and CSPM confirms the instance has a public IP

Native integrations exist between most CSPM/CWPP platforms and Microsoft Sentinel, Splunk, and Chronicle.

---

## Further reading

- Gartner — Cloud Native Application Protection Platforms (CNAPP) market guide
- CISA — Cloud Security Technical Reference Architecture
- NCSC — 14 Cloud Security Principles
- CIS Benchmarks for AWS, Azure, and GCP
- Microsoft Defender for Cloud documentation
