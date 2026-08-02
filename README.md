# VectrazAI

An AI / chips / GPUs / semiconductors news portal.

All 7 build phases are complete — see `DEPLOYMENT.md` for taking this from
local dev to production.

## Architecture

```
vectrazai/
├── frontend/              → Next.js 15 + TypeScript (App Router)
├── services/
│   ├── auth-service/      → Express + TS microservice #1 (signup/login/OTP/JWT)
│   └── main-service/      → Express + TS microservice #2 (news/categories/subs/admin)
└── packages/
    └── db/                → Shared Prisma schema + client, used by BOTH services
```

**One Postgres database, shared schema, two microservices.** Both
`auth-service` and `main-service` import `@vectrazai/db` so there is a
single source of truth for the data model — no schema drift between
services.

**Single origin for the browser.** The frontend never calls
`http://localhost:5001` or `:5002` directly. Instead `next.config.ts`
defines `rewrites()`, which is the Next.js equivalent of a Vite dev
proxy:

- `GET /api/auth/*` (browser) → forwarded to `auth-service`
- `GET /api/*` (browser) → forwarded to `main-service`

This keeps everything same-origin (no CORS exposure to the client) and
means the frontend code just does `fetch("/api/news")` regardless of
which microservice actually serves it.

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Docker (for local Postgres) — or your own Postgres instance

## Setup

```bash
# 1. Install everything (root + all workspaces) in one shot
npm install

# 2. Copy env files
cp services/auth-service/.env.example services/auth-service/.env
cp services/main-service/.env.example services/main-service/.env
cp frontend/.env.example frontend/.env
cp packages/db/.env.example packages/db/.env   # (added when Phase 2 lands)

# 3. Start local Postgres
npm run docker:db:up

# 4. Generate Prisma client + push schema
npm run db:generate
npm run db:push

# 5. (optional) seed some placeholder data
npm run db:seed

# 6. Run everything together (frontend :3000, auth :5001, main :5002)
npm run dev
```

Then visit **http://localhost:3000** — you should see a status page
confirming both microservices are reachable through the proxy.

Run services individually if you prefer:

```bash
npm run dev:auth
npm run dev:main
npm run dev:web
```

## Roadmap (phased build)

- [x] **Phase 1** — Monorepo scaffold, configs, `.env.example`s, health checks
- [x] **Phase 2** — Full Prisma schema (User, Company, NewsArticle, Category,
      Subscription, Notification, ArticleReport, AuditLog, RefreshToken,
      OtpCode, NewsSourceLog, view/click tracking) + seed data
- [x] **Phase 3** — auth-service: signup/login/logout, JWT access+refresh
      (rotated + revocable, stored hashed), OTP via SendGrid with console
      fallback, zod validation, bcrypt, per-route rate limiting, Cloudinary
      avatar uploads (graceful 503 when not configured), profile management
- [x] **Phase 4** — main-service: multi-source news aggregation (9 free
      sources: NewsAPI, GNews, NewsData.io, Mediastack, The Guardian,
      Hacker News, arXiv, Reddit, curated RSS feeds), manual keyword AI-topic
      filter with optional OpenAI-assisted filter (silent fallback), auto
      category tagging, scheduled + manual refresh, categories, user
      preferences, dummy subscriptions, notifications, article reports,
      full admin data API (users/block-unblock, analytics with date-range
      overview + timeseries + category breakdown, source health, article
      moderation, report review)
- [x] **Phase 5** — Public frontend: 4-theme system (Light/Dark/Aurora/Graphite,
      persisted, flash-free), full navbar (dropdowns, admin-restricted
      SweetAlert2 warning, search, notification bell, theme picker), big
      collapsible footer + back-to-top, custom floating action button, home
      page (hero/trending/category filters), article detail (view+click
      tracking, report), trending, category, search, dashboard (personalized
      feed), profile (avatar/preferences/password), subscription (demo plan
      switch), notifications, full auth flow (login/signup/OTP verify/forgot+
      reset password), SEO (metadata, robots.txt, dynamic sitemap.xml)
- [x] **Phase 6** — Admin panel: synced collapsible sidebar (mixed direct
      links + nested dropdown groups) + admin navbar (avatar dropdown,
      notification bell, search, one-click news refresh) via shared
      SidebarContext, admin-specific FAB, dashboard with date-range picker
      (today/week/month/year/custom) + stat cards + line/bar charts
      (recharts), user management (search, block/unblock with reason
      prompt), article moderation (approve/reject, status filter), report
      review queue, news source health monitoring
- [x] **Phase 7** — Polish, deployment guide (see `DEPLOYMENT.md`), final zip

## Notes on specific requirements

- **No AI key required for the site to work.** News-topic filtering
  defaults to a large manual keyword/phrase matcher. If `OPENAI_API_KEY`
  is present in `main-service`'s env, it's used to sharpen filtering —
  otherwise the fallback runs silently. Users never see an error either way.
- **SendGrid subscription lapsed?** No problem — if `SENDGRID_API_KEY` is
  empty, OTP codes and email content are printed to the auth-service
  console instead of sent, so development isn't blocked.
- **Dummy production URL** is set in `frontend/.env.example` under
  `NEXT_PUBLIC_SITE_URL` — swap it for your real domain after first deploy;
  it feeds `sitemap.xml`, `robots.txt`, and Open Graph tags (Phase 5).
