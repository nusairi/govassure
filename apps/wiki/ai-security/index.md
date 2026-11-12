# AI Security Management

As organisations embed artificial intelligence into products, operations, and decision-making, security architecture has to extend to a new class of system. AI introduces failure modes that traditional controls were never designed for: models that can be poisoned during training, prompts that can be manipulated at inference, outputs that can leak sensitive data or cause real-world harm, and supply chains built on opaque third-party models and datasets.

This section treats AI security as a management discipline — the governance, risk, and control practices needed to adopt AI safely across an enterprise. It builds on the rest of this wiki rather than replacing it: identity, data protection, zero trust, and monitoring all still apply, but each acquires an AI-specific dimension.

## The three pillars

| Area | What it covers |
|------|----------------|
| [AI Governance & Program Management](./ai-governance-program) | Stakeholders, frameworks, policy, AI asset and data life cycle, program management, and AI incident response |
| [AI Risk Management](./ai-risk-management) | Risk assessment and treatment, the AI threat landscape, testing, and vendor/supply-chain risk |
| [AI Technologies & Controls](./ai-security-controls) | Secure AI architecture, the model life cycle, data controls, privacy and safety controls, and monitoring |

## Why AI needs its own security discipline

Conventional application security assumes deterministic software: the same input yields the same output, and the attack surface is the code and its dependencies. Machine-learning systems break those assumptions. The model's behaviour is learned from data, so the data becomes part of the attack surface. The model is probabilistic, so testing is statistical rather than pass/fail. And increasingly, systems are *agentic* — they take actions, call tools, and chain decisions — which turns a bad output into a bad action.

The practical consequence is that security management has to reach earlier (into data sourcing and model selection) and later (into output monitoring, human oversight, and content safety) than it traditionally did.

## Anchoring frameworks

The guidance in this section is grounded in widely used public references, including:

- **NIST AI Risk Management Framework (AI RMF 1.0)** and its Generative AI Profile.
- **ISO/IEC 42001** (AI management systems) and **ISO/IEC 23894** (AI risk management).
- **OWASP Top 10 for Large Language Model Applications** and the **OWASP Machine Learning Security Top 10**.
- **MITRE ATLAS** — the adversarial threat landscape for AI systems.
- **EU AI Act** — risk-tiered regulatory obligations, including the provider/deployer distinction.

## How this maps to the rest of the wiki

- [Risk & Governance](/risk-governance/) — asset management, supply chain, and assessment frameworks extended to AI.
- [Threat Intelligence](/threat-intelligence/) — including [Frontier AI & AI-Powered Threats](/threat-intelligence/frontier-ai-threats).
- [Analytics & Detection](/analytics/ai-analytics-siem) — using AI in security operations.
- [Foundations](/foundations/) — secure system design and zero trust that underpin AI security architecture.
