import { isSupabaseConfigured } from "@/lib/config";
import {
  deleteRehearsalPlanRemote,
  fetchRehearsalPlanRemote,
  upsertRehearsalPlanRemote,
} from "@/lib/supabase/rehearsal-repository";
import type { RehearsalPlan } from "@/lib/types/rehearsal";

export const rehearsalSync = {
  isEnabled: isSupabaseConfigured,

  async fetch(): Promise<RehearsalPlan | null> {
    if (!isSupabaseConfigured()) return null;
    return fetchRehearsalPlanRemote();
  },

  async upsert(plan: RehearsalPlan): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await upsertRehearsalPlanRemote(plan);
  },

  async remove(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await deleteRehearsalPlanRemote();
  },
};
