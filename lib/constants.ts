import type { SongStatus } from "@/lib/types/song";

export const STORAGE_KEY = "krisband-songs";
export const REHEARSAL_STORAGE_KEY = "krisband-rehearsal";
export const ADMIN_SESSION_KEY = "krisband-admin-ok";

export const SONG_STATUSES: SongStatus[] = [
  "to_practice",
  "practicing",
  "done",
];

export const COLUMN_LABELS: Record<SongStatus, string> = {
  to_practice: "To Practice",
  practicing: "Practicing",
  done: "Done",
};

export const EMPTY_COLUMN_MESSAGES: Record<SongStatus, string> = {
  to_practice: "No songs queued yet — tap Add to request one.",
  practicing: "Nothing in rehearsal — move a song here when you start.",
  done: "No performance-ready songs — mark done with a YouTube link.",
};

/** Status accent tokens for kanban columns (Tailwind color classes). */
export const COLUMN_ACCENT: Record<
  SongStatus,
  { bar: string; badge: string; drop: string; glow: string }
> = {
  to_practice: {
    bar: "bg-accent",
    badge: "bg-accent/15 text-accent",
    drop: "border-accent/50 bg-accent/5",
    glow: "shadow-[0_0_24px_rgba(245,158,11,0.12)]",
  },
  practicing: {
    bar: "bg-primary",
    badge: "bg-primary/15 text-primary",
    drop: "border-primary/50 bg-primary/5",
    glow: "shadow-[0_0_24px_rgba(220,38,38,0.14)]",
  },
  done: {
    bar: "bg-success",
    badge: "bg-success/15 text-success",
    drop: "border-success/50 bg-success/5",
    glow: "shadow-[0_0_24px_rgba(34,197,94,0.12)]",
  },
};
