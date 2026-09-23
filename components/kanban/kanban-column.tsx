"use client";

import { memo, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { AudioLines, CircleCheck, ListMusic } from "lucide-react";
import {
  COLUMN_ACCENT,
  COLUMN_LABELS,
  EMPTY_COLUMN_MESSAGES,
} from "@/lib/constants";
import type { Song, SongStatus } from "@/lib/types/song";
import { SongCard } from "@/components/kanban/song-card";
import { useSongStore } from "@/store/song-store";

const COLUMN_ICONS = {
  to_practice: ListMusic,
  practicing: AudioLines,
  done: CircleCheck,
} as const;

function sortByOrder(a: Song, b: Song): number {
  return a.order - b.order;
}

interface KanbanColumnProps {
  status: SongStatus;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  onMoveTo: (song: Song, status: SongStatus) => void;
}

export const KanbanColumn = memo(function KanbanColumn({
  status,
  onEdit,
  onDelete,
  onMoveTo,
}: KanbanColumnProps) {
  const songs = useSongStore(
    useShallow((state) =>
      state.songs.filter((song) => song.status === status).sort(sortByOrder),
    ),
  );

  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  const songIds = useMemo(() => songs.map((song) => song.id), [songs]);
  const accent = COLUMN_ACCENT[status];
  const Icon = COLUMN_ICONS[status];

  return (
    <section
      className="kanban-column flex min-h-full shrink-0 snap-start flex-col lg:w-auto lg:min-h-0 lg:min-w-0 lg:max-w-none lg:shrink lg:px-0"
      aria-label={COLUMN_LABELS[status]}
    >
      <header className="mb-2 flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-5 w-1 shrink-0 rounded-full ${accent.bar}`}
            aria-hidden
          />
          <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <h2 className="truncate font-display text-sm tracking-wide">
            {COLUMN_LABELS[status]}
          </h2>
        </div>
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium tabular-nums ${accent.badge}`}
        >
          {songs.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={`kanban-column-drop flex min-h-[10rem] flex-1 flex-col gap-2 rounded-2xl border p-2 transition-all duration-200 ${
          isOver
            ? `${accent.drop} ${accent.glow}`
            : "border-border/80 bg-surface/80"
        }`}
      >
        <SortableContext items={songIds} strategy={verticalListSortingStrategy}>
          {songs.length === 0 ? (
            <p className="flex flex-1 items-center justify-center px-2 py-6 text-center text-xs leading-relaxed text-muted">
              {EMPTY_COLUMN_MESSAGES[status]}
            </p>
          ) : (
            songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onEdit={onEdit}
                onDelete={onDelete}
                onMoveTo={onMoveTo}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
});
