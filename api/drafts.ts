import { requireUser, getAdmin, ok, fail, generateDraftsForCampaign, mapDraft } from './_lib.js';

export default async function handler(req: any, res: any) {
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');

  // POST /api/drafts { action:'generate', campaignId } -> generate AI drafts
  if (req.method === 'POST') {
    const { campaignId } = req.body || {};
    if (!campaignId) return fail(res, 400, 'campaignId is required');
    try {
      const created = await generateDraftsForCampaign(user.id, campaignId);
      const supa = getAdmin();
      const [{ data: campaigns }, { data: leads }] = await Promise.all([
        supa.from('campaigns').select('*').eq('user_id', user.id),
        supa.from('leads').select('*').eq('user_id', user.id),
      ]);
      return ok(res, {
        created: created.length,
        drafts: created.map((d) => mapDraft(d, campaigns || [], leads || [])),
      });
    } catch (e: any) {
      return fail(res, 500, e.message || 'Draft generation failed');
    }
  }

  if (req.method !== 'PATCH') return fail(res, 405, 'Method not allowed');

  const { id, action, subject, body, reason } = req.body || {};
  if (!id || !action) return fail(res, 400, 'id and action are required');

  const supa = getAdmin();
  const patch: any = {};
  if (action === 'approve') patch.status = 'approved';
  else if (action === 'reject') {
    patch.status = 'rejected';
    patch.rejection_reason = reason || '';
  } else if (action === 'edit') {
    if (subject !== undefined) patch.subject = subject;
    if (body !== undefined) patch.body = body;
  } else {
    return fail(res, 400, 'Unknown action');
  }

  const { error } = await supa
    .from('email_drafts')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) return fail(res, 500, error.message);
  return ok(res, { ok: true });
}
