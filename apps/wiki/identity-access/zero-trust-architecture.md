# Zero Trust Architecture

Zero Trust Architecture (ZTA) is the implementation of zero trust principles in an organisation's security architecture. This page covers the practical design and maturity progression for ZTA.

## ZTA reference architecture

Based on NIST SP 800-207, a ZTA has three core logical components:

```
                    ┌─────────────────────┐
                    │  Policy Engine (PE)  │
                    │  Policy Admin (PA)   │
                    └──────────┬──────────┘
                               │
Subject ──── [PEP] ──── Enterprise Resource
  │            │
  │     Subject database
  │     (IdP, MDM, SIEM)
  │
Device / Credential
```

- **Policy Engine (PE)** — makes access decisions using identity, device, and contextual signals
- **Policy Administrator (PA)** — configures and communicates policy to PEPs
- **Policy Enforcement Point (PEP)** — enforces the PE decision; the gateway between subjects and resources

## CISA ZTA Maturity Model

CISA defines five pillars and four maturity levels:

| Pillar | Traditional | Initial | Advanced | Optimal |
|--------|------------|---------|----------|---------|
| **Identity** | Static passwords | MFA | Risk-based auth | Continuous validation |
| **Devices** | Managed domain-joined | MDM enrolment | Compliance-based access | Continuous health check |
| **Networks** | Flat perimeter | VLAN segmentation | Micro-segmentation | Per-flow ZTNA |
| **Applications** | VPN → all apps | SSO | App-level MFA | Dynamic least-privilege |
| **Data** | No classification | Sensitive data tagged | DLP enforced | Rights management + CASB |

## ZTA implementation roadmap

### Phase 1: Strong foundations (months 1–6)

- Deploy MFA for all users (start with admins and internet-facing apps)
- Centralise identity in a modern IdP (Azure Entra ID, Okta, Ping)
- Enrol all endpoints in MDM
- Implement SSO for all SaaS and internal applications
- Enable Conditional Access: require compliant device + MFA for sensitive apps

### Phase 2: Application-level access control (months 6–18)

- Deploy ZTNA for remote access — retire legacy VPN for web application access
- Implement PAM with JIT access for all privileged administration
- Enable Conditional Access risk policies (block or require step-up auth on risky sign-ins)
- Publish internal applications through an application proxy (no direct network access)

### Phase 3: Data and analytics (months 18–36)

- Classify all data; enforce DLP on sensitive classifications
- Deploy CASB for SaaS visibility and control
- Integrate all identity, device, network, and application signals into SIEM
- Enable User and Entity Behaviour Analytics (UEBA) for insider threat detection
- Move towards just-enough-access with automated access reviews

### Phase 4: Continuous optimisation

- Automate access reviews and lifecycle management (JML via SCIM)
- Implement rights management (Azure RMS / Purview Information Protection) for document-level controls
- Move to passkeys/FIDO2 — eliminate phishable authentication entirely
- Continuous red team exercises focused on ZTA assumptions

## ZTA network design

### Microsegmentation in ZTA

Network microsegmentation is a critical component of ZTA — it limits lateral movement even if an identity is compromised:

```
Application A ←→ [Microsegment boundary] ←→ Application B
                    (identity-aware policy)
```

Only explicitly permitted flows are allowed. The policy is defined by application identity (service account, workload label) rather than network address.

### Software-Defined Perimeter (SDP)

SDP implements the zero trust concept of "dark clouds" — infrastructure that is invisible and inaccessible until authenticated:

1. Client makes an authenticated knock to the SDP controller
2. Controller validates identity + device
3. Dynamically opens a single-packet authorisation (SPA) path to the resource
4. All other infrastructure remains dark (no open ports)

CloudFlare Access, Zscaler ZPA, and Akamai Enterprise Application Access implement SDP/ZTNA patterns.

## Further reading

- NIST SP 800-207 — Zero Trust Architecture
- CISA Zero Trust Maturity Model v2 (2023)
- NCSC Zero Trust Architecture Design Principles
- Google BeyondCorp Enterprise (original ZTA implementation reference)
- [Zero Trust Principles](/foundations/zero-trust-principles)
