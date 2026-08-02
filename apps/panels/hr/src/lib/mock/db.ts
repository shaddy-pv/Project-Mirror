// Mock database for the Enginow HR panel. In-memory, seeded with realistic data.

export type ListingKind = "Job" | "Internship";
export type ListingStatus = "Pending" | "Open" | "Closed" | "Expired";
export type Stage = "Applied" | "Shortlisted" | "OA" | "Selected";
export type BlogStatus = "Draft" | "Pending" | "Published" | "Rejected";
export type InquiryStatus = "New" | "Responded" | "Closed";
export type SeasonName = "Summer" | "Monsoon" | "Spring" | "Winter";

export const STAGES: Stage[] = ["Applied", "Shortlisted", "OA", "Selected"];

export const DOMAINS = [
  "Frontend Engineering",
  "Backend Engineering",
  "Data Science",
  "Design",
  "Content & Marketing",
  "Operations",
];

export interface Listing {
  id: string;
  title: string;
  kind: ListingKind;
  domain: string;
  location: string;
  employmentType: string;
  description: string;
  status: ListingStatus;
  closeDate: string;
  createdAt: string;
  rejectionReason?: string;
}

export interface StageEvent {
  stage: Stage;
  at: string;
  by: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  listingId: string;
  season?: SeasonName;
  appliedAt: string;
  stage: Stage;
  resumeUrl: string;
  answers: { question: string; answer: string }[];
  history: StageEvent[];
}

export interface Assessment {
  id: string;
  title: string;
  domain: string;
  listingId: string;
  durationMins: number;
  status: "Draft" | "Live" | "Closed";
  createdAt: string;
  questions: { prompt: string; options: string[]; answerIndex: number }[];
  results: {
    applicantId: string;
    name: string;
    score: number;
    flags: string[];
    hrCanSee: boolean;
  }[];
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  bannerUrl?: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  category: "Career" | "Custom";
  message: string;
  createdAt: string;
  status: InquiryStatus;
}

export interface Season {
  name: SeasonName;
  startsText: string;
  applicationsOpen: boolean;
  domains: string[];
  durationOptions: string[];
  showcaseNote: string;
}

export interface HrProfile {
  name: string;
  email: string;
  notifyNewApplicant: boolean;
  notifyApproval: boolean;
  notifyInquiry: boolean;
}

const day = 86_400_000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();

