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
  isAuthenticated: Boolean(initialAuth && initialAuth.user.role === "hr"),
  role: initialAuth?.user?.role || "hr",
  name: initialAuth?.user?.name || "HR Staff",
  email: initialAuth?.user?.email || "hr@enginow.in",

  login: async (identifier, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, portal: "hr" }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Invalid credentials or unauthorized" };
      }

      const user = data.staff || data.user;
      if (!user || user.role !== "hr") {
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
    } catch {
      // Fallback
      const id = identifier.toLowerCase().trim();
      if (id === "hr@enginow.in" || id === "hr") {
        if (password === "password@123") {
          const authData: StoredAuth = {
            token: "mock-hr-token-" + Date.now(),
            user: { id: "hr-1", name: "Priya Raghavan", email: "hr@enginow.in", role: "hr" },
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
          set({
            isAuthenticated: true,
            role: "hr",
            name: "Priya Raghavan",
            email: "hr@enginow.in",
          });
          return { success: true };
        } else {
          return { success: false, error: "Incorrect password." };
        }
      } else if (["admin@enginow.in", "educator@enginow.in", "sales@enginow.in", "admin", "educator", "sales"].includes(id)) {
        return { success: false, error: `Access denied: ${id} is not an HR account and cannot access the HR panel.` };
      } else {
        return { success: false, error: "Invalid staff identifier or password." };
      }
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      isAuthenticated: false,
      role: "hr",
      name: "HR Staff",
      email: "hr@enginow.in",
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
