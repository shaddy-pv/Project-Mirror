# **<u>Project 2 | Enginow</u>** 

## **Project Structure**
- `frontend/`: Contains the TanStack Start (React, Tailwind v4, Shadcn) web application.
- `backend/`: Contains the Express.js standalone backend (Node.js, MongoDB, Redis, Firebase Admin).

## **Tech Stack**
- **Frontend:** TanStack Start, React 19, Tailwind CSS v4, Radix UI (shadcn)
- **Backend:** Node.js, Express, MongoDB, Redis, Razorpay, Firebase Admin

## **Setup Commands**
1. **Clone the repository & pull latest develop branch:**
   ```bash
   git clone <repo-url>
   git checkout develop
   ```
2. **Environment Variables:**
   - In both `frontend/` and `backend/`, copy the example environments:
   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```
   *(Never commit the `.env` file!)*
3. **Install Dependencies:**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
4. **Run the Development Servers:**
   - Frontend: `npm run dev` (in `frontend/`)
   - Backend: `npm run dev` (in `backend/`)

## **Branch Strategy & Merge Rule**
We follow a strict branching model:
- `main`: **Only for stable, production-ready code.** No direct commits!
- `develop`: The main integration branch.
- **Developer Branches:** Create your own branch from `develop` for features.
  - Examples: `feature/public-platform`, `feature/learning-platform`, `feature/recruitment-platform`

**Merge Flow:**
`Developer Branch` → `Pull Request (PR)` → `Review & Approval` → `develop` → `Testing` → `main`

## **Team Responsibilities**
- **Developer 1 (Public Website & Core):** Auth, Global UI, Homepage, Legal Pages, Newsletters, Contact API.
- **Developer 2 (Learning Platform LMS):** Courses, Trainings, Resources, Blogs, Learner/Educator Dashboards.
- **Developer 3 (Recruitment & Commerce):** Careers, Shop, Assessments, Document Generation, HR/Admin Dashboards.

---

## **Project Requirements (Original Brief)**

Enginow website redesign, so basically don't focus on current brand templates or pages, you need to start from scratch. 

So basically the website will be having a main website for public visibility, all can see and access. It will be having 5 roles ( Learner(Student) ,Educator, HR,Sales, Admin) so in main website student login will be there for others access a dedicated dashboards will be there for admin and educator, admin,sales and educators will be having dashboard from where they can perform all the defined tasks, 

Now public pages in website will be Homepage, about , training, courses, services, contact, blogs, resources 

, careers, practice, assessment, Shop 

other pages will be brand-guideliness, privacy-policy, terms-and-conditions, refund-policy, cookie-policy, shipping -policy. 

Summer-internship, monsoon internship, spring internship, winter internship 

All the learners will be having the dedicated dashboard where they can track the applications for the job/internship they have applied for, courses they are enrolled in, see the certificates. 

It will be also having a verify page with the same url enginow.in/verify/[credentials] Though this certificates verification can be there. 

In admin side dashboard all the CRUD operation can be performed, all the users will be visible, website will be having referral code things, like every user will be having a referral code 

It will be a 7 digits unique code combination of 0-9 and a-z both, automatically attached if user is sharing something like from career section, courses, training program , blogs etc. 

Admin will have 

- ⁃ Users list with their referral codes, with all the details. 

- ⁃ Can Create jobs, internship in career section. 

- ⁃ Can write blogs and all CRUD Operations 

- ⁃ Can upload courses and all CRUD operations 

- ⁃ Can see all the applications, enrolments 

- ⁃ Can see the history in which they have applied (internships, jobs), enorlmetns 

- ⁃ **Can generate offer letters, certificates, LOR, LOE and other documents** 

- Educator will have 

- ⁃ The power to add courses, edit course and delete, after adding it will be sent to approval from admin, then it will be live. 

- ⁃ Can see enrolled users in particular course, total unique users 

- ⁃ 

Human Resource will have 

- ⁃ The power to add listings, edit listing, updated, delete listings, to add It will be sent to admin approval. 

- ⁃ Can see the applications 

Sales Person will have 

- See the analytics like courses more enrolled, which year students are enrolled etc… 

## **Home Page** 

In home page, users can see the details like popular courses, featured courses, popular programs programs, testimonials 

## **Courses** 

In courses, user can see the listed courses 

- Free 

- Premium 

Some badges 

- New 

- Popular 

Category will be there like AI, Development Search filters for this and free, premium 

Inside each card of course details of that will be seen, like roadmap etc. They will see the few buttons according to the course like Enrol Now, Coming Soon. 

If enrolled then whenever user visits the course he/she will see enrolled button and visit course 

In dashboard they can see it also 

so 3 slugs or pages main page, description, after enrolling actual course page. 

While listing the course, it requires title, description , banner image 1920*1080, in that Youtube video link, notes of that option of adding more videos link and notes of that. 

## **Services** 

We are providing different services like Website Development, App Development , Custom Software Solutions, Consulting, Etc so Individuals, Companies , Startups can contact us. 

## **Trainings** 

List our training programs, like courses 

## **Shop** 

In this list our products like Diaries, T-shirts, Pen, Stickers, Cup, Key Chains 

A customisation page from where diaries can be customised and previewed, and saved. 

## **Careers** 

Listed applications will be having two categories 

- Jobs 

- Internships 

Users can apply in any job/internship only once and whenever they visit that job/ internship they will see that they have already applied. 

Once the job/internship is closed by the admin. Hr then it will be showing a badge expired and no body can apply now. 

They will also be able to see in their dashboard 

Along with the process 

Hr can choose them as shortlisted, OA , Selected 

And user will be able to see in their dashboards about the status. 

## **Resources** 

Here from admin side basically Admin , Educator can add pdfs as resources 

## **Blogs** 

In this there will be blogs listed, and the people can see the blogs, written by, time created, time updated. Like , share and save 

From other roles, every role can submit the blogs it requires a title, short excerpt, Banner ( 1920 * 1080 ) Optional , content ( Rich text editor supporting links, bold , italic, code, quotes) 

Blogs will be submitted from dashboard and will be sent for approval to admin, so all the roles can post blog but needs approval from Admin. 

## **About** 

Here, list the goals of company, about company, technologies, what we are doing when it started (timeline), tech stacks, how we are unique. 

## **Contact** 

In this page list the contact form, with a category dropdown like sales, career , custom, they can fill that form and submitted. 

List all the social platforms Links, office address 

## **Practice** 

Users can attend various test, practice some questions related to subjects 

## **Assessment** 

In this various time monitered assessment in full screen properly protocored will be there, Assessment data will be shared with HR, Admin it will be used only for hiring purpose we will share it to particular emails, like those who have applied and are to be avaible for shortlisted in their account they will be able see that assessment. 

Admin can add assessments, HR can also add the assessments 

## **Privacy Policy** 

List the privacy related. Content, that their content, data all is protected 

## **Terms & Condition** 

List the terms and conditions 

## **Refund Policy** 

List the refund that currently no refund is available at any feature, its totally non refundable 

## **Cookie Policy** 

We collect cookies to make your experience better 

## **Shipping Policy** 

We have shipping partner Delhivery and all the physical products are shipped through Delhivery so once shipped from our end, we dont have liability of that, for any issue contact Delhivery 

## **Brand Guidelines** 

List the downloadable format logos, colours how to use etc. 

## **Summer Internship** 

We have a summer internship program for various durations for which users can apply during the designated time, and if shortlisted they will get all the benefits of that. 

1,2,3, 6 Months. 

Create a showcase page 

Starting from May first week 

## **Monsoon Internship** 

We have a summer internship program for various durations for which users can apply during the designated time, and if shortlisted they will get all the benefits of that. 

1,2,3, 6 Months. 

Create a showcase page 

Starting from July first week 

## **Spring Internship** 

We have a summer internship program for various durations for which users can apply during the designated time, and if shortlisted they will get all the benefits of that. 

1,2,3, 6 Months. 

Create a showcase page 

Starting from February first week 

## **Winter Internship** 

We have a summer internship program for various durations for which users can apply during the designated time, and if shortlisted they will get all the benefits of that. 

1,2,3, 6 Months. 

Create a showcase page 

Starting from December first week 

## **Summer/Monsoon/Winter/Spring Internship Apply Page** 

Create a single page for all the applications of these above, and it will be open at specific duration that is provided applications will start from 2 months before. So Admin, HR can open the applications whenever they want and all the domains will be visible. 

