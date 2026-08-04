import type {
  Applicant,
  Assessment,
  Blog,
  HrProfile,
  Inquiry,
  InquiryStatus,
  Listing,
  Season,
  SeasonName,
  Stage,
} from "./mock/db";
import { db } from "./mock/db";

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const qk = {
  listings: ["hr", "listings"] as const,
  listing: (id: string) => ["hr", "listing", id] as const,
  applicants: (filter?: { listingId?: string; season?: SeasonName }) =>
    ["hr", "applicants", filter] as const,
  blogs: ["hr", "blogs"] as const,
  blog: (id: string) => ["hr", "blog", id] as const,
  seasons: ["hr", "seasons"] as const,
  assessments: ["hr", "assessments"] as const,
  assessmentsFor: (listingId: string) => ["hr", "assessments", listingId] as const,
  assessment: (id: string) => ["hr", "assessment", id] as const,
  inquiries: ["hr", "inquiries"] as const,
  profile: ["hr", "profile"] as const,
};

export const api = {
  async listings(): Promise<Listing[]> {
    await delay();
    return [...db.listings];
  },

  async listing(id: string): Promise<Listing | undefined> {
    await delay();
    return db.listings.find((l) => l.id === id);
  },

  async createListing(input: Omit<Listing, "id" | "createdAt" | "status">): Promise<Listing> {
    await delay();
    const newListing: Listing = {
      ...input,
      id: `L-${1000 + db.listings.length + 1}`,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    db.listings.unshift(newListing);
    return newListing;
  },

  async updateListing(id: string, patch: Partial<Listing>): Promise<Listing> {
    await delay();
    const idx = db.listings.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Listing not found");
    db.listings[idx] = { ...db.listings[idx]!, ...patch };
    return db.listings[idx]!;
  },

  async closeListing(id: string): Promise<Listing> {
    return this.updateListing(id, { status: "Closed" });
  },

  async reopenListing(id: string): Promise<Listing> {
    return this.updateListing(id, { status: "Open" });
  },

  async removeListing(id: string): Promise<void> {
    await delay();
    const idx = db.listings.findIndex((l) => l.id === id);
    if (idx !== -1) db.listings.splice(idx, 1);
  },

  async applicants(filter?: { listingId?: string; season?: SeasonName }): Promise<Applicant[]> {
    await delay();
    let res = [...db.applicants];
    if (filter?.listingId) {
      res = res.filter((a) => a.listingId === filter.listingId);
    }
    if (filter?.season) {
      res = res.filter((a) => a.season === filter.season);
    }
    return res;
  },

  async moveApplicant(id: string, stage: Stage): Promise<Applicant> {
    await delay();
    const app = db.applicants.find((a) => a.id === id);
    if (!app) throw new Error("Applicant not found");
    app.stage = stage;
    app.history.push({
      stage,
      at: new Date().toISOString(),
      by: "HR Staff",
    });
    return app;
  },

  async blogs(): Promise<Blog[]> {
    await delay();
    return [...db.blogs];
  },

  async blog(id: string): Promise<Blog | undefined> {
    await delay();
    return db.blogs.find((b) => b.id === id);
  },

  async createBlog(input: Omit<Blog, "id" | "createdAt" | "updatedAt" | "status">): Promise<Blog> {
    await delay();
    const newBlog: Blog = {
      ...input,
      id: `B-0${db.blogs.length + 1}`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.blogs.unshift(newBlog);
    return newBlog;
  },

  async updateBlog(id: string, patch: Partial<Blog>): Promise<Blog> {
    await delay();
    const idx = db.blogs.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Blog not found");
    db.blogs[idx] = { ...db.blogs[idx]!, ...patch, updatedAt: new Date().toISOString() };
    return db.blogs[idx]!;
  },

  async saveBlog(input: Partial<Blog> & { title: string }): Promise<Blog> {
    if (input.id) {
      return this.updateBlog(input.id, input);
    }
    return this.createBlog(input as any);
  },

  async deleteBlog(id: string): Promise<void> {
    await delay();
    const idx = db.blogs.findIndex((b) => b.id === id);
    if (idx !== -1) db.blogs.splice(idx, 1);
  },

  async seasons(): Promise<Season[]> {
    await delay();
    return [...db.seasons];
  },

  async updateSeason(
    name: SeasonName,
    patchOrOpen: Partial<Season> | boolean,
    note?: string
  ): Promise<Season> {
    await delay();
    const season = db.seasons.find((s) => s.name === name);
    if (!season) throw new Error("Season not found");
    if (typeof patchOrOpen === "object") {
      Object.assign(season, patchOrOpen);
    } else {
      season.applicationsOpen = patchOrOpen;
      if (note !== undefined) season.showcaseNote = note;
    }
    return season;
  },

  async assessments(listingId?: string): Promise<Assessment[]> {
    await delay();
    if (listingId) {
      return db.assessments.filter((a) => a.listingId === listingId);
    }
    return [...db.assessments];
  },

  async assessment(id: string): Promise<Assessment | undefined> {
    await delay();
    return db.assessments.find((a) => a.id === id);
  },

  async createAssessment(input: Omit<Assessment, "id" | "createdAt" | "status" | "results">): Promise<Assessment> {
    await delay();
    const newAssessment: Assessment = {
      ...input,
      id: `AS-0${db.assessments.length + 1}`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      results: [],
    };
    db.assessments.unshift(newAssessment);
    return newAssessment;
  },

  async updateAssessment(id: string, patch: Partial<Assessment>): Promise<Assessment> {
    await delay();
    const idx = db.assessments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Assessment not found");
    db.assessments[idx] = { ...db.assessments[idx]!, ...patch };
    return db.assessments[idx]!;
  },

  async setResultAccess(assessmentId: string, applicantId: string, hrCanSee: boolean): Promise<void> {
    await delay();
    const assess = db.assessments.find((a) => a.id === assessmentId);
    if (!assess) return;
    const res = assess.results.find((r) => r.applicantId === applicantId);
    if (res) {
      res.hrCanSee = hrCanSee;
    }
  },

  async inquiries(): Promise<Inquiry[]> {
    await delay();
    return [...db.inquiries];
  },

  async updateInquiry(id: string, patch: { status: InquiryStatus } | InquiryStatus): Promise<Inquiry> {
    await delay();
    const inq = db.inquiries.find((i) => i.id === id);
    if (!inq) throw new Error("Inquiry not found");
    inq.status = typeof patch === "object" ? patch.status : patch;
    return inq;
  },

  async profile(): Promise<HrProfile> {
    await delay();
    return { ...db.profile };
  },

  async updateProfile(patch: Partial<HrProfile>): Promise<HrProfile> {
    await delay();
    Object.assign(db.profile, patch);
    return { ...db.profile };
  },

  async changePassword(_current: string, _next: string): Promise<void> {
    await delay();
    return;
  },
};
