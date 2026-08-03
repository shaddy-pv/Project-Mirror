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
  hr: ["dashboard", "internships", "blogs", "settings"],
  sales: ["dashboard", "shop", "blogs", "settings"],
};

export function canAccess(role: Role, module: ModuleKey) {
  return ACCESS[role].includes(module);
}

/** Only Admin can approve or reject other people's work. */
export function canApprove(role: Role) {
  return role === "admin";
}

interface SessionState {
  role: Role;
  name: string;
  email: string;
  setRole: (role: Role) => void;
}

export const useSession = create<SessionState>((set) => ({
  role: "admin",
  name: staff[0]!.name,
  email: staff[0]!.email,
  setRole: (role) => {
    const person = staff.find((s) => s.role === role)!;
    set({ role, name: person.name, email: person.email });
  },
}));
