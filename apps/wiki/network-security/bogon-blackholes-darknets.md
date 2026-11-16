# Bogon Filtering, Blackholes & Darknets

Bogon filtering, remotely triggered black holes (RTBH), and darknets are three complementary techniques for identifying and suppressing malicious or invalid network traffic.

## Bogon filtering

A **bogon** is an IP address that should never appear as a source or destination on the public internet — either because it is a private/reserved range or because it has not been assigned to any organisation.

### Bogon categories

| Category | Examples |
|----------|---------|
| RFC 1918 private | 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 |
| RFC 5737 documentation | 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 |
| RFC 6598 shared address | 100.64.0.0/10 |
| Link-local | 169.254.0.0/16 |
| Loopback | 127.0.0.0/8 |
| Multicast | 224.0.0.0/4 |
| Reserved/unallocated | Ranges not yet delegated by IANA/RIRs |
| IPv6 bogons | ::/128, ::1/128, fc00::/7, fe80::/10, 2001:db8::/32 |

### Implementing bogon filters

Bogon prefixes should be dropped at all internet-facing interfaces using a prefix-list ACL:

```
ip prefix-list BOGON-DENY seq 5 deny 0.0.0.0/8 le 32
ip prefix-list BOGON-DENY seq 10 deny 10.0.0.0/8 le 32
ip prefix-list BOGON-DENY seq 15 deny 100.64.0.0/10 le 32
ip prefix-list BOGON-DENY seq 20 deny 127.0.0.0/8 le 32
ip prefix-list BOGON-DENY seq 25 deny 169.254.0.0/16 le 32
ip prefix-list BOGON-DENY seq 30 deny 172.16.0.0/12 le 32
ip prefix-list BOGON-DENY seq 35 deny 192.0.0.0/24 le 32
ip prefix-list BOGON-DENY seq 40 deny 192.0.2.0/24 le 32
ip prefix-list BOGON-DENY seq 45 deny 192.168.0.0/16 le 32
ip prefix-list BOGON-DENY seq 50 deny 198.18.0.0/15 le 32
ip prefix-list BOGON-DENY seq 55 deny 198.51.100.0/24 le 32
ip prefix-list BOGON-DENY seq 60 deny 203.0.113.0/24 le 32
ip prefix-list BOGON-DENY seq 65 deny 224.0.0.0/4 le 32
ip prefix-list BOGON-DENY seq 70 deny 240.0.0.0/4 le 32
ip prefix-list BOGON-DENY seq 1000 permit 0.0.0.0/0 le 32
```

Apply in both directions: drop bogon sources arriving inbound (BCP38) and drop bogon destinations leaving outbound.

**Maintain bogon lists** — as IANA allocates previously unallocated space, bogon lists need updating. Consider subscribing to Team Cymru's Bogon Reference project or Spamhaus' BGP feed.

## Remotely Triggered Black Hole (RTBH)

RTBH is a technique to discard traffic destined for (or sourced from) a specific prefix by installing a black-hole route on routers via BGP. It is primarily used to mitigate volumetric DDoS attacks.

### Destination-based RTBH (D-RTBH)

Traffic destined for the victim's prefix is dropped at the upstream router or at peering points:

1. Victim's router announces victim-prefix/32 with community 666 (or ISP-defined RTBH community) to upstream ISP
2. ISP sets next-hop to a null interface for that prefix across its network
3. Attack traffic is dropped before reaching the victim's link

**Trade-off:** The victim prefix becomes unreachable — the attack is stopped, but legitimate traffic is also dropped. Acceptable when the alternative is total saturation.

### Source-based RTBH (S-RTBH)

Traffic from a specific source prefix (known attacker IP) is dropped:

1. Security team identifies attacking source IPs from flow data
2. Routes for those sources are redistributed into BGP with a black-hole community
3. Routers drop packets from those sources at ingress

Source RTBH is more surgical but requires real-time threat intelligence to identify attacker IPs quickly.

## Darknets (network telescopes)

A darknet (or network telescope) is a block of IP address space that is routed but has no legitimate services. Any traffic arriving at a darknet represents:

- Backscatter from spoofed-source DDoS attacks
- Scanning activity (worms, vulnerability scanners)
- Misconfigured services
- Malware C2 beaconing to expired/sinkholed IPs

### Darknet deployment

1. Allocate an unused subnet (e.g., /24)
2. Route it to a collector (a server running a packet capture daemon such as `tcpdump` or Argus)
3. Analyse incoming traffic for threat intelligence signals

Darknet traffic provides early warning of new scanning campaigns, worm propagation, and DDoS backscatter — without any false positive risk (no legitimate traffic should arrive).

### Honeypot vs darknet

A darknet is passive — it captures but does not respond. A honeypot (or honeynet) actively responds to induce adversaries to interact, revealing their TTPs. Both are valuable intelligence tools; darknets scale more easily.

## Further reading

- Team Cymru Bogon Reference — [team-cymru.com/Community/Bogons](https://www.team-cymru.com/bogon-reference.html)
- RFC 5635 — Remote Triggered Black Hole Filtering
- CAIDA Network Telescope project
- SANS Internet Storm Center (darknet data contributor)
