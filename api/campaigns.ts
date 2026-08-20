import { requireUser, getAdmin, ok, fail, mapCampaign } from './_lib.js';

export default async function handler(req: any, res: any) {
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');
  const supa = getAdmin();

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
