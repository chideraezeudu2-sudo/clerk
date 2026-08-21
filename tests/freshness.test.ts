import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/_lib.js', () => ({
  getAdmin: vi.fn(),
  groqChat: vi.fn().mockResolvedValue('{}'),
}));

import { fundingSignalsForOrg } from '../api/_sources.js';

// A funding story from 2023 (SVB era) — must NEVER surface as fresh.
function hnHit(title: string, daysAgo: number) {
  return { title, points: 500, url: 'https://example.com/x', objectID: '1', created_at_i: Math.floor((Date.now() - daysAgo * 86400000) / 1000) };
}

describe('funding freshness gate', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('drops funding signals older than 5 days', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: any) => {
      const u = String(url);
      if (u.includes('hn.algolia.com')) {
        return { ok: true, json: async () => ({ hits: [hnHit('Rippling raises $500M in emergency funds after SVB fails', 900)] }) } as any;
      }
      return { ok: true, json: async () => ({ hits: { hits: [] }, articles: [] }) } as any;
    }));
    const out = await fundingSignalsForOrg('Rippling');
    expect(out.length).toBe(0); // the 2023 SVB story is filtered out
  });

  it('keeps funding signals from the last 5 days', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: any) => {
      const u = String(url);
      if (u.includes('hn.algolia.com')) {
        return { ok: true, json: async () => ({ hits: [hnHit('Rippling raised $100M Series F', 2)] }) } as any;
      }
      return { ok: true, json: async () => ({ hits: { hits: [] }, articles: [] }) } as any;
    }));
    const out = await fundingSignalsForOrg('Rippling');
    expect(out.length).toBe(1);
  });
});
