import { getAdmin } from './_lib.js';

// ---------------------------------------------------------------------------
// Signal engine: watched organizations -> JSearch hiring signals -> scored leads
// Design follows the compound-scoring + decay spec from RZ-Logic's
// signal-driven-outbound-engine (role weighting, threshold, daily decay).
// ---------------------------------------------------------------------------

const JSEARCH_KEY = process.env.JSEARCH_API_KEY || '';
const JSEARCH_URL = 'https://api.openwebninja.com/jsearch/search-v2';

// Apify: one token powers the tech-stack signal class AND (optionally) a cheap
// email-lookup actor. Tech-stack adds a signal type to the compound score.
const APIFY_TOKEN = process.env.APIFY_TOKEN || '';
const APIFY_TECHSTACK_ACTOR =
  'https://api.apify.com/v2/acts/qyd7nNyqFPelQViBx/run-sync-get-dataset-items?timeout=120';
// Default cheap email-lookup actor (name+domain -> email). You're billed ~$0.15/result.
// Override via env if you switch providers.
const EMAIL_LOOKUP_ACTOR =
  process.env.EMAIL_LOOKUP_ACTOR ||
  'https://api.apify.com/v2/acts/ryanclinton~waterfall-contact-enrichment/run-sync-get-dataset-items?timeout=120';

// Roles that indicate a company is scaling the functions our ICP sells into.
// Higher weight = stronger buying signal.
const ROLE_WEIGHTS: Array<{ match: RegExp; weight: number }> = [
  { match: /\b(vp|head|director)\b.*(eng|engineering|data|infrastructure|platform|sales|revenue|growth)/i, weight: 30 },
  { match: /(revops|revenue operations|sales operations|gtm)/i, weight: 25 },
  { match: /(outbound|sdr|sales development|lead gen|demand gen)/i, weight: 25 },
  { match: /(backend|full.?stack|platform|infrastructure|data) engineer/i, weight: 18 },
  { match: /(deliverab|email|lifecycle|crm) (engineer|manager|specialist)/i, weight: 20 },
  { match: /\b(engineer|developer)\b/i, weight: 10 },
];

// Compound score needed before an org is "triggered" (worth a lead + draft).
const TRIGGER_THRESHOLD = 40;
// Stale signals decay this many points/day after the grace period.
const DECAY_PER_DAY = 3;
const DECAY_GRACE_DAYS = 5;

export function scoreJobTitle(title: string): number {
  let best = 0;
  for (const r of ROLE_WEIGHTS) {
    if (r.match.test(title)) best = Math.max(best, r.weight);
  }
  return best;
}

export function isFreeEmailDomain(domain: string): boolean {
  return /@(gmail|googlemail|outlook|hotmail|yahoo|live|msn|icloud)\.com$/i.test(domain);
}

// --- Apify helpers (one token, two uses) ---

// Tech-stack signal: detect a company's GTM tools (CRM/sequencer/marketing automation).
export async function detectTechStack(domain: string) {
  if (!APIFY_TOKEN || !domain) return null;
  try {
    const res = await fetch(APIFY_TECHSTACK_ACTOR, {
      method: 'POST',
      headers: { Authorization: `Bearer ${APIFY_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: domain, crawl_additional_pages: true }),
    });
    if (!res.ok) return null;
    const items = await res.json();
    const row = Array.isArray(items) ? items[0] : items;
    return row || null;
  } catch {
    return null;
  }
}

// Cheap email lookup (name + company domain -> email) via an Apify actor.
export async function lookupEmail(name: string, domain: string) {
  if (!APIFY_TOKEN || !domain) return null;
  try {
    const res = await fetch(EMAIL_LOOKUP_ACTOR, {
      method: 'POST',
      headers: { Authorization: `Bearer ${APIFY_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ people: [{ name, domain }] }),
    });
    if (!res.ok) return null;
    const items = await res.json();
    const row = Array.isArray(items) ? items[0] : items;
    const email = row?.email || row?.emails?.[0] || null;
    if (!email || row?.status === 'not_found') return null;
    return { email, confidence: row?.emailConfidence ?? row?.confidence?.score ?? 0, source: row?.emailSource || 'apify' };
  } catch {
    return null;
  }
}

