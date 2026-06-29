"use client";

import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Mic,
  MoreVertical,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { COLUMN_LABELS, SONG_STATUSES } from "@/lib/constants";
import type { Song, SongStatus } from "@/lib/types/song";

interface SongCardCallbacks {
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  onMoveTo: (song: Song, status: SongStatus) => void;
}

interface SongCardContentProps extends SongCardCallbacks {
  song: Song;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isOverlay?: boolean;
}

interface MenuPosition {
  top: number;
  right: number;
  openUpward: boolean;
}

const ESTIMATED_MENU_HEIGHT = 220;

function getMenuPosition(button: HTMLButtonElement): MenuPosition {
  const rect = button.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < ESTIMATED_MENU_HEIGHT;

  return {
    top: openUpward ? rect.top - 4 : rect.bottom + 4,
    right: window.innerWidth - rect.right,
    openUpward,
  };
}

const SongCardContent = memo(function SongCardContent({
  song,
  dragHandleProps,
  isDragging = false,
  isOverlay = false,
  onEdit,
  onDelete,
  onMoveTo,
}: SongCardContentProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        menuButtonRef.current?.contains(target) ||
        menuPanelRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    }

    function handleResize() {
      if (menuButtonRef.current) {
        setMenuPosition(getMenuPosition(menuButtonRef.current));
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [menuOpen]);

  const moveTargets = SONG_STATUSES.filter((status) => status !== song.status);

  function toggleMenu() {
    if (menuOpen) {
      setMenuOpen(false);
      setMenuPosition(null);
      return;
    }

    if (!menuButtonRef.current) return;
    setMenuPosition(getMenuPosition(menuButtonRef.current));
    setMenuOpen(true);
  }

  const menuPanel =
    menuOpen && menuPosition && typeof document !== "undefined" ? (
      <div
        ref={menuPanelRef}
        className="fixed z-[60] min-w-[10rem] overflow-hidden rounded-lg border border-border bg-surface-elevated py-1 shadow-lg"
        style={{
          top: menuPosition.top,
          right: menuPosition.right,
          transform: menuPosition.openUpward ? "translateY(-100%)" : undefined,
        }}
        role="menu"
      >
        {moveTargets.map((status) => (
          <button
            key={status}
            type="button"
            role="menuitem"
            className="flex w-full px-3 py-2.5 text-left text-sm hover:bg-surface"
            onClick={() => {
              setMenuOpen(false);
              onMoveTo(song, status);
            }}
          >
            Move to {COLUMN_LABELS[status]}
          </button>
        ))}
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-surface"
          onClick={() => {
            setMenuOpen(false);
            onEdit(song);
          }}
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Edit
        </button>
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-surface"
          onClick={() => {
            setMenuOpen(false);
            onDelete(song);
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete
        </button>
      </div>
    ) : null;

  return (
    <article
      className={`rounded-lg border border-border bg-surface-elevated p-3 shadow-sm ${
        isDragging && !isOverlay ? "opacity-40" : ""
      } ${isOverlay ? "shadow-lg ring-2 ring-accent/40" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 flex h-11 w-8 shrink-0 touch-none items-center justify-center rounded-md text-muted hover:bg-background hover:text-foreground"
          aria-label={`Drag ${song.title}`}
          {...dragHandleProps}
        >
          <GripVertical className="h-5 w-5" aria-hidden />
        </button>

        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="truncate text-sm font-semibold leading-tight">
            {song.title}
          </h3>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted">
            <Mic className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{song.singer}</span>
          </p>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted">
            <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{song.addedBy}</span>
          </p>
        </div>

        {!isOverlay ? (
          <div className="relative shrink-0">
            <button
              ref={menuButtonRef}
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-md text-muted hover:bg-background hover:text-foreground"
              aria-label={`Actions for ${song.title}`}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={toggleMenu}
            >
              <MoreVertical className="h-5 w-5" aria-hidden />
            </button>
            {menuPanel ? createPortal(menuPanel, document.body) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
});

interface SongCardProps extends SongCardCallbacks {
  song: Song;
}

export const SongCard = memo(function SongCard({
  song,
  onEdit,
  onDelete,
  onMoveTo,
}: SongCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: song.id,
    data: { type: "song", status: song.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SongCardContent
        song={song}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onEdit={onEdit}
        onDelete={onDelete}
        onMoveTo={onMoveTo}
      />
    </div>
  );
});

export function SongCardOverlay({ song }: { song: Song }) {
  return (
    <SongCardContent
      song={song}
      isOverlay
      dragHandleProps={{}}
      onEdit={() => {}}
      onDelete={() => {}}
      onMoveTo={() => {}}
    />
  );
}
