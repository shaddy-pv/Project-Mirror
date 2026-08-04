# Enginow — Platform Monorepo

A full-stack monorepo for the Enginow engineering education platform, covering the public website, REST API, and internal staff portal.

---

## Repository Structure

```
enginow/
├── apps/
│   ├── web/             Next.js 16 — public website (courses, blogs, careers, shop)
│   ├── api/             Express.js — shared REST API for all apps
│   └── panels/
│       ├── admin/       TanStack Start — Unified Staff Portal (Admin, HR, Sales, Educator)
│       ├── educator/    (Deprecated) Merged into admin
│       ├── hr/          (Deprecated) Merged into admin
│       └── sales/       (Deprecated) Merged into admin
├── docs/
│   ├── architecture.md  System design & tech decisions
│   ├── development.md   Local dev setup & commands
│   └── spec/            Original product specification PDF
├── package.json         Root workspace manifest + scripts
├── render.yaml          Render.com deployment config (backend)
└── vercel.json          Vercel deployment config (frontend)
```

---

## Quick Start

```bash
# Install all workspace dependencies
npm install

# Start everything at once (web, api, and staff portal)
npm run dev

# -- OR --

# Start individually:
npm run dev:api     # Start API server (port 5000)
npm run dev:web     # Start public website (port 3000)
npm run dev:admin   # Start Staff Portal (port 8080)
```

> See **[docs/development.md](docs/development.md)** for environment variable setup and full onboarding guide.

---

## Tech Stack

| App | Framework | Port |
|-----|-----------|------|
| `apps/web/` | Next.js 16, React 19, Tailwind v4 | 3000 |
| `apps/api/` | Express.js, TypeScript, MongoDB | 5000 |
| `apps/panels/admin/` | TanStack Start, Radix UI, Tailwind | 8080 |

---

## Key Features

- **Unified Staff Portal** — Role-based access (Admin, HR, Sales, Educator) in a single panel.
- **Content Approval Workflow** — `draft → pending_approval → live` state machine for courses, trainings, blogs.
- **Role-Based Access Control** — Staff logins via JWT and database `user_roles` collection.
- **PDF Generation** — PDFKit-powered certificates, Letters of Recommendation, and offer letters.
- **Certificate Verification** — Public endpoint to verify issued credential IDs.
- **Referral System** — Unique referral codes, discount tracking, usage limits.
- **Shop** — Razorpay-integrated product catalogue and orders.
- **Internship Pipeline** — HR-managed stages (Applied → Shortlisted → OA → Selected).

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/architecture.md](docs/architecture.md) | System design, DB schema, auth flow |
| [docs/development.md](docs/development.md) | Local setup, ports, environment variables |
| [docs/audit.md](docs/audit.md) | Gap analysis against the original spec |
| [docs/spec/](docs/spec/) | Original product specification |

---

## Branch Strategy

```
main        ← stable, production-ready (no direct commits)
develop     ← integration branch
feature/*   ← branch from develop, PR back into develop
```

**Merge flow:** `feature/*` → Pull Request → Review → `develop` → Testing → `main`

---

## Deployment

| Target | Platform | Config file |
|--------|---------|-------------|
| `apps/api/` | Render | `render.yaml` |
| `apps/web/` | Vercel | `vercel.json` |
