"use client";

import { useState } from "react";
import { songFormSchema, type SongFormValues } from "@/lib/validations/song";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSongStore } from "@/store/song-store";

interface AddSongModalProps {
  open: boolean;
  onClose: () => void;
}

const emptyValues: SongFormValues = {
  title: "",
  singer: "",
  addedBy: "",
};

export function AddSongModal({ open, onClose }: AddSongModalProps) {
  const addSong = useSongStore((state) => state.addSong);
  const [values, setValues] = useState<SongFormValues>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<keyof SongFormValues, string>>>({});

  function handleClose() {
    setValues(emptyValues);
    setErrors({});
    onClose();
  }

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

    addSong(result.data);
    handleClose();
  }

  return (
    <Modal open={open} title="Add song" onClose={handleClose} position="center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          label="Title"
          value={values.title}
          onChange={(event) => handleChange("title", event.target.value)}
          error={errors.title}
          placeholder="Song name"
          autoComplete="off"
          autoFocus
        />
        <Input
          name="singer"
          label="Singer"
          value={values.singer}
          onChange={(event) => handleChange("singer", event.target.value)}
          error={errors.singer}
          placeholder="Who sings it"
          autoComplete="off"
        />
        <Input
          name="addedBy"
          label="Added by"
          value={values.addedBy}
          onChange={(event) => handleChange("addedBy", event.target.value)}
          error={errors.addedBy}
          placeholder="Your name"
          autoComplete="off"
        />
        <Button type="submit" className="w-full">
          Add to queue
        </Button>
      </form>
    </Modal>
  );
}
