// Edge middleware — protects the whole portal behind a login.
// Public paths: /login, /api/login, /api/logout, favicon.webp, logo.png
// Everything else requires a valid signed session cookie.

const SESSION_SECRET = process.env.SESSION_SECRET || 'cidms-portal-secret-2026';
const COOKIE_NAME = 'portal_session';

const PUBLIC_PATHS = ['/login', '/api/login', '/api/logout', '/favicon.webp', '/logo.png'];

export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = token && (await verifyToken(token));

  if (isPublic) {
    // Already signed in? Skip the login page and go straight to the portal.
    if (pathname === '/login' && valid) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (valid) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return NextResponse.redirect(url);
}

async function verifyToken(token) {
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

export const config = {
  matcher: ['/(.*)'],
};