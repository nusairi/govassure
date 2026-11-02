# Penetration Testing

Penetration testing (pen testing) is authorised, simulated attack activity designed to identify exploitable vulnerabilities before real attackers do. It is a key assurance mechanism — complementing automated scanning with human creativity and adversarial thinking.

## Types of penetration testing

| Type | Description |
|------|-------------|
| **External network** | Attack the organisation from the internet; identify exposed services and vulnerabilities |
| **Internal network** | Simulate an insider or post-breach attacker; test lateral movement controls |
| **Web application** | Test a specific web application for OWASP Top 10 and custom vulnerabilities |
| **API** | Test REST/GraphQL/SOAP APIs for authentication, authorisation, and injection flaws |
| **Mobile application** | Test iOS/Android apps for client-side vulnerabilities, insecure storage, API weaknesses |
| **Social engineering** | Phishing, vishing, or physical intrusion attempts |
| **Red team exercise** | Full-scope, goal-based adversary simulation (see below) |
| **Cloud configuration review** | Review cloud IAM, storage, and network configuration for misconfigurations |

## Knowledge levels

| Level | Tester knowledge | Simulates |
|-------|----------------|-----------|
| **Black box** | No prior knowledge | External attacker |
| **Grey box** | Partial knowledge (e.g., low-privilege account) | Insider or post-phish attacker |
| **White box** | Full knowledge (architecture docs, source code) | Insider or thorough assessment |

## Red team vs penetration test

| Dimension | Penetration test | Red team |
|-----------|-----------------|---------|
| Scope | Defined (specific systems/apps) | Goal-based (e.g., "access payroll data") |
| Duration | Days to weeks | Weeks to months |
| Stealth | Not required | Full stealth; avoid detection |
| Blue team knowledge | Usually notified | Covert (no advance notice) |
| Primary output | Vulnerability list | Assessment of detection and response capability |
| Cost | Lower | Higher |

## UK certification schemes

### CREST

CREST (Council of Registered Ethical Security Testers) is the primary UK/international professional body for penetration testing organisations and individuals. CREST certifications:
- **CRT** (CREST Registered Tester) — entry level
- **CCT** (CREST Certified Tester) — App/Infra specialisation
- **CCSAS** (Simulated Attack Specialist) — red team
- **CCSAM** (Simulated Attack Manager) — red team management

### CHECK

CHECK is a UK government scheme for penetration testing of HMG (His Majesty's Government) and CNI systems. Required for government contracts involving sensitive systems:
- **CHECK Team Leader** — leads CHECK engagements
- **CHECK Team Member** — conducts testing under a Team Leader

### Cyber Scheme

CSTL (Cyber Scheme Team Leader) and CSTM (Cyber Scheme Team Member) — an alternative to CHECK for government work.

### TIGER

TIGER Scheme provides individual certifications with a practical examination component.

## Scoping a penetration test

A well-scoped test produces more actionable results. Define:

- **Scope** — specific IP ranges, domains, applications in scope; explicitly excluded systems
- **Test type** — external/internal/application/red team
- **Start and end time** — testing window; any blackout periods (e.g., avoid month-end close)
- **Rules of engagement** — what is and is not permitted (DDoS? Destructive testing? Social engineering?)
- **Emergency contact** — who to call if a tester finds active compromise or causes an outage
- **Data handling** — how pentest reports and discovered credentials are stored and destroyed

### Get-out-of-jail card

Always issue a signed letter of authority to testers, specifying:
- Organisation name
- Tester name/company
- Scope
- Authorised activity
- Date range

This protects both the organisation and the testers.

## Using pentest findings

A pentest report is only valuable if acted upon:

1. **Triage findings** — validate and prioritise by exploitability and business impact
2. **Assign owners** — each finding must have a responsible remediation owner
3. **Remediate** — fix within the SLA defined by severity
4. **Verify** — re-test to confirm remediation (most pentest contracts include a free re-test)
5. **Track metrics** — number of findings; average time to remediate; severity trend over time

## Testing frequency

| Activity | Recommended frequency |
|----------|-----------------------|
| External network pentest | Annually minimum; after major infrastructure changes |
| Web application pentest | Annually; after major application releases |
| Internal network / red team | Annually for large/high-risk organisations |
| Cloud configuration review | After significant cloud architecture changes |
| Social engineering | Included in annual red team or run separately |

## Further reading

- NCSC Penetration testing guidance — [ncsc.gov.uk/penetration-testing](https://www.ncsc.gov.uk/section/advice-guidance/all-topics/penetration-testing)
- CREST — [crest-approved.org](https://www.crest-approved.org)
- OWASP Testing Guide v4.2
- PTES (Penetration Testing Execution Standard)
- NIST SP 800-115 — Technical Guide to Information Security Testing
