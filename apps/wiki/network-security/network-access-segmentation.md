# Network vs Access Segmentation Principles

Network segmentation and access segmentation are complementary but distinct control philosophies. Understanding the difference — and when to apply each — is fundamental to secure architecture.

## Network segmentation

Network segmentation partitions the network into isolated segments using Layer 2 (VLANs) and Layer 3 (firewalls, ACLs, routing) controls. Traffic between segments must pass through an enforcement point.

**Controls:** VLANs, firewalls, routers, ACLs, network zones  
**Policy anchor:** Source/destination IP, subnet, port, protocol  
**Enforced at:** Network infrastructure layer  
**Granularity:** Subnet or VLAN level

### Strengths

- Works for all devices regardless of OS or agent support
- Mature tooling and well-understood operational model
- Effective for coarse-grained zone isolation

### Weaknesses

- East-west traffic within a segment is uncontrolled
- Flat subnets allow lateral movement once inside a segment
- Policy is tied to IP addresses — difficult to maintain as workloads move

## Access segmentation

Access segmentation controls which users and devices can access which resources, independent of network location. The policy plane is identity, not topology.

**Controls:** IAM, RBAC, ABAC, ZTNA gateways, identity-aware proxies  
**Policy anchor:** User identity, device posture, application, time, location  
**Enforced at:** Application / identity layer  
**Granularity:** Per-user, per-application, per-request

### Strengths

- Policy travels with the user regardless of where they connect from
- Least-privilege access is easier to express and enforce
- Supports continuous authorisation (re-evaluate mid-session)

### Weaknesses

- Requires agent support or browser-based access for enforcement
- Legacy applications may not integrate with identity-aware controls
- More complex policy management (identity lifecycle, JIT provisioning)

## Comparing the models

| Dimension | Network segmentation | Access segmentation |
|-----------|---------------------|---------------------|
| Policy basis | IP/subnet/port | Identity/context |
| Lateral movement control | Partial (zone boundaries) | Strong (per-application) |
| Legacy device support | Full | Limited without agents |
| Remote access fit | Poor (VPN extends segment) | Excellent (ZTNA) |
| East-west visibility | Requires additional tooling | Application-level by design |
| Operational maturity required | Low-medium | Medium-high |

## The layered approach

Neither model alone is sufficient for high-security environments. The recommended approach layers both:

1. **Network macro-segmentation** — zone isolation at the perimeter and between major tiers
2. **Network micro-segmentation** — workload-level east-west control within zones
3. **Access segmentation** — identity and device-aware policy for user access to applications
4. **Data segmentation** — classification-based data access controls regardless of network path

This layered model implements defence-in-depth across the control planes: network topology, workload identity, user identity, and data sensitivity.

## Further reading

- [Macro, Micro & Identity Segmentation](./macro-micro-segmentation)
- [Zero Trust Architecture](/identity-access/zero-trust-architecture)
- NIST SP 800-207 — Zero Trust Architecture
- Forrester Zero Trust eXtended (ZTX) framework
