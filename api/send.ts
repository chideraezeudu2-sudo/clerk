import { requireUser, getAdmin, ok, fail, senderTransport, mapSent } from './_lib.js';

// Real warmup ramp: start at 5/day on connection day and roughly double
// every 2-3 days until hitting the provider's hard cap. Exported for tests.
export function effectiveDailyCap(sender: { daily_cap: number; created_at?: string }): number {
  const hardCap = sender.daily_cap || 150;
  if (!sender.created_at) return hardCap;
  const days = Math.max(0, (Date.now() - new Date(sender.created_at).getTime()) / 86400000);
  let cap: number;
  if (days <= 3) cap = 5;
  else if (days <= 7) cap = 10;
  else if (days <= 14) cap = 20;
  else cap = 40;
  return Math.min(cap, hardCap);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');

  const { draftId } = req.body || {};
  if (!draftId) return fail(res, 400, 'draftId is required');

  const supa = getAdmin();

  const { data: draft } = await supa
    .from('email_drafts').select('*').eq('id', draftId).eq('user_id', user.id).single();
  if (!draft) return fail(res, 404, 'Draft not found');
  if (!draft.lead_id) return fail(res, 400, 'Draft has no recipient');

  const { data: lead } = await supa
    .from('leads').select('*').eq('id', draft.lead_id).single();
  if (!lead?.email) return fail(res, 400, 'Recipient email missing');

  // Pick the active sender with the fewest sends today
  const { data: senders } = await supa
    .from('senders').select('*').eq('user_id', user.id).eq('status', 'active');
  if (!senders || senders.length === 0) {
    return fail(res, 400, 'No active sender mailbox. Connect one in Senders first.');
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: todaySent } = await supa
    .from('sent_emails').select('sender_id').eq('user_id', user.id)
    .eq('status', 'sent').gte('sent_at', todayStart.toISOString());
  const counts: Record<string, number> = {};
  for (const s of todaySent || []) counts[s.sender_id] = (counts[s.sender_id] || 0) + 1;

  const available = senders.filter((s: any) => (counts[s.id] || 0) < effectiveDailyCap(s));
  const pool = available.length > 0 ? available : senders;
  const sender = pool.sort((a: any, b: any) => (counts[a.id] || 0) - (counts[b.id] || 0))[0];

  let sendError: string | null = null;
  try {
    const transport = senderTransport(sender);
    await transport.sendMail({
      from: sender.email,
      to: lead.email,
      subject: draft.subject,
      text: draft.body,
    });
  } catch (e: any) {
    sendError = e.message || 'SMTP send failed';
  }

  const { data: sentRow, error } = await supa
    .from('sent_emails')
    .insert({
      user_id: user.id,
      draft_id: draft.id,
      campaign_id: draft.campaign_id,
      lead_id: lead.id,
      sender_id: sender.id,
      to_email: lead.email,
      subject: draft.subject,
      body: draft.body,
      status: sendError ? 'failed' : 'sent',
      error: sendError,
    })
    .select()
    .single();
  if (error) return fail(res, 500, error.message);

  if (!sendError) {
    await supa.from('email_drafts').update({ status: 'sent' }).eq('id', draft.id);
    await supa.from('leads').update({ status: 'sent' }).eq('id', lead.id);
  }

  const [{ data: campaigns }, { data: leads }, { data: allSenders }] = await Promise.all([
    supa.from('campaigns').select('*').eq('user_id', user.id),
    supa.from('leads').select('*').eq('user_id', user.id),
    supa.from('senders').select('*').eq('user_id', user.id),
  ]);

  if (sendError) return fail(res, 502, `Send failed: ${sendError}`);
  ok(res, { sent: mapSent(sentRow, campaigns || [], leads || [], allSenders || []) });
}
