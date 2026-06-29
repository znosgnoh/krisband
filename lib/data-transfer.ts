import type { Song } from "@/lib/types/song";
import { importPayloadSchema } from "@/lib/validations/song";

export function exportSongsToFile(songs: Song[]): void {
  const payload = {
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    songs,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `krisband-songs-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export type ImportSongsResult =
  | { ok: true; songs: Song[] }
  | { ok: false; error: string };

export function parseImportedSongs(json: string): ImportSongsResult {
  try {
    const parsed = JSON.parse(json) as unknown;
    const payload =
      typeof parsed === "object" &&
      parsed !== null &&
      "songs" in parsed
        ? parsed
        : { songs: parsed };

    const result = importPayloadSchema.safeParse(payload);
    if (!result.success) {
      return {
        ok: false,
        error: "Invalid backup file format",
      };
    }

    return { ok: true, songs: result.data.songs };
  } catch {
    return { ok: false, error: "Could not read backup file" };
  }
}
