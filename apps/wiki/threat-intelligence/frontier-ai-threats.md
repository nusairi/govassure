# Frontier AI & AI-Powered Threats

Artificial intelligence is transforming both the attack and defence landscape. This page focuses on AI as a threat vector — how adversaries use AI to enhance attacks, and how defenders must adapt.

## AI-enhanced attack capabilities

### Phishing and social engineering at scale

AI dramatically lowers the cost of targeted phishing:
- **LLM-generated spearphishing** — personalised, grammatically perfect emails at scale; traditional "poor grammar" indicators no longer reliable
- **Deepfake voice and video** — impersonate executives in real-time calls (vishing); used in BEC fraud
- **AI-generated lure documents** — contextually relevant, topical attachments that bypass user suspicion

**Defence:** Focus on technical email controls (DMARC, anti-spoofing) rather than relying on user detection. Establish out-of-band verification procedures for high-value financial transactions.

### Vulnerability discovery and exploitation

- AI tools can identify vulnerabilities in code and configurations faster than human researchers
- LLM-assisted exploit development lowers the barrier for less-skilled threat actors
- AI-assisted fuzzing can discover novel attack paths in target systems

**Defence:** Accelerate your own vulnerability management; assume exploitation windows are shrinking. Patch Critical CVEs within 24 hours.

### Malware development and evasion

- AI can generate novel malware variants that evade signature-based detection
- Polymorphic and metamorphic code generation is increasingly automated
- AI can generate living-off-the-land scripts tailored to a specific target environment

**Defence:** Behaviour-based detection (EDR, UEBA) rather than signature-based AV; assume signatures are increasingly insufficient.

### Password and credential attacks

- AI accelerates password cracking (hashcat with AI-generated wordlists)
- AI can generate highly targeted wordlists from OSINT (social media, LinkedIn)
- Deepfake bypass of voice-based authentication

**Defence:** Phishing-resistant MFA (FIDO2/passkeys) — AI cannot phish a hardware-bound key.

## Agentic AI risks

Agentic AI systems (AI with tool use, multi-step task execution, autonomous operation) introduce new attack surfaces:

- **Prompt injection** — malicious content in data processed by an AI agent causes it to take unintended actions (exfiltrate data, make unauthorised API calls)
- **Supply chain attacks on AI pipelines** — compromise model weights, training data, or inference infrastructure
- **Excessive agency** — AI agents granted too many permissions; a compromised agent can cause significant harm
- **Data exfiltration via AI** — agents with access to sensitive data and external API access create exfiltration paths

### Securing AI agents

- Apply least privilege to AI agent permissions — agents should not have more access than they need for their defined task
- Validate and sanitise all inputs to AI agents, especially from external/untrusted sources
- Monitor AI agent actions and outputs — log all tool calls
- Implement human-in-the-loop controls for irreversible or high-impact actions
- Maintain an inventory of all AI agents and their permissions

## Frontier AI — systemic risks

The NCSC defines frontier AI as the most capable AI systems at the cutting edge. Systemic risks include:

- **Misuse by state actors** — nation-states using frontier AI for cyber operations, disinformation, and infrastructure attack
- **Capability jump** — rapid improvement in AI capabilities may outpace defensive adaptation
- **Concentration risk** — critical dependence on a small number of AI providers
- **Model theft** — theft of model weights gives adversaries access to frontier capabilities

## AI in security tools — risks and limitations

AI-enhanced security tools (AI-generated SIEM rules, AI threat hunting, AI SOC assistants) introduce their own risks:
- **Hallucination** — AI may generate plausible-sounding but incorrect threat analysis
- **Adversarial evasion** — attackers can craft inputs that fool AI-based detection
- **Over-reliance** — reducing human analyst skills as AI handles more triage

Treat AI security outputs as signals requiring human validation, not authoritative conclusions.

## NCSC guidance on AI

The NCSC publishes guidance on:
- **Guidelines for secure AI system development** (joint with CISA and international partners)
- **AI cyber security code of practice** (UK)
- **Frontier AI risks** — ongoing NCSC blog series

## Further reading

- NCSC AI security guidance — [ncsc.gov.uk/artificial-intelligence](https://www.ncsc.gov.uk/section/advice-guidance/all-topics/artificial-intelligence)
- NCSC "Agentic AI: what it means for cyber security" blog
- MITRE ATLAS — Adversarial Threat Landscape for AI Systems
- OWASP LLM Top 10
- NIST AI RMF (Risk Management Framework)
