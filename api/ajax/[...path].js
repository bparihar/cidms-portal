// Vercel serverless proxy for pidkey.com APIs
// Routes: /ajax/* -> https://pidkey.com/ajax/*
// Supports GET (query params) and POST (JSON body) methods.
// Requires a valid session cookie (see lib/auth.js).

import { verifyToken, getToken } from '../../lib/auth.js';

export default async function handler(req, res) {
  // Require login
  const token = getToken(req);
  if (!token || !(await verifyToken(token))) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Extract the API path segments after /ajax/
  // Try route param first (from vercel.json rewrite), then parse from URL
  let segments = req.query.path;
  let apiPath = Array.isArray(segments) ? segments.join('/') : (segments || '');

  if (!apiPath) {
    // Fallback: parse from req.url pathname (e.g. /api/ajax/cidms_api or /ajax/cidms_api)
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const m = url.pathname.match(/^\/(?:api\/)?ajax\/(.+)$/);
    if (m) apiPath = m[1];
  }

  if (!apiPath) {
    res.status(400).json({ error: 'Missing API path', url: req.url, query: req.query });
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