import { requireUser, getAdmin, ok, fail } from './_lib.js';

export default async function handler(req: any, res: any) {
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Unauthorized');
  const supa = getAdmin();

  if (req.method === 'POST') {
    const { campaignId, name, email, company, role, signalType, signalTitle, signalDetail, sourceUrl } = req.body || {};
    if (!campaignId || !name?.trim() || !email?.trim()) {
      return fail(res, 400, 'campaignId, name and email are required');
    }
    const { data: campaign } = await supa
      .from('campaigns').select('id').eq('id', campaignId).eq('user_id', user.id).single();
    if (!campaign) return fail(res, 404, 'Campaign not found');

    const { data, error } = await supa
      .from('leads')
      .insert({
        user_id: user.id,
        campaign_id: campaignId,
        name: name.trim(),
        email: email.trim(),
        company: company || '',
        role: role || '',
        signal_type: signalType || 'hiring',
        signal_title: signalTitle || '',
        signal_detail: signalDetail || '',
        source_url: sourceUrl || null,
      })
      .select()
      .single();
    if (error) return fail(res, 500, error.message);
    return ok(res, { lead: data });
  }

  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) return fail(res, 400, 'id is required');
    const { error } = await supa.from('leads').delete().eq('id', id).eq('user_id', user.id);
    if (error) return fail(res, 500, error.message);
    return ok(res, { ok: true });
  }

  return fail(res, 405, 'Method not allowed');
}
