# Enginow — Staff Portal (Admin Panel)

Unified internal dashboard for **all staff roles** (Admin, HR, Educator, Sales). The panel dynamically filters the sidebar and visible content based on the logged-in user's role.

## Development

```bash
# From the monorepo root, run all services
npm run dev

# Or to run just this panel
npm run dev:admin
```

Runs on **port 8080** by default. Requires the backend API running on port 5000.

## Key Routes

| Route | Description | Roles |
|-------|-------------|-------|
| `/login` | Universal staff login | All |
| `/` | Dashboard overview | All |
| `/approvals` | Pending course & blog approvals | Admin |
| `/courses` | Course & training management | Admin, Educator |
| `/internships` | Internship postings & applications | Admin, HR |
| `/careers` | Job postings & applications | Admin, HR |
| `/shop` | Store management | Admin, Sales |
| `/blogs` | Blog management | All |
| `/users` | User accounts & referral codes | Admin |
| `/settings` | Profile & platform settings | All |

## Auth

The panel uses JWT authentication via the `/api/staff/login` endpoint. Once logged in, the `user_role` (admin, hr, educator, sales) determines what parts of the panel are accessible via the `RoleGuard` component.
