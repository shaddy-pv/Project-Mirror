import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [
      ...(!projectId ? ["FIREBASE_PROJECT_ID"] : []),
      ...(!clientEmail ? ["FIREBASE_CLIENT_EMAIL"] : []),
      ...(!privateKey ? ["FIREBASE_PRIVATE_KEY"] : []),
    ];
    throw new Error(
      `Missing Firebase Admin environment variable(s): ${missing.join(", ")}. Add them to your .env file.`,
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
