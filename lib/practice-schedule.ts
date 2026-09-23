import type { Song } from "@/lib/types/song";
import type { RehearsalPlan } from "@/lib/types/rehearsal";

export function formatPracticeDateTime(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Roll a weekly rehearsal forward by 7 days until it is in the future. */
export function resolveScheduledAt(
  scheduledAt: string,
  weekly: boolean,
  from: Date = new Date(),
): string {
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return scheduledAt;
  if (!weekly || date.getTime() >= from.getTime()) {
    return date.toISOString();
  }

  const next = new Date(date);
  while (next.getTime() < from.getTime()) {
    next.setDate(next.getDate() + 7);
  }
  return next.toISOString();
}

export function resolvePlan(
  plan: RehearsalPlan,
  from: Date = new Date(),
): RehearsalPlan {
  const scheduledAt = resolveScheduledAt(plan.scheduledAt, plan.weekly, from);
  if (scheduledAt === plan.scheduledAt) return plan;
  return { ...plan, scheduledAt };
}

/** Songs in plan order; drop ids that no longer exist. */
export function songsForPlan(songs: Song[], songIds: string[]): Song[] {
  const byId = new Map(songs.map((song) => [song.id, song]));
  return songIds
    .map((id) => byId.get(id))
    .filter((song): song is Song => song !== undefined);
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
