# Project Rules

Engineering standards for the Band Song Queue Tracker.
Domain requirements (features, data model, UX) live in `CLAUDE.md`; this file covers stack and implementation conventions.

---

## 1. Architecture & Framework

- Use **Next.js App Router** (`app/` directory) unless the repo is already initialized with Vite — then stay on Vite + React Router.
- Maximize **Server Components** where possible. Use Client Components (`"use client"`) when required:
  - Drag-and-drop (`@dnd-kit`)
  - Client state (Zustand, forms, modals)
  - Browser APIs (`localStorage`, touch gestures)
- For MVP, persist songs with **Zustand** + `persist` middleware (localStorage). Do not add Supabase/Firebase unless the user explicitly requests multi-user sync.
- Colocate feature code: `app/`, `components/`, `lib/`, `store/`.

---

## 2. Styling & UI

- Use **only Tailwind CSS** for styling. No custom CSS files except `app/globals.css` (theme tokens, base resets).
- **Mobile-first** is mandatory — this app is used on phones during band practice.
- Touch-friendly targets: min ~44px tap areas; generous spacing on cards and drag handles.
- Use semantic HTML and accessible patterns (labels, focus states, `aria-*` on drag regions).
- Icons: `lucide-react` only.
- Extract repeated UI into `components/ui/` when reused 2+ times.

---

## 3. TypeScript

- **100% TypeScript.** Avoid `any`; use `unknown` + narrowing when input is untyped.
- Core domain types live in `lib/types/song.ts` and must match `CLAUDE.md`:

```typescript
type SongStatus = 'to_practice' | 'practicing' | 'done';

interface Song {
  id: string;
  title: string;
  singer: string;
  addedBy: string;
  status: SongStatus;
  youtubeUrl?: string; // required when status is 'done'
}
```

- Validate user input at form boundaries (Zod recommended).

---

## 4. Domain Rules (from PRD)

- **Kanban board** with three columns: `to_practice`, `practicing`, `done`.
- Songs move between columns via drag-and-drop (`@dnd-kit/core`, `@dnd-kit/sortable`).
- **Playlist page** lists only `done` songs with playable YouTube embeds/links.
- When moving a song to `done`, **require** a valid YouTube URL before saving.
- When moving away from `done`, clear or preserve `youtubeUrl` consistently (document choice in code comments only if non-obvious).
- `addedBy` is a free-text band member name for MVP (no auth unless requested).

---

## 5. Drag & Drop

- Use `@dnd-kit/core` and `@dnd-kit/sortable` — not HTML5 DnD alone.
- Support touch and pointer sensors for mobile.
- Provide keyboard-accessible alternatives where dnd-kit allows (or status change via menu/button as fallback).
- Keep drag overlays lightweight; avoid layout thrashing during drag.

---

## 6. YouTube Integration

- Accept common YouTube URL formats (`youtube.com/watch`, `youtu.be`, embed URLs).
- Extract video ID for embed; never load arbitrary iframes from unvalidated URLs.
- Playlist page: embed or link with clear play affordance on mobile.

---

## 7. File & Naming Conventions

```
app/
  page.tsx              # Kanban board (home)
  playlist/page.tsx     # Completed songs playlist
  layout.tsx
  globals.css
components/
  ui/                   # Buttons, inputs, modals
  kanban/               # Board, column, song card
  playlist/             # Playlist list, YouTube player
lib/
  types/song.ts
  validations/song.ts   # Zod schemas
  youtube.ts            # URL parse helpers
store/
  song-store.ts         # Zustand store
```

- Components: `PascalCase.tsx`
- Utilities / store: `kebab-case.ts` or `camelCase.ts` — stay consistent within the project

---

## 8. Testing & Quality

- Run `npm run lint` and `npm run build` after substantive changes.
- Do not leave debug `console.log` in committed code.
- Prefer small, focused diffs. Do not refactor unrelated code in the same change.

---

## 9. Agent Behavior

- Read `CLAUDE.md` for domain requirements before implementing.
- Run **`/cook`** before greenfield work — produces `docs/user-stories.md` and `docs/implementation-plan.md`.
- Implement **one implementation-plan step at a time** unless the user asks for multiple.
- Do not use lazy placeholders like `// TODO: implement` in delivered code — ship working implementations.
- When unsure about domain logic, ask or follow the PRD; do not invent business rules.
