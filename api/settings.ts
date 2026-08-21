import { requireUser, getAdmin, ok, fail } from './_lib.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'PATCH') return fail(res, 405, 'Method not allowed');
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');

  const { mailingAddress, defaultFollowUpDays, dailyCapAcrossAll, timezone } = req.body || {};
  const patch: any = { updated_at: new Date().toISOString() };
  if (mailingAddress !== undefined) patch.mailing_address = mailingAddress;
  if (defaultFollowUpDays !== undefined) patch.default_follow_up_days = defaultFollowUpDays;
  if (dailyCapAcrossAll !== undefined) patch.daily_cap = dailyCapAcrossAll;
  if (timezone !== undefined) patch.timezone = timezone;

  const supa = getAdmin();
  const { error } = await supa
    .from('user_settings')
    .upsert({ user_id: user.id, ...patch }, { onConflict: 'user_id' });
  if (error) return fail(res, 500, error.message);
  ok(res, { ok: true });
}
