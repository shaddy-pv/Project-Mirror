# Architecture Overview

## System Map

```
                 ┌──────────────────────────────┐
                 │  Public Internet              │
                 └────────┬─────────────────────┘
                          │
               ┌──────────▼──────────┐
               │   frontend/          │  Next.js 16
               │   Public Website     │  SSR + Static
               │   (Port 3000)        │
               └──────────┬──────────┘
                          │  REST API calls
               ┌──────────▼──────────┐
               │   backend/           │  Express.js
               │   API Server         │  Node 20
               │   (Port 5000)        │
               └──┬───────┬────┬─────┘
                  │       │    │
            MongoDB  Firebase  Redis
            Atlas    Admin     (cache)
                  │
        ┌─────────┼─────────────┐
        │         │             │
   admin/    educator/     hr/ + sales/
   TanStack  TanStack      TanStack
   Panel     Panel         Panels
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Public website | Next.js 16 + React 19 | App router, SSR |
| Internal panels | TanStack Start + React 19 | SSR via Nitro |
| API server | Express.js + TypeScript | Compiled with tsc |
| Database | MongoDB (Atlas) | Collections listed below |
| Auth | Firebase Admin SDK | JWT verification via Bearer token |
| Caching | Redis (optional) | In-memory fallback if unavailable |
| Payments | Razorpay | Course enrollment checkout |
| PDF generation | PDFKit | Certificates, LORs, offer letters |

---

## Database Collections

| Collection | Purpose |
|-----------|---------|
| `profiles` | Learner profiles, referral codes |
| `user_roles` | Role grants per Firebase UID |
| `courses` | Course documents (status state machine) |
| `trainings` | Training documents |
| `course_enrollments` | Learner enrollment records |
| `referrals` | Referral usage tracking |
| `blogs` | Blog posts (status state machine) |
| `careers` | Job listings |
| `career_applications` | Job applications |
| `internships` | Internship listings |
| `internship_applications` | Internship applications + certificates |
| `assessments` | Role-specific assessments |
| `inquiries` | Contact form submissions |
| `products` | Shop products |
| `shop_orders` | Shop order records |

---

## Status State Machines

All content goes through a gated approval workflow:

```
Courses / Trainings:
  draft → pending_approval → live → archived
                         ↘ rejected (with reason)

Blogs:
  draft → pending_approval → published → archived
                          ↘ rejected

Careers / Internships:
  draft → pending_approval → open → closed / expired
```

**Rules:**
- `educator` and `hr` can create content, but it lands in `pending_approval`
- Only `admin` can approve (move to `live` / `published` / `open`)
- `admin` creating content bypasses approval and goes straight to `live`

---

## Authentication Flow

```
Browser → Firebase Auth (login) → Firebase ID Token
        → Panel/Web App
        → API request with Authorization: Bearer <token>
        → backend verifyIdToken()
        → look up user_roles collection
        → enforce role-based route guards
```

**Dev-only bypass:** Panels send `x-mock-role: <role>` header. The backend accepts this only when `NODE_ENV !== "production"`, auto-inserts the mock role into `user_roles`, and proceeds — no Firebase login required locally.

---

## Deployment

| App | Platform | Config |
|-----|---------|--------|
| `backend/` | Render | `render.yaml` |
| `frontend/` | Vercel | `vercel.json` |
| Internal panels | Self-hosted / Render | Not yet configured |
