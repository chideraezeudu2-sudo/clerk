import { requireUser, getAdmin, ok, fail, mapCampaign, groqChat } from './_lib.js';

const SIGNAL_IDS = ['hiring_surges', 'funding_series_a', 'competitor_discontent', 'tech_changes'];

export default async function handler(req: any, res: any) {
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');
  const supa = getAdmin();

  if (req.method === 'POST' && req.body?.prefill) {
    // Folded from api/campaign-prefill.ts: Hobby plan caps deployments at 12
    // serverless functions, so the prefill lives here behind a body flag.
    const { personaId } = req.body || {};
    if (!personaId) return fail(res, 400, 'personaId is required');

    const { data: persona } = await supa
      .from('personas')
      .select('name, description')
      .eq('user_id', user.id)
      .eq('id', personaId)
      .maybeSingle();

    if (!persona) return fail(res, 404, 'Persona not found');

    const prompt = [
      'You fill out the starting values of a new cold-email campaign form.',
      'Based on the account persona below, do two things:',
      '1. Pick which of these four signal types match the ideal-customer description:',
      '   - hiring_surges — companies ramping Engineering / Sales Ops / GTM hiring',
      '   - funding_series_a — companies that just raised Seed/A/B rounds',
      '   - competitor_discontent — people publicly complaining about cold-email or sequencer tools',
      '   - tech_changes — companies replatforming their stack',
      '2. Write a 1-2 sentence drafting directive (voice notes) for AI-drafted outreach, matching the voice/tone info in the persona.',
      'If the persona lists existing "Watched signals:", treat them as the baseline unless the ICP text clearly implies others.',
      'Return ONLY JSON: {"signals": string[], "directive": string}. signals must be a subset of the four ids above.',
      '',
      'Persona:',
      `Name: ${persona.name}`,
      persona.description || '(no description)',
    ].join('\n');

    try {
      const raw = await groqChat([{ role: 'user', content: prompt }], {
        temperature: 0.3,
        json: true,
        maxTokens: 300,
      });
      let parsed: any = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        /* fall through to empty defaults */
      }
      const signals = Array.isArray(parsed.signals)
        ? parsed.signals.filter((s: string) => SIGNAL_IDS.includes(s))
        : [];
      const directive = typeof parsed.directive === 'string' ? parsed.directive : '';
      return ok(res, { signals, directive });
    } catch (e: any) {
      // Never block the form on a prefill hiccup; client keeps defaults.
      return ok(res, { signals: [], directive: '', degraded: String(e?.message || e) });
    }
  }

  if (req.method === 'POST') {
    const { name, personaId, signalKeywords, voiceNotes } = req.body || {};
    if (!name?.trim()) return fail(res, 400, 'Campaign name is required');
    const { data, error } = await supa
      .from('campaigns')
      .insert({
        user_id: user.id,
        name: name.trim(),
        persona_id: personaId || null,
        signal_keywords: Array.isArray(signalKeywords) ? signalKeywords : [],
        voice_notes: voiceNotes || '',
        status: 'active',
      })
      .select()
      .single();
    if (error) return fail(res, 500, error.message);
    return ok(res, { campaign: mapCampaign(data, [], []) });
  }

  if (req.method === 'PATCH') {
    const { id, status, name, voiceNotes } = req.body || {};
    if (!id) return fail(res, 400, 'id is required');
    const patch: any = {};
    if (status) patch.status = status;
    if (name) patch.name = name;
    if (voiceNotes !== undefined) patch.voice_notes = voiceNotes;
    const { error } = await supa.from('campaigns').update(patch).eq('id', id).eq('user_id', user.id);
    if (error) return fail(res, 500, error.message);
    return ok(res, { ok: true });
  }

  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) return fail(res, 400, 'id is required');
    const { error } = await supa.from('campaigns').delete().eq('id', id).eq('user_id', user.id);
    if (error) return fail(res, 500, error.message);
    return ok(res, { ok: true });
  }

  return fail(res, 405, 'Method not allowed');
}
