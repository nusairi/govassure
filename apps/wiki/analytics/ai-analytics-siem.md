# AI, Analytics & SIEM

Security Information and Event Management (SIEM) is the central nervous system of a security operations centre. Combined with AI-driven analytics and SOAR automation, it enables detection, investigation, and response at scale.

## SIEM fundamentals

A SIEM aggregates, normalises, and correlates security events from across the environment to detect threats that would be invisible in individual log sources.

### SIEM data sources

| Source category | Examples |
|----------------|---------|
| Network | Firewall logs, IDS/IPS alerts, proxy logs, NetFlow/IPFIX |
| Endpoint | Windows Event Logs, Sysmon, EDR telemetry, antivirus |
| Identity | AD audit logs, Azure AD sign-in logs, PAM session logs |
| Application | Web server access logs, database audit logs, application error logs |
| Cloud | CloudTrail (AWS), Azure Activity Log, GCP Audit Logs |
| Email | Mail gateway logs, phishing reports |
| Vulnerability | Scanner results, Tenable/Qualys findings |
| Threat intel | IOC feeds, MISP, VirusTotal |

### Log normalisation

Raw logs from different sources use different formats and field names. Normalisation maps them to a common schema:

- **Common Information Model (CIM)** — Splunk's normalisation framework
- **Elastic Common Schema (ECS)** — Elasticsearch normalisation
- **OCSF (Open Cybersecurity Schema Framework)** — vendor-neutral schema backed by AWS, Splunk, IBM, etc.

### SIEM detection approaches

| Approach | Description | Strengths | Weaknesses |
|----------|-------------|-----------|-----------|
| **Signature / rule-based** | Match known patterns (IOCs, attack signatures) | High fidelity for known threats | No coverage for novel attacks |
| **Threshold** | Alert when event count exceeds baseline | Simple; catches floods and brute force | Misses low-and-slow attacks |
| **Statistical anomaly** | Alert on deviation from statistical baseline | Catches unknown attack patterns | Higher false positive rate |
| **UEBA (behavioural)** | ML models of user/entity behaviour; alert on deviations | Detects insider threats, compromised accounts | Requires ML model tuning; dwell time |
| **Threat hunting** | Human-led hypothesis-driven search for TTPs | Finds living-off-the-land, evasive threats | Resource-intensive |

## SIEM platforms

### Enterprise SIEM

- **Splunk Enterprise Security** — market leader; powerful SPL query language; extensive app marketplace
- **Microsoft Sentinel** — cloud-native SIEM on Azure; native integration with Microsoft stack; UEBA built-in
- **IBM QRadar** — strong network-centric detection; SIEM + SOAR (XSOAR)
- **Elastic SIEM** — open-source Elastic Stack + Detection Engine; ECS-based

### Cloud-native SIEM

- **Microsoft Sentinel** — scalable SaaS SIEM; Kusto Query Language (KQL); AI-driven threat detection
- **Google Chronicle** — petabyte-scale; YARA-L detection rules; long data retention
- **AWS Security Lake / Detective** — native AWS security analytics

## AI and machine learning in security

### User and Entity Behaviour Analytics (UEBA)

UEBA builds baseline behavioural models for users and systems, then alerts on deviations:

- **Peer group analysis** — a user accessing systems their peer group never touches
- **Time-of-day anomaly** — login at 3am from a jurisdiction the user has never worked from
- **Data volume anomaly** — user downloads 10× their normal data volume
- **Privilege anomaly** — service account executing interactive commands

UEBA platforms: Microsoft Sentinel UEBA, Securonix, Exabeam, Splunk UEBA.

### AI-driven threat detection

- **NLP on logs** — detect anomalous command sequences, unusual DNS queries, rare user-agent strings
- **Graph analytics** — map relationships between entities; detect lateral movement paths
- **LLM-assisted investigation** — natural language queries over security data (Microsoft Security Copilot, Elastic AI Assistant)

### AI security considerations

AI/ML in security is not magic:
- ML models require **continuous retraining** as environments change
- **False positives** from UEBA can cause alert fatigue — tune and score carefully
- **Adversarial attacks** on ML models are possible — validate model robustness
- **Explainability** — analysts need to understand why a model fired to investigate effectively

## SOAR — Security Orchestration, Automation & Response

SOAR platforms automate repetitive response tasks, reducing MTTR from hours to seconds.

### Common SOAR use cases

| Use case | Automated actions |
|----------|------------------|
| Phishing email | Extract IOCs → check reputation → block sender → quarantine inbox → create ticket |
| Malware alert | Isolate endpoint → pull forensics → check hash in VirusTotal → notify analyst |
| Impossible travel | Block sign-in → reset password → notify user + SOC → create investigation case |
| Cloud misconfiguration | Alert → auto-remediate (re-apply policy) → create change record |

### SOAR platforms

- **Microsoft Sentinel Automation** (Logic Apps + Playbooks)
- **Palo Alto XSOAR** (formerly Demisto) — extensive integration library
- **Splunk SOAR** (formerly Phantom)
- **IBM Security QRadar SOAR**
- **Swimlane** — flexible low-code playbooks

## Threat hunting

Threat hunting is a proactive, human-led search for attacker activity that has evaded automated detection.

### Hunting methodology

1. **Hypothesis** — form a hypothesis based on threat intelligence or ATT&CK TTPs
2. **Data collection** — identify the data sources needed to test the hypothesis
3. **Hunt** — query logs, look for anomalies consistent with the hypothesis
4. **Analysis** — distinguish malicious from benign; escalate confirmed findings
5. **Improve detection** — convert successful hunt findings into SIEM detection rules

### Hunting data sources

- Sysmon + Windows Event Logs (process creation, network connections, registry)
- PowerShell ScriptBlock logging
- Zeek/Suricata network logs
- EDR telemetry

### Useful hunting tools

- **Velociraptor** — open-source DFIR and hunting platform
- **OSQuery** — SQL-based endpoint interrogation
- **Sigma** — generic SIEM rule format; convert to Splunk SPL, KQL, Elastic DSL
- **YARA** — file and memory pattern matching

## Metrics

| Metric | Target |
|--------|--------|
| MTTD (Mean Time to Detect) | < 1 hour for critical alerts |
| MTTR (Mean Time to Respond) | < 4 hours for critical incidents |
| False positive rate | < 5% for production rules |
| Alert-to-ticket ratio | Track trend; high ratio indicates noise |
| Coverage score (ATT&CK) | % of relevant techniques with detection coverage |

## Further reading

- MITRE ATT&CK — [attack.mitre.org](https://attack.mitre.org)
- Microsoft Sentinel documentation
- Splunk Security Essentials app
- "The Practice of Network Security Monitoring"
- SANS SOC Survey (annual)
