# Secure System Design

Secure system design applies security thinking at every phase of an architecture — from requirements through decomposition, implementation, and operations. It treats security as a property of the system rather than a layer bolted on after the fact.

## Core principles

### Defence in depth

No single control should be the sole barrier to an attacker. Layer controls so that the failure of any one mechanism does not lead directly to a breach. Map controls to the kill chain: prevent, detect, and respond at each layer.

### Least privilege

Every component, process, and user should operate with the minimum access required to fulfil its function. Excess privilege is attack surface. Apply least privilege to:

- User accounts and service accounts
- Network paths and firewall rules
- API scopes and OAuth grants
- Cloud IAM roles and resource policies

### Fail secure

When a component fails — due to fault, misconfiguration, or attack — it should default to a safe state. A firewall that fails open is not a firewall; a door whose lock fails open is not a lock.

### Separation of duties

Split critical functions across multiple parties or systems so no single actor can cause harm unilaterally. Applied in authentication (MFA), key management (split keys), and change management (dual approval).

### Economy of mechanism

Prefer simple designs. Complexity is the enemy of security. The more complex a system, the larger its attack surface and the more difficult its audit.

### Complete mediation

Every access to every resource must be authorised on every request. Caching access decisions introduces windows of privilege.

### Open design

Security should not depend on obscurity of design. Assume the attacker knows the architecture. Cryptographic security comes from key secrecy, not algorithm secrecy.

## Architectural patterns

### Security zones

Divide the environment into security zones based on trust levels and sensitivity. Define explicit controls at zone boundaries (firewalls, proxies, gateways). Common zone models:

- Internet → DMZ → Internal → Restricted / Crown Jewels
- Cloud landing zone tier models (Connectivity, Management, Application)

### Threat-driven design

Use threat modelling (see [Threat Modelling with MITRE ATT&CK](/threat-intelligence/threat-modeling-mitre)) to identify attack paths before designing controls. Design controls to the threats, not to a generic checklist.

### Immutable infrastructure

Treat infrastructure as code. Deploy rather than modify. Immutable deployments reduce configuration drift and make compromise detection easier.

## Standards and frameworks

- **NIST SP 800-160** — Systems Security Engineering
- **SABSA** — Sherwood Applied Business Security Architecture
- **TOGAF** with security extensions
- **ISO/IEC 27001 Annex A** — Information security controls
- **CIS Controls v8** — Prioritised security controls

## Further reading

- NIST SP 800-160 Vol. 1 & 2
- "Security Engineering" (3rd ed.)
- OWASP Architecture Cheat Sheet
