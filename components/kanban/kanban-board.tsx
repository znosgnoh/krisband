"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { SONG_STATUSES } from "@/lib/constants";
import type { Song, SongStatus } from "@/lib/types/song";
import { AddSongModal } from "@/components/kanban/add-song-modal";
import { EditSongModal } from "@/components/kanban/edit-song-modal";
import { YoutubeUrlModal } from "@/components/kanban/youtube-url-modal";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { SongCardOverlay } from "@/components/kanban/song-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSongStore } from "@/store/song-store";

function isSongStatus(value: unknown): value is SongStatus {
  return SONG_STATUSES.includes(value as SongStatus);
}

function resolveDropStatus(
  overId: string | number,
  songs: Song[],
): SongStatus | null {
  if (isSongStatus(overId)) return overId;

  const targetSong = songs.find((song) => song.id === overId);
  return targetSong?.status ?? null;
}

interface PendingDoneMove {
  song: Song;
  overId: string | number;
}

export function KanbanBoard() {
  const hasHydrated = useSongStore((state) => state._hasHydrated);

  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [pendingDoneMove, setPendingDoneMove] = useState<PendingDoneMove | null>(
    null,
  );
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [youtubeFormKey, setYoutubeFormKey] = useState(0);
  const [youtubeDraftUrl, setYoutubeDraftUrl] = useState<string | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  );

  function applyReorderAfterMove(
    songId: string,
    targetStatus: SongStatus,
    overId: string | number,
  ) {
    if (isSongStatus(overId)) return;

    const { getSongsByStatus, reorderSong } = useSongStore.getState();
    const columnSongs = getSongsByStatus(targetStatus);
    const newIndex = columnSongs.findIndex((song) => song.id === overId);
    if (newIndex !== -1) {
      reorderSong(songId, targetStatus, newIndex);
    }
  }

  function completeMoveToStatus(
    song: Song,
    targetStatus: SongStatus,
    overId?: string | number,
    youtubeUrl?: string,
  ) {
    const { moveSong } = useSongStore.getState();

    if (targetStatus === "done") {
      const url = youtubeUrl ?? song.youtubeUrl;
      if (!url) {
        setPendingDoneMove({ song, overId: overId ?? "done" });
        return;
      }

      const result = moveSong(song.id, "done", url);
      if (!result.ok) {
        setYoutubeError(result.error);
        setPendingDoneMove({ song, overId: overId ?? "done" });
        return;
      }
    } else {
      moveSong(song.id, targetStatus);
    }

    if (overId !== undefined) {
      applyReorderAfterMove(song.id, targetStatus, overId);
    }
  }

  const handleMoveTo = useCallback((song: Song, targetStatus: SongStatus) => {
    setYoutubeError(null);

    if (targetStatus === "done") {
      if (song.youtubeUrl) {
        const { moveSong } = useSongStore.getState();
        const result = moveSong(song.id, "done", song.youtubeUrl);
        if (!result.ok) {
          setYoutubeError(result.error);
          setPendingDoneMove({ song, overId: "done" });
        }
      } else {
        setPendingDoneMove({ song, overId: "done" });
      }
      return;
    }

    useSongStore.getState().moveSong(song.id, targetStatus);
  }, []);

  const handleEdit = useCallback((song: Song) => {
    setEditingSong(song);
  }, []);

  const handleDelete = useCallback((song: Song) => {
    setDeletingSong(song);
  }, []);

  function handleDragStart(event: DragStartEvent) {
    setYoutubeError(null);
    const songs = useSongStore.getState().songs;
    const song = songs.find((item) => item.id === event.active.id);
    setActiveSong(song ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveSong(null);

    if (!over) return;

    const { songs, getSongsByStatus, reorderSong } = useSongStore.getState();
    const activeId = String(active.id);
    const activeItem = songs.find((song) => song.id === activeId);
    if (!activeItem) return;

    const targetStatus = resolveDropStatus(over.id, songs);
    if (!targetStatus) return;

    if (activeItem.status !== targetStatus) {
      if (targetStatus === "done" && !activeItem.youtubeUrl) {
        setPendingDoneMove({ song: activeItem, overId: over.id });
        return;
      }

      completeMoveToStatus(activeItem, targetStatus, over.id);
      return;
    }

    if (active.id === over.id || isSongStatus(over.id)) return;

    const columnSongs = getSongsByStatus(activeItem.status);
    const oldIndex = columnSongs.findIndex((song) => song.id === activeId);
    const newIndex = columnSongs.findIndex((song) => song.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      reorderSong(activeId, activeItem.status, newIndex);
    }
  }

  function handleYoutubeSubmit(youtubeUrl: string) {
    if (!pendingDoneMove) return;

    const result = useSongStore
      .getState()
      .moveSong(pendingDoneMove.song.id, "done", youtubeUrl);
    if (!result.ok) {
      setYoutubeError(result.error);
      setYoutubeDraftUrl(youtubeUrl);
      setYoutubeFormKey((key) => key + 1);
      return;
    }

    applyReorderAfterMove(
      pendingDoneMove.song.id,
      "done",
      pendingDoneMove.overId,
    );

    setPendingDoneMove(null);
    setYoutubeError(null);
    setYoutubeDraftUrl(undefined);
  }

  function handleYoutubeClose() {
    setPendingDoneMove(null);
    setYoutubeError(null);
    setYoutubeDraftUrl(undefined);
  }

  function handleDeleteConfirm() {
    if (!deletingSong) return;
    useSongStore.getState().deleteSong(deletingSong.id);
    setDeletingSong(null);
  }

  if (!hasHydrated) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="h-7 w-36 animate-pulse rounded-lg bg-surface-elevated" />
        <div className="kanban-board-area kanban-scroll -mx-4 flex gap-0 overflow-hidden lg:mx-0 lg:min-h-0 lg:gap-4">
          {SONG_STATUSES.map((status) => (
            <div
              key={status}
              className="kanban-column kanban-column-drop min-h-[var(--kanban-mobile-height)] animate-pulse rounded-2xl bg-surface lg:min-h-[10rem] lg:w-auto lg:flex-1 lg:p-0"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <header className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl leading-none tracking-wide text-foreground sm:text-2xl">
              Practice board
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Drag tracks through the set — queue, rehearsal, ready.
            </p>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-board-area">
            <div className="kanban-scroll -mx-4 snap-x snap-mandatory overflow-x-auto pb-2 [scrollbar-width:thin] lg:mx-0 lg:min-h-0 lg:snap-none lg:overflow-visible lg:px-0">
              <div className="kanban-columns-row flex w-max gap-0 lg:grid lg:w-full lg:grid-cols-3 lg:gap-4">
                {SONG_STATUSES.map((status) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMoveTo={handleMoveTo}
                  />
                ))}
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeSong ? <SongCardOverlay song={activeSong} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <button
        type="button"
        className="fixed z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_28px_rgba(220,38,38,0.45)] transition-all duration-200 hover:scale-105 hover:bg-primary-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{
          bottom: "calc(5rem + var(--safe-bottom))",
          right: "max(1rem, var(--safe-right))",
        }}
        aria-label="Add song"
        onClick={() => setAddOpen(true)}
      >
        <Plus className="h-6 w-6" aria-hidden />
      </button>

      <AddSongModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditSongModal
        song={editingSong}
        onClose={() => setEditingSong(null)}
      />
      <ConfirmDialog
        open={deletingSong !== null}
        title="Delete song?"
        message={
          deletingSong
            ? `Remove "${deletingSong.title}" from the board? This cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingSong(null)}
      />
      <YoutubeUrlModal
        song={pendingDoneMove?.song ?? null}
        onClose={handleYoutubeClose}
        onSubmit={handleYoutubeSubmit}
        errorMessage={youtubeError}
        formKey={
          pendingDoneMove
            ? `${pendingDoneMove.song.id}-${youtubeFormKey}`
            : undefined
        }
        initialUrl={youtubeDraftUrl}
      />
    </>
  );
}
