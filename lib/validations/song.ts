import { z } from "zod";
import { isValidYouTubeUrl, normalizeYouTubeUrl } from "@/lib/youtube";

const trimmedString = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`);

export const songFormSchema = z.object({
  title: trimmedString("Title"),
  singer: trimmedString("Singer"),
  addedBy: trimmedString("Added by"),
});

export const youtubeUrlSchema = z
  .string()
  .trim()
  .min(1, "YouTube URL is required")
  .refine(isValidYouTubeUrl, {
    message: "Enter a valid YouTube URL (youtube.com/watch or youtu.be)",
  })
  .transform((url) => normalizeYouTubeUrl(url) ?? url);

export const doneSongSchema = songFormSchema.extend({
  youtubeUrl: youtubeUrlSchema,
});

export type SongFormValues = z.infer<typeof songFormSchema>;
export type DoneSongValues = z.infer<typeof doneSongSchema>;
