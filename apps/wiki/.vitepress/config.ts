import { defineConfig } from 'vitepress'

export default defineConfig({
  srcExclude: ['README.md', 'CONTRIBUTING.md'],
  // Render one page at a time so the local search index lists the pages in a fixed
  // (sorted) order and the build output is the same on every run.
  buildConcurrency: 1,
  title: 'GOV Assured',
  description: 'Open Source Security Architecture Wiki',
  lang: 'en-GB',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico?v=08e5767b65', sizes: '48x48' }],
    ['link', { rel: 'icon', href: '/favicon.svg?v=2b46852867', type: 'image/svg+xml' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png?v=eea7edda9b' }],
    ['meta', { name: 'theme-color', content: '#1a1a2e' }],
    ['meta', { property: 'og:title', content: 'GOV Assured — Security Architecture Wiki' }],
    ['meta', { property: 'og:description', content: 'Open-source security architecture reference covering zero trust, network security, threat modelling, identity, and more.' }],
  ],

  themeConfig: {
    logo: { src: '/favicon.svg', alt: 'GOV Assured' },
    siteTitle: 'GOV Assured',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Foundations', link: '/foundations/' },
      { text: 'Threats', link: '/threat-intelligence/' },
      { text: 'Network Security', link: '/network-security/' },
      { text: 'Application Security', link: '/network-app-security/' },
      { text: 'Identity & Data', link: '/identity-access/' },
      { text: 'Cloud Security', link: '/cloud-security/' },
      {
        text: 'More',
        items: [
          { text: 'Infrastructure', link: '/infrastructure/' },
          { text: 'Data Security', link: '/data-security/' },
          { text: 'Endpoint & Device', link: '/endpoint-device/' },
          { text: 'Analytics & SIEM', link: '/analytics/' },
          { text: 'Risk & Governance', link: '/risk-governance/' },
          { text: 'AI Security', link: '/ai-security/' },
        ]
      },
    ],

    sidebar: {
      '/foundations/': [
        {
          text: 'Foundations',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/foundations/' },
            { text: 'Secure System Design', link: '/foundations/secure-system-design' },
            { text: 'DARIOM Lifecycle', link: '/foundations/dariom-lifecycle' },
            { text: 'Zero Trust Principles', link: '/foundations/zero-trust-principles' },
            { text: 'Time-Based Security', link: '/foundations/time-based-security' },
            { text: 'Post-Quantum Cryptography', link: '/foundations/post-quantum-cryptography' },
          ]
        }
      ],
      '/threat-intelligence/': [
        {
          text: 'Threat Intelligence',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/threat-intelligence/' },
            { text: 'Threat Modelling with MITRE ATT&CK', link: '/threat-intelligence/threat-modeling-mitre' },
            { text: 'Threat, Vulnerability & Data Flow Analysis', link: '/threat-intelligence/threat-vulnerability-analysis' },
            { text: 'Ransomware', link: '/threat-intelligence/ransomware' },
            { text: 'Frontier AI & AI-Powered Threats', link: '/threat-intelligence/frontier-ai-threats' },
          ]
        }
      ],
      '/network-security/': [
        {
          text: 'Network Security Architecture',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/network-security/' },
            { text: 'Physical & Layer 2 Security', link: '/network-security/physical-layer2-security' },
            { text: 'VLANs & PVLANs', link: '/network-security/vlans-pvlans' },
            { text: 'Layer 3 Attacks & Mitigation', link: '/network-security/layer3-attacks' },
            { text: 'Routers & Firewalls', link: '/network-security/routers-firewalls' },
            { text: 'Macro, Micro & Identity Segmentation', link: '/network-security/macro-micro-segmentation' },
            { text: 'Network vs Access Segmentation', link: '/network-security/network-access-segmentation' },
            { text: 'Web & SMTP Proxy Security', link: '/network-security/web-smtp-proxy' },
            { text: 'Layer 2 & 3 Benchmarks & Auditing', link: '/network-security/benchmarks-auditing' },
            { text: 'Securing SNMP & NTP', link: '/network-security/snmp-ntp-security' },
            { text: 'Bogon Filtering, Blackholes & Darknets', link: '/network-security/bogon-blackholes-darknets' },
          ]
        }
      ],
      '/infrastructure/': [
        {
          text: 'Infrastructure Security',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/infrastructure/' },
            { text: 'Hardening Hybrid Infrastructure', link: '/infrastructure/hardening-hybrid' },
            { text: 'NGFW On-Prem & Cloud', link: '/infrastructure/ngfw' },
          ]
        }
      ],
      '/network-app-security/': [
        {
          text: 'Network-Centric Application Security',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/network-app-security/' },
            { text: 'NSM with NIDS & NIPS', link: '/network-app-security/nsm-nids-nips' },
            { text: 'Application Proxies & Gateways', link: '/network-app-security/application-proxies' },
            { text: 'Secure Remote Access', link: '/network-app-security/secure-remote-access' },
            { text: 'VPNs, ZTNA & SASE', link: '/network-app-security/vpn-ztna-sase' },
            { text: 'Network Encryption', link: '/network-app-security/network-encryption' },
            { text: 'Application Security Testing (SAST, DAST, IAST, RASP)', link: '/network-app-security/application-security-testing' },
            { text: 'Container & Kubernetes Security', link: '/network-app-security/container-security' },
          ]
        }
      ],
      '/data-security/': [
        {
          text: 'Data-Centric Application Security',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/data-security/' },
            { text: 'Data-Centric Security', link: '/data-security/data-centric-security' },
            { text: 'Data Classification & Protective Marking', link: '/data-security/data-classification-protective-marking' },
            { text: 'Web Application Firewalls', link: '/data-security/web-application-firewalls' },
            { text: 'Database Firewalls & Activity Monitoring', link: '/data-security/database-firewalls' },
          ]
        }
      ],
      '/identity-access/': [
        {
          text: 'Identity & Access',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/identity-access/' },
            { text: 'Privileged Access & Identity Defence', link: '/identity-access/privileged-access' },
            { text: 'Identity Management & Federation', link: '/identity-access/identity-management-federation' },
            { text: 'Zero Trust Architecture', link: '/identity-access/zero-trust-architecture' },
          ]
        }
      ],
      '/endpoint-device/': [
        {
          text: 'Endpoint & Device',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/endpoint-device/' },
            { text: 'MDM & Private Cloud', link: '/endpoint-device/mdm-private-cloud' },
            { text: 'IoT Security', link: '/endpoint-device/iot-security' },
          ]
        }
      ],
      '/analytics/': [
        {
          text: 'Analytics & Detection',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/analytics/' },
            { text: 'Security Logging', link: '/analytics/logging' },
            { text: 'AI, Analytics & SIEM', link: '/analytics/ai-analytics-siem' },
          ]
        }
      ],
      '/cloud-security/': [
        {
          text: 'Cloud Security',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/cloud-security/' },
            { text: 'Cloud Service Models (IaaS, PaaS, SaaS, FaaS)', link: '/cloud-security/cloud-service-models' },
            { text: 'CSPM & Cloud Workload Protection (CWPP)', link: '/cloud-security/cspm-cwpp' },
          ]
        }
      ],
      '/risk-governance/': [
        {
          text: 'Risk & Governance',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/risk-governance/' },
            { text: 'Asset Management', link: '/risk-governance/asset-management' },
            { text: 'Supply Chain Security', link: '/risk-governance/supply-chain-security' },
            { text: 'Cyber Assessment Framework', link: '/risk-governance/cyber-assessment-framework' },
            { text: 'Cyber Essentials', link: '/risk-governance/cyber-essentials' },
            { text: 'Operational Security (OPSEC)', link: '/risk-governance/operational-security' },
            { text: 'People-Centred Security', link: '/risk-governance/people-centred-security' },
            { text: 'Penetration Testing', link: '/risk-governance/penetration-testing' },
          ]
        }
      ],
      '/ai-security/': [
        {
          text: 'AI Security Management',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/ai-security/' },
            { text: 'AI Governance & Program Management', link: '/ai-security/ai-governance-program' },
            { text: 'AI Risk Management', link: '/ai-security/ai-risk-management' },
            { text: 'AI Technologies & Controls', link: '/ai-security/ai-security-controls' },
          ]
        }
      ],
    },


    search: {
      provider: 'local'
    },

    footer: {
      message: '<a href="https://www.linkedin.com/company/102617034/" target="_blank" rel="noopener" aria-label="GOV Assured on LinkedIn">GOV Assured on LinkedIn</a>',
      copyright: '© 2026 GOV Assured'
    },

    socialLinks: [
      { icon: 'linkedin', link: 'https://www.linkedin.com/company/102617034/', ariaLabel: 'GOV Assured on LinkedIn' }
    ],
  }
})
