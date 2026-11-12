# Time-Based Security

Time-based security frames security as a race between an attacker's ability to breach a target and the defender's ability to detect and respond. Security posture is adequate only when the time to respond (Dt + Rt) is less than the time to penetrate (Pt).

## The core equation

```
Pt > Dt + Rt
```

- **Pt** — Protection time: how long protection mechanisms delay an attacker
- **Dt** — Detection time: how long it takes to identify the attack
- **Rt** — Response time: how long it takes to respond and contain

When `Dt + Rt < Pt`, the defender wins the race. When `Dt + Rt ≥ Pt`, the attacker succeeds.

## Implications for architecture

### Maximise Pt

Layered protection controls should collectively impose maximum delay on an attacker:

- Strong authentication and MFA at every boundary
- Micro-segmentation to prevent lateral movement
- Encryption to prevent exploitation of captured data
- Hardened baselines to slow privilege escalation

### Minimise Dt

Detection speed depends on:

- **Sensor coverage** — every tier must generate telemetry
- **Detection logic** — low-latency, high-fidelity detection rules
- **Alerting pipelines** — no batching delay in log forwarding
- **24/7 SOC or SOAR** — human or automated response always available

Target MTTD (Mean Time to Detect) in minutes for critical systems, not hours.

### Minimise Rt

Response speed depends on:

- **Runbooks and playbooks** — pre-planned, rehearsed procedures
- **Automation** — SOAR can contain in seconds what manual response takes hours to achieve
- **Authority and tooling** — responders must have the authority and access to act

## Exposure window

The **exposure window** is the period during which an attacker is active but undetected. Minimising the exposure window is the primary objective of any detection and response programme.

Industry benchmarks (IBM Cost of a Data Breach, 2024):
- Average time to identify a breach: ~194 days
- Average time to contain a breach: ~64 days
- Total average lifecycle: ~258 days

These figures represent the opportunity for improvement that time-based thinking drives.

## Metrics

| Metric | Description |
|--------|-------------|
| MTTD | Mean Time to Detect |
| MTTR | Mean Time to Respond/Recover |
| MTTTC | Mean Time to Contain |
| Dwell time | Time an attacker is present before detection |
| Breakout time | Time from initial access to lateral movement |

## Application to control design

When evaluating any security control, ask:

1. How much does this increase Pt for an attacker?
2. How much does this decrease Dt?
3. How much does this decrease Rt?
4. What is the cost, and is the improvement in the race worth it?

This framing prevents security theatre — controls that appear protective but add no measurable Pt/Dt/Rt improvement.

## Further reading

- "Time-Based Security"
- NIST SP 800-61r3 — IR Guide (MTTD/MTTR metrics)
- MITRE D3FEND — Detection and response technique framework
