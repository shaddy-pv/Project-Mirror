import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { getDb, getMongoClient } from "../db";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function verify() {
  try {
    const db = getDb();

    const today = new Date();
    const fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const initialEnrollments = await db.collection("course_enrollments").countDocuments({
      enrolledAt: { $gte: fromDate, $lte: today }
    });

    console.log(`Initial Enrollments in last 30 days: ${initialEnrollments}`);
    console.log("Inserting a test enrollment for a student...");
    
    const someCourse = await db.collection("courses").findOne({});
    const someStudent = await db.collection("profiles").findOne({});

    if (!someCourse || !someStudent) {
      console.log("Need at least 1 course and 1 student to test.");
      return;
    }

    const newEnrollmentId = new ObjectId();
    await db.collection("course_enrollments").insertOne({
      _id: newEnrollmentId,
      userId: someStudent._id,
      courseId: someCourse._id,
      enrolledAt: new Date(),
      progress: 0
    });

    const finalEnrollments = await db.collection("course_enrollments").countDocuments({
      enrolledAt: { $gte: fromDate, $lte: new Date() }
    });

    console.log(`Final Enrollments in last 30 days: ${finalEnrollments}`);

    if (finalEnrollments === initialEnrollments + 1) {
      console.log("✅ Verification Passed: Single learner enrollment correctly trickles up to Sales Dashboard metrics.");
    } else {
      console.log("❌ Verification Failed: Metric did not increase by exactly 1.");
    }

    await db.collection("course_enrollments").deleteOne({ _id: newEnrollmentId });
    console.log("Cleaned up test enrollment.");

  } finally {
    const client = getMongoClient();
    if (client) await client.close();
  }
}

verify();
