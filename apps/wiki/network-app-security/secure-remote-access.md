# Secure Remote Access

Secure remote access provides authenticated, authorised, and encrypted connectivity for users and administrators who need to access internal resources from outside the corporate network.

## Traditional VPN model

### Architecture

```
Remote user → [Internet] → [VPN Gateway] → [Internal network]
```

The VPN gateway authenticates the user, establishes an encrypted tunnel, and the user receives an internal IP address — effectively extending the internal network to the remote endpoint.

### Risks of the traditional VPN model

- **Implicit trust** — once connected, the user has broad access to the internal network
- **Attack surface** — VPN appliances are frequently targeted (high-severity CVEs in Pulse Secure, Fortinet, Citrix, GlobalProtect)
- **Lateral movement** — a compromised endpoint connected to VPN can attack internal systems
- **No continuous authorisation** — once authenticated, sessions are long-lived with no re-evaluation

## Zero Trust Network Access (ZTNA)

ZTNA replaces VPN with per-application, identity-aware access. See full coverage in [VPNs, ZTNA & SASE](./vpn-ztna-sase).

## Privileged remote access (PAM)

For administrators, remote access to servers and network devices requires additional controls:

- **Jump server / bastion host** — all admin sessions routed through a hardened intermediary
- **Privileged Access Management (PAM)** — CyberArk, BeyondTrust, Delinea; provides session recording, credential vaulting, and JIT access
- **Session recording** — all privileged remote sessions recorded and stored for audit
- **MFA enforcement** — phishing-resistant MFA (FIDO2) required for all privileged access

## Desktop virtualisation (VDI)

Virtual Desktop Infrastructure provides remote access to a managed, hardened desktop running in a data centre:

- **No data on endpoint** — data never leaves the data centre
- **Centralised patch management** — golden image updated and redeployed
- **Suitable for BYOD / contractor access** — endpoint device is untrusted; only input/output crosses the network

Platforms: Citrix Virtual Apps and Desktops, VMware Horizon, Microsoft Azure Virtual Desktop (AVD).

## Remote access hardening checklist

- [ ] MFA enforced on all remote access solutions
- [ ] Split tunnelling disabled (all traffic routes through corporate inspection)
- [ ] Device compliance check before granting access (MDM/EDR enrolled, patched, compliant)
- [ ] VPN/ZTNA gateway patched on a defined SLA
- [ ] Session timeout configured (idle timeout ≤ 30 minutes)
- [ ] Logging of all remote access events to SIEM
- [ ] Unused accounts disabled within 24 hours of offboarding
- [ ] Quarterly review of remote access permissions

## Further reading

- NIST SP 800-46r2 — Guide to Enterprise Telework and Remote Access Security
- NCSC Guidance on Secure Remote Working
- CIS Remote Access Controls
