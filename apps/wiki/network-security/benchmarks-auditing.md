# Layer 2 & 3 Benchmarks & Auditing Tools

Security benchmarks and auditing tools provide the standards against which network device configurations are measured, and the mechanisms to continuously verify compliance.

## CIS Benchmarks

The Center for Internet Security (CIS) publishes hardening benchmarks for major network platforms:

- CIS Benchmark for Cisco IOS
- CIS Benchmark for Cisco NX-OS
- CIS Benchmark for Juniper Junos
- CIS Benchmark for Palo Alto Networks
- CIS Benchmark for F5 BIG-IP
- CIS Benchmark for Fortinet FortiOS

Each benchmark is rated Level 1 (automated, minimal impact) and Level 2 (advanced, may affect functionality). Level 1 is the baseline for all environments.

### Key CIS control areas for network devices

- Management plane access (SSH only, disable Telnet/HTTP)
- Authentication (AAA, RADIUS/TACACS+, strong passwords)
- Routing protocol authentication
- Logging and NTP (see [SNMP & NTP Security](./snmp-ntp-security))
- Unused interface shutdown
- Service hardening (disable CDP on external interfaces, disable unused services)

## DISA STIGs

The Defense Information Systems Agency (DISA) publishes Security Technical Implementation Guides (STIGs) for US government systems. STIGs are more prescriptive than CIS benchmarks and include:

- Network Infrastructure Policy
- Cisco IOS Router/Switch STIG
- Layer 2 Switch STIG
- Perimeter Router STIG

STIGs are publicly available and represent a high-security baseline applicable beyond government environments.

## Auditing tools

### Nipper (Titania)

Automated network device configuration auditing. Parses device configs (Cisco, Juniper, Palo Alto, Fortinet) and produces detailed compliance reports against CIS and DISA STIG benchmarks. Generates risk-rated findings with remediation guidance.

### OpenVAS / Greenbone

Network vulnerability scanning platform. Scans for known vulnerabilities (CVEs) in network devices, services, and operating systems. Produces prioritised findings with CVSS scores.

### Nessus (Tenable)

Commercial vulnerability scanner with extensive coverage of network devices. Compliance audit plugins check configurations against CIS/DISA/PCI DSS.

### NMAP + NSE scripts

```bash
# OS and service detection
nmap -sV -O -p- 192.168.1.0/24

# SNMPv1/v2 community string check
nmap -sU -p 161 --script snmp-info 192.168.1.1

# SMB vulnerability check
nmap -p 445 --script smb-vuln-* 192.168.1.0/24
```

### Netdisco

Open-source network management and inventory tool. Discovers devices via SNMP, maps topology, and tracks port/MAC/ARP history. Useful for visibility and audit.

### Batfish

Network configuration analysis tool. Parses multi-vendor configurations and answers policy questions: "Does any path from the internet reach server X?" — without sending live traffic.

### Lynis

Security auditing tool for Linux-based network appliances (and servers). Checks kernel parameters, service configuration, filesystem permissions, and authentication settings.

## Continuous compliance

Recommended approach:

1. **Configuration backup** — pull running configs nightly (RANCID, Oxidized, or vendor-native)
2. **Automated diff** — alert on any change to device configuration
3. **Compliance scan** — run Nipper or Nessus compliance audits weekly
4. **Manual audit** — quarterly manual review of firewall rules, ACLs, and routing policy

## Further reading

- CIS Benchmarks — [cisecurity.org/cis-benchmarks](https://www.cisecurity.org/cis-benchmarks)
- DISA STIGs — [public.cyber.mil/stigs](https://public.cyber.mil/stigs/)
- Titania Nipper — [titania.com](https://www.titania.com)
- Batfish — [batfish.org](https://www.batfish.org)
