import { describe, it, expect } from 'vitest';
import { draftGuard, isCompleteDraft, EMAIL_BODY_RULES } from '../api/_lib.js';

describe('isCompleteDraft', () => {
  it('rejects a draft with a blank subject', () => {
    expect(isCompleteDraft({ subject: '  ', body: 'Hello there' })).toBe(false);
  });
  it('rejects a draft with a blank body', () => {
    expect(isCompleteDraft({ subject: 'Quick note', body: '' })).toBe(false);
  });
  it('rejects a draft with neither', () => {
    expect(isCompleteDraft({})).toBe(false);
  });
  it('accepts a draft with both subject and body', () => {
    expect(isCompleteDraft({ subject: 'Quick note', body: 'Hey Josh...' })).toBe(true);
  });
});

describe('draftGuard', () => {
  it('blocks a lead with a missing email', () => {
    const r = draftGuard({ email: '', company: 'Acme', signal_type: 'funding' }, []);
    expect(r.ok).toBe(false);
    if (r.ok === false) expect(r.rejectAs).toBe('no_contact');
  });

  it('blocks a lead with a missing company', () => {
    const r = draftGuard({ email: 'a@b.com', company: '', signal_type: 'funding' }, []);
    expect(r.ok).toBe(false);
    if (r.ok === false) expect(r.rejectAs).toBe('no_contact');
  });

  it('blocks a duplicate: same company + signal type already has an active draft', () => {
    const existing = [{ leads: { company: 'Acme', signal_type: 'funding' } }];
    const r = draftGuard({ email: 'x@acme.com', company: 'Acme', signal_type: 'funding' }, existing);
    expect(r.ok).toBe(false);
    if (r.ok === false) expect(r.rejectAs).toBe('duplicate');
  });

  it('allows the same company with a DIFFERENT signal type (not a duplicate)', () => {
    const existing = [{ leads: { company: 'Acme', signal_type: 'funding' } }];
    const r = draftGuard({ email: 'x@acme.com', company: 'Acme', signal_type: 'hiring' }, existing);
    expect(r.ok).toBe(true);
  });

  it('allows a clean lead with no existing drafts', () => {
    const r = draftGuard({ email: 'x@acme.com', company: 'Acme', signal_type: 'funding' }, []);
    expect(r.ok).toBe(true);
  });
});

describe('EMAIL_BODY_RULES', () => {
  it('bans source metadata from the email body', () => {
    expect(EMAIL_BODY_RULES).toMatch(/never quote source metadata/i);
    expect(EMAIL_BODY_RULES).toContain('Hacker News');
    expect(EMAIL_BODY_RULES).toContain('point counts');
  });
});
