// POST /api/login — validate credentials and issue a signed session cookie.
// Credentials come from env vars (LOGIN_EMAIL / LOGIN_PASSWORD) with defaults below.

const SESSION_SECRET = process.env.SESSION_SECRET || 'cidms-portal-secret-2026';
const COOKIE_NAME = 'portal_session';
const VALID_EMAIL = process.env.LOGIN_EMAIL || 'bhavesh@techvisitsystems.in';
const VALID_PASSWORD = process.env.LOGIN_PASSWORD || 'Mumbai#99';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid request' });
  }

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

async function sign(payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return base64url(new Uint8Array(sig));
}

function base64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}