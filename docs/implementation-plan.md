# Implementation Plan — Band Song Queue Tracker

Executable plan for Coder. One step at a time unless user requests otherwise.

**Stories reference:** [user-stories.md](./user-stories.md)

---

## Target File Tree (MVP complete)

```
krisband/
├── app/
│   ├── layout.tsx                 # Root layout, nav, metadata
│   ├── page.tsx                   # Kanban board (client wrapper)
│   ├── playlist/
│   │   └── page.tsx               # Playlist page
│   └── globals.css                # Tailwind + theme tokens
├── components/
│   ├── layout/
│   │   └── app-nav.tsx            # Board / Playlist navigation
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── confirm-dialog.tsx
│   ├── kanban/
│   │   ├── kanban-board.tsx       # DndContext + columns
│   │   ├── kanban-column.tsx      # Droppable column
│   │   ├── song-card.tsx          # Sortable card + menu
│   │   ├── add-song-modal.tsx
│   │   ├── edit-song-modal.tsx
│   │   └── youtube-url-modal.tsx  # Done gate
│   └── playlist/
│       ├── playlist-view.tsx
│       └── youtube-embed.tsx
├── lib/
│   ├── types/
│   │   └── song.ts
│   ├── validations/
│   │   └── song.ts
│   ├── youtube.ts                 # parseYouTubeVideoId, isValidYouTubeUrl
│   └── constants.ts               # COLUMN_LABELS, STORAGE_KEY
├── store/
│   └── song-store.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Domain Types

**File:** `lib/types/song.ts`

```typescript
type SongStatus = 'to_practice' | 'practicing' | 'done';

interface Song {
  id: string;
  title: string;
  singer: string;
  addedBy: string;
  status: SongStatus;
  youtubeUrl?: string;
  order: number;  // sort order within status column
}
```

---

## Zod Validation

**File:** `lib/validations/song.ts`

| Schema | Rules |
|--------|-------|
| `songFormSchema` | `title`, `singer`, `addedBy` — trimmed, min 1 char |
| `youtubeUrlSchema` | Valid YouTube watch/youtu.be/embed URL via regex + parse helper |
| `doneSongSchema` | `songFormSchema` + required `youtubeUrl` passing `youtubeUrlSchema` |

---

## Zustand Store Shape

**File:** `store/song-store.ts`

```typescript
interface SongState {
  songs: Song[];
  addSong: (data: Omit<Song, 'id' | 'status' | 'order'>) => void;
  updateSong: (id: string, data: Partial<Pick<Song, 'title' | 'singer' | 'addedBy'>>) => void;
  deleteSong: (id: string) => void;
  moveSong: (id: string, status: SongStatus, youtubeUrl?: string) => void;
  reorderSong: (id: string, status: SongStatus, newOrder: number) => void;
}
```

**Persist:** `name: 'krisband-songs'`, `partialize` songs only.

**Order logic:** On add, `order = max(order in column) + 1`. On move to new column, append to end. Reorder updates `order` within same `status`.

---

## Kanban UI Architecture

- `KanbanBoard` — wraps `DndContext` with `PointerSensor` + `TouchSensor` (activation constraints).
- `KanbanColumn` — `useDroppable` per status; renders sortable list.
- `SongCard` — `useSortable`; drag handle; overflow menu for edit/delete/move.
- Cross-column drop: `onDragEnd` detects `over` container id = status → call `moveSong` or open YouTube modal if target is `done`.

---

## Playlist UI Architecture

- `PlaylistView` — filters `songs.filter(s => s.status === 'done')`, sorted by `order`.
- `YouTubeEmbed` — `parseYouTubeVideoId(url)` → iframe `https://www.youtube-nocookie.com/embed/{id}` + external link fallback.

---

## Implementation Steps

### Step 1: Project scaffold

**Goal:** Runnable Next.js app with dependencies and scripts.

**Stories:** US-1.1

**Files to create/modify:**
- Initialize via `npx create-next-app@latest` (TypeScript, Tailwind, ESLint, App Router, no src dir)
- Install: `zustand`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `lucide-react`, `zod`
- `app/globals.css` — base theme (dark or light rehearsal-friendly palette)
- `app/layout.tsx` — minimal shell, metadata title "Krisband"
- `app/page.tsx` — placeholder "Board coming soon"
- `package.json` — ensure `lint`, `build`, `dev` scripts

**Verification:**
```bash
npm run dev
npm run lint
npm run build
```

---

### Step 2: App shell and navigation

**Goal:** Mobile nav between Board and Playlist.

**Stories:** US-1.2

**Files:**
- `components/layout/app-nav.tsx` — client component, links `/` and `/playlist`, active state via `usePathname`
- `app/layout.tsx` — include `AppNav`, main content area with padding
- `app/playlist/page.tsx` — placeholder "Playlist coming soon"

**Verification:**
- Navigate between routes on mobile viewport (DevTools)
- Tap targets visually ≥ 44px

---

### Step 3: Domain types, validation, YouTube helpers

**Goal:** Shared types and validation before store/UI.

**Stories:** US-2.1, US-2.2

