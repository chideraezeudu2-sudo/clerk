import { scoutForUser } from './api/_engine.js';
scoutForUser('b84eebf8-2149-4c2d-8992-36e832c68219', 'd7a3f010-2ce3-4eca-bad1-1864393454bb')
  .then((r) => console.log('SCOUT:', JSON.stringify(r)))
  .catch((e) => { console.error('ERR', e?.message); process.exit(1); });
