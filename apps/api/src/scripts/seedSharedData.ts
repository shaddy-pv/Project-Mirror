import { ObjectId } from "mongodb";
import { getDb, getMongoClient } from "../db";
import dotenv from "dotenv";

dotenv.config();

const EDUCATORS = [
  "Rahul Sharma",
  "Priya Desai",
  "Anil Kapoor",
  "Sneha Reddy"
];

const COURSES = [
  { slug: "full-stack-web", title: "Full Stack Web Development", category: "Development", isPremium: true, isFree: false, price: 5000 },
  { slug: "ai-basics", title: "Artificial Intelligence Basics", category: "AI", isPremium: false, isFree: true, price: 0 },
  { slug: "machine-learning-python", title: "Machine Learning with Python", category: "AI", isPremium: true, isFree: false, price: 4500 },
  { slug: "data-analytics", title: "Data Analytics Mastery", category: "Data Science", isPremium: true, isFree: false, price: 3500 },
  { slug: "react-dev", title: "React Development Bootcamp", category: "Development", isPremium: true, isFree: false, price: 2000 },
  { slug: "ui-ux-design", title: "UI/UX Design Principles", category: "Design", isPremium: false, isFree: true, price: 0 },
  { slug: "cybersecurity-intro", title: "Introduction to Cybersecurity", category: "Cybersecurity", isPremium: false, isFree: true, price: 0 },
  { slug: "cloud-computing", title: "Cloud Computing AWS", category: "Cloud", isPremium: true, isFree: false, price: 6000 }
];

const FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Priya", "Ananya", "Riya", "Aadhya", "Diya", "Sanya", "Nisha", "Kavya", "Sneha", "Neha", "Rahul", "Karan", "Rohit", "Vikram", "Ajay"];
const LAST_NAMES = ["Sharma", "Verma", "Singh", "Gupta", "Kumar", "Patel", "Reddy", "Rao", "Das", "Joshi", "Bose", "Chauhan", "Yadav", "Mehta", "Iyer"];

const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated"];

function generateName() {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}

function generateReferralCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed() {
  try {
    const db = getDb();
    
    console.log("Clearing existing dummy data...");
    // Clear relevant collections
    await db.collection("courses").deleteMany({});
    await db.collection("trainings").deleteMany({});
    await db.collection("profiles").deleteMany({});
    await db.collection("course_enrollments").deleteMany({});
    await db.collection("referrals").deleteMany({});
    await db.collection("inquiries").deleteMany({});
    await db.collection("blogs").deleteMany({});
    await db.collection("resources").deleteMany({});

    console.log("Fetching demo Educator...");
    const educatorAcc = await db.collection("staff_accounts").findOne({ email: "educator@enginow.in" });
    const demoEducatorId = educatorAcc ? educatorAcc._id.toString() : "demo_educator_id";
    const demoEducatorName = educatorAcc ? educatorAcc.name : "Lead Educator";

    console.log("Seeding Courses...");
    const courseDocs = COURSES.map((c, i) => {
      const isOwnedByDemo = i < 4; // Assign half to demo educator
      return {
        _id: new ObjectId(),
      slug: c.slug,
      title: c.title,
      category: c.category,
      level: "Beginner",
      price: c.price,
      isFree: c.isFree,
      isPremium: c.isPremium,
      isNew: Math.random() > 0.7,
      isPopular: Math.random() > 0.6,
      isComingSoon: false,
      roadmap: [],
      createdBy: isOwnedByDemo ? demoEducatorName : EDUCATORS[Math.floor(Math.random() * EDUCATORS.length)],
      authorId: isOwnedByDemo ? demoEducatorId : undefined,
      status: isOwnedByDemo && i === 3 ? "pending_approval" : (isOwnedByDemo && i === 2 ? "draft" : "live"),
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      updatedAt: new Date()
      };
    });
    await db.collection("courses").insertMany(courseDocs);

    console.log("Seeding Trainings...");
    const TRAININGS = [
      { slug: "mern-bootcamp", title: "MERN Stack Bootcamp", category: "Development", price: 15000 },
      { slug: "data-science-pro", title: "Data Science Professional", category: "Data Science", price: 18000 },
      { slug: "cloud-architect", title: "Cloud Architect Masterclass", category: "Cloud", price: 20000 }
    ];
    const trainingDocs = TRAININGS.map((t, i) => {
      const isOwnedByDemo = i === 0;
      return {
        _id: new ObjectId(),
        slug: t.slug,
        title: t.title,
        category: t.category,
        level: "Intermediate",
        originalPrice: t.price + 5000,
        discountedPrice: t.price,
        roadmap: [],
        createdBy: isOwnedByDemo ? demoEducatorName : EDUCATORS[Math.floor(Math.random() * EDUCATORS.length)],
        authorId: isOwnedByDemo ? demoEducatorId : undefined,
        status: "live",
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
    });
    await db.collection("trainings").insertMany(trainingDocs);

    console.log("Seeding Profiles (Students)...");
    const numStudents = 200;
    const profiles = [];
    for (let i = 0; i < numStudents; i++) {
      const name = generateName();
      profiles.push({
        _id: `mock-user-${i}`,
        fullName: name,
        email: `${name.replace(" ", ".").toLowerCase()}@example.com`,
        collegeName: "Mock Engineering College",
        course: "B.Tech",
        academicYear: ACADEMIC_YEARS[Math.floor(Math.random() * ACADEMIC_YEARS.length)],
        referralCode: generateReferralCode(),
        referralUsageCount: Math.floor(Math.random() * 5),
        createdAt: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date()), // last 6 months
        updatedAt: new Date()
      });
    }
    // @ts-ignore
    await db.collection("profiles").insertMany(profiles);

    console.log("Seeding Enrollments...");
    const enrollments = [];
    // Last 6 months for trends
    const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000); 
    const endDate = new Date();

    const referrals = [];

    for (let i = 0; i < 500; i++) { // 500 enrollments
      const student = profiles[Math.floor(Math.random() * profiles.length)];
      const isTraining = Math.random() > 0.8; // 20% are trainings
      const item = isTraining 
        ? trainingDocs[Math.floor(Math.random() * trainingDocs.length)] 
        : courseDocs[Math.floor(Math.random() * courseDocs.length)];
        
      const enrollDate = randomDate(student.createdAt, endDate);
      
      const usedReferral = Math.random() > 0.7;
      let refCode = undefined;
      if (usedReferral) {
        const referrer = profiles[Math.floor(Math.random() * profiles.length)];
        refCode = referrer.referralCode;
        referrals.push({
          _id: new ObjectId(),
          referralCode: refCode,
          referrerId: referrer._id,
          referredUserId: student._id,
          resourceType: isTraining ? "training" : "course",
          resourceId: item._id.toString(),
          usedAt: enrollDate,
          discountApplied: 500
        });
      }
      
      enrollments.push({
        _id: new ObjectId(),
        userId: student._id,
        courseId: isTraining ? undefined : item._id,
        trainingId: isTraining ? item._id : undefined,
        enrolledAt: enrollDate,
        progress: Math.floor(Math.random() * 100),
        referralCode: refCode
      });
    }
    await db.collection("course_enrollments").insertMany(enrollments);
    if (referrals.length > 0) {
      await db.collection("referrals").insertMany(referrals);
    }

    console.log("Seeding Inquiries (Leads)...");
    const inquiries = [];
    const INQUIRY_STATUSES = ["New", "Contacted", "Converted", "Lost"];
    for (let i = 0; i < 60; i++) {
      const name = generateName();
      inquiries.push({
        _id: new ObjectId(),
        name,
        email: `${name.replace(" ", ".").toLowerCase()}@example.com`,
        phone: `+91 ${Math.floor(9000000000 + Math.random() * 1000000000)}`,
        message: "I am interested in joining a course.",
        category: ["Sales", "Career", "Custom"][Math.floor(Math.random() * 3)],
        status: INQUIRY_STATUSES[Math.floor(Math.random() * INQUIRY_STATUSES.length)],
        createdAt: randomDate(startDate, endDate)
      });
    }
    await db.collection("inquiries").insertMany(inquiries);

    console.log("Seeding Blogs...");
    const blogs = [
      {
        _id: new ObjectId(),
        title: "Introduction to React Hooks",
        excerpt: "Learn how to use React Hooks to manage state and side effects.",
        content: "<p>React Hooks are a powerful feature...</p>",
        status: "published",
        authorId: demoEducatorId,
        author: demoEducatorName,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        _id: new ObjectId(),
        title: "The Future of AI in Education",
        excerpt: "Exploring how AI will transform the way we learn.",
        content: "<p>Artificial intelligence is rapidly changing...</p>",
        status: "pending_approval",
        authorId: demoEducatorId,
        author: demoEducatorName,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection("blogs").insertMany(blogs);

    console.log("Seeding Resources...");
    const resources = [
      {
        _id: new ObjectId(),
        title: "React Cheatsheet.pdf",
        description: "A quick reference guide for React developers.",
        fileUrl: "https://example.com/react-cheatsheet.pdf",
        authorId: demoEducatorId,
        author: demoEducatorName,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection("resources").insertMany(resources);

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    const client = getMongoClient();
    if (client) {
      await client.close();
    }
  }
}

seed();
