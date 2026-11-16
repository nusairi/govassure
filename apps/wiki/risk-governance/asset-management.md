# Asset Management

You cannot protect what you don't know you have. Asset management — maintaining an accurate, current inventory of hardware, software, and data assets — is the foundation of every other security control.

## Why asset management matters

- **Vulnerability management** depends on knowing which software versions are deployed
- **Patch management** requires knowing every system that needs patching
- **Access control** requires knowing which assets exist and who should access them
- **Incident response** requires knowing the scope of affected assets quickly
- **Compliance** requires demonstrating control over all in-scope assets

The NCSC Cyber Assessment Framework (CAF), CIS Controls, ISO 27001, and Cyber Essentials all treat asset management as a foundational control.

## Hardware asset inventory

### What to inventory

Every physical and virtual device:
- Servers (physical, virtual, cloud instances)
- Network devices (switches, routers, firewalls, APs)
- Endpoints (workstations, laptops)
- Mobile devices
- IoT and OT devices
- Cloud resources (VMs, containers, serverless functions)

### Minimum attributes per asset

| Attribute | Description |
|-----------|-------------|
| Unique ID | Asset tag, serial number, cloud resource ID |
| Asset type | Server, workstation, network device, IoT |
| Make / model | Manufacturer and model |
| OS / firmware | Version currently running |
| IP address(es) | Current network address(es) |
| Owner | Business unit or team responsible |
| Location | Physical location or cloud region |
| Classification | Business criticality (Critical, High, Medium, Low) |
| Patch status | Last patched; current against SLA |
| Last seen | Last time the asset was observed on the network |

### Discovery methods

- **Active scanning** — nmap, Tenable Nessus, Qualys (polls network for live hosts)
- **Passive discovery** — analyse network traffic to identify hosts without sending probes (useful for OT)
- **Agent-based** — deployed agent reports inventory (Microsoft Intune, CrowdStrike, Tanium)
- **Cloud APIs** — query cloud provider APIs for resource inventory (AWS Config, Azure Resource Graph)
- **DHCP/DNS** — mine DHCP leases and DNS records for asset data

### CMDB (Configuration Management Database)

A CMDB stores asset data and the relationships between assets. Tools: ServiceNow, Freshservice, Snipe-IT (open source), GLPI (open source).

Key principle: **automate population** — manual CMDB updates drift quickly. Feed from discovery tools, cloud APIs, and MDM automatically.

## Software asset inventory

Track all software deployed across the estate:
- Operating systems and versions
- Applications (commercial and open source)
- Libraries and dependencies (see [Supply Chain Security](./supply-chain-security))
- Browser extensions and plugins
- Cloud SaaS subscriptions

### Software Asset Management (SAM) tools

- Microsoft Intune / SCCM (Windows)
- Jamf (macOS/iOS)
- Flexera, Snow Software (commercial SAM)

## Data asset inventory

Map data assets to understand:
- What sensitive data exists and where
- Who has access to it
- How it is protected
- How long it is retained

See [Data-Centric Security](/data-security/data-centric-security) for classification and DLP.

## Asset lifecycle management

| Stage | Security actions |
|-------|----------------|
| Procurement | Verify supplier; check for known vulnerabilities in hardware |
| Deployment | Apply baseline hardening before deployment; register in CMDB |
| In-service | Patch within SLA; monitor; review access controls annually |
| Decommission | Wipe data (NIST 800-88); remove from access controls; update CMDB |
| Disposal | Certificate of destruction; verify data sanitisation |

## CIS Control 1 & 2

CIS Controls v8 places hardware inventory (Control 1) and software inventory (Control 2) as the first two controls — everything else depends on them.

## Further reading

- CIS Controls v8 — Controls 1 and 2
- NCSC CAF Principle A.1 — Asset Management
- ISO/IEC 27001 A.8.1 — Inventory of assets
- NIST SP 800-171 — Protecting Controlled Unclassified Information
