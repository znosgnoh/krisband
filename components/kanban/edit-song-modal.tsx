"use client";

import { useState } from "react";
import { songFormSchema, type SongFormValues } from "@/lib/validations/song";
import type { Song } from "@/lib/types/song";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSongStore } from "@/store/song-store";

interface EditSongFormProps {
  song: Song;
  onClose: () => void;
}

function EditSongForm({ song, onClose }: EditSongFormProps) {
  const updateSong = useSongStore((state) => state.updateSong);
  const [values, setValues] = useState<SongFormValues>({
    title: song.title,
    singer: song.singer,
    addedBy: song.addedBy,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SongFormValues, string>>>({});

  function handleChange(field: keyof SongFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const result = songFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SongFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !fieldErrors[field as keyof SongFormValues]) {
          fieldErrors[field as keyof SongFormValues] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    updateSong(song.id, result.data);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="title"
        label="Title"
        value={values.title}
        onChange={(event) => handleChange("title", event.target.value)}
        error={errors.title}
        autoComplete="off"
      />
      <Input
        name="singer"
        label="Singer"
        value={values.singer}
        onChange={(event) => handleChange("singer", event.target.value)}
        error={errors.singer}
        autoComplete="off"
      />
      <Input
        name="addedBy"
        label="Added by"
        value={values.addedBy}
        onChange={(event) => handleChange("addedBy", event.target.value)}
        error={errors.addedBy}
        autoComplete="off"
      />
      <Button type="submit" className="w-full">
        Save changes
      </Button>
    </form>
  );
}

interface EditSongModalProps {
  song: Song | null;
  onClose: () => void;
}

export function EditSongModal({ song, onClose }: EditSongModalProps) {
  return (
    <Modal open={song !== null} title="Edit song" onClose={onClose} position="center">
      {song ? <EditSongForm key={song.id} song={song} onClose={onClose} /> : null}
    </Modal>
  );
}
