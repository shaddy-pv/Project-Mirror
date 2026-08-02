import { create } from "zustand";
import type { RangePreset } from "@/lib/sales-api";

type SalesUiState = {
  preset: RangePreset;
  from?: string | undefined;
  to?: string | undefined;
  course: string | null;
  college: string | null;
  setPreset: (preset: RangePreset) => void;
  setCustom: (from: string, to: string) => void;
  toggleCourse: (course: string) => void;
  toggleCollege: (college: string) => void;
  clearFilters: () => void;
};

export const useSalesUi = create<SalesUiState>((set) => ({
  preset: "30d",
  course: null,
  college: null,
  setPreset: (preset) => set({ preset }),
  setCustom: (from, to) => set({ preset: "custom", from, to }),
  toggleCourse: (course) => set((s) => ({ course: s.course === course ? null : course })),
  toggleCollege: (college) => set((s) => ({ college: s.college === college ? null : college })),
  clearFilters: () => set({ course: null, college: null }),
}));
