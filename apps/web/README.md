# Enginow — Public Website

This is the public-facing Next.js 16 frontend for the Enginow engineering education platform. 

It contains the main marketing pages, course catalogs, career/internship listings, shop, blog, and the authenticated Learner Dashboard.

## Development

```bash
# From the monorepo root
npm run dev:web

# Or from this directory
npm run dev
```

The website will start on [http://localhost:3000](http://localhost:3000).

## Architecture

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 & Radix UI Primitives
- **State/Data:** Zustand, TanStack Query
- **Authentication:** JWT tokens stored in cookies/localStorage, authenticated against the shared Express API.

## Key Directories

- `/src/app` — Next.js App Router pages (Home, Courses, Shop, Blogs, etc.)
- `/src/components` — Reusable React components and UI sections.
- `/src/lib` — Utilities, types, and API wrapper functions.
- `/src/store` — Zustand state stores (e.g., auth store).

## Deployment

This app is configured to be deployed on Vercel. See the `vercel.json` file in the monorepo root for routing configurations.
