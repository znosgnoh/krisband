"use client";

import { useState } from "react";
import { youtubeUrlSchema } from "@/lib/validations/song";
import type { Song } from "@/lib/types/song";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface YoutubeUrlFormProps {
  song: Song;
  onClose: () => void;
  onSubmit: (youtubeUrl: string) => void;
  errorMessage?: string | null;
  initialUrl?: string;
}

function YoutubeUrlForm({
  song,
  onClose,
  onSubmit,
  errorMessage,
  initialUrl,
}: YoutubeUrlFormProps) {
  const [youtubeUrl, setYoutubeUrl] = useState(initialUrl ?? song.youtubeUrl ?? "");
  const [error, setError] = useState<string | undefined>();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const result = youtubeUrlSchema.safeParse(youtubeUrl);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid YouTube URL");
      return;
    }

    onSubmit(result.data);
  }

  const displayError = error ?? errorMessage ?? undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        Add a YouTube link for{" "}
        <span className="font-medium text-foreground">{song.title}</span> to mark
        it performance-ready.
      </p>
      <Input
        name="youtubeUrl"
        label="YouTube URL"
        value={youtubeUrl}
        onChange={(event) => {
          setYoutubeUrl(event.target.value);
          setError(undefined);
        }}
        error={displayError}
        placeholder="https://youtube.com/watch?v=..."
        inputMode="url"
        autoComplete="url"
      />
      <p className="text-xs text-muted">
        Accepts youtube.com/watch or youtu.be links.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Save & mark done
        </Button>
      </div>
    </form>
  );
}

interface YoutubeUrlModalProps {
  song: Song | null;
  onClose: () => void;
  onSubmit: (youtubeUrl: string) => void;
  errorMessage?: string | null;
  formKey?: string;
  initialUrl?: string;
}

export function YoutubeUrlModal({
  song,
  onClose,
  onSubmit,
  errorMessage,
  formKey,
  initialUrl,
}: YoutubeUrlModalProps) {
  return (
    <Modal open={song !== null} title="Mark as done" onClose={onClose} position="center">
      {song ? (
        <YoutubeUrlForm
          key={formKey ?? song.id}
          song={song}
          onClose={onClose}
          onSubmit={onSubmit}
          errorMessage={errorMessage}
          initialUrl={initialUrl}
        />
      ) : null}
    </Modal>
  );
}
