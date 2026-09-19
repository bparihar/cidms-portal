// Shared auth helpers for the portal's serverless functions.
// Session token format: base64url(email) + "." + HMAC-SHA256(payload, SESSION_SECRET)

const SESSION_SECRET = process.env.SESSION_SECRET || 'cidms-portal-secret-2026';
export const COOKIE_NAME = 'portal_session';

export async function sign(payload) {
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

export async function verifyToken(token) {
  try {
    const dot = token.indexOf('.');
    if (dot <= 0) return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = await sign(payload);
    return sig === expected;
  } catch {
    return false;
  }
}

export function getToken(req) {
  const header = req.headers.get ? req.headers.get('cookie') : req.headers['cookie'];
  if (!header) return null;
  for (const part of String(header).split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0 && part.slice(0, idx).trim() === COOKIE_NAME) {
      return part.slice(idx + 1).trim();
    }
  }
  return null;
}

export function base64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}