// Local E2E harness: serves /api via the same handlers Vercel uses + static dist.
// Usage: node local-server.mjs  (after `npm run build`)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const handlers = {
  bootstrap: (await import('./api/bootstrap.ts')).default,
  campaigns: (await import('./api/campaigns.ts')).default,
  leads: (await import('./api/leads.ts')).default,
  drafts: (await import('./api/drafts.ts')).default,
  'drafts-generate': (await import('./api/drafts-generate.ts')).default,
  send: (await import('./api/send.ts')).default,
  senders: (await import('./api/senders.ts')).default,
  'senders-test': (await import('./api/senders-test.ts')).default,
  personas: (await import('./api/personas.ts')).default,
  settings: (await import('./api/settings.ts')).default,
  chat: (await import('./api/chat.ts')).default,
  onboarding: (await import('./api/onboarding.ts')).default,
};

app.all('/api/:name', async (req, res) => {
  const handler = handlers[req.params.name];
  if (!handler) return res.status(404).json({ error: 'Not found' });
  try {
    await handler(req, res);
  } catch (e) {
    console.error(`[/api/${req.params.name}]`, e);
    res.status(500).json({ error: e.message || 'Internal error' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.use((_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`local-server listening on :${port}`));
