# Enginow — Sales Panel

Internal dashboard for the **Sales** role. View enrollment analytics, referral performance, and manage sales inquiries.

## Development

```bash
npm run dev:sales   # from monorepo root
```

Runs on **port 3004**. Requires the backend API on port 5000.

## Key Routes

| Route | Description |
|-------|-------------|
| / | Analytics dashboard (enrollments, trends, referrers) |
| /inquiries | Contact inbox (Sales category) |
| /settings | Profile & notification settings |

## Auth

In development, sends x-mock-role: sales to the API.
