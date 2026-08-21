import { requireUser, getAdmin, ok, fail, groqChat, generateDraftsForCampaign } from './_lib.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return fail(res, 400, 'messages array is required');
  }

  const supa = getAdmin();
  const [{ data: campaigns }, { data: drafts }, { data: sent }, { data: leads }, { data: senders }] =
    await Promise.all([
      supa.from('campaigns').select('id, name, status, signal_keywords').eq('user_id', user.id),
      supa.from('email_drafts').select('id, status').eq('user_id', user.id),
      supa.from('sent_emails').select('id, status').eq('user_id', user.id),
      supa.from('leads').select('id, status, campaign_id').eq('user_id', user.id),
      supa.from('senders').select('id, email, status').eq('user_id', user.id),
    ]);

  const campaignList = (campaigns || [])
    .map((c: any) => {
      const newLeads = (leads || []).filter(
        (l: any) => l.campaign_id === c.id && l.status === 'new'
      ).length;
      return `- "${c.name}" (id: ${c.id}, status: ${c.status}, signals: ${(c.signal_keywords || []).join(', ')}, leads awaiting drafts: ${newLeads})`;
    })
    .join('\n');

  const pendingDrafts = (drafts || []).filter((d: any) => d.status === 'pending').length;
  const sentCount = (sent || []).filter((s: any) => s.status === 'sent').length;

  const systemPrompt = `You are the built-in AI assistant inside Klerk, a signal-based cold outreach platform. You help the user understand their outreach performance and manage campaigns.

LIVE ACCOUNT STATE:
- Campaigns:
${campaignList || '  (none yet)'}
- Drafts pending review: ${pendingDrafts}
- Emails sent: ${sentCount}
- Connected sender mailboxes: ${(senders || []).filter((s: any) => s.status === 'active').length}

RULES:
- Answer concisely and concretely using the live numbers above. Never invent statistics.
- Drafts never send automatically — the user approves each one in the Review Queue.
- If the user asks you to write/generate/create drafts for a campaign, and that campaign has leads awaiting drafts, reply with a one-sentence confirmation and append exactly this token on its own final line: ACTION:GENERATE_DRAFTS:<campaign id>
- Only emit the ACTION token when the user clearly asked for draft generation. Otherwise never emit it.
- If a campaign has 0 leads awaiting drafts, tell the user to add leads to it first instead of emitting the token.`;

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-12).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: String(m.text),
    })),
  ];

  try {
    let reply = await groqChat(groqMessages, { temperature: 0.5 });

    let actionTaken: any = undefined;
    const actionMatch = reply.match(/ACTION:GENERATE_DRAFTS:([a-f0-9-]+)/i);
    if (actionMatch) {
      const campaignId = actionMatch[1];
      const campaign = (campaigns || []).find((c: any) => c.id === campaignId);
      reply = reply.replace(/ACTION:GENERATE_DRAFTS:[a-f0-9-]+/i, '').trim();
      if (campaign) {
        const created = await generateDraftsForCampaign(user.id, campaignId);
        if (created.length > 0) {
          actionTaken = { type: 'created_drafts', count: created.length };
          reply += `\n\nDone — I wrote ${created.length} new draft${created.length === 1 ? '' : 's'} for "${campaign.name}". They're waiting in your Review Queue; nothing sends until you approve.`;
        } else {
          reply += `\n\nThere are no leads awaiting drafts in "${campaign.name}" right now. Add leads to the campaign first.`;
        }
      }
    }

    ok(res, { reply, actionTaken });
  } catch (e: any) {
    fail(res, 500, e.message || 'Assistant error');
  }
}
