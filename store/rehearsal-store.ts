import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isSupabaseConfigured } from "@/lib/config";
import { REHEARSAL_STORAGE_KEY } from "@/lib/constants";
import { resolvePlan } from "@/lib/practice-schedule";
import { rehearsalSync } from "@/lib/rehearsal-sync";
import type { RehearsalPlan } from "@/lib/types/rehearsal";

interface RehearsalState {
  plan: RehearsalPlan | null;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setPlanFromRemote: (plan: RehearsalPlan | null) => void;
  setPlan: (plan: RehearsalPlan) => void;
  clearPlan: () => void;
  /** Roll weekly plans forward when the stored date has passed. */
  ensureCurrentPlan: (from?: Date) => void;
}

function reportSyncError(error: unknown): void {
  console.error(
    error instanceof Error ? error.message : "Could not sync rehearsal plan",
  );
}

function syncInBackground(task: () => Promise<void>): void {
  void task().catch(reportSyncError);
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

const hybridStorage = {
  getItem: (name: string): string | null => safeLocalStorage.getItem(name),
  setItem: (name: string, value: string): void => {
    if (!isSupabaseConfigured()) {
      safeLocalStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    safeLocalStorage.removeItem(name);
  },
};

export const useRehearsalStore = create<RehearsalState>()(
  persist(
    (set, get) => ({
      plan: null,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setPlanFromRemote: (plan) => set({ plan }),
      setPlan: (plan) => {
        set({ plan });
        syncInBackground(() => rehearsalSync.upsert(plan));
      },
      clearPlan: () => {
        set({ plan: null });
        syncInBackground(() => rehearsalSync.remove());
      },
      ensureCurrentPlan: (from = new Date()) => {
        const plan = get().plan;
        if (!plan?.weekly) return;
        const resolved = resolvePlan(plan, from);
        if (resolved.scheduledAt !== plan.scheduledAt) {
          set({ plan: resolved });
          syncInBackground(() => rehearsalSync.upsert(resolved));
        }
      },
    }),
    {
      name: REHEARSAL_STORAGE_KEY,
      storage: createJSONStorage(() => hybridStorage),
      partialize: (state) => ({ plan: state.plan }),
      skipHydration: true,
    },
  ),
);

export function readLocalRehearsalPlan(): RehearsalPlan | null {
  try {
    const raw = window.localStorage.getItem(REHEARSAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { plan?: RehearsalPlan | null } };
    return parsed.state?.plan ?? null;
  } catch {
    return null;
  }
}

export function clearLocalRehearsalPlan(): void {
  try {
    window.localStorage.removeItem(REHEARSAL_STORAGE_KEY);
  } catch {
    // noop
  }
}
