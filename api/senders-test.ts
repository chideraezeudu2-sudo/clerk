import { requireUser, getAdmin, ok, fail, senderTransport } from './_lib.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');

  const { senderId } = req.body || {};
  if (!senderId) return fail(res, 400, 'senderId is required');

  const supa = getAdmin();
  const { data: sender } = await supa
    .from('senders').select('*').eq('id', senderId).eq('user_id', user.id).single();
  if (!sender) return fail(res, 404, 'Sender not found');

  try {
    const transport = senderTransport(sender);
    await transport.verify();
    await transport.sendMail({
      from: sender.email,
      to: sender.email,
      subject: 'Signal — mailbox test',
      text: `This is a test email from Signal confirming ${sender.email} is connected and able to send.\n\nYou can delete this message.`,
    });
    ok(res, { ok: true, message: `Test email sent to ${sender.email}` });
  } catch (e: any) {
    fail(res, 400, `Connection failed: ${e.message}`);
  }
}
