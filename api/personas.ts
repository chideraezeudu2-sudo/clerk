import { requireUser, getAdmin, ok, fail } from './_lib.js';

export default async function handler(req: any, res: any) {
  const user = await requireUser(req);
  if (!user) return fail(res, 401, 'Unauthorized');
  const supa = getAdmin();

  if (req.method === 'POST') {
    const { name, companyName, description, websiteUrl } = req.body || {};
    if (!name?.trim()) return fail(res, 400, 'Persona name is required');
    const { data, error } = await supa
      .from('personas')
      .insert({
        user_id: user.id,
        name: name.trim(),
        company_name: companyName || '',
        description: description || '',
        website_url: websiteUrl || '',
      })
      .select()
      .single();
    if (error) return fail(res, 500, error.message);
    return ok(res, {
      persona: {
        id: data.id,
        name: data.name,
        companyName: data.company_name,
        description: data.description,
        websiteUrl: data.website_url,
        activeCampaignsCount: 0,
      },
    });
  }

  if (req.method === 'PATCH') {
    const { id, name, companyName, description, websiteUrl } = req.body || {};
    if (!id) return fail(res, 400, 'id is required');
    const patch: any = {};
    if (name !== undefined) patch.name = name;
    if (companyName !== undefined) patch.company_name = companyName;
    if (description !== undefined) patch.description = description;
    if (websiteUrl !== undefined) patch.website_url = websiteUrl;
    const { error } = await supa.from('personas').update(patch).eq('id', id).eq('user_id', user.id);
    if (error) return fail(res, 500, error.message);
    return ok(res, { ok: true });
  }

  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) return fail(res, 400, 'id is required');
    const { error } = await supa.from('personas').delete().eq('id', id).eq('user_id', user.id);
    if (error) return fail(res, 500, error.message);
    return ok(res, { ok: true });
  }

  return fail(res, 405, 'Method not allowed');
}
