# Web & SMTP Proxy Security

Proxies provide visibility, control, and threat prevention for HTTP/S and email traffic — two of the highest-volume and highest-risk protocol families in any enterprise.

## Web proxy architecture

### Explicit proxy

Clients are configured (manually or via WPAD/PAC file) to send HTTP/S requests to the proxy. The proxy evaluates policy and makes the upstream connection on behalf of the client.

```
Client → [Proxy] → Internet
```

**Advantages:** Clear chain of custody; all web traffic passes through a single enforcement point.  
**Disadvantages:** Requires client configuration; proxy bypass is possible if not enforced.

### Transparent (intercept) proxy

The network intercepts HTTP/S traffic and redirects it to the proxy without client configuration. Done via WCCP, PBR (Policy-Based Routing), or inline deployment.

**Advantages:** No client configuration; covers all devices.  
**Disadvantages:** TLS interception requires certificate distribution; may break certificate pinning.

### SSL/TLS inspection

Encrypted HTTPS traffic cannot be inspected without decryption. SSL inspection (SSL bump) works by:

1. Proxy intercepts the TLS handshake from the client
2. Proxy establishes a separate TLS session to the server
3. Proxy presents a re-signed certificate to the client (using a trusted enterprise CA)
4. Proxy decrypts, inspects, and re-encrypts traffic

**Considerations:**
- Enterprise CA certificate must be trusted on all endpoints
- Breaks certificate pinning (some apps will fail — add bypass rules)
- Must bypass decryption for banking, healthcare, and sensitive personal sites (privacy/compliance)
- Inspect only — do not log decrypted content beyond what policy requires

### Web proxy features

- **URL categorisation** — block malicious, inappropriate, or non-business categories
- **Reputation scoring** — block newly registered domains, low-reputation IPs
- **Malware scanning** — AV/sandboxing on downloaded files
- **DLP integration** — detect sensitive data in outbound POST requests
- **User authentication** — NTLM/Kerberos SSO to tie web activity to user identity

## SMTP proxy / mail security architecture

### Email threat landscape

- **Phishing and spear-phishing** — credential theft via fake login pages
- **Malware delivery** — malicious attachments (macros, exploits)
- **Business Email Compromise (BEC)** — impersonation of executives or suppliers
- **Data exfiltration** — sensitive data leaving via email

### Email authentication protocols

| Protocol | Purpose | How it works |
|----------|---------|--------------|
| **SPF** | Authorised send sources | DNS TXT record listing authorised sending IPs |
| **DKIM** | Message integrity + origin | Cryptographic signature on message headers |
| **DMARC** | Policy enforcement + reporting | Defines what to do with SPF/DKIM failures (none/quarantine/reject) |
| **BIMI** | Brand indicators | Displays verified logo in supported clients (requires DMARC enforcement) |
| **MTA-STS** | Enforce TLS for inbound | Policy requiring STARTTLS from sending MTAs |

### SMTP gateway hardening

- **Block malicious file types** — .exe, .js, .vbs, .bat, .ps1, encrypted archives
- **Sandbox attachments** — detonate suspicious files in an isolated environment
- **URL rewriting** — rewrite links to pass through time-of-click scanning
- **Impersonation protection** — flag lookalike domains and display name spoofing
- **Header inspection** — validate received headers; detect relay abuse

### Inbound relay architecture

```
Internet → MX (SMTP Gateway/SEG) → Internal mail server
```

The Secure Email Gateway (SEG) — e.g., Proofpoint, Mimecast, Microsoft Defender for Office 365 — filters all inbound mail before delivery to the internal mail server.

Lock down the internal mail server to accept SMTP only from the SEG's IP range, not from the internet directly.

## Further reading

- RFC 7208 — SPF
- RFC 6376 — DKIM
- RFC 7489 — DMARC
- NCSC Email Security and Anti-Spoofing guidance
- NIST SP 800-45 — Guidelines on Electronic Mail Security
