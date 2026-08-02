# Enginow Codebase Implementation Audit

This report is based on a direct inspection of the codebase at `E:\Project\Working\Engi-main\Project`. Every finding is based on actual backend logic, route definitions, and frontend API wiring—not just folder names or UI mockups.

## 1. Summary of Findings

| Requirement | Status | Evidence Checked | What's Missing / Notes |
| :--- | :--- | :--- | :--- |
| **Roles & Access Control** | ⚠️ Partial | `admin/src/mocks/api.ts`, `backend/src/routes/admin.ts` | The backend correctly enforces `requireAdmin` on API routes. However, the `admin`, `educator`, `hr`, and `sales` TanStack Start dashboard apps are **completely disconnected from the backend**. They currently run entirely on in-memory mock data (`mocks/api.ts`). |
| **Referral Code System** | ⚠️ Partial | `backend/src/collections.ts`, `frontend` | Code generates 7 chars `0-9a-z` on user creation. **Missing:** Uniqueness check (uses simple `Math.random` without DB collision retry). No auto-attachment logic found on share actions in frontend. |
| **Courses & Educator Flow** | ❌ Not Done | `backend/src/routes/courses.ts`, `admin/src/mocks/api.ts` | The dashboard UI for Educator course creation exists, but because it relies on `mocks/api.ts`, there is no real backend flow where a course goes into "Pending approval" state for an Admin to publish. The only real backend route is `POST /api/admin/courses` which allows direct creation. |
| **Blogs** | ❌ Not Done | `backend/src/server.ts`, `backend/src/routes` | There are **zero backend routes** for blogs. The blogs feature exists purely as UI mockups in the dashboard apps. |
| **Careers & Internships** | ⚠️ Partial | `backend/src/routes/admin.ts`, `hr/src/mocks` | Internship seasons (Summer/Winter/etc.) have real backend logic: `calculateTimeline()` in `admin.ts` correctly computes `openFrom` and `openUntil` dynamically based on the season. Expiry is computed on the fly on GET requests. **Missing:** One-app-per-user logic could not be verified on a public route. HR UI is still using mock data for state transitions. |
| **Assessments** | ❌ Not Done | `backend/src/routes`, `hr/src/routes` | No backend API routes exist for Assessments. The HR dashboard UI is not wired to real logic. |
| **Document Generation** | ❌ Not Done | `backend/src/routes/admin.ts`, Global text search | **No PDF generation library** (`pdfkit`, `puppeteer`, etc.) exists in the repo. The endpoint `POST /internship-applications/:id/certificate` simply accepts a base64 string (`customDocumentBase64`) from the client; it does not generate the document automatically from user data. |
| **Verify Page** | ⚠️ Partial | `frontend/src/app/verify`, `backend/src/routes/admin.ts` | The backend generates a `certificateId` (`ENG-YYYY-XXXX`) and a `verifyUrl` string. The frontend page exists, but it depends on the manually uploaded base64 certificates rather than auto-generated ones. |
| **Shop** | ✅ Done | `backend/src/routes/shop.ts`, `collections.ts` | Backend supports products CRUD, orders, Razorpay integration, referral discounts, tracking IDs, and custom diary fields (`quotes`, `coverImageUrl`). |
| **Sales Analytics** | ❌ Not Done | `sales/src/mocks/api.ts` | The analytics displayed on the Sales dashboard are static/mocked in `getDashboard()`. |
| **Contact Form** | ❌ Not Done | `frontend/src/app/` | No `/contact` page exists in the frontend. No backend route for inquiries. |
| **Public Pages (About, Services, Resources, etc.)** | ❌ Not Done | `frontend/src/app/` | Verified missing: `about`, `services`, `contact`, `blogs`, `resources`, `practice`, `assessment`. |
| **Policy & Legal Pages** | ❌ Not Done | `frontend/src/app/` | Verified missing: brand-guidelines, privacy-policy, terms-and-conditions, refund-policy, cookie-policy, shipping-policy. |

---

## 2. Critical Gaps (Blockers for an End-to-End Demo)

1. **The Dashboards are Mocked**: The most severe issue is that the `admin`, `educator`, `hr`, and `sales` apps do not communicate with the Express backend. They rely on `mocks/api.ts` and `mocks/seed.ts`. An end-to-end flow (e.g., Educator creates course -> Admin approves it -> Learner enrolls) is currently impossible because they don't share the database.
2. **Document Generation**: The system does not automatically generate Offer Letters, LORs, or Certificates as PDFs. It merely accepts a manual base64 upload. This completely violates the automation requirement.
3. **No Blogs API**: The blogs functionality is entirely missing from the backend.

---

## 3. Quick Wins (Close to Done)

*   **Referral Uniqueness**: Update `generateReferralCode` in `backend/src/collections.ts` to retry if a collision occurs in the DB, or enforce a unique index on the MongoDB collection and handle the error.
*   **Verification Route Check**: The `certificateId` logic is implemented in the DB. The frontend verification page just needs to properly fetch and validate it against the `certificates` collection.

---

## 4. Suggested Build Order

To get the platform to a truly functional state, development should proceed in these phases:

### Phase 1: Wire the Dashboards to Reality (High Priority)
*   Remove `mocks/api.ts` in the TanStack Start apps (`admin`, `educator`, `hr`, `sales`).
*   Implement `fetch` wrappers that attach the Firebase auth token to backend requests.
*   Update backend routes in `admin.ts` (or split them out into `educator.ts`, `hr.ts`) to handle the specific permissions (e.g., Educator creating a course as "pending").

### Phase 2: Missing Backend Infrastructure
*   Implement PDF generation (e.g., using `pdfkit` or `puppeteer`) in `admin.ts` for certificates and offer letters. It must pull `fullName` and `internship` details from the DB and draw them onto a template.
*   Create `blogs.ts` backend routes with approval flows.
*   Create an `inquiries.ts` route for the contact form.

### Phase 3: Frontend Fulfillment
*   Build the missing public pages (`about`, `services`, `contact`, `blogs`, `resources`, `practice`).
*   Build all static legal/policy pages.
*   Implement the frontend share functionality to auto-attach the user's `referralCode` to the URL.
