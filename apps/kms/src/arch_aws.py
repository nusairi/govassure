# -*- coding: utf-8 -*-
"""Architect's pack: AWS KMS - data module.

Every fact carries citation tokens. A token is either an S-code ("S2") or a
source slug: the last path segment of a URL in sources.json (".html" optional).
build.py resolves tokens to S-codes and fails the build on unknown or
ambiguous slugs. Policies are Python dicts, emitted with json.dumps.
"""

KEY_ACCT = "111122223333"      # security / key account (AWS documentation example ID)
WL_ACCT = "444455556666"       # workload account (AWS documentation example ID)
KEY_ARN = "arn:aws:kms:eu-west-2:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab"
ORG_ID = "o-exampleorgid"

CRYPTO = ["kms:Encrypt", "kms:Decrypt", "kms:ReEncrypt*", "kms:GenerateDataKey*", "kms:DescribeKey"]
ADMIN = ["kms:Create*", "kms:Describe*", "kms:Enable*", "kms:List*", "kms:Put*", "kms:Update*",
         "kms:Revoke*", "kms:Disable*", "kms:Get*", "kms:Delete*", "kms:TagResource",
         "kms:UntagResource", "kms:ScheduleKeyDeletion", "kms:CancelKeyDeletion",
         "kms:RotateKeyOnDemand"]
def role(acct, name): return "arn:aws:iam::%s:role/%s" % (acct, name)
PROTECTED = ["arn:aws:iam::*:role/kms-break-glass", "arn:aws:iam::*:role/kms-platform-admin"]