**Files:**
- `lib/types/song.ts`
- `lib/validations/song.ts`
- `lib/youtube.ts` — `parseYouTubeVideoId`, `normalizeYouTubeUrl`
- `lib/constants.ts` — `SONG_STATUSES`, `COLUMN_LABELS`, `STORAGE_KEY`

**Verification:**
- `npm run build` (types compile)
- Manual sanity: validation rejects empty title and invalid URLs

---

### Step 4: Zustand store with persistence

**Goal:** CRUD + move + reorder with localStorage.

**Stories:** US-2.3, US-2.4

**Files:**
- `store/song-store.ts` — full store + persist middleware
- Optional: `components/providers/store-provider.tsx` if hydration guard needed

**Verification:**
- Add test songs via temporary dev button or browser console
- Refresh page — data persists
- Test in private mode if possible (graceful degrade)

---

### Step 5: Kanban board — static columns and cards

**Goal:** Render three columns and song cards from store (no DnD yet).

**Stories:** US-3.1, US-3.2, US-3.6

**Files:**
- `components/kanban/kanban-board.tsx`
- `components/kanban/kanban-column.tsx`
- `components/kanban/song-card.tsx`
- `app/page.tsx` — render `KanbanBoard`

**Verification:**
- Seed store with 3+ songs across statuses
- Empty columns show correct empty-state copy
- Long titles truncate cleanly

---

### Step 6: Drag-and-drop — reorder and cross-column move

**Goal:** Full dnd-kit integration except done gate modal.

**Stories:** US-3.3, US-3.4, US-3.5

**Files:**
- Update `kanban-board.tsx` — DndContext, sensors, onDragEnd
- Update `kanban-column.tsx` — SortableContext per column
- Update `song-card.tsx` — useSortable, DragOverlay

**Behavior:**
- Move to `practicing` / `to_practice` — direct store update
- Move to `done` — defer to Step 7 (open modal); for now block or stub

**Verification:**
- Drag on desktop and mobile emulation
- Reorder within column persists on refresh
- Cross-column move updates status

---

### Step 7: Add, edit, delete song flows

**Goal:** Complete CRUD UI.

**Stories:** US-4.1, US-4.2, US-4.3, US-4.4

**Files:**
- `components/ui/button.tsx`, `input.tsx`, `modal.tsx`, `confirm-dialog.tsx`
- `components/kanban/add-song-modal.tsx`
- `components/kanban/edit-song-modal.tsx`
- Update `kanban-board.tsx` — FAB "Add song"
- Update `song-card.tsx` — edit/delete actions

**Verification:**
- Add song appears in `to_practice`
- Edit updates metadata
- Delete with confirmation removes card
- Duplicate titles allowed

---

### Step 8: Done gate and YouTube URL modal

**Goal:** Require YouTube when entering `done`; status menu fallback.

**Stories:** US-5.1, US-5.2, US-5.3, US-5.4

**Files:**
- `components/kanban/youtube-url-modal.tsx`
- Update `kanban-board.tsx` — intercept drop/move to `done`
- Update `song-card.tsx` — overflow menu "Move to…"

**Verification:**
- Drag to done → modal → invalid URL blocked → valid URL saves
- Cancel returns song to previous status
- Move done → practicing keeps youtubeUrl in store
- Menu path to done triggers same modal

---

### Step 9: Playlist page

**Goal:** Done songs with YouTube embeds.

**Stories:** US-6.1, US-6.2, US-6.3

**Files:**
- `components/playlist/playlist-view.tsx`
- `components/playlist/youtube-embed.tsx`
- `app/playlist/page.tsx` — render `PlaylistView`

**Verification:**
- Only `done` songs appear
- Embed plays on mobile width
- External link works
- Empty playlist state with CTA to board

---

### Step 10: Mobile polish and NFR pass

**Goal:** Production-ready MVP feel.

**Stories:** US-7.1, US-7.2, US-7.3

**Files:**
- `app/globals.css` — safe-area env(), focus styles
- `app/layout.tsx` — viewport meta, theme color
- `components/layout/app-nav.tsx` — bottom nav polish
- Footer note in layout or nav: local-only storage
- Performance pass on kanban re-renders (memo cards if needed)

**Verification:**
```bash
npm run lint
npm run build
```
- Test 320px width
- Drag latency acceptable
- README quick start updated with real commands

---

## Step → Story Map

| Step | Stories |
|------|---------|
| 1 | US-1.1 |
| 2 | US-1.2 |
| 3 | US-2.1, US-2.2 |
| 4 | US-2.3, US-2.4 |
| 5 | US-3.1, US-3.2, US-3.6 |
| 6 | US-3.3, US-3.4, US-3.5 |
| 7 | US-4.1–US-4.4 |
| 8 | US-5.1–US-5.4 |
| 9 | US-6.1–US-6.3 |
| 10 | US-7.1–US-7.3 |

---

## Environment & Deploy

| Item | MVP value |
|------|-----------|
| Env vars | None required |
| `.env.example` | Not needed for v1 |
| Deploy | Vercel — connect repo, `npm run build` |
| Domain | Optional — default `*.vercel.app` |

---

## Handoff to Coder

Run **Step 1** first. After each step, verify commands pass before proceeding.

```
/coder implement step 1
```

Or: "Implement implementation plan step 1"
