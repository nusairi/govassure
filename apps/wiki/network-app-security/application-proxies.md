# Application Proxies & Gateways

Application proxies and gateways provide Layer 7 visibility and control over application traffic. They are the primary enforcement points for web application security, API security, and traffic management.

## Reverse proxy

A reverse proxy sits in front of backend servers and acts on their behalf. Clients connect to the proxy; the proxy connects to the backend.

### Security functions

- **TLS termination** — offloads TLS from backend servers; centralises certificate management
- **WAF** — inspects and blocks malicious HTTP requests (see [WAF](/data-security/web-application-firewalls))
- **DDoS mitigation** — absorbs volumetric attacks before they reach application servers
- **Authentication front-end** — enforce authentication before proxying to backend (e.g., OAuth2 Proxy)
- **Rate limiting** — throttle clients by IP, user, or API key
- **Header manipulation** — add/remove security headers (HSTS, X-Frame-Options, CSP)

### Common platforms

- **NGINX** — high-performance, widely used; supports WAF via ModSecurity
- **HAProxy** — load balancer + reverse proxy; highly configurable ACLs
- **Envoy** — cloud-native, used in service meshes (Istio, Consul Connect)
- **Caddy** — automatic TLS management, simple configuration

## API Gateway

An API gateway is a specialised reverse proxy for API traffic. Key features:

| Feature | Description |
|---------|-------------|
| **Authentication** | Validate JWT, API keys, OAuth2 tokens |
| **Authorisation** | Enforce scope-based access (read vs. write) |
| **Rate limiting** | Per-key, per-IP, per-endpoint quotas |
| **Request validation** | Validate against OpenAPI schema; reject malformed requests |
| **Transformation** | Modify request/response format (JSON ↔ XML, header injection) |
| **Logging & observability** | Centralised access logs, latency metrics, error rates |

### API gateway platforms

- **AWS API Gateway** — managed; integrates with Lambda, Cognito, WAF
- **Kong** — open-source; plugin-based; self-hosted or cloud
- **Apigee** (Google) — enterprise API management
- **Azure API Management** — managed; integrates with Azure AD, Defender
- **Tyk** — open-source; lightweight

### API security hardening

- Always enforce **HTTPS** — no unencrypted API endpoints
- Use **short-lived tokens** (JWT with 15–60 minute expiry)
- Implement **input validation** against a strict schema — reject unexpected fields and types
- Log all API calls with user identity, IP, endpoint, and response code
- Apply **OWASP API Security Top 10** controls

## Load balancer (Application Delivery Controller)

Application Delivery Controllers (ADCs) combine load balancing, SSL offload, and application acceleration with security features:

- **F5 BIG-IP** — AWAF (Advanced WAF), APM (access policy), ASM
- **Citrix ADC / NetScaler** — AppFW, AAA
- **AWS ALB** — integrates with AWS WAF, Shield

### Health check security

Ensure load balancer health checks use a dedicated endpoint that does not expose sensitive information. Do not use the same endpoint for health checks as for production API calls.

## Service mesh (internal application proxy)

A service mesh (Istio, Linkerd, Consul Connect) deploys a sidecar proxy (usually Envoy) next to each microservice container. Provides:

- **Mutual TLS (mTLS)** — all service-to-service traffic encrypted and authenticated
- **Policy enforcement** — allow/deny rules between services
- **Observability** — per-service latency, error rate, traffic volume

Service meshes implement micro-segmentation at the application layer, independent of the network layer.

## Further reading

- OWASP API Security Top 10
- NGINX Security documentation
- NIST SP 800-204 — Microservices-based Application Security
- Envoy Proxy documentation
