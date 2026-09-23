"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { COLUMN_LABELS } from "@/lib/constants";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/practice-schedule";
import type { RehearsalPlan } from "@/lib/types/rehearsal";
import type { Song } from "@/lib/types/song";
import { Button } from "@/components/ui/button";
import { useRehearsalStore } from "@/store/rehearsal-store";
import { useSongStore } from "@/store/song-store";

function sortByOrder(a: Song, b: Song): number {
  return a.order - b.order;
}

function selectableSongs(songs: Song[]): Song[] {
  return songs
    .filter(
      (song) => song.status === "to_practice" || song.status === "practicing",
    )
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "practicing" ? -1 : 1;
      }
      return sortByOrder(a, b);
    });
}

function defaultDatetimeLocal(): string {
  const fallback = new Date();
  fallback.setMinutes(0, 0, 0);
  fallback.setHours(fallback.getHours() + 1);
  return toDatetimeLocalValue(fallback);
}

interface FormProps {
  initialPlan: RehearsalPlan | null;
  songs: Song[];
}

function RehearsalPlanFormFields({ initialPlan, songs }: FormProps) {
  const setPlan = useRehearsalStore((state) => state.setPlan);
  const clearPlan = useRehearsalStore((state) => state.clearPlan);
  const plan = useRehearsalStore((state) => state.plan);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => initialPlan?.songIds ?? [],
  );
  const [datetimeLocal, setDatetimeLocal] = useState(() =>
    initialPlan
      ? toDatetimeLocalValue(new Date(initialPlan.scheduledAt))
      : defaultDatetimeLocal(),
  );
  const [weekly, setWeekly] = useState(() => initialPlan?.weekly ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggleSong(id: string) {
    setSaved(false);
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((songId) => songId !== id)
        : [...current, id],
    );
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);

    if (selectedIds.length === 0) {
      setError("Pick at least one song");
      return;
    }

    const scheduled = fromDatetimeLocalValue(datetimeLocal);
    if (!scheduled) {
      setError("Choose a valid date and time");
      return;
    }

    setPlan({
      scheduledAt: scheduled.toISOString(),
      songIds: selectedIds,
      weekly,
    });
    setError(null);
    setSaved(true);
  }

  function handleClear() {
    clearPlan();
    setSelectedIds([]);
    setWeekly(false);
    setDatetimeLocal(defaultDatetimeLocal());
    setSaved(false);
    setError(null);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 py-2">
      <header className="space-y-1">
        <p className="font-display text-xs tracking-[0.2em] text-accent uppercase">
          Krisband
        </p>
        <h1 className="font-display text-3xl leading-none">Next rehearsal</h1>
        <p className="text-sm text-muted">
          Pick songs from the queue, set the date, optionally make it weekly.
        </p>
      </header>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Songs</legend>
        {songs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted">
            No songs in To Practice or Practicing yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {songs.map((song) => {
              const checked = selectedIds.includes(song.id);
              return (
                <li key={song.id}>
                  <label
                    className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200 ${
                      checked
                        ? "border-accent/50 bg-accent/10"
                        : "border-border bg-surface hover:border-accent/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-accent"
                      checked={checked}
                      onChange={() => toggleSong(song.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {song.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {song.singer} · {COLUMN_LABELS[song.status]}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="rehearsal-datetime" className="block text-sm font-medium">
          Date & time
        </label>
        <input
          id="rehearsal-datetime"
          type="datetime-local"
          className="w-full min-h-11 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
          value={datetimeLocal}
          onChange={(event) => {
            setDatetimeLocal(event.target.value);
            setSaved(false);
            setError(null);
          }}
          required
        />
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
        <input
          type="checkbox"
          className="h-4 w-4 accent-accent"
          checked={weekly}
          onChange={(event) => {
            setWeekly(event.target.checked);
            setSaved(false);
          }}
        />
        <span className="text-sm">
          Weekly rehearsal
          <span className="mt-0.5 block text-xs text-muted">
            Auto-rolls to next week after the date passes.
          </span>
        </span>
      </label>

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-success" role="status">
          Rehearsal plan saved.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit">Save plan</Button>
        {plan ? (
          <Button type="button" variant="secondary" onClick={handleClear}>
            Clear plan
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function RehearsalPlanForm() {
  const hasHydrated = useSongStore((state) => state._hasHydrated);
  const rehearsalHydrated = useRehearsalStore((state) => state._hasHydrated);
  const plan = useRehearsalStore((state) => state.plan);
  const songs = useSongStore(
    useShallow((state) => selectableSongs(state.songs)),
  );

  if (!hasHydrated || !rehearsalHydrated) {
    return (
      <div className="space-y-3 py-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-elevated" />
        <div className="h-40 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  return (
    <RehearsalPlanFormFields
      key={plan?.scheduledAt ?? "empty"}
      initialPlan={plan}
      songs={songs}
    />
  );
}
