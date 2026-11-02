# VLANs & Private VLANs

VLANs (Virtual Local Area Networks) are the primary mechanism for Layer 2 segmentation. Private VLANs (PVLANs) extend this isolation to individual ports within the same VLAN, enabling host-to-host isolation without requiring additional IP subnets.

## VLAN fundamentals

A VLAN logically segments a switch fabric so that devices in different VLANs cannot communicate at Layer 2 without passing through a Layer 3 device (router or L3 switch). This is the foundation of network segmentation.

### VLAN design principles

- **One function, one VLAN** — user workstations, servers, printers, IoT, voice, management on separate VLANs
- **Segment by trust, not just function** — untrusted (guest, IoT) VLANs must be firewalled from trusted ones
- **Avoid VLAN 1** — the native VLAN on most switches; keep it unused or reassign to a dedicated non-routable VLAN
- **Change the native VLAN** on all trunks to a non-default value and explicitly tag it

### Trunk security

Trunk ports carry multiple VLANs between switches. Hardening:

```
switchport trunk native vlan 999          ! non-routable native VLAN
switchport trunk allowed vlan 10,20,30    ! whitelist only required VLANs
switchport nonegotiate                    ! disable DTP (VLAN hopping via switch spoofing)
```

Never leave DTP (Dynamic Trunking Protocol) enabled on access ports.

## Private VLANs (PVLANs)

PVLANs allow further isolation within a single VLAN, commonly used in hosting environments and DMZs where servers must not communicate with each other but must reach a shared gateway.

### PVLAN port types

| Port type | Communication |
|-----------|--------------|
| **Promiscuous** | Communicates with all PVLAN ports (gateway, firewall) |
| **Isolated** | Communicates only with promiscuous ports; isolated from all peers |
| **Community** | Communicates with other community ports in the same community, and with promiscuous ports |

### PVLAN use cases

- **DMZ server isolation** — each server is isolated; all communicate through the firewall (promiscuous)
- **Hosting/cloud** — tenant VMs isolated from peer tenants in the same segment
- **Guest Wi-Fi** — clients cannot reach each other, only the gateway

### PVLAN configuration (Cisco IOS)

```
vlan 100
  private-vlan primary
vlan 101
  private-vlan isolated
vlan 102
  private-vlan community

vlan 100
  private-vlan association 101,102

interface GigabitEthernet0/1
  switchport mode private-vlan promiscuous
  switchport private-vlan mapping 100 101,102

interface GigabitEthernet0/2
  switchport mode private-vlan host
  switchport private-vlan host-association 100 101
```

## VLAN design for security zones

A typical enterprise zone model:

| VLAN | Name | Purpose |
|------|------|---------|
| 10 | Corporate | Domain-joined workstations |
| 20 | Server | Internal application servers |
| 30 | DMZ | Internet-facing services |
| 40 | Management | Network device management (OOB) |
| 50 | Voice | VoIP phones |
| 60 | IoT | Building systems, printers, cameras |
| 70 | Guest | Visitor Wi-Fi (internet-only) |
| 80 | OT | Industrial control systems |
| 999 | BlackHole | Native VLAN — nothing assigned |

## Further reading

- RFC 5517 — Cisco Systems' Private VLANs
- CIS Benchmark for Cisco IOS
- NIST SP 800-125B — Secure Virtual Network Configuration
