"use client";

import { isSupabaseConfigured } from "@/lib/config";
import { useSongStore } from "@/store/song-store";

export function StorageNotice() {
  const syncError = useSongStore((state) => state._syncError);
  const usingDatabase = isSupabaseConfigured();

  return (
    <footer className="mt-auto space-y-3 pt-6 pb-2">
      <p className="text-center text-sm text-muted">
        {usingDatabase
          ? "Songs sync across devices for your band board."
          : "Songs are saved on this device only."}
      </p>
      {syncError ? (
        <p className="text-center text-sm text-red-400" role="alert">
          Sync issue: {syncError}
        </p>
      ) : null}
    </footer>
  );
}
