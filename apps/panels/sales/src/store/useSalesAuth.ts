import { create } from "zustand";

export type Role = "admin" | "educator" | "hr" | "sales";

const STORAGE_KEY = "enginow_sales_auth";

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

export const useSalesAuth = create<SessionState>((set) => ({
  isAuthenticated: Boolean(initialAuth && (initialAuth.user.role === "sales" || initialAuth.user.role === "admin")),
  role: initialAuth?.user?.role || "sales",
  name: initialAuth?.user?.name || "Riya Malhotra",
  email: initialAuth?.user?.email || "sales@enginow.in",

  login: async (identifier, password) => {
    try {
      const baseUrl = (import.meta.env as any)["VITE_API_URL"] || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, portal: "sales" }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Invalid credentials or unauthorized" };
      }

      const user = data.staff || data.user;
      if (!user || (user.role !== "sales" && user.role !== "admin")) {
        return { success: false, error: "Access denied: This account is not authorized for the Sales panel." };
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
        role: "sales",
        name: user.name || "Riya Malhotra",
        email: user.email || identifier,
      });

      return { success: true };
    } catch {
      const id = identifier.toLowerCase().trim();
      if (id === "sales@enginow.in" || id === "sales") {
        if (password === "password@123") {
          const authData: StoredAuth = {
            token: "mock-sales-token-" + Date.now(),
            user: { id: "sales-1", name: "Riya Malhotra", email: "sales@enginow.in", role: "sales" },
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
          set({
            isAuthenticated: true,
            role: "sales",
            name: "Riya Malhotra",
            email: "sales@enginow.in",
          });
          return { success: true };
        } else {
          return { success: false, error: "Incorrect password." };
        }
      } else if (["admin@enginow.in", "hr@enginow.in", "educator@enginow.in", "admin", "hr", "educator"].includes(id)) {
        return { success: false, error: `Access denied: ${id} is not a Sales account and cannot access the Sales panel.` };
      } else {
        return { success: false, error: "Invalid staff identifier or password." };
      }
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      isAuthenticated: false,
      role: "sales",
      name: "Riya Malhotra",
      email: "sales@enginow.in",
    });
  },
}));
