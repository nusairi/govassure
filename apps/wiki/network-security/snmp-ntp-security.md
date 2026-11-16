# Securing SNMP & NTP

SNMP and NTP are critical management plane protocols. Misconfiguration of either can expose network devices to reconnaissance, manipulation, or amplification attacks.

## SNMP Security

### SNMP versions and security

| Version | Authentication | Encryption | Recommendation |
|---------|---------------|-----------|----------------|
| SNMPv1 | Community string (cleartext) | None | **Disable** |
| SNMPv2c | Community string (cleartext) | None | **Disable** |
| SNMPv3 | Username + MD5/SHA auth | DES/AES | **Use only this** |

SNMPv1 and v2c transmit community strings in cleartext and are vulnerable to:
- Community string disclosure via network sniffing
- Brute-force of default community strings ("public", "private")
- SNMP amplification DDoS (reflection attacks using SNMP GET-BULK)

### SNMPv3 security levels

| Level | Auth | Privacy |
|-------|------|---------|
| noAuthNoPriv | None | None |
| authNoPriv | MD5 or SHA | None |
| authPriv | MD5 or SHA | DES or AES-128/256 |

Always use **authPriv** with SHA-256 (or SHA-512) for authentication and AES-256 for privacy.

### SNMPv3 hardening

```
! Define a view — restrict what OIDs can be read
snmp-server view MGMT-VIEW iso included
snmp-server view MGMT-VIEW 1.3.6.1.2.1.1 included   ! system group only

! Create group with authPriv
snmp-server group MGMT-GROUP v3 priv read MGMT-VIEW

! Create user
snmp-server user nms-user MGMT-GROUP v3 auth sha StrOngP@ss1 priv aes 256 StrOngP@ss2

! Restrict to NMS IP
snmp-server host 10.10.40.10 version 3 priv nms-user
```

### SNMP ACL restriction

Bind SNMP to a management ACL that permits only the NMS (Network Management Station) IP:

```
snmp-server community UNUSED ro 99    ! if v2c is unavoidable, restrict to ACL 99
access-list 99 permit 10.10.40.10
access-list 99 deny any log
```

### SNMP traps vs polling

- Prefer **SNMPv3 informs** (acknowledged traps) over unacknowledged traps
- Restrict trap destination to the NMS IP
- Disable SNMP set if read-only monitoring is all that's needed

## NTP Security

### Why NTP matters for security

Accurate time is foundational to:
- **Log correlation** — events across devices must be timestamp-aligned
- **Certificate validation** — TLS certificates have validity periods
- **Kerberos authentication** — 5-minute clock skew tolerance
- **SIEM / SOAR** — investigation timelines depend on consistent time

A compromised NTP source can shift clocks to invalidate certificates, defeat Kerberos, and corrupt forensic timelines.

### NTP attack vectors

- **NTP amplification** — monlist command allows small queries to generate large responses (DDoS amplification)
- **Clock manipulation** — Injecting false NTP responses to shift device clocks
- **On-path attack** — Man-in-the-middle to replay or alter NTP packets

### NTP hardening

**Disable the monlist command (ntpd):**
```
restrict default kod nomodify notrap nopeer noquery
restrict 127.0.0.1
```

**NTP authentication (symmetric key or NTS):**
```
ntp authenticate
ntp authentication-key 1 md5 StrongNTPKey
ntp trusted-key 1
ntp server 10.10.40.20 key 1
```

For modern deployments, prefer **NTS (Network Time Security)** — RFC 8915 — which uses TLS to authenticate NTP exchanges.

**Cisco IOS NTP hardening:**
```
ntp access-group peer 10       ! only authorised NTP peers
ntp access-group serve-only 20 ! only serve time to authorised hosts
ntp access-group query-only 99 ! block unauthorised queries
ntp access-group serve 99

access-list 10 permit 10.10.40.20
access-list 20 permit 10.0.0.0 0.255.255.255
access-list 99 deny any

ntp source Loopback0   ! source NTP from loopback for stability
```

### NTP architecture

- Maintain **at least 3 internal NTP servers** (Stratum 2) syncing to public Stratum 1 sources
- All devices sync from internal servers only — block UDP 123 outbound from devices
- Use different NTP sources for redundancy (pool.ntp.org, time.cloudflare.com, etc.)
- NTP servers should be in the management zone, protected by firewall rules

## Further reading

- RFC 8915 — Network Time Security for NTP
- CVE-2013-5211 — NTP monlist DDoS amplification
- CIS Benchmark NTP/SNMP sections
- NIST SP 800-61r3 — Incident Handling (time correlation)
