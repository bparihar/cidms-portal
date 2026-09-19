// GET /api/portal — serves the portal HTML only to authenticated users.
// index.html is bundled into this function via vercel.json "includeFiles".

import { readFileSync } from 'fs';
import { join } from 'path';
import { verifyToken, getToken } from '../lib/auth.js';

export default async function handler(req, res) {
  const token = getToken(req);
  if (!token || !(await verifyToken(token))) {
    res.status(307).setHeader('Location', '/login');
    return res.end();
  }

  let html;
  try {
    html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  } catch {
    try {
      html = readFileSync(join(__dirname, 'index.html'), 'utf8');
    } catch {
      res.status(500).json({ error: 'Portal file missing' });
      return;
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(html);
}