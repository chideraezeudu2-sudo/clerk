import { getAdmin } from './_lib.js';

// ---------------------------------------------------------------------------
// Free + cheap signal sources. Hiring/funding are free; tech-stack runs only
// on a company *already triggered* by a free signal (prevents $0.50/site on
// the full company universe). Public reviews are deprioritized (hard scraping).
// ---------------------------------------------------------------------------

const APIFY_TOKEN = process.env.APIFY_TOKEN || '';

// ---------- HIRING (free ATS endpoints, no keys) ----------
// Most job postings live on Greenhouse, Lever, or Ashby. Each has a public
// per-company JSON API. We try each for an org slug/domain hint.

async function fetchJson(url: string, timeoutMs = 10000): Promise<any | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function hiringSignalsForOrg(orgName: string, domain: string) {
  const slug = slugify(orgName);
  const dom = (domain || '').toLowerCase().replace(/^www\./, '');
  const domSlug = slugify(dom.split('.')[0]);
  const candidates = [slug, domSlug].filter(Boolean);
  const out: any[] = [];

  for (const slugc of [...new Set(candidates)]) {
    if (!slugc) continue;
    // Greenhouse: https://boards-api.greenhouse.io/v1/boards/{slug}/jobs
    const gh = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${slugc}/jobs`);
    if (gh?.jobs) {
      for (const j of gh.jobs.slice(0, 25)) {
        out.push({
          type: 'hiring',
          title: j.title || 'Open role',
          detail: `${j.title} — ${j.location?.name || ''}`.trim(),
          url: j.absolute_url || null,
          ats: 'greenhouse',
        });
      }
      break;
    }
    // Lever: https://api.lever.co/v0/postings/{slug}?mode=json
    const lv = await fetchJson(`https://api.lever.co/v0/postings/${slugc}?mode=json`);
    if (Array.isArray(lv) && lv.length) {
      for (const j of lv.slice(0, 25)) {
        out.push({
          type: 'hiring',
          title: j.text || 'Open role',
          detail: `${j.text} — ${j.categories?.location || ''}`.trim(),
          url: j.hostedUrl || j.applyUrl || null,
          ats: 'lever',
        });
      }
      break;
    }
  }
  return out;
}

// ---------- FUNDING (free: SEC EDGAR full-text + TechCrunch RSS) ----------
export async function fundingSignalsForOrg(orgName: string) {
  const out: any[] = [];
  // SEC EDGAR Form D full-text search (free, no key).
  try {
    const q = encodeURIComponent(`"${orgName}"`);
    const r = await fetchJson(
      `https://efts.sec.gov/LATEST/search-index?q=${q}&dateRange=custom&startdt=2025-01-01&enddt=2026-12-31&forms=Form+D&from=0&size=10`
    );
    const hits = r?.hits?.hits || [];
    for (const h of hits.slice(0, 5)) {
      const f = h._source || {};
      out.push({
        type: 'funding',
        title: `Form D filing: ${f.display_names?.[0] || orgName}`,
        detail: `SEC Form D — ${f.form_type || 'D'} filed ${f.file_date || ''}`,
        url: f.id ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${f.ciks?.[0]}&type=D&dateb=&owner=include&count=10` : null,
        source: 'sec-edgar',
      });
    }
  } catch {}
  // TechCrunch funding RSS mention.
  try {
    const rss = await fetchJson(
      `https://techcrunch.com/feed/`
    );
  } catch {}
  return out;
}

// ---------- TECH-STACK (paid per-site; run only on prioritized/triggered orgs) ----------
export async function techStackForOrg(domain: string) {
  if (!APIFY_TOKEN || !domain) return null;
  try {
    const res = await fetch(
      'https://api.apify.com/v2/acts/qyd7nNyqFPelQViBx/run-sync-get-dataset-items?timeout=120',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${APIFY_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: domain, crawl_additional_pages: true }),
      }
    );
    if (!res.ok) return null;
    const items = await res.json();
    return (Array.isArray(items) ? items[0] : items) || null;
  } catch {
    return null;
  }
}

// ---------- EMAIL LOOKUP (cheapest Apify waterfall actor) ----------
export async function lookupEmail(name: string, domain: string) {
  if (!APIFY_TOKEN || !domain) return null;
  const actorUrl =
    process.env.EMAIL_LOOKUP_ACTOR ||
    'https://api.apify.com/v2/acts/ryanclinton~waterfall-contact-enrichment/run-sync-get-dataset-items?timeout=120';
  try {
    const res = await fetch(actorUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${APIFY_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ people: [{ name, domain }] }),
    });
    if (!res.ok) return null;
    const items = await res.json();
    const row = Array.isArray(items) ? items[0] : items;
    const email = row?.email || row?.emails?.[0] || null;
    if (!email || row?.status === 'not_found') return null;
    return { email, confidence: row?.emailConfidence ?? 0, source: row?.emailSource || 'apify' };
  } catch {
    return null;
  }
}

// Central: gather all signals for one org, but only spend the paid tech-stack
// call when the org already has a free signal (hiring/funding) — cost control.
export async function gatherSignals(orgName: string, domain: string, allowTechStack: boolean) {
  const [hiring, funding] = await Promise.all([
    hiringSignalsForOrg(orgName, domain).catch(() => []),
    fundingSignalsForOrg(orgName).catch(() => []),
  ]);
  const freeSignals = [...hiring, ...funding];
  let tech: any = null;
  if (allowTechStack && freeSignals.length) {
    tech = await techStackForOrg(domain);
  }
  return { hiring, funding, freeSignals, tech };
}

// ---------- LOOKALIKES (free: companies hiring the same roles you already watch) ----------
// For each seed org, take its role keywords, search the free hiring pool, and
// surface NEW companies (different employers) that match the same pattern.
// This turns a few hand-picked targets into a broad, self-expanding watchlist.
export async function findLookalikes(
  seedKeywords: string[],
  existingNames: string[],
  limit = 8
) {
  const JSEARCH_KEY = process.env.JSEARCH_API_KEY || '';
  if (!JSEARCH_KEY || !seedKeywords.length) return [];
  const query = seedKeywords.join(' ');
  try {
    const res = await fetch(
      `https://api.openwebninja.com/jsearch/search-v2?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=us&language=en`,
      { headers: { 'X-API-Key': JSEARCH_KEY } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const jobs = Array.isArray(json?.data?.jobs) ? json.data.jobs : [];
    const existing = new Set(existingNames.map((n) => n.toLowerCase()));
    const seen = new Set<string>();
    const out: any[] = [];
    for (const j of jobs) {
      const name = (j.employer_name || '').trim();
      if (!name || existing.has(name.toLowerCase()) || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      out.push({
        name,
        domain: (j.employer_website || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
        industry: j.job_employment_type || '',
        keywords: seedKeywords,
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}