interface JSearchJob {
  job_title?: string;
  employer_name?: string;
  employer_website?: string;
  job_city?: string | null;
  job_country?: string | null;
  job_is_remote?: boolean;
  job_posted_at?: string;
  job_posted_at_datetime_utc?: string;
  job_apply_link?: string;
  job_description?: string;
}

export async function searchJobs(query: string, numPages = 1): Promise<JSearchJob[]> {
  if (!JSEARCH_KEY) throw new Error('JSEARCH_API_KEY not configured');
  const url = `${JSEARCH_URL}?query=${encodeURIComponent(query)}&page=1&num_pages=${numPages}&country=us&language=en`;
  const res = await fetch(url, { headers: { 'X-API-Key': JSEARCH_KEY } });
  if (!res.ok) throw new Error(`JSearch error ${res.status}`);
  const json = await res.json();
  const jobs = json?.data?.jobs;
  return Array.isArray(jobs) ? jobs : [];
}

// Normalize a JSearch job into a signal event for an organization.
export function jobToSignal(job: JSearchJob) {
  const title = job.job_title || 'Open role';
  const weight = scoreJobTitle(title);
  const loc =
    [job.job_city, job.job_country].filter(Boolean).join(', ') ||
    (job.job_is_remote ? 'Remote' : '');
  const detail = [
    `${title}${loc ? ` (${loc})` : ''}`,
    job.job_posted_at ? `posted ${job.job_posted_at}` : '',
  ]
    .filter(Boolean)
    .join(' — ');
  return {
    type: 'hiring',
    title: `Hiring: ${title}`,
    detail,
    source_url: job.job_apply_link || null,
    weight,
  };
}

