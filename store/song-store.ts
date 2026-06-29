import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEY } from "@/lib/constants";
import type { Song, SongFormInput, SongStatus, SongUpdateInput } from "@/lib/types/song";
import { isValidYouTubeUrl, normalizeYouTubeUrl } from "@/lib/youtube";

type MoveSongResult =
  | { ok: true }
  | { ok: false; error: string };

interface SongState {
  songs: Song[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
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

export const useSongStore = create<SongState>()(
  persist(
    (set, get) => ({
      songs: [],
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),

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

        set({ songs: [...songs, newSong] });
        return newSong;
      },

      updateSong: (id, data) => {
        set({
          songs: get().songs.map((song) => {
            if (song.id !== id) return song;

            return {
              ...song,
              ...(data.title !== undefined && { title: data.title.trim() }),
              ...(data.singer !== undefined && { singer: data.singer.trim() }),
              ...(data.addedBy !== undefined && {
                addedBy: data.addedBy.trim(),
              }),
            };
          }),
        });
      },

      deleteSong: (id) => {
        set({ songs: get().songs.filter((song) => song.id !== id) });
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

        set({ songs: [...songsWithoutCurrent, updatedSong] });
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

        set({
          songs: songs.map((item) => {
            const order = orderMap.get(item.id);
            if (order === undefined) return item;
            return { ...item, order };
          }),
        });
      },

      getSongsByStatus: (status) => {
        return get()
          .songs.filter((song) => song.status === status)
          .sort(sortByOrder);
      },

      replaceSongs: (songs) => {
        set({ songs });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ songs: state.songs }),
      skipHydration: true,
    },
  ),
);
