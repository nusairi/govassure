# Post-Quantum Cryptography

Quantum computers, when sufficiently powerful, will break the public-key cryptographic algorithms that underpin virtually all secure communications today — RSA, ECDSA, ECDH, and Diffie-Hellman. Migrating to quantum-resistant (post-quantum) cryptography is one of the most significant infrastructure changes the industry faces in the coming decade.

## The threat from quantum computers

### Harvest now, decrypt later (HNDL)

Nation-state adversaries are believed to be collecting encrypted traffic today with the intent to decrypt it once a cryptographically relevant quantum computer (CRQC) is available. Data encrypted today with RSA-2048 or ECDH P-256 is at risk if:

- The data has long-term sensitivity (classified material, health records, trade secrets)
- A CRQC becomes available within the data's sensitivity lifetime

**Action required now:** Begin migrating data with long-term sensitivity, even before CRQC exists.

### Shor's algorithm

Shor's algorithm, running on a CRQC, breaks:
- **RSA** (factoring) — used in TLS certificates, SSH, S/MIME
- **ECDSA / ECDH** (elliptic curve discrete log) — used in TLS 1.3, code signing, blockchain
- **DH / DSA** (discrete log) — older TLS cipher suites, SSH

Shor's algorithm does **not** break symmetric cryptography (AES) or hash functions (SHA-256), though Grover's algorithm halves their effective key length — AES-256 remains adequate.

### NCSC migration timelines

The NCSC published migration timeline guidance in 2025/2026:

- **By 2028** — identify and inventory all cryptographic dependencies
- **By 2031** — migrate highest-risk and longest-lived data and systems
- **By 2035** — complete migration for all systems

## NIST Post-Quantum Cryptography Standards

NIST finalised the first three PQC standards in 2024:

| Standard | Algorithm | Purpose |
|----------|-----------|---------|
| **FIPS 203** | ML-KEM (CRYSTALS-Kyber) | Key encapsulation / key exchange |
| **FIPS 204** | ML-DSA (CRYSTALS-Dilithium) | Digital signatures |
| **FIPS 205** | SLH-DSA (SPHINCS+) | Digital signatures (hash-based, conservative) |

A fourth standard, **FIPS 206** (FN-DSA / FALCON), is expected imminently.

### Algorithm selection guidance

- **Key exchange / TLS:** Use **ML-KEM (Kyber)** for key encapsulation; combine with ECDH P-256 in hybrid mode during transition
- **Digital signatures:** Use **ML-DSA (Dilithium)** for general signatures; **SLH-DSA** for conservative/high-assurance use cases
- **Code signing / PKI:** Begin planning CA migration to ML-DSA

## Hybrid cryptography (transition approach)

During migration, combine classical and post-quantum algorithms:

```
TLS 1.3 + X25519Kyber768 (hybrid key exchange)
= ECDH X25519 (classical) + ML-KEM-768 (post-quantum)
```

Hybrid mode ensures:
- Security against classical attackers (existing protection)
- Security against quantum attackers (new PQC)
- Forward compatibility — if either algorithm is later broken, the other still protects

Cloudflare, Google, and major browsers have implemented hybrid TLS since 2023.

## Migration roadmap

### Phase 1: Inventory (now)
- Catalogue all systems using RSA, ECDH, ECDSA, DH
- Prioritise by data sensitivity and system lifetime
- Identify cryptographic dependencies in: TLS certificates, SSH keys, code signing, VPN (IKE), S/MIME, PDF/document signing

### Phase 2: Prioritise
- **Highest priority:** Long-lived sensitive data; PKI / CA infrastructure; government and defence systems
- **High priority:** TLS for internet-facing services; VPN / IPsec endpoints
- **Medium priority:** Internal systems; short-lived data

### Phase 3: Migrate
- Update TLS libraries (OpenSSL 3.x, BoringSSL, AWS-LC) — most already support Kyber/ML-KEM
- Update certificate issuance (CA software migration to ML-DSA)
- Update SSH implementations (OpenSSH 9.0+ supports hybrid ECDH + Kyber)
- Update VPN/IKE configurations as vendor support arrives

### Phase 4: Validate
- Cryptographic agility — design systems to swap algorithms without full re-architecture
- Audit tooling — confirm no legacy RSA/ECDH in use post-migration

## Crypto-agility

Systems should be designed for **cryptographic agility** — the ability to update algorithms without rewriting the system:
- Abstract cryptographic operations behind interfaces
- Store algorithm identifiers alongside ciphertext
- Avoid hardcoding specific algorithms in application logic

## Further reading

- NCSC PQC migration timelines — [ncsc.gov.uk/guidance/pqc-migration-timelines](https://www.ncsc.gov.uk/guidance/pqc-migration-timelines)
- NIST PQC project — [csrc.nist.gov/projects/post-quantum-cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- NIST FIPS 203, 204, 205
- ETSI Quantum Safe Cryptography working group
- [Network Encryption](/network-app-security/network-encryption)
