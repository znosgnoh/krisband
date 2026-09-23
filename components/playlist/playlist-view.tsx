"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { LayoutGrid, ListMusic } from "lucide-react";
import { PlaylistItem } from "@/components/playlist/playlist-item";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import type { Song } from "@/lib/types/song";
import { useSongStore } from "@/store/song-store";

function sortByOrder(a: Song, b: Song): number {
  return a.order - b.order;
}

function selectDoneSongs(songs: Song[]): Song[] {
  return songs
    .filter(
      (song) =>
        song.status === "done" &&
        song.youtubeUrl &&
        getYouTubeEmbedUrl(song.youtubeUrl),
    )
    .sort(sortByOrder);
}

export function PlaylistView() {
  const hasHydrated = useSongStore((state) => state._hasHydrated);
  const doneSongs = useSongStore(
    useShallow((state) => selectDoneSongs(state.songs)),
  );

  const songCountLabel = useMemo(
    () => `${doneSongs.length} performance-ready`,
    [doneSongs.length],
  );

  if (!hasHydrated) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 py-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-surface-elevated" />
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-border bg-surface p-4"
            >
              <div className="mb-3 h-5 w-48 max-w-full rounded bg-surface-elevated" />
              <div className="aspect-video rounded-lg bg-surface-elevated" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 py-2">
      <header>
        <p className="font-display text-xs tracking-[0.2em] text-accent uppercase">
          Krisband
        </p>
        <h1 className="font-display mt-1 text-2xl leading-none sm:text-3xl">
          Playlist
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {doneSongs.length === 0
            ? "Performance-ready songs with YouTube evidence."
            : `${songCountLabel} — tap a video to rehearse.`}
        </p>
      </header>

      {doneSongs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <ListMusic className="h-8 w-8" aria-hidden />
          </div>
          <div className="max-w-xs space-y-2">
            <h2 className="font-display text-lg">No songs yet</h2>
            <p className="text-sm leading-relaxed text-muted">
              Mark songs as done on the board with a YouTube link to build your
              performance playlist.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/40 hover:bg-surface"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Go to board
          </Link>
        </div>
      ) : (
        <ul className="min-w-0 space-y-5 pb-2">
          {doneSongs.map((song) => (
            <PlaylistItem key={song.id} song={song} />
          ))}
        </ul>
      )}
    </div>
  );
}
