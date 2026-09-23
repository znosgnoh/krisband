"use client";

import { useEffect, useRef } from "react";
import { STORAGE_KEY } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/config";
import { resolvePlan } from "@/lib/practice-schedule";
import { rehearsalSync } from "@/lib/rehearsal-sync";
import {
  fetchSongsFromRemote,
  subscribeToSongChanges,
} from "@/lib/supabase/song-repository";
import { subscribeToRehearsalPlanChanges } from "@/lib/supabase/rehearsal-repository";
import { songSync } from "@/lib/song-sync";
import {
  clearLocalRehearsalPlan,
  readLocalRehearsalPlan,
  useRehearsalStore,
} from "@/store/rehearsal-store";
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

async function hydrateRehearsalFromRemote(): Promise<void> {
  const setPlanFromRemote = useRehearsalStore.getState().setPlanFromRemote;
  const remotePlan = await rehearsalSync.fetch();

  if (remotePlan) {
    const resolved = resolvePlan(remotePlan);
    setPlanFromRemote(resolved);
    if (resolved.scheduledAt !== remotePlan.scheduledAt) {
      await rehearsalSync.upsert(resolved);
    }
    clearLocalRehearsalPlan();
    return;
  }

  const localPlan = readLocalRehearsalPlan();
  if (localPlan) {
    const resolved = resolvePlan(localPlan);
    setPlanFromRemote(resolved);
    await rehearsalSync.upsert(resolved);
    clearLocalRehearsalPlan();
    return;
  }

  setPlanFromRemote(null);
}

async function hydrateRehearsalLocalOnly(): Promise<void> {
  await useRehearsalStore.persist.rehydrate();
  useRehearsalStore.getState().ensureCurrentPlan();
}

export function StoreHydrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setHasHydrated = useSongStore((state) => state.setHasHydrated);
  const setSongsFromRemote = useSongStore((state) => state.setSongsFromRemote);
  const setSyncError = useSongStore((state) => state.setSyncError);
  const setRehearsalHydrated = useRehearsalStore((state) => state.setHasHydrated);
  const setPlanFromRemote = useRehearsalStore((state) => state.setPlanFromRemote);
  const remoteRefreshRef = useRef(0);
  const rehearsalRefreshRef = useRef(0);

  useEffect(() => {
    let unsubscribeSongs: (() => void) | undefined;
    let unsubscribeRehearsal: (() => void) | undefined;
    let cancelled = false;

    async function hydrate() {
      if (!isSupabaseConfigured()) {
        await hydrateRehearsalLocalOnly();
        useSongStore.persist.rehydrate();
        if (!cancelled) {
          setRehearsalHydrated(true);
          setHasHydrated(true);
        }
        return;
      }

      try {
        await hydrateRehearsalFromRemote();

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

        unsubscribeSongs = subscribeToSongChanges(async () => {
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

        unsubscribeRehearsal = subscribeToRehearsalPlanChanges(async () => {
          const requestId = ++rehearsalRefreshRef.current;

          try {
            const latest = await rehearsalSync.fetch();
            if (cancelled || requestId !== rehearsalRefreshRef.current) return;
            setPlanFromRemote(latest ? resolvePlan(latest) : null);
          } catch (error) {
            console.error(
              error instanceof Error
                ? error.message
                : "Could not refresh rehearsal plan",
            );
          }
        });
      } catch (error) {
        if (cancelled) return;

        await hydrateRehearsalLocalOnly();
        useSongStore.persist.rehydrate();
        setSyncError(
          error instanceof Error
            ? error.message
            : "Could not load songs from database",
        );
      } finally {
        if (!cancelled) {
          setRehearsalHydrated(true);
          setHasHydrated(true);
        }
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
      unsubscribeSongs?.();
      unsubscribeRehearsal?.();
    };
  }, [
    setHasHydrated,
    setSongsFromRemote,
    setSyncError,
    setRehearsalHydrated,
    setPlanFromRemote,
  ]);

  return <>{children}</>;
}

export { shouldUseLocalPersistence };
