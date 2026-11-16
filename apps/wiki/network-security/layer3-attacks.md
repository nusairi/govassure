# Layer 3 Attacks & Mitigation

Layer 3 (IP) is the routing and addressing layer. Attacks at this layer target IP addresses, routing protocols, and the forwarding plane. Effective mitigation requires hardening at the router, routing protocol, and transit-filtering levels.

## Common Layer 3 attacks

### IP address spoofing

Attackers forge the source IP address to evade IP-based access controls, obscure origin, or amplify attacks (reflection/amplification). Most effective for UDP and ICMP-based attacks.

**Mitigation:** Unicast Reverse Path Forwarding (uRPF)

### Routing protocol attacks

If routing protocols (BGP, OSPF, EIGRP) are not authenticated, attackers can inject false routes:
- Divert traffic through attacker-controlled infrastructure (BGP hijacking)
- Black-hole legitimate destinations
- Cause instability via route flap

**Mitigation:** MD5/SHA authentication on all routing sessions; BGP RPKI (Route Origin Authorisation)

### ICMP attacks

- **Smurf attack** — spoofed ICMP echo to directed broadcast addresses (amplification)
- **Ping flood** — volumetric DoS
- **ICMP redirect** — manipulate routing on end hosts

**Mitigation:** Block directed broadcasts; rate-limit ICMP; disable ICMP redirects on routers

### Fragmentation attacks

Overlapping fragments can crash or bypass deep inspection engines. Teardrop, Bonk, and similar attacks exploit reassembly bugs.

**Mitigation:** Enforce reassembly at the firewall; apply IPS signatures for fragmentation abuse

### TTL manipulation

Crafted packets with low TTL values can expose intermediate hops or cause traceroute-based network mapping.

**Mitigation:** Limit ICMP TTL-exceeded responses at the perimeter

## Unicast Reverse Path Forwarding (uRPF)

uRPF verifies that the source IP of an incoming packet is reachable via the interface it arrived on.

- **Strict mode** — source IP must be reachable via the *same* interface (best on single-homed links)
- **Loose mode** — source IP must exist in the routing table via *any* interface (suitable for multi-homed)
- **Feasible path mode** — source IP is in the routing table as a feasible path via the arriving interface

```
interface GigabitEthernet0/0
  ip verify unicast source reachable-via rx   ! strict mode
```

Apply uRPF at all customer-facing and internet-facing interfaces to drop spoofed source addresses.

## BGP security

### Route Origin Authorisation (ROA) and RPKI

RPKI (Resource Public Key Infrastructure) allows IP address holders to cryptographically sign which ASes are authorised to originate their prefixes. Routers perform Route Origin Validation (ROV):

- **Valid** — prefix and origin AS match an ROA
- **Invalid** — origin AS does not match the ROA (drop or deprioritise)
- **Not found** — no ROA exists (accept with lower preference)

### BGP prefix filtering

Define explicit prefix lists for eBGP peers — accept only the prefixes you expect from each peer:

```
ip prefix-list PEER-IN seq 10 permit 203.0.113.0/24
ip prefix-list PEER-IN seq 20 permit 198.51.100.0/23

router bgp 65001
  neighbor 192.0.2.1 prefix-list PEER-IN in
```

### BGPSEC

BGPSEC adds cryptographic path validation to BGP UPDATE messages, protecting against path manipulation (not just origin). Deployment is currently limited.

## Transit filtering best practices

- Filter RFC 1918 (private), RFC 5737 (documentation), and bogon prefixes at internet-facing interfaces
- Apply egress filtering to prevent spoofed source addresses leaving your network (BCP38)
- Use RTBH (Remotely Triggered Black Hole) for volumetric DDoS mitigation — see [Bogon Filtering, Blackholes & Darknets](./bogon-blackholes-darknets)

## Further reading

- BCP38 — Network Ingress Filtering (RFC 2827)
- RFC 3704 — Ingress Filtering for Multihomed Networks
- MANRS — Mutually Agreed Norms for Routing Security
- NIST SP 800-54 — Border Gateway Protocol Security
