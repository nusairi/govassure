# Data-Centric Security

Data-centric security focuses on protecting data regardless of its location — at rest, in transit, or in use. It begins with understanding what data exists and ends with controls that follow data wherever it goes.

## Data discovery and classification

You cannot protect what you cannot see. Discovery is the foundation.

### Classification tiers

A typical four-tier classification scheme:

| Tier | Label | Description | Example |
|------|-------|-------------|---------|
| 1 | Public | No harm if disclosed | Marketing materials |
| 2 | Internal | Limited to employees | Internal policies |
| 3 | Confidential | Business harm if disclosed | Financial projections, PII |
| 4 | Restricted | Serious harm if disclosed | Payment data, health records, IP |

### Discovery tooling

- **Microsoft Purview (formerly AIP)** — auto-classifies Office 365 content
- **Varonis** — discovers and classifies unstructured data on file shares and cloud storage
- **Macie (AWS)** — discovers and classifies sensitive data in S3
- **BigID** — multi-cloud data discovery and classification

## Encryption at rest

All data classified Confidential or above must be encrypted at rest.

### Key management

Encryption is only as strong as the key management:
- **Hardware Security Modules (HSMs)** — keys never leave hardware
- **AWS KMS / Azure Key Vault / GCP Cloud KMS** — managed key storage; customer-managed keys (CMK) for sensitive data
- **Key rotation** — rotate encryption keys annually (or more frequently for high-sensitivity data)
- **Key separation** — encryption keys and encrypted data must not be stored together

### Storage encryption

- **Full-disk encryption** — BitLocker (Windows), LUKS (Linux), FileVault (macOS)
- **Database TDE** — Transparent Data Encryption on MSSQL, Oracle, MySQL, PostgreSQL
- **Object storage** — SSE-S3 / SSE-KMS (AWS), CMEK (GCP), SSE with Azure Key Vault
- **Backup encryption** — encrypted backups with keys stored separately from backup media

## Data Loss Prevention (DLP)

DLP controls detect and prevent the unauthorised exfiltration of sensitive data.

### DLP inspection points

| Channel | DLP control |
|---------|-------------|
| Email | Email gateway DLP (Proofpoint, Mimecast, M365 Purview DLP) |
| Web (HTTP/S) | Proxy-based DLP; content inspection on POST requests |
| Cloud storage | CASB DLP (Netskope, Zscaler, Microsoft Defender for Cloud Apps) |
| Endpoint | Endpoint DLP agent (Microsoft Purview, Symantec DLP, Forcepoint) |
| Printing/USB | Endpoint DLP — block or log print/removable media |

### DLP policy design

- Start with **monitoring mode** — understand normal patterns before blocking
- Focus first on **Restricted / PCI / HIPAA** data — high-impact, well-defined patterns
- Use **exact data matching (EDM)** for structured data (credit card numbers, NHS numbers)
- Use **document fingerprinting** for unstructured data (contract templates, source code)
- Review false positives weekly in the initial deployment phase

## Data residency and sovereignty

For regulated industries and public sector:
- Identify where data is stored (region/country)
- Enforce storage restrictions via cloud organisation policies (AWS SCPs, Azure Policy, GCP Org Policy)
- Audit data residency quarterly — cloud misconfigurations can move data unexpectedly

## Further reading

- NIST SP 800-188 — De-Identification of Government Datasets
- GDPR Article 25 — Data protection by design and by default
- ISO/IEC 27701 — Privacy Information Management
- Microsoft Purview Data Governance documentation
