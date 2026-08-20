import { requireUser, getAdmin, ok, fail, generateDraftsForCampaign, mapDraft } from './_lib.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');

  const { campaignId } = req.body || {};
  if (!campaignId) return fail(res, 400, 'campaignId is required');

  try {
    const created = await generateDraftsForCampaign(user.id, campaignId);
    const supa = getAdmin();
    const [{ data: campaigns }, { data: leads }] = await Promise.all([
      supa.from('campaigns').select('*').eq('user_id', user.id),
      supa.from('leads').select('*').eq('user_id', user.id),
    ]);
    ok(res, {
      created: created.length,
      drafts: created.map((d) => mapDraft(d, campaigns || [], leads || [])),
    });
  } catch (e: any) {
    fail(res, 500, e.message || 'Draft generation failed');
  }
}
