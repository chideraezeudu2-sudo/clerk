import { describe, it, expect, vi } from 'vitest';
import { effectiveDailyCap } from './send.ts';

function senderDaysAgo(days: number, dailyCap = 150) {
  return {
    daily_cap: dailyCap,
    created_at: new Date(Date.now() - days * 86400000).toISOString(),
  };
}

describe('effectiveDailyCap (warmup ramp)', () => {
  it('starts at 5/day on day 0-3', () => {
    expect(effectiveDailyCap(senderDaysAgo(0))).toBe(5);
    expect(effectiveDailyCap(senderDaysAgo(2))).toBe(5);
  });

  it('ramps to 10/day on days 4-7', () => {
    expect(effectiveDailyCap(senderDaysAgo(5))).toBe(10);
  });

  it('ramps to 20/day on days 8-14', () => {
    expect(effectiveDailyCap(senderDaysAgo(10))).toBe(20);
  });

  it('ramps to 40/day after day 15', () => {
    expect(effectiveDailyCap(senderDaysAgo(30))).toBe(40);
  });

  it('never exceeds the provider hard cap', () => {
    // A 2-month-old mailbox still caps at the provider limit.
    expect(effectiveDailyCap(senderDaysAgo(60, 30))).toBe(30);
  });

  it('returns hard cap when created_at is missing (legacy rows)', () => {
    expect(effectiveDailyCap({ daily_cap: 150 })).toBe(150);
  });
});
