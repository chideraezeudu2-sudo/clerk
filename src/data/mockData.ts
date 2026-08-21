import {
  Campaign,
  DraftEmail,
  SentEmail,
  SenderMailbox,
  Persona,
  AppSettings,
  UserSettings,
  AssistantMessage,
  Organization,
  JobPost,
  PersonLead,
} from '../types';

export const initialOrganizations: Organization[] = [
  {
    id: 'org-veloce',
    name: 'Veloce Data',
    domain: 'velocedata.io',
    employees: 140,
    peopleCount: 138,
    teamsCount: 12,
    jobsCount: 3,
    lastPost: '2h ago',
    industries: ['Data Infrastructure', 'IT Services'],
    orgTags: ['Series A', 'Hiring Surge'],
    isStarred: true,
    activeSignal: 'Posted 3 Staff Backend & Outbound roles',
    signalType: 'hiring',
  },
  {
    id: 'org-1',
    name: 'Amazon',
    domain: 'amazon.com',
    employees: 708180,
    peopleCount: 708180,
    teamsCount: 68678,
    jobsCount: 553001,
    lastPost: '1d ago',
    industries: ['IT Services', 'Cloud & E-Commerce'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
    activeSignal: 'Expanding enterprise AWS sales teams',
    signalType: 'hiring',
  },
  {
    id: 'org-2',
    name: 'Microsoft',
    domain: 'microsoft.com',
    employees: 353467,
    peopleCount: 353463,
    teamsCount: 27243,
    jobsCount: 131307,
    lastPost: '1d ago',
    industries: ['Software & Cloud', 'IT Services'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
    activeSignal: 'Copilot integration expansion across GTM',
    signalType: 'tech_changes',
  },
  {
    id: 'org-3',
    name: 'IBM',
    domain: 'ibm.com',
    employees: 319168,
    peopleCount: 319165,
    teamsCount: 10622,
    jobsCount: 120420,
    lastPost: '1d ago',
    industries: ['IT Services', 'Consulting'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
    activeSignal: 'watsonx pipeline replatforming',
    signalType: 'tech_changes',
  },
  {
    id: 'org-4',
    name: 'Walmart',
    domain: 'walmart.com',
    employees: 300470,
    peopleCount: 300469,
    teamsCount: 14233,
    jobsCount: 122683,
    lastPost: '1d ago',
    industries: ['Retail Tech', 'Logistics'],
    orgTags: ['Enterprise'],
    isStarred: false,
  },
  {
    id: 'org-5',
    name: 'Siemens',
    domain: 'siemens.com',
    employees: 293161,
    peopleCount: 293154,
    teamsCount: 35374,
    jobsCount: 173260,
    lastPost: '1d ago',
    industries: ['Industrial Automation', 'IT Services'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
  },
  {
    id: 'org-6',
    name: 'JPMorganChase',
    domain: 'jpmorganchase.com',
    employees: 281205,
    peopleCount: 281198,
    teamsCount: 39250,
    jobsCount: 159291,
    lastPost: '1d ago',
    industries: ['Banking & Fintech', 'Financial Services'],
    orgTags: ['Enterprise'],
    isStarred: false,
  },
  {
    id: 'org-7',
    name: 'GE',
    domain: 'ge.com',
    employees: 220365,
    peopleCount: 220363,
    teamsCount: 36709,
    jobsCount: 119891,
    lastPost: '1d ago',
    industries: ['Energy & Aerospace', 'IT Services'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
  },
  {
    id: 'org-8',
    name: 'Berkshire Hathaway',
    domain: 'berkshirehathaway.com',
    employees: 196406,
    peopleCount: 196402,
    teamsCount: 16878,
    jobsCount: 112705,
    lastPost: '1d ago',
    industries: ['Holding & Insurance'],
    orgTags: ['Enterprise'],
    isStarred: false,
  },
  {
    id: 'org-9',
    name: 'Bank of America',
    domain: 'bankofamerica.com',
    employees: 185083,
    peopleCount: 185059,
    teamsCount: 8967,
    jobsCount: 30875,
    lastPost: '1d ago',
    industries: ['Financial Services', 'IT Services'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
  },
  {
    id: 'org-10',
    name: 'Citi',
    domain: 'citigroup.com',
    employees: 185033,
    peopleCount: 185027,
    teamsCount: 27139,
    jobsCount: 126437,
    lastPost: '1d ago',
    industries: ['Banking', 'IT Services'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
  },
  {
    id: 'org-11',
    name: 'UnitedHealth Group',
    domain: 'unitedhealthgroup.com',
    employees: 181361,
    peopleCount: 181361,
    teamsCount: 15497,
    jobsCount: 150334,
    lastPost: '1d ago',
    industries: ['Healthcare Systems', 'IT Services'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
  },
  {
    id: 'org-12',
    name: 'Porsche Automobil Holding SE',
    domain: 'porsche-se.com',
    employees: 180366,
    peopleCount: 180361,
    teamsCount: 21757,
    jobsCount: 70078,
    lastPost: '1d ago',
    industries: ['Automotive Tech'],
    orgTags: ['Enterprise'],
    isStarred: false,
  },
  {
    id: 'org-13',
    name: 'Wells Fargo',
    domain: 'wellsfargo.com',
    employees: 179310,
    peopleCount: 179289,
    teamsCount: 15852,
    jobsCount: 141341,
    lastPost: '1d ago',
    industries: ['Financial Services', 'IT Services'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
  },
  {
    id: 'org-14',
    name: 'BNP Paribas',
    domain: 'bnpparibas.com',
    employees: 171381,
    peopleCount: 171378,
    teamsCount: 27027,
    jobsCount: 75355,
    lastPost: '23h ago',
    industries: ['Banking', 'IT Services'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
  },
  {
    id: 'org-15',
    name: 'Marriott International',
    domain: 'marriott.com',
    employees: 169714,
    peopleCount: 169714,
    teamsCount: 15044,
    jobsCount: 134952,
    lastPost: '23h ago',
    industries: ['Hospitality & Booking Tech'],
    orgTags: ['Enterprise'],
    isStarred: false,
  },
  {
    id: 'org-16',
    name: 'Apple',
    domain: 'apple.com',
    employees: 169090,
    peopleCount: 169090,
    teamsCount: 10547,
    jobsCount: 136621,
    lastPost: '1d ago',
    industries: ['Consumer Tech & Hardware'],
    orgTags: ['Enterprise'],
    isStarred: false,
  },
  {
    id: 'org-17',
    name: 'Oracle',
    domain: 'oracle.com',
    employees: 166341,
    peopleCount: 166341,
    teamsCount: 10095,
    jobsCount: 90061,
    lastPost: '1d ago',
    industries: ['Enterprise Database & Cloud', 'IT Services'],
    orgTags: ['Enterprise', 'IT Services'],
    isStarred: false,
  },
];

export const initialJobPosts: JobPost[] = [
  {
    id: 'job-1',
    company: 'Veloce Data',
    role: 'Senior Infrastructure Engineer (Outbound & API Integrations)',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    postedAt: '2 hours ago',
    matchedSignal: 'Scaling outbound and API data pipelines',
    openingsCount: 3,
  },
  {
    id: 'job-2',
    company: 'Kestrel Health',
    role: 'Head of Commercial Sales & Provider Expansion',
    department: 'Sales & Commercial',
    location: 'New York, NY',
    postedAt: '5 hours ago',
    matchedSignal: 'Series A GTM rollout',
    openingsCount: 2,
  },
  {
    id: 'job-3',
    company: 'Aether Cloud',
    role: 'Senior Growth Engineer (Data Orchestration)',
    department: 'Growth Ops',
    location: 'Remote',
    postedAt: '1 day ago',
    matchedSignal: 'Modernizing legacy sequencer infrastructure',
    openingsCount: 1,
  },
  {
    id: 'job-4',
    company: 'Amazon',
    role: 'Principal Enterprise Solutions Architect — AWS Outbound',
    department: 'AWS Cloud',
    location: 'Seattle, WA',
    postedAt: '1 day ago',
    matchedSignal: 'Enterprise cloud migration pipeline',
    openingsCount: 14,
  },
];

export const initialPeople: PersonLead[] = [
  {
    id: 'person-1',
    name: 'Marcus Vance',
    role: 'VP of Engineering',
    company: 'Veloce Data',
    email: 'marcus@velocedata.io',
    location: 'San Francisco, CA',
    signalContext: 'Hiring 3 backend roles for outbound data pipelines',
  },
  {
    id: 'person-2',
    name: 'Elena Rostova',
    role: 'Chief Commercial Officer',
    company: 'Kestrel Health',
    email: 'elena@kestrelhealth.com',
    location: 'New York, NY',
    signalContext: 'Closed $14.5M Series A lead by Benchmark for GTM scale',
  },
  {
    id: 'person-3',
    name: 'Siddharth Nair',
    role: 'Director of RevOps',
    company: 'HyperMetric',
    email: 'snair@hypermetric.io',
    location: 'Austin, TX',
    signalContext: 'Reported deliverability issues with shared pool sequencers on Reddit',
  },
  {
    id: 'person-4',
    name: 'Julian Boyd',
    role: 'Head of Growth Ops',
    company: 'Aether Cloud',
    email: 'julian@aethercloud.co',
    location: 'San Francisco, CA',
    signalContext: 'Reconfigured custom domain DNS, replacing Apollo',
  },
];

export const initialPersonas: Persona[] = [
  {
    id: 'persona-1',
    name: 'Klerk Outbound Engine',
    companyName: 'Klerk Systems',
    description:
      'Autonomous signal-based sales engine that monitors the web for buying intent and drafts context-grounded outreach.',
    websiteUrl: 'https://Klerk.so',
    activeCampaignsCount: 2,
  },
  {
    id: 'persona-2',
    name: 'StackVigil Ops',
    companyName: 'StackVigil Inc.',
    description:
      'Zero-config distributed tracing and APM tool for high-throughput Postgres and Node.js microservices.',
    websiteUrl: 'https://stackvigil.dev',
    activeCampaignsCount: 1,
  },
];

export const initialSenders: SenderMailbox[] = [
  {
    id: 'sender-1',
    email: 'chidera@Klerk.so',
    status: 'active',
    connectedDays: 9,
    dailyCap: 35,
    maxCap: 50,
    sentToday: 18,
    healthScore: 99,
    addedAt: '9 days ago',
  },
  {
    id: 'sender-2',
    email: 'outbound@stackvigil.dev',
    status: 'warming',
    connectedDays: 4,
    dailyCap: 15,
    maxCap: 50,
    sentToday: 8,
    healthScore: 100,
    addedAt: '4 days ago',
  },
];

export const initialCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'series-a-hiring',
    status: 'active',
    personaId: 'persona-1',
    leadsCount: 64,
    sentCount: 184,
    repliedCount: 29,
    bouncedCount: 2,
    createdAt: '2026-08-01',
    signalKeywords: ['Hiring VP Eng', 'Raised $8M+', 'Migrating from Apollo'],
    signals: [
      {
        id: 'sig-1',
        type: 'hiring',
        company: 'Veloce Data',
        contactName: 'Marcus Vance',
        contactRole: 'VP of Engineering',
        contactEmail: 'marcus@velocedata.io',
        title: 'Posted 3 Staff Backend & Outbound Infrastructure roles',
        detail:
          'Veloce opened hiring for 3 Senior/Staff engineers focusing on outbound automation and API scaling within the last 48 hours.',
        sourceUrl: 'https://linkedin.com/jobs/view/4910283',
        detectedAt: '2 hours ago',
        confidenceScore: 96,
      },
      {
        id: 'sig-2',
        type: 'funding',
        company: 'Kestrel Health',
        contactName: 'Elena Rostova',
        contactRole: 'Chief Commercial Officer',
        contactEmail: 'elena@kestrelhealth.com',
        title: 'Announced $14.5M Series A lead by Benchmark',
        detail:
          'Kestrel closed a $14.5M Series A round aimed specifically at scaling GTM and expanding enterprise customer acquisition.',
        sourceUrl: 'https://techcrunch.com/2026/08/kestrel-health-series-a',
        detectedAt: '5 hours ago',
        confidenceScore: 98,
      },
      {
        id: 'sig-3',
        type: 'tech_changes',
        company: 'Aether Cloud',
        contactName: 'Julian Boyd',
        contactRole: 'Head of Growth Ops',
        contactEmail: 'julian@aethercloud.co',
        title: 'Removed legacy Apollo DNS records, configured custom domain',
        detail:
          'DNS inspection and job postings indicate Aether is replacing legacy sequencer infrastructure with modern intent-driven pipelines.',
        sourceUrl: 'https://builtwith.com/aethercloud.co',
        detectedAt: '1 day ago',
        confidenceScore: 91,
      },
    ],
    sequence: [
      {
        stepNumber: 1,
        label: 'Initial Signal-Triggered Email',
        delayDays: 0,
        sentCount: 184,
        openRate: 78.4,
        replyRate: 15.8,
        templateSnippet:
          "Hi {{first_name}}, noticed {{company}} is {{signal_verb}}. Reaching out because...",
      },
      {
        stepNumber: 2,
        label: 'Contextual Case Study Follow-up',
        delayDays: 4,
        sentCount: 112,
        openRate: 64.2,
        replyRate: 8.9,
        templateSnippet:
          "Quick bump on this, {{first_name}} — when Carta scaled their intent outreach, they saw 4x reply rates...",
      },
      {
        stepNumber: 3,
        label: 'Graceful Opt-Out / Final Note',
        delayDays: 7,
        sentCount: 42,
        openRate: 51.0,
        replyRate: 4.1,
        templateSnippet:
          "Assuming this isn't top of priority right now, {{first_name}}. Won't clog your inbox further...",
      },
    ],
    voiceNotes:
      'Tone: Crisp, humble, peer-to-peer. Never use buzzwords like "supercharge" or "synergy". Open directly with the verifiable signal.',
    voiceDrafts: [
      {
        id: 'vd-1',
        subject: 'Scaling outbound at Veloce with the new engineering hires',
        snippet:
          'Hi Marcus, saw you posted 3 backend roles this week to scale your data pipelines. Typically when teams expand GTM data infrastructure, manual deliverability maintenance becomes a bottleneck...',
        isLiked: true,
      },
      {
        id: 'vd-2',
        subject: 'Hope this finds you well / partnership synergy',
        snippet:
          'Dear Marcus, I hope this email finds you having a productive week! I would love to explore high-level synergies between our two innovative platforms...',
        isDisliked: true,
      },
    ],
  },
  {
    id: 'camp-2',
    name: 'Competitor Switchers — Outreach & Salesloft Discontent',
    status: 'active',
    personaId: 'persona-1',
    leadsCount: 38,
    sentCount: 96,
    repliedCount: 18,
    bouncedCount: 0,
    createdAt: '2026-08-08',
    signalKeywords: ['G2 negative review', 'Reddit r/sales complaint', 'Twitter API rate-limit grief'],
    signals: [
      {
        id: 'sig-4',
        type: 'complaints',
        company: 'HyperMetric',
        contactName: 'Siddharth Nair',
        contactRole: 'Director of RevOps',
        contactEmail: 'snair@hypermetric.io',
        title: 'Public frustration regarding shared IP pool deliverability on Reddit r/sales',
        detail:
          'Lead posted: "Has anyone else seen domain burn with recent shared sequencers? Looking for something that connects straight to native Gmail app passwords without pool contamination."',
        sourceUrl: 'https://reddit.com/r/sales/comments/9021',
        detectedAt: '3 hours ago',
        confidenceScore: 94,
      },
    ],
    sequence: [
      {
        stepNumber: 1,
        label: 'Direct Empathy & Native Architecture',
        delayDays: 0,
        sentCount: 96,
        openRate: 82.1,
        replyRate: 18.7,
        templateSnippet:
          "Hey {{first_name}}, saw your discussion on deliverability headaches with shared pools...",
      },
      {
        stepNumber: 2,
        label: 'Zero-Domain-Burn Architecture Deep Dive',
        delayDays: 3,
        sentCount: 54,
        openRate: 70.3,
        replyRate: 11.2,
        templateSnippet:
          "Thought you might find our multi-mailbox warm-up breakdown useful: we cap sends at 35/day per inbox...",
      },
    ],
    voiceNotes:
      'Tone: Technical, direct, respectful. Acknowledge real friction points without trashing competitors explicitly.',
    voiceDrafts: [
      {
        id: 'vd-3',
        subject: 'Native inbox sending without shared IP pools',
        snippet:
          'Hey Siddharth, saw your note on domain burn with shared sequencers. We built Klerk specifically so you send exclusively via your own Gmail app passwords with automatic multi-inbox ramping...',
        isLiked: true,
      },
    ],
  },
  {
    id: 'camp-3',
    name: 'Postgres Scale & APM Migrations',
    status: 'paused',
    personaId: 'persona-2',
    leadsCount: 19,
    sentCount: 45,
    repliedCount: 7,
    bouncedCount: 1,
    createdAt: '2026-08-12',
    signalKeywords: ['Database latency query', 'Hiring DBRE', 'Migration from Datadog'],
    signals: [],
    sequence: [
      {
        stepNumber: 1,
        label: 'Low Overhead Trace Note',
        delayDays: 0,
        sentCount: 45,
        openRate: 68.9,
        replyRate: 15.5,
        templateSnippet: 'Hi {{first_name}}, noticed {{company}} is scaling Postgres clusters...',
      },
    ],
    voiceNotes: 'Concise developer tone. Strictly under 75 words.',
    voiceDrafts: [],
  },
];

export const initialDrafts: DraftEmail[] = [
  {
    id: 'draft-492',
    campaignId: 'camp-1',
    campaignName: 'series-a-hiring',
    recipientName: 'Marcus Vance',
    recipientEmail: 'marcus@velocedata.io',
    recipientCompany: 'Veloce Data',
    recipientRole: 'VP of Engineering @ Veloce Data',
    subject: 'Scaling outbound at Veloce with the new engineering hires',
    body: `Hi Marcus,

Saw you posted 3 backend roles this week to scale your data pipelines and outbound integrations at Veloce.

Typically when engineering teams ramp GTM data infrastructure, maintaining clean email deliverability and coordinating multi-inbox limits becomes an unnecessary dev distraction.

We built Klerk to run intent-triggered outreach directly from your own Gmail mailboxes with zero shared-pool contamination and automatic warm-up pacing.

Open to seeing a 2-minute walkthrough of how it monitors engineering signals?

Best,
Chidera • Sent via Klerk (native Gmail app pass)`,
    signalReason:
      'Klerk will not write an email that opens with a made-up reason. Every draft says why it was written before you approve it.',
    signalType: 'hiring',
    detectedDetail: 'Senior Infrastructure Engineer (Outbound & API Integrations) — Detected on company careers page & LinkedIn Jobs 2 hours ago.',
    status: 'pending',
    createdAt: 'Draft #492 • High Confidence (96%)',
  },
  {
    id: 'draft-2',
    campaignId: 'camp-1',
    campaignName: 'series-a-hiring',
    recipientName: 'Elena Rostova',
    recipientEmail: 'elena@kestrelhealth.com',
    recipientCompany: 'Kestrel Health',
    recipientRole: 'Chief Commercial Officer @ Kestrel Health',
    subject: 'Kestrel’s $14.5M Series A and outbound commercial tooling',
    body: `Hi Elena,

Congrats on the $14.5M Series A announcement yesterday.

Saw in the release that scaling enterprise provider acquisition is the core focus for this round. Most GTM leaders at this stage either buy generic lead databases with 40% bounce rates or burn SDR time manually hunting LinkedIn.

Klerk monitors healthcare expansion signals across public filings and only writes outreach when a clinic or network is actively upgrading software.

Would it be useful if I sent over the 15 provider leads Klerk identified for Kestrel this morning?

Best,
Chidera • Sent via Klerk (native Gmail app pass)`,
    signalReason:
      'Citing $14.5M Series A press release with stated goal of commercial clinic expansion.',
    signalType: 'funding',
    detectedDetail: 'Benchmark Series A Round ($14.5M), TechCrunch coverage Aug 19, 2026',
    status: 'pending',
    createdAt: 'Draft #493 • High Confidence (98%)',
  },
  {
    id: 'draft-3',
    campaignId: 'camp-2',
    campaignName: 'Competitor Switchers — Outreach & Salesloft Discontent',
    recipientName: 'Siddharth Nair',
    recipientEmail: 'snair@hypermetric.io',
    recipientCompany: 'HyperMetric',
    recipientRole: 'Director of RevOps @ HyperMetric',
    subject: 'Native inbox sending without shared IP deliverability risks',
    body: `Hey Siddharth,

Saw your comment on r/sales regarding deliverability dips and domain risk on traditional shared sequencers.

That frustration is exactly why we built Klerk. Instead of routing through shared third-party IP blocks that can get burnt by other users, Klerk connects directly to your own Gmail app passwords, automatically spreads sends across your inbox pool, and ramps newly connected mailboxes over 14 days.

Happy to set you up with a sandbox account so you can test inbox placement on a single test mailbox if you’re exploring alternatives.

Best,
Chidera • Sent via Klerk (native Gmail app pass)`,
    signalReason:
      'Citing public Reddit post from r/sales highlighting domain burning on shared pool sequencers.',
    signalType: 'complaints',
    detectedDetail: 'Reddit post: "Has anyone else seen domain burn with recent shared sequencers?"',
    status: 'pending',
    createdAt: 'Draft #494 • High Confidence (94%)',
  },
  {
    id: 'draft-4',
    campaignId: 'camp-1',
    campaignName: 'series-a-hiring',
    recipientName: 'Julian Boyd',
    recipientEmail: 'julian@aethercloud.co',
    recipientCompany: 'Aether Cloud',
    recipientRole: 'Head of Growth Ops @ Aether Cloud',
    subject: 'Aether’s outbound stack update & DNS alignment',
    body: `Hi Julian,

Noticed Aether Cloud recently updated SPF/DKIM records and opened roles for modern GTM orchestration.

If you’re evaluating intent-first outreach engines that draft emails around verifiable technical triggers rather than canned spray-and-pray sequences, Klerk was built for this exact workflow.

Let me know if you’d like to see how the signal detection pipeline integrates with your current setup.

Best,
Chidera • Sent via Klerk (native Gmail app pass)`,
    signalReason:
      'Citing DNS SPF/DKIM changes and Growth Ops job description mentioning intent tools.',
    signalType: 'tech_changes',
    detectedDetail: 'BuiltWith detected removal of legacy Apollo sequencer tags.',
    status: 'pending',
    createdAt: 'Draft #495 • High Confidence (91%)',
  },
];

export const initialSentEmails: SentEmail[] = [
  {
    id: 'sent-1',
    campaignId: 'camp-1',
    campaignName: 'series-a-hiring',
    recipientName: 'Talia Reed',
    recipientEmail: 'talia@orbitflow.com',
    recipientCompany: 'OrbitFlow',
    subject: 'OrbitFlow’s Series A and engineering outbound',
    body: 'Hi Talia, Congrats on the Series A announcement! Noticed you are scaling your backend team...',
    sentAt: 'Today at 09:14 AM',
    status: 'replied',
    senderMailbox: 'chidera@Klerk.so',
    replyContent:
      'Hey Chidera, thanks! We actually just felt the pain of manual SDR drafting yesterday. Send over the details or a quick Loom, would love to see how the signal watcher works.',
    replyAt: 'Today at 10:42 AM',
  },
  {
    id: 'sent-2',
    campaignId: 'camp-1',
    campaignName: 'series-a-hiring',
    recipientName: 'Devon Hayes',
    recipientEmail: 'devon@synthstack.ai',
    recipientCompany: 'SynthStack AI',
    subject: 'SynthStack hiring for founding sales team',
    body: 'Hi Devon, saw your post looking for your first 2 enterprise AEs...',
    sentAt: 'Today at 08:30 AM',
    status: 'opened',
    senderMailbox: 'chidera@Klerk.so',
  },
  {
    id: 'sent-3',
    campaignId: 'camp-2',
    campaignName: 'Competitor Switchers — Outreach & Salesloft Discontent',
    recipientName: 'Claire Zhao',
    recipientEmail: 'claire@novasystems.tech',
    recipientCompany: 'Nova Systems',
    subject: 'Direct Gmail sending for Nova Systems',
    body: 'Hey Claire, saw your note regarding sequencer deliverability drops...',
    sentAt: 'Yesterday at 04:15 PM',
    status: 'replied',
    senderMailbox: 'chidera@Klerk.so',
    replyContent:
      'Interesting timing. How does the 14-day warm-up work if we connect 3 separate Gmail accounts?',
    replyAt: 'Yesterday at 06:20 PM',
  },
  {
    id: 'sent-4',
    campaignId: 'camp-1',
    campaignName: 'series-a-hiring',
    recipientName: 'Arthur Dent',
    recipientEmail: 'arthur@hitchhiker.io',
    recipientCompany: 'Hitchhiker Cloud',
    subject: 'Scaling developer outreach at Hitchhiker',
    body: 'Hi Arthur, noticed your recent GCP migration notice...',
    sentAt: 'Yesterday at 02:00 PM',
    status: 'sent',
    senderMailbox: 'chidera@Klerk.so',
  },
  {
    id: 'sent-5',
    campaignId: 'camp-3',
    campaignName: 'Postgres Scale & APM Migrations',
    recipientName: 'Liam Vance',
    recipientEmail: 'liam@oldserver.invalid',
    recipientCompany: 'Old Server Co',
    subject: 'Postgres observability at scale',
    body: 'Hi Liam, noticed your query load metrics discussion...',
    sentAt: 'Aug 17, 2026',
    status: 'bounced',
    senderMailbox: 'outbound@stackvigil.dev',
  },
];

export const initialChatThreads: import('../types').ChatThread[] = [
  {
    id: 'thread-1',
    title: 'Series A Hiring Signals Scout',
    createdAt: 'Today, 2:15 PM',
    updatedAt: 'Just now',
    messages: [
      {
        id: 'msg-1',
        sender: 'assistant',
        text: `Hello Chidera. I am your Klerk outbound assistant.

I continuously monitor job boards, funding filings, tech stack changes, and community discussions. Ask me to find leads for a campaign, review the pending draft queue, or summarize this week’s outreach metrics.`,
        timestamp: '2:15 PM',
      },
      {
        id: 'msg-2',
        sender: 'user',
        text: 'Scout 3 new verified hiring leads for series-a-hiring and queue draft emails for review.',
        timestamp: '2:18 PM',
      },
      {
        id: 'msg-3',
        sender: 'assistant',
        text: `Found 3 verified intent triggers matching the **series-a-hiring** criteria:

1. **Veloce Data** (velocedata.io)
   • Trigger: Posted 3 Staff Backend & Infrastructure roles 2 hours ago.
   • Contact: Marcus Vance (VP Engineering).
   • Draft queued: Citing their new engineering openings and deliverability scaling.

2. **Kestrel Health** (kestrelhealth.com)
   • Trigger: Closed $14.5M Series A and opened 4 GTM engineering requisitions.
   • Contact: Devon Miller (Director of Infrastructure).
   • Draft queued: Citing Series A pipeline expansion.

3. **Hyperion Labs** (hyperionlabs.ai)
   • Trigger: Added Apollo & Postgres tags, hiring Head of Outbound Ops.
   • Contact: Sarah Jenkins (Head of Ops).
   • Draft queued: Citing deliverability transition.

All 3 drafts have been saved in your review queue with full trigger citations.`,
        timestamp: '2:18 PM',
        actionTaken: {
          type: 'drafts_created',
          count: 3,
          details: 'Queued for series-a-hiring campaign',
        },
      },
    ],
  },
  {
    id: 'thread-2',
    title: 'Competitor Switchers & Deliverability',
    createdAt: 'Yesterday, 4:30 PM',
    updatedAt: 'Yesterday, 4:35 PM',
    messages: [
      {
        id: 'msg-2-1',
        sender: 'user',
        text: 'Find public complaints regarding sequencer deliverability drops and draft custom peer-to-peer outreach.',
        timestamp: '4:30 PM',
      },
      {
        id: 'msg-2-2',
        sender: 'assistant',
        text: `Monitored Reddit (r/sales) and X discussions over the past 48 hours.

Detected signal:
• **Claire Zhao** (Nova Systems) discussed shared IP pool deliverability drops on legacy sequencers.
• Trigger quote: "Our cold email open rates cratered by 60% after vendor migrated shared sending pools."

Generated draft #488 citing this exact public note with zero spam language, emphasizing Klerk's 14-day warm-up and private Gmail app password architecture.`,
        timestamp: '4:31 PM',
      },
    ],
  },
  {
    id: 'thread-3',
    title: 'Weekly Signals & Reply Summary',
    createdAt: 'Aug 17, 2026',
    updatedAt: 'Aug 17, 2026',
    messages: [
      {
        id: 'msg-3-1',
        sender: 'user',
        text: 'Summarize this week’s outreach performance, active intent signals, and positive replies.',
        timestamp: 'Aug 17, 9:00 AM',
      },
      {
        id: 'msg-3-2',
        sender: 'assistant',
        text: `### Weekly Outreach Brief

• **Intent Signals Detected**: 48 (+14% vs last week)
• **Emails Dispatched**: 184 (Native Gmail safe ramp)
• **Positive Replies**: 26 (14.1% reply rate — 3.8x above generic cold email)
• **Mailbox Health**: 99.1% across all 4 connected accounts
• **Top Performing Trigger**: Hiring surges in Infrastructure & Data Engineering (18.2% reply rate).

Zero spam flags or bounce spikes detected.`,
        timestamp: 'Aug 17, 9:01 AM',
      },
    ],
  },
];

export const initialAssistantMessages: AssistantMessage[] = initialChatThreads[0].messages;

export const initialUserSettings: UserSettings = {
  mailingAddress: 'Klerk Systems Inc., 548 Market St, Suite 8201, San Francisco, CA 94104',
  defaultFollowUpDays: 3,
  dailyCapAcrossAll: 60,
  timezone: 'America/Los_Angeles',
  apiKey: 'clerk_live_9f823a817cd24e9301bafe008271',
  accountEmail: 'chideraezeudu2@gmail.com',
};

