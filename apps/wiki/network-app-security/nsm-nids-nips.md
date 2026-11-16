# NSM with NIDS & NIPS

Network Security Monitoring (NSM) is the collection, analysis, and escalation of network traffic data to detect and investigate security incidents. Network Intrusion Detection Systems (NIDS) and Intrusion Prevention Systems (NIPS) are the primary automated detection components within NSM.

## Network Security Monitoring (NSM)

NSM operates across three data types:

| Data type | Description | Examples |
|-----------|-------------|---------|
| **Full packet capture (FPC)** | Complete payload; maximum fidelity, high storage cost | Zeek raw logs, Wireshark/tcpdump |
| **Session/flow data** | Connection metadata without payload; lower cost, good for baselining | NetFlow, IPFIX, sFlow, Zeek conn.log |
| **Extracted content** | Files, credentials, certificates extracted from traffic | Zeek files.log, NetworkMiner |

### NSM sensor placement

Sensors must be placed at choke points where traffic of interest passes:

- **Internet boundary** — all north-south traffic
- **DMZ boundary** — traffic entering and leaving the DMZ
- **Internal segmentation points** — east-west between major zones
- **Out-of-band management network** — detect management plane abuse
- **Cloud VPC traffic mirroring** — mirror traffic from VPC to a sensor instance

### Zeek (formerly Bro)

Zeek is a passive network analysis framework that converts raw traffic into structured logs:

- `conn.log` — all TCP/UDP/ICMP connections
- `http.log` — HTTP requests and responses
- `dns.log` — DNS queries and responses
- `ssl.log` — TLS handshake metadata
- `files.log` — file transfers with SHA-256 hashes
- `weird.log` — protocol anomalies

Zeek logs feed SIEMs (see [AI, Analytics & SIEM](/analytics/ai-analytics-siem)) for correlation and alerting.

## NIDS — Network Intrusion Detection System

A NIDS passively monitors traffic and generates alerts on pattern matches. It does not block traffic.

### Suricata

Suricata is the primary open-source NIDS/NIPS engine. Key features:

- Multi-threaded high-performance packet processing
- Supports IDS (passive alert), IPS (inline block), and NSM (Zeek-like logging) modes
- ET Open and ET Pro rule sets (Emerging Threats) for commodity threat coverage
- Protocol detection and file extraction

```yaml
# suricata.yaml — inline IPS mode (NFQ)
runmode: workers
outputs:
  - eve-log:
      enabled: yes
      filetype: regular
      filename: /var/log/suricata/eve.json
      types:
        - alert
        - http
        - dns
        - tls
        - files
```

### Snort 3

The original NIDS engine. Snort 3 offers improved multi-threading and a new rule language. Used in many commercial appliances.

### Rule tuning

NIDS value comes from low false positive rates. Key tuning steps:

1. **Suppress** rules that fire on legitimate traffic in your environment
2. **Threshold** noisy rules to alert only after N occurrences in T seconds
3. **Customise** rule content to your environment (home networks, local IPs)
4. **Prioritise** rules by severity; route critical alerts to immediate response

## NIPS — Network Intrusion Prevention System

A NIPS sits inline in the traffic path and can **drop** packets that match threat signatures, rather than just alerting.

### Inline deployment modes

- **Fail-open** — if the NIPS fails, traffic passes uninspected (availability priority)
- **Fail-closed** — if the NIPS fails, traffic is dropped (security priority)
- **Bypass module** — hardware bypass card passes traffic when the NIPS is unavailable

### IPS in NGFW

Modern NGFWs integrate IPS as a security profile applied to policy rules. This is the most common production IPS deployment pattern — see [NGFW](/infrastructure/ngfw).

### False positive management in IPS mode

IPS false positives cause outages. Before moving any signature to block mode:

1. Run in alert-only (IDS) mode for 2–4 weeks
2. Review alerts for false positives against your environment
3. Suppress, threshold, or exclude specific rules as needed
4. Promote to inline drop mode with monitoring

## Security Onion

Security Onion is an open-source NSM distribution integrating:

- **Zeek** — network logs
- **Suricata** — IDS alerts
- **Elastic Stack** — log storage and search
- **Kibana** — dashboards
- **TheHive / Cortex** — case management and automated enrichment

Ideal for NSM labs, SOC training, and small-to-medium enterprise deployments.

## Further reading

- "The Practice of Network Security Monitoring"
- Suricata documentation — [suricata.io](https://suricata.io)
- Zeek documentation — [zeek.org](https://zeek.org)
- Security Onion — [securityonionsolutions.com](https://securityonionsolutions.com)
