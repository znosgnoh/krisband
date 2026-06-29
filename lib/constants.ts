import type { SongStatus } from "@/lib/types/song";

export const STORAGE_KEY = "krisband-songs";

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
