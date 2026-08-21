import { requireUser, getAdmin, ok, fail, senderTransport, mapSender } from './_lib.js';

export default async function handler(req: any, res: any) {
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');
  const supa = getAdmin();

  if (req.method === 'POST') {
    const { email, password, provider, action, senderId } = req.body || {};

    // Action: test an existing mailbox (sends a test email to itself).
    if (action === 'test') {
      if (!senderId) return fail(res, 400, 'senderId is required');
      const { data: sender } = await supa
        .from('senders').select('*').eq('id', senderId).eq('user_id', user.id).single();
      if (!sender) return fail(res, 404, 'Sender not found');
      try {
        const transport = senderTransport(sender);
        await transport.verify();
        await transport.sendMail({
          from: sender.email,
          to: sender.email,
          subject: 'Klerk — mailbox test',
          text: `This is a test email from Klerk confirming ${sender.email} is connected and able to send.\n\nYou can delete this message.`,
        });
        return ok(res, { ok: true, message: `Test email sent to ${sender.email}` });
      } catch (e: any) {
        return fail(res, 400, `Connection failed: ${e.message}`);
      }
    }

    if (!email?.trim() || !password?.trim()) {
      return fail(res, 400, 'Email and app password are required');
    }
    const host = provider === 'outlook' ? 'smtp.office365.com' : 'smtp.gmail.com';
    const port = provider === 'outlook' ? 587 : 465;
    // Free-email providers cap at 150/day; business/custom domains cap at 1000/day.
    const freeEmail = /@(gmail|googlemail|outlook|hotmail|yahoo|live|msn|icloud)\.com$/i.test(email.trim());
    const dailyCap = freeEmail ? 150 : 1000;

    const candidate = {
      email: email.trim(),
      smtp_host: host,
      smtp_port: port,
      smtp_user: email.trim(),
      smtp_pass: password.trim(),
      daily_cap: dailyCap,
      max_cap: dailyCap,
    };

    try {
      await senderTransport(candidate).verify();
    } catch (e: any) {
      return fail(
        res,
        400,
        `Could not authenticate with ${host}: ${e.message}. For Gmail, use a 16-character App Password (Google Account → Security → App passwords), not your normal password.`
      );
    }

    const { data, error } = await supa
      .from('senders')
      .insert({ user_id: user.id, provider: provider || 'gmail', ...candidate })
      .select()
      .single();
    if (error) return fail(res, 500, error.message);
    return ok(res, { sender: mapSender(data, {}) });
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) return fail(res, 400, 'id and status are required');
    const { error } = await supa
      .from('senders').update({ status }).eq('id', id).eq('user_id', user.id);
    if (error) return fail(res, 500, error.message);
    return ok(res, { ok: true });
  }

  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) return fail(res, 400, 'id is required');
    const { error } = await supa.from('senders').delete().eq('id', id).eq('user_id', user.id);
    if (error) return fail(res, 500, error.message);
    return ok(res, { ok: true });
  }

  return fail(res, 405, 'Method not allowed');
}
