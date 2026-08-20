import handler from './api/bootstrap';

const req: any = { method: 'GET', headers: {}, query: {} };
const res: any = {
  status: (code: number) => { console.log('status', code); return res; },
  json: (b: any) => { console.log(JSON.stringify(b)); },
};

handler(req, res)
  .then(() => console.log('done'))
  .catch((e: any) => console.error('THROW:', e));