# ----------------------------------------------------------------- diagrams
# Coordinates are explicit (viewBox units). cls: grp | reg | ext (groups);
# n | key | sec | warn (nodes). Edges: list of points, optional label (t, at).
DIAGRAMS = [
 {"id": "single", "title": "A. Single account, single Region",
  "desc": "One workload account in Europe (London). The application role reaches a customer managed KMS key only through an AWS service (kms:ViaService). The key administrator role can manage the key but cannot use it. A separate break-glass role is the only principal allowed to disable or schedule deletion. CloudTrail records every KMS call; EventBridge sends alerts for ScheduleKeyDeletion, DisableKey and PutKeyPolicy; AWS Config rules check rotation, deletion, public policies and tags; a CloudWatch metric filter catches use of a key that is pending deletion.",
  "c": "key-policy-default conditions-kms kms-events deleting-keys-creating-cloudwatch-alarm S44",
  "vb": [1000, 520],
  "groups": [
   {"x": 20, "y": 20, "w": 960, "h": 480, "cls": "grp", "t": "AWS account: workload (prod)"},
   {"x": 40, "y": 60, "w": 920, "h": 420, "cls": "reg", "t": "Region: Europe (London) eu-west-2"}],
  "nodes": [
   {"x": 70, "y": 100, "w": 200, "h": 64, "cls": "n", "t": ["Application role", "IAM role: app1-prod"]},
   {"x": 70, "y": 240, "w": 200, "h": 64, "cls": "n", "t": ["AWS service", "S3 / EBS / RDS with SSE-KMS"]},
   {"x": 380, "y": 205, "w": 260, "h": 112, "cls": "key", "t": ["Customer managed KMS key", "alias/app1-prod-data", "key policy: admins \u2260 users", "automatic rotation enabled"]},
   {"x": 380, "y": 90, "w": 260, "h": 60, "cls": "n", "t": ["Key admin role", "manage only, no crypto use"]},
   {"x": 380, "y": 380, "w": 260, "h": 60, "cls": "sec", "t": ["Break-glass role", "only role that may disable / delete"]},
   {"x": 720, "y": 90, "w": 220, "h": 60, "cls": "sec", "t": ["CloudTrail trail", "every KMS API call"]},
   {"x": 720, "y": 190, "w": 220, "h": 70, "cls": "sec", "t": ["EventBridge rule \u2192 SNS", "ScheduleKeyDeletion, DisableKey,", "PutKeyPolicy"]},
   {"x": 720, "y": 290, "w": 220, "h": 70, "cls": "sec", "t": ["AWS Config rules", "rotation, deletion, public", "policy, required tags"]},
   {"x": 720, "y": 390, "w": 220, "h": 70, "cls": "sec", "t": ["CloudWatch metric filter", "+ alarm: use of a key", "pending deletion"]}],
  "edges": [
   {"p": [[170, 164], [170, 240]], "t": "store / read data", "at": [180, 207]},
   {"p": [[270, 272], [380, 272]], "t": "via service", "at": [282, 262]},
   {"p": [[510, 150], [510, 205]], "t": "manage", "at": [520, 182]},
   {"p": [[510, 380], [510, 317]], "t": "break-glass", "at": [520, 355]},
   {"p": [[640, 230], [680, 230], [680, 120], [720, 120]]},
   {"p": [[830, 150], [830, 190]]},
   {"p": [[720, 325], [640, 290]]},
   {"p": [[940, 120], [962, 120], [962, 425], [940, 425]]}]},

 {"id": "org", "title": "B. Multi-account AWS Organization with a central key account",
  "desc": "The management account applies SCPs and RCPs to member accounts, runs an organization trail for all accounts and Regions, and deploys Config rules. A security / key account holds customer managed keys per application, environment and data class, plus the key admin and break-glass roles and the alerting pipeline. Workload accounts use those keys cross-account: the key policy names the workload role and an IAM policy in the workload account names the key ARN. The organization trail delivers to an immutable S3 bucket in a separate log archive account, encrypted with a dedicated trail key whose policy uses aws:SourceArn and the CloudTrail encryption context. Non-production accounts use their own keys.",
  "c": "key-policy-modifying-external-accounts orgs_manage_policies_scps orgs_manage_policies_rcps creating-trail-organization log-archive create-kms-key-policy-for-cloudtrail",
  "vb": [1000, 600],
  "groups": [
   {"x": 20, "y": 20, "w": 960, "h": 110, "cls": "grp", "t": "Management account: AWS Organizations"},
   {"x": 20, "y": 160, "w": 280, "h": 420, "cls": "grp", "t": "Log archive account"},
   {"x": 320, "y": 160, "w": 320, "h": 420, "cls": "grp", "t": "Security / key account"},
   {"x": 660, "y": 160, "w": 320, "h": 420, "cls": "grp", "t": "Workload accounts"}],
  "nodes": [
   {"x": 40, "y": 50, "w": 220, "h": 62, "cls": "sec", "t": ["Organization trail", "all accounts, all Regions"]},
   {"x": 280, "y": 50, "w": 210, "h": 62, "cls": "n", "t": ["SCPs", "deny delete / disable / policy"]},
   {"x": 510, "y": 50, "w": 200, "h": 62, "cls": "n", "t": ["RCPs", "KMS data perimeter"]},
   {"x": 730, "y": 50, "w": 230, "h": 62, "cls": "sec", "t": ["Config rules (org-wide)", "rotation, deletion, trail"]},
   {"x": 40, "y": 300, "w": 240, "h": 80, "cls": "sec", "t": ["S3 log bucket", "immutable, tightly", "controlled access"]},
   {"x": 40, "y": 420, "w": 240, "h": 70, "cls": "sec", "t": ["Log file validation", "digest files"]},
   {"x": 340, "y": 195, "w": 280, "h": 105, "cls": "key", "t": ["Central customer managed keys", "one per app \u00d7 env \u00d7 data class", "key policy names workload roles", "alias/<app>-<env>-<class>"]},
   {"x": 340, "y": 315, "w": 280, "h": 70, "cls": "key", "t": ["Organization trail key", "aws:SourceArn + encryption context"]},
   {"x": 340, "y": 400, "w": 280, "h": 70, "cls": "n", "t": ["Key admin + break-glass roles", "manage \u2260 use"]},
   {"x": 340, "y": 485, "w": 280, "h": 70, "cls": "sec", "t": ["EventBridge \u2192 SNS \u2192 SOC", "delete, disable, policy change"]},
   {"x": 680, "y": 195, "w": 280, "h": 80, "cls": "n", "t": ["Prod account role", "IAM policy names the key ARN"]},
   {"x": 680, "y": 310, "w": 280, "h": 80, "cls": "n", "t": ["AWS services (S3, EBS, RDS)", "use the key through grants"]},
   {"x": 680, "y": 430, "w": 280, "h": 70, "cls": "n", "t": ["Non-prod accounts", "own keys, never prod keys"]}],
  "edges": [
   {"p": [[150, 112], [150, 300]], "t": "org trail logs", "at": [160, 220]},
   {"p": [[680, 230], [620, 230]], "t": "use", "at": [636, 222]},
   {"p": [[680, 340], [620, 290]], "t": "grants", "at": [632, 330]},
   {"p": [[340, 350], [280, 340]], "t": "encrypts", "at": [282, 365]},
   {"p": [[480, 400], [480, 385]]},
   {"p": [[395, 112], [395, 160]], "t": "SCP", "at": [402, 145], "dash": 1},
   {"p": [[610, 112], [610, 160]], "t": "RCP", "at": [580, 145], "dash": 1},
   {"p": [[845, 112], [845, 160]], "dash": 1}]},

 {"id": "mrk", "title": "C. Multi-Region keys for disaster recovery (with UK residency caveat)",
  "desc": "A multi-Region primary key in Europe (London) and a replica key in a second Region share the same key ID and key material, so data encrypted in one Region can be decrypted in the other without re-encrypting or a cross-Region call. Each replica has its own key policy, aliases and grants. AWS lists only one UK Region, so every replica is outside the UK: creating a multi-Region key moves key material across Region boundaries, and this needs a documented data-location decision before use. SCPs restrict who may create multi-Region keys or replicate them.",
  "c": "multi-region-keys-overview mrk-when-to-use multi-region-keys-auth aws-regions S4",
  "vb": [1000, 520],
  "groups": [
   {"x": 20, "y": 40, "w": 440, "h": 310, "cls": "reg", "t": "Europe (London) eu-west-2: primary"},
   {"x": 540, "y": 40, "w": 440, "h": 310, "cls": "ext", "t": "Second Region (outside the UK): replica"}],
  "nodes": [
   {"x": 50, "y": 90, "w": 380, "h": 100, "cls": "key", "t": ["Multi-Region primary key", "mrk- key ID shared with replicas", "own key policy, aliases, grants"]},
   {"x": 50, "y": 230, "w": 380, "h": 80, "cls": "n", "t": ["Primary workload and data", "encrypts with the primary key"]},
   {"x": 570, "y": 90, "w": 380, "h": 100, "cls": "key", "t": ["Multi-Region replica key", "same key ID and key material", "independent key policy"]},
   {"x": 570, "y": 230, "w": 380, "h": 80, "cls": "n", "t": ["DR workload and replicated data", "decrypts with no cross-Region call"]},
   {"x": 20, "y": 380, "w": 960, "h": 120, "cls": "warn", "t": ["UK residency caveat: AWS lists one UK Region, Europe (London), so any replica is outside the UK.", "Creating a multi-Region key moves key material across Region boundaries (NCSC Principle 2.1).", "Record the decision in ADR-004. Guard with SCPs: deny kms:CreateKey when kms:MultiRegion is", "true, and deny kms:ReplicateKey, except for an approved DR role."]}],
  "edges": [
   {"p": [[430, 140], [570, 140]], "t": "ReplicateKey", "at": [452, 130]},
   {"p": [[430, 270], [570, 270]], "t": "data replication", "at": [446, 260]}]},

 {"id": "hsm", "title": "D. Higher assurance: CloudHSM key store and external key store (XKS)",
  "desc": "Workloads call AWS KMS through the same API and key policies. KMS keys in an AWS CloudHSM key store are backed by a CloudHSM cluster in your VPC with at least two active HSMs in different Availability Zones. KMS keys in an external key store reach your external key manager outside AWS through an XKS proxy, over a public endpoint or a VPC endpoint service; AWS KMS cannot create, view, manage or delete the external keys. Custom key stores support only symmetric encryption keys: no asymmetric or HMAC keys, imported material, automatic rotation or multi-Region keys. Each custom key store has its own request quota, and disconnecting a key store makes its KMS keys unusable.",
  "c": "keystore-cloudhsm keystore-external create-keystore choose-xks-connectivity xks-connect-disconnect requests-per-second key-store-overview",
  "vb": [1000, 560],
  "groups": [
   {"x": 20, "y": 20, "w": 630, "h": 400, "cls": "reg", "t": "AWS: Europe (London) eu-west-2"},
   {"x": 680, "y": 20, "w": 300, "h": 400, "cls": "ext", "t": "Outside AWS: your premises"}],
  "nodes": [
   {"x": 50, "y": 60, "w": 260, "h": 70, "cls": "n", "t": ["Workload / AWS service", "calls KMS as usual"]},
   {"x": 350, "y": 60, "w": 270, "h": 70, "cls": "n", "t": ["AWS KMS", "same API and key policies"]},
   {"x": 50, "y": 180, "w": 260, "h": 80, "cls": "key", "t": ["CloudHSM key store", "symmetric KMS keys only"]},
   {"x": 50, "y": 295, "w": 260, "h": 105, "cls": "sec", "t": ["AWS CloudHSM cluster", "in your VPC", "\u2265 2 active HSMs in", "different Availability Zones"]},
   {"x": 350, "y": 180, "w": 270, "h": 80, "cls": "key", "t": ["External key store (XKS)", "double encryption"]},
   {"x": 350, "y": 295, "w": 270, "h": 80, "cls": "n", "t": ["XKS proxy", "public endpoint or", "VPC endpoint service"]},
   {"x": 700, "y": 280, "w": 260, "h": 110, "cls": "sec", "t": ["External key manager", "you own and run it;", "KMS cannot view or", "manage these keys"]},
   {"x": 20, "y": 440, "w": 960, "h": 100, "cls": "warn", "t": ["Custom key stores: no asymmetric or HMAC keys, no imported material, no automatic", "rotation, no multi-Region keys. Each key store has its own request quota.", "Disconnecting a key store makes its KMS keys unusable and can disrupt AWS services."]}],
  "edges": [
   {"p": [[310, 95], [350, 95]]},
   {"p": [[410, 130], [410, 155], [180, 155], [180, 180]]},
   {"p": [[520, 130], [520, 180]]},
   {"p": [[180, 260], [180, 295]]},
   {"p": [[485, 260], [485, 295]]},
   {"p": [[620, 335], [700, 335]], "t": "requests", "at": [628, 325]}]},
]

