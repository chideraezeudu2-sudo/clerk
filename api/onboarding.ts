import { requireUser, getAdmin, ok, fail, senderTransport } from './_lib.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');

  const {
    mailboxEmail, mailboxPassword, provider,
    mailingAddress,
    personaName, personaDescription, personaWebsite, targetAudience, voiceSample, voiceTone,
    signalPicks,
  } = req.body || {};

  const supa = getAdmin();

  // 1. Sender mailbox — only insert if this exact email isn't already saved
  //    (the onboarding connect step already persisted + verified it via /api/senders).
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
    const { data: existing } = await supa
      .from('senders')
      .select('id')
      .eq('user_id', user.id)
      .ilike('email', candidate.email)
      .maybeSingle();
    if (!existing) {
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
  }

  // 2. Persona
  if (personaName?.trim()) {
    const picks = Array.isArray(signalPicks) ? signalPicks.filter((p: any) => typeof p === 'string') : [];
    const description = [
      personaDescription || '',
      targetAudience ? `Target audience: ${targetAudience}` : '',
      voiceSample ? `Voice: ${voiceSample}` : '',
      voiceTone ? `Tone: ${voiceTone}` : '',
      picks.length ? `Watched signals: ${picks.join(', ')}` : '',
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
