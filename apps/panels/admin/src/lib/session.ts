import { create } from "zustand";
import type { Role } from "@/lib/types";

export type ModuleKey =
  | "dashboard"
  | "approvals"
  | "users"
  | "courses"
  | "internships"
  | "careers"
  | "shop"
  | "blogs"
  | "settings";

export const ACCESS: Record<Role, ModuleKey[]> = {
  admin: ["dashboard", "approvals", "users", "courses", "internships", "careers", "shop", "blogs", "settings"],
  educator: ["dashboard", "courses", "blogs", "settings"],
  hr: ["dashboard", "internships", "careers", "blogs", "settings"],
  sales: ["dashboard", "shop", "blogs", "settings"],
};

export function canAccess(role: Role, module: ModuleKey) {
  return ACCESS[role]?.includes(module) ?? false;
}

export function canApprove(role: Role) {
  return role === "admin";
}

const STORAGE_KEY = "enginow_panel_auth";

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
    // Try new key first, fall back to old key for backwards compat
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("enginow_admin_auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Migrate to new key if using old
    if (!localStorage.getItem(STORAGE_KEY) && parsed) {
      localStorage.setItem(STORAGE_KEY, raw);
      localStorage.removeItem("enginow_admin_auth");
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Returns the current JWT token for authenticated API calls */
export function getAuthToken(): string | null {
  const auth = getStoredAuth();
  return auth?.token ?? null;
}

interface SessionState {
  isAuthenticated: boolean;
  role: Role;
  name: string;
  email: string;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const STAFF_ROLES: Role[] = ["admin", "educator", "hr", "sales"];
const initialAuth = getStoredAuth();

export const useSession = create<SessionState>((set) => ({
  isAuthenticated: Boolean(initialAuth?.token && STAFF_ROLES.includes(initialAuth.user?.role as Role)),
  role: (initialAuth?.user?.role as Role) || "admin",
  name: initialAuth?.user?.name || "Staff",
  email: initialAuth?.user?.email || "",

  login: async (identifier, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Invalid credentials" };
      }

      const user = data.staff || data.user;
      if (!user || !STAFF_ROLES.includes(user.role as Role)) {
        return { success: false, error: "Access denied: This account is not a staff account." };
      }

      const authData: StoredAuth = {
        token: data.token,
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      set({
        isAuthenticated: true,
        role: user.role as Role,
        name: user.name,
        email: user.email,
      });

      return { success: true };
    } catch {
      // Offline / local-dev fallback
      const id = identifier.toLowerCase().trim();
      const fallbacks: Record<string, { name: string; role: Role }> = {
        "admin@enginow.in": { name: "Admin Lead", role: "admin" },
        "admin":             { name: "Admin Lead", role: "admin" },
        "hr@enginow.in":     { name: "HR Manager", role: "hr" },
        "hr":                { name: "HR Manager", role: "hr" },
        "educator@enginow.in": { name: "Dr. Aris Thorne", role: "educator" },
        "educator":          { name: "Dr. Aris Thorne", role: "educator" },
        "sales@enginow.in":  { name: "Riya Malhotra", role: "sales" },
        "sales":             { name: "Riya Malhotra", role: "sales" },
      };

      const match = fallbacks[id];
      if (match && password === "password@123") {
        const authData: StoredAuth = {
          token: `mock-${match.role}-token-` + Date.now(),
          user: { id: `${match.role}-1`, name: match.name, email: id.includes("@") ? id : `${id}@enginow.in`, role: match.role },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
        set({ isAuthenticated: true, role: match.role, name: match.name, email: authData.user.email });
        return { success: true };
      }

      if (match) return { success: false, error: "Incorrect password." };
      return { success: false, error: "No staff account found with that email." };
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ isAuthenticated: false, role: "admin", name: "Staff", email: "" });
  },
}));
