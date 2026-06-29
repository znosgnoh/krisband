"use client";

import { ExternalLink } from "lucide-react";
import {
  getYouTubeEmbedUrl,
  getYouTubeWatchUrl,
} from "@/lib/youtube";

interface YoutubeEmbedProps {
  youtubeUrl: string;
  title: string;
}

export function YoutubeEmbed({ youtubeUrl, title }: YoutubeEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);
  const watchUrl = getYouTubeWatchUrl(youtubeUrl);

  if (!embedUrl) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        <p>Could not embed this video.</p>
        {watchUrl ? (
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-accent hover:underline"
          >
            Open on YouTube
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        ) : (
          <p className="mt-2 text-xs">The saved link may be invalid.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embedUrl}
          title={`YouTube player: ${title}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <a
        href={watchUrl ?? youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        Open on YouTube
        <ExternalLink className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}
