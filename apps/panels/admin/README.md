# Enginow — Admin Panel

Internal dashboard for the **Admin** role. Manages course/blog approvals, user accounts, referral leaderboards, and site-wide settings.

## Development

```bash
# From the monorepo root
npm run dev:admin

# Or directly
cd admin && npm run dev
```

Runs on **port 3001** by default. Requires the backend API running on port 5000.

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard overview |
| `/approvals` | Pending course & blog approvals |
| `/courses` | Course & training management |
| `/blogs` | Blog management |
| `/users` | User accounts & referral codes |
| `/settings` | Platform settings |

## Auth

In development, the panel sends `x-mock-role: admin` to the API — no Firebase login required. In production, swap `src/lib/role.tsx` to use a real Firebase session.
