# Privileged Access & Identity Defence

Privileged accounts — those with elevated rights over systems, data, or infrastructure — are the primary target of sophisticated adversaries. Protecting them requires a layered programme of access controls, monitoring, and hygiene.

## The privileged account threat

- **Credential theft** — phishing, keyloggers, pass-the-hash, Kerberoasting
- **Credential stuffing** — reuse of credentials from data breaches
- **Insider threat** — abuse of legitimate privileged access
- **Lateral movement** — using stolen admin credentials to pivot between systems

The majority of major breaches involve compromised privileged credentials at some stage of the kill chain.

## Privileged Access Management (PAM)

PAM platforms provide centralised management of privileged accounts with controls across the lifecycle.

### PAM core capabilities

| Capability | Description |
|-----------|-------------|
| **Credential vault** | Stores passwords, keys, and certificates; rotates automatically |
| **Session manager** | Proxies privileged sessions; records video + keystrokes |
| **Just-In-Time (JIT) access** | Grants privilege for a limited time window; revokes on expiry |
| **Least privilege enforcement** | Granular permission assignment; no standing admin rights |
| **Dual control** | Requires approval from a second administrator for sensitive operations |

### PAM platforms

- **CyberArk Privileged Access Manager** — market leader; deep OS integration
- **BeyondTrust Privileged Remote Access + Password Safe** — strong for remote vendor access
- **Delinea Secret Server + Privilege Manager** — strong SMB/mid-market
- **HashiCorp Vault** — open-source; strong cloud/secrets management focus
- **Microsoft PIM** (Privileged Identity Management) — native for Azure AD/Entra ID roles

## Just-In-Time (JIT) access

Standing privilege (always-on admin rights) is a liability. JIT elevates privilege only when needed:

1. User requests elevated access for a specific task with business justification
2. PAM/PIM approves (automatically or via manager approval) and grants time-limited access
3. On expiry, privilege is automatically revoked
4. All activity during the privileged window is logged

JIT dramatically reduces the window of opportunity for credential theft — a stolen credential with no standing privilege is far less valuable to an attacker.

## Privileged Access Workstations (PAWs)

PAWs are dedicated, hardened workstations used only for privileged administration. No web browsing, email, or general productivity on a PAW.

### PAW hardening

- Minimal software — administration tools only
- No internet access (or strictly proxied to admin portals only)
- Full-disk encryption
- Application whitelisting
- UEFI Secure Boot + TPM
- No local admin for the user (admin rights only via PAM)
- Dedicated user account (separate from daily-use account)
- Joined to separate PAW OU with strict Group Policy

## Credential hygiene

- **No shared accounts** — every person gets a named account; shared accounts cannot be audited
- **No service account reuse** — each application gets a dedicated service account with least privilege
- **Managed service accounts** (gMSA) for Windows services — automatic password rotation, no interactive logon
- **No hardcoded credentials** — use secrets management (HashiCorp Vault, AWS Secrets Manager)
- **Rotation** — rotate privileged account passwords on a defined schedule (or after any suspected compromise)

## Defending against credential attacks

| Attack | Defence |
|--------|---------|
| Pass-the-hash | Credential Guard (Windows), restrict NTLM, tiered admin model |
| Kerberoasting | Long, complex service account passwords; use gMSA |
| AS-REP Roasting | Enable pre-authentication on all accounts |
| Golden/Silver ticket | Protect KRBTGT account; regular KRBTGT password rotation |
| LSASS dump | Credential Guard; restrict debug privileges; block procdump |

## Active Directory tiering model

The Microsoft Active Directory tier model separates privileged accounts by tier to prevent credential theft propagation:

- **Tier 0** — Domain Controllers, PKI, AD Connect, privileged identity infrastructure
- **Tier 1** — Servers and applications
- **Tier 2** — Workstations and end-user devices

Tier 0 credentials must never be used on Tier 1/2 systems. Compromise of a Tier 2 system cannot directly yield Tier 0 access.

## Further reading

- Microsoft PAW documentation
- CyberArk Privileged Access Management documentation
- NIST SP 800-63B — Digital Identity Guidelines
- NSA Hardening Recommendations for Active Directory
- "Attacking and Defending Active Directory"
