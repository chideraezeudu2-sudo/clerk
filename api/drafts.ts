import { requireUser, getAdmin, ok, fail } from './_lib.js';

export default async function handler(req: any, res: any) {
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');
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
