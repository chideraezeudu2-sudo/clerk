import { requireUser, getAdmin, ok, fail } from './_lib.js';
import { scoutForUser, applyDecay } from './_engine.js';
import { findLookalikes } from './_sources.js';

// POST /api/scout  { campaignId? }       -> run a signal scout pass.
// POST /api/scout  { decay: true }       -> apply daily score decay.
// POST /api/scout  { lookalikes: true }  -> find lookalike suggestions.
export default async function handler(req: any, res: any) {
  // Vercel Cron branch: GET /api/scout with X-Cron-Secret for scheduled daily
  // decay + scout pass across ALL org-having users. User sessions use POST.
  if (req.method === 'GET') {
    const supa = getAdmin();
    const secret = process.env.CRON_SECRET || '';
    if (secret) {
      const auth = req.headers['x-cron-secret'] || req.headers['authorization'] || '';
      if (String(auth).replace(/^Bearer\s+/i, '') !== secret) {
        return fail(res, 401, 'Cron auth failed');
      }
    }
    try {
      await applyDecay();
      const { data: orgs } = await supa.from('organizations').select('user_id').neq('state', 'archived');
      const uniqueUsers = [...new Set((orgs || []).map((o: any) => o.user_id))];
      for (const id of uniqueUsers.slice(0, 50)) {
        await scoutForUser(id);
      }
      return ok(res, { ok: true, decayDone: true, scoutedUsers: uniqueUsers.length });
    } catch (e: any) {
      return fail(res, 500, e?.message || 'Cron failed');
    }
  }
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');

  try {
    if (req.body?.decay) {
      const r = await applyDecay(user.id);
      return ok(res, r);
    }

    if (req.body?.lookalikes) {
      const supa = getAdmin();
      const { data: orgs } = await supa.from('organizations').select('name, keywords').eq('user_id', user.id).neq('state', 'archived');
      if (!orgs || orgs.length === 0) {
        return ok(res, { suggestions: [], message: 'Add a few organizations first — lookalikes expand from what you already watch.' });
      }
      const keywords = Array.from(new Set(orgs.flatMap((o: any) => o.keywords || []).filter(Boolean))).slice(0, 4);
      const existingNames = orgs.map((o: any) => o.name).filter(Boolean);
      const suggestions = await findLookalikes(keywords, existingNames, Number(req.body?.limit || 8));
      return ok(res, { suggestions, message: suggestions.length ? 'Pick which to add to your watchlist.' : 'No lookalikes found for the current keywords.' });
    }

    const result = await scoutForUser(user.id, req.body?.campaignId);
    return ok(res, result);
  } catch (e: any) {
    return fail(res, 500, e?.message || 'Scout failed');
  }
}
