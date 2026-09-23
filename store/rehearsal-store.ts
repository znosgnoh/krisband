import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { REHEARSAL_STORAGE_KEY } from "@/lib/constants";
import { resolvePlan } from "@/lib/practice-schedule";
import type { RehearsalPlan } from "@/lib/types/rehearsal";

interface RehearsalState {
  plan: RehearsalPlan | null;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setPlan: (plan: RehearsalPlan) => void;
  clearPlan: () => void;
  /** Roll weekly plans forward when the stored date has passed. */
  ensureCurrentPlan: (from?: Date) => void;
}

const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(name, value);
    } catch {
      // noop
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(name);
    } catch {
      // noop
    }
  },
};

export const useRehearsalStore = create<RehearsalState>()(
  persist(
    (set, get) => ({
      plan: null,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setPlan: (plan) => set({ plan }),
      clearPlan: () => set({ plan: null }),
      ensureCurrentPlan: (from = new Date()) => {
        const plan = get().plan;
        if (!plan?.weekly) return;
        const resolved = resolvePlan(plan, from);
        if (resolved.scheduledAt !== plan.scheduledAt) {
          set({ plan: resolved });
        }
      },
    }),
    {
      name: REHEARSAL_STORAGE_KEY,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ plan: state.plan }),
      skipHydration: true,
    },
  ),
);
