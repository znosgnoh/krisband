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

export const songRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  singer: z.string().min(1),
  addedBy: z.string().min(1),
  status: z.enum(["to_practice", "practicing", "done"]),
  youtubeUrl: z.string().optional(),
  order: z.number().int().nonnegative(),
});

export const importPayloadSchema = z.object({
  version: z.literal(1).optional(),
  songs: z.array(songRecordSchema).min(0),
});
