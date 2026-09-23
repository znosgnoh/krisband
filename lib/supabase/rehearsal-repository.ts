import { BAND_BOARD_ID } from "@/lib/config";
import type { RehearsalPlan } from "@/lib/types/rehearsal";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type PlanRow = Database["public"]["Tables"]["rehearsal_plans"]["Row"];
type PlanInsert = Database["public"]["Tables"]["rehearsal_plans"]["Insert"];

function rowToPlan(row: PlanRow): RehearsalPlan {
  return {
    scheduledAt: row.scheduled_at,
    songIds: row.song_ids ?? [],
    weekly: row.weekly,
  };
}

function planToRow(
  plan: RehearsalPlan,
  boardId: string = BAND_BOARD_ID,
): PlanInsert {
  return {
    board_id: boardId,
    scheduled_at: plan.scheduledAt,
    song_ids: plan.songIds,
    weekly: plan.weekly,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchRehearsalPlanRemote(
  boardId: string = BAND_BOARD_ID,
): Promise<RehearsalPlan | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("rehearsal_plans")
    .select("*")
    .eq("board_id", boardId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToPlan(data) : null;
}

export async function upsertRehearsalPlanRemote(
  plan: RehearsalPlan,
  boardId: string = BAND_BOARD_ID,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("rehearsal_plans")
    .upsert(planToRow(plan, boardId), { onConflict: "board_id" });

  if (error) throw new Error(error.message);
}

export async function deleteRehearsalPlanRemote(
  boardId: string = BAND_BOARD_ID,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("rehearsal_plans")
    .delete()
    .eq("board_id", boardId);

  if (error) throw new Error(error.message);
}

export function subscribeToRehearsalPlanChanges(
  onChange: () => void,
  boardId: string = BAND_BOARD_ID,
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) return () => undefined;

  const channel = supabase
    .channel(`rehearsal_plans:${boardId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rehearsal_plans",
        filter: `board_id=eq.${boardId}`,
      },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
