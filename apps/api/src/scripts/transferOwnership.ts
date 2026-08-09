import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI");

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("enginow");

  const targetAccount = await db.collection("staff_accounts").findOne({ email: "shadanmd566@gmail.com" });
  if (!targetAccount) {
    console.log("Account not found!");
    await client.close();
    return;
  }
  
  const newAuthorId = targetAccount._id.toString();
  const newCreatedBy = targetAccount.name;
  
  console.log("Found account:", targetAccount.email, "| ID:", newAuthorId, "| Name:", newCreatedBy);
  
  // Update all courses
  const result = await db.collection("courses").updateMany(
    {}, 
    { $set: { authorId: newAuthorId, createdBy: newCreatedBy } }
  );
  console.log("Updated courses count:", result.modifiedCount);

  // Update trainings
  const tResult = await db.collection("trainings").updateMany(
    {}, 
    { $set: { authorId: newAuthorId, createdBy: newCreatedBy } }
  );
  console.log("Updated trainings count:", tResult.modifiedCount);

  // Update resources
  const rResult = await db.collection("resources").updateMany(
    {}, 
    { $set: { authorId: newAuthorId, createdBy: newCreatedBy } }
  );
  console.log("Updated resources count:", rResult.modifiedCount);

  // Update blogs
  const bResult = await db.collection("blogs").updateMany(
    {}, 
    { $set: { authorId: newAuthorId, createdBy: newCreatedBy } }
  );
  console.log("Updated blogs count:", bResult.modifiedCount);

  await client.close();
}

run().catch(console.error);