export const listings: Listing[] = [
  {
    id: "L-1001",
    title: "Frontend Engineer (React)",
    kind: "Job",
    domain: "Frontend Engineering",
    location: "Bengaluru · Hybrid",
    employmentType: "Full-time",
    description:
      "Build and maintain the Enginow learner web app. You'll own features end to end alongside design and backend.",
    status: "Open",
    closeDate: iso(18),
    createdAt: iso(-6),
  },
  {
    id: "L-1002",
    title: "Backend Engineer (Node.js)",
    kind: "Job",
    domain: "Backend Engineering",
    location: "Remote (India)",
    employmentType: "Full-time",
    description: "Design APIs and data models for our courses and assessment platform.",
    status: "Open",
    closeDate: iso(24),
    createdAt: iso(-11),
  },
  {
    id: "L-1003",
    title: "Content Writer — Engineering Blogs",
    kind: "Job",
    domain: "Content & Marketing",
    location: "Remote (India)",
    employmentType: "Part-time",
    description: "Write explainer articles on core engineering subjects for undergraduate students.",
    status: "Pending",
    closeDate: iso(30),
    createdAt: iso(-2),
  },
  {
    id: "L-1004",
    title: "Product Design Intern",
    kind: "Internship",
    domain: "Design",
    location: "Bengaluru · On-site",
    employmentType: "Internship · 3 months",
    description: "Work on learner-facing flows: onboarding, course pages and the mobile experience.",
    status: "Open",
    closeDate: iso(9),
    createdAt: iso(-14),
  },
  {
    id: "L-1005",
    title: "Data Science Intern (Summer)",
    kind: "Internship",
    domain: "Data Science",
    location: "Remote (India)",
    employmentType: "Internship · 2 months",
    description: "Analyse learning outcomes and build dashboards for the academics team.",
    status: "Open",
    closeDate: iso(4),
    createdAt: iso(-20),
  },
  {
    id: "L-1006",
    title: "Operations Associate",
    kind: "Job",
    domain: "Operations",
    location: "Bengaluru · On-site",
    employmentType: "Full-time",
    description: "Coordinate batches, educator schedules and learner support escalations.",
    status: "Closed",
    closeDate: iso(-3),
    createdAt: iso(-40),
  },
  {
    id: "L-1007",
    title: "Backend Intern (Monsoon)",
    kind: "Internship",
    domain: "Backend Engineering",
    location: "Remote (India)",
    employmentType: "Internship · 6 months",
    description: "Ship internal tooling and background jobs with mentorship from senior engineers.",
    status: "Expired",
    closeDate: iso(-8),
    createdAt: iso(-55),
  },
  {
    id: "L-1008",
    title: "Marketing Intern (Winter)",
    kind: "Internship",
    domain: "Content & Marketing",
    location: "Remote (India)",
    employmentType: "Internship · 1 month",
    description: "Run campus campaigns and social content for the winter internship season.",
    status: "Open",
    closeDate: iso(35),
    createdAt: iso(-4),
  },
  {
    id: "L-1009",
    title: "Frontend Intern (Spring)",
    kind: "Internship",
    domain: "Frontend Engineering",
    location: "Remote (India)",
    employmentType: "Internship · 3 months",
    description: "Pair with the web team on component work and accessibility fixes.",
    status: "Pending",
    closeDate: iso(28),
    createdAt: iso(-1),
  },
  {
    id: "L-1010",
    title: "Senior Data Scientist",
    kind: "Job",
    domain: "Data Science",
    location: "Bengaluru · Hybrid",
    employmentType: "Full-time",
    description: "Lead our learning-analytics roadmap and mentor two junior analysts.",
    status: "Closed",
    closeDate: iso(-15),
    createdAt: iso(-60),
  },
];

const FIRST = [
  "Aarav",
  "Diya",
  "Kabir",
  "Ishita",
  "Rohan",
  "Meera",
  "Vivaan",
  "Ananya",
  "Arjun",
  "Sara",
  "Nikhil",
  "Tanvi",
  "Aditya",
  "Riya",
  "Kunal",
  "Pooja",
  "Dev",
  "Neha",
  "Yash",
  "Sneha",
];
const LAST = [
  "Sharma",
  "Iyer",
  "Verma",
  "Nair",
  "Patel",
  "Reddy",
  "Bose",
  "Kulkarni",
  "Gupta",
  "Menon",
];

const applicantListings = listings.filter((l) => l.status !== "Pending");
const seasonForIndex: SeasonName[] = ["Summer", "Monsoon", "Spring", "Winter"];

export const applicants: Applicant[] = Array.from({ length: 36 }, (_, i) => {
  const first = FIRST[i % FIRST.length]!;
  const last = LAST[(i * 3) % LAST.length]!;
  const listing = applicantListings[i % applicantListings.length]!;
  const stage = STAGES[i % 4 === 3 ? (i % 8 === 7 ? 3 : 2) : i % 3]!;
  const appliedAt = iso(-(2 + (i % 25)));
  const history: StageEvent[] = [{ stage: "Applied", at: appliedAt, by: "Applicant" }];
  const idx = STAGES.indexOf(stage);
  for (let s = 1; s <= idx; s++) {
    history.push({
      stage: STAGES[s]!,
      at: iso(-(1 + (i % 25) - s < 0 ? 0 : 1 + (i % 25) - s)),
      by: "Priya (HR)",
    });
  }
  return {
    id: `A-${2000 + i}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    phone: `+91 9${String(800000000 + i * 137911).slice(0, 9)}`,
    listingId: listing.id,
    ...(listing.kind === "Internship" ? { season: seasonForIndex[i % 4]! } : {}),
    appliedAt,
    stage,
    resumeUrl: `https://files.enginow.example/resumes/${first.toLowerCase()}-${last.toLowerCase()}.pdf`,
    answers: [
      {
        question: "Why do you want to work at Enginow?",
        answer:
          "I've used Enginow's videos through my second year and want to help more students learn the same way.",
      },
      {
        question: "Share a project you're proud of.",
        answer: `A ${listing.domain.toLowerCase()} project I built for my college fest, used by around 400 students.`,
      },
      { question: "Earliest start date", answer: "Within 2 weeks of the offer." },
    ],
    history,
  };
});


