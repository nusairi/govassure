# AI Technologies & Controls

Where governance sets the rules and risk management decides what to worry about, this page is about the hands-on security engineering of AI: designing secure AI architecture, securing the model life cycle, controlling data, embedding privacy and safety, and running the control and monitoring program that keeps it all assured.

## Secure AI architecture and design

AI systems should be secure by design and integrated deliberately into enterprise architecture:

- **Secure development life cycle (SDL)** applied to AI, with **change management** over models, data, and infrastructure.
- **Securing infrastructure as code**, so the environments that provision AI are hardened by default.
- **Mapping and securing data flows** through AI pipelines.
- **Approved base models** — governing which foundation models may be used, and under what conditions.
- **Interconnectivity** — securing how AI systems integrate with, and are reachable from, the rest of the enterprise estate.

## Securing the model life cycle

Models need security and assurance across selection, training, validation, and deployment:

- **Model testing and evaluation** — measuring accuracy, reliability, and security behaviour.
- **Interconnectivity and linkages** — validating how models interact with each other and with systems, since one model's output often becomes another's input.
- **Regression and progression control** — ensuring changes don't reintroduce prior faults or degrade performance, and promoting models through environments in a controlled way.
- **TEVV (Testing, Evaluation, Verification, and Validation)** — the structured assurance discipline that underpins trustworthy AI.

## Data management controls

Because a model's behaviour is learned from data, the data is part of the attack surface and part of the control surface:

- **Data collection and control** — governing how data is gathered, with access, integrity, and provenance controls.
- **Data poisoning defences** — protecting against malicious manipulation of training data.
- **Bias and accuracy** — detecting and mitigating bias, and maintaining data quality that supports correct behaviour.
- **Data positioning requirements** — constraints on where and how data is held, including residency.

## Privacy, ethical, trust, and safety controls

These controls keep AI lawful, ethical, transparent, and safe to use:

- **Explainability and transparency** — making decisions interpretable, and disclosing where and how AI is used.
- **Privacy controls** — honouring data subject rights (including the right to be forgotten), lawful **consent**, and **data minimisation and anonymisation**.
- **Fairness and ethics** — preventing discriminatory outcomes and operationalising ethical principles.
- **Human oversight** — meaningful **human-in-the-loop** review, especially over **automated decision making**.
- **Trust and safety** — content moderation of AI output, assessment of **potential harm**, and consideration of **environmental impact**.

## Security controls and monitoring

Finally, controls have to be selected, implemented, and continuously assured:

- **Selecting and implementing the right controls**, matched to assessed AI risk, and mapping **threats to controls** so coverage is demonstrable.
- **Control self-assessment (CSA)** and a managed **control life cycle**, so controls stay effective as systems and threats evolve.
- **Continuous monitoring** with defined **security monitoring metrics**, and KPIs/KRIs that measure both control effectiveness and residual risk.
- **Security awareness training** that builds AI-specific awareness across the workforce.

## Related pages

- [AI Governance & Program Management](./ai-governance-program)
- [AI Risk Management](./ai-risk-management)
- [Secure System Design](/foundations/secure-system-design) · [Application Security Testing](/network-app-security/application-security-testing)
- [Data Security](/data-security/) · [Analytics & Detection](/analytics/)

## References

- NIST AI RMF — Generative AI Profile
- OWASP Machine Learning Security Top 10
- ISO/IEC 42001 — AI management systems
