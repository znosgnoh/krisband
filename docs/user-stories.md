# User Stories — Band Song Queue Tracker

Generated from `CLAUDE.md` PRD. Organized by implementation phase.

---

## Phase 1 — Scaffold & Foundation

### US-1.1: Project bootstrap
**As a** developer **I want** a Next.js App Router project with Tailwind, TypeScript, and core dependencies installed **so that** feature work starts on a consistent stack.

**Acceptance Criteria:**
- [ ] Next.js App Router project runs with `npm run dev`
- [ ] Tailwind CSS configured with mobile-first defaults
- [ ] Dependencies installed: `zustand`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `lucide-react`, `zod`
- [ ] `npm run build` and `npm run lint` pass

---

### US-1.2: App shell and navigation
**As a** practice facilitator **I want** a simple header with navigation between Board and Playlist **so that** I can switch views quickly on my phone.

**Acceptance Criteria:**
- [ ] Root layout renders app title and bottom or top nav (mobile-friendly)
- [ ] Links to `/` (board) and `/playlist`
- [ ] Active route is visually indicated
- [ ] Nav tap targets ≥ 44px

---

## Phase 2 — Domain & State

### US-2.1: Song data model
**As a** developer **I want** typed Song entities matching the PRD **so that** all features share one source of truth.

**Acceptance Criteria:**
- [ ] `Song` and `SongStatus` types in `lib/types/song.ts`
- [ ] Status values: `to_practice`, `practicing`, `done`
- [ ] Optional `youtubeUrl` on Song type

---

### US-2.2: Input validation
**As a** facilitator **I want** forms to reject invalid input **so that** the board stays clean and trustworthy.

**Acceptance Criteria:**
- [ ] Zod schema requires non-empty `title`, `singer`, `addedBy` on add/edit
- [ ] YouTube URL schema accepts `youtube.com/watch`, `youtu.be`, and embed formats
- [ ] Invalid YouTube URL shows clear error message
- [ ] Trimming whitespace on text fields

---

### US-2.3: Persistent song store
**As a** facilitator **I want** songs saved automatically **so that** I don't lose the queue when I refresh or close the browser.

**Acceptance Criteria:**
- [ ] Zustand store with `songs` array and CRUD actions
- [ ] `persist` middleware writes to localStorage key (e.g. `krisband-songs`)
- [ ] Refresh restores previous songs
- [ ] Each song has unique `id` (crypto.randomUUID or nanoid)

---

### US-2.4: localStorage unavailable (edge)
**As a** user on a restricted browser **I want** the app to still work in-session **so that** I can use the board even if persistence fails.

**Acceptance Criteria:**
- [ ] App does not crash if localStorage is blocked
- [ ] In-memory state still works for current session
- [ ] Optional: subtle notice that data won't persist (no modal spam)

---

## Phase 3 — Kanban Board

### US-3.1: View Kanban columns
**As a** facilitator **I want** to see three columns with song counts **so that** I know our practice pipeline at a glance.

**Acceptance Criteria:**
- [ ] Columns labeled: To Practice, Practicing, Done
- [ ] Each column shows count of songs in that status
- [ ] Songs render in correct column by `status`
- [ ] Horizontal scroll on narrow viewports if needed (mobile-first)

---

### US-3.2: Song card display
**As a** vocalist **I want** each card to show title, singer, and who added it **so that** everyone knows what's being worked on.

**Acceptance Criteria:**
- [ ] Card shows `title` prominently
- [ ] Card shows `singer` and `addedBy` as secondary text
- [ ] Long titles truncate with ellipsis, full title on tap/hover if feasible

---

### US-3.3: Drag between columns (happy path)
**As a** facilitator **I want** to drag songs between columns **so that** I can update progress during rehearsal without typing.

**Acceptance Criteria:**
- [ ] Drag from any column to another updates `status`
- [ ] Touch and pointer sensors both work
- [ ] Visual drag overlay follows finger/cursor
- [ ] Drop target highlights when dragging over column

---

### US-3.4: Reorder within column
**As a** facilitator **I want** to reorder songs within a column **so that** I can prioritize tonight's practice order.

**Acceptance Criteria:**
- [ ] Drag within same column changes order
- [ ] Order persists after refresh
- [ ] Store tracks order (e.g. `order` field or array index)

---

### US-3.5: Drag on mobile (edge)
**As a** facilitator on a phone **I want** drag to feel responsive **so that** I'm not fighting the UI during practice.

**Acceptance Criteria:**
- [ ] Touch sensor with sensible activation delay/distance (no accidental drags on scroll)
- [ ] Drag handle or full-card drag documented in UX
- [ ] No layout jank during drag

---

### US-3.6: Empty column states
**As a** new user **I want** helpful text when a column is empty **so that** I know what to do next.

**Acceptance Criteria:**
- [ ] Empty `to_practice`: prompt to add a song
- [ ] Empty `practicing`: encourage moving a song from backlog
- [ ] Empty `done`: explain YouTube requirement for completed songs

---

## Phase 4 — Add, Edit, Delete

### US-4.1: Add song
**As a** requester **I want** to add a song with title, singer, and my name **so that** the band knows what I want to perform.

