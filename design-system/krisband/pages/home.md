# Home / Practice Board — Overrides

> Overrides `MASTER.md` for the home page (next rehearsal + kanban).

## Mode

Dark stage adaptation of Musical red + warm amber (MASTER light cream is too flat for live-band vibe).

| Role | Hex | Notes |
|------|-----|-------|
| Background | `#100C0A` | Stage black-brown |
| Surface | `#1C1512` | Warm elevated panel |
| Surface elevated | `#2A1F1A` | Cards |
| Foreground | `#F8F1E9` | Warm white |
| Muted | `#B8A99A` | Readable secondary |
| Border | `#3D2E26` | Warm edge |
| Primary | `#DC2626` | Musical red |
| Accent | `#F59E0B` | Stage amber |
| On accent | `#0F0A08` | Dark on amber CTA |

## Typography

Keep MASTER: **Righteous** (display) + **Poppins** (body).

## Layout

1. **Next rehearsal** block first: brand, next datetime, 2–3 practice songs
2. **Kanban** below with status-colored columns (amber queue / red practicing / green done)
3. Mobile: keep column snap; shorten board viewport to leave room for next-rehearsal

## Motion

CSS only, 150–300ms transform/opacity. Honor `prefers-reduced-motion`.