export const assessments: Assessment[] = [
  {
    id: "AS-01",
    title: "Frontend Screening — React & JS",
    domain: "Frontend Engineering",
    listingId: "L-1001",
    durationMins: 60,
    status: "Live",
    createdAt: iso(-5),
    questions: [
      {
        prompt: "Which hook runs after every render by default?",
        options: ["useMemo", "useEffect", "useRef", "useId"],
        answerIndex: 1,
      },
      {
        prompt: "What does a key prop help React do?",
        options: ["Style lists", "Identify list items", "Sort arrays", "Cache fetches"],
        answerIndex: 1,
      },
    ],
    results: [
      { applicantId: "A-2001", name: "Diya Nair", score: 82, flags: [], hrCanSee: true },
      {
        applicantId: "A-2005",
        name: "Meera Reddy",
        score: 74,
        flags: ["Tab switched 3 times"],
        hrCanSee: false,
      },
      { applicantId: "A-2009", name: "Arjun Gupta", score: 91, flags: [], hrCanSee: true },
    ],
  },
  {
    id: "AS-02",
    title: "Backend Online Assessment",
    domain: "Backend Engineering",
    listingId: "L-1002",
    durationMins: 90,
    status: "Live",
    createdAt: iso(-9),
    questions: [
      {
        prompt: "Which HTTP status means 'created'?",
        options: ["200", "201", "204", "301"],
        answerIndex: 1,
      },
    ],
    results: [
      {
        applicantId: "A-2002",
        name: "Kabir Verma",
        score: 65,
        flags: ["Left full screen"],
        hrCanSee: false,
      },
      { applicantId: "A-2010", name: "Sara Menon", score: 88, flags: [], hrCanSee: true },
    ],
  },
  {
    id: "AS-03",
    title: "Design Intern Portfolio Task",
    domain: "Design",
    listingId: "L-1004",
    durationMins: 120,
    status: "Draft",
    createdAt: iso(-2),
    questions: [],
    results: [],
  },
  {
    id: "AS-04",
    title: "Data Science Aptitude",
    domain: "Data Science",
    listingId: "L-1005",
    durationMins: 45,
    status: "Closed",
    createdAt: iso(-18),
    questions: [
      {
        prompt: "Mean of 2, 4, 9?",
        options: ["4", "5", "6", "15"],
        answerIndex: 1,
      },
    ],
    results: [{ applicantId: "A-2013", name: "Riya Patel", score: 58, flags: [], hrCanSee: true }],
  },
];

export const blogs: Blog[] = [
  {
    id: "B-01",
    title: "What we look for in an Enginow intern",
    excerpt: "The three things that matter more than your CGPA when we read your application.",
    body: "<p>Every season we read a few thousand applications. Here is what actually stands out.</p><p><strong>1. Evidence you build things.</strong> A small project you can explain beats a long list of courses.</p>",
    status: "Published",
    createdAt: iso(-30),
    updatedAt: iso(-28),
  },
  {
    id: "B-02",
    title: "Hiring pipeline, explained for candidates",
    excerpt: "From Applied to Selected — what happens at each step and how long it takes.",
    body: "<p>We move applications through four steps: Applied, Shortlisted, Online Assessment and Selected.</p>",
    status: "Pending",
    createdAt: iso(-4),
    updatedAt: iso(-1),
  },
  {
    id: "B-03",
    title: "Summer internship season is open",
    excerpt: "Domains, duration options and how to apply for the May cohort.",
    body: "<p>Applications for the Summer season are open across four domains.</p>",
    status: "Draft",
    createdAt: iso(-2),
    updatedAt: iso(-2),
  },
  {
    id: "B-04",
    title: "5 resume mistakes we see every season",
    excerpt: "Fix these before you apply anywhere, not just with us.",
    body: "<p>Long objective statements, no links, and unexplained gaps top the list.</p>",
    status: "Rejected",
    createdAt: iso(-12),
    updatedAt: iso(-10),
    rejectionReason:
      "Please remove the screenshots of real candidate resumes — we can't publish applicant data.",
  },
  {
    id: "B-05",
    title: "Life as an Enginow operations associate",
    excerpt: "A week in the life, written with the ops team.",
    body: "<p>Mornings start with batch checks and educator schedules.</p>",
    status: "Published",
    createdAt: iso(-45),
    updatedAt: iso(-44),
  },
  {
    id: "B-06",
    title: "How we run online assessments fairly",
    excerpt: "Our integrity checks, and what they do not do.",
    body: "<p>We flag tab switching and full-screen exits, and a human reviews every flag.</p>",
    status: "Draft",
    createdAt: iso(-1),
    updatedAt: iso(-1),
  },
];

