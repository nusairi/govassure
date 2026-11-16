# Container & Kubernetes Security

Containers package an application and its dependencies into a portable, isolated unit. Kubernetes orchestrates containers at scale. Both introduce distinct security challenges that span the image build pipeline, the runtime, the orchestration control plane, and the network.

## Container security fundamentals

### The container threat model

Containers share the host OS kernel — unlike virtual machines, which have separate kernels. A container escape (kernel exploit or misconfiguration) gives an attacker access to the host and potentially all other containers on it.

Key threat areas:

| Area | Threat |
|------|--------|
| Image supply chain | Compromised or vulnerable base images; malicious packages |
| Image configuration | Running as root; unnecessary privileges; sensitive data baked in |
| Registry | Unscanned images; unauthenticated pull access |
| Runtime | Container escape; privileged container abuse; host filesystem mounts |
| Orchestration (Kubernetes) | Misconfigured RBAC; exposed API server; insecure network policies |
| Secrets | Secrets in environment variables or image layers |
| Network | Unrestricted east-west traffic between pods |

---

## Image security

### Use minimal base images

Start with the smallest viable base: `scratch`, `distroless` (Google), or `alpine`. Fewer packages means fewer CVEs.

### Scan images for vulnerabilities

Integrate container image scanning into the CI pipeline:

- **Trivy** (open source) — fast; scans OS packages, language dependencies, IaC, and Kubernetes manifests
- **Snyk Container** — developer-friendly; integrates with registries and CI
- **Clair** — open source; used internally by registries such as Quay
- **Amazon ECR / Azure ACR / GCR** — native vulnerability scanning built into managed registries

### Don't run as root

```dockerfile
# Bad — implicit root
FROM node:20

# Good — explicit non-root user
FROM node:20
RUN groupadd -r app && useradd -r -g app app
USER app
```

### Keep secrets out of images

Never bake secrets into images. Use runtime secret injection via Kubernetes Secrets, AWS Secrets Manager, HashiCorp Vault, or Azure Key Vault. Scan images and git history for accidentally committed secrets (Trufflehog, Gitleaks).

### Sign and verify images

Use **Cosign** (from the Sigstore project) to cryptographically sign container images and enforce signature verification at admission. This prevents unsigned or tampered images from being deployed.

---

## Registry security

- Use a private registry (Amazon ECR, Azure ACR, Google Artifact Registry, Harbor)
- Enforce authentication and authorisation — no unauthenticated pulls in production
- Enable automatic scanning on push
- Implement tag immutability — prevent tag overwrites that could silently swap an image
- Use image digests (`sha256:...`) rather than mutable tags in production manifests

---

## Kubernetes security

### API server hardening

The Kubernetes API server is the control plane entry point. Protect it:

- Disable anonymous authentication
- Enable RBAC (`--authorization-mode=RBAC`)
- Restrict API server access to known CIDR ranges (private network only)
- Audit log all API server requests
- Rotate certificates; use short-lived credentials

### RBAC — Role-Based Access Control

Kubernetes RBAC grants permissions to users, groups, and service accounts. Apply least-privilege:

- Avoid `cluster-admin` for workloads
- Scope roles to namespaces where possible
- Audit `ClusterRoleBindings` regularly — these grant cluster-wide permissions
- Use dedicated service accounts per workload; disable token auto-mounting where not needed

```yaml
# Example: least-privilege role for a read-only application
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: app-readonly
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]
```

### Pod Security Standards (PSS)

PSS replaced PodSecurityPolicy (deprecated in 1.21, removed in 1.25). Three built-in profiles:

| Profile | Restriction level |
|---------|------------------|
| **Privileged** | No restrictions |
| **Baseline** | Prevents known privilege escalations |
| **Restricted** | Hardened; follows pod security best practices |

Apply via namespace labels:

```yaml
metadata:
  labels:
    pod-security.kubernetes.io/enforce: restricted
```

### Network policies

By default, all pods can communicate with all other pods. Network policies enforce allow-listing at the pod level using label selectors.

```yaml
# Deny all ingress by default, then selectively open
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```

Use **Calico**, **Cilium**, or **Weave Net** for network policy enforcement. Cilium also supports eBPF-based runtime security.

### Secrets management

Kubernetes Secrets are base64-encoded (not encrypted) by default. Harden them:

- Enable **encryption at rest** for etcd (EncryptionConfiguration with AES-GCM or KMS envelope encryption)
- Use an **external secrets operator** (External Secrets Operator, Vault Agent Injector) to pull secrets from Vault, AWS Secrets Manager, or Azure Key Vault — secrets never live in etcd
- Restrict Secret access with RBAC; avoid mounting secrets as environment variables (prefer volume mounts — less likely to appear in logs)

### Admission controllers

Admission controllers intercept API server requests before objects are persisted. Key controllers:

- **OPA Gatekeeper / Kyverno** — policy-as-code; enforce custom rules (e.g., block `latest` tags, require resource limits, enforce image registry allowlists)
- **ImagePolicyWebhook** — validate images against an external policy server before allowing deployment
- **MutatingAdmissionWebhook** — auto-inject sidecars (e.g., service mesh proxies, Vault agents)

---

## Runtime security

### eBPF-based runtime detection

Tools such as **Falco** (CNCF) and **Cilium Tetragon** monitor system calls at the kernel level using eBPF, detecting anomalous behaviour in real time:

- Unexpected shell spawning inside a container
- Network connections to unexpected destinations
- File writes to sensitive paths
- Privilege escalation attempts

### Immutable containers

Run containers with a read-only root filesystem:

```yaml
securityContext:
  readOnlyRootFilesystem: true
```

Write locations (temp files, logs) should be explicit `emptyDir` or `tmpfs` volume mounts — this limits the blast radius of a compromise.

---

## Supply chain security (SLSA)

SLSA (Supply-chain Levels for Software Artefacts) is a framework for measuring and improving build integrity. Key practices:

- Hermetic builds — reproducible, isolated build environments
- Provenance attestation — signed metadata describing how an artefact was built
- Dependency pinning — pin all dependencies to cryptographic digests, not mutable version tags

---

## Benchmarks and scanning

- **CIS Kubernetes Benchmark** — configuration hardening baseline for clusters and nodes
- **kube-bench** (open source) — automated CIS benchmark assessment
- **Kubescape** — CNCF tool; checks against NSA/CISA Kubernetes hardening guidance and CIS benchmarks
- **Checkov / Terrascan / Snyk IaC** — scan Kubernetes manifests and Helm charts for misconfigurations before deployment

---

## Further reading

- CNCF Cloud Native Security Whitepaper
- NSA/CISA Kubernetes Hardening Guidance
- CIS Kubernetes Benchmark
- OWASP Kubernetes Security Cheat Sheet
- Sysdig Falco documentation
