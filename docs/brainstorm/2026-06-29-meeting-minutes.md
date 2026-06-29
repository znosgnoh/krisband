# Workshop Minutes — Band Song Queue Tracker
**Date:** 2026-06-29  
**Facilitator:** Sam Taylor (Meeting Assistant)  
**Idea under review:** Mobile Kanban app for a band to queue songs, track practice progress, and archive completed songs with YouTube proof.

## Attendees
Elena Vasquez (PO) · Marcus Chen (UX) · Priya Sharma (BA) · Jordan Okonkwo (Growth) · Lars Bergström (Architect) · Alex Rivera (Engineer) · Sam Taylor (MA)

## Agenda
1. Problem & vision
2. Users & requirements
3. Growth & metrics
4. Architecture & feasibility
5. MVP scope
6. Risks & open questions

## Key Decisions
| # | Decision | Owner | Rationale |
|---|----------|-------|-----------|
| D1 | MVP is **single-band, single-device** (localStorage) — no auth or real-time sync | PO + Architect | Fastest path to rehearsal value; sync is Phase 2 |
| D2 | **Next.js App Router** as default framework | Engineer | Aligns with `.claude/rules.md`; SSR for playlist page is nice-to-have, not blocker |
| D3 | **YouTube URL required** when song moves to `done` | BA + PO | "Done" means performance-ready with evidence, not wishful thinking |
| D4 | Kanban columns fixed at three: `to_practice` → `practicing` → `done` | PO | Matches mental model; no custom columns in v1 |
| D5 | North-star metric: **songs completed per practice week** | PO + Growth | Measurable band outcome, not page views |
| D6 | Defer Supabase/Firebase, notifications, and multi-user editing to Phase 2 | Architect | Avoid distributed-state complexity before workflow is validated |

## MVP Scope (v1)
| Feature | User outcome | Priority |
|---------|--------------|----------|
| Kanban board (3 columns) with drag-and-drop | See queue status at a glance during practice | Must |
| Add song (title, singer, addedBy) | Capture requests without verbal chaos | Must |
| Move songs between columns (touch + pointer) | Update progress in real time on phone | Must |
| YouTube URL gate on `done` | Archive proof of performance-ready songs | Must |
| Playlist page (done songs + embed/link) | Rehearse setlist from completed catalog | Must |
| Persist to localStorage | Survive browser refresh between sessions | Must |
| Delete / edit song | Fix mistakes without clearing board | Should |
| Reorder within column | Prioritize tonight's practice order | Should |
| PWA / install to home screen | Faster access at venue | Won't (v1) |
| Multi-device sync | Whole band sees same board | Won't (v1) |
| Auth & member profiles | Accountability across members | Won't (v1) |

## Dissenting Views
- **Jordan (Growth):** Wanted a shareable public playlist link in v1 for social proof. **Deferred** — no backend in MVP; revisit with Phase 2 hosted data.
- **Lars (Architect):** Preferred Supabase from day one to avoid migration pain. **Overruled** by PO — local-first validates workflow in one rehearsal before infra cost.
- **Marcus (UX):** Wanted inline YouTube preview on Kanban cards for `practicing` songs. **Cut from MVP** — keeps cards lightweight; full playback on Playlist page only.

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Single-device storage — data lost if browser cleared | H | Export JSON backup in Phase 1.5; document limitation in UI |
| YouTube embed blocked on mobile / wrong URL format | M | Validate URL client-side; fallback to external link |
| Drag-and-drop awkward on small screens | M | dnd-kit touch sensors + status-change menu as fallback |
| Band abandons app if setup feels heavy | H | Zero signup; first song addable in < 30 seconds |
| Scope creep toward "band management platform" | M | PO enforces three-column MVP; backlog themes only |

## Open Questions
| # | Question | Owner | Due |
|---|----------|-------|-----|
| Q1 | Should `addedBy` be a fixed member list or free text? | PO | Before `/cook` |
| Q2 | Clear `youtubeUrl` when moving back from `done`, or keep it? | BA | Before implementation |
| Q3 | Band name/branding on UI — needed for v1? | UX | Optional polish step |
| Q4 | Target band size (4 vs 12 members) affects column density? | UX | Validate in first user test |

## Action Items
| # | Action | Owner |
|---|--------|-------|
| A1 | Update CLAUDE.md & README.md from brief | Agent |
| A2 | Run `/cook` to generate user stories + implementation plan | User |

## Transcript Summary

The team aligned on a narrow problem: bands lose track of what to practice, who's singing what, and what's actually ready to perform. Elena framed the north star as songs reaching `done` with YouTube evidence per week — not DAU. Marcus stressed phone-first Kanban at rehearsal with thumb-reachable drag handles and a fallback menu for accessibility. Priya formalized the `done` gate rule and empty-column states. Jordan argued distribution is word-of-mouth within the band for now; viral loops wait until hosted playlists exist. Lars and Alex agreed on Next.js + Zustand + dnd-kit for a deployable MVP in ~1–2 weeks of part-time work. MVP scope landed lean; sync and auth explicitly deferred with documented dissent.
