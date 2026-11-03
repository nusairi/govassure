# People-Centred Security

Technical controls alone cannot secure an organisation. People — employees, contractors, and leadership — are both a significant vulnerability and, when properly engaged, a powerful security asset. People-centred security focuses on designing security programmes that account for human behaviour rather than treating people as a problem to be overcome.

## Why people-centred security matters

- Phishing remains the primary initial access vector in most breaches
- Security fatigue and alert overload lead to poor decisions
- Security controls that are too restrictive lead to shadow IT and workarounds
- A positive security culture generates voluntary reporting of incidents and near-misses

The NCSC explicitly includes people-centred security as a topic because organisations that treat security as purely a technical problem consistently underperform those that engage their workforce.

## Security awareness training

### What works and what doesn't

**Ineffective approaches:**
- Annual compliance-driven e-learning (ticked as done; forgotten immediately)
- Generic, non-contextual training
- Blaming and shaming individuals who click phishing simulations
- Training that focuses on rules without explaining the "why"

**Effective approaches:**
- **Short, frequent, relevant** training (5–10 minute modules monthly rather than 1 hour annually)
- **Role-based training** — finance team receives BEC-focused training; developers receive secure coding training
- **Simulated phishing** — as a learning tool, not a gotcha; debrief and educate, do not punish
- **Storytelling** — real-world breach examples relevant to the organisation's sector
- **Just-in-time training** — present a learning moment immediately after a user clicks a simulated phish

### NCSC's "Forget compliance, focus on behaviour" approach

The NCSC advocates shifting from compliance mindset ("did everyone complete the training?") to behaviour change ("are people actually making better security decisions?").

Measure outcomes, not inputs:
- Phishing simulation click rate trend (down over time)
- Reported phishing/suspicious emails (up over time — more reporting is good)
- Password reset requests (down as passwordless/SSO is adopted)
- Shadow IT incidents (down as approved tools meet user needs)

## Reducing friction

Security controls that create excessive friction are bypassed:
- If MFA is too cumbersome, users will share credentials
- If VPN is too slow, users will access resources directly
- If the approved tool doesn't work, users will use an unapproved one

Design security to minimise friction for legitimate use cases while maximising friction for attackers:
- SSO reduces login friction while centralising authentication
- Password managers make strong unique passwords practical
- ZTNA provides better user experience than VPN for many use cases

## Insider threat

### Types of insider threat

| Type | Description |
|------|-------------|
| Malicious | Intentional harm — data theft, sabotage |
| Negligent | Accidental harm — misconfiguration, data loss |
| Compromised | Legitimate user whose credentials or account has been taken over |

### Detecting insider threats

- UEBA — baseline normal behaviour; alert on deviations (see [AI, Analytics & SIEM](/analytics/ai-analytics-siem))
- Data loss prevention — detect bulk data access or exfiltration
- Privileged access monitoring — PAM session recording for admin accounts
- Joiners/movers/leavers process — promptly revoke access on departure; review access on role change

### Responding proportionately

Insider threat programmes must balance security with employee privacy and legal obligations. In the UK:
- Data monitoring must be proportionate and disclosed in employment policies
- GDPR applies to employee monitoring
- Engage HR and legal before implementing monitoring programmes

## Security culture

A positive security culture has these characteristics:
- Leadership models secure behaviour (they use MFA; they don't share passwords)
- Reporting is encouraged and rewarded — no blame culture for honest mistakes
- Security is seen as a business enabler, not a blocker
- Security team is approachable — employees ask before doing something risky

### Measuring security culture

- Regular staff surveys on security attitudes
- Near-miss / good-catch reporting rates
- Security team NPS (Net Promoter Score from internal customers)

## Further reading

- NCSC People-centred security — [ncsc.gov.uk/people-centred-security](https://www.ncsc.gov.uk/section/advice-guidance/all-topics/people-centred-security)
- NCSC "A board-level responsibility" guidance
- SANS Security Awareness programme maturity model
- ENISA "Cybersecurity Culture Guidelines"
