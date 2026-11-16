# Database Firewalls & Activity Monitoring

Database firewalls and Database Activity Monitoring (DAM) provide visibility and control over data access at the database layer — the last line of defence before sensitive data is exfiltrated.

## Database Activity Monitoring (DAM)

DAM captures and analyses all SQL activity against monitored databases — including activity from privileged users who would otherwise have unrestricted access.

### What DAM monitors

- All SQL queries (SELECT, INSERT, UPDATE, DELETE, DDL)
- Who executed the query (DB user, OS user, application, source IP)
- When and from where
- What data was returned (row count, affected data)
- Privileged operations (schema changes, user creation, backup operations)

### DAM use cases

| Use case | Description |
|----------|-------------|
| Compliance | PCI DSS Req 10.3, SOX, HIPAA — log all access to sensitive data |
| Insider threat | Detect DBAs querying outside their scope |
| Data exfiltration | Alert on abnormally large result sets (possible bulk data theft) |
| Injection detection | Detect SQLi patterns in queries reaching the database |
| Privilege abuse | Alert on DDL operations outside change windows |

### DAM deployment modes

- **Passive / network sniffing** — copy database traffic to DAM sensor; no impact on database
- **Agent-based** — agent on database server captures queries; works for encrypted connections
- **Audit vault** — aggregates native database audit logs into a central repository

## Database firewall

A database firewall sits inline between applications and the database, enforcing a whitelist of permitted SQL patterns:

```
Application → [Database Firewall] → Database
```

### Database firewall capabilities

- **Learning mode** — observe normal application SQL traffic and build a baseline whitelist
- **Blocking mode** — block queries that deviate from the whitelist
- **SQL injection prevention** — detect and block injection patterns
- **Result set masking** — mask sensitive columns in results (e.g., mask SSN for non-privileged users)
- **Row-level security** — enforce data access policies below the application layer

### Platforms

- **Imperva SecureSphere** (DAM + database firewall)
- **IBM Guardium** (comprehensive DAM/database firewall)
- **McAfee Database Security** (now Trellix)
- **Trustwave DbProtect**
- **Oracle Audit Vault and Database Firewall** (AVDF)

## Native database security hardening

### Authentication and authorisation

- Disable default accounts (SA, SYS, SYSTEM, postgres) or change passwords and lock
- Remove anonymous users
- Apply least-privilege roles — applications should never connect as DBA
- Use service accounts with minimal privileges per application tier
- Enable SSL/TLS for all database connections

### Auditing (native)

Enable native database auditing for:
- Failed logins
- Privilege use (GRANT, REVOKE)
- Schema changes (DDL)
- Data access on sensitive tables

SQL Server Audit:
```sql
CREATE SERVER AUDIT SecurityAudit TO FILE (FILEPATH = 'C:\Audit');
ALTER SERVER AUDIT SecurityAudit WITH (STATE = ON);
```

### Stored procedure and injection prevention

- Use **parameterised queries / prepared statements** everywhere — never concatenate user input into SQL
- Restrict application accounts from executing system stored procedures
- Apply input validation at the application layer before queries reach the database

## Further reading

- NIST SP 800-111 — Guide to Storage Encryption Technologies
- PCI DSS v4.0 Requirements 6.2.4, 10.3 (database audit logging)
- OWASP SQL Injection Prevention Cheat Sheet
- CIS Benchmark for MySQL / MSSQL / Oracle
