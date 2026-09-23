"use client";

import { memo } from "react";
import { Mic } from "lucide-react";
import { YoutubeEmbed } from "@/components/playlist/youtube-embed";
import type { Song } from "@/lib/types/song";

interface PlaylistItemProps {
  song: Song;
}

export const PlaylistItem = memo(function PlaylistItem({ song }: PlaylistItemProps) {
  return (
    <li className="min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-surface p-4 transition-colors duration-200 hover:border-accent/35">
      <div className="mb-3 space-y-1">
        <h2 className="text-base font-semibold leading-tight">{song.title}</h2>
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted">
          <Mic className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          <span>{song.singer}</span>
          <span aria-hidden>·</span>
          <span>added by {song.addedBy}</span>
        </p>
      </div>
      {song.youtubeUrl ? (
        <YoutubeEmbed youtubeUrl={song.youtubeUrl} title={song.title} />
      ) : null}
    </li>
  );
});
