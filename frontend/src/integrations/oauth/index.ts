// OAuth helper using Firebase Auth.
// Supports Google and GitHub sign-in via popup.

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { firebaseAuth, googleProvider, githubProvider } from "@/integrations/firebase/client";

type OAuthProvider = "google" | "github";

export const auth = {
  signInWithOAuth: async (provider: OAuthProvider): Promise<{ user: UserCredential["user"] | null; error?: Error }> => {
    try {
      const p = provider === "google" ? googleProvider : githubProvider;
      const result = await signInWithPopup(firebaseAuth, p);
      return { user: result.user };
    } catch (err) {
      return { user: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return { user: result.user };
    } catch (err) {
      return { user: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      return { user: result.user };
    } catch (err) {
      return { user: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  signOut: async () => {
    await signOut(firebaseAuth);
  },
};
