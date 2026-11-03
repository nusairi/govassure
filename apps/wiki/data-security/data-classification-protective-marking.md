# Data Classification & Protective Marking

Data classification assigns a sensitivity label to information, driving appropriate handling, storage, access controls, and transmission rules. In government environments, this is formalised as a **protective marking scheme**; commercial organisations apply equivalent classification policies under frameworks such as ISO/IEC 27001 and data protection legislation.

## Why classify?

Not all data carries the same risk if disclosed or tampered with. Classification enables proportionate security: applying strong controls to sensitive data without burdening every system with maximum security requirements. It also provides the language for policies, contracts, and legal obligations — "encrypt all SECRET-equivalent data at rest" is actionable; "secure sensitive data" is not.

---

## UK Government Security Classifications (GSC)

The UK Government Protective Marking Scheme (GPMS) was replaced in 2014 by the Government Security Classifications (GSC), which applies across His Majesty's Government (HMG).

### Classification tiers

| Tier | Description | Handling examples |
|------|-------------|-------------------|
| **OFFICIAL** | The majority of public sector information. Loss or compromise could have limited damaging effects. | Standard IT systems; email; shared drives |
| **OFFICIAL-SENSITIVE** | A subset of OFFICIAL where additional handling constraints apply due to the sensitivity of the content. Not a separate tier — it is a caveat applied to OFFICIAL material. | Restricted distribution; care in storage and transmission |
| **SECRET** | Very sensitive material requiring a high degree of protection. Compromise could seriously damage HMG interests or individual safety. | Accredited systems; need-to-know access; encryption in transit and at rest |
| **TOP SECRET** | The most sensitive material. Compromise could cause exceptionally grave damage. | Highest assurance systems; very strict need-to-know; physical security controls |

### OFFICIAL-SENSITIVE caveats

OFFICIAL-SENSITIVE can carry additional caveats indicating the specific sensitivity:

| Caveat | Meaning |
|--------|---------|
| OFFICIAL-SENSITIVE | General heightened sensitivity |
| OFFICIAL-SENSITIVE: COMMERCIAL | Commercial contracts; procurement; market-sensitive information |
| OFFICIAL-SENSITIVE: LOCSEN | Location-sensitive (e.g., operational locations of personnel) |
| OFFICIAL-SENSITIVE: PERSONAL | Personal data warranting heightened care beyond standard GDPR requirements |

> **Note:** OFFICIAL-SENSITIVE is a handling instruction, not a separate classification tier. Documents are classified OFFICIAL and marked OFFICIAL-SENSITIVE.

### Key principles

- **Need to know** — access is granted only to those who require information to perform their role, regardless of clearance level
- **Minimum necessary** — share and store only what is needed; do not aggregate OFFICIAL data in ways that create SECRET-equivalent risk
- **Aggregation risk** — combining multiple OFFICIAL datasets can create a collection warranting higher protection

---

## Commercial data classification

Commercial organisations typically implement a four-tier classification, aligned with ISO/IEC 27001 Annex A and data protection obligations:

| Label | Typical description |
|-------|-------------------|
| **Public** | Approved for public release; no controls required |
| **Internal / Internal Use Only** | Not for external release; normal handling within the organisation |
| **Confidential** | Business-sensitive; limited distribution; access controlled by role |
| **Restricted / Highly Confidential** | Highest sensitivity; strict need-to-know; encryption mandatory |

Specific data types that commonly escalate classification include: personally identifiable information (PII), payment card data (PCI DSS scope), protected health information (PHI), trade secrets, M&A information, and legal-privilege material.

---

## Implementing a classification scheme

### Labelling

Labels must be visible to users making handling decisions:

- **Documents** — header/footer marking; metadata properties
- **Email** — subject-line prefix or email header (e.g., `[OFFICIAL-SENSITIVE]`); Microsoft Purview sensitivity labels enforce this automatically
- **Physical documents** — printed marking on every page
- **Removable media** — physical label; encrypted media with classification recorded

### Technical controls by classification

| Control | OFFICIAL | OFFICIAL-SENSITIVE | SECRET |
|---------|----------|--------------------|--------|
| Encryption at rest | Recommended | Required | Required (FIPS 140-2 / NCSC approved) |
| Encryption in transit | TLS 1.2+ | TLS 1.3 preferred | NCSC-approved cryptography |
| Access control | Role-based | Need-to-know + role | Need-to-know; strict approval |
| Logging | Standard audit | Enhanced audit | Full audit trail; regular review |
| Physical media | Standard | Encrypted device | Approved encrypted device |

### Microsoft Purview sensitivity labels

Purview (formerly MIP — Microsoft Information Protection) integrates classification directly into Microsoft 365:

- Labels applied in Word, Excel, PowerPoint, Outlook, Teams
- Labels persist with documents when shared externally
- Policy enforcement: encryption, rights management, watermarking, header/footer injection
- Auto-labelling: ML-based detection of sensitive content applies labels automatically
- Integration with DLP policies — labelled content triggers data loss prevention controls

### Other tooling

- **Titus** — enterprise labelling; integrates with non-Microsoft environments
- **Boldon James** — metadata-driven classification; widely used in government and defence
- **Varonis** — data discovery, classification, and access governance

---

## Data discovery and inventory

Before you can classify data, you need to know where it is. Data discovery tools scan repositories, file shares, databases, and cloud storage to identify sensitive content:

- **Microsoft Purview Data Map** — scans Azure and on-premises sources; auto-classifies using built-in sensitive information types
- **Varonis** — on-premises and cloud data discovery with access governance
- **BigID / Spirion** — privacy-focused discovery; strong PII and regulated data detection

---

## Classification and data protection law

Under UK GDPR and the Data Protection Act 2018, personal data must be processed lawfully, fairly, and securely. A robust classification scheme supports compliance by:

- Identifying personal data and special category data requiring enhanced controls
- Driving appropriate retention periods and deletion procedures
- Enabling accurate Records of Processing Activities (RoPA)
- Supporting Data Protection Impact Assessments (DPIAs) for high-risk processing

Special category data (health, biometrics, ethnicity, religion, political opinions, etc.) and criminal offence data require the highest level of protection and explicit legal basis for processing.

---

## Further reading

- HMG Government Security Classifications Policy (Cabinet Office)
- NCSC — Secure Email guidance (for OFFICIAL classification)
- ISO/IEC 27001:2022 Annex A, Control 5.12 — Classification of information
- Microsoft Purview sensitivity labels documentation
- ICO guidance on data protection by design and default
