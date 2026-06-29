"use client";

import { memo, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import {
  COLUMN_LABELS,
  EMPTY_COLUMN_MESSAGES,
} from "@/lib/constants";
import type { Song, SongStatus } from "@/lib/types/song";
import { SongCard } from "@/components/kanban/song-card";
import { useSongStore } from "@/store/song-store";

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

  return (
    <section
      className="kanban-column flex min-h-full shrink-0 snap-start flex-col lg:w-auto lg:min-h-0 lg:min-w-0 lg:max-w-none lg:shrink lg:px-0"
      aria-label={COLUMN_LABELS[status]}
    >
      <header className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold">{COLUMN_LABELS[status]}</h2>
        <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-muted">
          {songs.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={`kanban-column-drop flex min-h-[10rem] flex-1 flex-col gap-2 rounded-xl border p-2 transition-colors ${
          isOver
            ? "border-accent/60 bg-accent/5"
            : "border-border bg-surface"
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
