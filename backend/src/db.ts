import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

let mongoClient: MongoClient | undefined;

function createClient(): MongoClient {
  return new MongoClient(MONGODB_URI!, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

export function getMongoClient(): MongoClient {
  if (!mongoClient) {
    mongoClient = createClient();
  }
  return mongoClient;
}

export function getDb(dbName = "enginow") {
  return getMongoClient().db(dbName);
}
