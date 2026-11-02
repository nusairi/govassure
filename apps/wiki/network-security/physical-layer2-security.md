# Physical & Layer 2 Security

Layer 2 is the foundation of network security. Vulnerabilities at this layer can undermine every control above it. Physical security and Layer 2 hardening must be addressed before trusting any higher-layer control.

## Physical security

### Data centre physical controls

- **Layered access** — perimeter (fence/wall), building, data hall, cage, rack
- **Authentication** — badge + PIN + biometric for server room access
- **CCTV** — motion-triggered recording at all entry points and aisles
- **Visitor management** — escorted access, badge expiry, visitor logs
- **Environmental** — temperature, humidity, power, and fire suppression monitoring

### Cable and port management

- Lock unused switch ports (administratively shut down)
- Use lockable patch panels and cable locks on active ports
- Label cables and ports — visibility is a prerequisite for control
- Document all physical connections in a CMDB

## Layer 2 attack types

| Attack | Description |
|--------|-------------|
| MAC flooding | Fill the CAM table to force the switch to broadcast frames (hub-mode) |
| MAC spoofing | Impersonate another device's MAC address |
| VLAN hopping | Switch spoofing or double-tagging to access other VLANs |
| STP manipulation | Inject rogue BPDUs to become the root bridge |
| ARP poisoning | Inject false ARP replies to redirect traffic (MITM) |
| DHCP starvation | Exhaust the DHCP pool; follow with rogue DHCP server |

## Layer 2 hardening techniques

### Port security

```
switchport port-security maximum 2
switchport port-security violation restrict
switchport port-security mac-address sticky
```

Limits the number of MAC addresses per port and can lock to learned addresses. Violation modes: protect (drop), restrict (drop + log), shutdown (err-disable).

### Dynamic ARP Inspection (DAI)

DAI validates ARP packets against the DHCP snooping binding table, dropping ARP replies with MAC/IP combinations not in the table.

```
ip arp inspection vlan 10,20,30
ip arp inspection trust   ! on trusted uplinks only
```

### DHCP Snooping

Marks ports as trusted (uplinks to legitimate DHCP servers) or untrusted (access ports). Drops DHCP server replies from untrusted ports.

```
ip dhcp snooping
ip dhcp snooping vlan 10,20,30
ip dhcp snooping trust   ! on uplink interfaces only
```

### STP hardening

- **PortFast** — bypasses listening/learning on known end-device ports (never on trunk ports)
- **BPDU Guard** — err-disables a PortFast port if a BPDU is received (prevents rogue switches)
- **Root Guard** — prevents a port from becoming the root bridge path
- **Loop Guard** — prevents one-way link failures from creating forwarding loops

### Storm control

Limits broadcast, multicast, and unicast storm traffic to a defined threshold:

```
storm-control broadcast level 20
storm-control action shutdown
```

### 802.1X port authentication

Requires devices to authenticate before being granted network access. Integrates with RADIUS/NPS for identity-based VLAN assignment.

## Further reading

- CIS Benchmarks — Cisco IOS, Juniper, Arista
- NIST SP 800-153 — Guidelines for Securing Wireless LANs
- IEEE 802.1X-2010 — Port-Based Network Access Control
