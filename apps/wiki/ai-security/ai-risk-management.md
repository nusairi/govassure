# AI Risk Management

AI risk management is the discipline of identifying, measuring, and treating the risks that come with enterprise-wide AI adoption — including a threat landscape that traditional application security never had to consider, and a supply chain whose accountability lines are genuinely hard to draw.

## Risk assessment, thresholds, and treatment

AI risk assessment extends familiar practice with AI-specific instruments:

- **Impact assessment** — evaluating the potential consequences of an AI system on the organisation, on individuals, and on society. Where personal data is involved, this includes **privacy impact assessments (PIAs)**.
- **Conformity assessment** — checking an AI system against applicable regulatory and standards requirements (a central mechanism in the EU AI Act for higher-risk systems).
- **Risk documentation** — recording identified risks, the assessments behind them, and the decisions taken.
- **Thresholds** — defining acceptable levels of risk, aligned to the enterprise risk appetite set during governance.
- **Treatment plans** — deciding to mitigate, transfer, accept, or avoid each risk, and tracking exposure with KRIs and KPIs over time.

## The AI threat landscape and vulnerability management

AI systems introduce a class of vulnerabilities that live in the model and its data, not just the code. Managing them combines testing with an up-to-date view of adversary behaviour:

- **Testing** — penetration testing of the surrounding infrastructure, vulnerability testing of models and pipelines, and **red teaming** aimed at model-level and prompt-level attacks.
- **AI-specific vulnerabilities** — prompt injection, model inversion, membership inference, model evasion, and training-data extraction. The **OWASP Top 10 for LLM Applications** and **MITRE ATLAS** catalogue these in depth.
- **Adversarial threats** — deliberate manipulation of inputs or training data to force incorrect behaviour.
- **Threat intelligence and attack chains** — sourcing intelligence on AI-specific threats, and understanding how adversaries use AI to *enhance* their own operations.
- **Anomaly detection** — spotting abnormal model behaviour or usage.
- **Emerging vectors** — deep fakes used for fraud and disinformation, insider misuse of AI, and the new risks of autonomous, tool-using **AI agents**.

Maintaining a current picture of this landscape is an ongoing activity, not a one-time exercise.

## Vendor and supply chain risk

Most enterprises consume AI they did not build, so much of the risk lives in the supply chain:

- **Software and library dependencies** — the open-source and third-party components in AI stacks.
- **Vendor due diligence and contracts**, including **SLAs**, restrictions on how vendors may **use enterprise data**, and clear **access controls**.
- **Accountability models** — notably the **provider vs. deployer** distinction (whoever builds an AI system versus whoever puts it into use carries different obligations, a key EU AI Act concept), and the reality of **third-, fourth-, and fifth-party** risk cascading down the chain.
- **Ownership and intellectual property** — who owns the model, its outputs, and the training data — and how **liability** is allocated when AI causes harm.
- **Ongoing vendor monitoring** for changes in risk, rather than a point-in-time assessment.

## Related pages

- [AI Governance & Program Management](./ai-governance-program)
- [AI Technologies & Controls](./ai-security-controls)
- [Supply Chain Security](/risk-governance/supply-chain-security) · [Penetration Testing](/risk-governance/penetration-testing)
- [Frontier AI & AI-Powered Threats](/threat-intelligence/frontier-ai-threats)

## References

- MITRE ATLAS — Adversarial Threat Landscape for AI Systems
- OWASP Top 10 for LLM Applications
- ISO/IEC 23894 — AI risk management
- EU AI Act
