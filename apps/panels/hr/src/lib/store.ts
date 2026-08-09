import { create } from "zustand";

export type Role = "hr" | "admin" | "educator" | "sales";

const STORAGE_KEY = "enginow_hr_auth";

interface StoredAuth {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

interface SessionState {
  isAuthenticated: boolean;
  role: Role;
  name: string;
  email: string;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const initialAuth = getStoredAuth();

export const useSession = create<SessionState>((set) => ({
  isAuthenticated: Boolean(initialAuth && (initialAuth.user.role === "hr" || initialAuth.user.role === "admin")),
  role: initialAuth?.user?.role || "hr",
  name: initialAuth?.user?.name || "",
  email: initialAuth?.user?.email || "",

  login: async (identifier, password) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, portal: "hr" }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Invalid credentials or unauthorized" };
      }

      const user = data.staff || data.user;
      if (!user || (user.role !== "hr" && user.role !== "admin")) {
        return { success: false, error: "Access denied: This account is not authorized for the HR panel." };
      }

      const authData: StoredAuth = {
        token: data.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      set({
        isAuthenticated: true,
        role: "hr",
        name: user.name || "HR Staff",
        email: user.email || identifier,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to connect to authentication server." };
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      isAuthenticated: false,
      role: "hr",
      name: "",
      email: "",
    });
  },
}));

interface UiState {
  applicantDrawerId: string | null;
  openApplicant: (id: string) => void;
  closeApplicant: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  applicantDrawerId: null,
  openApplicant: (id) => set({ applicantDrawerId: id }),
  closeApplicant: () => set({ applicantDrawerId: null }),
}));
