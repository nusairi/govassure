# Operational Security (OPSEC)

Operational security (OPSEC) is the process of protecting information about your organisation, operations, and security posture that could be exploited by adversaries to plan or execute attacks.

## The OPSEC process

Originally a US military concept (NSC-329), OPSEC applies directly to enterprise security:

1. **Identify critical information** — what information, if obtained by an adversary, would harm you?
2. **Analyse threats** — who wants your critical information and why?
3. **Analyse vulnerabilities** — how could an adversary obtain the information?
4. **Assess risk** — what is the probability and impact of each vulnerability being exploited?
5. **Apply countermeasures** — what controls reduce the risk to acceptable levels?

## What adversaries gather from open sources

### OSINT (Open Source Intelligence)

Before attacking an organisation, adversaries perform reconnaissance using publicly available information:

- **Job postings** — reveal technology stack, security tools, and team structures ("Experience with CrowdStrike Falcon required")
- **LinkedIn** — identify IT and security staff; map org structure; find contractors
- **GitHub / code repositories** — leaked credentials, internal hostnames, API keys, network ranges
- **Certificate transparency logs** — enumerate subdomains (crt.sh)
- **Shodan / Censys** — discover internet-facing infrastructure and banner information
- **DNS records** — MX records reveal email security providers; SPF records reveal cloud providers
- **Company websites** — technology metadata, software version numbers in HTTP headers
- **Conference talks / papers** — architecture details shared publicly
- **Data breaches** — employee credentials on Have I Been Pwned; personal data for targeted phishing

## Countermeasures

### Information hygiene

- **Review job postings** — describe roles without naming specific security tools or architecture details
- **GitHub/code scanning** — automated scanning for secrets in code (GitHub Advanced Security, GitLeaks, truffleHog); block commits with credentials
- **HTTP header hardening** — remove version banners: `Server: nginx` not `Server: nginx/1.24.0`; remove `X-Powered-By` headers
- **Website metadata** — strip metadata from published documents (author names, internal path names from Office files)
- **DNS hygiene** — avoid naming internal systems in public DNS; minimise reverse DNS exposure

### Staff awareness

- Train staff to recognise social engineering — pretexting, vishing, spearphishing
- Define what is and is not shareable on social media about work
- Establish clear data classification — staff should know what is Internal vs Public
- Encourage reporting of suspicious contacts (recruiters asking unusual questions, unusual LinkedIn connection requests from new accounts)

### Security architecture OPSEC

- Avoid advertising which security tools you use publicly
- Use generic error pages — do not reveal WAF vendor, server version, or application framework
- Avoid publicly documenting network architecture in detail
- Conduct external attack surface reviews (using the same tools an attacker would) — Shodan, Censys, Certificate Transparency, DNS enumeration

### Incident OPSEC

During an active incident:
- Communicate via out-of-band channels (assume corporate email/Slack may be monitored by the attacker)
- Do not publicly announce the incident until contained (attacker may accelerate or change TTPs)
- Legal privilege — consider routing IR communications through legal counsel to preserve privilege

## Threat intelligence and OPSEC

Organisations should monitor for their own information appearing in:
- Paste sites (Pastebin, PrivateBin)
- Dark web forums (via threat intelligence services)
- Code repositories (GitHub secret scanning)
- Data breach notification services (Have I Been Pwned Enterprise, SpyCloud)

## Further reading

- NCSC Operational security guidance
- "Open Source Intelligence Techniques"
- SANS SEC487 — Open Source Intelligence (OSINT) Gathering and Analysis
- NSA OPSEC guidelines (unclassified)
