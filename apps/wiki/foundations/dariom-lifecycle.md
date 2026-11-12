# DARIOM Lifecycle

DARIOM is a security operations and architecture lifecycle framework: **D**etect, **A**nalyse, **R**eact, **I**nvestigate, **O**perate, **M**onitor. It provides a continuous-improvement loop for security posture management.

## The six phases

### Detect

Detection is the capability to identify that a security event has occurred or is occurring. Effective detection depends on:

- **Visibility** — logs, telemetry, and sensor coverage across all tiers
- **Detection logic** — SIEM rules, behavioural analytics, and threat intelligence correlation
- **Mean Time to Detect (MTTD)** — the primary metric; reduce it continuously

Detection sources include: endpoint telemetry (EDR), network flow data (NetFlow/IPFIX), DNS logs, firewall logs, proxy logs, cloud-native logging (CloudTrail, Azure Monitor), and application logs.

### Analyse

Raw alerts are not findings. Analysis converts signals into actionable intelligence by:

- Triage: separating true positives from false positives
- Correlation: linking related events into an incident
- Context enrichment: adding asset, identity, and threat intelligence context
- Impact assessment: determining blast radius and business impact

### React

React encompasses the immediate containment and initial response actions taken in the first hours of an incident:

- Isolate affected systems
- Revoke compromised credentials
- Block attacker-controlled infrastructure at the perimeter
- Preserve evidence for investigation

### Investigate

Investigation answers: *what happened, how, and to what?* Key activities:

- Forensic triage (memory, disk, network captures)
- Attack path reconstruction using the kill chain or MITRE ATT&CK navigator
- Scope expansion — determine whether the breach spread laterally
- Root cause analysis

### Operate

Operate covers the recovery and remediation phase:

- Rebuild or restore affected systems from known-good baselines
- Apply patches and close the vulnerability or misconfiguration exploited
- Validate recovery — confirm no persistence mechanisms remain
- Return to monitored production

### Monitor

Monitor is the continuous posture-management phase that bridges one cycle to the next:

- Tune detection rules based on findings from investigations
- Measure KPIs: MTTD, MTTR, false positive rate, coverage gaps
- Update threat models to reflect new TTPs encountered
- Feed lessons learned back into architecture and design

## DARIOM in practice

DARIOM is technology-agnostic — it describes *what* must happen rather than prescribing tools. Organisations typically map DARIOM phases to:

- **SOC playbooks** — structured procedures for each phase
- **SOAR workflows** — automated orchestration of detect → react
- **ITSM integration** — incident and change tickets tied to Operate/Monitor

## Relationship to other frameworks

| Framework | Overlap |
|-----------|---------|
| NIST CSF (Identify, Protect, Detect, Respond, Recover) | DARIOM Detect/Analyse ≈ CSF Detect; React/Investigate ≈ Respond; Operate ≈ Recover |
| MITRE ATT&CK | Used during Analyse/Investigate to map adversary TTPs |
| PICERL (Prepare, Identify, Contain, Eradicate, Recover, Lessons) | Closely aligned; DARIOM adds Monitor as an explicit continuous phase |

## Further reading

- NIST SP 800-61r3 — Computer Security Incident Handling Guide
- SANS Incident Response Process
- MITRE ATT&CK Navigator
