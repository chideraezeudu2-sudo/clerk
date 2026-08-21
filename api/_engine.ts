import { getAdmin, groqChat, generateDraftsForCampaign } from './_lib.js';
import {
  hiringSignalsForOrg,
  fundingSignalsForOrg,
  techStackForOrg,
  lookupEmail,
  findPersonName,
  gatherSignals,
} from './_sources.js';

// Pick the right contact for a signal. Hiring → current manager of the open
// role's function (not the future hire). Funding → founder/CEO. Tech → tool
// owner. Exported for tests.
export async function pickContactForSignal(
  signalType: string,
  signalTitle: string,
  orgName: string,
): Promise<{ name: string; role: string }> {
  // Fallback matches the signal rules below so a Groq flake still targets the
  // right function (funding → CEO), not a generic "Hiring Manager".
  const fallback = signalType === 'funding'
    ? { name: 'Founder / CEO', role: 'CEO' }
    : signalType === 'tech_changes'
      ? { name: 'Head of Engineering', role: 'Head of Engineering' }
      : { name: 'VP of Sales', role: 'VP of Sales' };
  const prompt = [
    'Pick the single best job title to contact at a company, given the buying signal below.',
    'The contact is the person who feels the pain the signal points to and can buy a tool, not the person being hired.',
    'Rules by signal type:',
    '- hiring: the current manager of the function with the open role (e.g. a Sales Ops Manager posting → target the VP of Sales or Head of RevOps). Never the open role itself.',
    '- funding: the founder or CEO.',
    '- tech_changes: whoever owns the tool being changed (e.g. Head of Engineering / CTO).',
    '- anything else: a senior operator (VP/Director/Head) in the function most related to the signal.',
    'Return ONLY JSON: {"role": string}. A job title, not a person name.',
    '',
    `Company: ${orgName}`,
    `Signal type: ${signalType}`,
    `Signal: ${signalTitle}`,
  ].join('\n');

  try {
    const raw = await groqChat([{ role: 'user', content: prompt }], {
      temperature: 0.1,
      json: true,
      maxTokens: 80,
    });
    const parsed = JSON.parse(raw);
    const role = String(parsed?.role || '').trim();
    if (!role) return fallback;
    return { name: role, role };
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Signal engine (free-first). Hiring/funding are free; tech-stack is only run
// on orgs that already have a free signal (cost control). Public reviews are
// intentionally deprioritized.
// ---------------------------------------------------------------------------

const ROLE_WEIGHTS: Array<{ match: RegExp; weight: number }> = [
  { match: /\b(vp|head|director)\b.*(eng|engineering|data|infrastructure|platform|sales|revenue|growth)/i, weight: 30 },
  { match: /(revops|revenue operations|sales operations|gtm)/i, weight: 25 },
  { match: /(outbound|sdr|sales development|lead gen|demand gen)/i, weight: 25 },
  { match: /(backend|full.?stack|platform|infrastructure|data) engineer/i, weight: 18 },
  { match: /(deliverab|email|lifecycle|crm) (engineer|manager|specialist)/i, weight: 20 },
  { match: /\b(engineer|developer)\b/i, weight: 10 },
];
const FUNDING_WEIGHT = 25;
const COMPETITOR_WEIGHT = 30;
// Every live ATS posting is a real hiring signal — GTM/engineering titles still
// score higher, but "company has 20 open roles" is itself a surge worth crediting.
const HIRING_BASE_WEIGHT = 6;
const TECH_HIGH_WEIGHT = 15;
const TECH_LOW_WEIGHT = 8;
const TRIGGER_THRESHOLD = 40;
const DECAY_PER_DAY = 3;
const DECAY_GRACE_DAYS = 5;

function scoreJobTitle(title: string): number {
  let best = 0;
  for (const r of ROLE_WEIGHTS) if (r.match.test(title)) best = Math.max(best, r.weight);
  return best;
}

export async function scoutForUser(userId: string, campaignId?: string) {
  const supa = getAdmin();
  const { data: orgs } = await supa
    .from('organizations').select('*').eq('user_id', userId).neq('state', 'archived');
  if (!orgs || orgs.length === 0) {
    return { scouted: 0, newSignals: 0, triggered: 0, leads: 0, message: 'No organizations to watch. Add target companies first.' };
  }

  let targetCampaignId = campaignId || null;
  let watchedTypes: string[] | null = null; // null = watch everything
  {
    let camp: any = null;
    if (targetCampaignId) {
      const { data } = await supa.from('campaigns').select('id, signal_keywords').eq('id', targetCampaignId).single();
      camp = data;
    } else {
      const { data } = await supa
        .from('campaigns').select('id, signal_keywords').eq('user_id', userId).eq('status', 'active')
        .order('created_at', { ascending: true }).limit(1).maybeSingle();
      camp = data;
      targetCampaignId = camp?.id || null;
    }
    // Campaign signal_keywords may hold option IDs (funding_series_a) OR the
    // display titles the UI actually saves ("Funding Filings"). Map both to
    // signal types. Empty selection = watch all (don't block everything).
    const ID_TO_TYPE: Record<string, string> = {
      hiring_surges: 'hiring', 'hiring surges': 'hiring',
      funding_series_a: 'funding', 'funding filings': 'funding',
      competitor_discontent: 'competitor_discontent', 'competitor discontent': 'competitor_discontent',
      tech_changes: 'tech_changes', 'tech stack migrations': 'tech_changes',
    };
    const kw: string[] = Array.isArray(camp?.signal_keywords) ? camp.signal_keywords : [];
    const mapped = kw.map((k) => ID_TO_TYPE[String(k).toLowerCase().trim()] || (['hiring','funding','competitor_discontent','tech_changes'].includes(String(k).toLowerCase()) ? String(k).toLowerCase() : null)).filter(Boolean) as string[];
    watchedTypes = mapped.length ? [...new Set(mapped)] : null;
  }

  let newSignals = 0, triggered = 0, leadsCreated = 0, techSpend = 0;

  for (const org of orgs) {
    // 1) Gather free signals first. Tech-stack only allowed once a free signal exists,
    //    so we never pay for the full company universe. keywords = competitor list
    //    the user watches for discontent signals.
    const competitors: string[] = Array.isArray(org.keywords) ? org.keywords : [];
    const { freeSignals, tech } = await gatherSignals(org.name, org.domain, true, competitors, watchedTypes).catch(() => ({ freeSignals: [] as any[], tech: null }));

    // 2) Insert hiring/funding/competitor signals, weight them, update org score.
    // Enforce campaign scope: skip signal types this campaign isn't watching.
    for (const sig of freeSignals.slice(0, 12)) {
      if (watchedTypes && !watchedTypes.includes(sig.type)) continue;
      const title = sig.type === 'hiring' ? `Hiring: ${sig.title}` : sig.title;
      const weight =
        sig.type === 'funding' ? FUNDING_WEIGHT :
        sig.type === 'competitor_discontent' ? COMPETITOR_WEIGHT :
        Math.max(scoreJobTitle(sig.title), HIRING_BASE_WEIGHT);
      if (weight === 0) continue;

      const { data: existing } = await supa
        .from('signal_events').select('id')
        .eq('organization_id', org.id).eq('title', title).maybeSingle();
      if (existing) continue;

      await supa.from('signal_events').insert({
        user_id: userId, organization_id: org.id, type: sig.type,
        title, detail: sig.detail, source_url: sig.url || sig.source_url || null, weight,
      });
      await supa.from('organizations')
        .update({ score: (org.score || 0) + weight, last_signal_at: new Date().toISOString() })
        .eq('id', org.id);
      org.score = (org.score || 0) + weight;
      freeSignals.length && newSignals++;
    }

    // 3) Tech-stack (only if a free signal fired) — the paid part.
    if (freeSignals.length && tech && !tech.detection_error && tech.tech_stack_signal !== 'low') {
      const { data: recentTech } = await supa.from('signal_events').select('id')
        .eq('organization_id', org.id).eq('type', 'tech_changes')
        .gte('detected_at', new Date(Date.now() - 86400000).toISOString()).maybeSingle();
      if (!recentTech) {
        const tools = (tech.detected_tools || []).join(', ') || tech.gtm_tool_count || 'tools';
        const w = tech.tech_stack_signal === 'high' ? TECH_HIGH_WEIGHT : TECH_LOW_WEIGHT;
        await supa.from('signal_events').insert({
          user_id: userId, organization_id: org.id, type: 'tech_changes',
          title: 'GTM tools in use', detail: `${org.name} runs ${tools} (${tech.tech_stack_signal} stack)`, weight: w,
        });
        await supa.from('organizations')
          .update({ score: org.score + w, last_signal_at: new Date().toISOString() }).eq('id', org.id);
        org.score += w;
        newSignals++;
        techSpend++;
      }
    }

    // 4) Threshold -> trigger + lead (with stacked citations + cheap email lookup).
    // A triggered org also re-leads if it has no lead yet in the campaign —
    // covers pipeline fixes replaying without spamming duplicates.
    if (org.score >= TRIGGER_THRESHOLD) {
      let shouldLead = org.state !== 'triggered';
      if (org.state !== 'triggered') {
        await supa.from('organizations').update({ state: 'triggered' }).eq('id', org.id);
        org.state = 'triggered';
      }
      if (!shouldLead && targetCampaignId) {
        const { data: existingLead } = await supa
          .from('leads').select('id')
          .eq('organization_id', org.id).eq('campaign_id', targetCampaignId).limit(1);
        shouldLead = !(existingLead && existingLead.length);
      }
      if (shouldLead) {
      triggered++;

      if (targetCampaignId) {
        const { data: orgSignals } = await supa
          .from('signal_events').select('title, detail, source_url, type')
          .eq('organization_id', org.id).order('detected_at', { ascending: false }).limit(4);
        const top = (orgSignals || [])[0];
        const detail = (orgSignals || []).map((s: any) => s.detail).filter(Boolean).join(' | ');

        const primaryType = (orgSignals || [])[0]?.type || 'hiring';
        const contact = await pickContactForSignal(
          primaryType,
          top?.title || `Signals at ${org.name}`,
          org.name
        );

        // Resolve a real person name first — the email waterfall needs a name,
        // not a bare role. Without a name we skip lookup entirely: feeding it
        // role words makes the actor guess pattern emails (vp.ofsales@...).
        const personName = await findPersonName(org.name, contact.role).catch(() => null);
        let email = '';
        if (org.domain && personName) {
          const hit = await lookupEmail(personName, org.domain).catch(() => null);
          email = hit?.email || '';
        }

        // Don't create a lead with no usable contact — a blank email or a
        // name that never resolved to a real person is an incomplete record.
        if (!email || !personName) continue;

        const { error } = await supa.from('leads').insert({
          user_id: userId, campaign_id: targetCampaignId, organization_id: org.id,
          name: personName, email, company: org.name, role: contact.role,
          signal_type: primaryType,
          signal_title: top?.title || `Signals at ${org.name}`,
          signal_detail: detail, source_url: top?.source_url || null,
          score: org.score, status: 'new',
        });
        if (!error) leadsCreated++;
      }
      }
    }
  }

  // Turn every new lead into a draft right away — nothing sits at 'new' until
  // someone clicks. The Drafts view then has a queue to approve/reject.
  let draftsCreated = 0;
  if (targetCampaignId && leadsCreated > 0) {
    const drafts = await generateDraftsForCampaign(userId, targetCampaignId, leadsCreated).catch(() => []);
    draftsCreated = Array.isArray(drafts) ? drafts.length : 0;
  }

  return {
    scouted: orgs.length,
    newSignals,
    triggered,
    leads: leadsCreated,
    drafts: draftsCreated,
    techStackRuns: techSpend,
    message: `Scouted ${orgs.length} orgs: ${newSignals} new signals, ${triggered} triggered, ${leadsCreated} leads, ${draftsCreated} drafts.`,
  };
}

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
