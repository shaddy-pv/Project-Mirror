import { create } from "zustand";
import type { RangePreset } from "@/lib/sales-api";

type SalesUiState = {
  preset: RangePreset;
  from?: string | undefined;
  to?: string | undefined;
  course: string | null;
  year: string | null;
  category: string | null;
  type: string | null;
  setPreset: (preset: RangePreset) => void;
  setCustom: (from: string, to: string) => void;
  toggleCourse: (course: string) => void;
  toggleYear: (year: string) => void;
  toggleCategory: (category: string) => void;
  toggleType: (type: string) => void;
  clearFilters: () => void;
};

export const useSalesUi = create<SalesUiState>((set) => ({
  preset: "30d",
  course: null,
  year: null,
  category: null,
  type: null,
  setPreset: (preset) => set({ preset }),
  setCustom: (from, to) => set({ preset: "custom", from, to }),
  toggleCourse: (course) => set((s) => ({ course: s.course === course ? null : course })),
  toggleYear: (year) => set((s) => ({ year: s.year === year ? null : year })),
  toggleCategory: (category) => set((s) => ({ category: s.category === category ? null : category })),
  toggleType: (type) => set((s) => ({ type: s.type === type ? null : type })),
  clearFilters: () => set({ course: null, year: null, category: null, type: null }),
}));
