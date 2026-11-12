# VPNs, ZTNA & SASE

This page compares traditional VPN architectures with Zero Trust Network Access (ZTNA) and the Secure Access Service Edge (SASE) framework, and provides guidance on migration.

## VPN — Virtual Private Network

### IPsec VPN

IPsec operates at Layer 3 and is used for site-to-site connectivity. Two phases:

- **IKE Phase 1** — establishes a secure channel for negotiation (ISAKMP SA)
- **IKE Phase 2** — negotiates the IPsec SA for data encryption

```
# Recommended IKEv2 parameters
Encryption:    AES-256-GCM
Integrity:     SHA-384 or SHA-512
DH Group:      Group 19 (P-256) or Group 20 (P-384)
PFS:           Enabled (new DH exchange per Phase 2 SA)
Authentication: RSA certificates (preferred over PSK)
```

### SSL/TLS VPN

SSL VPNs tunnel traffic over TLS (typically port 443), making them firewall-friendly. Used for client-to-site remote access (e.g., GlobalProtect, Pulse Secure, Cisco AnyConnect).

**Risk:** SSL VPN appliances have been a primary target for APT groups in recent years. Keep patched; consider ZTNA migration.

### Split tunnelling

Split tunnelling allows only corporate-destined traffic to flow through the VPN; internet traffic exits locally.

- **Risk:** Removes corporate inspection from internet-bound traffic; endpoint may be exposed to internet threats while connected
- **Recommendation:** Disable split tunnelling for high-security environments; if allowed, enforce full URL/content inspection on all endpoints via Endpoint DLP / EDR

## ZTNA — Zero Trust Network Access

ZTNA provides per-application access based on verified identity and device posture, rather than network-level connectivity.

### How ZTNA works

1. User authenticates to the ZTNA broker (cloud or on-premises) using SSO + MFA
2. Device posture is checked (MDM enrolment, patch status, AV active)
3. Based on identity + device posture + policy, the broker grants access to specific applications only
4. Traffic is proxied through the broker — the application is never directly exposed to the internet
5. Policy is continuously re-evaluated — suspicious signals can terminate the session

### ZTNA vs VPN comparison

| Dimension | VPN | ZTNA |
|-----------|-----|------|
| Access model | Network-level | Per-application |
| Attack surface | VPN gateway exposed | Applications hidden behind broker |
| Lateral movement risk | High (full network access) | Low (application-scoped) |
| Device posture check | Optional, often absent | Integral, continuous |
| User experience | Lag, reconnection issues | Typically better (cloud-based) |
| Legacy app support | Full | Requires app connector |

### ZTNA deployment models

- **Client-initiated (agent-based)** — lightweight agent on endpoint checks posture and routes traffic to broker
- **Service-initiated (agentless)** — browser-based; access via reverse proxy without an endpoint agent

## SASE — Secure Access Service Edge

SASE (Gartner, 2019) converges WAN edge capabilities (SD-WAN) with cloud-delivered security services into a single, unified cloud service.

### SASE components

| Component | Function |
|-----------|---------|
| **SD-WAN** | Intelligent WAN routing; optimised path selection |
| **ZTNA** | Identity-based, per-app access |
| **SWG** (Secure Web Gateway) | URL filtering, malware scanning, TLS inspection |
| **CASB** (Cloud Access Security Broker) | Visibility and control of SaaS applications |
| **FWaaS** (Firewall as a Service) | Cloud-delivered Layer 7 firewall |
| **DLP** | Data loss prevention across web and cloud |

### SASE vendors

- **Zscaler** (ZPA + ZIA + CASB)
- **Cloudflare One** (Access + Gateway + Magic WAN)
- **Palo Alto Prisma Access** (ZTNA + SWG + CASB + FWaaS)
- **Cisco Umbrella + Duo + Meraki** (converged SASE approach)
- **Netskope** (SASE with deep CASB/DLP capability)

### SASE migration approach

1. **Assess** — inventory current VPN, web proxy, and remote access infrastructure
2. **Pilot ZTNA** — migrate one application set to ZTNA while keeping VPN
3. **Layer SWG** — route web traffic through cloud SWG, retire on-premises proxy
4. **Add CASB** — gain visibility into SaaS usage; enforce policy
5. **Retire VPN** — once all applications are covered by ZTNA
6. **Converge** — adopt a single SASE vendor or best-of-breed stack

## Further reading

- Gartner "The Future of Network Security Is in the Cloud" (SASE paper)
- NIST SP 800-207 — Zero Trust Architecture
- NCSC ZTNA guidance
- RFC 7296 — IKEv2