# ----------------------------------------------------------------- ADRs
ADR_TEMPLATE = [
 ["Title", "ADR-NNN: short noun phrase naming the decision"],
 ["Status", "Proposed | Accepted | Superseded by ADR-NNN | Deprecated"],
 ["Date and review date", "When decided; when it must be reviewed (for example, at the next annual key review)"],
 ["Decision owner", "A role, not a person: service owner, security architect, SIRO delegate"],
 ["Context", "Workload, data classification, threats, regulatory and residency constraints, and options considered"],
 ["Decision", "What we will do, in one or two sentences"],
 ["Consequences", "Security, operational, cost and lock-in effects, both positive and negative"],
 ["Controls and guardrails", "Policies, SCPs/RCPs, Config rules and alarms that enforce the decision"],
 ["Evidence", "What an assessor can inspect: Config results, CloudTrail queries, policy files in source control"],
 ["Mappings", "NCSC Cloud Security Principles and CAF contributing outcomes"],
 ["Sources", "Official documentation used, with the date checked"],
]

ADRS = [
 {"id": "ADR-001", "t": "Use customer managed KMS keys, not AWS managed keys, for workload data",
  "ctx": "AWS managed keys are a legacy key type: services launched since 2021 use AWS owned keys instead. You cannot change their key policies, rotate them on demand, or schedule their deletion, and RCPs do not apply to them. Customer managed keys give full lifecycle and policy control, at a monthly cost per key.",
  "ctx_c": "concepts least-privilege orgs_manage_policies_rcps pricing",
  "dec": "Every workload data store holding OFFICIAL data or above uses a customer managed key whose key policy separates administrators from users. AWS owned or AWS managed keys are accepted only where a service offers no customer managed key option, and that exception is recorded.",
  "cons": ["Each key costs $1 per month (prorated hourly), plus rotation charges; request charges are unchanged.", "Teams must own key policies; misconfiguration can lock out access, so the policy lockout safety check stays on.", "RCPs, SCP guardrails and Config rules can now be applied to these keys."],
  "cons_c": "pricing conditions-kms orgs_manage_policies_rcps",
  "ctl": "Policies P1 and P11; Config rule kms-key-policy-no-public-access; required tags (kms-key-tagged).",
  "ev": "Inventory of keys with KeyManager = CUSTOMER per data store; Config compliance export.",
  "map": "P2.3 data encryption; P14.1 secure by design; CAF B3.c stored data.",
  "map_c": "S4 S12 S24 principle-14-secure-use-of-the-service"},
 {"id": "ADR-002", "t": "Key granularity: one key per application, environment and data classification",
  "ctx": "NCSC advises using a different root key encryption key for each application. In AWS KMS, access is controlled per key by its key policy, and the blast radius of a disabled or compromised key is everything encrypted under it. Quotas are generous (100,000 KMS keys per account and Region) but each key has a monthly cost.",
  "ctx_c": "S2 key-policies resource-limits pricing",
  "dec": "Create one customer managed key per application \u00d7 environment \u00d7 data classification, in the account that owns the data or in the central key account. Never share keys between production and non-production. Use separate keys for logs and for backups.",
  "cons": ["Smaller blast radius and simpler least-privilege key policies.", "More keys to tag, monitor and pay for; automation (infrastructure as code) is required.", "Aliases follow the naming standard so applications never hard-code key IDs."],
  "cons_c": "S2 kms-alias",
  "ctl": "Naming and tagging standard; Config rule kms-key-tagged with required tag keys.",
  "ev": "Key inventory with app, env and data-class tags; no key used by principals from two environments (CloudTrail query).",
  "map": "P14.2 help customers meet responsibilities; CAF A3.a asset management; CAF B3.c.",
  "map_c": "S14 S24 principle-14-secure-use-of-the-service"},
 {"id": "ADR-003", "t": "Use AWS-generated key material; import key material only where a regulation requires it",
  "ctx": "With imported material you are responsible for its generation, a durable copy, and its expiry. If it expires or is deleted the key becomes unusable at once, and if you lose your copy the data is unrecoverable. AWS suggests imported keys in the standard key store when you must demonstrate control over key material.",
  "ctx_c": "importing-keys-considerations importing-keys-import-key-material unusable-kms-keys key-store-overview",
  "dec": "Default to key material generated by AWS KMS. Import material only when a named regulation or contract requires customer-generated keys, and then: keep an escrowed copy under dual control, set an expiry only if required, and alarm on SecondsUntilKeyMaterialExpires.",
  "cons": ["Avoids an outage mode that AWS-generated keys do not have.", "Where imported, the runbook R6 and the expiry alarm are mandatory.", "Automatic rotation is only for AWS-generated material; imported keys rotate on demand after new material is imported."],
  "cons_c": "imported-key-material-expiration-alarm rotate-keys",
  "ctl": "Alarm A2; runbook R6; Config rule kms-cmk-not-scheduled-for-deletion.",
  "ev": "List of EXTERNAL-origin keys with justification; alarm configuration; escrow procedure.",
  "map": "P2.3 data encryption; CAF B5.c backups; CAF D1.a response plan.",
  "map_c": "S4 S21 principle-b5-resilient-networks-and-systems"},
 {"id": "ADR-004", "t": "Single-Region keys in Europe (London) by default; multi-Region keys by exception",
  "ctx": "AWS KMS is Regionally isolated. Multi-Region keys share key material and key ID across Regions, so ciphertext can be decrypted in several geographic locations. AWS lists one UK Region, so any replica is outside the UK. AWS advises using a multi-Region key only when you need one.",
  "ctx_c": "disaster-recovery-resiliency multi-region-keys-overview mrk-when-to-use aws-regions",
  "dec": "Create single-Region keys in eu-west-2. For cross-Region DR, re-encrypt copies under a single-Region key in the target Region. Use multi-Region keys only with an accepted data-location decision, a named DR role and SCP guardrails.",
  "cons": ["UK data location is preserved by default.", "Cross-Region DR copies must be re-encrypted under a key in the target Region.", "If multi-Region keys are approved, each replica needs its own key policy review."],
  "cons_c": "multi-region-keys-auth",
  "ctl": "SCP P7 statement DenyMultiRegionKeys; key policy condition kms:ReplicaRegion where replicas are allowed.",
  "ev": "No keys with MultiRegion = true outside the approved list; SCP attached to the root or OUs.",
  "map": "P2.1 physical location and legal jurisdiction; P2.5 resilience; CAF B5.b design for resilience.",
  "map_c": "S4 principle-b5-resilient-networks-and-systems"},
 {"id": "ADR-005", "t": "Use the AWS KMS standard key store; custom key stores only when explicitly mandated",
  "ctx": "Standard KMS keys are generated in and protected by FIPS 140-3 Level 3 validated HSMs. AWS advises a custom key store only when regulation explicitly mandates a single-tenant HSM or an HSM you control outside AWS. Custom key stores lose asymmetric and HMAC keys, imported material, automatic rotation and multi-Region keys, and add cost and operational risk.",
  "ctx_c": "key-store-overview keystore-cloudhsm keystore-external",
  "dec": "Use the standard key store. A CloudHSM key store is allowed only for a documented single-tenant HSM requirement; an external key store only where keys must stay outside AWS. Both need an availability design and a disconnect runbook.",
  "cons": ["Highest availability and lowest operating cost by default.", "CloudHSM key stores need at least two active HSMs in different Availability Zones, charged per HSM hour.", "External key stores make your key manager part of every AWS request path."],
  "cons_c": "create-keystore pricing xks-connect-disconnect",
  "ctl": "Approval gate before CreateCustomKeyStore (IAM restricted to the platform role); alarm on key store disconnection.",
  "ev": "describe-custom-key-stores output; HSM count and AZ spread; DR test record.",
  "map": "P2.3 data encryption; P5 operational security (provider); CAF A2.a risk management process.",
  "map_c": "S4 principle-5-operational-security principle-a2-risk-management"},
]

