# AI Governance & Program Management

Governance is the foundation of AI security: it establishes who is accountable for AI, what rules apply, how AI assets and data are managed across their life cycle, how the security program is run, and how incidents are handled. Without it, AI controls become inconsistent point-solutions that fail under scrutiny — from regulators, from customers, and from adversaries.

## Stakeholders, frameworks, and regulatory context

Effective AI governance starts by placing accountability within the existing organisational structure rather than inventing a parallel one. In practice this means:

- **Roles and responsibilities** spanning business owners, security, data science/ML engineering, legal, privacy, and risk — with clear ownership for each AI system.
- **A mandate and a cross-functional body** (often an AI governance or steering committee) with a charter that gives it authority to set direction and arbitrate trade-offs.
- **Stakeholder identification**, covering both internal parties (executives, developers, risk, legal) and external ones (regulators, customers, and vendors).
- **A defined risk appetite and tolerance** for AI, so downstream decisions have a consistent yardstick.

Frameworks and regulation give this structure its content. The **NIST AI RMF**, **ISO/IEC 42001**, and **ISO/IEC 23894** provide management-system and risk scaffolding, while the **EU AI Act** and sector-specific rules impose obligations that vary by use case and jurisdiction. Selecting the right combination is itself a governance decision — matched to the organisation's sector, regulatory exposure, and maturity — and grounded in the concrete **business use cases** for AI and the **privacy considerations** they trigger.

## Strategy, policy, and procedure

Governance intent has to become documented direction:

- **AI strategy** aligns adoption with business objectives and the security posture. Two recurring decisions shape it: **consumer vs. enterprise** AI (public tools carry very different data-exposure risk than enterprise-controlled systems) and **buy vs. build** (procuring a model shifts risk and accountability differently than developing one in-house).
- **AI policy** typically splits into *responsible use* (ethical, lawful, fair) and *acceptable use* (what staff may and may not do with AI tools).
- **AI procedures** operationalise the policy through implementation steps, working manuals, and embedded ethical guardrails.

## AI asset and data life cycle management

You cannot secure what you cannot see. AI governance depends on knowing which models, datasets, and AI services exist and protecting them from creation through destruction:

- **Inventory** of models and data, maintained as a living register. **Model cards** document each model's purpose, training data, performance, and limitations.
- **Data handling, classification, and discovery** — identifying and labelling the data AI uses according to its sensitivity.
- **Data augmentation and cleaning** to protect the integrity of training and input data.
- **Secure storage, data protection** (encryption, masking, access control), and **secure destruction** at end of life.

## AI security program development and management

AI security should run as a managed program that is *aligned to*, not siloed from, the existing information security function:

- A **documented program plan** with objectives and scope, and a team whose **roles, responsibilities, and proficiencies** are defined.
- **Alignment to the existing ISMS**, so AI security reuses established processes rather than duplicating them.
- Deliberate, risk-aware **use of AI-enabled security tools** within the program.
- **Metrics and management reporting** — key risk indicators (KRIs) and key performance indicators (KPIs) that let leadership understand AI security posture.

## Business continuity and AI incident response

AI systems fail in distinctive ways — model compromise, harmful or manipulated output, data leakage — so response and continuity planning need AI-specific treatment:

- **Detection, notification, and classification** of AI incidents, prioritised by criticality and severity.
- **AI-specific incident response playbooks**, plus **break-glass / go–no-go** controls and a defined **authority** to invoke them. A **"red-button"** capability to halt an AI system quickly can be a compliance requirement.
- **Resilience and business continuity** so essential functions survive when AI is degraded, with **recovery objectives (RTO/RPO)** adapted to AI systems and data.
- **Disaster recovery and regular testing** to confirm the plans actually work.

## Related pages

- [AI Risk Management](./ai-risk-management)
- [AI Technologies & Controls](./ai-security-controls)
- [Risk & Governance](/risk-governance/) · [Asset Management](/risk-governance/asset-management)

## References

- NIST AI Risk Management Framework (AI RMF 1.0)
- ISO/IEC 42001 — AI management systems
- EU AI Act
