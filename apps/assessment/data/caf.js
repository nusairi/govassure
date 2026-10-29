/**
 * NCSC Cyber Assessment Framework v4.0
 * Structure: Objectives > Principles > Contributing Outcomes (IGPs)
 *
 * Score levels:
 *   "not_achieved"       - Red
 *   "partially_achieved" - Amber  (only where the CAF specifies a partial level)
 *   "achieved"           - Green
 *
 * hasPa: true means this IGP has a "Partially achieved" band.
 */

export const CAF = [
  // ─────────────────────────────────────────────────────────────────────────
  // OBJECTIVE A – Managing Security Risk
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "A",
    title: "Managing Security Risk",
    description:
      "Appropriate organisational structures, policies, processes, and procedures in place to understand, assess and systematically manage security risks to network and information systems supporting essential functions.",
    colour: "#1d70b8",
    principles: [
      {
        id: "A1",
        title: "Governance",
        description:
          "The organisation has appropriate management policies, processes and procedures in place to govern its approach to the security of network and information systems.",
        igps: [
          {
            id: "A1a",
            code: "A1.a",
            title: "Board Direction",
            description:
              "You have effective organisational security management led at board level and articulated clearly in corresponding policies.",
            hasPa: false,
          },
          {
            id: "A1b",
            code: "A1.b",
            title: "Roles and Responsibilities",
            description:
              "Your organisation has established roles and responsibilities for the security of network and information systems at all levels, with clear and well-understood channels for communicating and escalating risks.",
            hasPa: false,
          },
          {
            id: "A1c",
            code: "A1.c",
            title: "Decision-making",
            description:
              "You have senior-level accountability for the security of network and information systems, and delegate decision-making authority appropriately and effectively. Risks to network and information systems related to the operation of the essential function(s) are considered in the context of other organisational risks.",
            hasPa: false,
          },
        ],
      },
      {
        id: "A2",
        title: "Risk Management",
        description:
          "The organisation takes appropriate steps to identify, assess and understand security risks to network and information systems supporting the operation of essential functions. This includes an overall organisational approach to risk management.",
        igps: [
          {
            id: "A2a",
            code: "A2.a",
            title: "Risk Management Process",
            description:
              "Your organisation has effective internal processes for managing risks to the security and resilience of network and information systems related to the operation of your essential function(s) and communicating associated activities.",
            hasPa: true,
          },
          {
            id: "A2b",
            code: "A2.b",
            title: "Understanding Threat",
            description:
              "You understand the capabilities, methods and techniques of threat actors and what network and information systems they may compromise to adversely impact your essential function(s). This information is used to inform security and resilience risk management decisions.",
            hasPa: true,
          },
          {
            id: "A2c",
            code: "A2.c",
            title: "Assurance",
            description:
              "You have gained confidence in the effectiveness of the security of your technology, people, and processes relevant to the operation of network and information systems supporting your essential function(s).",
            hasPa: false,
          },
        ],
      },
      {
        id: "A3",
        title: "Asset Management",
        description:
          "Everything required to deliver, maintain or support network and information systems necessary for the operation of essential functions is determined and understood. This includes data, people and systems, as well as any supporting infrastructure.",
        igps: [
          {
            id: "A3a",
            code: "A3.a",
            title: "Asset Management",
            description:
              "All assets relevant to the secure operation of essential function(s) are identified and inventoried. The inventory is kept up-to-date and assets are prioritised according to their importance.",
            hasPa: false,
          },
        ],
      },
      {
        id: "A4",
        title: "Supply Chain",
        description:
          "The organisation understands and manages security risks to network and information systems supporting the operation of essential functions that arise as a result of dependencies on suppliers.",
        igps: [
          {
            id: "A4a",
            code: "A4.a",
            title: "Supply Chain",
            description:
              "You understand and effectively manage the risks associated with suppliers to the security of network and information systems supporting the operation of your essential function(s).",
            hasPa: true,
          },
          {
            id: "A4b",
            code: "A4.b",
            title: "Secure Software Development and Support",
            description:
              "You actively maximise the use of secure and supported software, whether developed internally or sourced externally, within network and information systems supporting the operation of your essential function(s).",
            hasPa: true,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OBJECTIVE B – Protecting Against Cyber Attacks
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "B",
    title: "Protecting Against Cyber Attacks",
    description:
      "Proportionate security measures are in place to protect network and information systems supporting essential functions from cyber attack.",
    colour: "#00703c",
    principles: [
      {
        id: "B1",
        title: "Service Protection Policies, Processes and Procedures",
        description:
          "The organisation defines, implements, communicates and enforces appropriate policies, processes and procedures that direct its overall approach to securing systems and data that support the operation of essential functions.",
        igps: [
          {
            id: "B1a",
            code: "B1.a",
            title: "Policy, Process and Procedure Development",
            description:
              "You have developed and continue to improve a set of cyber security and resilience policies, processes and procedures that manage and mitigate the risk of adverse impact on your essential function(s).",
            hasPa: true,
          },
          {
            id: "B1b",
            code: "B1.b",
            title: "Policy, Process and Procedure Implementation",
            description:
              "You have successfully implemented your security policies, processes and procedures and can demonstrate the security benefits achieved.",
            hasPa: true,
          },
        ],
      },
      {
        id: "B2",
        title: "Identity and Access Control",
        description:
          "The organisation understands, documents and manages access to networks and information systems supporting the operation of essential functions. Users (or automated functions) that can access data or services are appropriately verified, authenticated and authorised.",
        igps: [
          {
            id: "B2a",
            code: "B2.a",
            title: "User Access Control",
            description:
              "Access to network and information systems supporting the operation of your essential function(s) is limited to the minimum necessary for users to effectively carry out their role.",
            hasPa: true,
          },
          {
            id: "B2b",
            code: "B2.b",
            title: "Device Access Control",
            description:
              "Only devices that are known to your organisation and have an appropriate level of security can connect to your networks and information systems supporting the operation of your essential function(s).",
            hasPa: true,
          },
          {
            id: "B2c",
            code: "B2.c",
            title: "Privileged User Management",
            description:
              "The number of privileged accounts is minimised and the activity of privileged users is appropriately monitored and controlled.",
            hasPa: true,
          },
          {
            id: "B2d",
            code: "B2.d",
            title: "Identity Verification",
            description:
              "Appropriate identity verification is applied to users (including privileged users) when accessing networks and information systems supporting the operation of your essential function(s).",
            hasPa: true,
          },
        ],
      },
      {
        id: "B3",
        title: "Data Security",
        description:
          "Data stored or processed by network and information systems supporting the operation of essential functions is protected from unauthorised access, modification or deletion that would adversely impact the operation of those functions.",
        igps: [
          {
            id: "B3a",
            code: "B3.a",
            title: "Understanding Data",
            description:
              "You understand what data is stored, transmitted and processed by the network and information systems supporting the operation of your essential function(s), and the risks to that data.",
            hasPa: false,
          },
          {
            id: "B3b",
            code: "B3.b",
            title: "Data in Transit",
            description:
              "Data important to the operation of your essential function(s) is protected in transit from eavesdropping and tampering.",
            hasPa: true,
          },
          {
            id: "B3c",
            code: "B3.c",
            title: "Stored Data",
            description:
              "Data important to the operation of your essential function(s) is protected when at rest from unauthorised access or manipulation.",
            hasPa: true,
          },
          {
            id: "B3d",
            code: "B3.d",
            title: "Mobile Data",
            description:
              "Data important to the operation of your essential function(s) and held on mobile devices or removable media is protected from loss or compromise.",
            hasPa: false,
          },
          {
            id: "B3e",
            code: "B3.e",
            title: "Media Sanitisation",
            description:
              "Media containing data important to the operation of your essential function(s) is sanitised when no longer required.",
            hasPa: false,
          },
        ],
      },
      {
        id: "B4",
        title: "System Security",
        description:
          "Network and information systems and technology critical for the operation of essential functions are protected from cyber attack. An organisational understanding of risk to essential functions informs the use of robust and reliable protective security measures to effectively limit opportunities for threat actors to compromise networks and systems.",
        igps: [
          {
            id: "B4a",
            code: "B4.a",
            title: "Secure by Design",
            description:
              "You design security into the network and information systems that support the operation of the essential function(s). You minimise their attack surface and ensure that the operation of the essential function(s) should not be impacted by the exploitation of any single vulnerability.",
            hasPa: true,
          },
          {
            id: "B4b",
            code: "B4.b",
            title: "Secure Configuration",
            description:
              "You securely configure network and information systems that support the operation of your essential function(s).",
            hasPa: true,
          },
          {
            id: "B4c",
            code: "B4.c",
            title: "Secure Management",
            description:
              "You manage your organisation's network and information systems that support the operation of your essential function(s) to enable and maintain security.",
            hasPa: true,
          },
          {
            id: "B4d",
            code: "B4.d",
            title: "Vulnerability Management",
            description:
              "You manage known vulnerabilities in network and information systems to prevent adverse impact on your essential function(s).",
            hasPa: true,
          },
        ],
      },
      {
        id: "B5",
        title: "Resilient Networks and Systems",
        description:
          "The organisation builds resilience against cyber attack and system failure into the design, implementation, operation and management of systems that support the operation of essential functions.",
        igps: [
          {
            id: "B5a",
            code: "B5.a",
            title: "Resilience Preparation",
            description:
              "You are prepared to restore the operation of your essential function(s) following adverse impact to network and information systems.",
            hasPa: true,
          },
          {
            id: "B5b",
            code: "B5.b",
            title: "Design for Resilience",
            description:
              "You design the network and information systems supporting your essential function(s) to be resilient to cyber security incidents. Systems are appropriately segregated and resource limitations are mitigated.",
            hasPa: true,
          },
          {
            id: "B5c",
            code: "B5.c",
            title: "Backups",
            description:
              "You hold accessible and secured current backups of data and information needed to recover operation of your essential function(s) following an adverse impact to network and information systems.",
            hasPa: true,
          },
        ],
      },
      {
        id: "B6",
        title: "Staff Awareness and Training",
        description:
          "Staff have appropriate awareness, knowledge and skills to carry out their organisational roles effectively in relation to the security of network and information systems supporting the operation of essential functions.",
        igps: [
          {
            id: "B6a",
            code: "B6.a",
            title: "Cyber Security Culture",
            description:
              "You develop and maintain a positive cyber security culture and a shared sense of responsibility.",
            hasPa: true,
          },
          {
            id: "B6b",
            code: "B6.b",
            title: "Cyber Security Training",
            description:
              "The people who support the operation of network and information systems supporting your essential function(s) are appropriately trained in cyber security.",
            hasPa: true,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OBJECTIVE C – Detecting Cyber Security Events
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "C",
    title: "Detecting Cyber Security Events",
    description:
      "Capabilities exist to ensure security defences remain effective and to detect cyber security events and incidents adversely affecting, or with the potential to adversely affect, essential functions.",
    colour: "#912b88",
    principles: [
      {
        id: "C1",
        title: "Security Monitoring",
        description:
          "The organisation monitors the security status of the networks and systems supporting the operation of essential functions in order to detect potential security problems and track the effectiveness of protective measures.",
        igps: [
          {
            id: "C1a",
            code: "C1.a",
            title: "Monitoring Coverage",
            description:
              "You monitor networks and information systems supporting the operation of your essential function(s) and the data held on them to identify potential security problems and track the effectiveness of protective measures.",
            hasPa: true,
          },
          {
            id: "C1b",
            code: "C1.b",
            title: "Identifying Security Events",
            description:
              "You detect, analyse and escalate events that have the potential to adversely affect the operation of your essential function(s).",
            hasPa: true,
          },
          {
            id: "C1c",
            code: "C1.c",
            title: "Security Incident Alerting",
            description:
              "You have systems or processes in place to generate security alerts from monitoring information, which enable appropriate response to potential security incidents.",
            hasPa: false,
          },
        ],
      },
      {
        id: "C2",
        title: "Threat Hunting",
        description:
          "The organisation proactively seeks to detect, within networks and information systems, adverse activity affecting, or with the potential to affect, the operation of essential functions even when the activity evades standard security prevent/detect solutions.",
        igps: [
          {
            id: "C2a",
            code: "C2.a",
            title: "Threat Hunting",
            description:
              "You proactively search for threats in networks and information systems supporting your essential function(s) using pre-determined and documented methods, at a frequency that matches the risks posed.",
            hasPa: true,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OBJECTIVE D – Minimising the Impact of Cyber Security Incidents
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "D",
    title: "Minimising the Impact of Cyber Security Incidents",
    description:
      "Capabilities exist to minimise the adverse impact of a cyber security incident on the operation of essential functions, including the restoration of those functions where necessary.",
    colour: "#d4351c",
    principles: [
      {
        id: "D1",
        title: "Response and Recovery Planning",
        description:
          "There are well-defined and tested incident management processes in place, that aim to ensure continuity of essential function(s) in the event of system or service failure.",
        igps: [
          {
            id: "D1a",
            code: "D1.a",
            title: "Response Plan",
            description:
              "You have an up-to-date incident response plan that is grounded in a thorough risk assessment that takes account of network and information systems supporting the operation of your essential function(s) and covers a range of incident scenarios.",
            hasPa: true,
          },
          {
            id: "D1b",
            code: "D1.b",
            title: "Response and Recovery Capability",
            description:
              "You have the capability to enact your incident response plan, including effective limitation of impact on the operation of your essential function(s). During an incident, you have access to timely information on which to base your response decisions.",
            hasPa: false,
          },
          {
            id: "D1c",
            code: "D1.c",
            title: "Testing and Exercising",
            description:
              "Your organisation carries out exercises to test response plans, using past incidents that affected your (and other) organisations, and scenarios that draw on threat intelligence and your risk assessment.",
            hasPa: false,
          },
        ],
      },
      {
        id: "D2",
        title: "Lessons Learned",
        description:
          "When an incident occurs, steps are taken to understand its causes and to ensure remediating action is taken to protect against future incidents.",
        igps: [
          {
            id: "D2a",
            code: "D2.a",
            title: "Post Incident Analysis",
            description:
              "When an incident occurs, your organisation takes steps to understand its causes, informing appropriate remediating action.",
            hasPa: false,
          },
          {
            id: "D2b",
            code: "D2.b",
            title: "Using Incidents to Drive Improvements",
            description:
              "Your organisation uses lessons learned from incidents to improve your security measures.",
            hasPa: false,
          },
        ],
      },
    ],
  },
];

/**
 * Flat list of all principles for easy lookup.
 */
export const ALL_PRINCIPLES = CAF.flatMap((obj) =>
  obj.principles.map((p) => ({ ...p, objectiveId: obj.id, objectiveTitle: obj.title, objectiveColour: obj.colour }))
);

/**
 * Flat list of all IGPs for easy lookup and counting.
 */
export const ALL_IGPS = ALL_PRINCIPLES.flatMap((p) =>
  p.igps.map((igp) => ({
    ...igp,
    principleId: p.id,
    principleTitle: p.title,
    objectiveId: p.objectiveId,
    objectiveTitle: p.objectiveTitle,
  }))
);

export const TOTAL_IGPS = ALL_IGPS.length;

/**
 * Score labels and colours.
 */
export const SCORES = {
  achieved: { label: "Achieved", colour: "#00703c", bgColour: "#cce2d8", short: "A" },
  partially_achieved: { label: "Partially achieved", colour: "#f47738", bgColour: "#fde4d1", short: "P" },
  not_achieved: { label: "Not achieved", colour: "#d4351c", bgColour: "#f6d7d2", short: "N" },
};

/**
 * Returns options array for a given IGP.
 */
export function getScoreOptions(igp) {
  if (igp.hasPa) {
    return [
      { value: "achieved", label: "Achieved" },
      { value: "partially_achieved", label: "Partially achieved" },
      { value: "not_achieved", label: "Not achieved" },
    ];
  }
  return [
    { value: "achieved", label: "Achieved" },
    { value: "not_achieved", label: "Not achieved" },
  ];
}
