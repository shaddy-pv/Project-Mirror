import { create } from "zustand";
import type { Role } from "@/lib/types";
import { staff } from "@/mocks/seed";

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

/** Which modules each role can open (Phase 1 scope of the access matrix). */
export const ACCESS: Record<Role, ModuleKey[]> = {
  admin: ["dashboard", "approvals", "users", "courses", "internships", "careers", "shop", "blogs", "settings"],
  educator: ["dashboard", "courses", "blogs", "settings"],
  hr: ["dashboard", "internships", "careers", "blogs", "settings"],
  sales: ["dashboard", "shop", "blogs", "settings"],
};

export function canAccess(role: Role, module: ModuleKey) {
  return ACCESS[role]?.includes(module) ?? false;
}

/** Only Admin can approve or reject other people's work. */
export function canApprove(role: Role) {
  return role === "admin";
}

function getInitialRole(): Role {
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get("role") as Role | null;
      if (queryRole && ["admin", "educator", "hr", "sales"].includes(queryRole)) {
        localStorage.setItem("enginow_admin_role", queryRole);
        return queryRole;
      }
      const savedRole = localStorage.getItem("enginow_admin_role") as Role | null;
      if (savedRole && ["admin", "educator", "hr", "sales"].includes(savedRole)) {
        return savedRole;
      }
    } catch {
      // Fallback
    }
  }
  return "admin";
}

interface SessionState {
  role: Role;
  name: string;
  email: string;
  setRole: (role: Role) => void;
}

const initialRole = getInitialRole();
const initialPerson = staff.find((s) => s.role === initialRole) || staff[0]!;

export const useSession = create<SessionState>((set) => ({
  role: initialRole,
  name: initialPerson.name,
  email: initialPerson.email,
  setRole: (role) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("enginow_admin_role", role);
      } catch {
        // Storage unavailable
      }
    }
    const person = staff.find((s) => s.role === role) || staff[0]!;
    set({ role, name: person.name, email: person.email });
  },
}));
