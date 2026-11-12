# Application Security Testing

Secure applications require security to be embedded throughout the development lifecycle, not bolted on after release. This page covers the primary testing disciplines — SAST, DAST, IAST, RASP — and the Secure SDLC framework that connects them.

## Secure SDLC

A Secure Software Development Lifecycle (SSDLC or Secure SDLC) integrates security activities at every phase of software development rather than treating security as a gate before release.

### Phases and security activities

| Phase | Security activity |
|-------|------------------|
| Requirements | Security requirements elicitation; threat modelling inputs |
| Design | Threat modelling (STRIDE/PASTA); architecture review; abuse case analysis |
| Development | Secure coding standards; IDE plugins (linting, SAST in-IDE); dependency scanning (SCA) |
| Testing | SAST, DAST, IAST, penetration testing; OWASP Top 10 checks |
| Deployment | Pipeline security gates; secrets scanning; IaC scanning (CSPM integration) |
| Operations | Runtime protection (RASP); vulnerability management; incident response |

### Key standards and frameworks

- **OWASP Software Assurance Maturity Model (SAMM)** — framework for measuring and improving software security practices across governance, design, implementation, verification, and operations
- **BSIMM (Building Security in Maturity Model)** — data-driven model based on observed software security activities across real organisations
- **NIST SP 800-218 (SSDF)** — Secure Software Development Framework; aligns with US federal requirements

---

## SAST — Static Application Security Testing

SAST analyses source code, bytecode, or compiled binaries **without executing the program**. It is run early in the pipeline ("shift left"), ideally as a pre-commit or CI check.

### How SAST works

The tool parses code into an abstract syntax tree (AST) and applies rules to detect patterns associated with vulnerabilities: SQL query construction from untrusted input, missing input validation, hard-coded secrets, use of deprecated cryptographic functions.

### Strengths and limitations

| Strengths | Limitations |
|-----------|------------|
| Early feedback — catches issues before code ships | High false-positive rate without tuning |
| Full code coverage — every path analysed | Cannot detect logic flaws or runtime behaviour |
| Integrates into CI/CD pipelines | Requires access to source code |
| Supports developer education | Language-specific tools; coverage varies |

### Common tools

- **Semgrep** — fast, rule-based; good custom rule support
- **SonarQube / SonarCloud** — broad language coverage; technical debt tracking
- **Checkmarx / Veracode** — enterprise-grade; broad language support
- **Snyk Code** — developer-friendly; integrates with IDE and CI
- **Bandit** (Python), **ESLint security plugins** (JS), **SpotBugs** (Java)

---

## DAST — Dynamic Application Security Testing

DAST tests a **running application from the outside**, simulating the behaviour of an attacker. It requires no access to source code — it probes the application through its exposed interfaces (HTTP, APIs).

### How DAST works

DAST crawls or drives the application, injects payloads (SQL injection strings, XSS payloads, path traversal sequences), and analyses responses for evidence of vulnerabilities. Modern DAST tools can be scripted against authenticated workflows using browser automation.

### Strengths and limitations

| Strengths | Limitations |
|-----------|------------|
| Tests real runtime behaviour | Limited code coverage — only reachable paths |
| Language-agnostic | Slower than SAST; not suitable for every CI run |
| Finds runtime issues SAST cannot detect | May require authentication setup |
| Confirms exploitability of findings | Can generate load or side effects in test environments |

### Common tools

- **OWASP ZAP** — open source; active and passive scanning; API testing
- **Burp Suite** (Professional) — de-facto standard for manual and automated web testing
- **Invicti (Netsparker) / Acunetix** — automated; low false-positive rates
- **StackHawk** — developer-first DAST; CI/CD native

---

## IAST — Interactive Application Security Testing

IAST instruments a running application **during functional or automated testing**, combining the code-level visibility of SAST with the runtime context of DAST.

### How IAST works

An IAST agent is deployed alongside the application (typically as a language agent or bytecode instrumentation). As tests execute, the agent monitors data flows inside the application, detecting vulnerabilities only where tainted input actually reaches a sensitive sink — dramatically reducing false positives.

### Strengths and limitations

| Strengths | Limitations |
|-----------|------------|
| High accuracy — confirms real data flow | Requires instrumentation support for the language/runtime |
| Real-time feedback during test runs | Not suitable for all languages or architectures |
| No source code required | Coverage limited to executed code paths |
| Low false-positive rate | Can add runtime overhead |

### Common tools

- **Contrast Security Assess** — mature IAST; broad language support
- **Seeker by Synopsys** — integrates with existing test frameworks
- **HCL AppScan** — enterprise IAST capabilities

---

## RASP — Runtime Application Self-Protection

RASP embeds protection **inside the running application itself**, enabling it to detect and block attacks in real time using runtime context — not just network signatures.

### How RASP works

A RASP agent instruments the application runtime (JVM, CLR, Node.js). When a function call is made (e.g., executing a SQL query, loading a file), the RASP checks whether the input to that call appears attacker-controlled. If so, it can block the call, log it, or alert — without needing to patch the underlying vulnerability.

### RASP vs WAF

| Dimension | WAF | RASP |
|-----------|-----|------|
| Position | Network perimeter | Inside the application runtime |
| Context | HTTP request/response | Internal function calls and data flows |
| Evasion | Susceptible to obfuscation and encoding tricks | Context-aware; harder to evade |
| Coverage | All application traffic | Applications where agent is deployed |
| False positives | Higher | Lower (runtime context) |

RASP and WAF are complementary, not alternatives: WAF provides perimeter protection; RASP provides in-application protection where WAF rules may fail.

### Common tools

- **Contrast Security Protect** — production RASP; same agent as Contrast Assess (IAST)
- **Sqreen (now Datadog)** — in-app RASP and monitoring
- **OpenRASP** (Baidu) — open-source Java/PHP RASP

---

## Combining the disciplines

A mature application security programme uses all four disciplines in complementary layers:

```
Developer IDE        → SAST (in-IDE linting, pre-commit hooks)
CI pipeline          → SAST + SCA (dependency scanning) + secrets scanning
Test/staging         → DAST + IAST (during automated functional test runs)
Production           → RASP (runtime protection)
Scheduled / manual   → Penetration testing, API security testing
```

### Software Composition Analysis (SCA)

SCA analyses third-party and open-source dependencies for known vulnerabilities (CVEs) and licence issues. It is a distinct discipline that complements SAST. Tools include: Snyk Open Source, Dependabot, OWASP Dependency-Check, Black Duck.

---

## API Security Testing

APIs are increasingly the primary attack surface. API security testing extends DAST and manual testing to:

- **Authentication and authorisation** — test for broken object-level authorisation (BOLA/IDOR), broken function-level authorisation
- **Schema validation** — fuzz inputs beyond schema constraints; test for mass assignment
- **Rate limiting** — verify throttling controls are in place
- **OWASP API Security Top 10** — structured checklist covering the most critical API risks

Tools: Burp Suite, OWASP ZAP (API scanning mode), Postman, Schemathesis (OpenAPI fuzzing).

---

## Further reading

- OWASP Testing Guide
- OWASP API Security Top 10
- OWASP SAMM
- NIST SP 800-218 — Secure Software Development Framework (SSDF)
- "The Web Application Hacker's Handbook"
