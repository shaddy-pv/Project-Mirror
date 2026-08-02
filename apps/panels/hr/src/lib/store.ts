import { create } from "zustand";

export type Role = "hr" | "admin" | "educator" | "sales";

interface SessionState {
  role: Role;
  name: string;
  setRole: (role: Role) => void;
}

/** Mock session. The whole route tree is guarded to role: "hr". */
export const useSession = create<SessionState>((set) => ({
  role: "hr",
  name: "Priya Raghavan",
  setRole: (role) => set({ role }),
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