# ----------------------------------------------------------------- policies
def stmt(**k): return k

POLICIES = [
 {"id": "P1", "t": "Key policy: separate key administrators from key users", "kind": "Key policy",
  "why": "The first statement keeps the account in control so IAM policies can also grant access, as in the default key policy. Administrators can manage but are explicitly denied cryptographic use. Users can only use the key, and may create grants only for AWS services.",
  "c": "key-policy-default least-privilege conditions-kms",
  "doc": {"Version": "2012-10-17", "Id": "app1-prod-data-key-policy", "Statement": [
   stmt(Sid="EnableIAMPoliciesForThisAccount", Effect="Allow", Principal={"AWS": "arn:aws:iam::%s:root" % KEY_ACCT}, Action="kms:*", Resource="*"),
   stmt(Sid="AllowKeyAdministration", Effect="Allow", Principal={"AWS": role(KEY_ACCT, "kms-key-admin")}, Action=ADMIN, Resource="*"),
   stmt(Sid="DenyCryptoUseByAdministrators", Effect="Deny", Principal={"AWS": role(KEY_ACCT, "kms-key-admin")}, Action=["kms:Encrypt", "kms:Decrypt", "kms:ReEncrypt*", "kms:GenerateDataKey*"], Resource="*"),
   stmt(Sid="AllowUseOfTheKey", Effect="Allow", Principal={"AWS": role(KEY_ACCT, "app1-prod")}, Action=CRYPTO, Resource="*"),
   stmt(Sid="AllowGrantsOnlyForAWSResources", Effect="Allow", Principal={"AWS": role(KEY_ACCT, "app1-prod")}, Action=["kms:CreateGrant", "kms:ListGrants", "kms:RevokeGrant"], Resource="*", Condition={"Bool": {"kms:GrantIsForAWSResource": "true"}})]}},
 {"id": "P2", "t": "Cross-account use: key policy statement plus IAM policy in the workload account", "kind": "Key policy + IAM policy",
  "why": "Cross-account use needs both: the key policy in the key account must allow the external principal, and an IAM policy in the external account must allow the same actions on the key ARN. Name the role, not the whole account. Other accounts must refer to the key by key ARN or alias ARN.",
  "c": "key-policy-modifying-external-accounts kms-alias",
  "doc": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="AllowWorkloadRoleToUseKey", Effect="Allow", Principal={"AWS": role(WL_ACCT, "app1-prod")}, Action=CRYPTO, Resource="*"),
   stmt(Sid="AllowWorkloadRoleGrantsForAWSResources", Effect="Allow", Principal={"AWS": role(WL_ACCT, "app1-prod")}, Action="kms:CreateGrant", Resource="*", Condition={"Bool": {"kms:GrantIsForAWSResource": "true"}})]},
  "doc2_t": "IAM policy attached to role app1-prod in account %s" % WL_ACCT,
  "doc2": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="UseCentralKey", Effect="Allow", Action=CRYPTO + ["kms:CreateGrant"], Resource=KEY_ARN)]}},
 {"id": "P3", "t": "Restrict use to one AWS service and the calling account (kms:ViaService)", "kind": "Key policy statement",
  "why": "kms:ViaService limits use to requests that an AWS service makes on the principal's behalf, here Amazon S3 in London. kms:CallerAccount pins the account.",
  "c": "conditions-kms",
  "doc": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="AllowUseOnlyViaS3InLondon", Effect="Allow", Principal={"AWS": role(KEY_ACCT, "app1-prod")}, Action=CRYPTO, Resource="*",
        Condition={"StringEquals": {"kms:ViaService": "s3.eu-west-2.amazonaws.com", "kms:CallerAccount": KEY_ACCT}})]}},
 {"id": "P4", "t": "Require an encryption context for direct use", "kind": "Key policy statement",
  "why": "The encryption context is authenticated additional data and is logged in CloudTrail. Requiring specific pairs binds ciphertext to its purpose. Use it for direct SDK calls; AWS services set their own context (for example CloudTrail uses aws:cloudtrail:arn).",
  "c": "encrypt_context conditions-kms create-kms-key-policy-for-cloudtrail",
  "doc": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="RequireApplicationEncryptionContext", Effect="Allow", Principal={"AWS": role(KEY_ACCT, "app1-batch")}, Action=["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey*"], Resource="*",
        Condition={"StringEquals": {"kms:EncryptionContext:app": "app1", "kms:EncryptionContext:env": "prod"}})]}},
 {"id": "P5", "t": "Deny ScheduleKeyDeletion except the break-glass role, and require a 30-day waiting period", "kind": "Key policy statements",
  "why": "An explicit deny overrides any allow. aws:PrincipalArn matches the role ARN (not the session). kms:ScheduleKeyDeletionPendingWindowInDays enforces the longest waiting period (the range is 7 to 30 days; the default is 30), so an alarm and cancellation have time to work.",
  "c": "conditions-kms reference_policies_condition-keys deleting-keys deleting-keys-cancelling-key-deletion",
  "doc": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="DenyKeyDeletionExceptBreakGlass", Effect="Deny", Principal="*", Action="kms:ScheduleKeyDeletion", Resource="*",
        Condition={"ArnNotEquals": {"aws:PrincipalArn": role(KEY_ACCT, "kms-break-glass")}}),
   stmt(Sid="RequireMaximumWaitingPeriod", Effect="Deny", Principal="*", Action="kms:ScheduleKeyDeletion", Resource="*",
        Condition={"NumericLessThan": {"kms:ScheduleKeyDeletionPendingWindowInDays": "30"}})]}},
 {"id": "P6", "t": "Require rotation: cap the rotation period and protect rotation from being turned off", "kind": "Key policy statement + SCP",
  "why": "No condition key can force rotation on at creation, so pair these preventive controls with the detective Config rule cmk-backing-key-rotation-enabled. kms:RotationPeriodInDays caps the period at 365 days; the SCP stops anyone except the platform role disabling rotation.",
  "c": "conditions-kms rotating-keys-enable cmk-backing-key-rotation-enabled orgs_manage_policies_scps",
  "doc": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="DenyRotationPeriodOver365Days", Effect="Deny", Principal="*", Action="kms:EnableKeyRotation", Resource="*",
        Condition={"NumericGreaterThan": {"kms:RotationPeriodInDays": "365"}})]},
  "doc2_t": "SCP: only the platform role may disable rotation",
  "doc2": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="DenyDisableKeyRotation", Effect="Deny", Action="kms:DisableKeyRotation", Resource="*",
        Condition={"ArnNotLike": {"aws:PrincipalArn": "arn:aws:iam::*:role/kms-platform-admin"}})]}},
 {"id": "P7", "t": "SCP: protect keys and the audit trail across the organization", "kind": "Service control policy",
  "why": "SCPs set limits on what principals in member accounts can do; they grant no permissions and do not affect users or roles in the management account. These statements stop destructive KMS actions, CloudTrail tampering and unapproved multi-Region keys, except for named roles.",
  "c": "orgs_manage_policies_scps orgs_manage_policies_scps_syntax list_kms list_cloudtrail multi-region-keys-auth",
  "doc": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="ProtectKmsKeys", Effect="Deny", Action=["kms:ScheduleKeyDeletion", "kms:DisableKey", "kms:PutKeyPolicy", "kms:DeleteImportedKeyMaterial", "kms:DisableKeyRotation"], Resource="*",
        Condition={"ArnNotLike": {"aws:PrincipalArn": PROTECTED}}),
   stmt(Sid="ProtectAuditTrail", Effect="Deny", Action=["cloudtrail:StopLogging", "cloudtrail:DeleteTrail", "cloudtrail:UpdateTrail", "cloudtrail:PutEventSelectors"], Resource="*",
        Condition={"ArnNotLike": {"aws:PrincipalArn": PROTECTED}}),
   stmt(Sid="DenyMultiRegionKeys", Effect="Deny", Action="kms:CreateKey", Resource="*",
        Condition={"Bool": {"kms:MultiRegion": "true"}, "ArnNotLike": {"aws:PrincipalArn": "arn:aws:iam::*:role/kms-dr-admin"}}),
   stmt(Sid="DenyReplicateKey", Effect="Deny", Action="kms:ReplicateKey", Resource="*",
        Condition={"ArnNotLike": {"aws:PrincipalArn": "arn:aws:iam::*:role/kms-dr-admin"}})]}},
 {"id": "P8", "t": "RCPs: KMS identity perimeter and confused deputy protection", "kind": "Resource control policy",
  "why": "RCPs set the maximum permissions on resources in member accounts, whatever the key policy says. These are the AWS KMS documentation examples: only principals in your organization (or AWS services) can use keys, and AWS services can act only for your organization. RCPs do not apply to AWS managed keys.",
  "c": "resource-control-policies orgs_manage_policies_rcps confused-deputy conditions-aws",
  "doc": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="RCPEnforceIdentityPerimeter", Effect="Deny", Principal="*", Action="kms:*", Resource="*",
        Condition={"StringNotEqualsIfExists": {"aws:PrincipalOrgID": ORG_ID}, "Bool": {"aws:PrincipalIsAWSService": "false"}}),
   stmt(Sid="RCPEnforceConfusedDeputyProtection", Effect="Deny", Principal="*", Action="kms:*", Resource="*",
        Condition={"StringNotEqualsIfExists": {"aws:SourceOrgID": ORG_ID}, "Bool": {"aws:PrincipalIsAWSService": "true"}, "Null": {"aws:SourceAccount": "false"}})]}},
 {"id": "P9", "t": "Key policy for the organization trail key (confused deputy safe)", "kind": "Key policy statement",
  "why": "From the CloudTrail documentation: CloudTrail may generate data keys only for the named trail (aws:SourceArn) and only with the CloudTrail encryption context for your account's trails.",
  "c": "create-kms-key-policy-for-cloudtrail confused-deputy",
  "doc": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="AllowCloudTrailToEncryptLogs", Effect="Allow", Principal={"Service": "cloudtrail.amazonaws.com"}, Action="kms:GenerateDataKey*", Resource="*",
        Condition={"StringEquals": {"aws:SourceArn": "arn:aws:cloudtrail:eu-west-2:%s:trail/org-trail" % KEY_ACCT},
                   "StringLike": {"kms:EncryptionContext:aws:cloudtrail:arn": "arn:aws:cloudtrail:*:%s:trail/*" % KEY_ACCT}})]}},
 {"id": "P10", "t": "IAM policy: allow grants only for AWS resources, to a specific grantee", "kind": "IAM policy",
  "why": "Grants are a second access path that key policy reviews miss. Restrict grant creation to AWS services acting for you and to a known grantee; prefer EncryptionContextEquals grant constraints.",
  "c": "grant-best-practices conditions-kms grants",
  "doc": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="CreateGrantsOnlyForAWSResources", Effect="Allow", Action="kms:CreateGrant", Resource=KEY_ARN,
        Condition={"Bool": {"kms:GrantIsForAWSResource": "true"}, "StringEquals": {"kms:GranteePrincipal": role(KEY_ACCT, "app1-prod")}})]}},
 {"id": "P11", "t": "Never bypass the policy lockout safety check", "kind": "IAM policy or SCP",
  "why": "The lockout safety check stops a key policy that would make the key unmanageable. AWS documents this deny for kms:BypassPolicyLockoutSafetyCheck.",
  "c": "conditions-kms",
  "doc": {"Version": "2012-10-17", "Statement": [
   stmt(Sid="DenyBypassPolicyLockoutSafetyCheck", Effect="Deny", Action=["kms:CreateKey", "kms:PutKeyPolicy"], Resource="*",
        Condition={"Bool": {"kms:BypassPolicyLockoutSafetyCheck": "true"}})]}},
]

