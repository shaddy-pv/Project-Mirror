# Development Guide

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 20 LTS |
| npm | 10+ |
| MongoDB | 6+ (local or Atlas URI) |
| Redis | 7+ (optional — used for caching) |

---

## First-time Setup

```bash
# 1. Clone and enter the repo
git clone <repo-url>
cd enginow

# 2. Copy environment files
cp apps/api/.env.example apps/api/.env   # fill in MongoDB URI, Firebase, Razorpay keys

# 3. Install all dependencies (all workspaces at once)
npm install
```

---

## Running Locally

Each app runs on its own port. Open separate terminal tabs.

| Command | App | Default Port |
|---------|-----|-------------|
| `npm run dev:api` | Express API (`apps/api/`) | 5000 |
| `npm run dev:web` | Next.js public site (`apps/web/`) | 3000 |
| `npm run dev:admin` | Admin panel (`apps/panels/admin/`) | 3001 |
| `npm run dev:educator` | Educator panel (`apps/panels/educator/`) | 3002 |
| `npm run dev:hr` | HR panel (`apps/panels/hr/`) | 3003 |
| `npm run dev:sales` | Sales panel (`apps/panels/sales/`) | 3004 |

> **Note:** Panels send `x-mock-role` headers to the API in development, bypassing Firebase Auth. This means you can test them without a real Firebase login.

---

## App Overview

```
enginow/
├── apps/web/    Next.js 16 — public-facing website (courses, blogs, careers, shop)
├── apps/api/     Express + MongoDB — shared REST API for all apps
├── admin/       TanStack Start — Admin role dashboard
├── educator/    TanStack Start — Educator role dashboard
├── hr/          TanStack Start — HR role dashboard
└── sales/       TanStack Start — Sales role dashboard
```

---

## Backend API

The API is mounted at `http://localhost:5000/api`. Key route groups:

| Prefix | Description |
|--------|-------------|
| `/api/admin/*` | Admin-only CRUD (courses, trainings, careers, users) |
| `/api/courses/*` | Public course listing and enrollment |
| `/api/blogs/*` | Blog CRUD with approval workflow |
| `/api/internships/*` | Internship listings and applications |
| `/api/careers/*` | Job listings and applications |
| `/api/assessments/*` | Shortlisted-applicant assessments |
| `/api/inquiries/*` | Contact form submissions |
| `/api/sales/dashboard` | Sales analytics aggregation |
| `/api/shop/*` | Products and orders |
| `/api/public/*` | Unauthenticated endpoints (certificate verify) |

---

## Branch Strategy

```
main        ← production-ready only, no direct commits
develop     ← integration branch
feature/*   ← branch from develop, PR back to develop
```

**Merge flow:** `feature/*` → PR → review → `develop` → testing → `main`

---

## Environment Variables (backend)

See `apps/api/.env.example` for the full list. Required keys:

- `MONGODB_URI` — MongoDB connection string
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — Firebase Admin SDK
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — Payment gateway
- `REDIS_URL` — Optional, for API response caching
