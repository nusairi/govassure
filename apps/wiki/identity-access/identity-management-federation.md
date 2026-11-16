# Identity Management & Federation

Identity management is the set of processes and technologies used to create, maintain, and govern digital identities and their associated access rights. Federation extends identity across organisational boundaries.

## Directory services

### Active Directory (AD)

Active Directory is the dominant on-premises directory service for Windows environments. Key components:

- **Domain Controller (DC)** — authenticates users and enforces policy
- **LDAP** — directory query protocol (always use LDAPS/636 or StartTLS — never cleartext LDAP/389 in production)
- **Kerberos** — authentication protocol; ticket-based; susceptible to various attacks if misconfigured
- **Group Policy** — central configuration management for Windows endpoints and servers
- **AD DS** — Domain Services (core directory)
- **AD CS** — Certificate Services (internal PKI)
- **AD FS** — Federation Services (SAML/OAuth token issuer)

### LDAP hardening

- Disable anonymous LDAP binds
- Enforce LDAP signing and channel binding (MS KB4520412)
- Block LDAP/389 at the firewall — permit only LDAPS/636 and GC/3269

### Azure AD / Entra ID

Microsoft's cloud identity platform. Key features:

- **Conditional Access** — policy-based access control using signals (identity, device, location, risk)
- **Identity Protection** — ML-based risk scoring for sign-in and user risk
- **Privileged Identity Management (PIM)** — JIT privileged role activation
- **Verified ID** — decentralised identity based on W3C Verifiable Credentials

## Authentication protocols

### SAML 2.0

Security Assertion Markup Language — XML-based federation protocol used widely for enterprise SSO:

1. User accesses Service Provider (SP)
2. SP redirects to Identity Provider (IdP) with SAML request
3. User authenticates at IdP
4. IdP issues signed SAML assertion to SP
5. SP validates assertion and grants access

**Common vulnerabilities:** XML signature wrapping attacks; assertion replay — ensure SP validates signatures strictly.

### OAuth 2.0

Authorisation framework for delegating access to APIs:

- **Authorisation Code Flow** — for web apps with server-side; PKCE extension required for SPAs and mobile
- **Client Credentials Flow** — for service-to-service (no user)
- **Device Code Flow** — for devices with no browser

### OpenID Connect (OIDC)

Identity layer on top of OAuth 2.0. Adds an `id_token` (JWT) containing user identity claims. Used for authentication (who you are), while OAuth handles authorisation (what you can do).

### MFA methods — strength hierarchy

| Method | Resistance to phishing |
|--------|----------------------|
| FIDO2 / WebAuthn (hardware key, passkey) | ✅ Phishing-resistant |
| Certificate-based authentication | ✅ Phishing-resistant |
| TOTP (authenticator app) | ⚠️ Susceptible to real-time phishing |
| Push notification | ⚠️ Susceptible to MFA fatigue attacks |
| SMS OTP | ❌ SIM-swap risk; weakest MFA |

Migrate to FIDO2/passkeys for all privileged access. SMS MFA should be removed from high-risk accounts.

## Identity federation

Federation allows users to authenticate with their home IdP and access resources at a partner organisation without a separate account.

### Federation patterns

- **Inbound federation** — accept identity assertions from external IdPs (partners, customers via B2B)
- **Outbound federation** — issue identity assertions to external SPs
- **Identity brokering** — a hub (e.g., Keycloak, Okta, Azure AD B2C) mediates between multiple IdPs and SPs

### Federation security controls

- Validate SAML assertion signatures with pinned certificate (not just key usage)
- Enforce audience restriction (`aud` claim in JWT; `<AudienceRestriction>` in SAML)
- Short assertion lifetime (SAML assertions ≤ 5 minutes; JWT access tokens ≤ 15 minutes)
- Validate `iss` (issuer) in JWT claims
- Implement token replay protection (nonce / CSRF token in OIDC)

## Identity governance

- **Joiners, movers, leavers** (JML) — automate provisioning and deprovisioning via SCIM
- **Access reviews** — quarterly attestation of all user and privileged access
- **Role mining** — derive RBAC roles from actual access patterns
- **Separation of duties** — ensure conflicting roles cannot be held simultaneously

## Further reading

- NIST SP 800-63-3 — Digital Identity Guidelines (all volumes)
- Microsoft Entra ID documentation
- OAuth 2.0 Security Best Current Practice (RFC 9700)
- OWASP Authentication Cheat Sheet