const INQUIRY_MESSAGES = [
  "I applied for the Frontend Engineer role two weeks ago and wanted to check on my application.",
  "Do you take second-year students for the Summer internship season?",
  "Is the Data Science internship stipend paid monthly?",
  "I couldn't upload my resume — the form kept failing. Can I email it instead?",
  "Are there any openings in content writing for someone with 3 years of experience?",
  "Can I reschedule my online assessment? I have university exams that week.",
  "I'd like to run a campus hiring drive at our college — who should I speak to?",
  "Do interns get a certificate at the end of the programme?",
  "I was rejected last season. Can I apply again this year?",
  "Is the Bengaluru role hybrid or fully on-site?",
  "Could you share the job description as a PDF for our placement cell?",
  "My email on the application had a typo — how do I correct it?",
  "Do you sponsor relocation for full-time roles?",
];

export const inquiries: Inquiry[] = INQUIRY_MESSAGES.map((message, i) => {
  const first = FIRST[(i * 5) % FIRST.length]!;
  const last = LAST[(i * 7) % LAST.length]!;
  return {
    id: `I-${300 + i}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}${i}@example.com`,
    category: i % 4 === 3 ? ("Custom" as const) : ("Career" as const),
    message,
    createdAt: iso(-(1 + i * 2)),
    status: (i % 5 === 0 ? "Responded" : i % 7 === 0 ? "Closed" : "New") as InquiryStatus,
  };
});


export const seasons: Season[] = [
  {
    name: "Summer",
    startsText: "Starts 1st week of May",
    applicationsOpen: true,
    domains: ["Frontend Engineering", "Data Science", "Design"],
    durationOptions: ["2 months", "3 months"],
    showcaseNote: "Showcase page highlights the 2025 summer cohort projects.",
  },
  {
    name: "Monsoon",
    startsText: "Starts 1st week of July",
    applicationsOpen: false,
    domains: ["Backend Engineering", "Operations"],
    durationOptions: ["3 months", "6 months"],
    showcaseNote: "Showcase page is being refreshed by Admin.",
  },
  {
    name: "Spring",
    startsText: "Starts 1st week of February",
    applicationsOpen: true,
    domains: ["Frontend Engineering", "Content & Marketing"],
    durationOptions: ["1 month", "2 months", "3 months"],
    showcaseNote: "Showcase page features spring cohort testimonials.",
  },
  {
    name: "Winter",
    startsText: "Starts 1st week of December",
    applicationsOpen: false,
    domains: ["Content & Marketing", "Design"],
    durationOptions: ["1 month", "2 months"],
    showcaseNote: "Showcase page carries the winter hackathon recap.",
  },
];

export const profile: HrProfile = {
  name: "Priya Raghavan",
  email: "priya.raghavan@enginow.in",
  notifyNewApplicant: true,
  notifyApproval: true,
  notifyInquiry: false,
};

export const db = {
  listings,
  applicants,
  assessments,
  blogs,
  inquiries,
  seasons,
  profile,
};
