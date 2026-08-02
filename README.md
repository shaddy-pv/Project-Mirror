# Enginow — Platform Monorepo

A full-stack monorepo for the Enginow engineering education platform, covering the public website, REST API, and four internal staff dashboards.

---

## Repository Structure

```
enginow/
├── apps/
│   ├── web/             Next.js 16 — public website (courses, blogs, careers, shop)
│   ├── api/             Express.js — shared REST API for all apps
│   └── panels/
│       ├── admin/       TanStack Start — Admin internal dashboard
│       ├── educator/    TanStack Start — Educator internal dashboard
│       ├── hr/          TanStack Start — HR internal dashboard
│       └── sales/       TanStack Start — Sales internal dashboard
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

# Start API server (port 5000)
npm run dev:api

# Start public website (port 3000)
npm run dev:web

# Start a specific panel
npm run dev:admin     # port 3001
npm run dev:educator  # port 3002
npm run dev:hr        # port 3003
npm run dev:sales     # port 3004
```

> See **[docs/development.md](docs/development.md)** for environment variable setup and full onboarding guide.

---

## Tech Stack

| App | Framework | Port |
|-----|-----------|------|
| `apps/web/` | Next.js 16, React 19, Tailwind v4 | 3000 |
| `apps/api/` | Express.js, TypeScript, MongoDB | 5000 |
| `apps/panels/admin/` | TanStack Start, Radix UI, Tailwind | 3001 |
| `apps/panels/educator/` | TanStack Start, Radix UI, Tailwind | 3002 |
| `apps/panels/hr/` | TanStack Start, Radix UI, Tailwind | 3003 |
| `apps/panels/sales/` | TanStack Start, Radix UI, Tailwind | 3004 |

---

## Key Features

- **Content Approval Workflow** — `draft → pending_approval → live` state machine for courses, trainings, blogs
- **Role-Based Access Control** — Firebase Auth + MongoDB `user_roles` collection
- **PDF Generation** — PDFKit-powered certificates, Letters of Recommendation, and offer letters
- **Certificate Verification** — Public endpoint to verify issued credential IDs
- **Referral System** — Unique referral codes, discount tracking, usage limits
- **Shop** — Razorpay-integrated product catalogue and orders
- **Internship Pipeline** — HR-managed stages (Applied → Shortlisted → OA → Selected)

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
