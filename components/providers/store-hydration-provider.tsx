"use client";

import { useEffect, useRef } from "react";
import { STORAGE_KEY } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/config";
import {
  fetchSongsFromRemote,
  subscribeToSongChanges,
} from "@/lib/supabase/song-repository";
import { songSync } from "@/lib/song-sync";
import { useRehearsalStore } from "@/store/rehearsal-store";
import { shouldUseLocalPersistence, useSongStore } from "@/store/song-store";

function readLocalSongs(): ReturnType<typeof useSongStore.getState>["songs"] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as { state?: { songs?: unknown } };
    if (!Array.isArray(parsed.state?.songs)) return [];

    return parsed.state.songs as ReturnType<typeof useSongStore.getState>["songs"];
  } catch {
    return [];
  }
}

function clearLocalSongs(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

async function hydrateRehearsalStore(): Promise<void> {
  await useRehearsalStore.persist.rehydrate();
  useRehearsalStore.getState().ensureCurrentPlan();
  useRehearsalStore.getState().setHasHydrated(true);
}

export function StoreHydrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setHasHydrated = useSongStore((state) => state.setHasHydrated);
  const setSongsFromRemote = useSongStore((state) => state.setSongsFromRemote);
  const setSyncError = useSongStore((state) => state.setSyncError);
  const remoteRefreshRef = useRef(0);

  useEffect(() => {
    let unsubscribeRealtime: (() => void) | undefined;
    let cancelled = false;

    async function hydrate() {
      await hydrateRehearsalStore();

      if (!isSupabaseConfigured()) {
        useSongStore.persist.rehydrate();
        if (!cancelled) setHasHydrated(true);
        return;
      }

      try {
        const remoteSongs = await songSync.fetchAll();

        if (cancelled) return;

        if (remoteSongs.length === 0) {
          const localSongs = readLocalSongs();
          if (localSongs.length > 0) {
            setSongsFromRemote(localSongs);
            await songSync.replaceAll(localSongs);
            clearLocalSongs();
          } else {
            setSongsFromRemote([]);
          }
        } else {
          setSongsFromRemote(remoteSongs);
          clearLocalSongs();
        }

        unsubscribeRealtime = subscribeToSongChanges(async () => {
          const requestId = ++remoteRefreshRef.current;

          try {
            const latestSongs = await fetchSongsFromRemote();
            if (cancelled || requestId !== remoteRefreshRef.current) return;
            setSongsFromRemote(latestSongs);
            setSyncError(null);
          } catch (error) {
            if (cancelled || requestId !== remoteRefreshRef.current) return;
            setSyncError(
              error instanceof Error
                ? error.message
                : "Could not refresh from database",
            );
          }
        });
      } catch (error) {
        if (cancelled) return;

        useSongStore.persist.rehydrate();
        setSyncError(
          error instanceof Error
            ? error.message
            : "Could not load songs from database",
        );
      } finally {
        if (!cancelled) setHasHydrated(true);
      }
    }

    void hydrate();

    if (process.env.NODE_ENV === "development") {
      (
        window as Window & { useSongStore?: typeof useSongStore }
      ).useSongStore = useSongStore;
    }

    return () => {
      cancelled = true;
      unsubscribeRealtime?.();
    };
  }, [setHasHydrated, setSongsFromRemote, setSyncError]);

  return <>{children}</>;
}

export { shouldUseLocalPersistence };
