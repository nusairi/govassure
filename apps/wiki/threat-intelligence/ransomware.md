# Ransomware

Ransomware is malware that encrypts victim data and demands payment for the decryption key. Modern ransomware groups operate as criminal enterprises with affiliate programmes, dedicated leak sites, and negotiation teams. It is one of the highest-impact threats facing organisations of all sizes.

## How ransomware attacks work

### The modern ransomware kill chain

1. **Initial access** — phishing email, exploitation of internet-facing systems (VPN, RDP, Exchange), or compromised credentials purchased from access brokers
2. **Establish foothold** — deploy persistent backdoor (Cobalt Strike beacon, remote management tool)
3. **Privilege escalation** — exploit local vulnerability, credential theft (Mimikatz, DCSync)
4. **Lateral movement** — spread across the network via SMB, RDP, PsExec, WMI
5. **Domain compromise** — obtain Domain Admin or equivalent to maximise encryption impact
6. **Data exfiltration** — steal data before encrypting to enable double extortion
7. **Inhibit recovery** — delete VSS snapshots, destroy backups, disable AV
8. **Encryption** — deploy ransomware payload across all accessible systems
9. **Extortion** — demand payment; threaten to publish exfiltrated data

### Double and triple extortion

- **Double extortion** — encrypt + threaten to publish stolen data (now standard)
- **Triple extortion** — additionally threaten DDoS against victim or contact victim's customers/partners

## Defences by kill chain stage

### Prevent initial access

- Patch internet-facing systems on a defined SLA (Critical ≤72 hours)
- Disable RDP exposure to the internet; use ZTNA or VPN with MFA
- Deploy phishing-resistant MFA (FIDO2) for all external access
- Email security gateway with sandboxing for attachments
- Vulnerability management programme with external attack surface scanning

### Limit lateral movement

- Network segmentation — see [Macro, Micro & Identity Segmentation](/network-security/macro-micro-segmentation)
- Disable SMBv1; restrict SMB lateral movement via firewall rules
- Block lateral movement protocols between workstations (no workstation-to-workstation RDP/SMB)
- Least privilege — no standing domain admin; use PAM with JIT — see [Privileged Access](/identity-access/privileged-access)
- Credential Guard to prevent pass-the-hash and pass-the-ticket

### Protect backups

Backup destruction is a critical ransomware capability. Protect backups by:

- **Offline / immutable backups** — at least one backup copy must be air-gapped or stored in immutable object storage (AWS S3 Object Lock, Azure Immutable Blob Storage)
- **3-2-1-1-0 rule** — 3 copies, 2 different media, 1 offsite, 1 offline/immutable, 0 errors verified
- **Backup access control** — backup admin credentials must be Tier 0 PAM-protected; separate from domain admin
- **Test restores** — test restore procedures monthly; verify backups are actually recoverable

### Detect early

- Alert on VSS deletion: `vssadmin delete shadows`, `wmic shadowcopy delete`
- Alert on mass file rename/encryption activity (high file I/O with extension changes)
- Alert on large outbound data transfers (pre-encryption exfiltration)
- Alert on tools commonly used in ransomware intrusions: Cobalt Strike, Mimikatz, PsExec used atypically
- Canary files — place decoy files in key directories; alert immediately on access

### Incident response

NCSC guidance: do not pay the ransom if avoidable. Payment:
- Does not guarantee data recovery or deletion of exfiltrated data
- Funds criminal operations
- May violate sanctions regulations (if the group is sanctioned)

Engage:
- NCSC (report to report.ncsc.gov.uk)
- Action Fraud (UK: 0300 123 2040)
- Specialist incident response firm for containment and forensics

## Ransomware-specific backup architecture

```
Production environment
        │
        ├─ Daily backup → On-premises backup server (NAS)
        │
        ├─ Daily backup → Cloud backup (Azure Backup / AWS Backup)
        │                  [Soft-delete + immutable vault enabled]
        │
        └─ Weekly backup → Offline media (tape or removable disk)
                           [Physically disconnected when not writing]
```

The offline copy must be disconnected from the network. A ransomware actor with domain admin rights can destroy any backup system reachable from the network.

## Ransomware readiness checklist

- [ ] MFA enforced on all remote access and email
- [ ] All internet-facing systems patched within SLA
- [ ] RDP not directly exposed to internet
- [ ] Workstation-to-workstation lateral movement blocked by firewall
- [ ] VSS deletion and mass file rename alerting configured in SIEM
- [ ] Immutable offline backup verified and tested within 90 days
- [ ] Incident response plan tested (tabletop exercise) within 12 months
- [ ] Contacts for NCSC, law enforcement, and IR firm documented

## Further reading

- NCSC Ransomware guidance — [ncsc.gov.uk/ransomware](https://www.ncsc.gov.uk/ransomware)
- CISA StopRansomware.gov
- NCSC/CISA/FBI joint ransomware advisory series
- NCSC "Mitigating malware and ransomware attacks" guidance
