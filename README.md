# Band Song Queue Tracker

Mobile Kanban for band practice — queue songs, track progress, and build a YouTube-backed playlist of performance-ready tracks.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Project structure

```
app/                 # Next.js App Router (board, playlist)
components/
  kanban/            # Board, columns, song cards
  playlist/          # Done songs + YouTube player
  layout/            # Nav, storage notice
  ui/                # Shared UI primitives
lib/
  types/             # Song domain types
  validations/       # Zod schemas
  youtube.ts         # URL parsing helpers
store/
  song-store.ts      # Zustand + persist
docs/
  brainstorm/        # Workshop minutes & briefs
.claude/             # Agent rules & commands
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) — product & architecture spec
- [docs/user-stories.md](./docs/user-stories.md) — acceptance criteria
- [docs/implementation-plan.md](./docs/implementation-plan.md) — build plan

## Environment

No environment variables required for MVP. Songs persist in the browser via `localStorage`.

## Deploy

Deploy to [Vercel](https://vercel.com):

```bash
npm run build
```

1. Push the repo to GitHub
2. Import the project in Vercel
3. Framework preset: **Next.js** (default)
4. Deploy — no env vars needed for MVP

Or use the Vercel CLI:

```bash
npx vercel
```
