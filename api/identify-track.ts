import https from 'https';
import { PassThrough } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const passThrough = new PassThrough();

  const options = {
    hostname: 'api.audd.io',
    port: 443,
    path: '/',
    method: 'POST',
    headers: {
      ...req.headers,
      host: 'api.audd.io',
    },
  };

  const auddReq = https.request(options, (auddRes) => {
    res.writeHead(auddRes.statusCode || 500, auddRes.headers);
    auddRes.pipe(res);
  });

  auddReq.on('error', (error) => {
    console.error('Error calling AudD API:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while processing your request' });
  });

  passThrough.write(
    `api_token=${process.env.AUDD_API_KEY}&return=spotify,apple_music&`
  );
  req.pipe(passThrough).pipe(auddReq);
}
