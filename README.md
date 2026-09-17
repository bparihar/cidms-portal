# CIDMS Portal

A web portal for the pidkey.com APIs: CIDMS (Confirmation ID lookup), PIDMS (product key checking), REDEEMMS (key redemption), and Office 365 account checking.

## Features

- **CIDMS** — Get Confirmation ID via Installation ID, check IID status, detect IID from image (Professional account required for image features)
- **PIDMS** — Check product keys, get product descriptions
- **REDEEMMS** — Redeem product keys
- **Office 365** — Check Microsoft account status

## Deployment

### Vercel (production)

The repo is Vercel-ready:

- `index.html` — the portal UI
- `api/ajax/[...path].js` — serverless proxy that forwards `/ajax/*` requests to `https://pidkey.com/ajax/*`

Deploy with the Vercel CLI:

```bash
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard (Framework: Other, no build step).

### Local development

```bash
node server.js
# Open http://localhost:8080
```

The local server serves the portal and proxies `/ajax/*` to pidkey.com.

## Configuration

Click the **API Key** badge in the top-right corner of the portal to set your pidkey.com API key. It is stored in the browser's localStorage.

The **Base URL** setting can be left empty — the portal uses the built-in proxy (`/ajax`). To call pidkey.com directly from the browser, set it to `https://pidkey.com/ajax` (requires the API to allow CORS).

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ajax/cidms_api` | GET | Get Confirmation ID via IID (`justforcheck=1` for status only) |
| `/ajax/cidms_via_image_base64_string_api` | POST | Detect IID from image + get CID (Professional) |
| `/ajax/detecting_iid_from_image` | POST | Detect IID from image only (Professional) |
| `/ajax/pidms_api` | GET | Check product keys (`justgetdescription=1` for description only) |
| `/ajax/redeemms_api` | GET | Redeem product keys |
| `/ajax/office365_api` | GET | Check Office 365 accounts |

## Notes

- Image detection endpoints require a **Professional** pidkey.com account.
- Vercel serverless functions have a ~4.5 MB request body limit; the portal caps image uploads at 3 MB.