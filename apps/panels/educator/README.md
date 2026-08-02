# Enginow — Educator Panel

Internal dashboard for the **Educator** role. Create and manage courses, training programs, and blog posts.

## Development

```bash
npm run dev:educator   # from monorepo root
```

Runs on **port 3002**. Requires the backend API on port 5000.

## Key Routes

| Route | Description |
|-------|-------------|
| / | Dashboard overview |
| /courses | Course & training management |
| /blogs | Blog posts |
| /resources | Resource uploads |
| /settings | Profile & notification settings |

## Auth

In development, sends x-mock-role: educator to the API.