# ----------------------------------------------------------------- naming & tagging
HIERARCHY = [
 ["Organization guardrails", "SCPs and RCPs from the management account; organization trail.", "orgs_manage_policies_scps orgs_manage_policies_rcps creating-trail-organization"],
 ["Key account per environment tier", "Central security / key account, or the data-owning workload account; keys in eu-west-2.", "key-policy-modifying-external-accounts aws-regions"],
 ["KMS key (key encryption key)", "One customer managed key per application \u00d7 environment \u00d7 data class; separate keys for logs and for backups.", "S2 S19"],
 ["Data keys", "Generated per object or volume by GenerateDataKey (envelope encryption); stored encrypted next to the data.", "data-keys"],
 ["Data", "Encrypted with data keys; ciphertext is bound to the encryption context.", "encrypt_context"],
]
ALIAS_RULES = [
 ["Format", "alias/<app>-<env>-<data-class>-<purpose>, for example alias/app1-prod-official-s3. Same alias name in each Region where the application runs.", "kms-alias"],
 ["Reserved prefix", "alias/aws/ is used by AWS managed keys; never create aliases that look like it.", "kms-alias"],
 ["Not secret", "Aliases appear in plaintext in CloudTrail and other output: no project codenames, people or classification caveats beyond the agreed label.", "kms-alias"],
 ["One key at a time", "An alias points to one key in the same account and Region; UpdateAlias repoints it to a key of the same type and usage (used for manual rotation).", "kms-alias rotate-keys-manually"],
 ["Use in code", "Applications reference the alias; other accounts must use the key ARN or alias ARN. Aliases are not valid key identifiers in IAM policies; use kms:RequestAlias or kms:ResourceAliases.", "kms-alias abac"],
 ["Access control risk", "With ABAC, alias and tag changes change who can use a key (effective within about 5 minutes). Restrict CreateAlias, UpdateAlias, DeleteAlias, TagResource and UntagResource to the key admin role.", "abac"],
]
TAGS = [
 ["owner", "Owning team or service mailbox (a role, never a person)", "app1-platform-team"],
 ["app", "Application short name, matching the alias", "app1"],
 ["env", "prod | preprod | test | dev", "prod"],
 ["data-class", "Highest classification of data protected", "official"],
 ["rotation", "auto-365 | auto-<days> | on-demand | manual", "auto-365"],
 ["adr", "Architecture decision that justified the key", "ADR-002"],
 ["review-date", "Next key review (ISO 8601 date)", "2027-11-01"],
 ["cost-centre", "Billing code (tags are visible in billing)", "cc-1234"],
]
TAG_RULES = "Tags are case-sensitive key-value pairs; up to 50 user-created tags per key. Do not put confidential information in tags. Enforce required tag keys with the Config rule kms-key-tagged."
TAG_RULES_C = "tagging-keys kms-key-tagged"
OWNERSHIP = [
 ["Key owner (service owner)", "Accountable for the key, its ADR, data class and review date."],
 ["Key custodian (platform team, kms-key-admin role)", "Creates keys, maintains policies, aliases, tags and rotation; cannot use keys."],
 ["Key users (application roles)", "Use keys only; no policy, alias or tag changes."],
 ["Security operations", "Owns alarms, triage and the incident runbooks."],
 ["Break-glass custodian (kms-break-glass role)", "Disable or schedule deletion only after approval; every use is reviewed."],
]

