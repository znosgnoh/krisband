import { isSupabaseConfigured } from "@/lib/config";
import {
  deleteSongRemote,
  fetchSongsFromRemote,
  replaceSongsRemote,
  upsertSongRemote,
  upsertSongsRemote,
} from "@/lib/supabase/song-repository";
import type { Song } from "@/lib/types/song";

export const songSync = {
  isEnabled: isSupabaseConfigured,

  async fetchAll(): Promise<Song[]> {
    if (!isSupabaseConfigured()) return [];
    return fetchSongsFromRemote();
  },

  async upsert(song: Song): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await upsertSongRemote(song);
  },

  async upsertMany(songs: Song[]): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await upsertSongsRemote(songs);
  },

  async remove(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await deleteSongRemote(id);
  },

  async replaceAll(songs: Song[]): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await replaceSongsRemote(songs);
  },
};
