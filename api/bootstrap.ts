import {
  requireUser, getAdmin, ok, fail,
  mapCampaign, mapDraft, mapSent, mapSender,
} from './_lib.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return fail(res, 405, 'Method not allowed');
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');

  const supa = getAdmin();
  const [profile, settings, personas, senders, campaigns, leads, drafts, sent, orgs] =
    await Promise.all([
      supa.from('profiles').select('*').eq('id', user.id).single(),
      supa.from('user_settings').select('*').eq('user_id', user.id).single(),
      supa.from('personas').select('*').eq('user_id', user.id).order('created_at'),
      supa.from('senders').select('*').eq('user_id', user.id).order('created_at'),
      supa.from('campaigns').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supa.from('leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supa.from('email_drafts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supa.from('sent_emails').select('*').eq('user_id', user.id).order('sent_at', { ascending: false }),
      supa.from('organizations').select('*').eq('user_id', user.id).order('score', { ascending: false }),
    ]);

  const campaignRows = campaigns.data || [];
  const leadRows = leads.data || [];
  const draftRows = drafts.data || [];
  const sentRows = sent.data || [];
  const senderRowsRaw = senders.data || [];
  const personaRows = personas.data || [];

  // Dedupe senders by email (legacy double-saves created identical rows).
  const seenEmails = new Set<string>();
  const senderRows = senderRowsRaw.filter((x: any) => {
    const key = (x.email || '').toLowerCase().trim();
    if (seenEmails.has(key)) return false;
    seenEmails.add(key);
    return true;
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const sentTodayBySender: Record<string, number> = {};
  for (const s of sentRows) {
    if (s.sender_id && new Date(s.sent_at) >= todayStart && s.status === 'sent') {
      sentTodayBySender[s.sender_id] = (sentTodayBySender[s.sender_id] || 0) + 1;
    }
  }

  const s = settings.data;
  ok(res, {
    user: {
      id: user.id,
      email: user.email,
      fullName: profile.data?.full_name || '',
      onboarded: profile.data?.onboarded ?? false,
    },
    settings: {
      mailingAddress: s?.mailing_address || '',
      defaultFollowUpDays: s?.default_follow_up_days ?? 3,
      dailyCapAcrossAll: s?.daily_cap ?? 50,
      timezone: s?.timezone || 'UTC',
      apiKey: '',
      accountEmail: user.email || '',
    },
    personas: personaRows.map((p: any) => ({
      id: p.id,
      name: p.name,
      companyName: p.company_name,
      description: p.description,
      websiteUrl: p.website_url,
      activeCampaignsCount: campaignRows.filter(
        (c: any) => c.persona_id === p.id && c.status === 'active'
      ).length,
    })),
    senders: senderRows.map((x: any) => mapSender(x, sentTodayBySender)),
    organizations: (orgs.data || []).map((o: any) => ({
      id: o.id,
      name: o.name,
      domain: o.domain || '',
      industry: o.industry || '',
      keywords: o.keywords || [],
      score: o.score ?? 0,
      state: o.state || 'watching',
      lastSignalAt: o.last_signal_at,
      employees: 0,
      peopleCount: 0,
      teamsCount: 0,
      jobsCount: 0,
      lastPost: o.last_signal_at || '',
      industries: o.industry ? [o.industry] : [],
      orgTags: [],
      isStarred: false,
      activeSignal: '',
      signalType: 'hiring',
    })),
    campaigns: campaignRows.map((c: any) => mapCampaign(c, leadRows, sentRows)),
    drafts: draftRows.map((d: any) => mapDraft(d, campaignRows, leadRows)),
    sentEmails: sentRows.map((x: any) => mapSent(x, campaignRows, leadRows, senderRows)),
  });
}