# ----------------------------------------------------------------- threats
THREATS = [
 ["Insider schedules deletion of a key", "Permanent loss of all data encrypted under it once the waiting period ends.",
  "P5 deny except break-glass; 30-day waiting period; P7 SCP; separation of duties (P1).",
  "EventBridge rule on ScheduleKeyDeletion and native \"KMS CMK Deletion\" event; metric filter alarm on use of a key pending deletion; Config kms-cmk-not-scheduled-for-deletion.",
  "P9, P12; CAF B2.c, C1.c", "S8 principle-12-secure-service-administration S12 S13 deleting-keys-creating-cloudwatch-alarm kms-events kms-cmk-not-scheduled-for-deletion"],
 ["Over-broad cross-account key policy (for example Principal \"*\" or a whole account)", "Data can be decrypted by principals outside the intended workload or organization.",
  "Name specific roles (P2); RCP identity perimeter (P8); IAM Access Analyzer review before deployment.",
  "Config kms-key-policy-no-public-access; EventBridge rule on PutKeyPolicy; CloudTrail review of CallerAccount.",
  "P9, P14.1; CAF B2.d", "S8 S12 principle-14-secure-use-of-the-service kms-key-policy-no-public-access least-privilege resource-control-policies"],
 ["Ransomware or attacker disables a key (or deletes imported material)", "Immediate denial of service for every dependent workload; data keys fail on next use.",
  "P7 SCP on DisableKey and DeleteImportedKeyMaterial; break-glass only; keys for backups in a separate account (P2.5).",
  "EventBridge rule on DisableKey and DeleteImportedKeyMaterial; key state checks (describe-key).",
  "P2.5; CAF B5.c, D1.a", "S4 S19 S21 principle-b5-resilient-networks-and-systems unusable-kms-keys key-state"],
 ["CloudTrail logging turned off or the trail changed", "Loss of the audit record for all KMS use; attacks become invisible.",
  "Organization trail (members cannot change it); P7 SCP on StopLogging, DeleteTrail, UpdateTrail, PutEventSelectors; immutable log archive.",
  "Config multi-region-cloudtrail-enabled, cloudtrail-security-trail-enabled, cloud-trail-log-file-validation-enabled, cloud-trail-encryption-enabled; EventBridge rule on CloudTrail changes.",
  "P13; CAF C1.a", "S11 S13 S17 creating-trail-organization log-archive multi-region-cloudtrail-enabled cloud-trail-log-file-validation-enabled"],
 ["Grant misuse (persistent grants to unexpected principals)", "A second access path that bypasses key policy review.",
  "P10 (GrantIsForAWSResource, specific grantee); grant constraints; retire grants when done.",
  "EventBridge or CloudTrail review of CreateGrant; periodic list-grants review per key.",
  "P9; CAF B2.d", "S8 S12 grant-best-practices grants"],
 ["Confused deputy (an AWS service tricked into using your key for another account)", "Your key encrypts or decrypts on behalf of someone else.",
  "aws:SourceArn / aws:SourceAccount in service statements (P9); RCP confused-deputy statement (P8).",
  "CloudTrail review of service-principal calls and their source ARN.",
  "P14.1; CAF B2.d", "principle-14-secure-use-of-the-service S12 confused-deputy resource-control-policies create-kms-key-policy-for-cloudtrail"],
 ["Tag or alias manipulation to gain access (ABAC)", "Changing a tag or alias grants or removes access within minutes.",
  "Restrict TagResource, UntagResource and alias actions to the key admin role.",
  "Config kms-key-tagged; CloudTrail review of TagResource and UpdateAlias.",
  "P9; CAF B2.c", "S8 S12 abac kms-key-tagged"],
 ["Imported key material expires or is lost", "Key becomes unusable; if no copy exists, data is unrecoverable.",
  "ADR-003 (avoid import); escrowed copy; runbook R6.",
  "Alarm on SecondsUntilKeyMaterialExpires; native \"KMS Imported Key Material Expiration\" event.",
  "P2.3; CAF B5.c", "S4 importing-keys-considerations imported-key-material-expiration-alarm kms-events principle-b5-resilient-networks-and-systems"],
 ["Request throttling under load", "Availability loss for dependent services.",
  "Design to the request quotas; request quota increases in advance through Service Quotas.",
  "CloudWatch alarm at a percentage of the request quota (A3).",
  "P2.5; CAF B5.b", "S4 requests-per-second principle-b5-resilient-networks-and-systems"],
 ["Replica created outside the UK", "Key material and decryptable ciphertext in a non-UK jurisdiction.",
  "ADR-004; P7 DenyMultiRegionKeys and DenyReplicateKey.",
  "Inventory of keys with MultiRegion true; EventBridge rule on ReplicateKey.",
  "P2.1; CAF A2.a", "S4 mrk-when-to-use multi-region-keys-auth principle-a2-risk-management"],
]

