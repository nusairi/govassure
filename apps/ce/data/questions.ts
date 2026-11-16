// CE Readiness question bank
// Original questions based on NCSC Cyber Essentials technical requirements
// Source: NCSC Cyber Essentials Requirements for IT Infrastructure (Crown Copyright, OGL v3)
// https://www.ncsc.gov.uk/cyberessentials/overview

export type Answer = 'yes' | 'no' | 'partial' | 'na' | null

export type PassCondition = 'yes' | 'no'

export interface Question {
  id: string
  text: string
  guidance: string
  passCondition: PassCondition
  remediationGuidance: string
  weight: 'critical' | 'standard'
}

export interface Section {
  id: string
  slug: string
  title: string
  description: string
  ncscReference: string
  questions: Question[]
}

export const sections: Section[] = [
  {
    id: 'firewalls',
    slug: 'firewalls',
    title: 'Firewalls',
    description:
      'Boundary and host-based firewalls prevent unauthorised access to or from your network and devices. This section checks that you have appropriate firewall controls in place.',
    ncscReference: 'NCSC CE Technical Requirements: Section 1 — Firewalls',
    questions: [
      {
        id: 'fw-01',
        text: 'Does your organisation have a firewall (or equivalent network boundary control) protecting all internet-facing connections?',
        guidance:
          'A boundary firewall controls traffic entering and leaving your network. This can be a dedicated hardware appliance, a router with built-in firewall capabilities, or a cloud-based security group — as long as it filters traffic at the network perimeter.',
        passCondition: 'yes',
        remediationGuidance:
          'Deploy a firewall at every point where your network connects to the internet. Cloud environments should use security groups or equivalent controls. Ensure all traffic routes through the firewall — no unprotected paths to the internet.',
        weight: 'critical',
      },
      {
        id: 'fw-02',
        text: 'Are your firewalls configured to block all inbound connections by default, with only explicitly required services permitted?',
        guidance:
          'A default-deny inbound rule means nothing reaches your internal systems unless you have specifically allowed it. Each permitted rule should correspond to a documented business need.',
        passCondition: 'yes',
        remediationGuidance:
          'Review all inbound firewall rules. Remove or disable any rule that cannot be tied to a specific, current business requirement. Change the default policy to deny all inbound traffic, then add only the rules you need.',
        weight: 'critical',
      },
      {
        id: 'fw-03',
        text: 'Are unapproved or unnecessary services, ports, and protocols blocked at the boundary firewall?',
        guidance:
          'Open ports and services that are not required represent unnecessary attack surface. Common examples include SMB (445), RDP (3389), and Telnet (23) being accessible from the internet.',
        passCondition: 'yes',
        remediationGuidance:
          'Conduct a port scan from outside your network to identify exposed services. Close any ports or protocols that are not required for a documented business purpose. Document which services are permitted and why.',
        weight: 'critical',
      },
      {
        id: 'fw-04',
        text: 'Do all end-user devices (laptops, desktops, mobile devices) have a host-based firewall enabled?',
        guidance:
          'A host-based firewall on each device provides an additional layer of protection, particularly important when devices are used outside the office on untrusted networks.',
        passCondition: 'yes',
        remediationGuidance:
          'Enable the built-in firewall on all Windows, macOS, and Linux devices. Use Mobile Device Management (MDM) to enforce this as a baseline configuration and prevent users from disabling it.',
        weight: 'standard',
      },
      {
        id: 'fw-05',
        text: 'Is administrative access to firewalls and routers restricted to authorised personnel only, and protected by strong authentication?',
        guidance:
          'Firewall management interfaces should not be accessible from the internet and should require strong authentication (ideally multi-factor) from authorised administrators only.',
        passCondition: 'yes',
        remediationGuidance:
          'Restrict management access to a dedicated admin network or VPN. Disable remote management from the internet. Change all default credentials and require MFA for firewall administration.',
        weight: 'critical',
      },
      {
        id: 'fw-06',
        text: 'Are firewall rules reviewed at least every 12 months and after significant infrastructure changes?',
        guidance:
          'Firewall rules accumulate over time. Without regular reviews, outdated or overly permissive rules remain active long after the need for them has passed.',
        passCondition: 'yes',
        remediationGuidance:
          'Establish a periodic review process (at minimum annually) to audit all firewall rules. Remove rules for decommissioned systems and services. Document the review in your change management records.',
        weight: 'standard',
      },
    ],
  },
  {
    id: 'secure-configuration',
    slug: 'secure-configuration',
    title: 'Secure Configuration',
    description:
      'Computers and network devices should be configured securely to reduce vulnerabilities. Default settings are often insecure and must be reviewed before devices are deployed.',
    ncscReference: 'NCSC CE Technical Requirements: Section 2 — Secure Configuration',
    questions: [
      {
        id: 'sc-01',
        text: 'Have default passwords been changed on all devices, software, and services before they are deployed or used?',
        guidance:
          'Default credentials are widely known and frequently targeted by automated attacks. Every device, application, and service should have its default password changed to a strong, unique value before use.',
        passCondition: 'yes',
        remediationGuidance:
          'Audit all devices and applications for default or vendor-supplied credentials. Change every default password before deployment. Include this as a mandatory step in your device provisioning process.',
        weight: 'critical',
      },
      {
        id: 'sc-02',
        text: 'Have unnecessary software, services, and user accounts been removed or disabled on all devices?',
        guidance:
          'Every installed application and running service is a potential attack vector. Removing or disabling what is not needed — including pre-installed software, sample applications, and guest accounts — reduces your exposure.',
        passCondition: 'yes',
        remediationGuidance:
          'Build a baseline configuration for each device type that includes only required software and services. Disable or uninstall everything else. Use a software inventory tool to identify unmanaged applications.',
        weight: 'standard',
      },
      {
        id: 'sc-03',
        text: 'Is auto-run or auto-play disabled for removable media (USB drives, CDs, DVDs) on all devices?',
        guidance:
          'Auto-run can execute malicious code on a device the moment removable media is inserted, without any user interaction. Disabling it removes this attack vector.',
        passCondition: 'yes',
        remediationGuidance:
          'Disable auto-run via Group Policy on Windows devices. Apply the equivalent setting on macOS and Linux. Consider restricting the use of removable media entirely if it is not a business requirement.',
        weight: 'standard',
      },
      {
        id: 'sc-04',
        text: 'Do you maintain an inventory of authorised software, and do you prevent or detect unauthorised software installations?',
        guidance:
          'Knowing exactly what software is installed across your estate is a prerequisite for secure configuration. Application allow-listing or monitoring lets you detect and respond to unauthorised installations.',
        passCondition: 'yes',
        remediationGuidance:
          'Maintain a software asset register. Use MDM, endpoint management tools, or application control policies to restrict software installation to authorised titles only. Review the inventory regularly.',
        weight: 'standard',
      },
      {
        id: 'sc-05',
        text: 'Is the personal firewall on end-user devices set to block inbound connections that have not been authorised by the user or administrator?',
        guidance:
          'The host-based firewall should be configured to a known secure state — not just enabled, but configured correctly. Users should not be able to disable it or create permissive rules without authorisation.',
        passCondition: 'yes',
        remediationGuidance:
          'Configure host firewall settings through Group Policy or MDM to enforce inbound deny-by-default rules. Prevent users from modifying these settings. Audit device compliance regularly.',
        weight: 'standard',
      },
      {
        id: 'sc-06',
        text: 'Are cloud services, SaaS applications, and development/test environments included in your secure configuration baseline?',
        guidance:
          'Secure configuration applies to cloud infrastructure (IaaS/PaaS) and SaaS applications, not just on-premises devices. Misconfigured cloud storage, databases, and services are a leading cause of data breaches.',
        passCondition: 'yes',
        remediationGuidance:
          'Apply the same configuration principles to cloud environments: disable public access by default, review security group rules, enforce MFA on cloud admin accounts, and remove unused cloud resources.',
        weight: 'standard',
      },
    ],
  },
  {
    id: 'user-access-control',
    slug: 'user-access-control',
    title: 'User Access Control',
    description:
      'User accounts — especially privileged accounts — must be controlled carefully. Users should only have the access they need to do their job, and accounts should be managed throughout their lifecycle.',
    ncscReference: 'NCSC CE Technical Requirements: Section 3 — User Access Control',
    questions: [
      {
        id: 'uac-01',
        text: 'Does every user have a unique, individual account — with no shared or generic accounts in use?',
        guidance:
          'Shared accounts make it impossible to attribute actions to individuals, undermine accountability, and complicate incident investigation. Every person who accesses your systems should have their own account.',
        passCondition: 'yes',
        remediationGuidance:
          'Audit all user accounts and identify any shared or generic accounts (e.g., "admin", "temp", "shared"). Replace them with individual accounts. Remove any accounts that cannot be attributed to a specific person or service.',
        weight: 'critical',
      },
      {
        id: 'uac-02',
        text: 'Are administrative accounts used only for administrative tasks, and not for day-to-day activities like email and web browsing?',
        guidance:
          'Using privileged accounts for routine tasks dramatically increases the risk of malware infection and credential compromise. Administrators should have a separate standard account for everyday work.',
        passCondition: 'yes',
        remediationGuidance:
          'Create separate admin and standard accounts for all system administrators. Document and enforce a policy that admin accounts are used exclusively for admin tasks. Monitor admin account activity for anomalous use.',
        weight: 'critical',
      },
      {
        id: 'uac-03',
        text: 'Is multi-factor authentication (MFA) enforced for all users accessing cloud services and for all remote access to your network?',
        guidance:
          'MFA significantly reduces the risk of account compromise, particularly for internet-facing services. Under current CE requirements, MFA is mandatory for cloud services and remote access.',
        passCondition: 'yes',
        remediationGuidance:
          'Enable and enforce MFA on Microsoft 365, Google Workspace, AWS, Azure, and all other cloud services. Require MFA for VPN and remote desktop access. Use authenticator apps rather than SMS where possible.',
        weight: 'critical',
      },
      {
        id: 'uac-04',
        text: 'Are user accounts reviewed and promptly disabled or removed when an employee leaves or changes role?',
        guidance:
          'Stale accounts for former employees or employees who have changed roles are a significant risk. Accounts should be disabled within one working day of a departure and reviewed at least quarterly.',
        passCondition: 'yes',
        remediationGuidance:
          'Integrate HR and IT processes so that account removal is triggered when someone leaves. Conduct quarterly access reviews. Disable accounts immediately on departure; do not wait for formal notice.',
        weight: 'standard',
      },
      {
        id: 'uac-05',
        text: 'Is privileged access limited to the minimum required for each role (principle of least privilege)?',
        guidance:
          'Users and service accounts should have only the permissions they need to perform their role — nothing more. Over-privileged accounts significantly amplify the impact of a compromise.',
        passCondition: 'yes',
        remediationGuidance:
          'Review permissions for all accounts and reduce them to the minimum required. Remove local administrator rights from standard users. Implement role-based access control (RBAC). Audit privileged group membership regularly.',
        weight: 'critical',
      },
      {
        id: 'uac-06',
        text: 'Are password policies enforced that require a minimum length of at least 8 characters, and do they prevent the use of known compromised passwords?',
        guidance:
          'Strong password policies reduce the risk of successful brute-force and credential-stuffing attacks. NCSC recommends a minimum of 8 characters, with longer passphrases encouraged. Checking against known-breached password lists (e.g., HIBP) is best practice.',
        passCondition: 'yes',
        remediationGuidance:
          'Configure password policies in Active Directory, Azure AD, or your identity provider to enforce minimum length. Integrate with a breached password service. Consider deploying a password manager to encourage strong, unique passwords.',
        weight: 'standard',
      },
    ],
  },
  {
    id: 'malware-protection',
    slug: 'malware-protection',
    title: 'Malware Protection',
    description:
      'Malware protection prevents malicious software from executing on your devices. This includes anti-malware software, application control, and safe browsing controls.',
    ncscReference: 'NCSC CE Technical Requirements: Section 4 — Malware Protection',
    questions: [
      {
        id: 'mp-01',
        text: 'Is anti-malware software installed, active, and kept up to date on all applicable devices?',
        guidance:
          'Anti-malware software should be installed on all Windows, macOS, and Android devices. It must be active (real-time protection enabled), automatically updated, and configured to scan regularly. Note: CE accepts application allow-listing as an alternative to signature-based anti-malware.',
        passCondition: 'yes',
        remediationGuidance:
          'Deploy endpoint protection across all devices. Enable automatic signature updates and real-time scanning. Use an endpoint management platform to monitor compliance and alert on devices where protection has been disabled or is out of date.',
        weight: 'critical',
      },
      {
        id: 'mp-02',
        text: 'Is anti-malware software configured to run automatic scans and to prevent users from disabling it?',
        guidance:
          'Anti-malware is only effective if it is running and up to date. Users should not be able to disable real-time protection or prevent automatic updates.',
        passCondition: 'yes',
        remediationGuidance:
          'Configure anti-malware through Group Policy or MDM to enforce automatic updates and prevent user tampering. Monitor your endpoint management console for devices that are out of compliance.',
        weight: 'standard',
      },
      {
        id: 'mp-03',
        text: 'Are potentially dangerous file types blocked or controlled — for example, restricting macros in Office documents or blocking executable attachments in email?',
        guidance:
          'Certain file types are commonly used to deliver malware: Office macros, executable attachments (.exe, .vbs, .js), and archive files containing executables. Blocking or restricting these at email gateways and endpoints significantly reduces exposure.',
        passCondition: 'yes',
        remediationGuidance:
          'Configure your email gateway to block or quarantine high-risk attachment types. Disable Office macros by default and use macro policies to allow only signed macros from trusted sources. Block the execution of scripts from user-writable locations.',
        weight: 'standard',
      },
      {
        id: 'mp-04',
        text: 'If you use application allow-listing (instead of or in addition to anti-malware), does it prevent unauthorised executables from running?',
        guidance:
          'Application allow-listing is accepted by CE as an alternative to signature-based anti-malware. It controls which applications can execute, preventing unknown or unauthorised software from running — including malware.',
        passCondition: 'yes',
        remediationGuidance:
          'If using allow-listing, ensure it covers all user-accessible paths. Regularly review and update the allow-list. If not using allow-listing, ensure your anti-malware answers the previous questions adequately.',
        weight: 'standard',
      },
      {
        id: 'mp-05',
        text: 'Are web browsing controls in place to prevent users from accessing known malicious websites?',
        guidance:
          'Web filtering or DNS filtering can block access to known malware distribution sites, phishing pages, and command-and-control infrastructure — reducing the risk of infection via drive-by downloads or phishing.',
        passCondition: 'yes',
        remediationGuidance:
          'Deploy web filtering via a proxy, DNS filtering service, or browser-based controls. Ensure the filtering applies to off-network devices (e.g., via an agent or DNS-over-HTTPS setting). Keep threat intelligence feeds up to date.',
        weight: 'standard',
      },
    ],
  },
  {
    id: 'patch-management',
    slug: 'patch-management',
    title: 'Patch Management',
    description:
      'Keeping software and firmware up to date is one of the most effective ways to protect against known vulnerabilities. Security updates must be applied promptly across your entire estate.',
    ncscReference: 'NCSC CE Technical Requirements: Section 5 — Patch Management',
    questions: [
      {
        id: 'pm-01',
        text: 'Are operating systems on all in-scope devices kept up to date with security patches, with critical patches applied within 14 days of release?',
        guidance:
          'CE requires that "high" or "critical" severity patches are applied within 14 days of release. A structured patching process — with testing and deployment automation where possible — is needed to achieve this consistently.',
        passCondition: 'yes',
        remediationGuidance:
          'Implement automated patch management (Windows Update, WSUS, SCCM, Jamf, etc.). Establish a patching SLA: critical patches within 14 days. Monitor patch compliance through your endpoint management platform and report on stragglers.',
        weight: 'critical',
      },
      {
        id: 'pm-02',
        text: 'Are all third-party applications (browsers, Office suites, PDF readers, etc.) kept up to date with security patches within 14 days of release?',
        guidance:
          'Applications are as important as the OS. Browsers and their extensions, Office applications, and PDF readers are frequent targets. Auto-update features should be enabled; where they are not available, a manual process must compensate.',
        passCondition: 'yes',
        remediationGuidance:
          'Enable automatic updates for all major applications. Use a patch management tool that covers third-party applications (e.g., Chocolatey, Patch My PC, Jamf). Maintain a software inventory so you know what needs patching.',
        weight: 'critical',
      },
      {
        id: 'pm-03',
        text: 'Are firmware updates for network devices, routers, firewalls, and IoT devices applied within 14 days of a critical security update?',
        guidance:
          'Network infrastructure firmware is frequently overlooked. Router and firewall firmware vulnerabilities can completely undermine your network security if left unpatched.',
        passCondition: 'yes',
        remediationGuidance:
          'Subscribe to security advisories from your hardware vendors. Establish a process to review and apply firmware updates within 14 days for critical issues. Include network device firmware in your patch management scope.',
        weight: 'critical',
      },
      {
        id: 'pm-04',
        text: 'Is all software in scope actively supported by its vendor — with no end-of-life or unsupported operating systems or applications in use?',
        guidance:
          'Software that is no longer supported by the vendor receives no security patches. Running unsupported software is a CE failure — examples include Windows 10 (end of support October 2025), Windows Server 2012, and any software past its vendor end-of-life date.',
        passCondition: 'yes',
        remediationGuidance:
          'Audit your software estate for end-of-life products. Upgrade or replace unsupported software before submitting for CE. Where immediate replacement is not possible, implement compensating controls and plan for urgent remediation.',
        weight: 'critical',
      },
      {
        id: 'pm-05',
        text: 'Do you have a documented process for identifying applicable security updates and deploying them within the required timeframes?',
        guidance:
          'An ad-hoc patching approach — even if it sometimes achieves timely patching — is insufficient for CE. You need a documented, repeatable process with defined responsibilities and monitoring.',
        passCondition: 'yes',
        remediationGuidance:
          'Document your patch management process: how you identify new patches, how you test them, who is responsible for deployment, and how you verify completion. Include SLAs. Review the process at least annually.',
        weight: 'standard',
      },
      {
        id: 'pm-06',
        text: 'Are cloud services, SaaS applications, and containerised workloads included in your patch management scope?',
        guidance:
          'CE scope now explicitly includes cloud infrastructure and services managed by your organisation. Container base images, IaaS VMs, and developer workstations all require patching within the same 14-day window.',
        passCondition: 'yes',
        remediationGuidance:
          'Include cloud VMs, container base images, and developer tooling in your patch management scope. Use cloud-native tooling (AWS Inspector, Azure Defender, etc.) to identify vulnerabilities. Rebuild containers from patched base images rather than patching in-place.',
        weight: 'standard',
      },
    ],
  },
]

export const getSectionBySlug = (slug: string): Section | undefined =>
  sections.find((s) => s.slug === slug)

export const getTotalQuestions = (): number =>
  sections.reduce((acc, s) => acc + s.questions.length, 0)
