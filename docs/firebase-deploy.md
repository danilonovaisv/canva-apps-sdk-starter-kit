# Firebase Deploy

## Production targets

- Main domain: `portfoliodanilo.com`
- Public backend: `https://api.portfoliodanilo.com`
- Firebase project: `canva-app-5f36c`
- Frontend Hosting site: `canva-app-5f36c`
- API Hosting site: `portfoliodanilo-api`
- Canva App ID: `AAHAAFcfxkA`
- Canva App Origin: `https://app-aahaafcfxka.canva-apps.com`
- Frontend bundle: `dist/app.js`
- Cloud Function: `api`

## Environment files

Use `.env.local` for regular local development:

```env
CANVA_APP_ID=AAHAAFcfxkA
CANVA_APP_ORIGIN=https://app-aahaafcfxka.canva-apps.com
CANVA_FRONTEND_PORT=8080
CANVA_BACKEND_PORT=3001
CANVA_BACKEND_HOST=http://localhost:3001
CANVA_HMR_ENABLED=true
CANVA_CLIENT_ID=OC-AZ6R49q7qIie
CANVA_CLIENT_SECRET=
```

Use `.env.production` for Firebase production builds:

```env
CANVA_APP_ID=AAHAAFcfxkA
CANVA_APP_ORIGIN=https://app-aahaafcfxka.canva-apps.com
CANVA_FRONTEND_PORT=8080
CANVA_BACKEND_PORT=3001
CANVA_BACKEND_HOST=https://api.portfoliodanilo.com
CANVA_HMR_ENABLED=false
CANVA_CLIENT_ID=OC-AZ6R49q7qIie
CANVA_CLIENT_SECRET=
```

Do not store `CANVA_CLIENT_SECRET` in `.env`, `.env.local`, or
`.env.production`. The backend reads it from Firebase Secret Manager.

Apply the production environment before a production build:

```bash
npm run env:production
```

Return to local development:

```bash
npm run env:local
```

## Firebase Hosting and Functions

`firebase.json` uses two Hosting targets:

- `frontend` publishes the Canva frontend bundle from `dist`.
- `api` publishes an empty `public-api` directory and rewrites every request to
  the `api` Cloud Function.

Do not add `public-api/index.html` for production. Firebase Hosting serves
static files before rewrites, so an `index.html` in `public-api` makes `/`
return HTML instead of the Function JSON response.

Production routes:

- `https://api.portfoliodanilo.com/`
- `https://api.portfoliodanilo.com/health`
- `https://api.portfoliodanilo.com/api/health`
- `https://api.portfoliodanilo.com/api/oauth/start`
- `https://api.portfoliodanilo.com/api/oauth/callback`
- `https://api.portfoliodanilo.com/api/exports/pptx`
- `https://api.portfoliodanilo.com/api/exports/:jobId`
- `https://api.portfoliodanilo.com/api/oauth/revoke`

Fallback validation before the custom domain is mapped:

```bash
curl -i https://portfoliodanilo-api.web.app/
curl -i https://portfoliodanilo-api.web.app/health
curl -i https://portfoliodanilo-api.web.app/api/health
```

## CORS policy

The Cloud Function accepts browser CORS requests from:

```txt
https://app-aahaafcfxka.canva-apps.com
https://canva-app-5f36c.web.app
```

Keep this list narrow. Do not allow `*` in production. Local origins are only
enabled when the runtime parameter `ENABLE_LOCAL_ORIGINS` is set to `true`.

## Canva Connect API secrets and params

Set the rotated Canva client secret in Firebase Secret Manager:

```bash
firebase functions:secrets:set CANVA_CLIENT_SECRET --project canva-app-5f36c
```

Set or confirm runtime params during deploy:

```txt
CANVA_CLIENT_ID=OC-AZ6R49q7qIie
CANVA_REDIRECT_URI=https://api.portfoliodanilo.com/api/oauth/callback
CANVA_APP_ORIGIN=https://app-aahaafcfxka.canva-apps.com
PUBLIC_FRONTEND_ORIGIN=https://canva-app-5f36c.web.app
ENABLE_LOCAL_ORIGINS=false
```

The same redirect URI must be configured in the Canva Developer Portal for the
Connect API integration.

## DNS

In Firebase Hosting, attach `api.portfoliodanilo.com` to the API Hosting site:

```txt
Project: canva-app-5f36c
Site: portfoliodanilo-api
Custom domain: api.portfoliodanilo.com
```

Current diagnostic command:

```bash
dig +short api.portfoliodanilo.com CNAME
```

Expected after the domain is moved:

```txt
portfoliodanilo-api.web.app.
```

If it returns `canva-app-5f36c.web.app.`, the subdomain is still mapped to the
frontend site and API routes will return frontend HTML.

In the DNS provider for `portfoliodanilo.com`, connect domains to their matching
Firebase Hosting sites:

- `canva-app-5f36c.web.app` or the frontend custom domain for the Canva app.
- `api.portfoliodanilo.com` for `portfoliodanilo-api`.

Use the DNS records shown by Firebase Hosting when adding each custom domain.
Do not guess the A, AAAA, or TXT records; Firebase provides verification and
certificate-provisioning records per domain.

Firebase CLI `15.18.0` does not expose `hosting:domains:list`; use the Firebase
Console for custom-domain attachment and certificate status.

## Deploy commands

Full production deploy:

```bash
npm run deploy:firebase
```

API only:

```bash
npm run deploy:api
```

Frontend only:

```bash
npm run deploy:frontend
```

Functions only:

```bash
npm run deploy:functions
```

Manual equivalent:

```bash
npm run env:production
npm run security:secrets
npm run build
npm --prefix functions run lint
npm --prefix functions run build
npm --prefix functions test
firebase deploy --only functions,hosting --project canva-app-5f36c
```

## Verification

After deploy, verify:

```bash
curl -I https://portfoliodanilo.com/app.js
curl -i https://portfoliodanilo-api.web.app/health
curl -I https://api.portfoliodanilo.com/health
curl -i \
  -H "Origin: https://app-aahaafcfxka.canva-apps.com" \
  https://api.portfoliodanilo.com/health
curl -i \
  -H "Origin: https://invalid.example" \
  https://api.portfoliodanilo.com/health
```

Expected results:

- `app.js` returns `200`.
- `/health` returns `200`.
- API routes return `content-type: application/json`.
- Canva origin receives `Access-Control-Allow-Origin`.
- Invalid origin does not receive `Access-Control-Allow-Origin`.

## Canva Developer Portal

For production, set the app source to the hosted production bundle if using a
URL-based app source:

```txt
https://portfoliodanilo.com/app.js
```

The backend base URL in the production bundle is:

```txt
https://api.portfoliodanilo.com
```

For local development, use:

```txt
http://localhost:8080
```

For Safari HTTPS testing, use:

```txt
https://localhost:8080
```

and set `CANVA_BACKEND_HOST=https://localhost:3001`.

## Rollback

Use Firebase Hosting release rollback for frontend issues:

```bash
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION TARGET_SITE_ID
```

For Functions issues, redeploy the last known good commit:

```bash
npm run deploy:functions
```

## Operational notes

- Do not use `localhost` in `.env.production`.
- Do not enable HMR in production.
- Do not expose secrets in frontend `.env` files; Canva app IDs and origins are
  public identifiers, not secrets.
- Keep `CANVA_CLIENT_SECRET` only in Firebase Secret Manager and rotate it if it
  ever appears in files, logs, or chat output.
- Keep API routes under `/api/*` unless there is a clear reason to expose a
  top-level route like `/health`.