// Run a scout pass for one user across their watched organizations.
// Returns a summary of new signals, orgs triggered, and leads created.
export async function scoutForUser(userId: string, campaignId?: string) {
  const supa = getAdmin();

  const { data: orgs } = await supa
    .from('organizations')
    .select('*')
    .eq('user_id', userId)
    .neq('state', 'archived');

  if (!orgs || orgs.length === 0) {
    return { scouted: 0, newSignals: 0, triggered: 0, leads: 0, message: 'No organizations to watch. Add target companies first.' };
  }

  // Resolve which campaign new leads attach to (fallback: first active campaign).
  let targetCampaignId = campaignId || null;
  if (!targetCampaignId) {
    const { data: camp } = await supa
      .from('campaigns')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    targetCampaignId = camp?.id || null;
  }

  let newSignals = 0;
  let triggered = 0;
  let leadsCreated = 0;

  for (const org of orgs) {
    const keywords = (org.keywords || []).filter(Boolean);
    const query = keywords.length
      ? `${keywords.join(' ')} at ${org.name}`
      : `${org.name} jobs`;

    let jobs: JSearchJob[] = [];
    try {
      jobs = await searchJobs(query, 1);
    } catch (e) {
      // Skip orgs whose query fails (e.g. rate limit) rather than aborting the run.
      continue;
    }

    // Fuzzy-match results to this org (JSearch returns many employers per query).
    const matched = jobs.filter((j) =>
      (j.employer_name || '').toLowerCase().includes(org.name.toLowerCase().split(' ')[0]) ||
      (org.domain && (j.employer_website || '').toLowerCase().includes(org.domain.toLowerCase()))
    );

    for (const job of matched.slice(0, 5)) {
      const sig = jobToSignal(job);
      // Dedupe: skip if an identical signal title already exists for this org.
      const { data: existing } = await supa
        .from('signal_events')
        .select('id')
        .eq('organization_id', org.id)
        .eq('title', sig.title)
        .maybeSingle();
      if (existing) continue;

      await supa.from('signal_events').insert({
        user_id: userId,
        organization_id: org.id,
        type: sig.type,
        title: sig.title,
        detail: sig.detail,
        source_url: sig.source_url,
        weight: sig.weight,
      });

      await supa
        .from('organizations')
        .update({
          score: (org.score || 0) + sig.weight,
          last_signal_at: new Date().toISOString(),
        })
        .eq('id', org.id);
      org.score = (org.score || 0) + sig.weight;
      newSignals++;
    }

    // Tech-stack signal (once per org per day) — uses the detected tools as a stacked signal.
    if (org.domain) {
      const { data: recentStack } = await supa
        .from('signal_events')
        .select('id')
        .eq('organization_id', org.id)
        .eq('type', 'tech_changes')
        .gte('detected_at', new Date(Date.now() - 86400000).toISOString())
        .maybeSingle();
      if (!recentStack) {
        const stack = await detectTechStack(org.domain);
        if (stack && !stack.detection_error && stack.tech_stack_signal !== 'low') {
          const tools = (stack.detected_tools || []).join(', ') || stack.gtm_tool_count || 'tools';
          const w = stack.tech_stack_signal === 'high' ? 15 : 8;
          await supa.from('signal_events').insert({
            user_id: userId,
            organization_id: org.id,
            type: 'tech_changes',
            title: `Stack: ${stack.crm_detected || ''}${stack.seq_tool_detected ? ' + ' + stack.seq_tool_detected : ''}`.replace(/^\s*\+\s*/, '').trim() || 'GTM tools in use',
            detail: `${org.name} runs ${tools} (${stack.tech_stack_signal} stack signal)`,
            weight: w,
          });
          await supa.from('organizations').update({ score: (org.score || 0) + w, last_signal_at: new Date().toISOString() }).eq('id', org.id);
          org.score = (org.score || 0) + w;
          newSignals++;
        }
      }
    }

    // Threshold cross -> create a lead (if we have a campaign to attach to).
    if (org.score >= TRIGGER_THRESHOLD && org.state !== 'triggered') {
      await supa.from('organizations').update({ state: 'triggered' }).eq('id', org.id);
      org.state = 'triggered';
      triggered++;

      if (targetCampaignId) {
        // Pull the stacked signals to cite in the draft.
        const { data: orgSignals } = await supa
          .from('signal_events')
          .select('title, detail, source_url')
          .eq('organization_id', org.id)
          .order('detected_at', { ascending: false })
          .limit(3);
        const top = (orgSignals || [])[0];
        const signalDetail = (orgSignals || [])
          .map((s: any) => s.detail)
          .filter(Boolean)
          .join(' | ');

        // Resolve a contact email (cheap Apify lookup) when we have a domain.
        let contactEmail = '';
        if (org.domain) {
          const hit = await lookupEmail('Hiring Manager', org.domain).catch(() => null);
          contactEmail = hit?.email || '';
        }

        const { error: leadErr } = await supa.from('leads').insert({
          user_id: userId,
          campaign_id: targetCampaignId,
          organization_id: org.id,
          name: `Hiring Manager`,
          email: contactEmail,
          company: org.name,
          role: 'Hiring Manager',
          signal_type: 'hiring',
          signal_title: top?.title || `Hiring signals at ${org.name}`,
          signal_detail: signalDetail,
          source_url: top?.source_url || null,
          score: org.score,
          status: 'new',
        });
        if (!leadErr) leadsCreated++;
      }
    }
  }

  return {
    scouted: orgs.length,
    newSignals,
    triggered,
    leads: leadsCreated,
    message: `Scouted ${orgs.length} orgs: ${newSignals} new signals, ${triggered} triggered, ${leadsCreated} leads created.`,
  };
}

// Apply daily score decay so stale signals deprioritize (call from a cron).
export async function applyDecay(userId?: string) {
  const supa = getAdmin();
  let q = supa.from('organizations').select('id, score, last_signal_at, state');
  if (userId) q = q.eq('user_id', userId);
  const { data: orgs } = await q;
  const now = Date.now();
  let updated = 0;
  for (const org of orgs || []) {
    if (!org.last_signal_at) continue;
    const daysIdle = (now - new Date(org.last_signal_at).getTime()) / 86400000;
    if (daysIdle <= DECAY_GRACE_DAYS) continue;
    const decay = Math.floor((daysIdle - DECAY_GRACE_DAYS) * DECAY_PER_DAY);
    const newScore = Math.max(0, (org.score || 0) - decay);
    if (newScore !== org.score) {
      const patch: any = { score: newScore };
      if (newScore < TRIGGER_THRESHOLD && org.state === 'triggered') patch.state = 'watching';
      await supa.from('organizations').update(patch).eq('id', org.id);
      updated++;
    }
  }
  return { updated };
}
