// Vercel serverless proxy for pidkey.com APIs
// Routes: /ajax/* -> https://pidkey.com/ajax/*
// Supports GET (query params) and POST (JSON body) methods.

export default async function handler(req, res) {
  // Extract the API path segments after /ajax/
  const segments = req.query.path || [];
  const apiPath = Array.isArray(segments) ? segments.join('/') : segments;

  if (!apiPath) {
    res.status(400).json({ error: 'Missing API path' });
    return;
  }

  // Rebuild the original query string (e.g. ?iids=...&apikey=...)
  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const query = url.search;

  const target = `https://pidkey.com/ajax/${apiPath}${query}`;

  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    'User-Agent': 'CIDMS-Portal/1.0'
  };

  let body;
  if (req.method === 'POST' || req.method === 'PUT') {
    body = JSON.stringify(req.body || {});
  }

  try {
    const response = await fetch(target, {
      method: req.method,
      headers,
      body
    });

    const text = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(text);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error: ' + err.message });
  }
}