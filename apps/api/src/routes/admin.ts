import { Router, Response } from "express";
import { ObjectId } from "mongodb";
import { requireStaffAuth, AuthenticatedStaffRequest } from "./staffAuth";
import { courses, profiles, enrollments, trainings, products, orders, StaffRole } from "../collections";
import { getDb } from "../db";
import { cacheDel } from "../utils/cache";
import PDFDocument from "pdfkit";

async function generateCertificatePdf(certData: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ layout: "landscape", size: "A4" });
      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(`data:application/pdf;base64,${pdfData.toString("base64")}`);
      });

      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");
      doc.fontSize(30).fillColor("#000000").text(
        "Certificate of " + (certData.type === "completion" ? "Completion" : certData.type.toUpperCase()), 
        100, 100, { align: "center" }
      );
      
      doc.fontSize(20).text(`This is to certify that`, { align: "center" });
      doc.moveDown(1);
      doc.fontSize(25).text(certData.recipientName, { align: "center", underline: true });
      doc.moveDown(1);
      doc.fontSize(20).text(`has successfully completed the ${certData.internshipTitle} Internship.`, { align: "center" });
      doc.moveDown(2);
      
      doc.fontSize(12).text(`Certificate ID: ${certData.certificateId}`, 50, doc.page.height - 100);
      doc.text(`Date: ${certData.issuedAt.toLocaleDateString()}`, 50, doc.page.height - 80);
      doc.text(`Verify at: https://enginow.com${certData.verifyUrl}`, 50, doc.page.height - 60);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

const COURSES_CACHE_KEY = "courses:published";
const INTERNSHIPS_CACHE_KEY = "internships:all";
const TRAININGS_CACHE_KEY = "trainings:published";
const CAREERS_CACHE_KEY = "careers:all";

const router = Router();

function checkAdmin(req: AuthenticatedStaffRequest) {
  if (req.staff?.role !== "admin") {
    throw new Error("Unauthorized: admin role required");
  }
  return true;
}

function checkRoles(req: AuthenticatedStaffRequest, allowedRoles: (StaffRole | string)[]) {
  if (!req.staff) throw new Error("Unauthorized: staff session required");
  if (req.staff.role === "admin") return "admin";
  if (allowedRoles.includes(req.staff.role)) return req.staff.role;
  throw new Error(`Unauthorized: requires one of ${allowedRoles.join(", ")}`);
}

