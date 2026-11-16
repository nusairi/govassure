# Threat Modelling with MITRE ATT&CK

MITRE ATT&CK (Adversarial Tactics, Techniques & Common Knowledge) is a globally accessible knowledge base of adversary TTPs based on real-world observations. It provides a common taxonomy for threat modelling, detection engineering, and red/blue team exercises.

## ATT&CK structure

### Tactics

Tactics represent the *why* — the adversary's immediate objective. The enterprise matrix defines 14 tactics:

1. Reconnaissance
2. Resource Development
3. Initial Access
4. Execution
5. Persistence
6. Privilege Escalation
7. Defence Evasion
8. Credential Access
9. Discovery
10. Lateral Movement
11. Collection
12. Command and Control
13. Exfiltration
14. Impact

### Techniques and sub-techniques

Techniques describe *how* a tactic is achieved (e.g., T1566 — Phishing). Sub-techniques provide additional specificity (e.g., T1566.001 — Spearphishing Attachment).

### Procedures

Procedures are specific real-world implementations of techniques — how a named threat actor (APT group) executes a technique in practice.

## Threat modelling process

### 1. Define scope and assets

Identify:
- Crown jewels (most valuable data and systems)
- Threat actors relevant to your sector (nation-state, criminal, insider)
- Relevant ATT&CK matrices (Enterprise, Mobile, ICS/OT)

### 2. Map threat actor profiles

Use ATT&CK Groups to find which TTPs are used by actors targeting your sector. Cross-reference with:
- CISA advisories
- Commercial threat intelligence feeds
- ISACs (Information Sharing and Analysis Centres)

### 3. Map TTPs to your environment

For each relevant TTP, assess:
- **Feasibility** — can this technique succeed in your environment?
- **Detection coverage** — do your controls detect this TTP?
- **Response maturity** — can your SOC respond effectively?

Use the ATT&CK Navigator to visualise coverage and gaps.

### 4. Identify control gaps

Where TTPs are feasible and detection is absent or weak, design compensating controls. Prioritise by:
- Attack probability (actor interest, TTP prevalence)
- Business impact if the TTP succeeds

### 5. Map mitigations

Each ATT&CK technique has associated mitigations (e.g., M1032 — Multi-factor Authentication for T1078 — Valid Accounts). Map existing controls to mitigations to confirm coverage.

## ATT&CK in architecture decisions

| Scenario | ATT&CK application |
|----------|-------------------|
| Designing network segmentation | Map Lateral Movement techniques; design segments to break assumed-breach movement paths |
| Building SIEM detection rules | Engineer detections to each relevant technique in the kill chain |
| Evaluating NGFW placement | Map Initial Access and C2 techniques; confirm the NGFW placement intercepts those paths |
| Red team scoping | Define ATT&CK scenarios aligned to your most relevant threat actors |

## D3FEND — the defensive counterpart

MITRE D3FEND maps defensive techniques (Harden, Detect, Isolate, Evict, Restore) to ATT&CK offensive techniques, enabling structured control selection.

## Tools

- **ATT&CK Navigator** — visualise technique coverage and layer threat profiles
- **ATT&CK Workbench** — manage and extend the knowledge base
- **Vectr** — track red team results against ATT&CK
- **Atomic Red Team** — open-source tests for each ATT&CK technique

## Further reading

- [MITRE ATT&CK Enterprise Matrix](https://attack.mitre.org)
- [MITRE D3FEND](https://d3fend.mitre.org)
- NIST SP 800-30 — Guide for Conducting Risk Assessments
