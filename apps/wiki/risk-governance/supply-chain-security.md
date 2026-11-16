# Supply Chain Security

Supply chain attacks target the weakest link in a complex web of suppliers, vendors, and open-source dependencies. The SolarWinds, Kaseya, Log4Shell, and XZ Utils incidents demonstrate that supply chain compromise can achieve mass scale with surgical precision.

## Types of supply chain attacks

| Attack type | Example | Description |
|-------------|---------|-------------|
| Software build compromise | SolarWinds SUNBURST | Attacker injects malicious code into the build pipeline |
| Dependency confusion | 2021 public security research | Attacker publishes malicious package with same name as internal package |
| Open source package compromise | event-stream (2018) | Attacker takes over maintainership of popular package; inserts backdoor |
| Hardware supply chain | Bloomberg "Big Hack" reporting | Malicious chips implanted during manufacturing |
| Managed service provider (MSP) | Kaseya VSA (2021) | MSP software compromised to attack all MSP customers simultaneously |
| Typosquatting | npm, PyPI attacks | Malicious package with name similar to popular legitimate package |

## Software Supply Chain Security

### Software Bill of Materials (SBOM)

An SBOM is a formal, machine-readable inventory of all components in a software product — first-party code, open-source libraries, and transitive dependencies.

- Formats: **SPDX** (ISO/IEC 5962) and **CycloneDX** (OWASP)
- US Executive Order 14028 (2021) mandates SBOMs for software supplied to the US federal government
- UK guidance: NCSC encourages SBOM adoption for critical systems

SBOM benefits:
- Rapid identification of affected systems when a new CVE is disclosed (e.g., "which of our products use log4j?")
- Licence compliance visibility
- Supply chain transparency for customers

### Dependency management

- **Pin dependency versions** — use exact version pins in requirements files; avoid floating `latest`
- **Lock files** — commit `package-lock.json`, `poetry.lock`, `Gemfile.lock`; verify lock file integrity
- **Dependency scanning** — automated SCA (Software Composition Analysis): GitHub Dependabot, Snyk, OWASP Dependency-Check
- **Private registries** — use Artifactory or AWS CodeArtifact as a proxy for public registries; scan all packages before they enter your environment

### Securing the CI/CD pipeline

The build pipeline is a high-value target — compromise here affects all downstream deployments:

- **Separate build credentials** from production credentials
- **Sign build artefacts** — use Sigstore/cosign to cryptographically sign container images and binaries
- **Verify signatures** at deploy time — only deploy signed, verified artefacts
- **SLSA framework** (Supply-chain Levels for Software Artefacts) — four levels of build integrity assurance
- **Minimal build environment** — build containers should have only what is needed; no internet access during build where possible
- **Audit build logs** — monitor for unexpected outbound connections during builds

## Third-party / vendor risk management

### Vendor risk assessment

Before onboarding any vendor with access to your systems or data:
1. Security questionnaire (based on ISO 27001, Cyber Essentials, or SIG Lite)
2. Review certifications: ISO 27001, SOC 2 Type II, Cyber Essentials Plus
3. Review penetration test summaries (ask for exec summary of latest pentest)
4. Contractual controls: right to audit, incident notification SLA, data processing agreements

### Ongoing monitoring

- Annual re-assessment for critical vendors
- Monitor vendor security advisories and breach disclosures
- Subscribe to threat intelligence feeds that track vendor compromise
- Review shared access credentials and service account permissions quarterly

### Contract requirements

Include in vendor contracts:
- Security incident notification within 24–72 hours
- Right to audit (or accept third-party audit)
- Data processing agreement (GDPR Article 28)
- Minimum security standards (Cyber Essentials or equivalent)
- Data return/deletion on contract termination
- Subprocessor disclosure obligations

## NCSC supply chain guidance

The NCSC publishes a **12 principles for supply chain security** framework covering:
- Understand the risk
- Apply security controls to mitigate supply chain risk
- Validate controls applied by suppliers
- Continuous improvement

## Further reading

- NCSC Supply chain security guidance — [ncsc.gov.uk/supply-chain](https://www.ncsc.gov.uk/section/advice-guidance/all-topics/supply-chain)
- SLSA framework — [slsa.dev](https://slsa.dev)
- OWASP CycloneDX — [cyclonedx.org](https://cyclonedx.org)
- CISA Software Supply Chain Security guidance
- NIST SP 800-161r1 — Cybersecurity Supply Chain Risk Management
