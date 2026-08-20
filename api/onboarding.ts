import { requireUser, getAdmin, ok, fail, senderTransport } from './_lib.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Unauthorized');

  const {
    mailboxEmail, mailboxPassword, provider,
    mailingAddress,
    personaName, personaDescription, personaWebsite, targetAudience, voiceSample, voiceTone,
  } = req.body || {};

  const supa = getAdmin();

  // 1. Sender mailbox (verify SMTP before saving)
  if (mailboxEmail?.trim() && mailboxPassword?.trim()) {
    const host = provider === 'outlook' ? 'smtp.office365.com' : 'smtp.gmail.com';
    const port = provider === 'outlook' ? 587 : 465;
    const candidate = {
      email: mailboxEmail.trim(),
      smtp_host: host,
      smtp_port: port,
      smtp_user: mailboxEmail.trim(),
      smtp_pass: mailboxPassword.trim(),
    };
    try {
      await senderTransport(candidate).verify();
    } catch (e: any) {
      return fail(
        res,
        400,
        `Could not authenticate mailbox: ${e.message}. For Gmail use a 16-character App Password.`
      );
    }
    await supa.from('senders').insert({ user_id: user.id, provider: provider || 'gmail', ...candidate });
  }

  // 2. Persona
  if (personaName?.trim()) {
    const description = [
      personaDescription || '',
      targetAudience ? `Target audience: ${targetAudience}` : '',
      voiceSample ? `Voice: ${voiceSample}` : '',
      voiceTone ? `Tone: ${voiceTone}` : '',
    ].filter(Boolean).join('\n');
    await supa.from('personas').insert({
      user_id: user.id,
      name: personaName.trim(),
      company_name: personaName.trim(),
      description,
      website_url: personaWebsite || '',
    });
  }

  // 3. Settings
  if (mailingAddress !== undefined) {
    await supa.from('user_settings').upsert(
      { user_id: user.id, mailing_address: mailingAddress, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  }

  // 4. Mark onboarded
  const { error } = await supa
    .from('profiles')
    .upsert({ id: user.id, email: user.email, onboarded: true }, { onConflict: 'id' });
  if (error) return fail(res, 500, error.message);

  ok(res, { ok: true });
}
