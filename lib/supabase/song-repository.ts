import { BAND_BOARD_ID } from "@/lib/config";
import type { Song } from "@/lib/types/song";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type SongRow = Database["public"]["Tables"]["songs"]["Row"];
type SongInsert = Database["public"]["Tables"]["songs"]["Insert"];

function rowToSong(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    singer: row.singer,
    addedBy: row.added_by,
    status: row.status,
    youtubeUrl: row.youtube_url ?? undefined,
    order: row.order_index,
  };
}

function songToRow(song: Song, boardId: string = BAND_BOARD_ID): SongInsert {
  return {
    id: song.id,
    board_id: boardId,
    title: song.title,
    singer: song.singer,
    added_by: song.addedBy,
    status: song.status,
    youtube_url: song.youtubeUrl ?? null,
    order_index: song.order,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchSongsFromRemote(
  boardId: string = BAND_BOARD_ID,
): Promise<Song[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("board_id", boardId)
    .order("status")
    .order("order_index");

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToSong);
}

export async function upsertSongRemote(
  song: Song,
  boardId: string = BAND_BOARD_ID,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("songs")
    .upsert(songToRow(song, boardId), { onConflict: "id" });

  if (error) throw new Error(error.message);
}

export async function upsertSongsRemote(
  songs: Song[],
  boardId: string = BAND_BOARD_ID,
): Promise<void> {
  if (songs.length === 0) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("songs")
    .upsert(
      songs.map((song) => songToRow(song, boardId)),
      { onConflict: "id" },
    );

  if (error) throw new Error(error.message);
}

export async function deleteSongRemote(
  id: string,
  boardId: string = BAND_BOARD_ID,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("songs")
    .delete()
    .eq("board_id", boardId)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function replaceSongsRemote(
  songs: Song[],
  boardId: string = BAND_BOARD_ID,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { data: existing, error: fetchError } = await supabase
    .from("songs")
    .select("id")
    .eq("board_id", boardId);

  if (fetchError) throw new Error(fetchError.message);

  const incomingIds = new Set(songs.map((song) => song.id));
  const idsToDelete =
    existing?.filter((row) => !incomingIds.has(row.id)).map((row) => row.id) ??
    [];

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("songs")
      .delete()
      .in("id", idsToDelete)
      .eq("board_id", boardId);

    if (deleteError) throw new Error(deleteError.message);
  }

  if (songs.length > 0) {
    await upsertSongsRemote(songs, boardId);
  }
}

export function subscribeToSongChanges(
  onChange: () => void,
  boardId: string = BAND_BOARD_ID,
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) return () => undefined;

  const channel = supabase
    .channel(`songs:${boardId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "songs",
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
