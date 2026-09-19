// POST /api/login — validate credentials and issue a signed session cookie.
// Credentials come from env vars (LOGIN_EMAIL / LOGIN_PASSWORD) with defaults below.

import { sign, base64url, COOKIE_NAME } from '../lib/auth.js';

const VALID_EMAIL = process.env.LOGIN_EMAIL || 'bhavesh@techvisitsystems.in';
const VALID_PASSWORD = process.env.LOGIN_PASSWORD || 'Mumbai#99';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Vercel Node functions auto-parse JSON bodies into req.body
  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (email !== VALID_EMAIL.toLowerCase() || password !== VALID_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Invalid email or password' });
  }

  const payload = base64url(new TextEncoder().encode(email));
  const token = payload + '.' + (await sign(payload));

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
  );
  return res.status(200).json({ ok: true });
}