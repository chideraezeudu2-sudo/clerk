import { createClient, SupabaseClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let admin: SupabaseClient | null = null;

export function getAdmin(): SupabaseClient {
  if (!admin) {
    admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

export async function requireUser(req: any) {
  const header: string = req.headers?.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const { data, error } = await getAdmin().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export function ok(res: any, body: any) {
  res.status(200).json(body);
}

export function fail(res: any, status: number, message: string) {
  res.status(status).json({ error: message });
}

export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.floor(ms / 86400000) + 1);
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------- Groq ----------

export async function groqChat(
  messages: { role: string; content: string }[],
  opts: { temperature?: number; json?: boolean; maxTokens?: number } = {}
): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not configured');
  const body: any = {
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 2048,
  };
  if (opts.json) body.response_format = { type: 'json_object' };
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Groq API error ${r.status}: ${await r.text()}`);
  const data: any = await r.json();
  return data.choices?.[0]?.message?.content || '';
}

// ---------- Email sending ----------

export function senderTransport(sender: any) {
  const port = sender.smtp_port || 465;
  return nodemailer.createTransport({
    host: sender.smtp_host || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: sender.smtp_user || sender.email,
      pass: (sender.smtp_pass || '').replace(/\s+/g, ''),
    },
    connectionTimeout: 15000,
    socketTimeout: 20000,
  });
}

export function complianceFooter(mailingAddress: string): string {
  const parts = ['\n\n—'];
  if (mailingAddress) parts.push(mailingAddress);
  parts.push(`If you'd rather not hear from me, just reply "unsubscribe" and I won't reach out again.`);
  return parts.join('\n');
}

// ---------- Bootstrap mappers (DB rows -> UI shapes) ----------

export function mapCampaign(c: any, leads: any[], sent: any[]): any {
  const campaignLeads = leads.filter((l) => l.campaign_id === c.id);
  const campaignSent = sent.filter((s) => s.campaign_id === c.id && s.status === 'sent');
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    personaId: c.persona_id || '',
    leadsCount: campaignLeads.length,
    sentCount: campaignSent.length,
    repliedCount: sent.filter((s) => s.campaign_id === c.id && s.status === 'replied').length,
    bouncedCount: sent.filter((s) => s.campaign_id === c.id && (s.status === 'failed' || s.status === 'bounced')).length,
    createdAt: timeAgo(c.created_at),
    signalKeywords: c.signal_keywords || [],
    signals: campaignLeads.map((l) => ({
      id: l.id,
      type: l.signal_type || 'hiring',
      title: l.signal_title || `Signal detected at ${l.company}`,
      company: l.company,
      contactName: l.name,
      contactRole: l.role,
      contactEmail: l.email,
      detail: l.signal_detail || '',
      sourceUrl: l.source_url || undefined,
      detectedAt: timeAgo(l.created_at),
      detectedIso: l.created_at,
      confidenceScore: 95,
    })),
    sequence: [
      {
        stepNumber: 1,
        label: 'Signal Introduction',
        delayDays: 0,
        sentCount: campaignSent.length,
        templateSnippet: 'Personalized per lead from the detected signal. Generated drafts appear in the Review Queue.',
        openRate: 0,
        replyRate: 0,
      },
      {
        stepNumber: 2,
        label: 'Manual Follow-up',
        delayDays: 3,
        sentCount: 0,
        templateSnippet: 'Follow-ups are drafted on request through the Assistant.',
        openRate: 0,
        replyRate: 0,
      },
    ],
    voiceNotes: c.voice_notes || '',
    voiceDrafts: [],
  };
}

export function mapDraft(d: any, campaigns: any[], leads: any[]): any {
  const campaign = campaigns.find((c) => c.id === d.campaign_id);
  const lead = leads.find((l) => l.id === d.lead_id);
  return {
    id: d.id,
    campaignId: d.campaign_id || '',
    campaignName: campaign?.name || 'No campaign',
    recipientName: lead?.name || '',
    recipientEmail: lead?.email || '',
    recipientCompany: lead?.company || '',
    recipientRole: lead?.role || '',
    subject: d.subject,
    body: d.body,
    signalReason: lead?.signal_title || '',
    signalType: lead?.signal_type || 'hiring',
    detectedDetail: lead?.signal_detail || '',
    status: d.status === 'sent' ? 'approved' : d.status,
    rejectionReason: d.rejection_reason || undefined,
    createdAt: timeAgo(d.created_at),
  };
}

export function mapSent(s: any, campaigns: any[], leads: any[], senders: any[]): any {
  const campaign = campaigns.find((c) => c.id === s.campaign_id);
  const lead = leads.find((l) => l.id === s.lead_id);
  const sender = senders.find((x) => x.id === s.sender_id);
  return {
    id: s.id,
    campaignId: s.campaign_id || '',
    campaignName: campaign?.name || 'No campaign',
    recipientName: lead?.name || s.to_email,
    recipientEmail: s.to_email,
    recipientCompany: lead?.company || '',
    subject: s.subject,
    body: s.body,
    sentAt: timeAgo(s.sent_at),
    sentAtIso: s.sent_at,
    status: s.status === 'failed' ? 'bounced' : 'sent',
    senderMailbox: sender?.email || '',
  };
}

export function mapSender(s: any, sentTodayBySender: Record<string, number>): any {
  return {
    id: s.id,
    email: s.email,
    status: s.status,
    connectedDays: daysSince(s.created_at),
    dailyCap: s.daily_cap,
    maxCap: s.max_cap,
    sentToday: sentTodayBySender[s.id] || 0,
    healthScore: 100,
    addedAt: timeAgo(s.created_at),
  };
}

// ---------- Draft generation (shared by /api/drafts-generate and /api/chat) ----------

// Rules that keep source metadata out of the email body. Exported so a test can
// assert the HN-citation ban stays in place.
export const EMAIL_BODY_RULES =
  '- Reference the exact signal in the opening sentence, in your own words.\n' +
  '- NEVER quote source metadata in the body: no point counts, "Hacker News story", "GDELT", "SEC EDGAR", platform names, or URLs. Write like a human who heard the news.';

// Pure decision: should this lead get a new draft? Blocks missing contact data
// and blocks re-drafting a company+signal that already has an active draft.
// Exported so it's directly testable without a live DB.
type DraftGuardResult = { ok: true } | { ok: false; rejectAs: 'no_contact' | 'duplicate' };

export function draftGuard(
  lead: { email?: string | null; company?: string | null; signal_type?: string | null },
  existingDrafts: Array<{ leads?: any }>
): DraftGuardResult {
  if (!lead.email || !lead.company) return { ok: false, rejectAs: 'no_contact' };
  const dupe = existingDrafts.some((d) => {
    const l = Array.isArray(d.leads) ? d.leads[0] : d.leads;
    return l?.company === lead.company && l?.signal_type === lead.signal_type;
  });
  if (dupe) return { ok: false, rejectAs: 'duplicate' };
  return { ok: true };
}

export async function generateDraftsForCampaign(userId: string, campaignId: string, maxLeads = 10) {
  const supa = getAdmin();

  const { data: campaign } = await supa
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('user_id', userId)
    .single();
  if (!campaign) throw new Error('Campaign not found');

  const { data: persona } = campaign.persona_id
    ? await supa.from('personas').select('*').eq('id', campaign.persona_id).single()
    : { data: null };

  const { data: settings } = await supa
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: leads } = await supa
    .from('leads')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('user_id', userId)
    .eq('status', 'new')
    .limit(maxLeads);

  if (!leads || leads.length === 0) return [];

  const footer = complianceFooter(settings?.mailing_address || '');
  const created: any[] = [];

  // Fetch active drafts once so the guard can dedupe against them.
  const { data: existingDrafts } = await supa
    .from('email_drafts')
    .select('id, leads!inner(company, signal_type)')
    .eq('campaign_id', campaignId)
    .in('status', ['pending', 'approved']);

  for (const lead of leads) {
    const gate = draftGuard(lead, existingDrafts || []);
    if (gate.ok === false) {
      await supa.from('leads').update({ status: gate.rejectAs }).eq('id', lead.id);
      continue;
    }

    const prompt = `You are an expert B2B cold email writer working for the product described below.

PRODUCT / SENDER PERSONA:
Name: ${persona?.name || 'Klerk'}
Company: ${persona?.company_name || ''}
What it does: ${persona?.description || 'Signal-based outreach platform'}
Website: ${persona?.website_url || ''}

RECIPIENT (a real lead with a detected buying signal):
Name: ${lead.name}
Role: ${lead.role}
Company: ${lead.company}
Signal type: ${lead.signal_type}
Signal: ${lead.signal_title}
Signal context (for your understanding only — never quote this in the email): ${lead.signal_detail}

WRITING STYLE DIRECTIVE — follow this exactly, it overrides all other tone guidance:
${campaign.voice_notes || 'Short, peer-to-peer, under 90 words. Cite the exact signal in the opening line. No buzzwords.'}

RULES:
${EMAIL_BODY_RULES}
- Plain-text email, no markdown, no bullet-point feature dumps.
- End with a soft, low-friction question as the call to action.
- Do NOT invent facts beyond what is given.
- Sign off with a first name only.

Return ONLY valid JSON: {"subject": "...", "body": "..."}`;

    const raw = await groqChat(
      [
        { role: 'system', content: 'You write concise, human B2B outreach emails. You only output JSON.' },
        { role: 'user', content: prompt },
      ],
      { json: true, temperature: 0.7 }
    );

    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    if (!parsed.subject || !parsed.body) continue;

    const { data: draft, error } = await supa
      .from('email_drafts')
      .insert({
        user_id: userId,
        campaign_id: campaignId,
        lead_id: lead.id,
        subject: String(parsed.subject).trim(),
        body: String(parsed.body).trim() + footer,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && draft) {
      created.push(draft);
      await supa.from('leads').update({ status: 'drafted' }).eq('id', lead.id);
    }
  }

  return created;
}
