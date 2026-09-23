import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEY } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/config";
import { songSync } from "@/lib/song-sync";
import type { Song, SongFormInput, SongStatus, SongUpdateInput } from "@/lib/types/song";
import { isValidYouTubeUrl, normalizeYouTubeUrl } from "@/lib/youtube";

type MoveSongResult =
  | { ok: true }
  | { ok: false; error: string };

interface SongState {
  songs: Song[];
  _hasHydrated: boolean;
  _syncError: string | null;
  setHasHydrated: (value: boolean) => void;
  setSyncError: (error: string | null) => void;
  setSongsFromRemote: (songs: Song[]) => void;
  addSong: (data: SongFormInput) => Song;
  updateSong: (id: string, data: SongUpdateInput) => void;
  deleteSong: (id: string) => void;
  moveSong: (
    id: string,
    status: SongStatus,
    youtubeUrl?: string,
  ) => MoveSongResult;
  reorderSong: (id: string, status: SongStatus, newOrder: number) => void;
  getSongsByStatus: (status: SongStatus) => Song[];
  replaceSongs: (songs: Song[]) => void;
}

function sortByOrder(a: Song, b: Song): number {
  return a.order - b.order;
}

function nextOrderInColumn(songs: Song[], status: SongStatus): number {
  const columnSongs = songs.filter((song) => song.status === status);
  if (columnSongs.length === 0) return 0;
  return Math.max(...columnSongs.map((song) => song.order)) + 1;
}

function reportSyncError(error: unknown): void {
  const message =
    error instanceof Error ? error.message : "Could not sync with database";
  useSongStore.getState().setSyncError(message);
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
      // In-memory state still works when persistence is blocked.
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

export const useSongStore = create<SongState>()(
  persist(
    (set, get) => ({
      songs: [],
      _hasHydrated: false,
      _syncError: null,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setSyncError: (error) => set({ _syncError: error }),
      setSongsFromRemote: (songs) => set({ songs, _syncError: null }),

      addSong: (data) => {
        const songs = get().songs;
        const newSong: Song = {
          id: crypto.randomUUID(),
          title: data.title.trim(),
          singer: data.singer.trim(),
          addedBy: data.addedBy.trim(),
          status: "to_practice",
          order: nextOrderInColumn(songs, "to_practice"),
        };

        set({ songs: [...songs, newSong], _syncError: null });
        syncInBackground(() => songSync.upsert(newSong));
        return newSong;
      },

      updateSong: (id, data) => {
        const songs = get().songs;
        let updatedSong: Song | null = null;

        const nextSongs = songs.map((song) => {
          if (song.id !== id) return song;

          updatedSong = {
            ...song,
            ...(data.title !== undefined && { title: data.title.trim() }),
            ...(data.singer !== undefined && { singer: data.singer.trim() }),
            ...(data.addedBy !== undefined && {
              addedBy: data.addedBy.trim(),
            }),
          };
          return updatedSong;
        });

        set({ songs: nextSongs, _syncError: null });

        if (updatedSong) {
          syncInBackground(() => songSync.upsert(updatedSong!));
        }
      },

      deleteSong: (id) => {
        set({
          songs: get().songs.filter((song) => song.id !== id),
          _syncError: null,
        });
        syncInBackground(() => songSync.remove(id));
      },

      moveSong: (id, status, youtubeUrl) => {
        const songs = get().songs;
        const song = songs.find((item) => item.id === id);

        if (!song) {
          return { ok: false, error: "Song not found" };
        }

        if (status === "done") {
          if (!youtubeUrl || !isValidYouTubeUrl(youtubeUrl)) {
            return {
              ok: false,
              error: "A valid YouTube URL is required to mark a song as done",
            };
          }
        }

        const normalizedYoutubeUrl =
          status === "done" && youtubeUrl
            ? (normalizeYouTubeUrl(youtubeUrl) ?? youtubeUrl)
            : song.youtubeUrl;

        const songsWithoutCurrent = songs.filter((item) => item.id !== id);
        const updatedSong: Song = {
          ...song,
          status,
          order: nextOrderInColumn(songsWithoutCurrent, status),
          youtubeUrl: normalizedYoutubeUrl,
        };

        set({ songs: [...songsWithoutCurrent, updatedSong], _syncError: null });
        syncInBackground(() => songSync.upsert(updatedSong));
        return { ok: true };
      },

      reorderSong: (id, status, newOrder) => {
        const songs = get().songs;
        const song = songs.find((item) => item.id === id);

        if (!song || song.status !== status) return;

        const columnSongs = songs
          .filter((item) => item.status === status)
          .sort(sortByOrder);

        const currentIndex = columnSongs.findIndex((item) => item.id === id);
        if (currentIndex === -1) return;

        const reordered = [...columnSongs];
        const [moved] = reordered.splice(currentIndex, 1);
        reordered.splice(newOrder, 0, moved);

        const orderMap = new Map(
          reordered.map((item, index) => [item.id, index] as const),
        );

        const nextSongs = songs.map((item) => {
          const order = orderMap.get(item.id);
          if (order === undefined) return item;
          return { ...item, order };
        });

        set({ songs: nextSongs, _syncError: null });

        const changedSongs = nextSongs.filter((item) => orderMap.has(item.id));
        syncInBackground(() => songSync.upsertMany(changedSongs));
      },

      getSongsByStatus: (status) => {
        return get()
          .songs.filter((song) => song.status === status)
          .sort(sortByOrder);
      },

      replaceSongs: (songs) => {
        set({ songs, _syncError: null });
        syncInBackground(() => songSync.replaceAll(songs));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => hybridStorage),
      partialize: (state) => ({ songs: state.songs }),
      skipHydration: true,
    },
  ),
);

export function shouldUseLocalPersistence(): boolean {
  return !isSupabaseConfigured();
}
