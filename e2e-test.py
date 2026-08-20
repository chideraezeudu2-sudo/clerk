#!/usr/bin/env python3
"""Full E2E test of the Signal API against the local Supabase stack."""
import json
import urllib.request

API = 'http://127.0.0.1:4000/api'
SUPA = 'http://127.0.0.1:54321'
SVC = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
TOKEN = open('/tmp/token.txt').read().strip()


def req(url, method='GET', body=None, token=None, supa=False):
    headers = {'Content-Type': 'application/json'}
    if supa:
        headers['apikey'] = SVC
        headers['Authorization'] = f'Bearer {SVC}'
    elif token:
        headers['Authorization'] = f'Bearer {token}'
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            raw = resp.read()
            return resp.status, json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        raw = e.read()
        return e.code, (json.loads(raw) if raw.strip() else {})


passed, failed = 0, 0


def check(name, cond, detail=''):
    global passed, failed
    if cond:
        passed += 1
        print(f'  PASS  {name}')
    else:
        failed += 1
        print(f'  FAIL  {name}  {detail}')


# --- Onboarding (settings + persona, no mailbox yet) ---
s, r = req(f'{API}/onboarding', 'POST', {
    'mailingAddress': 'Signal Systems Inc., 548 Market St, Suite 8201, San Francisco, CA 94104',
    'personaName': 'Signal Outbound',
    'personaDescription': 'Signal-based outreach engine that monitors hiring surges.',
    'personaWebsite': 'https://signal.so',
    'targetAudience': 'VP Eng at Series A-B startups',
    'voiceSample': 'Direct, concise, under 90 words.',
    'voiceTone': 'casual',
}, token=TOKEN)
check('onboarding', s == 200, r)

# --- Bootstrap reflects onboarding ---
s, r = req(f'{API}/bootstrap', token=TOKEN)
check('bootstrap after onboarding', s == 200 and r['user']['onboarded'] is True and len(r['personas']) == 1, r)
persona_id = r['personas'][0]['id']

# --- Insert a sender directly (simulating a verified mailbox) with Ethereal SMTP ---
eth = urllib.request.urlopen(urllib.request.Request(
    'https://api.nodemailer.com/user',
    data=json.dumps({'requestor': 'nodemailer', 'version': '6.9.16'}).encode(),
    headers={'Content-Type': 'application/json'}, method='POST'))
ethereal = json.loads(eth.read())
user_id = req(f'{API}/bootstrap', token=TOKEN)[1]['user']['id']
s, r = req(f'{SUPA}/rest/v1/senders', 'POST', {
    'user_id': user_id,
    'email': ethereal['user'],
    'provider': 'custom',
    'smtp_host': 'smtp.ethereal.email',
    'smtp_port': 587,
    'smtp_user': ethereal['user'],
    'smtp_pass': ethereal['pass'],
    'status': 'active',
}, supa=True)
check('insert test sender', s in (200, 201), r)

# --- senders-test (real SMTP verify + test email through Ethereal) ---
s, r = req(f'{API}/bootstrap', token=TOKEN)
sender_id = r['senders'][0]['id']
s, r = req(f'{API}/senders-test', 'POST', {'senderId': sender_id}, token=TOKEN)
check('sender test email', s == 200, r)

# --- Campaign ---
s, r = req(f'{API}/campaigns', 'POST', {
    'name': 'Hiring Triggers Q3',
    'personaId': persona_id,
    'signalKeywords': ['Hiring VP Eng'],
    'voiceNotes': 'Peer-to-peer, under 90 words, cite the signal in line 1.',
}, token=TOKEN)
check('create campaign', s == 200 and r['campaign']['id'], r)
campaign_id = r['campaign']['id']

# --- Lead ---
s, r = req(f'{API}/leads', 'POST', {
    'campaignId': campaign_id,
    'name': 'Sarah Jenkins',
    'email': ethereal['user'],  # deliver to Ethereal so we can verify
    'company': 'Acme Cloud Inc.',
    'role': 'VP of Engineering',
    'signalType': 'hiring',
    'signalTitle': 'Hiring 3 Backend Engineers',
    'signalDetail': 'New Greenhouse postings show Acme Cloud hiring 3 backend engineers to migrate legacy mail pipelines this quarter.',
}, token=TOKEN)
check('add lead', s == 200 and r['lead']['id'], r)
lead_id = r['lead']['id']

# --- Generate drafts (real Groq call) ---
s, r = req(f'{API}/drafts-generate', 'POST', {'campaignId': campaign_id}, token=TOKEN)
check('generate drafts (Groq)', s == 200 and r['created'] == 1, r)
draft = r['drafts'][0]
print('     draft subject:', draft['subject'][:90])
print('     draft body head:', draft['body'][:120].replace(chr(10), ' | '))
assert 'unsubscribe' in draft['body'].lower(), 'missing compliance footer'
assert '548 Market St' in draft['body'], 'missing mailing address footer'

# --- Edit then approve+send the draft (real SMTP send via Ethereal) ---
s, r = req(f'{API}/drafts', 'PATCH', {'id': draft['id'], 'action': 'edit', 'subject': draft['subject']}, token=TOKEN)
check('edit draft', s == 200, r)
s, r = req(f'{API}/send', 'POST', {'draftId': draft['id']}, token=TOKEN)
check('approve + send draft (SMTP)', s == 200 and r['sent']['status'] == 'sent', r)
print('     sent to:', r['sent']['recipientEmail'], 'via', r['sent']['senderMailbox'])

# --- Chat (real Groq) ---
s, r = req(f'{API}/chat', 'POST', {'messages': [{'sender': 'user', 'text': 'How many drafts are pending and what campaigns do I have?'}]}, token=TOKEN)
check('assistant chat (Groq)', s == 200 and len(r['reply']) > 20, r)
print('     assistant:', r['reply'][:160].replace(chr(10), ' '))

# --- Settings ---
s, r = req(f'{API}/settings', 'PATCH', {'timezone': 'America/New_York'}, token=TOKEN)
check('settings update', s == 200, r)

# --- Final bootstrap sanity ---
s, r = req(f'{API}/bootstrap', token=TOKEN)
check('final bootstrap', s == 200 and len(r['sentEmails']) == 1 and len(r['campaigns']) == 1, r)
check('campaign sent count', r['campaigns'][0]['sentCount'] == 1, r['campaigns'][0]['sentCount'])
check('timezone persisted', r['settings']['timezone'] == 'America/New_York', r['settings']['timezone'])

# --- Auth enforcement ---
s, r = req(f'{API}/bootstrap')
check('unauth rejected', s == 401, s)

print(f'\n{passed} passed, {failed} failed')
