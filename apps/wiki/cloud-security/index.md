# Cloud Security

Cloud adoption introduces a shared responsibility model where the cloud provider secures the underlying infrastructure and the customer is responsible for what they deploy on top of it. The boundary of that responsibility shifts depending on the service model used.

## Topics in this section

- [Cloud Service Models & Security](./cloud-service-models) — IaaS, PaaS, SaaS, FaaS and the security responsibilities at each layer
- [Cloud Security Posture & Workload Protection](./cspm-cwpp) — CSPM, CWPP, and the tooling that enforces cloud security at scale

## Shared responsibility model

| Responsibility | IaaS | PaaS | SaaS |
|---------------|------|------|------|
| Physical infrastructure | Provider | Provider | Provider |
| Network controls | Shared | Provider | Provider |
| Operating system | Customer | Provider | Provider |
| Runtime / middleware | Customer | Shared | Provider |
| Application code | Customer | Customer | Provider |
| Data & identity | Customer | Customer | Customer |

**The customer always owns data and identity**, regardless of service model. Misconfiguring access to data stored in a cloud service is the customer's responsibility to prevent and detect.

## Cloud security domains

- **Identity and access** — IAM policies, service account permissions, federation with on-premises directories
- **Data protection** — encryption at rest and in transit; key management; data residency
- **Network security** — VPC design, security groups, NACLs, private endpoints, firewall rules
- **Posture management** — continuous compliance scanning (CSPM); detecting misconfigurations before they are exploited
- **Workload protection** — securing VMs, containers, and serverless functions at runtime (CWPP)
- **Logging and detection** — cloud-native audit logs (CloudTrail, Azure Monitor, GCP Cloud Audit Logs) fed into SIEM
- **Supply chain** — IaC scanning; image signing; dependency management

## See also

- [Hardening Hybrid Infrastructure](/infrastructure/hardening-hybrid)
- [VPNs, ZTNA & SASE](/network-app-security/vpn-ztna-sase) — includes CASB
- [Container & Kubernetes Security](/network-app-security/container-security)
- [Data-Centric Security](/data-security/data-centric-security)
