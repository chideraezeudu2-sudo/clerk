export interface BlogPost {
  slug: string;
  kind: 'blog' | 'product';
  title: string;
  description: string;
  published: string;
  updated: string;
  readingMinutes: number;
  image?: string;
  body: Array<{ h?: string; p?: string; list?: string[]; faq?: Array<{ q: string; a: string }> }>;
}

export const BLOG_POSTS: BlogPost[] = [
  // ------------------------- PRODUCT pages (nav/site structure) -------------------------
  {
    slug: 'product/signal-detection',
    kind: 'product',
    title: 'Signal Detection: Find Companies Before They Start Looking',
    description:
      'Klerk watches hiring, funding, tech-stack changes, and public complaints and ranks companies on a live compound signal score, so outreach always starts with a real reason, not guesswork.',
    published: '2026-08-01',
    updated: '2026-08-19',
    readingMinutes: 5,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
    body: [
      {
        list: [
          'Hiring: a new job posting for a role your product supports.',
          'Funding: fresh capital that is about to be spent.',
          'Tech-stack: a tool switch, meaning an active comparison.',
          'Public complaints: someone already hunting for an alternative.',
        ],
      },
      {
        p:
          'A lead database gives you a static list that everyone else buys too. Signal detection gives you a live event. That difference shows up in reply rates: “saw you posted three Account Exects this week” beats “hope this finds you well”.',
      },
      {
        h: 'Matching, not blasting',
        p:
          'You define target industry/size/problem. Klerk only surfaces companies with a real trigger, never inventing a reason if there is no signal: the same human-review discipline that keeps copy honest.',
      },
      {
        h: 'Continuous background watching',
        p:
          'Scanning runs on your target list continuously, so the opportunity queue refreshes itself rather than decaying after one manual pass. Every match shows the company, the specific trigger, and how recent it is; nothing is contacted without your approval.',
      },
    ],
  },
  {
    slug: 'product/ai-drafting',
    kind: 'product',
    title: 'AI Cold Email Drafting That Cites the Real Reason',
    description:
      'Klerk writes the first draft of every outreach email automatically, built around the specific signal that made a company worth contacting, not a template with a name swapped in. Every draft names its reason before it can be sent.',
    published: '2026-08-01',
    updated: '2026-08-19',
    readingMinutes: 5,
    body: [
      {
        p:
          'Most AI-drafted email sounds fake because the model had nothing true to say. Klerk starts from the opposite direction: a draft only gets written after a real trigger exists. The personalization is built around something true, not added afterward.',
      },
      {
        list: [
          'The signal itself: the hiring post, funding story, tech switch, or complaint.',
          'Your voice: Klerk learns how you actually write rather than defaulting to generic polish.',
          'The campaign positioning: the offer that connects the trigger to the pitch in one clear thread.',
        ],
      },
      {
        h: 'No strong signal, no fabricated reason',
        p:
          'When there is no specific event, Klerk says that and falls back to the strongest true detail rather than inventing a narrative. Apart from honesty, a fabricated reason is also a worse email; recipients can tell.',
      },
      {
        h: 'You always see it first',
        p:
          'Every draft sits in a review queue: approve, edit, or reject. Klerk does the research and the first pass; you make the final call. The workflow is the product.',
      },
      {
        h: 'Written to sound like a person',
        p:
          'The goal is not an email that mentions AI; it is one nobody would suspect was generated, keeping the overly formal tells, generic transitions, and recipient-agnostic pitches out. Reply rate is the entire point of personalization.',
      },
    ],
  },
  {
    slug: 'product/mailbox-warmup',
    kind: 'product',
    title: 'Multi-Mailbox Cold Email Sending, Warmed Up Safely',
    description:
      'Klerk sends through your own connected Gmail accounts, not shared infrastructure. Each mailbox ramps on its own schedule, and Klerk rotates sends across them so no account ever exceeds safe volume.',
    published: '2026-08-01',
    updated: '2026-08-19',
    readingMinutes: 5,
    body: [
      {
        p:
          'Shared sending servers mean your deliverability depends partly on everyone else on the same infrastructure. Sending from your own Gmail, warmed correctly, keeps your sender reputation in your own hands.',
      },
      {
        h: 'The ramp (day-by-day)',
        list: [
          'Days 1–3: 5 emails a day',
          'Days 4–7: 10 emails a day',
          'Days 8–14: 20 emails a day',
          'From day 15: your configured daily cap (often 30–50 on a free Gmail, higher on a paid domain)',
        ],
      },
      {
        h: 'Why more than one mailbox',
        p:
          'Each connected Gmail account has a ceiling. Connect a second or third and Klerk treats each as an independent sender with its own warmup clock. Your total safe daily capacity scales, and sends route to whichever mailbox has room left that day.',
      },
      {
        h: 'What this protects',
        p:
          'The usual failure mode is a good-looking email sent from an account that sent too much too early and got flagged or suspended. That usually means starting over with a new address. The ramp and rotation exist to prevent exactly that.',
      },
      {
        h: 'Compliance built in',
        p:
          'Every email includes the physical address and opt-out line. Anyone who asks to stop is suppressed automatically across all campaigns and mailboxes, not as an afterthought.',
      },
    ],
  },
  {
    slug: 'product/reply-tracking',
    kind: 'product',
    title: 'Reply and Bounce Tracking for Cold Email',
    description:
      'Klerk reads your connected inboxes and matches replies and bounces to the right contact and campaign automatically. A reply stops future sends to that person right away, so nobody who already responded keeps getting follow-ups.',
    published: '2026-08-01',
    updated: '2026-08-19',
    readingMinutes: 5,
    body: [
      {
        p:
          'At small volume you can check the inbox. Once sends span multiple mailboxes and campaigns, replies get missed and follow-ups keep going to people who already answered, and that is genuinely hard to fix by hand.',
      },
      {
        list: [
          'Replies matched to the specific contact and campaign, not a vague notification.',
          'Bounces, so a dead box stops nibbling at your daily cap with retries.',
          'Out-of-office and auto-responses, separated from real engagement so a vacation loop doesn’t miscount a reply.',
        ],
      },
      {
        h: 'Why this matters',
        p:
          'A reply can land between when a sequenced follow-up was planned and when it would send. Without tracking that checks status again right before the send, a “not interested” reply can still get another email an hour later, which looks careless. Klerk closes that timing gap automatically.',
      },
      {
        h: 'What you see',
        p:
          'Each sent email with its outcome (replied, bounced, or no response), filterable by campaign, which also feeds the reasoning for later drafts: what kinds of signals and openings actually got replies.',
      },
    ],
  },

  // ------------------------- BLOG posts (sit in /blog) -------------------------
  {
    slug: 'instantly-alternative',
    kind: 'blog',
    title: 'Instantly Alternative: Klerk vs Instantly for Cold Outbound',
    description:
      'Instantly sends high volume with sending infrastructure (~$30–47/mo, real cost often $150–400 with add-ons). Klerk watches hiring, funding, and tech-stack signals and drafts a cited email per real reason: smaller deliberate volume, $29/mo all-in.',
    published: '2026-08-01',
    updated: '2026-08-19',
    readingMinutes: 4,
    image: 'https://images.unsplash.com/photo-1557804506-669a47965b66?w=1200',
    body: [
      {
        p: 'Instantly earned its name as volume infrastructure: unlimited connected mailboxes, warmup rotation, a lead database. It solves “send a lot of email to a lot of people” well, but its pricing splinters (sending vs. lead database vs. CRM vs. verification), so a real setup usually clears $150–400/mo.',
      },
      {
        p: 'Klerk starts differently: it watches hiring, funding, tech-stack changes, and public signal events, then drafts one email that cites the exact reason. You send far fewer emails, each tied to something true about the recipient.',
      },
      {
        list: [
          'Core approach: Instantly: high-volume sending infrastructure. Klerk: signal-based targeting, one draft per real reason.',
          'Lead source: Instantly: purchased database. Klerk: live hiring/funding/tech signals.',
          'Personalization: Instantly: templates with merge tags. Klerk: AI draft naming the trigger.',
          'Price: Instantly ~$30–47/mo (often $150–400 with add-ons). Klerk $29/mo all features included.',
        ],
      },
      {
        p: 'If your model absolutely depends on high volume and you already have leads sourced, Instantly is built for that. If you are a solo founder or small team who cannot waste volume on misses and would rather send 20 cited emails than 200 generic ones, Klerk is aimed at you.',
      },
    ],
  },
  {
    slug: 'gmail-warmup',
    kind: 'blog',
    title: 'How to Warm Up a Gmail Account for Cold Email',
    description:
      'Warming up means starting at ~5/day and roughly doubling every 2–3 days over ~14 days so Gmail learns the account before you send at full cap. Skip it and a new mailbox routes to spam or gets suspended.',
    published: '2026-08-01',
    updated: '2026-08-19',
    readingMinutes: 5,
    image: 'https://images.unsplash.com/photo-1589395937658-c8e0dc70dc87?w=1200',
    body: [
      {
        p: 'Gmail trusts a sender the same way a bank trusts a new account: by watching behavior over time. A brand-new mailbox that suddenly sends a hundred emails on day one looks like a spam operation, because that is exactly what a spam operation looks like. Age and history cannot be faked, only built.',
      },
      {
        list: [
          'Days 1–3: ~5 emails/day',
          'Days 4–7: ~10 emails/day',
          'Days 8–14: ~20 emails/day',
          'Day 15 onward: normal cap (often 30–50/day for one Gmail)',
        ],
      },
      {
        p: 'The ramp works because it mimics how a real, growing company’s email volume climbs naturally. Compressing it into a couple of days removes the very thing that makes it work.',
      },
      {
        p: 'Volume is not the only signal. Send to real people who might open and reply. Mailbox-to-mailbox automated “warmup” traffic teaches Gmail nothing now. Avoid identical subject lines across a batch on the same day.',
      },
      {
        p: 'The common failure mode: connect a new account and send at full volume to save a week. Gmail either routes to spam or suspends the account, and replacing a flagged mailbox costs far more than the ramp would have.',
      },
      {
        faq: [
          { q: 'How long does warmup take?', a: 'About two weeks to reach a normal volume; the trust curve improves over the next month or two.' },
          { q: 'Can I speed it up?', a: 'Not safely. The ramp works because it mimics natural growth; compression breaks the signal.' },
          { q: 'I only send a few emails a day, do I need this?', a: 'The ramp matters less but a brand-new account still gets treated cautiously; a short ramp still helps.' },
          { q: 'Do fake-inbox auto-warmup tools work?', a: 'Partially, for the raw volume signal, but Gmail increasingly detects one-directional, engagement-free traffic. Real opens and replies finish the job.' },
        ],
      },
    ],
  },
];
