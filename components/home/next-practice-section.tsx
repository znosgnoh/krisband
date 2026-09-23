"use client";

import { CalendarClock, Mic, Music2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import {
  formatPracticeDateTime,
  songsForPlan,
} from "@/lib/practice-schedule";
import { useRehearsalStore } from "@/store/rehearsal-store";
import { useSongStore } from "@/store/song-store";

export function NextPracticeSection() {
  const songsHydrated = useSongStore((state) => state._hasHydrated);
  const rehearsalHydrated = useRehearsalStore((state) => state._hasHydrated);
  const plan = useRehearsalStore((state) => state.plan);
  const allSongs = useSongStore(useShallow((state) => state.songs));

  const hasHydrated = songsHydrated && rehearsalHydrated;
  const plannedSongs = plan ? songsForPlan(allSongs, plan.songIds) : [];
  const practiceAt = plan ? new Date(plan.scheduledAt) : null;

  if (!hasHydrated) {
    return (
      <section
        className="stage-panel animate-pulse rounded-2xl p-4"
        aria-hidden
      >
        <div className="h-4 w-24 rounded bg-surface-elevated" />
        <div className="mt-3 h-8 w-48 rounded bg-surface-elevated" />
        <div className="mt-4 space-y-2">
          <div className="h-12 rounded-xl bg-surface-elevated" />
          <div className="h-12 rounded-xl bg-surface-elevated" />
        </div>
      </section>
    );
  }

  return (
    <section
      className="stage-panel relative overflow-hidden rounded-2xl p-4 sm:p-5"
      aria-labelledby="next-practice-heading"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-primary/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-accent/15 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-xs tracking-[0.2em] text-accent uppercase">
              Krisband
            </p>
            <h2
              id="next-practice-heading"
              className="font-display mt-1 text-2xl leading-none text-foreground sm:text-3xl"
            >
              Next rehearsal
            </h2>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Music2 className="h-5 w-5" aria-hidden />
          </span>
        </div>

        {!plan || !practiceAt ? (
          <p className="rounded-xl border border-dashed border-border bg-background/40 px-3 py-4 text-sm text-muted">
            No rehearsal planned yet. Set one up in admin.
          </p>
        ) : (
          <>
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <CalendarClock
                className="h-4 w-4 shrink-0 text-accent"
                aria-hidden
              />
              <time
                dateTime={practiceAt.toISOString()}
                suppressHydrationWarning
              >
                {formatPracticeDateTime(practiceAt)}
              </time>
              {plan.weekly ? (
                <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs text-accent">
                  Weekly
                </span>
              ) : null}
            </p>

            {plannedSongs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-background/40 px-3 py-4 text-sm text-muted">
                Planned songs are missing from the board — update the plan in
                admin.
              </p>
            ) : (
              <ol className="space-y-2">
                {plannedSongs.map((song, index) => (
                  <li
                    key={song.id}
                    className="flex items-center gap-3 rounded-xl border border-border/80 bg-background/50 px-3 py-2.5 transition-colors duration-200 hover:border-accent/40"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 font-display text-sm text-accent"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-tight">
                        {song.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
                        <Mic className="h-3 w-3 shrink-0" aria-hidden />
                        <span className="truncate">{song.singer}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </section>
  );
}
