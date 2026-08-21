import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./_lib.ts', () => ({
  getAdmin: vi.fn(),
  groqChat: vi.fn().mockResolvedValue('{}'),
}));

import { pickContactForSignal } from './_engine.ts';
import { groqChat } from './_lib.ts';

const groqMock = vi.mocked(groqChat);

describe('pickContactForSignal', () => {
  beforeEach(() => {
    groqMock.mockReset();
    // mockReset wipes the module-level default; re-establish so a test that
    // forgets to set an implementation doesn't silently return undefined.
    groqMock.mockResolvedValue('{}');
  });

  it('targets the current manager of the function for a hiring signal, never the open role', async () => {
    groqMock.mockResolvedValue(JSON.stringify({ role: 'VP of Sales' }));

    const c = await pickContactForSignal(
      'hiring',
      'Sales Ops Manager — Remote',
      'Acme Outbound'
    );

    expect(c.role).toBe('VP of Sales');
    expect(c.name).toBe('VP of Sales');

    const [msg] = groqMock.mock.calls[0][0] as any[];
    expect(msg.content).toContain('hiring:');
    expect(msg.content).toContain('Never the open role itself');
  });

  it('targets the founder/CEO for a funding signal (different logic than hiring)', async () => {
    groqMock.mockResolvedValue(JSON.stringify({ role: 'Founder / CEO' }));

    const c = await pickContactForSignal('funding', 'Form D filing: Beta Data', 'Beta Data');

    expect(c.role).toBe('Founder / CEO');

    const [msg] = groqMock.mock.calls[0][0] as any[];
    expect(msg.content).toContain('funding:');
    expect(msg.content).toContain('founder or CEO');
  });

  it('falls back to Hiring Manager when the model returns nothing usable', async () => {
    groqMock.mockResolvedValue('not json');
    const c = await pickContactForSignal('hiring', 'Backend Engineer — NYC', 'Gamma');
    expect(c.role).toBe('Hiring Manager');
  });

  it('falls back when the LLM call throws', async () => {
    groqMock.mockRejectedValue(new Error('groq down'));
    const c = await pickContactForSignal('tech_changes', 'Migrating to Postgres', 'Delta');
    expect(c.role).toBe('Hiring Manager');
  });
});
