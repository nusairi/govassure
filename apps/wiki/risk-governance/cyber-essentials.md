# Cyber Essentials

Cyber Essentials is a UK government-backed certification scheme that helps organisations protect against the most common internet-based cyber threats. It defines five fundamental security controls and provides a certifiable baseline applicable to any organisation regardless of size or sector.

## Why Cyber Essentials matters

- **UK government contracts** — mandatory for all suppliers bidding for UK government contracts involving sensitive information or personal data
- **Insurance** — many cyber insurers require or discount premiums for certified organisations
- **Supply chain** — increasingly required by enterprise customers as a baseline assurance
- **Incident data** — the NCSC estimates Cyber Essentials controls prevent the vast majority of commodity cyber attacks

## The five controls

### 1. Firewalls

- A firewall (or equivalent boundary device) must be in place at every internet connection
- Default-deny: only required services exposed; all others blocked
- Applies to: perimeter firewalls, host-based firewalls on internet-connected devices

### 2. Secure configuration

- Change default credentials on all devices and software
- Remove or disable unnecessary software, services, and accounts
- Apply security settings appropriate to the device's function
- Applies to: all internet-connected devices, servers, and cloud services in scope

### 3. User access control

- Only create user accounts for people who need them
- Principle of least privilege: accounts have access only to what they need
- Admin accounts used only for admin tasks; separate from day-to-day user accounts
- MFA for cloud services and remote access accounts (CE+ requirement since 2023)

### 4. Malware protection

- Protect against malware on all internet-connected devices
- Options: anti-malware software, application allow-listing, or sandboxing
- Keep anti-malware up to date

### 5. Patch management (security update management)

- Apply security updates within 14 days of release (for Critical/High vulnerabilities)
- Remove unsupported software that no longer receives updates
- Applies to: all in-scope software, OS, firmware, and apps

## Certification levels

| Level | Assessment method |
|-------|------------------|
| **Cyber Essentials** | Self-assessment questionnaire verified by a certifying body |
| **Cyber Essentials Plus** | All of the above, plus independent technical verification (vulnerability scan, configuration testing) |

## Scope definition

Organisations can certify their whole organisation or a defined scope (e.g., a specific division or system). The scope must include all internet-connected systems and the people and processes that support them.

Common scoping approaches:
- **Whole organisation** — simplest; most comprehensive
- **Cloud-only scope** — SaaS and cloud services only; suitable for cloud-first organisations
- **Specific system** — for organisations that need to certify a specific contract deliverable

## Cyber Essentials Plus technical testing

CE+ adds hands-on technical verification:
- External vulnerability scan from the internet
- Internal authenticated scan from within the network
- Device configuration review (sample of endpoints)
- Email and web browsing test (malware/phishing simulation)

## How to get certified

1. Select an NCSC-approved certifying body (list at ncsc.gov.uk)
2. Define your scope
3. Complete the self-assessment questionnaire (CE) or engage assessor (CE+)
4. Remediate any failures
5. Receive certificate (valid 12 months; annual renewal required)

## Relation to other frameworks

| Framework | Relationship to Cyber Essentials |
|-----------|--------------------------------|
| ISO 27001 | CE is a subset; ISO 27001 is far broader and more complex |
| NCSC CAF | CE aligns to CAF Goal B (protection); CAF is comprehensive for CNI |
| CIS Controls | CIS Implementation Group 1 maps closely to CE |
| IASME Cyber Assurance | Intermediate framework between CE and ISO 27001 |

## Further reading

- NCSC Cyber Essentials — [ncsc.gov.uk/cyberessentials](https://www.ncsc.gov.uk/cyberessentials/overview)
- Cyber Essentials requirements document (NCSC)
- IASME Consortium (major certifying body)