**Acceptance Criteria:**
- [ ] FAB or prominent "Add song" button on board
- [ ] Modal/sheet form with title, singer, addedBy fields
- [ ] Submit adds song to `to_practice`
- [ ] Form validates required fields; shows inline errors
- [ ] Can complete add in < 30 seconds (minimal fields)

---

### US-4.2: Edit song metadata
**As a** facilitator **I want** to fix typos on a song **so that** the board stays accurate.

**Acceptance Criteria:**
- [ ] Edit action on card (icon or menu)
- [ ] Pre-filled form with current values
- [ ] Save updates title, singer, addedBy without changing status (unless explicitly changed)

---

### US-4.3: Delete song
**As a** facilitator **I want** to remove a song **so that** cancelled requests don't clutter the board.

**Acceptance Criteria:**
- [ ] Delete action on card with confirmation (dialog or undo toast)
- [ ] Song removed from store and localStorage

---

### US-4.4: Duplicate add (edge)
**As a** facilitator **I want** to add the same song title twice if needed **so that** different singers can queue the same track.

**Acceptance Criteria:**
- [ ] No hard block on duplicate titles (different `id`)
- [ ] Cards distinguishable by singer/addedBy

---

## Phase 5 — Done Gate & YouTube

### US-5.1: YouTube URL required for done
**As a** facilitator **I want** to enter a YouTube link when marking a song done **so that** "done" means performance-ready with evidence.

**Acceptance Criteria:**
- [ ] Dragging to `done` opens modal prompting for YouTube URL
- [ ] Cannot save to `done` without valid URL
- [ ] Valid URL saves song with `status: done` and `youtubeUrl`
- [ ] Cancel returns song to previous column/status

---

### US-5.2: Invalid YouTube URL (edge)
**As a** user **I want** clear feedback on bad links **so that** I know how to fix them.

**Acceptance Criteria:**
- [ ] Non-YouTube URLs rejected with error message
- [ ] Malformed URLs rejected
- [ ] Examples shown: `youtube.com/watch?v=...` or `youtu.be/...`

---

### US-5.3: Move out of done
**As a** facilitator **I want** to move a song back to practicing **so that** we can revisit a song that's not gig-ready.

**Acceptance Criteria:**
- [ ] Drag from `done` to `practicing` or `to_practice` works without re-entering URL
- [ ] `youtubeUrl` retained in storage but song excluded from playlist until back to `done`

---

### US-5.4: Status change without drag (a11y)
**As a** user who can't drag easily **I want** a menu to change status **so that** I can still manage the board.

**Acceptance Criteria:**
- [ ] Card menu with "Move to…" options for each status
- [ ] Moving to `done` via menu triggers same YouTube modal
- [ ] Keyboard-accessible menu trigger

---

## Phase 6 — Playlist

### US-6.1: View completed playlist
**As a** band member **I want** a playlist of done songs **so that** I can review our performance-ready repertoire.

**Acceptance Criteria:**
- [ ] `/playlist` lists only songs with `status === 'done'`
- [ ] Ordered consistently (e.g. same as board order or by date added)
- [ ] Shows title, singer per entry

---

### US-6.2: Play YouTube evidence
**As a** band member **I want** to play the YouTube reference **so that** I can hear the target performance.

**Acceptance Criteria:**
- [ ] Each entry has embedded player or "Open on YouTube" link
- [ ] Only validated video IDs used in embed `src`
- [ ] Mobile-friendly embed sizing (responsive 16:9)
- [ ] Fallback link if embed fails

---

### US-6.3: Empty playlist (edge)
**As a** new user **I want** guidance when no songs are done **so that** I know how to populate the playlist.

**Acceptance Criteria:**
- [ ] Empty state with link or CTA back to board
- [ ] Explains done + YouTube requirement

---

## Phase 7 — Polish & NFRs

### US-7.1: Mobile layout polish
**As a** facilitator **I want** the app to feel native on my phone **so that** I use it every practice.

**Acceptance Criteria:**
- [ ] Safe area padding for notched phones
- [ ] Bottom nav reachable with thumb
- [ ] No horizontal overflow bugs on 320px width
- [ ] Readable font sizes in dim rehearsal rooms

---

### US-7.2: Persistence disclaimer (edge)
**As a** user **I want** to know data is stored locally **so that** I'm not surprised if I clear browser data.

**Acceptance Criteria:**
- [ ] Subtle footer or settings note: "Data saved on this device only"
- [ ] No alarmist modal on first visit

---

### US-7.3: Performance
**As a** facilitator **I want** instant interactions **so that** the board keeps up with rehearsal pace.

**Acceptance Criteria:**
- [ ] Drag starts without noticeable lag
- [ ] No full-board re-render on single card move (reasonable React patterns)

---

## Story Summary

| Phase | Stories | IDs |
|-------|---------|-----|
| 1 — Scaffold | 2 | US-1.1, US-1.2 |
| 2 — Domain & State | 4 | US-2.1–US-2.4 |
| 3 — Kanban | 6 | US-3.1–US-3.6 |
| 4 — CRUD | 4 | US-4.1–US-4.4 |
| 5 — Done & YouTube | 4 | US-5.1–US-5.4 |
| 6 — Playlist | 3 | US-6.1–US-6.3 |
| 7 — Polish | 3 | US-7.1–US-7.3 |
| **Total** | **26** | |
