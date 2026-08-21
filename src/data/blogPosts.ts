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
    image: '/covers/signal-detection.jpg',
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
    image: '/covers/ai-drafting.jpg',
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
    image: '/covers/mailbox-warmup.jpg',
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
    image: '/covers/reply-tracking.jpg',
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
    image: '/covers/instantly-alternative.jpg',
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
    slug: 'real-warmup-vs-fake-networks',
    kind: 'blog',
    title: "Real Gmail Warmup vs. Fake Warmup Networks: What's Actually Happening to Your Inbox",
    description:
      "Most warmup tools hook your mailbox into a network of strangers' inboxes sending scripted emails to each other. Real warmup means sending actual emails to actual people, starting slow. The difference matters more than most guides admit.",
    published: '2026-08-21',
    updated: '2026-08-21',
    readingMinutes: 6,
    image: '/covers/real-vs-fake-warmup.jpg',
    body: [
      {
        p: "If you've looked into cold email at all, you've probably seen a dozen tools bragging about their \"warmup network.\" Thousands of connected inboxes, all emailing each other, all day, every day. It sounds smart. It sounds like a shortcut. Let's look at what's actually happening under the hood, and why it might be quietly working against you.",
      },
      { h: 'What a warmup network actually is' },
      {
        p: "The honest version: a warmup network is a big pool of email accounts, usually thousands, belonging to different companies using the same tool. The tool connects your new mailbox to that pool. Then, behind the scenes, other people's inboxes in that pool start emailing your inbox, and yours starts emailing theirs. Nobody reads these emails. Nobody meant to send them. A script sends them, a script opens them, a script writes a fake reply, and the whole thing repeats hundreds of times a day.",
      },
      {
        p: "The idea is that Gmail sees your account getting emails, opening them, and getting replies, and reads that as \"this is a normal, trusted account.\" On paper it makes sense, Gmail is trying to figure out if you're a real person doing real email things. A network like this is trying to fake the appearance of that.",
      },
      { h: 'Why this used to work better than it does now' },
      {
        p: "A few years ago the trick worked reasonably well, because providers weren't great at distinguishing a real conversation from a scripted one. Gmail's spam detection has gotten much better at spotting patterns that look automated, even when the automation is trying to look human.",
      },
      {
        p: "Look at a fake warmup conversation from Gmail's side: two accounts that never had a real relationship suddenly email each other constantly, every day, forever. Replies come back fast, often too fast for a human to have read and responded. Subject lines and message patterns repeat across thousands of account pairs because it's the same tool running the same script for everyone. None of that is subtle to a spam filter built to notice exactly those patterns.",
      },
      {
        p: "Reports keep surfacing across cold email communities of accounts with a \"perfect\" warmup score, according to the tool measuring it, still landing straight in spam once real campaigns start. That disconnect is the whole problem: the tool measures whether the fake network liked your emails, not whether Gmail actually trusts you.",
      },
      { h: 'What real warmup looks like instead' },
      {
        p: "Real warmup skips the fake network entirely. You send actual emails to actual people, starting small and building slowly. No pool of strangers' inboxes, no scripted replies, just your mailbox doing what a normal growing business's mailbox would do: a little at first, more as time goes on.",
      },
      {
        list: [
          'Days 1-3: around 5 emails per day',
          'Days 4-7: around 10 emails per day',
          'Days 8-14: around 20 emails per day',
          'Day 15 onward: normal volume, roughly 30-50 per day for a single Gmail account',
        ],
      },
      {
        p: "This works because it isn't trying to trick Gmail into thinking something fake is real. It is actually being the thing Gmail is looking for: a mailbox with a slow, steady, believable history.",
      },
      { h: 'The part that matters most: real engagement' },
      {
        p: "Volume alone isn't the whole story. What convinces Gmail your account is trustworthy is engagement: opens, replies, and not getting marked as spam by recipients. A fake network can fake opens and replies. What it can't fake is a real person who was interested enough to write back with something a human would actually write.",
      },
      {
        p: "That's the hidden cost of the network approach even when it \"works.\" You spent two weeks building a reputation on interactions that taught Gmail nothing true about how real people respond to your actual emails. Real warmup, sending to real people from day one at however small a volume, starts building the thing that actually matters for a cold email business: evidence that real humans engage with what you send.",
      },
      { h: 'So does that mean warmup networks never work?' },
      {
        p: "Not never. Plenty of accounts warmed up that way are sending fine right now. The point isn't guaranteed failure, it's that you're betting on Gmail's detection not catching up to a well-known trick, and that bet has been getting worse over time, not better. Real warmup doesn't need Gmail to fail to notice anything. It isn't hiding from detection, because there's nothing to detect; it's what a legitimate sender's history actually looks like.",
      },
      {
        p: "If you're comparing warmup approaches across cold email tools, that's the real question to ask: is this tool trying to fool the spam filter, or is it just doing the slow, boring, correct thing that never needed to fool anyone?",
      },
      { h: 'What this means if you run more than one mailbox' },
      {
        p: "The same logic holds for one Gmail account or five. Each mailbox needs its own real history and its own real ramp from its own connection date. Adding a second account doesn't transfer trust from the first one, and it shouldn't be plugged into a fake network either, for the same reasons. The upside of running several real, individually warmed mailboxes is spreading total outreach volume across all of them, so no single account ever gets pushed past what it can believably handle.",
      },
      {
        faq: [
          {
            q: "Are warmup networks actually against Gmail's rules?",
            a: "Gmail's policies focus on unsolicited or low-quality content and automated abuse. A warmup network's traffic is automated and, by design, not real correspondence between people who know each other. That's closer to what those policies exist to catch than most warmup tools like to admit.",
          },
          {
            q: 'If my account has a high warmup score, doesn\'t that prove it\'s working?',
            a: "It proves the tool's internal scoring is happy. That score measures engagement inside its own fake network, not how Gmail's actual spam filter will treat your real campaigns. A high score on one guarantees nothing about the other.",
          },
          {
            q: 'Is real warmup slower than using a network?',
            a: "Not really. Both use roughly the same two-week ramp. The difference isn't speed, it's what's happening during those two weeks: real interactions building a real history, versus scripted interactions building a fake one.",
          },
          {
            q: 'Can I mix the two, use a network briefly then switch to real sending?',
            a: "You can, but then your real sending starts with a history built on fake engagement. If anything looked off to Gmail during the network phase, that risk carries forward into your real campaigns instead of being left behind.",
          },
        ],
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
    image: '/covers/gmail-warmup.jpg',
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