// ─── AUTH / ROLES ────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/is-admin", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const isStaff = !!req.staff;
    res.json(isStaff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/my-role", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = req.staff?.role || "admin";
    res.json({
      role,
      isStaff: true,
      isAdmin: role === "admin",
      isHr: role === "hr",
      isEducator: role === "educator",
      isSales: role === "sales",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── USERS ───────────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/users", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const [
      profileDocs,
      allCourseEnrollments,
      allCourses,
      allTrainings,
      allInternshipApps,
      allInternships,
      allCareerApps,
      allCareers,
      allCerts,
      allReferrals,
      allOrders,
      allProducts,
    ] = await Promise.all([
      profiles().find({}).sort({ createdAt: -1 }).toArray(),
      getDb().collection("course_enrollments").find({}).toArray(),
      courses().find({}).toArray(),
      trainings().find({}).toArray(),
      getDb().collection("internship_applications").find({}).toArray(),
      getDb().collection("internships").find({}).toArray(),
      getDb().collection("career_applications").find({}).toArray(),
      getDb().collection("careers").find({}).toArray(),
      getDb().collection("certificates").find({}).toArray(),
      getDb().collection("referrals").find({}).toArray(),
      orders().find({}).toArray(),
      products().find({}).toArray(),
    ]);

    const courseMap = new Map(allCourses.map(c => [c._id.toString(), c.title]));
    const trainingMap = new Map(allTrainings.map(t => [t._id.toString(), t.title]));
    const internshipMap = new Map(allInternships.map(i => [i._id.toString(), i.title]));
    const careerMap = new Map(allCareers.map(c => [c._id.toString(), c.title]));
    const productMap = new Map(allProducts.map(p => [p._id.toString(), p.name]));
    const profileMap = new Map(profileDocs.map(p => [p._id, p.fullName || "User"]));

    const enrichedUsers = profileDocs.map((p) => {
      const userCourseEnrolls = allCourseEnrollments.filter(e => e.userId === p._id);
      const userInternshipApps = allInternshipApps.filter(a => a.userId === p._id);
      const userCareerApps = allCareerApps.filter(a => a.userId === p._id);
      const userCerts = allCerts.filter(c => c.userId === p._id);
      const userReferrals = allReferrals.filter(r => r.referrerId === p._id);
      const userOrders = allOrders.filter(o => o.userId === p._id);

      const userCourses = userCourseEnrolls.map(e => {
        const title = courseMap.get(e.courseId?.toString()) || trainingMap.get(e.trainingId?.toString()) || "Course";
        return `${title} (${e.progress ?? 0}% complete)`;
      });

      const userApplications = [
        ...userInternshipApps.map(a => `${internshipMap.get(a.internshipId?.toString()) || "Internship"} (Internship - ${a.status || "pending"})`),
        ...userCareerApps.map(a => `${careerMap.get(a.careerId?.toString()) || "Career"} (Job - ${a.status || "pending"})`),
      ];

      const userCertificates = userCerts.map(c => `${c.certificateId} - ${c.internshipTitle || "Certificate"} (${c.type?.toUpperCase()})`);

      const referralActivity = userReferrals.map(r => ({
        joinedName: profileMap.get(r.referredUserId) || "User",
        sharedOn: r.usedAt ? new Date(r.usedAt).toISOString().split("T")[0] : "Recent",
        joinedOn: r.usedAt ? new Date(r.usedAt).toISOString().split("T")[0] : "Recent",
        resource: r.resourceType ? `${r.resourceType}: ${productMap.get(r.resourceId) || courseMap.get(r.resourceId) || r.resourceId}` : "Sign up",
      }));

      const ordersSummary = userOrders.map(o => {
        const prod = productMap.get(o.productId ? o.productId.toString() : "") || "Product";
        return `${prod} (₹${o.amount} - ${o.status})`;
      });

      return {
        ...p,
        roles: ["learner"],
        courses: userCourses,
        applications: userApplications,
        certificates: userCertificates,
        referralActivity,
        orders: ordersSummary,
      };
    });

    res.json(enrichedUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── BLOGS ───────────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/blogs", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator", "hr"]);
    const staffId = req.staff!.staffId;
    const query = (role === "educator" || role === "hr")
      ? { $or: [{ authorId: staffId }, { createdBy: req.staff!.name }] }
      : {};
    const docs = await getDb().collection("blogs").find(query).sort({ createdAt: -1 }).toArray();
    res.json(docs.map(d => {
      const { _id, ...rest } = d;
      return { ...rest, id: _id.toString() };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/blogs", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const now = new Date();
    const doc = {
      ...req.body,
      status: req.body.status || "draft",
      authorId: req.staff!.staffId,
      author: req.staff!.name,
      createdAt: now,
      updatedAt: now,
    };
    const result = await getDb().collection("blogs").insertOne({ _id: new ObjectId(), ...doc });
    res.json({ id: result.insertedId.toString(), ...doc });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/blogs/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await getDb().collection("blogs").findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });
    const role = checkRoles(req, ["educator", "admin", "hr"]);
    if (role !== "admin" && existing.authorId !== req.staff!.staffId && existing.createdBy !== req.staff!.name) {
      return res.status(403).json({ error: "Only creator or admin can update" });
    }
    await getDb().collection("blogs").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.delete("/blogs/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await getDb().collection("blogs").findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });
    const role = checkRoles(req, ["educator", "admin", "hr"]);
    if (role !== "admin" && existing.authorId !== req.staff!.staffId && existing.createdBy !== req.staff!.name) {
      return res.status(403).json({ error: "Only creator or admin can delete" });
    }
    await getDb().collection("blogs").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/blogs/:id/approve", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    await getDb().collection("blogs").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "published", updatedAt: new Date(), rejectionReason: "" } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/blogs/:id/reject", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    const { reason } = req.body;
    await getDb().collection("blogs").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "draft", rejectionReason: reason || "Rejected", updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── COURSES ─────────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/courses", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator"]);
    const query = role === "educator" ? { $or: [{ authorId: req.staff!.staffId }, { createdBy: req.staff!.name }] } : {};
    const [docs, enrolls, profs] = await Promise.all([
      courses().find(query).sort({ createdAt: -1 }).toArray(),
      getDb().collection("course_enrollments").find({}).toArray(),
      profiles().find({}).toArray(),
    ]);

    const profMap = new Map(profs.map(p => [p._id, p]));

    res.json(docs.map((c) => {
      const { _id, roadmap, ...rest } = c;
      const courseEnrolls = enrolls.filter(e => e.courseId?.toString() === _id.toString());
      const learners = courseEnrolls.map(e => {
        const prof = profMap.get(e.userId);
        return {
          id: e._id ? e._id.toString() : e.userId,
          name: prof?.fullName || "Learner",
          email: `${prof?.referralCode || e.userId.slice(0, 6)}@enginow.com`,
          enrolledAt: e.enrolledAt ? new Date(e.enrolledAt).toISOString().split("T")[0] : "Recent",
          progress: e.progress ?? 0,
        };
      });

      return {
        ...rest,
        id: _id.toString(),
        roadmap: roadmap || [],
        enrollments: learners.length,
        learners,
      };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/courses", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator"]);
    const now = new Date();
    
    let status = req.body.status || "draft";
    if (role !== "admin" && status === "live") {
      status = "pending_approval";
    }

    const doc = {
      ...req.body,
      status,
      roadmap: req.body.roadmap ?? [],
      authorId: req.staff!.staffId,
      createdBy: req.staff!.name,
      createdAt: now,
      updatedAt: now,
    };
    const result = await courses().insertOne({ _id: new ObjectId(), ...doc });
    await cacheDel(COURSES_CACHE_KEY);
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/courses/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["educator"]);
    const id = String(req.params.id);
    const doc = await courses().findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: "Course not found" });
    const { _id, roadmap, ...rest } = doc;
    res.json({ ...rest, id: _id.toString(), roadmap: roadmap || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/courses/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator"]);
    const id = String(req.params.id);
    const existing = await courses().findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });

    if (role !== "admin" && existing.createdBy !== req.staff!.name && (existing as any).authorId !== req.staff!.staffId) {
      return res.status(403).json({ error: "Only the creator or an admin can edit this course" });
    }

    let status = req.body.status || existing.status;
    if (role !== "admin" && status === "live") {
      status = "pending_approval";
    }

    await courses().updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, status, authorId: (existing as any).authorId || req.staff!.staffId, updatedAt: new Date() } }
    );
    await cacheDel(COURSES_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/courses/:id/approve", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    await courses().updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "live", updatedAt: new Date(), rejectionReason: "" } }
    );
    await cacheDel(COURSES_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/courses/:id/reject", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    const { reason } = req.body;
    await courses().updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "draft", rejectionReason: reason || "Rejected", updatedAt: new Date() } }
    );
    await cacheDel(COURSES_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.delete("/courses/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    await courses().deleteOne({ _id: new ObjectId(id) });
    await cacheDel(COURSES_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── INTERNSHIPS ─────────────────────────────────────────────────────────────

function calculateTimeline(type: string) {
  const now = new Date();
  let year = now.getFullYear();
  let openMonth = 0; // Jan = 0
  
  if (type === "Spring") openMonth = 1; // Feb 1
  else if (type === "Summer") openMonth = 4; // May 1
  else if (type === "Monsoon") openMonth = 6; // July 1
  else if (type === "Winter") openMonth = 11; // Dec 1
  
  let openFrom = new Date(year, openMonth, 1);
  if (type === "Spring") {
    openFrom = new Date(year - 1, openMonth, 1);
  }
  
  let openUntil = new Date(openFrom);
  openUntil.setMonth(openUntil.getMonth() + 4);
  
  if (openUntil < now) {
     openFrom.setFullYear(openFrom.getFullYear() + 1);
     openUntil.setFullYear(openUntil.getFullYear() + 1);
  }
  
  return { openFrom, openUntil };
}

// @ts-ignore
router.get("/internships", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const staffId = req.staff!.staffId;
    const filter: any = {};
    if (role === "hr") {
      filter.$or = [{ authorId: staffId }, { createdBy: req.staff!.name }, { createdBy: staffId }];
    }

    const [docs, apps] = await Promise.all([
      getDb().collection("internships").find(filter).sort({ createdAt: -1 }).toArray(),
      getDb().collection("internship_applications").find({}).toArray(),
    ]);
    const now = new Date();
    res.json(docs.map((d) => {
      const { _id, ...rest } = d;
      const openFrom = rest.openFrom ? new Date(rest.openFrom) : new Date(0);
      const openUntil = rest.openUntil ? new Date(rest.openUntil) : new Date(Date.now() + 120 * 86400000);
      const isOpen = now >= openFrom && now <= openUntil;
      const status = rest.status || (isOpen ? "open" : "draft");
      const applicants = apps.filter(a => a.internshipId?.toString() === _id.toString());
      return {
        ...rest,
        status,
        id: _id.toString(),
        isOpen,
        applicantsCount: applicants.length,
        perks: Array.isArray(rest.perks) ? rest.perks : [],
        responsibilities: rest.responsibilities || "",
        requirements: Array.isArray(rest.requirements) ? rest.requirements : [],
      };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/internships", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const now = new Date();
    const data = req.body;
    
    let status = data.status || "draft";
    if (role !== "admin" && status === "open") {
      status = "pending_approval";
    }

    const calculated = calculateTimeline(data.type || "Summer");
    const openFrom = data.openFrom ? new Date(data.openFrom) : calculated.openFrom;
    const openUntil = data.openUntil ? new Date(data.openUntil) : calculated.openUntil;

    const doc = {
      ...data,
      company: data.company || "Enginow",
      location: data.location || data.locationType || "Remote",
      locationType: data.locationType || data.location || "Remote",
      stipend: data.stipend || "Unpaid",
      duration: data.duration || "2 Months",
      perks: Array.isArray(data.perks) ? data.perks : [],
      responsibilities: data.responsibilities || "",
      requirements: Array.isArray(data.requirements) ? data.requirements : [],
      tags: data.tags || "",
      domain: data.domain || "",
      status,
      openFrom,
      openUntil,
      authorId: req.staff!.staffId,
      createdBy: req.staff!.name,
      createdAt: now,
      updatedAt: now,
    };

    const result = await getDb().collection("internships").insertOne({
      _id: new ObjectId(),
      ...doc,
    });
    await cacheDel(INTERNSHIPS_CACHE_KEY);
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/internships/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const staffId = req.staff!.staffId;
    const id = String(req.params.id);
    
    const filter: any = { _id: new ObjectId(id) };
    if (role === "hr") {
      filter.$or = [{ authorId: staffId }, { createdBy: req.staff!.name }, { createdBy: staffId }];
    }

    const doc = await getDb().collection("internships").findOne(filter);
    if (!doc) return res.status(404).json({ error: "Not found" });
    const { _id, ...rest } = doc;
    res.json({ ...rest, id: _id.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/internships/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const staffId = req.staff!.staffId;
    const id = String(req.params.id);
    const data = req.body;
    
    const filter: any = { _id: new ObjectId(id) };
    if (role === "hr") {
      filter.$or = [{ authorId: staffId }, { createdBy: req.staff!.name }, { createdBy: staffId }];
    }

    const existing = await getDb().collection("internships").findOne(filter);
    if (!existing) return res.status(404).json({ error: "Not found or access denied" });

    let status = data.status || existing.status;
    if (role !== "admin" && status === "open") {
      status = "pending_approval";
    }

    let openFrom = data.openFrom ? new Date(data.openFrom) : (existing.openFrom ? new Date(existing.openFrom) : new Date());
    let openUntil = data.openUntil ? new Date(data.openUntil) : (existing.openUntil ? new Date(existing.openUntil) : new Date(Date.now() + 90 * 86400000));
    
    if (data.type && data.type !== existing.type && !data.openFrom && !data.openUntil) {
      const calculated = calculateTimeline(data.type);
      openFrom = calculated.openFrom;
      openUntil = calculated.openUntil;
    }

    await getDb().collection("internships").updateOne(
      filter,
      { 
        $set: {
          ...data,
          company: data.company || existing.company || "Enginow",
          location: data.location || data.locationType || existing.location || "Remote",
          locationType: data.locationType || data.location || existing.locationType || "Remote",
          stipend: data.stipend !== undefined ? data.stipend : existing.stipend,
          duration: data.duration !== undefined ? data.duration : existing.duration,
          perks: Array.isArray(data.perks) ? data.perks : (existing.perks || []),
          responsibilities: data.responsibilities !== undefined ? data.responsibilities : (existing.responsibilities || ""),
          requirements: Array.isArray(data.requirements) ? data.requirements : (existing.requirements || []),
          tags: data.tags !== undefined ? data.tags : (existing.tags || ""),
          domain: data.domain !== undefined ? data.domain : (existing.domain || ""),
          status,
          openFrom,
          openUntil,
          updatedAt: new Date()
        }
      }
    );
    await cacheDel(INTERNSHIPS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/internships/:id/approve", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    await getDb().collection("internships").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "open", updatedAt: new Date(), rejectionReason: "" } }
    );
    await cacheDel(INTERNSHIPS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/internships/:id/reject", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    const { reason } = req.body;
    await getDb().collection("internships").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "draft", rejectionReason: reason || "Rejected", updatedAt: new Date() } }
    );
    await cacheDel(INTERNSHIPS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.delete("/internships/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const staffId = req.staff!.staffId;
    const id = String(req.params.id);

    const filter: any = { _id: new ObjectId(id) };
    if (role === "hr") {
      filter.$or = [{ authorId: staffId }, { createdBy: req.staff!.name }, { createdBy: staffId }];
    }

    const existing = await getDb().collection("internships").findOne(filter);
    if (!existing) return res.status(404).json({ error: "Not found or access denied" });

    await getDb().collection("internships").deleteOne(filter);
    await cacheDel(INTERNSHIPS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── STATS ───────────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/stats", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["educator", "hr", "sales", "admin"]);
    const db = getDb();
    
    // Time boundaries
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      users, coursesData, trainingsData, enrollmentsData, internshipsData, careersData, blogsData
    ] = await Promise.all([
      profiles().find({}).toArray(),
      courses().find({}).toArray(),
      getDb().collection("trainings").find({}).toArray(),
      enrollments().find({}).toArray(),
      getDb().collection("internships").find({}).toArray(),
      getDb().collection("careers").find({}).toArray(),
      getDb().collection("blogs").find({}).toArray(),
    ]);

    const totalUsers = users.length;
    const newSignups7d = users.filter((u: any) => new Date(u.createdAt || 0) >= d7).length;
    const newSignups30d = users.filter((u: any) => new Date(u.createdAt || 0) >= d30).length;

    const activeCourses = coursesData.filter(c => c.status === "published" || c.status === "live").length 
                        + trainingsData.filter(t => t.status === "published" || t.status === "live").length;
                        
    const pendingApprovals = 
      coursesData.filter(c => c.status === "pending_approval").length +
      trainingsData.filter(t => t.status === "pending_approval").length +
      blogsData.filter(b => b.status === "pending_approval").length +
      internshipsData.filter(i => i.status === "pending_approval").length +
      careersData.filter(c => c.status === "pending_approval").length;

    const openListings = internshipsData.filter(i => i.status === "open").length 
                       + careersData.filter(c => c.status === "open").length;

    const monthEnrollments = enrollmentsData.filter((e: any) => new Date(e.enrolledAt || e.createdAt || 0) >= firstDayOfMonth).length;

    // Monthly Enrollment Trend (last 6 months including current)
    const enrollmentTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = enrollmentsData.filter((e: any) => {
        const dAt = new Date(e.enrolledAt || e.createdAt || 0);
        return dAt >= d && dAt < nextMonth;
      }).length;
      enrollmentTrend.push({
        month: d.toLocaleString("default", { month: "short" }),
        enrollments: count
      });
    }

    const allCourses = [...coursesData, ...trainingsData];
    allCourses.sort((a: any, b: any) => (b.enrollments || b.learners?.length || 0) - (a.enrollments || a.learners?.length || 0));
    const topCourses = allCourses.slice(0, 4).map((c: any) => ({
      title: c.title || "Course",
      enrollments: c.enrollments || c.learners?.length || 0
    }));
    
    // Ensure we always have some data for top courses chart
    if (topCourses.length === 0) topCourses.push({ title: "No active courses", enrollments: 0 });

    const leaderboard = users
      .filter((u: any) => u.referralCode)
      .map((u: any) => ({
        name: u.fullName || u.email?.split("@")[0] || "Learner",
        code: u.referralCode,
        referrals: u.referralUsageCount || 0,
      }))
      .sort((a, b) => b.referrals - a.referrals)
      .slice(0, 10);

    res.json({ 
      totalUsers, 
      newSignups7d,
      newSignups30d,
      activeCourses,
      pendingApprovals,
      openListings,
      monthEnrollments,
      enrollmentTrend,
      topCourses,
      leaderboard
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── APPROVALS ───────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/approvals", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["admin"]);
    const db = getDb();
    const [courses, trainings, blogs, internships, careers] = await Promise.all([
      db.collection("courses").find({ status: "pending_approval" }).toArray(),
      db.collection("trainings").find({ status: "pending_approval" }).toArray(),
      db.collection("blogs").find({ status: "pending_approval" }).toArray(),
      db.collection("internships").find({ status: "pending_approval" }).toArray(),
      db.collection("careers").find({ status: "pending_approval" }).toArray(),
    ]);

    const approvals = [
      ...courses.map(x => ({
        id: x._id.toString(),
        type: "Course",
        title: x.title,
        submittedBy: x.createdBy || "Educator",
        submittedOn: x.updatedAt || new Date().toISOString(),
        preview: x.description || "",
      })),
      ...trainings.map(x => ({
        id: x._id.toString(),
        type: "Training",
        title: x.title,
        submittedBy: x.createdBy || "Educator",
        submittedOn: x.updatedAt || new Date().toISOString(),
        preview: x.description || "",
      })),
      ...blogs.map(x => ({
        id: x._id.toString(),
        type: "Blog",
        title: x.title,
        submittedBy: x.author || "User",
        submittedOn: x.updatedAt || new Date().toISOString(),
        preview: x.excerpt || x.description || "",
      })),
      ...internships.map(x => ({
        id: x._id.toString(),
        type: "Internship",
        title: x.title,
        submittedBy: x.createdBy || "HR",
        submittedOn: x.updatedAt || new Date().toISOString(),
        preview: x.description || "",
      })),
      ...careers.map(x => ({
        id: x._id.toString(),
        type: "Career",
        title: x.title,
        submittedBy: x.createdBy || "HR",
        submittedOn: x.updatedAt || new Date().toISOString(),
        preview: x.description || "",
      })),
    ];

    approvals.sort((a, z) => (a.submittedOn < z.submittedOn ? 1 : -1));
    res.json(approvals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── INTERNSHIP APPLICATIONS ─────────────────────────────────────────────────

// @ts-ignore
router.get("/internship-applications", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const staffId = req.staff!.staffId;
    const { internshipId } = req.query;

    const filter: Record<string, unknown> = {};
    if (internshipId) filter.internshipId = new ObjectId(String(internshipId));

    let apps = await getDb().collection("internship_applications").find(filter).sort({ appliedAt: -1 }).toArray();

    if (role === "hr") {
      const hrInternships = await getDb().collection("internships").find({ 
        $or: [{ authorId: staffId }, { createdBy: staffId }, { createdBy: req.staff!.name }] 
      }).toArray();
      const hrInternshipIds = hrInternships.map(l => l._id.toString());
      apps = apps.filter(a => hrInternshipIds.includes(a.internshipId?.toString()));
    }

    const internshipIds = [...new Set(apps.map(a => a.internshipId?.toString()))];
    const internships = await getDb().collection("internships").find({
      _id: { $in: internshipIds.map(id => new ObjectId(id)) }
    }).toArray();
    const internshipMap = Object.fromEntries(internships.map(i => [i._id.toString(), i]));

    const enriched = apps.map((app) => {
      const { _id, ...rest } = app;
      const internship = internshipMap[app.internshipId?.toString()];
      return {
        ...rest,
        id: _id.toString(),
        internshipId: app.internshipId?.toString(),
        internshipTitle: internship?.title ?? "Unknown",
        internshipDomain: internship?.domain ?? "",
        internshipType: internship?.type ?? "",
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/internship-applications/:id/status", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const id = String(req.params.id);
    const { status, assessmentId } = req.body;

    if (!["pending", "shortlisted", "oa", "oa-cleared", "oa-failed", "selected", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be pending, shortlisted, oa, oa-cleared, oa-failed, selected, or rejected." });
    }
    if (status === "oa" && !assessmentId) {
      return res.status(400).json({ error: "assessmentId is required when setting status to OA" });
    }

    const existingApp = await getDb().collection("internship_applications").findOne({ _id: new ObjectId(id) });
    if (!existingApp) return res.status(404).json({ error: "Application not found" });

    if (role === "hr") {
      const internship = await getDb().collection("internships").findOne({ _id: existingApp.internshipId });
      if (!internship || (internship.authorId !== req.staff!.staffId && internship.createdBy !== req.staff!.name && internship.createdBy !== req.staff!.staffId)) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const updateDoc: any = { status, updatedAt: new Date() };
    if (status === "oa" && assessmentId) updateDoc.assessmentId = assessmentId;

    const app = await getDb().collection("internship_applications").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    // Best-effort email notification for OA
    if (status === "oa" && app && app.email) {
      const assessment = assessmentId
        ? await getDb().collection("assessments").findOne({ _id: new ObjectId(assessmentId) })
        : null;
      const internship = app.internshipId
        ? await getDb().collection("internships").findOne({ _id: app.internshipId })
        : null;
      getDb().collection("notifications").insertOne({
        _id: new ObjectId(),
        userId: app.userId,
        type: "oa_ready",
        title: "Your OA Round is Ready!",
        message: `Your Online Assessment for "${internship?.title || "the internship"}" is now available. Click Start OA Round in your dashboard.`,
        assessmentId,
        read: false,
        createdAt: new Date(),
      }).catch(() => {});
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/internship-applications/:id/certificate", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["hr"]);
    const applicationId = String(req.params.id);

    const app = await getDb().collection("internship_applications").findOne({ _id: new ObjectId(applicationId) });
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (app.status !== "selected") return res.status(400).json({ error: "Can only issue certificates for selected applications" });

    let { type, customDocumentBase64 } = req.body;
    const validTypes = ["completion", "lor", "loe"];
    if (!validTypes.includes(type)) return res.status(400).json({ error: "Invalid certificate type" });

    const year = new Date().getFullYear();
    const uniquePart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const certificateId = `ENG-${year}-${uniquePart}`;

    const internship = await getDb().collection("internships").findOne({ _id: app.internshipId });

    const cert = {
      _id: new ObjectId(),
      certificateId,
      applicationId: new ObjectId(applicationId),
      userId: app.userId,
      internshipId: app.internshipId,
      internshipTitle: internship?.title ?? "Internship",
      internshipDomain: internship?.domain ?? "",
      type,
      recipientName: app.fullName ?? "Intern",
      issuedBy: req.staff!.staffId,
      issuedAt: new Date(),
      verifyUrl: `/verify/${certificateId}`,
    };

    if (!customDocumentBase64) {
      customDocumentBase64 = await generateCertificatePdf(cert);
    }
    
    const finalCert = {
      ...cert,
      customDocumentBase64,
    };

    await getDb().collection("certificates").updateOne(
      { applicationId: new ObjectId(applicationId), type },
      { $set: finalCert },
      { upsert: true }
    );

    res.json({ success: true, certificateId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/documents", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["hr", "admin"]);
    const docs = await getDb().collection("certificates").find({}).sort({ issuedAt: -1 }).toArray();
    res.json(docs.map(d => ({
      ...d,
      id: d._id.toString(),
      applicationId: d.applicationId?.toString(),
      userId: d.userId?.toString(),
      internshipId: d.internshipId?.toString(),
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/documents", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["hr", "admin"]);
    const { type, recipientName, userId, internshipId, internshipTitle, customDocumentBase64 } = req.body;
    
    const validTypes = ["completion", "lor", "loe", "offer_letter", "certificate"];
    if (!validTypes.includes(type)) return res.status(400).json({ error: "Invalid document type" });

    const year = new Date().getFullYear();
    const uniquePart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const certificateId = `ENG-${year}-${uniquePart}`;

    const cert = {
      _id: new ObjectId(),
      certificateId,
      userId: userId ? new ObjectId(userId) : null,
      internshipId: internshipId ? new ObjectId(internshipId) : null,
      internshipTitle: internshipTitle || "Internship / Career",
      internshipDomain: "",
      type,
      recipientName: recipientName || "Candidate",
      issuedBy: req.staff!.staffId,
      issuedAt: new Date(),
      verifyUrl: `/verify/${certificateId}`,
    };

    let base64Data = customDocumentBase64;
    if (!base64Data) {
      base64Data = await generateCertificatePdf(cert);
    }
    
    const finalCert = {
      ...cert,
      customDocumentBase64: base64Data,
    };

    await getDb().collection("certificates").insertOne(finalCert);

    res.json({ success: true, certificateId, document: finalCert });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/internship-applications/:id/certificates", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["hr"]);
    const applicationId = String(req.params.id);
    const certs = await getDb().collection("certificates").find({ applicationId: new ObjectId(applicationId) }).toArray();
    const mapped = certs.map(c => ({ ...c, id: c._id.toString(), _id: undefined }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── TRAININGS ───────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/trainings", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator"]);
    const query = role === "educator" ? { $or: [{ authorId: req.staff!.staffId }, { createdBy: req.staff!.name }] } : {};
    const [docs, enrolls, profs] = await Promise.all([
      trainings().find(query).sort({ createdAt: -1 }).toArray(),
      getDb().collection("course_enrollments").find({}).toArray(),
      profiles().find({}).toArray(),
    ]);

    const profMap = new Map(profs.map(p => [p._id, p]));

    res.json(docs.map((t) => {
      const { _id, roadmap, youWillLearn, ...rest } = t;
      const trainingEnrolls = enrolls.filter(e => e.trainingId?.toString() === _id.toString() || e.courseId?.toString() === _id.toString());
      const learners = trainingEnrolls.map(e => {
        const prof = profMap.get(e.userId);
        return {
          id: e._id ? e._id.toString() : e.userId,
          name: prof?.fullName || "Learner",
          email: `${prof?.referralCode || e.userId.slice(0, 6)}@enginow.com`,
          enrolledOn: e.enrolledAt ? new Date(e.enrolledAt).toISOString().split("T")[0] : "Recent",
          progress: e.progress ?? 0,
        };
      });

      return {
        ...rest,
        id: _id.toString(),
        roadmap: roadmap || [],
        youWillLearn: Array.isArray(youWillLearn) ? youWillLearn : [],
        enrollments: learners.length,
        learners,
      };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/trainings", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator"]);
    const now = new Date();
    
    let status = req.body.status || "draft";
    if (role !== "admin" && status === "live") {
      status = "pending_approval";
    }

    const doc = {
      ...req.body,
      status,
      roadmap: req.body.roadmap ?? [],
      youWillLearn: Array.isArray(req.body.youWillLearn) ? req.body.youWillLearn : [],
      authorId: req.staff!.staffId,
      createdBy: req.staff!.name,
      createdAt: now,
      updatedAt: now,
    };
    const result = await trainings().insertOne({ _id: new ObjectId(), ...doc });
    await cacheDel(TRAININGS_CACHE_KEY);
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/trainings/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator"]);
    const id = String(req.params.id);
    const doc = await trainings().findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (role !== "admin" && doc.createdBy !== req.staff!.name && (doc as any).authorId !== req.staff!.staffId) {
      return res.status(403).json({ error: "Cannot view others' trainings" });
    }
    const { _id, ...rest } = doc;
    res.json({ ...rest, id: _id.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/trainings/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator"]);
    const id = String(req.params.id);
    
    const existing = await trainings().findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (role !== "admin" && existing.createdBy !== req.staff!.name && (existing as any).authorId !== req.staff!.staffId) {
      return res.status(403).json({ error: "Only the creator or an admin can edit this" });
    }

    let status = req.body.status || existing.status;
    if (role !== "admin" && status === "live") {
      status = "pending_approval";
    }

    await trainings().updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, status, authorId: (existing as any).authorId || req.staff!.staffId, updatedAt: new Date() } }
    );
    await cacheDel(TRAININGS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/trainings/:id/approve", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    await trainings().updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "live", updatedAt: new Date(), rejectionReason: "" } }
    );
    await cacheDel(TRAININGS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/trainings/:id/reject", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    const { reason } = req.body;
    await trainings().updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "draft", rejectionReason: reason || "Rejected", updatedAt: new Date() } }
    );
    await cacheDel(TRAININGS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.delete("/trainings/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    await trainings().deleteOne({ _id: new ObjectId(id) });
    await cacheDel(TRAININGS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── HR DASHBOARD & SEASONS ────────────────────────────────────────────────────

// @ts-ignore
router.get("/hr/dashboard", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const staffId = req.staff!.staffId;
    const filter: any = {};
    if (role === "hr") {
      filter.$or = [{ authorId: staffId }, { createdBy: req.staff!.name }, { createdBy: staffId }];
    }

    const [
      careerListings,
      internshipListings,
      allCareerApps,
      allInternshipApps,
      assessments,
      inquiries
    ] = await Promise.all([
      getDb().collection("careers").find(filter).toArray(),
      getDb().collection("internships").find(filter).toArray(),
      getDb().collection("career_applications").find({}).sort({ appliedAt: -1 }).toArray(),
      getDb().collection("internship_applications").find({}).sort({ appliedAt: -1 }).toArray(),
      getDb().collection("assessments").find(role === "hr" ? { createdBy: staffId } : {}).toArray(),
      getDb().collection("inquiries").find({}).toArray()
    ]);

    const hrCareerListingIds = careerListings.map(l => l._id.toString());
    const hrInternshipListingIds = internshipListings.map(l => l._id.toString());
    
    const careerApps = allCareerApps.filter(a => hrCareerListingIds.includes(a.careerId?.toString()));
    const internshipApps = allInternshipApps.filter(a => hrInternshipListingIds.includes(a.internshipId?.toString()));

    const activeListingsCount = careerListings.filter(l => l.status === "open").length + internshipListings.filter(l => l.status === "open").length;
    const totalApplicantsCount = careerApps.length + internshipApps.length;
    const activeAssessmentsCount = assessments.filter(a => a.status === "Live").length;
    const unreadInquiriesCount = inquiries.filter(i => i.status === "new").length;
    
    const pipeline = {
      applied: careerApps.filter(a => a.stage === "Applied").length + internshipApps.filter(a => a.status === "pending").length,
      shortlisted: careerApps.filter(a => a.stage === "Shortlisted").length + internshipApps.filter(a => a.status === "shortlisted").length,
      oa: careerApps.filter(a => a.stage === "OA").length + internshipApps.filter(a => a.status === "oa" || a.status === "oa-cleared" || a.status === "oa-failed").length,
      selected: careerApps.filter(a => a.stage === "Selected").length + internshipApps.filter(a => a.status === "selected").length,
    };

    const combinedRecent = [
      ...careerApps.map(a => ({
        id: a._id.toString(),
        name: a.name || a.fullName,
        stage: a.stage || "Applied",
        appliedAt: a.appliedAt,
        careerId: a.careerId?.toString(),
        type: "career"
      })),
      ...internshipApps.map(a => ({
        id: a._id.toString(),
        name: a.name || a.fullName,
        stage: a.status === "pending" ? "Applied" : a.status === "shortlisted" ? "Shortlisted" : a.status === "oa" || a.status === "oa-cleared" || a.status === "oa-failed" ? "OA" : a.status === "selected" ? "Selected" : "Applied",
        appliedAt: a.appliedAt,
        careerId: a.internshipId?.toString(),
        type: "internship"
      }))
    ].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()).slice(0, 5);

    res.json({
      activeListings: activeListingsCount,
      totalApplicants: totalApplicantsCount,
      activeAssessments: activeAssessmentsCount,
      unreadInquiries: unreadInquiriesCount,
      pipeline,
      recentApplicants: combinedRecent
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/internship-seasons", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["hr"]);
    const seasons = await getDb().collection("internship_seasons").find({}).toArray();
    res.json(seasons.map((s) => {
      const { _id, ...rest } = s;
      return { ...rest, id: _id.toString() };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/internship-seasons/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["hr"]);
    const id = String(req.params.id);
    const { _id, id: removedId, ...data } = req.body;
    await getDb().collection("internship_seasons").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CAREERS ─────────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/careers", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["hr"]);
    const role = req.staff!.role;
    const staffId = req.staff!.staffId;

    const filter: any = {};
    if (role === "hr") {
      filter.$or = [{ authorId: staffId }, { createdBy: staffId }];
    }

    const [docs, apps] = await Promise.all([
      getDb().collection("careers").find(filter).sort({ createdAt: -1 }).toArray(),
      getDb().collection("career_applications").find({}).toArray(),
    ]);
    const now = new Date();
    res.json(docs.map((d) => {
      const { _id, ...rest } = d;
      const openFrom = rest.openFrom ? new Date(rest.openFrom) : new Date(0);
      const openUntil = rest.openUntil ? new Date(rest.openUntil) : new Date(Date.now() + 120 * 86400000);
      const isOpen = now >= openFrom && now <= openUntil;
      const status = rest.status || (isOpen ? "open" : "draft");
      const applicants = apps.filter(a => a.careerId?.toString() === _id.toString());
      return {
        ...rest,
        status,
        id: _id.toString(),
        isOpen,
        applicantsCount: applicants.length,
        perks: Array.isArray(rest.perks) ? rest.perks : [],
        responsibilities: rest.responsibilities || "",
        requirements: Array.isArray(rest.requirements) ? rest.requirements : [],
      };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/careers", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const now = new Date();
    const data = req.body;
    
    let status = data.status || "draft";
    if (role !== "admin" && status === "open") {
      status = "pending_approval";
    }
    
    const openFrom = data.openFrom ? new Date(data.openFrom) : new Date();
    const openUntil = data.openUntil ? new Date(data.openUntil) : new Date(Date.now() + 90 * 86400000);

    const doc = {
      ...data,
      company: data.company || "Enginow",
      location: data.location || data.locationType || "Onsite",
      locationType: data.locationType || data.location || "Onsite",
      type: data.type || "Full-time",
      salary: data.salary || "Competitive",
      perks: Array.isArray(data.perks) ? data.perks : [],
      responsibilities: data.responsibilities || "",
      requirements: Array.isArray(data.requirements) ? data.requirements : [],
      tags: data.tags || "",
      domain: data.domain || "",
      status,
      openFrom,
      openUntil,
      authorId: req.staff!.staffId,
      createdBy: req.staff!.name,
      createdAt: now,
      updatedAt: now,
    };

    const result = await getDb().collection("careers").insertOne({
      _id: new ObjectId(),
      ...doc,
    });
    await cacheDel(CAREERS_CACHE_KEY);
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/careers/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const staffId = req.staff!.staffId;
    const id = String(req.params.id);
    
    const filter: any = { _id: new ObjectId(id) };
    if (role === "hr") {
      filter.$or = [{ authorId: staffId }, { createdBy: staffId }];
    }

    const doc = await getDb().collection("careers").findOne(filter);
    if (!doc) return res.status(404).json({ error: "Career not found" });

    const apps = await getDb().collection("career_applications").find({ careerId: new ObjectId(id) }).toArray();
    
    const now = new Date();
    const openFrom = doc.openFrom ? new Date(doc.openFrom) : new Date(0);
    const openUntil = doc.openUntil ? new Date(doc.openUntil) : new Date(Date.now() + 120 * 86400000);
    const isOpen = now >= openFrom && now <= openUntil;

    const { _id, ...rest } = doc;
    res.json({
        ...rest,
        id: _id.toString(),
        isOpen,
        applicantsCount: apps.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/careers/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const staffId = req.staff!.staffId;
    const id = String(req.params.id);
    
    const filter: any = { _id: new ObjectId(id) };
    if (role === "hr") {
      filter.$or = [{ authorId: staffId }, { createdBy: staffId }];
    }

    const existing = await getDb().collection("careers").findOne(filter);
    if (!existing) return res.status(404).json({ error: "Career not found or access denied." });

    const data = req.body;
    let status = existing.status;

    if (data.status) {
      if (role !== "admin" && data.status === "open") {
        status = "pending_approval";
      } else {
        status = data.status;
      }
    }

    const openFrom = data.openFrom ? new Date(data.openFrom) : existing.openFrom;
    const openUntil = data.openUntil ? new Date(data.openUntil) : existing.openUntil;
    
    await getDb().collection("careers").updateOne(
      filter,
      { 
        $set: {
          ...data,
          company: data.company || existing.company || "Enginow",
          location: data.location || data.locationType || existing.location || "Onsite",
          locationType: data.locationType || data.location || existing.locationType || "Onsite",
          type: data.type || existing.type || "Full-time",
          salary: data.salary ?? existing.salary ?? "Competitive",
          perks: Array.isArray(data.perks) ? data.perks : (existing.perks || []),
          responsibilities: data.responsibilities !== undefined ? data.responsibilities : (existing.responsibilities || ""),
          requirements: Array.isArray(data.requirements) ? data.requirements : (existing.requirements || []),
          tags: data.tags !== undefined ? data.tags : (existing.tags || ""),
          domain: data.domain !== undefined ? data.domain : (existing.domain || ""),
          status,
          openFrom,
          openUntil,
          updatedAt: new Date()
        }
      }
    );
    await cacheDel(CAREERS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/careers/:id/approve", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    await getDb().collection("careers").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "open", updatedAt: new Date(), rejectionReason: "" } }
    );
    await cacheDel(CAREERS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/careers/:id/reject", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    const id = String(req.params.id);
    const { reason } = req.body;
    await getDb().collection("careers").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "draft", rejectionReason: reason || "Rejected", updatedAt: new Date() } }
    );
    await cacheDel(CAREERS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.delete("/careers/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const staffId = req.staff!.staffId;
    const id = String(req.params.id);

    const filter: any = { _id: new ObjectId(id) };
    if (role === "hr") {
      filter.$or = [{ authorId: staffId }, { createdBy: staffId }];
    }

    const existing = await getDb().collection("careers").findOne(filter);
    if (!existing) return res.status(404).json({ error: "Career not found or access denied." });

    await getDb().collection("careers").deleteOne(filter);
    await cacheDel(CAREERS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CAREER APPLICATIONS ─────────────────────────────────────────────────────

// @ts-ignore
router.get("/career-applications", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const staffId = req.staff!.staffId;
    let apps = await getDb().collection("career_applications").find({}).sort({ appliedAt: -1 }).toArray();
    
    if (role === "hr") {
      const hrCareers = await getDb().collection("careers").find({ 
        $or: [{ authorId: staffId }, { createdBy: staffId }, { createdBy: req.staff!.name }] 
      }).toArray();
      const hrCareerIds = hrCareers.map(l => l._id.toString());
      apps = apps.filter(a => hrCareerIds.includes(a.careerId?.toString()));
    }

    const enriched = await Promise.all(apps.map(async (app) => {
      const [career, userProfile] = await Promise.all([
        getDb().collection("careers").findOne({ _id: app.careerId }),
        profiles().findOne({ _id: app.userId }),
      ]);
      const { _id, ...rest } = app;
      return {
        ...rest,
        id: _id.toString(),
        careerId: app.careerId.toString(),
        careerTitle: career?.title || "Unknown",
        userFullName: userProfile?.fullName || "Unknown",
      };
    }));

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/career-applications/:id/status", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["hr"]);
    const { status } = req.body;
    if (!["pending", "reviewing", "shortlisted", "oa", "oa-cleared", "oa-failed", "selected", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    await getDb().collection("career_applications").updateOne(
      { _id: new ObjectId(String(req.params.id)) },
      { $set: { status, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/career-applications/:id/stage", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["hr"]);
    const { stage } = req.body;
    if (!["Applied", "Shortlisted", "OA", "Selected"].includes(stage)) {
      return res.status(400).json({ error: "Invalid stage" });
    }

    const app = await getDb().collection("career_applications").findOne({ _id: new ObjectId(String(req.params.id)) });
    if (!app) return res.status(404).json({ error: "Application not found" });

    if (role === "hr") {
      const career = await getDb().collection("careers").findOne({ _id: app.careerId });
      if (!career || (career.authorId !== req.staff!.staffId && career.createdBy !== req.staff!.name && career.createdBy !== req.staff!.staffId)) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    await getDb().collection("career_applications").updateOne(
      { _id: new ObjectId(String(req.params.id)) },
      {
        $set: { stage, updatedAt: new Date() },
        $push: { history: { stage, at: new Date(), by: req.staff!.name } as any }
      }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── SHOP PRODUCTS ────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/products", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["sales"]);
    const docs = await products().find({}).sort({ createdAt: -1 }).toArray();
    res.json(docs.map((d) => {
      const { _id, ...rest } = d;
      return { ...rest, id: _id.toString() };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/products", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["sales"]);
    const { name, slug, shortDescription, description, price, discountedPrice, images, category, status } = req.body;

    const newDoc = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      shortDescription: shortDescription || "",
      description: description || "",
      price: Number(price) || 0,
      discountedPrice: Number(discountedPrice) || 0,
      images: images || [],
      rating: 0,
      category: category || "Merchandise",
      status: status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await products().insertOne(newDoc as any);
    cacheDel("shop:products");
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/products/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["sales"]);
    const { name, slug, shortDescription, description, price, discountedPrice, images, category, status } = req.body;

    await products().updateOne(
      { _id: new ObjectId(String(req.params.id)) },
      {
        $set: {
          name,
          slug,
          shortDescription,
          description,
          price: Number(price),
          discountedPrice: Number(discountedPrice),
          images,
          category,
          status,
          updatedAt: new Date(),
        },
      }
    );
    cacheDel("shop:products");
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.delete("/products/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkAdmin(req);
    await products().deleteOne({ _id: new ObjectId(String(req.params.id)) });
    cacheDel("shop:products");
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── SHOP ORDERS ────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/orders", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["sales"]);
    const docs = await orders().find({}).sort({ createdAt: -1 }).toArray();
    
    const prods = await products().find({}).toArray();
    const prodMap = new Map(prods.map(p => [p._id.toString(), p]));

    const profs = await profiles().find({}).toArray();
    const profMap = new Map(profs.map(p => [p._id, p]));

    const enriched = docs.map(o => {
      const { _id, ...rest } = o;
      const prodIdStr = o.productId ? o.productId.toString() : "";
      const product = prodMap.get(prodIdStr);
      const profile = profMap.get(o.userId);
      return {
        ...rest,
        id: _id.toString(),
        productId: prodIdStr,
        productName: product?.name || "Enginow Merchandise",
        productImage: product?.images?.[0] || "",
        userFullName: profile?.fullName || "Customer",
        userEmail: `${profile?.referralCode || "user"}@enginow.com`,
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/orders/:id/tracking", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["sales"]);
    const { trackingId, trackingSite, status } = req.body;
    const updateFields: any = { updatedAt: new Date() };
    if (trackingId !== undefined) updateFields.trackingId = trackingId;
    if (trackingSite !== undefined) updateFields.trackingSite = trackingSite;
    if (status !== undefined) updateFields.status = status;

    await orders().updateOne(
      { _id: new ObjectId(String(req.params.id)) },
      { $set: updateFields }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ─── CAREER APPLICATIONS ─────────────────────────────────────────────────────

// @ts-ignore
router.get("/career-applications", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["hr"]);
    const { careerId } = req.query;

    const filter: Record<string, unknown> = {};
    if (careerId) filter.careerId = new ObjectId(String(careerId));

    const apps = await getDb().collection("career_applications").find(filter).sort({ appliedAt: -1 }).toArray();

    const careerIds = [...new Set(apps.map(a => a.careerId?.toString()).filter(Boolean))];
    const careers = await getDb().collection("careers").find({
      _id: { $in: careerIds.map(id => new ObjectId(id!)) }
    }).toArray();
    const careerMap = Object.fromEntries(careers.map(c => [c._id.toString(), c]));

    const enriched = apps.map((app) => {
      const { _id, ...rest } = app;
      const career = careerMap[app.careerId?.toString()];
      return {
        ...rest,
        id: _id.toString(),
        careerId: app.careerId?.toString(),
        careerTitle: career?.title ?? "Unknown",
        careerDomain: career?.domain ?? "",
        careerType: career?.type ?? "",
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/career-applications/:id/status", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["hr"]);
    const id = String(req.params.id);
    const { status, assessmentId, interviewDate, interviewLink } = req.body;

    if (!["pending", "shortlisted", "oa", "oa-cleared", "oa-failed", "interview", "selected", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }
    if (status === "oa" && !assessmentId) {
      return res.status(400).json({ error: "assessmentId is required when setting status to OA" });
    }

    const updateDoc: any = { status, updatedAt: new Date() };
    if (status === "oa" && assessmentId) updateDoc.assessmentId = assessmentId;
    if (status === "interview") {
      if (interviewDate) updateDoc.interviewDate = interviewDate;
      if (interviewLink) updateDoc.interviewLink = interviewLink;
    }

    const app = await getDb().collection("career_applications").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    if (status === "oa" && app && app.userId) {
      const career = app.careerId
        ? await getDb().collection("careers").findOne({ _id: app.careerId })
        : null;
      getDb().collection("notifications").insertOne({
        _id: new ObjectId(),
        userId: app.userId,
        type: "oa_ready",
        title: "Your OA Round is Ready!",
        message: `Your Online Assessment for "${career?.title || "the role"}" is now available. Click Start OA Round in your dashboard.`,
        assessmentId,
        read: false,
        createdAt: new Date(),
      }).catch(() => {});
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── RESOURCES ───────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/resources", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator"]);
    const query = role === "educator" ? { $or: [{ authorId: req.staff!.staffId }, { createdBy: req.staff!.name }] } : {};
    const docs = await getDb().collection("resources").find(query).sort({ createdAt: -1 }).toArray();
    res.json(docs.map(r => ({ ...r, id: r._id.toString() })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/resources", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["educator"]);
    const now = new Date();
    const doc = {
      ...req.body,
      authorId: req.staff!.staffId,
      author: req.staff!.name,
      createdAt: now,
      updatedAt: now,
    };
    const result = await getDb().collection("resources").insertOne({ _id: new ObjectId(), ...doc });
    res.json({ id: result.insertedId.toString(), ...doc });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/resources/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator", "admin"]);
    const id = String(req.params.id);
    const existing = await getDb().collection("resources").findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (role !== "admin" && existing.authorId !== req.staff!.staffId && existing.createdBy !== req.staff!.name) {
      return res.status(403).json({ error: "Only creator or admin can update" });
    }
    const updateDoc = {
      title: req.body.title,
      description: req.body.description,
      tag: req.body.tag,
      fileName: req.body.fileName,
      updatedAt: new Date(),
    };
    await getDb().collection("resources").updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
    res.json({ id, ...existing, ...updateDoc });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.delete("/resources/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    const role = checkRoles(req, ["educator"]);
    const id = String(req.params.id);
    const existing = await getDb().collection("resources").findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (role !== "admin" && existing.authorId !== req.staff!.staffId && existing.createdBy !== req.staff!.name) {
      return res.status(403).json({ error: "Only creator or admin can delete" });
    }
    await getDb().collection("resources").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── EDUCATOR DASHBOARD ──────────────────────────────────────────────────────

// @ts-ignore
router.get("/educator/dashboard", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response) => {
  try {
    checkRoles(req, ["educator"]);
    const educatorId = req.staff!.staffId;
    
    // 1. Get educator's courses
    const educatorCourses = await courses().find({ $or: [{ authorId: educatorId }, { createdBy: req.staff!.name }] }).toArray();
    const totalCourses = educatorCourses.length;
    const liveCourses = educatorCourses.filter(c => c.status === "live" || c.status === "published").length;
    const pendingCourses = educatorCourses.filter(c => (c.status as string) === "pending" || c.status === "pending_approval").length;
    const courseIds = educatorCourses.map(c => c._id.toString());
    
    // 2. Get enrollments for these courses
    const allEnrollments = await getDb().collection("course_enrollments").find({}).toArray();
    const educatorEnrollments = allEnrollments.filter(e => {
      const cId = e.courseId?.toString() || e.trainingId?.toString();
      return courseIds.includes(cId);
    });
    
    const totalEnrollments = educatorEnrollments.length;
    const uniqueLearnersSet = new Set(educatorEnrollments.map(e => e.userId));
    const uniqueLearners = uniqueLearnersSet.size;
    
    // 3. Build enrollment trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trendMap = new Map();
    let curr = new Date(thirtyDaysAgo);
    const end = new Date();
    while (curr <= end) {
      trendMap.set(curr.toISOString().split("T")[0], 0);
      curr.setDate(curr.getDate() + 1);
    }
    
    educatorEnrollments.forEach(e => {
      const dateStr = e.enrolledAt ? new Date(e.enrolledAt).toISOString().split("T")[0] : null;
      if (dateStr && trendMap.has(dateStr)) {
        trendMap.set(dateStr, trendMap.get(dateStr) + 1);
      }
    });
    const enrollmentActivity = Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
      
    // 4. Build recent learners list
    const recentEnrollments = educatorEnrollments
      .sort((a, b) => new Date(b.enrolledAt || 0).getTime() - new Date(a.enrolledAt || 0).getTime())
      .slice(0, 8);
      
    const profs = await profiles().find({ _id: { $in: Array.from(uniqueLearnersSet) } }).toArray();
    const profMap = new Map(profs.map(p => [p._id.toString(), p]));
    const courseMap = new Map(educatorCourses.map(c => [c._id.toString(), c]));
    
    const recentLearners = recentEnrollments.map(e => {
      const p = profMap.get(e.userId?.toString());
      const cId = e.courseId?.toString() || e.trainingId?.toString();
      const c = courseMap.get(cId);
      return {
        id: e._id.toString(),
        name: p?.fullName || "Learner",
        courseId: cId,
        courseTitle: c?.title || "Unknown Course",
        enrolledAt: e.enrolledAt,
        academicYear: (p as any)?.academicYear || "Unknown",
        type: c?.isPremium ? "Premium" : "Free"
      };
    });

    res.json({
      kpis: {
        totalCourses,
        liveCourses,
        pendingCourses,
        totalEnrollments,
        uniqueLearners
      },
      enrollmentActivity,
      recentLearners
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

