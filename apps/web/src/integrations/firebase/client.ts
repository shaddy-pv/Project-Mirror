// Firebase Auth client — browser-side only.
// Usage: import { firebaseAuth, googleProvider, githubProvider } from "@/integrations/firebase/client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Avoid re-initializing on HMR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);

// Persist session in localStorage — survives page refreshes.
// Firebase silently refreshes the underlying ID token every hour.
if (typeof window !== "undefined") {
  setPersistence(firebaseAuth, browserLocalPersistence).catch(console.error);
}

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
