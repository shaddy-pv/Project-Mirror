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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB-DevPlaceholderKeyForEnginow123456",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "enginow-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "enginow-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "enginow-app.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef",
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
