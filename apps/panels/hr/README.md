# Enginow — HR Panel

Internal dashboard for the **HR** role. Manages job/internship listings, applicant pipeline, assessments, and inquiry inbox.

## Development

```bash
npm run dev:hr   # from monorepo root
```

Runs on **port 3003**. Requires the backend API on port 5000.

## Key Routes

| Route | Description |
|-------|-------------|
| / | Dashboard overview |
| /listings | Job & internship listings |
| /applicants | Applicant pipeline |
| /assessments | Assessment management |
| /inquiries | Contact inbox (HR category) |
| /blogs | Blog management |

## Auth

In development, sends x-mock-role: hr to the API.
