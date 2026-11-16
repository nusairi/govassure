# Security Logging

Logging is foundational to security monitoring, incident investigation, and compliance. Without comprehensive, tamper-resistant logs, detection and response are impossible. The NCSC treats logging as a standalone priority topic.

## What to log

### The NCSC logging hierarchy

Log sources in order of security value:

1. **Authentication events** — all login attempts (success and failure), MFA events, privilege escalation, account lockouts
2. **Network boundary events** — firewall allow/deny, proxy access logs, DNS queries, VPN connections
3. **Endpoint events** — process creation, network connections, file writes to sensitive paths, registry changes (Windows)
4. **Application events** — web server access logs, application errors, API calls, database queries on sensitive tables
5. **Cloud control plane** — IAM changes, resource creation/deletion, policy changes (CloudTrail, Azure Activity Log)
6. **Email** — inbound/outbound mail logs, attachment verdicts, URL click events

### Minimum log fields

Every security log event should contain:
- Timestamp (UTC, with millisecond precision)
- Source system / hostname
- User or service account identity
- Source IP address
- Action performed
- Target resource
- Outcome (success/failure)
- Session or transaction ID (for correlation)

## Log retention

| Data type | Minimum retention | Rationale |
|-----------|------------------|-----------|
| Authentication logs | 12 months | Covers most breach investigation windows |
| Firewall / network logs | 90 days | Forensic investigation; regulatory |
| Endpoint / EDR | 90–180 days | Lateral movement investigation |
| Cloud audit logs | 12 months | Compliance; cloud breach investigation |
| Application logs | 90 days | Application-layer incident investigation |
| Security alerts / SIEM | 24 months | Trend analysis; regulatory audit |

NCSC guidance recommends a minimum of **12 months retention** for security-relevant logs, with at least 3 months immediately accessible (hot/warm storage) and the remainder archived.

## Log integrity and tamper resistance

Logs are evidence. An attacker who compromises a system will attempt to clear logs. Protect log integrity:

- **Centralise immediately** — forward logs to a SIEM or log aggregator in real time; do not rely on logs stored only on the source system
- **Write-once storage** — use immutable log storage (S3 Object Lock, Azure Immutable Blob) for archived logs
- **Log signing** — cryptographic signing of log streams (AWS CloudTrail log file validation; syslog with HMAC)
- **Privileged access to logs** — restrict who can delete or modify logs; log access to the log system itself
- **Out-of-band log path** — for the most critical systems, log to a network-isolated collector that the production system cannot reach back

## Log collection architecture

### Syslog (Linux/network devices)

```
[Device] ──syslog/TLS──► [Syslog aggregator] ──► [SIEM]
```

Use **syslog over TLS (RFC 5425)** — never unencrypted UDP syslog for security-sensitive log streams. Recommended: rsyslog or syslog-ng with TLS forwarding.

### Windows Event Forwarding (WEF)

```
[Windows endpoints] ──WEF──► [Windows Event Collector] ──► [SIEM]
```

Configure WEF subscriptions to pull high-value events: 4624/4625 (logon success/fail), 4688 (process creation), 4698 (scheduled task creation), 4732 (group membership change).

### Cloud-native log forwarding

- **AWS**: CloudTrail → S3 → SIEM (via Lambda or Firehose)
- **Azure**: Diagnostic Settings → Log Analytics Workspace → Sentinel
- **GCP**: Cloud Logging → Pub/Sub → SIEM

### Sysmon (Windows endpoint telemetry)

Sysmon dramatically enriches Windows event logs. Key Sysmon event IDs:

| Event ID | Description |
|----------|-------------|
| 1 | Process creation (with command line) |
| 3 | Network connection |
| 7 | Image loaded (DLL) |
| 8 | CreateRemoteThread (process injection indicator) |
| 11 | File creation |
| 12/13 | Registry events |
| 22 | DNS query |

Use a widely adopted community Sysmon configuration (for example sysmon-config or sysmon-modular) as a baseline.

## What not to log

Over-logging creates storage costs and noise that buries important signals:

- Avoid logging full packet payloads (privacy; cost) — log metadata instead
- Avoid logging health check endpoints (generates millions of low-value entries)
- Avoid logging debug-level application output to the SIEM — use application logging separately
- Do not log credentials, session tokens, or personal data in log entries

## Compliance requirements

| Framework | Logging requirement |
|-----------|-------------------|
| PCI DSS v4.0 Req 10 | Log all access to cardholder data; retain 12 months; 3 months available |
| ISO 27001 A.8.15 | Logging of events; log protection |
| NCSC CAF B.3 | Security monitoring; logging of security events |
| Cyber Essentials Plus | Evidence of security monitoring |
| GDPR Article 32 | Appropriate technical measures; logging supports breach detection |

## Further reading

- NCSC Logging guidance — [ncsc.gov.uk/logging](https://www.ncsc.gov.uk/section/advice-guidance/all-topics/logging)
- NCSC "10 steps to cyber security" — Logging and monitoring
- Sysmon configuration (GitHub)
- CIS Controls v8 Control 8 — Audit Log Management
