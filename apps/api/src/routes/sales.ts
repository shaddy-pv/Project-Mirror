import { Router } from "express";
import { getDb } from "../db";
import { requireStaffAuth, AuthenticatedStaffRequest } from "./staffAuth";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const router = Router();

// @ts-ignore
router.get("/dashboard", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    if (!req.staff || (req.staff.role !== "admin" && req.staff.role !== "sales")) {
      return res.status(403).json({ error: "Unauthorized: sales or admin role required" });
    }

    const { from, to, course, category, year, type } = req.query;

    const fromDate = from ? dayjs(from as string).startOf('day').toDate() : dayjs().subtract(30, 'days').toDate();
    const toDate = to ? dayjs(to as string).endOf('day').toDate() : dayjs().toDate();

    const previousFromDate = dayjs(fromDate).subtract(dayjs(toDate).diff(dayjs(fromDate), 'day'), 'day').toDate();
    const previousToDate = fromDate;

    // Filters
    const enrollmentMatch: any = {};
    if (course) {
      enrollmentMatch.$or = [
        { courseId: new ObjectId(course as string) },
        { trainingId: new ObjectId(course as string) }
      ];
    }

    // Fetch data
    const db = getDb();
    const [
      allCourses,
      allTrainings,
      allProfiles,
      currentEnrollments,
      previousEnrollments,
      currentInquiries
    ] = await Promise.all([
      db.collection("courses").find({}).toArray(),
      db.collection("trainings").find({}).toArray(),
      db.collection("profiles").find({}).toArray(),
      db.collection("course_enrollments").find({ 
        ...enrollmentMatch, 
        enrolledAt: { $gte: fromDate, $lte: toDate } 
      }).toArray(),
      db.collection("course_enrollments").find({ 
        ...enrollmentMatch, 
        enrolledAt: { $gte: previousFromDate, $lt: previousToDate } 
      }).toArray(),
      db.collection("inquiries").find({ 
        createdAt: { $gte: fromDate, $lte: toDate } 
      }).toArray()
    ]);

    // Apply category filter in memory for simplicity (in a real app, do this in aggregation)
    let filteredCourses = allCourses;
    let filteredTrainings = allTrainings;
    if (category) {
      filteredCourses = allCourses.filter(c => c.category === category);
      filteredTrainings = allTrainings.filter(t => t.category === category);
    }
    const filteredResourceIds = [
      ...filteredCourses.map(c => c._id.toString()),
      ...filteredTrainings.map(t => t._id.toString())
    ];
    
    const validCurrentEnrollments = currentEnrollments.filter(e => {
      const id = e.courseId ? e.courseId.toString() : (e.trainingId ? e.trainingId.toString() : null);
      if (!id || !filteredResourceIds.includes(id)) return false;
      
      const profile = allProfiles.find(p => p._id.toString() === e.userId.toString());
      if (year && profile?.academicYear !== year) return false;
      
      if (type) {
        const isFree = type === "Free";
        const isPremium = type === "Premium";
        if (e.courseId) {
          const c = allCourses.find(c => c._id.toString() === id);
          if (isFree && c?.isPremium) return false;
          if (isPremium && c?.isFree) return false;
        } else if (e.trainingId) {
          // Trainings are always paid/premium in our model, unless we add isFree
          if (isFree) return false;
        }
      }
      
      return true;
    });
    
    const validPreviousEnrollments = previousEnrollments.filter(e => {
      const id = e.courseId ? e.courseId.toString() : (e.trainingId ? e.trainingId.toString() : null);
      if (!id || !filteredResourceIds.includes(id)) return false;
      
      const profile = allProfiles.find(p => p._id.toString() === e.userId.toString());
      if (year && profile?.academicYear !== year) return false;
      
      if (type) {
        const isFree = type === "Free";
        const isPremium = type === "Premium";
        if (e.courseId) {
          const c = allCourses.find(c => c._id.toString() === id);
          if (isFree && c?.isPremium) return false;
          if (isPremium && c?.isFree) return false;
        } else if (e.trainingId) {
          if (isFree) return false;
        }
      }
      
      return true;
    });

    // 1. KPIs
    const totalEnrollments = validCurrentEnrollments.length;
    const previousTotalEnrollments = validPreviousEnrollments.length;
    const enrollmentGrowth = previousTotalEnrollments === 0 ? 100 : Math.round(((totalEnrollments - previousTotalEnrollments) / previousTotalEnrollments) * 100);

    const activeLearners = new Set(validCurrentEnrollments.map(e => e.userId.toString())).size;
    
    const premiumEnrollments = validCurrentEnrollments.filter(e => {
      if (!e.courseId) return false;
      const c = allCourses.find(c => c._id.toString() === e.courseId.toString());
      return c?.isPremium;
    }).length;

    const totalLeads = currentInquiries.length;
    const convertedLeads = currentInquiries.filter(i => i.status === "Converted").length;
    const conversionRate = totalLeads === 0 ? 0 : Math.round((convertedLeads / totalLeads) * 100);

    // 2. Enrollment Trend (group by week or day based on range)
    const daysDiff = dayjs(toDate).diff(dayjs(fromDate), 'day');
    const groupBy = daysDiff > 60 ? 'month' : (daysDiff > 14 ? 'week' : 'day');
    
    const trendMap = new Map();
    validCurrentEnrollments.forEach(e => {
      const key = dayjs(e.enrolledAt).startOf(groupBy).format('YYYY-MM-DD');
      trendMap.set(key, (trendMap.get(key) || 0) + 1);
    });
    
    // Fill empty dates
    const enrollmentTrend = [];
    let curr = dayjs(fromDate).startOf(groupBy);
    const end = dayjs(toDate).startOf(groupBy);
    
    while (curr.isBefore(end) || curr.isSame(end, 'day')) {
      const key = curr.format('YYYY-MM-DD');
      enrollmentTrend.push({ date: key, count: trendMap.get(key) || 0 });
      curr = curr.add(1, groupBy);
    }

    // 3. Free vs Premium
    const freeVsPremium = [
      { name: "Premium", value: premiumEnrollments },
      { name: "Free", value: totalEnrollments - premiumEnrollments }
    ];

    // 4. Student Year Distribution
    const yearMap = new Map();
    validCurrentEnrollments.forEach(e => {
      const profile = allProfiles.find(p => p._id.toString() === e.userId.toString());
      const year = profile?.academicYear || "Unknown";
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
    });
    const studentYearDistribution = Array.from(yearMap.entries()).map(([year, count]) => ({ year, count }));

    // 5. Course Performance
    const courseMap = new Map();
    validCurrentEnrollments.forEach(e => {
      if (e.courseId) {
        const cId = e.courseId.toString();
        courseMap.set(cId, (courseMap.get(cId) || 0) + 1);
      }
    });
    const coursePerformance = Array.from(courseMap.entries()).map(([cId, enrollments]) => {
      const c = allCourses.find(course => course._id.toString() === cId);
      return {
        id: cId,
        title: c?.title || "Unknown",
        category: c?.category || "Unknown",
        type: c?.isPremium ? "Premium" : "Free",
        enrollments,
        revenue: (c?.price || 0) * enrollments
      };
    }).sort((a, b) => b.enrollments - a.enrollments);

    // Training Performance
    const trainingMap = new Map();
    validCurrentEnrollments.forEach(e => {
      if (e.trainingId) {
        const tId = e.trainingId.toString();
        trainingMap.set(tId, (trainingMap.get(tId) || 0) + 1);
      }
    });
    
    const previousTrainingMap = new Map();
    validPreviousEnrollments.forEach(e => {
      if (e.trainingId) {
        const tId = e.trainingId.toString();
        previousTrainingMap.set(tId, (previousTrainingMap.get(tId) || 0) + 1);
      }
    });

    const trainingPerformance = Array.from(trainingMap.entries()).map(([tId, registrations]) => {
      const t = allTrainings.find(train => train._id.toString() === tId);
      const prevReg = previousTrainingMap.get(tId) || 0;
      const growth = prevReg === 0 ? 100 : Math.round(((registrations - prevReg) / prevReg) * 100);
      return {
        id: tId,
        title: t?.title || "Unknown",
        registrations,
        growth,
        status: t?.status || "Unknown",
        popularity: registrations > 20 ? "High" : (registrations > 5 ? "Medium" : "Low")
      };
    }).sort((a, b) => b.registrations - a.registrations);

    // Referral Analytics
    const referralEnrollments = validCurrentEnrollments.filter(e => !!e.referralCode);
    const totalReferralEnrollments = referralEnrollments.length;
    
    const referrerMap = new Map();
    referralEnrollments.forEach(e => {
      referrerMap.set(e.referralCode, (referrerMap.get(e.referralCode) || 0) + 1);
    });
    
    let topReferralSource = "None";
    if (referrerMap.size > 0) {
      const topCode = Array.from(referrerMap.entries()).sort((a, b) => b[1] - a[1])[0][0];
      const topProfile = allProfiles.find(p => p.referralCode === topCode);
      topReferralSource = topProfile ? topProfile.fullName || topProfile.email : topCode;
    }
    
    const referralAnalytics = {
      totalReferralEnrollments,
      referralConversions: totalReferralEnrollments, // For simplicity, enrollments = conversions
      topReferralSource,
      referralContribution: totalEnrollments === 0 ? 0 : Math.round((totalReferralEnrollments / totalEnrollments) * 100)
    };

    // 6. Category Performance
    const categoryMap = new Map();
    coursePerformance.forEach(c => {
      categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + c.enrollments);
    });
    trainingPerformance.forEach(t => {
      const category = allTrainings.find(train => train._id.toString() === t.id)?.category || "Unknown";
      categoryMap.set(category, (categoryMap.get(category) || 0) + t.registrations);
    });
    const categoryPerformance = Array.from(categoryMap.entries()).map(([category, enrollments]) => ({ category, enrollments }));

    // Insights
    const topCourse = coursePerformance.length > 0 ? coursePerformance[0].title : null;
    
    const sortedYears = [...studentYearDistribution].sort((a, b) => {
      const order = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated"];
      const iA = order.indexOf(a.year);
      const iB = order.indexOf(b.year);
      return (iA > -1 ? iA : 99) - (iB > -1 ? iB : 99);
    });
    // For insight card we want the largest demographic:
    const topYear = [...studentYearDistribution].sort((a, b) => b.count - a.count)[0]?.year;
    
    const enrollmentTrendInsight = enrollmentGrowth > 0 
      ? `Enrollments increased ${enrollmentGrowth}% compared with the previous period.` 
      : enrollmentGrowth < 0 
      ? `Enrollments decreased ${Math.abs(enrollmentGrowth)}% compared with the previous period.`
      : `Enrollments remained steady compared with the previous period.`;

    res.json({
      kpis: {
        totalEnrollments,
        enrollmentGrowth,
        activeLearners,
        premiumEnrollments,
        totalLeads,
        conversionRate
      },
      charts: {
        enrollmentTrend,
        freeVsPremium,
        studentYearDistribution,
        coursePerformance,
        categoryPerformance,
        trainingPerformance,
        referralAnalytics
      },
      recentLeads: currentInquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
      insights: {
        topCourse,
        topYear,
        enrollmentTrend: enrollmentTrendInsight
      }
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Also need a route to fetch inquiries specifically for the inquiries tab
// @ts-ignore
router.get("/inquiries", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    const db = getDb();
    const inquiries = await db.collection("inquiries").find({}).sort({ createdAt: -1 }).toArray();
    res.json(inquiries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
