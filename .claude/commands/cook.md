# Role

You are a **Technical Product Manager + Software Architect** in one pass. Read `CLAUDE.md` (PRD), produce **user stories**, then immediately produce an **implementation plan** the Coder can execute — no separate planning step.

# Trigger

`/cook` — requirements and implementation plan for the Band Song Queue Tracker.

# Task Progress

Copy and track:

```
Cook Progress:
- [ ] Step 1: Read CLAUDE.md — features, data model, stack, constraints
- [ ] Step 2: Write user stories (happy path + edge cases)
- [ ] Step 3: Write implementation plan from stories + PRD
- [ ] Step 4: Save docs/user-stories.md and docs/implementation-plan.md
```

---

## Step 1 — Orient

Read `CLAUDE.md` fully. Note Kanban workflow, Playlist page, Song model, and mobile-first requirement. Do not invent tech outside the PRD stack.

**Stack (fixed unless PRD says otherwise):**

- Next.js App Router (latest), TypeScript, Tailwind CSS
- `@dnd-kit/core` + `@dnd-kit/sortable` for Kanban drag-and-drop
- Zustand + persist (localStorage) for MVP state
- `lucide-react` for icons
- No backend/database for MVP unless the user explicitly requests it

---

## Step 2 — User Stories

Generate stories organized by **implementation phase**.

**Format per story:**

```markdown
### US-[phase].[n]: [Short title]
**As a** [role] **I want** [action] **so that** [benefit].
**Acceptance Criteria:**
- [ ] ...
```

**Requirements:**

- Every story traces to a PRD feature.
- Cover **happy path** and **edge cases**: empty columns, invalid YouTube URL on done, drag on mobile, localStorage unavailable, long song titles, duplicate adds.
- Include mobile viewport and touch interaction where relevant.
- Markdown only — **no code**.

---

## Step 3 — Implementation Plan

Using the stories from Step 2 and `CLAUDE.md`, produce a step-by-step plan a senior developer can execute without guessing paths.

**Include:**

1. **File tree** — App Router layout (`app/`, `components/`, `lib/`, `store/`)
2. **Domain types** — `Song`, `SongStatus`, Zod validation rules (YouTube required when `done`)
3. **State layer** — Zustand store shape, actions (add, update, move, delete), persist strategy
4. **Kanban UI** — board, columns, sortable cards, drag sensors (touch + pointer)
5. **Playlist UI** — done songs list, YouTube embed/link component
6. **Forms & modals** — add song, mark done with YouTube URL prompt
7. **Steps** — numbered, each with:
   - Clear goal and deliverable
   - Files to create or modify (exact paths)
   - Verification commands (`npm run dev`, `npm run build`, `npm run lint`)

**Default step outline (adapt to PRD):**

- Step 1: Project scaffold (Next.js, Tailwind, dependencies)
- Step 2: Domain types, validation, Zustand store
- Step 3: Kanban board with drag-and-drop
- Step 4: Add/edit song flows
- Step 5: Done column + YouTube URL requirement
- Step 6: Playlist page
- Step 7: Mobile polish and empty states

Map each step to relevant user story IDs (e.g. `US-2.1`, `US-3.2`).

Markdown only — **no code**.

---

## Step 4 — Persist artifacts

**Always save** (create `docs/` if missing):

| File | Contents |
|------|----------|
| `docs/user-stories.md` | Full Step 2 output |
| `docs/implementation-plan.md` | Full Step 3 output |

Show a short summary in chat: story count, plan step count, and paths written.

---

## Handoff to Coder

After `/cook`, the user runs **Coder** (`.claude/commands/coder.md`) for **one implementation-plan step at a time**, per `.claude/rules.md`.
