# Cloud Service Models & Security

The four primary cloud service models — IaaS, PaaS, SaaS, and FaaS — each shift a different amount of infrastructure management to the cloud provider and with it a different set of security responsibilities for the customer.

## IaaS — Infrastructure as a Service

The provider supplies raw compute, storage, and networking. The customer manages everything above the hypervisor: operating systems, middleware, runtimes, applications, and data.

**Examples:** Amazon EC2, Azure Virtual Machines, Google Compute Engine.

### Customer security responsibilities

| Area | Responsibility |
|------|---------------|
| OS hardening | Patching, CIS Benchmarks, removing unnecessary services |
| Network controls | Security groups / NSGs, NACLs, VPC design, egress filtering |
| Identity | IAM role assignments; least-privilege instance roles; no long-lived access keys on instances |
| Encryption | Encrypt EBS/disk volumes at rest; enforce TLS in transit |
| Logging | Enable VPC Flow Logs, CloudTrail / Azure Activity Log; ship to SIEM |
| Vulnerability management | Patch OS and application layers; scan with inspector-class tools |

### Common IaaS risks

- Publicly accessible storage buckets (S3, Azure Blob) due to misconfigured ACLs
- Overly permissive security groups (0.0.0.0/0 inbound on SSH/RDP)
- EC2 instance metadata service (IMDSv1) abuse — SSRF can steal instance role credentials; enforce IMDSv2
- Unencrypted snapshots shared across accounts
- Long-lived IAM access keys in code or configuration

---

## PaaS — Platform as a Service

The provider manages the OS, runtime, and middleware. The customer deploys application code and manages data and configuration.

**Examples:** Azure App Service, AWS Elastic Beanstalk, Google App Engine, Heroku, Azure SQL Database.

### Customer security responsibilities

| Area | Responsibility |
|------|---------------|
| Application code | Secure coding; SAST/DAST; dependency management |
| Configuration | Enforce HTTPS; disable debug endpoints; secure connection strings |
| Identity and authorisation | App-level authentication; managed identities for service-to-service auth |
| Data | Encrypt data at rest (often provider-managed); control access; define retention |
| Secrets | Use managed identity / Key Vault references rather than hard-coded credentials |

### Common PaaS risks

- Insecure application code — the OS is secured by the provider, but the application layer is the customer's responsibility
- Misconfigured platform features (e.g., CORS too permissive, authentication disabled on staging slots)
- Secrets stored in application settings as plaintext rather than Key Vault / Secrets Manager references
- Outdated application runtime versions not updated by the customer

---

## SaaS — Software as a Service

The provider manages the entire stack. The customer configures the application, manages users and data, and controls integration settings.

**Examples:** Microsoft 365, Salesforce, Google Workspace, ServiceNow, Slack.

### Customer security responsibilities

| Area | Responsibility |
|------|---------------|
| Identity and access | SSO integration; MFA enforcement; licence assignment; user lifecycle (JML) |
| Data governance | Data classification; retention policies; DLP policies within the platform |
| Integrations | OAuth application approvals; third-party app permissions; API tokens |
| Configuration | Tenant-level security settings (conditional access, guest access, external sharing) |
| Monitoring | Audit log review; integration with SIEM (e.g., Microsoft 365 Defender, Salesforce Event Monitoring) |

### Common SaaS risks

- Overly permissive external sharing settings (anyone with link)
- Shadow IT — employees connecting unauthorised third-party apps with broad OAuth scopes
- Guest access proliferation in collaboration platforms (Teams, SharePoint)
- Failure to offboard users promptly (JML process gaps)
- Audit logs not retained or not integrated into SIEM

### CASB — Cloud Access Security Broker

CASB provides a policy enforcement point between users and SaaS applications, typically deployed inline (proxy mode) or via API integration:

- **Visibility** — discover which cloud apps are in use (sanctioned and shadow IT)
- **Data protection** — DLP policies applied to content uploaded to or stored in cloud apps
- **Threat protection** — detect compromised accounts, insider threats, malware upload
- **Compliance** — enforce data residency; block access from non-compliant devices

Examples: Microsoft Defender for Cloud Apps, Netskope, Zscaler CASB. CASB is frequently bundled into SASE platforms.

---

## FaaS — Function as a Service (Serverless)

FaaS executes code in response to events without the customer managing servers, OS, or runtime. The provider handles scaling, availability, and infrastructure patching.

**Examples:** AWS Lambda, Azure Functions, Google Cloud Functions, Cloudflare Workers.

### Customer security responsibilities

| Area | Responsibility |
|------|---------------|
| Function code | Secure coding; input validation; dependency scanning |
| IAM / execution role | Least-privilege execution role — functions should only access what they need |
| Secrets | Inject via environment variables from Secrets Manager / Key Vault; never hard-code |
| Dependencies | Pin and scan; supply chain attacks target serverless dependencies |
| Timeout and concurrency | Set appropriate limits to prevent denial-of-wallet attacks |
| Logging | Enable and retain function logs; ship to SIEM |

### Serverless-specific risks

- **Event injection** — serverless functions consume events from queues, APIs, databases; malicious input in event payloads can trigger injection attacks
- **Denial of wallet** — abuse of auto-scaling can drive runaway cost; set concurrency limits and budgets
- **Overly permissive execution roles** — a function that only needs to read from one S3 bucket should not have S3:* on *
- **Cold start information disclosure** — environment variables, temporary credentials, and /tmp data can persist across warm invocations

---

## Choosing the right model

| Consideration | Lean IaaS | Lean PaaS/FaaS |
|---------------|-----------|----------------|
| Control over OS/runtime | Needed | Not needed |
| Lift-and-shift migration | Yes | Requires re-architecture |
| Security effort | Higher (more surface area) | Lower (provider-managed) |
| Compliance requirements | May require specific OS configs | Verify provider compliance certs |
| Cost optimisation | Requires capacity planning | Auto-scaling; pay per use |

---

## Further reading

- AWS Shared Responsibility Model documentation
- Microsoft Azure Security documentation
- NCSC Cloud Security Guidance (14 Cloud Security Principles)
- CSA (Cloud Security Alliance) STAR certification
- OWASP Serverless Top 10
