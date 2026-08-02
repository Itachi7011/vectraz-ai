# Deploying VectrazAI

This assumes you're moving from local dev (Neon Postgres + `npm run dev`)
to real hosting. VectrazAI has three deployable pieces:

1. `frontend` — Next.js app
2. `services/auth-service` — Express microservice
3. `services/main-service` — Express microservice (+ background cron job)

They share one Postgres database via `packages/db`.

## 1. Database

You're likely already on Neon from local dev — that's a fine choice for
production too. Just make sure:

- You use the **direct** (non-pooled) connection string for running
  `prisma migrate deploy` during deploys.
- The app services can use either the pooled or direct string, but if
  you use the pooled one, append `?pgbouncer=true&connection_limit=1`.
- Run `npx prisma migrate deploy` (not `db push`) in production — `db
  push` is a dev-only convenience that doesn't create migration history.
  You'll want to convert your current schema into a proper first
  migration before your first production deploy:
  ```bash
  cd packages/db
  npx prisma migrate dev --name init   # generates prisma/migrations/, run locally once
  ```
  Then in production: `npx prisma migrate deploy`.

## 2. Backend services (auth-service, main-service)

Both are plain Express + TypeScript apps with a `build`/`start` script
already defined. Any Node host works: Railway, Render, Fly.io, a VPS
with PM2, etc.

For each service:
```bash
npm run build -w services/auth-service
npm run start -w services/auth-service
```
(same pattern for `main-service`).

Set real environment variables (see each service's `.env.example`) —
in particular:
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (auth-service) — long,
  random, and **must match** `JWT_ACCESS_SECRET` in main-service.
- `FRONTEND_ORIGIN` — your real deployed frontend URL, not localhost.
- `SENDGRID_API_KEY` — once you repurchase the plan, add it here and
  the console-fallback OTP delivery automatically switches to real email.
- `CLOUDINARY_*` — same idea for avatar uploads.
- News API keys — add as many as you have; every source without a key
  is simply skipped by the aggregator, so you can add them incrementally.
- `OPENAI_API_KEY` — optional; enables AI-assisted topic filtering with
  automatic fallback to the keyword matcher on any failure.

main-service also runs a `node-cron` job in-process (`NEWS_FETCH_CRON`,
default every 30 min). If you deploy to a platform that spins down
idle instances (serverless-style), consider moving this to a proper
scheduled job/cron trigger instead of relying on the long-running
process — the `/api/admin/news/refresh` endpoint can be called by an
external scheduler (e.g. a GitHub Action, Railway cron, or a simple
`curl` in crontab) if you go that route.

## 3. Frontend (Next.js)

Vercel is the path of least resistance for Next.js, but any Node host
works too (`npm run build && npm run start`).

Environment variables to set on the host:
- `AUTH_SERVICE_URL` / `MAIN_SERVICE_URL` — the real deployed URLs of
  your two backend services (server-side only, used by `next.config.ts`
  rewrites — never exposed to the browser).
- `NEXT_PUBLIC_SITE_URL` — your real domain. This feeds `sitemap.xml`,
  `robots.txt`, and Open Graph tags. **Update this from the current
  dummy value before going live.**

## 4. CORS / cookies checklist

- `FRONTEND_ORIGIN` on both backend services must exactly match your
  deployed frontend's origin (scheme + host, no trailing slash).
- Cookies are set with `secure: true` automatically once
  `NODE_ENV=production` — this requires HTTPS, which any real host
  provides by default.
- If frontend and backend end up on different top-level domains, you'll
  need `sameSite: "none"` instead of `"lax"` in
  `services/auth-service/src/utils/cookies.ts` — but keeping everything
  behind the same origin (as the Next.js rewrite already does for the
  browser) avoids this entirely, which is why that pattern was used.

## 5. Post-deploy checklist

- [ ] Run `prisma migrate deploy` against production DB
- [ ] Seed an admin user for production (don't reuse the dev seed
      password — create a fresh admin via a one-off script or SQL)
- [ ] Swap `NEXT_PUBLIC_SITE_URL` to your real domain
- [ ] Add real news API keys as you acquire them
- [ ] Add `SENDGRID_API_KEY` / `CLOUDINARY_*` once purchased
- [ ] Verify `/api/auth/health` and `/api/health` respond through the
      deployed frontend's rewrite paths, not just directly on the
      backend hosts
- [ ] Trigger one manual `/api/admin/news/refresh` and check
      `/admin/sources` for source health before announcing launch
