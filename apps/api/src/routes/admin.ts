import { Router } from "express";
import { ObjectId } from "mongodb";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { courses, userRoles, profiles, enrollments, trainings, products, orders, AppRole } from "../collections";
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

const router = Router();

async function requireAdmin(userId: string) {
  const adminRole = await userRoles().findOne({ userId, role: "admin" });
  if (!adminRole) {
    throw new Error("Unauthorized: admin role required");
  }
  return true;
}

async function requireRoles(userId: string, allowedRoles: AppRole[]) {
  const roleDocs = await userRoles().find({ userId }).toArray();
  const roles = roleDocs.map(r => r.role);
  if (roles.includes("admin")) return "admin";
  for (const r of allowedRoles) {
    if (roles.includes(r)) return r;
  }
  throw new Error(`Unauthorized: requires one of ${allowedRoles.join(", ")}`);
}

// @ts-ignore
router.get("/is-admin", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const adminRole = await userRoles().findOne({ userId: req.user!.userId, role: "admin" });
    res.json(!!adminRole);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/users", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const [
      profileDocs,
      roleDocs,
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
      userRoles().find({}).toArray(),
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
        roles: roleDocs.filter((r) => r.userId === p._id).map((r) => r.role),
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

// @ts-ignore
router.get("/courses", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const [docs, enrolls, profs] = await Promise.all([
      courses().find({}).sort({ createdAt: -1 }).toArray(),
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
          id: e.userId,
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
        enrollments: learners.length,
        learners,
      };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/courses", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const role = await requireRoles(req.user!.userId, ["educator"]);
    const now = new Date();
    
    let status = req.body.status || "draft";
    if (role !== "admin" && status === "live") {
      status = "pending_approval";
    }

    const doc = {
      ...req.body,
      status,
      roadmap: req.body.roadmap ?? [],
      createdBy: req.user!.userId,
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
router.get("/courses/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.put("/courses/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const role = await requireRoles(req.user!.userId, ["educator"]);
    const id = String(req.params.id);
    const existing = await courses().findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });

    if (role !== "admin" && existing.createdBy !== req.user!.userId) {
      return res.status(403).json({ error: "Only the creator or an admin can edit this course" });
    }

    let status = req.body.status || existing.status;
    if (role !== "admin" && status === "live") {
      status = "pending_approval";
    }

    await courses().updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, status, updatedAt: new Date() } }
    );
    await cacheDel(COURSES_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/courses/:id/approve", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.patch("/courses/:id/reject", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.delete("/courses/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const id = String(req.params.id);
    await courses().deleteOne({ _id: new ObjectId(id) });
    await cacheDel(COURSES_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/internships", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const [docs, apps] = await Promise.all([
      getDb().collection("internships").find({}).sort({ createdAt: -1 }).toArray(),
      getDb().collection("internship_applications").find({}).toArray(),
    ]);
    const now = new Date();
    res.json(docs.map((d) => {
      const { _id, ...rest } = d;
      const openFrom = rest.openFrom ? new Date(rest.openFrom) : new Date(0);
      const openUntil = rest.openUntil ? new Date(rest.openUntil) : new Date(Date.now() + 120 * 86400000);
      const isOpen = now >= openFrom && now <= openUntil;
      const applicants = apps.filter(a => a.internshipId?.toString() === _id.toString());
      return {
        ...rest,
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

// Helper to calculate timeline based on internship type (Summer, Winter, Spring, Monsoon)
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
    // Spring opens in Dec of previous year
    openFrom = new Date(year - 1, openMonth, 1);
  }
  
  // Active for exactly 4 months from opening
  let openUntil = new Date(openFrom);
  openUntil.setMonth(openUntil.getMonth() + 4);
  
  // If the timeline has already passed entirely this year, schedule for next year
  if (openUntil < now) {
     openFrom.setFullYear(openFrom.getFullYear() + 1);
     openUntil.setFullYear(openUntil.getFullYear() + 1);
  }
  
  return { openFrom, openUntil };
}

// @ts-ignore
router.post("/internships", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const role = await requireRoles(req.user!.userId, ["hr"]);
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
      createdBy: req.user!.userId,
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
router.get("/internships/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const id = String(req.params.id);
    const doc = await getDb().collection("internships").findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: "Not found" });
    const { _id, ...rest } = doc;
    res.json({ ...rest, id: _id.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/internships/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const role = await requireRoles(req.user!.userId, ["hr"]);
    const id = String(req.params.id);
    const data = req.body;

    const existing = await getDb().collection("internships").findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (role !== "admin" && existing.createdBy !== req.user!.userId) {
      return res.status(403).json({ error: "Only the creator or an admin can edit this" });
    }

    let status = data.status || existing.status;
    if (role !== "admin" && status === "open") {
      status = "pending_approval";
    }
    
    const calculated = calculateTimeline(data.type || existing.type || "Summer");
    const openFrom = data.openFrom ? new Date(data.openFrom) : (existing.openFrom ? new Date(existing.openFrom) : calculated.openFrom);
    const openUntil = data.openUntil ? new Date(data.openUntil) : (existing.openUntil ? new Date(existing.openUntil) : calculated.openUntil);
    
    await getDb().collection("internships").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...data,
          company: data.company || existing.company || "Enginow",
          location: data.location || data.locationType || existing.location || "Remote",
          locationType: data.locationType || data.location || existing.locationType || "Remote",
          stipend: data.stipend ?? existing.stipend ?? "Unpaid",
          duration: data.duration || existing.duration || "2 Months",
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
router.patch("/internships/:id/approve", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.patch("/internships/:id/reject", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.delete("/internships/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const id = String(req.params.id);
    await getDb().collection("internships").deleteOne({ _id: new ObjectId(id) });
    await cacheDel(INTERNSHIPS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/stats", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
      profiles().countDocuments(),
      courses().countDocuments(),
      enrollments().countDocuments(),
    ]);
    res.json({ totalUsers, totalCourses, totalEnrollments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/make-admin", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { secretKey } = req.body;
    if (secretKey !== "enginow-admin-2026") {
      return res.status(403).json({ error: "Invalid secret key" });
    }
    await userRoles().updateOne(
      { userId: req.user!.userId, role: "admin" },
      { $setOnInsert: { userId: req.user!.userId, role: "admin" } },
      { upsert: true }
    );
    res.json({ success: true, message: "Admin role granted!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/set-role", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const { targetUserId, role } = req.body;
    if (role === "learner") {
      await userRoles().deleteMany({ userId: targetUserId });
    } else {
      await userRoles().updateOne(
        { userId: targetUserId },
        { $set: { userId: targetUserId, role } },
        { upsert: true }
      );
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Internship Application Management
// ─────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/internship-applications", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const { internshipId } = req.query;

    const filter: Record<string, unknown> = {};
    if (internshipId) filter.internshipId = new ObjectId(String(internshipId));

    const apps = await getDb().collection("internship_applications").find(filter).sort({ appliedAt: -1 }).toArray();

    // Enrich with internship title
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
router.patch("/internship-applications/:id/status", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireRoles(req.user!.userId, ["hr"]); // Allow HR to update statuses
    const id = String(req.params.id);
    const { status } = req.body;

    if (!["pending", "shortlisted", "oa", "selected", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be pending, shortlisted, oa, selected, or rejected." });
    }

    await getDb().collection("internship_applications").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Issue a certificate / document for an accepted intern
// @ts-ignore
router.post("/internship-applications/:id/certificate", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const applicationId = String(req.params.id);

    // Fetch the application to get userId, internshipId
    const app = await getDb().collection("internship_applications").findOne({ _id: new ObjectId(applicationId) });
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (app.status !== "selected") return res.status(400).json({ error: "Can only issue certificates for selected applications" });

    let { type, customDocumentBase64 } = req.body; // "completion" | "lor" | "loe"
    const validTypes = ["completion", "lor", "loe"];
    if (!validTypes.includes(type)) return res.status(400).json({ error: "Invalid certificate type" });

    // Generate unique certificate ID: ENG-YYYY-XXXXXXXX
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
      issuedBy: req.user!.userId,
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

    // Upsert — only one cert of each type per application
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

// Get certificates for an application
// @ts-ignore
router.get("/internship-applications/:id/certificates", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const applicationId = String(req.params.id);
    const certs = await getDb().collection("certificates").find({ applicationId: new ObjectId(applicationId) }).toArray();
    const mapped = certs.map(c => ({ ...c, id: c._id.toString(), _id: undefined }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Trainings ─────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/trainings", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const [docs, enrolls, profs] = await Promise.all([
      trainings().find({}).sort({ createdAt: -1 }).toArray(),
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
          id: e.userId,
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
router.post("/trainings", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const role = await requireRoles(req.user!.userId, ["educator"]);
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
      createdBy: req.user!.userId,
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
router.get("/trainings/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const role = await requireRoles(req.user!.userId, ["educator"]);
    const id = String(req.params.id);
    const doc = await trainings().findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (role !== "admin" && doc.createdBy !== req.user!.userId) {
      return res.status(403).json({ error: "Cannot view others' trainings" });
    }
    const { _id, ...rest } = doc;
    res.json({ ...rest, id: _id.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/trainings/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const role = await requireRoles(req.user!.userId, ["educator"]);
    const id = String(req.params.id);
    
    const existing = await trainings().findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (role !== "admin" && existing.createdBy !== req.user!.userId) {
      return res.status(403).json({ error: "Only the creator or an admin can edit this" });
    }

    let status = req.body.status || existing.status;
    if (role !== "admin" && status === "live") {
      status = "pending_approval";
    }

    await trainings().updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, status, updatedAt: new Date() } }
    );
    await cacheDel(TRAININGS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/trainings/:id/approve", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.patch("/trainings/:id/reject", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.delete("/trainings/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const id = String(req.params.id);
    await trainings().deleteOne({ _id: new ObjectId(id) });
    await cacheDel(TRAININGS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Careers Management
// ─────────────────────────────────────────────────────────────
const CAREERS_CACHE_KEY = "careers:all";

// @ts-ignore
router.get("/careers", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const [docs, apps] = await Promise.all([
      getDb().collection("careers").find({}).sort({ createdAt: -1 }).toArray(),
      getDb().collection("career_applications").find({}).toArray(),
    ]);
    const now = new Date();
    res.json(docs.map((d) => {
      const { _id, ...rest } = d;
      const openFrom = rest.openFrom ? new Date(rest.openFrom) : new Date(0);
      const openUntil = rest.openUntil ? new Date(rest.openUntil) : new Date(Date.now() + 120 * 86400000);
      const isOpen = now >= openFrom && now <= openUntil;
      const applicants = apps.filter(a => a.careerId?.toString() === _id.toString());
      return {
        ...rest,
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
router.post("/careers", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const role = await requireRoles(req.user!.userId, ["hr"]);
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
      createdBy: req.user!.userId,
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
router.get("/careers/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const id = String(req.params.id);
    const doc = await getDb().collection("careers").findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: "Not found" });
    const { _id, ...rest } = doc;
    res.json({ ...rest, id: _id.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/careers/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const role = await requireRoles(req.user!.userId, ["hr"]);
    const id = String(req.params.id);
    const data = req.body;
    
    const existing = await getDb().collection("careers").findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (role !== "admin" && existing.createdBy !== req.user!.userId) {
      return res.status(403).json({ error: "Only the creator or an admin can edit this" });
    }

    let status = data.status || existing.status;
    if (role !== "admin" && status === "open") {
      status = "pending_approval";
    }

    const openFrom = data.openFrom ? new Date(data.openFrom) : (existing.openFrom ? new Date(existing.openFrom) : new Date());
    const openUntil = data.openUntil ? new Date(data.openUntil) : (existing.openUntil ? new Date(existing.openUntil) : new Date(Date.now() + 90 * 86400000));
    
    await getDb().collection("careers").updateOne(
      { _id: new ObjectId(id) },
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
router.patch("/careers/:id/approve", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.patch("/careers/:id/reject", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.delete("/careers/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const id = String(req.params.id);
    await getDb().collection("careers").deleteOne({ _id: new ObjectId(id) });
    await cacheDel(CAREERS_CACHE_KEY);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/career-applications", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const apps = await getDb().collection("career_applications").find({}).sort({ appliedAt: -1 }).toArray();

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
router.put("/career-applications/:id/status", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireRoles(req.user!.userId, ["hr"]);
    const { status } = req.body;
    if (!["pending", "reviewing", "shortlisted", "oa", "selected", "rejected"].includes(status)) {
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

// ─── SHOP PRODUCTS ────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/products", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.post("/products", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.put("/products/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.delete("/products/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    await products().deleteOne({ _id: new ObjectId(String(req.params.id)) });
    cacheDel("shop:products");
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── SHOP ORDERS ────────────────────────────────────────────────────────────

// @ts-ignore
router.get("/orders", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
    const docs = await orders().find({}).sort({ createdAt: -1 }).toArray();
    
    // Fetch product details
    const prods = await products().find({}).toArray();
    const prodMap = new Map(prods.map(p => [p._id.toString(), p]));

    // Fetch user details
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
router.put("/orders/:id/tracking", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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

export default router;
