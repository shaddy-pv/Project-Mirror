# Enginow

A modern learning platform for engineers — premium courses, training, internships, and career pathways.

## Tech Stack

- **Framework**: TanStack Start (React SSR)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth & DB**: Supabase
- **Animations**: Motion (Framer Motion)

## Development

Requires Node.js 18+ and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