# ----------------------------------------------------------------- guardrails
CONFIG_RULES = [
 ["cmk-backing-key-rotation-enabled", "Automatic rotation is enabled for each customer managed symmetric key.", "cmk-backing-key-rotation-enabled"],
 ["kms-cmk-not-scheduled-for-deletion", "Customer managed keys are not scheduled for deletion.", "kms-cmk-not-scheduled-for-deletion"],
 ["kms-key-policy-no-public-access", "Key policies do not allow public access.", "kms-key-policy-no-public-access"],
 ["kms-key-tagged", "Keys carry the required tag keys (set the parameter to owner, app, env, data-class).", "kms-key-tagged"],
 ["iam-customer-policy-blocked-kms-actions", "Customer managed IAM policies do not allow blocked KMS actions (for example kms:Decrypt) on all keys.", "iam-customer-policy-blocked-kms-actions"],
 ["multi-region-cloudtrail-enabled", "At least one multi-Region CloudTrail trail exists.", "multi-region-cloudtrail-enabled"],
 ["cloudtrail-security-trail-enabled", "At least one trail is configured with security best practices.", "cloudtrail-security-trail-enabled"],
 ["cloud-trail-log-file-validation-enabled", "Trails create signed digest files (log file validation).", "cloud-trail-log-file-validation-enabled"],
 ["cloud-trail-encryption-enabled", "Trails use SSE-KMS encryption.", "cloud-trail-encryption-enabled"],
]
EB_PATTERNS = [
 {"id": "E1", "t": "Critical KMS API calls (via CloudTrail)",
  "why": "Matches management events delivered by CloudTrail to EventBridge. Route to SNS and the SOC.",
  "c": "eb-service-event-cloudtrail kms-events",
  "doc": {"source": ["aws.kms"], "detail-type": ["AWS API Call via CloudTrail"],
          "detail": {"eventSource": ["kms.amazonaws.com"],
                     "eventName": ["ScheduleKeyDeletion", "DisableKey", "PutKeyPolicy", "DeleteImportedKeyMaterial", "DisableKeyRotation", "ReplicateKey"]}}},
 {"id": "E2", "t": "CloudTrail tampering",
  "why": "Alerts on attempts to stop or change trails, even if an SCP blocks them.",
  "c": "eb-service-event-cloudtrail list_cloudtrail",
  "doc": {"source": ["aws.cloudtrail"], "detail-type": ["AWS API Call via CloudTrail"],
          "detail": {"eventSource": ["cloudtrail.amazonaws.com"],
                     "eventName": ["StopLogging", "DeleteTrail", "UpdateTrail", "PutEventSelectors"]}}},
 {"id": "E3", "t": "Native AWS KMS events",
  "why": "AWS KMS emits these itself: completed key deletion, rotation and imported material expiry.",
  "c": "kms-events",
  "doc": {"source": ["aws.kms"], "detail-type": ["KMS CMK Deletion", "KMS CMK Rotation", "KMS Imported Key Material Expiration"]}},
]
ALARMS = [
 ["A1: use of a key pending deletion", "CloudWatch Logs metric filter on the CloudTrail log group, metric value 1, alarm at \u2265 1. Filter pattern: { $.eventSource = kms* && $.errorMessage = \"* is pending deletion.\"}", "deleting-keys-creating-cloudwatch-alarm"],
 ["A2: imported key material expiring", "Per-key metric SecondsUntilKeyMaterialExpires (KMS, Per-Key Metrics); one alarm per key; set the threshold to leave time to reimport (for example 30 days = 2,592,000 seconds).", "imported-key-material-expiration-alarm"],
 ["A3: request quota usage", "CloudWatch alarm on KMS request usage against the applied quota, so throttling is seen before it happens.", "requests-per-second"],
]

# ----------------------------------------------------------------- runbooks
RUNBOOKS = [
 {"id": "R1", "t": "Scheduled (automatic) rotation", "when": "Every new symmetric customer managed key with AWS KMS key material.",
  "steps": [
   ["Enable rotation with the agreed period (90 to 2,560 days; standard 365).", "aws kms enable-key-rotation --key-id <key-id> --rotation-period-in-days 365"],
   ["Confirm status and next rotation date.", "aws kms get-key-rotation-status --key-id <key-id>"],
   ["After the first rotation, list completed rotations.", "aws kms list-key-rotations --key-id <key-id>"]],
  "verify": "Config cmk-backing-key-rotation-enabled is COMPLIANT; \"KMS CMK Rotation\" event received. Rotation keeps older material so existing data still decrypts; data is not re-encrypted. The first and second rotations each add $1 per month.",
  "c": "rotating-keys-enable rotate-keys cmk-backing-key-rotation-enabled kms-events pricing"},
 {"id": "R2", "t": "On-demand rotation", "when": "Policy change, staff change, or suspected (not confirmed) exposure of a symmetric key.",
  "steps": [
   ["Rotate now (does not change the automatic schedule).", "aws kms rotate-key-on-demand --key-id <key-id>"],
   ["Confirm the new rotation is listed as ON_DEMAND.", "aws kms list-key-rotations --key-id <key-id>"]],
  "verify": "Limit: 25 on-demand rotations per key, not adjustable. For imported material, import the new material first. Not available for asymmetric, HMAC or custom key store keys: rotate manually (R3 step 4).",
  "c": "rotating-keys-on-demand resource-limits rotate-keys rotate-keys-manually"},
 {"id": "R3", "t": "Suspected key compromise or misuse", "when": "Alert shows unexpected use, an over-broad policy, or unknown grants.",
  "steps": [
   ["Open an incident and preserve CloudTrail evidence.", ""],
   ["Scope: last cryptographic use and who used the key.", "aws kms get-key-last-usage --key-id <key-id>"],
   ["Contain: remove the unwanted principal from the key policy and revoke grants (or disable the key: R4).", "aws kms put-key-policy --key-id <key-id> --policy file://fixed-policy.json"],
   ["Replace: create a new key, then repoint the alias (manual rotation).", "aws kms update-alias --alias-name alias/app1-prod-data --target-key-id <new-key-id>"],
   ["Re-encrypt data under the new key; keep the old key enabled or disabled (never deleted) until no data depends on it.", ""],
   ["Post-incident review and lessons learned.", ""]],
  "verify": "AWS has no single compromise procedure; this runbook combines the documented steps. Rotation does not re-encrypt data or protect data keys that were already exposed.",
  "c": "S23 monitoring-keys-determining-usage key-policies grants rotate-keys-manually enabling-keys S156 rotate-keys"},
 {"id": "R4", "t": "Emergency disable", "when": "Use of a key must stop now (active misuse, ransomware containment).",
  "steps": [
   ["Assume the kms-break-glass role (approval recorded).", ""],
   ["Disable the key.", "aws kms disable-key --key-id <key-id>"],
   ["Confirm the key state is Disabled.", "aws kms describe-key --key-id <key-id>"],
   ["When safe, re-enable.", "aws kms enable-key --key-id <key-id>"]],
  "verify": "Cryptographic operations with the key fail almost at once, but the effect on data keys is delayed until the KMS key is next used (for example to decrypt a data key). Expect dependent AWS services to fail; tell service owners first where possible.",
  "c": "enabling-keys unusable-kms-keys key-state"},
 {"id": "R5", "t": "Cancel a scheduled deletion", "when": "A deletion alert fires and the deletion was not approved, or a key in PendingDeletion is still needed.",
  "steps": [
   ["Cancel during the waiting period.", "aws kms cancel-key-deletion --key-id <key-id>"],
   ["The key returns as Disabled: enable it.", "aws kms enable-key --key-id <key-id>"],
   ["Investigate who scheduled it (CloudTrail ScheduleKeyDeletion).", ""]],
  "verify": "describe-key shows Enabled and no DeletionDate. Deletion cannot be undone after the waiting period ends.",
  "c": "deleting-keys-cancelling-key-deletion deleting-keys key-state"},
 {"id": "R6", "t": "Imported key material: expiry and reimport", "when": "Alarm A2 fires, or the key is in PendingImport.",
  "steps": [
   ["Get a new wrapping public key and import token.", "aws kms get-parameters-for-import --key-id <key-id> --wrapping-algorithm RSA_AES_KEY_WRAP_SHA_256 --wrapping-key-spec RSA_3072"],
   ["Wrap the ORIGINAL key material from escrow with the public key (offline, under dual control).", ""],
   ["Reimport the same material.", "aws kms import-key-material --key-id <key-id> --encrypted-key-material fileb://EncryptedKeyMaterial.bin --import-token fileb://ImportToken.bin --expiration-model KEY_MATERIAL_DOES_NOT_EXPIRE"]],
  "verify": "Key returns to Enabled. Only a copy of the original material restores access; to change the expiry you must reimport the same material. Losing your copy makes the data unrecoverable.",
  "c": "importing-keys-get-public-key-and-token importing-keys-import-key-material importing-keys-considerations imported-key-material-expiration-alarm key-state"},
]

