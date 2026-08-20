import { requireUser, ok, fail } from './_lib.js';
import { scoutForUser, applyDecay } from './engine.js';

// POST /api/scout  { campaignId? }  -> run a signal scout pass for the user.
// POST /api/scout  { decay: true }  -> apply daily score decay.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');

  try {
    if (req.body?.decay) {
      const r = await applyDecay(user.id);
      return ok(res, r);
    }
    const result = await scoutForUser(user.id, req.body?.campaignId);
    return ok(res, result);
  } catch (e: any) {
    return fail(res, 500, e?.message || 'Scout failed');
  }
}
