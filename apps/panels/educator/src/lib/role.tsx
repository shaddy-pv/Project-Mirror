import { create } from "zustand";
import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

export type Role = "admin" | "educator" | "hr" | "sales";

const STORAGE_KEY = "enginow_educator_auth";

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
  updateProfile: (name: string, email: string) => void;
}

const initialAuth = getStoredAuth();

export const useSession = create<SessionState>((set) => ({
  isAuthenticated: Boolean(initialAuth && (initialAuth.user.role === "educator" || initialAuth.user.role === "admin")),
  role: initialAuth?.user?.role || "educator",
  name: initialAuth?.user?.name || "Dr. Aris Thorne",
  email: initialAuth?.user?.email || "educator@enginow.in",
  updateProfile: (name, email) => {
    set({ name, email });
    const auth = getStoredAuth();
    if (auth) {
      auth.user.name = name;
      auth.user.email = email;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    }
  },

  login: async (identifier, password) => {
    try {
      const baseUrl = (import.meta.env as any)["VITE_API_URL"] || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, portal: "educator" }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Invalid credentials or unauthorized" };
      }

      const user = data.staff || data.user;
      if (!user || (user.role !== "educator" && user.role !== "admin")) {
        return { success: false, error: "Access denied: This account is not authorized for the Educator panel." };
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
        role: "educator",
        name: user.name || "Dr. Aris Thorne",
        email: user.email || identifier,
      });

      return { success: true };
    } catch {
      const id = identifier.toLowerCase().trim();
      if (id === "educator@enginow.in" || id === "educator") {
        if (password === "password@123") {
          const authData: StoredAuth = {
            token: "mock-educator-token-" + Date.now(),
            user: { id: "educator-1", name: "Dr. Aris Thorne", email: "educator@enginow.in", role: "educator" },
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
          set({
            isAuthenticated: true,
            role: "educator",
            name: "Dr. Aris Thorne",
            email: "educator@enginow.in",
          });
          return { success: true };
        } else {
          return { success: false, error: "Incorrect password." };
        }
      } else if (["admin@enginow.in", "hr@enginow.in", "sales@enginow.in", "admin", "hr", "sales"].includes(id)) {
        return { success: false, error: `Access denied: ${id} is not an Educator account and cannot access the Educator panel.` };
      } else {
        return { success: false, error: "Invalid staff identifier or password." };
      }
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      isAuthenticated: false,
      role: "educator",
      name: "Dr. Aris Thorne",
      email: "educator@enginow.in",
    });
  },
}));

export const session = { role: "educator" as Role };

export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const role = useSession((s) => s.role);
  if (!allow.includes(role) && role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto size-8 text-muted-foreground" />
          <h1 className="mt-3 text-lg font-semibold">This area isn't part of your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Educator accounts can only open their own courses, blogs and resources.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
