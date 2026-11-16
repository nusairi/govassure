# Zero Trust Principles

Zero trust is an architectural philosophy, not a product. Its core assertion is that trust should never be granted implicitly — neither based on network location (inside the perimeter) nor on prior authentication. Every access request is evaluated continuously against policy.

## The seven tenets (NIST SP 800-207)

1. **All data sources and computing services are resources.** Networks, devices, applications, and data are all resources that require protection regardless of where they reside.

2. **All communication is secured regardless of network location.** Being on the corporate LAN does not confer trust. All sessions must be authenticated and encrypted.

3. **Access to individual enterprise resources is granted per-session.** Access is scoped to the minimum required and expires. There is no standing privilege.

4. **Access to resources is determined by dynamic policy.** Policy is evaluated in real time using signals: identity, device health, location, behaviour, and data sensitivity.

5. **The enterprise monitors and measures the integrity and security posture of all owned and associated assets.**

6. **All resource authentication and authorisation is dynamic and strictly enforced before access is allowed.**

7. **The enterprise collects as much information as possible about the current state of assets, network traffic, and access requests and uses it to improve its security posture.**

## Core components

### Policy Decision Point (PDP)

The brain. Evaluates access requests against policy. Receives signals from:

- Identity provider (IdP) — authentication, MFA, risk score
- Device management (MDM/EDR) — device health, compliance status
- Threat intelligence — known bad IPs, IOCs
- Behavioural analytics — anomalous access patterns

### Policy Enforcement Point (PEP)

The muscle. Enforces the PDP's decision. In practice:

- A ZTNA gateway that proxies application access
- A network firewall with identity-based rules
- An API gateway enforcing OAuth scopes

### Policy Information Point (PIP) / Policy Administration Point (PAP)

The data and configuration layers feeding and governing the PDP.

## Identity as the new perimeter

In a zero trust model, identity becomes the primary control plane:

- **Strong authentication** — phishing-resistant MFA (FIDO2/WebAuthn, hardware tokens)
- **Continuous authorisation** — re-evaluate trust throughout the session, not just at login
- **Least privilege** — just-in-time (JIT) and just-enough-access (JEA)
- **Privileged Access Workstations (PAW)** — dedicated, hardened devices for privileged operations

## Common misconceptions

| Misconception | Reality |
|--------------|---------|
| Zero trust means no firewall | Firewalls remain — but perimeter-only trust is replaced with per-session, identity-aware control |
| Zero trust is a product you buy | It is an architectural posture achieved through multiple integrated controls |
| Zero trust eliminates the need for segmentation | Micro-segmentation is *part of* zero trust |
| Zero trust requires cloud | It can be implemented on-premises, though cloud-native tooling accelerates it |

## Maturity models

- **CISA Zero Trust Maturity Model** (Traditional → Advanced → Optimal across 5 pillars: Identity, Devices, Networks, Applications, Data)
- **NCSC Zero Trust Architecture design principles** (UK)
- **DoD Zero Trust Strategy** (US Department of Defense)

## Further reading

- NIST SP 800-207 — Zero Trust Architecture
- CISA Zero Trust Maturity Model v2
- NCSC Zero Trust Architecture Principles
- [Zero Trust Architecture (this wiki)](/identity-access/zero-trust-architecture)
