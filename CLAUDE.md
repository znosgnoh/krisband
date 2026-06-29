# Band Song Queue Tracker

## Overview

A mobile-first web app for bands to manage their song practice queue on a Kanban board and browse performance-ready songs on a Playlist page with YouTube evidence.

**Problem:** Bands lose track of what to practice, who sings what, and what's actually ready to perform. Coordination happens in chat or verbally, wasting rehearsal time.

**Target users:** Small cover/hobby bands (4–8 members) with weekly practice. Primary user is the practice facilitator who runs the board on their phone.

## Goals & Success Metrics

| Metric | Target | Timeframe |
|--------|--------|-----------|
| **North star:** Songs marked `done` (with valid YouTube) per week | ≥ 1–2 per practice session | First month |
| Time to add first song | < 30 seconds | MVP launch |
| Board used across ≥ 2 practice sessions | Retention signal | 4 weeks |

## Users & Core Journeys

### Personas

- **Practice Facilitator** — runs rehearsal; needs live board on phone, fast adds, clear status.
- **Vocalist / Requester** — adds songs; cares about singer visibility and progress.
- **Audience-facing member** (future) — browses completed playlist when share links exist.

### MVP Journeys

1. Open board → see three columns → know what's on tonight's agenda.
2. Add song (title, singer, addedBy) → lands in `to_practice`.
3. Drag to `practicing` when rehearsal starts.
4. Drag to `done` → enter YouTube URL → saved with validation.
5. Open Playlist → play/browse all completed songs.

## Features

### MVP

| Feature | Acceptance |
|---------|------------|
| Kanban board (3 columns) | `to_practice`, `practicing`, `done`; song count per column |
| Song cards | Title, singer, addedBy visible |
| Drag-and-drop | Touch + pointer; reorder within column |
| Add / edit / delete song | Title, singer, addedBy required on add |
| Done gate | Valid YouTube URL required to enter `done` |
| Playlist page | Only `done` songs; embed or external link |
| Persistence | localStorage via Zustand persist |
| Empty states | Helpful copy when columns or playlist are empty |
| Status fallback | Menu/button to change status without drag (a11y) |

### Future (post-MVP)

- Real-time multi-device sync (Supabase / Firebase)
- Band invite link + optional auth
- Shareable public playlist URL
- PWA / install to home screen
- Fixed member roster for `addedBy`
- JSON export/import backup
- Practice session history

## Tech Stack & Architecture

| Layer | Choice |
|-------|--------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS (mobile-first) |
| State | Zustand + persist (localStorage) |
| Drag & drop | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Icons | `lucide-react` |
| Validation | Zod |
| Deploy | Vercel |

**MVP architecture:** Client-only. No API or database until Phase 2 sync.

```
app/           → routes (board, playlist)
components/    → kanban, playlist, ui
lib/           → types, validations, youtube helpers
store/         → Zustand song store
```

## Data Model

```typescript
type SongStatus = 'to_practice' | 'practicing' | 'done';

interface Song {
  id: string;
  title: string;
  singer: string;
  addedBy: string;       // band member who requested the song (free text in MVP)
  status: SongStatus;
  youtubeUrl?: string;   // required when status is 'done'
}
```

### Business Rules

- Three columns are fixed in MVP — no custom statuses.
- Moving to `done` requires a valid YouTube URL (watch or youtu.be formats).
- When moving out of `done`, keep `youtubeUrl` in storage but exclude from playlist until status returns to `done`.
- `addedBy` is free text in MVP (dropdown member list deferred).

## Non-Functional Requirements

- Mobile-first; min ~44px touch targets.
- Drag perceived latency < 100ms on mid-range phones.
- Validate YouTube URLs before embed — no arbitrary iframe sources.
- Accessible status changes without drag-only interaction.

## Implementation Phases

### Phase 1 — MVP
Scaffold, store, Kanban + DnD, forms, done gate, playlist, mobile polish.

### Phase 2 — Band sync
Hosted data, real-time board, optional auth, export/import.

### Phase 3 — Growth
Public playlist share, PWA, member roster, session analytics.

## Constraints & Assumptions

- Single-band, single-device for MVP (one phone/browser owns the board).
- No authentication in v1.
- YouTube links only for performance evidence — no audio upload.
- Engineering conventions live in `.claude/rules.md`.

## Growth & GTM Notes

- Distribution: facilitator shares URL in band group chat.
- Activation: first song added + one status change in session one.
- Retention: board becomes pre-practice ritual; growing playlist = repertoire proof.

## Open Questions

- Fixed member list vs free-text `addedBy` → **free text for MVP**
- Band name in header → cosmetic; polish step
- Optimal column density for 12+ member bands → validate in user test

## Documentation

- Workshop: [docs/brainstorm/2026-06-29-project-brief.md](./docs/brainstorm/2026-06-29-project-brief.md)
- Agent workflow: `.claude/commands/cook.md` → `.claude/commands/coder.md`
