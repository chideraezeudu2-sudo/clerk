import { getAdmin, groqChat } from './_lib.js';

// ---------------------------------------------------------------------------
// Free + cheap signal sources. Hiring/funding are free; tech-stack runs only
// on a company *already triggered* by a free signal (prevents $0.50/site on
// the full company universe). Competitor discontent uses GDELT's free news
// index, filtered through Groq so only genuine churn/complaint items surface.
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

  // 3) Hacker News — broad job index; catches roles not on Greenhouse/Lever.
  if (!out.length) {
    try {
      const hn = await fetchJson(
        `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(orgName + ' hiring')}&tags=story&hitsPerPage=8`
      );
      for (const h of hn?.hits || []) {
        const title = h.title || '';
        if (!/hiring|job|role|engineer|open position|looking for/i.test(title)) continue;
        out.push({
          type: 'hiring',
          title,
          detail: `Hacker News job mention — ${h.points || 0} points`,
          url: h.url || (h.objectID ? `https://news.ycombinator.com/item?id=${h.objectID}` : null),
          ats: 'hackernews',
        });
        if (out.length >= 12) break;
      }
    } catch {}
  }
  return out;
}

// ---------- FUNDING (free: SEC EDGAR full-text + Hacker News + GDELT news) ----------
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
        url: f.ciks?.[0] ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${f.ciks[0]}&type=D&dateb=&owner=include&count=10` : null,
        source: 'sec-edgar',
      });
    }
  } catch {}

  // Hacker News (Algolia) — startup funding announcements surface here fast.
  try {
    const hn = await fetchJson(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(orgName + ' raised')}&tags=story&hitsPerPage=5`
    );
    for (const h of hn?.hits || []) {
      const title = h.title || '';
      if (/^(ask hn|tell hn|show hn|launch hn)[:]/i.test(title)) continue;
      if (!/raised|raises|funding|series [a-f]|seed round|closes?\s/i.test(title)) continue;
      out.push({
        type: 'funding',
        title,
        detail: `Hacker News story — ${h.points || 0} points`,
        url: h.url || (h.objectID ? `https://news.ycombinator.com/item?id=${h.objectID}` : null),
        source: 'hackernews',
      });
    }
  } catch {}

  // GDELT free news index — funding round coverage across outlets.
  try {
    const gd = await fetchJson(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(`"${orgName}" (funding OR "raises" OR "raised" OR "series a" OR "series b" OR "series c" OR "seed round")`)}&mode=artlist&maxrecords=8&format=json&timespan=90d&sort=datedesc`
    );
    for (const a of gd?.articles || []) {
      const title = a.title || '';
      if (!/fund|rais|series [a-f]|seed|investment|capital/i.test(title)) continue;
      out.push({
        type: 'funding',
        title,
        detail: `${a.domain || 'news'} — ${a.seendate || ''}`.trim(),
        url: a.url || null,
        source: 'gdelt',
      });
    }
  } catch {}

  // De-dupe by URL, cap at 6.
  const seen = new Set<string>();
  return out.filter((s) => {
    const key = s.url || s.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 6);
}

// ---------- COMPETITOR DISCONTENT (free: GDELT news, filtered by Groq) ----------
// `competitors` come from the org's keywords — the user lists which rival
// tools their target uses. We scan recent news for churn/complaint signals,
// then use Groq to keep only genuine discontent (layoffs, outages, lawsuits,
// price hikes, bad reviews, "looking for alternatives") — not generic press.
export async function competitorDiscontentForOrg(orgName: string, competitors: string[]) {
  if (!competitors || !competitors.length) return [];
  const out: any[] = [];

  for (const comp of competitors.slice(0, 4)) {
    const articles: any[] = [];
    try {
      const q = encodeURIComponent(
        `"${comp}" (complaints OR outage OR lawsuit OR layoffs OR "price increase" OR "looking for alternatives" OR "switching from" OR churn OR "bad reviews")`
      );
      const gd = await fetchJson(
        `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&maxrecords=6&format=json&timespan=60d&sort=datedesc`
      );
      for (const a of gd?.articles || []) articles.push(a);
    } catch {}
    if (!articles.length) continue;

    // Keep only articles Groq judges as real discontent toward the competitor.
    let kept: any[] = [];
    try {
      const list = articles
        .map((a, i) => `${i + 1}. ${a.title || ''} (${a.domain || ''})`)
        .join('\n');
      const reply = await groqChat([
        {
          role: 'system',
          content:
            'You filter news for genuine customer DISCONTENT toward a specific product/company. ' +
            'Discontent = complaints, outages, lawsuits, layoffs, price hikes, bad reviews, churn, people seeking alternatives. ' +
            'NOT discontent = funding news, product launches, hiring, partnerships, generic mentions. ' +
            'Return JSON only: {"keep": [1, 3]} with the 1-based numbers of discontent items, or {"keep": []}.',
        },
        {
          role: 'user',
          content: `Competitor: ${comp}\nTarget company of interest: ${orgName}\n\nArticles:\n${list}`,
        },
      ], { temperature: 0.1, maxTokens: 200, json: true });
      const nums: number[] = JSON.parse(reply || '{}')?.keep || [];
      kept = articles.filter((_, i) => nums.includes(i + 1));
    } catch {
      kept = [];
    }

    for (const a of kept.slice(0, 3)) {
      out.push({
        type: 'competitor_discontent',
        title: `Discontent with ${comp}: ${a.title || ''}`.slice(0, 140),
        detail: `${orgName} may be re-evaluating ${comp} — ${a.domain || 'news'} ${a.seendate || ''}`.trim(),
        url: a.url || null,
        source: 'gdelt-competitor',
      });
    }
  }
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

// ---------- NAME RESOLUTION (Groq — LLM knows public executives) ----------
// The email waterfall needs a person's name, not a bare role. Ask the model for
// the publicly-known person holding the role at the company. Returns null when
// unsure — never invent a name.
export async function findPersonName(orgName: string, role: string): Promise<string | null> {
  if (!orgName) return null;
  try {
    const raw = await groqChat(
      [
        {
          role: 'system',
          content:
            'You return JSON only. You know public company executives from news. ' +
            'If you are not confident a specific real person holds the role, return an empty name.',
        },
        {
          role: 'user',
          content:
            `Who is the current ${role || 'CEO'} at ${orgName}? ` +
            `Return ONLY JSON: {"name": "First Last"} using a real, publicly-known person, ` +
            `or {"name": ""} if unsure. Never invent names.`,
        },
      ],
      { json: true, temperature: 0, maxTokens: 60 }
    );
    const parsed = JSON.parse(raw);
    const name = String(parsed?.name || '').trim();
    return name.split(/\s+/).length >= 2 ? name : null;
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
  // Actor schema splits first/last names — a combined "name" field is ignored.
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ');
  try {
    const res = await fetch(actorUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${APIFY_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ people: [{ firstName, lastName, domain }] }),
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
export async function gatherSignals(orgName: string, domain: string, allowTechStack: boolean, competitors: string[] = []) {
  const [hiring, funding, competitorDiscontent] = await Promise.all([
    hiringSignalsForOrg(orgName, domain).catch(() => []),
    fundingSignalsForOrg(orgName).catch(() => []),
    competitorDiscontentForOrg(orgName, competitors).catch(() => []),
  ]);
  const freeSignals = [...hiring, ...funding, ...competitorDiscontent];
  let tech: any = null;
  if (allowTechStack && freeSignals.length) {
    tech = await techStackForOrg(domain);
  }
  return { hiring, funding, competitorDiscontent, freeSignals, tech };
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
