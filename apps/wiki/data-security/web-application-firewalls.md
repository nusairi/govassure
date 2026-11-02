# Web Application Firewalls

A Web Application Firewall (WAF) inspects HTTP/S traffic and protects web applications from application-layer attacks including injection, XSS, and OWASP Top 10 vulnerabilities.

## WAF operation modes

| Mode | Behaviour |
|------|----------|
| **Detection (passive)** | Logs matches but does not block — used for tuning |
| **Prevention (active)** | Blocks requests matching rules |
| **Learning / positive security** | Builds a model of legitimate traffic; blocks deviations |

Always begin in detection mode to tune rules before enabling prevention.

## OWASP Core Rule Set (CRS)

The OWASP ModSecurity Core Rule Set is the de-facto standard open-source WAF rule set. It covers:

- SQL injection (SQLi)
- Cross-site scripting (XSS)
- Local/Remote File Inclusion (LFI/RFI)
- Remote Code Execution (RCE)
- HTTP protocol violations
- Scanner detection

### Paranoia levels

CRS has four paranoia levels: Level 1 (low false positives, widely applicable) through Level 4 (maximum protection, high tuning required). Start at Level 1; raise only for high-sensitivity applications.

## WAF deployment architectures

### Inline (reverse proxy)

The WAF sits directly in the HTTP traffic path:
```
Client → [WAF] → Web server
```
Provides full inspection and blocking capability.

### Out-of-band / passive

The WAF receives a copy of traffic (via TAP/SPAN). Detection only — no blocking capability.

### Cloud WAF (CDN-based)

DNS points to the CDN/WAF service, which proxies traffic to the origin:
```
Client → DNS → [Cloud WAF / CDN] → Origin server
```

Platforms: Cloudflare WAF, AWS WAF, Azure WAF, Akamai Kona Site Defender, Imperva WAF.

**Advantages:** No infrastructure to manage; DDoS mitigation included; global PoP coverage.
**Risks:** Origin server IP must be hidden (otherwise attackers bypass the WAF); traffic flows through a third party.

## WAF tuning

### Reducing false positives

1. Run in detection mode for 2–4 weeks
2. Review blocked requests for legitimate traffic
3. Create exceptions for known-good patterns (specific paths, parameters, source IPs)
4. Document every exception with business justification

### WAF bypass techniques (to test against)

- HTTP header injection and obfuscation
- Unicode / encoding tricks (URL encoding, hex encoding, double encoding)
- HTTP parameter pollution (HPP)
- Fragmented payloads
- Long payloads to exceed inspection limits

Test WAF effectiveness using tools: Nikto, OWASP ZAP, SQLMap, Burp Suite.

## API WAF considerations

Traditional WAF rules are designed for HTML form submissions. APIs require:
- **Schema validation** — validate JSON/XML body against OpenAPI spec
- **Rate limiting** — per-key, per-endpoint throttles
- **Bot detection** — distinguish API abuse from legitimate clients

Consider an API gateway with WAF capabilities (AWS API Gateway + WAF, Kong + WAAP) rather than a traditional WAF for pure API workloads.

## Virtual patching

A WAF can be used to **virtually patch** known vulnerabilities in web applications before a code fix is available:

1. CVE disclosed for your web application framework
2. WAF rule deployed to block the vulnerable request pattern within hours
3. Application code patched on normal release cycle

This reduces the time-to-patch for critical vulnerabilities from weeks to hours.

## Further reading

- OWASP ModSecurity Core Rule Set
- OWASP Top 10
- NIST SP 800-44 — Guidelines on Securing Public Web Servers
- Cloudflare WAF documentation
- AWS WAF Developer Guide