# ----------------------------------------------------------------- checklist
CHECKLIST = [
 ["Customer managed keys for workload data (ADR-001)", "P2.3, P14.1", "B3.c, B4.b", "Key inventory (KeyManager), Config results", "S4 principle-14-secure-use-of-the-service S24 S154"],
 ["Key per app \u00d7 env \u00d7 data class; tags and aliases to standard (ADR-002)", "P14.2", "A3.a", "kms-key-tagged results; alias list", "principle-14-secure-use-of-the-service S14"],
 ["Separation of duties in every key policy (P1)", "P9, P10", "B2.c, B2.d", "Key policies in source control; Access Analyzer findings", "S8 S9 S12"],
 ["Break-glass only for disable and delete (P5, P7)", "P9", "B2.c", "SCP attachment; break-glass use log", "S8 S12"],
 ["Organization trail, immutable log archive, validation on", "P13", "C1.a", "Config CloudTrail rules; digest validation output", "S11 S13 cloudtrail-log-file-validation-intro"],
 ["Alerts for deletion, disable, policy change and trail tampering", "P13", "C1.c, C1.d", "EventBridge rules; test alert record", "S11 S13"],
 ["Rotation enabled and capped at 365 days (P6)", "P2.3", "B3.c", "cmk-backing-key-rotation-enabled; get-key-rotation-status", "S4 S24"],
 ["Single-Region in eu-west-2 unless an accepted ADR-004 exception", "P2.1", "A2.a", "Keys with MultiRegion = true; signed exception", "S4 principle-a2-risk-management"],
 ["Runbooks R1\u2013R6 exercised at least annually", "P5 (provider) / own operations", "D1.a, D1.c", "Exercise reports", "S21 principle-5-operational-security"],
 ["Lessons learned fed back into policies and ADRs", "P14.2", "D2.a, D2.b", "Post-incident reviews; ADR revisions", "principle-d2-lessons-learned principle-14-secure-use-of-the-service"],
 ["Provider assurance for AWS KMS (governance, operations, personnel, administration)", "P4, P5, P6, P12", "A2.c", "Provider certifications such as ISO/IEC 27001 or SOC 2 reports", "principle-4-governance-framework principle-5-operational-security principle-6-personnel-security principle-12-secure-service-administration principle-a2-risk-management"],
 ["Custom key store only under ADR-005, with availability design", "P2.5", "B5.a, B5.b", "describe-custom-key-stores; HSM AZ spread; DR test", "S4 principle-b5-resilient-networks-and-systems"],
 ["Named owner and review date for every key; ADRs approved", "P4 (own governance)", "A1.b, A1.c", "Tags owner and review-date; ADR register", "principle-4-governance-framework principle-a1-governance"],
]

# ----------------------------------------------------------------- cost & limits
COST = [
 ["Customer managed KMS key", "$1 per key per month, prorated hourly.", "pricing"],
 ["Automatic or on-demand rotation", "First and second rotations each add $1 per month; no further charge after the second rotation.", "pricing"],
 ["AWS managed and AWS owned keys", "No monthly key fee; request charges can apply.", "pricing"],
 ["Keys pending deletion", "No monthly charge while scheduled for deletion.", "pricing"],
 ["Cross-account requests", "Charged to the account making the request.", "pricing"],
 ["Free tier", "20,000 requests per month (some request types excluded).", "pricing"],
 ["Request price (pricing page worked examples)", "Examples on the page use $0.03 per 10,000 symmetric requests and $0.15 per 10,000 ECC signing requests. London rates are not shown in the static page.", "pricing"],
 ["CloudHSM key store", "CloudHSM is charged per HSM hour (the page example uses $1.60 per HSM per hour in US East (N. Virginia)); a key store needs at least two HSMs.", "pricing create-keystore"],
]
LIMITS = [
 ["Customer managed keys per account per Region", "100,000", "resource-limits"],
 ["Aliases per KMS key", "50", "resource-limits"],
 ["Grants per KMS key", "50,000", "resource-limits"],
 ["Custom key stores per account per Region", "10", "resource-limits"],
 ["On-demand rotations per key", "25 (not adjustable)", "resource-limits"],
 ["Symmetric cryptographic requests per second", "10,000 default; 20,000 in Europe (London)", "requests-per-second"],
 ["RSA, ECC, ML-DSA and ML-KEM requests per second", "1,000", "requests-per-second"],
 ["Requests per second per custom key store", "1,800", "requests-per-second"],
 ["Cross-account requests", "Count against the caller's account quota", "requests-per-second"],
 ["User-created tags per key", "50", "tagging-keys"],
]

INTRO = "A working pack for security architects designing AWS KMS for UK public-sector and regulated workloads: reference architectures, decisions, copyable policies, standards, threats, guardrails, runbooks, assurance mapping and costs. Example account IDs are the AWS documentation placeholders."
INTRO_C = "S146 S2 S7"
