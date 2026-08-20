export interface BlogPost {
  slug: string;
  title: string;
  description: string; // 40-60 word direct-answer block (AEO)
  published: string;   // ISO date
  updated: string;     // ISO date (freshness signal)
  readingMinutes: number;
  // Simple structured body: headings render, arrays render as paragraphs.
  body: Array<{ h?: string; p?: string; list?: string[]; faq?: Array<{ q: string; a: string }> }>;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'instantly-alternative',
    title: 'Instantly Alternative: Signal vs Instantly for Cold Outbound',
    description:
      'Instantly sends high volume with sending infrastructure (~$30–47/mo, real cost often $150–400 with add-ons). Signal watches hiring, funding, and tech-stack signals and drafts a cited email per real reason — smaller deliberate volume, $29/mo all-in.',
    published: '2026-08-01',
    updated: '2026-08-19',
    readingMinutes: 4,
    body: [
      { p: 'Instantly earned its name as volume infrastructure: unlimited connected mailboxes, warmup rotation, a lead database. It solves "send a lot of email to a lot of people" well — but its pricing splinters (sending vs. lead database vs. CRM vs. verification), so a real setup usually clears $150–400/mo.' },
      { p: 'Signal starts differently: it watches hiring, funding, tech-stack changes, and public signal events, then drafts one email that cites the exact reason. You send far fewer emails, each tied to something true about the recipient.' },
      {
        list: [
          'Core approach — Instantly: high-volume sending infrastructure. Signal: signal-based targeting, one draft per real reason.',
          'Lead source — Instantly: purchased database. Signal: live hiring/funding/tech signals.',
          'Personalization — Instantly: templates with merge tags. Signal: AI draft naming the trigger.',
          'Price — Instantly ~$30–47/mo (often $150–400 with add-ons). Signal $29/mo all features included.',
        ],
      },
      { p: 'If your model absolutely depends on high volume and you already have leads sourced, Instantly is built for that. If you are a solo founder or small team who cannot waste volume on misses and would rather send 20 cited emails than 200 generic ones, Signal is aimed at you.' },
    ],
  },
  {
    slug: 'gmail-warmup',
    title: 'How to Warm Up a Gmail Account for Cold Email',
    description:
      'Warming up means starting at ~5/day and roughly doubling every 2–3 days over ~14 days so Gmail learns the account before you send at full cap. Skip it and a new mailbox routes to spam or gets suspended.',
    published: '2026-08-01',
    updated: '2026-08-19',
    readingMinutes: 5,
    body: [
      { p: 'Gmail trusts a sender the same way a bank trusts a new account: by watching behavior over time. A brand-new mailbox that suddenly sends a hundred emails on day one looks like a spam operation — that is exactly what a spam operation looks like. Age and history cannot be faked, only built.' },
      {
        list: [
          'Days 1–3: ~5 emails/day',
          'Days 4–7: ~10 emails/day',
          'Days 8–14: ~20 emails/day',
          'Day 15 onward: normal cap (often 30–50/day for one Gmail)',
        ],
      },
      { p: 'The ramp works because it mimics how a real, growing company’s email volume climbs naturally. Compressing it into a couple of days removes the very thing that makes it work.' },
      { p: 'Volume is not the only signal. Send to real people who might open and reply — mailbox-to-mailbox automated "warmup" traffic teaches Gmail nothing now. Avoid identical subject lines across a batch on the same day.' },
      { p: 'The common failure mode: connect a new account and send at full volume to save a week. Gmail either routes to spam or suspends the account, and replacing a flagged mailbox costs far more than the ramp would have.' },
      {
        faq: [
          { q: 'How long does warmup take?', a: 'About two weeks to reach a normal volume; the trust curve improves over the next month or two.' },
          { q: 'Can I speed it up?', a: 'Not safely. The ramp works because it mimics natural growth; compression breaks the signal.' },
          { q: 'I only send a few emails a day — do I need this?', a: 'The ramp matters less but a brand-new account still gets treated cautiously; a short ramp still helps.' },
          { q: 'Do fake-inbox auto-warmup tools work?', a: 'Partially, for the raw volume signal, but Gmail increasingly detects one-directional, engagement-free traffic. Real opens and replies finish the job.' },
        ],
      },
    ],
  },
];
