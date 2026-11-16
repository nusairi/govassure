# Network Encryption

Network encryption protects data in transit from eavesdropping, tampering, and impersonation. This page covers TLS, MACsec, IPsec, and the principles of selecting and configuring encryption across the network stack.

## TLS (Transport Layer Security)

TLS is the dominant protocol for encrypting application-layer communications over IP networks.

### TLS versions

| Version | Status | Notes |
|---------|--------|-------|
| TLS 1.0 | Deprecated (RFC 8996) | Vulnerable to POODLE, BEAST — disable |
| TLS 1.1 | Deprecated (RFC 8996) | Disable |
| TLS 1.2 | Widely deployed | Acceptable with strong cipher suites |
| TLS 1.3 | Current | Preferred; mandatory forward secrecy; 0-RTT resumption option |

### TLS 1.3 improvements

- **Forward secrecy always** — ECDHE key exchange is mandatory
- **Fewer round trips** — 1-RTT handshake (vs 2-RTT in TLS 1.2)
- **Simplified cipher suites** — only AEAD ciphers (AES-GCM, ChaCha20-Poly1305)
- **Encrypted handshake** — certificate and extensions encrypted in ClientHello onwards

### Recommended TLS configuration

For TLS 1.2 servers (where TLS 1.3 is not supported by all clients):

```
# Nginx TLS configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

### Certificate management

- Use certificates from a trusted CA (public CA for internet-facing; internal CA for internal services)
- Key size: RSA 2048-bit minimum (4096-bit for long-lived certificates); ECDSA P-256 preferred
- Certificate lifetime: ≤ 90 days for public-facing (encourage automation); ≤ 1 year for internal
- Automate renewal: ACME (Let's Encrypt), AWS ACM, Azure Key Vault certificates
- Monitor certificate expiry: alert at 30 days, escalate at 7 days

## MACsec (IEEE 802.1AE)

MACsec provides hop-by-hop encryption at Layer 2 — between network devices on a LAN segment. It protects traffic on internal links that are physically accessible (e.g., data centre switch fabric, campus wiring closets).

### MACsec vs TLS/IPsec

| Property | MACsec | TLS | IPsec |
|----------|--------|-----|-------|
| Layer | 2 | 7 | 3 |
| Hop-by-hop vs end-to-end | Hop-by-hop | End-to-end | End-to-end |
| Hardware offload | Common | Less common | Common |
| Overhead | ~32 bytes per frame | Moderate | Moderate |
| Use case | LAN segments, dark fibre | Application traffic | Site-to-site, remote access |

### Where to apply MACsec

- Data centre inter-switch links (where physical access cannot be guaranteed)
- Dark fibre / leased line WAN links
- Connections to colocation facilities
- High-security internal links (trading floors, government, defence)

## IPsec

IPsec is the standard for encrypting IP traffic at Layer 3. See [VPNs, ZTNA & SASE](./vpn-ztna-sase) for VPN application.

### IPsec modes

- **Transport mode** — encrypts only the payload; original IP header intact (host-to-host)
- **Tunnel mode** — encapsulates the entire original packet in a new IP header (gateway-to-gateway; most common for VPN)

### Recommended IPsec parameters (2024+)

```
IKE version:   IKEv2
Encryption:    AES-256-GCM or AES-256-CBC
Integrity:     SHA-384 or SHA-512
DH/PFS group:  Group 19 (P-256) or Group 20 (P-384)
Authentication: RSA-4096 or ECDSA-P-384 certificates
Lifetime:      IKE SA 86400s, IPsec SA 3600s
```

## Encryption in transit principles

1. **Default to encryption** — all traffic should be encrypted unless there is a specific reason not to
2. **No self-signed certificates in production** — use a trusted CA
3. **Enforce minimum TLS version** — reject TLS 1.0/1.1 at all enforcement points
4. **Perfect Forward Secrecy** — use ECDHE; session keys not recoverable if long-term key is compromised
5. **Certificate pinning** — for high-security applications; pins expected certificate or public key
6. **HSTS** — enforce HTTPS in browsers; include in preload list for public-facing sites
7. **Quantum readiness** — begin inventory of cryptographic dependencies; plan migration to post-quantum algorithms (NIST PQC standards: CRYSTALS-Kyber, CRYSTALS-Dilithium)

## Further reading

- RFC 8446 — TLS 1.3
- RFC 8996 — Deprecating TLS 1.0 and 1.1
- IEEE 802.1AE — MACsec
- NIST Post-Quantum Cryptography Standards (FIPS 203, 204, 205)
- Mozilla SSL Configuration Generator
