"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { exportSongsToFile, parseImportedSongs } from "@/lib/data-transfer";
import { useSongStore } from "@/store/song-store";

export function StorageNotice() {
  const songs = useSongStore((state) => state.songs);
  const replaceSongs = useSongStore((state) => state.replaceSongs);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  function handleExport() {
    setImportError(null);
    setImportSuccess(null);
    exportSongsToFile(songs);
  }

  function handleImportClick() {
    setImportError(null);
    setImportSuccess(null);
    fileInputRef.current?.click();
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const text = await file.text();
      const result = parseImportedSongs(text);

      if (!result.ok) {
        setImportError(result.error);
        return;
      }

      replaceSongs(result.songs);
      setImportSuccess(`Imported ${result.songs.length} songs`);
    } catch {
      setImportError("Could not read backup file");
    }
  }

  return (
    <footer className="mt-auto space-y-3 pt-6 pb-2">
      <p className="text-center text-sm text-muted">
        Songs are saved on this device only.
      </p>
      <div className="flex justify-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
        >
          <Download className="h-4 w-4" aria-hidden />
          Export backup
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
        >
          <Upload className="h-4 w-4" aria-hidden />
          Import backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>
      {importError ? (
        <p className="text-center text-sm text-red-400" role="alert">
          {importError}
        </p>
      ) : null}
      {importSuccess ? (
        <p className="text-center text-sm text-accent" role="status">
          {importSuccess}
        </p>
      ) : null}
    </footer>
  );
}
