import { requireUser, getAdmin, ok, fail } from './_lib.ts';

function mapOrg(o: any) {
  return {
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
  };
}

export default async function handler(req: any, res: any) {
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Your session has expired — please sign in again.');
  const supa = getAdmin();

  if (req.method === 'GET') {
    const { data, error } = await supa
      .from('organizations')
      .select('*')
      .eq('user_id', user.id)
      .order('score', { ascending: false });
    if (error) return fail(res, 500, error.message);
    return ok(res, { organizations: (data || []).map(mapOrg) });
  }

  if (req.method === 'POST') {
    const { name, domain, industry, keywords } = req.body || {};
    if (!name?.trim()) return fail(res, 400, 'Company name is required');
    const { data, error } = await supa
      .from('organizations')
      .insert({
        user_id: user.id,
        name: name.trim(),
        domain: (domain || '').trim(),
        industry: (industry || '').trim(),
        keywords: Array.isArray(keywords) ? keywords : [],
        score: 0,
        state: 'watching',
      })
      .select()
      .single();
    if (error) return fail(res, 500, error.message);
    return ok(res, { organization: mapOrg(data) });
  }

  if (req.method === 'PATCH') {
    const { id, name, domain, industry, keywords, state } = req.body || {};
    if (!id) return fail(res, 400, 'id is required');
    const patch: any = {};
    if (name !== undefined) patch.name = name;
    if (domain !== undefined) patch.domain = domain;
    if (industry !== undefined) patch.industry = industry;
    if (keywords !== undefined) patch.keywords = keywords;
    if (state !== undefined) patch.state = state;
    const { error } = await supa.from('organizations').update(patch).eq('id', id).eq('user_id', user.id);
    if (error) return fail(res, 500, error.message);
    return ok(res, { ok: true });
  }

  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) return fail(res, 400, 'id is required');
    const { error } = await supa.from('organizations').delete().eq('id', id).eq('user_id', user.id);
    if (error) return fail(res, 500, error.message);
    return ok(res, { ok: true });
  }

  return fail(res, 405, 'Method not allowed');
}
